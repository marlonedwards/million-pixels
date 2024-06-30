// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract OnChainThirdweb is ERC721Base {
    struct TokenData {
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
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps
    )
        ERC721Base(
            _name,
            _symbol,
            _royaltyRecipient,
            _royaltyBps
        )
    {}

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
    ) public {
        require(_exists(tokenId), "ERC721: token does not exist");
        require(ownerOf(tokenId) == msg.sender, "ERC721: caller is not the owner");
        require(bytes(imageData).length == 800, "ERC721: imageData must be exactly 800 ascii chars long (2 chars / byte * 4 bytes / px * 100 px)");
        require(bytes(youtube).length <= 64, "ERC721: YouTube username must be 64 characters or less");
        require(bytes(x).length <= 64, "ERC721: X username must be 64 characters or less");
        require(bytes(instagram).length <= 64, "ERC721: Instagram username must be 64 characters or less");
        require(bytes(facebook).length <= 64, "ERC721: Facebook username must be 64 characters or less");
        require(bytes(warpcast).length <= 64, "ERC721: Warpcast username must be 64 characters or less");
        require(!_mintedPositions[row][col], "ERC721: Position already minted");
        
        _safeMint(msg.sender, tokenId);
        tokenDataMap[tokenId] = TokenData(imageData, row, col, youtube, x, instagram, facebook, warpcast);
        _mintedPositions[row][col] = true;
    }

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        TokenData memory data = tokenDataMap[tokenId];
        string memory json = string(abi.encodePacked(
            '{"name": "Plot: ', toString(tokenId),
            '", "description": "Million Pixels on Base", ',
            '"image": "', data.imageData,
            '", "attributes": [',
            '{"trait_type": "Row", "value": "', toString(uint256(data.row)), '"},',
            '{"trait_type": "Column", "value": "', toString(uint256(data.col)), '"}'
        ));
        
        if (bytes(data.youtube).length > 0) {
            json = string(abi.encodePacked(json, ',{"trait_type": "YouTube", "value": "', data.youtube, '"}'));
        }
        if (bytes(data.x).length > 0) {
            json = string(abi.encodePacked(json, ',{"trait_type": "X", "value": "', data.x, '"}'));
        }
        if (bytes(data.instagram).length > 0) {
            json = string(abi.encodePacked(json, ',{"trait_type": "Instagram", "value": "', data.instagram, '"}'));
        }
        if (bytes(data.facebook).length > 0) {
            json = string(abi.encodePacked(json, ',{"trait_type": "Facebook", "value": "', data.facebook, '"}'));
        }
        if (bytes(data.warpcast).length > 0) {
            json = string(abi.encodePacked(json, ',{"trait_type": "Warpcast", "value": "', data.warpcast, '"}'));
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

    function claim(
        uint256 tokenId,
        string memory imageData,
        uint256 row,
        uint256 col,
        string memory youtube,
        string memory x,
        string memory instagram,
        string memory facebook,
        string memory warpcast
    ) public {
        require(!_exists(tokenId), "ERC721: token already exists");
        require(bytes(imageData).length == 800, "ERC721: imageData must be exactly 800 characters long");
        require(bytes(youtube).length <= 64, "ERC721: YouTube username must be 64 characters or less");
        require(bytes(x).length <= 64, "ERC721: X username must be 64 characters or less");
        require(bytes(instagram).length <= 64, "ERC721: Instagram username must be 64 characters or less");
        require(bytes(facebook).length <= 64, "ERC721: Facebook username must be 64 characters or less");
        require(bytes(warpcast).length <= 64, "ERC721: Warpcast username must be 64 characters or less");
        require(!_mintedPositions[row][col], "ERC721: Position already minted");

        _safeMint(msg.sender, tokenId);
        setTokenData(tokenId, imageData, row, col, youtube, x, instagram, facebook, warpcast);(tokenId, imageData, row, col, youtube, x, instagram, facebook, warpcast);
        // tokenDataMap[tokenId] = TokenData(imageData, row, col, youtube, x, instagram, facebook, warpcast);
        // _mintedPositions[row][col] = true;
    }
}
