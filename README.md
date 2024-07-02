# Million Pixels
One million pixels on Base.

## To run this project, do the following:
1. Clone this repository.
2. Install dependencies with `npm install -legacy-peer-deps`.
3. Create a .env file in the frontend directory.
Example:
```
# Public
REACT_APP_CONTRACT_ADDR="0xf3A72385A617778FecdBe6f52239cD57E9C24F17"
REACT_APP_CHAIN=84532 # Sepolia testnet

# Private
REACT_APP_CLIENT_ID="..."
```
5. Get your unique client ID from the thirdweb website.
6. In the frontend directory, run `npm run start`.

Interacting with the website:
1. Go to `localhost:3000/canvas`
1. Click any available pixel plot on the canvas and click purchase.
2. Connect your wallet with the connect modal in the top left.
3. Upload an image from your computer (preferably a smaller one).
4. Use the scale and crop features to get a selection of 10x10 pixels. **if you do not make a 10x10 selection, your NFT will be rejected!**
5. Once you are satisfied with your selection, click "Mint NFT".
6. Confirm the transaction in your connected wallet of choice.
7. Navigate back to the canvas to see your pixels!!!
