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

    const loadPosts = useCallback(async () => {
        console.log('[Feed] Loading posts...');
        try {
            const posts = await getFeed();
            console.log('[Feed] Posts loaded:', posts.length);
            setPosts(posts);
        } catch (err: any) {
            console.error('[Feed] Error loading posts:', err.message || err);
        } finally {
            setLoading(false);
            console.log('[Feed] Loading complete');
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPosts();
        setRefreshing(false);
    }, [loadPosts]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    return { posts, loadingPosts, refreshing, onRefresh };
}

function onPressPost() {
    router.push("/postDetails");
}

export default function ForYouPage() {
    const insets = useSafeAreaInsets();
    const { profile, loading: loadingProfile, refresh: refreshProfile } = useCurrentUserProfile();
    const { posts, loadingPosts, refreshing, onRefresh } = useProfilePosts();

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

    console.log('[ForYouPage] Rendering - posts:', posts.length, 'loadingPosts:', loadingPosts);

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
                <View style={{ flex: 1 }}>
                    <FlashList
                        data={posts}
                        numColumns={2}
                        masonry
                        estimatedItemSize={200}
                        renderItem={({ item }: { item: PostWithProfileDto }) => {
                            console.log('[ForYouPage] Rendering item:', item.post.id);
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
                        ListFooterComponent={<View style={{ height: 80 }} />}
                    />
                </View>
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
