import React from 'react';
import {View, ViewStyle, TextStyle, ImageStyle, Text} from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";

interface IconTextButtonProps {
    iconSource: any;
    text: number;
    iconSize: number;
    containerStyle?: ViewStyle;
    iconStyle?: TextStyle;
    textStyle?: TextStyle;
}

export function IconTextButton({
                                   iconSource,
                                   text,
                                   iconSize,
                                   containerStyle,
                                   iconStyle,
                                   textStyle,
                               }: IconTextButtonProps) {
    return (
        <View style={containerStyle}>
            <Ionicons name={iconSource} size={iconSize} style={iconStyle} />
            <Text style={textStyle}>{text}</Text>
        </View>
    );
}
