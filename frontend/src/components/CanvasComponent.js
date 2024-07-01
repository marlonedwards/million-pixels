import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { createThirdwebClient, resolveMethod } from "thirdweb";
import { hexStringToCanvas } from '../imageEnc';




// Create the client with your clientId, or secretKey if in a server environment
const client = createThirdwebClient({ 
  clientId : process.env.REACT_APP_CLIENT_ID ? process.env.REACT_APP_CLIENT_ID: "INSERT_CLIENT_ID"
});

  const chain = parseInt(process.env.REACT_APP_CHAIN? process.env.REACT_APP_CHAIN : "NaN");
const contract = getContract({ 
  client,
  chain: defineChain(chain),
  address: process.env.REACT_APP_CONTRACT_ADDR
});

const PLOT_WIDTH = 10;
const PLOT_HEIGHT = 10;
const CANVAS_SIZE = 1000; // Adjust as needed


const TokenComponent = ({ tokenId, drawOnCanvas }) => {
  const { data, isLoading } = useReadContract({
    contract,
    method: "function tokenURI(uint256 _tokenId) view returns (string)",
    params: [tokenId]
  });

  useEffect(() => {
    if (!isLoading && data) {
      const base64 = data.split(',')[1];
      const temp = atob(base64);
      const jsonObject = JSON.parse(temp);
      
      const imageData = jsonObject.attributes.find(attr => attr.trait_type === "imageData").value;
      const row = jsonObject.attributes.find(attr => attr.trait_type === "row").value;
      const col = jsonObject.attributes.find(attr => attr.trait_type === "column").value;
      
      const tokenImage = hexStringToCanvas(PLOT_WIDTH, PLOT_HEIGHT, imageData);
      drawOnCanvas(tokenImage, row, col);
    }
  }, [isLoading, data, drawOnCanvas, tokenId]);

  return null; // Component is invisible
};


const AllTokens = ({ drawImgOnCanvas, maxNumTokens }) => {
  const components = [];
  for (let i = 0; i < maxNumTokens; i++) {
    components.push(
      <TokenComponent tokenId={i} drawOnCanvas={drawImgOnCanvas} />
    );
  }
  return <div>{components}</div>;
};




const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [clickedInfo, setClickedInfo] = useState(null);
  const navigate = useNavigate();

  // Create a 100x100 gridData array to simulate ownership data for each 10x10 pixel block
  const gridData = Array.from({ length: 100 }, () => Array(100).fill(null));
  
    // const {tokenMax, maxIsLoading} = useReadContract({
  //   contract, 
  //   method: "function nextTokenIdToMint() view returns (uint256)", 
  //   params: [] 
  // });

  // hexString={hexString} row={Number(row)} col={Number(col)}
  
  /*
  const _tokenId = 0;

  const { data, isLoading } = useReadContract({ 
    contract, 
    method: "function tokenURI(uint256 _tokenId) view returns (string)", 
    params: [_tokenId] 
  });
  
  console.log(data);;
  
  var canvImg;
  var row;
  var col;
  if (!isLoading && data) {
    const base64 = data.split(',')[1];
    const temp = atob(base64);
    console.log(temp);
    const jsonObject = JSON.parse(temp);
    console.log(jsonObject);

    const imageData = jsonObject.attributes.find(attr => attr.trait_type === "imageData").value;
    row = jsonObject.attributes.find(attr => attr.trait_type === "row").value;
    col = jsonObject.attributes.find(attr => attr.trait_type === "column").value;

    console.log("Image Data:", imageData);
    console.log("Row:", row);
    console.log("Column:", col);

    const _plot_width = 10;
    const _plot_height = 10;
    canvImg = hexStringToCanvas(_plot_width, _plot_height, imageData);
    drawImgOnCanvas(canvImg, row, col);
  }
  */

  function drawImgOnCanvas (canvImg, row, col) {
    if (canvImg !== undefined) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(canvImg, row * 10, col * 10, 10, 10);
    }
  }


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawGrid(ctx);
  }, [zoom]);


  const drawGrid = (ctx) => {
    const size = 10 * zoom;
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.strokeStyle = '#ddd';

    for (let x = 0; x < 1000; x += size) {
      for (let y = 0; y < 1000; y += size) {
        ctx.strokeRect(x, y, size, size);
      }
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = Math.pow(1.1, e.deltaY * -0.01); // Zoom factor
    const newZoom = zoom * zoomFactor;

    const deltaX = mouseX - mouseX * zoomFactor;
    const deltaY = mouseY - mouseY * zoomFactor;

    setZoom(Math.max(1, Math.min(5, newZoom))); // Clamp zoom level

    // Adjust scroll position to maintain centered zoom
    canvasRef.current.scrollLeft += deltaX;
    canvasRef.current.scrollTop += deltaY;
  };

  const handleMouseMove = (e) => {
    if (clickedInfo) return; // Do not update hover info if a cell is clicked

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor(x / (10 * zoom));
    const gridY = Math.floor(y / (10 * zoom));

    // Ensure gridX and gridY are within valid bounds
    if (gridX >= 0 && gridX < 100 && gridY >= 0 && gridY < 100) {
      const info = gridData[gridX][gridY];
      setHoverInfo({ x: gridX, y: gridY, info });
    } else {
      setHoverInfo(null);
    }
  };

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor(x / (10 * zoom));
    const gridY = Math.floor(y / (10 * zoom));

    // Ensure gridX and gridY are within valid bounds
    if (gridX >= 0 && gridX < 100 && gridY >= 0 && gridY < 100) {
      const info = gridData[gridX][gridY];
      setClickedInfo({ x: gridX, y: gridY, info });
    } else {
      setClickedInfo(null);
    }
  };

  const handlePurchaseClick = () => {
    if (clickedInfo) {
      const { x, y } = clickedInfo;
      navigate(`/purchase-pixels/${x}-${y}`);
    }
  };

  const handleClose = () => {
    setClickedInfo(null);
  };

  // Ensure hoverInfo updates when zoom changes
  useEffect(() => {
    if (hoverInfo) {
      const { x, y } = hoverInfo;
      const info = gridData[x][y];
      setHoverInfo({ x, y, info });
    }
  }, [zoom]);

  const getPopupPosition = () => {
    const info = clickedInfo || hoverInfo;
    if (!info) return { left: 0, top: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    const left = rect.left + info.x * 10 * zoom + 10;
    const top = rect.top + info.y * 10 * zoom;

    return { left, top };
  };

  const popupPosition = getPopupPosition();

  const maxTokens = (CANVAS_SIZE * CANVAS_SIZE) / (PLOT_HEIGHT * PLOT_WIDTH)

  return (
    <div>
      <AllTokens maxNumTokens={maxTokens} drawImgOnCanvas={drawImgOnCanvas} />
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ border: '1px solid black', cursor: 'pointer' }}
      />
      {(hoverInfo || clickedInfo) && (
        <div
          style={{
            position: 'absolute',
            left: popupPosition.left,
            top: popupPosition.top,
            padding: '5px',
            backgroundColor: 'white',
            border: '1px solid black',
            zIndex: 10,
          }}
        >
          <div>Row: {(hoverInfo || clickedInfo).y}, Column: {(hoverInfo || clickedInfo).x}</div>
          {(hoverInfo || clickedInfo).info ? (
            <>
              <div>Date Bought: {(hoverInfo || clickedInfo).info?.date || 'N/A'}</div>
              <div>Owner: {(hoverInfo || clickedInfo).info?.owner || 'N/A'}</div>
            </>
          ) : (
            <button onClick={handlePurchaseClick}>Purchase</button>
          )}
          {clickedInfo && <button onClick={handleClose}>Close</button>}
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;
