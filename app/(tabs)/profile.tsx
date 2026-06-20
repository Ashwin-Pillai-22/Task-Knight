import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import { useRef, useState } from 'react';
import { Alert, Button, Image, ImageBackground, TextInput, TouchableOpacity, View } from 'react-native';
import { UserProvider, useUser } from '../../context/userContext';

const profile = () => {
  const { user, updateUser } = useUser();
  const [image, setImage] = useState(user.picture);
  const [name, setName] = useState(user.username);
  const inputRef = useRef<TextInput>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'livePhotos'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      updateUser({ username: name, picture: uri });
    }
  };

  const handleFocus = () => {
    inputRef.current?.setSelection(0, 100);
  };

  const handleChangeName = (text: string) => {
    setName(text);
    updateUser({ username: text, picture: image });
  };

  const clearStorage = async () => {
    Alert.alert(
      "Are you sure?",
      "Your progress will be deleted.",
      [
      { text: "Cancel", style: "cancel", onPress: () => {} },
      { text: "OK", onPress: async () => {
        try {
          await AsyncStorage.clear();
          Alert.alert(
          "Local Storage cleared!",
          "Restart the app to apply changes.",
          [{ text: "OK", onPress: async () => {
            try{
              await Updates.reloadAsync();
            }catch(e){
              alert("Restart the app manually.");
            }
          } }]
          );
        } catch (e) {
          alert("Error occured while clearing data.");
        }
        }
      }
      ]
    );
    return;
  };

  return (
    <UserProvider>
      <ImageBackground
        source={require('../../assets/images/bg-img.png')}
        resizeMode='cover'
        className='flex-1'
      >
        <View className='flex-1  '>



          <View className='flex-1 items-center ml-5 mr-5 justify-center'>
            <BlurView
              intensity={80}
              tint='dark'
              className='flex p-24 rounded-xl w-max '
              style={{
                backgroundColor: 'rgba(255,255,255,0.5)',
                overflow: 'hidden'
              }}
            >
              <View className='relative'>
                <TouchableOpacity onPress={pickImage}>
                  <Image source={image ? { uri: image } : require('../../assets/images/swordLogo.png')} className='size-40 rounded-full border-white/30 border shadow-lg shadow-white/80  z-0'></Image>
                  <BlurView intensity={80} tint='dark' className='absolute rounded-full overflow-hidden size-40 z-0' />

                  <Feather name="camera" size={30} color="white" className='absolute ' style={{ top: '38%', left: '50%', transform: [{translateX: -15}], zIndex: 2}} />
                </TouchableOpacity>

              </View>

              <TextInput
                ref={inputRef}
                defaultValue='Edit Name'
                onFocus={handleFocus}
                maxLength={20}
                className='text-2xl text-white border-b-white border-b-2 text-center mt-4 w-auto '
                onChangeText={handleChangeName}
              />
              
              <View className='mt-20'>
                <Button title="Clear Data" onPress={clearStorage} color="#FF3B30" />

              </View>
            </BlurView>
          </View>

        </View>
      </ImageBackground>
    </UserProvider>
  )
}

export default profile
