import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { mensagemDeErro } from '../../services/erros';
import { ToastContexto, type Toast, type ToastApi, type TipoToast } from './toast-contexto';

const DURACAO_MS = 4000;

const ESTILOS: Record<TipoToast, { caixa: string; Icone: typeof CheckCircleIcon }> = {
  sucesso: { caixa: 'border-green-200 bg-green-50 text-green-800', Icone: CheckCircleIcon },
  erro: { caixa: 'border-red-200 bg-red-50 text-red-800', Icone: ExclamationCircleIcon },
  aviso: { caixa: 'border-yellow-200 bg-yellow-50 text-yellow-800', Icone: ExclamationTriangleIcon },
  info: { caixa: 'border-blue-200 bg-blue-50 text-blue-800', Icone: InformationCircleIcon },
};

// Avisos rápidos que aparecem no canto da tela e somem sozinhos.
// Fica em volta do app inteiro (main.tsx); os componentes usam o hook useToast().
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const proximoId = useRef(1);

  const fechar = useCallback((id: number) => {
    setToasts((atuais) => atuais.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (tipo: TipoToast, mensagem: string) => {
      const id = proximoId.current++;
      setToasts((atuais) => [...atuais, { id, tipo, mensagem }]);
      setTimeout(() => fechar(id), DURACAO_MS);
    },
    [fechar],
  );

  const api = useMemo<ToastApi>(
    () => ({
      mostrar,
      sucesso: (mensagem) => mostrar('sucesso', mensagem),
      erro: (erro) => mostrar('erro', mensagemDeErro(erro)),
      aviso: (mensagem) => mostrar('aviso', mensagem),
      info: (mensagem) => mostrar('info', mensagem),
    }),
    [mostrar],
  );

  return (
    <ToastContexto.Provider value={api}>
      {children}
      {/* aria-live faz o leitor de tela anunciar o aviso quando ele aparece */}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map(({ id, tipo, mensagem }) => {
          const { caixa, Icone } = ESTILOS[tipo];
          return (
            <div key={id} role={tipo === 'erro' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-lg border p-3 shadow-md ${caixa}`}>
              <Icone aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm">{mensagem}</p>
              <button type="button" onClick={() => fechar(id)} aria-label="Fechar aviso" className="opacity-60 hover:opacity-100">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContexto.Provider>
  );
}
