require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

//const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const START_BLOCK = 0;
const END_BLOCK = "latest";

const ABI = [
  "event AssetMinted(uint256 indexed tokenId, address indexed to, string s3Url, string description)",
  "event UsageRightGranted(uint256 indexed tokenId, address indexed user, string description)",
  "event UsageRightsGrantedBulk(uint256 indexed tokenId, address[] users, string description)",
  "event UsageRightRevoked(uint256 indexed tokenId, address indexed user, string description)",
  "event TransferWithDescription(address indexed from, address indexed to, uint256 indexed tokenId, string description)"
];

(async () => {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const iface = new ethers.Interface(ABI);
  const logs = await provider.getLogs({
    address: CONTRACT_ADDRESS,
    fromBlock: START_BLOCK,
    toBlock: END_BLOCK,
  });

  const results = [];

  for (const log of logs) {
    try {
      const parsed = iface.parseLog(log);
      results.push({
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        event: parsed.name,
        args: parsed.args,
      });
    } catch (err) {
      // skip unrelated events
    }
  }

  fs.writeFileSync(
    "transactions.json",
    JSON.stringify(results, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    2)
  );
  console.log(`✅ Extracted ${results.length} event(s) with descriptions to transactions.json`);
})();
