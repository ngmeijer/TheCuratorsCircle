import React from 'react';
import {View, Image, StyleSheet, Text, useWindowDimensions} from 'react-native';

interface CollectionProps {
    item: {
        id: string;
        name: string;
        posterUrl?: string | null;
        itemCount?: number;
    };
}

export default function CollectionButton({item}: CollectionProps) {
    const { width } = useWindowDimensions();
    const itemWidth = (width - 24) / 2; // 24 = padding (12 on each side)
    
    const itemCount = item.itemCount ?? 0;
    const hasPoster = item.posterUrl && item.posterUrl !== 'N/A';

    return (
        <View style={[styles.collectionContainer, { width: itemWidth }]}>
            <View style={styles.imageWrapper}>
                {hasPoster ? (
                    <Image 
                        source={{ uri: item.posterUrl! }} 
                        style={[styles.image, { width: itemWidth - 8 }]} 
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.image, styles.placeholder, { width: itemWidth - 8 }]}>
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
        margin: 4,
    },
    imageWrapper: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    image: {
        aspectRatio: 2/3,
        borderRadius: 12,
    },
    nameOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    itemCountOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    name: {
        color: 'white',
        fontSize: 14,
    },
    itemCount: {
        color: 'white',
        fontSize: 12,
    },
    placeholder: {
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
});