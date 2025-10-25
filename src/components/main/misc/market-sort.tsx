"use client"

import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface SortComponentProps {
  onSortChange?: (sort: { tag?: string; timing?: string }) => void
}

const SortComponent: React.FC<SortComponentProps> = ({ onSortChange }) => {
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedTiming, setSelectedTiming] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredMenu, setHoveredMenu] = useState<"tags" | "timing" | null>(null)

  const tags = ['Crypto', 'Sports', 'Politics', 'Environment', 'Misc', 'Gaming']
  const timeOptions = ['Newest', 'Oldest', 'Trending', 'Ending']

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag)
    setIsOpen(false)
    onSortChange?.({ tag })
  }

  const handleTimingSelect = (option: string) => {
    setSelectedTiming(option)
    setIsOpen(false)
    onSortChange?.({ timing: option })
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="flex items-center gap-2 rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-750"
      >
        Sort
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {/* Tag Option */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredMenu('tags')}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <div className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-750">
              <span className="text-sm text-neutral-700 dark:text-neutral-200">Tag</span>
              <ChevronRight className="h-4 w-4 text-neutral-400" />
            </div>

            {hoveredMenu === 'tags' && (
              <div className="absolute left-full top-0 z-50 ml-1 w-48 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`cursor-pointer px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-750 ${
                      selectedTag === tag
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                        : 'text-neutral-700 dark:text-neutral-200'
                    }`}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700" />

          {/* Timing Option */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredMenu('timing')}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <div className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-750">
              <span className="text-sm text-neutral-700 dark:text-neutral-200">Timing</span>
              <ChevronRight className="h-4 w-4 text-neutral-400" />
            </div>

            {hoveredMenu === 'timing' && (
              <div className="absolute left-full top-0 z-50 ml-1 w-48 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                {timeOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleTimingSelect(option)}
                    className={`cursor-pointer px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-750 ${
                      selectedTiming === option
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                        : 'text-neutral-700 dark:text-neutral-200'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Display Selected Values */}
      {(selectedTag || selectedTiming) && (
        <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
          {selectedTag && <span className="mr-2">Tag: {selectedTag}</span>}
          {selectedTiming && <span>Sort: {selectedTiming}</span>}
        </div>
      )}
    </div>
  )
}

export default SortComponent