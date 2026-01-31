# Complete Setup Guide

## Quick Start

### 1. Backend Setup (if not already running)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend should be running on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd chatbot-frontend
npm install
npm run dev
```

The frontend will open at `http://localhost:5173`

### 3. Create an Account

1. Navigate to `http://localhost:5173`
2. Click "Sign up"
3. Create an account with:
   - Username
   - Email
   - Password (min 6 characters)
4. You'll be automatically logged in

### 4. Start Chatting

- Click "New chat" to start a conversation
- Type your message and press Enter or click Send
- Upload documents using the paperclip icon
- Pin important chats for quick access
- Manage chats from the sidebar (rename, delete, pin)

## Features Walkthrough

### Authentication
- **Signup**: Create a new account
- **Login**: Access existing account
- **Session**: Token stored in localStorage
- **Logout**: Click user avatar → logout button

### Chat Management
- **New Chat**: Creates a fresh conversation
- **Pin Chat**: Keep important chats at the top
- **Delete Chat**: Remove unwanted conversations
- **Auto-titles**: Chats are titled "New Chat" by default

### Messaging
- **Send Messages**: Type and press Enter/Send
- **File Upload**: Attach documents (.txt, .md, .pdf, .doc, .docx)
- **Real-time**: Messages appear instantly
- **History**: All messages are persisted

### UI Features
- **Sidebar**: All your conversations in one place
- **Clean Interface**: Minimalist, distraction-free design
- **Responsive**: Works on desktop and mobile
- **Smooth Animations**: Polished interactions

## Troubleshooting

### Backend Connection Issues

**Problem**: "Network Error" or "Failed to fetch"

**Solutions**:
1. Check backend is running: `curl http://localhost:8000`
2. Verify CORS settings in `backend/app/main.py`:
   ```python
   allow_origins=["http://localhost:5173"]
   ```
3. Check browser console for specific errors

### Authentication Issues

**Problem**: "Login failed" or token errors

**Solutions**:
1. Clear localStorage: Open DevTools → Application → Local Storage → Clear
2. Check backend logs for authentication errors
3. Verify database connection in backend

### Messages Not Sending

**Problem**: Messages don't appear or show errors

**Solutions**:
1. Check chat is selected (highlighted in sidebar)
2. Verify backend `/chats/{id}/messages` endpoint works
3. Check network tab for API errors
4. Ensure chat_id is valid

### Styling Issues

**Problem**: Fonts not loading or styles broken

**Solutions**:
1. Check internet connection (Google Fonts)
2. Clear browser cache
3. Verify `index.css` is imported in `main.jsx`

## Development Tips

### Hot Reload
Vite provides instant hot reload. Changes to React components will reflect immediately without losing state.

### API Testing
Use the browser's Network tab (F12 → Network) to inspect API calls and responses.

### State Debugging
Install React DevTools browser extension to inspect component state and props.

### Code Structure
```
Frontend follows a modular structure:
- Components: Reusable UI elements
- Pages: Full page views
- Contexts: Global state management
- Services: API communication
```

## Customization Guide

### Change Theme Colors

Edit `src/index.css`:

```css
:root {
  /* Primary colors */
  --accent-primary: #8b5cf6;    /* Purple - change to your brand */
  --accent-hover: #7c3aed;
  
  /* Backgrounds */
  --bg-primary: #fafaf9;        /* Main background */
  --bg-secondary: #ffffff;      /* Cards, sidebar */
  
  /* Text */
  --text-primary: #1a1a1a;      /* Main text */
  --text-secondary: #525252;    /* Muted text */
}
```

### Change Fonts

1. Add Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

2. Update CSS:
```css
body {
  font-family: 'Your Font', sans-serif;
}
```

### Modify Layout

- **Sidebar width**: Change `.chat-sidebar { width: 280px }` in `ChatSidebar.css`
- **Message width**: Change `.message-content { max-width: 720px }` in `ChatInterface.css`
- **Spacing**: Adjust `--spacing-*` variables in `index.css`

### Add New Features

1. **Message reactions**: Add buttons in `ChatInterface.jsx`
2. **Typing indicators**: Already implemented, customize in CSS
3. **Read receipts**: Add timestamp logic in message component
4. **Search**: Add search input to sidebar, filter chats array

## Performance Optimization

### Production Build

```bash
npm run build
npm run preview  # Test production build locally
```

### Deployment

**Vercel** (recommended):
```bash
npm install -g vercel
vercel
```

**Netlify**:
```bash
npm run build
# Upload dist/ folder to Netlify
```

**Custom Server**:
```bash
npm run build
# Serve dist/ folder with nginx/apache
```

### Environment Variables

Create `.env` for different environments:

```env
VITE_API_URL=http://localhost:8000
```

Use in code:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

## Security Best Practices

1. **Token Storage**: Consider using httpOnly cookies instead of localStorage
2. **HTTPS**: Use HTTPS in production
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement on backend
5. **CSP Headers**: Add Content Security Policy

## Next Steps

- [ ] Add message search functionality
- [ ] Implement message editing
- [ ] Add user settings page
- [ ] Create admin dashboard
- [ ] Add analytics tracking
- [ ] Implement real-time updates with WebSockets
- [ ] Add file preview before upload
- [ ] Create mobile app (React Native)

## Support

For issues or questions:
1. Check backend logs
2. Check browser console
3. Review API responses in Network tab
4. Check this guide's troubleshooting section

Happy coding! 🚀
