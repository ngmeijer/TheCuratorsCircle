import {Text, View, StyleSheet, Image, FlatList, ActivityIndicator} from 'react-native';
import {router} from "expo-router";
import {DynamicDataButton} from "@/components/DynamicDataButton";
import {StyledButton} from "@/components/StyledButton";
import CollectionButton from "@/components/CollectionButton";
import Post from "@/components/Post";
import React, {useEffect} from "react";
import {Colours} from "@/theme/colours";
import { useState } from "react";
import { posts } from '../mock/posts';
import { collections } from '../mock/collections';
import { getMovie } from "@/api/databaseClient";
import { PostDto } from "@/DTOs/PostDto"

function handleEditProfile(){

}

export function useProfilePosts() {
    const [posts, setPosts] = useState<PostDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            setLoading(true);
            try {
                const movieNames = ["Iron Man", "Spider-Man: No Way Home", "The Batman"];
                const posts = await Promise.all(
                    movieNames.map(async (name) => {
                        const movieArray = await getMovie(name);
                        if (!movieArray || movieArray.length === 0) return null;

                        const movie = movieArray[0]; // <- first movie in array

                        console.log("Movie ID received from frontend:" + movie.id);

                        return {
                            id: movie.id,            // already has id like 'omdb-tt1877830'
                            name: movie.name,
                            title: movie.movieTitle,
                            category: "Movies",
                            aspectRatio: 0.67,
                            url: movie.posterUrl,
                            likeCount: Math.floor(Math.random() * 5000),
                            commentCount: Math.floor(Math.random() * 200),
                            shareCount: Math.floor(Math.random() * 50),
                        };
                    })
                );


                setPosts(posts.filter(Boolean) as PostDto[]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadPosts();
    }, []);

    return { posts, loading };
}

export default function ProfilePage() {
    const { posts, loading } = useProfilePosts();
    const [activeTab, setActiveTab] = useState<"collections" | "posts">("collections");

    if (loading) return <ActivityIndicator size="large" color="#fff" />;
    if (!posts.length) return <Text style={{ color: 'white', textAlign: 'center' }}>No posts</Text>;
    console.log(posts.map(p => ({ id: p.id, title: p.name })));

    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Image
                    source={require('../assets/images/IMG-20251121-WA0007.jpeg')}
                    style={styles.profilePicture}
                />

                <Text style={styles.fullName}>
                    Jerry Meijer
                </Text>
                <Text style={styles.username}>@testerJerry</Text>
                <Text style={styles.biography}>miauw miauw miauw.

                    miau miauw, meow miaow miauw… miauw miauw.
                    miauw miauw miauw miauw.

                    meow miaow,
                    miauw miau miauw.
                    miauw… miauw..</Text>
            </View>

            <View style={styles.profileActions}>
                <View style={styles.dataButtons}>
                    <DynamicDataButton
                        name="Collections"
                        data="5"
                        onPress={() => router.push("/collectionsPage")}
                        buttonStyle={styles.button}
                        nameTextStyle={styles.detailsNameButton}
                        dataTextStyle={styles.detailsDataButton}
                    />
                    <DynamicDataButton
                        name="Followers"
                        data="5"
                        onPress={() => router.push("/collectionsPage")}
                        buttonStyle={styles.button}
                        nameTextStyle={styles.detailsNameButton}
                        dataTextStyle={styles.detailsDataButton}
                    />
                    <DynamicDataButton
                        name="Following"
                        data="5"
                        onPress={() => router.push("/collectionsPage")}
                        buttonStyle={styles.button}
                        nameTextStyle={styles.detailsNameButton}
                        dataTextStyle={styles.detailsDataButton}
                    />
                    </View>

                <StyledButton
                    style={styles.editProfileButton}
                    title="Edit profile"
                    onPress={handleEditProfile}
                />
            </View>

            <View style={styles.profileContentTabs}>
                <View style={styles.profileContentButtons}>
                    <StyledButton
                        title="Collections"
                        onPress={() => setActiveTab("collections")}
                        style={[
                            styles.tabButton,
                            activeTab === "collections" && styles.activeTabButton
                        ]}
                        textStyle={[
                            styles.tabButtonText,
                            activeTab === "collections" && styles.activeTabText
                        ]}
                    />

                    <StyledButton
                        title="Posts"
                        onPress={() => setActiveTab("posts")}
                        style={[
                            styles.tabButton,
                            activeTab === "posts" && styles.activeTabButton
                        ]}
                        textStyle={[
                            styles.tabButtonText,
                            activeTab === "posts" && styles.activeTabText
                        ]}
                    />
                </View>
                {activeTab === "collections" ? (
                    <FlatList
                        key="collections"
                        data={collections}
                        numColumns={2}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <CollectionButton item={item} />}
                    />
                ) : (
                    <FlatList
                        key="posts"
                        data={posts}
                        numColumns={1}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <Post item={item} />}
                    />
                )}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121417',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileHeader: {
        flex: 2,
        marginTop: 20,
        width: '100%',
        backgroundColor: '#121417',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicture:{
      width:80, height:80,
        borderRadius: 30,
    },
    fullName: {
        color: Colours.textPrimary,
        fontFamily: "LeagueSpartan_600SemiBold",
        fontSize: 24
    },
    username: {
      fontSize: 20,
        color: '#FFB454',
        fontFamily: "LeagueSpartan_600SemiBold",
    },
    biography: {
        color: 'red',
        fontFamily: "Inter_400Regular",
        textAlign: 'center',
        width: 250,
        marginVertical:5,
    },
    profileActions: {
        backgroundColor:"#121417",
        flex:1,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
    },
    profileContentTabs: {
        flex:3,
        backgroundColor: '#181B20',
        width: '100%',
    },
    collections: {
        flex:5,
        flexDirection: 'column',
     },
    posts: {
        flex:5,
        flexDirection: 'column',
    },
    tabText: {
        color: "#AAA",
    },

    activeTabButton: {
        backgroundColor: "#FFB454",
    },
    activeTabText: {
        color: "#000",
    },
    tabButton: {
        backgroundColor: "#2A2E35",
        paddingHorizontal: 24,
    },
    tabButtonText: {
        color: "#AAA",
    },
    text: {
        color: '#fff'
    },
    button: {
        alignItems: 'center',
        textAlign: "auto",
        justifyContent: "center",
        width:75,
        height:50,
        marginVertical: 5,
        marginHorizontal: 15,
        borderRadius: 10
    },
    dataButtons: {
        flexDirection:"row"
    },
    detailsNameButton: {
        color: '#fff',
        fontSize:12
    },
    detailsDataButton: {
        color: '#fff',
        fontSize: 20,
        fontFamily:''
    },
    editProfileButton: {
        width: 200,
        backgroundColor: '#7C6DFF',
        color:'red',
        marginVertical:10,
    },
    profileContentButtons:{
        flexDirection:"row",
        justifyContent:"space-around",
        marginVertical:10,
    },
    showCollectionsButton: {

    },
    showPostsButton: {

    },
});