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
import EditProfile from "./screens/EditProfile";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

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
const Tab = createBottomTabNavigator();

const Tabs = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#29AAAB',}}>

      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ size }) => (
            useIsFocused() ?
              <Image source={require('../assets/icons/tabs/home-active.png')} alt='home-active-icon' style={{ width: size, height: size }} />
            :
              <Image source={require('../assets/icons/tabs/home-inactive.png')} alt='home-inactive-icon' style={{ width: size, height: size }} />
          ),
        }}
      />

      <Tab.Screen 
        name="Publish"
        component={PublishScreen} 
        options={{
          tabBarIcon: ({ size }) => (
            useIsFocused() ?
              <Image source={require('../assets/icons/tabs/publish-active.png')} alt='publish-active-icon' style={{ width: size, height: size }} />
            :
              <Image source={require('../assets/icons/tabs/publish-inactive.png')} alt='publish-inactive-icon' style={{ width: size, height: size }} />
          ),
        }}
      />

      <Tab.Screen 
        name="Messages"
        component={MessagesScreen} 
        options={{
          tabBarIcon: ({ size }) => (
            useIsFocused() ?
              <Image source={require('../assets/icons/tabs/messages-active.png')} alt='messages-active-icon' style={{ width: size, height: size }} />
            :
              <Image source={require('../assets/icons/tabs/messages-inactive.png')} alt='messages-inactive-icon' style={{ width: size, height: size }} />
          ),
        }}
      />

      <Tab.Screen 
        name="Profile"
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ size }) => (
            useIsFocused() ?
              <Image source={require('../assets/icons/tabs/profile-active.png')} alt='profile-active-icon' style={{ width: size, height: size }} />
            :
              <Image source={require('../assets/icons/tabs/profile-inactive.png')} alt='profile-inactive-icon' style={{ width: size, height: size }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Index() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen}/>
      <Stack.Screen name="Connection" component={Connection}/>
      <Stack.Screen name="Registration" component={Registration}/>
      <Stack.Screen name="Home" component={Tabs}/>
      <Stack.Screen name="Profile" component={ProfileScreen}/>
      <Stack.Screen name="EditProfile" component={EditProfile}/>
      <Stack.Screen name="HomeDetails" component={HomeDetails}/>
    </Stack.Navigator>
  );
}
