# PROJECT CONTEXT: AI ENGLISH BUDDY FOR KIDS 🎈

Dự án ứng dụng giao tiếp tiếng Anh 1-1 cho trẻ em (từ Lớp 1 đến Lớp 9) tích hợp AI Buddy và Góc Phụ Huynh thấu hiểu tâm lý.

## Cấu Trúc Các File Mô-Đun (Single Responsibility - < 150 dòng/file)

- `config.js`: Cấu hình tham số API Keys, presets giọng nói và cài đặt độ trễ.
- `index.html`: Giao diện chính người dùng & phụ huynh chuẩn Mochidemy (Hero Banner, 3 Trụ Cột, FAQ Accordion, Sân Khấu Mascot 3D Tương Tác & Chat).
- `admin.html`: Trang quản trị độc lập (đường dẫn `/admin`) dành riêng cho Founder/Admin phân tích doanh thu MRR, 3 Tab quản trị và phân quyền gói cước.
- `vercel.json`: Cấu hình routing /admin sang admin.html và hỗ trợ API chat serverless.
- `index.css`: Design system phong cách Mochidemy vàng gold ấm áp, nút 3D gamified, hoạt hình mấp máy môi (Lip-sync), chớp mắt tự nhiên.
- `js/mascot_renderer.js`: Module đồ họa dựng 3 nhân vật Mascot 3D (Toby rùa, Alex thám hiểm, Leo teen), xử lý cử động miệng khớp giọng nói AI và mắt chớp.
- `js/admin_service.js`: Quản trị hệ thống, cấp quyền, phân quyền gói cước (Kids Starter 299k, Teen Pro 499k) và quản lý phụ huynh.
- `js/parent_dashboard.js`: Xử lý giao diện bảo mật mã PIN cá nhân và hiển thị báo cáo cảm xúc phụ huynh (tối giản không có nhập API Key).
