# 🔧 Corrigir Erro de Build na Netlify

**Erro:** `Failed during stage 'Install dependencies': dependency_installation script returned non-zero exit code: 1`

**Solução:** Adicionar arquivo de configuração `netlify.toml`

---

## ✅ Solução Rápida (2 minutos)

### Passo 1: Criar Arquivo netlify.toml

1. Abra seu repositório no GitHub

1. Clique em **"Add file"** → **"Create new file"**

1. Nome: `netlify.toml`

1. Cole o conteúdo abaixo:

```
[build]
command = "pnpm run build"
publish = "dist/public"
node_version = "18"

[build.environment]
PNPM_VERSION = "9"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200

[[headers]]
for = "/assets/*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
for = "/index.html"
[headers.values]
Cache-Control = "public, max-age=0, must-revalidate"
```

1. Clique em **"Commit changes"**

### Passo 2: Redeploy na Netlify

1. Acesse sua conta Netlify

1. Vá para seu site `dxbet`

1. Clique em **"Deploys"**

1. Clique em **"Trigger deploy"** → **"Deploy site"**

1. Aguarde terminar

---

## 🎯 O Que Esse Arquivo Faz

| Configuração | O Que Faz |
| --- | --- |
| `command = "pnpm run build"` | Diz à Netlify como compilar o site |
| `publish = "dist/public"` | Diz qual pasta publicar |
| `node_version = "18"` | Usa Node.js versão 18 |
| `PNPM_VERSION = "9"` | Usa pnpm versão 9 |
| `[[redirects]]` | Redireciona URLs para index.html (necessário para SPA) |
| `[[headers]]` | Configura cache e segurança |

---

## ✅ Pronto!

Seu site deve fazer deploy com sucesso agora!

Se ainda tiver erro, verifique:

- [x] Arquivo `netlify.toml` está na raiz do repositório

- [x] Arquivo `package.json` está presente

- [x] Arquivo `dist/public/index.html` existe após build local

---

**Versão:** 1.0**Data:** Dezembro 2024

