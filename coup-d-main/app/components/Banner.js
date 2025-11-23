import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
const Banner = ({ text, onBack, showBack = true }) => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>

            {showBack && (
                <TouchableOpacity onPress={() => navigation.navigate(onBack)}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.text}>{text}</Text>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#29AAAB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 20,
    },
    backText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginRight: 13,
        paddingBottom: 8,
    },
    text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default Banner;
