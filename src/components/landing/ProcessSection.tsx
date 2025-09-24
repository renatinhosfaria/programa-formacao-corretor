import Section from './Section';

export default function ProcessSection() {
  const processSteps = [
    {
      number: "01",
      title: "Inscrição online",
      description: "Preencha o formulário em 3-5 minutos com suas informações básicas",
      duration: "3-5 min"
    },
    {
      number: "02", 
      title: "Dinâmica breve",
      description: "Pitch de 60 segundos + simulação curta para avaliar seu perfil comercial",
      duration: "20 min"
    },
    {
      number: "03",
      title: "Entrevista 1:1", 
      description: "Conversa individual para conhecer suas motivações e objetivos",
      duration: "30 min"
    },
    {
      number: "04",
      title: "Shadow day",
      description: "Um dia no escritório para conhecer a rotina e a equipe",
      duration: "1 dia"
    },
    {
      number: "05",
      title: "Resultado final",
      description: "Comunicação da decisão e início do programa em Agosto/2025",
      duration: "48h"
    }
  ];

  return (
    <Section id="processo" background="gray">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Processo seletivo rápido
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Um processo ágil e transparente para identificar candidatos com perfil adequado
        </p>
      </div>

      <div className="space-y-8">
        {processSteps.map((step, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 lg:p-8 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {step.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow (except for last item) */}
              {index < processSteps.length - 1 && (
                <div className="hidden lg:block flex-shrink-0 text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-lg text-gray-600 mb-6">
          Pronto para começar sua nova carreira?
        </p>
        <button
          onClick={() => {
            const element = document.getElementById('inscricao');
            if (element) {
              const headerHeight = 80;
              const elementPosition = element.offsetTop - headerHeight;
              window.scrollTo({ top: elementPosition, behavior: 'smooth' });
            }
          }}
          className="btn-primary text-lg px-8 py-3"
        >
          Iniciar inscrição agora
        </button>
      </div>
    </Section>
  );
}