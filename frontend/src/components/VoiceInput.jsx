import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceInput = ({ onTranscript, activeLanguage = 'en' }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  // Map language codes to Web Speech API locales for India
  const localeMap = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'te': 'te-IN',
    'mr': 'mr-IN'
  };

  const recognitionLanguage = localeMap[activeLanguage] || 'en-IN';

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, [SpeechRecognition]);

  const startListening = () => {
    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = recognitionLanguage;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          // Strip ending periods that Speech API often adds
          const cleaned = transcript.replace(/\.$/, '');
          onTranscript(cleaned);
        }
      };

      rec.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={startListening}
      className={`absolute right-2 top-0 bottom-0 my-auto flex items-center justify-center h-7 w-7 rounded-full transition-all focus:outline-none ${
        isListening
          ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-300'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-agri-green-dark'
      }`}
      title={isListening ? "Listening..." : "Search by voice"}
    >
      <Mic className={`h-4 w-4 ${isListening ? 'scale-110' : ''}`} />
    </button>
  );
};

export default VoiceInput;
