// Admin Service Module - Hệ thống Quản trị Doanh nghiệp, Phân quyền & Phân tích Chỉ số Nâng cao
class AdminServiceModule {
  constructor() {
    this.adminUsername = 'admin';
    this.adminPassword = 'admin123';
    this.userService = new window.UserServiceModule();
  }

  // Đăng nhập tài khoản Admin bảo mật
  login(username, password) {
    if (username === this.adminUsername && password === this.adminPassword) {
      sessionStorage.setItem('IS_ADMIN_LOGGED_IN', 'true');
      return { success: true };
    }
    return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu quản trị Admin!' };
  }

  // Kiểm tra trạng thái đăng nhập
  isAdminLoggedIn() {
    return sessionStorage.getItem('IS_ADMIN_LOGGED_IN') === 'true';
  }

  // Đăng xuất Admin
  logout() {
    sessionStorage.removeItem('IS_ADMIN_LOGGED_IN');
  }

  // Lấy các chỉ số phân tích chuyên sâu cho Founder (SaaS & Pedagogical Analytics)
  getDetailedAnalytics() {
    const allUsers = this.userService.getAllUsers();
    const alphaUsers = allUsers.filter(u => !u.isFounder);
    
    let mrr = 0; // Doanh thu hàng tháng ước tính (VNĐ)
    let starterCount = 0;
    let proCount = 0;
    let freeCount = 0;
    let totalWords = 0;
    let totalSessions = 0;
    let sentimentSum = 0;

    allUsers.forEach(u => {
      totalWords += (u.totalWords || 0);
      totalSessions += (u.sessionsCount || 0);
      sentimentSum += (u.avgSentiment || 80);

      if (u.package === 'kids_starter') {
        mrr += 299000;
        starterCount++;
      } else if (u.package === 'teen_pro') {
        mrr += 499000;
        proCount++;
      } else {
        freeCount++;
      }
    });

    const avgSentiment = allUsers.length > 0 ? Math.round(sentimentSum / allUsers.length) : 85;
    const paidUsers = starterCount + proCount;
    const conversionRate = allUsers.length > 0 ? Math.round((paidUsers / allUsers.length) * 100) : 0;

    return {
      totalUsers: allUsers.length,
      alphaUsersCount: alphaUsers.length,
      maxAlphaUsers: this.userService.MAX_ALPHA_USERS,
      mrr: mrr,
      starterCount,
      proCount,
      freeCount,
      conversionRate,
      totalWords,
      totalSessions,
      avgSentiment,
      // Danh sách sự kiện cảnh báo an toàn tâm lý
      safetyAlerts: [
        { date: '18/08/2026', child: 'Bé Minh', alert: 'Tâm trạng vui vẻ, yêu thích thám hiểm vũ trụ', level: 'safe' },
        { date: '17/08/2026', child: 'Tài khoản Alpha', alert: 'Tập trung luyện phản xạ tiếng Anh rất tốt', level: 'safe' }
      ]
    };
  }

  // Gán hoặc thay đổi gói cước dịch vụ
  assignPackage(userId, packageType) {
    const users = this.userService.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].package = packageType; // 'free' | 'kids_starter' | 'teen_pro'
      users[index].packageExpiry = packageType === 'free' ? 'Bản Thử Nghiệm' : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN');
      localStorage.setItem(this.userService.storageKey, JSON.stringify(users));
      return true;
    }
    return false;
  }

  // Khóa / Mở khóa tài khoản
  toggleUserStatus(userId) {
    const users = this.userService.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].status = (users[index].status === 'blocked') ? 'active' : 'blocked';
      localStorage.setItem(this.userService.storageKey, JSON.stringify(users));
      return users[index].status;
    }
    return null;
  }

  // Đặt lại mã PIN phụ huynh
  resetParentPin(userId, newPin) {
    const users = this.userService.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].parentPin = newPin || '1234';
      localStorage.setItem(this.userService.storageKey, JSON.stringify(users));
      return true;
    }
    return false;
  }

  // Xóa tài khoản
  deleteUser(userId) {
    let users = this.userService.getAllUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(this.userService.storageKey, JSON.stringify(users));
    return true;
  }
}

window.AdminServiceModule = AdminServiceModule;
