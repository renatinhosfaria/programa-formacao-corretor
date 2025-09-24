import Section from './Section';
import FaqItem from './FaqItem';

export default function FaqSection() {
  const faqItems = [
    {
      question: "Preciso de experiência?",
      answer: "Não. Avaliamos perfil comercial e comunicação. O programa foi desenvolvido especificamente para pessoas que estão começando no mercado imobiliário."
    },
    {
      question: "É presencial?",
      answer: "Sim, 100% presencial no escritório em Uberlândia, com horários flexíveis. Acreditamos que o aprendizado presencial acelera o desenvolvimento e cria conexões mais fortes."
    },
    {
      question: "Qual a duração?",
      answer: "6 meses de programa completo, incluindo teoria, prática, mentoria e visitas acompanhadas. É o tempo ideal para desenvolver todas as competências necessárias."
    },
    {
      question: "Remuneração no programa?",
      answer: "Sim! Ajuda de Custo + Comissão (faixa variável conforme desempenho) + bônus por resultados. Você é remunerado desde o início do programa."
    },
    {
      question: "E após a formação?",
      answer: "Ingresso como Corretor de Imóveis na equipe da Fama, com estrutura completa de suporte, ferramentas e oportunidades de crescimento contínuo."
    },
    {
      question: "Preciso de CRECI?",
      answer: "Não para ingressar na formação. Durante o programa, você atuará em atividades permitidas (atendimento, agendamentos, visitas acompanhadas). O CRECI será necessário para atos privativos após a formação."
    }
  ];

  // JSON-LD Schema for FAQ
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      
      <Section id="faq" background="gray">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tire suas principais dúvidas sobre o programa de formação
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={index === 0} // First item open by default
            />
          ))}
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ainda tem dúvidas?
            </h3>
            <p className="text-gray-600 mb-6">
              Nossa equipe está pronta para esclarecer qualquer questão sobre o programa
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
              className="btn-primary"
            >
              Falar com nossa equipe
            </button>
          </div>
        </div>
      </Section>
    </>
  );
}