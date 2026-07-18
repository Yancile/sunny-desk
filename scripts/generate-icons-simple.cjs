const fs = require('fs')
const path = require('path')

const iconsDir = path.join(__dirname, '../public/icons')

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

const createPNG = (width, height, r, g, b, a = 255) => {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  
  const createChunk = (type, data) => {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const typeBuffer = Buffer.from(type)
    const crcData = Buffer.concat([typeBuffer, data])
    const crc = Buffer.alloc(4)
    let c = 0xFFFFFFFF
    for (let i = 0; i < crcData.length; i++) {
      c ^= crcData[i]
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0)
      }
    }
    crc.writeUInt32BE((~c) >>> 0)
    return Buffer.concat([length, typeBuffer, data, crc])
  }
  
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8
  ihdrData[9] = 6
  ihdrData[10] = 0
  ihdrData[11] = 0
  ihdrData[12] = 0
  const ihdr = createChunk('IHDR', ihdrData)
  
  const rawData = []
  for (let y = 0; y < height; y++) {
    rawData.push(0)
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b, a)
    }
  }
  
  const { deflateSync } = require('zlib')
  const compressed = deflateSync(Buffer.from(rawData))
  const idat = createChunk('IDAT', compressed)
  
  const iend = createChunk('IEND', Buffer.alloc(0))
  
  return Buffer.concat([signature, ihdr, idat, iend])
}

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512]

iconSizes.forEach(size => {
  const png = createPNG(size, size, 30, 77, 123)
  const filePath = path.join(iconsDir, `icon-${size}x${size}.png`)
  fs.writeFileSync(filePath, png)
  console.log(`Created: ${filePath}`)
})

console.log('All icons generated successfully!')