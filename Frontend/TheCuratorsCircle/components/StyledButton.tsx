import React from 'react';
import {Pressable, Text, StyleSheet, GestureResponderEvent, ViewStyle, TextStyle, StyleProp} from 'react-native';

interface StyledButtonProps {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
}

export
function StyledButton({ title, onPress, style, textStyle, disabled }: StyledButtonProps) {
    return (
        <Pressable style={[styles.button, style, disabled && styles.buttonDisabled]} onPress={onPress} disabled={disabled}>
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
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
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
