import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Send, User, MessageSquare, Loader2, Sparkles } from 'lucide-react';

const Messages = () => {
  const { t } = useLanguage();
  const { user, token, apiUrl } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [inbox, setInbox] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const listingIdQuery = queryParams.get('listingId');

  const fetchInbox = async (selectListingId = null) => {
    try {
      const res = await fetch(`${apiUrl}/listings/messages/inbox`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setInbox(data.data);

        // If a listingId was specified in query, try selecting that thread
        const idToSelect = selectListingId || listingIdQuery;
        if (idToSelect) {
          const thread = data.data.find(t => t.listingId.toString() === idToSelect.toString());
          if (thread) {
            setActiveThread(thread);
          } else {
            // If it's a new conversation, fetch the listing details to start a mock thread
            try {
              const listRes = await fetch(`${apiUrl}/listings`);
              const listData = await listRes.json();
              if (listData.success) {
                const target = listData.data.find(l => l._id.toString() === idToSelect.toString());
                if (target) {
                  const newThread = {
                    listingId: target._id,
                    cropType: target.cropType,
                    expectedPrice: target.expectedPrice,
                    unit: target.unit,
                    otherParty: user.role === 'farmer' ? { name: 'Buyer' } : target.farmer,
                    messages: [],
                    lastUpdated: new Date()
                  };
                  setActiveThread(newThread);
                }
              }
            } catch (err) {
              console.error(err);
            }
          }
        } else if (data.data.length > 0 && !activeThread) {
          // Select first by default
          setActiveThread(data.data[0]);
        }
      }
    } catch (err) {
      console.error("Error loading chat inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [apiUrl, token, listingIdQuery]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThread) return;

    setSendLoading(true);
    const bodyData = {
      text: inputText,
      buyerId: user.role === 'farmer' ? activeThread.otherParty._id : user._id
    };

    try {
      const res = await fetch(`${apiUrl}/listings/${activeThread.listingId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        setInputText('');
        // Reload inbox and select same thread to get updated conversation list
        await fetchInbox(activeThread.listingId);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agri-green" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl bg-white rounded-3xl border border-agri-green-light shadow-md overflow-hidden flex h-[78vh]">
      
      {/* Sidebar: Threads list */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="font-extrabold text-base sm:text-lg text-agri-soil-dark flex items-center">
            <MessageSquare className="h-5 w-5 text-agri-green mr-2" />
            {t('conversations')}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {inbox.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              No active negotiations. Browse listings to contact farmers!
            </div>
          ) : (
            inbox.map((t, idx) => {
              const isSelected = activeThread?.listingId === t.listingId;
              const lastMsg = t.messages[t.messages.length - 1];
              return (
                <button
                  key={idx}
                  onClick={() => setActiveThread(t)}
                  className={`w-full p-4 text-left flex items-start space-x-3 transition ${
                    isSelected ? 'bg-agri-green-light/40 border-l-4 border-agri-green' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mt-0.5">🌾</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-xs sm:text-sm text-agri-soil-dark truncate">
                        {t.cropType} lot ({t.otherParty?.name})
                      </h4>
                    </div>
                    <p className="text-[10px] text-gray-400">₹{t.expectedPrice}/{t.unit}</p>
                    {lastMsg && (
                      <p className="text-xs text-gray-500 truncate mt-1.5">
                        {lastMsg.sender === user._id ? 'You: ' : ''}{lastMsg.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 flex flex-col bg-white">
        {activeThread ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-agri-soil-dark">
                  Negotiating: {activeThread.cropType}
                </h3>
                <p className="text-xs text-gray-500">
                  With {activeThread.otherParty?.name} | Expected Price: ₹{activeThread.expectedPrice}/{activeThread.unit}
                </p>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f6f8f5]/40">
              {activeThread.messages.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-12">
                  No messages yet. Send a message to start negotiation.
                </div>
              ) : (
                activeThread.messages.map((m, idx) => {
                  const isMe = m.sender === user._id || (m.sender?._id === user._id);
                  return (
                    <div
                      key={idx}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3.5 rounded-2xl shadow-sm text-xs sm:text-sm ${
                          isMe
                            ? 'bg-agri-green text-white rounded-tr-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                        }`}
                      >
                        {!isMe && (
                          <span className="block text-[9px] font-bold text-agri-green-dark uppercase mb-1">
                            {activeThread.otherParty?.name}
                          </span>
                        )}
                        <p>{m.text}</p>
                        <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-agri-green-light' : 'text-gray-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('typeMessage')}
                className="flex-1 h-12 border border-gray-300 rounded-xl px-4 text-sm focus:border-agri-green focus:outline-none"
              />
              <button
                type="submit"
                disabled={sendLoading || !inputText.trim()}
                className="flex h-12 w-12 items-center justify-center bg-agri-green hover:bg-agri-green-dark text-white rounded-xl shadow-sm transition tap-effect active:scale-95 disabled:bg-gray-200"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/20">
            <MessageSquare className="h-16 w-16 text-gray-300 mb-3 animate-pulse" />
            <h3 className="font-extrabold text-lg text-agri-soil-dark">No Active Conversation</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-xs">
              Select an existing thread from the left, or open listings to message a producer.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;
