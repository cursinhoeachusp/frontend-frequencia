import type { Aluno, DashboardEstatisticas } from '../types';
import { alunosMock, summaryDataMock, justificativasMock } from '../mocks/data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const buscarEstatisticasDashboard = async (): Promise<DashboardEstatisticas> => {
  await delay(800); 
  return summaryDataMock; 
};

export const buscarAlunos = async (status?: string): Promise<Aluno[]> => {
  await delay(1000); 
  
  if (status) {
    return alunosMock.filter(aluno => aluno.status === status);
  }
  
  return alunosMock;
};

export const enviarJustificativa = async (ra: string, datasFalta: string[], motivo: string): Promise<boolean> => {
  await delay(1200);
  console.log(`Simulando envio de justificativa para ${ra}`, { datasFalta, motivo });
  return true; 
};