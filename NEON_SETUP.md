# 🔧 Guia Rápido: Configurar Neon Database

## ❌ Problema Identificado

O erro `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` indica que a `DATABASE_URL` não está configurada corretamente no arquivo `.env`.

---

## ✅ Solução: Passo a Passo

### 1️⃣ Criar Banco de Dados no Neon

1. Acesse: **https://console.neon.tech**
2. Faça login (ou crie uma conta gratuita)
3. Clique em **"New Project"**
4. Configure:
   - **Project Name:** `TotalFit`
   - **Region:** Escolha a mais próxima (ex: `us-east-2`)
   - **Postgres Version:** Deixe o padrão (16)
5. Clique em **"Create Project"**

---

### 2️⃣ Copiar Connection String

Após criar o projeto, você verá a **Connection String**:

```
postgresql://neondb_owner:AbCdEfGh1234@ep-cool-cloud-12345678.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**📋 Copie essa string completa!**

---

### 3️⃣ Configurar o Arquivo `.env`

Abra o arquivo: **`backend/.env`** (já foi criado)

Cole sua Connection String na variável `DATABASE_URL`:

```env
DATABASE_URL=postgresql://neondb_owner:SUA_SENHA_AQUI@ep-seu-endpoint.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANTE:** Use a string COMPLETA copiada do Neon, incluindo senha!

---

### 4️⃣ Criar as Tabelas no Neon

No painel do Neon, vá em **"SQL Editor"** e execute o script:

1. Abra o arquivo: **`database/schema.sql`**
2. Copie TODO o conteúdo
3. Cole no **SQL Editor** do Neon
4. Clique em **"Run"**

Você verá as tabelas sendo criadas:
- ✅ `users`
- ✅ `exercise_library`
- ✅ `daily_routine`
- ✅ `workout_session`
- ✅ `workout_sets`
- ✅ `meal_log`

---

### 5️⃣ Reiniciar o Backend

```bash
cd backend
npm start
```

Você deve ver:
```
🚀 TotalFit API rodando na porta 3000
✅ Conectado ao Neon PostgreSQL: 2026-01-02T...
```

---

## 🧪 Testar Conexão

Acesse no navegador:
```
http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-02T..."
}
```

---

## 🚨 Problemas Comuns

### Erro: "password authentication failed"
- ❌ Senha incorreta na `DATABASE_URL`
- ✅ Copie novamente a connection string do Neon

### Erro: "no pg_hba.conf entry"
- ❌ Faltou `?sslmode=require` no final da URL
- ✅ Adicione `?sslmode=require` no final da `DATABASE_URL`

### Erro: "timeout"
- ❌ Region do Neon muito distante
- ✅ Use uma region mais próxima (us-east-2 para BR)

---

## 📞 Ainda com Problemas?

Me envie:
1. A mensagem de erro completa
2. Os primeiros 20 caracteres da sua `DATABASE_URL` (sem a senha!)

Exemplo: `postgresql://neondb_owner:***@ep-cool-...`

---

**Após configurar o Neon, reinicie o backend e poderemos continuar com as próximas telas!** 🚀
