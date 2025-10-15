import { Text, View, StyleSheet } from "react-native";

export default function PublishScreen() {
  return (
    <View style={styles.container}>
      <Text>Publish screen</Text>
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