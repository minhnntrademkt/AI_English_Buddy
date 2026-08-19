// Audio Recorder Module - Quản lý thu âm giọng nói từ Micro (Hỗ trợ iOS Safari & Android)
class AudioRecorderModule {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.activeStream = null;
    this.selectedMimeType = '';
  }

  // Khởi tạo và yêu cầu cấp quyền Micro tương thích cả iOS Safari & Android
  async requestPermission() {
    if (this.activeStream && this.activeStream.active) {
      return this.activeStream;
    }

    try {
      let stream = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      } else if (navigator.webkitGetUserMedia) {
        stream = await new Promise((res, rej) => navigator.webkitGetUserMedia({ audio: true }, res, rej));
      } else if (navigator.getUserMedia) {
        stream = await new Promise((res, rej) => navigator.getUserMedia({ audio: true }, res, rej));
      }

      if (stream) {
        this.activeStream = stream;
        return stream;
      }
      throw new Error('getUserMedia not supported in this browser context');
    } catch (err) {
      console.error('Microphone permission or support error:', err);
      return null;
    }
  }

  // Tìm MIME type tối ưu cho thiết bị hiện tại (iOS dùng mp4/aac, Chrome dùng webm)
  getBestMimeType() {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg'
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return '';
  }

  // Bắt đầu thu âm
  async startRecording() {
    const stream = await this.requestPermission();
    if (!stream) return false;

    this.audioChunks = [];
    this.selectedMimeType = this.getBestMimeType();

    try {
      const options = this.selectedMimeType ? { mimeType: this.selectedMimeType } : {};
      this.mediaRecorder = new MediaRecorder(stream, options);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (e) {
      console.warn('MediaRecorder start failed, falling back to basic recorder:', e);
      try {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) this.audioChunks.push(ev.data);
        };
        this.mediaRecorder.start();
        this.isRecording = true;
        return true;
      } catch (err) {
        console.error('MediaRecorder completely failed:', err);
        return false;
      }
    }
  }

  // Dừng thu âm và trả về Blob âm thanh
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const type = this.selectedMimeType || 'audio/mp4';
        const audioBlob = new Blob(this.audioChunks, { type });
        this.isRecording = false;
        resolve(audioBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.isRecording = false;
        resolve(null);
      }
    });
  }

  // Giải phóng toàn bộ track micro khi đóng phiên
  releaseStream() {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      this.activeStream = null;
    }
    this.isRecording = false;
  }
}

window.AudioRecorderModule = AudioRecorderModule;
