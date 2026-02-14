import React from 'react';
import { View, Image, StyleSheet, Text, Pressable } from 'react-native';
import {Movie} from "@/DTOs/CollectionDto";

interface PostProps {
    item: {
        id: string;
        name: string;
        mediaData: Movie;
        createdAt: string;
        category: string;
        aspectRatio: number;
        likeCount: number;
        commentCount: number;
        shareCount: number;
    };
    onPress?: () => void;
}

export default function Post({ item, onPress }: PostProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.collectionContainer,
                { opacity: pressed ? 0.8 : 1 } // Visual feedback on touch
            ]}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: item.mediaData.posterUrl }}
                    style={styles.image}
                />
                <View style={styles.nameOverlay}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.title}>{item.mediaData.title}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                </View>

                <View style={styles.likeCountOverlay}>
                    <Text style={styles.likeCount}>{item.likeCount} likes</Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    collectionContainer: {
        alignItems: 'center',
        flex: 1,
        marginVertical: 5,
    },
    imageWrapper: {
        position:'relative',
        borderRadius:12,
        overflow: 'hidden',
        width: '100%',
        aspectRatio: 1
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 15
    },
    nameOverlay: {
        position: 'absolute',
        width: '90%',
        height: 'auto',
        top: 8,
        left: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal:8,
        paddingVertical:4,
        borderRadius:12,
    },
    likeCountOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal:8,
        paddingVertical:4,
        borderRadius:12,
    },
    title: {
        color:'white',
        fontSize: 24,
    },
    likeCount: {
        color: 'white',
        padding: 5,
        borderRadius: 6
    },
    category: {
        color: 'white',
    }
});