// TTS Service Module - Chuyển văn bản thành giọng nói phát ra loa (Text-to-Speech)
class TTSServiceModule {
  constructor() {
    this.synth = window.speechSynthesis;
  }

  // Phát câu nói ra loa
  async speak(text, persona) {
    const apiKey = window.APP_CONFIG.CARTESIA_API_KEY;

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
            voice: { mode: 'id', id: '69471608-210a-400f-ac92-36b023d05d8f' }, // Sample child voice
            output_format: { container: 'wav', encoding: 'pcm_f32le', sample_rate: 24000 }
          })
        });
        const audioBuffer = await response.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
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

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = persona?.speed || 0.9;
      utterance.pitch = 1.2; // Tăng pitch nhẹ để tạo cảm giác giọng trẻ em
      utterance.lang = persona?.voiceLang || 'en-US';

      // Thử tìm giọng bản xứ Anh/Mỹ
      const voices = this.synth.getVoices();
      const englishVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
      if (englishVoice) utterance.voice = englishVoice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  // Dừng phát âm thanh
  stop() {
    if (this.synth) this.synth.cancel();
  }
}

window.TTSServiceModule = TTSServiceModule;
