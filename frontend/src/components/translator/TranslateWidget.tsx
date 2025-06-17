import React, { useEffect } from "react";

interface TranslateElementOptions {
  pageLanguage: string;
  includedLanguages?: string;
  layout?: any;
  autoDisplay?: boolean;
}

export default function TranslateWidget() {
  useEffect(() => {
    const setCookie = (value: string) => {
      const domain = window.location.hostname;
      const cookie = `googtrans=${value};path=/`;

      document.cookie = `googtrans=;path=/;domain=${domain};expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `googtrans=;path=/;domain=.${domain};expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      document.cookie = `${cookie};domain=${domain}`;
      document.cookie = `${cookie};domain=.${domain}`;
    };

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
            layout: window.google.translate.TranslateElementInit?.InlineLayout?.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    window.changeGoogleTranslateLanguage = (langCode: string) => {
      const value = `/en/${langCode}`;
      setCookie(value);
      setTimeout(() => window.location.reload(), 100);
    };

    return () => {
      delete window.googleTranslateElementInit;
      delete window.changeGoogleTranslateLanguage;
    };
  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} />;
}
