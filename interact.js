
const fs = require('fs');
const { ethers } = require("ethers");
const abi = require('./shared/abi.json');

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a00f314a14f6b9e3e11", provider); // Anvil default

const contractAddressPath = "./shared/contract-address.txt";

async function main() {
    const bytecode = ""; // Put compiled bytecode here if needed
    const ContractFactory = new ethers.ContractFactory(abi, bytecode, signer);

    let contract;
    if (fs.existsSync(contractAddressPath)) {
        const address = fs.readFileSync(contractAddressPath, "utf8").trim();
        contract = new ethers.Contract(address, abi, signer);
        console.log("Using existing contract at:", address);
    } else {
        console.error("Contract not deployed. Please deploy manually or add address to shared/contract-address.txt.");
        return;
    }

    const filename = "example.obj";
    const assetId = await contract.createAsset(filename);
    const assetIdNum = parseInt(assetId.toString());

    // Simulate saving .obj file
    fs.writeFileSync(`./assets/${assetIdNum}.obj`, "# OBJ file content");

    const [owner, file] = await contract.getAsset(assetIdNum);
    console.log("Asset Created:");
    console.log("  ID:", assetIdNum);
    console.log("  Owner:", owner);
    console.log("  File:", file);
}

main().catch(console.error);
