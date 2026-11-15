# Frente 2 – Painel administrativo

Esta frente liga o painel (`/dashboard`) aos dados de verdade: cards do topo, as quatro abas, a análise de justificativas e a reativação de alunos evadidos. Repositório: `frontend-frequencia`.

## Antes de começar

- Crie sua branch a partir da que tem a base comum: `git switch -c feat/painel`.
- Copie `.env.example` para `.env.local`. Sem configurar nada, em desenvolvimento o front usa **dados de mentira**. Para usar o Corujão de verdade: `VITE_USE_MOCK=false` e o backend rodando. Depois de mudar o `.env.local`, reinicie o `npm run dev`.

**Como usar a base comum:**

| Preciso de… | Use |
| --- | --- |
| Buscar ou enviar dados | As funções de `src/services/api.ts`. Nunca `fetch` direto na tela. |
| Saber qual erro aconteceu | As funções lançam `ApiError`. `erro.codigo` diz o que foi; `erro.message` já é a frase em português. |
| Aviso rápido no canto da tela | `const toast = useToast()` e depois `toast.sucesso('...')` ou `toast.erro(erro)`. |
| Mostrar "carregando" ou erro numa área | `<Carregando />` e `<MensagemErro erro={erro} onTentarNovamente={...} />`, em `src/components/feedback/`. |
| Saber o formato de um dado | `src/types/index.ts`. |

Funções da API que esta frente usa: `buscarAlunos`, `buscarEstatisticasDashboard`, `buscarJustificativas`, `analisarJustificativa` e `reativarMatricula`.

## Como o painel está hoje

- `pages/Dashboard.tsx` busca os ativos e os evadidos e **junta tudo numa lista só**, porque a tabela ainda separa os evadidos sozinha. Isso foi provisório, para a aba Evasões não ficar vazia.
- As justificativas ainda vêm direto do arquivo de mentira (`justificativasMock`), e não da API.
- As ações (analisar justificativa, reativar, salvar edição) só mudam a lista na memória. Nada vai para o backend.
- Se der erro ao carregar, só aparece no console; a tela fica em "Carregando métricas..." ou vazia.
- `components/TabelaAlunos.tsx` recebe todos os alunos e decide sozinha o que mostrar em cada aba e filtro. As abas são textos soltos (`'Lista geral'`, `'Faltas na semana'`, `'Faltas justificadas'`, `'Evasões'`).

## Tarefas

### 1. Organizar o carregamento (`Dashboard.tsx`)

- [ ] Separar os estados: `ativos`, `evadidos`, `justificativas`, `estatisticas`, `carregando` e `erro`. Tirar a junção provisória das listas.
- [ ] Criar uma função `carregarTudo()` que busca as quatro coisas ao mesmo tempo. Chamar quando a tela abre e depois de cada ação (aprovar justificativa, reativar, editar aluno, registro manual).
- [ ] Usar `Promise.allSettled` em vez de `Promise.all`. Com o `Promise.all`, se uma das quatro buscas falhar (as justificativas ainda são de mentira no backend), a tela inteira fica sem nada. Com o `allSettled`, dá para mostrar o que funcionou e um aviso só na parte que falhou.
- [ ] Trocar o `console.error` por `<MensagemErro erro={erro} onTentarNovamente={carregarTudo} />` e o texto "Carregando métricas..." por `<Carregando />`.
- [ ] Remover o import de `justificativasMock`.

### 2. Abas e filtros (`TabelaAlunos.tsx` e `NavigationTabs.tsx`)

- [ ] Em vez de mandar todos os alunos para a tabela, mandar só a lista daquela aba:
  - **Lista geral:** `ativos`, com o filtro de situação.
  - **Faltas na semana:** `ativos` com `faltasNaSemana > 0`, de quem faltou mais para quem faltou menos.
  - **Evasões:** `evadidos`.
  - **Faltas justificadas:** `justificativas`.
- [ ] Fazer os filtros na própria tela, sem novo pedido ao backend: a lista já está carregada, e assim o clique é instantâneo.
- [ ] Remover a regra `aluno.status !== 'Evadido'` do filtro "Todos", porque os ativos já não trazem evadidos.
- [ ] Criar um tipo para as abas (`type Aba = 'Lista geral' | 'Faltas na semana' | ...`) e usar nos dois componentes. Assim o TypeScript pega erro de digitação.
- [ ] Lista vazia: mostrar "Nenhum aluno nesta situação" em vez de uma tabela em branco.

### 3. Datas legíveis (`src/utils/datas.ts`)

A Frente 3 também vai usar. Crie cedo e avise o grupo.

- [ ] `formatarData('2026-05-21')` → `21/05/2026`.
- [ ] `formatarDataHora('2026-05-23T14:30:00Z')` → `23/05/2026 às 11:30` (no horário de Brasília).
- [ ] **Cuidado:** `new Date('2026-05-21')` é lido como meia-noite no horário de Londres. No Brasil isso vira 20/05, um dia antes. Para datas sem hora, separe o texto em vez de usar `Date`:

```ts
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}
```

### 4. Justificativas

- [ ] Na tabela, trocar `j.datasFalta.join(', ')` pelas datas formatadas.
- [ ] Ordenar: pendentes primeiro; dentro de cada grupo, as enviadas mais recentemente no topo.
- [ ] O número vermelho na aba (pendentes) continua calculado no `Dashboard`, agora com o dado real.
- [ ] `ModalJustificativa.tsx`: hoje ele mostra `{justificativa.datasFalta}`, que cola as datas sem separação. Mostrar a lista formatada, o turno e a data de envio.
- [ ] O próprio modal chama `analisarJustificativa(id, 'Aprovado' | 'Rejeitado')`. Enquanto envia, desabilitar os botões e mostrar `<Carregando variante="inline" />`.
- [ ] Deu certo: `toast.sucesso`, fechar e chamar `onConcluido()`, para o Dashboard rodar `carregarTudo()`. Aprovar uma justificativa muda a frequência, então os cards e a lista também mudam.
- [ ] Deu erro: `toast.erro(erro)` e manter o modal aberto.

### 5. Evasão (`ModalEvasao.tsx`)

- [ ] Remover o bloco "Motivo do sistema: Abandono letivo…". Quem decide a evasão é o pedagógico, não o sistema, e o backend ainda não devolve o motivo.
- [ ] Antes de reativar, pedir confirmação com o aviso: "Será criada uma matrícula nova a partir de hoje. A frequência recomeça do zero."
- [ ] Chamar `reativarMatricula(ra)`, com o mesmo padrão do item 4: carregando, aviso de sucesso ou erro, `onConcluido()`.

### 6. O que encosta no painel mas é de outra frente

Você é dono do `Dashboard.tsx` e do `NavigationTabs.tsx`. As outras frentes pedem a você, ou mexem pouco e avisam, para evitar conflito no git.

- [ ] **Modal de edição do aluno (Frente 3):** combinar as props `aluno`, `onClose` e `onSalvo`. Quando a Frente 3 entregar, `onSalvo` chama `carregarTudo()` e a função `salvarEdicaoAluno` sai do Dashboard.
- [ ] **Botão Registro manual (Frente 3):** você adiciona uma prop `onRegistroManual` no `NavigationTabs` e o estado para abrir o modal no Dashboard. A Frente 3 cria o modal.
- [ ] **Botão Sair (Frente 1):** fica no `Header.tsx`, que é da Frente 1.

## Para testar com o mock

- A lista tem 6 alunos ativos e 1 evadido (Lucas Almeida). A Beatriz Silva está em Atenção e a Isabella Dias em Risco de evasão.
- Há 2 justificativas pendentes e 1 aprovada.
- Os dados de mentira ficam só na memória: recarregar a página volta tudo ao início.

## Pronto quando

- [ ] As quatro abas e os filtros mostram os alunos certos, no mock e com o backend.
- [ ] Aprovar ou recusar uma justificativa atualiza a lista, o número na aba e os cards.
- [ ] Reativar um evadido tira o aluno da aba Evasões e o coloca na Lista geral.
- [ ] Com o backend desligado, aparece a mensagem de erro com "Tentar de novo", e não uma tela vazia.
- [ ] Nenhum dado de mentira é importado direto nas telas.
- [ ] `npm run build` e `npm run lint` passam.
