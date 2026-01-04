# 🏋️ TotalFit - Aplicação de Treino e Dieta

Sistema completo para acompanhamento de treinos e dieta com progressão automática baseada em histórico de cargas.

## 📁 Estrutura do Projeto

```
academia/
├── backend/          # API Node.js + Express
├── frontend/         # React + Vite
└── database/         # Schema SQL do PostgreSQL
```

## 🚀 Deploy em Plataformas Free Tier

### 1️⃣ Banco de Dados - Neon (PostgreSQL Serverless)

**Passo a passo:**

1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto chamado "TotalFit"
3. Copie a **Connection String** (será algo como: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/totalfit?sslmode=require`)
4. No painel do Neon, vá em **SQL Editor**
5. Cole o conteúdo do arquivo `database/schema.sql` e execute
6. Verifique se as tabelas foram criadas com sucesso

**⚠️ Importante:** Guarde a connection string, você precisará dela no backend!

---

### 2️⃣ Backend - Render (Node.js)

**Passo a passo:**

1. Faça commit do código no GitHub:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend setup"
   git push origin main
   ```

2. Acesse [render.com](https://render.com) e faça login com GitHub
3. Clique em **New +** → **Web Service**
4. Conecte seu repositório GitHub
5. Configure:
   - **Name:** `totalfit-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

6. **Variáveis de Ambiente (Environment Variables):**
   ```
   DATABASE_URL=postgresql://[COLE_SUA_CONNECTION_STRING_DO_NEON]
   JWT_SECRET=seu_token_jwt_super_secreto_aqui
   NODE_ENV=production
   FRONTEND_URL=https://[SEU_APP_VERCEL].vercel.app
   ```

7. Clique em **Create Web Service**
8. Aguarde o deploy (pode levar 2-3 minutos)
9. **Copie a URL do backend** (será algo como: `https://totalfit-api.onrender.com`)

**⚠️ Atenção:** O Render Free Tier "dorme" após 15 minutos de inatividade. A primeira requisição após o período de inatividade pode demorar ~30 segundos para "acordar" o servidor.

---

### 3️⃣ Frontend - Vercel (React)

**Passo a passo:**

1. No diretório `frontend`, crie o arquivo `.env`:
   ```bash
   cd frontend
   echo "VITE_API_URL=https://[SUA_URL_DO_RENDER].onrender.com" > .env
   ```

2. Faça commit do frontend:
   ```bash
   git init
   git add .
   git commit -m "Initial frontend setup"
   git push origin main
   ```

3. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
4. Clique em **Add New** → **Project**
5. Selecione seu repositório do frontend
6. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` (se estiver em monorepo)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

7. **Environment Variables:**
   ```
   VITE_API_URL=https://[SUA_URL_DO_RENDER].onrender.com
   ```

8. Clique em **Deploy**
9. Após o deploy, copie a URL do seu site (ex: `https://totalfit.vercel.app`)

10. **IMPORTANTE:** Volte no Render e atualize a variável `FRONTEND_URL` com a URL da Vercel!

---

## 🧪 Testar Localmente

### Backend:
```bash
cd backend
cp .env.example .env
# Edite o .env com suas credenciais do Neon
npm install
npm start
# API rodando em http://localhost:3000
```

### Frontend:
```bash
cd frontend
cp .env.example .env
# Edite o .env com a URL do backend (http://localhost:3000 para local)
npm install
npm run dev
# App rodando em http://localhost:5173
```

---

## 📊 Schema do Banco de Dados

### Tabelas Principais:

- **`users`** - Usuários do sistema
- **`exercise_library`** - Biblioteca de exercícios (com vídeos)
- **`daily_routine`** - Rotina diária (treino/dieta por data)
- **`workout_session`** - Sessões de treino
- **`workout_sets`** - Séries executadas (com histórico de cargas)
- **`meal_log`** - Log de refeições

### 🔥 Funcionalidade Crítica - Progressão Automática:

O sistema busca automaticamente a **última carga utilizada** em cada exercício através da rota:

```
GET /api/workout/last-weight/:userId/:exerciseId
```

Isso permite que o usuário veja imediatamente qual peso usou na última vez e tente superar!

---

## 🛠️ Próximos Passos

**Agora você pode enviar o HTML/CSS das telas!**

Envie uma tela por vez e eu vou:
1. ✅ Componentizar para React
2. ✅ Trocar classes por `className`
3. ✅ Injetar lógica (`useState`, `useEffect`, `axios`)
4. ✅ Conectar com as rotas da API
5. ✅ Implementar funcionalidades de treino/dieta

---

## 📝 Notas Técnicas

### CORS Configurado:
O backend já está configurado para aceitar requisições da Vercel. A configuração está em `backend/server.js`:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true
};
```

### Conexão com Neon:
O backend usa o driver `pg` (node-postgres) com SSL habilitado, compatível com Neon Serverless.

### Segurança:
- Senhas devem ser hasheadas com `bcryptjs` (já incluído nas dependências)
- JWT deve ser implementado para autenticação (já incluído nas dependências)

---

## 📞 Suporte

Se encontrar algum erro de CORS, banco de dados ou deploy:
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se a connection string do Neon tem `?sslmode=require`
3. Teste a API primeiro com ferramentas como Postman/Insomnia
4. Verifique os logs no Render Dashboard

---

**Estrutura criada com sucesso! ✅**

Aguardando o HTML/CSS da primeira tela para começarmos a conversão para React! 🚀
