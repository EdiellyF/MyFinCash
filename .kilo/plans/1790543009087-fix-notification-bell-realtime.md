# Correção da seção 5 — Sino de notificações + realtime

## Contexto

A spec original (seções 1–4 + testes de backend) **já está implementada e funcionando**. O que
não funciona é a **seção 5 (frontend)**: `NotificationContext.jsx` e `NotificationBell.jsx` existem e
estão montados (`AppShell.jsx:116`), mas estão quebrados.

Este plano é uma **correção**, não uma implementação nova. Nenhuma mudança de backend é necessária.

### Bugs que quebram a seção 5 hoje

| # | Local | Sintoma | Causa |
|---|-------|---------|-------|
| 1 | `frontend/src/contexts/NotificationContext.jsx:27` | Socket nunca conecta; nenhum toast, nenhuma atualização em tempo real | Lê `localStorage.getItem('accessToken')`, mas a chave real é `finance_access_token` (`services/api.js:3`, `contexts/AuthContext.jsx:29`). Retorna `null` → `return` na linha 28 aborta todo o efeito |
| 2 | `frontend/src/contexts/NotificationContext.jsx:96` | **Header/sino quebra com `TypeError`** no primeiro render do dropdown | `setNotifications(response.data)` guarda o envelope `{ success, message, data }` (`backend/src/utils/response.js:2`) em vez do array. `notifications.length` fica `undefined`, o `=== 0` em `NotificationBell.jsx:88` falha, e o `.map()` da linha 97 lança |
| 3 | `frontend/src/contexts/NotificationContext.jsx:87` | Badge de não lidas nunca aparece | `response.data.count` é `undefined`; o real é `response.data.data.count` |
| 4 | `frontend/src/contexts/NotificationContext.jsx:27` | Realtime morre silenciosamente após ~15 min de sessão | O token é lido uma única vez no connect. Com `ACCESS_TOKEN_TTL` de 15 min (`backend/src/config/env.js:42`), a primeira reconexão reenvia o token expirado e o servidor rejeita com `Authentication error: Invalid token` (`server.js:22-36`) — sem nenhum retry até o próximo login |
| 5 | `frontend/src/contexts/NotificationContext.jsx:48-61` | Toast não segue a paleta do design system | Usa `toast.success`/`toast.error` com `<Toaster richColors>` (`App.jsx:13`), que força verde/vermelho genéricos do sonner em vez de `fincash-forest` / `fincash-terracotta` |
| 6 | `frontend/src/pages/Chat.jsx:126` | Socket do chat rejeitado pelo backend | `io(socketUrl, { transports, reconnection })` sem `auth`. O middleware `io.use` exige `socket.handshake.auth.token` (`server.js:23-25`) → `Authentication error: Token not provided` |
| 7 | `frontend/src/App.jsx:13` | Toast branco em dark mode | `<Toaster>` sem `theme`; o projeto já tem `ThemeProvider` aplicando a classe `dark` no `<html>` (`contexts/ThemeContext.jsx:9`) |
| 8 | `frontend/src/components/NotificationBell.jsx:11-23` | `try/catch` em volta de `useNotifications()` é código morto | O provider está sempre montado (`App.jsx:11`), então o `throw` nunca acontece. O `try/catch` mascara erros reais em vez de resolvê-los — remover |

### Contrato do backend (verificado, não mudar)

- Envelope: `{ success, message, data }` — `backend/src/utils/response.js:1-7`
- `GET /api/notifications` → `data` = `Notification[]` (mais recentes primeiro, `limit=50`, `offset=0`)
- `GET /api/notifications/unread-count` → `data` = `{ count: number }`
- `PATCH /api/notifications/:id/read` → `data` = `Notification`
- `PATCH /api/notifications/read-all` → `data` = `{ count: number }`
- Evento Socket.IO: `'notification'`, sala `user:${userId}` (`server.js:43`)
- Payload do evento: `{ id, type, title, message, metadata, createdAt }` — **não inclui `read`**
  (`backend/src/services/notificationService.js:34-41`)
- Tipos: `'goal_reached'` | `'budget_exceeded'`

---

## Decisões tomadas

| Tema | Decisão |
|------|---------|
| Clique na notificação | **Apenas marca como lida e fecha o dropdown.** Sem deep-link |
| Arquitetura do socket | **Manter conexão dedicada** no `NotificationProvider`. `Chat.jsx` não é refatorado para provider compartilhado |
| `Chat.jsx` | **Corrigir o handshake** (bug 6) — está neste plano |
| URL do socket | `import.meta.env.VITE_API_URL` **direto**, sem helper e sem `VITE_SOCKET_URL` novo |
| `frontend/.env` | **Não tocar.** O placeholder `https://SUA-URL-REAL-DO-RAILWAY.railway.app` fica; o usuário ajusta depois |
| Cores do toast | Manter `toast.success`/`toast.error` + `richColors`, **overridando as CSS vars do sonner com os hex do `tailwind.config.js`** |
| Dark mode do toast | `theme={darkMode ? 'dark' : 'light'}` no `<Toaster>` |
| Paleta (hex, de `tailwind.config.js:8-14`) | forest `#1B4332`, terracotta `#8B3A3A`, cream `#F7F3E9` |

---

## Tarefas

### 1. `frontend/src/contexts/NotificationContext.jsx`

1. **Ler o token certo.** `localStorage.getItem('accessToken')` → `localStorage.getItem('finance_access_token')`.
2. **Corrigir o unwrap do envelope** (bug 2 e 3):
   - `loadUnreadCount`: `setUnreadCount(response.data.data.count)`
   - `loadNotifications`: `setNotifications(response.data.data)`
   - Adicionar guarda defensiva: se `!Array.isArray(data)` usar `[]`, para que uma mudança de contrato no backend nunca mais derrube a tela.
3. **Normalizar o payload do socket** (bug 4 do dado): o evento não traz `read`. Ao inserir, mapear para `{ ...payload, read: false }` para que o indicador de não lida do sino não dependa de `undefined`.
4. **Token vivo em cada reconexão.** Substituir `auth: { token }` pela forma *função*, que o socket.io reavalia a cada tentativa de (re)conexão:
   ```js
   const socket = io(socketUrl, {
     auth: (cb) => cb({ token: localStorage.getItem('finance_access_token') }),
     transports: ['websocket'],
     reconnection: true,
   });
   ```
   Isso corrige a morte silenciosa do realtime em sessão longa. Manter `transports: ['websocket']` por consistência com `Chat.jsx`.
5. **Toast com a paleta.** Manter `toast.success` / `toast.error` e passar `style` com as CSS vars do sonner sobrescrevendo o `richColors`:
   - `goal_reached` → `toast.success(title, { description, duration, style: { '--success-bg': '#F7F3E9', '--success-text': '#1B4332', '--success-border': '#1B4332' } })`
   - `budget_exceeded` → `toast.error(title, { description, duration, style: { '--error-bg': '#F7F3E9', '--error-text': '#8B3A3A', '--error-border': '#8B3A3A' } })`
   - fallback (tipo desconhecido) → `toast(title, { description, duration })`
6. **Guards de sessão.** O efeito depende de `[user]`. No cleanup, apenas `socket.disconnect()`. Adicionar `setUnreadCount(0)` / `setNotifications([])` no cleanup para que o próximo login não herde o estado do usuário anterior.
7. **Manter** `loadUnreadCount` + `loadNotifications` no mount (a spec pede badge já no carregamento), `markAsRead` e `markAllAsRead` com atualização otimista — mas trocar `Math.max(0, prev - 1)` por decremento condicionado a `!n.read`, para não desalinhar o contador ao clicar numa notificação já lida.

### 2. `frontend/src/components/NotificationBell.jsx`

1. **Remover o `try/catch` em volta de `useNotifications()`** (bug 8) e usar o hook diretamente. Deixar só o destructuring com defaults:
   ```js
   const { unreadCount, notifications, markAsRead, markAllAsRead, loadNotifications } = useNotifications();
   ```
2. **Remover o import não usado** `X` de `lucide-react` (linha 2) — não é usado em lugar nenhum do arquivo.
3. Adicionar `aria-label="Notificações"` e `aria-expanded={isOpen}` no botão do sino, e um estado de carregamento simples (texto "Carregando...") enquanto a primeira `loadNotifications` não retorna, para evitar o flash de "Nenhuma notificação" em conexões lentas.
4. O restante do markup/estilos já está correto (badge `9+`, `line-clamp-2`, `formatRelativeTime` de `utils/format.js:9` já existe e está correto). **Não redesenhar.**

### 3. `frontend/src/App.jsx`

1. Importar `useTheme` de `./hooks/useTheme` e passar `theme={darkMode ? 'dark' : 'light'}` ao `<Toaster>` (bug 7). Manter `richColors` e `position="top-right"`.
2. Manter a árvore de providers como está — `NotificationProvider` **já é global** (`App.jsx:11`), atendendo ao item 5(c) da spec.

### 4. `frontend/src/pages/Chat.jsx`

Corrigir o handshake do socket (bug 6) com o mesmo padrão do item 1.4:

```js
const socket = io(socketUrl, {
  auth: (cb) => cb({ token: localStorage.getItem('finance_access_token') }),
  transports: ['websocket'],
  reconnection: true,
});
```

Nenhuma outra alteração nesta página.

---

## Fora de escopo

- **Nenhuma mudança de backend.** Seções 1–4 da spec e os testes em `backend/src/__tests__/` já estão prontos e não são tocados.
- **`frontend/.env`** — o placeholder fica; o usuário ajusta a URL real depois. Sem isso, nada é validável end-to-end.
- **Nenhum deep-link** ao clicar numa notificação.
- **Nenhum provider de socket compartilhado** entre Chat e Notifications.
- **Nenhuma sincronização entre abas** do contador de não lidas.
- **Nenhum teste automatizado no frontend** — `frontend/package.json` não tem `test` nem `lint` no script, e adicionar Vitest + Testing Library está fora do escopo desta correção.

## Limitação conhecida do backend (não corrigir aqui)

`goal_reached` só dispara em `goalService.updateGoal()` (`backend/src/services/goalService.js:58`) — ou seja,
**quando o usuário edita a meta manualmente**, cruzando de `<100%` para `>=100%`. Não dispara
automaticamente quando uma transação faz a meta atingir 100%. O plano não altera esse comportamento;
registrado aqui para não ser tratado como bug do sino.

---

## Validação

1. **Build do frontend** (único gate automatizado disponível):
   ```
   cd frontend && npm run build
   ```
   Deve concluir sem erros. Isto pega imports quebrados, JSX inválido e referências a hooks.

2. **Suíte do backend** (regressão — nada deveria mudar, mas confirma que o prune está limpo):
   ```
   cd backend && npm test
   ```
   Esperado: tudo passando, incluindo `notificationService.test.js`, `budgetNotification.test.js` e `goalNotification.test.js`.

3. **Checklist manual end-to-end** — requer `frontend/.env` com a URL real do backend e
   `FRONTEND_URL` no backend incluindo a origem do frontend (`backend/src/config/env.js:45`):
   - [ ] Login → sino visível no header, badge zerado/sem badge
   - [ ] DevTools → Network: `GET /api/notifications/unread-count` e `GET /api/notifications` retornam 200; conferir no console que `data.data` foi consumido (o array tem `length`)
   - [ ] Clicar no sino → dropdown abre **sem `TypeError`** no console, lista em ordem decrescente de `createdAt`
   [ ] Criar despesa que estoure um orçamento existente → **toast terracotta aparece sem reload**, sino incrementa, item entra no topo da lista
   - [ ] Editar uma meta de <100% para >=100% → **toast forest aparece sem reload**, mesmo estando em outra tela (ex.: Dashboard)
   - [ ] Clicar na notificação → item vira lida (o ponto verde some), contador decrementa, dropdown fecha
   - [ ] "Marcar todas" → todas lidas, badge some
   - [ ] Reload da página → histórico persiste (o item criado antes continua na lista)
   - [ ] Deixar a aba aberta > 15 min (TTL do access token), derrubar e subir a rede → o socket **reconecta** e o realtime volta a funcionar
   - [ ] Alternar dark mode → toasts e dropdown respeitam o tema
   - [ ] Abrir `/chat` → socket conecta sem `Authentication error: Token not provided` no log do backend

## Riscos

- **Baixo.** Mudança confinada a 4 arquivos de frontend, sem alteração de contrato de API ou de schema.
- **Ao vivo em produção:** a correção do `Chat.jsx` muda o comportamento do socket do chat. Se o chat
  hoje "parece funcionar" apesar do handshake inválido (ex.: o backend em algum ambiente não exige
  token), o comportamento muda de ignorado para autenticado. Verificar o log do backend ao abrir `/chat`.
- **Validação limitada:** sem `frontend/.env` correto, os itens 1 e 2 da validação rodam, mas o checklist
  manual (3) não pode ser executado por quem implementou.
