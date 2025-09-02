
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';

const defaultAvatar = 'https://placehold.co/80x80.png';

interface UserProfileContextType {
  avatarSrc: string;
  setAvatarSrc: (newSrc: string) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [avatarSrc, setAvatarState] = useState(defaultAvatar);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedAvatar = localStorage.getItem('avatarSrc');
      if (storedAvatar) {
        setAvatarState(storedAvatar);
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    }
  }, []);

  const setAvatarSrc = (newSrc: string) => {
    // Revoke old blob URL to prevent memory leaks
    if (avatarSrc.startsWith('blob:')) {
      URL.revokeObjectURL(avatarSrc);
    }

    setAvatarState(newSrc);

    if (isMounted) {
      try {
        localStorage.setItem('avatarSrc', newSrc);
      } catch (error) {
        console.error('Failed to save avatar to localStorage:', error);
      }
    }
  };

  // Cleanup effect for blob URLs
  useEffect(() => {
    return () => {
      if (avatarSrc.startsWith('blob:')) {
        URL.revokeObjectURL(avatarSrc);
      }
    };
  }, [avatarSrc]);

  return (
    <UserProfileContext.Provider value={{ avatarSrc, setAvatarSrc }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
