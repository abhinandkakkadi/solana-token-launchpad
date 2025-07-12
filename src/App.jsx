import "./App.css";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { TokenLaunchPad } from "./components/TokenLaunchpad";

function App() {
  return (
    <div>
      <ConnectionProvider endpoint={process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-gray-900 text-white">
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                  <div className="border-b-2 border-gray-300 h-screen flex flex-col items-center justify-center">
                    <div className="border border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-4">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                          Solana Token Launchpad
                        </h1>
                        <p className="text-gray-400">
                          Create your own SPL token on Solana
                        </p>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
                        <div className="flex items-center justify-center gap-4 mb-8">
                          <WalletMultiButton />
                          <WalletDisconnectButton />
                        </div>
                        <TokenLaunchPad />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;
