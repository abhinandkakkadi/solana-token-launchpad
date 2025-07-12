# Solana Token Launchpad

A simple React application for creating and launching SPL tokens on the Solana blockchain.

## Features

- Connect Solana wallet
- Create custom SPL tokens with metadata
- Set token name, symbol, image, and initial supply
- Mint tokens directly to your wallet
- Built with Token-2022 program

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your Solana wallet
2. **Fill Token Details**:
   - **Token Name**: The full name of your token
   - **Symbol**: Short symbol (e.g., "BTC", "ETH")
   - **Image URL**: URL to your token's logo/image
   - **Initial Supply**: Number of tokens to create
3. **Create Token**: Click "Create Token" to deploy your token

## How It Works

1. Creates a new mint account with Token-2022 program
2. Initializes metadata (name, symbol, image)
3. Sets up token mint with 0 decimal places 
4. Creates associated token account for your wallet
5. Mints initial supply to your wallet

## Dependencies

- `@solana/wallet-adapter-react` - Wallet connection
- `@solana/web3.js` - Solana blockchain interaction
- `@solana/spl-token` - SPL token operations
- `@solana/spl-token-metadata` - Token metadata
