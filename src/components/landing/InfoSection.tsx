import Section from './Section';
import Badge from './Badge';

export default function InfoSection() {
  const infoItems = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Início",
      content: "Agosto/2025"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Vagas",
      content: "2 vagas disponíveis"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Local",
      content: "[ENDERECO_OFICIAL], Uberlândia-MG"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "Formato",
      content: "100% presencial • Horários flexíveis"
    }
  ];

  const highlights = [
    {
      title: "Como funciona",
      items: [
        "6 meses de duração com encontros presenciais no escritório da Fama",
        "Rotina: treinos curtos, atendimento via FamaChat, agendamentos e visitas acompanhadas",
        "Ferramentas: FamaChat, Automações e IAs para otimizar resultados",
  "Suporte personalizado, escuta de atendimentos e plano de evolução contínuo"
      ]
    },
    {
      title: "Remuneração e incentivos",
      items: [
        "Durante o programa: Ajuda de Custo + Comissões + bônus por desempenho",
        "Após a formação: Ingresso como Corretor de Imóveis na equipe",
        "Potencial de crescimento baseado em resultados e dedicação",
        "Estrutura de suporte contínuo para maximizar seus ganhos"
      ]
    },
    {
      title: "Quem deve se inscrever",
      items: [
        "Perfil início de carreira, com alta disponibilidade e foco em metas",
        "Pessoas sem experiência no mercado imobiliário, mas com perfil comercial",
        "Comunicação clara, proatividade e organização pessoal",
        "Curiosidade para usar ferramentas digitais e aprender constantemente"
      ]
    }
  ];

  return (
    <Section id="informacoes">
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className="bg-white border-2 border-blue-100 rounded-xl p-6 text-center hover:border-blue-300 transition-all duration-300"
          >
            <div className="text-blue-600 mb-4 flex justify-center">
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-gray-600">
              {item.content}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Information */}
      <div className="space-y-12">
        {highlights.map((section, index) => (
          <div
            key={index}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
              index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
            }`}
          >
            <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {section.title}
              </h3>
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
                <div className="text-blue-600 mb-6">
                  {index === 0 && (
                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <Badge variant="primary" size="lg" className="mb-4">
                  {index === 0 && "6 meses"}
                  {index === 1 && "Remuneração"}
                  {index === 2 && "Perfil ideal"}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}