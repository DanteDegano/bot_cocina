const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  console.log(`🌐 Request method: ${req.method}, URL: ${req.url}`);
  
  // Headers CORS para permitir embebido desde cualquier dominio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight por 24 horas

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  // Solo permitir POST para el chat
  if (req.method !== 'POST') {
    console.log(`❌ Method ${req.method} not allowed`);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // Obtener API key de variables de entorno
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key no encontrada en variables de entorno');
      return res.status(500).json({ error: 'Servicio no configurado' });
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      }
    });

    // Prompt específico para cocina
    const systemPrompt = `Eres ChefBot, un asistente experto de cocina. Ayuda con recetas, técnicas culinarias, sustitutos de ingredientes y consejos de cocina. 

Características:
- Responde de manera amigable, práctica y en español
- Usa emojis relevantes de cocina (🍳👨‍🍳🥘🍽️🔥)
- Mantén las respuestas concisas pero útiles
- Si la pregunta no es sobre cocina, redirige amablemente hacia temas culinarios
- Proporciona pasos claros y consejos prácticos

Pregunta del usuario: ${message}

Respuesta de ChefBot:`;

    console.log('🔄 Enviando a Gemini:', message.substring(0, 50) + '...');

    // Generar respuesta
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const reply = response.text();

    console.log('✅ Respuesta generada exitosamente');

    return res.status(200).json({ 
      reply: reply,
      success: true 
    });

  } catch (error) {
    console.error('❌ Error en /api/chat:', error);
    
    // Manejar errores específicos de Gemini
    if (error.message?.includes('API_KEY_INVALID')) {
      return res.status(500).json({ 
        error: 'Error de configuración del servicio de IA',
        details: 'API key inválida' 
      });
    }

    if (error.message?.includes('RATE_LIMIT')) {
      return res.status(429).json({ 
        error: 'Demasiadas consultas. Intenta de nuevo en unos momentos.' 
      });
    }

    if (error.message?.includes('SAFETY')) {
      return res.status(400).json({ 
        error: 'La consulta no cumple con las políticas de seguridad. Intenta reformular tu pregunta.' 
      });
    }

    return res.status(500).json({ 
      error: 'Error temporal procesando tu consulta. Intenta de nuevo.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}