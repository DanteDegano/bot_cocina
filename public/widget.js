// ChefBot Widget - Módulo Principal Centrado
(function() {
  'use strict';
  
  // Verificar si el widget ya está cargado
  if (window.ChefBotWidgetLoaded) {
    return;
  }
  window.ChefBotWidgetLoaded = true;

  // Configuración de la API Key
  const GEMINI_API_KEY = 'AIzaSyDhx-EVEQEJ9L2wQLwqVJaXOW7kXFXKYms';

  // Servicio Gemini embebido (simplificado y más robusto)
  class GeminiService {
    constructor() {
      this.apiKey = GEMINI_API_KEY;
      this.model = null;
      this.isReady = false;
      this.isInitializing = false;
      this.init();
    }

    async init() {
      if (this.isInitializing) return;
      this.isInitializing = true;

      try {
        // Método simplificado de carga
        await this.loadGeminiLibrary();
        
        if (window.GoogleGenerativeAI) {
          const { GoogleGenerativeAI } = window;
          const genAI = new GoogleGenerativeAI(this.apiKey);
          this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          this.isReady = true;
          console.log('✅ ChefBot Widget listo');
        } else {
          throw new Error('No se pudo cargar la librería');
        }
      } catch (error) {
        console.error('❌ Error inicializando ChefBot:', error);
        this.isReady = false;
        // Intentar de nuevo después de 3 segundos
        setTimeout(() => {
          this.isInitializing = false;
          this.init();
        }, 3000);
      } finally {
        this.isInitializing = false;
      }
    }

    async loadGeminiLibrary() {
      // Si ya está cargado, retornar inmediatamente
      if (window.GoogleGenerativeAI) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        // Crear script para cargar la librería
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
          try {
            const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
            window.GoogleGenerativeAI = GoogleGenerativeAI;
            window.dispatchEvent(new Event('gemini-loaded'));
          } catch (error) {
            window.dispatchEvent(new CustomEvent('gemini-error', { detail: error }));
          }
        `;

        // Listeners para los eventos
        const onLoaded = () => {
          window.removeEventListener('gemini-loaded', onLoaded);
          window.removeEventListener('gemini-error', onError);
          resolve();
        };

        const onError = (event) => {
          window.removeEventListener('gemini-loaded', onLoaded);
          window.removeEventListener('gemini-error', onError);
          reject(event.detail);
        };

        window.addEventListener('gemini-loaded', onLoaded);
        window.addEventListener('gemini-error', onError);

        // Agregar el script al DOM
        document.head.appendChild(script);

        // Timeout de seguridad
        setTimeout(() => {
          window.removeEventListener('gemini-loaded', onLoaded);
          window.removeEventListener('gemini-error', onError);
          reject(new Error('Timeout cargando Gemini'));
        }, 10000);
      });
    }

    getSystemPrompt() {
      return `Eres un asistente experto de cocina llamado ChefBot. Tu especialidad es ayudar a las personas con:

1. Recetas detalladas y fáciles de seguir
2. Sustituciones de ingredientes 
3. Técnicas culinarias
4. Consejos de cocina y trucos profesionales
5. Planificación de menús
6. Información nutricional básica
7. Maridajes y combinaciones de sabores

INSTRUCCIONES IMPORTANTES:
- Siempre responde en español
- Sé amigable, útil y conciso
- Si te preguntan sobre recetas, incluye ingredientes, pasos detallados y tiempos de cocción
- Para sustituciones, explica por qué funcionan las alternativas
- Si no estás seguro de algo relacionado con cocina, dilo claramente
- Mantén un tono profesional pero cercano
- Si te preguntan algo no relacionado con cocina, redirige amablemente hacia temas culinarios

Responde siempre como si fueras un chef experimentado que quiere enseñar y ayudar.`;
    }

    async sendMessage(message, conversationHistory = []) {
      // Verificar estado del servicio
      if (!this.isReady) {
        // Si se está inicializando, esperar
        if (this.isInitializing) {
          // Esperar hasta 5 segundos a que termine la inicialización
          let attempts = 0;
          while (this.isInitializing && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }
        
        // Si aún no está listo, intentar inicializar una vez más
        if (!this.isReady) {
          try {
            await this.init();
            // Esperar un poco más
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error('Error en reinicialización:', error);
          }
        }
        
        // Si después de todo sigue sin estar listo
        if (!this.isReady || !this.model) {
          throw new Error('ChefBot está cargando. Por favor, espera un momento e intenta de nuevo.');
        }
      }

      try {
        const systemPrompt = this.getSystemPrompt();
        let fullPrompt = systemPrompt + "\n\n";
        
        if (conversationHistory.length > 0) {
          fullPrompt += "Historial de conversación reciente:\n";
          conversationHistory.forEach((msg) => {
            fullPrompt += `${msg.role === 'user' ? 'Usuario' : 'ChefBot'}: ${msg.content}\n`;
          });
          fullPrompt += "\n";
        }
        
        fullPrompt += `Usuario: ${message}\nChefBot:`;

        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        return text.trim();
      } catch (error) {
        console.error('❌ Error en sendMessage:', error);
        
        // Manejar errores específicos
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Error de configuración. La API key no es válida.');
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Límite de uso de la API excedido. Intenta más tarde.');
        } else if (error.message.includes('SAFETY')) {
          throw new Error('El contenido no pasó los filtros de seguridad. Intenta con otra pregunta.');
        } else {
          throw new Error('Error temporal. Intenta de nuevo en unos segundos.');
        }
      }
    }
  }

  // Instancia del servicio
  const geminiService = new GeminiService();

  // Crear el widget
  function createWidget() {
    // Contenedor principal del widget
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'chefbot-widget';
    widgetContainer.innerHTML = `
      <div class="main-container">
        <!-- Panel del chef -->
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
            <div class="chat-messages" id="widget-chat-messages">
              <!-- Los mensajes se agregarán aquí dinámicamente -->
            </div>
            
            <div class="chat-input-area">
              <div class="input-container">
                <textarea 
                  class="chat-input" 
                  id="widget-chat-input"
                  placeholder="Pregúntame sobre recetas, técnicas de cocina o ingredientes..."
                  rows="1"></textarea>
                <button class="send-button" id="widget-send-button">
                  ➤
                </button>
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

    // Estilos del widget - EXACTAMENTE como index.html
    const styles = document.createElement('style');
    styles.textContent = `
      /* Reset básico */
      #chefbot-widget * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      /* Widget Container - Ocupa toda la pantalla */
      #chefbot-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: #f5f5f5;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        padding: 20px;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
      }

      /* Contenedor principal */
      #chefbot-widget .main-container {
        max-width: 1200px;
        width: 100%;
        display: flex;
        gap: 40px;
        align-items: flex-start;
        justify-content: center;
      }

      /* Panel del chef */
      #chefbot-widget .chef-panel {
        min-width: 300px;
      }

      #chefbot-widget .chef-avatar {
        width: 100px;
        height: 100px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        border: 3px solid #FFD700;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='95' fill='white'/%3E%3C!-- Chef Hat --%3E%3Cpath d='M60 80 Q60 60 80 60 Q90 45 100 45 Q110 45 120 60 Q140 60 140 80 L140 85 Q140 90 135 90 L65 90 Q60 90 60 85 Z' fill='white' stroke='%23333' stroke-width='2'/%3E%3Cpath d='M65 85 L135 85 L130 100 L70 100 Z' fill='white' stroke='%23333' stroke-width='2'/%3E%3C!-- Face --%3E%3Ccircle cx='100' cy='115' r='25' fill='%23FDBCB4'/%3E%3C!-- Eyes --%3E%3Ccircle cx='92' cy='108' r='2' fill='%23333'/%3E%3Ccircle cx='108' cy='108' r='2' fill='%23333'/%3E%3C!-- Nose --%3E%3Cpath d='M100 112 L102 115 L98 115 Z' fill='%23F4A582'/%3E%3C!-- Mouth --%3E%3Cpath d='M95 120 Q100 125 105 120' stroke='%23333' stroke-width='1.5' fill='none'/%3E%3C!-- Chef Coat --%3E%3Cpath d='M75 135 Q75 130 80 130 L120 130 Q125 130 125 135 L125 170 Q125 175 120 175 L80 175 Q75 175 75 170 Z' fill='white' stroke='%23333' stroke-width='2'/%3E%3C!-- Buttons --%3E%3Ccircle cx='100' cy='145' r='2' fill='%23333'/%3E%3Ccircle cx='100' cy='155' r='2' fill='%23333'/%3E%3Ccircle cx='100' cy='165' r='2' fill='%23333'/%3E%3C!-- Red Necktie --%3E%3Cpath d='M95 130 Q100 125 105 130 L103 140 Q100 145 97 140 Z' fill='%23e74c3c'/%3E%3C!-- Utensils --%3E%3Cpath d='M70 140 L75 135 L77 137 L72 142 Z' fill='%23666'/%3E%3Cpath d='M128 137 L123 142 L125 144 L130 139 Z' fill='%23666'/%3E%3Cpath d='M125 135 Q130 130 135 135 Q130 140 125 135' fill='%23666'/%3E%3C!-- Steam --%3E%3Cpath d='M140 125 Q142 120 144 125 Q146 120 148 125' stroke='%23ccc' stroke-width='1' fill='none'/%3E%3Cpath d='M145 130 Q147 125 149 130 Q151 125 153 130' stroke='%23ccc' stroke-width='1' fill='none'/%3E%3C/svg%3E");
        background-size: 80%;
        background-repeat: no-repeat;
        background-position: center;
      }

      #chefbot-widget .chef-info h1 {
        font-size: 32px;
        font-weight: 700;
        color: #333;
        margin-bottom: 10px;
      }

      #chefbot-widget .chef-description {
        color: #666;
        margin-bottom: 20px;
        line-height: 1.5;
      }

      #chefbot-widget .chef-question {
        color: #333;
        font-weight: 500;
        margin-bottom: 20px;
      }

      /* Chat container */
      #chefbot-widget .chat-area {
        flex: 1;
        max-width: 800px;
      }

      #chefbot-widget .chat-container {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        height: 600px;
        display: flex;
        flex-direction: column;
      }

      #chefbot-widget .chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background: #f8f9fa;
      }

      /* Estilos de mensajes tipo tarjeta - EXACTOS */
      #chefbot-widget .message-card {
        margin-bottom: 20px;
        animation: slideIn 0.3s ease-out;
      }

      #chefbot-widget .message-card.user {
        display: flex;
        justify-content: flex-end;
      }

      #chefbot-widget .message-card.bot {
        display: flex;
        justify-content: flex-start;
      }

      #chefbot-widget .message-content {
        max-width: 80%;
        padding: 20px;
        border-radius: 20px;
        position: relative;
      }

      #chefbot-widget .message-card.user .message-content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom-right-radius: 5px;
      }

      #chefbot-widget .message-card.bot .message-content {
        background: #FFD700;
        color: #333;
        border-bottom-left-radius: 5px;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
      }

      /* Input area - EXACTO */
      #chefbot-widget .chat-input-area {
        padding: 20px;
        background: white;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 15px;
        align-items: flex-end;
      }

      #chefbot-widget .input-container {
        flex: 1;
        position: relative;
      }

      #chefbot-widget .chat-input {
        width: 100%;
        min-height: 50px;
        padding: 15px 50px 15px 20px;
        border: 2px solid #e0e0e0;
        border-radius: 25px;
        font-size: 16px;
        resize: none;
        outline: none;
        transition: border-color 0.3s ease;
        font-family: inherit;
      }

      #chefbot-widget .chat-input:focus {
        border-color: #FFD700;
      }

      #chefbot-widget .send-button {
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-54%);
        width: 40px;
        height: 40px;
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        color: #666;
        font-size: 18px;
        font-weight: bold;
      }

      #chefbot-widget .send-button:hover {
        color: #333;
      }

      #chefbot-widget .disclaimer {
        text-align: center;
        padding: 15px;
        color: #999;
        font-size: 12px;
        background: #f8f9fa;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      /* Responsive */
      @media (max-width: 768px) {
        #chefbot-widget {
          padding: 10px;
          align-items: flex-start;
          padding-top: 20px;
        }
        
        #chefbot-widget .main-container {
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        
        #chefbot-widget .chef-panel {
          min-width: auto;
          text-align: center;
          width: 100%;
          max-width: 400px;
        }
        
        #chefbot-widget .chat-container {
          height: 500px;
          width: 100%;
          max-width: 400px;
        }
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(widgetContainer);

    // Variables para el chat
    let conversationHistory = [];

    // Elementos del DOM
    const chatMessages = document.getElementById('widget-chat-messages');
    const chatInput = document.getElementById('widget-chat-input');
    const sendButton = document.getElementById('widget-send-button');

    // Mensaje de bienvenida con indicador de estado
    function addWelcomeMessage() {
      const welcomeId = 'welcome-message-' + Date.now();
      const messageCard = document.createElement('div');
      messageCard.className = 'message-card bot';
      messageCard.id = welcomeId;
      
      messageCard.innerHTML = `
        <div class="message-content">
          <div id="welcome-content">
            ¡Hola! 👋 Soy ChefBot, tu asistente personal de cocina.
            <div id="status-indicator" style="margin-top: 10px; padding: 8px; background: #fff3cd; border-radius: 8px; font-size: 12px;">
              <span id="status-text">🔄 Inicializando...</span>
            </div>
          </div>
        </div>
      `;
      
      chatMessages.appendChild(messageCard);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Verificar estado cada segundo
      const checkStatus = () => {
        const statusText = document.getElementById('status-text');
        const statusIndicator = document.getElementById('status-indicator');
        
        if (statusText && statusIndicator) {
          if (geminiService.isReady) {
            statusIndicator.style.background = '#d4edda';
            statusText.innerHTML = '✅ Listo para ayudarte';
            
            // Después de 2 segundos, mostrar el mensaje completo
            setTimeout(() => {
              const welcomeContent = document.getElementById('welcome-content');
              if (welcomeContent) {
                welcomeContent.innerHTML = `
                  ¡Hola! 👋 Soy ChefBot, tu asistente personal de cocina. 
                  Puedo ayudarte con recetas, técnicas culinarias, sustituciones de ingredientes y consejos de cocina. 
                  ¿En qué puedo ayudarte hoy?
                `;
              }
            }, 2000);
            
          } else if (geminiService.isInitializing) {
            statusIndicator.style.background = '#fff3cd';
            statusText.innerHTML = '🔄 Cargando IA...';
            setTimeout(checkStatus, 1000);
          } else {
            statusIndicator.style.background = '#f8d7da';
            statusText.innerHTML = '⚠️ Reintentando conexión...';
            setTimeout(checkStatus, 1000);
          }
        }
      };
      
      checkStatus();
    }

    // Funciones del chat - EXACTAS como index.html
    function addMessage(content, type) {
      const messageCard = document.createElement('div');
      messageCard.className = `message-card ${type}`;
      
      messageCard.innerHTML = `
        <div class="message-content">
          ${content}
        </div>
      `;
      
      chatMessages.appendChild(messageCard);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addLoadingMessage() {
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
      if (loadingMessage) {
        loadingMessage.remove();
      }
    }

    async function sendMessage() {
      const message = chatInput.value.trim();
      if (!message) return;

      // Agregar mensaje del usuario
      addMessage(message, 'user');
      chatInput.value = '';

      // Agregar mensaje de carga
      addLoadingMessage();

      try {
        // Enviar a Gemini
        const response = await geminiService.sendMessage(message, conversationHistory);
        
        // Remover mensaje de carga
        removeLoadingMessage();
        
        // Agregar respuesta del bot
        addMessage(response, 'bot');
        
        // Actualizar historial
        conversationHistory.push(
          { role: 'user', content: message },
          { role: 'bot', content: response }
        );
        
        // Mantener solo los últimos 6 mensajes en el historial
        if (conversationHistory.length > 6) {
          conversationHistory = conversationHistory.slice(-6);
        }
        
      } catch (error) {
        removeLoadingMessage();
        addMessage('Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.', 'bot');
        console.error('Error:', error);
      }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize textarea - EXACTO como index.html
    chatInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Cargar mensaje de bienvenida al inicio
    addWelcomeMessage();
  }

  // Inicializar el widget cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

})();