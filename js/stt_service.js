// STT Service Module - Chuyển giọng nói bé thành văn bản (Speech-to-Text)
class STTServiceModule {
  constructor() {
    this.recognition = null;
    this.initWebSpeechFallback();
  }

  // Khởi tạo Web Speech Recognition (Free, native browser fallback)
  initWebSpeechFallback() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US'; // Mặc định bé nói tiếng Anh
    }
  }

  // Chuyển âm thanh thành chữ
  async transcribe(audioBlob) {
    const apiKey = window.APP_CONFIG.DEEPGRAM_API_KEY;

    // Nếu có API Key Deepgram, gọi Deepgram API Nova-2
    if (apiKey && audioBlob) {
      try {
        const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': audioBlob.type || 'audio/webm'
          },
          body: audioBlob
        });
        const data = await response.json();
        const transcript = data.results?.channels[0]?.alternatives[0]?.transcript || '';
        if (transcript) return transcript;
      } catch (err) {
        console.warn('Deepgram API call failed, switching to browser STT:', err);
      }
    }

    // Fallback: Sử dụng Web Speech API trực tiếp từ trình duyệt
    return new Promise((resolve) => {
      if (!this.recognition) {
        resolve('Hello Toby!'); // Fallback test nếu browser không hỗ trợ
        return;
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (err) => {
        console.error('Web Speech Recognition error:', err);
        resolve('');
      };

      try {
        this.recognition.start();
      } catch (e) {
        resolve('');
      }
    });
  }
}

window.STTServiceModule = STTServiceModule;
