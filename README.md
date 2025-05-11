
# Sepolia-compatible Anvil nodes Docker Simulation with Asset Management

## Prerequisite

- Node.js
- ethers.js
- Docker
  
## Features

- Two Sepolia-compatible Anvil nodes in Docker
- Node interaction via JavaScript (`ethers.js`)
- Smart contract to register `.obj` assets on-chain
- `(IN WORKS)` Assets saved to an S3 bucket, associated with Ethereum addresses

## Structure

- `docker-compose.yml`: Starts two Anvil nodes
- `Contract/test.js`: Script to deploy the contract and test contract interactions
- `Contract/`: Contains ABI and Solidity sources
- `node_modules/`: Stores Dependencies

## Run Instructions

1. **Start Nodes:**
   ```bash
   docker-compose up 
   ```
   
2. **Run Script:**
   ```bash
   node test.js
   ```

This creates a new token with an example URL of the file's location and registers it on the chain.
