# Marketing Agent Frontend

A modern, Claude-inspired chat interface for your marketing agent chatbot.

## Features

- 🎨 Clean, modern UI inspired by Claude
- 🔐 Authentication (Login/Signup)
- 💬 Real-time chat interface
- 📝 Chat history management
- 📌 Pin important conversations
- 📎 Document upload support
- 📱 Responsive design

## Tech Stack

- React 18
- React Router for navigation
- Axios for API calls
- Lucide React for icons
- Vite for fast development

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ChatSidebar.jsx
│   └── ChatInterface.jsx
├── contexts/         # React contexts
│   └── AuthContext.jsx
├── pages/           # Page components
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Chat.jsx
├── services/        # API services
│   └── api.js
├── App.jsx          # Main app component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## API Integration

The frontend connects to your FastAPI backend at `http://localhost:8000`. Make sure:

1. Backend is running
2. CORS is configured to allow `http://localhost:5173`
3. All required endpoints are available:
   - POST `/signup`
   - POST `/login`
   - GET `/chats`
   - POST `/chats`
   - PATCH `/chats/{chat_id}`
   - DELETE `/chats/{chat_id}`
   - GET `/chats/{chat_id}/messages`
   - POST `/chats/{chat_id}/messages`
   - POST `/upload-doc`

## Design Philosophy

This interface is inspired by Claude's clean, minimalist design:

- **Typography**: Crimson Pro for headings, DM Sans for body text
- **Colors**: Soft neutrals with purple accents
- **Layout**: Sidebar navigation with centered chat interface
- **Interactions**: Smooth transitions and micro-animations
- **Accessibility**: Proper semantic HTML and ARIA labels

## Customization

### Colors

Edit CSS variables in `src/index.css`:

```css
:root {
  --accent-primary: #8b5cf6;  /* Main accent color */
  --bg-primary: #fafaf9;      /* Main background */
  /* ... other variables */
}
```

### Fonts

Change fonts in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

Then update in CSS:

```css
body {
  font-family: 'Your Font', sans-serif;
}
```

## License

MIT
