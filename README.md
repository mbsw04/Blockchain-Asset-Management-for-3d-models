
# Sepolia-compatible Anvil nodes Docker Simulation with Asset Management

## Prerequisite

- Node.js
- ethers.js
- AWS SDK
- DOTENV
- Docker
  
## Features

- Two Sepolia-compatible Anvil nodes in Docker
- Node interaction via JavaScript (`ethers.js`)
- Smart contract to register `.glb` assets on-chain
- `(IN WORKS)` Assets saved to an S3 bucket, associated with Ethereum addresses

## Structure

- `docker-compose.yml`: Starts two Anvil nodes
- `Contract/test.js`: Script to deploy the contract and test contract interactions
- `Contract/`: Contains ABI and Solidity sources

## Run Instructions

1. **Add and configure .env:**
   ```bash
   AWS_REGION=your-region
   AWS_S3_BUCKET_NAME=your-bucket
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```
   
2. **Start Nodes:**
   ```bash
   docker-compose up 
   ```
   
3. **Run Script:**
   ```bash
   node test.js
   ```

This creates a new token with a URL of the file's location and registers it on the chain.
