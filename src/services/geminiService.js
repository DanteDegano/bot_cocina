import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    this.init();
  }

  init() {
    if (!this.apiKey) {
      console.error('VITE_GEMINI_API_KEY no está configurada');
      return;
    }
    
    console.log('🔑 Inicializando Gemini con API key:', this.apiKey.substring(0, 10) + '...');
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // Usar el modelo más reciente y estable disponible
    try {
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      console.log('✅ Modelo gemini-2.5-flash cargado');
    } catch (error) {
      console.log('⚠️ Intentando con modelo alternativo...');
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
    }
  }

  // Método para probar la conexión
  async testConnection() {
    try {
      console.log('🧪 Probando conexión con Gemini...');
      const result = await this.model.generateContent('Di hola');
      const response = await result.response;
      const text = response.text();
      console.log('✅ Test exitoso:', text);
      return true;
    } catch (error) {
      console.error('❌ Test falló:', error);
      return false;
    }
  }

  setMode(mode) {
    this.mode = mode;
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
      throw new Error('Servicio Gemini no inicializado correctamente. Verifica tu API key.');
    }

    try {
      // Construir el contexto completo
      const systemPrompt = this.getSystemPrompt();
      
      // Agregar historial de conversación si existe
      let fullPrompt = systemPrompt + "\n\n";
      
      if (conversationHistory.length > 0) {
        fullPrompt += "Historial de conversación reciente:\n";
        conversationHistory.forEach((msg, index) => {
          fullPrompt += `${msg.role === 'user' ? 'Usuario' : 'ChefBot'}: ${msg.content}\n`;
        });
        fullPrompt += "\n";
      }
      
      fullPrompt += `Usuario: ${message}\nChefBot:`;

      console.log('🤖 Enviando mensaje a Gemini...');
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Respuesta recibida de Gemini');
      return text.trim();
    } catch (error) {
      console.error('❌ Error detallado al comunicarse con Gemini:', error);
      
      // Manejo específico de errores comunes
      if (error.message.includes('API_KEY_INVALID')) {
        throw new Error('API Key inválida. Verifica tu clave de Gemini.');
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        throw new Error('Límite de API excedido. Intenta más tarde.');
      } else if (error.message.includes('models/gemini-pro is not found')) {
        throw new Error('Modelo no encontrado. Actualizando configuración...');
      } else {
        throw new Error('Error de conexión con Gemini. Verifica tu internet e intenta de nuevo.');
      }
    }
  }

  // Método específico para obtener recetas
  async getRecipe(dishName, servings = 4, dietary = '') {
    const dietaryInfo = dietary ? ` (${dietary})` : '';
    const prompt = `Dame una receta completa para ${dishName}${dietaryInfo} para ${servings} personas. 
    Incluye:
    - Lista de ingredientes con cantidades exactas
    - Pasos detallados numerados
    - Tiempo de preparación y cocción
    - Nivel de dificultad
    - Consejos adicionales`;
    
    return await this.sendMessage(prompt);
  }

  // Método para sustituciones de ingredientes
  async getSubstitution(ingredient, context = '') {
    const contextInfo = context ? ` en ${context}` : '';
    const prompt = `¿Con qué puedo sustituir ${ingredient}${contextInfo}? 
    Explica las mejores alternativas y cómo afectan el resultado final.`;
    
    return await this.sendMessage(prompt);
  }

  // Método para técnicas culinarias
  async getTechnique(technique) {
    const prompt = `Explícame la técnica culinaria de ${technique}. 
    Incluye pasos, consejos y errores comunes a evitar.`;
    
    return await this.sendMessage(prompt);
  }
}

export default new GeminiService();