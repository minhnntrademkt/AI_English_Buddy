// LLM Service Module - Xử lý trí tuệ nhân tạo Gemini 2.0 Flash
class LLMServiceModule {
  constructor() {
    this.chatHistory = [];
  }

  // Khởi tạo phiên trò chuyện với Persona và Hồ sơ của Bé hiện tại
  initSession(personaKey, activeChild) {
    const persona = window.APP_CONFIG.PERSONAS[personaKey] || window.APP_CONFIG.PERSONAS.toby;
    this.persona = persona;
    this.activeChild = activeChild;

    let childContext = '';
    if (window.userService && activeChild) {
      childContext = window.userService.getChildAIContext(activeChild.id);
    } else if (activeChild) {
      const preferredEnglishName = activeChild.englishName?.trim() || activeChild.nickname?.trim() || activeChild.name?.trim() || 'friend';
      const interestsText = activeChild.interests && activeChild.interests.trim() !== ''
        ? `Child's Verified Interests: "${activeChild.interests}"`
        : `Child's Interests: Not specified yet. Warmly ask what they like!`;
      childContext = `\n\nCURRENT CHILD PROFILE (MUST ADAPT TO THIS SPECIFIC CHILD):
- Child English Name: ${preferredEnglishName} (Vietnamese Name: ${activeChild.name})
- Age: ${activeChild.age} years old | Grade: ${activeChild.grade}
- ${interestsText}
- PRONUNCIATION & ADDRESSING RULE: ALWAYS address the child warmly by their English name "${preferredEnglishName}"! Never mispronounce Vietnamese names with English phonetics — just call them "${preferredEnglishName}".`;
    }

    const fullSystemPrompt = persona.systemPrompt + childContext;
    const initialGreeting = this.getInitialGreeting(persona, activeChild);

    this.chatHistory = [
      { role: 'user', parts: [{ text: fullSystemPrompt }] },
      { role: 'model', parts: [{ text: initialGreeting }] }
    ];
    return persona;
  }

  // Lấy câu chào mở đầu cá nhân hóa chính xác theo Tên Tiếng Anh của bé và nhân vật cố định
  getInitialGreeting(persona, activeChild) {
    const childName = activeChild?.englishName?.trim() || activeChild?.nickname?.trim() || activeChild?.name?.trim() || 'my friend';
    if (persona?.id === 'toby') {
      return `Hello ${childName}! I am Toby the Turtle 🐢. What fun thing do you want to talk about today?`;
    } else if (persona?.id === 'alex') {
      return `Hello ${childName}! I am Alex the Explorer 🧗‍♂️. What exciting story or adventure are we exploring today?`;
    } else if (persona?.id === 'leo') {
      return `Hello ${childName}! I am Leo 🎮. Ready for an awesome English conversation today, ${childName}?`;
    }
    return `Hello ${childName}! I am ${persona?.name || 'your buddy'}. Let's have fun chatting!`;
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
