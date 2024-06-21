const fs = require('fs');
const { PNG } = require('pngjs');

function imageToPixelArray(filePath) {
    try {
      // from API https://www.npmjs.com/package/pngjs#sync-api
      var data = fs.readFileSync(filePath);
      var png = PNG.sync.read(data);
  
      if (!png.data) {
        throw new Error('Failed to parse PNG data');
      }
  
      const pixelArray = [];
  
      for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
          const idx = (png.width * y + x) << 2;
          const r = png.data[idx];
          const g = png.data[idx + 1];
          const b = png.data[idx + 2];
          const a = png.data[idx + 3];
          pixelArray.push({ r, g, b, a });
        }
      }
  
      return pixelArray;
    } catch (err) {
      console.error('An error occurred while processing the image:', err.message);
      return null;
    }
  }
  
function pixelArrayToHexString(pixelArray) {
    return pixelArray.map(pixel => {
      // Convert each r, g, b value to a 2-digit hexadecimal string
      const rHex = pixel.r.toString(16).padStart(2, '0');
      const gHex = pixel.g.toString(16).padStart(2, '0');
      const bHex = pixel.b.toString(16).padStart(2, '0');
      // Concatenate the hex values
      return rHex + gHex + bHex;
    }).join('');
  }
  
  const hexString = pixelArrayToHexString(imageToPixelArray('../public/modi_ji.png'));
  console.log(hexString);
  console.log(hexString.length);