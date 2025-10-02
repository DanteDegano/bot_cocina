import React, { useState, useRef, useEffect } from 'react';
import { Send, ChefHat, User, Bot } from 'lucide-react';
import geminiService from '../services/geminiService';

const ChatBot = ({ isWidget = false, onMinimize = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickSuggestions = [
    "¿Cómo hago pasta carbonara?",
    "Sustitutos para huevos en repostería",
    "Receta de pan casero fácil",
    "¿Cómo cortar cebolla sin llorar?",
    "Menú semanal saludable"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensaje de bienvenida
    if (messages.length === 0) {
      setMessages([{
        id: Date.now(),
        content: "¡Hola! 👋 Soy ChefBot, tu asistente personal de cocina. Puedo ayudarte con recetas, técnicas culinarias, sustituciones de ingredientes y consejos de cocina. ¿En qué puedo ayudarte hoy?",
        role: 'bot',
        timestamp: new Date()
      }]);
    }
  }, []);

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const newMessage = {
      id: Date.now(),
      content: text,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // Obtener los últimos 6 mensajes para contexto
      const recentMessages = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await geminiService.sendMessage(text, recentMessages);
      
      const botMessage = {
        id: Date.now() + 1,
        content: response,
        role: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError('Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const formatMessage = (content) => {
    // Formatear el mensaje para mejor legibilidad
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const containerClass = isWidget ? 'widget-container' : 'chat-container';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={isWidget ? 'widget-header' : 'chat-header'}>
        <div>
          {isWidget ? (
            <h3>🍳 ChefBot</h3>
          ) : (
            <>
              <h1>🍳 ChefBot - Asistente de Cocina</h1>
              <p>Tu chef personal con inteligencia artificial</p>
            </>
          )}
        </div>
        {isWidget && onMinimize && (
          <button className="widget-toggle" onClick={onMinimize}>
            ✕
          </button>
        )}
        {!isWidget && <ChefHat className="chef-icon" />}
      </div>

      {/* Messages Container */}
      <div className={isWidget ? 'widget-content' : ''} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="messages-container">
          {messages.length === 1 && !isWidget && (
            <div className="welcome-message">
              <h2>¡Bienvenido a ChefBot! 👨‍🍳</h2>
              <p>Selecciona una sugerencia o pregúntame lo que quieras sobre cocina:</p>
              <div className="quick-suggestions">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-chip"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div 
                className="message-content"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
            </div>
          ))}

          {isLoading && (
            <div className="message bot">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="loading-message">
                  ChefBot está cocinando una respuesta
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="message bot">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content" style={{ color: '#e74c3c' }}>
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div className="input-container">
          {isWidget && messages.length === 1 && (
            <div className="quick-suggestions" style={{ marginBottom: '0.75rem' }}>
              {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form className="input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pregúntame sobre cocina, recetas, técnicas..."
                className="message-input"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;