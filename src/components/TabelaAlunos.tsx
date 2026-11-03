import React from 'react';
import {
  CalendarIcon,
  DocumentTextIcon,
  XCircleIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import type { Aluno, Justificativa } from '../types';

interface TabelaAlunosProps {
  abaAtiva: string;
  filtroAtivo: string;
  setFiltroAtivo: (filtro: string) => void;
  alunos: Aluno[];
  justificativas: Justificativa[];
  onEditAluno: (aluno: Aluno) => void;
  onAnalyzeJustificativa: (just: Justificativa) => void;
  onViewEvasao: (aluno: Aluno) => void;
}

export default function TabelaAlunos({
  abaAtiva,
  filtroAtivo,
  setFiltroAtivo,
  alunos,
  justificativas,
  onEditAluno,
  onAnalyzeJustificativa,
  onViewEvasao
}: TabelaAlunosProps) {
  const alunosFiltrados = alunos.filter((aluno) => {
    if (filtroAtivo === 'Todos') return aluno.status !== 'Evadido';
    return aluno.status === filtroAtivo;
  });

  const alunosEvadidos = alunos.filter((aluno) => aluno.status === 'Evadido');

  return (
    <>
      {abaAtiva === 'Lista geral' && (
        <div className="mb-6 flex gap-3">
          <button onClick={() => setFiltroAtivo('Todos')} className={`rounded-md px-4 py-1.5 text-sm font-medium ${filtroAtivo === 'Todos' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todos</button>
          <button onClick={() => setFiltroAtivo('Regular')} className={`rounded-md px-4 py-1.5 text-sm font-medium ${filtroAtivo === 'Regular' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Regulares</button>
          <button onClick={() => setFiltroAtivo('Atenção')} className={`rounded-md px-4 py-1.5 text-sm font-medium ${filtroAtivo === 'Atenção' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Em atenção</button>
          <button onClick={() => setFiltroAtivo('Risco de evasão')} className={`rounded-md px-4 py-1.5 text-sm font-medium ${filtroAtivo === 'Risco de evasão' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Risco de evasão</button>
        </div>
      )}

      {abaAtiva === 'Faltas na semana' && (
        <div className="mb-6 flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
          <CalendarIcon className="w-5 h-5" />
          <span>Alunos com faltas na semana atual</span>
        </div>
      )}

      {abaAtiva === 'Faltas justificadas' && (
        <div className="mb-6 flex items-center gap-2 rounded-md bg-orange-50 p-3 text-sm text-orange-800">
          <DocumentTextIcon className="w-5 h-5" />
          <span>Solicitações de justificativa em análise.</span>
        </div>
      )}

      {abaAtiva === 'Evasões' && (
        <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
          <XCircleIcon className="w-5 h-5" />
          <span>Histórico de alunos evadidos.</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="py-3 px-4">RA</th>
              <th className="py-3 px-4">Nome</th>
              {abaAtiva === 'Faltas justificadas' ? (
                <>
                  <th className="py-3 px-4">Data da Falta</th>
                  <th className="py-3 px-4">Motivo</th>
                  <th className="py-3 px-4">Status da Análise</th>
                </>
              ) : abaAtiva === 'Evasões' ? (
                <>
                  <th className="py-3 px-4 text-center">Faltas Consecutivas</th>
                  <th className="py-3 px-4">Status</th>
                </>
              ) : (
                <>
                  <th className="py-3 px-4">{abaAtiva === 'Lista geral' ? 'Frequência' : 'Faltas na semana'}</th>
                  <th className="py-3 px-4 text-center">Faltas consecutivas</th>
                  <th className="py-3 px-4">Status</th>
                </>
              )}
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          
          <tbody>
            {abaAtiva === 'Faltas justificadas' && justificativas.map((j) => (
              <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-4 font-bold text-slate-900">{j.ra}</td>
                <td className="py-4 px-4">{j.nome}</td>
                {/* Aqui entra o join para formatar o array de datas corretamente */}
                <td className="py-4 px-4">{j.datasFalta.join(', ')}</td>
                <td className="py-4 px-4 max-w-xs truncate" title={j.motivo}>{j.motivo}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${j.statusAnalise === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' : j.statusAnalise === 'Rejeitado' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {j.statusAnalise}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  {j.statusAnalise === 'Pendente' ? (
                    <button onClick={() => onAnalyzeJustificativa(j)} className="text-blue-600 font-medium hover:text-blue-800">Analisar</button>
                  ) : (
                    <span className="text-slate-400 text-sm">Analisada</span>
                  )}
                </td>
              </tr>
            ))}

            {abaAtiva !== 'Faltas justificadas' && (abaAtiva === 'Evasões' ? alunosEvadidos : alunosFiltrados).map((aluno) => (
              <tr key={aluno.ra} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-4 font-bold text-slate-900">{aluno.ra}</td>
                <td className="py-4 px-4">{aluno.nome}</td>
                {abaAtiva === 'Evasões' ? (
                  <>
                    <td className="py-4 px-4 text-center">{aluno.faltasConsecutivas}</td>
                  </>
                ) : (
                  <>
                    <td className="py-4 px-4">
                      {abaAtiva === 'Lista geral' ? (
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 rounded-full bg-slate-200">
                            <div className="h-2 rounded-full bg-blue-900" style={{ width: `${aluno.frequencia}%` }}></div>
                          </div>
                          <span className="font-bold">{aluno.frequencia}%</span>
                        </div>
                      ) : (
                        <span className="font-medium text-slate-900 pl-8">{aluno.faltasNaSemana}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">{aluno.faltasConsecutivas}</td>
                  </>
                )}
                <td className="py-4 px-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${aluno.status === 'Regular' ? 'bg-emerald-100 text-emerald-700' : aluno.status === 'Atenção' ? 'bg-amber-100 text-amber-700' : aluno.status === 'Evadido' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>
                    {aluno.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-end">
                    {abaAtiva === 'Evasões' ? (
                      <button onClick={() => onViewEvasao(aluno)} className="text-slate-400 hover:text-blue-600">
                        <DocumentTextIcon className="h-5 w-5" />
                      </button>
                    ) : (
                      <button onClick={() => onEditAluno(aluno)} className="text-slate-400 hover:text-blue-600">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
