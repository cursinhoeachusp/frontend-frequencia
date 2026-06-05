import React, { useState, useEffect } from 'react';
import logoCpe from '../assets/logo_cpe.png';
import { 
  UsersIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ArrowDownCircleIcon, 
  PencilSquareIcon,
  CalendarIcon,
  ArrowLeftCircleIcon,
  DocumentTextIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

type Aluno = {
  ra: string;
  nome: string;
  frequencia: number;
  faltasConsecutivas: number;
  faltasNaSemana: number;
  status: 'Regular' | 'Atenção' | 'Risco de evasão' | 'Evadido';
  dataEvasao?: string;
};

type Justificativa = {
  id: string;
  ra: string;
  nome: string;
  dataFalta: string;
  motivo: string;
  statusAnalise: 'Pendente' | 'Aprovada' | 'Recusada';
}

// dados mockados
const mockAlunos: Aluno[] = [
  { ra: '202401001', nome: 'Ana Santos', frequencia: 85, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular' },
  { ra: '202401032', nome: 'Ana Júlia', frequencia: 100, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular' },
  { ra: '202401013', nome: 'Beatriz Silva', frequencia: 70, faltasConsecutivas: 2, faltasNaSemana: 2, status: 'Atenção' },
  { ra: '202401044', nome: 'Carolina Reis', frequencia: 75, faltasConsecutivas: 0, faltasNaSemana: 0, status: 'Regular' },
  { ra: '202401055', nome: 'Isabella Dias', frequencia: 45, faltasConsecutivas: 5, faltasNaSemana: 5, status: 'Risco de evasão' },
  { ra: '202401026', nome: 'Maria Silva', frequencia: 78, faltasConsecutivas: 3, faltasNaSemana: 3, status: 'Atenção' },
  { ra: '202401088', nome: 'Lucas Almeida', frequencia: 10, faltasConsecutivas: 15, faltasNaSemana: 0, status: 'Evadido', dataEvasao: '10/05/2024' },
];

const mockJustificativas: Justificativa[] = [
  {id: '1', ra: '202401013', nome: 'Beatriz Silva', dataFalta: '04/06/2026', motivo: 'Problema no transporte público', statusAnalise: 'Recusada'},
];

export default function Dashboard() {
  // estados para controlar o que está ativo na tela
  const [abaAtiva, setAbaAtiva] = useState('Lista geral');
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [justificativas, setJustificativas] = useState<Justificativa[]>(mockJustificativas);
  const [justificativaSelecionada, setJustificativaSelecionada] = useState<Justificativa | null>(null);

  // efeito para buscar no backend
  useEffect(() => {
    const buscarDadosDoBackend = async () => {
      try {
        const resposta = await fetch('http://localhost:3000/api/admin/alunos'); 
        
        if (!resposta.ok) {
          throw new Error('Erro na conexão com a API');
        }

        const dadosReais = await resposta.json();
        setAlunos(dadosReais);
        
      } catch (error) {
        console.error("Backend desligado ou erro na rota:", error);
        setErro(true);
        setAlunos(mockAlunos); // usa os dados de mentira se o backend falhar
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosDoBackend();
  }, []);

  // só mostra os alunos do status clicado
  const alunosFiltrados = alunos.filter((aluno) => {
    if (filtroAtivo === 'Todos') return aluno.status !== 'Evadido';
    return aluno.status === filtroAtivo;
  });

  const alunosEvadidos = mockAlunos.filter(aluno => aluno.status === 'Evadido');

  const analisarJustificativa = (id: string, novoStatus: 'Aprovada' | 'Recusada') => {
    const novaLista = justificativas.map(just => 
      just.id === id ? { ...just, statusAnalise: novoStatus } : just
    );
    setJustificativas(novaLista);
    setJustificativaSelecionada(null);
    
  };

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-500 animate-pulse">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* avisando erro da conexao com o backend */}
      {erro && (
        <div className="bg-red-500 text-white text-center py-1 text-sm">
          O backend não respondeu. Exibindo dados de teste.
        </div>
      )}

      {/* modal */}
      {justificativaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h2 className="text-lg font-bold text-slate-800">Analisar justificativa</h2>
              <button 
                onClick={() => setJustificativaSelecionada(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Nome do estudante</p>
                  <p className="font-semibold text-slate-900">{justificativaSelecionada.nome}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">RA</p>
                  <p className="font-semibold text-slate-900">{justificativaSelecionada.ra}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Data da falta</p>
                <p className="font-semibold text-slate-900">{justificativaSelecionada.dataFalta}</p>
              </div>

              <div className="rounded-md bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs font-medium uppercase text-slate-500 mb-1">Motivo</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  "{justificativaSelecionada.motivo}"
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 p-4 bg-slate-50 rounded-b-xl">
              <button 
                onClick={() => analisarJustificativa(justificativaSelecionada.id, 'Recusada')}
                className="flex-1 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Recusar
              </button>
              <button 
                onClick={() => analisarJustificativa(justificativaSelecionada.id, 'Aprovada')}
                className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Aprovar falta
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
          <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeftCircleIcon className="w-6 h-6" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* conteudo principal */}
      <main className="mx-auto max-w-7xl px-8 py-6">
        {/* cards superiores */}
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
              {['Lista geral', 'Faltas na semana', 'Faltas justificadas', 'Evasões'].map((aba) => (
                <button 
                  key={aba}
                  onClick={() => setAbaAtiva(aba)}
                  className={`pb-4 text-sm font-semibold transition-colors ${
                    abaAtiva === aba 
                      ? 'border-b-2 border-orange-500 text-orange-500' 
                      : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {aba}
                  {aba === 'Faltas justificadas' && (
                    <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">2</span>
                  )}
                </button>
              ))}
            </nav>
            <button className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
              Registro manual
            </button>
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
             <CalendarIcon className="w-5 h-5" />
             <span>Alunos com faltas na semana atual (ordenado por quantidade de faltas)</span>
           </div>
          )}

          {abaAtiva === 'Faltas justificadas' && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-orange-50 p-3 text-sm text-orange-800">
              <DocumentTextIcon className="w-5 h-5" />
              <span>Solicitações de justificativa aguardando análise da coordenação.</span>
            </div>
          )}

          {abaAtiva === 'Evasões' && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
              <XCircleIcon className="w-5 h-5" />
              <span>Histórico de alunos com matrícula cancelada por evasão neste semestre.</span>
            </div>
          )}

          {/* tabela dinamica */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">RA</th>
                  <th className="py-3 px-4">Nome</th>
                  
                  {/* cabecalho dinamico */}
                  {abaAtiva === 'Faltas justificadas' ? (
                    <>
                      <th className="py-3 px-4">Data da falta</th>
                      <th className="py-3 px-4">Motivo</th>
                      <th className="py-3 px-4">Status da análise</th>
                    </>
                  ) : abaAtiva === 'Evasões' ? (
                    <>
                      <th className="py-3 px-4">Data da evasão</th>
                      <th className="py-3 px-4">Faltas consecutivas</th>
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
                {abaAtiva === 'Faltas justificadas' && mockJustificativas.map((justificativa) => (
                  <tr key={justificativa.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-bold text-slate-900">{justificativa.ra}</td>
                    <td className="py-4 px-4">{justificativa.nome}</td>
                    <td className="py-4 px-4">{justificativa.dataFalta}</td>
                    <td className="py-4 px-4 max-w-xs truncate" title={justificativa.motivo}>{justificativa.motivo}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex rounded-full ${
                        justificativa.statusAnalise === 'Aprovada' ? 'bg-emerald-100 text-emerald-700' :
                        justificativa.statusAnalise === 'Pendente' ? 'bg-amber-100 text-amber-700' :
                        justificativa.statusAnalise === 'Recusada' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      } px-3 py-1 text-xs font-bold`}>
                        {justificativa.statusAnalise}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => setJustificativaSelecionada(justificativa)} className="text-blue-600 font-medium hover:text-blue-800">Analisar</button>
                    </td>
                  </tr>
                ))}

                {abaAtiva !== 'Faltas justificadas' && (abaAtiva === 'Evasões' ? alunosEvadidos : alunosFiltrados).map((aluno) => (
                  <tr key={aluno.ra} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-bold text-slate-900">{aluno.ra}</td>
                    <td className="py-4 px-4">{aluno.nome}</td>

                    {abaAtiva === 'Evasões' ? (
                      <>
                        <td className="py-4 px-4 text-slate-900">{aluno.dataEvasao}</td>
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
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        aluno.status === 'Regular' ? 'bg-emerald-100 text-emerald-700' :
                        aluno.status === 'Atenção' ? 'bg-amber-100 text-amber-700' :
                        aluno.status === 'Evadido' ? 'bg-slate-100 text-slate-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {aluno.status}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex justify-end">
                        {abaAtiva === 'Evasões' ? (
                          <button className="text-slate-400 hover:text-blue-600" title="Ver histórico">
                             <DocumentTextIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <button className="text-slate-400 hover:text-blue-600 transition-colors" title="Editar aluno">
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

        </div>
      </main>
    </div>
  );
}