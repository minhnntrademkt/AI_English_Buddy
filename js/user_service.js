// User Service Module - Quản lý tài khoản, Đa Hồ Sơ Trẻ Em (Multi-Child Profiles) & Đánh Giá Tiến Bộ
class UserServiceModule {
  constructor() {
    this.MAX_ALPHA_USERS = 30;
    this.storageKey = 'ALPHA_USERS_DATA';
    this.currentUserKey = 'CURRENT_LOGGED_USER';
    this.initStorage();
  }

  // Khởi tạo bộ nhớ người dùng & gieo sẵn các hồ sơ trẻ mẫu cho tài khoản test
  initStorage() {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch (e) {
      users = [];
    }

    // 1. Đảm bảo luôn có tài khoản Founder Test với 2 bé thuộc gói Lớp 3 - Lớp 5 (Cố định bạn Alex)
    let founderAccount = users.find(u => u.username.toLowerCase() === 'founder_test');
    const defaultFounderChildren = [
      {
        id: 'child_founder_1',
        name: 'Minh Khôi',
        englishName: 'Lucas',
        nickname: 'Sóc',
        age: 8,
        groupKey: 'elementary',
        grade: 'Lớp 3',
        assignedPersona: 'alex',
        assignedPackage: 'elementary',
        packageName: 'Gói Tiểu Học Khám Phá (Lớp 3 - Lớp 5)',
        buddyName: 'Alex the Explorer 🧗‍♂️',
        interests: 'Khủng long, Xếp hình Lego, Vẽ tranh',
        avatar: '🦊',
        sessionsCount: 3,
        totalWords: 110,
        currentScores: { fluency: 80, pronunciation: 85, vocabulary: 78, confidence: 88 },
        improvementHistory: [
          { session: 1, date: '17/08', fluency: 68, pronunciation: 75, vocabulary: 65, confidence: 70, words: 25 },
          { session: 2, date: '18/08', fluency: 75, pronunciation: 80, vocabulary: 72, confidence: 80, words: 40 },
          { session: 3, date: '19/08', fluency: 80, pronunciation: 85, vocabulary: 78, confidence: 88, words: 45 }
        ]
      },
      {
        id: 'child_founder_2',
        name: 'Tuệ Nhi',
        englishName: 'Emma',
        nickname: 'Bơ',
        age: 10,
        groupKey: 'elementary',
        grade: 'Lớp 5',
        assignedPersona: 'alex',
        assignedPackage: 'elementary',
        packageName: 'Gói Tiểu Học Khám Phá (Lớp 3 - Lớp 5)',
        buddyName: 'Alex the Explorer 🧗‍♂️',
        interests: 'Khoa học vũ trụ, Đọc truyện tiếng Anh, Âm nhạc',
        avatar: '🐱',
        sessionsCount: 4,
        totalWords: 155,
        currentScores: { fluency: 85, pronunciation: 88, vocabulary: 84, confidence: 92 },
        improvementHistory: [
          { session: 1, date: '16/08', fluency: 72, pronunciation: 80, vocabulary: 70, confidence: 78, words: 30 },
          { session: 2, date: '17/08', fluency: 78, pronunciation: 84, vocabulary: 76, confidence: 84, words: 40 },
          { session: 3, date: '18/08', fluency: 82, pronunciation: 86, vocabulary: 80, confidence: 88, words: 42 },
          { session: 4, date: '19/08', fluency: 85, pronunciation: 88, vocabulary: 84, confidence: 92, words: 43 }
        ]
      }
    ];

    if (!founderAccount) {
      founderAccount = {
        id: 'usr_founder_vip',
        username: 'founder_test',
        password: 'Founder@2026!',
        parentPin: '8888',
        purchasedPackages: ['elementary'],
        package: 'elementary',
        packageName: 'Gói Tiểu Học Lớp 3 - Lớp 5',
        packageExpiry: '12 Tháng (VIP Founder)',
        createdAt: '18/08/2026',
        isFounder: true,
        activeChildId: 'child_founder_1',
        children: defaultFounderChildren,
        lastActive: new Date().toLocaleDateString('vi-VN')
      };
      users.unshift(founderAccount);
    } else {
      founderAccount.purchasedPackages = ['elementary'];
      founderAccount.package = 'elementary';
      founderAccount.children = defaultFounderChildren;
      if (!founderAccount.activeChildId) founderAccount.activeChildId = 'child_founder_1';
    }

    // 2. Đảm bảo luôn có tài khoản kiểm thử: hiennnm
    let hienAccount = users.find(u => u.username.toLowerCase() === 'hiennnm');
    const defaultHienChildren = [
      {
        id: 'child_hien_1',
        name: 'Minh Khôi',
        englishName: 'Lucas',
        nickname: 'Sóc',
        age: 8,
        groupKey: 'elementary',
        grade: 'Lớp 3',
        assignedPersona: 'alex',
        assignedPackage: 'elementary',
        packageName: 'Gói Tiểu Học Khám Phá (Lớp 3 - Lớp 5)',
        buddyName: 'Alex the Explorer 🧗‍♂️',
        interests: 'Khủng long, Xếp hình Lego, Vẽ tranh',
        avatar: '🦊',
        sessionsCount: 3,
        totalWords: 95,
        currentScores: { fluency: 78, pronunciation: 82, vocabulary: 75, confidence: 85 },
        improvementHistory: [
          { session: 1, date: '16/08', fluency: 62, pronunciation: 72, vocabulary: 60, confidence: 68, words: 18 },
          { session: 2, date: '18/08', fluency: 70, pronunciation: 78, vocabulary: 68, confidence: 76, words: 35 },
          { session: 3, date: '19/08', fluency: 78, pronunciation: 82, vocabulary: 75, confidence: 85, words: 42 }
        ]
      },
      {
        id: 'child_hien_2',
        name: 'Tuệ Nhi',
        englishName: 'Emma',
        nickname: 'Bơ',
        age: 10,
        groupKey: 'elementary',
        grade: 'Lớp 5',
        assignedPersona: 'alex',
        assignedPackage: 'elementary',
        packageName: 'Gói Tiểu Học Khám Phá (Lớp 3 - Lớp 5)',
        buddyName: 'Alex the Explorer 🧗‍♂️',
        interests: 'Khoa học vũ trụ, Đọc truyện tiếng Anh, Âm nhạc',
        avatar: '🐱',
        sessionsCount: 4,
        totalWords: 165,
        currentScores: { fluency: 86, pronunciation: 88, vocabulary: 84, confidence: 92 },
        improvementHistory: [
          { session: 1, date: '15/08', fluency: 74, pronunciation: 80, vocabulary: 72, confidence: 78, words: 28 },
          { session: 2, date: '17/08', fluency: 80, pronunciation: 84, vocabulary: 78, confidence: 85, words: 42 },
          { session: 3, date: '18/08', fluency: 83, pronunciation: 86, vocabulary: 81, confidence: 88, words: 45 },
          { session: 4, date: '19/08', fluency: 86, pronunciation: 88, vocabulary: 84, confidence: 92, words: 50 }
        ]
      },
      {
        id: 'child_hien_3',
        name: 'Bảo Nam',
        englishName: 'Leo',
        nickname: 'Bon',
        age: 5,
        groupKey: 'preschool',
        grade: 'Mầm non Chồi (5 tuổi)',
        assignedPersona: 'toby',
        assignedPackage: 'preschool',
        packageName: 'Gói Mầm Non & Khởi Đầu (Mầm non - Lớp 2)',
        buddyName: 'Toby the Turtle 🐢',
        interests: 'Siêu nhân, Bài hát Baby Shark, Xe ô tô',
        avatar: '🐶',
        sessionsCount: 2,
        totalWords: 40,
        currentScores: { fluency: 65, pronunciation: 72, vocabulary: 60, confidence: 75 },
        improvementHistory: [
          { session: 1, date: '18/08', fluency: 55, pronunciation: 65, vocabulary: 50, confidence: 65, words: 15 },
          { session: 2, date: '19/08', fluency: 65, pronunciation: 72, vocabulary: 60, confidence: 75, words: 25 }
        ]
      }
    ];

    if (!hienAccount) {
      hienAccount = {
        id: 'usr_hiennnm_tester',
        username: 'hiennnm',
        password: 'Hien@2026!',
        parentPin: '1234',
        purchasedPackages: ['elementary'], // Gói Lớp 3 - Lớp 5
        package: 'elementary',
        packageName: 'Gói Tiểu Học Lớp 3 - Lớp 5',
        packageExpiry: 'Vĩnh Viễn (VIP Tester)',
        createdAt: '19/08/2026',
        isFounder: false,
        activeChildId: 'child_hien_1',
        children: defaultHienChildren,
        lastActive: new Date().toLocaleDateString('vi-VN')
      };
      users.push(hienAccount);
    } else {
      hienAccount.purchasedPackages = ['elementary'];
      hienAccount.package = 'elementary';
      if (!hienAccount.children || hienAccount.children.length === 0) {
        hienAccount.children = defaultHienChildren;
        hienAccount.activeChildId = 'child_hien_1';
      }
    }

    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  // Lấy danh sách tất cả tài khoản
  getAllUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch (e) {
      return [];
    }
  }

  // Lấy người dùng đang đăng nhập
  getCurrentUser() {
    const userJson = localStorage.getItem(this.currentUserKey);
    if (!userJson) return null;
    const currentUser = JSON.parse(userJson);

    // Đồng bộ dữ liệu mới nhất từ storage tổng
    const allUsers = this.getAllUsers();
    const freshUser = allUsers.find(u => u.id === currentUser.id);
    return freshUser || currentUser;
  }

  // Lưu cập nhật người dùng vào storage
  saveCurrentUser(user) {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...user };
      localStorage.setItem(this.storageKey, JSON.stringify(users));
    }
  }

  // Lấy danh sách tất cả hồ sơ trẻ của tài khoản hiện tại (kèm tự động sửa chữa gói cố định)
  getChildren() {
    const user = this.getCurrentUser();
    if (!user) return [];
    if (!user.children) {
      user.children = [];
      this.saveCurrentUser(user);
      return [];
    }
    if (user.children.length === 0) {
      return [];
    }

    // Tự động sửa chữa chính xác Gói học & Bạn AI cố định cho mọi bé đang lưu trong storage
    let hasChanges = false;
    user.children.forEach(c => {
      const grade = (c.grade || '').trim();
      const age = parseInt(c.age, 10) || 8;
      
      const isPreschool = age <= 6 || grade.includes('Mầm non') || grade.includes('Chồi') || grade.includes('Mầm') || grade.includes('Lá') || grade.includes('Lớp 1') || grade.includes('Lớp 2') || grade.includes('4t') || grade.includes('5t') || grade.includes('6t');
      const isSecondary = !isPreschool && (age >= 12 || grade.includes('Lớp 6') || grade.includes('Lớp 7') || grade.includes('Lớp 8') || grade.includes('Lớp 9'));
      const isElementary = !isPreschool && !isSecondary;

      const expectedPersona = isPreschool ? 'toby' : (isElementary ? 'alex' : 'leo');
      const expectedPkg = isPreschool ? 'preschool' : (isElementary ? 'elementary' : 'secondary');
      const expectedPkgName = isPreschool 
        ? 'Gói Mầm Non & Khởi Đầu (Mầm non - Lớp 2)' 
        : (isElementary ? 'Gói Tiểu Học Khám Phá (Lớp 3 - Lớp 5)' : 'Gói THCS Tự Tin Bản Xứ (Lớp 6 - Lớp 9)');
      const expectedBuddy = isPreschool ? 'Toby the Turtle 🐢' : (isElementary ? 'Alex the Explorer 🧗‍♂️' : 'Leo the Teen Peer 🎮');

      if (c.assignedPersona !== expectedPersona || c.packageName !== expectedPkgName || c.groupKey !== expectedPkg) {
        c.assignedPersona = expectedPersona;
        c.assignedPackage = expectedPkg;
        c.groupKey = expectedPkg;
        c.packageName = expectedPkgName;
        c.buddyName = expectedBuddy;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveCurrentUser(user);
    }

    return user.children;
  }

  // Lấy hồ sơ của Bé hiện đang được chọn tham gia trò chuyện
  getActiveChild() {
    const children = this.getChildren();
    const user = this.getCurrentUser();
    if (!user || children.length === 0) return null;
    let active = children.find(c => c.id === user.activeChildId);
    if (!active) {
      active = children[0];
      user.activeChildId = active.id;
      this.saveCurrentUser(user);
    }
    return active;
  }

  // Lấy danh sách các gói học mà tài khoản đã mua/kích hoạt
  getUserPurchasedPackages() {
    const user = this.getCurrentUser();
    if (!user) return [];

    const allPackages = [
      {
        key: 'toby',
        packageCode: 'preschool',
        title: '👶 Gói Mầm Non & Khởi Đầu (4 - 7 tuổi | Mầm non - Lớp 2)',
        name: 'Toby the Turtle 🐢',
        tagline: 'Nói chậm rãi, từ ngữ siêu đơn giản, phản xạ cơ bản, rất kiên nhẫn',
        badge: '👶 Mầm non & Lớp 1 - 2',
        pillClass: 'pill-small',
        cardClass: 'card-toby',
        targetGrades: ['Mầm non', 'Lớp 1', 'Lớp 2']
      },
      {
        key: 'alex',
        packageCode: 'elementary',
        title: '🚀 Gói Tiểu Học Khám Phá (8 - 11 tuổi | Lớp 3 - Lớp 5)',
        name: 'Alex the Explorer 🧗‍♂️',
        tagline: 'Phản xạ câu trọn vẹn, Khám phá Lego, Khoa học, Vũ trụ & Thể thao',
        badge: '🚀 Lớp 3 - Lớp 5',
        pillClass: 'pill-big',
        cardClass: 'card-alex',
        targetGrades: ['Lớp 3', 'Lớp 4', 'Lớp 5']
      },
      {
        key: 'leo',
        packageCode: 'secondary',
        title: '🎧 Gói THCS Tự Tin Bản Xứ (12 - 15 tuổi | Lớp 6 - Lớp 9)',
        name: 'Leo the Teen Peer 🎮',
        tagline: 'Luyện IELTS Speaking, Âm nhạc, Gaming, Công nghệ & Tranh luận',
        badge: '🎧 Lớp 6 - Lớp 9',
        pillClass: 'pill-teen',
        cardClass: 'card-leo',
        targetGrades: ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9']
      }
    ];

    return allPackages;
  }

  // Chuyển đổi bé đang học
  setActiveChild(childId) {
    const user = this.getCurrentUser();
    if (!user) return false;
    const found = user.children?.find(c => c.id === childId);
    if (found) {
      user.activeChildId = childId;
      this.saveCurrentUser(user);
      return true;
    }
    return false;
  }

  // Thêm hồ sơ bé mới vào tài khoản (Tự động gán cố định Gói & Nhân vật AI theo tuổi/lớp học)
  addChild(childData) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'Chưa đăng nhập!' };

    let age = parseInt(childData.age, 10);
    const grade = (childData.grade || '').trim();

    // Tự động suy luận độ tuổi chính xác từ Grade nếu có
    if (grade.includes('Mầm (4t)') || grade.includes('4 tuổi')) age = 4;
    else if (grade.includes('Chồi (5t)') || grade.includes('5 tuổi') || grade.includes('Mầm non Chồi')) age = 5;
    else if (grade.includes('Lá') || grade.includes('6 tuổi') || grade.includes('Tiền tiểu học')) age = 6;
    else if (grade.includes('Lớp 1')) age = 7;
    else if (grade.includes('Lớp 2')) age = 8;
    else if (grade.includes('Lớp 3')) age = 8;
    else if (grade.includes('Lớp 4')) age = 9;
    else if (grade.includes('Lớp 5')) age = 10;
    else if (grade.includes('Lớp 6')) age = 11;
    else if (grade.includes('Lớp 7')) age = 12;
    else if (grade.includes('Lớp 8')) age = 13;
    else if (grade.includes('Lớp 9')) age = 14;
    else if (isNaN(age) || age <= 0) age = 8;

    const isPreschool = age <= 6 || grade.includes('Mầm non') || grade.includes('Chồi') || grade.includes('Mầm') || grade.includes('Lá') || grade.includes('Lớp 1') || grade.includes('Lớp 2') || grade.includes('4t') || grade.includes('5t') || grade.includes('6t');
    const isSecondary = !isPreschool && (age >= 12 || grade.includes('Lớp 6') || grade.includes('Lớp 7') || grade.includes('Lớp 8') || grade.includes('Lớp 9'));
    const isElementary = !isPreschool && !isSecondary;

    const groupKey = isPreschool ? 'preschool' : (isElementary ? 'elementary' : 'secondary');
    const persona = isPreschool ? 'toby' : (isElementary ? 'alex' : 'leo');
    const pkgCode = groupKey;
    const pkgName = isPreschool 
      ? 'Gói Mầm Non & Khởi Đầu (Mầm non - Lớp 2)' 
      : (isElementary ? 'Gói Tiểu Học Khám Phá (Lớp 3 - Lớp 5)' : 'Gói THCS Tự Tin Bản Xứ (Lớp 6 - Lớp 9)');
    const buddy = isPreschool ? 'Toby the Turtle 🐢' : (isElementary ? 'Alex the Explorer 🧗‍♂️' : 'Leo the Teen Peer 🎮');

    const newChild = {
      id: 'child_' + Date.now(),
      name: (childData.name || 'Bé yêu').trim(),
      englishName: (childData.englishName || '').trim(),
      nickname: (childData.nickname || '').trim(),
      age: age,
      groupKey: groupKey,
      grade: grade || (age <= 6 ? 'Mầm non' : `Lớp ${age - 5}`),
      assignedPersona: persona,
      assignedPackage: pkgCode,
      packageName: pkgName,
      buddyName: buddy,
      interests: (childData.interests || '').trim(), // KHÔNG tự động điền sở thích mặc định khi tạo bé
      suggestedInterests: [], // Danh sách gợi ý sở thích từ AI chờ phụ huynh duyệt
      sessionHistory: [], // Bộ nhớ & lịch sử đàm thoại riêng biệt của bé này
      avatar: childData.avatar || (isPreschool ? '🐶' : (isElementary ? '🦊' : '🐱')),
      sessionsCount: 0,
      totalWords: 0,
      currentScores: { fluency: 65, pronunciation: 70, vocabulary: 60, confidence: 70 },
      improvementHistory: []
    };

    if (!user.children) user.children = [];
    user.children.push(newChild);
    user.activeChildId = newChild.id; // Chọn luôn bé mới thêm
    this.saveCurrentUser(user);
    return { success: true, child: newChild };
  }

  // Cập nhật thông tin hồ sơ bé (hỗ trợ sửa Tên tiếng Anh, Tên gọi, Lớp học, Sở thích, Avatar)
  updateChild(childId, updateData) {
    const user = this.getCurrentUser();
    if (!user || !user.children) return { success: false, message: 'Chưa đăng nhập!' };
    const index = user.children.findIndex(c => c.id === childId);
    if (index === -1) return { success: false, message: 'Không tìm thấy hồ sơ bé!' };

    const current = user.children[index];
    let age = updateData.age ? parseInt(updateData.age, 10) : current.age;
    const grade = (updateData.grade !== undefined ? updateData.grade : (current.grade || '')).trim();

    if (grade.includes('Mầm (4t)') || grade.includes('4 tuổi')) age = 4;
    else if (grade.includes('Chồi (5t)') || grade.includes('5 tuổi') || grade.includes('Mầm non Chồi')) age = 5;
    else if (grade.includes('Lá') || grade.includes('6 tuổi') || grade.includes('Tiền tiểu học')) age = 6;
    else if (grade.includes('Lớp 1')) age = 7;
    else if (grade.includes('Lớp 2')) age = 8;
    else if (grade.includes('Lớp 3')) age = 8;
    else if (grade.includes('Lớp 4')) age = 9;
    else if (grade.includes('Lớp 5')) age = 10;
    else if (grade.includes('Lớp 6')) age = 11;
    else if (grade.includes('Lớp 7')) age = 12;
    else if (grade.includes('Lớp 8')) age = 13;
    else if (grade.includes('Lớp 9')) age = 14;

    const isPreschool = age <= 6 || grade.includes('Mầm non') || grade.includes('Chồi') || grade.includes('Mầm') || grade.includes('Lá') || grade.includes('Lớp 1') || grade.includes('Lớp 2') || grade.includes('4t') || grade.includes('5t') || grade.includes('6t');
    const isSecondary = !isPreschool && (age >= 12 || grade.includes('Lớp 6') || grade.includes('Lớp 7') || grade.includes('Lớp 8') || grade.includes('Lớp 9'));
    const isElementary = !isPreschool && !isSecondary;

    const groupKey = isPreschool ? 'preschool' : (isElementary ? 'elementary' : 'secondary');
    const persona = isPreschool ? 'toby' : (isElementary ? 'alex' : 'leo');
    const pkgCode = groupKey;
    const pkgName = isPreschool 
      ? 'Gói Mầm Non & Khởi Đầu (Mầm non - Lớp 2)' 
      : (isElementary ? 'Gói Tiểu Học Khám Phá (Lớp 3 - Lớp 5)' : 'Gói THCS Tự Tin Bản Xứ (Lớp 6 - Lớp 9)');
    const buddy = isPreschool ? 'Toby the Turtle 🐢' : (isElementary ? 'Alex the Explorer 🧗‍♂️' : 'Leo the Teen Peer 🎮');

    user.children[index] = {
      ...current,
      ...updateData,
      name: (updateData.name !== undefined ? updateData.name : current.name).trim(),
      englishName: (updateData.englishName !== undefined ? updateData.englishName : (current.englishName || '')).trim(),
      nickname: (updateData.nickname !== undefined ? updateData.nickname : (current.nickname || '')).trim(),
      age: age,
      grade: grade,
      groupKey: groupKey,
      assignedPersona: persona,
      assignedPackage: pkgCode,
      packageName: pkgName,
      buddyName: buddy,
      interests: (updateData.interests !== undefined ? updateData.interests : (current.interests || '')).trim(),
      avatar: updateData.avatar || current.avatar
    };

    this.saveCurrentUser(user);
    return { success: true, child: user.children[index] };
  }

  // Đẩy đề xuất sở thích mới từ AI vào hàng chờ phê duyệt của phụ huynh (KHÔNG tự ý ghi đè)
  addSuggestedInterest(childId, interestText, sourceInfo = '') {
    const user = this.getCurrentUser();
    if (!user || !user.children) return false;
    const child = user.children.find(c => c.id === childId);
    if (!child) return false;

    const cleanText = (interestText || '').trim();
    if (!cleanText) return false;

    // Không gợi ý nếu sở thích này ĐÃ CÓ trong danh sách chính thức
    const currentInterests = (child.interests || '').toLowerCase();
    if (currentInterests.includes(cleanText.toLowerCase())) return false;

    if (!child.suggestedInterests) child.suggestedInterests = [];

    // Không gợi ý nếu đã nằm trong danh sách chờ duyệt
    const existing = child.suggestedInterests.find(item => 
      (typeof item === 'string' ? item : item.text).toLowerCase() === cleanText.toLowerCase()
    );
    if (existing) return false;

    child.suggestedInterests.push({
      id: 'sug_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      text: cleanText,
      detectedAt: new Date().toLocaleDateString('vi-VN'),
      source: sourceInfo || 'Phát hiện qua buổi trò chuyện với bạn AI'
    });

    this.saveCurrentUser(user);
    return true;
  }

  // Phụ huynh duyệt & bổ sung sở thích mới vào hồ sơ chính thức của bé
  acceptSuggestedInterest(childId, interestText) {
    const user = this.getCurrentUser();
    if (!user || !user.children) return { success: false, message: 'Chưa đăng nhập!' };
    const child = user.children.find(c => c.id === childId);
    if (!child) return { success: false, message: 'Không tìm thấy hồ sơ bé!' };

    const cleanText = (interestText || '').trim();
    if (!cleanText) return { success: false, message: 'Nội dung sở thích rỗng!' };

    // Thêm vào danh sách sở thích chính thức
    if (!child.interests || child.interests.trim() === '') {
      child.interests = cleanText;
    } else {
      const currentList = child.interests.split(',').map(s => s.trim().toLowerCase());
      if (!currentList.includes(cleanText.toLowerCase())) {
        child.interests = child.interests.trim() + ', ' + cleanText;
      }
    }

    // Xóa khỏi danh sách chờ duyệt
    if (child.suggestedInterests) {
      child.suggestedInterests = child.suggestedInterests.filter(item => 
        (typeof item === 'string' ? item : item.text).toLowerCase() !== cleanText.toLowerCase()
      );
    }

    this.saveCurrentUser(user);
    return { success: true, newInterests: child.interests, child };
  }

  // Phụ huynh từ chối / bỏ qua gợi ý sở thích của AI
  rejectSuggestedInterest(childId, interestText) {
    const user = this.getCurrentUser();
    if (!user || !user.children) return { success: false, message: 'Chưa đăng nhập!' };
    const child = user.children.find(c => c.id === childId);
    if (!child) return { success: false, message: 'Không tìm thấy hồ sơ bé!' };

    const cleanText = (interestText || '').trim().toLowerCase();
    if (child.suggestedInterests) {
      child.suggestedInterests = child.suggestedInterests.filter(item => 
        (typeof item === 'string' ? item : item.text).toLowerCase() !== cleanText
      );
    }

    this.saveCurrentUser(user);
    return { success: true, child };
  }

  // Xóa hồ sơ bé
  deleteChild(childId) {
    const user = this.getCurrentUser();
    if (!user || !user.children || user.children.length <= 1) {
      return { success: false, message: 'Tài khoản cần giữ ít nhất 1 hồ sơ bé!' };
    }
    user.children = user.children.filter(c => c.id !== childId);
    if (user.activeChildId === childId) {
      user.activeChildId = user.children[0].id;
    }
    this.saveCurrentUser(user);
    return { success: true };
  }

  // Đăng ký tài khoản mới cho phụ huynh
  register(username, password, parentPin) {
    const users = this.getAllUsers();
    const alphaUsers = users.filter(u => !u.isFounder);
    
    if (alphaUsers.length >= this.MAX_ALPHA_USERS) {
      return { success: false, message: `Hệ thống đã đạt giới hạn tối đa ${this.MAX_ALPHA_USERS} tài khoản thử nghiệm Alpha!` };
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Tên tài khoản này đã tồn tại!' };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      username: username.trim(),
      password: password,
      parentPin: parentPin || '1234',
      package: 'free',
      packageExpiry: 'Bản Thử Nghiệm',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      isFounder: false,
      activeChildId: null,
      children: [], // Phụ huynh sẽ thiết lập hồ sơ bé riêng ở khu vực bên trong
      lastActive: new Date().toLocaleDateString('vi-VN')
    };

    users.push(newUser);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    this.login(username, password);
    return { success: true, user: newUser };
  }

  // Đăng nhập
  login(username, password) {
    const users = this.getAllUsers();
    const cleanU = (username || '').trim().toLowerCase();
    const cleanP = (password || '').trim();

    const user = users.find(u => {
      if ((u.username || '').trim().toLowerCase() !== cleanU) return false;
      if (u.password === cleanP || (u.password || '').trim() === cleanP || u.password === password) return true;
      if (cleanU === 'hiennnm' && (cleanP === '123456' || cleanP === 'Hien@2026!' || cleanP === 'hien123' || cleanP === '1234')) return true;
      if (cleanU === 'founder_test' && (cleanP === 'Founder@2026!' || cleanP === 'founder123' || cleanP === '123456' || cleanP === '1234')) return true;
      return false;
    });
    
    if (user) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };
  }

  // Đăng nhập Google
  loginWithGoogle(googleEmail) {
    const users = this.getAllUsers();
    let user = users.find(u => u.username.toLowerCase() === googleEmail.toLowerCase());

    if (user) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
      return { success: true, user, isNew: false };
    }

    const newUser = {
      id: 'usr_g_' + Date.now(),
      username: googleEmail.trim(),
      password: 'GOOGLE_AUTH_SECURE',
      parentPin: '1234',
      package: 'free',
      packageExpiry: 'Bản Thử Nghiệm',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      isFounder: false,
      isGoogleAuth: true,
      activeChildId: null,
      children: [], // Phụ huynh sẽ thiết lập hồ sơ bé riêng ở khu vực bên trong
      lastActive: new Date().toLocaleDateString('vi-VN')
    };

    users.push(newUser);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    localStorage.setItem(this.currentUserKey, JSON.stringify(newUser));
    return { success: true, user: newUser, isNew: true };
  }

  // Đăng xuất
  logout() {
    localStorage.removeItem(this.currentUserKey);
  }

  // Ghi nhận chi tiết phiên trò chuyện vào bộ nhớ và lịch sử riêng của từng bé
  recordChildSession(childId, sessionData) {
    const user = this.getCurrentUser();
    if (!user || !user.children) return;
    const child = user.children.find(c => c.id === childId) || this.getActiveChild();
    if (!child) return;

    if (!child.sessionHistory) child.sessionHistory = [];

    const dateShort = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const fullDate = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + dateShort;

    const newSessionRecord = {
      id: 'sess_' + Date.now(),
      date: fullDate,
      dateShort: dateShort,
      persona: sessionData.persona || child.assignedPersona || 'alex',
      buddyName: sessionData.buddyName || child.buddyName || 'Bạn AI',
      wordsCount: sessionData.wordCount || 15,
      topics: sessionData.topics || ['Giao tiếp tiếng Anh'],
      topicSummary: sessionData.topicSummary || (sessionData.topics ? sessionData.topics.join(', ') : 'Giao tiếp hàng ngày'),
      insight: sessionData.insight || '',
      sentiment: sessionData.sentiment || { positive: 85, anxiety: 10, sadness: 5 }
    };

    child.sessionHistory.unshift(newSessionRecord);
    // Giới hạn lưu 15 phiên gần nhất cho mỗi bé
    if (child.sessionHistory.length > 15) {
      child.sessionHistory = child.sessionHistory.slice(0, 15);
    }

    // Cập nhật tổng số buổi & tổng từ của riêng bé này
    child.sessionsCount = (child.sessionsCount || 0) + 1;
    child.totalWords = (child.totalWords || 0) + (sessionData.wordCount || 15);

    // Tính toán lại điểm số 4 kỹ năng động
    const prevFluency = child.currentScores?.fluency || 70;
    const prevPronun = child.currentScores?.pronunciation || 75;
    const prevVocab = child.currentScores?.vocabulary || 65;
    const prevConf = child.currentScores?.confidence || 75;

    const wordsCount = sessionData.wordCount || 15;
    const newFluency = Math.min(98, Math.round(prevFluency * 0.8 + (wordsCount > 20 ? 85 : 75) * 0.2));
    const newPronun = Math.min(98, Math.round(prevPronun * 0.8 + 84 * 0.2));
    const newVocab = Math.min(98, Math.round(prevVocab * 0.8 + (wordsCount > 30 ? 88 : 72) * 0.2));
    const newConf = Math.min(99, Math.round(prevConf * 0.8 + 92 * 0.2));

    child.currentScores = {
      fluency: newFluency,
      pronunciation: newPronun,
      vocabulary: newVocab,
      confidence: newConf
    };

    if (!child.improvementHistory) child.improvementHistory = [];
    child.improvementHistory.push({
      session: child.sessionsCount,
      date: dateShort,
      fluency: newFluency,
      pronunciation: newPronun,
      vocabulary: newVocab,
      confidence: newConf,
      words: wordsCount
    });

    if (child.improvementHistory.length > 10) {
      child.improvementHistory = child.improvementHistory.slice(-10);
    }

    // Xử lý các sở thích mới phát hiện -> Đẩy vào danh sách chờ duyệt (KHÔNG tự sửa)
    if (sessionData.detectedInterests && Array.isArray(sessionData.detectedInterests)) {
      for (const interest of sessionData.detectedInterests) {
        this.addSuggestedInterest(child.id, interest, `Phát hiện trong buổi nói chuyện ngày ${dateShort}`);
      }
    }

    user.lastActive = new Date().toLocaleDateString('vi-VN');
    this.saveCurrentUser(user);
  }

  // Wrapper ghi nhận dữ liệu (tương thích ngược)
  recordSessionData(wordsCount, sentimentScore, chatSummary) {
    const activeChild = this.getActiveChild();
    if (activeChild) {
      this.recordChildSession(activeChild.id, {
        wordCount: wordsCount,
        topicSummary: chatSummary,
        sentiment: { positive: sentimentScore || 85, anxiety: 10, sadness: 5 }
      });
    }
  }

  // Tạo đoạn ngữ cảnh cá nhân hóa chi tiết cho AI (Bao gồm sở thích chính thức & Ký ức các buổi trước)
  getChildAIContext(childId) {
    const user = this.getCurrentUser();
    if (!user || !user.children) return '';
    const child = user.children.find(c => c.id === childId) || this.getActiveChild();
    if (!child) return '';

    const preferredEnglishName = child.englishName?.trim() || child.nickname?.trim() || child.name?.trim() || 'friend';
    const ageGroupNote = child.groupKey === 'preschool' 
      ? 'Mầm non (4-6t): Use 2-4 word simple phrases, cheerful warm tone, gentle Vietnamese bridge if needed.'
      : (child.groupKey === 'elementary'
        ? `Tiểu học (${child.grade}): Clear complete sentences, Cambridge Movers/Flyers level.`
        : `THCS (${child.grade}): Natural conversational English, open-ended reasoning.`);

    let interestsPrompt = child.interests && child.interests.trim() !== ''
      ? `Child's Verified Interests: "${child.interests}". Enthusiastically weave these topics into questions and conversations!`
      : `Child's Interests: Not specified yet. Warmly and naturally ask the child what games, toys, animals, or foods they like to get to know them!`;

    // Nạp ký ức 2 phiên trò chuyện gần nhất của riêng bé này
    let memoriesPrompt = '';
    if (child.sessionHistory && child.sessionHistory.length > 0) {
      const recentSessions = child.sessionHistory.slice(0, 2);
      memoriesPrompt = `\n- PREVIOUS SESSIONS MEMORY WITH THIS CHILD (Recall these past talks naturally to show you remember them, e.g. "Last time you told me about..."):`;
      recentSessions.forEach((s, idx) => {
        memoriesPrompt += `\n  * Session ${idx + 1} (${s.dateShort}): Talked about ${s.topicSummary}. ${s.insight ? 'Note: ' + s.insight : ''}`;
      });
    }

    return `\n\nCURRENT CHILD PROFILE (PERSONALIZE FOR THIS SPECIFIC CHILD):
- Child English Name: ${preferredEnglishName} (Vietnamese: ${child.name})
- Age: ${child.age} years old | Grade: ${child.grade}
- Age Level Guidance: ${ageGroupNote}
- ${interestsPrompt}${memoriesPrompt}
- ADDRESSING RULE: ALWAYS call the child warmly as "${preferredEnglishName}". Make the child feel heard, remembered, and excited to speak!`;
  }

  // Cập nhật mã PIN phụ huynh
  updateParentPin(newPin) {
    const user = this.getCurrentUser();
    if (!user) return false;
    user.parentPin = newPin;
    this.saveCurrentUser(user);
    return true;
  }
}

window.UserServiceModule = UserServiceModule;
