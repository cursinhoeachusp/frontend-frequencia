import type { RespostaErro } from '../types';
import { ApiError } from './erros';

// Único lugar do front que sabe COMO falar com o backend:
// endereço da API, cabeçalhos, token de login e tratamento de erro.
// As funções de services/api.ts usam este arquivo; as telas não chamam fetch direto.

// Endereço base. Em desenvolvimento, "/api" passa pelo proxy do Vite (vite.config.ts),
// que repassa para o Corujão em localhost:3000. Em produção, defina VITE_API_URL.
const URL_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

// Depois disso, desistimos de esperar a resposta.
const TEMPO_LIMITE_MS = 15_000;

// ---------------------------------------------------------------------------
// Token de autenticação
// ---------------------------------------------------------------------------
// O Corujão ainda não tem login. Quando tiver, a tela de login chama
// definirToken(token) e todas as chamadas passam a enviar
// "Authorization: Bearer <token>" sem mudar mais nada.

let tokenAtual: string | null = null;

export function definirToken(token: string | null): void {
  tokenAtual = token;
}

export function obterToken(): string | null {
  return tokenAtual;
}

// ---------------------------------------------------------------------------
// Requisição
// ---------------------------------------------------------------------------

type ValorQuery = string | number | boolean | null | undefined;

export interface OpcoesRequisicao {
  // Filtros do fim do endereço: { status: 'regular' } vira ?status=regular.
  // Valores undefined/null são ignorados.
  query?: Record<string, ValorQuery>;
  // Permite cancelar a chamada (ex.: quando a tela é fechada).
  signal?: AbortSignal;
}

function montarUrl(caminho: string, query?: OpcoesRequisicao['query']): string {
  const url = `${URL_BASE}${caminho.startsWith('/') ? caminho : `/${caminho}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(query)) {
    if (valor !== undefined && valor !== null) params.append(chave, String(valor));
  }
  const texto = params.toString();
  return texto ? `${url}?${texto}` : url;
}

// O corpo segue o padrão de erro do backend? { sucesso: false, erro: "CODIGO" }
function ehRespostaErro(corpo: unknown): corpo is RespostaErro {
  return (
    typeof corpo === 'object' &&
    corpo !== null &&
    (corpo as { sucesso?: unknown }).sucesso === false &&
    typeof (corpo as { erro?: unknown }).erro === 'string'
  );
}

// Para respostas de erro que NÃO seguem o padrão (ex.: o erro 500 que hoje volta
// como uma frase solta, ou uma página HTML de "rota não existe"), escolhemos o
// código pelo status HTTP.
function codigoPeloStatus(status: number): string {
  if (status === 400) return 'REQUISICAO_INVALIDA';
  if (status === 401) return 'NAO_AUTENTICADO';
  if (status === 403) return 'ACESSO_NEGADO';
  if (status === 404) return 'ROTA_NAO_ENCONTRADA';
  if (status >= 500) return 'ERRO_INTERNO_SERVIDOR';
  return 'RESPOSTA_INVALIDA';
}

// Lê o corpo como texto e tenta converter de JSON.
// Não usamos resposta.json() direto porque ele quebra se o corpo não for JSON.
async function lerCorpo(resposta: Response): Promise<{ ehJson: boolean; valor: unknown }> {
  const texto = await resposta.text();
  if (texto.trim() === '') return { ehJson: true, valor: null };
  try {
    return { ehJson: true, valor: JSON.parse(texto) };
  } catch {
    return { ehJson: false, valor: texto };
  }
}

async function requisitar<T>(
  metodo: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  caminho: string,
  corpo: unknown,
  opcoes: OpcoesRequisicao = {},
): Promise<T> {
  const cabecalhos: Record<string, string> = { Accept: 'application/json' };
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  if (tokenAtual) cabecalhos.Authorization = `Bearer ${tokenAtual}`;

  // Junta o cancelamento de quem chamou com o tempo limite num único "botão de cancelar".
  // Fazemos isso à mão (AbortController + setTimeout) em vez de usar AbortSignal.any /
  // AbortSignal.timeout, que não existem em navegadores mais antigos (ex.: tablet do balcão).
  const controle = new AbortController();
  let estourouTempo = false;
  const temporizador = setTimeout(() => {
    estourouTempo = true;
    controle.abort();
  }, TEMPO_LIMITE_MS);
  const repassarCancelamento = () => controle.abort();
  if (opcoes.signal?.aborted) controle.abort();
  opcoes.signal?.addEventListener('abort', repassarCancelamento);

  let resposta: Response;
  let lido: { ehJson: boolean; valor: unknown };
  try {
    resposta = await fetch(montarUrl(caminho, opcoes.query), {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: controle.signal,
    });
    lido = await lerCorpo(resposta);
  } catch (erro) {
    // Quem chamou cancelou: repassa o erro original para ele poder ignorar.
    if (opcoes.signal?.aborted) throw erro;
    if (estourouTempo) throw new ApiError('TEMPO_ESGOTADO', 0, erro);
    // fetch só falha assim quando não chegou resposta (sem internet, servidor fora do ar, CORS).
    throw new ApiError('SEM_CONEXAO', 0, erro);
  } finally {
    clearTimeout(temporizador);
    opcoes.signal?.removeEventListener('abort', repassarCancelamento);
  }

  // 1) Erro no formato padrão do backend.
  if (ehRespostaErro(lido.valor)) {
    throw new ApiError(lido.valor.erro, resposta.status, lido.valor);
  }

  // 2) Erro fora do padrão (status 4xx/5xx com texto solto ou HTML).
  if (!resposta.ok) {
    throw new ApiError(codigoPeloStatus(resposta.status), resposta.status, lido.valor);
  }

  // 3) "Deu certo", mas não veio JSON. Acontece, por exemplo, quando o endereço
  //    da API está errado e o servidor devolve o index.html do próprio front.
  if (!lido.ehJson) {
    throw new ApiError('RESPOSTA_INVALIDA', resposta.status, lido.valor);
  }

  // Atenção: aqui confiamos que o backend mandou o formato T.
  // O TypeScript não confere isso em tempo de execução.
  return lido.valor as T;
}

// Atalhos usados por services/api.ts. Exemplos:
//   http.get<Aluno[]>('/alunos', { query: { evadidos: true } })
//   http.post<RespostaSucesso>('/presencas', { ra: '202601001' })
export const http = {
  get: <T>(caminho: string, opcoes?: OpcoesRequisicao) =>
    requisitar<T>('GET', caminho, undefined, opcoes),
  post: <T>(caminho: string, corpo?: unknown, opcoes?: OpcoesRequisicao) =>
    requisitar<T>('POST', caminho, corpo ?? {}, opcoes),
  patch: <T>(caminho: string, corpo?: unknown, opcoes?: OpcoesRequisicao) =>
    requisitar<T>('PATCH', caminho, corpo ?? {}, opcoes),
  put: <T>(caminho: string, corpo?: unknown, opcoes?: OpcoesRequisicao) =>
    requisitar<T>('PUT', caminho, corpo ?? {}, opcoes),
  delete: <T>(caminho: string, opcoes?: OpcoesRequisicao) =>
    requisitar<T>('DELETE', caminho, undefined, opcoes),
};
