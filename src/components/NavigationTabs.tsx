import React from 'react';

interface NavigationTabsProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
  totalJustificativas: number;
}

export default function NavigationTabs({ abaAtiva, setAbaAtiva, totalJustificativas }: NavigationTabsProps) {
  const abas = ['Lista geral', 'Faltas na semana', 'Faltas justificadas', 'Evasões'];

  return (
    <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
      <nav className="flex gap-6">
        {abas.map((aba) => (
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
            {aba === 'Faltas justificadas' && totalJustificativas > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {totalJustificativas}
              </span>
            )}
          </button>
        ))}
      </nav>
      <button className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
        Registro manual
      </button>
    </div>
  );
}