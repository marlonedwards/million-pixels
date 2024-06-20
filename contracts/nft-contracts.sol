string[] private blockchains = ['Ethereum', 'Solana', 'Arbitrum', 'Fantom', 'Polygon', 'Bitcoin'];
string[] private dapps = ['Aave', 'Orca', 'Uniswap', 'MakerDAO', 'Magic Eden'];
string[] private tokens = ["$ETH", "$SOL", "$BTC", "$AVAX"];

function random(string memory input) internal pure       returns (uint256) {
    return uint256(keccak256(abi.encodePacked(input)));
}

function getBlockchain(uint256 tokenId) public view returns (string memory){
    return pluck(tokenId, "Blockchains", blockchains);
}

function getDapp(uint256 tokenId) public view returns (string memory){
    return pluck(tokenId, "Dapps", dapps);
}

function getToken(uint256 tokenId) public view returns (string memory){
    return pluck(tokenId, "Tokens", tokens);
}

function tokenURI(uint256 tokenId) override public view returns (string memory){
	string[8] memory parts;
 
	parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="black" /><text x="10" y="20" class="base">';
 
 	parts[1] = getName(tokenId);
 
 	parts[2] = '</text><text x="10" y="40" class="base">';
 
 	parts[3] = getLocation(tokenId);
 
 	parts[4] = '</text><text x="10" y="60" class="base">';
 
 	parts[6] = getIndustry(tokenId);
 
 	parts[7] = '</text></svg>';
 
	string memory output =
		string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[5], parts[6], parts[7]));
 
	string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "Web3 Card: ', toString(tokenId), '", "description": "OnChain NFTs created with Thirdweb!", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
	
	output = string(abi.encodePacked('data:application/json;base64,', json));
      
	return output;
}

function claim(uint256 _amount) public {
    require(_amount > 0 && _amount < 6);
    _safeMint(msg.sender, tokenId);
}
