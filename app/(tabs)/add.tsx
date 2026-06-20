import { useTasks } from '@/context/TaskContext';
import Feather from '@expo/vector-icons/Feather';
import { BlurView } from 'expo-blur';
import { useRef, useState } from 'react';
import { Alert, Button, FlatList, ImageBackground, Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';

const add = () => {
  const inputref = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [hours, setHours] = useState<number>(1); // 1..24 for today's task
  const { addTask, tasks, removeTask } = useTasks();

  // NEW: modal state for daily task list
  const [showDailyModal, setShowDailyModal] = useState(false);

  const handleAdd = () => {
    const title = text.trim();
    if (!title) return Alert.alert('Enter a title');

    if (isDaily) {
      addTask({ title, daily: true, durationHours: 24 });
    } else {
      if (!hours || hours < 1) return Alert.alert('Minimum 1 hour');
      if (hours > 24) return Alert.alert('Maximum 24 hours');
      const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
      addTask({ title, daily: false, durationHours: hours, expiresAt });
    }

    setText('');
    setHours(1);
  };

  // NEW: confirm + remove handler
  const confirmRemove = (id: string, title?: string) => {
    Alert.alert(
      'Delete task',
      `Delete "${title ?? 'this task'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeTask(id),
        },
      ],
      { cancelable: true }
    );
  };

  const dailyTasks = tasks.filter((t) => t.daily);

  return (
    <ImageBackground source={require('../../assets/images/bg-img.png')} resizeMode="cover" className="flex-1">
      <View className="flex-1">

        <View className="flex-1 items-center justify-center ml-5 mr-5">
          <BlurView
            intensity={80}
            tint="dark"
            className="flex p-5 rounded-xl w-max"
            style={{
              backgroundColor: 'rgba(255,255,255,0.5)',
              overflow: 'hidden'
            }}
          >

            <View>
              <Text className="text-white font-bold text-center text-3xl mb-5">Task</Text>

              <TouchableOpacity onPress={() => inputref.current?.focus()} activeOpacity={1}>
                <BlurView intensity={100} tint="light" className="w-80 h-20 border rounded-3xl border-white/20 items-center justify-center backdrop-blur-lg" style={{ overflow: 'hidden' }}>
                  <TextInput ref={inputref} placeholder="Title" placeholderTextColor="rgba(0,0,0,1)" value={text} onChangeText={setText} className="text-black" />
                </BlurView>
              </TouchableOpacity>

              {/* stacked radio + hours */}
              <View className="mt-5 w-full items-center">
                <View className="w-80">
                  <TouchableOpacity onPress={() => setIsDaily(true)} className="flex-row items-center mb-3" accessibilityRole="radio" accessibilityState={{ selected: isDaily }}>
                    <View className={`w-5 h-5 border-2 rounded-sm justify-center items-center ${isDaily ? 'bg-purple-500 border-purple-500' : 'border-white'}`}>{isDaily && <View className="w-3 h-3 bg-white rounded-sm" />}</View>
                    <Text className="text-white ml-3 text-lg">Daily (resets at midnight)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setIsDaily(false)} className="flex-row items-center mb-3" accessibilityRole="radio" accessibilityState={{ selected: !isDaily }}>
                    <View className={`w-5 h-5 border-2 rounded-sm justify-center items-center ${!isDaily ? 'bg-purple-500 border-purple-500' : 'border-white'}`}>{!isDaily && <View className="w-3 h-3 bg-white rounded-sm" />}</View>
                    <Text className="text-white ml-3 text-lg">Today's task (set hours)</Text>
                  </TouchableOpacity>

                  {/* hours input for today's task; locked when daily */}
                  <View className="flex-row items-center mt-2">
                    <Text className="text-white mr-3">Duration (hours):</Text>
                    <TextInput
                      value={String(hours)}
                      onChangeText={(v) => {
                        const n = parseInt(v.replace(/\D/g, ''), 10) || 0;
                        setHours(Math.min(24, Math.max(1, n)));
                      }}
                      editable={!isDaily}
                      keyboardType="number-pad"
                      className="bg-white rounded px-3 py-1 w-20 text-center"
                    />
                    <Text className="text-white ml-3">{isDaily ? '(locked to 24h)' : ''}</Text>
                  </View>
                </View>

                <View className="mt-6 w-40">
                  <Button title="Add Task" onPress={handleAdd} />
                </View>

                {/* NEW: open daily task list */}
                <View className="mt-3 w-40">
                  <Button title="Daily task list" onPress={() => setShowDailyModal(true)} />
                </View>
              </View>
            </View>
          </BlurView>
        </View>


        {/* NEW: Modal showing daily tasks with delete action */}
        <Modal visible={showDailyModal} animationType="slide" transparent onRequestClose={() => setShowDailyModal(false)}>
          <View className="flex-1 justify-end">
            <BlurView intensity={80} tint="dark" className="p-6 rounded-t-3xl" style={{ backgroundColor: 'rgba(0,0,0,0.6)', minHeight: '40%' }}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-lg font-bold">Daily tasks</Text>
                <Pressable onPress={() => setShowDailyModal(false)} className="p-2">
                  <Feather name="x" size={22} color="#fff" />
                </Pressable>
              </View>

              {dailyTasks.length === 0 ? (
                <Text className="text-white">No daily tasks yet.</Text>
              ) : (
                <FlatList
                  data={dailyTasks}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between bg-white rounded-xl p-3 mb-3">
                      <View className="flex-1 mr-3">
                        <Text className="text-black font-medium">{item.title}</Text>
                        <Text className="text-sm text-gray-500">{item.completedToday ? 'Completed today' : 'Not completed'}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          onPress={() => confirmRemove(item.id, item.title)}
                          className="p-2"
                          accessibilityLabel={`Delete ${item.title}`}
                        >
                          <Feather name="trash-2" size={20} color="#E53E3E" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              )}
            </BlurView>
          </View>
        </Modal>
      </View >
    </ImageBackground >
  );
};

export default add;