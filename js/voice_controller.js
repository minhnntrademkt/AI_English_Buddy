// Voice Controller Module - Điều phối luồng đàm thoại 1-1 hai chiều
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
  }

  // Bắt đầu phiên trò chuyện với Persona được chọn
  startSession(personaKey) {
    this.activePersona = this.llm.initSession(personaKey);
    const limit = window.APP_CONFIG.SESSION_LIMITS[this.activePersona.tier] || (15 * 60);
    this.remainingSeconds = limit;
    this.startTimer();
    
    // AI phát câu chào đầu tiên
    const welcomeMsg = `Hi! I'm ${this.activePersona.name}. What is your name?`;
    this.uiCallbacks.onAIMessage?.(welcomeMsg);
    this.tts.speak(welcomeMsg, this.activePersona);
    return this.activePersona;
  }

  // Đếm ngược thời gian phiên trò chuyện
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.uiCallbacks.onTimerUpdate?.(this.remainingSeconds);

      if (this.remainingSeconds <= 0) {
        this.endSession(true); // Hết giờ tự động
      }
    }, 1000);
  }

  // Bật / Tắt chế độ Micro rảnh tay liên tục
  toggleHandsFree() {
    this.isHandsFreeActive = !this.isHandsFreeActive;
    
    if (this.isHandsFreeActive) {
      this.uiCallbacks.onStateChange?.('handsfree_on');
      this.runHandsFreeCycle();
    } else {
      this.uiCallbacks.onStateChange?.('idle');
      this.tts.stop();
    }
  }

  // Luồng tự động thu âm -> xử lý -> AI phát tiếng -> tự động thu âm tiếp
  async runHandsFreeCycle() {
    if (!this.isHandsFreeActive || this.isProcessingCycle) return;

    this.isProcessingCycle = true;
    this.uiCallbacks.onStateChange?.('listening');

    // Khởi tạo thu âm
    await this.recorder.startRecording();

    // Thu âm trong 3.5 giây
    setTimeout(async () => {
      const blob = await this.recorder.stopRecording();
      if (!this.isHandsFreeActive) {
        this.isProcessingCycle = false;
        return;
      }

      this.uiCallbacks.onStateChange?.('processing');
      const userText = await this.stt.transcribe(blob);

      if (userText && userText.trim() !== '') {
        this.uiCallbacks.onUserMessage?.(userText);

        // AI suy nghĩ câu trả lời
        const aiReply = await this.llm.generateReply(userText);
        this.uiCallbacks.onAIMessage?.(aiReply);

        // AI phát câu trả lời ra loa
        this.uiCallbacks.onStateChange?.('speaking');
        await this.tts.speak(aiReply, this.activePersona);
      }

      this.isProcessingCycle = false;

      // Nếu chế độ Rảnh tay vẫn đang bật, tự động khởi chạy chu kỳ tiếp theo sau 600ms!
      if (this.isHandsFreeActive) {
        setTimeout(() => this.runHandsFreeCycle(), 600);
      } else {
        this.uiCallbacks.onStateChange?.('idle');
      }
    }, 3500);
  }

  // Kết thúc phiên trò chuyện
  endSession(isTimeout = false) {
    this.isHandsFreeActive = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.tts.stop();
    
    if (isTimeout) {
      const goodbye = `Time is up for today! You did amazing. Let's talk tomorrow! Bye bye!`;
      this.uiCallbacks.onAIMessage?.(goodbye);
      this.tts.speak(goodbye, this.activePersona);
    }
    
    this.uiCallbacks.onSessionEnd?.(this.llm.chatHistory);
  }
}

window.VoiceControllerModule = VoiceControllerModule;
