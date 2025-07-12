const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

const REGION = process.env.AWS_REGION;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadRenamedFile(localFilePath, newFileName) {
  try {
    const fileExt = path.extname(localFilePath);
    const newKey = newFileName + fileExt;
    const fileStream = fs.createReadStream(localFilePath);

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: newKey,
      Body: fileStream,
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
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  const compiled = require("./AssetManager.json");
  const abi = compiled.abi;
  const bytecode = compiled.bytecode;

  console.log("Deploy Process Start....");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  console.log("Contract deployed to:", contract.target);

  console.log("Minting Process Start....");
  const nextTokenId = await contract.nextTokenId();
  const localFilePath = "./test.glb";
  const s3Url = await uploadRenamedFile(localFilePath, Number(nextTokenId));
  const to = wallet.address;
  const descriptionMint = "Minted as onboarding asset.";
  const mintTx = await contract.mint(s3Url, to, descriptionMint);
  await mintTx.wait();
  console.log(`Minted token #${nextTokenId} to ${to}`);

  console.log("Granting Usage Rights Process Start....");
  const otherUser = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const descriptionGrant = "Granted access for preview usage.";
  const grantTx = await contract.grantUsageRight(nextTokenId, otherUser, descriptionGrant);
  await grantTx.wait();
  console.log(`Granted usage right for token #${nextTokenId} to ${otherUser}`);

  const hasRight = await contract.hasUsage(nextTokenId, otherUser);
  console.log(`Does ${otherUser} have usage?`, hasRight);

  console.log("Transfering Token Process Start....");
  const recipient = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const descriptionTransfer = "Transfer for final delivery.";
  const transferTx = await contract.transferWithDescription(recipient, nextTokenId, descriptionTransfer);
  await transferTx.wait();
  console.log(`Transferred token #${nextTokenId} to ${recipient}`);

  const newOwner = await contract.ownerOf(nextTokenId);
  console.log(`New owner of token #${nextTokenId}:`, newOwner);

  console.log("Asset Metadata Stored ON-Chain:");
  const [storedUrl, users] = await contract.getAsset(nextTokenId);
  console.log("Asset URL:", storedUrl);
  console.log("Usage Rights:", users);
}

main().catch(console.error);
