import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Aluno, StatusPresenca } from '../../types';

interface ModalEdicaoProps {
  aluno: Aluno;
  onClose: () => void;
  onSave: (alunoEditado: Aluno) => void;
}

export default function ModalEdicao({ aluno, onClose, onSave }: ModalEdicaoProps) {
  const [editando, setEditando] = useState<Aluno>(aluno);
  
  // Estado isolado para o histórico, simulando os dias do mês
  const [historico, setHistorico] = useState<{ dia: number; status: StatusPresenca }[]>(
    Array.from({ length: 15 }, (_, i) => ({ dia: i + 1, status: 'Presente' }))
  );

  const alternarStatusDia = (diaModificar: number) => {
    const novoHistorico = historico.map((reg) => {
      if (reg.dia === diaModificar) {
        // Mapeamento atualizado para o novo contrato de StatusPresenca
        const proximosStatus: Record<StatusPresenca, StatusPresenca> = { 
          'Presente': 'Falta', 
          'Falta': 'Justificado', 
          'Justificado': 'Presente' 
        };
        return { ...reg, status: proximosStatus[reg.status] };
      }
      return reg;
    });
    setHistorico(novoHistorico);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // No futuro, isso será enviado via PATCH para a API recalcular.
    // Por enquanto, simulamos o recálculo localmente para o frontend reagir.
    const totalDias = historico.length;
    const diasPresentes = historico.filter(d => d.status === 'Presente' || d.status === 'Justificado').length;
    const novaFrequencia = Math.round((diasPresentes / totalDias) * 100);

    onSave({
      ...editando,
      frequencia: novaFrequencia
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-slate-800">Editar prontuário do aluno</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-5">
            <div>
              <label className="text-xs font-medium uppercase text-slate-500 block mb-1">Nome do aluno</label>
              <input 
                type="text" 
                value={editando.nome} 
                onChange={(e) => setEditando({...editando, nome: e.target.value})} 
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase text-slate-500 block mb-1">RA</label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-600 font-mono">
                  {editando.ra}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-slate-500 block mb-1">Classificação visual</label>
                <select 
                  value={editando.status} 
                  onChange={(e) => setEditando({...editando, status: e.target.value as Aluno['status']})} 
                  className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="Regular">Regular</option>
                  <option value="Atenção">Atenção</option>
                  <option value="Risco de evasão">Risco de evasão</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase text-slate-700 block">Grade de presenças (maio)</label>
                <span className="text-xs text-slate-400">Clique no dia para alternar</span>
              </div>
              
              <div className="grid grid-cols-5 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                {historico.map((registro) => (
                  <button
                    key={registro.dia}
                    type="button"
                    onClick={() => alternarStatusDia(registro.dia)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-md border font-medium text-xs transition-all shadow-xs ${
                      registro.status === 'Presente' ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600' :
                      registro.status === 'Falta' ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' :
                      'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                    }`}
                  >
                    <span className="opacity-75 text-[10px]">Dia</span>
                    <span className="text-sm font-bold">{registro.dia}</span>
                    <span className="text-[10px] font-bold mt-0.5">
                      {registro.status === 'Presente' ? 'PRES' : registro.status === 'Falta' ? 'FALTA' : 'JUST'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 mt-3 justify-center text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Presente</div>
                <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span> Falta</div>
                <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Justificada</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 p-4 bg-slate-50 rounded-b-xl justify-end sticky bottom-0">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">Cancelar</button>
            <button type="submit" className="rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 shadow-md">Salvar e recalcular</button>
          </div>
        </form>
      </div>
    </div>
  );
}