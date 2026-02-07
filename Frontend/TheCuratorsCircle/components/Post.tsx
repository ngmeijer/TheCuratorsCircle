import React from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';
import {Movie} from "@/DTOs/CollectionDto";

interface PostProps {
    item: {
        id: string;
        name: string;
        movieData: Movie;
        category: string;
        aspectRatio: number;
        likeCount: number;
        commentCount: number;
        shareCount: number;
    };
}

export default function Post({ item }: PostProps) {
    console.log("poster uri and post name:", item.name, item.movieData.posterUrl);

    return (
        <View style={styles.collectionContainer}>
            <View style={styles.imageWrapper}>
                <Image
                    source={{uri: item.movieData.posterUrl}}
                    style={[styles.image]}
                />
                <View style={styles.nameOverlay}>
                    <Text style={styles.title}>{item.movieData.title}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                </View>

                <View style={styles.likeCountOverlay}>
                    <Text style={styles.likeCount}>{item.likeCount} likes</Text>
                </View>
            </View>
        </View>
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
        height: '20%',
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