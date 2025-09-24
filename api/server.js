import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pkg from 'pg';
import Joi from 'joi';

// Configuração do ambiente
dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3001;

// Valores permitidos (manter sincronizado com constraint do banco)
const RELACIONAMENTO_PERMITIDOS = [
  'Casado(a)', 'Noivo(a)', 'Namora', 'Solteiro(a)', 'Divorciado(a)', 'Viúvo(a)'
];

function normalizarRelacionamento(valor) {
  if (!valor) return valor;
  const v = valor.trim();
  // Evitar diferenças de acentuação / capitalização simples (poderia expandir se necessário)
  const encontrado = RELACIONAMENTO_PERMITIDOS.find(opt => opt.toLowerCase() === v.toLowerCase());
  return encontrado || v; // retorna original se não encontrou (Joi validará)
}

// Trust proxy para nginx
app.set('trust proxy', 1);

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar para permitir requisições do frontend
}));

// Configuração CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173', 
    'https://famanegociosimobiliarios.com.br',
    'https://www.famanegociosimobiliarios.com.br'
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // Para suporte a browsers legados
};
app.use(cors(corsOptions));

// Rate limiting aprimorado:
// - Chave baseada em IP + WhatsApp (quando disponível) para evitar bloqueio coletivo em NAT/4G  
// - Limite aumentado para reduzir falsos positivos em uso legítimo
// - Janela de tempo reduzida para recuperação mais rápida
const RATE_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '', 10) || 10 * 60 * 1000; // 10 minutos (reduzido)
const RATE_MAX = parseInt(process.env.RATE_LIMIT_MAX || '', 10) || 50; // 50 tentativas (dobrado)

const submitLimiter = rateLimit({
  windowMs: RATE_WINDOW,
  max: RATE_MAX,
  keyGenerator: (req, _res) => {
    // req.ip já considera trust proxy
    const ip = req.ip || '0.0.0.0';
    // Body já foi parseado por express.json antes desta rota
    const whatsapp = (req.body?.whatsapp || '').replace(/\D/g, '').slice(-11); // normaliza últimos 11 dígitos
    const nome = req.body?.nome || '';
    
    // Usar WhatsApp + nome como identificador único se disponível (mais preciso que IP)
    // Caso contrário, usar apenas IP (para primeiras tentativas ou casos sem dados)
    if (whatsapp && nome.length > 2) {
      return `user:${whatsapp}:${nome.toLowerCase().replace(/\s+/g, '')}`;
    }
    return `ip:${ip}`;
  },
  handler: (req, res, _next, options) => {
    const retrySecs = Math.ceil((options.windowMs - (Date.now() - (req.rateLimit?.resetTime?.getTime() || Date.now()))) / 1000);
    const retryMinutes = Math.ceil(retrySecs / 60);
    return res.status(429).json({
      success: false,
      error: 'Limite de tentativas atingido.',
      message: `Você atingiu o limite de ${RATE_MAX} tentativas. Aguarde ${retryMinutes} minutos antes de tentar novamente.`,
      retryAfterSeconds: retrySecs > 0 ? retrySecs : Math.ceil(RATE_WINDOW / 1000),
      retryAfterMinutes: retryMinutes,
      windowMinutes: Math.ceil(RATE_WINDOW / 60000),
      maxAttempts: RATE_MAX,
      tip: 'Se você está enfrentando dificuldades, verifique se todos os campos estão preenchidos corretamente.'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =============================================================
// Mapa de pontuações das perguntas (perfil profissional)
// e cálculo dinâmico da pontuação máxima possível
// =============================================================
const PONTUACOES_MAP = {
  prefere_trabalho: {
    'Individualmente': 2,
    'Em equipe': 4,
    'Depende da situação': 3,
    'Não tenho preferência': 1
  },
  lida_feedback: {
    'Aceito bem e busco melhorar': 4,
    'Fico defensivo, mas tento entender': 3,
    'Ignoro feedbacks': 0,
    'Não gosto de feedbacks': 0
  },
  resolve_conflito: {
    'Ignoraria o problema': 1,
    'Conversaria com as partes envolvidas para entender e resolver': 4,
    'Tentaria resolver sozinho(a)': 1,
    'Não sei responder': 0
  },
  importante_ambiente: {
    'Salário e benefícios': 2,
    'Oportunidades de crescimento': 4,
    'Ambiente de trabalho e cultura da empresa': 3,
    'Não sei responder': 0
  },
  organizacao: {
    'Anoto tudo em papel': 3,
    'Utilizo aplicativos de organização': 3,
    'Tenho boa memória, não preciso de organização': 2,
    'Organização não é meu ponto forte': 0
  },
  pressao: {
    'Não gosto e não me saio bem': 0,
    'Consigo lidar bem com prazos apertados': 4,
    'Não me importo com pressão': 4,
    'Varia conforme a situação': 3
  },
  abordagem_indeciso: {
    'Pressiono-os a tomar uma decisão rápida': 2,
    'Ofereço informações detalhadas e sugestões personalizadas': 4,
    'Deixo que decidam por conta própria sem intervenção': 2,
    'Não tenho experiência nesse tipo de situação': 1
  },
  abordagem_cliente: {
    'Seria direto e objetivo sobre as vantagens do imóvel': 4,
    'Faria perguntas para entender suas necessidades e oferecer opções adequadas': 4,
    'Não tenho experiência nesse tipo de abordagem': 1,
    'Não me sinto confortável fazendo isso': 0
  },
  mostrar_imovel: {
    'Destacar apenas os pontos positivos': 4,
    'Ser honesto sobre todas as características, positivas e negativas': 3,
    'Não tenho experiência em mostrar imóveis': 1,
    'Não sei responder': 0
  },
  gerenciar_tempo: {
    'Priorizaria clientes mais fáceis de lidar': 2,
    'Tentaria atender todos de forma equitativa': 4,
    'Não me sinto confortável gerenciando múltiplos clientes': 1,
    'Não sei responder': 0
  },
  comunicacao: {
    'Assertivo e direto': 3,
    'Empático e paciente': 3,
    'Flexível, adaptando-se às necessidades do cliente': 4,
    'Varia conforme a situação': 1
  },
  motivacao_ambiente: {
    'Com reconhecimento e incentivos financeiros': 3,
    'Com metas pessoais e profissionais claras': 4,
    'Não preciso de motivação externa': 1,
    'Não me sinto motivado(a) em ambientes desafiadores': 0
  }
};

const PONTUACAO_MAXIMA_POSSIVEL = Object.values(PONTUACOES_MAP)
  .reduce((sum, mapa) => sum + Math.max(...Object.values(mapa)), 0);

// Schema de validação dos dados do formulário
const formSchema = Joi.object({
  // ETAPA 1: Dados Pessoais
  nome: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  whatsapp: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required().messages({
    'string.pattern.base': 'WhatsApp deve estar no formato (XX) XXXXX-XXXX',
    'string.empty': 'WhatsApp é obrigatório',
    'any.required': 'WhatsApp é obrigatório'
  }),
  nascimento: Joi.date().max('now').required().messages({
    'date.max': 'Data de nascimento não pode ser no futuro',
    'date.base': 'Data de nascimento inválida',
    'any.required': 'Data de nascimento é obrigatória'
  }),
  instagram: Joi.string().max(100).required().messages({
    'string.empty': 'Instagram é obrigatório',
    'string.max': 'Instagram não pode ter mais de 100 caracteres',
    'any.required': 'Instagram é obrigatório'
  }),

  // ETAPA 2: Informações Pessoais
  // Inclui valores adicionais exibidos no frontend: 'Divorciado(a)', 'Viúvo(a)'
  relacionamento: Joi.string().valid('Casado(a)', 'Noivo(a)', 'Namora', 'Solteiro(a)', 'Divorciado(a)', 'Viúvo(a)').required().messages({
    'any.only': 'Selecione uma opção válida para relacionamento',
    'any.required': 'Estado de relacionamento é obrigatório'
  }),
  temFilho: Joi.string().valid('SIM', 'NÃO').required().messages({
    'any.only': 'Selecione SIM ou NÃO',
    'any.required': 'Campo obrigatório'
  }),
  religiao: Joi.string().valid('SIM', 'NÃO').required().messages({
    'any.only': 'Selecione SIM ou NÃO',
    'any.required': 'Campo obrigatório'
  }),
  qualReligiao: Joi.when('religiao', {
    is: 'SIM',
    then: Joi.string().min(1).max(100).required().messages({
      'string.empty': 'Informe qual religião',
      'any.required': 'Informe qual religião quando responder SIM'
    }),
    otherwise: Joi.string().allow('', null).optional().empty('')
  }),
  cidadeNascimento: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Cidade de nascimento é obrigatória',
    'any.required': 'Cidade de nascimento é obrigatória'
  }),
  cidadeMora: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Cidade onde mora é obrigatória',
    'any.required': 'Cidade onde mora é obrigatória'
  }),
  comQuemMora: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Campo obrigatório',
    'any.required': 'Informe com quem mora'
  }),

  // ETAPA 3: Informações Acadêmicas
  formacaoAcademica: Joi.string().valid('Ensino Fundamental', 'Ensino Médio', 'Ensino Técnico', 'Ensino Superior', 'Pós-graduação', 'Mestrado', 'Doutorado').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Formação acadêmica é obrigatória'
  }),
  // Para "Ensino Médio" (ou abaixo), todos os campos acadêmicos tornam-se opcionais
  statusFormacao: Joi.alternatives().conditional('formacaoAcademica', {
    is: 'Ensino Médio',
    then: Joi.string().allow('', null).optional().empty(''),
    otherwise: Joi.string().valid('Concluido', 'Cursando').required().messages({
      'any.only': 'Selecione se concluiu ou está cursando',
      'any.required': 'Status da formação é obrigatório para formação superior'
    })
  }),
  instituicao: Joi.alternatives().conditional('formacaoAcademica', {
    is: 'Ensino Médio',
    then: Joi.string().allow('', null).optional().empty(''),
    otherwise: Joi.when('statusFormacao', {
      is: Joi.string().valid('Concluido', 'Cursando'),
      then: Joi.string().min(1).max(200).required().messages({
        'string.empty': 'Nome da instituição é obrigatório',
        'any.required': 'Nome da instituição é obrigatório'
      }),
      otherwise: Joi.string().allow('', null).optional().empty('')
    })
  }),
  curso: Joi.alternatives().conditional('formacaoAcademica', {
    is: 'Ensino Médio',
    then: Joi.string().allow('', null).optional().empty(''),
    otherwise: Joi.when('statusFormacao', {
      is: Joi.string().valid('Concluido', 'Cursando'),
      then: Joi.string().min(1).max(200).required().messages({
        'string.empty': 'Nome do curso é obrigatório',
        'any.required': 'Nome do curso é obrigatório'
      }),
      otherwise: Joi.string().allow('', null).optional().empty('')
    })
  }),
  periodoAtual: Joi.alternatives().conditional('formacaoAcademica', {
    is: 'Ensino Médio',
    then: Joi.string().allow('', null).optional().empty(''),
    otherwise: Joi.when('statusFormacao', {
      is: 'Cursando',
      then: Joi.string().min(1).max(50).required().messages({
        'string.empty': 'Período atual é obrigatório para quem está cursando',
        'any.required': 'Período atual é obrigatório',
        'string.max': 'Período atual não pode ter mais de 50 caracteres'
      }),
      otherwise: Joi.string().allow('', null).optional().empty('')
    })
  }),
  modalidade: Joi.alternatives().conditional('formacaoAcademica', {
    is: 'Ensino Médio',
    then: Joi.string().allow('', null).optional().empty(''),
    otherwise: Joi.when('statusFormacao', {
      is: 'Cursando',
      then: Joi.string().valid('Presencial', 'EAD').required().messages({
        'any.only': 'Selecione Presencial ou EAD',
        'any.required': 'Modalidade é obrigatória para quem está cursando'
      }),
      otherwise: Joi.string().allow('', null).optional().empty('')
    })
  }),
  turno: Joi.alternatives().conditional('formacaoAcademica', {
    is: 'Ensino Médio',
    then: Joi.string().allow('', null).optional().empty(''),
    otherwise: Joi.when('modalidade', {
      is: 'Presencial',
      then: Joi.string().valid('Manhã', 'Tarde', 'Integral', 'Noturno').required().messages({
        'any.only': 'Selecione um turno válido',
        'any.required': 'Turno é obrigatório para modalidade presencial'
      }),
      otherwise: Joi.string().allow('', null).optional().empty('')
    })
  }),

  // ETAPA 4: Motivação e Conhecimento
  motivoCorretor: Joi.string().min(10).required().messages({
    'string.min': 'Resposta deve ter pelo menos 10 caracteres',
    'string.empty': 'Campo obrigatório',
    'any.required': 'Este campo é obrigatório'
  }),
  conheceMercado: Joi.string().min(10).required().messages({
    'string.min': 'Resposta deve ter pelo menos 10 caracteres',
    'string.empty': 'Campo obrigatório',
    'any.required': 'Este campo é obrigatório'
  }),

  // ETAPA 5: Perfil Profissional
  prefereTrabalho: Joi.string().valid('Individualmente', 'Em equipe', 'Depende da situação', 'Não tenho preferência').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  lidaFeedback: Joi.string().valid('Aceito bem e busco melhorar', 'Fico defensivo, mas tento entender', 'Ignoro feedbacks', 'Não gosto de feedbacks').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  resolveConflito: Joi.string().valid('Ignoraria o problema', 'Conversaria com as partes envolvidas para entender e resolver', 'Tentaria resolver sozinho(a)', 'Não sei responder').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  importanteAmbiente: Joi.string().valid('Salário e benefícios', 'Oportunidades de crescimento', 'Ambiente de trabalho e cultura da empresa', 'Não sei responder').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  organizacao: Joi.string().valid('Anoto tudo em papel', 'Utilizo aplicativos de organização', 'Tenho boa memória, não preciso de organização', 'Organização não é meu ponto forte').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  pressao: Joi.string().valid('Não gosto e não me saio bem', 'Consigo lidar bem com prazos apertados', 'Não me importo com pressão', 'Varia conforme a situação').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  abordagemIndeciso: Joi.string().valid('Pressiono-os a tomar uma decisão rápida', 'Ofereço informações detalhadas e sugestões personalizadas', 'Deixo que decidam por conta própria sem intervenção', 'Não tenho experiência nesse tipo de situação').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  abordagemCliente: Joi.string().valid('Seria direto e objetivo sobre as vantagens do imóvel', 'Faria perguntas para entender suas necessidades e oferecer opções adequadas', 'Não tenho experiência nesse tipo de abordagem', 'Não me sinto confortável fazendo isso').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  mostrarImovel: Joi.string().valid('Destacar apenas os pontos positivos', 'Ser honesto sobre todas as características, positivas e negativas', 'Não tenho experiência em mostrar imóveis', 'Não sei responder').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  gerenciarTempo: Joi.string().valid('Priorizaria clientes mais fáceis de lidar', 'Tentaria atender todos de forma equitativa', 'Não me sinto confortável gerenciando múltiplos clientes', 'Não sei responder').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  comunicacao: Joi.string().valid('Assertivo e direto', 'Empático e paciente', 'Flexível, adaptando-se às necessidades do cliente', 'Varia conforme a situação').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  motivacaoAmbiente: Joi.string().valid('Com reconhecimento e incentivos financeiros', 'Com metas pessoais e profissionais claras', 'Não preciso de motivação externa', 'Não me sinto motivado(a) em ambientes desafiadores').required().messages({
    'any.only': 'Selecione uma opção válida',
    'any.required': 'Campo obrigatório'
  }),
  decisaoRapida: Joi.string().min(10).required().messages({
    'string.min': 'Resposta deve ter pelo menos 10 caracteres',
    'string.empty': 'Campo obrigatório',
    'any.required': 'Este campo é obrigatório'
  })
});

// Função para capturar IP real do cliente
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         '0.0.0.0';
}

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Rota para servir o dashboard administrativo
app.get('/admin', (req, res) => {
  res.sendFile('admin.html', { root: '.' });
});

// Função para calcular pontuação do perfil profissional
function calcularPontuacaoCompleta(inscricao) {
  let pontuacaoTotal = 0;
  const detalhePontuacao = {};

  // Calcular pontuação para cada campo
  Object.keys(PONTUACOES_MAP).forEach(campo => {
    const resposta = inscricao[campo];
    const pontos = PONTUACOES_MAP[campo][resposta] || 0;
    pontuacaoTotal += pontos;
    detalhePontuacao[campo] = {
      resposta: resposta,
      pontos: pontos,
      maxPontos: Math.max(...Object.values(PONTUACOES_MAP[campo]))
    };
  });

  // Pontuação máxima dinâmica (soma dos máximos por pergunta)
  const pontuacaoMaxima = PONTUACAO_MAXIMA_POSSIVEL;
  const percentual = Number(((pontuacaoTotal / pontuacaoMaxima) * 100).toFixed(1));

  // Classificação baseada no percentual
  let classificacao;
  if (percentual >= 85) classificacao = 'Excelente';
  else if (percentual >= 70) classificacao = 'Bom';
  else if (percentual >= 50) classificacao = 'Regular';
  else classificacao = 'Insuficiente';

  return {
    pontuacao_total: pontuacaoTotal,
    pontuacao_maxima: pontuacaoMaxima,
    percentual: percentual,
    classificacao: classificacao,
    detalhes: detalhePontuacao
  };
}

// Rota para listar inscrições (admin)
app.get('/admin/inscricoes', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT id, nome, whatsapp, nascimento, instagram, relacionamento, tem_filho,
             religiao, qual_religiao, cidade_nascimento, cidade_mora, com_quem_mora,
             formacao_academica, status_formacao, instituicao, curso, periodo_atual, modalidade, turno,
             motivo_corretor, conhece_mercado, prefere_trabalho, lida_feedback,
             resolve_conflito, importante_ambiente, organizacao, pressao,
             abordagem_indeciso, abordagem_cliente, mostrar_imovel, gerenciar_tempo,
             comunicacao, motivacao_ambiente, decisao_rapida, status, 
             created_at, updated_at, ip_address, user_agent, observacoes
      FROM form_inscricoes 
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query);
    res.json(result.rows);
    
  } catch (error) {
    console.error('[ADMIN ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar inscrições'
    });
  } finally {
    client.release();
  }
});

// Rota para listar inscrições (admin) - endpoint alternativo para compatibilidade
app.get('/api/admin/inscricoes', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT id, nome, whatsapp, nascimento, instagram, relacionamento, tem_filho,
             religiao, qual_religiao, cidade_nascimento, cidade_mora, com_quem_mora,
             formacao_academica, status_formacao, instituicao, curso, periodo_atual, modalidade, turno,
             motivo_corretor, conhece_mercado, prefere_trabalho, lida_feedback,
             resolve_conflito, importante_ambiente, organizacao, pressao,
             abordagem_indeciso, abordagem_cliente, mostrar_imovel, gerenciar_tempo,
             comunicacao, motivacao_ambiente, decisao_rapida, status, 
             created_at, updated_at, ip_address, user_agent, observacoes
      FROM form_inscricoes 
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query);
    res.json(result.rows);
    
  } catch (error) {
    console.error('[ADMIN ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar inscrições'
    });
  } finally {
    client.release();
  }
});

// Rota para ranking de candidatos com pontuação
app.get('/api/admin/inscricoes-ranking', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT id, nome, whatsapp, nascimento, instagram, relacionamento, tem_filho,
             religiao, qual_religiao, cidade_nascimento, cidade_mora, com_quem_mora,
             formacao_academica, status_formacao, instituicao, curso, periodo_atual, modalidade, turno,
             motivo_corretor, conhece_mercado, prefere_trabalho, lida_feedback,
             resolve_conflito, importante_ambiente, organizacao, pressao,
             abordagem_indeciso, abordagem_cliente, mostrar_imovel, gerenciar_tempo,
             comunicacao, motivacao_ambiente, decisao_rapida, status, 
             created_at, updated_at, ip_address, user_agent, observacoes
      FROM form_inscricoes 
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query);
    
    // Calcular pontuação para cada candidato
    const candidatosComPontuacao = result.rows.map(inscricao => {
      const pontuacao = calcularPontuacaoCompleta(inscricao);
      return {
        ...inscricao,
        pontuacao_total: pontuacao.pontuacao_total,
        pontuacao_maxima: pontuacao.pontuacao_maxima,
        percentual: pontuacao.percentual,
        classificacao: pontuacao.classificacao,
        detalhes_pontuacao: pontuacao.detalhes
      };
    });
    
    // Ordenar por pontuação (decrescente) e adicionar ranking
    candidatosComPontuacao.sort((a, b) => b.pontuacao_total - a.pontuacao_total);
    
    const candidatosComRanking = candidatosComPontuacao.map((candidato, index) => ({
      ...candidato,
      ranking_posicao: index + 1
    }));
    
    // Calcular estatísticas gerais
    const totalCandidatos = candidatosComRanking.length;
    const pontuacaoMedia = totalCandidatos > 0 ? 
      (candidatosComRanking.reduce((sum, c) => sum + c.pontuacao_total, 0) / totalCandidatos).toFixed(1) : 0;
    
    const distribuicaoClassificacao = {
      'Excelente': candidatosComRanking.filter(c => c.classificacao === 'Excelente').length,
      'Bom': candidatosComRanking.filter(c => c.classificacao === 'Bom').length,
      'Regular': candidatosComRanking.filter(c => c.classificacao === 'Regular').length,
      'Insuficiente': candidatosComRanking.filter(c => c.classificacao === 'Insuficiente').length
    };
    
    res.json({
      candidatos: candidatosComRanking,
      estatisticas: {
        total_candidatos: totalCandidatos,
        pontuacao_media: parseFloat(pontuacaoMedia),
  pontuacao_maxima_possivel: PONTUACAO_MAXIMA_POSSIVEL,
        distribuicao_classificacao: distribuicaoClassificacao,
        top_3: candidatosComRanking.slice(0, 3).map(c => ({
          ranking: c.ranking_posicao,
          nome: c.nome,
          pontuacao: c.pontuacao_total,
          percentual: c.percentual
        }))
      }
    });
    
  } catch (error) {
    console.error('[RANKING ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar ranking de candidatos'
    });
  } finally {
    client.release();
  }
});

// Função para processar inscrição (reutilizada por ambas as rotas)
async function processInscricao(req, res) {
  const client = await pool.connect();
  
  try {
    // Log dos dados recebidos para debug
    const timestamp = new Date().toISOString();
    const clientIP = getClientIP(req);
    
    console.log(`[${timestamp}] === NOVA REQUISIÇÃO ===`);
    console.log(`[${timestamp}] IP: ${clientIP}`);
    console.log(`[${timestamp}] User-Agent: ${req.headers['user-agent'] || 'N/A'}`);
    console.log(`[${timestamp}] Body recebido:`, JSON.stringify(req.body, null, 2));
    
    const emptyFields = Object.entries(req.body).filter(([k,v]) => !v || v === '');
    if (emptyFields.length > 0) {
      console.log(`[${timestamp}] Campos vazios:`, emptyFields.map(([k,v]) => `${k}: ${JSON.stringify(v)}`));
    }
    
    // Validar dados recebidos
    const { error, value } = formSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      console.log(`[${new Date().toISOString()}] ERRO DE VALIDAÇÃO DETALHADO:`);
      error.details.forEach((detail, index) => {
        console.log(`[${new Date().toISOString()}] Erro ${index + 1}:`);
        console.log(`  - Campo: ${detail.path.join('.')}`);
        console.log(`  - Valor recebido: ${JSON.stringify(detail.context?.value)}`);
        console.log(`  - Tipo do valor: ${typeof detail.context?.value}`);
        console.log(`  - Mensagem: ${detail.message}`);
        console.log(`  - Tipo de erro: ${detail.type}`);
      });
      
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos no formulário',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
          type: detail.type
        }))
      });
    }

  const data = value;
  // Normalizações pontuais antes de mapear para DB
  data.relacionamento = normalizarRelacionamento(data.relacionamento);
    const userAgent = req.headers['user-agent'] || '';

    // Mapear campos do frontend para o banco (ajustar nomes)
    const dbData = {
      // ETAPA 1
      nome: data.nome,
      whatsapp: data.whatsapp,
      nascimento: data.nascimento,
      instagram: data.instagram,
      
      // ETAPA 2
      relacionamento: data.relacionamento,
      tem_filho: data.temFilho,
      religiao: data.religiao,
      qual_religiao: data.qualReligiao || null,
      cidade_nascimento: data.cidadeNascimento,
      cidade_mora: data.cidadeMora,
      com_quem_mora: data.comQuemMora,
      
      // ETAPA 3
      formacao_academica: data.formacaoAcademica,
      status_formacao: data.statusFormacao,
      instituicao: data.instituicao,
      curso: data.curso,
      modalidade: data.modalidade || null,
      turno: data.turno || null,
      periodo_atual: data.periodoAtual || null,
      
      // ETAPA 4
      motivo_corretor: data.motivoCorretor,
      conhece_mercado: data.conheceMercado,
      
      // ETAPA 5
      prefere_trabalho: data.prefereTrabalho,
      lida_feedback: data.lidaFeedback,
      resolve_conflito: data.resolveConflito,
      importante_ambiente: data.importanteAmbiente,
      organizacao: data.organizacao,
      pressao: data.pressao,
      abordagem_indeciso: data.abordagemIndeciso,
      abordagem_cliente: data.abordagemCliente,
      mostrar_imovel: data.mostrarImovel,
      gerenciar_tempo: data.gerenciarTempo,
      comunicacao: data.comunicacao,
      motivacao_ambiente: data.motivacaoAmbiente,
      decisao_rapida: data.decisaoRapida,
      
      // Auditoria
      ip_address: getClientIP(req),
      user_agent: userAgent
    };

    // Inserir no banco de dados
    const query = `
      INSERT INTO form_inscricoes (
        nome, whatsapp, nascimento, instagram,
        relacionamento, tem_filho, religiao, qual_religiao, 
        cidade_nascimento, cidade_mora, com_quem_mora,
        formacao_academica, status_formacao, instituicao, curso, modalidade, turno, periodo_atual,
        motivo_corretor, conhece_mercado,
        prefere_trabalho, lida_feedback, resolve_conflito, importante_ambiente,
        organizacao, pressao, abordagem_indeciso, abordagem_cliente,
        mostrar_imovel, gerenciar_tempo, comunicacao, motivacao_ambiente,
        decisao_rapida, ip_address, user_agent
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
        $33, $34, $35
      ) RETURNING id, created_at
    `;

    const values = [
      dbData.nome, dbData.whatsapp, dbData.nascimento, dbData.instagram,
      dbData.relacionamento, dbData.tem_filho, dbData.religiao, dbData.qual_religiao,
      dbData.cidade_nascimento, dbData.cidade_mora, dbData.com_quem_mora,
      dbData.formacao_academica, dbData.status_formacao, dbData.instituicao, dbData.curso, dbData.modalidade, dbData.turno, dbData.periodo_atual,
      dbData.motivo_corretor, dbData.conhece_mercado,
      dbData.prefere_trabalho, dbData.lida_feedback, dbData.resolve_conflito, dbData.importante_ambiente,
      dbData.organizacao, dbData.pressao, dbData.abordagem_indeciso, dbData.abordagem_cliente,
      dbData.mostrar_imovel, dbData.gerenciar_tempo, dbData.comunicacao, dbData.motivacao_ambiente,
      dbData.decisao_rapida, dbData.ip_address, dbData.user_agent
    ];

    const result = await client.query(query, values);
    
    console.log(`[${new Date().toISOString()}] Nova inscrição recebida:`, {
      id: result.rows[0].id,
      nome: dbData.nome,
      whatsapp: dbData.whatsapp,
      ip: getClientIP(req)
    });

    res.status(201).json({
      success: true,
      message: 'Inscrição enviada com sucesso!',
      data: {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at
      }
    });

  } catch (error) {
    // Tratamento específico para violações de constraint (Postgres)
    if (error && error.code === '23514') { // check constraint violation
      if (error.constraint && error.constraint.includes('relacionamento')) {
        return res.status(400).json({
          success: false,
            field: 'relacionamento',
          message: 'Valor de relacionamento inválido. Use uma das opções permitidas.',
          permitidos: RELACIONAMENTO_PERMITIDOS
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Algum valor não atende às regras do sistema (constraint).',
        constraint: error.constraint
      });
    }

    console.error('[DATABASE ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Tente novamente.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
}

// Rota para submeter o formulário (ambas as rotas para compatibilidade)
app.post('/submit-form', submitLimiter, processInscricao);
app.post('/api/inscricoes', submitLimiter, processInscricao);

// Excluir uma inscrição por ID (admin)
app.delete('/api/admin/inscricoes/:id', async (req, res) => {
  const idParam = req.params.id;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'ID inválido' });
  }

  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM form_inscricoes WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Candidato não encontrado' });
    }
    return res.json({ success: true, message: 'Candidato excluído com sucesso', id });
  } catch (error) {
    console.error('[DELETE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Erro ao excluir candidato' });
  } finally {
    client.release();
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 CORS habilitado para: ${process.env.CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Encerrando servidor...');
  pool.end();
  process.exit(0);
});