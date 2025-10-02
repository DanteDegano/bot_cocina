#!/bin/bash

# Script de deployment para ChefBot
echo "🍳 Desplegando ChefBot..."

# Verificar que existe la API key
if [ -z "$VITE_GEMINI_API_KEY" ]; then
    echo "❌ Error: VITE_GEMINI_API_KEY no está configurada"
    echo "Configura tu API key en las variables de entorno de Vercel"
    exit 1
fi

# Build del proyecto
echo "📦 Construyendo proyecto..."
npm run build

echo "✅ Build completado"
echo "🚀 El proyecto está listo para Vercel"
echo ""
echo "Pasos siguientes:"
echo "1. Conecta este repositorio con Vercel"
echo "2. Configura la variable VITE_GEMINI_API_KEY en Vercel"
echo "3. Deploy automático"