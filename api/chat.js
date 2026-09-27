export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'सिर्फ POST रिक्वेस्ट अलाउड है।' });
  }

  const { message } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Vercel में OPENROUTER_API_KEY सेट नहीं है!' });
  }

  const systemPrompt = "तुम 'संजीवनी AI' हो, एक मेडिकल असिस्टेंट। तुम्हें गांव के लोगों की स्वास्थ्य समस्याओं को समझना है और उन्हें सही सलाह देनी है। हमेशा हिंदी या आसान इंग्लिश में जवाब दो। तुम्हारे जवाब बहुत छोटे और मददगार होने चाहिए।";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sanjeevani-ai-puce.vercel.app',
        'X-Title': 'Sanjeevani AI'
      },
      body: JSON.stringify({
        // 100% फ्री Google Gemma मॉडल
        model: "google/gemma-2-9b-it:free", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'OpenRouter ने एरर दिया है।' });
    }

    if (data.choices && data.choices[0].message && data.choices[0].message.content) {
      const reply = data.choices[0].message.content;
      return res.status(200).json({ reply });
    } else {
      return res.status(500).json({ error: 'OpenRouter से खाली जवाब आया है।' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Vercel Server Error: ' + error.message });
  }
}
