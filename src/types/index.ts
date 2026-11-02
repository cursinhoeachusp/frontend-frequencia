export type StatusMatricula = 'Regular' | 'Atenção' | 'Risco de evasão' | 'Evadido';
export type StatusPresenca = 'Presente' | 'Justificado' | 'Falta';

export interface Aluno {
  ra: string;
  nome: string; 
  frequencia: number;
  totalFaltas: number;
  diasGarantidos: number;
  totalDiasEsperados: number;
  totalFaltasJustificadas: number;
  faltasConsecutivas: number;
  statusMatricula: StatusMatricula;
}

export interface DashboardEstatisticas {
  totalAlunos: number;
  regulares: number;
  emAtencao: number;
  riscoEvasao: number;
}