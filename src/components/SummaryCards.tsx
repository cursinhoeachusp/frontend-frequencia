import React from 'react';
import type { DashboardEstatisticas } from '../types';

interface SummaryCardsProps {
  dados: DashboardEstatisticas;
}

export default function SummaryCards({ dados }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {/* Agora você substitui as contagens manuais (ex: alunos.length) pelos dados da API */}
      <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
        <p className="text-sm text-slate-500">Total de Alunos</p>
        <p className="text-2xl font-bold">{dados.totalAlunos}</p>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
        <p className="text-sm text-slate-500">Regulares</p>
        <p className="text-2xl font-bold text-green-600">{dados.regulares}</p>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
        <p className="text-sm text-slate-500">Em Atenção</p>
        <p className="text-2xl font-bold text-yellow-600">{dados.emAtencao}</p>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
        <p className="text-sm text-slate-500">Risco de Evasão</p>
        <p className="text-2xl font-bold text-red-600">{dados.riscoEvasao}</p>
      </div>
    </div>
  );
}