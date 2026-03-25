import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  MessageCircle, X, Send, Bot, User, Sparkles, 
  ChevronDown, Loader2, Shield, Zap, Brain, AlertTriangle
} from 'lucide-react';
import { useChatbot } from '../context/ChatbotContext';

const SUGGESTED_QUESTIONS = [
  { icon: Shield, text: 'Why is this HIGH risk?', context: 'Why is this transaction flagged as HIGH risk?' },
  { icon: Brain, text: 'How does the model work?', context: 'How does the fraud detection model work?' },
  { icon: Zap, text: 'Explain this result simply', context: 'Explain this fraud analysis result in simple terms' },
  { icon: AlertTriangle, text: 'What factors increased the score?', context: 'What factors increased the fraud score?' },
  { icon: Sparkles, text: 'What should I do?', context: 'What should I do based on this risk level?' },
  { icon: Bot, text: 'What do the agents do?', context: 'What do the fraud detection agents do?' },
];

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hello! I'm your **Fraud Intelligence Copilot**. I can help you understand fraud predictions, explain risk levels, and answer questions about the detection system.\n\nAsk me anything about the current analysis or fraud detection in general!"
};

const ChatMessage = ({ message, isUser }) => {
  const formatContent = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-blue-400">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
            : 'bg-gradient-to-br from-cyan-500 to-blue-600'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-md' 
            : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-md'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {formatContent(message.content)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-md px-4 py-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SuggestedQuestion = ({ icon: Icon, text, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 hover:text-white transition-all"
  >
    <Icon className="w-4 h-4 text-cyan-400" />
    <span>{text}</span>
  </motion.button>
);

const Chatbot = () => {
  const { isOpen, currentContext, toggleChat, closeChat } = useChatbot();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const contextPayload = currentContext ? {
        fraud_probability: currentContext.anomaly_score,
        risk_level: currentContext.risk_level,
        model_confidence: currentContext.model_info?.confidence,
        recommendation: currentContext.recommendation,
        explanation: currentContext.explanation,
        key_factors: currentContext.key_factors,
        model_info: currentContext.model_info,
      } : null;

      const response = await axios.post('/chat', {
        message: text,
        context: contextPayload,
      });

      const assistantMessage = { 
        role: 'assistant', 
        content: response.data.response 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting to the analysis engine. Please try again." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedQuestion = (context) => {
    sendMessage(context);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
          </>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-[#0D1117]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Fraud Intelligence Copilot</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-white/50">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeChat}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Context Badge */}
            {currentContext && (
              <div className="px-4 py-2 bg-blue-500/10 border-b border-blue-500/20">
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-300">
                    Analysis context available: {currentContext.risk_level} risk ({currentContext.anomaly_score})
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <ChatMessage 
                  key={index} 
                  message={msg} 
                  isUser={msg.role === 'user'} 
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-white/40 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                    <SuggestedQuestion
                      key={i}
                      icon={q.icon}
                      text={q.text}
                      onClick={() => handleSuggestedQuestion(q.context)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about fraud analysis..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
