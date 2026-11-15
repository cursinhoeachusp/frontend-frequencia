import { createContext } from 'react';

export type TipoToast = 'sucesso' | 'erro' | 'aviso' | 'info';

export interface Toast {
  id: number;
  tipo: TipoToast;
  mensagem: string;
}

export interface ToastApi {
  mostrar: (tipo: TipoToast, mensagem: string) => void;
  sucesso: (mensagem: string) => void;
  // Aceita o erro do catch (ApiError) ou um texto.
  erro: (erro: unknown) => void;
  aviso: (mensagem: string) => void;
  info: (mensagem: string) => void;
}

// Fica em arquivo separado do componente por causa da regra de "fast refresh"
// do Vite: arquivos .tsx de componente devem exportar só componentes.
export const ToastContexto = createContext<ToastApi | null>(null);
