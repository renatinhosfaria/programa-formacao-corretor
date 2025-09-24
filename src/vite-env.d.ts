/// <reference types="vite/client" />

// Extensões para GTM Debug
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export {};
