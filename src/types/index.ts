// Formato dos dados que vão e voltam entre o front e o Corujão.
//
// Fonte da verdade: o código do backend em
// corujao/src/modules/sistema-de-chamada (branch modulo-de-frequencias).
// Quando o contrato da API e o código discordam, aqui vale o código.

// ---------------------------------------------------------------------------
// Valores fixos
// ---------------------------------------------------------------------------

export type Turno = 'Vespertino' | 'Noturno';

// Situação do aluno. O backend calcula; as telas só mostram.
export type StatusMatricula = 'Regular' | 'Atenção' | 'Risco de evasão' | 'Evadido';

export type StatusPresenca = 'Presente' | 'Justificado' | 'Falta';

// Situação de uma justificativa já normalizada pelo front (ver services/api.ts).
// O backend hoje mistura grafias ("aprovado", "Aprovado", "reprovado"...).
export type StatusAnalise = 'Pendente' | 'Aprovado' | 'Rejeitado';

// O que o PATCH /api/justificativas/:id/status aceita.
export type DecisaoJustificativa = 'Aprovado' | 'Rejeitado';

// Inclui "Feriado", que não está no contrato mas existe no código.
export type StatusDiaLetivo = 'Normal' | 'Feriado' | 'Cancelado' | 'Nivelamento';

// ---------------------------------------------------------------------------
// Alunos — GET /api/alunos
// ---------------------------------------------------------------------------

// A resposta é uma lista "pura" (sem { sucesso, dados }).
// Obs.: ainda não vem turno, data nem motivo da evasão (plano, seção 2, item 6).
export interface Aluno {
  ra: string;
  nome: string;
  frequencia: number; // porcentagem, 0 a 100
  faltasConsecutivas: number;
  faltasNaSemana: number;
  status: StatusMatricula;
}

// Valores aceitos em ?status= (vocabulário da URL, diferente de StatusMatricula).
export type StatusAlunoQuery = 'regular' | 'emAtencao' | 'riscoEvasao';

export interface FiltrosAlunos {
  status?: StatusAlunoQuery;
  // true = só os evadidos. Sem isso, a lista NÃO traz evadidos.
  evadidos?: boolean;
  ordem?: 'faltasSemanaDesc';
}

// POST /api/alunos (não se envia mais o userid)
export interface NovoAluno {
  ra: string;
  nome: string;
  email: string;
  identidade: string; // RG
  turno: Turno;
  dataIngresso: string; // AAAA-MM-DD
}

// PATCH /api/alunos/:ra/historico
export interface DiaHistorico {
  dia: number; // 1 a 31
  status: StatusPresenca;
}

export interface AtualizacaoHistorico {
  // Só faz diferença mandar "Evadido"; as outras situações o backend recalcula.
  status: StatusMatricula;
  mes: number; // 1 a 12
  ano: number;
  historico: DiaHistorico[]; // precisa ter pelo menos 1 dia
}

// ---------------------------------------------------------------------------
// Estatísticas — GET /api/estatisticas/dashboard (vem dentro de { sucesso, dados })
// ---------------------------------------------------------------------------

// Considera só alunos ativos (evadidos ficam de fora).
export interface DashboardEstatisticas {
  totalAlunos: number;
  regulares: number;
  emAtencao: number;
  riscoEvasao: number;
}

// ---------------------------------------------------------------------------
// Justificativas — /api/justificativas (no backend ainda é mock)
// ---------------------------------------------------------------------------

export interface Justificativa {
  id: string; // uuid
  ra: string;
  nome: string;
  turno: string;
  datasFalta: string[]; // AAAA-MM-DD
  motivo: string;
  statusAnalise: StatusAnalise;
  dataEnvio: string; // data e hora ISO, ex.: 2026-05-23T14:30:00Z
}

export interface NovaJustificativa {
  ra: string;
  datasFalta: string[];
  motivo: string;
}

// ---------------------------------------------------------------------------
// Frequências — GET /api/frequencias/:ra (no backend ainda é mock)
// ---------------------------------------------------------------------------

// ?view=resumida (padrão)
export interface FrequenciaResumida {
  ra: string;
  frequencia: number;
  totalFaltas: number;
  diasGarantidos: number;
  totalDiasEsperados: number;
  totalFaltasJustificadas: number;
  faltasConsecutivas: number;
  statusMatricula: StatusMatricula;
}

// ?view=detalhada&mes=..&ano=..
export interface DiaCalendario {
  data: string; // AAAA-MM-DD
  statusPresenca: StatusPresenca;
}

export interface FrequenciaDetalhada {
  ra: string;
  calendario: DiaCalendario[];
}

// ---------------------------------------------------------------------------
// Dias letivos — GET /api/dias-letivos?mes=..&ano=..
// ---------------------------------------------------------------------------

export interface DiaLetivo {
  id: string; // uuid (no contrato aparece como número)
  data: string; // AAAA-MM-DD
  turno: Turno;
  status: StatusDiaLetivo;
}

// ---------------------------------------------------------------------------
// Presenças — POST /api/presencas
// ---------------------------------------------------------------------------

// Basta um dos dois. Se vierem os dois, o backend usa o RA.
export type IdentificacaoAluno = { ra: string } | { nome: string };

// ---------------------------------------------------------------------------
// Formatos genéricos de resposta
// ---------------------------------------------------------------------------

export interface RespostaSucesso {
  sucesso: true;
}

export interface RespostaComDados<T> {
  sucesso: true;
  dados: T;
}

export interface RespostaCriarAluno {
  sucesso: true;
  nupe: number; // número do aluno no sistema
}

export interface RespostaErro {
  sucesso: false;
  erro: string; // um CodigoErroBackend, mas o servidor pode mandar um novo
}

// ---------------------------------------------------------------------------
// Códigos de erro
// ---------------------------------------------------------------------------

// Todos os códigos que o backend devolve hoje, de todas as rotas do módulo.
export type CodigoErroBackend =
  // gerais (middleware central de erros e várias rotas)
  | 'ERRO_INTERNO_SERVIDOR'
  | 'JSON_INVALIDO'
  | 'PARAMETROS_INVALIDOS'
  | 'DADOS_OBRIGATORIOS_AUSENTES'
  // alunos
  | 'ALUNO_NAO_ENCONTRADO'
  | 'TURNO_INVALIDO'
  | 'DATA_INVALIDA'
  | 'DADOS_ATUALIZACAO_INVALIDOS'
  | 'MATRICULA_REPETIDA'
  | 'MATRICULA_ATIVA_EXISTENTE'
  | 'MATRICULA_NAO_EVADIDA'
  | 'EMAIL_JA_CADASTRADO'
  | 'IDENTIDADE_JA_CADASTRADA'
  // presenças (DIA_NAO_LETIVO também aparece no histórico do aluno)
  | 'DIA_NAO_LETIVO'
  | 'NOME_AMBIGUO'
  | 'PRESENCA_JA_REGISTRADA'
  // dias letivos
  | 'DIA_LETIVO_NAO_ENCONTRADO'
  | 'STATUS_DIA_INVALIDO'
  // justificativas
  | 'STATUS_ANALISE_INVALIDO'
  // previstos no contrato, ainda não implementados no backend (TODO lá)
  | 'JUSTIFICATIVA_NAO_ENCONTRADA'
  | 'JUSTIFICATIVA_JA_EXISTENTE';

// Códigos criados pelo próprio front, para problemas que não chegam
// como { sucesso: false, erro } (sem internet, resposta que não é JSON etc.).
export type CodigoErroFront =
  | 'SEM_CONEXAO'
  | 'TEMPO_ESGOTADO'
  | 'RESPOSTA_INVALIDA'
  | 'REQUISICAO_INVALIDA'
  | 'NAO_AUTENTICADO'
  | 'ACESSO_NEGADO'
  | 'ROTA_NAO_ENCONTRADA'
  | 'ERRO_DESCONHECIDO';

export type CodigoErro = CodigoErroBackend | CodigoErroFront;
