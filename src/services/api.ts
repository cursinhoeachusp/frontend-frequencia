// Funções que as telas usam para conversar com o Corujão.
// Cada função corresponde a uma rota. Elas usam o http.ts (endereço, token, erros)
// e entregam os dados já no formato de src/types.
//
// Alternar entre mock e API real: variável VITE_USE_MOCK no arquivo .env.local
//   VITE_USE_MOCK=true   -> usa os dados de mentira de src/mocks
//   VITE_USE_MOCK=false  -> chama o backend
//   (ausente)            -> mock só no `npm run dev`; no build de produção, sempre o backend.
//                           Assim, esquecer a variável ao publicar nunca mostra alunos falsos.
// Depois de mudar o .env.local, reinicie o `npm run dev`.
import type {
  Aluno,
  AtualizacaoHistorico,
  DashboardEstatisticas,
  DecisaoJustificativa,
  DiaLetivo,
  FiltrosAlunos,
  FrequenciaDetalhada,
  FrequenciaResumida,
  IdentificacaoAluno,
  Justificativa,
  NovaJustificativa,
  NovoAluno,
  RespostaComDados,
  RespostaCriarAluno,
  RespostaSucesso,
  StatusAnalise,
  Turno,
} from '../types';
import { http } from './http';
import * as apiMock from '../mocks/api.mock';

export const USANDO_MOCK = import.meta.env.VITE_USE_MOCK
  ? import.meta.env.VITE_USE_MOCK !== 'false'
  : import.meta.env.DEV;

// RA vai no meio do endereço; encodeURIComponent evita problemas com caracteres especiais.
const ra = (valor: string) => encodeURIComponent(valor);

// O backend de justificativas ainda mistura grafias ("aprovado", "Aprovado", "reprovado").
// Aqui tudo vira o formato único do front: Pendente | Aprovado | Rejeitado.
function normalizarStatusAnalise(valor: string): StatusAnalise {
  const texto = valor.trim().toLowerCase();
  if (texto === 'aprovado') return 'Aprovado';
  if (texto === 'rejeitado' || texto === 'reprovado') return 'Rejeitado';
  return 'Pendente';
}

const apiReal = {
  // GET /api/alunos — lista direta (sem { sucesso, dados }). Não traz evadidos,
  // a não ser com { evadidos: true }.
  async buscarAlunos(filtros: FiltrosAlunos = {}): Promise<Aluno[]> {
    return http.get<Aluno[]>('/alunos', {
      query: { status: filtros.status, evadidos: filtros.evadidos, ordem: filtros.ordem },
    });
  },

  // GET /api/estatisticas/dashboard — os números vêm dentro de "dados".
  async buscarEstatisticasDashboard(): Promise<DashboardEstatisticas> {
    const resposta = await http.get<RespostaComDados<DashboardEstatisticas>>('/estatisticas/dashboard');
    return resposta.dados;
  },

  // POST /api/alunos — devolve o nupe (número do aluno).
  async cadastrarAluno(dados: NovoAluno): Promise<number> {
    const resposta = await http.post<RespostaCriarAluno>('/alunos', dados);
    return resposta.nupe;
  },

  // PATCH /api/alunos/:ra/turno
  async atualizarTurno(raAluno: string, novoTurno: Turno): Promise<void> {
    await http.patch<RespostaSucesso>(`/alunos/${ra(raAluno)}/turno`, { novoTurno });
  },

  // PATCH /api/alunos/:ra/historico (no contrato aparece como /status-historico)
  async atualizarHistorico(raAluno: string, dados: AtualizacaoHistorico): Promise<void> {
    await http.patch<RespostaSucesso>(`/alunos/${ra(raAluno)}/historico`, dados);
  },

  // PATCH /api/alunos/:ra/matricula/reativar — cria matrícula nova com início hoje.
  async reativarMatricula(raAluno: string): Promise<void> {
    await http.patch<RespostaSucesso>(`/alunos/${ra(raAluno)}/matricula/reativar`, { status: 'Regular' });
  },

  // POST /api/presencas — com { ra } ou { nome }.
  async registrarPresenca(identificacao: IdentificacaoAluno): Promise<void> {
    await http.post<RespostaSucesso>('/presencas', identificacao);
  },

  // GET /api/frequencias/:ra (view resumida)
  async buscarFrequencia(raAluno: string): Promise<FrequenciaResumida> {
    return http.get<FrequenciaResumida>(`/frequencias/${ra(raAluno)}`);
  },

  // GET /api/frequencias/:ra?view=detalhada&mes=..&ano=..
  async buscarFrequenciaDetalhada(raAluno: string, mes: number, ano: number): Promise<FrequenciaDetalhada> {
    return http.get<FrequenciaDetalhada>(`/frequencias/${ra(raAluno)}`, {
      query: { view: 'detalhada', mes, ano },
    });
  },

  // GET /api/dias-letivos?mes=..&ano=..
  async buscarDiasLetivos(mes: number, ano: number): Promise<DiaLetivo[]> {
    return http.get<DiaLetivo[]>('/dias-letivos', { query: { mes, ano } });
  },

  // GET /api/justificativas (opcional: só de um RA)
  async buscarJustificativas(raAluno?: string): Promise<Justificativa[]> {
    const lista = await http.get<(Omit<Justificativa, 'statusAnalise'> & { statusAnalise: string })[]>(
      '/justificativas',
      { query: { ra: raAluno } },
    );
    return lista.map((j) => ({ ...j, statusAnalise: normalizarStatusAnalise(j.statusAnalise) }));
  },

  // PATCH /api/justificativas/:id/status
  async analisarJustificativa(id: string, decisao: DecisaoJustificativa): Promise<void> {
    await http.patch<RespostaSucesso>(`/justificativas/${encodeURIComponent(id)}/status`, {
      statusAnalise: decisao,
    });
  },

  // POST /api/justificativas
  async enviarJustificativa(dados: NovaJustificativa): Promise<void> {
    await http.post<RespostaSucesso>('/justificativas', dados);
  },
};

// O tipo `typeof apiReal` obriga o mock a ter exatamente as mesmas funções,
// com os mesmos parâmetros e retornos. Se divergirem, o build quebra.
const api: typeof apiReal = USANDO_MOCK ? apiMock : apiReal;

export const {
  buscarAlunos,
  buscarEstatisticasDashboard,
  cadastrarAluno,
  atualizarTurno,
  atualizarHistorico,
  reativarMatricula,
  registrarPresenca,
  buscarFrequencia,
  buscarFrequenciaDetalhada,
  buscarDiasLetivos,
  buscarJustificativas,
  analisarJustificativa,
  enviarJustificativa,
} = api;
