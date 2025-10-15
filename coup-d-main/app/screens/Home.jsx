
import { Text, View, StyleSheet} from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Oh mais mange bien</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});