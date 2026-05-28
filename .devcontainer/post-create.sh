#!/bin/bash

# ============================================================================
# Post-Create Hook for Development Container
# ============================================================================
# Runs after the container is created to set up dependencies and environment
# ============================================================================

set -e

echo "🚀 Iniciando configuração do ambiente de desenvolvimento Mind MEEM..."

# ============================================================================
# Node.js and npm Setup
# ============================================================================

echo "📦 Verificando Node.js e npm..."
node --version
npm --version

# ============================================================================
# Install Node Dependencies
# ============================================================================

echo "📥 Instalando dependências do Node.js..."
if [ -f "package.json" ]; then
  npm install
  echo "✅ Dependências do Node.js instaladas"
else
  echo "⚠️  package.json não encontrado - pulando npm install"
fi

# ============================================================================
# Python Environment Setup
# ============================================================================

echo "🐍 Configurando ambiente Python..."
python3 --version

# Create virtual environment
if [ ! -d "venv" ]; then
  echo "📦 Criando ambiente virtual Python..."
  python3 -m venv venv
  echo "✅ Ambiente virtual criado"
fi

# Activate virtual environment
source venv/bin/activate

# ============================================================================
# Install Python Dependencies
# ============================================================================

echo "📥 Instalando dependências do Python..."
if [ -f "requirements.txt" ]; then
  pip install --upgrade pip
  pip install -r requirements.txt
  echo "✅ Dependências do Python instaladas"
else
  echo "⚠️  requirements.txt não encontrado - pulando pip install"
fi

# ============================================================================
# Git Configuration
# ============================================================================

echo "🔧 Configurando Git..."
git config --global --add safe.directory /workspaces/Mind_MEEM

# ============================================================================
# VS Code Extensions Installation
# ============================================================================

echo "📝 Instalando extensões do VS Code..."
# Extensions are auto-installed via devcontainer.json customizations

# ============================================================================
# Environment Variables
# ============================================================================

echo "🌍 Configurando variáveis de ambiente..."
if [ ! -f ".env.local" ]; then
  cat > .env.local << 'EOF'
# Development Environment Variables
NODE_ENV=development
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Mind MEEM
VITE_VERSION=0.1.0
PYTHON_ENV=development
PYTHONUNBUFFERED=1
EOF
  echo "✅ Arquivo .env.local criado"
else
  echo "✓ .env.local já existe"
fi

# ============================================================================
# Project Documentation
# ============================================================================

echo "📚 Criando arquivo de boas-vindas..."
cat > /tmp/WELCOME.md << 'EOF'
# 🎮 Bem-vindo ao Mind MEEM!

## Ambiente de Desenvolvimento Configurado ✅

Este é um **Development Container** completo com:
- ✅ Node.js 20 (React + TypeScript + Tailwind CSS)
- ✅ Python 3 (Backend API)
- ✅ Git + GitHub CLI
- ✅ VS Code Extensions pré-configuradas

## 🚀 Próximos Passos

### 1. Iniciar o Frontend React
```bash
npm run dev
# Acesso: http://localhost:5173
```

### 2. Iniciar o Backend Python (se configurado)
```bash
source venv/bin/activate
python manage.py runserver
# Acesso: http://localhost:8000
```

### 3. Explorar o Código
- **React Components**: `src/components/`
- **Custom Hooks**: `src/hooks/`
- **Contexto Global**: `src/contexts/GameContext.tsx`
- **Utilitários**: `src/utils/`

## 📋 Arquitetura

```
Mind_MEEM/
├── src/
│   ├── components/       # Componentes React reutilizáveis
│   ├── hooks/           # Custom hooks (useGameLogic, etc)
│   ├── contexts/        # Context API (GameContext)
│   ├── utils/           # Funções utilitárias (csvExport, etc)
│   ├── pages/           # Páginas da aplicação
│   └── styles/          # CSS global e Tailwind
├── .devcontainer/       # Configuração de Dev Container
├── requirements.txt     # Dependências Python
├── package.json         # Dependências Node.js
└── tailwind.config.js   # Configuração Tailwind CSS
```

## ♿ Design Gerontológico

Todos os componentes seguem princípios de acessibilidade:
- ✅ WCAG AAA Compliance (Contraste 7:1+)
- ✅ Tamanhos mínimos: 64px (botões), 70px (cards)
- ✅ Anel de foco amarelo de alta visibilidade
- ✅ Suporte a navegação por teclado
- ✅ Fontes ajustáveis (18-32px)
- ✅ Alto contraste configurável

## 🧪 Testes

```bash
# Executar testes
npm run test

# Cobertura
npm run test:coverage
```

## 📊 Build para Produção

```bash
# Build React
npm run build

# Verificar otimizações
npm run preview
```

## 🔗 Links Úteis

- [Documentação React](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 💬 Suporte

Questões? Dúvidas? Abra uma issue no repositório!

---

**Happy Coding! 🚀**
EOF

cat /tmp/WELCOME.md

# ============================================================================
# Final Verification
# ============================================================================

echo ""
echo "✅ ============================================"
echo "✅ Configuração concluída com sucesso!"
echo "✅ ============================================"
echo ""
echo "📌 Ambiente pronto para desenvolvimento"
echo "📌 Execute 'npm run dev' para iniciar"
echo ""
