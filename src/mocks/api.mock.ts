// Versão "de mentira" da API: mesmas funções e mesmos formatos de services/api.ts,
// mas sem backend. Os erros também imitam o Corujão (lança ApiError com o mesmo código),
// então a tela que trata erro no mock vai tratar igual com a API real.
//
// Os dados ficam em memória: alterações valem até recarregar a página.
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
  Turno,
} from '../types';
import { ApiError } from '../services/erros';
import {
  alunosEvadidosMock,
  alunosMock,
  gerarDiasLetivosMock,
  justificativasMock,
  turnoPorRaMock,
} from './data';

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const ATRASO_MS = 600;

// Cópias, para não alterar os arrays exportados de data.ts.
let ativos: Aluno[] = alunosMock.map((a) => ({ ...a }));
let evadidos: Aluno[] = alunosEvadidosMock.map((a) => ({ ...a }));
const turnos: Record<string, Turno> = { ...turnoPorRaMock };
let justificativas: Justificativa[] = justificativasMock.map((j) => ({ ...j }));
const presencasDeHoje = new Set<string>();

const hojeIso = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso local

function acharAluno(ra: string): Aluno {
  const aluno = [...ativos, ...evadidos].find((a) => a.ra === ra);
  if (!aluno) throw new ApiError('ALUNO_NAO_ENCONTRADO', 404);
  return aluno;
}

const STATUS_POR_QUERY = {
  regular: 'Regular',
  emAtencao: 'Atenção',
  riscoEvasao: 'Risco de evasão',
} as const;

export async function buscarAlunos(filtros: FiltrosAlunos = {}): Promise<Aluno[]> {
  await esperar(ATRASO_MS);
  let lista = filtros.evadidos ? evadidos : ativos;
  if (filtros.status) lista = lista.filter((a) => a.status === STATUS_POR_QUERY[filtros.status!]);
  if (filtros.ordem === 'faltasSemanaDesc') {
    lista = [...lista].sort((a, b) => b.faltasNaSemana - a.faltasNaSemana);
  }
  return lista.map((a) => ({ ...a }));
}

export async function buscarEstatisticasDashboard(): Promise<DashboardEstatisticas> {
  await esperar(ATRASO_MS);
  return {
    totalAlunos: ativos.length,
    regulares: ativos.filter((a) => a.status === 'Regular').length,
    emAtencao: ativos.filter((a) => a.status === 'Atenção').length,
    riscoEvasao: ativos.filter((a) => a.status === 'Risco de evasão').length,
  };
}

export async function cadastrarAluno(dados: NovoAluno): Promise<number> {
  await esperar(ATRASO_MS);
  if (ativos.some((a) => a.ra === dados.ra)) throw new ApiError('MATRICULA_ATIVA_EXISTENTE', 409);
  evadidos = evadidos.filter((a) => a.ra !== dados.ra);
  ativos.push({ ra: dados.ra, nome: dados.nome, frequencia: 100, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular' });
  turnos[dados.ra] = dados.turno;
  return 1000 + ativos.length; // nupe de mentira
}

export async function atualizarTurno(ra: string, novoTurno: Turno): Promise<void> {
  await esperar(ATRASO_MS);
  acharAluno(ra);
  turnos[ra] = novoTurno;
}

export async function atualizarHistorico(ra: string, dados: AtualizacaoHistorico): Promise<void> {
  await esperar(ATRASO_MS);
  const aluno = acharAluno(ra);
  const letivos = new Set(
    gerarDiasLetivosMock(dados.mes, dados.ano)
      .filter((d) => d.turno === turnos[ra] && d.status === 'Normal')
      .map((d) => Number(d.data.slice(8, 10))),
  );
  if (dados.historico.some((d) => !letivos.has(d.dia))) throw new ApiError('DIA_NAO_LETIVO', 409);
  // Igual ao backend: só "Evadido" muda a situação; o resto seria recalculado.
  if (dados.status === 'Evadido' && aluno.status !== 'Evadido') {
    ativos = ativos.filter((a) => a.ra !== ra);
    evadidos.push({ ...aluno, status: 'Evadido' });
  }
}

export async function reativarMatricula(ra: string): Promise<void> {
  await esperar(ATRASO_MS);
  const aluno = acharAluno(ra);
  if (aluno.status !== 'Evadido') throw new ApiError('MATRICULA_NAO_EVADIDA', 409);
  evadidos = evadidos.filter((a) => a.ra !== ra);
  // Matrícula nova: frequência recomeça do zero.
  ativos.push({ ...aluno, status: 'Regular', frequencia: 100, faltasConsecutivas: 0, faltasNaSemana: 0 });
}

export async function registrarPresenca(identificacao: IdentificacaoAluno): Promise<void> {
  await esperar(ATRASO_MS);
  let aluno: Aluno | undefined;
  if ('ra' in identificacao) {
    aluno = ativos.find((a) => a.ra === identificacao.ra.trim());
  } else {
    const nome = identificacao.nome.trim().toLowerCase();
    const achados = ativos.filter((a) => a.nome.toLowerCase() === nome);
    if (achados.length > 1) throw new ApiError('NOME_AMBIGUO', 409);
    aluno = achados[0];
  }
  if (!aluno) throw new ApiError('ALUNO_NAO_ENCONTRADO', 404);

  const hoje = new Date();
  const temAula = gerarDiasLetivosMock(hoje.getMonth() + 1, hoje.getFullYear()).some(
    (d) => d.data === hojeIso() && d.turno === turnos[aluno.ra] && d.status === 'Normal',
  );
  if (!temAula) throw new ApiError('DIA_NAO_LETIVO', 409);
  if (presencasDeHoje.has(aluno.ra)) throw new ApiError('PRESENCA_JA_REGISTRADA', 409);
  presencasDeHoje.add(aluno.ra);
}

export async function buscarFrequencia(ra: string): Promise<FrequenciaResumida> {
  await esperar(ATRASO_MS);
  const aluno = acharAluno(ra);
  const totalDiasEsperados = 40;
  const diasGarantidos = Math.round((aluno.frequencia / 100) * totalDiasEsperados);
  return {
    ra,
    frequencia: aluno.frequencia,
    totalFaltas: totalDiasEsperados - diasGarantidos,
    diasGarantidos,
    totalDiasEsperados,
    totalFaltasJustificadas: justificativas.filter((j) => j.ra === ra && j.statusAnalise === 'Aprovado').length,
    faltasConsecutivas: aluno.faltasConsecutivas,
    statusMatricula: aluno.status,
  };
}

export async function buscarFrequenciaDetalhada(ra: string, mes: number, ano: number): Promise<FrequenciaDetalhada> {
  await esperar(ATRASO_MS);
  acharAluno(ra);
  const hoje = hojeIso();
  const calendario = gerarDiasLetivosMock(mes, ano)
    .filter((d) => d.turno === turnos[ra] && d.status === 'Normal' && d.data < hoje)
    .map((d, i) => ({
      data: d.data,
      statusPresenca: i % 7 === 3 ? 'Falta' : i % 11 === 5 ? 'Justificado' : 'Presente',
    }) as const);
  return { ra, calendario };
}

export async function buscarDiasLetivos(mes: number, ano: number): Promise<DiaLetivo[]> {
  await esperar(ATRASO_MS);
  return gerarDiasLetivosMock(mes, ano);
}

export async function buscarJustificativas(ra?: string): Promise<Justificativa[]> {
  await esperar(ATRASO_MS);
  return justificativas.filter((j) => !ra || j.ra === ra).map((j) => ({ ...j }));
}

export async function analisarJustificativa(id: string, decisao: DecisaoJustificativa): Promise<void> {
  await esperar(ATRASO_MS);
  if (!justificativas.some((j) => j.id === id)) throw new ApiError('JUSTIFICATIVA_NAO_ENCONTRADA', 404);
  justificativas = justificativas.map((j) => (j.id === id ? { ...j, statusAnalise: decisao } : j));
}

export async function enviarJustificativa(dados: NovaJustificativa): Promise<void> {
  await esperar(ATRASO_MS);
  if (!dados.ra || dados.datasFalta.length === 0 || !dados.motivo.trim()) {
    throw new ApiError('DADOS_OBRIGATORIOS_AUSENTES', 400);
  }
  const aluno = acharAluno(dados.ra);
  justificativas.push({
    id: crypto.randomUUID(),
    ra: aluno.ra,
    nome: aluno.nome,
    turno: turnos[aluno.ra] ?? '',
    datasFalta: dados.datasFalta,
    motivo: dados.motivo,
    statusAnalise: 'Pendente',
    dataEnvio: new Date().toISOString(),
  });
}
