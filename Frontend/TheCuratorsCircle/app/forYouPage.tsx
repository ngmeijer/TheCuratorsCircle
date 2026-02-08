import React, {useEffect, useState} from 'react';
import {View, FlatList, StyleSheet, Text, Pressable, ActivityIndicator} from 'react-native';
import Post from '../components/Post';
import Ionicons from "@expo/vector-icons/Ionicons";
import {router} from "expo-router";
import {PostDto} from "@/DTOs/PostDto";
import {getPosts} from "@/api/databaseClient";

export function useProfilePosts() {
    const [posts, setPosts] = useState<PostDto[]>([]);
    const [loadingPosts, setLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            setLoading(true);
            try {
                const posts = await getPosts();
                setPosts(posts);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadPosts();
    }, []);

    return { posts, loadingPosts };
}

export default function ForYouPage() {
    const { posts, loadingPosts } = useProfilePosts();

    if (loadingPosts) return <ActivityIndicator size="large" color="#fff" />;
    if (!posts.length) return <Text style={{ color: 'white', textAlign: 'center' }}>No posts</Text>;

    return (
        <View style={styles.container}>
            {/* Optional header */}
            <View style={styles.header}>
                <Text style={styles.logo}>For You</Text>
            </View>

            <FlatList
                key="posts"
                data={posts}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Post item={item} />}
            />
            <View style={styles.quickAccessMenu}>
                <Pressable style={styles.button} onPress={() => console.log('Google')}>
                    <Ionicons name="albums" size={28} />
                </Pressable>

                <Pressable style={styles.button} onPress={() => console.log('Google')}>
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
    separator: {
        height: 25, // small gap between posts
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
        elevation: 5,      // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    button: {
        padding: 4,
        marginVertical: 2,
        alignItems: 'center',
    },
});
