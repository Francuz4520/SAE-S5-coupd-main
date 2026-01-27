import { createNativeStackNavigator } from '@react-navigation/native-stack'
import WebNavbar from '../navigation/WebNavbar'

import HomeScreen from '../screens/Home'
import PublishScreen from '../screens/Publish'
import MessagesScreen from '../screens/Messages'
import ProfileScreen from '../screens/Profile'

const Stack = createNativeStackNavigator()

export default function WebHome() {
  return (
    <>
      <Stack.Navigator screenOptions={{header: () => <WebNavbar />}}>
        <Stack.Screen name="Accueil" component={HomeScreen} />
        <Stack.Screen name="Publier" component={PublishScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="Profil" component={ProfileScreen} />
      </Stack.Navigator>
    </>
  )
}
