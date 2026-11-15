# Frente 3 – QR code, coleta e edição do aluno

Esta frente cuida das duas pontas do QR code (**gerar** na carteirinha e **ler** na tela de coleta), do **registro manual** no painel e do **modal de edição do aluno**, onde a coordenação corrige presenças. Mexe em dois repositórios: `carteirinha_virtual` (parte A) e `frontend-frequencia` (partes B, C e D). Plano geral: Doc.

Ordem sugerida: **A → B → C → D**. A parte A é rápida e não depende de ninguém. A parte D só pode ser testada de verdade quando o backend terminar a rota de frequências; até lá, use o mock.

## Antes de começar (frontend-frequencia)

- Crie sua branch a partir da que tem a base comum: `git switch -c feat/coleta`.
- Copie `.env.example` para `.env.local`. Sem configurar nada, em desenvolvimento o front usa **dados de mentira**. Para usar o Corujão de verdade: `VITE_USE_MOCK=false` e o backend rodando. Depois de mudar o `.env.local`, reinicie o `npm run dev`.

**Como usar a base comum:**

| Preciso de… | Use |
| --- | --- |
| Buscar ou enviar dados | As funções de `src/services/api.ts`. Nunca `fetch` direto na tela. |
| Saber qual erro aconteceu | As funções lançam `ApiError`. `erro.codigo` diz o que foi; `erro.message` já é a frase em português. |
| Aviso rápido no canto da tela | `const toast = useToast()` e depois `toast.sucesso('...')` ou `toast.erro(erro)`. |
| Mostrar "carregando" ou erro numa área | `<Carregando />` e `<MensagemErro erro={erro} onTentarNovamente={...} />`, em `src/components/feedback/`. |
| Saber o formato de um dado | `src/types/index.ts`. |

Funções da API que esta frente usa: `registrarPresenca`, `buscarFrequenciaDetalhada`, `atualizarHistorico` e `atualizarTurno`.

## A. QR code na carteirinha (repo `carteirinha_virtual`)

Branch e PR separados, no repositório da carteirinha. Ela continua usando o Supabase; nada muda no login nem nos dados.

**Como está hoje** (`src/pages/Profile.jsx`): o botão "Código de barras" abre uma janelinha. Quando ela abre, um `useEffect` usa a biblioteca `jsbarcode` para desenhar o código dentro de um `<svg ref={barcodeRef}>`. O valor é `user?.id_profile || "000000000"`.

- [ ] Instalar uma biblioteca de QR para React (sugestão: `npm install qrcode.react`).
- [ ] Trocar o `<svg ref={barcodeRef}>` por `<QRCodeSVG value={user.id_profile} size={256} />`. Remover o `useRef`, o `useEffect` e o import do `JsBarcode`.
- [ ] **Não gerar QR quando o aluno não tem RA.** Hoje o código usa `"000000000"` nesse caso, o que geraria um QR com um RA falso. Mostrar "RA não cadastrado. Procure a secretaria." no lugar.
- [ ] O QR guarda **só o RA**, sem texto extra, para a tela de coleta ler direto.
- [ ] Trocar os textos: botão "QR code" e título "Mostre este código no balcão". Deixar o QR grande, com fundo branco e uma margem branca em volta (a câmera lê melhor assim).
- [ ] Se o `jsbarcode` não for usado em mais nenhum lugar (procure no projeto), remover com `npm uninstall jsbarcode`.

## B. Tela de coleta (`/leitor`)

**Como está hoje:** `src/pages/Leitor.tsx` só mostra um título. A rota `/leitor` já existe no `App.tsx`; quem vai protegê-la com login é a Frente 1.

Estrutura sugerida, em `src/components/presenca/`:

| Arquivo | Faz o quê |
| --- | --- |
| `LeitorQr.tsx` | Liga a câmera e avisa quando leu um código. |
| `FormPresenca.tsx` | Campo para digitar o RA ou buscar pelo nome. Reaproveitado no registro manual (parte C). |
| `ResultadoPresenca.tsx` | Cartão grande e colorido com o resultado da última leitura. |
| `UltimasPresencas.tsx` | Lista das presenças registradas desde que a tela abriu. |

`pages/Leitor.tsx` junta essas peças.

**Fluxo de uma leitura:**

1. A câmera lê o QR.
2. Conferir se o texto parece um RA (só números, tamanho esperado). Se não, mostrar "QR inválido" sem chamar o backend.
3. Chamar `registrarPresenca({ ra })`.
4. Mostrar o resultado conforme a tabela abaixo.

| Resultado | `erro.codigo` | Cor | O que mostrar |
| --- | --- | --- | --- |
| Deu certo | (sem erro) | verde | "Presença registrada" + RA |
| Já tinha marcado | `PRESENCA_JA_REGISTRADA` | amarelo | "Presença já registrada hoje" (não é um problema) |
| Sem aula hoje | `DIA_NAO_LETIVO` | amarelo | "Não há aula hoje no turno deste aluno" |
| Nome repetido | `NOME_AMBIGUO` | amarelo | Pedir o RA e colocar o cursor no campo de RA |
| Não encontrado | `ALUNO_NAO_ENCONTRADO` | vermelho | "Aluno não encontrado" |
| Sem conexão | `SEM_CONEXAO` ou `TEMPO_ESGOTADO` | vermelho | "Sem conexão, tente de novo" (a leitura não foi salva) |

- [ ] **Evitar leituras repetidas:** a câmera lê o mesmo QR várias vezes por segundo. Guardar o último RA lido e o horário, e ignorar o mesmo RA por 3 segundos. Enquanto um pedido ainda está em andamento, ignorar novas leituras.
- [ ] **Desligar a câmera ao sair da tela** (na função de limpeza do `useEffect`). Senão a luz da câmera fica acesa.
- [ ] **Biblioteca de leitura:** `html5-qrcode` ou `@zxing/browser`. Teste no aparelho que vai ficar no balcão antes de escolher.
- [ ] Campo de RA e busca por nome sempre visíveis, para quando a câmera falhar ou o aluno esquecer a carteirinha.
- [ ] Layout de balcão: letras grandes, funcionando em celular ou tablet (o aparelho ainda será definido pelo grupo).
- [ ] Coloque um jeito de sair da tela (combinar com a Frente 1, que cuida do login).

**Pontos de atenção:**

- O backend **não devolve o nome do aluno** quando registra a presença, então o cartão verde só consegue mostrar o RA. A Frente 1 vai pedir ao backend para devolver o nome. Até lá, mostre o RA.
- A câmera do navegador **só funciona em `localhost` ou em endereço `https`**. No notebook, testando em `localhost`, funciona. Para testar no celular pela rede de casa, é preciso `https`: o plugin `@vitejs/plugin-basic-ssl` resolve, rodando `npm run dev -- --host`.
- Para testar sem a carteirinha, gere um QR com o texto `202601001` em qualquer gerador de QR on-line e aponte a câmera para a tela.

**Testando com o mock:** RA `202601001` registra presença. O mesmo RA de novo dá "já registrada". O nome "Pedro Lima" dá nome repetido. Em sábado, domingo ou no dia 15 (feriado de mentira), qualquer aluno dá "não há aula hoje".

## C. Registro manual no painel

O botão "Registro manual" em `components/NavigationTabs.tsx` ainda não faz nada.

- [ ] Criar `components/presenca/ModalRegistroManual.tsx`, reaproveitando `FormPresenca` e `ResultadoPresenca` da parte B.
- [ ] Combinar com a Frente 2, que é dona do `Dashboard.tsx` e do `NavigationTabs.tsx`: ela adiciona a prop `onRegistroManual` e o estado que abre o modal; você entrega o modal.
- [ ] Depois de registrar, chamar `onConcluido()` para o painel recarregar, porque a presença muda a frequência.

## D. Modal de edição do aluno

**Como está hoje** (`components/modals/ModalEdicao.tsx`):

- Recebe `aluno`, `onClose` e `onSave(alunoEditado)`.
- Mostra 15 dias fixos, todos "Presente", sob o título fixo "Grade de presenças (maio)".
- Clicar num dia alterna Presente → Falta → Justificado.
- Tem o nome editável e uma lista "Classificação visual" para escolher a situação.
- Ao salvar, calcula a frequência na própria tela. Nada vai para o backend.

**Como deve ficar:**

- [ ] Escolher mês e ano (começa no mês atual), com setas para voltar e avançar.
- [ ] Ao abrir ou trocar de mês: `buscarFrequenciaDetalhada(aluno.ra, mes, ano)`. A resposta traz `calendario`, uma lista de `{ data, statusPresenca }`. Mostrar só esses dias (número do dia e dia da semana), com carregando e erro.
- [ ] Clicar num dia alterna o status, como hoje. Guardar as alterações separadas (ex.: `Record<number, StatusPresenca>`) e destacar os dias alterados.
- [ ] Salvar: `atualizarHistorico(aluno.ra, { status: aluno.status, mes, ano, historico })`, mandando em `historico` **só os dias alterados**, no formato `{ dia, status }`. O `dia` é o número do dia: `Number(data.slice(8, 10))`.
- [ ] O backend recusa `historico` vazio, então o botão Salvar fica desabilitado enquanto não houver alteração.
- [ ] Trocar de mês com alterações não salvas: perguntar antes de descartar.
- [ ] Tirar a edição do nome (só mostrar; o backend não altera nome), a lista "Classificação visual" e o cálculo local de frequência.
- [ ] **Marcar como evadido:** botão separado, com confirmação, que envia `status: 'Evadido'`. Atenção: como o backend exige pelo menos um dia em `historico`, é preciso reenviar algum dia com o status que ele já tem. É um contorno. A Frente 1 vai pedir ao backend uma rota própria para evasão, com motivo.
- [ ] **Troca de turno:** `atualizarTurno(aluno.ra, novoTurno)`. A API ainda não diz o turno atual do aluno, então mostre "Trocar para: Vespertino / Noturno" sem marcar nenhum.
- [ ] Erros: `DIA_NAO_LETIVO` (algum dia deixou de ser dia de aula; recarregar o mês) e `ALUNO_NAO_ENCONTRADO`.
- [ ] Trocar a prop `onSave(aluno)` por `onSalvo()`. Quem recarrega o painel é o Dashboard (Frente 2).
- [ ] Datas: usar `formatarData` de `src/utils/datas.ts`, que a Frente 2 vai criar.

**Testando com o mock:** o calendário de mentira mostra só os dias úteis que já passaram, no turno do aluno, com algumas faltas e justificadas espalhadas. O dia 15 é feriado e não aparece.

## Pronto quando

- [ ] A carteirinha mostra o QR com o RA, e nenhum QR quando o aluno não tem RA.
- [ ] A tela de coleta lê esse QR pela câmera e registra a presença.
- [ ] Cada resultado da tabela da parte B aparece com a mensagem e a cor certas.
- [ ] O mesmo QR na frente da câmera não gera vários pedidos.
- [ ] O registro manual funciona pelo painel.
- [ ] O modal de edição mostra os dias reais do mês, salva só o que mudou e o painel atualiza depois.
- [ ] `npm run build` e `npm run lint` passam nos dois repositórios.
