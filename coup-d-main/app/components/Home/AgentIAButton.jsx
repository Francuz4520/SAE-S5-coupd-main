import { useState } from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import ChatModal from '../Modals/AIChatModal'; 

export default function AgentIAButton({ setAppliedFilters }) {

    const [isChatVisible, setIsChatVisible] = useState(false);

    return (
        <>
            <TouchableOpacity 
                onPress={() => setIsChatVisible(true)}
                style={styles.button}
                activeOpacity={0.7} // Effet visuel au clic
            >
                <Image 
                    source={require('../../../assets/icons/robot.png')} 
                    style={styles.icon}
                />
            </TouchableOpacity>

            <ChatModal 
                visible={isChatVisible} 
                onClose={() => setIsChatVisible(false)} 
                setAppliedFilters={setAppliedFilters}
            />
        </>
        
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#2baaab',
        width: 70,
        height: 70,
        borderRadius: 40, 
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    icon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        tintColor: '#FFF',
    },
});