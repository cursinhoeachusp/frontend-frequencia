/// <reference types="vite/client" />

// Variáveis de ambiente que o front lê (arquivo .env ou .env.local).
// Só variáveis que começam com VITE_ chegam ao navegador.
interface ImportMetaEnv {
  // Endereço do Corujão. Padrão: "/api" (proxy do Vite em desenvolvimento).
  readonly VITE_API_URL?: string;
  // "true" = usa os dados de mentira de src/mocks; "false" = chama o backend.
  // Ausente: mock só em desenvolvimento (npm run dev); em produção, backend.
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
