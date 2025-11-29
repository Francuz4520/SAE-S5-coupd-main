import {View} from "react-native";
import { useNavigation } from '@react-navigation/native';
import Banner from "../components/Banner";

export default function EditProfile() {
    const navigation = useNavigation();
    return(
        <View>
            {/* Pass a function to do a proper goBack to preserve tabs */}
            <Banner text={"Modifier votre profil"} showBack={true} onBack={() => navigation.goBack()}></Banner>
        </View>
    )
}