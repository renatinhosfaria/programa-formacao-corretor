import { useState, useEffect } from 'react';

interface MobileDetectionOptions {
  maxWidth?: number;
  maxHeight?: number;
  includeTouchDevice?: boolean;
}

export const useMobileDetection = (options: MobileDetectionOptions = {}) => {
  const {
    maxWidth = 768, // Largura máxima considerada mobile
    maxHeight = 1024, // Altura máxima considerada mobile
    includeTouchDevice = true
  } = options;

  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkMobileDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // Critérios para considerar mobile
      const isSmallScreen = width <= maxWidth;
      const isTouchDevice = includeTouchDevice && 'ontouchstart' in window;
      const hasSmallScreenRatio = width / height < 1.5; // Telas mais altas que largas
      
      // User agent como critério adicional
      const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      const mobile = isSmallScreen || (isTouchDevice && hasSmallScreenRatio) || mobileUserAgent;
      setIsMobile(mobile);
    };

    checkMobileDevice();
    window.addEventListener('resize', checkMobileDevice);
    window.addEventListener('orientationchange', checkMobileDevice);

    return () => {
      window.removeEventListener('resize', checkMobileDevice);
      window.removeEventListener('orientationchange', checkMobileDevice);
    };
  }, [maxWidth, maxHeight, includeTouchDevice]);

  return { isMobile, screenSize };
};