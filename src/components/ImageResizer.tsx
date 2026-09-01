import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, UploadCloud, Download, ShieldCheck, Sliders, Sparkles, Eye } from 'lucide-react';
import { ImageResizerConfig, CompressedImageResult, ImageSizePreset, DimensionPreset } from '../types';
import { compressAndResizeImage } from '../utils/imageCompressor';

export const ImageResizer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<CompressedImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resizer Configuration State
  const [config, setConfig] = useState<ImageResizerConfig>({
    targetSizeKb: 50,
    sizePreset: '50kb',
    dimensionPreset: 'original',
    customWidth: 350,
    customHeight: 450,
    maintainAspectRatio: true,
    format: 'image/jpeg',
    targetDpi: 300,
  });

  // Re-compress whenever selected file or config changes
  useEffect(() => {
    if (!selectedFile) return;

    let isMounted = true;
    setIsProcessing(true);
    setError(null);

    compressAndResizeImage(selectedFile, config)
      .then((res) => {
        if (isMounted) {
          setResult(res);
          setIsProcessing(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError('Failed to compress image. Please try a different file format.');
          setIsProcessing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFile, config]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handlePresetSizeChange = (preset: ImageSizePreset) => {
    let targetKb = 50;
    if (preset === '20kb') targetKb = 20;
    else if (preset === '50kb') targetKb = 50;
    else if (preset === '100kb') targetKb = 100;
    else if (preset === '200kb') targetKb = 200;
    else if (preset === '500kb') targetKb = 500;
    else if (preset === 'custom') targetKb = config.targetSizeKb;

    setConfig((prev) => ({
      ...prev,
      sizePreset: preset,
      targetSizeKb: targetKb,
    }));
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.compressedUrl;
    const originalName = result.originalFile.name.replace(/\.[^/.]+$/, '');
    const ext = config.format === 'image/jpeg' ? 'jpg' : config.format === 'image/png' ? 'png' : 'webp';
    a.download = `${originalName}_exam_ready_${result.compressedSizeKb}kb.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Sample quick image loader for immediate instant testing
  const loadSampleImage = () => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      <rect width="800" height="1000" fill="#F1F5F9"/>
      <circle cx="400" cy="380" r="160" fill="#0284C7"/>
      <path d="M 180 850 C 180 620, 620 620, 620 850 Z" fill="#1E293B"/>
      <circle cx="400" cy="370" r="120" fill="#FFFFFF"/>
      <circle cx="360" cy="350" r="16" fill="#0F172A"/>
      <circle cx="440" cy="350" r="16" fill="#0F172A"/>
      <path d="M 360 420 Q 400 450 440 420" stroke="#0F172A" stroke-width="8" fill="none" stroke-linecap="round"/>
      <text x="400" y="930" font-family="sans-serif" font-size="32" font-weight="bold" fill="#64748B" text-anchor="middle">PASSPORT SPECIMEN</text>
    </svg>`;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const file = new File([blob], 'sample_student_passport.svg', { type: 'image/svg+xml' });
    handleFileSelect(file);
  };

  return (
    <div id="exam-image-resizer-tool" className="space-y-6">
      
      {/* Tool Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border bg-white border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-sky-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Zero-Upload Privacy Compression</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Exam-Ready Image Resizer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Client-side canvas compression for UPSC, GATE, JEE, NEET, and university application portals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Controls on Left, Live Preview & Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upload & Compression Controls (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Drag & Drop Upload Zone */}
          <div
            id="image-drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 sm:p-7 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-sky-500 bg-sky-50/50'
                : 'border-slate-300 hover:border-sky-500 bg-white hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 rounded-full bg-slate-100 text-sky-600">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedFile ? (
                    <span className="text-sky-600 truncate max-w-xs block">{selectedFile.name}</span>
                  ) : (
                    'Click to upload or drag & drop photo'
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports JPG, PNG, WEBP up to 25MB
                </p>
              </div>

              {!selectedFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSampleImage();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 text-slate-700 border border-slate-200 transition-all duration-200 ease-out active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Try with Specimen Sample</span>
                </button>
              )}
            </div>
          </div>

          {/* Compression Configuration Card */}
          <div className="p-5 sm:p-6 rounded-2xl border bg-white border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Target File Size & Dimensions
            </h3>

            {/* Target Size Preset Selection */}
            <div className="space-y-2">
              <label htmlFor="target-size-preset-select" className="text-xs sm:text-sm font-medium text-slate-700">
                Target Size Constraint
              </label>
              
              <select
                id="target-size-preset-select"
                value={config.sizePreset}
                onChange={(e) => handlePresetSizeChange(e.target.value as ImageSizePreset)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
              >
                <option value="20kb">&lt; 20 KB (Strict UPSC / SSC Signature)</option>
                <option value="50kb">&lt; 50 KB (Standard JEE / NEET / GATE Photo)</option>
                <option value="100kb">&lt; 100 KB (University Exam Portals)</option>
                <option value="200kb">&lt; 200 KB (General Document Uploads)</option>
                <option value="500kb">&lt; 500 KB (High-Res ID Proofs)</option>
                <option value="custom">Custom KB Limit</option>
              </select>

              {/* Quick Size Pill Buttons */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {(['20kb', '50kb', '100kb', '200kb', 'custom'] as ImageSizePreset[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetSizeChange(preset)}
                    className={`py-1.5 px-1 rounded-xl text-xs font-medium text-center transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
                      config.sizePreset === preset
                        ? 'bg-sky-500 text-white font-semibold shadow-sm border border-sky-500'
                        : 'bg-white text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 border border-slate-200'
                    }`}
                  >
                    {preset === 'custom' ? 'Custom' : `<${preset.replace('kb', 'KB')}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom KB Input if Custom is selected */}
            {config.sizePreset === 'custom' && (
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label htmlFor="custom-kb-input" className="text-xs font-medium text-slate-700">
                    Custom Target Max Size (KB)
                  </label>
                  <span className="text-xs font-bold text-sky-600">
                    {config.targetSizeKb} KB
                  </span>
                </div>
                <input
                  id="custom-kb-input"
                  type="number"
                  min="5"
                  max="5000"
                  value={config.targetSizeKb}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      targetSizeKb: Math.max(5, parseInt(e.target.value, 10) || 50),
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  placeholder="e.g. 45"
                />
              </div>
            )}

            {/* Dimension Preset Selection */}
            <div className="space-y-2">
              <label htmlFor="dimension-preset-select" className="text-xs sm:text-sm font-medium text-slate-700">
                Exam Dimension Standard
              </label>
              <select
                id="dimension-preset-select"
                value={config.dimensionPreset}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    dimensionPreset: e.target.value as DimensionPreset,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
              >
                <option value="original">Original Aspect & Dimensions</option>
                <option value="passport_in">Indian Passport Photo (3.5cm x 4.5cm / 350x450px)</option>
                <option value="signature_in">Official Exam Signature (3.5cm x 1.5cm / 280x120px)</option>
                <option value="ssc_gate">SSC / GATE Standard (200x230px)</option>
                <option value="custom">Custom Width & Height (px)</option>
              </select>
            </div>

            {/* Custom Width & Height when custom is active */}
            {config.dimensionPreset === 'custom' && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-1">
                  <label htmlFor="custom-width-input" className="text-[11px] font-medium text-slate-600">Width (px)</label>
                  <input
                    id="custom-width-input"
                    type="number"
                    value={config.customWidth}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        customWidth: parseInt(e.target.value, 10) || 300,
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="custom-height-input" className="text-[11px] font-medium text-slate-600">Height (px)</label>
                  <input
                    id="custom-height-input"
                    type="number"
                    value={config.customHeight}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        customHeight: parseInt(e.target.value, 10) || 400,
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            {/* Output Format selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 block">
                Output File Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/jpeg', label: 'JPG / JPEG' },
                  { id: 'image/png', label: 'PNG' },
                  { id: 'image/webp', label: 'WEBP' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setConfig((prev) => ({ ...prev, format: fmt.id as any }))}
                    className={`py-2 px-2 rounded-xl text-xs font-medium transition-all duration-200 ease-out active:scale-95 cursor-pointer ${
                      config.format === fmt.id
                        ? 'bg-sky-500 text-white border border-sky-500 font-semibold shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Side-by-Side Comparison & Instant Download (7 Columns) */}
        <div className="lg:col-span-7 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {result ? (
            <div className="p-5 sm:p-6 rounded-2xl border bg-white border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-600" />
                  Compressed Output Preview
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {result.compressedSizeKb <= config.targetSizeKb ? 'Target Met' : 'Optimized'} ({result.timeTakenMs}ms)
                </span>
              </div>

              {/* Side-by-Side Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Original Image Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Original Source
                  </span>
                  <div className="w-full h-48 bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-200">
                    <img
                      src={result.originalUrl}
                      alt="Original specimen"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="w-full space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Size:</span>
                      <strong className="text-slate-900 font-semibold">{result.originalSizeKb} KB</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Dimensions:</span>
                      <strong className="text-slate-900 font-semibold">{result.originalWidth} × {result.originalHeight} px</strong>
                    </div>
                  </div>
                </div>

                {/* Compressed Target Output Card */}
                <div className="p-3.5 rounded-xl bg-sky-50/40 border border-sky-200 flex flex-col items-center text-center space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Exam-Ready Result
                  </span>
                  <div className="w-full h-48 bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 border border-sky-100">
                    <img
                      src={result.compressedUrl}
                      alt="Compressed output"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="w-full space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Result Size:</span>
                      <strong className="text-sky-600 font-bold text-sm">{result.compressedSizeKb} KB</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Dimensions:</span>
                      <strong className="text-slate-900 font-semibold">{result.compressedWidth} × {result.compressedHeight} px</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compression Ratio & Performance Summary Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-medium">
                    Size Reduction Efficiency
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-600">
                    -{result.compressionRatio}% Saved
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-medium">
                    Format & Duration
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-700">
                    {result.format} • {result.timeTakenMs} ms
                  </div>
                </div>
              </div>

              {/* Dynamic Instant Download Button */}
              <button
                id="download-compressed-image-btn"
                onClick={handleDownload}
                className="w-full py-3.5 px-6 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all duration-200 ease-out active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Exam-Ready Image ({result.compressedSizeKb} KB)</span>
              </button>
            </div>
          ) : (
            /* Placeholder State before upload */
            <div className="p-8 sm:p-12 rounded-2xl border bg-white border-slate-200 text-center space-y-4 flex flex-col items-center justify-center min-h-[400px] shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                <ImageIcon className="w-7 h-7" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  No Image Selected Yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Upload your passport photograph or signature on the left. The browser will instantly compress and format it to your exact KB limit without compromising critical visual clarity.
                </p>
              </div>

              <button
                onClick={loadSampleImage}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 text-slate-700 border border-slate-200 text-xs font-semibold transition-all duration-200 ease-out active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Load Specimen Photo To Test Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
