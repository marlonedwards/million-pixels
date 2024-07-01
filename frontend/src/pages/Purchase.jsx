import React from 'react'
import Crop from '../components/Crop.js';
import { useParams } from 'react-router-dom';
import { useState } from 'react'
import {ConnectButton} from "thirdweb/react"

import {client, wallets} from '../App.js'
// import WalletHeader from '../components/WalletHeader.jsx';
// import ConComponent from '../components/useConComponent.jsx';
import MintButton from '../components/MintButton.tsx'
export default function Purchase() {
    const { row_col } = useParams();
    const [row, col] = row_col.split('-');

    const [hexString, setHexString] = useState('');

    const onCropComplete = (croppedHexString) => {
      setHexString(croppedHexString);
    };

    return (
        <div>
            <ConnectButton client={client} wallets={wallets} />
            {/* <WalletHeader /> */}
            <p>Row: {row}</p>
            <p>Col: {col}</p>
            <Crop onCropComplete={onCropComplete} row={row} col={col} />
            <MintButton hexString={hexString} row={Number(row)} col={Number(col)} />
            {/* <ConComponent /> */}
            <p>{hexString}</p>
        </div>
    )
}
