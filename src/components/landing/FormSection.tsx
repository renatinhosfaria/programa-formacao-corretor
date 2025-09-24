import { useState, useCallback } from 'react';
import Section from './Section';

interface FormData {
  nome: string;
  whatsapp: string;
  nascimento: string;
  instagram: string;
  relacionamento: string;
  temFilho: string;
  religiao: string;
  qualReligiao: string;
  cidadeNascimento: string;
  cidadeMora: string;
  comQuemMora: string;
  formacaoAcademica: string;
  statusFormacao: string;
  instituicao: string;
  curso: string;
  periodoAtual: string;
  modalidade: string;
  turno: string;
  motivoCorretor: string;
  conheceMercado: string;
  prefereTrabalho: string;
  lidaFeedback: string;
  resolveConflito: string;
  importanteAmbiente: string;
  organizacao: string;
  pressao: string;
  abordagemIndeciso: string;
  abordagemCliente: string;
  mostrarImovel: string;
  gerenciarTempo: string;
  comunicacao: string;
  motivacaoAmbiente: string;
  decisaoRapida: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function FormSection() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    whatsapp: '',
    nascimento: '',
    instagram: '',
    relacionamento: '',
    temFilho: '',
    religiao: '',
    qualReligiao: '',
    cidadeNascimento: '',
    cidadeMora: '',
    comQuemMora: '',
    formacaoAcademica: '',
    statusFormacao: '',
    instituicao: '',
    curso: '',
    periodoAtual: '',
    modalidade: '',
    turno: '',
    motivoCorretor: '',
    conheceMercado: '',
    prefereTrabalho: '',
    lidaFeedback: '',
    resolveConflito: '',
    importanteAmbiente: '',
    organizacao: '',
    pressao: '',
    abordagemIndeciso: '',
    abordagemCliente: '',
    mostrarImovel: '',
    gerenciarTempo: '',
    comunicacao: '',
    motivacaoAmbiente: '',
    decisaoRapida: '',
  });

  // Função para aplicar máscara ao WhatsApp
  function maskWhatsapp(value: string): string {
    // Remove tudo que não é número
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
  }

  // Funções de validação específicas
  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'nome':
        if (!value.trim()) return 'Nome é obrigatório';
        if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
        if (value.trim().length > 100) return 'Nome muito longo (máximo 100 caracteres)';
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) return 'Nome deve conter apenas letras e espaços';
        return '';

      case 'whatsapp':
        if (!value.trim()) return 'WhatsApp é obrigatório';
        const whatsappRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!whatsappRegex.test(value.trim())) return 'Formato: (XX) XXXXX-XXXX';
        return '';

      case 'nascimento':
        if (!value) return 'Data de nascimento é obrigatória';
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
        
        if (birthDate > today) return 'Data não pode ser no futuro';
        if (finalAge < 16) return 'Deve ter pelo menos 16 anos';
        if (finalAge > 100) return 'Idade muito alta';
        return '';

      case 'instagram':
        if (!value.trim()) return 'Instagram é obrigatório';
        if (!value.trim().startsWith('@')) return 'Deve começar com @';
        if (value.trim().length < 2) return 'Instagram muito curto';
        if (value.trim().length > 50) return 'Instagram muito longo';
        return '';

      case 'relacionamento':
      case 'temFilho':
      case 'religiao':
      case 'formacaoAcademica':
      case 'statusFormacao':
      case 'modalidade':
      case 'turno':
      case 'prefereTrabalho':
      case 'lidaFeedback':
      case 'resolveConflito':
      case 'importanteAmbiente':
      case 'organizacao':
      case 'pressao':
      case 'abordagemIndeciso':
      case 'abordagemCliente':
      case 'mostrarImovel':
      case 'gerenciarTempo':
      case 'comunicacao':
      case 'motivacaoAmbiente':
        if (!value) return 'Seleção é obrigatória';
        return '';

      case 'qualReligiao':
        if (formData.religiao === 'SIM' && !value.trim()) return 'Campo obrigatório quando tem religião';
        if (formData.religiao === 'SIM' && value.trim().length < 2) return 'Mínimo 2 caracteres';
        if (value.trim().length > 50) return 'Máximo 50 caracteres';
        return '';

      case 'cidadeNascimento':
      case 'cidadeMora':
        if (!value.trim()) return 'Campo obrigatório';
        if (value.trim().length < 2) return 'Mínimo 2 caracteres';
        if (value.trim().length > 100) return 'Máximo 100 caracteres';
        return '';

      case 'comQuemMora':
        if (!value.trim()) return 'Campo obrigatório';
        if (value.trim().length < 2) return 'Mínimo 2 caracteres';
        if (value.trim().length > 200) return 'Máximo 200 caracteres';
        return '';

      case 'instituicao':
      case 'curso':
        if ((formData.statusFormacao === 'Concluido' || formData.statusFormacao === 'Cursando') && !value.trim()) return 'Campo obrigatório';
        if ((formData.statusFormacao === 'Concluido' || formData.statusFormacao === 'Cursando') && value.trim().length < 2) return 'Mínimo 2 caracteres';
        if (value.trim().length > 100) return 'Máximo 100 caracteres';
        return '';

      case 'periodoAtual':
        if (formData.statusFormacao === 'Cursando' && !value.trim()) return 'Campo obrigatório para quem está cursando';
        if (formData.statusFormacao === 'Cursando' && value.trim().length < 2) return 'Mínimo 2 caracteres';
        if (value.trim().length > 50) return 'Máximo 50 caracteres';
        return '';

      case 'motivoCorretor':
      case 'conheceMercado':
      case 'decisaoRapida':
        if (!value.trim()) return 'Campo obrigatório';
        if (value.trim().length < 10) return 'Mínimo 10 caracteres';
        if (value.trim().length > 1000) return 'Máximo 1000 caracteres';
        return '';

      default:
        return '';
    }
  }, [formData.religiao, formData.statusFormacao, formData.modalidade]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Aplica máscara ao campo WhatsApp
    let maskedValue = value;
    if (name === 'whatsapp') {
      maskedValue = maskWhatsapp(value);
    }

    // Atualizar dados do formulário
    setFormData(prev => ({
      ...prev,
      [name]: maskedValue
    }));

    // Marcar campo como touched (otimizado para evitar re-renders)
    setTouchedFields(prev => {
      if (prev.has(name)) return prev;
      const newSet = new Set(prev);
      newSet.add(name);
      return newSet;
    });

    // Validar campo
    setTimeout(() => {
      const error = validateField(name, maskedValue);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }, 0);

    // Limpar erros de submissão quando usuário começa a corrigir
    if (submitError) {
      setSubmitError('');
    }
  }, [validateField, submitError]);

  const handleBlur = useCallback((fieldName: string) => {
    setTouchedFields(prev => {
      if (prev.has(fieldName)) return prev;
      const newSet = new Set(prev);
      newSet.add(fieldName);
      return newSet;
    });
    
    // Usar setTimeout para evitar loops
    setTimeout(() => {
      const fieldValue = formData[fieldName as keyof FormData];
      const error = validateField(fieldName, fieldValue);
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }, 0);
  }, [formData, validateField]);

  // Validação por etapa
  const validateStep = (step: number): boolean => {
    const fieldsToValidate: { [key: number]: string[] } = {
      1: ['nome', 'whatsapp', 'nascimento', 'instagram'],
      2: ['relacionamento', 'temFilho', 'religiao', 'cidadeNascimento', 'cidadeMora', 'comQuemMora'],
      3: ['formacaoAcademica'],
      4: ['motivoCorretor', 'conheceMercado'],
      5: ['prefereTrabalho', 'lidaFeedback', 'resolveConflito', 'importanteAmbiente', 'organizacao', 'pressao', 'abordagemIndeciso', 'abordagemCliente', 'mostrarImovel', 'gerenciarTempo', 'comunicacao', 'motivacaoAmbiente', 'decisaoRapida']
    };

    const fields = fieldsToValidate[step] || [];
    let hasErrors = false;
    const newErrors: FormErrors = { ...formErrors };
    const newTouchedFields = new Set(touchedFields);

    // Adicionar campos condicionais
    if (step === 2 && formData.religiao === 'SIM') {
      fields.push('qualReligiao');
    }
    if (step === 3) {
      // Adicionar statusFormacao apenas se a formação exige detalhes
      if (['Ensino Técnico', 'Ensino Superior', 'Pós-graduação', 'Mestrado', 'Doutorado'].includes(formData.formacaoAcademica)) {
        fields.push('statusFormacao');
        
        // Se tem statusFormacao válido, adicionar campos relacionados
        if (formData.statusFormacao === 'Concluido' || formData.statusFormacao === 'Cursando') {
          fields.push('instituicao', 'curso');
          
          // Campos específicos para quem está cursando
          if (formData.statusFormacao === 'Cursando') {
            fields.push('periodoAtual', 'modalidade');
            
            // Turno obrigatório apenas para presencial
            if (formData.modalidade === 'Presencial') {
              fields.push('turno');
            }
          }
        }
      }
    }

    fields.forEach(field => {
      newTouchedFields.add(field);
      const error = validateField(field, formData[field as keyof FormData]);
      newErrors[field] = error;
      if (error) hasErrors = true;
    });

    setTouchedFields(newTouchedFields);
    setFormErrors(newErrors);
    return !hasErrors;
  };

  // Componente para exibir erros
  const ErrorMessage = ({ fieldName }: { fieldName: string }) => {
    const error = formErrors[fieldName];
    const isFieldTouched = touchedFields.has(fieldName);
    
    if (!error || !isFieldTouched) return null;
    
    return (
      <div className="mt-1 flex items-center text-red-600 text-sm">
        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>{error}</span>
      </div>
    );
  };

  // Helper para classes de erro dos inputs
  const getInputClasses = useCallback((fieldName: string) => {
    const hasError = formErrors[fieldName] && touchedFields.has(fieldName);
    return `w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
      hasError
        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100 shadow-sm' 
        : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white hover:border-gray-300 shadow-sm'
    } focus:outline-none`;
  }, [formErrors, touchedFields]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Debug: Rastrear progresso no formulário
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'form_step_completed',
          form_name: 'inscricao_corretor',
          step_from: currentStep,
          step_to: newStep,
          progress_percent: Math.round((newStep / 5) * 100),
          timestamp: new Date().toISOString()
        });
        console.log(`📈 GTM: Step ${currentStep} -> ${newStep} (${Math.round((newStep / 5) * 100)}%)`);
      }
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(5)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    
    // Debug: Enviar evento GTM para rastrear tentativa de submissão
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'form_submit_attempt',
        form_name: 'inscricao_corretor',
        step: 5,
        user_data: {
          nome: formData.nome,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram
        },
        timestamp: new Date().toISOString()
      });
      console.log('📝 GTM: Tentativa de submissão do formulário registrada');
    }
    
    try {
      const response = await fetch('/api/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        
        // Debug: Evento de sucesso
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'form_submit_success',
            form_name: 'inscricao_corretor',
            user_data: {
              nome: formData.nome,
              whatsapp: formData.whatsapp
            },
            timestamp: new Date().toISOString()
          });
          console.log('✅ GTM: Submissão do formulário bem-sucedida');
        }
      } else {
        // Tratar erros específicos da API
        if (response.status === 400 && data.errors) {
          // Mapear erros específicos para os campos
          const newErrors: { [key: string]: string } = {};
          data.errors.forEach((error: any) => {
            newErrors[error.field] = error.message;
            setTouchedFields(prev => {
              const newSet = new Set(prev);
              newSet.add(error.field);
              return newSet;
            });
          });
          setFormErrors(prev => ({ ...prev, ...newErrors }));
          
          // Mostrar mensagem geral de erro
          setSubmitError(`Verifique os campos destacados em vermelho. ${data.message || 'Dados inválidos no formulário.'}`);
          
          // Voltar para a primeira etapa que contém erro
          const errorFields = data.errors.map((e: any) => e.field);
          if (errorFields.some((field: string) => ['nome', 'whatsapp', 'nascimento', 'instagram'].includes(field))) {
            setCurrentStep(1);
          } else if (errorFields.some((field: string) => ['relacionamento', 'temFilho', 'religiao', 'qualReligiao', 'cidadeNascimento', 'cidadeMora', 'comQuemMora'].includes(field))) {
            setCurrentStep(2);
          } else if (errorFields.some((field: string) => ['formacaoAcademica', 'statusFormacao', 'instituicao', 'curso', 'periodoAtual', 'modalidade', 'turno'].includes(field))) {
            setCurrentStep(3);
          } else if (errorFields.some((field: string) => ['motivoCorretor', 'conheceMercado'].includes(field))) {
            setCurrentStep(4);
          } else {
            setCurrentStep(5);
          }
        } else if (response.status === 429) {
          const retryMinutes = data.retryAfterMinutes || Math.ceil((data.retryAfterSeconds || 600) / 60);
          setSubmitError(`${data.message || 'Muitas tentativas de envio.'} Aguarde ${retryMinutes} minutos.${data.tip ? ' Dica: ' + data.tip : ''}`);
        } else {
          setSubmitError(data.message || 'Erro ao enviar formulário. Verifique sua conexão e tente novamente.');
        }
        
        // Debug: Evento de erro
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'form_submit_error',
            form_name: 'inscricao_corretor',
            error_type: response.status === 429 ? 'rate_limit' : 'validation_error',
            error_status: response.status,
            error_message: data.message || 'Erro desconhecido',
            timestamp: new Date().toISOString()
          });
          console.log('❌ GTM: Erro na submissão do formulário:', response.status);
        }
      }
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
      
      // Determinar tipo de erro para mensagem mais específica
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setSubmitError('Erro de conexão. Verifique sua internet e tente novamente. Se o problema persistir, tente recarregar a página.');
      } else if (error instanceof Error && error.name === 'AbortError') {
        setSubmitError('Operação cancelada. Tente novamente.');
      } else {
        setSubmitError('Erro inesperado. Verifique se todos os campos estão preenchidos corretamente e tente novamente.');
      }
      
      // Debug: Evento de erro de conexão
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'form_submit_error',
          form_name: 'inscricao_corretor',
          error_type: 'network_error',
          error_message: error instanceof Error ? error.message : 'Erro de conexão',
          timestamp: new Date().toISOString()
        });
        console.log('💥 GTM: Erro de rede na submissão do formulário');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Section id="inscricao">
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-green-600 mb-4">✅ Inscrição Realizada!</h2>
          <p className="text-gray-600">Obrigado por se inscrever. Entraremos em contato em breve!</p>
        </div>
      </Section>
    );
  }

  return (
    <Section id="inscricao">
      <div className="max-w-4xl mx-auto">
        {/* Header com título e progresso */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quero ser um Corretor</h2>
          
          {/* Barra de progresso moderna */}
          <div className="relative mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Etapa {currentStep} de 5</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 5) * 100)}% completo</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      step < currentStep 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : step === currentStep 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ring-4 ring-blue-200' 
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${step <= currentStep ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                    {step === 1 ? 'Dados' : step === 2 ? 'Pessoal' : step === 3 ? 'Estudo' : step === 4 ? 'Motivação' : 'Perfil'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card do formulário */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h3 className="text-xl font-semibold text-white">
              {currentStep === 1 ? '📋 Dados Pessoais' : 
               currentStep === 2 ? '👤 Informações Pessoais' :
               currentStep === 3 ? '🎓 Informações Acadêmicas' :
               currentStep === 4 ? '💭 Motivação e Conhecimento' :
               '🎯 Perfil Profissional'}
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              {currentStep === 1 ? 'Vamos começar com suas informações básicas' : 
               currentStep === 2 ? 'Conte-nos um pouco sobre você' :
               currentStep === 3 ? 'Sua experiência acadêmica' :
               currentStep === 4 ? 'Suas motivações e conhecimentos' :
               'Vamos conhecer seu perfil profissional'}
            </p>
          </div>
          
          <div className="p-8">

        {currentStep === 1 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('nome')}
                  required
                  className={getInputClasses('nome')}
                  placeholder="Digite seu nome completo"
                />
                <ErrorMessage fieldName="nome" />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('whatsapp')}
                  required
                  className={getInputClasses('whatsapp')}
                  placeholder="(34) 99999-9999"
                />
                <ErrorMessage fieldName="whatsapp" />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-8 0v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2H8a2 2 0 00-2 2z" />
                  </svg>
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  name="nascimento"
                  value={formData.nascimento}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('nascimento')}
                  required
                  className={getInputClasses('nascimento')}
                />
                <ErrorMessage fieldName="nascimento" />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 mr-2 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram *
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('instagram')}
                  required
                  className={getInputClasses('instagram')}
                  placeholder="@seuusuario"
                />
                <ErrorMessage fieldName="instagram" />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Próxima Etapa
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Informações Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status de Relacionamento *</label>
                <select
                  name="relacionamento"
                  value={formData.relacionamento}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('relacionamento')}
                  required
                  className={getInputClasses('relacionamento')}
                >
                  <option value="">Selecione</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Noivo(a)">Noivo(a)</option>
                  <option value="Namora">Namora</option>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
                <ErrorMessage fieldName="relacionamento" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tem filho? *</label>
                <select
                  name="temFilho"
                  value={formData.temFilho}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('temFilho')}
                  required
                  className={getInputClasses('temFilho')}
                >
                  <option value="">Selecione</option>
                  <option value="SIM">SIM</option>
                  <option value="NÃO">NÃO</option>
                </select>
                <ErrorMessage fieldName="temFilho" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segue alguma religião? *</label>
                <select
                  name="religiao"
                  value={formData.religiao}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('religiao')}
                  required
                  className={getInputClasses('religiao')}
                >
                  <option value="">Selecione</option>
                  <option value="SIM">SIM</option>
                  <option value="NÃO">NÃO</option>
                </select>
                <ErrorMessage fieldName="religiao" />
              </div>

              {formData.religiao === 'SIM' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qual religião? *</label>
                  <input
                    type="text"
                    name="qualReligiao"
                    value={formData.qualReligiao}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('qualReligiao')}
                    required={formData.religiao === 'SIM'}
                    className={getInputClasses('qualReligiao')}
                    placeholder="Qual religião?"
                  />
                  <ErrorMessage fieldName="qualReligiao" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade onde nasceu *</label>
                <input
                  type="text"
                  name="cidadeNascimento"
                  value={formData.cidadeNascimento}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('cidadeNascimento')}
                  required
                  className={getInputClasses('cidadeNascimento')}
                  placeholder="Nome da cidade"
                />
                <ErrorMessage fieldName="cidadeNascimento" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade onde mora *</label>
                <input
                  type="text"
                  name="cidadeMora"
                  value={formData.cidadeMora}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('cidadeMora')}
                  required
                  className={getInputClasses('cidadeMora')}
                  placeholder="Nome da cidade"
                />
                <ErrorMessage fieldName="cidadeMora" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Com quem mora? *</label>
                <input
                  type="text"
                  name="comQuemMora"
                  value={formData.comQuemMora}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('comQuemMora')}
                  required
                  className={getInputClasses('comQuemMora')}
                  placeholder="Ex: Com os pais, sozinho(a), com cônjuge..."
                />
                <ErrorMessage fieldName="comQuemMora" />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handleBackStep}
                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
              <button
                type="submit"
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Próxima Etapa
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Informações Acadêmicas</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qual sua formação acadêmica? *</label>
                <select
                  name="formacaoAcademica"
                  value={formData.formacaoAcademica}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('formacaoAcademica')}
                  required
                  className={getInputClasses('formacaoAcademica')}
                >
                  <option value="">Selecione</option>
                  <option value="Ensino Fundamental">Ensino Fundamental</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                  <option value="Ensino Técnico">Ensino Técnico</option>
                  <option value="Ensino Superior">Ensino Superior</option>
                  <option value="Pós-graduação">Pós-graduação</option>
                  <option value="Mestrado">Mestrado</option>
                  <option value="Doutorado">Doutorado</option>
                </select>
                <ErrorMessage fieldName="formacaoAcademica" />
              </div>

              {(formData.formacaoAcademica === 'Ensino Técnico' || formData.formacaoAcademica === 'Ensino Superior' || formData.formacaoAcademica === 'Pós-graduação' || formData.formacaoAcademica === 'Mestrado' || formData.formacaoAcademica === 'Doutorado') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qual status da sua formação? *</label>
                    <select
                      name="statusFormacao"
                      value={formData.statusFormacao}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('statusFormacao')}
                      required
                      className={getInputClasses('statusFormacao')}
                    >
                      <option value="">Selecione</option>
                      <option value="Concluido">Concluído</option>
                      <option value="Cursando">Cursando</option>
                    </select>
                    <ErrorMessage fieldName="statusFormacao" />
                  </div>

                  {(formData.statusFormacao === 'Concluido' || formData.statusFormacao === 'Cursando') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Qual instituição? *</label>
                        <input
                          type="text"
                          name="instituicao"
                          value={formData.instituicao}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('instituicao')}
                          required
                          className={getInputClasses('instituicao')}
                          placeholder="Nome completo da instituição"
                        />
                        <ErrorMessage fieldName="instituicao" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Qual curso? *</label>
                        <input
                          type="text"
                          name="curso"
                          value={formData.curso}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('curso')}
                          required
                          className={getInputClasses('curso')}
                          placeholder="Nome do curso"
                        />
                        <ErrorMessage fieldName="curso" />
                      </div>

                      {formData.statusFormacao === 'Cursando' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Qual período? *</label>
                            <select
                              name="periodoAtual"
                              value={formData.periodoAtual}
                              onChange={handleInputChange}
                              onBlur={() => handleBlur('periodoAtual')}
                              required
                              className={getInputClasses('periodoAtual')}
                            >
                              <option value="">Selecione</option>
                              <option value="1º Período">1º Período</option>
                              <option value="2º Período">2º Período</option>
                              <option value="3º Período">3º Período</option>
                              <option value="4º Período">4º Período</option>
                              <option value="5º Período">5º Período</option>
                              <option value="6º Período">6º Período</option>
                              <option value="7º Período">7º Período</option>
                              <option value="8º Período">8º Período</option>
                              <option value="9º Período">9º Período</option>
                              <option value="10º Período">10º Período</option>
                            </select>
                            <ErrorMessage fieldName="periodoAtual" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Modalidade? *</label>
                            <select
                              name="modalidade"
                              value={formData.modalidade}
                              onChange={handleInputChange}
                              onBlur={() => handleBlur('modalidade')}
                              required
                              className={getInputClasses('modalidade')}
                            >
                              <option value="">Selecione</option>
                              <option value="Presencial">Presencial</option>
                              <option value="EAD">EAD</option>
                            </select>
                            <ErrorMessage fieldName="modalidade" />
                          </div>

                          {formData.modalidade === 'Presencial' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Qual o turno? *</label>
                              <select
                                name="turno"
                                value={formData.turno}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('turno')}
                                required
                                className={getInputClasses('turno')}
                              >
                                <option value="">Selecione</option>
                                <option value="Manhã">Manhã</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Integral">Integral</option>
                                <option value="Noturno">Noturno</option>
                              </select>
                              <ErrorMessage fieldName="turno" />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handleBackStep}
                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
              <button
                type="submit"
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Próxima Etapa
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {currentStep === 4 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Motivação e Conhecimento</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Por que deseja ser corretor de imóveis? *
                </label>
                <div className="text-xs text-gray-500 mb-1">
                  {formData.motivoCorretor.length}/1000 caracteres - mínimo 10
                </div>
                <textarea
                  name="motivoCorretor"
                  value={formData.motivoCorretor}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('motivoCorretor')}
                  required
                  rows={4}
                  className={getInputClasses('motivoCorretor')}
                  placeholder="Descreva suas motivações para seguir a carreira de corretor de imóveis..."
                  maxLength={1000}
                />
                <ErrorMessage fieldName="motivoCorretor" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O que você sabe sobre o mercado imobiliário? *
                </label>
                <div className="text-xs text-gray-500 mb-1">
                  {formData.conheceMercado.length}/1000 caracteres - mínimo 10
                </div>
                <textarea
                  name="conheceMercado"
                  value={formData.conheceMercado}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('conheceMercado')}
                  required
                  rows={4}
                  className={getInputClasses('conheceMercado')}
                  placeholder="Compartilhe seu conhecimento sobre o mercado imobiliário ou pessoas que conhece na área..."
                  maxLength={1000}
                />
                <ErrorMessage fieldName="conheceMercado" />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handleBackStep}
                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
              <button
                type="submit"
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Próxima Etapa
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {currentStep === 5 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Perfil Profissional</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Você prefere trabalhar individualmente ou em equipe? *</label>
                <select
                  name="prefereTrabalho"
                  value={formData.prefereTrabalho}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('prefereTrabalho')}
                  required
                  className={getInputClasses('prefereTrabalho')}
                >
                  <option value="">Selecione</option>
                  <option value="Individualmente">Individualmente</option>
                  <option value="Em equipe">Em equipe</option>
                  <option value="Depende da situação">Depende da situação</option>
                  <option value="Não tenho preferência">Não tenho preferência</option>
                </select>
                <ErrorMessage fieldName="prefereTrabalho" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Como você lida com feedback construtivo? *</label>
                <select
                  name="lidaFeedback"
                  value={formData.lidaFeedback}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('lidaFeedback')}
                  required
                  className={getInputClasses('lidaFeedback')}
                >
                  <option value="">Selecione</option>
                  <option value="Aceito bem e busco melhorar">Aceito bem e busco melhorar</option>
                  <option value="Fico defensivo, mas tento entender">Fico defensivo, mas tento entender</option>
                  <option value="Ignoro feedbacks">Ignoro feedbacks</option>
                  <option value="Não gosto de feedbacks">Não gosto de feedbacks</option>
                </select>
                <ErrorMessage fieldName="lidaFeedback" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Como você resolveria um conflito entre colegas de trabalho? *</label>
                <select
                  name="resolveConflito"
                  value={formData.resolveConflito}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('resolveConflito')}
                  required
                  className={getInputClasses('resolveConflito')}
                >
                  <option value="">Selecione</option>
                  <option value="Ignoraria o problema">Ignoraria o problema</option>
                  <option value="Conversaria com as partes envolvidas para entender e resolver">Conversaria com as partes envolvidas para entender e resolver</option>
                  <option value="Tentaria resolver sozinho(a)">Tentaria resolver sozinho(a)</option>
                  <option value="Não sei responder">Não sei responder</option>
                </select>
                <ErrorMessage fieldName="resolveConflito" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">O que você considera mais importante em um ambiente profissional? *</label>
                <select
                  name="importanteAmbiente"
                  value={formData.importanteAmbiente}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('importanteAmbiente')}
                  required
                  className={getInputClasses('importanteAmbiente')}
                >
                  <option value="">Selecione</option>
                  <option value="Salário e benefícios">Salário e benefícios</option>
                  <option value="Oportunidades de crescimento">Oportunidades de crescimento</option>
                  <option value="Ambiente de trabalho e cultura da empresa">Ambiente de trabalho e cultura da empresa</option>
                  <option value="Não sei responder">Não sei responder</option>
                </select>
                <ErrorMessage fieldName="importanteAmbiente" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Como você se mantém organizado(a) no trabalho? *</label>
                <select
                  name="organizacao"
                  value={formData.organizacao}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('organizacao')}
                  required
                  className={getInputClasses('organizacao')}
                >
                  <option value="">Selecione</option>
                  <option value="Anoto tudo em papel">Anoto tudo em papel</option>
                  <option value="Utilizo aplicativos de organização">Utilizo aplicativos de organização</option>
                  <option value="Tenho boa memória, não preciso de organização">Tenho boa memória, não preciso de organização</option>
                  <option value="Organização não é meu ponto forte">Organização não é meu ponto forte</option>
                </select>
                <ErrorMessage fieldName="organizacao" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qual é a sua opinião sobre trabalhar sob pressão? *</label>
                <select
                  name="pressao"
                  value={formData.pressao}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('pressao')}
                  required
                  className={getInputClasses('pressao')}
                >
                  <option value="">Selecione</option>
                  <option value="Não gosto e não me saio bem">Não gosto e não me saio bem</option>
                  <option value="Consigo lidar bem com prazos apertados">Consigo lidar bem com prazos apertados</option>
                  <option value="Não me importo com pressão">Não me importo com pressão</option>
                  <option value="Varia conforme a situação">Varia conforme a situação</option>
                </select>
                <ErrorMessage fieldName="pressao" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qual é a sua abordagem ao lidar com clientes indecisos na compra de um imóvel? *</label>
                <select
                  name="abordagemIndeciso"
                  value={formData.abordagemIndeciso}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('abordagemIndeciso')}
                  required
                  className={getInputClasses('abordagemIndeciso')}
                >
                  <option value="">Selecione</option>
                  <option value="Pressiono-os a tomar uma decisão rápida">Pressiono-os a tomar uma decisão rápida</option>
                  <option value="Ofereço informações detalhadas e sugestões personalizadas">Ofereço informações detalhadas e sugestões personalizadas</option>
                  <option value="Deixo que decidam por conta própria sem intervenção">Deixo que decidam por conta própria sem intervenção</option>
                  <option value="Não tenho experiência nesse tipo de situação">Não tenho experiência nesse tipo de situação</option>
                </select>
                <ErrorMessage fieldName="abordagemIndeciso" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Como você abordaria um potencial cliente que demonstra interesse em comprar um imóvel? *</label>
                <select
                  name="abordagemCliente"
                  value={formData.abordagemCliente}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('abordagemCliente')}
                  required
                  className={getInputClasses('abordagemCliente')}
                >
                  <option value="">Selecione</option>
                  <option value="Seria direto e objetivo sobre as vantagens do imóvel">Seria direto e objetivo sobre as vantagens do imóvel</option>
                  <option value="Faria perguntas para entender suas necessidades e oferecer opções adequadas">Faria perguntas para entender suas necessidades e oferecer opções adequadas</option>
                  <option value="Não tenho experiência nesse tipo de abordagem">Não tenho experiência nesse tipo de abordagem</option>
                  <option value="Não me sinto confortável fazendo isso">Não me sinto confortável fazendo isso</option>
                </select>
                <ErrorMessage fieldName="abordagemCliente" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">O que você considera mais importante ao mostrar um imóvel para um cliente? *</label>
                <select
                  name="mostrarImovel"
                  value={formData.mostrarImovel}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('mostrarImovel')}
                  required
                  className={getInputClasses('mostrarImovel')}
                >
                  <option value="">Selecione</option>
                  <option value="Destacar apenas os pontos positivos">Destacar apenas os pontos positivos</option>
                  <option value="Ser honesto sobre todas as características, positivas e negativas">Ser honesto sobre todas as características, positivas e negativas</option>
                  <option value="Não tenho experiência em mostrar imóveis">Não tenho experiência em mostrar imóveis</option>
                  <option value="Não sei responder">Não sei responder</option>
                </select>
                <ErrorMessage fieldName="mostrarImovel" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Como você gerenciaria seu tempo ao lidar com múltiplos clientes interessados em imóveis diferentes? *</label>
                <select
                  name="gerenciarTempo"
                  value={formData.gerenciarTempo}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('gerenciarTempo')}
                  required
                  className={getInputClasses('gerenciarTempo')}
                >
                  <option value="">Selecione</option>
                  <option value="Priorizaria clientes mais fáceis de lidar">Priorizaria clientes mais fáceis de lidar</option>
                  <option value="Tentaria atender todos de forma equitativa">Tentaria atender todos de forma equitativa</option>
                  <option value="Não me sinto confortável gerenciando múltiplos clientes">Não me sinto confortável gerenciando múltiplos clientes</option>
                  <option value="Não sei responder">Não sei responder</option>
                </select>
                <ErrorMessage fieldName="gerenciarTempo" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Como você descreveria seu estilo de comunicação? *</label>
                <select
                  name="comunicacao"
                  value={formData.comunicacao}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('comunicacao')}
                  required
                  className={getInputClasses('comunicacao')}
                >
                  <option value="">Selecione</option>
                  <option value="Assertivo e direto">Assertivo e direto</option>
                  <option value="Empático e paciente">Empático e paciente</option>
                  <option value="Flexível, adaptando-se às necessidades do cliente">Flexível, adaptando-se às necessidades do cliente</option>
                  <option value="Varia conforme a situação">Varia conforme a situação</option>
                </select>
                <ErrorMessage fieldName="comunicacao" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Como você se mantém motivado(a) em um ambiente de trabalho desafiador? *</label>
                <select
                  name="motivacaoAmbiente"
                  value={formData.motivacaoAmbiente}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('motivacaoAmbiente')}
                  required
                  className={getInputClasses('motivacaoAmbiente')}
                >
                  <option value="">Selecione</option>
                  <option value="Com reconhecimento e incentivos financeiros">Com reconhecimento e incentivos financeiros</option>
                  <option value="Com metas pessoais e profissionais claras">Com metas pessoais e profissionais claras</option>
                  <option value="Não preciso de motivação externa">Não preciso de motivação externa</option>
                  <option value="Não me sinto motivado(a) em ambientes desafiadores">Não me sinto motivado(a) em ambientes desafiadores</option>
                </select>
                <ErrorMessage fieldName="motivacaoAmbiente" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conte sobre uma situação onde teve que tomar uma decisão rápida: *
                </label>
                <div className="text-xs text-gray-500 mb-1">
                  {formData.decisaoRapida.length}/1000 caracteres - mínimo 10
                </div>
                <textarea
                  name="decisaoRapida"
                  value={formData.decisaoRapida}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('decisaoRapida')}
                  required
                  rows={4}
                  className={getInputClasses('decisaoRapida')}
                  placeholder="Descreva uma situação específica, como você analisou as opções e qual foi o resultado..."
                  maxLength={1000}
                />
                <ErrorMessage fieldName="decisaoRapida" />
              </div>
            </div>

            {submitError && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{submitError}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handleBackStep}
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    Finalizar Inscrição
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
          </div>
        </div>
      </div>
    </Section>
  );
}