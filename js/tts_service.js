// TTS Service Module - Chuyển văn bản thành giọng nói phát ra loa (Text-to-Speech)
class TTSServiceModule {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isUnlocked = false;
  }

  // Mở khóa âm thanh Web Audio / SpeechSynthesis cho iOS Safari
  unlockAudio() {
    if (this.isUnlocked || !this.synth) return;
    try {
      const silentUtterance = new SpeechSynthesisUtterance(' ');
      silentUtterance.volume = 0.01;
      this.synth.speak(silentUtterance);
      this.isUnlocked = true;
    } catch (e) {
      console.log('Audio unlock skipped:', e);
    }
  }

  // Lọc sạch toàn bộ Emoji, biểu tượng và ký tự markdown để giọng đọc không bị đọc tên icon
  cleanTextForSpeech(text) {
    if (!text) return '';
    return text
      // Loại bỏ toàn bộ dải Emoji và Unicode pictographs
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu, '')
      // Loại bỏ ký tự markdown (*, _, `, #, ~)
      .replace(/[\*\_\#\`\~]/g, '')
      // Chuẩn hóa khoảng trắng
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Phát câu nói ra loa
  async speak(rawText, persona) {
    const apiKey = window.APP_CONFIG.CARTESIA_API_KEY;
    const text = this.cleanTextForSpeech(rawText);
    if (!text) return;

    // Dừng âm thanh đang phát trước đó
    if (this.synth) this.synth.cancel();

    // Nếu có Cartesia API Key, gọi Cartesia Sonic API
    if (apiKey) {
      try {
        const response = await fetch('https://api.cartesia.ai/tts/bytes', {
          method: 'POST',
          headers: {
            'Cartesia-Version': '2024-06-10',
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model_id: 'sonic-english',
            transcript: text,
            voice: { mode: 'id', id: '69471608-210a-400f-ac92-36b023d05d8f' },
            output_format: { container: 'wav', encoding: 'pcm_f32le', sample_rate: 24000 }
          })
        });
        const audioBuffer = await response.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await new Promise((res) => {
          audio.onended = res;
          audio.onerror = res;
          audio.play().catch(res);
        });
        return;
      } catch (err) {
        console.warn('Cartesia TTS failed, fallback to Web Speech Synthesis:', err);
      }
    }

    // Fallback: Sử dụng Web Speech Synthesis tích hợp trong hệ thống
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = persona?.speed || 0.85;
      utterance.pitch = 1.15; // Tăng pitch nhẹ để tạo cảm giác giọng trẻ em thân thiện
      utterance.lang = persona?.voiceLang || 'en-US';

      // Thử tìm giọng bản xứ Anh/Mỹ tự nhiên
      const voices = this.synth.getVoices();
      const englishVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')));
      if (englishVoice) utterance.voice = englishVoice;

      let isDone = false;
      const done = () => {
        if (!isDone) {
          isDone = true;
          resolve();
        }
      };

      utterance.onend = done;
      utterance.onerror = done;

      // Timeout phòng ngừa kẹt trên một số trình duyệt
      const estimatedMs = Math.max(2500, (text.split(' ').length * 600) + 1500);
      setTimeout(done, estimatedMs);

      this.synth.speak(utterance);
    });
  }

  // Dừng phát âm thanh
  stop() {
    if (this.synth) this.synth.cancel();
  }
}

window.TTSServiceModule = TTSServiceModule;
