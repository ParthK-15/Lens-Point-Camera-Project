const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const outDir = path.resolve(__dirname, '../public/assets/images');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'SumatiMasterStudio/1.0 (sach_kak@sumaticolorlab.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'SumatiMasterStudio/1.0 (sach_kak@sumaticolorlab.com)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function getWikimediaThumbUrl(fileTitle) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json`;
  const data = await fetchJson(apiUrl);
  const pages = data.query?.pages || {};
  for (const k in pages) {
    const info = pages[k].imageinfo?.[0];
    if (info && info.thumburl) {
      return info.thumburl;
    }
  }
  return null;
}

/**
 * Intelligent Studio Background Extractor:
 * - Flood fills outer perimeter
 * - Strips studio white, soft shadows, and light backgrounds
 * - Preserves camera bodies, labels, dials, buttons, and lenses 100%
 */
async function processToTransparent(inputPath, outputPath) {
  const imgInstance = sharp(inputPath);
  const metadata = await imgInstance.metadata();
  const { width, height } = metadata;

  const rawBuffer = await imgInstance.ensureAlpha().raw().toBuffer();
  const totalPixels = width * height;

  const borderSamples = [];
  for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 30))) {
    borderSamples.push(getPixel(rawBuffer, width, x, 0));
    borderSamples.push(getPixel(rawBuffer, width, x, height - 1));
  }
  for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 30))) {
    borderSamples.push(getPixel(rawBuffer, width, 0, y));
    borderSamples.push(getPixel(rawBuffer, width, width - 1, y));
  }

  function getPixel(buf, w, x, y) {
    const idx = (y * w + x) * 4;
    return [buf[idx], buf[idx + 1], buf[idx + 2]];
  }

  const avgR = borderSamples.reduce((s, p) => s + p[0], 0) / borderSamples.length;
  const avgG = borderSamples.reduce((s, p) => s + p[1], 0) / borderSamples.length;
  const avgB = borderSamples.reduce((s, p) => s + p[2], 0) / borderSamples.length;

  function colorDist(r, g, b, tr, tg, tb) {
    const dr = r - tr;
    const dg = g - tg;
    const db = b - tb;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function isBackgroundSample(r, g, b, cy, cx) {
    const dist = colorDist(r, g, b, avgR, avgG, avgB);
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    const sat = Math.max(r, g, b) - Math.min(r, g, b);

    // Border background match
    if (dist < 48) return true;

    // Pure white backdrop
    if (r > 225 && g > 225 && b > 225 && sat < 20) return true;

    // Soft drop shadow / reflective table
    if (brightness > 80 && sat < 15 && dist < 95) return true;

    return false;
  }

  const isBg = new Uint8Array(totalPixels);
  const queue = new Int32Array(totalPixels);
  let qHead = 0;
  let qTail = 0;

  function enqueue(x, y) {
    const idx = y * width + x;
    if (isBg[idx] === 0) {
      isBg[idx] = 1;
      queue[qTail++] = idx;
    }
  }

  // Seed borders
  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  // BFS strictly along background
  while (qHead < qTail) {
    const currIdx = queue[qHead++];
    const cx = currIdx % width;
    const cy = Math.floor(currIdx / width);
    const pIdx = currIdx * 4;

    const r = rawBuffer[pIdx];
    const g = rawBuffer[pIdx + 1];
    const b = rawBuffer[pIdx + 2];

    if (isBackgroundSample(r, g, b, cy, cx)) {
      rawBuffer[pIdx + 3] = 0; // Make transparent

      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (isBg[nIdx] === 0) {
            isBg[nIdx] = 1;
            queue[qTail++] = nIdx;
          }
        }
      }
    }
  }

  // Anti-aliasing feathering
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const pIdx = idx * 4;
      if (rawBuffer[pIdx + 3] > 0) {
        const topA = rawBuffer[((y - 1) * width + x) * 4 + 3];
        const botA = rawBuffer[((y + 1) * width + x) * 4 + 3];
        const leftA = rawBuffer[(y * width + (x - 1)) * 4 + 3];
        const rightA = rawBuffer[(y * width + (x + 1)) * 4 + 3];

        if (topA === 0 || botA === 0 || leftA === 0 || rightA === 0) {
          const r = rawBuffer[pIdx];
          const g = rawBuffer[pIdx + 1];
          const b = rawBuffer[pIdx + 2];
          const brightness = (r + g + b) / 3;
          if (brightness > 120) {
            rawBuffer[pIdx + 3] = Math.max(0, Math.round(255 * (1 - (brightness - 120) / 135)));
          }
        }
      }
    }
  }

  // Trim and center on 1000x1000 square
  const trimmed = await sharp(rawBuffer, {
    raw: { width, height, channels: 4 }
  })
  .trim()
  .toBuffer({ resolveWithObject: true });

  const { width: tW, height: tH } = trimmed.info;
  const targetSize = 1000;
  const padding = 50;
  const maxDim = targetSize - (padding * 2);

  const scale = Math.min(maxDim / tW, maxDim / tH, 1.0);
  const fitW = Math.max(1, Math.round(tW * scale));
  const fitH = Math.max(1, Math.round(tH * scale));

  const resizedPng = await sharp(trimmed.data, {
    raw: { width: tW, height: tH, channels: 4 }
  })
  .resize(fitW, fitH, { kernel: sharp.kernel.lanczos3, fit: 'inside' })
  .png()
  .toBuffer();

  const left = Math.round((targetSize - fitW) / 2);
  const top = Math.round((targetSize - fitH) / 2);

  await sharp({
    create: {
      width: targetSize,
      height: targetSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: resizedPng,
    left: Math.max(0, left),
    top: Math.max(0, top)
  }])
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

  console.log(`[MASTER OK] ${outputPath}`);
}

const cameraCatalog = [
  // 1. Nikon D3500
  {
    slug: 'nikon-d3500',
    angles: [
      { num: 1, fileTitle: 'File:Nikon D3500 28 Nov 2018a.jpg' },
      { num: 2, fileTitle: 'File:Nikon D3500 28 Nov 2018b.jpg' },
      { num: 3, fileTitle: 'File:Nikon D3500 (crop filter retouch).jpg' },
      { num: 4, fileTitle: 'File:Nikon D3500.jpg' }
    ]
  },
  // 2. Nikon D5600
  {
    slug: 'nikon-d5600',
    angles: [
      { num: 1, fileTitle: 'File:Nikon D5600 Front (cutout etc).jpg' },
      { num: 2, fileTitle: 'File:Nikon D5600 back side.jpg' },
      { num: 3, fileTitle: 'File:Nikon D5600 1 2017-03-13.jpg' },
      { num: 4, fileTitle: 'File:Nikon D5600 left side.jpg' }
    ]
  },
  // 3. Nikon D7200
  {
    slug: 'nikon-d7200',
    angles: [
      { num: 1, fileTitle: 'File:2024 Nikon D7200.jpg' },
      { num: 2, fileTitle: 'File:Nikon D7200 01-2016 img3 body rear.jpg' },
      { num: 3, fileTitle: 'File:2024 Nikon D7200.jpg' },
      { num: 4, fileTitle: 'File:Nikon D7200 01-2016 img3 body rear.jpg' }
    ]
  },
  // 4. Nikon D7500
  {
    slug: 'nikon-d7500',
    angles: [
      { num: 1, fileTitle: 'File:Nikon D7500 with AF-S DX 18-140mm VR - by ato.jpg' },
      { num: 2, fileTitle: 'File:Nikon D7500 screen - by ato.jpg' },
      { num: 3, fileTitle: 'File:Nikon D7500 with AF-S DX 18-140mm VR top in - by ato.jpg' },
      { num: 4, fileTitle: 'File:Nikon D7500 with AF-S DX 18-140mm VR - side 01 - by ato.jpg' }
    ]
  },
  // 5. Nikon D750
  {
    slug: 'nikon-d750',
    angles: [
      { num: 1, fileTitle: 'File:Nikon d750 cap on.jpg' },
      { num: 2, fileTitle: 'File:Nikon d750 cap off.jpg' },
      { num: 3, fileTitle: 'File:Nikon D750 (19356951296).jpg' },
      { num: 4, fileTitle: 'File:Nikon d750 cap on.jpg' }
    ]
  },
  // 6. Nikon D500
  {
    slug: 'nikon-d500',
    angles: [
      { num: 1, fileTitle: 'File:Nikon D500 front 2016 Nikon Museum.jpg' },
      { num: 2, fileTitle: 'File:Nikon D500 front-left 2016 Nikon Museum.jpg' },
      { num: 3, fileTitle: 'File:Nikon D500 magnesium-alloy carbon chassis front-right 2016 China P&E.jpg' },
      { num: 4, fileTitle: 'File:Nikon D500 magnesium-alloy carbon chassis front-left 2016 China P&E.jpg' }
    ]
  },
  // 7. Nikon D850
  {
    slug: 'nikon-d850',
    angles: [
      { num: 1, fileTitle: 'File:Nikon DSLR camera D850.jpg' },
      { num: 2, fileTitle: 'File:Nikon DSLR camera D850 lateral rear view.jpg' },
      { num: 3, fileTitle: 'File:Nikon D850 digital single-lens reflex camera.jpg' },
      { num: 4, fileTitle: 'File:Nikon D850 Anschluss USB HDMI.jpg' }
    ]
  }
];

async function run() {
  const tempDir = path.join(outDir, 'master_temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  console.log('Building Master Transparent Collection for all cameras...');

  for (const cam of cameraCatalog) {
    console.log(`\n=== Camera: ${cam.slug} ===`);
    for (const a of cam.angles) {
      const outPath = path.join(outDir, `${cam.slug}-${a.num}_nobg.png`);
      const tempPath = path.join(tempDir, `${cam.slug}-${a.num}.jpg`);
      try {
        const thumb = await getWikimediaThumbUrl(a.fileTitle);
        if (thumb) {
          await downloadImage(thumb, tempPath);
          await processToTransparent(tempPath, outPath);
        }
      } catch (e) {
        console.error(`Error on ${cam.slug} angle ${a.num}:`, e.message);
      }
    }
  }

  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (e) {}

  console.log('\n✓ Master transparent collection complete!');
}

run().catch(console.error);
