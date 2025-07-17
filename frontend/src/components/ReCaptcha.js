import React, { useEffect, useRef } from 'react';

const ReCaptcha = ({ sitekey, onChange, theme = 'light', size = 'normal' }) => {
  const captchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Загрузка reCAPTCHA API
  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render) {
        renderCaptcha();
      } else {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.grecaptcha.ready(() => renderCaptcha());
        };
        document.body.appendChild(script);
      }
    };

    const renderCaptcha = () => {
      if (captchaRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
          sitekey: sitekey,
          theme: theme,
          size: size,
          callback: (token) => {
            if (onChange) onChange(token);
          },
          'expired-callback': () => {
            if (onChange) onChange(null);
          },
          'error-callback': () => {
            if (onChange) onChange(null);
          }
        });
      }
    };

    loadRecaptcha();

    return () => {
      if (widgetIdRef.current && window.grecaptcha) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
    };
  }, [sitekey, onChange, theme, size]);

  return <div ref={captchaRef} />;
};

export default ReCaptcha;