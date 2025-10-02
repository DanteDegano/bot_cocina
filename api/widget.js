export default function handler(req, res) {
  // Configurar headers para JavaScript
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // API key que funciona en localhost
  const apiKey = 'AIzaSyCgmDFHK2cmIQJc1friGaSPYJrpKrEsVTM';

  // Widget JavaScript simple y funcional
  const widgetCode = `
console.log('🚀 ChefBot Widget iniciando...');

// Verificar si ya está cargado
if (window.ChefBotLoaded) {
  console.log('Widget ya cargado');
} else {
  window.ChefBotLoaded = true;
  
  // Crear widget
  function createWidget() {
    console.log('✅ Creando widget...');
    
    // Limpiar body
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;padding:0;font-family:Arial,sans-serif;';
    
    // Widget HTML
    document.body.innerHTML = \`
      <div style="
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
      ">
        <div style="
          background: white;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          max-width: 500px;
          width: 90%;
        ">
          <div style="
            width: 80px;
            height: 80px;
            background: #FFD700;
            border-radius: 50%;
            margin: 0 auto 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
          ">👨‍🍳</div>
          
          <h1 style="color: #333; margin-bottom: 10px;">ChefBot</h1>
          <p style="color: #666; margin-bottom: 20px;">Tu asistente personal de cocina</p>
          
          <div id="status" style="
            padding: 15px;
            background: #d4edda;
            border-radius: 10px;
            margin-bottom: 20px;
            color: #155724;
          ">✅ ¡Listo para ayudarte!</div>
          
          <input type="text" 
                 id="chatInput" 
                 placeholder="Pregúntame sobre cocina..." 
                 style="
                   width: 100%;
                   padding: 15px;
                   border: 2px solid #e0e0e0;
                   border-radius: 25px;
                   font-size: 16px;
                   margin-bottom: 15px;
                   box-sizing: border-box;
                 ">
          
          <button onclick="sendMessage()" style="
            width: 100%;
            padding: 15px;
            background: #FFD700;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">Enviar Pregunta</button>
          
          <div id="response" style="
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            text-align: left;
            min-height: 60px;
            display: none;
          "></div>
        </div>
      </div>
    \`;
    
    console.log('✅ Widget creado exitosamente');
    
    // Función para enviar mensaje
    window.sendMessage = function() {
      const input = document.getElementById('chatInput');
      const response = document.getElementById('response');
      const message = input.value.trim();
      
      if (!message) return;
      
      response.style.display = 'block';
      response.innerHTML = '🔄 Procesando tu consulta culinaria...';
      
      // Simular respuesta por ahora
      setTimeout(() => {
        response.innerHTML = \`
          <strong>🍳 ChefBot responde:</strong><br><br>
          ¡Excelente pregunta sobre "${message}"!<br><br>
          Como tu asistente de cocina, te puedo ayudar con recetas, técnicas culinarias, 
          sustitutos de ingredientes y consejos profesionales. 
          <br><br>
          <em>* Integración con Gemini AI próximamente *</em>
        \`;
        input.value = '';
      }, 1500);
    };
    
    // Enter para enviar
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  // Ejecutar cuando esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
}

console.log('📝 Script ChefBot cargado completamente');
`;

  res.send(widgetCode);
}