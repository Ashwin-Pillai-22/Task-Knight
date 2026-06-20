import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type LevelContextType = {
  level: number;
  xp: number;
  addXP: (amount: number) => void;
  xpForNextLevel: number;
};

const LevelContext = createContext<LevelContextType | undefined>(undefined);

export const LevelProvider = ({ children }: { children: ReactNode }) => {
  const [level, setLevel] = useState(1);
  const [xp, setXP] = useState(0);

  const getXPForNextLevel = (level: number) => 100 + (level - 1) * 50;
  const xpForNextLevel = getXPForNextLevel(level);

  const addXP = (amount: number) => {
    const nextXP = xp + amount;

    if (nextXP >= xpForNextLevel) {
      setLevel(prev => prev + 1);
      setXP(0); // Reset XP on level up
    } else {
      setXP(nextXP);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem('levelData');
      if (data) {
        const { level, xp } = JSON.parse(data);
        setLevel(level);
        setXP(xp);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('levelData', JSON.stringify({ level, xp }));
  }, [level, xp]);

  return (
    <LevelContext.Provider value={{ level, xp, addXP, xpForNextLevel }}>
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => {
  const context = useContext(LevelContext);
  if (!context) throw new Error('useLevel must be used within a LevelProvider');
  return context;
};
