import React from 'react';
import { useSendAndConfirmTransaction } from "thirdweb/react";
import { useConnect } from "thirdweb/react";
import { ConnectButton } from "thirdweb/react";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
// import { sendTransaction } from "thirdweb";
import { prepareContractCall } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

// import { createWallet, inAppWallet, injectedProvider } from "thirdweb/wallets";

// import { sendTransaction } from "thirdweb";
import { createWallet, injectedProvider } from "thirdweb/wallets";

// Create the client with your clientId, or secretKey if in a server environment
const client = createThirdwebClient({ 
  clientId: process.env.REACT_APP_CLIENT_ID ? process.env.REACT_APP_CLIENT_ID: "INSERT_CLIENT_ID"
});

// Connect to your contract
const contract = getContract({ 
  client,
  chain: defineChain(parseInt(process.env.REACT_APP_CHAIN ? process.env.REACT_APP_CHAIN : "NaN")), 
  address: process.env.REACT_APP_CONTRACT_ADDR ? process.env.REACT_APP_CONTRACT_ADDR : "INSERT_CONTRACT_ADDR"
});
 
// const metamask = createWallet("io.metamask"); // pass the wallet id
 
// // if user has metamask installed, connect to it
// if (injectedProvider("io.metamask")) {
//   await metamask.connect({ client });
// }
 
// // open wallet connect modal so user can scan the QR code and connect
// else {
//   await metamask.connect({
//     client,
//     walletConnect: { showQrModal: true },
//   });
// }

const MintButtonComponent = ({ hexString, row, col }) => {
    const activeAccount = useActiveAccount();

    const { mutate: sendAndConfirmTx, data: transactionReceipt, error: err} = useSendAndConfirmTransaction();
  
    const onClick = async () => {


      if (activeAccount === undefined) {
        console.log("trying to mint without an active account")
        throw new Error("ERROR: trying to mint without an active account")
      }



      const _to = activeAccount.address
      
      if (_to === undefined) {
        console.log("Error: Address is undefined")
        throw new Error("Address is undefined");
      } else {
        console.log("Address is :", _to)
      }

      console.log("imgData is:", hexString)
      console.log("row is:", row)
      console.log("col is:", col)
      const imageData = hexString
      const youtube = ""
      const x = ""
      const instagram = ""
      const facebook = ""
      const warpcast = ""
      
      const transaction = prepareContractCall({ 
        contract, 
        method: "function mintCustomNft(address _to, string imageData, uint8 row, uint8 col, string youtube, string x, string instagram, string facebook, string warpcast)", 
        params: [_to, imageData, row, col, youtube, x, instagram, facebook, warpcast] 
      });
      console.log("Prepared Transaction:", transaction);

      try {
        sendAndConfirmTx(transaction);
      } catch (error) {
          console.error("Error sending and confirming transaction:", error);
      }
      console.log("Transaction data:", transactionReceipt)
      console.log("Transaction had err:", err)
    }

    return (
          <button onClick={onClick}>Mint NFT</button>
        );
  }

export default MintButtonComponent;
  

// const callMintCustomNFT = async function (
//   _to: string, // address to send NFT to
//   imgData: string,
//   row: number,
//   col: number,
//   yt: string,
//   x: string,
//   ig: string,
//   fb: string,
//   wc: string,
// ){
//   // initialize the wallet
//   const wallet = createWallet("io.metamask");

//   // connect the wallet, this returns a promise that resolves to the connected account
//   const account = await wallet.connect({
//     // pass the client you created with `createThirdwebClient()`
//     client,
//   });

//   console.log("connected to account:", account.address)


//   const transaction = prepareContractCall({ 
//     contract, 
//     method: "function mintCustomNft(address _to, string memory imageData, uint8 row, uint8 col, string memory youtube, string memory x, string memory instagram, string memory facebook, string memory warpcast)", 
//     params: [
//       _to,
//       imgData,
//       row, col,
//       yt, x, ig, fb, wc
//     ]
//   });

//   console.log("Preapred Transaction", transaction)

//   // sign & send a transaction with the account -> returns the transaction hash
//   const { transactionHash } = await sendTransaction({
//     account,
//     transaction,
//   });

//   console.log(transactionHash)
// }


// function MintButton() {

//   const onClick = async () => {
//     try {

//       await callMintCustomNFT(
//         "0x05f9a5Dd4F4345E9F4a6D1298B7A6Bc6CFEc80e0", 
//         "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", 
//         1, 1,
//         "youtube123",
//         "x123",
//         "instagram123",
//         "facebook123",
//         "warpcast123",
//       )
//     } catch (error) {
//       console.error('Error preparing transaction:', error);
//     }
//   };

//   return (
//     <button onClick={onClick}>Mint NFT</button>
//   );
// }

// export default function MintButton() {
//     const { mutate: sendTransaction } = useSendTransaction();
  


//     const onClick = () => {
//       const transaction = prepareContractCall({ 
//         contract, 
//         method: "function mintCustomNft(address _to, string imageData, uint8 row, uint8 col, string youtube, string x, string instagram, string facebook, string warpcast)", 
//         params: [
//           "0x05f9a5Dd4F4345E9F4a6D1298B7A6Bc6CFEc80e0", 
//           "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", 
//           1, 1,
//           "youtube123",
//           "x123",
//           "instagram123",
//           "facebook123",
//           "warpcast123",
//         ] 
//       });
//       sendTransaction(transaction);
//     }
//   }
  

// export default MintButton;

/*
const transaction = await prepareContractCall({ 
  contract, 
  method: "function mintTo(address _to, string _tokenURI)", 
  params: [_to, _tokenURI] 
});
const { transactionHash } = await sendTransaction({ 
  transaction, 
  account 
});
*/

// import { ThirdwebProvider, useSendTransaction } from '@thirdweb-dev/react';
// import { prepareContractCall } from '@thirdweb-dev/sdk';
// import { defineChain } from '@thirdweb-dev/sdk/chains';
// import { createThirdwebClient } from '@thirdweb-dev/sdk';
// import { getContract } from "thirdweb";
