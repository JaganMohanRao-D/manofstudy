import { ImageResizerConfig, CompressedImageResult } from '../types';

export async function compressAndResizeImage(
  file: File,
  config: ImageResizerConfig
): Promise<CompressedImageResult> {
  const startTime = performance.now();
  const originalUrl = URL.createObjectURL(file);
  const originalSizeKb = Number((file.size / 1024).toFixed(2));

  // Load image onto Image element
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = originalUrl;
  });

  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  // Determine initial base dimensions based on dimension presets
  let baseWidth = originalWidth;
  let baseHeight = originalHeight;

  if (config.dimensionPreset === 'passport_in') {
    // 3.5cm x 4.5cm standard passport (350x450 px)
    baseWidth = 350;
    baseHeight = 450;
  } else if (config.dimensionPreset === 'signature_in') {
    // 3.5cm x 1.5cm standard exam signature (280x120 px)
    baseWidth = 280;
    baseHeight = 120;
  } else if (config.dimensionPreset === 'ssc_photo') {
    // SSC Photo (3.5cm x 4.5cm / 200x230 px)
    baseWidth = 200;
    baseHeight = 230;
  } else if (config.dimensionPreset === 'ssc_signature') {
    // SSC Signature (4.0cm x 2.0cm / 140x60 px)
    baseWidth = 140;
    baseHeight = 60;
  } else if (config.dimensionPreset === 'gate_photo') {
    // GATE Photo (3.5cm x 4.5cm / 240x320 px)
    baseWidth = 240;
    baseHeight = 320;
  } else if (config.dimensionPreset === 'gate_signature') {
    // GATE Signature (160x560 px or 280x80 px standard)
    baseWidth = 280;
    baseHeight = 80;
  } else if (config.dimensionPreset === 'upsc_photo') {
    // UPSC Photo (350x350 px min)
    baseWidth = 350;
    baseHeight = 350;
  } else if (config.dimensionPreset === 'upsc_signature') {
    // UPSC Signature (350x150 px)
    baseWidth = 350;
    baseHeight = 150;
  } else if (config.dimensionPreset === 'ssc_gate') {
    // Standard SSC / GATE / UPSC exam photo (200x230 px)
    baseWidth = 200;
    baseHeight = 230;
  } else if (config.dimensionPreset === 'custom') {
    baseWidth = config.customWidth || originalWidth;
    baseHeight = config.customHeight || originalHeight;
    if (config.maintainAspectRatio) {
      const ratio = originalWidth / originalHeight;
      if (config.customWidth && !config.customHeight) {
        baseHeight = Math.round(config.customWidth / ratio);
      } else if (!config.customWidth && config.customHeight) {
        baseWidth = Math.round(config.customHeight * ratio);
      }
    }
  }

  const format = config.format || 'image/jpeg';
  // Strict target bytes with 2% safety buffer to guarantee it never exceeds target
  const targetBytes = Math.max(1024, config.targetSizeKb * 1024);
  const safeTargetBytes = targetBytes * 0.98;

  // Canvas rendering helper
  const renderToBlob = (
    w: number,
    h: number,
    quality: number,
    mimeType: string
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(20, Math.round(w));
    canvas.height = Math.max(20, Math.round(h));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Canvas 2D context could not be initialized');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // White background for JPEG to avoid black transparent edges
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate canvas image blob'));
        },
        mimeType,
        quality
      );
    });
  };

  let bestBlob: Blob | null = null;
  let finalWidth = baseWidth;
  let finalHeight = baseHeight;
  let currentScale = 1.0;

  // Deterministic iterative compression loop:
  // 1. Try quality stepping (from 0.88 down to 0.15) at current resolution
  // 2. If all exceed safeTargetBytes, scale resolution down by 15% and retry
  const maxDimensionSteps = 15;

  for (let dimStep = 0; dimStep < maxDimensionSteps; dimStep++) {
    const testW = Math.max(40, Math.round(baseWidth * currentScale));
    const testH = Math.max(40, Math.round(baseHeight * currentScale));

    if (format === 'image/png') {
      // PNG does not support lossy quality parameter, scale down canvas directly
      const testBlob = await renderToBlob(testW, testH, 1.0, 'image/png');
      if (testBlob.size <= safeTargetBytes || dimStep === maxDimensionSteps - 1) {
        bestBlob = testBlob;
        finalWidth = testW;
        finalHeight = testH;
        break;
      }
    } else {
      // For JPEG and WEBP, test quality ladder
      const qualityLadder = [0.88, 0.75, 0.60, 0.45, 0.30, 0.20, 0.12];
      let foundUnderTarget = false;

      for (const q of qualityLadder) {
        const testBlob = await renderToBlob(testW, testH, q, format);
        if (testBlob.size <= safeTargetBytes) {
          bestBlob = testBlob;
          finalWidth = testW;
          finalHeight = testH;
          foundUnderTarget = true;
          break; // Found highest quality that fits under target
        }
      }

      if (foundUnderTarget) {
        break;
      }
    }

    // Still above target threshold: reduce resolution by 15%
    currentScale *= 0.85;
  }

  // Fallback if loop finishes without finding under target
  if (!bestBlob) {
    bestBlob = await renderToBlob(finalWidth, finalHeight, 0.15, format);
  }

  const compressedSizeKb = Number((bestBlob.size / 1024).toFixed(2));
  const compressedUrl = URL.createObjectURL(bestBlob);
  const timeTakenMs = Math.round(performance.now() - startTime);
  const compressionRatio = Number(((1 - bestBlob.size / file.size) * 100).toFixed(1));

  return {
    originalFile: file,
    originalUrl,
    originalSizeKb,
    originalWidth,
    originalHeight,
    compressedBlob: bestBlob,
    compressedUrl,
    compressedSizeKb,
    compressedWidth: finalWidth,
    compressedHeight: finalHeight,
    compressionRatio: Math.max(0, compressionRatio),
    timeTakenMs,
    format: format.replace('image/', '').toUpperCase(),
  };
}

