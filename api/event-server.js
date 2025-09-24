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
const PORT = process.env.EVENT_PORT || 3002;

// Trust proxy para nginx
app.set('trust proxy', 1);

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Configuração CORS
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://famanegociosimobiliarios.com.br',
    'https://www.famanegociosimobiliarios.com.br'
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting específico para eventos
const RATE_WINDOW = 10 * 60 * 1000; // 10 minutos
const RATE_MAX = 30; // 30 tentativas

const submitLimiter = rateLimit({
  windowMs: RATE_WINDOW,
  max: RATE_MAX,
  keyGenerator: (req, _res) => {
    const ip = req.ip || '0.0.0.0';
    const whatsapp = (req.body?.whatsapp || '').replace(/\D/g, '').slice(-11);
    const nome = req.body?.nome || '';
    
    if (whatsapp && nome.length > 2) {
      return `event:${whatsapp}:${nome.toLowerCase().replace(/\s+/g, '')}`;
    }
    return `event:${ip}`;
  },
  handler: (req, res, _next, options) => {
    const retrySecs = Math.ceil((options.windowMs - (Date.now() - (req.rateLimit?.resetTime?.getTime() || Date.now()))) / 1000);
    const retryMinutes = Math.ceil(retrySecs / 60);
    return res.status(429).json({
      success: false,
      error: 'Limite de tentativas atingido.',
      message: `Muitas tentativas de inscrição. Aguarde ${retryMinutes} minutos antes de tentar novamente.`,
      retryAfterSeconds: retrySecs > 0 ? retrySecs : Math.ceil(RATE_WINDOW / 1000),
      retryAfterMinutes: retryMinutes,
      tip: 'Verifique se todos os campos estão preenchidos corretamente.'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Schema de validação para eventos
const eventFormSchema = Joi.object({
  nome: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome muito longo (máximo 255 caracteres)',
    'any.required': 'Nome é obrigatório'
  }),
  whatsapp: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required().messages({
    'string.pattern.base': 'WhatsApp deve estar no formato (XX) XXXXX-XXXX',
    'string.empty': 'WhatsApp é obrigatório',
    'any.required': 'WhatsApp é obrigatório'
  }),
  nascimento: Joi.date().max('now').required().custom((value, helpers) => {
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    
    if (finalAge < 20) {
      return helpers.error('date.min', { limit: 20 });
    }
    if (finalAge > 30) {
      return helpers.error('date.max', { limit: 30 });
    }
    return value;
  }).messages({
    'date.max': 'Data de nascimento não pode ser no futuro',
    'date.base': 'Data de nascimento inválida',
    'date.min': 'Você deve ter pelo menos 20 anos para se inscrever',
    'date.max': 'Esta inscrição é destinada a pessoas de 20 a 30 anos',
    'any.required': 'Data de nascimento é obrigatória'
  }),
  instagram: Joi.string().min(2).max(100).required().custom((value, helpers) => {
    if (!value.startsWith('@')) {
      return helpers.error('string.pattern.base');
    }
    return value;
  }).messages({
    'string.empty': 'Instagram é obrigatório',
    'string.min': 'Instagram muito curto',
    'string.max': 'Instagram muito longo',
    'string.pattern.base': 'Instagram deve começar com @',
    'any.required': 'Instagram é obrigatório'
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

// Função para enviar mensagem via WhatsApp usando Evolution API
async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
    const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
    const WHATSAPP_INSTANCE_NAME = process.env.WHATSAPP_INSTANCE_NAME;

    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !WHATSAPP_INSTANCE_NAME) {
      throw new Error('Configurações da Evolution API não encontradas');
    }

    // Formatar número para padrão brasileiro (remover caracteres especiais)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const formattedPhone = `55${cleanPhone}`;

    console.log(`[${new Date().toISOString()}] Enviando WhatsApp para: ${formattedPhone}`);

    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${WHATSAPP_INSTANCE_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Verificar se é erro de número não existente
      if (response.status === 400 && responseData.response?.message) {
        const messageArray = responseData.response.message;
        const numberNotExists = messageArray.some(msg => msg.exists === false);
        if (numberNotExists) {
          throw new Error(`Número WhatsApp não existe: ${cleanPhone}`);
        }
      }
      throw new Error(`Evolution API Error: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    console.log(`[${new Date().toISOString()}] WhatsApp enviado com sucesso:`, responseData);
    return { success: true, data: responseData };

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erro ao enviar WhatsApp:`, error);
    return { success: false, error: error.message };
  }

}

// Função para gerar mensagem personalizada de confirmação
function generateConfirmationMessage(nome) {
  return `🎉 *Inscrição Confirmada!*

Olá, *${nome}*!

Sua inscrição para o evento da *Fama*: *Quero ser um Corretor de Imóveis* foi realizada com sucesso! ✅

📅 Em breve entraremos em contato com você com todos os detalhes da apresentação

📱 Fique atento aqui no Whatsapp.

Obrigado por participar conosco!

*Equipe Fama Negócios Imobiliários* 
🏡💼`;
}

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'event-inscriptions-api',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Rota para listar inscrições de eventos (admin)
app.get('/api/event-inscricoes', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT id, nome, whatsapp, nascimento, instagram, status, 
             created_at, updated_at, ip_address, user_agent, observacoes
      FROM event_inscricoes 
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query);
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('[EVENT ADMIN ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar inscrições de eventos'
    });
  } finally {
    client.release();
  }
});

// Rota para submeter inscrição de evento
app.post('/api/evento-inscricoes', submitLimiter, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Log dos dados recebidos para debug
    const timestamp = new Date().toISOString();
    const clientIP = getClientIP(req);
    
    console.log(`[${timestamp}] === NOVA INSCRIÇÃO EVENTO ===`);
    console.log(`[${timestamp}] IP: ${clientIP}`);
    console.log(`[${timestamp}] User-Agent: ${req.headers['user-agent'] || 'N/A'}`);
    console.log(`[${timestamp}] Body recebido:`, JSON.stringify(req.body, null, 2));
    
    // Validar dados recebidos
    const { error, value } = eventFormSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      console.log(`[${timestamp}] ERRO DE VALIDAÇÃO:`, error.details);
      
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos no formulário',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      });
    }

    const data = value;
    const userAgent = req.headers['user-agent'] || '';

    // Verificar se já existe inscrição com mesmo WhatsApp
    const existingQuery = 'SELECT id FROM event_inscricoes WHERE whatsapp = $1 AND status = $2';
    const existingResult = await client.query(existingQuery, [data.whatsapp, 'ativo']);
    
    if (existingResult.rows.length > 0) {
      console.log(`[${timestamp}] Tentativa de inscrição duplicada: ${data.whatsapp}`);
      return res.status(400).json({
        success: false,
        message: 'Já existe uma inscrição ativa com este WhatsApp.',
        errors: [{
          field: 'whatsapp',
          message: 'WhatsApp já cadastrado'
        }]
      });
    }

    // Inserir no banco de dados
    const insertQuery = `
      INSERT INTO event_inscricoes (
        nome, whatsapp, nascimento, instagram, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id, created_at
    `;

    const values = [
      data.nome,
      data.whatsapp,
      data.nascimento,
      data.instagram,
      clientIP,
      userAgent
    ];

    const result = await client.query(insertQuery, values);
    
    console.log(`[${timestamp}] Nova inscrição evento criada:`, {
      id: result.rows[0].id,
      nome: data.nome,
      whatsapp: data.whatsapp,
      ip: clientIP
    });

    // Enviar mensagem de confirmação via WhatsApp
    const confirmationMessage = generateConfirmationMessage(data.nome);
    const whatsappResult = await sendWhatsAppMessage(data.whatsapp, confirmationMessage);
    
    if (!whatsappResult.success) {
      console.warn(`[${timestamp}] Falha ao enviar WhatsApp para ${data.whatsapp}:`, whatsappResult.error);
      // Não falha a inscrição se o WhatsApp falhar - apenas loga o erro
    }

    res.status(201).json({
      success: true,
      message: 'Inscrição para o evento enviada com sucesso!',
      data: {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at,
        whatsapp_sent: whatsappResult.success
      }
    });

  } catch (error) {
    console.error('[EVENT DATABASE ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Tente novamente em alguns instantes.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// Excluir uma inscrição de evento por ID (admin)
app.delete('/api/event-inscricoes/:id', async (req, res) => {
  const idParam = req.params.id;
  const id = Number(idParam);
  
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID inválido' 
    });
  }

  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'DELETE FROM event_inscricoes WHERE id = $1 RETURNING id, nome', 
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inscrição não encontrada' 
      });
    }
    
    console.log(`[${new Date().toISOString()}] Inscrição evento excluída:`, {
      id: result.rows[0].id,
      nome: result.rows[0].nome
    });
    
    return res.json({ 
      success: true, 
      message: 'Inscrição excluída com sucesso', 
      id: result.rows[0].id 
    });
    
  } catch (error) {
    console.error('[EVENT DELETE ERROR]', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir inscrição' 
    });
  } finally {
    client.release();
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('[EVENT SERVER ERROR]', err);
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
  console.log(`🎉 Event Inscriptions API rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 CORS habilitado para eventos`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Encerrando servidor de eventos...');
  pool.end();
  process.exit(0);
});

// Teste de conexão com o banco
pool.connect()
  .then(() => console.log('✅ Conectado ao banco de dados'))
  .catch(err => console.error('❌ Erro ao conectar ao banco:', err));