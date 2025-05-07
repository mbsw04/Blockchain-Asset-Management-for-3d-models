
# Sepolia Docker Two-Node Simulation with Asset Management

## Features

- Two Sepolia-compatible Anvil nodes in Docker
- Node interaction via JavaScript (`ethers.js`)
- Smart contract to register `.obj` assets on-chain
- Assets saved to local `./assets/` directory, associated with Ethereum addresses

## Structure

- `docker-compose.yml`: Starts two Anvil nodes
- `interact.js`: Script to create asset and save a local `.obj` file
- `shared/`: Contains ABI and Solidity source
- `assets/`: Stores `.obj` files created

## Run Instructions

1. **Start Nodes:**
   ```bash
   docker-compose up --build
   ```

2. **Deploy Contract (manual step)** using Foundry or Remix and save address to:
   ```
   shared/contract-address.txt
   ```

3. **Run Script:**
   ```bash
   node interact.js
   ```

This creates a new asset, registers it on the chain, and saves a `.obj` file to your host.
