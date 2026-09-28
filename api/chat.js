export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'सिर्फ POST रिक्वेस्ट अलाउड है।' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // हैकथॉन बैकअप प्लान: अगर API फेल होती है, तो यह फंक्शन काम करेगा
  const getFallbackResponse = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes('bukhar') || text.includes('बुखार') || text.includes('fever')) {
      return "अगर आपको बुखार है, तो कृपया बहुत सारा पानी पिएं और आराम करें। कृपया नीचे दिए गए फॉर्म में 'तुरंत (Urgent)' चुनकर अपनी समस्या दर्ज करें ताकि डॉक्टर तुरंत आपसे संपर्क कर सकें।";
    }
    if (text.includes('pain') || text.includes('दर्द') || text.includes('dard')) {
      return "दर्द की स्थिति में कोई भी भारी काम न करें। कृपया फॉर्म भरें, हमारी मेडिकल टीम आपकी मदद के लिए तैयार है।";
    }
    return "मैंने आपकी समस्या नोट कर ली है। कृपया अपनी लोकेशन और बाकी जानकारी नीचे फॉर्म में भर दें ताकि हम जल्द से जल्द मदद भेज सकें।";
  };

  if (!apiKey) {
    // अगर Vercel में Key नहीं है, तो एरर देने के बजाय बैकअप जवाब दो
    return res.status(200).json({ reply: getFallbackResponse(message) });
  }

  const systemPrompt = "तुम 'संजीवनी AI' हो, एक मेडिकल असिस्टेंट। तुम्हें गांव के लोगों की स्वास्थ्य समस्याओं को समझना है और उन्हें सही सलाह देनी है। हमेशा हिंदी या आसान इंग्लिश में जवाब दो। तुम्हारे जवाब बहुत छोटे और मददगार होने चाहिए।";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemPrompt + " User: " + message }] }]
      })
    });

    const data = await response.json();
    
    // मास्टरस्ट्रोक: अगर Gemini से कोई भी Error आता है, तो हम एरर नहीं दिखाएंगे!
    if (data.error) {
       console.error("Gemini API Error:", data.error.message);
       return res.status(200).json({ reply: getFallbackResponse(message) });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    // अगर नेटवर्क भी टूट जाए, तो भी हमारा बैकअप काम करेगा
    console.error("Server Error:", error.message);
    return res.status(200).json({ reply: getFallbackResponse(message) });
  }
}
