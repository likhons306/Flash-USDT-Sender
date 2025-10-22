"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAccess = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey }),
      });

      if (response.ok) {
        router.push("/sender");
      } else {
        setError("Invalid access key. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-lg">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold">Flash USDT Sender</h1>
          <p className="mb-6 text-gray-400">
            Enter your access key to continue
          </p>
        </div>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Access Key"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            className="bg-gray-700 text-white placeholder-gray-500"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={handleAccess}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Verifying..." : "Unlock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
