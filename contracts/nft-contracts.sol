// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract OnChainThirdweb is ERC721Base {
    struct TokenData {
        string imageData;
        uint256 row;
        uint256 col;
    }

    mapping(uint256 => TokenData) private tokenDataMap;

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

    function setTokenData(uint256 tokenId, string memory imageData, uint256 row, uint256 col) public {
        require(_exists(tokenId), "ERC721: token does not exist");
        require(ownerOf(tokenId) == msg.sender, "ERC721: caller is not the owner");
        tokenDataMap[tokenId] = TokenData(imageData, row, col);
    }

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
    TokenData memory data = tokenDataMap[tokenId];
    string memory json = string(abi.encodePacked(
        '{"name": "Web3 Card: ', toString(tokenId),
        '", "description": "OnChain NFTs created with Thirdweb!", ',
        '"image": "', data.imageData,
        '", "attributes": [',
        '{"trait_type": "Row", "value": "', toString(data.row), '"},',
        '{"trait_type": "Column", "value": "', toString(data.col), '"}',
        ']}'
    ));

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

    function claim(uint256 _amount) public {
        require(_amount > 0 && _amount < 6);
        _safeMint(msg.sender, _amount);
    }
}
