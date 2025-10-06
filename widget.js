console.log('🚀 ChefBot Widget iniciando con estética TuChef...');

// Verificar si ya está cargado
if (window.ChefBotLoaded) {
  console.log('Widget ya cargado');
} else {
  window.ChefBotLoaded = true;
  
  // Servicio Chat (llama al backend)
  class ChatService {
    constructor() {
      this.isReady = true;
      this.baseUrl = window.location.origin;
      this.conversationHistory = [];
    }

    // Inicialización sin OPTIONS
    async initialize() {
      console.log('✅ Inicialización de ChatService completada. Endpoint de chat listo para POST');
      return true;
    }

    async sendMessage(message) {
      try {
        console.log('📤 Enviando mensaje al backend:', message.substring(0, 50) + '...');

        const response = await fetch(this.baseUrl + '/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        console.log('📥 Respuesta recibida del backend');

        return data.reply || 'Respuesta vacía del servidor';

      } catch (error) {
        console.error('❌ Error enviando mensaje al backend:', error);
        throw error; // Propagar el error para manejarlo en la UI
      }
    }
  }

  // Crear instancia del servicio
  const chatService = new ChatService();
  
  // Crear widget con estética completa de TuChef
  function createWidget() {
    console.log('✅ Creando widget ChefBot con estética TuChef...');
    
    // Limpiar y configurar body
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;padding:0;';
    
    // Inyectar CSS completo
    const style = document.createElement('style');
    style.textContent = `
      /* ... (todo tu CSS de antes, sin cambios) ... */
    `;
    document.head.appendChild(style);
    
    // Crear HTML completo con la estética de TuChef
    document.body.innerHTML = `
      <div class="main-container">
        <!-- Chef Panel -->
        <div class="chef-panel">
          <div class="chef-avatar"></div>
          <div class="chef-info">
            <h1>ChefBot</h1>
            <p class="chef-description">
              Te ayudo a encontrar las mejores recetas de cocina.
            </p>
            <p class="chef-question">
              ¿Qué querés cocinar hoy?
            </p>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="chat-area">
          <div class="chat-container">
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-area">
              <div class="input-container">
                <textarea 
                  class="chat-input" 
                  id="chat-input"
                  placeholder="Pregúntame sobre recetas, técnicas de cocina o ingredientes..."
                  rows="1"></textarea>
                <button class="send-button" id="send-button">➤</button>
              </div>
            </div>
          </div>
          <div class="disclaimer">
            Respuestas generadas por inteligencia artificial.<br>
            Este chatbot está en etapa experimental y eventualmente puede presentar imprecisiones.
          </div>
        </div>
      </div>
    `;
    
    console.log('✅ Widget HTML creado con estética completa');
    
    // Inicializar chat
    initializeChat();
  }
  
  // Inicializar servicio de chat
  async function initializeChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    try {
      await chatService.initialize();
      addMessage('¡Hola! 👋 Soy ChefBot, tu asistente personal de cocina. Puedo ayudarte con recetas, técnicas culinarias, sustituciones de ingredientes y consejos de cocina. ¿En qué puedo ayudarte hoy?', 'bot');
    } catch (error) {
      addMessage('❌ Error de conexión: No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta recargar la página.', 'bot');
      console.error('Error inicializando chat service:', error);
      chatInput.disabled = true;
      sendButton.disabled = true;
      return;
    }
    
    sendButton.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    console.log('🎉 ChefBot inicializado completamente');
  }
  
  function addMessage(content, type) {
    const chatMessages = document.getElementById('chat-messages');
    const messageCard = document.createElement('div');
    messageCard.className = `message-card ${type}`;
    messageCard.innerHTML = `<div class="message-content">${content}</div>`;
    chatMessages.appendChild(messageCard);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addLoadingMessage() {
    const chatMessages = document.getElementById('chat-messages');
    const messageCard = document.createElement('div');
    messageCard.className = 'message-card bot';
    messageCard.id = 'loading-message';
    messageCard.innerHTML = `
      <div class="message-content">
        <div style="display: flex; align-items: center; gap: 10px;">
          ChefBot está cocinando una respuesta
          <div style="display: flex; gap: 3px;">
            <div style="width: 6px; height: 6px; background: #333; border-radius: 50%; animation: bounce 1.4s ease-in-out infinite both;"></div>
            <div style="width: 6px; height: 6px; background: #333; border-radius: 50%; animation: bounce 1.4s ease-in-out infinite both; animation-delay: -0.16s;"></div>
            <div style="width: 6px; height: 6px; background: #333; border-radius: 50%; animation: bounce 1.4s ease-in-out infinite both; animation-delay: -0.32s;"></div>
          </div>
        </div>
      </div>
    `;
    chatMessages.appendChild(messageCard);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) loadingMessage.remove();
  }

  async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatInput.value = '';
    addLoadingMessage();

    try {
        const response = await chatService.sendMessage(message);
        removeLoadingMessage();
        addMessage(response, 'bot');
        chatService.conversationHistory.push(
            { role: 'user', content: message },
            { role: 'bot', content: response }
        );
        if (chatService.conversationHistory.length > 6) {
            chatService.conversationHistory = chatService.conversationHistory.slice(-6);
        }
    } catch (error) {
        removeLoadingMessage();
        let errorMessage = 'Lo siento, hubo un problema procesando tu mensaje. ';
        if (error.message?.includes('405')) {
            errorMessage += 'El servidor no acepta este tipo de solicitud. Contacta al administrador.';
        } else if (error.message?.includes('500')) {
            errorMessage += 'Error interno del servidor. Intenta de nuevo en unos momentos.';
        } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
            errorMessage += 'Problema de conexión. Verifica tu internet e intenta de nuevo.';
        } else {
            errorMessage += 'Intenta de nuevo en unos momentos.';
        }
        addMessage('❌ ' + errorMessage, 'bot');
        console.error('Error en sendMessage:', error);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
}

console.log('📝 ChefBot Widget con estética TuChef cargado completamente');
