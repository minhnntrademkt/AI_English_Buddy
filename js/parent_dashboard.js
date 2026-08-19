// Parent Dashboard Module - Quản lý góc phụ huynh, Báo cáo Năng lực & Đánh giá Cải thiện Đa Hồ Sơ Trẻ Em
class ParentDashboardModule {
  constructor() {
    this.analyzer = new window.SentimentAnalyzerModule();
    this.userService = new window.UserServiceModule();
  }

  // Lấy mã PIN phụ huynh của tài khoản đang đăng nhập
  getCorrectPin() {
    const user = this.userService.getCurrentUser();
    return user ? user.parentPin : (window.APP_CONFIG.PARENT_PIN || '1234');
  }

  // Xác thực mã PIN phụ huynh
  verifyPin(inputPin) {
    const correctPin = this.getCorrectPin();
    return inputPin === correctPin;
  }

  // Cập nhật mã PIN phụ huynh mới
  updatePin(newPin) {
    if (!newPin || newPin.length !== 4) return false;
    return this.userService.updateParentPin(newPin);
  }

  // Tính toán mức độ cải thiện (Delta) giữa phiên hiện tại và phiên đầu tiên / phiên trước
  calculateImprovement(child) {
    if (!child || !child.improvementHistory || child.improvementHistory.length < 2) {
      return {
        hasHistory: false,
        fluencyDelta: '+12%',
        pronunDelta: '+10%',
        vocabDelta: '+15%',
        confDelta: '+15%',
        summaryText: 'Bé vừa bắt đầu những phiên đàm thoại đầu tiên! Hãy tiếp tục duy trì 10-15 phút mỗi ngày.'
      };
    }

    const hist = child.improvementHistory;
    const latest = hist[hist.length - 1];
    const first = hist[0];

    const fDelta = latest.fluency - first.fluency;
    const pDelta = latest.pronunciation - first.pronunciation;
    const vDelta = latest.vocabulary - first.vocabulary;
    const cDelta = latest.confidence - first.confidence;

    return {
      hasHistory: true,
      totalSessions: hist.length,
      fluencyDelta: (fDelta >= 0 ? `+${fDelta}%` : `${fDelta}%`),
      pronunDelta: (pDelta >= 0 ? `+${pDelta}%` : `${pDelta}%`),
      vocabDelta: (vDelta >= 0 ? `+${vDelta}%` : `${vDelta}%`),
      confDelta: (cDelta >= 0 ? `+${cDelta}%` : `${cDelta}%`),
      summaryText: `So với buổi đầu tiên, bé ${child.name} đã bứt phá ấn tượng: Độ lưu loát tăng ${fDelta}%, Tự tin tăng ${cDelta}% và mở rộng thêm vốn từ vựng!`
    };
  }

  // Render HTML Báo Cáo Chi Tiết Cho Hồ Sơ Bé Được Chọn
  renderReportHTML(selectedChildId) {
    const children = this.userService.getChildren();
    if (children.length === 0) {
      return `<p style="color:#64748B;">Chưa có dữ liệu hồ sơ bé. Vui lòng thêm hồ sơ bé để bắt đầu!</p>`;
    }

    const currentChild = children.find(c => c.id === selectedChildId) || children[0];
    const imp = this.calculateImprovement(currentChild);
    const scores = currentChild.currentScores || { fluency: 75, pronunciation: 80, vocabulary: 70, confidence: 80 };

    // Danh sách tab chọn các bé trong gia đình
    const tabsHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px;">
        ${children.map(c => {
          const tabAvatarHTML = (c.avatar && (c.avatar.startsWith('data:image') || c.avatar.startsWith('http') || c.avatar.startsWith('assets/')))
            ? `<img src="${c.avatar}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover;" alt="Avatar" />`
            : `<span>${c.avatar || '👧'}</span>`;
          return `
            <button type="button" onclick="switchReportChildTab('${c.id}')" style="
              display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 12px; font-weight: 800; font-size: 0.88rem; cursor: pointer; border: none; transition: all 0.2s;
              ${c.id === currentChild.id 
                ? 'background: #0284C7; color: white; box-shadow: 0 4px 12px rgba(2,132,199,0.3);' 
                : 'background: #F1F5F9; color: #475569;'}
            ">
              ${tabAvatarHTML}
              <span>${c.englishName || c.name} (${c.grade || c.age + 't'})</span>
            </button>
          `;
        }).join('')}
        <button type="button" onclick="openAddChildModal()" style="
          display: inline-flex; align-items: center; gap: 4px; padding: 8px 12px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; cursor: pointer; background: #ECFDF5; color: #059669; border: 1.5px dashed #10B981;
        ">
          ➕ Thêm bé
        </button>
      </div>
    `;

    // Thẻ Thông Tin Bé & Trình Độ Hiện Tại
    const childDisplayName = currentChild.englishName && currentChild.englishName.trim()
      ? `Bé ${currentChild.englishName} <span style="font-size: 0.9rem; color: #475569; font-weight: 700;">(${currentChild.name})</span>`
      : `Bé ${currentChild.name} ${currentChild.nickname ? '(' + currentChild.nickname + ')' : ''}`;

    const profileAvatarHTML = (currentChild.avatar && (currentChild.avatar.startsWith('data:image') || currentChild.avatar.startsWith('http') || currentChild.avatar.startsWith('assets/')))
      ? `<img src="${currentChild.avatar}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.12);" alt="Child Avatar" />`
      : `<span style="font-size: 2.4rem; background: white; border-radius: 50%; width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">${currentChild.avatar || '🦊'}</span>`;

    const displayInterests = currentChild.interests && currentChild.interests.trim() !== ''
      ? `<em>${currentChild.interests}</em>`
      : `<span style="color: #94A3B8; font-style: italic;">(Chưa có - Bố mẹ có thể tự điền hoặc duyệt gợi ý AI)</span>`;

    const profileSummaryHTML = `
      <div style="background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border: 1.5px solid #BAE6FD; border-radius: 16px; padding: 16px; margin-bottom: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${profileAvatarHTML}
            <div>
              <div style="font-weight: 900; font-size: 1.15rem; color: #0369A1;">${childDisplayName}</div>
              <div style="font-size: 0.84rem; color: #475569; margin-top: 2px;">
                🎂 <strong>${currentChild.age} tuổi</strong> • 🎒 <strong>${currentChild.grade || 'Tiểu học'}</strong> • 🎨 Sở thích: ${displayInterests}
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button type="button" onclick="openEditChildModal('${currentChild.id}')" style="background: #FFFFFF; color: #0284C7; border: 1.5px solid #BAE6FD; font-weight: 800; font-size: 0.82rem; padding: 7px 12px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              ✏️ Sửa Thông Tin
            </button>
            <div style="background: white; border-radius: 10px; padding: 6px 12px; border: 1px solid #E0F2FE; text-align: right;">
              <div style="font-size: 0.72rem; color: #64748B; font-weight: 700;">TỔNG ĐÀM THOẠI</div>
              <div style="font-weight: 900; color: #0284C7; font-size: 0.95rem;">${currentChild.sessionsCount || 0} buổi • ${currentChild.totalWords || 0} từ</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Khối 1: Gợi ý sở thích từ AI (Chờ Phụ Huynh Phê Duyệt Trước Khi Thêm)
    let suggestedInterestsHTML = '';
    if (currentChild.suggestedInterests && currentChild.suggestedInterests.length > 0) {
      suggestedInterestsHTML = `
        <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%); border: 1.5px solid #FDE68A; border-radius: 16px; padding: 16px; margin-bottom: 18px; box-shadow: 0 3px 10px rgba(245, 158, 11, 0.08);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
            <h4 style="margin: 0; font-weight: 900; color: #92400E; font-size: 0.96rem; display: flex; align-items: center; gap: 6px;">
              💡 AI Phát Hiện Sở Thích Mới Của Bé
            </h4>
            <span style="font-size: 0.74rem; background: #FEF3C7; color: #B45309; border: 1px solid #FCD34D; padding: 2px 8px; border-radius: 8px; font-weight: 800;">
              Chờ Bố Mẹ Duyệt
            </span>
          </div>
          <p style="font-size: 0.82rem; color: #78350F; line-height: 1.4; margin: 0 0 12px 0;">
            Qua các buổi đàm thoại, AI nhận thấy bé rất hào hứng khi nói về các chủ đề dưới đây. Bố mẹ có thể phê duyệt để thêm vào hồ sơ chính thức của con:
          </p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${currentChild.suggestedInterests.map(item => {
              const interestText = typeof item === 'string' ? item : item.text;
              const sourceNote = typeof item === 'object' && item.source ? item.source : 'Phát hiện qua đàm thoại';
              return `
                <div style="background: white; border-radius: 12px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #FDE68A; gap: 10px; flex-wrap: wrap;">
                  <div>
                    <div style="font-weight: 800; color: #1E293B; font-size: 0.92rem;">✨ ${interestText}</div>
                    <div style="font-size: 0.74rem; color: #64748B; margin-top: 1px;">${sourceNote}</div>
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <button type="button" onclick="handleAcceptInterest('${currentChild.id}', '${interestText}')" style="background: #10B981; color: white; border: none; font-weight: 800; font-size: 0.78rem; padding: 6px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(16,185,129,0.2);">
                      ✅ Chấp Nhận
                    </button>
                    <button type="button" onclick="handleRejectInterest('${currentChild.id}', '${interestText}')" style="background: #F1F5F9; color: #64748B; border: 1px solid #CBD5E1; font-weight: 700; font-size: 0.78rem; padding: 6px 10px; border-radius: 8px; cursor: pointer;">
                      ✕ Bỏ Qua
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Bảng 4 Kỹ Năng Năng Lực
    const skillBarsHTML = `
      <div style="background: white; border: 1.5px solid #F1E5D1; border-radius: 16px; padding: 16px; margin-bottom: 18px;">
        <h4 style="margin: 0 0 14px 0; font-weight: 900; color: #1E293B; font-size: 0.98rem; display: flex; align-items: center; gap: 6px;">
          📊 Đánh Giá Trình Độ Nói Tiếng Anh
        </h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 800; margin-bottom: 4px;">
              <span>🗣️ Độ Lưu Loát & Tốc Độ Phản Xạ (Fluency)</span>
              <span style="color: #0284C7;">${scores.fluency}%</span>
            </div>
            <div style="background: #F1F5F9; border-radius: 10px; height: 10px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #38BDF8, #0284C7); width: ${scores.fluency}%; height: 100%; border-radius: 10px;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 800; margin-bottom: 4px;">
              <span>🎯 Phát Âm & Ngữ Điệu Chuẩn (Pronunciation)</span>
              <span style="color: #10B981;">${scores.pronunciation}%</span>
            </div>
            <div style="background: #F1F5F9; border-radius: 10px; height: 10px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #34D399, #10B981); width: ${scores.pronunciation}%; height: 100%; border-radius: 10px;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 800; margin-bottom: 4px;">
              <span>📚 Vốn Từ Vựng Sử Dụng (Vocabulary Range)</span>
              <span style="color: #F59E0B;">${scores.vocabulary}%</span>
            </div>
            <div style="background: #F1F5F9; border-radius: 10px; height: 10px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #FBBF24, #F59E0B); width: ${scores.vocabulary}%; height: 100%; border-radius: 10px;"></div>
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 800; margin-bottom: 4px;">
              <span>⭐ Độ Tự Tin & Chủ Động Giao Tiếp (Confidence)</span>
              <span style="color: #8B5CF6;">${scores.confidence}%</span>
            </div>
            <div style="background: #F1F5F9; border-radius: 10px; height: 10px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #A78BFA, #8B5CF6); width: ${scores.confidence}%; height: 100%; border-radius: 10px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Khối Đánh Giá Mức Độ Cải Thiện So Với Các Buổi Trước
    const improvementHTML = `
      <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 16px; padding: 16px; margin-bottom: 18px;">
        <h4 style="margin: 0 0 10px 0; font-weight: 900; color: #166534; font-size: 0.98rem; display: flex; align-items: center; gap: 6px;">
          📈 Đánh Giá Cải Thiện So Với Các Buổi Trước
        </h4>
        <div style="font-size: 0.86rem; color: #15803D; line-height: 1.55; margin-bottom: 12px; font-weight: 600;">
          ${imp.summaryText}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
          <div style="background: white; border-radius: 12px; padding: 10px; text-align: center; border: 1px solid #DCFCE7;">
            <div style="font-size: 0.76rem; color: #64748B; font-weight: 700;">LƯU LOÁT</div>
            <div style="font-weight: 900; color: #16A34A; font-size: 1.15rem; margin-top: 2px;">${imp.fluencyDelta}</div>
          </div>
          <div style="background: white; border-radius: 12px; padding: 10px; text-align: center; border: 1px solid #DCFCE7;">
            <div style="font-size: 0.76rem; color: #64748B; font-weight: 700;">PHÁT ÂM</div>
            <div style="font-weight: 900; color: #16A34A; font-size: 1.15rem; margin-top: 2px;">${imp.pronunDelta}</div>
          </div>
          <div style="background: white; border-radius: 12px; padding: 10px; text-align: center; border: 1px solid #DCFCE7;">
            <div style="font-size: 0.76rem; color: #64748B; font-weight: 700;">TỪ VỰNG MỚI</div>
            <div style="font-weight: 900; color: #16A34A; font-size: 1.15rem; margin-top: 2px;">${imp.vocabDelta}</div>
          </div>
          <div style="background: white; border-radius: 12px; padding: 10px; text-align: center; border: 1px solid #DCFCE7;">
            <div style="font-size: 0.76rem; color: #64748B; font-weight: 700;">TỰ TIN</div>
            <div style="font-weight: 900; color: #16A34A; font-size: 1.15rem; margin-top: 2px;">${imp.confDelta}</div>
          </div>
        </div>
      </div>
    `;

    // Khối 3: Nhật Ký Đàm Thoại & Ký Ức Riêng Của Bé
    let sessionHistoryHTML = '';
    const sessions = currentChild.sessionHistory || [];
    if (sessions.length > 0) {
      sessionHistoryHTML = `
        <div style="background: white; border: 1.5px solid #F1E5D1; border-radius: 16px; padding: 16px; margin-bottom: 18px;">
          <h4 style="margin: 0 0 12px 0; font-weight: 900; color: #1E293B; font-size: 0.98rem; display: flex; align-items: center; gap: 6px;">
            💬 Nhật Ký Đàm Thoại & Ký Ức Riêng Của Bé (${sessions.length} buổi)
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${sessions.slice(0, 5).map((s, idx) => `
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-weight: 800; color: #0284C7; font-size: 0.88rem;">📅 Buổi ${sessions.length - idx}: ${s.date || s.dateShort}</span>
                  <span style="font-size: 0.76rem; background: #EFF6FF; color: #1E40AF; padding: 2px 8px; border-radius: 6px; font-weight: 700;">🗣️ ${s.wordsCount || 15} từ</span>
                </div>
                <div style="font-size: 0.84rem; color: #334155; margin-bottom: 3px;">
                  📚 Chủ đề: <strong>${s.topicSummary || (s.topics ? s.topics.join(', ') : 'Giao tiếp hàng ngày')}</strong>
                </div>
                ${s.insight ? `<div style="font-size: 0.78rem; color: #64748B; font-style: italic;">💡 Ghi chú tâm lý: ${s.insight}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return tabsHTML + profileSummaryHTML + suggestedInterestsHTML + skillBarsHTML + improvementHTML + sessionHistoryHTML;
  }
}

window.ParentDashboardModule = ParentDashboardModule;

