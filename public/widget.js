// ChefBot Widget - Sistema Completo Embebido
(function() {
  'use strict';
  
  // Verificar si el widget ya está cargado
  if (window.ChefBotWidgetLoaded) {
    return;
  }
  window.ChefBotWidgetLoaded = true;

  // Configuración de la API Key (debes configurar esto)
  const GEMINI_API_KEY = 'AIzaSyDhx-EVEQEJ9L2wQLwqVJaXOW7kXFXKYms'; // Reemplaza con tu API key

  // Servicio Gemini embebido
  class GeminiService {
    constructor() {
      this.apiKey = GEMINI_API_KEY;
      this.model = null;
      this.init();
    }

    async init() {
      if (!this.apiKey) {
        console.error('API key de Gemini no configurada');
        return;
      }
      
      try {
        // Cargar la librería de Google Generative AI dinámicamente
        if (!window.GoogleGenerativeAI) {
          await this.loadGeminiScript();
        }
        
        const { GoogleGenerativeAI } = window;
        const genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('✅ ChefBot inicializado correctamente');
      } catch (error) {
        console.error('❌ Error inicializando ChefBot:', error);
      }
    }

    async loadGeminiScript() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'importmap';
        script.textContent = JSON.stringify({
          "imports": {
            "@google/generative-ai": "https://esm.run/@google/generative-ai"
          }
        });
        document.head.appendChild(script);

        const moduleScript = document.createElement('script');
        moduleScript.type = 'module';
        moduleScript.textContent = `
          import { GoogleGenerativeAI } from "@google/generative-ai";
          window.GoogleGenerativeAI = GoogleGenerativeAI;
        `;
        moduleScript.onload = resolve;
        moduleScript.onerror = reject;
        document.head.appendChild(moduleScript);
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
      if (!this.model) {
        throw new Error('ChefBot no está listo. Intenta de nuevo en unos segundos.');
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
        console.error('❌ Error al comunicarse con ChefBot:', error);
        throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.');
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
      <div id="chefbot-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="white"/>
          <!-- Chef Hat -->
          <path d="M7 9 Q7 7 9 7 Q10 5 12 5 Q14 5 15 7 Q17 7 17 9 L17 10 Q17 11 16 11 L8 11 Q7 11 7 10 Z" fill="white" stroke="#333" stroke-width="0.5"/>
          <path d="M8 10 L16 10 L15.5 12 L8.5 12 Z" fill="white" stroke="#333" stroke-width="0.5"/>
          <!-- Face -->
          <circle cx="12" cy="15" r="3" fill="#FDBCB4"/>
          <!-- Eyes -->
          <circle cx="11" cy="14" r="0.3" fill="#333"/>
          <circle cx="13" cy="14" r="0.3" fill="#333"/>
          <!-- Mouth -->
          <path d="M11 16 Q12 16.5 13 16" stroke="#333" stroke-width="0.3" fill="none"/>
        </svg>
      </div>
      
      <div id="chefbot-chat" style="display: none;">
        <div id="chefbot-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #FFD700;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M7 9 Q7 7 9 7 Q10 5 12 5 Q14 5 15 7 Q17 7 17 9 L17 10 Q17 11 16 11 L8 11 Q7 11 7 10 Z" fill="white" stroke="#333" stroke-width="0.5"/>
                <path d="M8 10 L16 10 L15.5 12 L8.5 12 Z" fill="white" stroke="#333" stroke-width="0.5"/>
                <circle cx="12" cy="15" r="3" fill="#FDBCB4"/>
                <circle cx="11" cy="14" r="0.3" fill="#333"/>
                <circle cx="13" cy="14" r="0.3" fill="#333"/>
                <path d="M11 16 Q12 16.5 13 16" stroke="#333" stroke-width="0.3" fill="none"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: bold; color: #333;">ChefBot</div>
              <div style="font-size: 12px; color: #666;">Asistente de Cocina</div>
            </div>
          </div>
          <button id="chefbot-close">×</button>
        </div>
        
        <div id="chefbot-messages">
          <div class="chefbot-message bot">
            <div class="chefbot-message-content">
              ¡Hola! 👨‍🍳 Soy ChefBot, tu asistente personal de cocina. Puedo ayudarte con recetas, técnicas culinarias, sustituciones de ingredientes y mucho más. ¿En qué puedo ayudarte hoy?
            </div>
          </div>
        </div>
        
        <div id="chefbot-input-area">
          <textarea id="chefbot-input" placeholder="Pregúntame sobre cocina..." rows="1"></textarea>
          <button id="chefbot-send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Estilos del widget
    const styles = document.createElement('style');
    styles.textContent = `
      #chefbot-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      #chefbot-button {
        width: 60px;
        height: 60px;
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

      #chefbot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(255, 215, 0, 0.6);
      }

      #chefbot-chat {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      #chefbot-header {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
      }

      #chefbot-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #chefbot-close:hover {
        background: rgba(255,255,255,0.2);
      }

      #chefbot-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background: #f8f9fa;
      }

      .chefbot-message {
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
      }

      .chefbot-message.user {
        align-items: flex-end;
      }

      .chefbot-message.bot {
        align-items: flex-start;
      }

      .chefbot-message-content {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 18px;
        line-height: 1.4;
        font-size: 14px;
      }

      .chefbot-message.user .chefbot-message-content {
        background: #007bff;
        color: white;
        border-bottom-right-radius: 4px;
      }

      .chefbot-message.bot .chefbot-message-content {
        background: white;
        color: #333;
        border: 1px solid #e0e0e0;
        border-bottom-left-radius: 4px;
      }

      #chefbot-input-area {
        padding: 15px;
        background: white;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 10px;
        align-items: flex-end;
      }

      #chefbot-input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 10px 15px;
        font-size: 14px;
        resize: none;
        max-height: 100px;
        font-family: inherit;
      }

      #chefbot-input:focus {
        outline: none;
        border-color: #FFD700;
      }

      #chefbot-send {
        width: 40px;
        height: 40px;
        background: #FFD700;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #333;
        transition: all 0.3s ease;
      }

      #chefbot-send:hover {
        background: #FFA500;
        transform: scale(1.1);
      }

      #chefbot-send:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }

      @media (max-width: 480px) {
        #chefbot-chat {
          width: 320px;
          height: 450px;
          right: -10px;
        }
        
        #chefbot-widget {
          right: 10px;
          bottom: 10px;
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

      .chefbot-loading {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .chefbot-loading-dots {
        display: flex;
        gap: 3px;
      }

      .chefbot-loading-dot {
        width: 6px;
        height: 6px;
        background: #333;
        border-radius: 50%;
        animation: bounce 1.4s ease-in-out infinite both;
      }

      .chefbot-loading-dot:nth-child(1) { animation-delay: -0.32s; }
      .chefbot-loading-dot:nth-child(2) { animation-delay: -0.16s; }
      .chefbot-loading-dot:nth-child(3) { animation-delay: 0s; }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(widgetContainer);

    // Variables para el chat
    let conversationHistory = [];
    let isOpen = false;

    // Elementos del DOM
    const button = document.getElementById('chefbot-button');
    const chat = document.getElementById('chefbot-chat');
    const closeBtn = document.getElementById('chefbot-close');
    const messages = document.getElementById('chefbot-messages');
    const input = document.getElementById('chefbot-input');
    const sendBtn = document.getElementById('chefbot-send');

    // Funciones del chat
    function addMessage(content, type) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `chefbot-message ${type}`;
      messageDiv.innerHTML = `
        <div class="chefbot-message-content">${content}</div>
      `;
      messages.appendChild(messageDiv);
      messages.scrollTop = messages.scrollHeight;
    }

    function addLoadingMessage() {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'chefbot-message bot';
      messageDiv.id = 'chefbot-loading';
      messageDiv.innerHTML = `
        <div class="chefbot-message-content">
          <div class="chefbot-loading">
            ChefBot está cocinando una respuesta
            <div class="chefbot-loading-dots">
              <div class="chefbot-loading-dot"></div>
              <div class="chefbot-loading-dot"></div>
              <div class="chefbot-loading-dot"></div>
            </div>
          </div>
        </div>
      `;
      messages.appendChild(messageDiv);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeLoadingMessage() {
      const loading = document.getElementById('chefbot-loading');
      if (loading) loading.remove();
    }

    async function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      addMessage(message, 'user');
      input.value = '';
      sendBtn.disabled = true;
      addLoadingMessage();

      try {
        const response = await geminiService.sendMessage(message, conversationHistory);
        removeLoadingMessage();
        addMessage(response, 'bot');
        
        conversationHistory.push(
          { role: 'user', content: message },
          { role: 'bot', content: response }
        );
        
        if (conversationHistory.length > 6) {
          conversationHistory = conversationHistory.slice(-6);
        }
      } catch (error) {
        removeLoadingMessage();
        addMessage('Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.', 'bot');
        console.error('Error:', error);
      } finally {
        sendBtn.disabled = false;
      }
    }

    // Event listeners
    button.addEventListener('click', () => {
      if (isOpen) {
        chat.style.display = 'none';
        isOpen = false;
      } else {
        chat.style.display = 'flex';
        isOpen = true;
        input.focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      chat.style.display = 'none';
      isOpen = false;
    });

    sendBtn.addEventListener('click', sendMessage);

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (isOpen && !widgetContainer.contains(e.target)) {
        chat.style.display = 'none';
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