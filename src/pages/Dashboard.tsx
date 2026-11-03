import React, { useState, useEffect } from 'react';

// tipagens e api
import type { Aluno, Justificativa, DashboardEstatisticas } from '../types';
import { buscarAlunos, buscarEstatisticasDashboard } from '../services/api';
import { justificativasMock } from '../mocks/data'; // Temporário até criarmos buscarJustificativas() na API

// componentes
import Header from '../components/Header';
import SummaryCards from '../components/SummaryCards';
import NavigationTabs from '../components/NavigationTabs';
import TabelaAlunos from '../components/TabelaAlunos';
import ModalEdicao from '../components/modals/ModalEdicao';
import ModalJustificativa from '../components/modals/ModalJustificativa';
import ModalEvasao from '../components/modals/ModalEvasao';

export default function Dashboard() {
  // estados gerais
  const [abaAtiva, setAbaAtiva] = useState('Lista geral');
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  
  // estados de dados da API
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [estatisticas, setEstatisticas] = useState<DashboardEstatisticas | null>(null);
  const [justificativas, setJustificativas] = useState<Justificativa[]>(justificativasMock);
  const [carregando, setCarregando] = useState(true);
  
  // estados dos modais
  const [justificativaSelecionada, setJustificativaSelecionada] = useState<Justificativa | null>(null);
  const [alunoEditando, setAlunoEditando] = useState<Aluno | null>(null);
  const [evasaoSelecionada, setEvasaoSelecionada] = useState<Aluno | null>(null);

  useEffect(() => {
    const carregarDadosDashboard = async () => {
      setCarregando(true);
      try {
        // Busca alunos e métricas simultaneamente
        const [dadosAlunos, dadosMetricas] = await Promise.all([
          buscarAlunos(), 
          buscarEstatisticasDashboard()
        ]);
        
        setAlunos(dadosAlunos);
        setEstatisticas(dadosMetricas);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDadosDashboard();
  }, []);

  const salvarEdicaoAluno = (alunoAtualizado: Aluno) => {
    setAlunos(alunos.map(a => a.ra === alunoAtualizado.ra ? alunoAtualizado : a));
    setAlunoEditando(null);
  };

  const analisarJustificativa = (id: string, novoStatus: 'Aprovado' | 'Rejeitado') => {
    setJustificativas(justificativas.map(just => 
      just.id === id ? { ...just, statusAnalise: novoStatus } : just
    ));
    setJustificativaSelecionada(null);
  };

  const reativarMatricula = (ra: string) => {
    setAlunos(alunos.map(a => 
      a.ra === ra ? { ...a, status: 'Regular', faltasConsecutivas: 0 } : a
    ));
    setEvasaoSelecionada(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      
      {/* modais */}
      {alunoEditando && (
        <ModalEdicao 
          aluno={alunoEditando} 
          onClose={() => setAlunoEditando(null)} 
          onSave={salvarEdicaoAluno} 
        />
      )}
      
      {justificativaSelecionada && (
        <ModalJustificativa 
          justificativa={justificativaSelecionada} 
          onClose={() => setJustificativaSelecionada(null)}
          onAnalyze={analisarJustificativa}
        />
      )}

      {evasaoSelecionada && (
        <ModalEvasao 
          aluno={evasaoSelecionada} 
          onClose={() => setEvasaoSelecionada(null)} 
          onReactivate={reativarMatricula}
        />
      )}

      {/* header */}
      <Header />

      <main className="mx-auto max-w-7xl px-8 py-6">
        
        {/* cards superiores e loading */}
        {carregando || !estatisticas ? (
          <div className="py-4 text-slate-500 font-medium">Carregando métricas...</div>
        ) : (
          <SummaryCards dados={estatisticas} /> 
        )}

        {/* area principal */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6">
          
          <NavigationTabs 
            abaAtiva={abaAtiva} 
            setAbaAtiva={setAbaAtiva} 
            totalJustificativas={justificativas.filter(j => j.statusAnalise === 'Pendente').length} 
          />

          <TabelaAlunos 
            abaAtiva={abaAtiva}
            filtroAtivo={filtroAtivo}
            setFiltroAtivo={setFiltroAtivo}
            alunos={alunos}
            justificativas={justificativas}
            onEditAluno={(aluno) => setAlunoEditando(aluno)}
            onAnalyzeJustificativa={(just) => setJustificativaSelecionada(just)}
            onViewEvasao={(aluno) => setEvasaoSelecionada(aluno)}
          />

        </div>
      </main>
    </div>
  );
}