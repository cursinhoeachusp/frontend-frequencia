import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Aluno } from '../../types';

interface ModalEvasaoProps {
  aluno: Aluno;
  onClose: () => void;
  onReactivate: (ra: string) => void;
}

export default function ModalEvasao({ aluno, onClose, onReactivate }: ModalEvasaoProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-red-100 bg-red-50 p-4 rounded-t-xl">
          <div className="flex items-center gap-2 text-red-800">
            <ExclamationTriangleIcon className="w-6 h-6" /> 
            <h2 className="text-lg font-bold">Detalhes da evasão</h2>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Aluno(a)</p>
            <p className="text-lg font-semibold text-slate-900">{aluno.nome}</p>
            <p className="text-sm text-slate-500">RA: {aluno.ra}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3 border border-slate-100">
            <p className="text-xs font-medium uppercase text-slate-500 mb-1">Motivo do sistema</p>
            <p className="text-sm text-slate-700">
              Abandono letivo. O aluno acumulou {aluno.faltasConsecutivas} faltas consecutivas.
            </p>
          </div>
        </div>
        
        <div className="border-t border-slate-100 p-4 bg-slate-50 rounded-b-xl">
          <button 
            onClick={() => onReactivate(aluno.ra)} 
            className="w-full rounded-md border-2 border-emerald-600 bg-white px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            Reativar matrícula do aluno
          </button>
        </div>
      </div>
    </div>
  );
}