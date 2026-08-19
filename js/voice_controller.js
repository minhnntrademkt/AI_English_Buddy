// Voice Controller Module - Điều phối luồng đàm thoại 1-1 hai chiều, Chống Echo từ loa vào micro & Quản lý im lặng thông minh
class VoiceControllerModule {
  constructor(uiCallbacks) {
    this.recorder = new window.AudioRecorderModule();
    this.stt = new window.STTServiceModule();
    this.llm = new window.LLMServiceModule();
    this.tts = new window.TTSServiceModule();
    this.uiCallbacks = uiCallbacks || {};
    this.activePersona = null;
    this.timerInterval = null;
    this.remainingSeconds = 0;
    this.isHandsFreeActive = false; // Trạng thái Micro rảnh tay liên tục
    this.isProcessingCycle = false;
    this.isPausedByVoice = false; // Trạng thái đang tạm dừng chờ bé quay lại
    this.isAISpeaking = false; // Trạng thái AI đang phát loa
    this.lastUserInteractionTime = Date.now(); // Thời điểm cuối cùng có tương tác từ người dùng
    this.hasAskedPresenceCheck = false; // Đã hỏi thăm sự có mặt của bé chưa
    this.recentAISpeeches = []; // Bộ nhớ đệm các câu AI vừa nói để lọc bỏ hoàn toàn Echo từ loa
  }

  // Ghi nhận câu nói của AI vào danh sách lọc Echo
  recordAISpeech(text) {
    if (!text) return;
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    this.recentAISpeeches.push(clean);
    if (this.recentAISpeeches.length > 6) {
      this.recentAISpeeches.shift();
    }
  }

  // Kiểm tra xem câu nhận diện được từ micro có phải là tiếng vọng từ loa của chính AI không
  isEchoOfRecentAI(userText) {
    if (!userText || !this.recentAISpeeches || this.recentAISpeeches.length === 0) return false;
    const cleanUser = userText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanUser || cleanUser.length < 3) return false;

    for (const aiSpeech of this.recentAISpeeches) {
      // Khớp trực tiếp hoặc chứa chuỗi
      if (aiSpeech.includes(cleanUser) || cleanUser.includes(aiSpeech)) {
        return true;
      }
      // Khớp theo độ trùng lặp từ ngữ (> 55% từ trùng lặp)
      const userWords = cleanUser.split(' ').filter(w => w.length > 2);
      if (userWords.length >= 2) {
        const matched = userWords.filter(w => aiSpeech.includes(w));
        if (matched.length / userWords.length >= 0.55) {
          return true;
        }
      }
    }
    return false;
  }

  // Bắt đầu phiên trò chuyện với Persona và Hồ sơ Bé được chọn
  startSession(personaKey, activeChild) {
    this.isPausedByVoice = false;
    this.isHandsFreeActive = false;
    this.isProcessingCycle = false;
    this.isAISpeaking = false;
    this.lastUserInteractionTime = Date.now();
    this.hasAskedPresenceCheck = false;
    this.recentAISpeeches = [];
    this.activeChild = activeChild;
    window.sentimentAnalyzer?.startNewSession(activeChild);

    this.activePersona = this.llm.initSession(personaKey, activeChild);
    const limit = window.APP_CONFIG.SESSION_LIMITS[this.activePersona.tier] || (15 * 60);
    this.remainingSeconds = limit;
    this.pauseTimer();
    
    this.uiCallbacks.onTimerUpdate?.(this.remainingSeconds);
    
    // Mở khóa âm thanh Web Audio / TTS cho iOS
    this.tts.unlockAudio();

    // AI phát câu chào đầu tiên cá nhân hóa theo bé
    const welcomeMsg = this.llm.getInitialGreeting(this.activePersona, activeChild);
    this.uiCallbacks.onAIMessage?.(welcomeMsg);
    this.recordAISpeech(welcomeMsg);
    
    this.isAISpeaking = true;
    this.uiCallbacks.onStateChange?.('speaking');
    this.tts.speak(welcomeMsg, this.activePersona).then(() => {
      this.isAISpeaking = false;
      this.uiCallbacks.onStateChange?.('idle');
    });

    return this.activePersona;
  }

  // Nhận diện ý định tạm dừng / hẹn quay lại qua giọng nói của bé
  detectPauseIntent(text) {
    if (!text || typeof text !== 'string') return false;
    const t = text.toLowerCase();
    const pauseKeywords = [
      'wait', 'wait a minute', 'hold on', 'pause', 'stop for a moment', 'drink water', 'pee', 'bathroom', 
      'toilet', 'washroom', 'eat', 'mom is calling', 'be right back', 'brb', 'see you later', 'bye for now',
      'đợi tí', 'chờ tí', 'chờ một chút', 'tạm dừng', 'dừng lại', 'chờ con', 'đợi con', 'uống nước', 
      'đi vệ sinh', 'mẹ gọi', 'ăn cơm', 'tí quay lại', 'lát quay lại', 'hẹn gặp lại sau', 'đi tè'
    ];
    return pauseKeywords.some(kw => t.includes(kw));
  }

  // Nhận diện ý định quay lại / tiếp tục qua giọng nói của bé
  detectResumeIntent(text) {
    if (!text || typeof text !== 'string') return false;
    const t = text.toLowerCase();
    const resumeKeywords = [
      'i am back', "i'm back", 'im back', 'hello', 'hi', 'continue', 'ready', 'start again', 'here',
      'con quay lại rồi', 'tiếp tục', 'con xong rồi', 'bắt đầu lại', 'nói tiếp', 'toby', 'alex', 'leo'
    ];
    return resumeKeywords.some(kw => t.includes(kw));
  }

  // Bắt đầu / Tiếp tục đếm ngược thời gian
  resumeTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.uiCallbacks.onTimerUpdate?.(this.remainingSeconds);

        if (this.remainingSeconds <= 0) {
          this.endSession(true);
        }
      }
    }, 1000);
  }

  // Tạm dừng đếm ngược thời gian
  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Bật / Tắt chế độ Micro rảnh tay liên tục
  toggleHandsFree() {
    this.tts.unlockAudio();

    if (this.isPausedByVoice) {
      this.resumeSession();
      return;
    }

    this.isHandsFreeActive = !this.isHandsFreeActive;
    
    if (this.isHandsFreeActive) {
      this.lastUserInteractionTime = Date.now();
      this.hasAskedPresenceCheck = false;
      this.resumeTimer();
      this.uiCallbacks.onStateChange?.('handsfree_on');
      this.runHandsFreeCycle();
    } else {
      this.pauseTimer();
      this.stt.stopListening();
      this.recorder.releaseStream();
      this.uiCallbacks.onStateChange?.('idle');
      this.tts.stop();
    }
  }

  // Tạm dừng phiên trò chuyện (giữ chỗ chờ bé quay lại)
  pauseSession(reasonText = '') {
    this.isPausedByVoice = true;
    this.isHandsFreeActive = false;
    this.isProcessingCycle = false;
    this.pauseTimer();
    this.stt.stopListening();
    this.recorder.releaseStream();
    this.tts.stop();
    this.uiCallbacks.onStateChange?.('paused');
    this.uiCallbacks.onSessionPause?.(reasonText);
  }

  // Tiếp tục phiên trò chuyện khi bé quay trở lại
  resumeSession() {
    this.tts.unlockAudio();
    this.isPausedByVoice = false;
    this.isHandsFreeActive = true;
    this.lastUserInteractionTime = Date.now();
    this.hasAskedPresenceCheck = false;
    this.resumeTimer();
    this.uiCallbacks.onStateChange?.('handsfree_on');
    this.uiCallbacks.onSessionResume?.();
    this.runHandsFreeCycle();
  }

  // Luồng đàm thoại liên tục (Speech Input -> AI -> TTS -> Speech Input)
  async runHandsFreeCycle() {
    if (!this.isHandsFreeActive || this.isProcessingCycle || this.isPausedByVoice || this.isAISpeaking) return;

    this.isProcessingCycle = true;
    this.tts.stop(); // Đảm bảo loa không phát âm thanh trước khi mở micro

    this.uiCallbacks.onStateChange?.('listening');
    this.uiCallbacks.onLiveSpeech?.('');

    let userText = '';

    // Nhánh 1: Nếu có DEEPGRAM API KEY -> Dùng MediaRecorder + Deepgram
    if (window.APP_CONFIG.DEEPGRAM_API_KEY) {
      const recStarted = await this.recorder.startRecording();
      if (!recStarted) {
        this.handleMicPermissionError();
        return;
      }
      await new Promise(r => setTimeout(r, 3500));
      const blob = await this.recorder.stopRecording();
      if (!this.isHandsFreeActive || this.isPausedByVoice) {
        this.isProcessingCycle = false;
        return;
      }
      this.uiCallbacks.onStateChange?.('processing');
      userText = await this.stt.transcribe(blob);
    }
    // Nhánh 2: Native Web Speech Recognition (iOS Safari & Chrome Native)
    else {
      const listenStartTime = Date.now();
      userText = await this.stt.startListening({
        onStart: () => {
          this.uiCallbacks.onStateChange?.('listening');
        },
        onSpeechStart: () => {
          this.uiCallbacks.onStateChange?.('listening');
        },
        onLiveSpeech: (liveText) => {
          // Bỏ qua hiển thị live nếu nội dung trùng với câu AI vừa nói
          if (!this.isEchoOfRecentAI(liveText)) {
            this.uiCallbacks.onLiveSpeech?.(liveText);
          }
        },
        onError: (err) => {
          console.log('Speech error:', err);
        }
      });

      // Nếu cuộc thu âm kết thúc quá nhanh (< 1.2s) và không có chữ, delay nhẹ để chống loop bão hòa
      const elapsed = Date.now() - listenStartTime;
      if (elapsed < 1200 && (!userText || userText.trim() === '')) {
        await new Promise(r => setTimeout(r, 800));
      }
    }

    if (!this.isHandsFreeActive || this.isPausedByVoice) {
      this.isProcessingCycle = false;
      return;
    }

    // Xử lý khi bị từ chối cấp quyền Micro trên thiết bị
    if (userText === '__MIC_NOT_ALLOWED__') {
      this.handleMicPermissionError();
      return;
    }

    // Trường hợp 1: Bé CÓ phát biểu (Chấp nhận 100% mọi từ ngữ bé nói hoặc nhắc lại theo gợi ý của AI)
    if (userText && userText.trim() !== '') {
      this.lastUserInteractionTime = Date.now();
      this.hasAskedPresenceCheck = false;
      await this.processUserText(userText);
    } 
    // Trường hợp 2: IM LẶNG (Không có tiếng nói của bé)
    else {
      const silentSeconds = Math.floor((Date.now() - this.lastUserInteractionTime) / 1000);

      // Sau 25 GIÂY THỰC TẾ im lặng liên tiếp: AI hỏi thăm 1 lần duy nhất
      if (silentSeconds >= 25 && silentSeconds < 50 && !this.hasAskedPresenceCheck) {
        this.hasAskedPresenceCheck = true;
        let checkMsg = `Are you still there, buddy? Take your time! Let me know whenever you're ready!`;
        if (this.activePersona?.id === 'toby') {
          checkMsg = `Bé ơi, bé còn ở đó không nè? Toby vẫn đang đợi bé đó nha!`;
        }
        
        this.recordAISpeech(checkMsg);
        this.uiCallbacks.onAIMessage?.(checkMsg);
        this.uiCallbacks.onStateChange?.('speaking');
        this.isAISpeaking = true;
        await this.tts.speak(checkMsg, this.activePersona);
        this.isAISpeaking = false;
        await new Promise(r => setTimeout(r, 800)); // Nghỉ 800ms sau khi nói
      }
      // Sau 50 GIÂY THỰC TẾ im lặng liên tiếp: AI tự động tạm dừng để bảo toàn thời gian cho bé
      else if (silentSeconds >= 50) {
        const autoPauseMsg = `Looks like you stepped away! I will pause our talk now to save your time. Just speak or tap the mic when you come back! 💤`;
        this.recordAISpeech(autoPauseMsg);
        this.uiCallbacks.onAIMessage?.(autoPauseMsg);
        this.uiCallbacks.onStateChange?.('speaking');
        this.isAISpeaking = true;
        await this.tts.speak(autoPauseMsg, this.activePersona);
        this.isAISpeaking = false;
        this.isProcessingCycle = false;
        this.pauseSession('AI đã tự động tạm dừng đếm giờ vì không nghe thấy âm thanh. Bé chỉ cần bấm Micro khi quay lại nhé!');
        return;
      }
    }

    this.isProcessingCycle = false;

    // Nếu chế độ Rảnh tay vẫn đang tiếp tục, khởi chạy chu kỳ tiếp theo sau 500ms
    if (this.isHandsFreeActive && !this.isPausedByVoice) {
      setTimeout(() => this.runHandsFreeCycle(), 500);
    } else if (!this.isPausedByVoice) {
      this.uiCallbacks.onStateChange?.('idle');
    }
  }

  // Kiểm tra xem bé có đang chủ động cắt ngang lời AI không (Voice Barge-in)
  detectInterruption(text) {
    if (!text || typeof text !== 'string') return false;
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean || clean.length < 2) return false;

    // 1. Các từ khóa ngắt lời trực tiếp (Stop, Wait, Listen, Dừng lại...)
    const interruptKeywords = [
      'stop', 'wait', 'hold on', 'pause', 'listen', 'no', 'hey', 'toby', 'alex', 'leo',
      'dừng lại', 'chờ tí', 'đợi đã', 'thôi', 'khoan', 'nghe này', 'không phải'
    ];
    if (interruptKeywords.some(kw => clean.includes(kw))) {
      return true;
    }

    // 2. Bé nói một câu mới khác với nội dung loa AI đang phát
    if (!this.isEchoOfRecentAI(clean)) {
      const words = clean.split(' ').filter(w => w.length > 2);
      if (words.length >= 2) {
        return true;
      }
    }

    return false;
  }

  // Cắt ngang lời AI ngay lập tức (dùng khi bé chạm vào Mascot hoặc nút Mic)
  interruptAI() {
    if (this.isAISpeaking) {
      this.tts.stop();
      this.isAISpeaking = false;
      this.currentAISpeech = '';
      this.isProcessingCycle = false;
      this.uiCallbacks.onStateChange?.('listening');
      this.uiCallbacks.onLiveSpeech?.('');
      const subState = document.getElementById('mascotSubStateText');
      if (subState) subState.innerText = '🎧 Đã ngắt lời bạn AI! Bé hãy nói câu của mình nhé!';
      
      if (!this.isHandsFreeActive) {
        this.toggleHandsFree();
      }
    }
  }

  // Xử lý một câu nói/nhập từ người dùng (dùng cho cả Mic và Gõ phím)
  async processUserText(userText) {
    if (!userText || userText.trim() === '') return;
    const cleanText = userText.trim();

    this.lastUserInteractionTime = Date.now();
    this.hasAskedPresenceCheck = false;
    this.uiCallbacks.onUserMessage?.(cleanText);

    // 1. Quét cảnh báo nhạy cảm bí mật
    if (window.sentimentAnalyzer) {
      window.sentimentAnalyzer.detectSafetyTrigger(cleanText);
    }

    // 2. Kiểm tra nếu bé yêu cầu tạm dừng / hẹn quay lại
    if (this.detectPauseIntent(cleanText)) {
      const pauseReassurance = `Sure! Take your time! I'll take a quick nap and wait for you right here. See you in a bit! 💤`;
      this.recordAISpeech(pauseReassurance);
      this.uiCallbacks.onAIMessage?.(pauseReassurance);
      this.uiCallbacks.onStateChange?.('speaking');
      this.isAISpeaking = true;
      await this.tts.speak(pauseReassurance, this.activePersona);
      this.isAISpeaking = false;
      this.isProcessingCycle = false;
      this.pauseSession('Bé đã hẹn tạm dừng. AI đang ngủ tạm nghỉ chờ bé quay lại!');
      return;
    }

    // 3. AI suy nghĩ và phản hồi
    this.uiCallbacks.onStateChange?.('processing');
    const aiReply = await this.llm.generateReply(cleanText);
    
    // Ghi nhận câu nói của AI để chống Echo
    this.recordAISpeech(aiReply);
    this.currentAISpeech = aiReply;
    this.uiCallbacks.onAIMessage?.(aiReply);
    
    // Kích hoạt trạng thái AI đang nói
    this.isAISpeaking = true;
    this.uiCallbacks.onStateChange?.('speaking');

    // Chạy song song phát âm thanh và giám sát ngắt lời (Barge-in)
    const speechPromise = this.tts.speak(aiReply, this.activePersona);

    // Nếu đang ở chế độ Rảnh tay, mở kênh nhận diện ngắt lời
    if (this.isHandsFreeActive) {
      this.stt.startListening({
        onLiveSpeech: (liveText) => {
          if (!this.isAISpeaking) return;
          if (this.detectInterruption(liveText)) {
            console.log('Phát hiện bé cắt ngang lời:', liveText);
            this.tts.stop();
            this.isAISpeaking = false;
            this.uiCallbacks.onLiveSpeech?.(liveText);
          }
        },
        onResult: (resultText) => {
          if (this.isAISpeaking && this.detectInterruption(resultText)) {
            this.tts.stop();
            this.isAISpeaking = false;
          }
        }
      });
    }

    await speechPromise;
    this.isAISpeaking = false;
    this.currentAISpeech = '';

    // Đệm nghỉ an toàn 600ms để âm thanh dứt hẳn
    await new Promise(r => setTimeout(r, 600));
  }

  // Thông báo hướng dẫn cấp quyền Micro thân thiện cho iOS và Android
  handleMicPermissionError() {
    this.isHandsFreeActive = false;
    this.isProcessingCycle = false;
    this.pauseTimer();
    this.uiCallbacks.onStateChange?.('idle');

    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isInApp = /FBAN|FBAV|Instagram|Line|Twitter|MicroMessenger|Zalo|Snapchat/i.test(ua);

    if (isIOS && isInApp) {
      alert('📱 LƯU Ý TRÊN IPHONE/IPAD:\n\nỨng dụng Zalo / Facebook đang chặn quyền truy cập Micro của trang web.\n\n👉 Vui lòng bấm vào dấu 3 chấm góc phải (hoặc nút Chia sẻ) và chọn "Mở bằng Safari" để nói chuyện với bạn AI nhé!');
    } else if (isIOS) {
      alert('🎙️ CHƯA CẤP QUYỀN MICRO:\n\nĐể trò chuyện với bạn AI, bạn vui lòng:\n1. Vào "Cài đặt" (Settings) trên iPhone\n2. Chọn "Safari"\n3. Chọn "Micro" (Microphone) -> Chọn "Cho phép" (Allow)\n4. Tải lại trang web và bắt đầu học nhé!');
    } else {
      alert('🎙️ Vui lòng bấm "Cho phép" (Allow) khi trình duyệt hỏi quyền sử dụng Microphone để trò chuyện cùng bạn AI!');
    }
  }

  // Thoát hoặc dừng hoàn toàn phiên trò chuyện
  stopSession() {
    this.isHandsFreeActive = false;
    this.isPausedByVoice = false;
    this.isProcessingCycle = false;
    this.isAISpeaking = false;
    this.pauseTimer();
    this.stt.stopListening();
    this.recorder.releaseStream();
    this.tts.stop();
  }

  // Kết thúc phiên trò chuyện
  endSession(isTimeout = false) {
    this.stopSession();
    
    if (isTimeout) {
      const goodbye = `Time is up for today! You did amazing. Let's talk tomorrow! Bye bye!`;
      this.uiCallbacks.onAIMessage?.(goodbye);
      this.tts.speak(goodbye, this.activePersona);
    }
    
    // Ghi nhận cảnh báo an toàn hậu kỳ phiên trò chuyện
    window.sentimentAnalyzer?.finalizeSessionAlerts();
    this.uiCallbacks.onSessionEnd?.(this.llm.chatHistory);
  }
}

window.VoiceControllerModule = VoiceControllerModule;
