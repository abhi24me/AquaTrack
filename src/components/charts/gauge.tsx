
'use client';
import { cn } from '@/lib/utils';
import React from 'react';
import { GaugePointer } from './gauge-pointer';

interface GaugeProps {
  value: number;
}

const MAX_VALUE = 10; // L/min

function GaugeComponent({ value }: GaugeProps) {
  const percentage = Math.min(Math.max(value / MAX_VALUE, 0), 1);
  const rotation = percentage * 180 - 90;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-[200px] mx-auto">
      <div className="relative w-full aspect-[2/1] overflow-hidden">
        {/* Background Arc */}
        <div
          className="absolute top-0 left-0 w-full h-[200%] rounded-full bg-muted/60"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
        ></div>

        {/* Gradient Arc */}
        <div
          className="absolute top-0 left-0 w-full h-[200%] rounded-full"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
            '--gauge-primary': 'hsl(var(--primary))',
            '--gauge-accent': 'hsl(var(--accent))',
            background: `conic-gradient(from -90deg at 50% 100%, var(--gauge-accent) 0deg, var(--gauge-primary) 180deg, transparent 180deg)`,
            transition: 'all 0.3s ease-out'
          } as React.CSSProperties}
        ></div>

         {/* Inner Mask */}
        <div className="absolute top-[10%] left-[10%] w-[80%] h-[160%] rounded-full bg-card" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
      
       {/* Pointer */}
        <div
          className="absolute bottom-0 left-0 w-full h-full origin-bottom transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <GaugePointer className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[90%]" />
        </div>
      
       {/* Value Display */}
        <div className="absolute bottom-[20%] flex flex-col items-center text-center w-full">
          <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
            {value.toFixed(1)}
          </span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground mt-1">L/min</span>
    </div>
  );
}

export const Gauge = React.memo(GaugeComponent);
