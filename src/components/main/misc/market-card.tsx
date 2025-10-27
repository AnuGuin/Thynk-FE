import { Card, CardContent, CardFooter, CardHeader } from "../../ui/card";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { contract } from "@/constant/contract";
import { MarketCardSkeleton } from "./market-card-skeleton";
import { MarketInvalid } from "./market-invalid";
import { Clock, TrendingUp } from "lucide-react";
import { MarketPending } from "./market-pending";
import { MarketBuyInterface } from "./market-buy-interface";
import { ProposerActions } from "./proposer-actions";
import { MarketResolved } from "./market-resolved";
import { MarketSharesDisplay } from "./market-shares-display";

interface MarketCardProps {
    market: {
        id: number;
        question: string;
        optionA: string;
        optionB: string;
        endTime: bigint;
        outcome: number;
        totalOptionAShares: bigint;
        totalOptionBShares: bigint;
        resolved: boolean;
        feesForCreator: bigint;
        description: string;
        image_url: string;
    };
    filter: 'active' | 'pending' | 'resolved' | 'all';
}

export function MarketCard({ market, filter }: MarketCardProps) {
    const account = useActiveAccount();
    const [sharesBalance, setSharesBalance] = useState<{
      optionAShares: bigint;
      optionBShares: bigint;
    } | null>(null);

    // Explicitly type the return value of params
    const { data: sharesBalanceData, refetch: refetchSharesBalance } = useReadContract({
        contract,
        method: "function getSharesBalance(uint256 _marketId, address _user) view returns (uint256 optionAShares, uint256 optionBShares)",
        params: async (): Promise<readonly [bigint, string]> => {
            if (market && account?.address) {
                return [BigInt(market.id), account.address];
            }
            throw new Error("Market or account is undefined");
        },
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (account?.address) {
                refetchSharesBalance();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [account?.address, refetchSharesBalance]);

    useEffect(() => {
        if (sharesBalanceData) {
            setSharesBalance({
                optionAShares: sharesBalanceData[0],
                optionBShares: sharesBalanceData[1],
            });
        }
    }, [sharesBalanceData]);

    // Add a fallback for market-dependent calculations
    const isExpired = market ? new Date(Number(market.endTime) * 1000) < new Date() : false;
    const isResolved = market ? market.resolved : false;

    const shouldShow = () => {
        if (!market) return false;
        switch (filter) {
                case 'all':
                    return true;
            case 'active': return !isExpired && !isResolved;
            case 'pending': return isExpired && !isResolved;
            case 'resolved': return isResolved;
            default: return true;
        }
    };

    if (!shouldShow()) return null;

    const totalVolumeBigInt = market ? market.totalOptionAShares + market.totalOptionBShares : BigInt(0);
    const totalVolume = Number(totalVolumeBigInt) / 1e6;

    const formatVolume = (vol: number): string => {
      if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
      if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
      return vol.toString();
    };

    const percentage = market && totalVolume > 0
        ? Math.round((Number(market.totalOptionAShares) / Number(totalVolumeBigInt)) * 100)
        : 50;

    const formatEndTime = (endTime: bigint) => {
        const date = new Date(Number(endTime) * 1000);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        
        if (diff < 0) return "Ended";
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h`;
        return `${Math.floor(diff / (1000 * 60))}m`;
    };

    const isLoadingMarketData = false; // Placeholder until proper logic is added
    const marketDetails = {
      description: market.description,
      image_url: market.image_url,
    };

    return (
        <Card className="group relative overflow-hidden border-neutral-200 bg-linear-to-br from-white to-neutral-50 transition-all duration-300 hover:shadow-xl hover:border-neutral-300 dark:border-neutral-700">
            {isLoadingMarketData ? (
                <MarketCardSkeleton />
            ) : (
                <>
                    {/* Header with Image Banner */}
                    <CardHeader className="p-0">
                        <div className="relative h-40 w-full overflow-hidden bg-linear-to-br from-purple-500 via-pink-500 to-orange-500">
                            <Image
                                src={market.image_url}
                                alt="Market image"
                                fill
                                className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src !== '/defaultimg.jpg') {
                                        target.src = '/defaultimg.jpg';
                                    }
                                }}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                            
                            {/* Time Badge */}
                            {market && (
                                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                    <Clock className="h-3 w-3" />
                                    {formatEndTime(market.endTime)}
                                </div>
                            )}
                        </div>
                        
                        {/* Question */}
                        <div className="p-6 pb-4">
                            <h3 className="text-xl font-bold leading-tight text-neutral-900 dark:text-white">
                                {market.question}
                            </h3>
                            {marketDetails?.description && (
                                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    {marketDetails.description}
                                </p>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 px-6 pb-6">
                        {/* Progress Bar with Percentages */}
                        {market && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                        {percentage}%
                                    </span>
                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                        {100 - percentage}%
                                    </span>
                                </div>
                                
                                <div className="relative h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                    <div
                                        className="absolute left-0 top-0 h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    <div
                                        className="absolute right-0 top-0 h-full rounded-full bg-linear-to-r from-pink-500 to-rose-500 transition-all duration-500"
                                        style={{ width: `${100 - percentage}%` }}
                                    />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                        {market.optionA}
                                    </span>
                                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                        {market.optionB}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Section */}
                        {(() => {
                            if (!market?.resolved) {
                                if (isExpired) {
                                    return <MarketPending/>;
                                } else {
                                    return <MarketBuyInterface marketId={market.id} market={market!} />;
                                }
                            } else {
                                if (market!.outcome === 3) {
                                    return <MarketInvalid marketId={market.id} />;
                                } else {
                                    const hasWinnings = (() => {
                                        if (!sharesBalance) return false;
                                        const winningOption = market!.outcome === 1 ? 'A' : 'B';
                                        const userWinningShares = winningOption === 'A' ? sharesBalance.optionAShares : sharesBalance.optionBShares;
                                        return userWinningShares > BigInt(0);
                                    })();

                                    if (hasWinnings) {
                                        return (
                                            <div className="space-y-3">
                                                <ProposerActions
                                                    marketId={market.id}
                                                    outcome={market!.outcome}
                                                    optionA={market!.optionA}
                                                    optionB={market!.optionB}
                                                    feesEarned={market!.feesForCreator}
                                                />
                                                <MarketResolved
                                                    marketId={market.id}
                                                    outcome={market!.outcome}
                                                    optionA={market!.optionA}
                                                    optionB={market!.optionB}
                                                    sharesBalance={sharesBalance}
                                                />
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <MarketResolved
                                                marketId={market.id}
                                                outcome={market!.outcome}
                                                optionA={market!.optionA}
                                                optionB={market!.optionB}
                                                sharesBalance={sharesBalance}
                                            />
                                        );
                                    }
                                }
                            }
                        })()}
                    </CardContent>

                    {/* Footer */}
                    <CardFooter className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="flex items-center gap-4">
                            {market && sharesBalance && (
                                <MarketSharesDisplay
                                    market={{
                                        ...market,
                                        outcome: market.outcome,
                                        resolved: market.resolved
                                    }}
                                    sharesBalance={sharesBalance}
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            <TrendingUp className="h-4 w-4" />
                            <span>${formatVolume(totalVolume)}</span>
                        </div>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}