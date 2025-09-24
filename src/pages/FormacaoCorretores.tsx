import { HelmetProvider } from 'react-helmet-async';
import Seo from '../lib/Seo';
import HeroSection from '../components/landing/HeroSection';
import { useState, useCallback } from 'react';
// import InfoSection from '../components/landing/InfoSection';
// import FaqSection from '../components/landing/FaqSection';
import FormSection from '../components/landing/FormSection';
// import Footer from '../components/landing/Footer';

export default function FormacaoCorretores() {
  const [unlocked, setUnlocked] = useState(false);
  const handleUnlock = useCallback(() => setUnlocked(true), []);
  // FAQ JSON-LD Schema
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Preciso de experiência?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Não. Avaliamos perfil comercial e comunicação. O programa foi desenvolvido especificamente para pessoas que estão começando no mercado imobiliário."
        }
      },
      {
        "@type": "Question",
        "name": "É presencial?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim, 100% presencial no escritório em Uberlândia, com horários flexíveis. Acreditamos que o aprendizado presencial acelera o desenvolvimento e cria conexões mais fortes."
        }
      },
      {
        "@type": "Question",
        "name": "Qual a duração?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "6 meses de programa completo, incluindo teoria, prática, mentoria e visitas acompanhadas. É o tempo ideal para desenvolver todas as competências necessárias."
        }
      },
      {
        "@type": "Question",
        "name": "Remuneração no programa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim! Ajuda de Custo + Comissão (faixa variável conforme desempenho) + bônus por resultados. Você é remunerado desde o início do programa."
        }
      },
      {
        "@type": "Question",
        "name": "E após a formação?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ingresso como Corretor de Imóveis na equipe da Fama, com estrutura completa de suporte, ferramentas e oportunidades de crescimento contínuo."
        }
      },
      {
        "@type": "Question",
        "name": "Preciso de CRECI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Não para ingressar na formação."
        }
      }
    ]
  };

  // Course JSON-LD Schema
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Programa de Formação de Corretores",
    "description": "6 meses de teoria + prática, 100% presencial em Uberlândia, com horários flexíveis, mentoria e comissões. 2 vagas.",
    "provider": {
      "@type": "Organization",
      "name": "Fama Negócios Imobiliários",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Uberlândia",
        "addressRegion": "MG",
        "addressCountry": "BR"
      }
    },
    "courseMode": "In-person",
    "coursePrerequisites": "Não há pré-requisitos. Programa desenvolvido para início de carreira.",
    "timeRequired": "P6M",
    "startDate": "2025-08",
    "offers": {
      "@type": "Offer",
      "category": "Programa de Formação",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-white">
        <Seo 
          jsonLd={[faqJsonLd, courseJsonLd]}
        />
        <main>
          <HeroSection onUnlock={handleUnlock} unlocked={unlocked} threshold={0.3} />
          {/* <InfoSection /> */}
          {/* <FaqSection /> */}
          {unlocked && <FormSection />}
        </main>
  {/* <Footer /> */}
      </div>
    </HelmetProvider>
  );
}