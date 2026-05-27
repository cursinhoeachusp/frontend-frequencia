import React, { useState } from 'react';
import logoCpe from '../assets/logo_cpe.png';
import { UsersIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowDownCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

// tipagem para mockar dados
type Aluno = {
  ra: string;
  nome: string;
  frequencia: number;
  faltasConsecutivas: number;
  status: 'Regular' | 'Atenção' | 'Risco de Evasão';
};

// dados mockados
const mockAlunos: Aluno[] = [
  { ra: '202401001', nome: 'Ana Santos', frequencia: 85, faltasConsecutivas: 0, status: 'Regular' },
  { ra: '202401013', nome: 'Beatriz Silva', frequencia: 70, faltasConsecutivas: 2, status: 'Atenção' },
  { ra: '202401055', nome: 'Isabella Dias', frequencia: 45, faltasConsecutivas: 5, status: 'Risco de Evasão' },
];

export default function Dashboard() {
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');

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
              <p className="text-sm font-medium text-slate-500">Total de Alunos</p>
              <p className="text-3xl font-bold text-slate-900">120</p>
            </div>
            <UsersIcon className="w-12 h-12 text-black-500" />
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
              <p className="text-3xl font-bold text-yellow-500">3</p>
            </div>
            <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500" />
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

          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
            <nav className="flex gap-6">
              <button className="border-b-2 border-slate-900 pb-4 text-sm font-semibold text-slate-900">Lista geral</button>
              <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-700">Faltas na semana</button>
              <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-700">Faltas justificadas <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">2</span></button>
              <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-700">Evasões</button>
            </nav>
            <button className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
              Registro manual
            </button>
          </div>

          <div className="mb-6 flex gap-3">
            <button className="rounded-full bg-blue-900 px-4 py-1.5 text-sm font-medium text-white">Todos (130)</button>
            <button className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200">Regulares (114)</button>
            <button className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200">Em atenção (3)</button>
            <button className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200">Risco de evasão (3)</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">RA</th>
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">Frequência</th>
                  <th className="py-3 px-4 text-center">Faltas Consecutivas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockAlunos.map((aluno) => (
                  <tr key={aluno.ra} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-bold text-slate-900">{aluno.ra}</td>
                    <td className="py-4 px-4">{aluno.nome}</td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-blue-900"
                            style={{ width: `${aluno.frequencia}%` }}
                          ></div>
                        </div>
                        <span className="font-bold">{aluno.frequencia}%</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">{aluno.faltasConsecutivas}</td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${aluno.status === 'Regular' ? 'bg-emerald-100 text-emerald-700' :
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