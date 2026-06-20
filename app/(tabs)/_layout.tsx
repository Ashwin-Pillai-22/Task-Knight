import { LevelProvider } from '@/context/levelContext';
import { TaskProvider } from '@/context/TaskContext';
import { UserProvider } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';


const _layout = () => {

    return (
        <TaskProvider>
            <UserProvider>
                <LevelProvider>
                    <Tabs
                        screenOptions={({ route }) => ({
                            tabBarIcon: ({ focused, color, size }) => {
                                let iconName: React.ComponentProps<typeof Ionicons>['name'];
                                if (route.name === 'index') iconName = focused ? 'home' : 'home-outline';
                                else if (route.name === 'profile') iconName = focused ? 'person' : 'person-outline';
                                else iconName = 'ellipse'; // fallback icon

                                return <Ionicons name={iconName} size={26} color={color} />;
                            },
                            tabBarActiveTintColor: '#4CAF50',
                            tabBarInactiveTintColor: '#fff',
                            tabBarShowLabel: false,

                            // Glassmorphic effect for bottom tab bar
                            tabBarBackground: () => (
                                <BlurView
                                    intensity={30}
                                    tint="dark"
                                    style={StyleSheet.absoluteFill}
                                />
                            ),
                            tabBarStyle: {
                                position: 'absolute',
                                // bottom: 15,
                                left: 20,
                                right: 20,
                                elevation: 0,
                                borderTopWidth: 0,
                                height: 70,
                                paddingBottom: 10,
                                paddingTop: 10,
                                borderRadius: 250,
                                // backgroundColor: 'rgba(30, 30, 45, 0.7)',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 5 },
                                shadowOpacity: 0.3,
                                shadowRadius: 10,
                            },
                            tabBarIconStyle: {
                                marginTop: 5,
                            }
                        })}
                    >
                        <Tabs.Screen
                            name='index'
                            options={{
                                title: 'Home',
                                headerShown: false,
                                tabBarIcon: ({focused}) => (
                                    
                                        <Ionicons
                                            name={focused ? 'home' : 'home'}
                                            size={focused ? 30 : 25}
                                            color={focused ? 'aqua' : 'rgba(128, 128, 128, 0.5)'}
                                           
                                        />

                                ),
                            }}
                        />
                        
                        {/* Big Floating Add Button */}
                        <Tabs.Screen
                            name='add'
                            options={{
                                title: 'Add Tasks',
                                headerShown: false,
                                tabBarIcon: ({focused}) =>(
                                
                                        <Ionicons 
                                            name = "star"
                                            size={focused ? 29 : 25}
                                            color ={focused ? 'yellow' : 'rgba(128, 128, 128, 0.5)'}
                                        />

                                )
                            }}
                        />

                        <Tabs.Screen
                            name='profile'
                            options={{
                                title: 'Profile',
                                headerShown: false,
                                tabBarIcon: ({ focused }) => (
                                    <Ionicons
                                        name={focused ? 'person' : 'person'}
                                        size={focused ? 30 : 25}
                                        color={focused ? 'aqua' : 'rgba(128, 128, 128, 0.5)'}
                                    />
                                ),
                            }}
                        />
                    </Tabs>
                </LevelProvider>
            </UserProvider>
        </TaskProvider>
    );
};

const styles = StyleSheet.create({
    addBtn: {
        width: 50,
        height:50,
        borderRadius: 35,
        backgroundColor: '#660000',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#660000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
});

export default _layout;
