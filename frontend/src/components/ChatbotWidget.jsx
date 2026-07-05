import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Mic } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const ChatbotWidget = () => {
  const { locale } = useLanguage();
  const { apiUrl } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);

  // Localization dictionaries for the assistant
  const botTranslations = {
    en: {
      botName: "KrishiBot Advisor",
      welcome: "Hello! I am your KrishiMarket advisor. How can I help you today?",
      placeholder: "Ask about crop prices, fertilizers, or listings...",
      suggestPrices: "Show crop prices",
      suggestFertilizer: "Best fertilizer for soil",
      suggestSell: "How do I list my crops?",
      offlineListingMsg: "You can post listings inside your Farmer Dashboard.",
      pricesHeader: "Current daily prices:",
      noPrices: "Could not retrieve prices for that crop.",
      typing: "KrishiBot is writing..."
    },
    hi: {
      botName: "कृषिबॉट सलाहकार",
      welcome: "नमस्ते! मैं आपका कृषि मार्केट सलाहकार हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
      placeholder: "फसल की कीमतों, उर्वरकों, या लिस्टिंग के बारे में पूछें...",
      suggestPrices: "फसल के दाम दिखाएं",
      suggestFertilizer: "मिट्टी के लिए सबसे अच्छा उर्वरक",
      suggestSell: "मैं अपनी फसलें कैसे बेचूं?",
      offlineListingMsg: "आप अपने किसान डैशबोर्ड के अंदर लिस्टिंग पोस्ट कर सकते हैं।",
      pricesHeader: "वर्तमान दैनिक कीमतें:",
      noPrices: "उस फसल की कीमत की जानकारी नहीं मिल सकी।",
      typing: "कृषिबॉट लिख रहा है..."
    },
    te: {
      botName: "కృషిబాట్ సలహాదారు",
      welcome: "నమస్తే! నేను మీ కృషిమార్కెట్ సలహాదారుని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
      placeholder: "మార్కెట్ ధరలు, ఎరువులు లేదా పంటల గురించి అడగండి...",
      suggestPrices: "పంట ధరలు చూపించు",
      suggestFertilizer: "నేలకు ఉత్తమ ఎరువులు ఏవి?",
      suggestSell: "నా పంటను ఎలా అమ్మాలి?",
      offlineListingMsg: "మీరు మీ రైతు డ్యాష్‌బోర్డ్ లో పంటల వివరాలను చేర్చవచ్చు.",
      pricesHeader: "ప్రస్తుత మార్కెట్ ధరలు:",
      noPrices: "ఆ పంటకు సంబంధించిన ధరల సమాచారం లభించలేదు.",
      typing: "కృషిబాట్ టైప్ చేస్తోంది..."
    },
    mr: {
      botName: "कृषिबॉट सल्लागार",
      welcome: "नमस्कार! मी तुमचा कृषि मार्केट सल्लागार आहे. आज मी तुम्हाला काय मदत करू शकतो?",
      placeholder: "पीक दर, खते किंवा विक्रीबद्दल विचारा...",
      suggestPrices: "पिकांचे दर दाखवा",
      suggestFertilizer: "मातीसाठी सर्वोत्तम खत कोणते?",
      suggestSell: "मी माझी पिके कशी विकू?",
      offlineListingMsg: "तुम्ही तुमच्या शेतकरी डॅशबोर्डमध्ये पिकांची नोंदणी करू शकता.",
      pricesHeader: "सध्याचे बाजार भाव:",
      noPrices: "त्या पिकाच्या दराची माहिती उपलब्ध नाही.",
      typing: "कृषिबॉट लिहीत आहे..."
    }
  };

  const t = botTranslations[locale] || botTranslations.en;

  useEffect(() => {
    // Reset welcome message when language changes
    setMessages([
      { id: 1, sender: 'bot', text: t.welcome }
    ]);
  }, [locale]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    // Add user message
    const userMessage = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');
    setIsTyping(true);

    // AI/Contextual Logic simulation
    setTimeout(async () => {
      let botResponseText = "";
      const textLower = query.toLowerCase();

      // 1. Handle price search queries
      const cropMatches = ["wheat", "rice", "corn", "coconut", "potato", "onion", "tomato", "chilli"].filter(
        c => textLower.includes(c) || (locale === 'hi' && c === 'wheat' && textLower.includes('गेहूं'))
      );

      if (textLower.includes('price') || textLower.includes('भाव') || textLower.includes('दर') || textLower.includes('ధర') || cropMatches.length > 0) {
        let cropSearch = 'Wheat'; // default fallback
        if (cropMatches.length > 0) {
          cropSearch = cropMatches[0];
        } else if (textLower.includes('rice') || textLower.includes('धान')) {
          cropSearch = 'Rice';
        } else if (textLower.includes('corn') || textLower.includes('मक्का')) {
          cropSearch = 'Corn';
        } else if (textLower.includes('coconut') || textLower.includes('नारळ') || textLower.includes('కొబ్బరి')) {
          cropSearch = 'Coconut';
        }

        try {
          const res = await fetch(`${apiUrl}/markets/compare/prices?cropName=${cropSearch}`);
          const data = await res.json();
          if (data.success && data.data.length > 0) {
            const priceLines = data.data.map(m => `📍 ${m.marketName} (${m.district}): ₹${m.priceMin} - ₹${m.priceMax} / ${m.unit}`);
            botResponseText = `${t.pricesHeader} ${cropSearch.toUpperCase()}\n` + priceLines.join('\n');
          } else {
            botResponseText = `I checked the boards. ${t.noPrices} (${cropSearch})`;
          }
        } catch (e) {
          botResponseText = `Error querying market database for ${cropSearch}. Please visit the Market Prices page.`;
        }
      } 
      // 2. Handle fertilizer suggestions
      else if (textLower.includes('fertilizer') || textLower.includes('खत') || textLower.includes('ఎరువు')) {
        botResponseText = "To get exact fertilizer advice for your crop and soil, please visit the 🧪 Fertilizer Tool page. Commonly, Coconut on Laterite Soil needs Muriate of Potash, and Wheat on Alluvial Soil needs NPK (120:60:40).";
      }
      // 3. Handle selling crops
      else if (textLower.includes('sell') || textLower.includes('बेच') || textLower.includes('विक') || textLower.includes('అమ్మ')) {
        botResponseText = `${t.offlineListingMsg} Direct trade is verified by mandi/market admins.`;
      }
      // General agricultural advice fallback
      else {
        if (locale === 'hi') {
          botResponseText = "मैं कृषि मार्केट, लाइव मंडी की कीमतों और फसलों के लिए खाद संबंधी जानकारी दे सकता हूँ। कृपया अपनी आवश्यकता बताएं!";
        } else if (locale === 'te') {
          botResponseText = "నేను పంట ధరలు, ఎరువుల వివరాలు మరియు పంట అమ్మకాల సమాచారాన్ని అందించగలను. దయచేసి మీ సందేహాన్ని అడగండి!";
        } else if (locale === 'mr') {
          botResponseText = "मी तुम्हाला पिकांचे बाजार भाव, खते आणि पीक विक्रीबाबत मदत करू शकतो. कृपया तुमचा प्रश्न विचारा!";
        } else {
          botResponseText = "I can guide you with real-time market prices, fertilizer dosages, and how to list your crops for sale. Ask me anything about KrishiMarket!";
        }
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponseText }]);
      setIsTyping(false);
    }, 1000);
  };

  // Micro-speech input trigger inside chatbot
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const localeMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', mr: 'mr-IN' };
    const rec = new SpeechRecognition();
    rec.lang = localeMap[locale] || 'en-IN';
    
    rec.onstart = () => setListening(true);
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (transcript) {
        setInputMsg(transcript.replace(/\.$/, ''));
      }
    };
    rec.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating launcher trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-agri-green hover:bg-agri-green-dark text-white flex items-center justify-center shadow-lg transition duration-300 transform hover:scale-110 active:scale-95 animate-bounce"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Floating Chat Draw panel */}
      {isOpen && (
        <div className="bg-white rounded-3xl border border-agri-green-light w-80 sm:w-96 h-[500px] shadow-2xl flex flex-col overflow-hidden animate-fade-in relative backdrop-blur-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-agri-green-dark to-agri-green-medium p-4 text-white flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                🌾
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">{t.botName}</h3>
                <span className="text-[10px] text-agri-green-light font-bold flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300 inline-block mr-1 animate-pulse" />
                  Online Expert
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Message List area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar icon */}
                <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  m.sender === 'user' ? 'bg-agri-green text-white' : 'bg-agri-soil-dark text-white'
                }`}>
                  {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Message Bubble text */}
                <div className={`rounded-2xl px-3 py-2 text-xs max-w-[75%] shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-agri-green-dark text-white rounded-tr-none'
                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none whitespace-pre-line'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-xs text-gray-400 font-semibold italic animate-pulse pl-9">
                <Bot className="h-3.5 w-3.5" />
                <span>{t.typing}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Click Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-gray-50 flex flex-wrap gap-1.5 border-t border-gray-100">
              <button
                onClick={() => handleSend(t.suggestPrices)}
                className="text-[10px] bg-white hover:bg-agri-green-light border border-gray-200 hover:border-agri-green-medium px-2 py-1 rounded-full text-agri-soil-dark font-bold transition"
              >
                📊 {t.suggestPrices}
              </button>
              <button
                onClick={() => handleSend(t.suggestFertilizer)}
                className="text-[10px] bg-white hover:bg-agri-green-light border border-gray-200 hover:border-agri-green-medium px-2 py-1 rounded-full text-agri-soil-dark font-bold transition"
              >
                🧪 {t.suggestFertilizer}
              </button>
              <button
                onClick={() => handleSend(t.suggestSell)}
                className="text-[10px] bg-white hover:bg-agri-green-light border border-gray-200 hover:border-agri-green-medium px-2 py-1 rounded-full text-agri-soil-dark font-bold transition"
              >
                🌾 {t.suggestSell}
              </button>
            </div>
          )}

          {/* Chat Input form footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-gray-100 flex items-center space-x-2 bg-white"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={t.placeholder}
                className="w-full h-10 border border-gray-200 rounded-full pl-3 pr-9 text-xs focus:outline-none focus:border-agri-green"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2 top-0 bottom-0 my-auto h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                  listening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                }`}
                title="Voice input"
              >
                <Mic className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="submit"
              className="h-10 w-10 rounded-full bg-agri-green hover:bg-agri-green-dark text-white flex items-center justify-center transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
