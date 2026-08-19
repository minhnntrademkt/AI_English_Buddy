// Sentiment Analyzer & Child Safety Interceptor Module
class SentimentAnalyzerModule {
  constructor() {
    this.safetyAlertsKey = 'CHILD_SAFETY_ALERTS';
  }

  // Danh mục từ khóa & Phân loại rủi ro nhạy cảm (Song ngữ Anh - Việt)
  getSafetyPatterns() {
    return [
      {
        category: 'school_bullying',
        categoryName: '⚠️ Bạo lực học đường & Bắt nạt',
        severity: 'critical',
        keywords: [
          'hit me', 'punched me', 'fight', 'bully', 'bullies', 'bullied', 'laugh at me', 'tease me', 'hurt me', 
          'steal my', 'push me', 'kick me', 'beat me', 'hate me', 'bad words', 'threatened', 'scared of school',
          'bị đánh', 'bắt nạt', 'đánh con', 'chê bai', 'chửi con', 'tẩy chay', 'dọa nạt', 'đánh đập', 
          'giật đồ', 'cô lập', 'sợ đi học', 'bạn ghét con', 'không cho chơi cùng', 'bị cô lập', 'bị tát', 'ép buộc'
        ],
        advice: [
          'Giữ bình tĩnh tuyệt đối, ôm con và lắng nghe toàn bộ câu chuyện mà không ngắt lời hay phán xét.',
          'Khẳng định với con: "Đây hoàn toàn không phải lỗi của con, bố mẹ luôn ở bên bảo vệ con."',
          'Liên hệ riêng với giáo viên chủ nhiệm để kiểm tra tình hình lớp học mà không làm con cảm thấy bị xấu hổ.',
          'Ghi lại các mốc thời gian và biểu hiện của con để theo dõi sát sao.'
        ]
      },
      {
        category: 'emotional_distress',
        categoryName: '💔 Khủng hoảng tâm lý & Cảm xúc tiêu cực sâu',
        severity: 'high',
        keywords: [
          'lonely', 'no friends', 'nobody likes me', 'cry alone', 'wanna disappear', 'die', 'hurt myself', 
          'hopeless', 'depressed', 'hate myself', 'useless', 'so sad',
          'cô đơn', 'không có bạn', 'không ai thích', 'muốn chết', 'làm đau mình', 'khóc một mình', 
          'tuyệt vọng', 'uất ức', 'ghét bản thân', 'vô dụng', 'chán sống', 'không muốn sống', 'bế tắc'
        ],
        advice: [
          'Dành thời gian chất lượng 1-1 cho con (cùng đi dạo, cùng nấu ăn hoặc chơi trò con thích).',
          'Khích lệ cảm xúc tích cực, công nhận những nỗ lực dù là nhỏ nhất của con.',
          'Nếu tình trạng kéo dài trên 1-2 tuần, phụ huynh nên tham vấn chuyên gia tâm lý học đường.'
        ]
      },
      {
        category: 'inappropriate_touch',
        categoryName: '🚨 Xâm hại & Hành vi người lớn bất thường',
        severity: 'critical',
        keywords: [
          'touch me', 'secret touch', 'strange man', 'naked', 'private part', 'dont tell mom', 'forced me',
          'đụng chạm', 'sờ soạng', 'người lạ ép', 'vùng kín', 'không được nói mẹ', 'bắt giữ bí mật', 'cởi đồ'
        ],
        advice: [
          'Lắng nghe con với thái độ dịu dàng, tạo cảm giác an toàn và tin tưởng tuyệt đối cho con.',
          'Gọi ngay Tổng đài Quốc gia Bảo vệ Trẻ em: 111 (Miễn phí 24/7) để nhận hỗ trợ pháp lý và tâm lý khẩn cấp.',
          'Tuyệt đối không để con tiếp xúc lại một mình với đối tượng khả nghi.'
        ]
      }
    ];
  }

  // Bắt đầu một phiên mới - khởi tạo bộ đệm cảnh báo ẩn cho đúng bé đang học
  startNewSession(activeChild) {
    this.pendingSessionAlerts = [];
    this.activeChild = activeChild || null;
  }

  // Quét câu nói trong phiên - lưu tạm thời vào bộ nhớ đệm bí mật (không hiện popup/chấm đỏ làm phiền bé)
  detectSafetyTrigger(userText) {
    if (!userText || typeof userText !== 'string') return null;
    const cleanText = userText.toLowerCase();
    const patterns = this.getSafetyPatterns();

    for (const pat of patterns) {
      for (const kw of pat.keywords) {
        if (cleanText.includes(kw)) {
          const childName = this.activeChild ? `${this.activeChild.name} (${this.activeChild.grade || this.activeChild.age + ' tuổi'})` : 'Bé';
          const alertItem = {
            id: 'alert_' + Date.now(),
            childId: this.activeChild?.id || 'unknown',
            childName: childName,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
            category: pat.category,
            categoryName: pat.categoryName,
            severity: pat.severity,
            matchedKeyword: kw,
            childQuote: userText.trim(),
            advice: pat.advice,
            read: false
          };
          if (!this.pendingSessionAlerts) this.pendingSessionAlerts = [];
          this.pendingSessionAlerts.push(alertItem);
          return alertItem;
        }
      }
    }
    return null;
  }

  // Kết thúc phiên đàm thoại - Chính thức ghi nhận các cảnh báo để gửi đến Phụ Huynh
  finalizeSessionAlerts() {
    if (this.pendingSessionAlerts && this.pendingSessionAlerts.length > 0) {
      for (const item of this.pendingSessionAlerts) {
        this.saveSafetyAlert(item);
      }
      this.pendingSessionAlerts = [];
      return true;
    }
    return false;
  }

  // Lưu trữ cảnh báo vào Storage
  saveSafetyAlert(alertItem) {
    try {
      const existing = this.getSafetyAlerts();
      existing.unshift(alertItem);
      // Giới hạn lưu 25 cảnh báo gần nhất
      localStorage.setItem(this.safetyAlertsKey, JSON.stringify(existing.slice(0, 25)));
    } catch (e) {
      console.warn('Lỗi lưu Safety Alert:', e);
    }
  }

  // Lấy danh sách tất cả cảnh báo
  getSafetyAlerts() {
    try {
      return JSON.parse(localStorage.getItem(this.safetyAlertsKey)) || [];
    } catch (e) {
      return [];
    }
  }

  // Đánh dấu đã xem tất cả
  markAllAlertsAsRead() {
    try {
      const alerts = this.getSafetyAlerts().map(a => ({ ...a, read: true }));
      localStorage.setItem(this.safetyAlertsKey, JSON.stringify(alerts));
    } catch (e) {}
  }

  // Đếm số lượng cảnh báo chưa đọc
  getUnreadAlertsCount() {
    return this.getSafetyAlerts().filter(a => !a.read).length;
  }

  // Trích xuất các sở thích tiềm năng mới được phát hiện trong cuộc trò chuyện của bé
  extractDetectedInterests(fullText) {
    const interestDictionary = [
      { keywords: ['dinosaur', 't-rex', 'khủng long', 'fossil'], name: 'Khủng long & Khảo cổ' },
      { keywords: ['lego', 'xếp hình', 'build block', 'brick'], name: 'Xếp hình Lego' },
      { keywords: ['space', 'planet', 'astronaut', 'vũ trụ', 'hành tinh', 'phi thuyền'], name: 'Khoa học Vũ trụ' },
      { keywords: ['roblox', 'minecraft', 'video game', 'pokemon', 'chơi game'], name: 'Trò chơi Roblox & Minecraft' },
      { keywords: ['drawing', 'painting', 'sketch', 'vẽ tranh', 'tô màu', 'draw'], name: 'Vẽ tranh & Mỹ thuật' },
      { keywords: ['music', 'piano', 'guitar', 'sing', 'bài hát', 'ca hát', 'song'], name: 'Âm nhạc & Nhạc cụ' },
      { keywords: ['football', 'soccer', 'basketball', 'bơi', 'swimming', 'bóng đá'], name: 'Thể thao & Vận động' },
      { keywords: ['cat', 'dog', 'puppy', 'kitten', 'chó', 'mèo', 'thú cưng', 'pet'], name: 'Động vật & Thú cưng' },
      { keywords: ['superhero', 'batman', 'spider-man', 'iron man', 'siêu nhân'], name: 'Siêu anh hùng' },
      { keywords: ['princess', 'elsa', 'anna', 'barbie', 'công chúa'], name: 'Công chúa & Cổ tích' },
      { keywords: ['cooking', 'baking', 'cake', 'pizza', 'nấu ăn', 'làm bánh'], name: 'Nấu ăn & Làm bánh' },
      { keywords: ['story', 'comic', 'fairy tale', 'đọc sách', 'truyện tranh'], name: 'Đọc sách & Truyện tranh' }
    ];

    const detected = [];
    for (const item of interestDictionary) {
      if (item.keywords.some(kw => fullText.includes(kw))) {
        detected.push(item.name);
      }
    }
    return detected;
  }

  // Phân tích lịch sử hội thoại của bé trong phiên vừa xong
  analyzeSession(chatHistory, activeChild = null) {
    const userMessages = chatHistory
      .filter(msg => msg.role === 'user' && !msg.parts?.[0]?.text?.includes('CURRENT CHILD PROFILE') && !msg.parts?.[0]?.text?.includes('Target student'))
      .map(msg => msg.parts?.[0]?.text || '');

    const fullText = userMessages.join(' ').toLowerCase();

    // 1. Phân tích chỉ số cảm xúc sơ bộ
    let positiveScore = 75;
    let anxietyScore = 12;
    let sadnessScore = 10;

    if (fullText.includes('happy') || fullText.includes('love') || fullText.includes('like') || fullText.includes('good') || fullText.includes('vui') || fullText.includes('thích') || fullText.includes('cool') || fullText.includes('fun')) {
      positiveScore += 15;
    }
    if (fullText.includes('sad') || fullText.includes('hard') || fullText.includes('difficult') || fullText.includes('cry') || fullText.includes('buồn') || fullText.includes('khóc')) {
      sadnessScore += 20;
      positiveScore -= 10;
    }
    if (fullText.includes('scared') || fullText.includes('afraid') || fullText.includes('tired') || fullText.includes('busy') || fullText.includes('sợ') || fullText.includes('mệt')) {
      anxietyScore += 25;
      positiveScore -= 15;
    }

    // 2. Trích xuất chủ đề nổi bật
    const topics = [];
    if (fullText.includes('school') || fullText.includes('teacher') || fullText.includes('class') || fullText.includes('math') || fullText.includes('exam') || fullText.includes('học') || fullText.includes('trường')) topics.push('Trường học & Thầy cô');
    if (fullText.includes('game') || fullText.includes('roblox') || fullText.includes('minecraft') || fullText.includes('play') || fullText.includes('toy') || fullText.includes('chơi')) topics.push('Trò chơi & Đồ chơi');
    if (fullText.includes('mom') || fullText.includes('dad') || fullText.includes('parent') || fullText.includes('home') || fullText.includes('family') || fullText.includes('mẹ') || fullText.includes('bố')) topics.push('Gia đình & Cha mẹ');
    if (fullText.includes('friend') || fullText.includes('bạn')) topics.push('Bạn bè');
    if (topics.length === 0) topics.push('Giao tiếp tự nhiên hàng ngày');

    // 3. Trích xuất sở thích chưa có trong hồ sơ bé (Chỉ gợi ý, KHÔNG tự sửa)
    const rawDetected = this.extractDetectedInterests(fullText);
    const existingInterests = (activeChild?.interests || '').toLowerCase();
    const detectedInterests = rawDetected.filter(d => !existingInterests.includes(d.toLowerCase()));

    // 4. Trích xuất Insight & Lời khuyên cho Cha Mẹ
    let insightText = "Bé hào hứng chia sẻ về các hoạt động yêu thích và có tâm lý tích cực, tự tin khi nói tiếng Anh.";
    let parentAdvice = "Tối nay bố mẹ hãy chủ động hỏi thăm những điều bé đã chia sẻ cùng bạn AI để khuyến khích sự tự tin của con.";

    if (anxietyScore > 30) {
      insightText = "Bé có dấu hiệu lo lắng hoặc cảm thấy áp lực khi nhắc đến việc học tập / bạn bè.";
      parentAdvice = "Hãy động viên sự nỗ lực của bé thay vì điểm số. Bạn nên rủ bé đi dạo hoặc vận động nhẹ để giải tỏa căng thẳng.";
    } else if (fullText.includes('mom') || fullText.includes('dad') || fullText.includes('mẹ') || fullText.includes('bố')) {
      insightText = "Bé có nhắc đến cha mẹ và thể hiện mong muốn được cha mẹ dành thêm thời gian trò chuyện cùng bé.";
      parentAdvice = "Dành 15 phút trước khi đi ngủ lắng nghe bé tâm sự mà không dùng điện thoại.";
    }

    const wordCount = userMessages.reduce((sum, msg) => sum + msg.split(/\s+/).filter(Boolean).length, 0);

    return {
      date: new Date().toLocaleDateString('vi-VN'),
      sessionDuration: '15-25 phút',
      sentiment: { positive: Math.min(positiveScore, 95), anxiety: Math.max(anxietyScore, 5), sadness: Math.max(sadnessScore, 5) },
      topics: topics,
      topicSummary: topics.join(', '),
      detectedInterests: detectedInterests,
      insight: insightText,
      advice: parentAdvice,
      wordCount: Math.max(wordCount, 15)
    };
  }
}

window.SentimentAnalyzerModule = SentimentAnalyzerModule;
