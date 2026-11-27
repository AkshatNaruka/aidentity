const fs = require("fs");
const zlib = require("zlib");

const size = 512;
const radius = 112; // corner radius
const redSize = 208;
const redOffset = (size - redSize) / 2;

function inRoundedRect(x, y, r) {
  // squircle-ish: distance from corner
  if (x < r && y < r) {
    const dx = r - x, dy = r - y;
    return dx * dx + dy * dy <= r * r;
  }
  if (x > size - r - 1 && y < r) {
    const dx = x - (size - r - 1), dy = r - y;
    return dx * dx + dy * dy <= r * r;
  }
  if (x < r && y > size - r - 1) {
    const dx = r - x, dy = y - (size - r - 1);
    return dx * dx + dy * dy <= r * r;
  }
  if (x > size - r - 1 && y > size - r - 1) {
    const dx = x - (size - r - 1), dy = y - (size - r - 1);
    return dx * dx + dy * dy <= r * r;
  }
  return true;
}

const raw = Buffer.alloc((size * 4 + 1) * size);
for (let y = 0; y < size; y++) {
  const row = y * (size * 4 + 1);
  raw[row] = 0; // filter: none
  for (let x = 0; x < size; x++) {
    const i = row + 1 + x * 4;
    if (!inRoundedRect(x, y, radius)) {
      raw[i] = 0; raw[i + 1] = 0; raw[i + 2] = 0; raw[i + 3] = 0;
      continue;
    }
    const inRed =
      x >= redOffset && x < redOffset + redSize &&
      y >= redOffset && y < redOffset + redSize;
    if (inRed) {
      raw[i] = 0xb0; raw[i + 1] = 0x34; raw[i + 2] = 0x1d; raw[i + 3] = 0xff;
    } else {
      raw[i] = 0x14; raw[i + 1] = 0x13; raw[i + 2] = 0x0f; raw[i + 3] = 0xff;
    }
  }
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(size, 0);
ihdr.writeUInt32BE(size, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type RGBA
ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const idat = zlib.deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  signature,
  chunk("IHDR", ihdr),
  chunk("IDAT", idat),
  chunk("IEND", Buffer.alloc(0)),
]);

fs.writeFileSync("/Users/akshatnaruka/Downloads/aidentity/app/icon.png", png);
console.log("wrote", png.length, "bytes");
