
'use client';
import { cn } from '@/lib/utils';
import React from 'react';
import { GaugePointer } from './gauge-pointer';

interface GaugeProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
}

const MAX_VALUE = 10; // L/min

export function Gauge({ value, size = 'medium', showValue = true }: GaugeProps) {
  const percentage = Math.min(Math.max(value / MAX_VALUE, 0), 1);
  const rotation = percentage * 180 - 90;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div
        className={cn(
          'relative w-24 h-12 overflow-hidden rounded-t-full bg-muted/50',
          {
            'w-20 h-10': size === 'small',
            'w-28 h-14': size === 'large',
          }
        )}
      >
        <div
          className="absolute top-0 left-0 w-full h-full rounded-t-full origin-bottom-center"
          style={
            {
              '--gauge-fg': 'hsl(var(--primary))',
              transform: `rotate(${percentage * 180}deg)`,
              background: `conic-gradient(from -90deg at 50% 100%, transparent 0deg, var(--gauge-fg) 0deg, var(--gauge-fg) 180deg, transparent 180deg)`,
              mask: 'linear-gradient(to right, #000, #000)',
              WebkitMask: 'linear-gradient(to right, #000, #000)',
              transition: 'transform 0.5s ease-out',
            } as React.CSSProperties
          }
        ></div>
        <div
          className={cn(
            'absolute inset-[10px] bottom-0 rounded-t-full bg-background',
            {
              'inset-[8px]': size === 'small',
              'inset-[12px]': size === 'large',
            }
          )}
        ></div>
        <div
          className="absolute inset-0 flex items-end justify-center origin-bottom transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <GaugePointer
            className={cn('h-10 w-1 fill-foreground drop-shadow-md', {
              'h-8': size === 'small',
              'h-12': size === 'large',
            })}
          />
        </div>
      </div>
      {showValue && (
        <div className="absolute bottom-[-1.5rem] flex flex-col items-center">
          <span className="text-xl font-bold text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">L/min</span>
        </div>
      )}
    </div>
  );
}
