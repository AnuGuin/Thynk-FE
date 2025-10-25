import { Clock } from "lucide-react";

export function MarketPending() {
    return (
        <div className="relative overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 dark:border-amber-900 dark:from-amber-950/30 dark:to-yellow-950/30">
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                    <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/50">
                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                        Awaiting Resolution
                    </h3>
                    <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-300">
                        Market has ended. Waiting for outcome verification.
                    </p>
                </div>
            </div>
        </div>
    );
}
