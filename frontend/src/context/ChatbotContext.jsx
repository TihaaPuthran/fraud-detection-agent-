import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatbotContext = createContext(null);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
};

export const ChatbotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentContext, setCurrentContext] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const updateContext = useCallback((context) => {
    setCurrentContext(context);
    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  }, [isOpen]);

  const clearContext = useCallback(() => {
    setCurrentContext(null);
  }, []);

  const value = {
    isOpen,
    currentContext,
    unreadCount,
    openChat,
    closeChat,
    toggleChat,
    updateContext,
    clearContext,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotContext;
