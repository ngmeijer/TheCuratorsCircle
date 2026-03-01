import React from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';

interface CollectionProps {
    item: {
        id: string;
        name: string;
        posterUrl?: string | null;
        itemCount?: number;
    };
}

export default function CollectionButton({item}: CollectionProps) {
    const itemCount = item.itemCount ?? 0;
    const hasPoster = item.posterUrl && item.posterUrl !== 'N/A';

    return (
        <View style={styles.collectionContainer}>
            <View style={styles.imageWrapper}>
                {hasPoster ? (
                    <Image source={{ uri: item.posterUrl! }} style={styles.image} />
                ) : (
                    <View style={[styles.image, styles.placeholder]}>
                        <Text style={{ color: 'white', fontSize: 32 }}>📁</Text>
                    </View>
                )}
                <View style={styles.nameOverlay}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                </View>

                <View style={styles.itemCountOverlay}>
                    <Text style={styles.itemCount}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
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
    placeholder: {
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
});