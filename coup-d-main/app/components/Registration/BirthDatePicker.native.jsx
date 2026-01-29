import DateTimePicker from "@react-native-community/datetimepicker";
import {View, TextInput, Pressable, StyleSheet, Image} from "react-native"
import { useState } from "react";
export default function BirthDatePicker({value, onChange}) {
    const [dateText, setDateText] = useState("");
    const [show, setShow] = useState(false);
    const onChangeDate = (event, selectedDate) => {
        setShow(false);

        if (selectedDate) {
            setDateText(selectedDate.toLocaleDateString())
            onChange(selectedDate);
        }
    };

    function createDateWithText(text){
        const parts = text.split("/");
        if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
            if (day && month && year) {
                const newDate = new Date(year, month - 1, day);
                if (!isNaN(newDate)) {
                    onChange(newDate);
                    return;
                }
            }
        }
        onChange(null);
    }
    return (
    <>
        <View>
            <TextInput style={styles.input} value={dateText} onChangeText={ (text) => {
                setDateText(text);
                createDateWithText(text);
            }}/>
            <Pressable style={styles.iconContainer}onPress={() => setShow(true)}>
                <Image style={styles.icon} source={require("../../../assets/icons/calendar.png")}></Image>
            </Pressable>
        </View>
        
        {show && (
        <DateTimePicker
            value={value ?? new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
        />)} 
    </>
    )
}
const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: "white",
        marginBottom: 10
    },
    iconContainer: {
        position: "absolute",
        alignSelf: "flex-end",
        right: 3,
        top: 5
    },
    icon: {
        width: 34,
        height: 34,
    },
}
)