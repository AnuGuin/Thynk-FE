'use client'

import { useState } from "react";
import { useActiveAccount, useReadContract, useSendTransaction, lightTheme, ConnectButton } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { contract, celoSepolia } from "@/constant/contract";
import { client } from "@/app/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PendingMarketItemProps {
  marketId: number;
  onResolve: (marketId: number, outcome: number) => void;
}

function PendingMarketItem({ marketId, onResolve }: PendingMarketItemProps) {
  // Get market data
  const { data: marketData } = useReadContract({
    contract,
    method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved, uint256 feesForCreator)",
    params: [BigInt(marketId)],
  });

  if (!marketData) return null;

  const market = {
    question: marketData[0],
    optionA: marketData[1],
    optionB: marketData[2],
    endTime: marketData[3],
    outcome: marketData[4],
    totalOptionAShares: marketData[5],
    totalOptionBShares: marketData[6],
    resolved: marketData[7],
    feesForCreator: marketData[8]
  };

  // Check if market is expired and not resolved
  const isExpired = new Date(Number(market.endTime) * 1000) < new Date();
  const isResolved = market.resolved;

  if (!isExpired || isResolved) return null;

  return (
    <div className="border rounded-lg p-4 bg-muted/50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1">Market #{marketId}</h4>
          <p className="text-sm font-medium mb-2">{market.question}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Option A:</span> {market.optionA}
            </div>
            <div>
              <span className="font-medium">Option B:</span> {market.optionB}
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Total Shares:</span> A: {Number(market.totalOptionAShares)}, B: {Number(market.totalOptionBShares)}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onResolve(marketId, 1)}
          className="flex-1"
        >
          Resolve: {market.optionA}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onResolve(marketId, 2)}
          className="flex-1"
        >
          Resolve: {market.optionB}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onResolve(marketId, 3)}
          className="flex-1"
        >
          Resolve: Invalid
        </Button>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const account = useActiveAccount();
  const { toast } = useToast();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  // Configure wallets
  const wallets = [
    inAppWallet({
      auth: {
        options: ["google", "email", "passkey", "phone", "apple", "facebook"],
      },
    }),
    createWallet("io.metamask"),
    createWallet("me.rainbow"),
    createWallet("walletConnect"),
    createWallet("app.phantom"),
  ];

  // Authentication handlers
  const handleLogin = async (params: { payload: Record<string, unknown>; signature: string }) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: params.payload,
          signature: params.signature,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("Login successful:", data);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getLoginPayload = async (params: { address: string; chainId: number }) => {
    try {
      const response = await fetch("/api/auth/payload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: params.address,
          chainId: params.chainId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get login payload");
      }

      const payload = await response.json();
      return payload;
    } catch (error) {
      console.error("Get payload error:", error);
      throw error;
    }
  };

  const checkLoginStatus = async () => {
    try {
      const response = await fetch("/api/auth/status");

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.isLoggedIn || false;
    } catch (error) {
      console.error("Status check error:", error);
      return false;
    }
  };

  // Get current stake amount
  const { data: currentStakeAmount } = useReadContract({
    contract,
    method: "function creationStakeAmount() view returns (uint256)",
    params: []
  });

  // Get contract owner
  const { data: contractOwner } = useReadContract({
    contract,
    method: "function owner() view returns (address)",
    params: []
  });

  // Get market count
  const { data: marketCount } = useReadContract({
    contract,
    method: "function marketCount() view returns (uint256)",
    params: []
  });

  const [newStakeAmount, setNewStakeAmount] = useState("");
  const [resolveMarketId, setResolveMarketId] = useState("");
  const [resolveOutcome, setResolveOutcome] = useState("");


  const handleSetStakeAmount = async () => {
    if (!newStakeAmount || parseFloat(newStakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert to 6-decimal USDC format
      const amountInUSDC = BigInt(Math.floor(parseFloat(newStakeAmount) * 10**6));

      const tx = prepareContractCall({
        contract,
        method: "function setCreationStakeAmount(uint256 _newAmount)",
        params: [amountInUSDC],
      });

      await sendTransaction(tx);

      toast({
        title: "Stake Amount Updated",
        description: `New stake amount set to ${newStakeAmount} USDC.`,
      });

      setNewStakeAmount("");
    } catch (error) {
      console.error("Error setting stake amount:", error);
      toast({
        title: "Transaction Failed",
        description: "Failed to update stake amount. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResolveMarket = async () => {
    if (!resolveMarketId || !resolveOutcome) {
      toast({
        title: "Missing Information",
        description: "Please provide both market ID and outcome.",
        variant: "destructive",
      });
      return;
    }

    try {
      const outcomeValue = parseInt(resolveOutcome);

      const tx = prepareContractCall({
        contract,
        method: "function resolveMarket(uint256 _marketId, uint8 _outcome)",
        params: [BigInt(resolveMarketId), outcomeValue],
      });

      await sendTransaction(tx);

      toast({
        title: "Market Resolved",
        description: `Market ${resolveMarketId} has been resolved.`,
      });

      setResolveMarketId("");
      setResolveOutcome("");
    } catch (error) {
      console.error("Error resolving market:", error);
      toast({
        title: "Transaction Failed",
        description: "Failed to resolve market. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-end mb-6">
        <ConnectButton
          auth={{
            doLogin: handleLogin,
            doLogout: handleLogout,
            getLoginPayload: getLoginPayload,
            isLoggedIn: checkLoginStatus,
          }}
          client={client}
          theme={lightTheme()}
          chain={celoSepolia}
          connectButton={{
            label: "Sign In",
          }}
          connectModal={{
            size: "compact",
          }}
          detailsButton={{
            displayBalanceToken: {
              [celoSepolia.id]: "0x01C5C0122039549AD1493B8220cABEdD739BC44E"
            }
          }}
          wallets={wallets}
        />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage contract settings and resolve markets. Only the contract owner can execute admin transactions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Set Stake Amount */}
        <Card>
          <CardHeader>
            <CardTitle>Set Creation Stake Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentStake">Current Stake Amount</Label>
              <div className="text-sm text-muted-foreground">
                {currentStakeAmount ? `${Number(currentStakeAmount) / 10**6} USDC` : "Loading..."}
              </div>
            </div>

            <div>
              <Label htmlFor="newStake">New Stake Amount (USDC)</Label>
              <Input
                id="newStake"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                value={newStakeAmount}
                onChange={(e) => setNewStakeAmount(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSetStakeAmount}
              disabled={isPending || !newStakeAmount}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Stake Amount"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resolve Market */}
        <Card>
          <CardHeader>
            <CardTitle>Resolve Market</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="marketId">Market ID</Label>
              <Input
                id="marketId"
                type="number"
                min="0"
                placeholder="0"
                value={resolveMarketId}
                onChange={(e) => setResolveMarketId(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="outcome">Outcome</Label>
              <select
                id="outcome"
                value={resolveOutcome}
                onChange={(e) => setResolveOutcome(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select outcome</option>
                <option value="1">Option A</option>
                <option value="2">Option B</option>
                <option value="3">Invalid</option>
              </select>
            </div>

            <Button
              onClick={handleResolveMarket}
              disabled={isPending || !resolveMarketId || !resolveOutcome}
              className="w-full"
              variant="destructive"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resolving...
                </>
              ) : (
                "Resolve Market"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Pending Markets for Resolution */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pending Markets (Ready for Resolution)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Markets that have expired and need to be resolved by the admin.
            </p>
          </CardHeader>
          <CardContent>
            {marketCount ? (
              <div className="space-y-4">
                {Array.from({ length: Number(marketCount) }, (_, index) => (
                  <PendingMarketItem
                    key={index}
                    marketId={index}
                    onResolve={(marketId, outcome) => {
                      setResolveMarketId(marketId.toString());
                      setResolveOutcome(outcome.toString());
                      // Scroll to resolve section
                      document.getElementById('resolve-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Loading markets...</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6" id="resolve-section">
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>Contract Address:</strong> {contract.address}</div>
            <div><strong>Owner:</strong> {contractOwner}</div>
            <div><strong>Your Address:</strong> {account?.address}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
