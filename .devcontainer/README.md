# 🎮 Mind MEEM - Dev Container Setup

## 🚀 Abrir Ambiente no GitHub Codespaces (Recomendado)

A forma **mais fácil** para iniciar é usar GitHub Codespaces - sem precisar instalar nada localmente!

### Opção 1: Um Clique (Recomendado)

1. **Clique no botão verde "Code"** no repositório
2. **Selecione a aba "Codespaces"**
3. **Clique em "Create codespace on main"**
4. **Aguarde a inicialização** (2-3 minutos na primeira vez)
5. **Pronto!** Seu ambiente está configurado automaticamente

### Opção 2: Abrir Dev Container Localmente

Se você tem Docker instalado, pode abrir em sua máquina local:

**VS Code:**
1. Instale a extensão "Dev Containers" (Microsoft)
2. Abra a pasta do projeto em VS Code
3. Clique no ícone **"><"** no canto inferior esquerdo
4. Selecione "Reopen in Container"
5. Aguarde a construção da imagem (primeira vez: 5-10 minutos)

**GitHub.dev (No Navegador):**
1. Pressione a tecla **"."** (ponto) no repositório GitHub
2. Ou vá para `github.dev/DrLeonardoPereira/Mind_MEEM`
3. Abra o terminal integrado
4. Execute os comandos abaixo

---

## 📦 Ambiente Automaticamente Configurado

Quando o container inicia, você recebe automaticamente:

✅ **Node.js 20** com npm  
✅ **Python 3.11** com pip  
✅ **Git** + GitHub CLI  
✅ **Docker** (Docker-in-Docker)  
✅ **TypeScript**, **React**, **Tailwind CSS**  
✅ **VS Code Extensions** pré-instaladas  
✅ **Todas as dependências do projeto**  

---

## 🎯 Primeiros Passos

### 1️⃣ Verificar Ambiente
```bash
node --version     # Deve ser v20.x
npm --version      # Deve ser 10.x+
python3 --version  # Deve ser 3.11+
```

### 2️⃣ Iniciar Frontend React
```bash
npm run dev
```
**Acesso:** http://localhost:5173 ou http://localhost:3000

### 3️⃣ Iniciar Backend Python (opcional)
```bash
source venv/bin/activate
python manage.py runserver
```
**Acesso:** http://localhost:8000

### 4️⃣ Explorar o Código
- **Componentes React:** `src/components/`
- **Custom Hooks:** `src/hooks/useGameLogic.ts`
- **Context Global:** `src/contexts/GameContext.tsx`
- **Utilitários:** `src/utils/csvExport.ts`

---

## 📁 Estrutura do Projeto

```
Mind_MEEM/
├── .devcontainer/
│   ├── devcontainer.json       # Configuração do container
│   ├── post-create.sh          # Setup inicial
│   └── post-start.sh           # Setup ao iniciar
├── src/
│   ├── components/
│   │   ├── buttons/
│   │   │   └── PrimaryButton.tsx
│   │   └── cards/
│   │       └── SelectionCard.tsx
│   ├── contexts/
│   │   └── GameContext.tsx
│   ├── hooks/
│   │   └── useGameLogic.ts
│   ├── utils/
│   │   └── csvExport.ts
│   ├── pages/
│   ├── styles/
│   └── App.tsx
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── requirements.txt
└── README.md
```

---

## 🔧 Comandos Úteis

### Frontend React
```bash
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview do build
npm run test             # Executa testes
npm run lint             # Verifica problemas de código
npm run lint:fix         # Corrige problemas automaticamente
```

### Backend Python
```bash
source venv/bin/activate           # Ativar ambiente virtual
pip install -r requirements.txt    # Instalar dependências
python manage.py runserver         # Iniciar servidor
python manage.py test              # Executar testes
deactivate                         # Desativar ambiente virtual
```

### Git
```bash
git status           # Verificar status
git add .            # Staged all changes
git commit -m "msg"  # Fazer commit
git push             # Enviar para repositório
git pull             # Atualizar do repositório
```

---

## 🌐 Acessando as Aplicações

Quando os servidores estão rodando:

| Serviço | URL | Porta |
|---------|-----|-------|
| React Dev Server | http://localhost:5173 | 5173 |
| React (alt) | http://localhost:3000 | 3000 |
| Backend API | http://localhost:8000 | 8000 |
| Documentação | http://localhost:8080 | 8080 |

**No Codespaces:** Clique nas notificações que aparecem no canto inferior direito do VS Code.

---

## ♿ Design Gerontológico

Todos os componentes seguem padrões de acessibilidade:

✅ **WCAG AAA Compliance** (Contraste 7:1+)  
✅ **Tamanhos Grandes** (Botões ≥ 64px, Cards ≥ 70px)  
✅ **Navegação por Teclado** (Anel de foco amarelo)  
✅ **Alto Contraste** (Modo configurável)  
✅ **Fontes Ajustáveis** (18-32px)  

### Componentes Criados

| Componente | Função |
|-----------|--------|
| `PrimaryButton.tsx` | Botão acessível com WCAG AAA |
| `SelectionCard.tsx` | Cards para múltipla escolha |
| `GameContext.tsx` | Estado global da aplicação |
| `useGameLogic.ts` | Lógica de fases com telemetria |
| `csvExport.ts` | Exportação de dados em CSV |

---

## 🐛 Troubleshooting

### "Node não encontrado" ou "npm não encontrado"
- Feche e reabra o terminal
- Ou recrie o container: `Dev Containers: Rebuild Container`

### Porta já em uso
```bash
# Encontrar processo usando porta
lsof -i :5173

# Matar processo
kill -9 <PID>
```

### Permissão negada em `.devcontainer/*.sh`
```bash
chmod +x .devcontainer/*.sh
```

### Ambiente Python não ativado
```bash
source venv/bin/activate
```

### Cache de node_modules problemático
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentação de Referência

- [Dev Containers Official Docs](https://containers.dev)
- [GitHub Codespaces](https://github.com/features/codespaces)
- [VS Code Remote Development](https://code.visualstudio.com/docs/remote/remote-overview)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 💡 Tips & Tricks

### Fazer Forward de Porta Customizado
```bash
# Exportar URL de acesso público
gh codespace ports visibility <port>:public
```

### Instalar Extensão VS Code Adicional
```bash
code --install-extension <publisher>.<extension>
```

### Debug de Container
```bash
# Conectar ao container rodando
docker exec -it <container_id> bash
```

### Compartilhar Ambiente com Colega
1. Clique em **"Codespaces"** na parte superior
2. Selecione seu codespace
3. Clique em **"Share"**
4. Copie o link e compartilhe

---

## 🤝 Contribuindo

1. Crie uma nova branch: `git checkout -b feature/sua-feature`
2. Faça suas alterações
3. Execute testes: `npm run test`
4. Commit: `git commit -m "Add: sua feature"`
5. Push: `git push origin feature/sua-feature`
6. Abra um Pull Request

---

## 📞 Suporte

**Dúvidas sobre o Dev Container?**
- Consulte a [documentação oficial](https://containers.dev)
- Abra uma issue no repositório

**Problemas com a aplicação?**
- Verifique o console do navegador (F12)
- Verifique os logs do terminal
- Abra uma issue com prints/logs

---

## ✨ Pronto para Começar?

```bash
# 1. Abrir em Codespaces (recomendado)
# 👉 Clique em Code > Codespaces > Create codespace on main

# 2. Após o container inicializar, execute:
npm run dev

# 3. Abra o navegador em:
http://localhost:5173

# 🚀 Happy Coding!
```

---

**Criado com ❤️ para pesquisadores e desenvolvedores**

Last Updated: 2026-05-28
