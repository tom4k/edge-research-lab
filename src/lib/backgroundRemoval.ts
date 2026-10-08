/**
 * Intelligent client-side background removal utility for portrait / profile photos.
 * Detects perimeter / studio background colors and applies flood-fill alpha transparency
 * with smooth edge feathering, preserving the subject's clothing and features.
 */

export async function removeBackgroundFromImage(
  source: string | File | Blob,
  threshold = 48
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    let objectUrlToRevoke: string | null = null;
    let url: string;

    if (typeof source === 'string') {
      url = source;
    } else {
      url = URL.createObjectURL(source);
      objectUrlToRevoke = url;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Max dimension 900px for crisp profile rendering and optimal performance
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // 1. Sample 4 corners to detect background color
        const cornerIndices = [
          0, // top-left
          (width - 1) * 4, // top-right
          (width * (height - 1)) * 4, // bottom-left
          (width * height - 1) * 4 // bottom-right
        ];

        // Check if image already has transparency in corners
        let isAlreadyTransparent = false;
        for (const idx of cornerIndices) {
          if (data[idx + 3] < 30) {
            isAlreadyTransparent = true;
            break;
          }
        }

        if (!isAlreadyTransparent) {
          // Average the RGB of corner pixels
          let bgR = 0;
          let bgG = 0;
          let bgB = 0;
          let sampleCount = 0;

          for (const idx of cornerIndices) {
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
            sampleCount++;
          }

          bgR = Math.round(bgR / sampleCount);
          bgG = Math.round(bgG / sampleCount);
          bgB = Math.round(bgB / sampleCount);

          // 2. Flood-fill BFS starting from the perimeter pixels
          const visited = new Uint8Array(width * height);
          const queue = new Int32Array(width * height);
          let head = 0;
          let tail = 0;

          const colorDistance = (idx: number): number => {
            const dr = data[idx] - bgR;
            const dg = data[idx + 1] - bgG;
            const db = data[idx + 2] - bgB;
            return Math.sqrt(dr * dr + dg * dg + db * db);
          };

          // Seed the perimeter pixels (top, bottom, left, right edges)
          for (let x = 0; x < width; x++) {
            // Top edge
            let pIdx = x;
            if (!visited[pIdx] && colorDistance(pIdx * 4) <= threshold) {
              visited[pIdx] = 1;
              queue[tail++] = pIdx;
            }
            // Bottom edge
            pIdx = (height - 1) * width + x;
            if (!visited[pIdx] && colorDistance(pIdx * 4) <= threshold) {
              visited[pIdx] = 1;
              queue[tail++] = pIdx;
            }
          }

          for (let y = 0; y < height; y++) {
            // Left edge
            let pIdx = y * width;
            if (!visited[pIdx] && colorDistance(pIdx * 4) <= threshold) {
              visited[pIdx] = 1;
              queue[tail++] = pIdx;
            }
            // Right edge
            pIdx = y * width + (width - 1);
            if (!visited[pIdx] && colorDistance(pIdx * 4) <= threshold) {
              visited[pIdx] = 1;
              queue[tail++] = pIdx;
            }
          }

          const softCut = threshold * 0.7;
          const range = threshold - softCut;

          // BFS flood-fill
          while (head < tail) {
            const p = queue[head++];
            const px = p % width;
            const py = (p / width) | 0;
            const idx4 = p * 4;

            const dist = colorDistance(idx4);
            if (dist <= softCut) {
              data[idx4 + 3] = 0; // Fully transparent
            } else if (dist < threshold) {
              // Smooth feathered alpha edge
              const alphaFraction = (dist - softCut) / range;
              data[idx4 + 3] = Math.round(data[idx4 + 3] * alphaFraction);
            }

            // Check 4-connected neighbors
            const neighbors = [
              px > 0 ? p - 1 : -1,
              px < width - 1 ? p + 1 : -1,
              py > 0 ? p - width : -1,
              py < height - 1 ? p + width : -1
            ];

            for (const n of neighbors) {
              if (n >= 0 && !visited[n]) {
                const nDist = colorDistance(n * 4);
                if (nDist <= threshold) {
                  visited[n] = 1;
                  queue[tail++] = n;
                }
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
        }

        canvas.toBlob(
          (blob) => {
            if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
            if (blob) {
              const dataUrl = canvas.toDataURL('image/png');
              resolve({ dataUrl, blob });
            } else {
              reject(new Error('Failed to create Blob from canvas'));
            }
          },
          'image/png'
        );
      } catch (err) {
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      reject(new Error('Failed to load image for background removal'));
    };

    img.src = url;
  });
}
