import React, { useEffect } from 'react';

export default function TranslateWidget() {
  useEffect(() => {
    // Load Google Translate script if not already loaded
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.id = 'google-translate-script';
      script.async = true;
      document.body.appendChild(script);
    }

    // Define the global callback for Google Translate initialization
    (window as any).googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,es,fr,de,it',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Cleanup function on unmount
    return () => {
      delete (window as any).googleTranslateElementInit;
    };
  }, []);

  // Render the container where Google Translate will load
  return <div id="google_translate_element" />;
}