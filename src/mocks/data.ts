import type { Aluno, Justificativa, DashboardEstatisticas } from '../types';

export const alunosMock: Aluno[] = [
  { 
    ra: '202601001', 
    nome: 'Ana Santos', 
    frequencia: 86, 
    faltasConsecutivas: 0, 
    faltasNaSemana: 0, 
    status: 'Regular'
  },
  { 
    ra: '202601032', 
    nome: 'Ana Júlia', 
    frequencia: 100, 
    faltasConsecutivas: 0, 
    faltasNaSemana: 0, 
    status: 'Regular'
  },
  { 
    ra: '202601013', 
    nome: 'Beatriz Silva', 
    frequencia: 73, 
    faltasConsecutivas: 2, 
    faltasNaSemana: 2, 
    status: 'Atenção'
  },
  { 
    ra: '202601055', 
    nome: 'Isabella Dias', 
    frequencia: 46, 
    faltasConsecutivas: 5, 
    faltasNaSemana: 5, 
    status: 'Risco de evasão'
  },
  { 
    ra: '202601088', 
    nome: 'Lucas Almeida', 
    frequencia: 13, 
    faltasConsecutivas: 13, 
    faltasNaSemana: 0, 
    status: 'Evadido'
  },
];

export const justificativasMock: Justificativa[] = [
  { 
    id: '1', 
    ra: '202601013', 
    nome: 'Beatriz Silva', 
    turno: 'Vespertino',
    datasFalta: ['2026-05-21'], 
    motivo: 'Atestado médico (virose), em anexo entregue na secretaria.', 
    statusAnalise: 'Pendente',
    dataEnvio: '2026-05-23T14:30:00Z'
  },
  { 
    id: '2', 
    ra: '202601044', 
    nome: 'Carolina Reis', 
    turno: 'Noturno',
    datasFalta: ['2026-05-20'], 
    motivo: 'Problemas na linha 12-Safira da CPTM, fiquei presa na estação.', 
    statusAnalise: 'Pendente',
    dataEnvio: '2026-05-21T09:15:00Z'
  },
];

export const summaryDataMock: DashboardEstatisticas = {
  totalAlunos: 120,
  regulares: 114,
  emAtencao: 3,
  riscoEvasao: 3
};