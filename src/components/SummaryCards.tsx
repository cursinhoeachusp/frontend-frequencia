import React from 'react';
import { 
  UsersIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ArrowDownCircleIcon 
} from '@heroicons/react/24/outline';

import type { Aluno } from '../types';

interface SummaryCardsProps {
  alunos: Aluno[];
}

export default function SummaryCards({ alunos }: SummaryCardsProps) {
  const totalAlunos = alunos.length;
  const totalRegulares = alunos.filter(a => a.status === 'Regular').length;
  const totalAtencao = alunos.filter(a => a.status === 'Atenção').length;
  const totalRisco = alunos.filter(a => a.status === 'Risco de evasão').length;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
        <div>
          <p className="text-sm font-medium text-slate-500">Total de alunos ativos</p>
          <p className="text-3xl font-bold text-slate-900">{totalAlunos}</p>
        </div>
        <UsersIcon className="w-12 h-12 text-slate-500" />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
        <div>
          <p className="text-sm font-medium text-slate-500">Regulares</p>
          <p className="text-3xl font-bold text-emerald-500">{totalRegulares}</p>
        </div>
        <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
        <div>
          <p className="text-sm font-medium text-slate-500">Em atenção</p>
          <p className="text-3xl font-bold text-amber-500">{totalAtencao}</p>
        </div>
        <ExclamationTriangleIcon className="w-12 h-12 text-amber-500" />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
        <div>
          <p className="text-sm font-medium text-slate-500">Risco de evasão</p>
          <p className="text-3xl font-bold text-red-500">{totalRisco}</p>
        </div>
        <ArrowDownCircleIcon className="w-12 h-12 text-red-500" />
      </div>
    </div>
  );
}