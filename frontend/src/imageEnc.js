const fs = require('fs');
const { PNG } = require('pngjs');
var Jimp = require('jimp');

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

    console.log("WIDTH", png.width, typeof(png.width))
    return [png.width, png.height, pixelArray];
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
      const aHex = pixel.a.toString(16).padStart(2, '0');
      // Concatenate the hex values
      return rHex + gHex + bHex + aHex;
    }).join('');
}


function hexStringToBytes(hexString) {
  let bytes = [];
  
  if (hexString.length == 0){
    return bytes
  }
  
  // let rgb_pushed = 0;
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
    // rgb_pushed += 1

    // if (rgb_pushed % 3 == 0) {
    //   bytes.push(255);
    // }
  }

  return bytes;
}

function hexStringToImg(info) {
  console.log(info)
  const width = info[0];
  const height = info[1];
  let hexString = info[2];
  // assert (hexString.length == (width*height*3*2));
  
  bytes = hexStringToBytes(hexString);

  console.log(width, typeof(width))

  var image = new Jimp(width, height, 
    function (err, image) {
      let buffer = image.bitmap.data
      for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
          const offset = (y * width + x) * 4         // RGBA = 4 bytes
          buffer[offset    ] = bytes[offset     ]    // R
          buffer[offset + 1] = bytes[offset  + 1]    // G
          buffer[offset + 2] = bytes[offset  + 2]    // B
          buffer[offset + 3] = bytes[offset  + 3]    // Alpha
        }
      }
      image.write('image.png')
    })

    // return image object here
}



[width, height, pixelArray] = imageToPixelArray('../public/12112.png')
const hexString = pixelArrayToHexString(pixelArray);
console.log(hexString);
console.log(hexString.length);
hexStringToImg([width, height, pixelArrayToHexString(pixelArray)]);
