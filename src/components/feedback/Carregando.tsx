interface CarregandoProps {
  texto?: string;
  // "tela" ocupa uma área grande e centraliza; "inline" cabe dentro de um botão ou linha.
  variante?: 'tela' | 'inline';
}

// Indicador de "carregando". Uso: {carregando && <Carregando texto="Buscando alunos..." />}
export default function Carregando({ texto = 'Carregando...', variante = 'tela' }: CarregandoProps) {
  const roda = (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 ${
        variante === 'tela' ? 'h-8 w-8' : 'h-4 w-4'
      }`}
    />
  );

  if (variante === 'inline') {
    return (
      <span role="status" className="inline-flex items-center gap-2 text-sm text-slate-500">
        {roda}
        {texto}
      </span>
    );
  }

  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500">
      {roda}
      <p className="text-sm font-medium">{texto}</p>
    </div>
  );
}
