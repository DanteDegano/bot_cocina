// ChefBot Widget - Réplica exacta del index.html en formato flotante
(function() {
  'use strict';
  
  // Verificar si el widget ya está cargado
  if (window.ChefBotWidgetLoaded) {
    return;
  }
  window.ChefBotWidgetLoaded = true;

  // Configuración de la API Key
  const GEMINI_API_KEY = 'AIzaSyDhx-EVEQEJ9L2wQLwqVJaXOW7kXFXKYms';

  // Servicio Gemini embebido (simplificado)
  class GeminiService {
    constructor() {
      this.apiKey = GEMINI_API_KEY;
      this.model = null;
      this.isReady = false;
      this.init();
    }

    async init() {
      try {
        // Cargar la librería dinámicamente
        await this.loadGeminiScript();
        
        if (window.GoogleGenerativeAI) {
          const { GoogleGenerativeAI } = window;
          const genAI = new GoogleGenerativeAI(this.apiKey);
          this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          this.isReady = true;
          console.log('✅ ChefBot Widget inicializado');
        }
      } catch (error) {
        console.error('❌ Error inicializando ChefBot Widget:', error);
      }
    }

    async loadGeminiScript() {
      return new Promise((resolve, reject) => {
        if (window.GoogleGenerativeAI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
          window.GoogleGenerativeAI = GoogleGenerativeAI;
          window.geminiWidgetLoaded = true;
        `;
        
        script.onload = () => {
          const checkLoaded = () => {
            if (window.geminiWidgetLoaded && window.GoogleGenerativeAI) {
              resolve();
            } else {
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
        };
        
        script.onerror = reject;
        document.head.appendChild(script);
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
      if (!this.isReady || !this.model) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!this.isReady || !this.model) {
          throw new Error('ChefBot se está inicializando. Intenta de nuevo en unos segundos.');
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
        console.error('❌ Error ChefBot Widget:', error);
        throw new Error('Error de conexión. Intenta de nuevo.');
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
      <!-- Botón flotante -->
      <div id="chefbot-floating-btn">
        <div class="chef-avatar-small"></div>
      </div>
      
      <!-- Ventana del chat (inicialmente oculta) -->
      <div id="chefbot-window" style="display: none;">
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
        
        <!-- Botón de cerrar -->
        <button id="chefbot-close-btn">×</button>
      </div>
    `;

    // Estilos del widget - EXACTAMENTE como index.html
    const styles = document.createElement('style');
    styles.textContent = `
      /* Widget Container */
      #chefbot-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      /* Botón flotante */
      #chefbot-floating-btn {
        width: 70px;
        height: 70px;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
        transition: all 0.3s ease;
        border: 3px solid white;
      }

      #chefbot-floating-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(255, 215, 0, 0.6);
      }

      .chef-avatar-small {
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 50%;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='95' fill='white'/%3E%3C!-- Chef Hat --%3E%3Cpath d='M60 80 Q60 60 80 60 Q90 45 100 45 Q110 45 120 60 Q140 60 140 80 L140 85 Q140 90 135 90 L65 90 Q60 90 60 85 Z' fill='white' stroke='%23333' stroke-width='2'/%3E%3Cpath d='M65 85 L135 85 L130 100 L70 100 Z' fill='white' stroke='%23333' stroke-width='2'/%3E%3C!-- Face --%3E%3Ccircle cx='100' cy='115' r='25' fill='%23FDBCB4'/%3E%3C!-- Eyes --%3E%3Ccircle cx='92' cy='108' r='2' fill='%23333'/%3E%3Ccircle cx='108' cy='108' r='2' fill='%23333'/%3E%3C!-- Nose --%3E%3Cpath d='M100 112 L102 115 L98 115 Z' fill='%23F4A582'/%3E%3C!-- Mouth --%3E%3Cpath d='M95 120 Q100 125 105 120' stroke='%23333' stroke-width='1.5' fill='none'/%3E%3C!-- Chef Coat --%3E%3Cpath d='M75 135 Q75 130 80 130 L120 130 Q125 130 125 135 L125 170 Q125 175 120 175 L80 175 Q75 175 75 170 Z' fill='white' stroke='%23333' stroke-width='2'/%3E%3C!-- Buttons --%3E%3Ccircle cx='100' cy='145' r='2' fill='%23333'/%3E%3Ccircle cx='100' cy='155' r='2' fill='%23333'/%3E%3Ccircle cx='100' cy='165' r='2' fill='%23333'/%3E%3C!-- Red Necktie --%3E%3Cpath d='M95 130 Q100 125 105 130 L103 140 Q100 145 97 140 Z' fill='%23e74c3c'/%3E%3C!-- Utensils --%3E%3Cpath d='M70 140 L75 135 L77 137 L72 142 Z' fill='%23666'/%3E%3Cpath d='M128 137 L123 142 L125 144 L130 139 Z' fill='%23666'/%3E%3Cpath d='M125 135 Q130 130 135 135 Q130 140 125 135' fill='%23666'/%3E%3C!-- Steam --%3E%3Cpath d='M140 125 Q142 120 144 125 Q146 120 148 125' stroke='%23ccc' stroke-width='1' fill='none'/%3E%3Cpath d='M145 130 Q147 125 149 130 Q151 125 153 130' stroke='%23ccc' stroke-width='1' fill='none'/%3E%3C/svg%3E");
        background-size: 80%;
        background-repeat: no-repeat;
        background-position: center;
      }

      /* Ventana del widget */
      #chefbot-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 850px;
        height: 650px;
        background: #f5f5f5;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        overflow: hidden;
        padding: 20px;
      }

      /* Botón de cerrar */
      #chefbot-close-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 30px;
        height: 30px;
        background: #ff4757;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
      }

      #chefbot-close-btn:hover {
        background: #ff3742;
      }

      /* ESTILOS EXACTOS DEL INDEX.HTML */
      #chefbot-window * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      /* Contenedor principal */
      #chefbot-window .main-container {
        max-width: 100%;
        width: 100%;
        display: flex;
        gap: 40px;
        align-items: flex-start;
        justify-content: center;
        height: 100%;
      }

      /* Panel del chef */
      #chefbot-window .chef-panel {
        min-width: 250px;
      }

      #chefbot-window .chef-avatar {
        width: 80px;
        height: 80px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        border: 3px solid #FFD700;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='95' fill='white'/%3E%3C!-- Chef Hat --%3E%3Cpath d='M60 80 Q60 60 80 60 Q90 45 100 45 Q110 45 120 60 Q140 60 140 80 L140 85 Q140 90 135 90 L65 90 Q60 90 60 85 Z' fill='white' stroke='%23333' stroke-width='2'/%3E%3Cpath d='M65 85 L135 85 L130 100 L70 100 Z' fill='white' stroke='%23333' stroke-width='2'/%3E%3C!-- Face --%3E%3Ccircle cx='100' cy='115' r='25' fill='%23FDBCB4'/%3E%3C!-- Eyes --%3E%3Ccircle cx='92' cy='108' r='2' fill='%23333'/%3E%3Ccircle cx='108' cy='108' r='2' fill='%23333'/%3E%3C!-- Nose --%3E%3Cpath d='M100 112 L102 115 L98 115 Z' fill='%23F4A582'/%3E%3C!-- Mouth --%3E%3Cpath d='M95 120 Q100 125 105 120' stroke='%23333' stroke-width='1.5' fill='none'/%3E%3C!-- Chef Coat --%3E%3Cpath d='M75 135 Q75 130 80 130 L120 130 Q125 130 125 135 L125 170 Q125 175 120 175 L80 175 Q75 175 75 170 Z' fill='white' stroke='%23333' stroke-width='2'/%3E%3C!-- Buttons --%3E%3Ccircle cx='100' cy='145' r='2' fill='%23333'/%3E%3Ccircle cx='100' cy='155' r='2' fill='%23333'/%3E%3Ccircle cx='100' cy='165' r='2' fill='%23333'/%3E%3C!-- Red Necktie --%3E%3Cpath d='M95 130 Q100 125 105 130 L103 140 Q100 145 97 140 Z' fill='%23e74c3c'/%3E%3C!-- Utensils --%3E%3Cpath d='M70 140 L75 135 L77 137 L72 142 Z' fill='%23666'/%3E%3Cpath d='M128 137 L123 142 L125 144 L130 139 Z' fill='%23666'/%3E%3Cpath d='M125 135 Q130 130 135 135 Q130 140 125 135' fill='%23666'/%3E%3C!-- Steam --%3E%3Cpath d='M140 125 Q142 120 144 125 Q146 120 148 125' stroke='%23ccc' stroke-width='1' fill='none'/%3E%3Cpath d='M145 130 Q147 125 149 130 Q151 125 153 130' stroke='%23ccc' stroke-width='1' fill='none'/%3E%3C/svg%3E");
        background-size: 80%;
        background-repeat: no-repeat;
        background-position: center;
      }

      #chefbot-window .chef-info h1 {
        font-size: 28px;
        font-weight: 700;
        color: #333;
        margin-bottom: 8px;
      }

      #chefbot-window .chef-description {
        color: #666;
        margin-bottom: 15px;
        line-height: 1.5;
        font-size: 14px;
      }

      #chefbot-window .chef-question {
        color: #333;
        font-weight: 500;
        margin-bottom: 15px;
        font-size: 14px;
      }

      /* Chat container */
      #chefbot-window .chat-area {
        flex: 1;
        max-width: 550px;
      }

      #chefbot-window .chat-container {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        height: 550px;
        display: flex;
        flex-direction: column;
      }

      #chefbot-window .chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background: #f8f9fa;
      }

      /* Estilos de mensajes tipo tarjeta - EXACTOS */
      #chefbot-window .message-card {
        margin-bottom: 20px;
        animation: slideIn 0.3s ease-out;
      }

      #chefbot-window .message-card.user {
        display: flex;
        justify-content: flex-end;
      }

      #chefbot-window .message-card.bot {
        display: flex;
        justify-content: flex-start;
      }

      #chefbot-window .message-content {
        max-width: 80%;
        padding: 20px;
        border-radius: 20px;
        position: relative;
      }

      #chefbot-window .message-card.user .message-content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom-right-radius: 5px;
      }

      #chefbot-window .message-card.bot .message-content {
        background: #FFD700;
        color: #333;
        border-bottom-left-radius: 5px;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
      }

      /* Input area - EXACTO */
      #chefbot-window .chat-input-area {
        padding: 20px;
        background: white;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 15px;
        align-items: flex-end;
      }

      #chefbot-window .input-container {
        flex: 1;
        position: relative;
      }

      #chefbot-window .chat-input {
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

      #chefbot-window .chat-input:focus {
        border-color: #FFD700;
      }

      #chefbot-window .send-button {
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

      #chefbot-window .send-button:hover {
        color: #333;
      }

      #chefbot-window .disclaimer {
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
      @media (max-width: 900px) {
        #chefbot-window {
          width: calc(100vw - 40px);
          height: calc(100vh - 100px);
          right: 20px;
          bottom: 80px;
        }
        
        #chefbot-window .main-container {
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        
        #chefbot-window .chef-panel {
          min-width: auto;
          text-align: center;
          width: 100%;
        }
        
        #chefbot-window .chat-container {
          height: 400px;
          width: 100%;
        }
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(widgetContainer);

    // Variables para el chat
    let conversationHistory = [];
    let isOpen = false;

    // Elementos del DOM
    const floatingBtn = document.getElementById('chefbot-floating-btn');
    const chatWindow = document.getElementById('chefbot-window');
    const closeBtn = document.getElementById('chefbot-close-btn');
    const chatMessages = document.getElementById('widget-chat-messages');
    const chatInput = document.getElementById('widget-chat-input');
    const sendButton = document.getElementById('widget-send-button');

    // Mensaje de bienvenida - EXACTO como index.html
    function addWelcomeMessage() {
      addMessage('¡Hola! 👋 Soy ChefBot, tu asistente personal de cocina. Puedo ayudarte con recetas, técnicas culinarias, sustituciones de ingredientes y consejos de cocina. ¿En qué puedo ayudarte hoy?', 'bot');
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
    floatingBtn.addEventListener('click', () => {
      if (isOpen) {
        chatWindow.style.display = 'none';
        isOpen = false;
      } else {
        chatWindow.style.display = 'block';
        isOpen = true;
        if (conversationHistory.length === 0) {
          addWelcomeMessage();
        }
        chatInput.focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
      isOpen = false;
    });

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

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (isOpen && !widgetContainer.contains(e.target)) {
        chatWindow.style.display = 'none';
        isOpen = false;
      }
    });
  }

  // Inicializar el widget cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

})();