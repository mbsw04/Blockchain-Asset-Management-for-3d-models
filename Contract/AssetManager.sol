// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetManager is ERC721, Ownable {
    uint256 public nextTokenId;

    struct Asset {
        string s3Url;
        address[] usageRights;
        mapping(address => bool) hasUsageRight;
    }

    mapping(uint256 => Asset) private assets;

    event AssetMinted(uint256 indexed tokenId, address indexed to, string s3Url, string description);
    event UsageRightGranted(uint256 indexed tokenId, address indexed user, string description);
    event UsageRightsGrantedBulk(uint256 indexed tokenId, address[] users, string description);
    event UsageRightRevoked(uint256 indexed tokenId, address indexed user, string description);
    event TransferWithDescription(address indexed from, address indexed to, uint256 indexed tokenId, string description);

    constructor() ERC721("GLBAsset", "GLBA") Ownable(msg.sender) {}

    function mint(string memory s3Url, address to, string memory description) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextTokenId;
        _mint(to, tokenId);
        assets[tokenId].s3Url = s3Url;
        nextTokenId++;
        emit AssetMinted(tokenId, to, s3Url, description);
        return tokenId;
    }

    function grantUsageRight(uint256 tokenId, address user, string memory description) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        Asset storage asset = assets[tokenId];
        if (!asset.hasUsageRight[user]) {
            asset.usageRights.push(user);
            asset.hasUsageRight[user] = true;
            emit UsageRightGranted(tokenId, user, description);
        }
    }

    function grantUsageRights(uint256 tokenId, address[] memory users, string memory description) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        Asset storage asset = assets[tokenId];
        for (uint256 i = 0; i < users.length; i++) {
            if (!asset.hasUsageRight[users[i]]) {
                asset.usageRights.push(users[i]);
                asset.hasUsageRight[users[i]] = true;
            }
        }
        emit UsageRightsGrantedBulk(tokenId, users, description);
    }

    function revokeUsageRight(uint256 tokenId, address user, string memory description) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        Asset storage asset = assets[tokenId];
        if (asset.hasUsageRight[user]) {
            asset.hasUsageRight[user] = false;
            emit UsageRightRevoked(tokenId, user, description);
        }
    }

    function transferWithDescription(address to, uint256 tokenId, string memory description) external {
        require(_isApprovedOrOwnerInternal(msg.sender, tokenId), "Not approved or owner");
        safeTransferFrom(msg.sender, to, tokenId);
        emit TransferWithDescription(msg.sender, to, tokenId, description);
    }

    // ✅ Local internal version of _isApprovedOrOwner (since we can't access ERC721's version externally)
    function _isApprovedOrOwnerInternal(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    function hasUsage(uint256 tokenId, address user) external view returns (bool) {
        return assets[tokenId].hasUsageRight[user];
    }

    function getAsset(uint256 tokenId) external view returns (string memory, address[] memory) {
        Asset storage asset = assets[tokenId];
        return (asset.s3Url, asset.usageRights);
    }
}
