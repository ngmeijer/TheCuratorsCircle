import React from 'react';
import { Pressable, Text, StyleSheet, GestureResponderEvent, ViewStyle, TextStyle } from 'react-native';

interface DynamicDataButtonProps {
    name: string;
    data: string;
    onPress: (event: GestureResponderEvent) => void;
    buttonStyle?: ViewStyle;
    nameTextStyle?: TextStyle;
    dataTextStyle?: TextStyle;
}

export
function DynamicDataButton({ name, data, onPress, buttonStyle, nameTextStyle, dataTextStyle }: DynamicDataButtonProps) {
    return (
        <Pressable style={buttonStyle} onPress={onPress}>
            <Text style={dataTextStyle}>{data}</Text>
            <Text style={nameTextStyle}>{name}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#4DA6F0',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
