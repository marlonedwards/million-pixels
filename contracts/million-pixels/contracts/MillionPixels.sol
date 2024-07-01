// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// import "@thirdweb-dev/contracts/base/ERC721LazyMint.sol";
import "@thirdweb-dev/contracts/base/ERC721Base.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract MillionPixels is ERC721Base {

    struct TokenData {
        bool inited;
        string imageData;
        uint8 row;
        uint8 col;
        string youtube;
        string x;
        string instagram;
        string facebook;
        string warpcast;
    }

    mapping(uint256 => TokenData) private tokenDataMap;
    bool[100][100] private _mintedPositions;

    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps
    ) ERC721Base(
        _defaultAdmin,
        _name,
        _symbol,
        _royaltyRecipient,
        _royaltyBps
    ){}

    function setTokenData(
        uint256 tokenId,
        string memory imageData,
        uint8 row,
        uint8 col,
        string memory youtube,
        string memory x,
        string memory instagram,
        string memory facebook,
        string memory warpcast
    ) internal {
        require(!_exists(tokenId), "ERC721: token already exists");
        require(!_mintedPositions[row][col], "ERC721: Position already minted");
        require(bytes(imageData).length == 800, "ERC721: imageData must be exactly 800 ascii chars long (2 chars / byte * 4 bytes / px * 100 px)");
        require(bytes(youtube).length <= 64, "ERC721: YouTube username must be 64 characters or less");
        require(bytes(x).length <= 64, "ERC721: X username must be 64 characters or less");
        require(bytes(instagram).length <= 64, "ERC721: Instagram username must be 64 characters or less");
        require(bytes(facebook).length <= 64, "ERC721: Facebook username must be 64 characters or less");
        require(bytes(warpcast).length <= 64, "ERC721: Warpcast username must be 64 characters or less");

        tokenDataMap[tokenId] = TokenData(true, imageData, row, col, youtube, x, instagram, facebook, warpcast);
        _mintedPositions[row][col] = true;
    }

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        
        TokenData memory data = tokenDataMap[tokenId];
        require(data.inited, "Tried to pull un-inited TokenData from tokenDataMap");

        string memory json = string(abi.encodePacked(
            '{"name": "Plot: ', toString(tokenId),
            '", "description": "Million Pixels on Base", ',
            '"image": "', data.imageData,
            '", "attributes": [',
            '{"trait_type": "row", "value": "', toString(uint256(data.row)), '"},',
            '{"trait_type": "column", "value": "', toString(uint256(data.col)), '"}',
            '{"trait_type": "imageData", "value": "', data.imageData, '"}'));
        
        if (bytes(data.youtube).length > 0) {
            json = string(abi.encodePacked(json, ',{"trait_type": "youtube", "value": "', data.youtube, '"}'));
        }
        if (bytes(data.x).length > 0) {
            json = string(abi.encodePacked(json, ',{"trait_type": "x", "value": "', data.x, '"}'));
        }
        if (bytes(data.instagram).length > 0) {
            json = string(abi.encodePacked(json, ',{"trait_type": "instagram", "value": "', data.instagram, '"}'));
        }
        if (bytes(data.facebook).length > 0) {
            json = string(abi.encodePacked(json, ',{"trait_type": "facebook", "value": "', data.facebook, '"}'));
        }
        if (bytes(data.warpcast).length > 0) {
            json = string(abi.encodePacked(json, ',{"trait_type": "warpcast", "value": "', data.warpcast, '"}'));
        }

        json = string(abi.encodePacked(json, ']}'));

        string memory encodedJson = Base64.encode(bytes(json));
        string memory output = string(abi.encodePacked('data:application/json;base64,', encodedJson));

        return output;
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function isHexDigit(bytes1 c) internal pure returns (bool) {
        return (c >= 0x30 && c <= 0x39) || // 0-9
            (c >= 0x41 && c <= 0x46) || // A-F
            (c >= 0x61 && c <= 0x66);   // a-f
    }

    function isValidHexString(string memory str) public pure returns (bool) {
        bytes memory strBytes = bytes(str);
        
        if (strBytes.length % 2 != 0) {
            return false;
        }
        
        for (uint i = 0; i < strBytes.length; i += 2) {
            bytes1 char1 = strBytes[i];
            bytes1 char2 = strBytes[i + 1];

            if (!isHexDigit(char1) || !isHexDigit(char2)) {
                return false;
            }
        }
        
        return true;
    }



    function isValidImage(string memory imgData) internal pure returns (bool) {
        
        // 100 px * 4 byte / px * 2 ascii char * 1 byte / ascii char
        bool validLength = bytes(imgData).length == 800;
        if (!validLength) {
            return false;
        }

        // string should encode bytes
        return isValidHexString(imgData);
    }


    function mintCustomNft(
        // uint256 tokenId,
        address _to,
        string memory imageData,
        uint8 row,
        uint8 col,
        string memory youtube,
        string memory x,
        string memory instagram,
        string memory facebook,
        string memory warpcast
    ) public {
        require(isValidImage(imageData), "ERC721: bad imageData");
        require(bytes(youtube).length <= 64, "ERC721: YouTube username must be 64 characters or less");
        require(bytes(x).length <= 64, "ERC721: X username must be 64 characters or less");
        require(bytes(instagram).length <= 64, "ERC721: Instagram username must be 64 characters or less");
        require(bytes(facebook).length <= 64, "ERC721: Facebook username must be 64 characters or less");
        require(bytes(warpcast).length <= 64, "ERC721: Warpcast username must be 64 characters or less");
        require(!_mintedPositions[row][col], "ERC721: Position already minted");

        uint256 tokenId = nextTokenIdToMint();
        setTokenData(tokenId, imageData, row, col, youtube, x, instagram, facebook, warpcast);
        _setTokenURI(tokenId, tokenURI(tokenId));
        _safeMint(_to, 1);
        assert(_exists(tokenId));
    }
}
