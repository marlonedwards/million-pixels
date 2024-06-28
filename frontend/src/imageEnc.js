// imageEnc.js

const { PNG } = require('pngjs/browser'); // Use pngjs/browser for browser environment
const Jimp = require('jimp');


export function imageToPixelArray(imageData) {
  const pixelArray = [];
  const { data, width, height } = imageData;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      pixelArray.push({ r, g, b, a });
    }
  }
  return pixelArray;
}

// export function pixelArrayToHexString(pixelArray) {
//   return pixelArray.map(pixel => {
//     const rHex = pixel.r.toString(16).padStart(2, '0');
//     const gHex = pixel.g.toString(16).padStart(2, '0');
//     const bHex = pixel.b.toString(16).padStart(2, '0');
//     return rHex + gHex + bHex;
//   }).join('');
// }



/**
 * @param {number} width - The width of the image
 * @param {number} height - The height of the image
 * @param {string} hexString - The hex string representing the image data
 * @returns {HTMLCanvasElement} Canvas object
 */
export function hexStringToCanvas(width, height, hexString) {
  // Function to convert hex string to byte array
  function hexStringToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);

    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  // Convert hex string to byte array
  const bytes = hexStringToBytes(hexString);

  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Get the 2D rendering context
  const ctx = canvas.getContext('2d');

  // Create an ImageData object
  const imageData = ctx.createImageData(width, height);

  // Fill the ImageData with the byte array
  for (let i = 0; i < bytes.length; i += 4) {
    imageData.data[i    ] = bytes[i    ]; // R
    imageData.data[i + 1] = bytes[i + 1]; // G
    imageData.data[i + 2] = bytes[i + 2]; // B
    imageData.data[i + 3] = bytes[i + 3]; // A
  }

  // Put the ImageData onto the canvas
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

/**
 * @param info [width, height, hexString]
 * @returns Jimp image
 */
// export function hexStringToImg(info) {
//   console.log(info)
//   const width = info[0];
//   const height = info[1];
//   let hexString = info[2];
//   // assert (hexString.length == (width*height*3*2));
  
//   var bytes = hexStringToBytes(hexString);

//   console.log(width, typeof(width))

//   var image = new Jimp(width, height, 
//     function (err, image) {
//       let buffer = image.bitmap.data
//       for (var x = 0; x < width; x++) {
//         for (var y = 0; y < height; y++) {
//           const offset = (y * width + x) * 4         // RGBA = 4 bytes
//           buffer[offset    ] = bytes[offset     ]    // R
//           buffer[offset + 1] = bytes[offset  + 1]    // G
//           buffer[offset + 2] = bytes[offset  + 2]    // B
//           buffer[offset + 3] = bytes[offset  + 3]    // Alpha
//         }
//       }
//     })

//     return image;
// }

// export async function hexStringToImg(info) {
//   const width = info[0];
//   const height = info[1];
//   let hexString = info[2];
//   const bytes = hexStringToBytes(hexString);

//   const canvas = document.createElement('canvas');
//   canvas.width = width;
//   canvas.height = height;
//   const ctx = canvas.getContext('2d');
//   const imageData = ctx.createImageData(width, height);

//   for (let i = 0; i < bytes.length; i += 4) {
//     imageData.data[i] = bytes[i];
//     imageData.data[i + 1] = bytes[i + 1];
//     imageData.data[i + 2] = bytes[i + 2];
//     imageData.data[i + 3] = 255; // setting alpha to 255
//   }

//   ctx.putImageData(imageData, 0, 0);

//   return canvas.toDataURL('image/png');
// }

// export function hexStringToBytes(hexString) {
//   let bytes = [];
  
//   if (hexString.length === 0) return bytes
  
//   for (let i = 0; i < hexString.length; i += 2) {
//     bytes.push(parseInt(hexString.substr(i, 2), 16));
//   }

//   return bytes;
// }


// module.exports = { imageToPixelArray, pixelArrayToHexString };

// const fs = require('fs');
// const { PNG } = require('pngjs/browser/browser');
// var Jimp = require('jimp');

// async function fetchBufferFromUrl(url) {
//   try {
//       const response = await fetch(url);
//       if (!response.ok) {
//           throw new Error(`Network response was not ok: ${response.statusText}`);
//       }
//       const arrayBuffer = await response.arrayBuffer();
//       const buffer = new Uint8Array(arrayBuffer);
//       return buffer;
//   } catch (error) {
//       console.error('Error fetching data:', error);
//       throw error;
//   }
// }



// function imageToPixelArray(url) {
  
//     try {

//     var data = fetchBufferFromUrl(url);

//     // // from API https://www.npmjs.com/package/pngjs#sync-api
//     // var data = fs.readFileSync(filePath);
//     var png = PNG.sync.read(data);

//     if (!png.data) {
//       throw new Error('Failed to parse PNG data');
//     }

//     const pixelArray = [];

//     for (let y = 0; y < png.height; y++) {
//       for (let x = 0; x < png.width; x++) {
//         const idx = (png.width * y + x) << 2;
//         const r = png.data[idx];
//         const g = png.data[idx + 1];
//         const b = png.data[idx + 2];
//         const a = png.data[idx + 3];
//         pixelArray.push({ r, g, b, a });
//       }
//     }

//     console.log("WIDTH", png.width, typeof(png.width))
//     return [png.width, png.height, pixelArray];
//   } catch (err) {
//     console.error('An error occurred while processing the image:', err.message);
//     return null;
//   }
// }
  
export function pixelArrayToHexString(pixelArray) {
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


// function hexStringToBytes(hexString) {
//   let bytes = [];
  
//   if (hexString.length == 0){
//     return bytes
//   }
  
//   // let rgb_pushed = 0;
//   for (let i = 0; i < hexString.length; i += 2) {
//     bytes.push(parseInt(hexString.substr(i, 2), 16));
//     // rgb_pushed += 1

//     // if (rgb_pushed % 3 == 0) {
//     //   bytes.push(255);
//     // }
//   }

//   return bytes;
// }

// function hexStringToImg(info) {
//   console.log(info)
//   const width = info[0];
//   const height = info[1];
//   let hexString = info[2];
//   // assert (hexString.length == (width*height*3*2));
  
//   var bytes = hexStringToBytes(hexString);

//   console.log(width, typeof(width))

//   var image = new Jimp(width, height, 
//     function (err, image) {
//       let buffer = image.bitmap.data
//       for (var x = 0; x < width; x++) {
//         for (var y = 0; y < height; y++) {
//           const offset = (y * width + x) * 4         // RGBA = 4 bytes
//           buffer[offset    ] = bytes[offset     ]    // R
//           buffer[offset + 1] = bytes[offset  + 1]    // G
//           buffer[offset + 2] = bytes[offset  + 2]    // B
//           buffer[offset + 3] = bytes[offset  + 3]    // Alpha
//         }
//       }
//       image.write('image.png')
//     })

//     // return image object here
// }

// [width, height, pixelArray] = imageToPixelArray('../public/12112.png')
// const hexString = pixelArrayToHexString(pixelArray);
// console.log(hexString);
// console.log(hexString.length);
// hexStringToImg([width, height, pixelArrayToHexString(pixelArray)]);
