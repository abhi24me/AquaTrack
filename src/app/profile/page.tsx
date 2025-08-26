
'use client';
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


export default function ProfilePage() {
    const { toast } = useToast();

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
                    <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="user avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="relative">
                    <Button variant="outline" size="sm">
                        <Camera className="mr-2 h-4 w-4" />
                        Change Avatar
                    </Button>
                    <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="avatar-upload"/>
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
