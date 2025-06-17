import React, { useEffect } from 'react';

export default function TranslateHide() {
  useEffect(() => {
    const hideBanner = () => {
      // Hide the Google Translate top banner iframe
      const bannerFrame = document.querySelector('iframe.goog-te-banner-frame');
      if (bannerFrame) {
        (bannerFrame as HTMLElement).style.display = 'none';
      }

      // Also hide the banner container div if it exists
      const bannerContainer = document.querySelector('.goog-te-banner-frame.skiptranslate');
      if (bannerContainer) {
        (bannerContainer as HTMLElement).style.display = 'none';
      }

      // Fix body offset
      document.body.style.top = '0px';
    };

    hideBanner();

    const observer = new MutationObserver(hideBanner);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}