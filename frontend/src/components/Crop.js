import React, { useState, useRef } from 'react';
import ReactCrop, { makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import { canvasPreview } from './canvasPreview.ts';
import { useDebounceEffect } from './useDebounceEffects.ts';
// import {pixelArrayToHexString, imageToPixelArray} from '../imageEnc.js';
import 'react-image-crop/dist/ReactCrop.css';

const { PNG } = require('pngjs/browser');
var Jimp = require('jimp');


/**
 *  Image to pixel array / string related
 */


async function fetchBufferFromUrl(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      return buffer;
  } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
  }
}



function imageToPixelArray(url)
  { 
    try {

    var data = fetchBufferFromUrl(url);

    // // from API https://www.npmjs.com/package/pngjs#sync-api
    // var data = fs.readFileSync(filePath);
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
  
  var bytes = hexStringToBytes(hexString);

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




/**
 * 
 * 
 * 
 * 
 * 
 */




function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  const crop = makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight);
  return crop;
}

const Crop = () => {
  const [imgSrc, setImgSrc] = useState('');
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const hiddenAnchorRef = useRef(null);
  const blobUrlRef = useRef('');
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(1 / 1);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(null); // Reset crop on file change
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result.toString())
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e) => {
    if (aspect) {
      const { width, height } = e.target;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  const onDownloadCropClick = async () => {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );

    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = URL.createObjectURL(blob);

    if (hiddenAnchorRef.current) {
      hiddenAnchorRef.current.href = blobUrlRef.current;
      hiddenAnchorRef.current.click();
    }
  };

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  const handleToggleAspectClick = () => {
    if (aspect) {
      setAspect(null);
    } else {
      setAspect(1 / 1);
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, 1 / 1);
        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  };

  return (
    <div className="App">
      <div className="Crop-Controls">
        <input type="file" accept="image/*" onChange={onSelectFile} />
        <div>
          <label htmlFor="scale-input">Scale: </label>
          <input
            id="scale-input"
            type="number"
            step="0.1"
            value={scale}
            disabled={!imgSrc}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="rotate-input">Rotate: </label>
          <input
            id="rotate-input"
            type="number"
            value={rotate}
            disabled={!imgSrc}
            onChange={(e) =>
              setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))
            }
          />
        </div>
        <div>
          <button onClick={handleToggleAspectClick}>
            Toggle aspect {aspect ? 'off' : 'on'}
          </button>
        </div>
      </div>
      {!!imgSrc && (
        <ReactCrop
          crop={crop}
          onChange={(newCrop) => setCrop(newCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          minHeight={100}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imgSrc}
            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      )}
      {!!completedCrop && (
        <>
          <div>
            <canvas
              ref={previewCanvasRef}
              style={{
                border: '1px solid black',
                objectFit: 'contain',
                width: completedCrop.width,
                height: completedCrop.height,
              }}
            />
          </div>
          <div>
            <p>
                Cropped Image Size: {completedCrop.width} x {completedCrop.height} pixels
            </p>
            <p>Cropped Image: {pixelArrayToHexString(imageToPixelArray(hiddenAnchorRef)[2])}</p>

            <button onClick={onDownloadCropClick}>Download Crop</button>
            <a
              href="#hidden"
              ref={hiddenAnchorRef}
              download
              style={{
                position: 'absolute',
                top: '-200vh',
                visibility: 'hidden',
              }}
            >
              Hidden download
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Crop;
