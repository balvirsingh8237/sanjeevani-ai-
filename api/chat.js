export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'सिर्फ POST रिक्वेस्ट अलाउड है।' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Vercel में GEMINI_API_KEY सेट नहीं है!' });
  }

  const systemPrompt = "तुम 'संजीवनी AI' हो, एक मेडिकल असिस्टेंट। तुम्हें गांव के लोगों की स्वास्थ्य समस्याओं को समझना है और उन्हें सही सलाह देनी है। हमेशा हिंदी या आसान इंग्लिश में जवाब दो। तुम्हारे जवाब बहुत छोटे और मददगार होने चाहिए।";

  try {
    // यहाँ हमने सबसे स्टेबल डिफ़ॉल्ट मॉडल 'gemini-pro' लगा दिया है
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\nUser Message: " + message }] }
        ]
      })
    });

    const data = await response.json();
    
    // अगर फिर भी कोई एरर आता है, तो हम उसे सीधा फ्रंटएंड पर भेज देंगे
    if (data.error) {
       return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: 'सर्वर से संपर्क टूट गया।' });
  }
}
