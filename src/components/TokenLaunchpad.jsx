import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createInitializeInstruction,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  getMintLen,
  ExtensionType,
  TYPE_SIZE,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { pack } from "@solana/spl-token-metadata";
import { useState } from "react";

export function TokenLaunchPad() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  function isNumeric(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
  }

  function isInputValid() {
    if (name === "" || symbol === "" || imageUrl === "") {
        return false
    }

    if (!isNumeric(initialSupply)) {
        return false
    }

    return true
  }

  async function createToken() {
    if (!isInputValid()) {
        setMessage("Please fill all fields with valid data.");
        return
    }

    setIsCreating(true);
    setMessage("");

    try {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error(
          "Wallet not connected or signTransaction not available"
        );
      }

      const mintKeyPair = Keypair.generate();
      const metadata = {
        mint: mintKeyPair.publicKey,
        name: name,
        symbol: symbol,
        uri: imageUrl, // TODO: change
        additionalMetadata: [],
      };

      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeyPair.publicKey,
          lamports,
          space: mintLen,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mintKeyPair.publicKey,
          wallet.publicKey,
          mintKeyPair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          mintKeyPair.publicKey,
          0,
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintKeyPair.publicKey,
          metadata: mintKeyPair.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        })
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.partialSign(mintKeyPair);

      await wallet.sendTransaction(transaction, connection);

      const associatedToken = getAssociatedTokenAddressSync(
        mintKeyPair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintKeyPair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );

      await wallet.sendTransaction(transaction2, connection);

      const transaction3 = new Transaction().add(
        createMintToInstruction(
          mintKeyPair.publicKey,
          associatedToken,
          wallet.publicKey,
          Number(initialSupply),
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      await wallet.sendTransaction(transaction3, connection);

      setMessage("Token created and minted successfully");

      setName("");
      setSymbol("");
      setImageUrl("");
      setInitialSupply("");
    } catch (error) {
      console.error("Error creating token:", error);
      setMessage("Failed to create token. Check console for details.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
          <input
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            type="text"
            placeholder="Token Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!wallet.connected}
          />
          <input
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            type="text"
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            disabled={!wallet.connected}
          />
        </div>
        <input
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          disabled={!wallet.connected}
        />
        <input
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          type="text"
          placeholder="Initial Supply"
          value={initialSupply}
          onChange={(e) => setInitialSupply(e.target.value)}
          disabled={!wallet.connected}
        />
      </div>

      <div className="flex justify-center mb-4">
        <button 
          onClick={createToken} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          disabled={!wallet.connected || isCreating}
        >
          Create Token
        </button>
      </div>

      {message && (
        <div className="text-center">
          <div className={`inline-block px-4 py-2 rounded-lg ${
            message.includes("successfully") 
              ? "bg-green-900 text-green-300 border border-green-700" 
              : "bg-red-900 text-red-300 border border-red-700"
          }`}>
            {message}
          </div>
        </div>
      )}
    </div>
  );
}
