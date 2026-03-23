import React, {useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, Text, Pressable, ActivityIndicator, RefreshControl} from 'react-native';
import { FlashList } from "@shopify/flash-list";
import Post from '../components/Post';
import Ionicons from "@expo/vector-icons/Ionicons";
import {router} from "expo-router";
import {PostWithProfileDto} from "@/DTOs/PostDto";
import {getFeed, getCurrentUserProfile} from "@/api/databaseClient";
import {UserProfileDto} from "@/DTOs/UserProfileDto";
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export function useCurrentUserProfile() {
    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const profile = await getCurrentUserProfile();
            setProfile(profile);
        } catch (err) {
            console.error(err);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return { profile, loading, refresh: loadProfile };
}

export function useProfilePosts() {
    const [posts, setPosts] = useState<PostWithProfileDto[]>([]);
    const [loadingPosts, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const loadPosts = useCallback(async (cursor?: string, isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else if (cursor) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        
        try {
            const result = await getFeed(cursor);
            if (cursor) {
                // Append new posts when loading more
                setPosts(prev => [...prev, ...result.posts]);
            } else {
                // Replace posts on refresh or initial load
                setPosts(result.posts);
            }
            setHasMore(result.hasMore);
            setNextCursor(result.nextCursor);
        } catch (err: any) {
            console.error('[Feed] Error loading posts:', err.message || err);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setNextCursor(null);
        await loadPosts(undefined, true);
    }, [loadPosts]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && nextCursor) {
            loadPosts(nextCursor);
        }
    }, [loadPosts, loadingMore, hasMore, nextCursor]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    return { posts, loadingPosts, refreshing, onRefresh, loadMore, loadingMore, hasMore };
}

function onPressPost() {
    router.push("/postDetails");
}

export default function ForYouPage() {
    const insets = useSafeAreaInsets();
    const { profile, loading: loadingProfile, refresh: refreshProfile } = useCurrentUserProfile();
    const { posts, loadingPosts, refreshing, onRefresh, loadMore, loadingMore, hasMore } = useProfilePosts();

    useEffect(() => {
        if (!loadingProfile && !profile) {
            router.replace('/createProfile');
        }
    }, [loadingProfile, profile]);

    if (loadingProfile || loadingPosts) {
        return <ActivityIndicator size="large" color="#fff" />;
    }

    if (!profile) {
        return <ActivityIndicator size="large" color="#fff" />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>For You</Text>
            </View>

            {!posts.length ? (
                <View style={styles.emptyFeed}>
                    <Text style={styles.emptyText}>No posts yet</Text>
                    <Text style={styles.emptySubtext}>Follow people to see their posts here</Text>
                </View>
            ) : (
                    <FlashList
                        data={posts}
                        numColumns={2}
                        masonry
                        estimatedItemSize={200}
                        extraData={posts.length}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        renderItem={({ item }: { item: PostWithProfileDto }) => {
                            return (
                                <Post
                                    item={item.post}
                                    username={item.profile?.usernamesHistory?.[0] || '@unknown'}
                                    compact={true}
                                    onPress={() =>
                                        router.push({
                                            pathname:"/postDetails",
                                            params: {id: item.post.id},
                                        })
                                    }
                                />
                            );
                        }}
                        keyExtractor={(item: PostWithProfileDto) => item.post.id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#fff"
                            />
                        }
                        ListFooterComponent={
                            loadingMore ? (
                                <ActivityIndicator size="small" color="#fff" style={{ padding: 20 }} />
                            ) : !hasMore && posts.length > 0 ? (
                                <Text style={{ color: '#666', textAlign: 'center', padding: 20 }}>No more posts</Text>
                            ) : (
                                <View style={{ height: 80 }} />
                            )
                        }
                    />
            )}

            <View style={styles.quickAccessMenu}>
                <Pressable style={styles.button} onPress={() => router.push('/search')}>
                    <Ionicons name="search" size={28} />
                </Pressable>

                <Pressable style={styles.button} onPress={() => router.push('/createPost')}>
                    <Ionicons name="create" size={28} />
                </Pressable>

                <Pressable style={styles.button} onPress={() => router.push('/profile')}>
                    <Ionicons name="person-circle" size={28} />
                </Pressable>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1724',
    },
    header: {
        paddingTop: 40,
        paddingBottom: 12,
        paddingHorizontal: 20,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    listContent: {
        paddingBottom: 100,
    },
    separator: {
        height: 25,
    },
    quickAccessMenu: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        bottom: 30,
        left: 60,
        right: 60,
        backgroundColor: 'white',
        padding: 6,
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    button: {
        padding: 4,
        marginVertical: 2,
        alignItems: 'center',
    },
    emptyFeed: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubtext: {
        color: '#888',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
