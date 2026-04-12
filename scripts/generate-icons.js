#!/usr/bin/env node
/* Generate minimal valid PNG icons for PWA manifest.
   Uses only Node.js built-ins (zlib, fs). No dependencies needed.
   Creates solid black PNGs at the required sizes — replace with
   branded icons when ready. */

const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const OUT = path.join(__dirname, '..', 'public', 'icons')

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

/* CRC32 lookup table (PNG spec requirement) */
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c
}
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const t = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crcBuf])
}

function makePNG(w, h) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  /* IHDR */
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8   // 8-bit depth
  ihdr[9] = 6   // RGBA
  ihdr[10] = 0  // deflate
  ihdr[11] = 0  // no filter
  ihdr[12] = 0  // no interlace

  /* Raw pixel data: each row = filter byte 0 + (R,G,B,A) * width */
  const rowLen = 1 + w * 4
  const raw = Buffer.alloc(rowLen * h)

  /* Draw: black background + centered white circle (simple shield icon) */
  const cx = w / 2, cy = h / 2, r = w * 0.3
  for (let y = 0; y < h; y++) {
    const rowOff = y * rowLen
    raw[rowOff] = 0 // filter: none
    for (let x = 0; x < w; x++) {
      const px = rowOff + 1 + x * 4
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < r) {
        /* White circle as placeholder shield */
        const edge = Math.max(0, Math.min(1, (r - dist) / 2))
        const a = Math.round(edge * 220)
        raw[px] = 255     // R
        raw[px + 1] = 255 // G
        raw[px + 2] = 255 // B
        raw[px + 3] = a   // A
      } else {
        raw[px + 3] = 255 // opaque black
      }
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

SIZES.forEach((s) => {
  const png = makePNG(s, s)
  const file = path.join(OUT, `icon-${s}x${s}.png`)
  fs.writeFileSync(file, png)
  console.log(`✓ ${s}x${s} → ${file} (${png.length} bytes)`)
})
console.log('\nDone. Replace with branded icons when ready.')
