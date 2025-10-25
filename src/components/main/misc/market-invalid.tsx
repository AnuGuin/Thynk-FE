import { Button } from "@/components/ui/button";
import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract } from "@/constant/contract";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";

interface MarketInvalidProps {
  marketId: number;
}

export function MarketInvalid({ marketId }: MarketInvalidProps) {
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const { toast } = useToast();

  const handleClaimRefund = async () => {
    try {
      const tx = prepareContractCall({
        contract,
        method: "function claimRefund(uint256 _marketId)",
        params: [BigInt(marketId)],
      });

      await sendTransaction(tx);

      toast({
        title: "Refund Claimed!",
        description: "Your funds have been successfully refunded.",
      });
    } catch (error) {
      console.error("Error claiming refund:", error);
      toast({
        title: "Claim Failed",
        description: "There was an error claiming your refund. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-4 dark:border-red-900 dark:from-red-950/30 dark:to-orange-950/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/50">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              Market Invalid
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              This market was deemed invalid or unresolvable. All participants can claim a full refund.
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleClaimRefund}
        disabled={isPending}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 font-medium text-white transition-all hover:from-red-600 hover:to-orange-600 hover:shadow-lg"
        size="lg"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Claiming Refund...
          </>
        ) : (
          "Claim Full Refund"
        )}
      </Button>
    </div>
  );
}
