import { prepareContractCall } from "thirdweb";
import { useSendAndConfirmTransaction } from "thirdweb/react";
import { contract } from "@/constant/contract";
import { Trophy, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SharesBalance {
    optionAShares: bigint;
    optionBShares: bigint;
}

interface MarketResolvedProps {
    marketId: number;
    outcome: number;
    optionA: string;
    optionB: string;
    sharesBalance?: SharesBalance;
}

export function MarketResolved({
    marketId,
    outcome,
    optionA,
    optionB,
    sharesBalance
}: MarketResolvedProps) {
    const { mutateAsync: mutateTransaction } = useSendAndConfirmTransaction();

    // Determine user participation and outcome
    const userParticipation = (() => {
        if (!sharesBalance) return null;

        const winningOption = outcome === 1 ? 'A' : 'B';
        const userWinningShares = winningOption === 'A' ? sharesBalance.optionAShares : sharesBalance.optionBShares;
        const userLosingShares = winningOption === 'A' ? sharesBalance.optionBShares : sharesBalance.optionAShares;

        if (userWinningShares > BigInt(0)) {
            return 'winner';
        } else if (userLosingShares > BigInt(0)) {
            return 'loser';
        }

        return null; // Didn't participate
    })();

    const handleClaimRewards = async () => {
        try {
            const tx = await prepareContractCall({
                contract,
                method: "function claimWinnings(uint256 _marketId)",
                params: [BigInt(marketId)]
            });

            await mutateTransaction(tx);
        } catch (error) {
            console.error(error);
        }
    };

    const winningOutcome = outcome === 1 ? optionA : optionB;

    return (
        <div className="space-y-3">
            <div className="relative overflow-hidden rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:border-emerald-900 dark:from-emerald-950/30 dark:to-teal-950/30">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/50">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                            Market Resolved
                        </h3>
                        <p className="mt-0.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            Winner: {winningOutcome}
                        </p>
                    </div>
                </div>
            </div>

            {userParticipation === 'winner' ? (
                <Button
                    onClick={handleClaimRewards}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 font-medium text-white transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg"
                    size="lg"
                >
                    <Trophy className="mr-2 h-4 w-4" />
                    Claim Your Winnings
                </Button>
            ) : userParticipation === 'loser' ? (
                <div className="relative overflow-hidden rounded-lg border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-4 dark:border-rose-900 dark:from-rose-950/30 dark:to-pink-950/30">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <div className="rounded-full bg-rose-100 p-2 dark:bg-rose-900/50">
                                <X className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-rose-900 dark:text-rose-100">
                                Better luck next time
                            </p>
                            <p className="mt-0.5 text-sm text-rose-700 dark:text-rose-300">
                                Your prediction was incorrect
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
