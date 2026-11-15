import type { CodigoErro } from '../types';

// Tabela "código de erro -> mensagem para quem usa o sistema".
//
// O tipo Record<CodigoErro, string> obriga a ter uma mensagem para CADA código:
// se alguém acrescentar um código em types/index.ts e esquecer daqui,
// o TypeScript acusa erro no build.
export const MENSAGENS_DE_ERRO: Record<CodigoErro, string> = {
  // --- vindos do backend -------------------------------------------------
  ERRO_INTERNO_SERVIDOR: 'Algo deu errado no servidor. Tente de novo em instantes.',
  JSON_INVALIDO: 'Os dados enviados estão em um formato inválido.',
  PARAMETROS_INVALIDOS: 'Algum filtro da busca é inválido.',
  DADOS_OBRIGATORIOS_AUSENTES: 'Preencha todos os campos obrigatórios.',

  ALUNO_NAO_ENCONTRADO: 'Não encontramos nenhum aluno com esse RA ou nome.',
  TURNO_INVALIDO: 'Turno inválido. Escolha Vespertino ou Noturno.',
  DATA_INVALIDA: 'Data inválida. Confira o dia, o mês e o ano.',
  DADOS_ATUALIZACAO_INVALIDOS: 'Os dados da alteração são inválidos. Confira e tente de novo.',
  MATRICULA_REPETIDA: 'Já existe uma matrícula com esse RA ou com essa data de início.',
  MATRICULA_ATIVA_EXISTENTE: 'Este aluno já está matriculado e ativo.',
  MATRICULA_NAO_EVADIDA: 'Só é possível reativar alunos que estão evadidos.',
  EMAIL_JA_CADASTRADO: 'Já existe um cadastro com esse e-mail.',
  IDENTIDADE_JA_CADASTRADA: 'Já existe um cadastro com esse RG.',

  DIA_NAO_LETIVO: 'Não há aula nesse dia no turno do aluno.',
  NOME_AMBIGUO: 'Há mais de um aluno com esse nome. Use o RA.',
  PRESENCA_JA_REGISTRADA: 'A presença deste aluno já foi registrada hoje.',

  DIA_LETIVO_NAO_ENCONTRADO: 'Não encontramos esse dia letivo.',
  STATUS_DIA_INVALIDO: 'Status do dia inválido. Use Normal, Feriado, Cancelado ou Nivelamento.',

  STATUS_ANALISE_INVALIDO: 'A análise precisa ser "Aprovado" ou "Rejeitado".',
  JUSTIFICATIVA_NAO_ENCONTRADA: 'Não encontramos essa justificativa.',
  JUSTIFICATIVA_JA_EXISTENTE: 'Já existe uma justificativa enviada para essa data.',

  // --- criados pelo front ------------------------------------------------
  SEM_CONEXAO: 'Não foi possível falar com o servidor. Verifique a internet e tente de novo.',
  TEMPO_ESGOTADO: 'O servidor demorou demais para responder. Tente de novo.',
  RESPOSTA_INVALIDA: 'O servidor respondeu de um jeito inesperado.',
  REQUISICAO_INVALIDA: 'O pedido enviado ao servidor é inválido.',
  NAO_AUTENTICADO: 'Sua sessão expirou. Entre de novo.',
  ACESSO_NEGADO: 'Você não tem permissão para fazer isso.',
  ROTA_NAO_ENCONTRADA: 'Este recurso não existe no servidor.',
  ERRO_DESCONHECIDO: 'Ocorreu um erro inesperado.',
};

export function ehCodigoConhecido(codigo: string): codigo is CodigoErro {
  return Object.hasOwn(MENSAGENS_DE_ERRO, codigo);
}

// Erro padrão de todas as chamadas à API.
// As telas podem olhar `erro.codigo` para decidir o que fazer
// (ex.: se for NOME_AMBIGUO, pedir o RA) e usar `erro.message` para mostrar.
export class ApiError extends Error {
  readonly codigo: CodigoErro;
  // Código exatamente como veio do servidor (útil se for um código novo).
  readonly codigoOriginal: string;
  // Status HTTP (404, 409, 500...). 0 quando nem chegou resposta.
  readonly status: number;
  // Corpo da resposta, para depuração.
  readonly corpo: unknown;

  constructor(codigo: string, status: number, corpo?: unknown) {
    const conhecido = ehCodigoConhecido(codigo) ? codigo : 'ERRO_DESCONHECIDO';
    super(MENSAGENS_DE_ERRO[conhecido]);
    this.name = 'ApiError';
    this.codigo = conhecido;
    this.codigoOriginal = codigo;
    this.status = status;
    this.corpo = corpo;
  }
}

// Transforma qualquer coisa que caiu num catch em um texto para a tela.
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) return erro.message;
  if (typeof erro === 'string' && erro.trim() !== '') return erro;
  return MENSAGENS_DE_ERRO.ERRO_DESCONHECIDO;
}
