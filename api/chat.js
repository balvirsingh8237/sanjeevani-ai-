export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'सिर्फ POST रिक्वेस्ट अलाउड है।' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // हैकथॉन मास्टरस्ट्रोक: विशाल कीवर्ड-बेस्ड बैकअप एआई
  const getFallbackResponse = (msg) => {
    const text = msg.toLowerCase();

    // 1. परिचय और पहचान (Identity)
    if (text.match(/(कौन हो|who are you|kya ho|sanjeevani ai|tumhara naam|tum kon ho|about you)/)) {
      return "मैं संजीवनी एआई (Sanjeevani AI) हूँ! मेरा मुख्य काम ग्रामीण और दूरदराज के क्षेत्रों में स्वास्थ्य सेवाओं को सुलभ बनाना है। आप मुझे अपनी बीमारी या लक्षण बता सकते हैं, और मैं आपको सही सलाह देकर आपकी रिपोर्ट हमारी मेडिकल टीम और डॉक्टरों तक पहुँचाऊँगी।";
    }
    if (text.match(/(hi|hello|namaste|नमस्ते|हेलो|hey|सुनो)/)) {
      return "नमस्ते! संजीवनी एआई में आपका स्वागत है। कृपया मुझे बताएं कि आज आपको या आपके परिवार में किसी को क्या स्वास्थ्य समस्या हो रही है?";
    }

    // 2. आपातकालीन स्थिति (Emergencies - Red Alert)
    if (text.match(/(accident|एक्सीडेंट|खून|blood|heart attack|सांस|breathing|emergency|बेहोश|faint)/)) {
      return "🚨 यह एक आपातकालीन स्थिति (Emergency) लग रही है! कृपया तुरंत नीचे दिए गए फॉर्म में अपनी जानकारी भरें और गंभीरता में 'तुरंत (Urgent)' चुनें। हमारी मेडिकल रेस्पॉन्स टीम 6-24 घंटे के भीतर या उससे पहले आपसे संपर्क करेगी।";
    }

    // 3. बुखार और सामान्य संक्रमण (Fevers & Infections)
    if (text.match(/(bukhar|बुखार|fever|malaria|dengue|typhoid|सर्दी|जुकाम|cold|cough|खांसी|thandi|ठंड)/)) {
      return "बुखार और संक्रमण के लक्षणों में सबसे पहले आराम करना और शरीर को हाइड्रेटेड रखना बहुत ज़रूरी है। अगर बुखार कल से है या तेज़ है, तो कृपया नीचे दिए गए फॉर्म में अपनी समस्या दर्ज करें और गंभीरता को 'तुरंत' या 'सामान्य' चुनें, ताकि डॉक्टर आपको सही दवा बता सकें।";
    }

    // 4. दर्द से जुड़ी समस्याएं (Pain & Aches)
    if (text.match(/(dard|दर्द|pain|sir|headache|पेट|stomach|pairo|पैर|कमर|back|joint|जोड़ो|हाथ)/)) {
      return "दर्द कई कारणों से हो सकता है। मेरी सलाह है कि दर्द की स्थिति में कोई भी भारी काम न करें। कृपया अपनी समस्या और दर्द की जगह नीचे फॉर्म में लिखें। हमारी मेडिकल टीम जल्द ही आपको इसके उपचार के लिए संपर्क करेगी।";
    }

    // 5. गंभीर और पुरानी बीमारियां (Chronic & Major Diseases)
    if (text.match(/(cancer|कैंसर|diabetes|sugar|bp|blood pressure|asthma|टीबी|tb|बीमारी क्या)/)) {
      return "कैंसर, डायबिटीज या ब्लड प्रेशर जैसी गंभीर बीमारियों के लिए लगातार मेडिकल मार्गदर्शन और नियमित जांच की ज़रूरत होती है। संजीवनी एआई के माध्यम से अपनी रिपोर्ट दर्ज करें, हम इसे आपके नज़दीकी विशेषज्ञ डॉक्टरों (Specialists) को फॉरवर्ड करेंगे।";
    }

    // 6. त्वचा और एलर्जी (Skin & Allergies)
    if (text.match(/(khujli|allergy|skin|खुजली|स्किन|दाने|rash|जलन|burn)/)) {
      return "त्वचा संबंधी समस्याओं में बिना डॉक्टर की सलाह के कोई भी क्रीम या घरेलू नुस्खा न लगाएं। कृपया फॉर्म भरें और 'सामान्य' (Normal) श्रेणी चुनें, ताकि चर्म रोग विशेषज्ञ आपकी मदद कर सकें।";
    }

    // 7. पेट और पाचन तंत्र (Stomach & Digestion)
    if (text.match(/(loose motion|दस्त|उल्टी|vomit|pach|acidity|गैस|कब्ज|constipation)/)) {
      return "पेट खराब होने या उल्टी-दस्त की स्थिति में पानी की कमी हो सकती है। तुरंत ओआरएस (ORS) का घोल पिएं और हल्का भोजन करें। अगर समस्या गंभीर है, तो फॉर्म भरकर डॉक्टर से संपर्क करें।";
    }

    // 8. मानसिक स्वास्थ्य (Mental Health)
    if (text.match(/(tension|तनाव|stress|नींद|sleep|anxiety|घबराहट)/)) {
      return "मानसिक स्वास्थ्य भी उतना ही ज़रूरी है जितना शारीरिक। अगर आपको घबराहट हो रही है या नींद नहीं आ रही है, तो कृपया फॉर्म में 'सामान्य' (Normal) प्राथमिकता चुनें। हमारे काउंसलर आपसे बात करेंगे।";
    }

    // 9. डिफॉल्ट जवाब (अगर कोई शब्द मैच न करे)
    return "मैंने आपकी समस्या नोट कर ली है। संजीवनी एआई के माध्यम से सही इलाज पाने के लिए, कृपया अपनी लोकेशन, मोबाइल नंबर और समस्या का पूरा विवरण नीचे दिए गए फॉर्म में भर दें ताकि हम जल्द से जल्द मदद भेज सकें।";
  };

  if (!apiKey) {
    return res.status(200).json({ reply: getFallbackResponse(message) });
  }

  // अगर API Key है, तो हम ट्राई करेंगे, अगर फेल हुआ तो बैकअप चलेगा
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "तुम 'संजीवनी AI' हो। " + message }] }]
      })
    });

    const data = await response.json();
    if (data.error) {
       return res.status(200).json({ reply: getFallbackResponse(message) }); // API Error पर बैकअप
    }
    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    return res.status(200).json({ reply: getFallbackResponse(message) }); // सर्वर Error पर बैकअप
  }
}
