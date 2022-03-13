// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

// inheriting from ERC721URIStorage because it contains _setTokenURI method
// and ERC721URIStorage inherits from ERC721
contract Cats is ERC721PresetMinterPauserAutoId {
    using Strings for uint256;

    constructor() ERC721PresetMinterPauserAutoId("Cats", "CTS", "https://knivets.com/cats-nft/") {}

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        // calling parent method for security checks
        super.tokenURI(tokenId);

        string memory baseURI = _baseURI();
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }
}
