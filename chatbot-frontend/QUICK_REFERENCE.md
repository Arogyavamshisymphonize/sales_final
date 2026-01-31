# Quick Reference Card

## Project Structure
```
chatbot-frontend/
├── src/
│   ├── components/           # UI Components
│   │   ├── ChatSidebar.jsx   # Left sidebar with chat list
│   │   ├── ChatSidebar.css
│   │   ├── ChatInterface.jsx # Main chat area
│   │   └── ChatInterface.css
│   ├── contexts/
│   │   └── AuthContext.jsx   # Authentication state
│   ├── pages/
│   │   ├── Login.jsx         # Login page
│   │   ├── Signup.jsx        # Signup page
│   │   ├── Chat.jsx          # Main chat page
│   │   └── Auth.css          # Auth pages styles
│   ├── services/
│   │   └── api.js            # API integration
│   ├── App.jsx               # Main app with routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── SETUP_GUIDE.md
```

## Commands

### Development
```bash
npm install        # Install dependencies
npm run dev       # Start dev server (localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
```

### Backend Integration
Backend must be running on `http://localhost:8000`

## Key Files to Customize

### 1. Colors & Theme (`src/index.css`)
```css
:root {
  --accent-primary: #8b5cf6;    /* Main brand color */
  --bg-primary: #fafaf9;        /* Background */
  --text-primary: #1a1a1a;      /* Text color */
}
```

### 2. API Endpoint (`src/services/api.js`)
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### 3. Fonts (`index.html`)
```html
<link href="https://fonts.googleapis.com/css2?family=..." />
```

## Component Props

### ChatSidebar
```javascript
<ChatSidebar
  chats={[]}              // Array of chat objects
  activeChat={null}       // Currently selected chat
  onSelectChat={fn}       // (chat) => void
  onNewChat={fn}          // () => void
  onDeleteChat={fn}       // (chatId) => void
  onTogglePin={fn}        // (chatId, pinned) => void
/>
```

### ChatInterface
```javascript
<ChatInterface
  chat={null}             // Current chat object
/>
```

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/signup` | Create account |
| POST | `/login` | Authenticate |
| GET | `/chats` | List all chats |
| POST | `/chats` | Create new chat |
| PATCH | `/chats/{id}` | Update chat |
| DELETE | `/chats/{id}` | Delete chat |
| GET | `/chats/{id}/messages` | Get messages |
| POST | `/chats/{id}/messages` | Send message |
| POST | `/upload-doc` | Upload document |

## State Management

### Auth Context
```javascript
const { user, login, signup, logout, isAuthenticated } = useAuth();
```

### Local Storage Keys
- `token`: JWT access token
- `user`: User object (id, username, email)

## Common Tasks

### Add New Feature
1. Create component in `src/components/`
2. Add styles (`.css` file or inline)
3. Import in parent component
4. Add API call in `src/services/api.js` if needed

### Change Backend URL
Edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-api.com';
```

### Add Environment Variables
Create `.env`:
```
VITE_API_URL=http://localhost:8000
```

Use in code:
```javascript
const url = import.meta.env.VITE_API_URL;
```

## Styling Guidelines

### CSS Variables (Design Tokens)
- Colors: `--bg-*`, `--text-*`, `--accent-*`, `--border-*`
- Spacing: `--spacing-*` (xs to 3xl)
- Radius: `--radius-*` (sm, md, lg, full)
- Shadows: `--shadow-*` (sm, md, lg)

### Utility Classes
- `.animate-fade-in` - Fade in animation
- `.animate-slide-in` - Slide in animation
- `.sr-only` - Screen reader only

### Component Naming
- BEM-like: `.component-element__modifier`
- Example: `.chat-item`, `.chat-item.active`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Check backend allows `localhost:5173` |
| Login fails | Clear localStorage, check backend |
| Blank page | Check browser console for errors |
| Styles missing | Ensure CSS imports are correct |
| API 401 | Token expired, re-login |

## Performance Tips

1. **Lazy load routes** with `React.lazy()`
2. **Memoize** expensive computations with `useMemo`
3. **Debounce** search inputs
4. **Virtualize** long chat lists
5. **Code split** with dynamic imports

## Design Decisions

- **Typography**: Crimson Pro (headings) + DM Sans (body)
- **Color**: Purple accent (#8b5cf6) for brand
- **Layout**: Fixed sidebar + fluid content area
- **Animation**: Subtle, performant transitions
- **Mobile**: Responsive breakpoints (not shown, add as needed)

## Next Features to Add

1. Message search
2. Rich text editor
3. File preview
4. User settings
5. Dark mode toggle
6. Keyboard shortcuts
7. Notifications
8. Export chat history

---

**Built with**: React 18 + Vite + Lucide Icons
**Inspired by**: Claude's clean, minimalist interface
