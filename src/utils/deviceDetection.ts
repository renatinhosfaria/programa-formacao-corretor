// Utilitário para detectar dispositivos mobile
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Regex para detectar dispositivos mobile
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent);
};

export const isTablet = (): boolean => {
  const userAgent = navigator.userAgent;
  return /iPad|Android.*Tablet|Windows.*Touch/i.test(userAgent);
};

export const isMobileOrTablet = (): boolean => {
  return isMobileDevice() || isTablet();
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobileDevice()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};