// Dados de mentira no MESMO formato que o Corujão devolve (ver src/types).
// Usados quando VITE_USE_MOCK não é "false" (ver services/api.ts).
import type { Aluno, DiaLetivo, Justificativa, Turno } from '../types';

// GET /api/alunos — só alunos ativos. Evadidos NÃO aparecem nesta lista.
export const alunosMock: Aluno[] = [
  { ra: '202601001', nome: 'Ana Santos', frequencia: 86, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular' },
  { ra: '202601032', nome: 'Ana Júlia', frequencia: 100, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular' },
  { ra: '202601013', nome: 'Beatriz Silva', frequencia: 78, faltasConsecutivas: 4, faltasNaSemana: 3, status: 'Atenção' },
  { ra: '202601055', nome: 'Isabella Dias', frequencia: 46, faltasConsecutivas: 5, faltasNaSemana: 5, status: 'Risco de evasão' },
  // dois "Pedro Lima" para testar o erro NOME_AMBIGUO na presença por nome
  { ra: '202601070', nome: 'Pedro Lima', frequencia: 92, faltasConsecutivas: 0, faltasNaSemana: 1, status: 'Regular' },
  { ra: '202601071', nome: 'Pedro Lima', frequencia: 81, faltasConsecutivas: 1, faltasNaSemana: 1, status: 'Regular' },
];

// GET /api/alunos?evadidos=true
export const alunosEvadidosMock: Aluno[] = [
  { ra: '202601088', nome: 'Lucas Almeida', frequencia: 13, faltasConsecutivas: 13, faltasNaSemana: 0, status: 'Evadido' },
];

// A API ainda não devolve o turno do aluno, mas o mock precisa dele
// para montar dias letivos e calendário.
export const turnoPorRaMock: Record<string, Turno> = {
  '202601001': 'Vespertino',
  '202601032': 'Noturno',
  '202601013': 'Vespertino',
  '202601055': 'Noturno',
  '202601070': 'Vespertino',
  '202601071': 'Noturno',
  '202601088': 'Vespertino',
};

// GET /api/justificativas
export const justificativasMock: Justificativa[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    ra: '202601013',
    nome: 'Beatriz Silva',
    turno: 'Vespertino',
    datasFalta: ['2026-05-21', '2026-05-22'],
    motivo: 'Atestado médico (virose), em anexo entregue na secretaria.',
    statusAnalise: 'Pendente',
    dataEnvio: '2026-05-23T14:30:00Z',
  },
  {
    id: '6f1c2b7e-8d4a-4f0e-9b3a-2c5d7e9f1a20',
    ra: '202601055',
    nome: 'Isabella Dias',
    turno: 'Noturno',
    datasFalta: ['2026-05-20'],
    motivo: 'Problemas na linha 12-Safira da CPTM, fiquei presa na estação.',
    statusAnalise: 'Pendente',
    dataEnvio: '2026-05-21T09:15:00Z',
  },
  {
    id: 'a1b2c3d4-e29b-41d4-a716-112233445566',
    ra: '202601013',
    nome: 'Beatriz Silva',
    turno: 'Vespertino',
    datasFalta: ['2026-04-10'],
    motivo: 'Consulta médica (atestado entregue).',
    statusAnalise: 'Aprovado',
    dataEnvio: '2026-04-11T09:15:00Z',
  },
];

// GET /api/dias-letivos?mes=..&ano=..
// Gera de segunda a sexta, nos dois turnos. Dia 15 é feriado, para ter variedade.
export function gerarDiasLetivosMock(mes: number, ano: number): DiaLetivo[] {
  const dias: DiaLetivo[] = [];
  const diasNoMes = new Date(ano, mes, 0).getDate();
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const semana = new Date(ano, mes - 1, dia).getDay();
    if (semana === 0 || semana === 6) continue;
    const data = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    for (const turno of ['Vespertino', 'Noturno'] as const) {
      dias.push({
        // uuid de mentira, mas no mesmo formato (36 caracteres)
        id: `00000000-0000-4000-8000-${data.replaceAll('-', '')}${turno === 'Vespertino' ? '0001' : '0002'}`,
        data,
        turno,
        status: dia === 15 ? 'Feriado' : 'Normal',
      });
    }
  }
  return dias;
}
