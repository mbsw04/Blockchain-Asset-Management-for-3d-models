// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetManager is ERC721, Ownable {
    uint256 public nextTokenId;

    struct Asset {
        string s3Url; // Link to .glb file
        address[] usageRights;
        mapping(address => bool) hasUsageRight;
    }

    mapping(uint256 => Asset) private assets;

    constructor() ERC721("GLBAsset", "GLBA") Ownable(msg.sender) {}

    // Mint a new asset with S3 URL
    function mint(string memory s3Url, address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextTokenId;
        _mint(to, tokenId);
        assets[tokenId].s3Url = s3Url;
        nextTokenId++;
        return tokenId;
    }

    // Transfer ownership (ERC721 standard already handles this)

    // Add usage rights
    function grantUsageRight(uint256 tokenId, address user) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        Asset storage asset = assets[tokenId];
        if (!asset.hasUsageRight[user]) {
            asset.usageRights.push(user);
            asset.hasUsageRight[user] = true;
        }
    }
 
    // Grant usage rights to multiple users
    function grantUsageRights(uint256 tokenId, address[] memory users) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        Asset storage asset = assets[tokenId];
        for (uint256 i = 0; i < users.length; i++) {
            if (!asset.hasUsageRight[users[i]]) {
                asset.usageRights.push(users[i]);
                asset.hasUsageRight[users[i]] = true;
            }
        }
    }

    // Revoke a usage right
    function revokeUsageRight(uint256 tokenId, address user) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        Asset storage asset = assets[tokenId];
        asset.hasUsageRight[user] = false;
    }

    // View: Check if user has usage rights
    function hasUsage(uint256 tokenId, address user) external view returns (bool) {
        return assets[tokenId].hasUsageRight[user];
    }

    // View: Get asset metadata
    function getAsset(uint256 tokenId) external view returns (string memory, address[] memory) {
        Asset storage asset = assets[tokenId];
        return (asset.s3Url, asset.usageRights);
    }
}
