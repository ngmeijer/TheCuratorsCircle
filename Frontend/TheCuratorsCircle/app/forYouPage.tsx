import React, {useEffect, useState, useCallback} from 'react';
import {View, FlatList, StyleSheet, Text, Pressable, ActivityIndicator, RefreshControl} from 'react-native';
import Post from '../components/Post';
import Ionicons from "@expo/vector-icons/Ionicons";
import {router} from "expo-router";
import {PostDto} from "@/DTOs/PostDto";
import {getPosts, getCurrentUserProfile} from "@/api/databaseClient";
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
    const [posts, setPosts] = useState<PostDto[]>([]);
    const [loadingPosts, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPosts = useCallback(async () => {
        try {
            const posts = await getPosts();
            setPosts(posts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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

    if (!posts.length) return <Text style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>No posts</Text>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>For You</Text>
            </View>

            <FlatList
                key="posts"
                data={posts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <Post
                        item={item}
                        onPress={() =>
                            router.push({
                                pathname:"/postDetails",
                                params: {id: item.id},
                            })
                        }
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#fff"
                    />
                }
            />
            <View style={styles.quickAccessMenu}>
                <Pressable style={styles.button} onPress={() => console.log('Google')}>
                    <Ionicons name="albums" size={28} />
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
});
