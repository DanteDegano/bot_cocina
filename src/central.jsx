import React from 'react'
import ReactDOM from 'react-dom/client'
import ChatBot from './components/ChatBot.jsx'
import './styles/chatbot.css'

// Estilos específicos para la versión central
const centralStyles = `
  .chat-container {
    height: 100vh !important;
    max-width: none !important;
    margin: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
  }
  
  .chat-header {
    display: none !important;
  }
  
  .messages-container {
    padding: 20px !important;
    background: #f8f9fa !important;
  }
  
  .input-container {
    padding: 20px !important;
    background: white !important;
    border-top: 1px solid #e9ecef !important;
  }
`;

// Inyectar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = centralStyles;
document.head.appendChild(styleSheet);

// Renderizar el chatbot
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChatBot isWidget={false} />
  </React.StrictMode>,
)