import { cn } from '@/lib/utils';
import React from 'react';

export const GaugePointer = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 65"
    className={cn('pointer-events-none', className)}
    {...props}
  >
    <path d="M50 5 L50 60" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M45 60 C 47.5 65, 52.5 65, 55 60 L 50 5 Z"
      fill="hsl(var(--primary))"
      className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
    />
     <circle cx="50" cy="60" r="3" fill="hsl(var(--background))" />
  </svg>
);

    