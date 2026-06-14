import React, { useState } from 'react';
import logoCpe from '../assets/logo_cpe.png';
import { 
  UsersIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowDownCircleIcon, 
  PencilSquareIcon, CalendarIcon, DocumentTextIcon, XCircleIcon, XMarkIcon 
} from '@heroicons/react/24/outline';

// tipagens
type RegistroDia = {
  dia: number;
  status: 'P' | 'F' | 'J'; // P = Presente, F = Falta, J = Justificada
};

type Aluno = {
  ra: string;
  nome: string;
  frequencia: number;
  faltasConsecutivas: number;
  faltasNaSemana: number;
  status: 'Regular' | 'Atenção' | 'Risco de evasão' | 'Evadido';
  dataEvasao?: string; 
  historico: RegistroDia[];
};

type Justificativa = {
  id: string;
  ra: string;
  nome: string;
  dataFalta: string;
  motivo: string;
  statusAnalise: 'Pendente' | 'Aprovada' | 'Recusada';
};

const gerarHistoricoMock = (padrao: 'P' | 'F'): RegistroDia[] => {
  return Array.from({ length: 15 }, (_, i) => ({
    dia: i + 1,
    status: i > 10 ? padrao : 'P'
  }));
};

// dados mockados
const dadosIniciaisAlunos: Aluno[] = [
  { ra: '202401001', nome: 'Ana Santos', frequencia: 86, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular', historico: gerarHistoricoMock('P') },
  { ra: '202401032', nome: 'Ana Júlia', frequencia: 100, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular', historico: Array.from({ length: 15 }, (_, i) => ({ dia: i + 1, status: 'P' })) },
  { ra: '202401013', nome: 'Beatriz Silva', frequencia: 73, faltasConsecutivas: 2, faltasNaSemana: 2, status: 'Atenção', historico: [...gerarHistoricoMock('P').slice(0, 13), { dia: 14, status: 'F' }, { dia: 15, status: 'F' }] },
  { ra: '202401055', nome: 'Isabella Dias', frequencia: 46, faltasConsecutivas: 5, faltasNaSemana: 5, status: 'Risco de evasão', historico: [...gerarHistoricoMock('P').slice(0, 10), { dia: 11, status: 'F' }, { dia: 12, status: 'F' }, { dia: 13, status: 'F' }, { dia: 14, status: 'F' }, { dia: 15, status: 'F' }] },
  { ra: '202401088', nome: 'Lucas Almeida', frequencia: 13, faltasConsecutivas: 13, faltasNaSemana: 0, status: 'Evadido', dataEvasao: '10/05/2026', historico: [{ dia: 1, status: 'P' }, { dia: 2, status: 'P' }, ...Array.from({ length: 13 }, (_, i) => ({ dia: i + 3, status: 'F' as const }))] },
];

const mockJustificativas: Justificativa[] = [
  { id: '1', ra: '202401013', nome: 'Beatriz Silva', dataFalta: '21/05/2026', motivo: 'Atestado médico (virose), em anexo.', statusAnalise: 'Pendente' },
  { id: '2', ra: '202401044', nome: 'Carolina Reis', dataFalta: '20/05/2026', motivo: 'Problemas na linha 12-Safira da CPTM.', statusAnalise: 'Pendente' },
];

export default function Dashboard() {
  // estados para controlar o que está ativo na tela
  const [abaAtiva, setAbaAtiva] = useState('Lista geral');
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  
  const [alunos, setAlunos] = useState<Aluno[]>(dadosIniciaisAlunos);
  const [justificativas, setJustificativas] = useState<Justificativa[]>(mockJustificativas);
  
  // modais
  const [justificativaSelecionada, setJustificativaSelecionada] = useState<Justificativa | null>(null);
  const [alunoEditando, setAlunoEditando] = useState<Aluno | null>(null);
  const [evasaoSelecionada, setEvasaoSelecionada] = useState<Aluno | null>(null);

  const totalAlunos = alunos.length;
  const totalRegulares = alunos.filter(a => a.status === 'Regular').length;
  const totalAtencao = alunos.filter(a => a.status === 'Atenção').length;
  const totalRisco = alunos.filter(a => a.status === 'Risco de evasão').length;

  // filtros de tabelas
  const alunosFiltrados = alunos.filter((aluno) => {
    if (filtroAtivo === 'Todos') return aluno.status !== 'Evadido';
    return aluno.status === filtroAtivo;
  });
  const alunosEvadidos = alunos.filter(aluno => aluno.status === 'Evadido');

  const analisarJustificativa = (id: string, novoStatus: 'Aprovada' | 'Recusada') => {
    setJustificativas(justificativas.map(just => just.id === id ? { ...just, statusAnalise: novoStatus } : just));
    setJustificativaSelecionada(null);
  };

  const salvarEdicaoAluno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoEditando) return;

    const totalDias = alunoEditando.historico.length;
    const diasPresentes = alunoEditando.historico.filter(d => d.status === 'P' || d.status === 'J').length;
    const novaFrequencia = Math.round((diasPresentes / totalDias) * 100);

    const listaAtualizada = alunos.map((aluno) => {
      if (aluno.ra === alunoEditando.ra) {
        return {
          ...aluno,
          nome: alunoEditando.nome,
          status: alunoEditando.status,
          historico: alunoEditando.historico,
          frequencia: novaFrequencia
        };
      }
      return aluno;
    });

    setAlunos(listaAtualizada);
    setAlunoEditando(null);
  };

  const alternarStatusDia = (diaModificar: number) => {
    if (!alunoEditando) return;

    const novoHistorico = alunoEditando.historico.map((reg) => {
      if (reg.dia === diaModificar) {
        const proximosStatus: Record<'P' | 'F' | 'J', 'P' | 'F' | 'J'> = { P: 'F', F: 'J', J: 'P' };
        return { ...reg, status: proximosStatus[reg.status] };
      }
      return reg;
    });

    setAlunoEditando({ ...alunoEditando, historico: novoHistorico });
  };

  const reativarMatricula = (ra: string) => {
    setAlunos(alunos.map(a => a.ra === ra ? { ...a, status: 'Regular', dataEvasao: undefined, faltasConsecutivas: 0 } : a));
    setEvasaoSelecionada(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      
      {/* modal de edicao de alunos */}
      {alunoEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-800">Editar Prontuário do Aluno</h2>
              <button onClick={() => setAlunoEditando(null)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={salvarEdicaoAluno}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-medium uppercase text-slate-500 block mb-1">Nome do Aluno</label>
                  <input type="text" value={alunoEditando.nome} onChange={(e) => setAlunoEditando({...alunoEditando, nome: e.target.value})} className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase text-slate-500 block mb-1">RA</label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-600 font-mono">{alunoEditando.ra}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase text-slate-500 block mb-1">Classificação Visual</label>
                    <select value={alunoEditando.status} onChange={(e) => setAlunoEditando({...alunoEditando, status: e.target.value as any})} className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-blue-500 focus:outline-none">
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
                    {alunoEditando.historico.map((registro) => (
                      <button
                        key={registro.dia}
                        type="button"
                        onClick={() => alternarStatusDia(registro.dia)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-md border font-medium text-xs transition-all shadow-xs ${
                          registro.status === 'P' ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600' :
                          registro.status === 'F' ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' :
                          'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                        }`}
                      >
                        <span className="opacity-75 text-[10px]">Dia</span>
                        <span className="text-sm font-bold">{registro.dia}</span>
                        <span className="text-[10px] font-bold mt-0.5">
                          {registro.status === 'P' ? 'PRES' : registro.status === 'F' ? 'FALTA' : 'JUST'}
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
                <button type="button" onClick={() => setAlunoEditando(null)} className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 shadow-md">Salvar e recalcular</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* modal de justificativas */}
      {justificativaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h2 className="text-lg font-bold text-slate-800">Analisar justificativa</h2>
              <button onClick={() => setJustificativaSelecionada(null)} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs font-medium uppercase text-slate-500">Aluno(a)</p><p className="font-semibold">{justificativaSelecionada.nome}</p></div>
                <div><p className="text-xs font-medium uppercase text-slate-500">RA</p><p className="font-semibold">{justificativaSelecionada.ra}</p></div>
              </div>
              <div><p className="text-xs font-medium uppercase text-slate-500">Data da falta</p><p className="font-semibold">{justificativaSelecionada.dataFalta}</p></div>
              <div className="rounded-md bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs font-medium uppercase text-slate-500 mb-1">Motivo</p>
                <p className="text-sm text-slate-700">{justificativaSelecionada.motivo}</p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 p-4 bg-slate-50 rounded-b-xl">
              <button onClick={() => analisarJustificativa(justificativaSelecionada.id, 'Recusada')} className="flex-1 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">Recusar</button>
              <button onClick={() => analisarJustificativa(justificativaSelecionada.id, 'Aprovada')} className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Aprovar falta</button>
            </div>
          </div>
        </div>
      )}

      {/* modal de evasão */}
      {evasaoSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-red-100 bg-red-50 p-4 rounded-t-xl">
              <div className="flex items-center gap-2 text-red-800">
                <ExclamationTriangleIcon className="w-6 h-6" /> <h2 className="text-lg font-bold">Detalhes da evasão</h2>
              </div>
              <button onClick={() => setEvasaoSelecionada(null)} className="text-red-400 hover:text-red-600"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><p className="text-xs font-medium uppercase text-slate-500">Aluno(a)</p><p className="text-lg font-semibold text-slate-900">{evasaoSelecionada.nome}</p><p className="text-sm text-slate-500">RA: {evasaoSelecionada.ra}</p></div>
              <div className="border-l-4 border-red-500 pl-4 py-1">
                <p className="text-xs font-medium uppercase text-red-500">Data do desligamento</p>
                <p className="font-bold text-slate-900">{evasaoSelecionada.dataEvasao}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs font-medium uppercase text-slate-500 mb-1">Motivo do sistema</p>
                <p className="text-sm text-slate-700">Abandono letivo. O aluno acumulou {evasaoSelecionada.faltasConsecutivas} faltas consecutivas.</p>
              </div>
            </div>
            <div className="border-t border-slate-100 p-4 bg-slate-50 rounded-b-xl">
              <button onClick={() => reativarMatricula(evasaoSelecionada.ra)} className="w-full rounded-md border-2 border-emerald-600 bg-white px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50">
                Reativar matrícula do aluno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* header */}
      <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sistema de coleta de frequência | Painel administrativo</h1>
          <p className="text-sm text-slate-500">Cursinho Popular EACH - USP</p>
        </div>
        <div className="flex items-center gap-4">
          <img src={logoCpe} className='w-[120px]' alt="" />
          <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900"><span>Sair</span></button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-6">
        
        {/* cards superiores */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
            <div><p className="text-sm font-medium text-slate-500">Total de alunos ativos</p><p className="text-3xl font-bold text-slate-900">{totalAlunos}</p></div>
            <UsersIcon className="w-12 h-12 text-slate-500" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
            <div><p className="text-sm font-medium text-slate-500">Regulares</p><p className="text-3xl font-bold text-emerald-500">{totalRegulares}</p></div>
            <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
            <div><p className="text-sm font-medium text-slate-500">Em atenção</p><p className="text-3xl font-bold text-amber-500">{totalAtencao}</p></div>
            <ExclamationTriangleIcon className="w-12 h-12 text-amber-500" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
            <div><p className="text-sm font-medium text-slate-500">Risco de evasão</p><p className="text-3xl font-bold text-red-500">{totalRisco}</p></div>
            <ArrowDownCircleIcon className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* tabelas */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
            <nav className="flex gap-6">
              {['Lista geral', 'Faltas na semana', 'Faltas justificadas', 'Evasões'].map((aba) => (
                <button 
                  key={aba} onClick={() => setAbaAtiva(aba)}
                  className={`pb-4 text-sm font-semibold transition-colors ${abaAtiva === aba ? 'border-b-2 border-orange-500 text-orange-500' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {aba}
                  {aba === 'Faltas justificadas' && (
                    <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                      {justificativas.filter(j => j.statusAnalise === 'Pendente').length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <button className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">Registro manual</button>
          </div>

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
             <CalendarIcon className="w-5 h-5" /> <span>Alunos com faltas na semana atual</span>
           </div>
          )}
          {abaAtiva === 'Faltas justificadas' && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-orange-50 p-3 text-sm text-orange-800"><DocumentTextIcon className="w-5 h-5" /> <span>Solicitações de justificativa em análise.</span></div>
          )}
          {abaAtiva === 'Evasões' && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800"><XCircleIcon className="w-5 h-5" /> <span>Histórico de alunos evadidos.</span></div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">RA</th>
                  <th className="py-3 px-4">Nome</th>
                  {abaAtiva === 'Faltas justificadas' ? (
                    <><th className="py-3 px-4">Data da falta</th><th className="py-3 px-4">Motivo</th><th className="py-3 px-4">Status da análise</th></>
                  ) : abaAtiva === 'Evasões' ? (
                    <><th className="py-3 px-4">Data da evasão</th><th className="py-3 px-4">Faltas consecutivas</th><th className="py-3 px-4">Status</th></>
                  ) : (
                    <><th className="py-3 px-4">{abaAtiva === 'Lista geral' ? 'Frequência' : 'Faltas na semana'}</th><th className="py-3 px-4 text-center">Faltas consecutivas</th><th className="py-3 px-4">Status</th></>
                  )}
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              
              <tbody>
                {abaAtiva === 'Faltas justificadas' && justificativas.map((j) => (
                  <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-bold text-slate-900">{j.ra}</td>
                    <td className="py-4 px-4">{j.nome}</td>
                    <td className="py-4 px-4">{j.dataFalta}</td>
                    <td className="py-4 px-4 max-w-xs truncate" title={j.motivo}>{j.motivo}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${j.statusAnalise === 'Aprovada' ? 'bg-emerald-100 text-emerald-700' : j.statusAnalise === 'Recusada' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {j.statusAnalise}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {j.statusAnalise === 'Pendente' ? (
                         <button onClick={() => setJustificativaSelecionada(j)} className="text-blue-600 font-medium hover:text-blue-800">Analisar</button>
                      ) : <span className="text-slate-400 text-sm">Analisada</span>}
                    </td>
                  </tr>
                ))}

                {abaAtiva !== 'Faltas justificadas' && (abaAtiva === 'Evasões' ? alunosEvadidos : alunosFiltrados).map((aluno) => (
                  <tr key={aluno.ra} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-bold text-slate-900">{aluno.ra}</td>
                    <td className="py-4 px-4">{aluno.nome}</td>
                    {abaAtiva === 'Evasões' ? (
                      <><td className="py-4 px-4 text-slate-900">{aluno.dataEvasao}</td><td className="py-4 px-4 text-center">{aluno.faltasConsecutivas}</td></>
                    ) : (
                      <>
                        <td className="py-4 px-4">
                          {abaAtiva === 'Lista geral' ? (
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-blue-900" style={{ width: `${aluno.frequencia}%` }}></div></div>
                              <span className="font-bold">{aluno.frequencia}%</span>
                            </div>
                          ) : <span className="font-medium text-slate-900 pl-8">{aluno.faltasNaSemana}</span>}
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
                          <button onClick={() => setEvasaoSelecionada(aluno)} className="text-slate-400 hover:text-blue-600"><DocumentTextIcon className="h-5 w-5" /></button>
                        ) : (
                          <button onClick={() => setAlunoEditando(aluno)} className="text-slate-400 hover:text-blue-600"><PencilSquareIcon className="h-5 w-5" /></button>
                        )}
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