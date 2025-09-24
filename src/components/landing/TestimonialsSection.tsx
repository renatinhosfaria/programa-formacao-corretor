import Section from './Section';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Jéssica",
      role: "Corretora de Imóveis",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b372?w=150&h=150&fit=crop&crop=face",
      quote: "A Fama mudou minha vida profissional. Em 6 meses, aprendi mais sobre vendas e relacionamento com clientes do que imaginava possível. Me tornei corretora de imóveis e hoje sou uma profissional realizada e que conseguiu realizar todos os meus sonhos.",
      highlight: "Ganhei mais de R$ 3 mil no primeiro mês."
    },
    {
      name: "Humberto",
      role: "Corretor de Imóveis",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "Entrei sem experiência alguma no mercado imobiliário. A formação é completa: desde o primeiro contato até o fechamento da venda. As ferramentas e o acompanhamento são excepcionais.",
      highlight: "6 vendas nos primeiros 4 meses"
    }
  ];

  /*
  const companyHighlights = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "8+ anos no mercado",
      description: "Experiência sólida em negócios imobiliários"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "50+ profissionais formados",
      description: "Equipe de corretores especializada"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: "95% aprovação CRECI",
      description: "Alta taxa de sucesso dos formandos"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Tecnologia avançada",
      description: "FamaChat, automações e IAs"
    }
  ];
  */

  return (
    <Section background="white">
      {/* Testimonials */}
      <div className="mb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Histórias de sucesso
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conheça profissionais que transformaram suas carreiras com nosso programa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.photo}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {testimonial.name}
                  </h3>
                  <p className="text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              
              <blockquote className="text-gray-700 mb-4 leading-relaxed italic">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-blue-800 font-semibold text-sm">
                  {testimonial.highlight}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ...existing code... */}
    </Section>
  );
}