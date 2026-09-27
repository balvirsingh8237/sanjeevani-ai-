export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'सिर्फ POST रिक्वेस्ट अलाउड है।' });
  }

  const { message } = req.body;
  // अब हम OpenRouter की Key ले रहे हैं
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Vercel में OPENROUTER_API_KEY सेट नहीं है!' });
  }

  const systemPrompt = "तुम 'संजीवनी AI' हो, एक मेडिकल असिस्टेंट। तुम्हें गांव के लोगों की स्वास्थ्य समस्याओं को समझना है और उन्हें सही सलाह देनी है। हमेशा हिंदी या आसान इंग्लिश में जवाब दो। तुम्हारे जवाब बहुत छोटे और मददगार होने चाहिए।";

  try {
    // OpenRouter का API Endpoint
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sanjeevani-ai-puce.vercel.app', // आपकी वेबसाइट का लिंक
        'X-Title': 'Sanjeevani AI'
      },
      body: JSON.stringify({
        // OpenRouter के जरिए Gemini का इस्तेमाल
        model: "google/gemini-1.5-flash", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // अगर API ने कोई एरर भेजा है
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'OpenRouter ने एरर दिया है।' });
    }

    // अगर सही जवाब आया है (OpenRouter का फॉर्मेट अलग होता है)
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
