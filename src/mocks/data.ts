import type { Aluno, Justificativa, RegistroDia } from '../types';

const gerarHistoricoMock = (padrao: 'P' | 'F'): RegistroDia[] => {
  return Array.from({ length: 15 }, (_, i) => ({
    dia: i + 1,
    status: i > 10 ? padrao : 'P'
  }));
};

export const dadosIniciaisAlunos: Aluno[] = [
  { 
    ra: '202401001', 
    nome: 'Ana Santos', 
    frequencia: 86, 
    faltasConsecutivas: 0, 
    faltasNaSemana: 0, 
    status: 'Regular', 
    historico: gerarHistoricoMock('P') 
  },
  { 
    ra: '202401032', 
    nome: 'Ana Júlia', 
    frequencia: 100, 
    faltasConsecutivas: 0, 
    faltasNaSemana: 0, 
    status: 'Regular', 
    historico: Array.from({ length: 15 }, (_, i) => ({ dia: i + 1, status: 'P' })) 
  },
  { 
    ra: '202401013', 
    nome: 'Beatriz Silva', 
    frequencia: 73, 
    faltasConsecutivas: 2, 
    faltasNaSemana: 2, 
    status: 'Atenção', 
    historico: [...gerarHistoricoMock('P').slice(0, 13), { dia: 14, status: 'F' }, { dia: 15, status: 'F' }] 
  },
  { 
    ra: '202401055', 
    nome: 'Isabella Dias', 
    frequencia: 46, 
    faltasConsecutivas: 5, 
    faltasNaSemana: 5, 
    status: 'Risco de evasão', 
    historico: [...gerarHistoricoMock('P').slice(0, 10), { dia: 11, status: 'F' }, { dia: 12, status: 'F' }, { dia: 13, status: 'F' }, { dia: 14, status: 'F' }, { dia: 15, status: 'F' }] 
  },
  { 
    ra: '202401088', 
    nome: 'Lucas Almeida', 
    frequencia: 13, 
    faltasConsecutivas: 13, 
    faltasNaSemana: 0, 
    status: 'Evadido', 
    dataEvasao: '10/05/2026', 
    historico: [{ dia: 1, status: 'P' }, { dia: 2, status: 'P' }, ...Array.from({ length: 13 }, (_, i) => ({ dia: i + 3, status: 'F' as const }))] 
  },
];

export const mockJustificativas: Justificativa[] = [
  { 
    id: '1', 
    ra: '202401013', 
    nome: 'Beatriz Silva', 
    dataFalta: '21/05/2026', 
    motivo: 'Atestado médico (virose), em anexo entregue na secretaria.', 
    statusAnalise: 'Pendente' 
  },
  { 
    id: '2', 
    ra: '202401044', 
    nome: 'Carolina Reis', 
    dataFalta: '20/05/2026', 
    motivo: 'Problemas na linha 12-Safira da CPTM, fiquei presa na estação.', 
    statusAnalise: 'Pendente' 
  },
];