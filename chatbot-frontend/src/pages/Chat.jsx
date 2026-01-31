import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatSidebar from '../components/ChatSidebar';
import ChatInterface from '../components/ChatInterface';
import DocumentList from '../components/DocumentList';
import { chatAPI } from '../services/api';
import './Chat.css';

export default function Chat() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadChats();
  }, [isAuthenticated, navigate]);

  const loadChats = async () => {
    try {
      const data = await chatAPI.listChats();
      setChats(data);
      if (data.length > 0 && !activeChat && !showDocuments) {
        setActiveChat(data[0]);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setShowDocuments(false);
  };

  const handleShowDocuments = () => {
    setActiveChat(null);
    setShowDocuments(true);
  };

  const handleNewChat = async () => {
    try {
      const newChat = await chatAPI.createChat();
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      await chatAPI.deleteChat(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (activeChat?.id === chatId) {
        setActiveChat(chats.find(c => c.id !== chatId) || null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleTogglePin = async (chatId, pinned) => {
    try {
      await chatAPI.updateChat(chatId, { pinned });
      setChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, pinned } : c
      ));
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const handleRenameChat = (chatId, newTitle) => {
    setChats(prev => prev.map(c =>
      c.id === chatId ? { ...c, title: newTitle } : c
    ));
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        showDocuments={showDocuments}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onTogglePin={handleTogglePin}
        onRenameChat={handleRenameChat}
        onShowDocuments={handleShowDocuments}
      />
      {showDocuments ? (
        <div className="chat-interface empty">
          <DocumentList />
        </div>
      ) : (
        <ChatInterface chat={activeChat} />
      )}
    </div>
  );
}
