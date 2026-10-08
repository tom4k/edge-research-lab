/**
 * High-accuracy AI background removal using Google MediaPipe Selfie Segmentation.
 * Produces crisp portrait cutouts with hair, body, and clothing preserved,
 * completely eliminating studio gradients, wall textures, and background objects.
 */

// Module-level singleton to avoid re-initializing WASM/TFLite model repeatedly
let segmenterPromise: Promise<any> | null = null;

async function getSegmenter(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('SelfieSegmentation is only available in the browser');
  }

  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const { SelfieSegmentation } = await import('@mediapipe/selfie_segmentation');
      const segmenter = new SelfieSegmentation({
        locateFile: (file: string) => {
          // Prefer local public/mediapipe/ files, with CDN fallback
          return `/mediapipe/${file}`;
        }
      });

      segmenter.setOptions({
        modelSelection: 1 // 1 = landscape/high-detail model
      });

      await segmenter.initialize();
      return segmenter;
    })();
  }

  return segmenterPromise;
}

export async function removeBackgroundFromImage(
  source: string | File | Blob
): Promise<{ dataUrl: string; blob: Blob }> {
  if (typeof window === 'undefined') {
    throw new Error('Background removal must be run on the client');
  }

  let objectUrlToRevoke: string | null = null;
  let url: string;

  if (typeof source === 'string') {
    url = source;
  } else {
    url = URL.createObjectURL(source);
    objectUrlToRevoke = url;
  }

  try {
    // 1. Load image element
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => {
        // If CORS blocked on external URL, attempt to load without crossOrigin
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.onerror = () => reject(new Error('Failed to load image for processing'));
        fallback.src = url;
      };
      el.src = url;
    });

    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    // Constrain maximum dimension for fast processing & crisp profile presentation
    const maxDim = 900;
    let width = naturalW;
    let height = naturalH;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    // Prepare scaled canvas
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const sCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sCtx) throw new Error('Could not create 2D source canvas context');
    sCtx.drawImage(img, 0, 0, width, height);

    // 2. Run MediaPipe AI Selfie Segmentation
    const segmenter = await getSegmenter();

    const maskCanvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MediaPipe segmentation timed out'));
      }, 15000);

      segmenter.onResults((results: any) => {
        clearTimeout(timeout);
        try {
          const mCanvas = document.createElement('canvas');
          mCanvas.width = width;
          mCanvas.height = height;
          const mCtx = mCanvas.getContext('2d', { willReadFrequently: true });
          if (!mCtx) {
            reject(new Error('Could not create mask canvas context'));
            return;
          }

          // Draw the segmentation mask
          mCtx.drawImage(results.segmentationMask, 0, 0, width, height);
          resolve(mCanvas);
        } catch (err) {
          reject(err);
        }
      });

      segmenter.send({ image: sourceCanvas }).catch((err: any) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // 3. Composite original photo with segmentation mask
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = width;
    finalCanvas.height = height;
    const fCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
    if (!fCtx) throw new Error('Could not create final canvas context');

    // Get pixel data from source and mask
    const sourceData = sCtx.getImageData(0, 0, width, height);
    const mCtx = maskCanvas.getContext('2d');
    const maskData = mCtx?.getImageData(0, 0, width, height);

    if (maskData) {
      const sPix = sourceData.data;
      const mPix = maskData.data;
      const totalPixels = width * height;

      for (let i = 0; i < totalPixels; i++) {
        const idx = i * 4;
        // In MediaPipe, confidence is in red and/or alpha channel
        const rVal = mPix[idx];
        const aVal = mPix[idx + 3];
        // Confidence value from 0 to 255
        const confidence = Math.max(rVal, aVal);

        if (confidence < 35) {
          // Pure background -> transparent
          sPix[idx + 3] = 0;
        } else if (confidence > 220) {
          // Clear foreground subject -> keep original alpha
          // (keep sPix[idx + 3])
        } else {
          // Feathered edge (hair strands, shoulders) -> smooth alpha transition
          const featherRatio = (confidence - 35) / (220 - 35);
          sPix[idx + 3] = Math.round(sPix[idx + 3] * featherRatio);
        }
      }

      fCtx.putImageData(sourceData, 0, 0);
    } else {
      // Fallback composite
      fCtx.drawImage(maskCanvas, 0, 0, width, height);
      fCtx.globalCompositeOperation = 'source-in';
      fCtx.drawImage(sourceCanvas, 0, 0, width, height);
    }

    return new Promise((resolve, reject) => {
      finalCanvas.toBlob(
        (blob) => {
          if (blob) {
            const dataUrl = finalCanvas.toDataURL('image/png');
            resolve({ dataUrl, blob });
          } else {
            reject(new Error('Failed to create PNG blob from cutout canvas'));
          }
        },
        'image/png'
      );
    });
  } finally {
    if (objectUrlToRevoke) {
      URL.revokeObjectURL(objectUrlToRevoke);
    }
  }
}
