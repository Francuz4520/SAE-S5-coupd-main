import {View} from "react-native";
import Banner from "../components/Banner";

export default function EditProfile({navigation}) {
    return(
        <View>
            <Banner text={"Modifier votre profil"} showBack={true} onBack={'Profile'}></Banner>
        </View>
    )
}