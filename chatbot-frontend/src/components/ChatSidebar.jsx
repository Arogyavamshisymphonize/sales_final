import { Plus, MessageSquare, Pin, MoreVertical, Trash2, LogOut, Sparkles, Edit2, Check, X, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../services/api';
import './ChatSidebar.css';

export default function ChatSidebar({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onTogglePin,
  onRenameChat,
  onShowDocuments,
  showDocuments
}) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingChat, setEditingChat] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const menuRef = useRef(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingChat && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChat]);

  const handleStartRename = (chat) => {
    setEditingChat(chat.id);
    setEditTitle(chat.title);
    setMenuOpen(null);
  };

  const handleSaveRename = async (chatId) => {
    const newTitle = editTitle.trim();
    if (!newTitle || newTitle.length > 100) {
      setEditingChat(null);
      return;
    }

    try {
      await chatAPI.updateChat(chatId, { title: newTitle });
      if (onRenameChat) {
        onRenameChat(chatId, newTitle);
      }
      setEditingChat(null);
    } catch (error) {
      console.error('Failed to rename chat:', error);
      setEditingChat(null);
    }
  };

  const handleCancelRename = () => {
    setEditingChat(null);
    setEditTitle('');
  };

  const handleKeyDown = (e, chatId) => {
    if (e.key === 'Enter') {
      handleSaveRename(chatId);
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  const pinnedChats = chats.filter(c => c.pinned);
  const regularChats = chats.filter(c => !c.pinned);

  const ChatItem = ({ chat }) => {
    const isEditing = editingChat === chat.id;

    return (
      <div
        className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''} ${isEditing ? 'editing' : ''}`}
        onClick={() => !isEditing && onSelectChat(chat)}
      >
        <MessageSquare size={16} strokeWidth={2} />

        {isEditing ? (
          <>
            <input
              ref={editInputRef}
              type="text"
              className="chat-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, chat.id)}
              onClick={(e) => e.stopPropagation()}
              maxLength={100}
            />
            <button
              className="chat-action-button save"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveRename(chat.id);
              }}
              title="Save"
            >
              <Check size={14} />
            </button>
            <button
              className="chat-action-button cancel"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelRename();
              }}
              title="Cancel"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <span className="chat-title">{chat.title}</span>
            <button
              className="chat-menu-button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(menuOpen === chat.id ? null : chat.id);
              }}
            >
              <MoreVertical size={16} />
            </button>
          </>
        )}

        {menuOpen === chat.id && !isEditing && (
          <div className="chat-menu" ref={menuRef}>
            <button onClick={(e) => {
              e.stopPropagation();
              handleStartRename(chat);
            }}>
              <Edit2 size={14} />
              Rename
            </button>
            <button onClick={(e) => {
              e.stopPropagation();
              onTogglePin(chat.id, !chat.pinned);
              setMenuOpen(null);
            }}>
              <Pin size={14} />
              {chat.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              className="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
                setMenuOpen(null);
              }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <Sparkles size={24} strokeWidth={2} />
          <span>Marketing Agent</span>
        </div>
        <button className="new-chat-button" onClick={onNewChat}>
          <Plus size={18} />
          <span>New chat</span>
        </button>
      </div>

      <div className="sidebar-tools">
        <button
          className={`tool-button ${showDocuments ? 'active' : ''}`}
          onClick={onShowDocuments}
        >
          <FileText size={16} />
          <span>Documents</span>
        </button>
      </div>

      <div className="sidebar-content">
        {pinnedChats.length > 0 && (
          <div className="chat-section">
            <div className="section-header">
              <Pin size={14} />
              <span>Pinned</span>
            </div>
            {pinnedChats.map(chat => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        )}

        {regularChats.length > 0 && (
          <div className="chat-section">
            <div className="section-header">
              <span>Recent</span>
            </div>
            {regularChats.map(chat => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
          </div>
        )}

        {chats.length === 0 && (
          <div className="empty-state">
            <MessageSquare size={32} strokeWidth={1.5} />
            <p>No conversations yet</p>
            <span>Start a new chat to begin</span>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <Link to="/profile" className="user-info">
          <div className="user-avatar">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.username || 'User'}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </Link>
        <button className="logout-button" onClick={logout}>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
