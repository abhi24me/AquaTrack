
'use client';
import { type ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/context/user-profile-context';


export default function ProfilePage() {
    const { toast } = useToast();
    const { avatarSrc, setAvatarSrc } = useUserProfile();

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newSrc = URL.createObjectURL(file);
            setAvatarSrc(newSrc);
        }
    };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Profile</h2>
      </div>

      <Card className="elevated-card">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarSrc} data-ai-hint="user avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="relative">
                    <Label htmlFor="avatar-upload">
                        <Button variant="outline" size="sm" asChild>
                            <span className="cursor-pointer">
                                <Camera className="mr-2 h-4 w-4" />
                                Change Avatar
                            </span>
                        </Button>
                    </Label>
                    <Input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer sr-only" 
                        id="avatar-upload"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleAvatarChange}
                    />
                </div>
            </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue="john.doe@corporatetowers.com" />
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={() => {
                toast({
                    title: 'Profile Updated',
                    description: 'Your profile information has been saved.',
                });
            }}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
