
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Droplets } from 'lucide-react';
import React from 'react';

function WaveAnimation() {
  return (
    <div className="waves">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shapeRendering="auto"
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g className="parallax">
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="0"
            fill="hsla(var(--primary), 0.7)"
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="3"
            fill="hsla(var(--primary), 0.5)"
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="5"
            fill="hsla(var(--primary), 0.3)"
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="7"
            fill="hsl(var(--primary))"
          />
        </g>
      </svg>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden" />
      <Card className="elevated-card w-full max-w-sm z-10">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full border bg-card p-3">
              <Droplets className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to AquaTrack</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard.
          </CardDescription>
          <p className="pt-2 text-lg font-semibold text-primary">lets save it</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="water-id">Water ID</Label>
              <Input
                id="water-id"
                placeholder="enter your water id"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Link href="/dashboard" className="w-full">
            <Button className="w-full">Login</Button>
          </Link>
        </CardFooter>
      </Card>
      <WaveAnimation />
    </div>
  );
}
