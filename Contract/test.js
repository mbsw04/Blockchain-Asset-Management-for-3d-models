const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const dotenv = require("dotenv")
dotenv.config();

// S3 Configuration
const REGION = process.env.AWS_REGION; // region
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME; // S3 bucket
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


//File Upload function
async function uploadRenamedFile(localFilePath, newFileName) {
  try {
    const fileExt = path.extname(localFilePath);
    const newKey = newFileName + fileExt;
    const fileStream = fs.createReadStream(localFilePath);

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: newKey,
      Body: fileStream,
      //ACL: "public-read", // makes the file publicly accessible
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${newKey}`;
    console.log("Upload successful. Download link:");
    console.log(publicUrl);

    return publicUrl;
  } catch (err) {
    console.error("Upload failed:", err);
  }
}

async function main() {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545"); // process.env.BLOCKCHAIN_ENDPOINT

  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // funded account from Anvil
    provider
  );

  const compiled = require("./AssetManager.json"); // replace with correct path if needed
  const abi = compiled.abi;
  const bytecode = compiled.bytecode;

  // Deploy contract 
  console.log('Deploy Process Start....');

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  console.log("Contract deployed to:", contract.target);

  console.log('Deploy Process END');
  console.log('Minting Process Start....');

  // Mint an asset
  const tokenId = 0;
  const localFilePath = "./test.glb"
  const s3Url = await uploadRenamedFile(localFilePath, tokenId); // "https://example.com/model.glb";
  const to = wallet.address;

  const mintTx = await contract.mint(s3Url, to);
  await mintTx.wait();
  console.log(`Minted token #${tokenId} to ${to}`);

  console.log('Minting Process END');
  console.log('Granting Usage Rights Process Start....');

  // Grant usage right to another account (e.g., second Anvil account)
  const otherUser = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const grantTx = await contract.grantUsageRight(tokenId, otherUser);
  await grantTx.wait();
  console.log(`Granted usage right for token #${tokenId} to ${otherUser}`);

  // Check usage right
  const hasRight = await contract.hasUsage(tokenId, otherUser);
  console.log(`Does ${otherUser} have usage?`, hasRight);

  console.log('Granting Usage Rights Process END');
  console.log('Transfering Token Process Start....');

  // Transfer the token to another address
  const recipient = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const transferTx = await contract.transferFrom(wallet.address, recipient, tokenId);
  await transferTx.wait();
  console.log(`Transferred token #${tokenId} from ${wallet.address} to ${recipient}`);

  // Verify new owner
  const newOwner = await contract.ownerOf(tokenId);
  console.log(`New owner of token #${tokenId}:`, newOwner);

  console.log('Transfering Token Process END');
  console.log('Asset Metadata Stored ON-Chain:');

  // Get asset metadata
  const [storedUrl, users] = await contract.getAsset(tokenId);
  console.log("Asset URL:", storedUrl);
  console.log("Usage Rights:", users);
}

main().catch(console.error);