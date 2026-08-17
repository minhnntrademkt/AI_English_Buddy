# PROJECT CONTEXT: AI ENGLISH BUDDY FOR KIDS 🎈

Dự án ứng dụng giao tiếp tiếng Anh 1-1 cho trẻ em (từ Lớp 1 đến Lớp 9) tích hợp AI Buddy và Góc Phụ Huynh thấu hiểu tâm lý.

## Cấu Trúc Các File Mô-Đun (Single Responsibility - < 150 dòng/file)

- `config.js`: Cấu hình tham số API Keys, presets giọng nói và cài đặt độ trễ.
- `index.html`: Giao diện chính gồm Màn hình chọn nhân vật, Màn hình chat thoại 1-1 và Góc Phụ Huynh.
- `index.css`: Design system màu sắc sinh động, responsive, hiệu ứng chuyển động thân thiện với trẻ em.
- `js/audio_recorder.js`: Module thu âm giọng nói từ Micro bằng Web Audio API.
- `js/stt_service.js`: Module chuyển âm thanh giọng bé thành văn bản (Speech-to-Text).
- `js/llm_service.js`: Module gửi văn bản sang Gemini 2.0 Flash kèm System Prompt nhân vật (Toby 🐢 / Alex 🧗‍♂️ / Leo 🎧).
- `js/tts_service.js`: Module chuyển văn bản câu trả lời thành giọng nói phát ra loa (Text-to-Speech).
- `js/voice_controller.js`: Điều phối luồng đàm thoại 1-1 hai chiều.
- `js/sentiment_analyzer.js`: Phân tích chỉ số cảm xúc và trích xuất lời khuyên cho cha mẹ.
- `js/parent_dashboard.js`: Xử lý giao diện bảo mật mã PIN và hiển thị biểu đồ cảm xúc phụ huynh.
