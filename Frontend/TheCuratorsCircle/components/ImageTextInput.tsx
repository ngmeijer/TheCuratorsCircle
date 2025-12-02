import React from 'react';
import {View, TextInput, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";

interface IconInputProps {
    placeholder: string;
    iconSource: any;
    iconSize: number;
    value?: string;
    onChangeText?: (text: string) => void;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    iconStyle?: ImageStyle;
}

export function ImageTextInput({
                                   placeholder,
                                   iconSource,
                                   iconSize,
                                   value,
                                   onChangeText,
                                   containerStyle,
                                   inputStyle,
                                   iconStyle,
                               }: IconInputProps) {
    return (
        <View style={containerStyle}>
            <Ionicons name={iconSource} size={iconSize} style={iconStyle} />
            <TextInput
                style={inputStyle}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}
