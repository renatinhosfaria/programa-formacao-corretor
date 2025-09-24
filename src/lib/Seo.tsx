import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  ogImage?: string;
  url?: string;
  jsonLd?: object;
}

export default function Seo({
  title = 'Programa de Formação de Corretores | Fama – Turma Agosto/2025',
  description = '6 meses de teoria + prática, 100% presencial em Uberlândia, com horários flexíveis, mentoria e comissões. 2 vagas. Inscreva-se.',
  ogImage = '/images/og-placeholder.svg',
  url = 'https://famanegociosimobiliarios.com.br/programa-formacao-corretores',
  jsonLd
}: SeoProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Fama Negócios Imobiliários" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}