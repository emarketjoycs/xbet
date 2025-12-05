# 🚀 Publicar DxBet na Web SEM Instalar Nada (Windows)

**Você não precisa instalar nada no seu computador!**

Vamos publicar direto na Netlify usando apenas o navegador.

**Tempo total:** ~15 minutos

---

## 🎯 Como Funciona

1. **Você não instala nada** ✅
2. **Você não usa terminal** ✅
3. **Você só usa o navegador** ✅
4. **Seu site fica online** ✅

---

## 📋 O Que Você Precisa

- ✅ Navegador (Chrome, Firefox, Edge, Safari)
- ✅ Conta GitHub (grátis)
- ✅ Conta Netlify (grátis)
- ✅ Arquivo `DxBet-Completo.zip`

---

## 🔑 PASSO 1: Criar Conta GitHub (5 minutos)

### 1.1 Acessar GitHub

1. Abra seu navegador
2. Digite: **https://github.com**
3. Clique em **"Sign up"**

### 1.2 Preencher Formulário

1. **Email:** seu email
2. **Password:** uma senha forte
3. **Username:** seu nome de usuário (ex: `seu-nome-dxbet`)
4. Clique em **"Create account"**

### 1.3 Confirmar Email

1. GitHub enviará um email para você
2. Abra seu email
3. Clique no link de confirmação
4. Pronto! Conta criada

---

## 📁 PASSO 2: Fazer Upload do Código para GitHub (5 minutos)

### 2.1 Acessar GitHub

1. Faça login em: https://github.com
2. Clique no **"+"** no canto superior direito
3. Clique em **"New repository"**

### 2.2 Criar Repositório

Preencha:
- **Repository name:** `dxbet`
- **Description:** `Decentralized Betting Platform`
- **Public** (deixe selecionado)
- Clique em **"Create repository"**

### 2.3 Fazer Upload do Código

1. Você verá uma página com instruções
2. **Procure por:** "...or upload an existing file"
3. Clique em **"uploading an existing file"**

### 2.4 Fazer Upload do ZIP

1. **Arraste o arquivo** `DxBet-Completo.zip` para a área de upload
2. **OU** clique em "choose your files" e selecione o ZIP
3. Clique em **"Commit changes"**

### 2.5 Extrair o ZIP no GitHub

1. Você verá o arquivo `.zip` no repositório
2. Clique nele
3. Procure por um botão para **extrair** ou **descompactar**
4. **OU** você pode fazer isso manualmente:
   - Baixe o ZIP do GitHub
   - Extraia no seu computador
   - Faça upload dos arquivos extraídos

---

## 🌐 PASSO 3: Conectar Netlify com GitHub (5 minutos)

### 3.1 Criar Conta Netlify

1. Abra: **https://app.netlify.com**
2. Clique em **"Sign up"**
3. Clique em **"GitHub"**
4. **Autorize Netlify** a acessar sua conta GitHub
5. Pronto! Conta criada

### 3.2 Criar Novo Site

1. Na Netlify, clique em **"Add new site"**
2. Clique em **"Import an existing project"**
3. Clique em **"GitHub"**

### 3.3 Selecionar Repositório

1. Procure por **`dxbet`**
2. Clique para selecionar

### 3.4 Configurar Build

Você verá uma tela com campos:

**Build command:**
```
pnpm run build
```

**Publish directory:**
```
dist
```

Clique em **"Deploy site"**

---

## ⏳ PASSO 4: Aguardar Deploy (3-5 minutos)

Netlify vai:
1. Baixar seu código do GitHub
2. Compilar o site
3. Publicar online

Você verá um progresso assim:
```
Building...
✓ Build complete
✓ Deploy complete
```

---

## 🎉 PASSO 5: Seu Site Está Online!

Você receberá uma URL como:
```
https://seu-site-aleatorio.netlify.app
```

**Clique nela para acessar seu site!**

---

## 🔐 PASSO 6: Configurar WalletConnect (Importante!)

### 6.1 Obter Project ID

1. Abra: **https://cloud.walletconnect.com**
2. Clique em **"Sign Up"**
3. Crie novo projeto:
   - Nome: `DxBet`
   - Descrição: `Decentralized Betting Platform`
4. **COPIE o Project ID**

Exemplo:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 6.2 Adicionar em Netlify

1. Na Netlify, vá para seu site
2. Clique em: **Site settings**
3. Clique em: **Build & deploy**
4. Clique em: **Environment**
5. Clique em: **Edit variables**
6. Clique em **"Add a variable"**
7. Preencha:
   - **Key:** `VITE_WALLETCONNECT_PROJECT_ID`
   - **Value:** seu_project_id_aqui
8. Clique em **"Save"**

### 6.3 Redeploy

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
- ✅ Sem instalar nada no Windows

---

## 🔄 Fazer Mudanças Depois

Se você quer fazer mudanças no site:

### Opção 1: Usar GitHub Web (Sem Instalar)

1. Abra seu repositório no GitHub
2. Clique no arquivo que quer editar
3. Clique no ✏️ (editar)
4. Faça as mudanças
5. Clique em **"Commit changes"**
6. Netlify faz deploy automático!

### Opção 2: Fazer Upload de Novo

1. Baixe o arquivo modificado
2. Faça upload no GitHub
3. Netlify faz deploy automático!

---

## 🎯 Checklist Final

- [ ] Conta GitHub criada
- [ ] Repositório `dxbet` criado
- [ ] Código enviado para GitHub
- [ ] Conta Netlify criada
- [ ] Site conectado ao Netlify
- [ ] Build configurado
- [ ] Site online
- [ ] WalletConnect Project ID obtido
- [ ] Variável adicionada em Netlify
- [ ] Site redeploy feito
- [ ] Tudo funcionando!

---

## 🆘 Problemas Comuns

### Problema: "Build falha"
**Solução:**
1. Verifique se o arquivo `dist/public/` existe no ZIP
2. Se não existir, você precisa compilar localmente (instalar Node.js)
3. Ou peça para o desenvolvedor fornecer o arquivo compilado

### Problema: "WalletConnect não funciona"
**Solução:**
1. Verifique se Project ID está em Netlify
2. Redeploy o site
3. Limpe cache do navegador (Ctrl+Shift+Delete)

### Problema: "Não consigo fazer upload do ZIP"
**Solução:**
1. Extraia o ZIP no seu computador
2. Faça upload dos arquivos individuais no GitHub
3. Ou use um programa como GitHub Desktop

---

## 💡 Dicas

- **Domínio customizado:** Você pode comprar um domínio e apontar para Netlify
- **HTTPS:** Netlify oferece HTTPS grátis
- **Deploy automático:** Sempre que você faz mudanças no GitHub, Netlify publica automaticamente
- **Sem custo:** Tudo é grátis (GitHub, Netlify, WalletConnect)

---

## 📞 Próximos Passos

1. **Testar o site** - Acesse a URL da Netlify
2. **Testar conexão com carteira** - Clique em "Connect Wallet"
3. **Desenvolver smart contract** - Quando estiver pronto
4. **Integrar smart contract** - Conectar com o site

---

**Versão:** 1.0  
**Data:** Dezembro 2024  
**Nível:** Super Fácil (Sem Instalar Nada) 🎉
