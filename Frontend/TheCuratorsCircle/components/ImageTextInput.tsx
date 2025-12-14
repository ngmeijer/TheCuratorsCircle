import React from 'react';
import {View, TextInput, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";

interface IconInputProps {
    placeholder: string;
    placeholderColor: string;
    iconSource: any;
    iconSize: number;
    value?: string;
    onChangeText?: (text: string) => void;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    iconStyle?: ImageStyle;
    secureText? : boolean
}

export function ImageTextInput({
                                   placeholder,
                                   placeholderColor,
                                   iconSource,
                                   iconSize,
                                   value,
                                   onChangeText,
                                   containerStyle,
                                   inputStyle,
                                   iconStyle,
                                   secureText = false,
                               }: IconInputProps) {
    return (
        <View style={containerStyle}>
            <Ionicons name={iconSource} size={iconSize} style={iconStyle} />
            <TextInput
                style={inputStyle}
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureText}
            />
        </View>
    );
}
