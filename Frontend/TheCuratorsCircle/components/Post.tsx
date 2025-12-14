import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface PostProps {
    item: {
        id: string;
        url: string;
        aspectRatio: number;
    };
}

export default function Post({ item }: PostProps) {
    return (
        <View style={styles.postContainer}>
            <Image
                source={{ uri: item.url }}
                style={[styles.image, { aspectRatio: item.aspectRatio }]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    postContainer: {
        width: '100%',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: undefined,
        resizeMode: 'cover',
    },
});