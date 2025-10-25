'use client'

import { useState } from "react";
import { useActiveAccount, useSendTransaction, useReadContract } from "thirdweb/react";
import { prepareContractCall, parseEventLogs, prepareEvent, waitForReceipt } from "thirdweb";
import { approve } from "thirdweb/extensions/erc20";
import { contract, tokenContract } from "@/constant/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, AlertCircle, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProposeMarketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onMarketCreated: () => void;
}

const MARKET_TAGS = ['Crypto', 'Sports', 'Politics', 'Environment', 'Misc', 'Gaming'];

export function ProposeMarketForm({ isOpen, onClose, onMarketCreated }: ProposeMarketFormProps) {
  const account = useActiveAccount();
  const { toast } = useToast();
  const { mutate: sendTransaction, isPending: isTransactionPending } = useSendTransaction();

  // Check user's USDC balance
  const { data: usdcBalance } = useReadContract({
    contract: tokenContract,
    method: "function balanceOf(address account) view returns (uint256)",
    params: [account?.address || "0x0000000000000000000000000000000000000000"] as const,
  });

  const [formData, setFormData] = useState({
    question: "",
    optionA: "",
    optionB: "",
    resolutionTimestamp: "",
    description: "",
    tag: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isApproving, setIsApproving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const requiredUSDC = BigInt(100000000); // 100 USDC with 6 decimals
  const hasEnoughBalance = usdcBalance ? usdcBalance >= requiredUSDC : false;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage || !account) return null;

    try {
      setIsUploading(true);
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Date.now()}-${account.address}.${fileExt}`;

      const { error } = await supabase.storage
        .from('market-images')
        .upload(fileName, selectedImage);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('market-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.question.trim()) return "Question is required";
    if (!formData.optionA.trim()) return "Option A is required";
    if (!formData.optionB.trim()) return "Option B is required";
    if (!formData.resolutionTimestamp) return "Resolution time is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.tag) return "Please select a tag";
    if (!selectedImage) return "Image is required";

    const resolutionTime = new Date(formData.resolutionTimestamp).getTime();
    const now = Date.now();

    if (resolutionTime <= now) return "Resolution time must be in the future";

    // Minimum 1 hour, maximum 30 days
    const oneHour = 60 * 60 * 1000;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    if (resolutionTime - now < oneHour) return "Market must run for at least 1 hour";
    if (resolutionTime - now > thirtyDays) return "Market cannot run for more than 30 days";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Upload image to Supabase storage
      toast({
        title: "Uploading Image",
        description: "Please wait while we upload your image...",
      });

      const imageUrl = await uploadImage();
      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      toast({
        title: "Image Uploaded",
        description: "Now approving USDC for market creation...",
      });

      setIsApproving(true);

      // Step 2: Approve USDC transfer
      const approveTx = approve({
        contract: tokenContract,
        spender: contract.address,
        amount: requiredUSDC.toString(),
      });

      await new Promise((resolve, reject) => {
        sendTransaction(approveTx, {
          onSuccess: (result) => {
            console.log("Approval successful:", result);
            resolve(result);
          },
          onError: (error) => {
            console.error("Approval failed:", error);
            reject(error);
          }
        });
      });

      setIsApproving(false);

      toast({
        title: "USDC Approved",
        description: "Now creating your market on-chain...",
      });

      // Step 3: Send on-chain transaction to propose market
      const resolutionTimestamp = Math.floor(new Date(formData.resolutionTimestamp).getTime() / 1000);

      const proposeTx = prepareContractCall({
        contract,
        method: "function proposeMarket(string _question, string _optionA, string _optionB, uint256 _resolutionTimestamp) returns (uint256)",
        params: [
          formData.question.trim(),
          formData.optionA.trim(),
          formData.optionB.trim(),
          BigInt(resolutionTimestamp)
        ],
      });

      const txResult = await new Promise<{ transactionHash: `0x${string}` }>((resolve, reject) => {
        sendTransaction(proposeTx, {
          onSuccess: (result) => {
            console.log("Market creation transaction sent:", result);
            resolve(result);
          },
          onError: (error) => {
            console.error("Market creation transaction failed:", error);
            reject(error);
          }
        });
      });

      const receipt = await waitForReceipt({
        transactionHash: txResult.transactionHash,
        chain: contract.chain,
        client: contract.client,
      });

      // Parse event logs to get marketId
      let marketId: bigint | null = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries && !marketId) {
        try {
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }

          const marketCreatedEvent = prepareEvent({
            signature: "event MarketCreated(uint256 indexed marketId, address indexed proposer, string question, uint256 endTime)",
          });

          const events = parseEventLogs({
            logs: receipt.logs,
            events: [marketCreatedEvent],
          });

          if (events.length > 0) {
            marketId = events[0].args.marketId;
          } else {
            throw new Error("MarketCreated event not found in transaction logs.");
          }
        } catch (e) {
          console.error(`Failed to parse logs (attempt ${retryCount + 1}/${maxRetries}):`, e);
          retryCount++;

          if (retryCount >= maxRetries) {
            throw new Error("Failed to parse transaction logs to get market ID after multiple attempts.");
          }
        }
      }

      if (!marketId) {
        throw new Error("Failed to extract market ID from transaction logs.");
      }

      toast({
        title: "Market Created Successfully!",
        description: "Your market has been created on-chain. Saving additional details...",
      });

      // Reset form and close modal
      setFormData({
        question: "",
        optionA: "",
        optionB: "",
        resolutionTimestamp: "",
        description: "",
        tag: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
      onMarketCreated();

      // Step 4: Save off-chain data to API
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          market_id: Number(marketId),
          description: formData.description.trim(),
          image_url: imageUrl,
          proposer_address: account.address,
          tag: formData.tag,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save market details');
      }

      toast({
        title: "Details Saved",
        description: "Market image and description have been saved.",
      });

    } catch (error) {
      console.error("Error proposing market:", error);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "There was an error creating your market. Please try again.",
        variant: "destructive",
      });
      setIsApproving(false);
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Propose a New Market</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="What do you want to predict?"
              value={formData.question}
              onChange={(e) => handleInputChange("question", e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about your market..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="tag">Category Tag</Label>
            <Select
              value={formData.tag}
              onValueChange={(value) => handleInputChange("tag", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {MARKET_TAGS.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image">Market Image</Label>
            <div className="flex flex-col space-y-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {imagePreview && (
                <div className="relative h-48 w-full">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="rounded-lg border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute right-2 top-2 z-10"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="optionA">Option A</Label>
              <Input
                id="optionA"
                placeholder="Yes / Option A"
                value={formData.optionA}
                onChange={(e) => handleInputChange("optionA", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="optionB">Option B</Label>
              <Input
                id="optionB"
                placeholder="No / Option B"
                value={formData.optionB}
                onChange={(e) => handleInputChange("optionB", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="resolutionTime">Resolution Time</Label>
            <Input
              id="resolutionTime"
              type="datetime-local"
              value={formData.resolutionTimestamp}
              onChange={(e) => handleInputChange("resolutionTimestamp", e.target.value)}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Market must end between 1 hour and 30 days from now
            </p>
          </div>

          <div className="space-y-2 rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              <strong>Stake Required:</strong> 100 USDC will be locked as collateral. You will get it back if your market is resolved fairly, or it may be slashed for invalid/spam markets.
            </p>
            {usdcBalance !== undefined && (
              <div className="text-sm">
                <span className="text-muted-foreground">Your USDC Balance: </span>
                <span className={hasEnoughBalance ? "font-medium text-green-600" : "font-medium text-red-600"}>
                  {(Number(usdcBalance) / 1e6).toFixed(2)} USDC
                </span>
              </div>
            )}
            {!hasEnoughBalance && usdcBalance !== undefined && (
              <div className="flex items-start gap-2 rounded bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950/20">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Insufficient USDC balance. You need 100 USDC to create a market. 
                  Please get testnet USDC from a faucet first.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isApproving || isTransactionPending || isUploading || !hasEnoughBalance}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Image...
                </>
              ) : isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving USDC...
                </>
              ) : isTransactionPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Market...
                </>
              ) : !hasEnoughBalance ? (
                "Insufficient USDC"
              ) : (
                "Create Market"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}