"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Activity, Clock, CheckCircle2 } from "lucide-react";

interface TabItem {
    id: 'active' | 'pending' | 'resolved';
    title: string;
    icon: React.ReactNode;
    color: string;
}

const MARKET_TABS: TabItem[] = [
    {
        id: "active",
        title: "Active",
        icon: <Activity className="h-4 w-4" />,
        color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
        id: "pending",
        title: "Pending Resolution",
        icon: <Clock className="h-4 w-4" />,
        color: "bg-amber-500 hover:bg-amber-600",
    },
    {
        id: "resolved",
        title: "Resolved",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "bg-blue-500 hover:bg-blue-600",
    },
];

interface SmoothTabProps {
    activeTab?: 'active' | 'pending' | 'resolved';
    onChange?: (tabId: 'active' | 'pending' | 'resolved') => void;
    className?: string;
}

export default function SmoothTab({
    activeTab = 'active',
    onChange,
    className,
}: SmoothTabProps) {
    const [selected, setSelected] = React.useState<'active' | 'pending' | 'resolved'>(activeTab)
    const [dimensions, setDimensions] = React.useState({ width: 0, left: 0 })

    const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        setSelected(activeTab)
    }, [activeTab])

    React.useLayoutEffect(() => {
        const updateDimensions = () => {
            const selectedButton = buttonRefs.current.get(selected)
            const container = containerRef.current

            if (selectedButton && container) {
                const rect = selectedButton.getBoundingClientRect()
                const containerRect = container.getBoundingClientRect()

                setDimensions({
                    width: rect.width,
                    left: rect.left - containerRect.left,
                })
            }
        }

        requestAnimationFrame(() => {
            updateDimensions()
        })

        window.addEventListener("resize", updateDimensions)
        return () => window.removeEventListener("resize", updateDimensions)
    }, [selected])

    const handleTabClick = (tabId: 'active' | 'pending' | 'resolved') => {
        setSelected(tabId)
        onChange?.(tabId)
    }

    const selectedItem = MARKET_TABS.find((item) => item.id === selected)

    return (
        <div
            ref={containerRef}
            role="tablist"
            aria-label="Market tabs"
            className={cn(
                "relative flex items-center gap-1 rounded-xl border bg-background p-1",
                className
            )}
        >
            {/* Sliding Background */}
            <motion.div
                className={cn(
                    "absolute rounded-lg z-[1]",
                    selectedItem?.color || "bg-blue-500"
                )}
                initial={false}
                animate={{
                    width: dimensions.width - 8,
                    x: dimensions.left + 4,
                    opacity: 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                }}
                style={{ height: "calc(100% - 8px)", top: "4px" }}
            />

            {/* Tabs */}
            <div className="relative z-[2] flex w-full gap-1">
                {MARKET_TABS.map((item) => {
                    const isSelected = selected === item.id
                    return (
                        <motion.button
                            key={item.id}
                            ref={(el) => {
                                if (el) buttonRefs.current.set(item.id, el)
                                else buttonRefs.current.delete(item.id)
                            }}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            onClick={() => handleTabClick(item.id)}
                            className={cn(
                                "relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5",
                                "text-sm font-medium transition-all duration-300",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isSelected
                                    ? "text-white"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            {item.icon}
                            <span>{item.title}</span>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
