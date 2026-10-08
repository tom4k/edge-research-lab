/**
 * High-accuracy AI background removal using Google MediaPipe Selfie Segmentation.
 * Produces crisp, studio-grade portrait cutouts with hair, face, and clothing preserved,
 * completely eliminating studio gradients, wall textures, and background objects.
 */

let segmenterInstance: any = null;
let segmenterInitPromise: Promise<any> | null = null;
let globalTimestamp = 1000;
let queuePromise = Promise.resolve();

async function getSegmenter(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('SelfieSegmentation is only available in the browser');
  }

  if (segmenterInstance) {
    return segmenterInstance;
  }

  if (!segmenterInitPromise) {
    segmenterInitPromise = (async () => {
      const { SelfieSegmentation } = await import('@mediapipe/selfie_segmentation');
      const segmenter = new SelfieSegmentation({
        locateFile: (file: string) => `/mediapipe/${file}`
      });

      segmenter.setOptions({
        modelSelection: 1 // 1 = landscape/high-detail model
      });

      await segmenter.initialize();
      segmenterInstance = segmenter;
      return segmenter;
    })();
  }

  return segmenterInitPromise;
}

export async function removeBackgroundFromImage(
  source: string | File | Blob
): Promise<{ dataUrl: string; blob: Blob }> {
  if (typeof window === 'undefined') {
    throw new Error('Background removal must be run on the client');
  }

  // Queue calls sequentially to guarantee monotonic timestamps for MediaPipe graph
  return new Promise((resolve, reject) => {
    queuePromise = queuePromise.then(async () => {
      try {
        const result = await processSingleImage(source);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function processSingleImage(
  source: string | File | Blob
): Promise<{ dataUrl: string; blob: Blob }> {
  let objectUrlToRevoke: string | null = null;
  let url: string;

  if (typeof source === 'string') {
    url = source;
  } else {
    url = URL.createObjectURL(source);
    objectUrlToRevoke = url;
  }

  try {
    // 1. Load image
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => {
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.onerror = () => reject(new Error('Failed to load image for processing'));
        fallback.src = url;
      };
      el.src = url;
    });

    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    // Constrain maximum dimension for optimal speed and crisp profile presentation
    const maxDim = 800;
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
    if (!sCtx) throw new Error('Could not create source canvas context');
    sCtx.drawImage(img, 0, 0, width, height);

    // 2. Run MediaPipe AI Selfie Segmentation
    const segmenter = await getSegmenter();

    const maskCanvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MediaPipe segmentation timed out'));
      }, 12000);

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
          mCtx.drawImage(results.segmentationMask, 0, 0, width, height);
          resolve(mCanvas);
        } catch (err) {
          reject(err);
        }
      });

      // Strict monotonically increasing timestamp
      globalTimestamp += 100;
      segmenter.send({ image: sourceCanvas }, globalTimestamp).catch((err: any) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // 3. Process mask and composite
    const sourceData = sCtx.getImageData(0, 0, width, height);
    const mCtx = maskCanvas.getContext('2d');
    const maskData = mCtx?.getImageData(0, 0, width, height);

    if (!maskData) {
      throw new Error('Could not obtain mask pixel data');
    }

    const sPix = sourceData.data;
    const mPix = maskData.data;
    const totalPixels = width * height;

    // Step A: Binary foreground based on red channel confidence
    const isForeground = new Uint8Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      if (mPix[i * 4] > 60) {
        isForeground[i] = 1;
      }
    }

    // Step B: Despeckle filter to remove small floating artifacts (< 350px)
    const visitedComp = new Uint8Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      if (isForeground[i] && !visitedComp[i]) {
        const comp: number[] = [];
        const q: number[] = [i];
        visitedComp[i] = 1;
        let qHead = 0;

        while (qHead < q.length) {
          const curr = q[qHead++];
          comp.push(curr);
          const cx = curr % width;
          const cy = (curr / width) | 0;

          const nbrs = [
            cx > 0 ? curr - 1 : -1,
            cx < width - 1 ? curr + 1 : -1,
            cy > 0 ? curr - width : -1,
            cy < height - 1 ? curr + width : -1
          ];

          for (const n of nbrs) {
            if (n >= 0 && isForeground[n] && !visitedComp[n]) {
              visitedComp[n] = 1;
              q.push(n);
            }
          }
        }

        if (comp.length < 350) {
          for (const p of comp) {
            isForeground[p] = 0;
          }
        }
      }
    }

    // Step C: BFS flood fill from outer borders to identify true exterior background
    const isExteriorBg = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels);
    let head = 0;
    let tail = 0;

    // Seed top border
    for (let x = 0; x < width; x++) {
      if (!isForeground[x]) {
        isExteriorBg[x] = 1;
        queue[tail++] = x;
      }
    }

    // Seed upper side borders (upper 70% where background surrounds shoulders & head)
    const sideLimit = Math.round(height * 0.7);
    for (let y = 0; y < sideLimit; y++) {
      const lIdx = y * width;
      if (!isForeground[lIdx] && !isExteriorBg[lIdx]) {
        isExteriorBg[lIdx] = 1;
        queue[tail++] = lIdx;
      }
      const rIdx = y * width + (width - 1);
      if (!isForeground[rIdx] && !isExteriorBg[rIdx]) {
        isExteriorBg[rIdx] = 1;
        queue[tail++] = rIdx;
      }
    }

    while (head < tail) {
      const p = queue[head++];
      const px = p % width;
      const py = (p / width) | 0;

      const neighbors = [
        px > 0 ? p - 1 : -1,
        px < width - 1 ? p + 1 : -1,
        py > 0 ? p - width : -1,
        py < height - 1 ? p + width : -1
      ];

      for (const n of neighbors) {
        if (n >= 0 && !isForeground[n] && !isExteriorBg[n]) {
          isExteriorBg[n] = 1;
          queue[tail++] = n;
        }
      }
    }

    // Step D: Apply alpha transparency and feathered edges
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      if (isExteriorBg[i]) {
        sPix[idx + 3] = 0;
      } else {
        const conf = mPix[idx];
        if (conf > 25 && conf < 180) {
          sPix[idx + 3] = Math.round(sPix[idx + 3] * (conf / 180));
        } else {
          sPix[idx + 3] = 255;
        }
      }
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = width;
    finalCanvas.height = height;
    const fCtx = finalCanvas.getContext('2d');
    if (!fCtx) throw new Error('Could not create final canvas context');
    fCtx.putImageData(sourceData, 0, 0);

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
