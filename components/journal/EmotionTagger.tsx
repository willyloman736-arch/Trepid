'use client'

import { Emotion } from '@/types'
import { cn } from '@/lib/utils'

const EMOTIONS: { id: Emotion; label: string; color: string }[] = [
  { id: 'CONFIDENT', label: 'Confident', color: '#30D158' },
  { id: 'NEUTRAL', label: 'Neutral', color: '#007AFF' },
  { id: 'FOMO', label: 'FOMO', color: '#FF9F0A' },
  { id: 'REVENGE', label: 'Revenge', color: '#FF3B30' },
  { id: 'FEAR', label: 'Fear', color: '#BF5AF2' },
  { id: 'BOREDOM', label: 'Boredom', color: '#8E8E93' },
  { id: 'GREEDY', label: 'Greedy', color: '#FFD60A' },
  { id: 'FRUSTRATED', label: 'Frustrated', color: '#FF2D55' },
]

interface EmotionTaggerProps {
  value: Emotion
  onChange: (e: Emotion) => void
}

export function EmotionTagger({ value, onChange }: EmotionTaggerProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {EMOTIONS.map((emo) => {
        const active = value === emo.id
        return (
          <button
            key={emo.id}
            type="button"
            onClick={() => onChange(emo.id)}
            className={cn(
              'relative px-3 py-3 rounded-[14px] text-left transition-all text-[13px] font-semibold',
              active
                ? 'text-white shadow-md'
                : 'bg-white/[0.05] text-label-secondary hover:bg-white/[0.1]'
            )}
            style={
              active
                ? {
                    background: emo.color,
                    boxShadow: `0 4px 14px ${emo.color}55`,
                  }
                : undefined
            }
          >
            <div
              className="w-2 h-2 rounded-full mb-2"
              style={{
                backgroundColor: active ? 'rgba(255,255,255,0.9)' : emo.color,
                boxShadow: active ? 'none' : `0 0 6px ${emo.color}60`,
              }}
            />
            {emo.label}
          </button>
        )
      })}
    </div>
  )
}
