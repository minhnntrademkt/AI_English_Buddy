// Mascot Renderer Module - Bộ 3 nhân vật Mascot 3D Pixar Khung Tròn Sang Trọng (High-Fidelity Studio Circles)
class MascotRendererModule {
  constructor() {
    this.mascot3DAssets = {
      toby: {
        id: 'toby',
        name: 'Toby the Turtle 🐢',
        tagline: 'Bạn rùa 3D kiên nhẫn, nói siêu chậm (Mầm non & Lớp 1-2)',
        img3D: 'assets/mascot_toby.jpg',
        themeColor: '#22C55E',
        mouthOffset: { top: '43%', left: '59%', width: '40px', height: '25px' }
      },
      alex: {
        id: 'alex',
        name: 'Alex the Explorer 🧗‍♂️',
        tagline: 'Bạn thám hiểm 3D năng động (Lớp 3 - Lớp 5: Lego, Khoa học & Vũ trụ)',
        img3D: 'assets/mascot_alex.jpg',
        themeColor: '#F59E0B',
        mouthOffset: { top: '28%', left: '51%', width: '36px', height: '22px' }
      },
      leo: {
        id: 'leo',
        name: 'Leo the Teen Peer 🎧',
        tagline: 'Bạn bản xứ 3D sành điệu (Lớp 6 - Lớp 9: IELTS Speaking, Gaming & Âm nhạc)',
        img3D: 'assets/mascot_leo.jpg',
        themeColor: '#8B5CF6',
        mouthOffset: { top: '48%', left: '50%', width: '42px', height: '26px' }
      }
    };
  }

  // Tạo khung Sân khấu Mascot 3D dạng hình tròn sang trọng có viền vàng & mấp máy môi
  getMascot3DStageHTML(personaKey) {
    const mascot = this.mascot3DAssets[personaKey] || this.mascot3DAssets.toby;
    return `
      <div class="mascot-circle-stage ${mascot.id}">
        <!-- Ảnh gốc 3D độ nét cao nguyên bản -->
        <img class="mascot-circle-img" src="${mascot.img3D}" alt="${mascot.name}">
        
        <!-- Tầng cử động mấp máy môi 3D thời gian thực (Live 3D Lip-Sync) -->
        <div class="mascot-3d-mouth-anchor" style="top: ${mascot.mouthOffset.top}; left: ${mascot.mouthOffset.left}; width: ${mascot.mouthOffset.width}; height: ${mascot.mouthOffset.height};">
          <div class="mouth-3d-live-talking">
            <div class="mouth-3d-teeth-upper"></div>
            <div class="mouth-3d-inner"></div>
            <div class="mouth-3d-tongue-wave"></div>
          </div>
        </div>
      </div>
    `;
  }

  // Tạo khung thẻ Card chọn nhân vật 3D hình tròn vừa vặn
  getMascot3DCardHTML(personaKey) {
    const mascot = this.mascot3DAssets[personaKey] || this.mascot3DAssets.toby;
    return `
      <div class="card-circle-avatar-box">
        <img class="card-circle-img" src="${mascot.img3D}" alt="${mascot.name}">
      </div>
    `;
  }

  // Cập nhật trạng thái cử động (Nói, Lắng nghe, Suy nghĩ)
  setMascotState(containerElement, state) {
    if (!containerElement) return;

    if (state === 'speaking') {
      containerElement.classList.add('is-speaking');
      containerElement.classList.remove('is-listening', 'is-thinking');
    } else if (state === 'listening' || state === 'handsfree_on') {
      containerElement.classList.add('is-listening');
      containerElement.classList.remove('is-speaking', 'is-thinking');
    } else if (state === 'processing') {
      containerElement.classList.add('is-thinking');
      containerElement.classList.remove('is-speaking', 'is-listening');
    } else {
      containerElement.classList.remove('is-speaking', 'is-listening', 'is-thinking');
    }
  }
}

window.MascotRendererModule = MascotRendererModule;
