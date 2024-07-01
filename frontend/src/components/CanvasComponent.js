import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { createThirdwebClient, resolveMethod } from "thirdweb";

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

const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [clickedInfo, setClickedInfo] = useState(null);
  const navigate = useNavigate();

  // Create a 100x100 gridData array to simulate ownership data for each 10x10 pixel block
  const gridData = Array.from({ length: 100 }, () => Array(100).fill(null));

  
  const { data, isLoading } = useReadContract({ 
    contract, 
    method: "function nextTokenIdToMint() view returns (uint256)", 
    params: [] 
  });

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

  return (
    <div>
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
