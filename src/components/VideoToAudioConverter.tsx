import React, { useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import {
  AlertCircle,
  AudioLines,
  CheckCircle2,
  Download,
  FileVideo,
  Info,
  LoaderCircle,
  Music,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react';

type OutputFormat = 'mp3' | 'wav';

const MAX_INPUT_BYTES = 50 * 1024 * 1024;
const CORE_VERSION = '0.12.10';
const CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
const SUPPORTED_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'mpeg', 'mpg']);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function fileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

function safeBaseName(name: string): string {
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'video-audio';
}

async function downloadAsBlobUrl(url: string, contentType: string): Promise<string> {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error('The conversion engine could not be downloaded. Check your connection and try again.');
  }
  return URL.createObjectURL(new Blob([await response.arrayBuffer()], { type: contentType }));
}

export const VideoToAudioConverter: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const enginePromiseRef = useRef<Promise<FFmpeg> | null>(null);
  const engineAssetUrlsRef = useRef<string[]>([]);
  const conversionActiveRef = useRef(false);
  const cancelRequestedRef = useRef(false);
  const recentLogsRef = useRef('');

  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>('mp3');
  const [isDragging, setIsDragging] = useState(false);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Choose a video to get started.');
  const [errorMessage, setErrorMessage] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [outputName, setOutputName] = useState('');
  const [outputSize, setOutputSize] = useState(0);

  const revokeEngineAssets = () => {
    engineAssetUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    engineAssetUrlsRef.current = [];
  };

  useEffect(() => {
    return () => {
      ffmpegRef.current?.terminate();
      ffmpegRef.current = null;
      revokeEngineAssets();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const ensureEngine = async (): Promise<FFmpeg> => {
    if (ffmpegRef.current) return ffmpegRef.current;
    if (enginePromiseRef.current) return enginePromiseRef.current;

    setIsEngineLoading(true);
    setStatusMessage('Loading the conversion engine. The first load may take a little while.');
    setErrorMessage('');

    const promise = (async () => {
      let engine: FFmpeg | null = null;
      try {
        const coreUrl = await downloadAsBlobUrl(CORE_BASE_URL + '/ffmpeg-core.js', 'text/javascript');
        engineAssetUrlsRef.current.push(coreUrl);
        const wasmUrl = await downloadAsBlobUrl(CORE_BASE_URL + '/ffmpeg-core.wasm', 'application/wasm');
        engineAssetUrlsRef.current.push(wasmUrl);

        engine = new FFmpeg();
        engine.on('log', ({ message }) => {
          recentLogsRef.current = (recentLogsRef.current + '\n' + message).slice(-8000);
        });
        engine.on('progress', ({ progress: ffmpegProgress }) => {
          if (!conversionActiveRef.current || !Number.isFinite(ffmpegProgress)) return;
          if (ffmpegProgress >= 0 && ffmpegProgress <= 1) {
            setProgress(Math.max(0, Math.min(98, Math.round(ffmpegProgress * 100))));
          }
        });

        await engine.load({ coreURL: coreUrl, wasmURL: wasmUrl });
        ffmpegRef.current = engine;
        return engine;
      } catch (error) {
        engine?.terminate();
        revokeEngineAssets();
        throw error;
      }
    })();

    enginePromiseRef.current = promise;
    try {
      return await promise;
    } finally {
      if (enginePromiseRef.current === promise) enginePromiseRef.current = null;
      setIsEngineLoading(false);
    }
  };

  const handleFile = (candidate?: File) => {
    if (!candidate) return;
    setErrorMessage('');
    setOutputUrl('');
    setOutputName('');
    setOutputSize(0);
    setProgress(0);

    const extension = fileExtension(candidate.name);
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      setFile(null);
      setStatusMessage('Choose a supported video file.');
      setErrorMessage('Try MP4, WebM, MOV, MKV, AVI, M4V, MPEG, or MPG.');
      return;
    }
    if (candidate.size <= 0) {
      setFile(null);
      setErrorMessage('This file appears to be empty. Choose another video.');
      return;
    }
    if (candidate.size > MAX_INPUT_BYTES) {
      setFile(null);
      setStatusMessage('The selected video is too large.');
      setErrorMessage('For reliable browser processing, this tool currently accepts files up to 50 MB.');
      return;
    }

    setFile(candidate);
    setStatusMessage('Video selected. Choose an output format and start conversion.');
  };

  const cancelConversion = () => {
    cancelRequestedRef.current = true;
    conversionActiveRef.current = false;
    const engine = ffmpegRef.current;
    if (engine) {
      engine.terminate();
      ffmpegRef.current = null;
      revokeEngineAssets();
    }
    setIsConverting(false);
    setProgress(0);
    setStatusMessage('Conversion cancelled. Your original video has not been changed.');
  };

  const resetSelection = () => {
    setFile(null);
    setOutputUrl('');
    setOutputName('');
    setOutputSize(0);
    setErrorMessage('');
    setProgress(0);
    setStatusMessage('Choose a video to get started.');
    setIsDragging(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const convertFile = async () => {
    if (!file || conversionActiveRef.current) return;

    cancelRequestedRef.current = false;
    conversionActiveRef.current = true;
    recentLogsRef.current = '';
    setIsConverting(true);
    setErrorMessage('');
    setOutputUrl('');
    setOutputName('');
    setOutputSize(0);
    setProgress(0);
    setStatusMessage('Preparing local conversion...');

    const extension = fileExtension(file.name);
    const inputName = 'input.' + extension;
    const outputFileName = 'converted-audio.' + format;
    let engine: FFmpeg | null = null;

    try {
      engine = await ensureEngine();
      if (cancelRequestedRef.current) return;

      setStatusMessage('Reading your video into browser memory...');
      await engine.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
      if (cancelRequestedRef.current) return;

      setStatusMessage('Extracting and encoding audio locally...');
      const args = [
        '-hide_banner', '-y',
        '-i', inputName,
        '-map', '0:a:0',
        '-vn', '-sn', '-dn',
      ];
      if (format === 'mp3') {
        args.push('-codec:a', 'libmp3lame', '-q:a', '2');
      } else {
        args.push('-c:a', 'pcm_s16le');
      }
      args.push(outputFileName);

      const exitCode = await engine.exec(args);
      if (cancelRequestedRef.current) return;
      if (exitCode !== 0) throw new Error('FFmpeg could not extract audio from this file.');

      const outputData = await engine.readFile(outputFileName);
      if (cancelRequestedRef.current) return;
      if (typeof outputData === 'string' || outputData.byteLength === 0) {
        throw new Error('The converter did not produce an audio file.');
      }

      const bytes = new Uint8Array(outputData);
      const audioBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
      const blobUrl = URL.createObjectURL(new Blob([audioBuffer], { type: mimeType }));

      setOutputUrl(blobUrl);
      setOutputName(safeBaseName(file.name) + '.' + format);
      setOutputSize(bytes.byteLength);
      setProgress(100);
      setStatusMessage('Your audio file is ready to download.');
    } catch (error) {
      if (cancelRequestedRef.current) {
        setStatusMessage('Conversion cancelled. Your original video has not been changed.');
      } else {
        const logs = recentLogsRef.current;
        if (/matches no streams|does not contain any stream|no audio stream|Stream map.*matches no streams/i.test(logs)) {
          setErrorMessage('No audio track was found in this video. Choose a video that contains sound.');
        } else if (error instanceof Error && /conversion engine could not be downloaded/i.test(error.message)) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Conversion failed. The file may be damaged or use an unsupported codec. Try another video.');
        }
        setStatusMessage('The audio could not be created.');
      }
    } finally {
      if (engine) {
        try { await engine.deleteFile(inputName); } catch { /* File may be absent or the worker may have stopped. */ }
        try { await engine.deleteFile(outputFileName); } catch { /* Output may be absent. */ }
      }
      conversionActiveRef.current = false;
      setIsConverting(false);
    }
  };

  const chooseFormat = (nextFormat: OutputFormat) => {
    setFormat(nextFormat);
    setOutputUrl('');
    setOutputName('');
    setOutputSize(0);
    setErrorMessage('');
    setProgress(0);
    if (file) setStatusMessage('Ready to convert to ' + nextFormat.toUpperCase() + '.');
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700">
          <AudioLines className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Browser-based media tool</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Video to MP3 Converter</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Extract the audio from a video and save it as MP3 or WAV. Your video is processed on this device, not uploaded to a conversion server.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Local processing
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">1. Choose a video</h2>
            {file && !isConverting && <button type="button" onClick={resetSelection} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"><X className="h-3.5 w-3.5" aria-hidden="true" />Remove file</button>}
          </div>

          {!file ? (
            <div
              onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
              onDrop={(event) => { event.preventDefault(); setIsDragging(false); handleFile(event.dataTransfer.files?.[0]); }}
              className={'mt-4 flex min-h-56 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ' + (isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50')}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm"><UploadCloud className="h-6 w-6" aria-hidden="true" /></div>
              <p className="mt-4 text-sm font-bold text-slate-900">Drag and drop your video here</p>
              <p className="mt-1 text-xs text-slate-500">or choose a file from your device</p>
              <label htmlFor="naa-video-audio-input" className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                <FileVideo className="h-4 w-4" aria-hidden="true" /> Choose video
                <input ref={inputRef} id="naa-video-audio-input" type="file" accept="video/*,.mp4,.webm,.mov,.mkv,.avi,.m4v,.mpeg,.mpg" className="sr-only" onChange={(event) => { handleFile(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }} />
              </label>
              <p className="mt-4 text-[11px] text-slate-500">MP4, WebM, MOV, MKV, AVI, M4V · Up to 50 MB</p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700"><FileVideo className="h-5 w-5" aria-hidden="true" /></div>
              <div className="min-w-0 flex-1"><p className="break-all text-sm font-bold text-slate-900">{file.name}</p><p className="mt-1 text-xs text-slate-600">{formatBytes(file.size)} · {fileExtension(file.name).toUpperCase()} video</p></div>
              <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />File selected</span>
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="text-base font-bold text-slate-900">2. Choose an audio format</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => chooseFormat('mp3')} disabled={isConverting} aria-pressed={format === 'mp3'} className={'flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ' + (format === 'mp3' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:border-blue-300')}>
                <span className={'mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg ' + (format === 'mp3' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600')}><Music className="h-4 w-4" aria-hidden="true" /></span>
                <span><span className="block text-sm font-bold text-slate-900">MP3</span><span className="mt-1 block text-xs leading-5 text-slate-600">Compressed audio for everyday listening.</span></span>
              </button>
              <button type="button" onClick={() => chooseFormat('wav')} disabled={isConverting} aria-pressed={format === 'wav'} className={'flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ' + (format === 'wav' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:border-blue-300')}>
                <span className={'mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg ' + (format === 'wav' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600')}><AudioLines className="h-4 w-4" aria-hidden="true" /></span>
                <span><span className="block text-sm font-bold text-slate-900">WAV</span><span className="mt-1 block text-xs leading-5 text-slate-600">Uncompressed PCM audio; the file may be larger.</span></span>
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="text-base font-bold text-slate-900">3. Convert and download</h2>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <button type="button" onClick={convertFile} disabled={!file || isConverting || isEngineLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">
                {isConverting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <AudioLines className="h-4 w-4" aria-hidden="true" />}
                {isEngineLoading ? 'Loading engine…' : isConverting ? 'Converting…' : 'Convert to ' + format.toUpperCase()}
              </button>
              {isConverting && !isEngineLoading && <button type="button" onClick={cancelConversion} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel conversion</button>}
              {outputUrl && <a href={outputUrl} download={outputName} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"><Download className="h-4 w-4" aria-hidden="true" />Download {format.toUpperCase()}</a>}
              {outputUrl && <button type="button" onClick={resetSelection} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RotateCcw className="h-4 w-4" aria-hidden="true" />Convert another</button>}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5" aria-live="polite">
              <div className="flex items-start gap-2.5">
                {outputUrl ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" /> : errorMessage ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" /> : isConverting ? <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-blue-600" aria-hidden="true" /> : <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">{statusMessage}</p>
                  {isConverting && !isEngineLoading && <div className="mt-2.5"><div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Audio conversion progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-full bg-blue-600 transition-[width] duration-200" style={{ width: progress > 0 ? progress + '%' : '12%' }} /></div><p className="mt-1.5 text-[11px] text-slate-500">{progress > 0 ? progress + '% reported by FFmpeg' : 'Converting locally…'}</p></div>}
                  {outputUrl && <p className="mt-1 text-xs text-slate-600">{outputName} · {formatBytes(outputSize)}</p>}
                  {errorMessage && <p className="mt-1.5 text-xs leading-5 text-rose-700">{errorMessage}</p>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4"><div className="flex items-start gap-2.5"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" /><div><h2 className="text-sm font-bold text-emerald-950">Your video stays on your device</h2><p className="mt-1.5 text-xs leading-5 text-emerald-900">The selected media is processed in your browser and is not uploaded to a conversion server. The FFmpeg engine is downloaded separately from a public CDN.</p></div></div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold text-slate-900">Before you convert</h2><ul className="mt-3 space-y-2.5 text-xs leading-5 text-slate-600"><li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />Files up to 50 MB are accepted.</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />The first conversion downloads the FFmpeg engine.</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />Speed depends on the video, browser, and device memory.</li><li className="flex gap-2"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />Unsupported codecs and videos without audio may fail.</li></ul></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold text-slate-900">Supported video types</h2><p className="mt-2 text-xs leading-5 text-slate-600">MP4, WebM, MOV, MKV, AVI, M4V, MPEG and MPG are accepted by extension. Actual support depends on the codecs inside the file.</p><p className="mt-2 text-xs leading-5 text-slate-500">DRM-protected videos are not supported. Keep this tab open while the conversion runs.</p></section>
        </aside>
      </div>
    </div>
  );
};

export default VideoToAudioConverter;
