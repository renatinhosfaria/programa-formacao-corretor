import { useState, useCallback } from 'react';

interface EventFormData {
  nome: string;
  whatsapp: string;
  nascimento: string;
  instagram: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function EventFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<EventFormData>({
    nome: '',
    whatsapp: '',
    nascimento: '',
    instagram: ''
  });

  // Função para aplicar máscara ao WhatsApp
  function maskWhatsapp(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
  }

  // Validação dos campos
  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'nome':
        if (!value.trim()) return 'Nome é obrigatório';
        if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
        if (value.trim().length > 100) return 'Nome muito longo (máximo 100 caracteres)';
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) return 'Nome deve conter apenas letras e espaços';
        return '';

      case 'whatsapp': {
        if (!value.trim()) return 'WhatsApp é obrigatório';
        const whatsappRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!whatsappRegex.test(value.trim())) return 'Formato: (XX) XXXXX-XXXX';
        return '';
      }

      case 'nascimento': {
        if (!value) return 'Data de nascimento é obrigatória';
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
        
        if (birthDate > today) return 'Data não pode ser no futuro';
        if (finalAge < 20 || finalAge > 30) return 'INVALID_AGE';
        return '';
      }

      case 'instagram': {
        if (!value.trim()) return 'Instagram é obrigatório';
        if (!value.trim().startsWith('@')) return 'Deve começar com @';
        if (value.trim().length < 2) return 'Instagram muito curto';
        if (value.trim().length > 50) return 'Instagram muito longo';
        return '';
      }

      default:
        return '';
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Aplicar máscara ao WhatsApp
    let maskedValue = value;
    if (name === 'whatsapp') {
      maskedValue = maskWhatsapp(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: maskedValue
    }));

    // Marcar campo como touched
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

    // Limpar erro de submissão
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
    
    setTimeout(() => {
      const fieldValue = formData[fieldName as keyof EventFormData];
      const error = validateField(fieldName, fieldValue);
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }, 0);
  }, [formData, validateField]);

  // Validação completa do formulário
  const validateForm = (): boolean => {
    const fields = ['nome', 'whatsapp', 'nascimento', 'instagram'];
    let hasErrors = false;
    const newErrors: FormErrors = {};
    const newTouchedFields = new Set(touchedFields);

    fields.forEach(field => {
      newTouchedFields.add(field);
      const error = validateField(field, formData[field as keyof EventFormData]);
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
    
    if (!error || !isFieldTouched || error === 'INVALID_AGE') return null;
    
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
        : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white hover:border-gray-300 shadow-sm'
    } focus:outline-none`;
  }, [formErrors, touchedFields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    // GTM Event
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'form_submit_attempt',
        form_name: 'inscricao_evento',
        user_data: {
          nome: formData.nome,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram
        },
        timestamp: new Date().toISOString()
      });
    }
    
    try {
      const response = await fetch('/api/evento-inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        
        // GTM Success Event
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'form_submit_success',
            form_name: 'inscricao_evento',
            user_data: {
              nome: formData.nome,
              whatsapp: formData.whatsapp,
              instagram: formData.instagram
            },
            timestamp: new Date().toISOString()
          });
        }
      } else {
        if (response.status === 400 && data.errors) {
          const newErrors: { [key: string]: string } = {};
          data.errors.forEach((error: { field: string; message: string }) => {
            newErrors[error.field] = error.message;
            setTouchedFields(prev => {
              const newSet = new Set(prev);
              newSet.add(error.field);
              return newSet;
            });
          });
          setFormErrors(prev => ({ ...prev, ...newErrors }));
          setSubmitError(`Verifique os campos destacados em vermelho. ${data.message || 'Dados inválidos no formulário.'}`);
        } else if (response.status === 429) {
          const retryMinutes = data.retryAfterMinutes || Math.ceil((data.retryAfterSeconds || 600) / 60);
          setSubmitError(`${data.message || 'Muitas tentativas de envio.'} Aguarde ${retryMinutes} minutos.`);
        } else {
          setSubmitError(data.message || 'Erro ao enviar inscrição. Verifique sua conexão e tente novamente.');
        }
      }
    } catch (error) {
      console.error('Erro ao submeter inscrição:', error);
      setSubmitError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">✅ Inscrição Confirmada!</h2>
          <p className="text-gray-600 mb-4">
            Obrigado por se inscrever no nosso evento! Entraremos em contato em breve com todos os detalhes.
          </p>
          <p className="text-sm text-gray-500">
            Verifique seu e-mail e WhatsApp nas próximas horas.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-8 0v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2H8a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Inscrição para o Evento</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white">
              🎯 Formulário de Inscrição
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Todas as informações são obrigatórias
            </p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando Inscrição...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirmar Inscrição
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Seus dados são seguros e não serão compartilhados com terceiros
          </p>
        </div>
      </div>
    </section>
  );
}