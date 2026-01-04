# Funcionalidade: Explorar Treinos

## 📋 Visão Geral
Implementação completa da funcionalidade "Explorar Treinos" - um catálogo público de programas de treino com sistema de filtragem, busca e favoritos.

## ✅ Implementado

### 1. Banco de Dados (database/treinos_publicos_schema.sql)
```sql
- 4 tabelas criadas:
  • categorias_treino (5 categorias: Todos, Ganho de Massa, Perda de Peso, Força, Resistência)
  • niveis_treino (3 níveis: Iniciante, Intermediário, Avançado)
  • treinos_publicos (treinos com título, descrição, imagem, categoria, nível, frequência)
  • treinos_favoritos (relação usuário x treino favorito)

- Índices criados para performance:
  • categoria_id
  • nivel_id
  • frequencia_semanal
  • usuario_id

- 8 treinos de exemplo inseridos:
  1. Full Body Iniciante (3x/semana)
  2. Hipertrofia ABCD (4x/semana)
  3. Queima de Gordura HIIT (5x/semana)
  4. Força Bruta 5x5 (3x/semana)
  5. Calistenia Avançada (6x/semana)
  6. Superior Completo (2x/semana)
  7. Especialização de Braços (3x/semana)
  8. Glúteos e Pernas (3x/semana)
```

### 2. Backend API (backend/server.js)

#### Endpoints Criados:

**GET /api/treinos-publicos**
- Parâmetros query: `busca`, `categoria`, `nivel`, `frequencia`, `usuario_id`
- Retorna lista de treinos com flag `favorito` por usuário
- Filtros aplicáveis:
  - Busca textual (LIKE no título e descrição)
  - Categoria (slug)
  - Nível (slug)
  - Frequência semanal

**GET /api/categorias-treino**
- Retorna todas as categorias disponíveis

**GET /api/niveis-treino**
- Retorna todos os níveis disponíveis

**POST /api/treinos-favoritos/toggle**
- Body: `{ usuario_id, treino_publico_id }`
- Adiciona ou remove treino dos favoritos
- Retorna status atual (favorito: true/false)

### 3. Frontend React (frontend/src/pages/ExploreWorkouts.jsx)

#### Funcionalidades:

✅ **Busca com Debounce**
- Input de busca com delay de 500ms
- Busca em tempo real no título e descrição

✅ **Filtros**
- Categoria (dropdown com 5 opções)
- Nível (dropdown com 3 opções + "Todos")
- Frequência Semanal (dropdown com 4 opções + "Todas")
- Botão "Limpar Filtros"

✅ **Cards de Treino**
- Imagem de destaque
- Título e descrição
- Badge de categoria
- Informações: frequência semanal e nível
- Botão de favorito (coração) com toggle
- Botão "Visualizar Detalhes"

✅ **Estados**
- Loading (skeleton com animação)
- Empty state (quando nenhum resultado)
- Grid responsivo (1 coluna mobile, 2 tablet, 3 desktop)

✅ **Design**
- Gradiente escuro (gray-900 → black)
- Header com gradiente indigo-purple
- Cards com hover effects e transições
- Material Symbols icons
- Backdrop blur effects

### 4. Navegação

#### Sidebar (frontend/src/components/Sidebar.jsx)
- Novo item no menu: "Explorar Treinos" com ícone `explore`

#### MobileNav (frontend/src/components/MobileNav.jsx)
- Botão central flutuante convertido para "Explorar" (ícone `explore`)

#### Rotas (frontend/src/App.jsx)
- Nova rota: `/treinos/explorar` (PrivateRoute)

## 🎨 Design System

### Cores
- Primárias: Indigo-600, Purple-600
- Background: Gradient gray-900 → black
- Cards: Gray-800/50 com backdrop-blur
- Texto: White (títulos), Gray-400 (secundário)

### Ícones Material Symbols
- `explore` - Explorar
- `search` - Busca
- `filter_list` - Filtros
- `schedule` - Frequência
- `favorite` - Favorito
- `arrow_back` - Voltar

### Responsividade
- Mobile-first approach
- Breakpoints: sm, md, lg
- Grid adaptativo

## 🔄 Fluxo de Dados

```
1. Componente monta → useEffect carrega categorias e níveis
2. Filtros mudam → useEffect recarrega treinos (com debounce na busca)
3. API retorna treinos → include flag `favorito` via LEFT JOIN
4. Toggle favorito → POST API → Atualiza estado local
5. Filtros + busca → Query params na API → SQL WHERE clauses
```

## 📊 Query SQL Principal

```sql
SELECT 
  tp.id,
  tp.titulo,
  tp.descricao,
  tp.imagem_url,
  tp.frequencia_semanal,
  c.nome as categoria,
  c.slug as categoria_slug,
  n.nome as nivel,
  n.slug as nivel_slug,
  CASE WHEN tf.id IS NOT NULL THEN true ELSE false END as favorito
FROM treinos_publicos tp
LEFT JOIN categorias_treino c ON tp.categoria_id = c.id
LEFT JOIN niveis_treino n ON tp.nivel_id = n.id
LEFT JOIN treinos_favoritos tf ON tp.id = tf.treino_publico_id 
  AND tf.usuario_id = $1
WHERE tp.ativo = true
  AND (filtros aplicáveis...)
ORDER BY tp.criado_em DESC
```

## 🚀 Como Testar

1. Acesse http://localhost:5174
2. Faça login no sistema
3. Clique em "Explorar Treinos" no menu lateral (ou botão central no mobile)
4. Teste os filtros:
   - Selecione categoria "Ganho de Massa"
   - Selecione nível "Iniciante"
   - Selecione frequência "3x por semana"
5. Use a busca: digite "hipertrofia" ou "força"
6. Clique no coração para favoritar um treino
7. Limpe os filtros e veja todos os treinos

## 📝 Próximas Funcionalidades Sugeridas

- [ ] Página de detalhes do treino público (rota `/treinos/:id/detalhes`)
- [ ] Aba "Meus Favoritos" filtrada
- [ ] Importar treino público para "Meus Treinos"
- [ ] Sistema de avaliações (estrelas)
- [ ] Compartilhamento de treinos
- [ ] Paginação (quando houver muitos treinos)
- [ ] Ordenação (mais populares, mais recentes, etc)

## 🔧 Arquivos Modificados/Criados

### Criados:
- `database/treinos_publicos_schema.sql`
- `frontend/src/pages/ExploreWorkouts.jsx`

### Modificados:
- `backend/server.js` (endpoints adicionados)
- `frontend/src/App.jsx` (rota adicionada)
- `frontend/src/components/Sidebar.jsx` (menu item)
- `frontend/src/components/MobileNav.jsx` (botão central)

## ✨ Resumo Técnico

- **Backend**: 4 novos endpoints REST
- **Frontend**: 1 novo componente React (333 linhas)
- **Database**: 4 novas tabelas + 8 registros de exemplo
- **Navegação**: 2 pontos de acesso (sidebar + mobile)
- **Performance**: Índices em queries, debounce na busca
- **UX**: Loading states, empty states, hover effects
- **Responsivo**: Mobile, tablet e desktop
