const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  const B_balance = await provider.getBalance(wallet.address);
  console.log("Before Balance:", B_balance.toString());

  const compiled = require("./AssetManager.json");
  const abi = compiled.abi;
  const bytecode = compiled.bytecode;

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const A_balance = await provider.getBalance(wallet.address);
  console.log("After Balance:", A_balance.toString());

  console.log("Contract deployed to:", contract.target);
}

main().catch(console.error);
