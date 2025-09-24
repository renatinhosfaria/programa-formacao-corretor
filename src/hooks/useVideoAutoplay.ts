import { useEffect, useState, useRef, type RefObject } from 'react';

interface UseVideoAutoplayOptions {
  threshold?: number; // Porcentagem da tela que o vídeo deve ocupar para começar a reproduzir (0.0 a 1.0)
  rootMargin?: string; // Margem adicional para o observer
}

export function useVideoAutoplay(
  videoRefs: RefObject<HTMLVideoElement | null>[],
  options: UseVideoAutoplayOptions = {}
) {
  const { threshold = 0.5, rootMargin = '0px' } = options;
  const [userInteracted, setUserInteracted] = useState(false);
  const playPromises = useRef<Map<HTMLVideoElement, Promise<void>>>(new Map());

  useEffect(() => {
    // Detectar primeira interação do usuário
    const handleUserInteraction = () => {
      setUserInteracted(true);
      // Tentar desmutar todos os vídeos
      videoRefs.forEach(ref => {
        if (ref.current && !ref.current.paused) {
          ref.current.muted = false;
        }
      });
    };

    // Adicionar listeners para detectar primeira interação
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [videoRefs]);

  useEffect(() => {
    const currentVideoRefs = videoRefs.filter(ref => ref.current);
    
    if (currentVideoRefs.length === 0) return;

    const playVideo = async (video: HTMLVideoElement) => {
      // Se já existe uma promise de play pendente, aguardar ela terminar
      const existingPromise = playPromises.current.get(video);
      if (existingPromise) {
        try {
          await existingPromise;
        } catch {
          // Ignorar erro da promise anterior
        }
      }

      const playPromise = (async () => {
        try {
          // Tentar reproduzir com áudio se usuário já interagiu
          if (userInteracted) {
            video.muted = false;
          } else {
            video.muted = true;
          }
          
          await video.play();
          
          // Se conseguiu reproduzir e usuário já interagiu, tentar desmutar
          if (userInteracted && video.muted) {
            video.muted = false;
          }
        } catch (error) {
          console.warn('Erro ao reproduzir vídeo:', error);
          // Fallback: tentar mutado
          try {
            video.muted = true;
            await video.play();
          } catch (retryError) {
            console.error('Erro ao reproduzir vídeo mesmo mutado:', retryError);
          }
        } finally {
          // Remover a promise do mapa quando terminar
          playPromises.current.delete(video);
        }
      })();

      playPromises.current.set(video, playPromise);
      return playPromise;
    };

    const pauseVideo = async (video: HTMLVideoElement) => {
      // Se há uma promise de play em andamento, aguardar ela terminar antes de pausar
      const existingPromise = playPromises.current.get(video);
      if (existingPromise) {
        try {
          await existingPromise;
        } catch {
          // Ignorar erro da promise anterior
        }
      }

      if (!video.paused) {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            // Vídeo está visível - reproduzir
            playVideo(video);
          } else {
            // Vídeo não está visível - pausar
            pauseVideo(video);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Observar todos os vídeos
    currentVideoRefs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    // Cleanup
    return () => {
      // Aguardar todas as promises de play pendentes antes de fazer cleanup
      const allPromises = Array.from(playPromises.current.values());
      Promise.allSettled(allPromises).then(() => {
        currentVideoRefs.forEach((ref) => {
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        });
        observer.disconnect();
        playPromises.current.clear();
      });
    };
  }, [videoRefs, threshold, rootMargin, userInteracted]);
}