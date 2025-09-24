import { HelmetProvider } from 'react-helmet-async';
import Seo from '../lib/Seo';
import EventFormSection from '../components/landing/EventFormSection';

export default function InscricaoEvento() {
  // Event JSON-LD Schema
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Evento Fama Negócios Imobiliários",
    "description": "Evento exclusivo sobre oportunidades no mercado imobiliário",
    "organizer": {
      "@type": "Organization",
      "name": "Fama Negócios Imobiliários",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Uberlândia",
        "addressRegion": "MG",
        "addressCountry": "BR"
      }
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Uberlândia",
        "addressRegion": "MG",
        "addressCountry": "BR"
      }
    }
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Seo 
          title="Inscrição - Evento Fama Negócios Imobiliários"
          description="Faça sua inscrição para nosso evento exclusivo sobre oportunidades no mercado imobiliário em Uberlândia"
          jsonLd={[eventJsonLd]}
        />
        <main>
          <EventFormSection />
        </main>
      </div>
    </HelmetProvider>
  );
}