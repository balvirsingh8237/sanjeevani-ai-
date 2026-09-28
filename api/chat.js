export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'सिर्फ POST रिक्वेस्ट अलाउड है।' });
  }

  const { message } = req.body;
  // OpenAI की API Key ले रहे हैं
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Vercel में OPENAI_API_KEY सेट नहीं है!' });
  }

  const systemPrompt = "तुम 'संजीवनी AI' हो, एक मेडिकल असिस्टेंट। तुम्हें गांव के लोगों की स्वास्थ्य समस्याओं को समझना है और उन्हें सही सलाह देनी है। हमेशा हिंदी या आसान इंग्लिश में जवाब दो। तुम्हारे जवाब बहुत छोटे और मददगार होने चाहिए।";

  try {
    // ऑफिशियल OpenAI Endpoint
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // GPT-3.5 Turbo मॉडल (तेज़ और रिलायबल)
        model: "gpt-3.5-turbo", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'OpenAI ने एरर दिया है।' });
    }

    if (data.choices && data.choices[0].message && data.choices[0].message.content) {
      const reply = data.choices[0].message.content;
      return res.status(200).json({ reply });
    } else {
      return res.status(500).json({ error: 'OpenAI से खाली जवाब आया है।' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Vercel Server Error: ' + error.message });
  }
}
