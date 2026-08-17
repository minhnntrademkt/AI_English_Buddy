// Parent Dashboard Module - Quản lý góc phụ huynh & cài đặt
class ParentDashboardModule {
  constructor() {
    this.analyzer = new window.SentimentAnalyzerModule();
  }

  // Thấu thị mã PIN phụ huynh
  verifyPin(inputPin) {
    const correctPin = window.APP_CONFIG.PARENT_PIN;
    return inputPin === correctPin;
  }

  // Cập nhật API Keys & PIN mới
  saveSettings(newPin, geminiKey, cartesiaKey, deepgramKey) {
    if (newPin) {
      window.APP_CONFIG.PARENT_PIN = newPin;
      localStorage.setItem('PARENT_PIN', newPin);
    }
    if (geminiKey !== undefined) {
      window.APP_CONFIG.GEMINI_API_KEY = geminiKey;
      localStorage.setItem('GEMINI_API_KEY', geminiKey);
    }
    if (cartesiaKey !== undefined) {
      window.APP_CONFIG.CARTESIA_API_KEY = cartesiaKey;
      localStorage.setItem('CARTESIA_API_KEY', cartesiaKey);
    }
    if (deepgramKey !== undefined) {
      window.APP_CONFIG.DEEPGRAM_API_KEY = deepgramKey;
      localStorage.setItem('DEEPGRAM_API_KEY', deepgramKey);
    }
  }

  // Tạo báo cáo phụ huynh từ lịch sử chat
  generateReport(chatHistory) {
    return this.analyzer.analyzeSession(chatHistory);
  }
}

window.ParentDashboardModule = ParentDashboardModule;
