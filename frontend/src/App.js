import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import * as Pages from './pages';

import 'react-image-crop/dist/ReactCrop.css';
import Crop from './components/Crop';
import './components/Crop.css';
import CropComponent from './components/Crop';
import CanvasComponent from './components/CanvasComponent.js';

import { canvasPreview } from './components/canvasPreview.ts';
import { useDebounceEffect } from './components/useDebounceEffects.ts';

import { createThirdwebClient, getContract, resolveMethod } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";
import {
  createWallet,
  walletConnect,
  inAppWallet,
} from "thirdweb/wallets";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();


export const client = createThirdwebClient({ 
  clientId: process.env.REACT_APP_CLIENT_ID
});

// connect to your contract
export const contract = getContract({ 
  client, 
  chain: defineChain(parseInt(process.env.REACT_APP_CHAIN? process.env.REACT_APP_CHAIN : "NaN")), 
  address: "0xDEfd7091d886d313AE58c92a0676F1A95db8A096"
});


export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
  inAppWallet({
    auth: {
      options: [
        "email",
        "google",
        "apple",
        "facebook",
        "phone",
      ],
    },
  }),
];


export default function App() {
    return (
      <ThirdwebProvider>
      {/* <QueryClientProvider client={queryClient}> */}
      <BrowserRouter>
        <Routes>
            <Route path="/canvas" element={<Pages.Canvas />} />
            <Route path="/purchase-pixels/:row_col" element={<Pages.Purchase />} />
        </Routes>
      </BrowserRouter>
      {/* </QueryClientProvider> */}
      </ThirdwebProvider>
    )
}