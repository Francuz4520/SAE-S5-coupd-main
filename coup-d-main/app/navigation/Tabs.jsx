
import { Image } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from "../screens/Home";
import PublishScreen from "../screens/Publish";
import MessagesScreen from "../screens/Messages";
import ProfileScreen from "../screens/Profile";
export default function Tabs(){
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#29AAAB',}}>

      <Tab.Screen 
        name="Accueil" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ size }) => (
            useIsFocused() ?
              <Image source={require('../../assets/icons/tabs/home-active.png')} alt='home-active-icon' style={{ width: size, height: size }} />
            :
              <Image source={require('../../assets/icons/tabs/home-inactive.png')} alt='home-inactive-icon' style={{ width: size, height: size }} />
          ),
        }}
      />

      <Tab.Screen 
        name="Publier"
        component={PublishScreen} 
        options={{
          tabBarIcon: ({ size }) => (
            useIsFocused() ?
              <Image source={require('../../assets/icons/tabs/publish-active.png')} alt='publish-active-icon' style={{ width: size, height: size }} />
            :
              <Image source={require('../../assets/icons/tabs/publish-inactive.png')} alt='publish-inactive-icon' style={{ width: size, height: size }} />
          ),
        }}
      />

      <Tab.Screen 
        name="Messages"
        component={MessagesScreen} 
        options={{
          tabBarIcon: ({ size }) => (
            useIsFocused() ?
              <Image source={require('../../assets/icons/tabs/messages-active.png')} alt='messages-active-icon' style={{ width: size, height: size }} />
            :
              <Image source={require('../../assets/icons/tabs/messages-inactive.png')} alt='messages-inactive-icon' style={{ width: size, height: size }} />
          ),
        }}
      />

      <Tab.Screen 
        name="Profil"
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ size }) => (
            useIsFocused() ?
              <Image source={require('../../assets/icons/tabs/profile-active.png')} alt='profile-active-icon' style={{ width: size, height: size }} />
            :
              <Image source={require('../../assets/icons/tabs/profile-inactive.png')} alt='profile-inactive-icon' style={{ width: size, height: size }} />
          ),
        }}
      />

    </Tab.Navigator>
  );
}