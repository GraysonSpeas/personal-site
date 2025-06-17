import React, { useEffect } from 'react';

export default function TranslateHide() {
  useEffect(() => {
    const hideTranslateBanner = () => {
      document.body.style.top = '0px';
      document.querySelectorAll('iframe').forEach((el) => {
        if (
          el.classList.contains('skiptranslate') ||
          (el.src && el.src.includes('translate.google.com'))
        ) {
          el.style.display = 'none';
          el.style.zIndex = '-9999';
          el.style.position = 'absolute';
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.height = '1px';
          el.style.width = '1px';
        }
      });

      // Also hide the container banner div if it exists
      const banner = document.querySelector('.goog-te-banner-frame.skiptranslate');
      if (banner) {
        (banner as HTMLElement).style.display = 'none';
      }
    };

    // Hide immediately on mount
    hideTranslateBanner();

    // Setup MutationObserver to watch for new iframes or banner
    const observer = new MutationObserver(() => {
      hideTranslateBanner();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}