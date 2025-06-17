import React, { useEffect } from "react";

interface TranslateElementConstructor {
  new (
    options: {
      pageLanguage: string;
      includedLanguages?: string;
      layout?: any;
      autoDisplay?: boolean;
    },
    element: string | HTMLElement
  ): void;
  InlineLayout?: { SIMPLE: number | string };
}

interface GoogleTranslate {
  TranslateElement: TranslateElementConstructor;
}

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
    changeGoogleTranslateLanguage?: (langCode: string) => void;
  }
}


export default function TranslateWidget() {
  useEffect(() => {
    const setCookie = (value: string) => {
      const domain = window.location.hostname;
      // Clear existing googtrans cookies for domain and subdomain
      document.cookie = `googtrans=;path=/;domain=${domain};expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `googtrans=;path=/;domain=.${domain};expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      // Set new googtrans cookie
      document.cookie = `googtrans=${value};path=/;domain=${domain}`;
      document.cookie = `googtrans=${value};path=/;domain=.${domain}`;
    };

    // Initially set cookie to English -> English (default)
    setCookie("/en/en");

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.id = "google-translate-script";
      script.async = true;
      document.body.appendChild(script);
    }

    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,es,fr,de,it,hi,pt,ar,ru,zh-CN,ko,ja",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    window.changeGoogleTranslateLanguage = (langCode: string) => {
      setCookie(`/en/${langCode}`);
      setTimeout(() => window.location.reload(), 100); // Delay reload to ensure cookie is saved
    };

    return () => {
      delete window.googleTranslateElementInit;
      delete window.changeGoogleTranslateLanguage;
    };
  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} />;
}