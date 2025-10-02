export default function handler(req, res) {
  // Configurar headers para JavaScript
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // API key desde variables de entorno o fallback
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || 'AIzaSyCgmDFHK2cmIQJc1friGaSPYJrpKrEsVTM';

  // Widget JavaScript con integración Gemini
  const widgetCode = `
console.log('🚀 ChefBot Widget con Gemini iniciando...');

// Verificar si ya está cargado
if (window.ChefBotLoaded) {
  console.log('Widget ya cargado');
} else {
  window.ChefBotLoaded = true;
  
  // Servicio Gemini
  class GeminiService {
    constructor() {
      this.apiKey = '${apiKey}';
      this.isReady = false;
      this.isInitializing = false;
    }

    async initialize() {
      if (this.isInitializing || this.isReady) return this.isReady;
      this.isInitializing = true;

      try {
        // Cargar Gemini dinámicamente
        const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
        
        const genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1000,
          }
        });

        this.isReady = true;
        console.log('✅ Gemini inicializado correctamente');
        return true;
      } catch (error) {
        console.error('❌ Error inicializando Gemini:', error);
        this.isReady = false;
        return false;
      } finally {
        this.isInitializing = false;
      }
    }

    async sendMessage(message) {
      if (!this.isReady) {
        await this.initialize();
      }

      if (!this.isReady) {
        throw new Error('No se pudo conectar con el servicio de IA');
      }

      try {
        const systemPrompt = "Eres ChefBot, un asistente experto de cocina. Ayuda con recetas, técnicas culinarias, sustitutos de ingredientes y consejos de cocina. Responde de manera amigable, práctica y en español. Mantén las respuestas concisas pero útiles.";
        
        const fullPrompt = systemPrompt + "\\n\\nUsuario: " + message + "\\n\\nChefBot:";
        
        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error('Error en Gemini:', error);
        throw new Error('Error temporal procesando tu consulta. Intenta de nuevo.');
      }
    }
  }

  // Crear instancia del servicio
  const geminiService = new GeminiService();
  
  // Crear widget
  function createWidget() {
    console.log('✅ Creando widget ChefBot...');
    
    // Limpiar body
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;padding:0;font-family:Arial,sans-serif;';
    
    // Widget HTML
    document.body.innerHTML = '<div style="width:100vw;height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;position:fixed;top:0;left:0;z-index:9999;"><div style="background:white;border-radius:20px;padding:40px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.3);max-width:500px;width:90%;"><div style="width:80px;height:80px;background:#FFD700;border-radius:50%;margin:0 auto 20px auto;display:flex;align-items:center;justify-content:center;font-size:40px;">👨‍🍳</div><h1 style="color:#333;margin-bottom:10px;">ChefBot</h1><p style="color:#666;margin-bottom:20px;">Tu asistente personal de cocina</p><div id="status" style="padding:15px;background:#fff3cd;border-radius:10px;margin-bottom:20px;color:#856404;">🔄 Inicializando IA culinaria...</div><input type="text" id="chatInput" placeholder="Pregúntame sobre cocina..." style="width:100%;padding:15px;border:2px solid #e0e0e0;border-radius:25px;font-size:16px;margin-bottom:15px;box-sizing:border-box;" disabled><button id="sendBtn" style="width:100%;padding:15px;background:#FFD700;border:none;border-radius:25px;font-size:16px;font-weight:bold;cursor:pointer;" disabled>Enviar Pregunta</button><div id="response" style="margin-top:20px;padding:15px;background:#f8f9fa;border-radius:10px;text-align:left;min-height:60px;display:none;"></div></div></div>';
    
    console.log('✅ Widget HTML creado');
    
    // Inicializar Gemini
    initializeGemini();
    
    // Configurar eventos
    setupEvents();
  }
  
  // Inicializar Gemini
  async function initializeGemini() {
    const status = document.getElementById('status');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    try {
      const success = await geminiService.initialize();
      
      if (success) {
        status.style.background = '#d4edda';
        status.style.color = '#155724';
        status.innerHTML = '✅ ChefBot listo para ayudarte';
        chatInput.disabled = false;
        sendBtn.disabled = false;
        console.log('🎉 ChefBot completamente inicializado');
      } else {
        throw new Error('Falló la inicialización');
      }
    } catch (error) {
      console.error('Error:', error);
      status.style.background = '#f8d7da';
      status.style.color = '#721c24';
      status.innerHTML = '❌ Error de conexión. Recarga la página.';
    }
  }
  
  // Configurar eventos
  function setupEvents() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !chatInput.disabled) {
        sendMessage();
      }
    });
  }
  
  // Enviar mensaje a Gemini
  async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const response = document.getElementById('response');
    const sendBtn = document.getElementById('sendBtn');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Deshabilitar input mientras procesa
    chatInput.disabled = true;
    sendBtn.disabled = true;
    
    response.style.display = 'block';
    response.innerHTML = '🔄 ChefBot está cocinando una respuesta...';
    
    try {
      const botResponse = await geminiService.sendMessage(message);
      response.innerHTML = '<strong>🍳 ChefBot responde:</strong><br><br>' + botResponse;
      chatInput.value = '';
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      response.innerHTML = '<strong>❌ Error:</strong><br><br>' + error.message + '<br><br>Intenta con otra pregunta culinaria.';
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }
  
  // Ejecutar cuando esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
}

console.log('📝 ChefBot con Gemini cargado completamente');
`;

  res.send(widgetCode);
}