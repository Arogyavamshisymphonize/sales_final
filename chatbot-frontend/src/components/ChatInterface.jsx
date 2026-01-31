import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatAPI } from '../services/api';
import './ChatInterface.css';

export default function ChatInterface({ chat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chat) {
      loadMessages();
    }
  }, [chat?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const data = await chatAPI.getMessages(chat.id);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message optimistically
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await chatAPI.sendMessage(chat.id, userMessage);

      // Add assistant response
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.assistant_response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const result = await chatAPI.uploadDocument(file);

      // Add file upload notification as a message
      const fileMsg = {
        id: `file-${Date.now()}`,
        role: 'system',
        content: `📎 Uploaded: ${result.filename} (${result.character_count} characters)`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fileMsg]);

      // Optionally, you can auto-send the content or just notify
      setInput(`Here's the document content:\n\n${(result.summary || '').substring(0, 500)}...`);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!chat) {
    return (
      <div className="chat-interface">
        <div className="empty-chat">
          <Sparkles size={48} strokeWidth={1.5} />
          <h2>Welcome to Marketing Agent</h2>
          <p>Start a new conversation or select an existing one from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>{chat.title}</h2>
      </div>

      <div className="messages-container">
        {messages.map((message, idx) => (
          <div
            key={message.id || idx}
            className={`message ${message.role}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? (
                <User size={18} strokeWidth={2} />
              ) : message.role === 'assistant' ? (
                <Sparkles size={18} strokeWidth={2} />
              ) : (
                <span>📎</span>
              )}
            </div>
            <div className="message-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <form onSubmit={handleSend} className="input-form">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".txt,.md,.pdf,.doc,.docx"
          />
          <button
            type="button"
            className="attach-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
          >
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Marketing Agent..."
            className="message-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || loading}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
