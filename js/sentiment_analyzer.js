// Sentiment Analyzer Module - Phân tích cảm xúc & trích xuất lời khuyên cho Góc Phụ Huynh
class SentimentAnalyzerModule {
  // Phân tích lịch sử hội thoại của bé trong phiên vừa xong
  analyzeSession(chatHistory) {
    const userMessages = chatHistory
      .filter(msg => msg.role === 'user' && !msg.parts[0].text.includes('Target student'))
      .map(msg => msg.parts[0].text);

    const fullText = userMessages.join(' ').toLowerCase();

    // 1. Phân tích chỉ số cảm xúc sơ bộ
    let positiveScore = 70;
    let anxietyScore = 15;
    let sadnessScore = 15;

    if (fullText.includes('happy') || fullText.includes('love') || fullText.includes('like') || fullText.includes('good')) {
      positiveScore += 15;
    }
    if (fullText.includes('sad') || fullText.includes('hard') || fullText.includes('difficult') || fullText.includes('cry')) {
      sadnessScore += 20;
      positiveScore -= 10;
    }
    if (fullText.includes('scared') || fullText.includes('afraid') || fullText.includes('tired') || fullText.includes('busy')) {
      anxietyScore += 25;
      positiveScore -= 15;
    }

    // 2. Trích xuất chủ đề nổi bật
    const topics = [];
    if (fullText.includes('school') || fullText.includes('teacher') || fullText.includes('class') || fullText.includes('math') || fullText.includes('exam')) topics.push('Trường học & Thi cử');
    if (fullText.includes('game') || fullText.includes('roblox') || fullText.includes('minecraft') || fullText.includes('play') || fullText.includes('toy')) topics.push('Trò chơi & Game');
    if (fullText.includes('mom') || fullText.includes('dad') || fullText.includes('parent') || fullText.includes('home') || fullText.includes('family')) topics.push('Gia đình & Cha mẹ');
    if (fullText.includes('friend') || fullText.includes('friend') || fullText.includes('friend')) topics.push('Bạn bè');
    if (topics.length === 0) topics.push('Sở thích cá nhân');

    // 3. Trích xuất Insight & Lời khuyên cho Cha Mẹ
    let insightText = "Bé hào hứng chia sẻ về các hoạt động yêu thích và có tâm lý khá tích cực.";
    let parentAdvice = "Tối nay hãy chủ động hỏi bé về những trải nghiệm vui vẻ của bé và dành 10 phút lắng nghe bé kể chuyện.";

    if (anxietyScore > 30) {
      insightText = "Bé có dấu hiệu lo lắng hoặc cảm thấy áp lực khi nhắc đến việc học tập / thi cử.";
      parentAdvice = "Hãy động viên sự nỗ lực của bé thay vì điểm số. Bạn nên rủ bé đi dạo hoặc vận động nhẹ để giảm áp lực.";
    } else if (fullText.includes('mom') || fullText.includes('dad')) {
      insightText = "Bé có nhắc đến cha mẹ và thể hiện mong muốn được cha mẹ dành thêm thời gian trò chuyện cùng bé.";
      parentAdvice = "Dành 15 phút trước khi đi ngủ lắng nghe bé tâm sự mà không dùng điện thoại.";
    }

    return {
      date: new Date().toLocaleDateString('vi-VN'),
      sessionDuration: '15-25 phút',
      sentiment: { positive: Math.min(positiveScore, 95), anxiety: Math.max(anxietyScore, 5), sadness: Math.max(sadnessScore, 5) },
      topics: topics,
      insight: insightText,
      advice: parentAdvice,
      wordCount: userMessages.length * 8
    };
  }
}

window.SentimentAnalyzerModule = SentimentAnalyzerModule;
