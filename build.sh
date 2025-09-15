#!/bin/bash

# GAIA Equalizer React Native - Build Script
# Este script compila o projeto React Native para Android

echo "🎵 GAIA Equalizer React Native - Build Script"
echo "=============================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto React Native"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Executar lint fix
echo "🔧 Corrigindo erros de lint..."
npm run lint:fix

# Criar diretório de assets se não existir
echo "📁 Criando diretórios necessários..."
mkdir -p android/app/src/main/assets

# Compilar bundle para Android
echo "🔨 Compilando bundle para Android..."
npx react-native bundle \
    --platform android \
    --dev false \
    --entry-file index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "📱 Para executar no dispositivo/emulador:"
    echo "   npx react-native run-android"
    echo ""
    echo "🚀 Para iniciar o Metro bundler:"
    echo "   npx react-native start"
else
    echo "❌ Erro durante a compilação"
    exit 1
fi
