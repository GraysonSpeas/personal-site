/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
/*
declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            layout?: any;
            autoDisplay?: boolean;
          },
          element: string | HTMLElement
        ) => void;
        TranslateElement: {
          InlineLayout: {
            SIMPLE: string;
          };
        };
      };
    };
    googleTranslateElementInit?: () => void;
  }
}
*/

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            layout?: any;
            autoDisplay?: boolean;
          },
          element: string | HTMLElement
        ) => void;
        InlineLayout?: {
          SIMPLE: string;
        };
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

export {};
