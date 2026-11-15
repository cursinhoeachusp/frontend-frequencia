import { useContext } from 'react';
import { ToastContexto, type ToastApi } from './toast-contexto';

// Uso em qualquer componente:
//   const toast = useToast();
//   toast.sucesso('Presença registrada!');
//   toast.erro(erroDoCatch);
export function useToast(): ToastApi {
  const contexto = useContext(ToastContexto);
  if (!contexto) {
    throw new Error('useToast precisa estar dentro de <ToastProvider> (ver main.tsx).');
  }
  return contexto;
}
