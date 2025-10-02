# 🍳 ChefBot - Asistente de Cocina con IA

Un chatbot inteligente especializado en cocina que utiliza la API de Google Gemini para ayudar con recetas, técnicas culinarias, sustituciones de ingredientes y consejos de cocina.

## 🌟 Características

- **Asistente especializado**: Entrenado específicamente para temas de cocina
- **Respuestas inteligentes**: Powered by Google Gemini AI
- **Widget embebible**: Se puede integrar fácilmente en cualquier sitio web
- **Interfaz responsive**: Funciona en desktop y móviles
- **Sugerencias rápidas**: Preguntas comunes para comenzar rápidamente
- **Historial de conversación**: Mantiene el contexto durante la sesión

## 🚀 Demo en Vivo

- **Aplicación completa**: [https://tu-dominio.vercel.app](https://tu-dominio.vercel.app)
- **Widget**: [https://tu-dominio.vercel.app/widget](https://tu-dominio.vercel.app/widget)

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/bot-cocina-gemini.git
cd bot-cocina-gemini
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

1. Copia el archivo `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

2. Obtén tu API key de Google Gemini:
   - Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crea una nueva API key
   - Copia la clave

3. Edita `.env.local` y agrega tu API key:
```
VITE_GEMINI_API_KEY=tu_clave_api_aqui
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Deployment en Vercel

### Automático (Recomendado)

1. Conecta tu repositorio de GitHub con Vercel
2. Agrega la variable de entorno `VITE_GEMINI_API_KEY` en el dashboard de Vercel
3. Deploy automático

### Manual

```bash
npm run build
npx vercel
```

## 🔧 Integración del Widget

### ✅ Sin Problemas de CORS

El widget está **completamente configurado** para funcionar en dominios externos sin restricciones de CORS:

- ✅ Headers CORS configurados en Vercel
- ✅ Estilos CSS aislados para evitar conflictos
- ✅ Contenedor encapsulado con selectores específicos
- ✅ API pública accesible desde cualquier dominio
- ✅ Fallbacks para navegadores con restricciones

### Método 1: Script directo (Recomendado)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Sitio Web</title>
</head>
<body>
    <!-- Tu contenido -->
    
    <!-- ChefBot Widget -->
    <script src="https://tu-dominio.vercel.app/widget.js"></script>
</body>
</html>
```

### Método 2: Con configuración personalizada

```html
<script src="https://tu-dominio.vercel.app/widget.js"></script>
<script>
// Configuración opcional
window.ChefBotWidget.init({
    position: 'bottom-right',  // bottom-left, bottom-right, top-left, top-right
    theme: 'default',          // default, dark, light
    debug: false              // true para logs de debugging
});
</script>
```

### Método 3: Iframe (Fallback)

```html
<iframe 
    src="https://tu-dominio.vercel.app/widget" 
    width="350" 
    height="500" 
    frameborder="0"
    style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;"
    allow="camera; microphone; geolocation">
</iframe>
```

### Método 4: Inicialización manual

```html
<div id="chefbot-widget"></div>
<script src="https://tu-dominio.vercel.app/widget.js"></script>
<script>
    // Control manual completo
    setTimeout(() => {
        if (window.ChefBotWidget) {
            window.ChefBotWidget.init({
                debug: true
            });
        }
    }, 1000);
</script>
```

## 🔍 Verificación y Debugging

### API del Widget

```javascript
// Verificar que el widget se cargó correctamente
if (window.ChefBotWidget) {
    console.log('✅ Widget disponible');
    console.log('Versión:', window.ChefBotWidget.version);
    console.log('Soporte CORS:', window.ChefBotWidget.checkCorsSupport());
}
```

### Funciones disponibles

```javascript
window.ChefBotWidget = {
    init: function(config) { },        // Inicializar widget
    destroy: function() { },           // Remover widget del DOM
    checkCorsSupport: function() { },  // Verificar soporte CORS
    version: '1.0.0'                   // Versión del widget
}
```

### Script de prueba completo

```html
<script>
function testChefBotWidget() {
    if (window.ChefBotWidget) {
        console.log('🧪 Iniciando pruebas...');
        
        // Verificar funciones
        console.log('✅ init:', typeof window.ChefBotWidget.init);
        console.log('✅ destroy:', typeof window.ChefBotWidget.destroy);
        console.log('✅ checkCorsSupport:', typeof window.ChefBotWidget.checkCorsSupport);
        
        // Verificar soporte CORS
        const corsSupport = window.ChefBotWidget.checkCorsSupport();
        console.log('🌐 Soporte CORS:', corsSupport ? '✅ Sí' : '❌ No');
        
        // Verificar contenedor
        const container = document.getElementById('chefbot-widget');
        console.log('📦 Contenedor:', container ? '✅ Encontrado' : '❌ No encontrado');
        
        console.log('🎉 Pruebas completadas');
    } else {
        console.error('❌ ChefBot Widget no disponible');
    }
}

// Ejecutar después de 3 segundos
setTimeout(testChefBotWidget, 3000);
</script>
```

## 📱 Uso del ChefBot

### Ejemplos de preguntas:

- **Recetas**: "¿Cómo hago pasta carbonara?"
- **Sustituciones**: "¿Con qué puedo reemplazar los huevos en una torta?"
- **Técnicas**: "¿Cómo se hace un sofrito perfecto?"
- **Consejos**: "¿Cómo evito que se me queme el ajo?"
- **Planificación**: "Dame ideas para un menú semanal saludable"

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   └── ChatBot.jsx          # Componente principal del chat
├── services/
│   └── geminiService.js     # Servicio para la API de Gemini
├── styles/
│   └── chatbot.css          # Estilos del chatbot
├── App.jsx                  # Aplicación principal
├── main.jsx                 # Entry point principal
└── widget.jsx               # Entry point del widget
```

## 🎨 Personalización

### Colores y estilos

Modifica las variables CSS en `src/styles/chatbot.css`:

```css
:root {
  --primary-color: #ff6b35;      /* Color principal */
  --primary-dark: #e55a2b;       /* Color principal oscuro */
  --secondary-color: #2c3e50;    /* Color secundario */
  --accent-color: #f39c12;       /* Color de acento */
  /* ... más variables */
}
```

### Prompts del asistente

Modifica el prompt del sistema en `src/services/geminiService.js`:

```javascript
getSystemPrompt() {
  return `Tu prompt personalizado aquí...`;
}
```

## 🔒 Seguridad

- ✅ Variables de entorno para API keys
- ✅ CORS habilitado para el widget
- ✅ Validación de entrada de usuario
- ✅ Manejo de errores robusto

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa las [Issues existentes](https://github.com/tu-usuario/bot-cocina-gemini/issues)
2. Crea una nueva [Issue](https://github.com/tu-usuario/bot-cocina-gemini/issues/new)
3. Contacta al desarrollador

## 🙏 Agradecimientos

- [Google Gemini AI](https://ai.google.dev/) por la API de inteligencia artificial
- [React](https://reactjs.org/) por el framework
- [Vite](https://vitejs.dev/) por la herramienta de build
- [Vercel](https://vercel.com/) por el hosting

---

Hecho con ❤️ y mucha 🍳 por [Tu Nombre]