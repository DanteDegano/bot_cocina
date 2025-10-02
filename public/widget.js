// ChefBot Widget - Standalone Script
(function() {
  'use strict';
  
  // Verificar si el widget ya está cargado
  if (window.ChefBotWidgetLoaded) {
    return;
  }
  window.ChefBotWidgetLoaded = true;

  // Función para crear el widget
  function createChefBotWidget() {
    // Verificar si ya existe el contenedor
    let container = document.getElementById('chefbot-widget');
    if (!container) {
      container = document.createElement('div');
      container.id = 'chefbot-widget';
      document.body.appendChild(container);
    }

    // Crear el botón flotante
    const floatingButton = document.createElement('div');
    floatingButton.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        border-radius: 50%;
        box-shadow: 0 4px 20px rgba(255, 165, 0, 0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        transition: all 0.3s ease;
        font-size: 24px;
      " 
      id="chefbot-button"
      onmouseover="this.style.transform='scale(1.1)'"
      onmouseout="this.style.transform='scale(1)'"
      onclick="openChefBotChat()">
        👨‍🍳
      </div>
    `;

    container.appendChild(floatingButton);

    // Variable para controlar si el chat está abierto
    window.chefBotChatOpen = false;
  }

  // Función para abrir el chat
  window.openChefBotChat = function() {
    if (window.chefBotChatOpen) {
      return;
    }

    window.chefBotChatOpen = true;
    
    // Crear el iframe del chat
    const chatIframe = document.createElement('iframe');
    chatIframe.src = 'https://bot-cocina.vercel.app/widget';
    chatIframe.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      height: 600px;
      border: none;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 10001;
      transition: all 0.3s ease;
      background: white;
    `;
    chatIframe.id = 'chefbot-chat-iframe';

    // Botón de cerrar
    const closeButton = document.createElement('div');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      position: fixed;
      bottom: 590px;
      right: 30px;
      width: 30px;
      height: 30px;
      background: #ff4757;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10002;
      font-size: 16px;
      font-weight: bold;
    `;
    closeButton.onclick = window.closeChefBotChat;

    // Agregar elementos al DOM
    document.body.appendChild(chatIframe);
    document.body.appendChild(closeButton);

    // Responsive para móviles
    if (window.innerWidth <= 768) {
      chatIframe.style.width = 'calc(100vw - 20px)';
      chatIframe.style.height = 'calc(100vh - 40px)';
      chatIframe.style.bottom = '10px';
      chatIframe.style.right = '10px';
      chatIframe.style.left = '10px';
      
      closeButton.style.bottom = 'calc(100vh - 50px)';
      closeButton.style.right = '20px';
    }
  };

  // Función para cerrar el chat
  window.closeChefBotChat = function() {
    const iframe = document.getElementById('chefbot-chat-iframe');
    const closeBtn = document.querySelector('[onclick="closeChefBotChat()"]');
    
    if (iframe) iframe.remove();
    if (closeBtn) closeBtn.remove();
    
    window.chefBotChatOpen = false;
  };

  // API pública del widget
  window.ChefBotWidget = {
    init: createChefBotWidget,
    open: window.openChefBotChat,
    close: window.closeChefBotChat,
    version: '1.0.0'
  };

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChefBotWidget);
  } else {
    createChefBotWidget();
  }

  console.log('ChefBot Widget cargado correctamente v1.0.0');
})();