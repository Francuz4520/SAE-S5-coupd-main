import { NavigationContainer } from '@react-navigation/native';
import Index from './app/index'

export default function App() {
  return (
    <NavigationContainer linking={null}>
      <Index />
    </NavigationContainer>
  );
}
