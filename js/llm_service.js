// LLM Service Module - Xử lý trí tuệ nhân tạo Gemini 2.0 Flash
class LLMServiceModule {
  constructor() {
    this.chatHistory = [];
  }

  // Khởi tạo phiên trò chuyện với Persona được chọn
  initSession(personaKey) {
    const persona = window.APP_CONFIG.PERSONAS[personaKey] || window.APP_CONFIG.PERSONAS.toby;
    this.persona = persona;
    this.chatHistory = [
      { role: 'user', parts: [{ text: persona.systemPrompt }] },
      { role: 'model', parts: [{ text: `Hi there! I am ${persona.name}. What's your name?` }] }
    ];
    return persona;
  }

  // Gửi câu nói của bé và lấy phản hồi từ AI
  async generateReply(userMessage) {
    const apiKey = window.APP_CONFIG.GEMINI_API_KEY;

    // Thêm câu nói của bé vào lịch sử
    this.chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

    // 1. Ưu tiên gọi bảo mật qua Vercel Serverless Gateway (/api/chat)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: this.chatHistory, apiKey })
      });
      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (replyText) {
          this.chatHistory.push({ role: 'model', parts: [{ text: replyText }] });
          return replyText;
        }
      }
    } catch (e) {
      console.log('Vercel API Gateway not available, fallback to direct API call');
    }

    // 2. Nếu có API Key Gemini nhập trực tiếp, gọi trực tiếp Gemini REST API
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: this.chatHistory })
        });
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (replyText) {
          this.chatHistory.push({ role: 'model', parts: [{ text: replyText }] });
          return replyText;
        }
      } catch (err) {
        console.warn('Gemini API call failed, using offline fallback:', err);
      }
    }

    // Fallback thông minh khi chưa có API Key
    const fallbackReplies = [
      `Wow, that sounds amazing! Tell me more about that!`,
      `Oh! You went there? That's super cool! What was your favorite part?`,
      `That is so interesting! I love hearing about your day!`,
      `You are speaking English so well! What else do you like to do?`
    ];
    const mockReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    this.chatHistory.push({ role: 'model', parts: [{ text: mockReply }] });
    return mockReply;
  }
}

window.LLMServiceModule = LLMServiceModule;
