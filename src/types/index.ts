export type StatusMatricula = 'Regular' | 'Atenção' | 'Risco de evasão' | 'Evadido';
export type StatusPresenca = 'Presente' | 'Justificado' | 'Falta';
export type StatusAnalise = 'Pendente' | 'Aprovado' | 'Rejeitado';

export interface Aluno {
  ra: string;
  nome: string;
  frequencia: number;
  faltasConsecutivas: number;
  faltasNaSemana: number;
  status: StatusMatricula;
}

export interface DashboardEstatisticas {
  totalAlunos: number;
  regulares: number;
  emAtencao: number;
  riscoEvasao: number;
}

export interface Justificativa {
  id: string;
  ra: string;
  nome: string;
  turno: string;
  datasFalta: string[];
  motivo: string;
  statusAnalise: StatusAnalise;
  dataEnvio: string;
}