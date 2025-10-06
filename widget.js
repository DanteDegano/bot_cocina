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

    async initialize() {
      try {
        const response = await fetch(this.baseUrl + '/api/chat', {
          method: 'OPTIONS'
        });
        console.log('✅ Endpoint de chat disponible');
        return true;
      } catch (error) {
        console.warn('⚠️ Endpoint de chat no disponible, usando modo demo');
        return true;
      }
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
        console.warn('⚠️ Error conectando con backend, usando respuesta demo:', error);
        
        const demoResponses = [
          "🍳 ¡Excelente pregunta! Para esa receta te recomiendo usar ingredientes frescos y seguir estos pasos: 1) Preparar todos los ingredientes, 2) Calentar la sartén a fuego medio, 3) Cocinar paso a paso sin apresurarse.",
          "👨‍🍳 Como chef experto, puedo decirte que la clave está en la temperatura y el tiempo de cocción. Para obtener mejores resultados, siempre precalienta bien el equipo de cocina.",
          "🥘 Una técnica que siempre funciona es preparar todos los ingredientes antes de empezar a cocinar (mise en place). Esto te permitirá concentrarte en la técnica sin preocuparte por los ingredientes.",
          "🍽️ Te sugiero una deliciosa receta que combina sabores tradicionales con un toque moderno. La clave está en equilibrar los sabores: dulce, salado, ácido y umami.",
          "🔥 El secreto está en el punto de cocción perfecto. Para carnes: usa un termómetro, para vegetales: que mantengan un poco de textura, para salsas: reduce a fuego lento."
        ];
        
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        return demoResponses[Math.floor(Math.random() * demoResponses.length)];
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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }

        .main-container {
            max-width: 1200px;
            width: 100%;
            display: flex;
            gap: 40px;
            align-items: flex-start;
            justify-content: center;
        }

        .chef-panel {
            min-width: 300px;
        }

        .chef-avatar {
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

        .chef-info h1 {
            font-size: 32px;
            font-weight: 700;
            color: #333;
            margin-bottom: 10px;
        }

        .chef-description {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.5;
        }

        .chef-question {
            color: #333;
            font-weight: 500;
            margin-bottom: 20px;
        }

        .chat-area {
            flex: 1;
            max-width: 800px;
        }

        .chat-container {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            height: 600px;
            display: flex;
            flex-direction: column;
        }

        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
        }

        .message-card {
            margin-bottom: 20px;
            animation: slideIn 0.3s ease-out;
        }

        .message-card.user {
            display: flex;
            justify-content: flex-end;
        }

        .message-card.bot {
            display: flex;
            justify-content: flex-start;
        }

        .message-content {
            max-width: 80%;
            padding: 20px;
            border-radius: 20px;
            position: relative;
        }

        .message-card.user .message-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 5px;
        }

        .message-card.bot .message-content {
            background: #FFD700;
            color: #333;
            border-bottom-left-radius: 5px;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }

        .chat-input-area {
            padding: 20px;
            background: white;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 15px;
            align-items: flex-end;
        }

        .input-container {
            flex: 1;
            position: relative;
        }

        .chat-input {
            width: 100%;
            min-height: 50px;
            padding: 15px 50px 15px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            font-size: 16px;
            resize: none;
            outline: none;
            transition: border-color 0.3s ease;
        }

        .chat-input:focus {
            border-color: #FFD700;
        }

        .send-button {
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

        .send-button:hover {
            color: #333;
        }

        .disclaimer {
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

        @media (max-width: 768px) {
            body {
                padding: 10px;
                align-items: flex-start;
                padding-top: 20px;
            }
            
            .main-container {
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }
            
            .chef-panel {
                min-width: auto;
                text-align: center;
                width: 100%;
                max-width: 400px;
            }
            
            .chat-container {
                height: 500px;
                width: 100%;
                max-width: 400px;
            }
        }
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
                    <div class="chat-messages" id="chat-messages">
                        <!-- Los mensajes se agregarán aquí dinámicamente -->
                    </div>
                    
                    <div class="chat-input-area">
                        <div class="input-container">
                            <textarea 
                                class="chat-input" 
                                id="chat-input"
                                placeholder="Pregúntame sobre recetas, técnicas de cocina o ingredientes..."
                                rows="1"></textarea>
                            <button class="send-button" id="send-button">
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
    
    console.log('✅ Widget HTML creado con estética completa');
    
    // Inicializar chat
    initializeChat();
  }
  
  // Inicializar servicio de chat
  async function initializeChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    // Mensaje de bienvenida
    addMessage('¡Hola! 👋 Soy ChefBot, tu asistente personal de cocina. Puedo ayudarte con recetas, técnicas culinarias, sustituciones de ingredientes y consejos de cocina. ¿En qué puedo ayudarte hoy?', 'bot');
    
    // Configurar eventos
    sendButton.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
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
    
    messageCard.innerHTML = `
        <div class="message-content">
            ${content}
        </div>
    `;
    
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
    if (loadingMessage) {
        loadingMessage.remove();
    }
  }

  async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    if (!message) return;

    // Agregar mensaje del usuario
    addMessage(message, 'user');
    chatInput.value = '';

    // Agregar mensaje de carga
    addLoadingMessage();

    try {
        // Enviar a backend
        const response = await chatService.sendMessage(message);
        
        // Remover mensaje de carga
        removeLoadingMessage();
        
        // Agregar respuesta del bot
        addMessage(response, 'bot');
        
        // Actualizar historial
        chatService.conversationHistory.push(
            { role: 'user', content: message },
            { role: 'bot', content: response }
        );
        
        // Mantener solo los últimos 6 mensajes en el historial
        if (chatService.conversationHistory.length > 6) {
            chatService.conversationHistory = chatService.conversationHistory.slice(-6);
        }
        
    } catch (error) {
        removeLoadingMessage();
        addMessage('Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.', 'bot');
        console.error('Error:', error);
    }
  }
  
  // Ejecutar cuando esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
}

console.log('📝 ChefBot Widget con estética TuChef cargado completamente');