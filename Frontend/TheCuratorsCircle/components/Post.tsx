import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { PostDto } from '@/DTOs/PostDto';
import { getMediaById, MediaSearchResult } from '@/api/databaseClient';

interface PostProps {
    item: PostDto;
    onPress?: () => void;
}

export default function Post({ item, onPress }: PostProps) {
    const { width } = useWindowDimensions();
    const [media, setMedia] = useState<MediaSearchResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMedia() {
            try {
                const result = await getMediaById(item.mediaId, item.mediaType);
                setMedia(result);
            } catch (error) {
                console.error('Error fetching media:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchMedia();
    }, [item.mediaId, item.mediaType]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                { width: width - 32, opacity: pressed ? 0.8 : 1 }
            ]}
        >
            <View style={styles.imageWrapper}>
                {media?.posterUrl ? (
                    <Image
                        source={{ uri: media.posterUrl }}
                        style={styles.image}
                    />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>{media?.title || item.mediaType}</Text>
                    </View>
                )}
                <View style={styles.overlay}>
                    <Text style={styles.title}>{item.title}</Text>
                    {item.caption && (
                        <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
                    )}
                </View>
            </View>
            
            <View style={styles.footer}>
                <Text style={styles.mediaType}>{item.mediaType}</Text>
                <Text style={styles.likeCount}>{item.likeCount} likes</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        marginHorizontal: 16,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageWrapper: {
        position: 'relative',
        aspectRatio: 1,
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2d3a4f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        padding: 16,
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 12,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    caption: {
        color: '#ccc',
        fontSize: 14,
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    mediaType: {
        color: '#3b82f6',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    likeCount: {
        color: '#888',
        fontSize: 12,
    },
});
