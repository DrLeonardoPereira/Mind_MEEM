#!/bin/bash

# ============================================================================
# Post-Start Hook for Development Container
# ============================================================================
# Runs every time the container starts to ensure environment is ready
# ============================================================================

set -e

echo "🌟 Iniciando verificações de ambiente..."

# ============================================================================
# Activate Python Virtual Environment
# ============================================================================

if [ -d "venv" ]; then
  echo "🐍 Ativando ambiente virtual Python..."
  source venv/bin/activate
  echo "✅ Ambiente Python ativado"
fi

# ============================================================================
# Verify Dependencies
# ============================================================================

echo "✓ Verificando dependências..."

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não encontrado"
  exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm não encontrado"
  exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
  echo "❌ Python3 não encontrado"
  exit 1
fi

echo "✅ Todas as dependências verificadas"

# ============================================================================
# Display Development URLs
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🎮 Mind MEEM Development Environment Ready         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📌 Frontend URLs:"
echo "   React Dev Server:  http://localhost:3000"
echo "   Vite Dev Server:   http://localhost:5173"
echo ""
echo "📌 Backend URLs:"
echo "   API Server:        http://localhost:8000"
echo "   Documentation:     http://localhost:8080"
echo ""
echo "📌 Quick Start Commands:"
echo "   npm run dev        # Start React dev server"
echo "   npm run build      # Build for production"
echo "   npm run test       # Run tests"
echo ""
echo "🐍 Python Commands:"
echo "   python -m venv venv          # Create virtual env"
echo "   source venv/bin/activate     # Activate virtual env"
echo "   pip install -r requirements.txt  # Install dependencies"
echo ""
echo "📚 Documentation:"
echo "   README.md          # Project overview"
echo "   .devcontainer/     # Container configuration"
echo ""
echo "✨ Happy Coding! 🚀"
echo ""

# ============================================================================
# Optional: Start Services (commented by default)
# ============================================================================

# Uncomment if you want services to auto-start

# # Start React dev server in background
# if [ -f "package.json" ]; then
#   echo "📦 Starting React dev server..."
#   npm run dev &
#   sleep 5
#   echo "✅ React server started on http://localhost:5173"
# fi

# # Start Python backend if configured
# if [ -f "requirements.txt" ]; then
#   echo "🐍 Starting Python backend..."
#   source venv/bin/activate
#   # Add your backend startup command here
#   # python manage.py runserver &
#   # sleep 3
# fi

# ============================================================================
# Git Hooks Setup (Optional)
# ============================================================================

echo "🔧 Configurando Git hooks..."

# Create pre-commit hook if it doesn't exist
if [ ! -f ".git/hooks/pre-commit" ]; then
  mkdir -p .git/hooks
  cat > .git/hooks/pre-commit << 'HOOK_EOF'
#!/bin/bash
# Run linting before commit
echo "Running pre-commit checks..."
npm run lint --fix 2>/dev/null || true
HOOK_EOF
  chmod +x .git/hooks/pre-commit
  echo "✅ Git pre-commit hook criado"
fi

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "🎯 Ambiente configurado com sucesso!"
echo "   Agora você pode executar: npm run dev"
echo ""
