const { ethers } = require("ethers");

const contractAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
];

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: node view.js <contract_address>");
    process.exit(1);
  }

  const contractAddress = args[0];
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const contract = new ethers.Contract(contractAddress, contractAbi, provider);

  const accounts = await provider.send("eth_accounts", []);

  console.log(`Token holdings for contract: ${contractAddress}`);

  for (let i = 0; i < Math.min(accounts.length, 20); i++) {
    const address = accounts[i];
    const ethBalance = await provider.getBalance(address);
    let nftBalance = 0;

    try {
      nftBalance = await contract.balanceOf(address);
    } catch (e) {
      nftBalance = 0;
    }

    console.log(`\n#${i} | ${address}`);
    console.log(`- ETH: ${ethers.formatEther(ethBalance)} ETH`);
    console.log(`- NFTs: ${nftBalance}`);

    for (let j = 0; j < nftBalance; j++) {
      try {
        const tokenId = await contract.tokenOfOwnerByIndex(address, j);
        console.log(`  - Token ID: ${tokenId.toString()}`);
      } catch {
        // silently skip if tokenOfOwnerByIndex is unsupported
        break;
      }
    }
  }
}

main().catch(console.error);
