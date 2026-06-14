import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Justificativa } from '../../types';

interface ModalJustificativaProps {
  justificativa: Justificativa;
  onClose: () => void;
  onAnalyze: (id: string, novoStatus: 'Aprovada' | 'Recusada') => void;
}

export default function ModalJustificativa({ justificativa, onClose, onAnalyze }: ModalJustificativaProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="text-lg font-bold text-slate-800">Analisar Justificativa</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Aluno(a)</p>
              <p className="font-semibold">{justificativa.nome}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">RA</p>
              <p className="font-semibold">{justificativa.ra}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Data da Falta</p>
            <p className="font-semibold">{justificativa.dataFalta}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3 border border-slate-100">
            <p className="text-xs font-medium uppercase text-slate-500 mb-1">Motivo</p>
            <p className="text-sm text-slate-700">{justificativa.motivo}</p>
          </div>
        </div>
        
        <div className="flex gap-3 border-t border-slate-100 p-4 bg-slate-50 rounded-b-xl">
          <button 
            onClick={() => onAnalyze(justificativa.id, 'Recusada')} 
            className="flex-1 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Recusar
          </button>
          <button 
            onClick={() => onAnalyze(justificativa.id, 'Aprovada')} 
            className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Aprovar Falta
          </button>
        </div>
      </div>
    </div>
  );
}