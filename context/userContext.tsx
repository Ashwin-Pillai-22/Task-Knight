import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define the shape of user
type User = {
  username: string;
  picture: string | null;
};

// Define shape of context value
type UserContextType = {
  user: User;
  updateUser: (newUser: User) => Promise<void>;
};

// Create context with proper type
const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({ username: 'User#1001', picture: null });

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    };
    loadUser();
  }, []);

  const updateUser = async (newUser: User) => {
    setUser(newUser);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to access user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
