import React from 'react';

export default function CleanAdBanner() {
  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      {/* Student Disclaimer Box */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 mb-4 text-center shadow-sm">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">
          <span>⚠️</span>
          <span>Important Student Advisory & Hosting Notice</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-200/90 max-w-2xl mx-auto">
          StudyMacha displays automated third-party ad feeds strictly to fund our free servers and updates. StudyMacha and its creators <strong>DO NOT endorse or associate</strong> with any betting, gambling, or non-educational apps that may appear.
        </p>
        <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80 mt-1 max-w-2xl mx-auto">
          <strong>గమనిక:</strong> సర్వర్ ఖర్చుల కోసం మాత్రమే ఈ ప్రకటనలు ఉంచబడ్డాయి. బెట్టింగ్ (Betting), జూదం యాప్‌లకు దూరంగా ఉండాలని కోరుతున్నాము. వీటికి స్టడీమచ్చాతో ఎటువంటి సంబంధం లేదు. దయచేసి వాటిని విస్మరించండి.
        </p>
      </div>

      {/* Adsterra Display Banner Container */}
      <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/40 rounded-xl p-2 border border-gray-100 dark:border-gray-800">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-medium">
          Sponsored Resource Feed
        </span>
        <div className="min-h-[90px] w-full flex justify-center overflow-hidden">
          <iframe
            title="StudyMacha Sponsor"
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head><style>body{margin:0;display:flex;justify-content:center;align-items:center;background:transparent;}</style></head>
                <body>
                  <script type="text/javascript">
                    atOptions = {
                      'key' : 'd64afe9db7759cdfc7455496c66867da',
                      'format' : 'iframe',
                      'height' : 90,
                      'width' : 728,
                      'params' : {}
                    };
                  </script>
                  <script type="text/javascript" src="https://www.highrevenueformat.com/d64afe9db7759cdfc7455496c66867da/invoke.js"></script>
                </body>
              </html>
            `}
            className="w-full max-w-[728px] h-[90px] border-0"
          />
        </div>
      </div>
    </div>
  );
}
