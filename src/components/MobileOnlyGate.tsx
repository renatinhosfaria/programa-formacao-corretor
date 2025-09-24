import type { ReactNode } from 'react';
import { useMobileDetection } from '../hooks/useMobileDetection';

interface MobileOnlyGateProps {
  children: ReactNode;
  customMessage?: string;
  allowTablets?: boolean;
  strictMode?: boolean; // Modo mais rigoroso de detecção
}

export default function MobileOnlyGate({ 
  children, 
  customMessage,
  allowTablets = false,
  strictMode = false
}: MobileOnlyGateProps) {
  const { isMobile, screenSize } = useMobileDetection({
    maxWidth: allowTablets ? 1024 : 768,
    includeTouchDevice: !strictMode
  });

  // Em modo rigoroso, verificar também se é realmente um dispositivo móvel
  const isReallyMobile = strictMode ? 
    isMobile && screenSize.width <= 480 : // Telas muito pequenas
    isMobile;

  if (!isReallyMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 lg:p-12 text-center max-w-2xl mx-auto shadow-2xl">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            📱 Acesso Apenas pelo Celular
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {customMessage || 
              "Esta página foi otimizada para dispositivos móveis. Para uma melhor experiência, acesse pelo seu smartphone."
            }
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Como acessar pelo celular:</h3>
            <div className="text-left space-y-2 text-blue-800">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                Pegue seu smartphone
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                Abra o navegador (Chrome, Safari, etc.)
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                Acesse o link abaixo
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-3">Acesse pelo seu celular:</p>
            <div className="bg-blue-50 px-4 py-3 rounded text-blue-700 font-mono text-sm break-all">
              {window.location.href}
            </div>
            <button 
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              📋 Copiar Link
            </button>
          </div>

          <div className="text-xs text-gray-400">
            <p>Resolução atual: {screenSize.width} x {screenSize.height}</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}