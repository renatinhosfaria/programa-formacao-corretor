import { useEffect, useState } from 'react';

interface UseScrollVisibilityOptions {
  targetSectionId: string;
  offset?: number;
}

export function useScrollVisibility({ targetSectionId, offset = 0 }: UseScrollVisibilityOptions) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const targetElement = document.getElementById(targetSectionId);
      
      if (!targetElement) {
        setIsVisible(true);
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // O botão desaparece quando a seção está visível na tela
      // (quando o topo da seção está visível ou a seção ocupa a tela)
      const isTargetVisible = targetRect.top <= windowHeight / 2 && targetRect.bottom >= windowHeight / 2;
      
      setIsVisible(!isTargetVisible);
    };

    // Executar imediatamente para definir estado inicial
    handleScroll();

    // Adicionar listener de scroll com throttling para performance
    let ticking = false;
    
    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    window.addEventListener('resize', throttledScrollHandler, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      window.removeEventListener('resize', throttledScrollHandler);
    };
  }, [targetSectionId, offset]);

  return isVisible;
}