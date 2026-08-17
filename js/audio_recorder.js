// Audio Recorder Module - Quản lý thu âm giọng nói từ Micro
class AudioRecorderModule {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.onStreamReady = null;
  }

  // Khởi tạo và kiểm tra quyền Micro
  async requestPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      alert('Vui lòng cấp quyền truy cập Micro để trò chuyện với AI Buddy!');
      return null;
    }
  }

  // Bắt đầu thu âm
  async startRecording(onDataAvailable) {
    const stream = await this.requestPermission();
    if (!stream) return false;

    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // Thu theo từng chunk 100ms
    this.isRecording = true;
    return true;
  }

  // Dừng thu âm và trả về Blob âm thanh
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.isRecording = false;
        // Dừng tất cả track của stream để giải phóng micro
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }
}

window.AudioRecorderModule = AudioRecorderModule;
