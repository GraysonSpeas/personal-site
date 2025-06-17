import React, { useEffect } from "react";

export default function TranslateWidget() {
  useEffect(() => {
    const deleteCookie = (name: string, domain?: string) => {
  const domainPart = domain ? `; domain=${domain}` : "";
  // Delete with and without Secure and SameSite flags
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainPart}; Secure; SameSite=None`;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainPart}`;
};

const setCookie = (value: string) => {
  // Delete all domain variants
  deleteCookie("googtrans");
  deleteCookie("googtrans", "speas.org");
  deleteCookie("googtrans", ".speas.org");

  // Set cookie only on the parent domain
  document.cookie = `googtrans=${value}; path=/; max-age=31536000; domain=.speas.org; Secure; SameSite=None`;
};


    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
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
            layout: window.google.translate.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    window.changeGoogleTranslateLanguage = (langCode: string) => {
      const value = `/en/${langCode}`;
      setCookie(value);

      const el = document.getElementById("google_translate_element");
      if (el) el.innerHTML = "";

      setTimeout(() => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,es,fr,de,it,hi,pt,ar,ru,zh-CN,ko,ja",
              layout: window.google.translate.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      }, 150);
    };

    return () => {
      delete window.googleTranslateElementInit;
      delete window.changeGoogleTranslateLanguage;
    };
  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} />;
}