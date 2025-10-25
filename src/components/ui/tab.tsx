"use client";

import * as React from "react";
import { motion } from "framer-motion";

function cn(
  ...inputs: Array<
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, boolean | undefined | null>
  >
): string {
  return inputs
    .flatMap((input) => {
      if (!input && input !== 0) return [];
      if (typeof input === "string" || typeof input === "number") return [String(input)];
      if (typeof input === "boolean") return input ? [""] : [];
      return Object.entries(input)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key);
    })
    .filter(Boolean)
    .join(" ");
}

type TabItemType = {
  id: string;
  label: string;
};

type PillTabsProps = {
  tabs?: TabItemType[];
  defaultActiveId?: string;
  onTabChange?: (id: string) => void;
  className?: string;
};

const MOCK_TABS: TabItemType[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const PillTabs = React.forwardRef<HTMLDivElement, PillTabsProps>(
  (props, ref) => {
    const {
      tabs = MOCK_TABS,
      defaultActiveId = tabs[0]?.id,
      onTabChange,
      className,
    } = props;

    const [activeTab, setActiveTab] = React.useState(defaultActiveId);

    const handleClick = React.useCallback(
      (id: string) => {
        setActiveTab(id);
        onTabChange?.(id);
      },
      [onTabChange]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-1 p-1 bg-background rounded-full border",
          className
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleClick(tab.id)}
            className={cn(
              "relative px-4 py-2 rounded-full transition touch-none",
              "text-sm font-medium",
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="pill-tabs-active-pill"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  }
);

PillTabs.displayName = "PillTabs";

export default PillTabs;
