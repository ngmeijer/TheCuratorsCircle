import React from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';
import {Movie} from "@/DTOs/CollectionDto";

interface CollectionProps {
    item: {
        id: string;
        name: string;
        category: string;
        moviesData: Movie[];
    };
}

export default function CollectionButton({item}: CollectionProps) {
    const posterUri =
        item.moviesData[0].posterUrl !== 'N/A'
            ? item.moviesData[0].posterUrl
            : null;

    console.log("poster uri and collection name:", item.name, posterUri);

    return (
        <View style={styles.collectionContainer}>
            <View style={styles.imageWrapper}>
                {posterUri ? (
                    <Image source={{ uri: posterUri }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.placeholder]}>
                        <Text style={{ color: 'white' }}>No image</Text>
                    </View>
                )}
                <View style={styles.nameOverlay}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                </View>

                <View style={styles.itemCountOverlay}>
                    <Text style={styles.itemCount}>{item.moviesData?.length} items</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    collectionContainer: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 10,
        marginVertical: 5,
        maxWidth: "48%",
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
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal:8,
        paddingVertical:4,
        borderRadius:12,
    },
    itemCountOverlay: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal:8,
      paddingVertical:4,
      borderRadius:12,
    },
    name: {
        color:'white'
    },
    itemCount: {
        color: 'white',
        padding: 5,
        borderRadius: 6
    },
    category: {
        color: 'white',
    },
    placeholder: {
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
});