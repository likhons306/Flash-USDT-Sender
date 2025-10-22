"use client";

import { useState, useEffect } from "react";
import { ethers, BrowserProvider, Signer } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Official USDT contract address on Ethereum Mainnet
const USDT_CONTRACT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const USDT_ABI = ["function transfer(address to, uint amount)"];

export default function Sender() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    setError("");
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const walletSigner = await browserProvider.getSigner();
        const address = await walletSigner.getAddress();

        setProvider(browserProvider);
        setSigner(walletSigner);
        setWalletAddress(address);
      } catch (err) {
        setError("Failed to connect wallet. Please try again.");
        console.error("Wallet connection error:", err);
      }
    } else {
      setError("MetaMask is not installed. Please install it to continue.");
    }
  };

  const handleInputChange = (setter) => (e) => {
    setError("");
    setSuccess("");
    setTxHash("");
    setter(e.target.value);
  };

  const handleSend = async () => {
    setError("");
    if (!ethers.isAddress(recipient)) {
      setError("Invalid recipient address.");
      return;
    }

    const usdtAmount = parseFloat(amount);
    if (isNaN(usdtAmount) || usdtAmount <= 0) {
      setError("Invalid amount. Please enter a positive number.");
      return;
    }

    setIsConfirming(true);
  };

  const confirmTransaction = async () => {
    if (!signer) {
      setError("Wallet not connected.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    setTxHash("");
    setIsConfirming(false);

    try {
      const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);

      const tx = await usdtContract.transfer(
        recipient,
        ethers.parseUnits(amount, 6) // USDT has 6 decimal places
      );

      setTxHash(tx.hash);
      setSuccess("Transaction successful! Waiting for confirmation...");

      await tx.wait(); // Wait for the transaction to be mined
      setSuccess("Transaction confirmed!");

    } catch (err) {
      setError("Transaction failed. Check the console for details.");
      console.error("Transaction Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-lg rounded-xl bg-gray-800 p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-4xl font-extrabold tracking-tight">
          Flash USDT Sender
        </h1>

        {!signer ? (
          <div className="text-center">
            <p className="mb-4">Please connect your wallet to proceed.</p>
            <Button onClick={connectWallet} className="w-full text-lg font-bold">
              Connect Wallet
            </Button>
            {error && <p className="mt-4 text-center text-red-500">{error}</p>}
          </div>
        ) : (
          <>
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-400">Connected as:</p>
              <p className="font-mono text-lg">{walletAddress}</p>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="recipient" className="text-lg font-semibold">
                  Recipient Address
                </Label>
                <Input
                  id="recipient"
                  placeholder="Enter recipient's wallet address"
                  value={recipient}
                  onChange={handleInputChange(setRecipient)}
                  className="mt-2 bg-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="amount" className="text-lg font-semibold">
                  Amount (USDT)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleInputChange(setAmount)}
                  className="mt-2 bg-gray-700 text-white"
                />
              </div>
            </div>

            {error && <p className="mt-4 text-center text-red-500">{error}</p>}
            {success && <p className="mt-4 text-center text-green-500">{success}</p>}
            {txHash && (
              <p className="mt-2 text-center text-sm">
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  View on Etherscan
                </a>
              </p>
            )}

            <Button
              onClick={handleSend}
              disabled={isLoading}
              className="mt-8 w-full text-lg font-bold"
            >
              {isLoading ? "Sending..." : "Send USDT"}
            </Button>
          </>
        )}

        <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
          <DialogContent className="bg-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Confirm Transaction
              </DialogTitle>
              <DialogDescription>
                You are about to send {amount} USDT to {recipient}. Please verify the details in your wallet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirming(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button onClick={confirmTransaction}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Add window.ethereum type definition for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
