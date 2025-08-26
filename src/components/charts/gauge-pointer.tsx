import { cn } from '@/lib/utils';
import React from 'react';

export const GaugePointer = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={cn(className)}
    {...props}
  >
    <path
      d="M49.5 95C49.5 95 49.5 95 49.5 95 49.7761 95 50 94.7761 50 94.5L50 10C50 9.72386 49.7761 9.5 49.5 9.5 49.2239 9.5 49 9.72386 49 10L49 94.5C49 94.7761 49.2239 95 49.5 95Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
    />
    <circle cx="50" cy="95" r="4" fill="hsl(var(--background))" />
    <circle cx="50" cy="95" r="2" fill="currentColor" />
  </svg>
);
