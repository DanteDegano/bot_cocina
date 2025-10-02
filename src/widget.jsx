import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import ChatBot from './components/ChatBot';
import './styles/chatbot.css';

const Widget = ({ config = {} }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
    }
  };

  const closeWidget = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Estilos del contenedor principal para evitar conflictos de CSS
  const containerStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#333',
    boxSizing: 'border-box',
    pointerEvents: 'auto'
  };

  return (
    <div style={containerStyle}>
      {/* Botón flotante para abrir el widget */}
      {!isOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            backgroundColor: '#ff6b35',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
            transition: 'all 0.3s ease',
            fontSize: '24px',
            pointerEvents: 'auto'
          }}
          onClick={toggleWidget}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          🍳
        </div>
      )}

      {/* Widget del chatbot */}
      {isOpen && (
        <div className={`widget-container ${isMinimized ? 'minimized' : ''}`} style={{ pointerEvents: 'auto' }}>
          <div className="widget-header" onClick={toggleWidget}>
            <h3>🍳 ChefBot</h3>
            <button className="widget-toggle" onClick={(e) => {
              e.stopPropagation();
              closeWidget();
            }}>
              ✕
            </button>
          </div>
          
          {!isMinimized && (
            <div className="widget-content">
              <ChatBot isWidget={true} onMinimize={closeWidget} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Función para inicializar el widget
const initWidget = (config = {}) => {
  try {
    // Verificar si ya existe una instancia
    if (window.ChefBotWidgetInstance) {
      console.warn('ChefBot Widget ya está inicializado');
      return;
    }

    // Configuración por defecto
    const defaultConfig = {
      position: 'bottom-right',
      theme: 'default',
      allowedOrigins: ['*'], // Para desarrollo, en producción especificar dominios
      debug: false
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Crear el contenedor del widget si no existe
    let widgetContainer = document.getElementById('chefbot-widget');
    if (!widgetContainer) {
      widgetContainer = document.createElement('div');
      widgetContainer.id = 'chefbot-widget';
      
      // Agregar estilos de contenedor para evitar conflictos
      widgetContainer.style.cssText = `
        position: fixed !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
      `;
      
      document.body.appendChild(widgetContainer);
    }

    // Renderizar el widget
    const root = ReactDOM.createRoot(widgetContainer);
    root.render(<Widget config={finalConfig} />);
    
    // Marcar como inicializado
    window.ChefBotWidgetInstance = true;
    
    if (finalConfig.debug) {
      console.log('ChefBot Widget inicializado correctamente', finalConfig);
    }
    
  } catch (error) {
    console.error('Error al inicializar ChefBot Widget:', error);
  }
};

// Función para verificar compatibilidad con CORS
const checkCorsSupport = () => {
  try {
    // Verificar si el navegador soporta CORS
    if (!window.XMLHttpRequest) {
      return false;
    }
    
    const xhr = new XMLHttpRequest();
    return 'withCredentials' in xhr;
  } catch (e) {
    return false;
  }
};

// Auto-inicializar si se está ejecutando en el navegador
if (typeof window !== 'undefined') {
  // Verificar compatibilidad
  if (!checkCorsSupport()) {
    console.warn('ChefBot Widget: El navegador no soporta CORS');
  }
  
  // Inicializar cuando el DOM esté listo
  const initialize = () => {
    // Agregar un pequeño delay para evitar conflictos
    setTimeout(() => {
      initWidget();
    }, 100);
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
}

// API pública del widget
window.ChefBotWidget = {
  init: initWidget,
  version: '1.0.0',
  checkCorsSupport: checkCorsSupport,
  destroy: () => {
    const container = document.getElementById('chefbot-widget');
    if (container) {
      container.remove();
    }
    window.ChefBotWidgetInstance = false;
  }
};

export default Widget;