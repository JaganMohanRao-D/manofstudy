import React, { useState, useEffect, useMemo } from 'react';

export const CleanAdBanner = ({ className = '' }) => {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop((prev) => (prev !== desktop ? desktop : prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const adConfig = useMemo(() => {
    if (isDesktop) {
      return {
        width: 728,
        height: 90,
        key: 'd64afe9db7759cdfc7455496c66867da',
        invokeScript: 'https://www.highrevenueformat.com/d64afe9db7759cdfc7455496c66867da/invoke.js',
      };
    }
    return {
      width: 300,
      height: 250,
      key: '6b50746fa4461e9e78162e973c08ce48',
      invokeScript: 'https://www.highrevenueformat.com/6b50746fa4461e9e78162e973c08ce48/invoke.js',
    };
  }, [isDesktop]);

  const srcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '${adConfig.key}',
        'format' : 'iframe',
        'height' : ${adConfig.height},
        'width' : ${adConfig.width},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="${adConfig.invokeScript}"></script>
  </body>
</html>`;
  }, [adConfig]);

  return (
    <div
      className={`w-full flex flex-col items-center justify-center my-6 ${className}`}
      role="complementary"
      aria-label="Student Utility Sponsor"
    >
      <div className="bg-gray-50 dark:bg-gray-800/40 border border-slate-200/80 dark:border-gray-700/60 rounded-xl p-2 max-w-full flex flex-col items-center shadow-xs">
        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-1.5 font-medium select-none">
          STUDENT UTILITY SPONSOR
        </span>
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{
            width: adConfig.width,
            height: adConfig.height,
            maxWidth: '100%',
          }}
        >
          <iframe
            key={`${adConfig.key}-${adConfig.width}`}
            title="Student Utility Sponsor"
            srcDoc={srcDoc}
            width={adConfig.width}
            height={adConfig.height}
            className="border-0 overflow-hidden"
            scrolling="no"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default CleanAdBanner;
