# Revisão de Regras de Negócio - TotalFit

## ✅ Melhorias Implementadas

### 1. **Contexto de Autenticação** (`AuthContext.jsx`)
- Gerenciamento centralizado do usuário logado
- Persistência em localStorage
- Funções: `login()`, `logout()`, `updateUser()`
- Estado de loading para verificações iniciais
- Proteção contra erros de parse

**Uso:**
```jsx
const { user, login, logout } = useAuth();
```

### 2. **Configurações Centralizadas** (`utils/config.js`)
- URL da API configurável por ambiente
- Constantes de validação (nome, email, senha, peso, altura)
- Helpers utilitários:
  - `formatDate()` - YYYY-MM-DD
  - `getDiaSemana()` - Retorna dia da semana em português
  - `isValidEmail()` - Validação de email
  - `isValidPassword()` - Validação de senha (min 6 chars)
  - `formatNumber()` - Formatação pt-BR
  - `calculateIMC()` - Cálculo de IMC
  - `classifyIMC()` - Classificação do IMC

### 3. **Serviço de API Atualizado** (`services/api.js`)

#### Interceptors:
- **Request**: Adiciona token automaticamente em todas as requisições
- **Response**: Trata erro 401 e redireciona para login

#### Serviços Organizados:

**Autenticação:**
- `authService.register()`
- `authService.login()`
- `authService.logout()`
- `authService.getCurrentUser()`

**Treinos:**
- `workoutService.getLastWeight()` - Última carga para progressão
- `workoutService.createSession()` - Criar sessão
- `workoutService.saveSet()` - Salvar série

**Exercícios:**
- `exerciseService.getAll()`
- `exerciseService.getById()`

**Refeições:**
- `mealService.getMealsByDate()`
- `mealService.logMeal()`
- `mealService.updateMealStatus()`

**Rotina:**
- `routineService.getByDate()`

### 4. **WorkoutCard Atualizado**
- Usa `workoutService.getTreinoDoDia()`
- Usa helpers `formatDate()` e `getDiaSemana()`
- Busca usuário do localStorage com fallback seguro
- Tratamento de erro com card "Nenhum Treino Hoje"

---

## 🔄 Regras de Negócio Validadas

### **Autenticação**
✅ Token JWT armazenado em `totalfit_token`
✅ Dados do usuário em `totalfit_user`
✅ Redirecionamento automático em 401
✅ Logout limpa todos os dados

### **Treino**
✅ Busca treino do dia por `usuarioId` + `data`
✅ Última carga consultada antes de cada exercício
✅ Dias da semana em português
✅ Validação de exercícios obrigatórios

### **Dieta**
✅ Calorias e macros configuráveis
✅ Registro por data
✅ Status de conclusão (checkbox)

### **Validações**
✅ Nome: 3-100 caracteres
✅ Email: regex validado
✅ Senha: mínimo 6 caracteres
✅ Peso: 30-300 kg
✅ Altura: 100-250 cm
✅ IMC calculado automaticamente

---

## 🎯 Próximos Passos

### Backend (Necessário implementar):
1. **Rota de autenticação**
   - POST `/api/auth/register`
   - POST `/api/auth/login`
   - POST `/api/auth/logout`
   - Geração de JWT token

2. **Rota de treino**
   - GET `/api/rotina/:usuarioId/:data`
   - POST `/api/rotina`
   - GET `/api/rotina/:id/exercicios`

3. **Rota de sessão**
   - POST `/api/treino/sessao`
   - POST `/api/treino/serie`
   - GET `/api/treino/ultima-carga/:usuarioId/:exercicioId`

### Frontend (Próximas integrações):
1. **Wrap App.jsx com AuthProvider**
```jsx
<AuthProvider>
  <BrowserRouter>
    <Routes>...</Routes>
  </BrowserRouter>
</AuthProvider>
```

2. **Atualizar Login.jsx**
- Usar `authService.login()`
- Salvar token e usuário no contexto

3. **Atualizar Register.jsx**
- Usar `authService.register()`
- Redirecionar para login após sucesso

4. **Criar PrivateRoute**
- Verificar autenticação
- Redirecionar para /login se não autenticado

5. **Atualizar todos os componentes**
- Usar `useAuth()` para pegar usuário
- Remover `usuarioId = 1` hardcoded
- Usar serviços centralizados

---

## 📊 Validações Implementadas

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| Nome | 3-100 chars | "Nome deve ter entre 3 e 100 caracteres" |
| Email | Regex válido | "Email inválido" |
| Senha | Min 6 chars | "Senha deve ter no mínimo 6 caracteres" |
| Peso | 30-300 kg | "Peso deve estar entre 30 e 300 kg" |
| Altura | 100-250 cm | "Altura deve estar entre 100 e 250 cm" |

---

## 🔒 Segurança

1. **Token JWT**
   - Enviado via header `Authorization: Bearer <token>`
   - Validado em todas as rotas protegidas
   - Expiração configurável (recomendado: 7 dias)

2. **Senhas**
   - Mínimo 6 caracteres
   - Backend deve usar bcrypt para hash
   - Nunca retornar senha na API

3. **Dados Sensíveis**
   - Não expor IDs internos desnecessários
   - Validar permissões (usuário só acessa seus dados)

---

## 📱 Fluxo de Autenticação Completo

```
1. Usuário acessa /login
2. Digita email e senha
3. Frontend chama authService.login()
4. Backend valida credenciais
5. Backend retorna { token, usuario: { id, nome, email } }
6. Frontend salva em localStorage
7. AuthContext atualiza estado
8. Redirect para /dashboard
9. Todas as requisições incluem token
10. Se 401: logout automático + redirect /login
```

---

## 🎨 Melhorias de UX Implementadas

✅ Loading states em todas as operações assíncronas
✅ Mensagens de erro amigáveis
✅ Fallback para dados não disponíveis
✅ Formatação de números em pt-BR
✅ Dias da semana em português
✅ Cálculo automático de IMC
✅ Toast notifications para feedback
