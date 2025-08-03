# Standalone Chatbot Integration Guide

## Overview
This is a completely self-contained chatbot component that you can easily integrate into any website. It requires only React and has no external dependencies.

## Quick Start

### 1. Copy the Component
Copy the entire `StandaloneChatbot.tsx` file to your project.

### 2. Basic Usage
```jsx
import { StandaloneChatbot } from './StandaloneChatbot';

function App() {
  return (
    <div>
      {/* Your existing website content */}
      <h1>My Website</h1>
      
      {/* Add the chatbot - it will appear as a floating widget */}
      <StandaloneChatbot 
        webhookUrl="https://your-webhook-url.com/webhook"
      />
    </div>
  );
}
```

### 3. Configuration Options
```jsx
<StandaloneChatbot 
  webhookUrl="https://your-webhook-url.com/webhook"  // Required: Your chatbot API endpoint
  title="Customer Support"                           // Optional: Chat header title
  subtitle="We're here to help!"                    // Optional: Chat header subtitle  
  primaryColor="#ff6b6b"                            // Optional: Brand color (hex)
  autoOpenDelay={3000}                              // Optional: Auto-open delay in ms (default: 2000)
  position="bottom-left"                            // Optional: 'bottom-right' or 'bottom-left' (default: 'bottom-right')
/>
```

## Integration Examples

### React Project
```jsx
// App.jsx
import React from 'react';
import { StandaloneChatbot } from './components/StandaloneChatbot';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Welcome to My Site</h1>
      </header>
      
      <main>
        {/* Your content here */}
      </main>
      
      {/* Chatbot will float in bottom-right corner */}
      <StandaloneChatbot 
        webhookUrl="https://alpharc.app.n8n.cloud/webhook/9b07fb75-bc10-4c31-ae17-2055bbcc5018"
        title="AI Assistant"
        subtitle="Ask me anything!"
        primaryColor="#2563eb"
      />
    </div>
  );
}

export default App;
```

### Next.js Project
```jsx
// pages/index.js or app/page.js
import { StandaloneChatbot } from '../components/StandaloneChatbot';

export default function Home() {
  return (
    <div>
      <h1>My Next.js Site</h1>
      
      <StandaloneChatbot 
        webhookUrl="https://your-api.com/chat"
        position="bottom-left"
        autoOpenDelay={5000}
      />
    </div>
  );
}
```

### HTML + CDN (Without Build Process)
If you're not using a build process, you can use React via CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root">
    <h1>My Website</h1>
    <!-- Your content here -->
  </div>
  
  <div id="chatbot-root"></div>
  
  <script type="text/babel">
    // Paste the StandaloneChatbot component code here
    // Then render it:
    
    const ChatbotApp = () => {
      return React.createElement(StandaloneChatbot, {
        webhookUrl: "https://your-webhook-url.com",
        title: "Support Chat",
        primaryColor: "#4f46e5"
      });
    };
    
    ReactDOM.render(React.createElement(ChatbotApp), document.getElementById('chatbot-root'));
  </script>
</body>
</html>
```

## Features

### ✅ What's Included
- **Auto-popup**: Chatbot opens automatically after page visit
- **Session persistence**: Chat history saved in localStorage
- **HTML message parsing**: Bot responses with HTML are rendered properly
- **Typing indicators**: Shows when bot is thinking/typing
- **Responsive design**: Works on desktop and mobile
- **Customizable styling**: Colors, position, text can be configured
- **No external dependencies**: Only requires React

### 🎨 Customization
- **Colors**: Change `primaryColor` to match your brand
- **Position**: Place in bottom-left or bottom-right corner
- **Timing**: Control auto-open delay
- **Text**: Customize title and subtitle
- **Styling**: All styles are inline and can be modified in the component

### 📱 Mobile Friendly
The chatbot automatically adapts to mobile screens and maintains usability across devices.

## API Integration

### Webhook Format
Your webhook should expect these POST requests:

**Session Initialization:**
```json
{
  "event": "new_session",
  "session_id": "session-abc123"
}
```

**User Messages:**
```json
{
  "message": "Hello, I need help",
  "session_id": "session-abc123"
}
```

**Expected Response:**
Plain text or HTML string that will be displayed as the bot's response.

## Troubleshooting

### Common Issues

1. **Chatbot not appearing**: Ensure React is properly imported and the component is rendered
2. **API errors**: Check that your webhook URL is correct and accessible
3. **Styling issues**: All styles are inline, so CSS conflicts shouldn't occur
4. **Session not persisting**: Ensure localStorage is available in the browser

### Console Debugging
The component logs errors to the console. Check browser developer tools for debugging information.

## File Structure
```
your-project/
├── components/
│   └── StandaloneChatbot.tsx    # Copy this entire file
├── App.jsx                      # Your main app file
└── README-CHATBOT.md           # This documentation
```

## Support
This chatbot is completely self-contained and doesn't require any external services except your webhook API endpoint. All chat logic, styling, and state management is included in the single component file.