# 🎓 Guia Super Simples: Como Instalar e Publicar o DxBet

**Não se preocupe! Vou explicar como se você nunca tivesse feito isso antes.**

---

## 📌 O Que Você Vai Fazer

Você vai:
1. **Baixar** o código do site
2. **Instalar** as dependências (como instalar um programa)
3. **Testar** localmente no seu computador
4. **Publicar** na Netlify (colocar online)

**Tempo total:** ~30 minutos

---

## 🎯 Pré-requisitos (O Que Você Precisa)

### 1. Node.js (Programa que executa JavaScript)

**O que é?** Um programa que permite rodar código JavaScript no seu computador.

**Como instalar:**
1. Acesse: https://nodejs.org
2. Clique em **"LTS"** (versão estável)
3. Baixe o instalador
4. Execute e siga as instruções (clique "Next" em tudo)
5. Reinicie o computador

**Como verificar se instalou:**
Abra o terminal/prompt e digite:
```
node --version
```

Deve aparecer algo como: `v18.17.0` ou superior

---

### 2. Git (Programa para controlar versões)

**O que é?** Um programa que ajuda a gerenciar código e fazer upload para GitHub.

**Como instalar:**
1. Acesse: https://git-scm.com
2. Clique em **"Download"**
3. Baixe o instalador
4. Execute e siga as instruções (clique "Next" em tudo)
5. Reinicie o computador

**Como verificar se instalou:**
Abra o terminal/prompt e digite:
```
git --version
```

Deve aparecer algo como: `git version 2.40.0`

---

### 3. Conta GitHub (Grátis)

**O que é?** Um site onde você guarda seu código online.

**Como criar:**
1. Acesse: https://github.com
2. Clique em **"Sign up"**
3. Preencha email, senha, username
4. Confirme o email
5. Pronto!

---

### 4. Conta Netlify (Grátis)

**O que é?** Um site que publica seu site na internet.

**Como criar:**
1. Acesse: https://app.netlify.com
2. Clique em **"Sign up"**
3. Clique em **"GitHub"**
4. Autorize Netlify a acessar sua conta GitHub
5. Pronto!

---

## 📥 PASSO 1: Baixar o Código

### 1.1 Baixar o ZIP

1. **Baixe o arquivo:** `DxBet-Completo.zip`
2. **Extraia em uma pasta** (clique direito → "Extrair aqui")
3. **Abra a pasta** `DxBet-Completo`

Você verá uma estrutura assim:
```
DxBet-Completo/
├── client/          (código do site)
├── package.json     (lista de dependências)
├── vite.config.ts   (configuração)
└── ... mais arquivos
```

---

## 🔧 PASSO 2: Instalar Dependências

**O que são dependências?** São programas que o seu site precisa para funcionar (como bibliotecas).

### 2.1 Abrir Terminal na Pasta

**No Windows:**
1. Abra a pasta `DxBet-Completo`
2. Clique em: **Arquivo** → **Abrir Terminal do Windows aqui**

**No Mac/Linux:**
1. Abra o Terminal
2. Digite: `cd /caminho/para/DxBet-Completo`

### 2.2 Instalar pnpm (Gerenciador de Pacotes)

**O que é pnpm?** Um programa que baixa e instala as dependências do seu site.

Digite no terminal:
```bash
npm install -g pnpm
```

Aguarde terminar (pode levar 1-2 minutos).

### 2.3 Instalar Dependências do Projeto

Digite no terminal:
```bash
pnpm install
```

Aguarde terminar (pode levar 3-5 minutos).

**Você verá muitas linhas sendo processadas. Isso é normal!**

Quando terminar, você verá:
```
✓ All dependencies installed
```

---

## 🧪 PASSO 3: Testar Localmente

**O que significa?** Rodar o site no seu computador antes de publicar.

### 3.1 Iniciar Servidor de Desenvolvimento

Digite no terminal:
```bash
pnpm run dev
```

Você verá algo assim:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

### 3.2 Abrir no Navegador

1. Abra seu navegador (Chrome, Firefox, Safari, Edge)
2. Digite na barra de endereço: `http://localhost:5173`
3. Pressione Enter

**Você deve ver o site DxBet carregando!**

### 3.3 Testar o Site

- [ ] Página inicial carrega?
- [ ] Menu funciona?
- [ ] Botão "Connect Wallet" aparece?
- [ ] Clique em "Como Apostar" - funciona?
- [ ] Clique em "Whitepaper" - funciona?

Se tudo funcionar, ótimo! Seu site está pronto.

### 3.4 Parar o Servidor

Quando quiser parar, volte ao terminal e pressione:
```
Ctrl + C
```

---

## 🌐 PASSO 4: Publicar na Netlify

**O que significa?** Colocar seu site na internet para que outras pessoas acessem.

### 4.1 Fazer Upload para GitHub

**Por que GitHub?** Porque Netlify se conecta ao GitHub para fazer deploy automático.

#### 4.1.1 Inicializar Git

No terminal (na pasta DxBet-Completo), digite:
```bash
git init
```

#### 4.1.2 Adicionar Todos os Arquivos

```bash
git add .
```

#### 4.1.3 Fazer Commit (Salvar)

```bash
git commit -m "Initial commit: DxBet platform"
```

#### 4.1.4 Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. **Repository name:** `dxbet`
3. **Description:** `Decentralized Betting Platform`
4. Clique em **"Create repository"**
5. **COPIE a URL** que aparece (algo como: `https://github.com/seu-usuario/dxbet.git`)

#### 4.1.5 Fazer Push para GitHub

No terminal, digite (substitua a URL):
```bash
git remote add origin https://github.com/seu-usuario/dxbet.git
git branch -M main
git push -u origin main
```

Você verá mensagens de upload. Aguarde terminar.

**Pronto! Seu código está no GitHub!**

---

### 4.2 Conectar Netlify com GitHub

#### 4.2.1 Acessar Netlify

1. Acesse: https://app.netlify.com
2. Faça login com sua conta GitHub

#### 4.2.2 Criar Novo Site

1. Clique em **"Add new site"**
2. Clique em **"Import an existing project"**
3. Clique em **"GitHub"**

#### 4.2.3 Autorizar Netlify

1. Clique em **"Authorize Netlify"**
2. Autorize Netlify a acessar sua conta GitHub
3. Clique em **"Install"**

#### 4.2.4 Selecionar Repositório

1. Procure por **`dxbet`**
2. Clique para selecionar

#### 4.2.5 Configurar Build

Você verá uma tela com:

**Build command:** (deixe em branco ou apague)
```
pnpm run build
```

**Publish directory:** (deixe em branco ou apague)
```
dist
```

Clique em **"Deploy site"**

---

### 4.3 Aguardar Deploy

Netlify vai:
1. Baixar seu código do GitHub
2. Instalar dependências
3. Compilar o site
4. Publicar online

Isso leva ~2-3 minutos.

Você verá um progresso assim:
```
Building...
✓ Build complete
✓ Deploy complete
```

---

### 4.4 Seu Site Está Online!

Você receberá uma URL como:
```
https://seu-site-aleatorio.netlify.app
```

**Clique nela para acessar seu site online!**

---

## 🔐 PASSO 5: Configurar WalletConnect (Importante!)

**O que é WalletConnect?** É o que permite conectar sua carteira (MetaMask) ao site.

### 5.1 Obter Project ID

1. Acesse: https://cloud.walletconnect.com
2. Clique em **"Sign Up"** (ou faça login)
3. Crie novo projeto:
   - Nome: `DxBet`
   - Descrição: `Decentralized Betting Platform`
4. **COPIE o Project ID** (exemplo: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### 5.2 Adicionar em Netlify

1. Na Netlify, vá para seu site
2. Clique em: **Site settings**
3. Clique em: **Build & deploy**
4. Clique em: **Environment**
5. Clique em: **Edit variables**
6. Adicione:

| Chave | Valor |
|-------|-------|
| `VITE_WALLETCONNECT_PROJECT_ID` | seu_project_id_aqui |

7. Clique em **"Save"**

### 5.3 Redeploy

1. Volte para **Deploys**
2. Clique em **"Trigger deploy"** → **"Deploy site"**
3. Aguarde terminar

---

## ✅ Pronto! Seu Site Está Online!

Você agora tem:
- ✅ Site publicado na Netlify
- ✅ WalletConnect configurado
- ✅ Domínio automático (seu-site.netlify.app)
- ✅ HTTPS seguro
- ✅ Deploy automático (quando fizer push no GitHub)

---

## 🔄 Próximas Vezes (Mais Rápido)

Se você quer fazer mudanças:

### Testar Localmente
```bash
cd DxBet-Completo
pnpm run dev
```

### Publicar Mudanças
```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

Netlify faz deploy automático!

---

## 🆘 Problemas Comuns

### Problema: "Command not found: pnpm"
**Solução:**
```bash
npm install -g pnpm
```

### Problema: "Port 5173 already in use"
**Solução:** Feche outras abas do terminal ou use outra porta:
```bash
pnpm run dev -- --port 3000
```

### Problema: "Build falha na Netlify"
**Solução:** Teste localmente:
```bash
pnpm run build
```

Se der erro, veja qual é e corrija.

### Problema: "WalletConnect não funciona"
**Solução:**
1. Verifique se Project ID está em Netlify
2. Redeploy o site
3. Limpe cache do navegador (Ctrl+Shift+Delete)

---

## 📚 Resumo dos Comandos Importantes

| Comando | O que faz |
|---------|-----------|
| `pnpm install` | Instala dependências |
| `pnpm run dev` | Testa localmente |
| `pnpm run build` | Compila para produção |
| `git add .` | Marca arquivos para upload |
| `git commit -m "msg"` | Salva as mudanças |
| `git push origin main` | Envia para GitHub |

---

## 🎉 Você Conseguiu!

Parabéns! Você:
1. ✅ Instalou o Node.js
2. ✅ Baixou o código
3. ✅ Instalou dependências
4. ✅ Testou localmente
5. ✅ Fez upload para GitHub
6. ✅ Publicou na Netlify
7. ✅ Configurou WalletConnect

**Seu site está online e pronto para usar!** 🚀

---

## 📞 Próximos Passos

1. **Testar o site** - Acesse a URL da Netlify
2. **Testar conexão com carteira** - Clique em "Connect Wallet"
3. **Desenvolver smart contract** - Quando estiver pronto
4. **Integrar smart contract** - Conectar com o site

---

**Versão:** 1.0  
**Data:** Dezembro 2024  
**Nível:** Super Simples 🎓
