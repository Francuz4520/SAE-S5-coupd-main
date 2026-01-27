import { Platform} from 'react-native'
import Tabs from './Tabs'
import WebHome from './WebHome'

export default function HomeNavigator() {
  const isDesktop = Platform.OS === 'web'

  return isDesktop ? <WebHome /> : <Tabs />
}
