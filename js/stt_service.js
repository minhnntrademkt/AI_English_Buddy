// STT Service Module - Chuyển giọng nói thành văn bản (Speech-to-Text tương thích tối đa Android Chrome & iOS Safari)
class STTServiceModule {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLanguage = 'en-US';
  }

  isSpeechRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Bắt đầu lắng nghe giọng nói với Live Preview tức thì và độ bền cao trên Mobile
  startListening({ onStart, onLiveSpeech, onSpeechStart, onResult, onEnd, onError, timeoutMs = 8500 } = {}) {
    return new Promise((resolve) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn('SpeechRecognition not supported');
        onError?.({ error: 'not-supported', message: 'Trình duyệt không hỗ trợ nhận diện giọng nói!' });
        resolve('');
        return;
      }

      let capturedText = '';
      let hasResolved = false;
      let timeoutId = null;

      const safeResolve = (text) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (!hasResolved) {
          hasResolved = true;
          this.isListening = false;
          resolve(text);
        }
      };

      try {
        if (this.recognition) {
          try { this.recognition.abort(); } catch (e) {}
        }

        const recognition = new SpeechRecognition();
        this.recognition = recognition;
        recognition.continuous = false;
        recognition.interimResults = true; // Bật nhận diện trực tiếp từng âm thanh/từ bé nói
        recognition.maxAlternatives = 3;
        recognition.lang = this.currentLanguage || 'en-US';

        // Đặt timeout tối đa cho 1 lượt nói (tránh bị treo)
        timeoutId = setTimeout(() => {
          try { recognition.stop(); } catch (e) {}
          safeResolve(capturedText);
        }, timeoutMs);

        recognition.onstart = () => {
          this.isListening = true;
          onStart?.();
        };

        recognition.onspeechstart = () => {
          onSpeechStart?.();
        };

        recognition.onresult = (event) => {
          let interim = '';
          let final = '';

          for (let i = 0; i < event.results.length; ++i) {
            const transcript = event.results[i][0]?.transcript || '';
            if (event.results[i].isFinal) {
              final += transcript + ' ';
            } else {
              interim += transcript + ' ';
            }
          }

          const liveText = (final || interim).trim();
          if (liveText) {
            capturedText = liveText;
            onLiveSpeech?.(liveText);
            onResult?.(liveText, false);
          }
        };

        recognition.onerror = (event) => {
          console.log('SpeechRecognition error event:', event?.error);
          this.isListening = false;
          onError?.(event);
          
          if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
            safeResolve('__MIC_NOT_ALLOWED__');
          } else {
            safeResolve(capturedText || '');
          }
        };

        recognition.onend = () => {
          this.isListening = false;
          onEnd?.();
          safeResolve(capturedText);
        };

        recognition.start();
      } catch (err) {
        console.error('Error starting SpeechRecognition:', err);
        this.isListening = false;
        onError?.(err);
        safeResolve('');
      }
    });
  }

  // Dừng nhận diện
  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  // Chuyển âm thanh thành chữ qua Deepgram API (nếu có key)
  async transcribe(audioBlob) {
    const apiKey = window.APP_CONFIG.DEEPGRAM_API_KEY;
    if (!apiKey || !audioBlob) return '';

    try {
      const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': audioBlob.type || 'audio/mp4'
        },
        body: audioBlob
      });
      const data = await response.json();
      return data.results?.channels[0]?.alternatives[0]?.transcript || '';
    } catch (err) {
      console.warn('Deepgram API error:', err);
      return '';
    }
  }
}

window.STTServiceModule = STTServiceModule;
