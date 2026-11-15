import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { mensagemDeErro } from '../../services/erros';

interface MensagemErroProps {
  // Pode passar direto o erro do catch (ApiError) ou um texto pronto.
  erro: unknown;
  titulo?: string;
  // Se informado, mostra o botão "Tentar de novo".
  onTentarNovamente?: () => void;
}

// Caixa de erro para quando uma parte da tela não carregou.
// Uso: {erro && <MensagemErro erro={erro} onTentarNovamente={carregar} />}
export default function MensagemErro({
  erro,
  titulo = 'Não foi possível carregar',
  onTentarNovamente,
}: MensagemErroProps) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <ExclamationCircleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">{titulo}</p>
        <p className="text-sm">{mensagemDeErro(erro)}</p>
      </div>
      {onTentarNovamente && (
        <button
          type="button"
          onClick={onTentarNovamente}
          className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-red-100"
        >
          Tentar de novo
        </button>
      )}
    </div>
  );
}
