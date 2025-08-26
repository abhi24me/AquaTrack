
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
      <div className="relative overflow-hidden rounded-full">
        <div
          className={cn('aspect-square w-24 rounded-full border-[10px]', {
            'w-20 border-8': size === 'small',
            'w-28 border-[12px]': size === 'large',
          })}
          style={
            {
              '--gauge-bg': 'hsl(var(--muted))',
              '--gauge-fg': 'hsl(var(--primary))',
              '--gauge-gradient-from': 'hsl(var(--primary) / 0.8)',
              '--gauge-gradient-to': 'hsl(var(--primary) / 0.2)',
              background: `
                conic-gradient(
                  from -90deg at 50% 50%,
                  var(--gauge-gradient-from) 0%,
                  var(--gauge-gradient-to) ${percentage * 100}%,
                  transparent ${percentage * 100}%
                )
              `,
              mask: `
                radial-gradient(
                  farthest-side,
                  transparent calc(100% - 10px),
                  #000 0
                )
              `,
            } as React.CSSProperties
          }
        />
        <div
          className={cn(
            'absolute inset-0 rounded-full border-[10px] border-muted opacity-50',
            {
              'border-8': size === 'small',
              'border-[12px]': size === 'large',
            }
          )}
        />
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <GaugePointer
            className={cn('h-8 w-1 fill-foreground', {
              'h-6': size === 'small',
              'h-10': size === 'large',
            })}
          />
        </div>
      </div>
      {showValue && (
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">L/min</span>
        </div>
      )}
    </div>
  );
}
