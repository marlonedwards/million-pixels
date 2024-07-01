// src/components/Crop.js
import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import { canvasPreview } from './canvasPreview.ts';
import { useDebounceEffect } from './useDebounceEffects.ts';
import { imageToPixelArray, pixelArrayToHexString, hexStringToCanvas} from '../imageEnc';
import 'react-image-crop/dist/ReactCrop.css';
import MintButtonComponent from './MintButton.tsx';
 
// const { PNG } = require('pngjs/browser');
// const Jimp = require('jimp');

// Helper function to center aspect crop
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  const crop = makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight);
  return crop;
}

const CropComponent = ({ onCropComplete, row, col}) => {
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
  const [hexString, setHexString] = useState('');
  const [convertedImgSrc, setConvertedImgSrc] = useState('');
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);

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
  
  useEffect(() => {
    const renderCanvas = async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        const pixelRatio = 1;
        const _cropWidth = Math.floor(completedCrop.width * scaleX * pixelRatio * scale);
        const _cropHeight = Math.floor(completedCrop.height * scaleY * pixelRatio * scale);


        // const xOff = (imgRef.current.naturalWidth * (1 - scale)) / 2
        // const yOff = (imgRef.current.naturalHeight * (1 - scale)) / 2

        setCropWidth(_cropWidth);
        setCropHeight(_cropHeight);


        canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);
  
        const ctx = previewCanvasRef.current.getContext('2d');

        const imageData = ctx.getImageData(0, 0, _cropWidth, _cropHeight);  
        const pixelArray = imageToPixelArray(imageData);
        const hexString = pixelArrayToHexString(pixelArray);
        setHexString(hexString);
        onCropComplete(hexString);
    
        console.log(hexString);
        console.log(hexString.length);
        try {
          const imgInfo = [
            _cropWidth,
            _cropHeight,
            hexString
          ];
          const canvImg = await hexStringToCanvas(imgInfo[0], imgInfo[1], imgInfo[2]);
  
          // Get the container element
          const container = document.getElementById('imageContainer');
          if (container) {
            // Clear existing content in container
            container.innerHTML = '';
            // Append the canvas to the container
            container.appendChild(canvImg);
          } else {
            console.error('Element with ID "imageContainer" not found in the DOM.');
          }
        } catch (error) {
          console.error('Error rendering canvas:', error);
        }
      }
    };
  
    renderCanvas();
  }, [onCropComplete, completedCrop, scale, rotate, cropWidth, cropHeight]);
  

  
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
            type="range"
            min="0.01"
            max="3"
            step="0.01"
            value={scale}
            disabled={!imgSrc}
            onChange={(e) => setScale(Number(e.target.value))}
          />
          <span>{scale.toFixed(2)}</span>
        </div>
        <div>
          <label htmlFor="rotate-input">Rotate: </label>
          <input
            id="rotate-input"
            type="range"
            min="-180"
            max="180"
            value={rotate}
            disabled={!imgSrc}
            onChange={(e) => setRotate(Number(e.target.value))}
          />
          <span>{rotate}°</span>
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
          minHeight={10}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imgSrc}
            style={{ transform: `scale(${1}) rotate(${rotate}deg)` }}
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
              Cropped Image Size: {cropWidth} x {cropHeight} pixels
            </p>
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
            {hexString && (
            <div>
              <h3>Hex String:</h3>
              <textarea value={hexString} readOnly rows={5} cols={80} />
              <div id="imageContainer" style={{ transform: `scale(${(1, 1)}) rotate(${rotate}deg)` }} />
              {/* <MintButtonComponent hexString={hexString} row={Number(row)} col={Number(col)} /> */}

            </div>
           
          )}
          </div>
        </>
      )}
    </div>
  );
};

export default CropComponent;
