import { useRef, useCallback, useState, useEffect } from 'react';
import Section from './Section';

interface HeroSectionProps {
  onUnlock?: () => void;
  unlocked?: boolean;
  threshold?: number; // default 0.7
}

export default function HeroSection({ onUnlock, unlocked = false, threshold = 0.7 }: HeroSectionProps) {
  const unlockedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const playEnsuredRef = useRef(false);

  // Tenta iniciar o vídeo com áudio; se o navegador bloquear, volta para mudo e mostra overlay
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Tenta autoplay com som; se bloquear, fica mudo mas garante reprodução
    v.volume = 1.0;
    v.muted = false;
    const attemptWithSound = v.play();
    if (attemptWithSound && typeof attemptWithSound.then === 'function') {
      attemptWithSound.then(() => {
        playEnsuredRef.current = true;
      }).catch(() => {
        // Bloqueado: requer muted em iOS/Chrome policies; manter atributo muted (já no markup) e reproduzir
        setAudioBlocked(true);
        v.muted = true;
        v.play().then(() => { playEnsuredRef.current = true; }).catch(() => {/* ignore */});
      });
    }
  }, []);

  // Re-tentativas rápidas caso a primeira não engate (ex: carregamento lento do manifest)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let attempts = 0;
    const ensurePlaying = () => {
      if (!v) return;
      if (!playEnsuredRef.current && (v.paused || v.readyState < 2) && attempts < 5) {
        attempts += 1;
        const p = v.play();
        if (p && p.catch) {
          p.catch(() => {
            // se ainda bloqueado, mantém muted para próxima tentativa
            if (!v.muted) { v.muted = true; }
            setTimeout(ensurePlaying, 200 * attempts);
          });
        } else if (v.paused) {
          setTimeout(ensurePlaying, 200 * attempts);
        }
      }
    };
    ensurePlaying();
  }, []);

  const handleEnableAudio = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1.0;
    v.play().then(() => setAudioBlocked(false)).catch(() => {
      // Se ainda bloqueado, mantém overlay
      setAudioBlocked(true);
    });
  };

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (unlockedRef.current || unlocked) return;
    const video = e.currentTarget;
    if (video.duration && video.currentTime / video.duration >= threshold) {
      unlockedRef.current = true;
      onUnlock && onUnlock();
    }
  }, [onUnlock, unlocked, threshold]);

  return (
    <Section className="pt-8 pb-4 bg-gradient-to-br from-blue-50 via-white to-blue-100" padding="small">
  <div className="text-center">
        {/* Main Title */}
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight animate-fadeInUp">
          Assista o video para que o formulário apareça
        </h1>

        {/* Vídeo posicionado logo abaixo do título */}
        <div className="mb-8 animate-fadeInUp">
          <div className="rounded-xl overflow-hidden shadow-lg max-w-4xl lg:max-w-5xl mx-auto bg-black">
            <div className="relative">
              <video
                ref={videoRef}
                id="intro-video"
                className="w-full h-auto"
                src="/Video.mp4"
                autoPlay
                muted
                // muted no markup garante autoplay mobile; tentativa de ativar áudio ocorre via useEffect
                playsInline
                controls
                onTimeUpdate={handleTimeUpdate}
                onEnded={(e) => { try { (e.currentTarget as HTMLVideoElement).controls = true; } catch(_) {} }}
              />
              {audioBlocked && (
                <button
                  type="button"
                  onClick={handleEnableAudio}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm md:text-base font-medium backdrop-blur-sm transition-opacity animate-fadeIn"
                >
                  Tocar com áudio (toque para ativar)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subtitle */}
  {/* Subtítulo removido conforme solicitação */}

  {/* Bloco de mídia removido (vídeo 1) */}

  {/* Botões de CTA removidos conforme solicitado */}

  {/* Indicadores de confiança removidos conforme solicitado */}

  {/* Bloco de mídia removido (vídeo 2) */}
      </div>
    </Section>
  );
}