import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
const Banner = ({ text, onBack, showBack = true }) => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>

            {showBack && (
                <TouchableOpacity onPress={() => {
                    // if onBack isn't provided -> go back
                    if (!onBack) return navigation.goBack();
                    // if onBack is a function call it (gives consumers full control)
                    if (typeof onBack === 'function') return onBack();
                    // otherwise navigate to the provided route name
                    return navigation.navigate(onBack);
                }}>
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
        paddingTop: 40,
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
