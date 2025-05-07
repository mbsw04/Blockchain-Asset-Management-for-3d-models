
pragma solidity ^0.8.0;

contract AssetManager {
    uint256 public nextId;
    mapping(uint256 => address) public assetOwner;
    mapping(uint256 => string) public assetFiles;

    event AssetCreated(uint256 assetId, address owner, string filename);
    event AssetTransferred(uint256 assetId, address from, address to);

    function createAsset(string memory filename) public returns (uint256) {
        uint256 assetId = nextId++;
        assetOwner[assetId] = msg.sender;
        assetFiles[assetId] = filename;
        emit AssetCreated(assetId, msg.sender, filename);
        return assetId;
    }

    function transferAsset(uint256 assetId, address to) public {
        require(assetOwner[assetId] == msg.sender, "Not the owner");
        assetOwner[assetId] = to;
        emit AssetTransferred(assetId, msg.sender, to);
    }

    function getAsset(uint256 assetId) public view returns (address, string memory) {
        return (assetOwner[assetId], assetFiles[assetId]);
    }
}
