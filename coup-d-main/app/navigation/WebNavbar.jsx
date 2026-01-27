
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
export default function WebNavbar(){
  const navigation = useNavigation();
  return (
    <View style={styles.navbar}>
        <Pressable onPress={() => {navigation.navigate("Accueil")}}>
            <Text style={styles.textNavbar}>Accueil</Text>
        </Pressable>
        <Pressable onPress={() => {navigation.navigate("Publier")}}>
            <Text style={styles.textNavbar}>Publier</Text>
        </Pressable>
        <Pressable onPress={() => {navigation.navigate("Messages")}}>
            <Text style={styles.textNavbar}>Messages</Text>
        </Pressable>
        <Pressable onPress={() => {navigation.navigate("Profil")}}>
            <Text style={styles.textNavbar}>Profil</Text>
        </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
    navbar: {
        flexDirection: "row", gap: 20, padding: 16, backgroundColor: "#29AAAB"
    },
    textNavbar: {
        color: "white"
    }

});