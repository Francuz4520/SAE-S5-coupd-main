import React from 'react';
import { Image } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useIsFocused } from "@react-navigation/native";
import HomeScreen from "./screens/Home";
import PublishScreen from "./screens/Publish";
import MessagesScreen from "./screens/Messages";
import ProfileScreen from "./screens/Profile";
import SplashScreen from './screens/SplashScreen';
import Connection from './screens/Connection';
import Registration from './screens/Registration';
import HomeDetails from './screens/HomeDetails';
import Cgu from "./screens/Cgu"
import EditProfile from "./screens/EditProfile";
import ChatScreen from './screens/Chat';
import AvatarPicker from './screens/AvatarPicker';
import HomeNavigator from './navigation/HomeNavigator'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import Tabs from './navigation/Tabs'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiMQX0w9x738U1bTYi75EaxncHe0BU_IY",
  authDomain: "saecoupdmain.firebaseapp.com",
  projectId: "saecoupdmain",
  storageBucket: "saecoupdmain.firebasestorage.app",
  messagingSenderId: "51236011687",
  appId: "1:51236011687:web:355ca4439aaf49f430a582"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const Stack = createNativeStackNavigator();

export default function Index() {
  return (
      <Stack.Navigator initialRouteName="Splash" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen}/>
        <Stack.Screen name="Connection" component={Connection}/>
        <Stack.Screen name="Registration" component={Registration}/>
        <Stack.Screen name="AvatarPicker" component={AvatarPicker}/>
        <Stack.Screen name="Home" component={HomeNavigator}/>
        <Stack.Screen name="EditProfile" component={EditProfile}/>
        <Stack.Screen name="HomeDetails" component={HomeDetails}/>
        <Stack.Screen name="Cgu" component={Cgu}/>
        <Stack.Screen name="Chat" component={ChatScreen}/>
      </Stack.Navigator>
  );
}