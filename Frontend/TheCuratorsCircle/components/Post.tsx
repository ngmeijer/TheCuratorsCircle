import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { PostDto } from '@/DTOs/PostDto';
import { getMediaById, MediaSearchResult } from '@/api/databaseClient';

interface PostProps {
    item: PostDto;
    username?: string;
    compact?: boolean;
    onPress?: () => void;
}

function formatTimestamp(createdAt: string): string {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
}

export default function Post({ item, username, compact = false, onPress }: PostProps) {
    const { width } = useWindowDimensions();
    const [media, setMedia] = useState<MediaSearchResult | null>(null);
    const [loading, setLoading] = useState(true);

    const itemWidth = compact ? (width - 24) / 2 : undefined;

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
            <View style={[compact ? styles.containerCompact : styles.container, itemWidth ? { width: itemWidth } : {}]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                compact ? styles.containerCompact : styles.container,
                itemWidth ? { width: itemWidth } : {},
                { opacity: pressed ? 0.8 : 1 }
            ]}
        >
            <View style={compact ? [styles.imageWrapperCompact, itemWidth ? { width: itemWidth - 8 } : {}] : styles.imageWrapper}>
                {media?.posterUrl ? (
                    <Image
                        source={{ uri: media.posterUrl }}
                        style={compact ? styles.imageCompact : styles.image}
                    />
                ) : (
                    <View style={compact ? styles.placeholderCompact : styles.placeholder}>
                        <Text style={styles.placeholderText}>{media?.title || item.mediaType}</Text>
                    </View>
                )}
                {compact && (
                    <View style={styles.topOverlayCompact}>
                        <View style={styles.mediaTypeRow}>
                            <Text style={styles.mediaTypeBadge}>{item.mediaType}</Text>
                        </View>
                        <Text style={styles.mediaTitleCompact} numberOfLines={1}>
                            {media?.title}
                        </Text>
                    </View>
                )}
                <View style={compact ? styles.overlayCompact : styles.overlay}>
                    <Text style={compact ? styles.titleCompact : styles.title}>{item.title}</Text>
                    <View style={compact ? styles.metaRowCompact : undefined}>
                        <View style={compact ? styles.usernameRowCompact : undefined}>
                            {username && (
                                <Text style={compact ? styles.usernameCompact : styles.username} numberOfLines={1}>
                                    {username}
                                </Text>
                            )}
                            <Text style={compact ? styles.timestampCompact : styles.likeCount}>
                                {formatTimestamp(item.createdAt)}
                            </Text>
                        </View>
                        <Text style={compact ? styles.likeCountCompact : styles.likeCount}>
                            {item.likeCount} ♥
                        </Text>
                    </View>
                </View>
            </View>
            
            {!compact && (
                <View style={styles.footer}>
                    {username && <Text style={styles.username}>{username}</Text>}
                    <Text style={styles.mediaType}>{item.mediaType}</Text>
                    <Text style={styles.likeCount}>{item.likeCount} likes</Text>
                </View>
            )}
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
    username: {
        color: '#9ca3af',
        fontSize: 12,
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
    containerCompact: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        overflow: 'hidden',
        margin: 4,
    },
    imageWrapperCompact: {
        position: 'relative',
        aspectRatio: 2/3,
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageCompact: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderCompact: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2d3a4f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topOverlayCompact: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    mediaTypeRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    mediaTypeBadge: {
        color: '#3b82f6',
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 3,
        overflow: 'hidden',
    },
    mediaTitleCompact: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    overlayCompact: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 8,
    },
    titleCompact: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    metaRowCompact: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    usernameRowCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    usernameCompact: {
        color: '#9ca3af',
        fontSize: 10,
        flexShrink: 1,
    },
    timestampCompact: {
        color: '#666',
        fontSize: 9,
        marginLeft: 6,
    },
    likeCountCompact: {
        color: '#f87171',
        fontSize: 10,
    },
});
