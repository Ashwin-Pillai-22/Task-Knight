// Started on 9-07-2025
// Basic functionalities are copmleted
//  on 16-07-2025

import { useLevel } from '@/context/levelContext';
import { Task, useTasks } from '@/context/TaskContext';
import { useUser } from '@/context/userContext';
import Feather from '@expo/vector-icons/Feather';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';

function formatRemaining(ms: number) {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) return `${hrs}h ${String(mins).padStart(2, '0')}m`;
  return `${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
}

export default function Index() {
  const { user } = useUser();
  const { tasks, removeTask, completeTask } = useTasks();
  const { level, xp, xpForNextLevel, addXP } = useLevel();
  const [showCelebration, setShowCelebration] = useState(false);
  const prevXpRef = useRef(xp);
  const [sound, setSound] = useState<Audio.Sound>();

  // Check for level up based on XP changes
  useEffect(() => {
    const prevLevel = Math.floor(prevXpRef.current / xpForNextLevel);
    const currentLevel = Math.floor(xp / xpForNextLevel);
    
    if (currentLevel > prevLevel) {
      setShowCelebration(true);
    }
    prevXpRef.current = xp;
  }, [xp, xpForNextLevel]);

  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    NavigationBar.setVisibilityAsync('hidden');
    const id = setInterval(() => setNowTick(Date.now()), 1000); // update UI every second
    return () => clearInterval(id);
  }, []);

  const progressPercent = (xp / xpForNextLevel) * 100;

  // sort daily first, keep all tasks visible
  const sortedTasks = useMemo(() => [...tasks].sort((a, b) => (a.daily === b.daily ? 0 : a.daily ? -1 : 1)), [tasks]);

  // Function to play level up sound
  const playLevelUpSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/levelup.mp3'),  // You'll need to add this sound file
        { volume: 1.0 }
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  };

  // Cleanup sound on unmount
  useEffect(() => {
    return sound ? () => {
      sound.unloadAsync();
    } : undefined;
  }, [sound]);

  // Wrapper for addXP that checks level up immediately
  const handleAddXP = (amount: number) => {
    const currentLevel = Math.floor(xp / xpForNextLevel);
    const newXp = xp + amount;
    const newLevel = Math.floor(newXp / xpForNextLevel);
    
    if (newLevel > currentLevel) {
      setShowCelebration(true);
      playLevelUpSound(); // Play sound when leveling up
    }
    addXP(amount);
  };

  // Replace all addXP(20) calls with handleAddXP(20)
  const handleCompleteTask = (task: Task) => {
    if (task.daily) {
      if (!task.completedToday) {
        completeTask(task.id);
        handleAddXP(20); // Use wrapper instead of direct addXP
      }
    } else {
      removeTask(task.id);
      handleAddXP(20); // Use wrapper instead of direct addXP
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bg-img.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 ">


        {/* Profile */}
        <View className='mt-10 flex-row items-center'>
          <BlurView intensity={100} tint='dark' className="flex-row items-center rounded-xl m-2 pt-4 pb-4" style={{ overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)' }}>

            <Image
              source={user.picture ? { uri: user.picture } : require('../../assets/images/swordLogo.png')}
              className='size-44 ml-5 rounded-full border-white/30 border shadow-lg'
              style={{
                backgroundColor: 'rgba(0,0,0,0.05)',
              }}
            />
            <View className='flex-1 ml-6'>
              <Text className='text-white text-3xl text-left font-bold'>{user.username}</Text>
              <Text className='text-white text-3xl text-left mt-5 font-bold'>{level}</Text>

              <View className='w-40 h-2 mt-2 bg-bar-out rounded-full overflow-hidden'>
                <View style={{ width: `${progressPercent}%` }} className='h-2 bg-bar-inner rounded-full'></View>
              </View>

            </View>
          </BlurView>
        </View>

        {/* Tasks */}
        <View className='flex-1'>
          <Text className='text-white font-bold text-2xl text-center mt-8'>Task</Text>

          <ScrollView className='mb-20'>
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
            {sortedTasks.length === 0 ? (
              <View>
                <Text className='text-white text-center'>Add task to increase level.</Text>
              </View>
            ) : (
              sortedTasks.map((task) => {
                const remainingMs = new Date(task.expiresAt).getTime() - nowTick;
                const isExpired = remainingMs <= 0;
                return (
                  <View key={task.id} className="flex flex-row items-center p-4 mt-4 ml-6 mr-6 h-20 bg-white rounded-xl">
                    <View className="mr-3 justify-center items-center w-12 h-12 rounded-full">
                      <Image
                        source={ require('../../assets/images/diamond.gif')}
                        style={{ width: 48, height: 48 }}
                        resizeMode='contain'
                      />
                    </View>

                    <View className="flex-1">
                      <Text
                        className="text-lg"
                        style={{
                          color: task.completedToday ? '#9CA3AF' : '#000',
                          textDecorationLine: task.completedToday ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </Text>

                      <View className="flex-row items-center">
                        {task.daily && <Text className="text-xs text-gray-500 mr-3">Daily</Text>}
                        <Text className="text-xs text-gray-500">
                          {isExpired ? 'Expired' : `Time left: ${formatRemaining(remainingMs)}`}
                        </Text>
                      </View>
                    </View>

                    {/* show green check for active tasks (gives XP), show red cross for expired tasks (removes without XP) */}
                    {!isExpired ? (
                      <TouchableOpacity
                        onPress={() => handleCompleteTask(task)}
                        className="ml-auto"
                        accessibilityLabel="Complete task"
                      >
                        {/* show different icon when daily has been completed today */}
                        {task.daily && task.completedToday ? (
                          <Feather name="check-circle" size={24} color="#4CAF50" />
                        ) : (
                          <Feather name="check-circle" size={24} color="green" />
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => removeTask(task.id)}
                        className="ml-auto"
                        accessibilityLabel="Remove expired task"
                      >
                        <Feather name="x-circle" size={24} color="#E53E3E" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
          </ScrollView>
        </View>

        {/* {showCelebration && (
          <LevelUpCelebration 
            onComplete={() => setShowCelebration(false)} 
          />
        )} */}
      </View >
    </ImageBackground >
  );
}


