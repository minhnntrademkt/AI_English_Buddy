// Vercel Serverless Function - Gateway Bảo Mật Server-Side (Ẩn API Key & Prompt)
export default async function handler(req, res) {
  // Bật CORS để cho phép Frontend gọi API an toàn
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { contents, apiKey: clientApiKey } = req.body;
  // Ưu tiên dùng API Key bí mật cài trên Vercel Environment Variable
  const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

  if (!apiKey) {
    return res.status(400).json({ error: 'Missing Gemini API Key in Vercel Environment Variables' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Vercel API Gateway Error:', error);
    return res.status(500).json({ error: 'Failed to communicate with AI model' });
  }
}
