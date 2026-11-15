# Frente 1 – Login e dados de teste

Esta frente cuida de três coisas: a **tela de login**, o **bloqueio das páginas** para quem não entrou e os **dados de teste** que o grupo usa com o backend de verdade. Também é o ponto de contato com quem cuida do Corujão. Repositório: `frontend-frequencia`.

## Antes de começar

- Crie sua branch a partir da que tem a base comum: `git switch -c feat/login`.
- Copie `.env.example` para `.env.local`. Sem configurar nada, em desenvolvimento o front usa **dados de mentira**. Para usar o Corujão de verdade: `VITE_USE_MOCK=false` e o backend rodando (`docker compose up` na pasta do `corujao`). Depois de mudar o `.env.local`, reinicie o `npm run dev`.

**Como usar a base comum:**

| Preciso de… | Use |
| --- | --- |
| Buscar ou enviar dados | As funções de `src/services/api.ts` (ex.: `buscarAlunos`). Nunca `fetch` direto na tela. |
| Saber qual erro aconteceu | Toda função da API, quando falha, lança um `ApiError`. `erro.codigo` diz o que foi (ex.: `'NOME_AMBIGUO'`); `erro.message` já é a frase em português para mostrar. |
| Aviso rápido no canto da tela | `const toast = useToast()` e depois `toast.sucesso('...')` ou `toast.erro(erro)`. |
| Mostrar "carregando" ou erro numa área | `<Carregando texto="..." />` e `<MensagemErro erro={erro} onTentarNovamente={carregar} />`, em `src/components/feedback/`. |
| Saber o formato de um dado | `src/types/index.ts`. |
| Criar uma função nova da API | Adicione em `apiReal` (`services/api.ts`) **e** em `src/mocks/api.mock.ts`, com o mesmo nome. Se faltar em um dos dois, o build quebra. |

## Tarefas

### 1. Funções de login na API

Arquivos: `src/types/index.ts`, `src/services/api.ts`, `src/mocks/api.mock.ts`, `src/services/erros.ts`.

- [ ] Criar os tipos `Perfil` (sugestão: `'coordenacao' | 'balcao'`, nomes a confirmar com o backend), `Usuario` (`id`, `nome`, `email`, `perfil`) e a resposta do login (`token` + `usuario`).
- [ ] Criar três funções: `entrar(email, senha)`, `buscarUsuarioLogado()` e `sair()`.
- [ ] Versão real: as rotas ainda não existem no Corujão. Use os nomes combinados com o backend (sugestão: `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`) e deixe um comentário `TODO` dizendo que falta confirmar.
- [ ] Versão de mentira: aceitar dois usuários fixos (ex.: `coordenacao@teste.com` e `balcao@teste.com`, senha `123456`). Senha errada lança `ApiError('CREDENCIAIS_INVALIDAS', 401)`.
- [ ] Esse código de erro é novo: inclua em `CodigoErroBackend` (types) e uma mensagem em `MENSAGENS_DE_ERRO` (erros.ts). O TypeScript avisa se esquecer.

### 2. Guardar quem está logado

Arquivos novos em `src/contexts/`: `auth-contexto.ts`, `AuthProvider.tsx` e `useAuth.ts`. Siga o mesmo jeito do aviso (toast) em `components/feedback/`: o contexto fica num arquivo separado do componente por causa de uma regra do Vite.

- [ ] Guardar no estado o `usuario` e um `carregando` (enquanto confere se já havia login salvo).
- [ ] Ao entrar: salvar o token no `localStorage` e chamar `definirToken(token)` do `http.ts`. A partir daí, todas as chamadas mandam o token sozinhas.
- [ ] Ao abrir o app: se houver token salvo, chamar `definirToken` e `buscarUsuarioLogado()`. Se falhar, apagar o token.
- [ ] Ao sair: chamar `sair()`, apagar do `localStorage` e `definirToken(null)`.
- [ ] **Sessão vencida:** quando qualquer chamada falhar com `NAO_AUTENTICADO` (status 401), deslogar e mandar para o login. Sugestão: criar no `http.ts` uma função `aoSessaoExpirar(callback)`, chamada sempre que vier um 401, e registrar o callback no `AuthProvider`.
- [ ] Envolver o app com o `AuthProvider` em `main.tsx`, dentro do `ToastProvider`.

### 3. Tela de login

- [ ] Criar `src/pages/Login.tsx` seguindo o Figma: e-mail, senha e botão Entrar.
- [ ] Usar `<form onSubmit>`, para o Enter também enviar.
- [ ] Enquanto envia: botão desabilitado com `<Carregando variante="inline" />`. Se der erro: mostrar `erro.message` abaixo do formulário.
- [ ] Depois de entrar: `coordenacao` vai para `/dashboard`; `balcao` vai para `/leitor`.

### 4. Bloquear as páginas para quem não entrou

Hoje o `App.tsx` tem só três rotas (`/` manda para `/dashboard`, `/leitor` e `/dashboard`) e nenhuma é protegida.

- [ ] Criar `src/components/RotaProtegida.tsx`, com uma opção `perfis` (quais perfis podem entrar). Sem login → vai para `/login`. Perfil sem permissão → vai para a página do próprio perfil.
- [ ] Proteger `/dashboard` (só coordenação) e `/leitor` (coordenação e balcão).
- [ ] Fazer `/` mandar para a página do perfil, ou para `/login` se ninguém entrou.
- [ ] Enquanto o `AuthProvider` ainda está conferindo o login salvo, mostrar `<Carregando />`. Sem isso, a tela de login "pisca" antes de abrir o painel.

### 5. Botão Sair e nome no cabeçalho

- [ ] Em `components/Header.tsx`, o botão Sair ainda não faz nada. Ligar ao `sair()` do `useAuth` e mandar para `/login`.
- [ ] Mostrar o nome de quem está logado ao lado do botão.
- [ ] Combinar com a Frente 3: a tela `/leitor` também precisa de um jeito de sair.

### 6. Dados de teste no banco local

Serve para o grupo testar com `VITE_USE_MOCK=false`. Documente o passo a passo no README.

- [ ] **Alunos:** crie pela própria API (`POST /api/alunos`), que já cria o usuário, o aluno e a matrícula do jeito certo. Pode ser um script com `curl` (ex.: `scripts/criar-alunos-teste.sh`) ou uma coleção do Insomnia/Postman. Inclua alunos nos dois turnos, dois alunos com o mesmo nome (para testar o erro de nome repetido) e data de entrada no começo do mês passado (para ter histórico).
- [ ] **Dias letivos:** ainda não há rota para criar. Rode este SQL no Adminer (`http://localhost:8080`). Ele cria dias de aula de segunda a sexta, nos dois turnos, do mês passado até daqui a 30 dias:

```sql
INSERT INTO atenadados.dias_letivos (data, turno, status)
SELECT d::date, t, 'normal'
FROM generate_series(
       date_trunc('month', now()) - interval '1 month',
       now() + interval '30 days',
       interval '1 day') AS d,
     unnest(array['vespertino', 'noturno']) AS t
WHERE extract(isodow FROM d) <= 5
ON CONFLICT (data, turno) DO NOTHING;
```

- [ ] Lembrete para o grupo: registrar presença só funciona se **hoje** for dia de aula no turno do aluno. Em fim de semana, o resultado sempre será "não há aula hoje".

### 7. Conversas com o backend

Você leva esses pedidos para quem cuida do Corujão e avisa o grupo quando ficarem prontos:

- [ ] Ligar o CORS.
- [ ] Remover o tratamento de erro antigo do `app.ts`, que devolve erro 500 como frase solta.
- [ ] Combinar o login: nomes das rotas, formato da resposta e quais perfis existem.
- [ ] Terminar a rota de frequências (hoje ela quebra o servidor na branch `modulo-de-frequencias`).
- [ ] Devolver o `turno` na lista de alunos (a Frente 3 precisa no modal de edição).
- [ ] Devolver o `nome` do aluno quando a presença é registrada (a Frente 3 quer mostrar o nome no balcão).
- [ ] Ter uma rota própria para marcar evasão, com motivo (a coluna `motivo_evasao` já existe no banco). Hoje só dá para marcar evasão junto com a correção de presenças.
- [ ] Definir quem copia os alunos do Supabase para o Corujão, e quando.

## Pronto quando

- [ ] Sem login, abrir `/dashboard` ou `/leitor` leva para `/login`.
- [ ] Com o mock, os dois usuários de teste entram e caem na página certa.
- [ ] Recarregar a página não desloga.
- [ ] Sair funciona e volta para o login.
- [ ] Outra pessoa do grupo consegue montar os dados de teste só seguindo o README.
- [ ] `npm run build` e `npm run lint` passam.
