
'use client';
import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  BarChart2,
  Bell,
  Settings,
  Droplets,
  LogOut,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProfile } from '@/context/user-profile-context';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/rooms', label: 'Rooms', icon: LayoutGrid },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/notifications', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border shrink-0">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-center gap-4 bg-background/80 px-4 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2">
          <div className="bg-card p-2 rounded-full border border-border">
            <Droplets className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            AquaTrack
          </h1>
        </div>
      </header>      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.label}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-300',
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function UserAvatar() {
  const { avatarSrc } = useUserProfile();
  return (
    <Avatar>
      <AvatarImage src={avatarSrc} data-ai-hint="user avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  );
}


function MobileHeader() {
    return (
        <header className="md:hidden sticky top-0 z-30 flex h-16 items-center justify-between gap-4 bg-background/80 px-4 backdrop-blur-sm border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-card p-2 rounded-full border border-border">
            <Droplets className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            AquaTrack
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserAvatar />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href="/login">
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
    )
}

function MobileFooter() {
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <footer className="md:hidden fixed bottom-0 z-30 flex h-20 w-full items-center justify-around border-t border-border bg-card/80 backdrop-blur-lg">
        {navItems.map((item) => {
          const isActive = isClient && pathname === item.href;
          return (
            <Link href={item.href} key={item.label} className="flex flex-col items-center justify-center h-full flex-1 min-w-0 px-1">
              <div
                className={cn(
                  'flex flex-col items-center justify-center h-full p-1 rounded-lg transition-colors duration-300 w-full',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'relative flex items-center justify-center w-14 h-8 rounded-full mb-1 transition-all duration-300',
                    isActive ? 'bg-primary/20' : ''
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium truncate">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </footer>
    )
}

function DesktopHeader() {
  return (
      <header className="hidden md:flex sticky top-0 z-30 h-20 items-center justify-end gap-4 bg-background/80 px-8 backdrop-blur-sm border-b border-border shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" className="rounded-full">
                  <UserAvatar />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/login">
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
      </header>
  )
}


export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
       <DesktopSidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <div className='flex flex-col flex-1 overflow-hidden'>
           <DesktopHeader />
           <MobileHeader />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
        </div>
        <MobileFooter />
      </div>
    </div>
  );
}
