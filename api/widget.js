export default function handler(req, res) {
  // Configurar headers para JavaScript
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Obtener la API key desde las variables de entorno o usar la que funciona en localhost
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || 'AIzaSyCgmDFHK2cmIOJclfr1GaSPYJrpKrEsVTM';

  if (!apiKey) {
    return res.status(500).send('// Error: API key no configurada en el servidor');
  }

  // Generar el widget JavaScript con la API key dinámica
  const widgetCode = `
// ChefBot Widget - Asistente de Cocina con Gemini AI
(function() {
    'use strict';

    class GeminiService {
        constructor() {
            this.apiKey = '${apiKey}';
            this.genAI = null;
            this.model = null;
            this.chat = null;
            this.isInitialized = false;
            this.isGeminiLoaded = false;
        }

        async loadGeminiScript() {
            if (this.isGeminiLoaded) return true;
            
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'module';
                script.innerHTML = \`
                    import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';
                    window.GoogleGenerativeAI = GoogleGenerativeAI;
                    window.geminiLoaded = true;
                \`;
                script.onload = () => {
                    const checkGemini = () => {
                        if (window.GoogleGenerativeAI) {
                            this.isGeminiLoaded = true;
                            resolve(true);
                        } else {
                            setTimeout(checkGemini, 100);
                        }
                    };
                    checkGemini();
                };
                script.onerror = () => reject(new Error('Error al cargar Gemini'));
                document.head.appendChild(script);
            });
        }

        async initialize() {
            if (this.isInitialized) return true;

            try {
                await this.loadGeminiScript();
                
                if (!window.GoogleGenerativeAI) {
                    throw new Error('GoogleGenerativeAI no está disponible');
                }

                this.genAI = new window.GoogleGenerativeAI(this.apiKey);
                this.model = this.genAI.getGenerativeModel({ 
                    model: "gemini-1.5-flash",
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.8,
                        topK: 40,
                        maxOutputTokens: 1000,
                    }
                });

                const initialHistory = [
                    {
                        role: "user",
                        parts: [{ text: "Eres ChefBot, un asistente de cocina experto. Ayuda con recetas, técnicas culinarias, sustitutos de ingredientes, y consejos de cocina. Responde de manera amigable y práctica." }]
                    },
                    {
                        role: "model", 
                        parts: [{ text: "¡Hola! Soy ChefBot, tu asistente personal de cocina. Estoy aquí para ayudarte con recetas deliciosas, técnicas culinarias, sustitutos de ingredientes y todos tus desafíos en la cocina. ¿En qué puedo ayudarte hoy? 👨‍🍳" }]
                    }
                ];

                this.chat = this.model.startChat({
                    history: initialHistory
                });

                this.isInitialized = true;
                return true;
            } catch (error) {
                console.error('Error inicializando Gemini:', error);
                throw new Error('Error de configuración. No se pudo conectar con el servicio de IA.');
            }
        }

        async sendMessage(message) {
            if (!this.isInitialized) {
                await this.initialize();
            }

            try {
                const result = await this.chat.sendMessage(message);
                const response = await result.response;
                return response.text();
            } catch (error) {
                console.error('Error en sendMessage:', error);
                if (error.message && error.message.includes('API key')) {
                    throw new Error('Error de configuración. La API key no es válida.');
                }
                throw new Error('Lo siento, no pude procesar tu mensaje. ¿Podrías intentar de nuevo?');
            }
        }
    }

    // Crear el widget ChefBot
    function createChefBotWidget() {
        // Verificar si ya existe el widget
        if (document.getElementById('chefbot-widget')) {
            return;
        }

        const geminiService = new GeminiService();

        // Crear el contenedor principal
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'chefbot-widget';
        
        // Estilos del widget
        const styles = \`
            <style>
                #chefbot-widget {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 9999;
                }

                .chef-panel {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 0 20px 20px 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    margin: 2rem 0 2rem 2rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    min-width: 300px;
                }

                .chef-avatar {
                    width: 200px;
                    height: 200px;
                    background: linear-gradient(45deg, #FFD700, #FFA500);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
                }

                .chef-info h2 {
                    color: white;
                    margin: 0 0 0.5rem 0;
                    font-size: 2rem;
                    text-align: center;
                }

                .chef-info p {
                    color: rgba(255, 255, 255, 0.8);
                    text-align: center;
                    line-height: 1.6;
                    font-size: 1.1rem;
                }

                .chat-container {
                    flex: 2;
                    display: flex;
                    flex-direction: column;
                    margin: 2rem 2rem 2rem 1rem;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    min-width: 400px;
                    max-width: 800px;
                }

                .chat-header {
                    background: linear-gradient(45deg, #FFD700, #FFA500);
                    color: white;
                    padding: 1rem 1.5rem;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .chat-messages {
                    flex: 1;
                    padding: 1rem;
                    overflow-y: auto;
                    max-height: calc(100vh - 200px);
                    background: #f8f9fa;
                }

                .message {
                    margin-bottom: 1rem;
                    padding: 0.75rem 1rem;
                    border-radius: 15px;
                    max-width: 80%;
                    word-wrap: break-word;
                }

                .message.user {
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    margin-left: auto;
                    text-align: right;
                }

                .message.bot {
                    background: white;
                    color: #333;
                    border: 2px solid #e9ecef;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .message.bot.loading {
                    background: #f8f9fa;
                    border-color: #FFD700;
                    color: #666;
                    font-style: italic;
                }

                .chat-input-container {
                    padding: 1rem;
                    background: white;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    gap: 0.5rem;
                }

                .chat-input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: 2px solid #e9ecef;
                    border-radius: 25px;
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.3s;
                }

                .chat-input:focus {
                    border-color: #FFD700;
                }

                .send-button {
                    background: linear-gradient(45deg, #FFD700, #FFA500);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: transform 0.2s;
                }

                .send-button:hover {
                    transform: translateY(-2px);
                }

                .send-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .status-indicator {
                    padding: 0.5rem 1rem;
                    margin: 0.5rem;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    text-align: center;
                }

                .status-connecting {
                    background: #fff3cd;
                    color: #856404;
                    border: 1px solid #ffeaa7;
                }

                .status-ready {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .status-error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                @media (max-width: 768px) {
                    #chefbot-widget {
                        flex-direction: column;
                        height: 100vh;
                    }
                    
                    .chef-panel {
                        flex: none;
                        height: 200px;
                        margin: 1rem;
                        border-radius: 15px;
                        padding: 1rem;
                    }
                    
                    .chef-avatar {
                        width: 80px;
                        height: 80px;
                    }
                    
                    .chef-info h2 {
                        font-size: 1.5rem;
                    }
                    
                    .chat-container {
                        flex: 1;
                        margin: 0 1rem 1rem 1rem;
                    }
                }
            </style>
        \`;

        // HTML del widget
        const html = \`
            \${styles}
            <div class="chef-panel">
                <div class="chef-avatar">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="60" cy="45" r="25" fill="white"/>
                        <circle cx="50" cy="40" r="3" fill="#333"/>
                        <circle cx="70" cy="40" r="3" fill="#333"/>
                        <path d="M50 50 Q60 60 70 50" stroke="#333" stroke-width="2" fill="none"/>
                        <rect x="45" y="70" width="30" height="40" rx="5" fill="white"/>
                        <rect x="35" y="75" width="50" height="30" rx="8" fill="white"/>
                        <circle cx="60" cy="15" r="8" fill="white"/>
                        <circle cx="50" cy="20" r="6" fill="white"/>
                        <circle cx="70" cy="20" r="6" fill="white"/>
                    </svg>
                </div>
                <div class="chef-info">
                    <h2>ChefBot</h2>
                    <p>Tu asistente personal de cocina</p>
                    <p>Powered by Gemini AI</p>
                </div>
            </div>
            <div class="chat-container">
                <div class="chat-header">
                    💬 Chatea con ChefBot
                </div>
                <div id="status-indicator" class="status-indicator status-connecting">
                    🔄 Conectando con ChefBot...
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message bot">
                        ¡Hola! Soy ChefBot, tu asistente personal de cocina. Estoy aquí para ayudarte con recetas deliciosas, técnicas culinarias, sustitutos de ingredientes y todos tus desafíos en la cocina. ¿En qué puedo ayudarte hoy? 👨‍🍳
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chat-input" class="chat-input" placeholder="Pregúntame sobre cocina..." disabled>
                    <button id="send-button" class="send-button" disabled>Enviar</button>
                </div>
            </div>
        \`;

        widgetContainer.innerHTML = html;

        // Agregar el widget al body
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.appendChild(widgetContainer);

        // Referencias a elementos
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        const statusIndicator = document.getElementById('status-indicator');

        // Inicializar Gemini
        async function initializeGemini() {
            try {
                statusIndicator.textContent = '🔄 Inicializando ChefBot...';
                statusIndicator.className = 'status-indicator status-connecting';
                
                await geminiService.initialize();
                
                statusIndicator.textContent = '✅ ChefBot listo para ayudarte';
                statusIndicator.className = 'status-indicator status-ready';
                
                chatInput.disabled = false;
                sendButton.disabled = false;
                chatInput.focus();
                
                setTimeout(() => {
                    statusIndicator.style.display = 'none';
                }, 3000);
                
            } catch (error) {
                console.error('Error:', error);
                statusIndicator.textContent = '❌ ' + error.message;
                statusIndicator.className = 'status-indicator status-error';
            }
        }

        // Función para agregar mensajes
        function addMessage(content, isUser = false, isLoading = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user' : 'bot'}\${isLoading ? ' loading' : ''}\`;
            messageDiv.textContent = content;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return messageDiv;
        }

        // Función para enviar mensaje
        async function sendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;

            addMessage(message, true);
            chatInput.value = '';
            sendButton.disabled = true;

            const loadingMessage = addMessage('Pensando...', false, true);

            try {
                const response = await geminiService.sendMessage(message);
                chatMessages.removeChild(loadingMessage);
                addMessage(response, false);
            } catch (error) {
                chatMessages.removeChild(loadingMessage);
                addMessage(error.message, false);
            } finally {
                sendButton.disabled = false;
                chatInput.focus();
            }
        }

        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Inicializar
        initializeGemini();
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChefBotWidget);
    } else {
        createChefBotWidget();
    }

})();
`;

  res.send(widgetCode);
}