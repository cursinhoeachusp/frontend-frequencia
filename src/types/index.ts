// tipagem para o histórico de presenças no calendário
export type RegistroDia = {
  dia: number;
  status: 'P' | 'F' | 'J';
};

// tipagem principal do aluno
export type Aluno = {
  ra: string;
  nome: string;
  frequencia: number;
  faltasConsecutivas: number;
  faltasNaSemana: number;
  status: 'Regular' | 'Atenção' | 'Risco de evasão' | 'Evadido';
  dataEvasao?: string; 
  historico: RegistroDia[];
};

// tipagem para as solicitações de justificativa
export type Justificativa = {
  id: string;
  ra: string;
  nome: string;
  dataFalta: string;
  motivo: string;
  statusAnalise: 'Pendente' | 'Aprovada' | 'Recusada';
};