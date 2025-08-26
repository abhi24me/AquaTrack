
import { cn } from '@/lib/utils';
import React from 'react';

export const GaugePointer = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 100"
    preserveAspectRatio="none"
    className={cn(className)}
    {...props}
  >
    <path
      d="M6 0L11.1962 15H0.803848L6 0ZM5 14V100H7V14H5Z"
      fill="currentColor"
    />
  </svg>
);
