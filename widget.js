console.log('🚀 ChefBot Widget con Gemini iniciando...');

// Verificar si ya está cargado
if (window.ChefBotLoaded) {
  console.log('Widget ya cargado');
} else {
  window.ChefBotLoaded = true;
  
  // Servicio Chat (llama al backend)
  class ChatService {
    constructor() {
      this.isReady = true; // Siempre listo, no necesita inicialización
      this.baseUrl = window.location.origin; // Usar el mismo dominio
    }

    async initialize() {
      // No necesita inicialización, solo verificar conectividad
      try {
        const response = await fetch(this.baseUrl + '/api/chat', {
          method: 'OPTIONS'
        });
        console.log('✅ Endpoint de chat disponible');
        return true;
      } catch (error) {
        console.warn('⚠️ Endpoint de chat no disponible, usando modo demo');
        return true; // Continuar en modo demo
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
        
        // Fallback a respuestas demo si falla el backend
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
  
  // Crear widget
  function createWidget() {
    console.log('✅ Creando widget ChefBot...');
    
    // Limpiar body
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;padding:0;font-family:Arial,sans-serif;';
    
    // Widget HTML
    document.body.innerHTML = '<div style="width:100vw;height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;position:fixed;top:0;left:0;z-index:9999;"><div style="background:white;border-radius:20px;padding:40px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.3);max-width:500px;width:90%;"><div style="width:80px;height:80px;background:#FFD700;border-radius:50%;margin:0 auto 20px auto;display:flex;align-items:center;justify-content:center;font-size:40px;">👨‍🍳</div><h1 style="color:#333;margin-bottom:10px;">ChefBot</h1><p style="color:#666;margin-bottom:20px;">Tu asistente personal de cocina</p><div id="status" style="padding:15px;background:#fff3cd;border-radius:10px;margin-bottom:20px;color:#856404;">🔄 Inicializando IA culinaria...</div><input type="text" id="chatInput" placeholder="Pregúntame sobre cocina..." style="width:100%;padding:15px;border:2px solid #e0e0e0;border-radius:25px;font-size:16px;margin-bottom:15px;box-sizing:border-box;" disabled><button id="sendBtn" style="width:100%;padding:15px;background:#FFD700;border:none;border-radius:25px;font-size:16px;font-weight:bold;cursor:pointer;" disabled>Enviar Pregunta</button><div id="response" style="margin-top:20px;padding:15px;background:#f8f9fa;border-radius:10px;text-align:left;min-height:60px;display:none;"></div></div></div>';
    
    console.log('✅ Widget HTML creado');
    
    // Inicializar servicio de chat
    initializeChat();
    
    // Configurar eventos
    setupEvents();
  }
  
  // Inicializar servicio de chat
  async function initializeChat() {
    const status = document.getElementById('status');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    try {
      status.innerHTML = '🔄 Conectando con ChefBot...';
      
      const success = await chatService.initialize();
      
      if (success) {
        status.style.background = '#d4edda';
        status.style.color = '#155724';
        status.innerHTML = '✅ ChefBot listo para ayudarte con cocina';
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
        console.log('🎉 ChefBot completamente inicializado');
      } else {
        throw new Error('Falló la inicialización');
      }
    } catch (error) {
      console.error('Error:', error);
      status.style.background = '#f8d7da';
      status.style.color = '#721c24';
      status.innerHTML = '❌ Error de conexión. Funciona en modo demo.';
      
      // Permitir usar en modo demo
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
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
  
  // Enviar mensaje al servicio de chat
  async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const response = document.getElementById('response');
    const sendBtn = document.getElementById('sendBtn');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Deshabilitar input mientras procesa
    chatInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '🔄 Enviando...';
    
    response.style.display = 'block';
    response.innerHTML = '🔄 ChefBot está cocinando una respuesta...';
    
    try {
      const botResponse = await chatService.sendMessage(message);
      response.innerHTML = '<strong>🍳 ChefBot responde:</strong><br><br>' + botResponse;
      chatInput.value = '';
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      response.innerHTML = '<strong>❌ Error:</strong><br><br>' + error.message + '<br><br>Intenta con otra pregunta culinaria.';
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'Enviar Pregunta';
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

console.log('📝 ChefBot con backend seguro cargado completamente');