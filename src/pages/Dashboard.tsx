import React, { useState } from 'react';
import logoCpe from '../assets/logo_cpe.png';
import { 
  UsersIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ArrowDownCircleIcon, 
  PencilSquareIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

type Aluno = {
  ra: string;
  nome: string;
  frequencia: number;
  faltasConsecutivas: number;
  faltasNaSemana: number;
  status: 'Regular' | 'Atenção' | 'Risco de evasão';
};

// dados mockados
const mockAlunos: Aluno[] = [
  { ra: '202401001', nome: 'Ana Santos', frequencia: 85, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular' },
  { ra: '202401032', nome: 'Ana Júlia', frequencia: 100, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular' },
  { ra: '202401013', nome: 'Beatriz Silva', frequencia: 70, faltasConsecutivas: 2, faltasNaSemana: 2, status: 'Atenção' },
  { ra: '202401044', nome: 'Carolina Reis', frequencia: 75, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular' },
  { ra: '202401055', nome: 'Isabella Dias', frequencia: 45, faltasConsecutivas: 5, faltasNaSemana: 5, status: 'Risco de evasão' },
  { ra: '202401026', nome: 'Maria Silva', frequencia: 78, faltasConsecutivas: 3, faltasNaSemana: 3, status: 'Atenção' },
];

export default function Dashboard() {
  // estados para controlar o que está ativo na tela
  const [abaAtiva, setAbaAtiva] = useState('Lista geral');
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');

  // só mostra os alunos do status clicado
  const alunosFiltrados = mockAlunos.filter((aluno) => {
    if (filtroAtivo === 'Todos') return true;
    return aluno.status === filtroAtivo;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sistema de coleta de frequência | Painel administrativo</h1>
          <p className="text-sm text-slate-500">Cursinho Popular EACH - USP</p>
        </div>
        <div className="flex items-center gap-4">
          <img src={logoCpe} className='w-[120px]' alt="" />
          <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-6">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-500">Total de alunos</p>
              <p className="text-3xl font-bold text-slate-900">120</p>
            </div>
            <UsersIcon className="w-12 h-12 text-slate-500" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-500">Regulares</p>
              <p className="text-3xl font-bold text-emerald-500">114</p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-500">Em atenção</p>
              <p className="text-3xl font-bold text-amber-500">3</p>
            </div>
            <ExclamationTriangleIcon className="w-12 h-12 text-amber-500" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-500">Risco de evasão</p>
              <p className="text-3xl font-bold text-red-500">3</p>
            </div>
            <ArrowDownCircleIcon className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
          
          {/* navegacao de abas */}
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
            <nav className="flex gap-6">
              <button 
                onClick={() => setAbaAtiva('Lista geral')}
                className={`pb-4 text-sm font-semibold ${abaAtiva === 'Lista geral' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Lista geral
              </button>
              <button 
                onClick={() => setAbaAtiva('Faltas na semana')}
                className={`pb-4 text-sm font-semibold ${abaAtiva === 'Faltas na semana' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Faltas na semana
              </button>
              <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-700">
                Faltas justificadas <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">2</span>
              </button>
              <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-700">
                Evasões
              </button>
            </nav>
            <button className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
              Registro manual
            </button>
          </div>

          {abaAtiva === 'Lista geral' && (
            <div className="mb-6 flex gap-3">
              <button 
                onClick={() => setFiltroAtivo('Todos')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium ${filtroAtivo === 'Todos' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Todos (130)
              </button>
              <button 
                onClick={() => setFiltroAtivo('Regular')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium ${filtroAtivo === 'Regular' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Regulares (114)
              </button>
              <button 
                onClick={() => setFiltroAtivo('Atenção')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium ${filtroAtivo === 'Atenção' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Em atenção (3)
              </button>
              <button 
                onClick={() => setFiltroAtivo('Risco de evasão')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium ${filtroAtivo === 'Risco de evasão' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Risco de evasão (3)
              </button>
            </div>
          )}

          {abaAtiva === 'Faltas na semana' && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              <CalendarIcon className="w-5 h-5" />
              <span>Alunos com faltas na semana atual (ordenado por quantidade de faltas)</span>
            </div>
          )}

          {/* tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">RA</th>
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">{abaAtiva === 'Lista geral' ? 'Frequência' : 'Faltas na semana'}</th>
                  <th className="py-3 px-4 text-center">Faltas consecutivas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados.map((aluno) => (
                  <tr key={aluno.ra} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-bold text-slate-900">{aluno.ra}</td>
                    <td className="py-4 px-4">{aluno.nome}</td>

                    <td className="py-4 px-4">
                      {abaAtiva === 'Lista geral' ? (
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-blue-900"
                              style={{ width: `${aluno.frequencia}%` }}
                            ></div>
                          </div>
                          <span className="font-bold">{aluno.frequencia}%</span>
                        </div>
                      ) : (
                        <span className="font-medium text-slate-900 pl-8">{aluno.faltasNaSemana}</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">{aluno.faltasConsecutivas}</td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        aluno.status === 'Regular' ? 'bg-emerald-100 text-emerald-700' :
                        aluno.status === 'Atenção' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {aluno.status}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex justify-end">
                        <button
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                          title="Editar aluno"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}