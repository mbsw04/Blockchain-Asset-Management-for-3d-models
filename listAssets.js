// listAssets.js
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABI and contract address
const ABI = require("./shared/abi.json");
const CONTRACT_ADDRESS = fs.readFileSync("./shared/contract-address.txt", "utf-8").trim();

// Connect to Anvil node
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

async function listAssets(ownerAddress) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
  const balance = await contract.balanceOf(ownerAddress);
  console.log(`\nAssets owned by ${ownerAddress}: ${balance}\n`);

  for (let i = 0; i < balance; i++) {
    const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i);
    const metadata = await contract.getAssetMetadata(tokenId);
    console.log(`- Token ID: ${tokenId}`);
    console.log(`  Name: ${metadata.name}`);
    console.log(`  File: ${metadata.filename}`);
    console.log(`  Creator: ${metadata.creator}`);
    console.log("");
  }
}

const address = process.argv[2];
if (!address) {
  console.error("Usage: node listAssets.js <wallet_address>");
  process.exit(1);
}

listAssets(address).catch(console.error);
