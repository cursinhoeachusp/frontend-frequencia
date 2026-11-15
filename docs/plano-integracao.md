# Plano de adequação dos frontends ao Corujão

Objetivo: fazer as telas do **frontend-frequencia** (login, painel e coleta de presença) e da **carteirinha\_virtual** (frequência do aluno) conversarem com o novo backend.&#32;

## Decisões (comentem o que acham)

- Foco desta entrega: o módulo de coleta de frequência. A tela de frequência para o aluno ver na carteirinha fica para depois, quando a carteirinha migrar para o Corujão.
- A carteirinha troca o código de barras por QR code. O QR guarda o RA do aluno.
- A carteirinha continua no Supabase por enquanto. Ela só passa a usar o Corujão quando o backend inteiro estiver pronto.
- Na primeira versão, qualquer pessoa pode ver a frequência, sem precisar fazer login.

## Estado dos repos hoje

| Repositório | Situação |
| --- | --- |
| **corujao** | Alunos, presenças, dias letivos e os números do painel já usam o banco de verdade. Frequências e justificativas ainda devolvem dados de mentira. Ainda não existe login. |
| **frontend-frequencia** | O visual do painel está pronto, mas tudo usa dados de mentira. A tela de coleta (`/leitor`) ainda é só um título. Não existe tela de login. |
| **carteirinha\_virtual** | O login e os dados ficam no Supabase. O card de frequência mostra "Em desenvolvimento". A carteirinha mostra um **código de barras** com o RA do aluno, e não um QR code. |

## O que falta no backend

Estes pontos são do Corujão para termos no radar. Precisam ser resolvidos por quem cuida do backend, em paralelo ao nosso trabalho.

1. **Não existe login.** O banco já tem as tabelas de usuários e senhas, mas nenhuma rota usa essas tabelas. Sem isso, a tela de login não tem com quem conversar. Precisamos combinar como vai funcionar e quem pode acessar o painel e a coleta.
2. **O CORS não está ligado.** No computador de quem programa funciona, por causa do proxy do Vite. Mas quando o sistema estiver no ar, com o front e o back em endereços diferentes, o navegador vai bloquear as chamadas.
3. **Quando dá erro 500, a resposta vem no formato errado.** O backend deveria responder `{ sucesso: false, erro: "..." }`, mas um trecho antigo no `app.ts` responde com uma frase solta. Aí o front não consegue saber qual foi o erro, precisamos remover esse trecho antigo.
4. **A rota de frequências quebra o backend nesta branch.** O arquivo de rotas de frequências está incompleto e o servidor não consegue carregá-lo.
5. **Justificativas ainda são de mentira.** Além disso, o código escreve os status em minúsculas (`aprovado`, `reprovado`), e o contrato escreve com maiúscula e outra palavra (`Aprovado`, `Rejeitado`). Temos que escolher um jeito só.
6. **A lista de alunos não diz o turno de cada um** (nem a data ou o motivo da evasão). O modal de edição precisa do turno para montar o calendário, e a aba de evasões precisa do motivo. Vamos pedir esses campos.
7. **Não dá para cadastrar dias letivos pela API.** Sem dias letivos cadastrados, nenhuma presença é aceita. Por enquanto, para testar, dá para inserir direto no banco.
8. **O contrato da API está desatualizado.** Vale atualizar para todo mundo seguir o mesmo documento.
9. **Registrar presença não devolve o nome do aluno.** A tela de coleta só consegue mostrar o RA. Vamos pedir para a resposta trazer o `nome`.
10. **Não há rota própria para marcar evasão.** Hoje só dá para marcar "Evadido" junto com a correção de presenças, e essa rota exige pelo menos um dia na lista. Vamos pedir uma rota só para evasão, com motivo (a coluna `motivo_evasao` já existe no banco).

**Dependência de dados (a única ligação real entre coleta e carteirinha):** a presença só é aceita se o aluno estiver cadastrado no Corujão, com matrícula e turno. Hoje os alunos estão no banco do Supabase. Alguém precisa copiar os alunos de lá para o Corujão antes de usar a coleta de verdade, com um script ou pela rota `POST /api/alunos`. Os campos turno, data de entrada e RG precisam existir para cada aluno.

## Comparação entre contrato e código

Quando os dois discordarem, siga o que está na coluna **Código atual**: é isso que o backend realmente faz hoje.

| Assunto | Doc do contrato | Código atual |
| --- | --- | --- |
| Corrigir presenças de um aluno | `PATCH /api/alunos/:ra/status-historico` | `PATCH /api/alunos/:ra/historico` |
| Reativar aluno evadido | usa a mesma rota de cima | rota própria: `PATCH /api/alunos/:ra/matricula/reativar`, enviando `{ "status": "Regular" }` |
| Cadastrar aluno (`POST /api/alunos`) | envia um campo `userid` | não envia mais `userid`; a resposta traz o `nupe` (número do aluno) |
| Dias letivos | o `id` é um número; status Normal, Cancelado ou Nivelamento | o `id` é um código longo (UUID, tipo `3f2a9c1e-...`); existe também o status `Feriado` |
| Registrar presença | 3 erros possíveis | mais 2: `NOME_AMBIGUO` (dois alunos com o mesmo nome) e `DIA_NAO_LETIVO` (hoje não tem aula no turno do aluno) |
| Erros de alunos | poucos | vários novos: dados inválidos, data inválida, e-mail ou RG já cadastrado, aluno já matriculado, aluno que não está evadido etc. |
| Formato das respostas | — | a lista de alunos volta direto como lista; os números do painel vêm "embrulhados" em `{ sucesso, dados }` |

## Regras de negócio que as telas precisam respeitar

Regras definidas:

- **Frequência** = dias em que o aluno veio (ou justificou) ÷ dias em que ele deveria ter vindo, em porcentagem. Se ainda não teve nenhuma aula, é 100%.
- Só contam os dias de aula normal ou de nivelamento, no turno do aluno, desde o dia em que ele entrou até ontem. O dia de hoje só conta se ele já marcou presença. Feriados e aulas canceladas não contam.
- **Nivelamento** só vale para quem entrou no mesmo semestre (janeiro a junho = 1º semestre; julho a dezembro = 2º).
- **Situação do aluno**, nesta ordem de prioridade:
  - *Evadido*: só quando o pedagógico decide. O sistema nunca marca sozinho.
  - *Risco de evasão*: frequência abaixo de 75%.
  - *Atenção*: 4 ou mais faltas seguidas.
  - *Regular*: o resto.
- **As telas não calculam frequência nem situação.** Só mostram o que vem da API. Na hora de corrigir presenças, mandar uma situação só faz diferença se for *Evadido*; as outras o backend recalcula sozinho.
- **Reativar** um aluno evadido cria uma matrícula nova, com início hoje. A frequência dele recomeça do zero. O modal precisa avisar isso.
- **Presença**: só é aceita se o aluno estiver ativo, se hoje tiver aula no turno dele e se ele ainda não tiver marcado hoje. Se mandar RA e nome, vale o RA. Se houver dois alunos com o mesmo nome, é preciso usar o RA.
- **Trocar o aluno de turno** não gera faltas: o backend descobre sozinho quando foi a troca.

## 5. Tarefas do frontend-frequencia

Cada frente tem um documento próprio com o passo a passo, os arquivos envolvidos e como testar (veja a seção 7). Aqui fica o resumo.

### 5.1 Base comum (concluída)

Está na branch `feature/base-comum`. Já foi mergeada na branch principal.

- [x] Criar um arquivo `services/http.ts` que centraliza todas as chamadas ao backend: um só lugar que sabe o endereço da API, envia o token de login e trata os erros. Assim ninguém precisa repetir isso em cada tela. O endereço vem de uma variável de ambiente (`VITE_API_URL`) e, se ela não existir, usa `/api`.
- [x] Criar uma tabela que traduz cada código de erro do backend em uma mensagem para o usuário. Ex.: `ALUNO_NAO_ENCONTRADO` → "Não encontramos nenhum aluno com esse RA".
- [x] Atualizar `types/index.ts`, o arquivo que descreve o formato dos dados (que campos um aluno tem, por exemplo), para ficar igual ao que o backend realmente devolve (veja "Comparação entre contrato e código").
- [x] Ajustar os dados de mentira (`mocks/data.ts`) para o mesmo formato. Assim, quem ainda estiver usando mock não vai ter surpresa ao trocar pela API.
- [x] Criar peças visuais reaproveitáveis: aviso de sucesso/erro, indicador de "carregando" e mensagem de erro.

### 5.2 Login (depende do backend ter login, item 1 de "O que falta no backend")

- [ ] Tela `/login` seguindo o Figma.
- [ ] Guardar quem está logado e o token, e impedir que alguém sem login abra `/dashboard` e `/leitor` (manda de volta para o login).
- [ ] Fazer o botão "Sair" do cabeçalho funcionar.
- [ ] Enquanto o backend não tiver login: fazer um login de mentira que funcione do mesmo jeito por fora. Depois é só trocar por dentro, sem mexer nas outras telas.

### 5.3 Tela de coleta de frequência (`/leitor`)

- [ ] Ler o QR code da carteirinha pela câmera (do celular, tablet ou notebook do balcão), usando uma biblioteca pronta (ex.: `html5-qrcode` ou `@zxing/browser`). O QR traz o RA, que vai para `POST /api/presencas` enviando `{ ra }`.
- [ ] Um campo para digitar o RA, para quando a câmera não funcionar.
- [ ] Busca pelo nome, para quem esqueceu a carteirinha (`POST /api/presencas` enviando `{ nome }`).
- [ ] Resposta bem visível para cada resultado: presença registrada; já tinha marcado hoje; aluno não encontrado; nome repetido (pedir o RA); hoje não tem aula no turno dele.
- [ ] Evitar leituras repetidas: ignorar o mesmo RA por 3 segundos depois de lido, e não aceitar nova leitura enquanto um pedido estiver em andamento (senão a câmera lê o mesmo código várias vezes).
- [ ] Mostrar as últimas presenças registradas.
- [ ] Fazer o botão "Registro manual" do painel abrir uma janelinha com a busca por RA/nome, reaproveitando o mesmo componente.
- [ ] Lembrete: a câmera do navegador só funciona em `localhost` ou em endereço com `https`.

### 5.4 Painel (dashboard)

- [ ] Cards do topo: buscar em `GET /api/estatisticas/dashboard`. Os números vêm dentro de `dados`.
- [ ] Lista geral: buscar em `GET /api/alunos`. Os filtros são feitos na própria tela, sem novo pedido ao backend (a lista já está carregada, então o clique é instantâneo).
- [ ] Aba Faltas na semana: alunos ativos com falta na semana, de quem faltou mais para quem faltou menos (também filtrado na tela).
- [ ] Aba Evasões: `GET /api/alunos?evadidos=true`. **Atenção:** hoje a tabela separa os evadidos da mesma lista, mas a lista normal não traz mais os evadidos. Então precisa de um pedido separado.
- [ ] Aba Faltas justificadas: buscar em `GET /api/justificativas`; aprovar ou recusar com `PATCH /api/justificativas/:id/status`; o número de pendentes deve vir da API; mostrar as datas no formato dd/mm.
- [ ] Depois de qualquer alteração, buscar de novo a lista e os números. Hoje as telas só "fingem" a alteração na memória; isso deve sair.

### 5.5 Janelinhas (modais)

- [ ] **Edição do aluno (ModalEdicao):**
  - Escolher mês e ano e buscar as presenças reais em `GET /api/frequencias/:ra?view=detalhada&mes=...&ano=...`.
  - Mostrar só os dias que tiveram aula (hoje aparecem 15 dias fixos, de mentira).
  - Clicar no dia para alternar entre Presente, Falta e Justificado, e salvar com `PATCH /api/alunos/:ra/historico`. Tratar o erro de dia sem aula.
  - Tirar a edição do nome (o backend não tem como alterar nome).
  - Trocar a lista "Classificação visual" por um botão claro "Marcar como evadido" (as outras situações são calculadas sozinhas). Até o backend ter rota própria para evasão (item 10 de "O que falta no backend"), é preciso reenviar algum dia junto.
  - Adicionar a troca de turno (`PATCH /api/alunos/:ra/turno`).
- [ ] **Evasão (ModalEvasao):** tirar o texto "Abandono letivo… faltas consecutivas", porque quem decide a evasão é o pedagógico. Reativar com `PATCH /api/alunos/:ra/matricula/reativar` e avisar que a frequência recomeça do zero.
- [ ] **Justificativa (ModalJustificativa):** datas formatadas e avisos de "carregando" e de erro.

## 6. Tarefas da carteirinha\_virtual

Nesta entrega, a carteirinha só muda uma coisa, e continua usando o Supabase:

- [ ] Trocar o código de barras por **QR code** em `Profile.jsx`. Hoje ele é gerado com a biblioteca `jsbarcode`; trocar por uma de QR (ex.: `qrcode.react`). O conteúdo do QR é só o RA (`user.id_profile`), sem mais nada, para a tela de coleta ler direto.
- [ ] Não gerar QR quando o aluno não tiver RA. Hoje o código usa `"000000000"` nesse caso, o que geraria um QR com um RA falso. Mostrar um aviso para procurar a secretaria.
- [ ] Ajustar os textos do botão e da janelinha ("Código de barras" → "QR code") e deixar o QR grande o bastante para a câmera ler de longe.

### Para depois (quando a carteirinha migrar para o Corujão)

Os alunos já não conseguem ver a frequência hoje, então adiar isso não tira nada deles. Fica registrado o que será preciso:

- Card de frequência com `GET /api/frequencias/:ra`: porcentagem, faltas, justificadas, faltas seguidas e situação, com a regra explicada (mínimo de 75%, atenção a partir de 4 faltas seguidas).
- Calendário do mês com `?view=detalhada&mes=...&ano=...`.
- Enviar justificativas e ver as já enviadas (`POST` e `GET /api/justificativas`).
- Usar um endereço próprio para o Corujão (`VITE_CORUJAO_URL`), e não `/api`, que na carteirinha já é das funções da Vercel.

Se quiserem adiantar só o card antes da migração, dá para chamar essa única rota do Corujão mesmo com o login no Supabase, porque o RA é o mesmo. Só depende de o CORS estar ligado no Corujão (item 2 de "O que falta no backend").

## 7. Divisão entre as 3 pessoas

O trabalho está dividido em três frentes. Cada pessoa escolhe uma; anote seu nome na coluna **Responsável**.

| Frente | O que entrega | Responsável | Documento |
| --- | --- | --- | --- |
| **Frente 1 – Login e dados de teste** | 5.2. Também conversa com quem cuida do backend sobre os itens de "O que falta no backend" e a cópia dos alunos do Supabase para o Corujão. Prepara alunos e dias letivos de teste no banco local para o grupo. | | [Frente 1 – Login e dados de teste](./frente1.md) |
| **Frente 2 – Painel** | 5.4, modal de justificativa e modal de evasão. É a "dona" do `Dashboard.tsx` e do `NavigationTabs.tsx`: as outras frentes pedem a ela as mudanças nesses arquivos. | | [Frente 2 – Painel administrativo](./frente2.md) |
| **Frente 3 – QR code, coleta e edição do aluno** | A seção 6 (gerar o QR na carteirinha), a 5.3 (ler o QR e registro manual) e o modal de edição do aluno. | | [Frente 3 – QR code, coleta e edição do aluno](./frente3.md) |

Assim, a frente 3 cuida das duas pontas do QR (gerar e ler), então o formato fica combinado sem depender de ninguém. A frente 1 cuida do que liga o front ao backend (login e dados). Com a base comum pronta, as três frentes podem começar ao mesmo tempo, usando dados de mentira no formato certo, e trocar pela API conforme o backend fica pronto.

## 8. Ordem de trabalho

1. **Dia 1, todo mundo junto:** responder as perguntas da seção 9 e atualizar o contrato da API.
2. ✅ **Base comum:** arquivo de chamadas, tipos, mensagens de erro, dados de mentira e componentes de aviso. Concluída.
3. **Em paralelo:** cada pessoa na frente que escolheu (seção 7). Cada um na sua branch (ex.: `feat/painel`), com PRs pequenos revisados por outra pessoa do grupo.
4. **Trocar mentira por dado real conforme o backend fica pronto:** frequências → modal de edição; justificativas → aba do painel; login → tela de login.
5. **Teste completo:** com alunos e dias letivos de hoje no banco, mostrar o QR da carteirinha para a câmera da tela de coleta e conferir se a presença aparece certa no painel.

## 9. Perguntas que ainda faltam decidir

- **Login do painel:** como vai funcionar o login no Corujão? Quem pode entrar no painel e quem pode só usar a tela de coleta?
- **Alunos no Corujão:** quem copia os alunos do Supabase para o Corujão, e quando? Sem isso a coleta não funciona de verdade.
- **Aparelho do balcão:** a tela de coleta vai rodar em celular, tablet ou notebook com webcam? Isso muda o tamanho da tela e a câmera usada.
- **Fica para depois?** O backend já tem rota para cadastrar alunos e para mudar o status de um dia letivo (ex.: cancelar a aula), mas nenhuma tela usa isso. Fazemos agora ou não?