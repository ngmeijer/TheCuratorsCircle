import {Text, View, StyleSheet, Image, ActivityIndicator, Pressable, ScrollView} from 'react-native';
import {router, useFocusEffect} from "expo-router";
import {DynamicDataButton} from "@/components/DynamicDataButton";
import {StyledButton} from "@/components/StyledButton";
import CollectionButton from "@/components/CollectionButton";
import CreateCollectionModal from "@/components/CreateCollectionModal";
import Post from "@/components/Post";
import React, {useEffect, useCallback} from "react";
import {Colours} from "@/theme/colours";
import { useState } from "react";
import {getCollections, getPosts} from "@/api/databaseClient";
import { PostDto } from "@/DTOs/PostDto"
import { CollectionDto } from "@/DTOs/CollectionDto"

function handleEditProfile(){

}

const handlePostPress = (postId: string) => {
    console.log(`Navigating to post: ${postId}`);
    router.push({
        pathname: "/postDetails",
        params: { id: postId}
    });
}

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

export function useProfileCollections() {
    const [collections, setCollections] = useState<CollectionDto[]>([]);
    const [loadingCollections, setLoading] = useState(true);

    const loadCollections = useCallback(async () => {
        setLoading(true);
        try {
            const collections = await getCollections();
            setCollections(collections);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCollections();
        }, [loadCollections])
    );

    return { collections, loadingCollections, refreshCollections: loadCollections };
}

export default function ProfilePage() {
    const { posts, loadingPosts } = useProfilePosts();
    const { collections, loadingCollections, refreshCollections } = useProfileCollections();
    const [activeTab, setActiveTab] = useState<"collections" | "posts">("collections");
    const [modalVisible, setModalVisible] = useState(false);

    if (loadingPosts || loadingCollections) return <ActivityIndicator size="large" color="#fff" />;
    if (!posts.length) return <Text style={{ color: 'white', textAlign: 'center' }}>No posts</Text>;

    const renderHeader = () => (
        <View>
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
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} stickyHeaderIndices={[1]}>
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
            </View>

            {activeTab === "collections" ? (
                <View style={styles.collectionsGrid}>
                    <Pressable 
                        style={styles.createCollectionButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.createCollectionText}>+</Text>
                    </Pressable>
                    {collections.map((item) => (
                        <CollectionButton key={item.id} item={item} />
                    ))}
                </View>
            ) : (
                <View style={styles.collectionsGrid}>
                    {posts.map((item) => (
                        <Post
                            key={item.id}
                            item={item}
                            onPress={() => handlePostPress(item.id)}
                        />
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#121417',
    },
    scrollView: {
        flex:1,
    },
    profileHeader: {
        paddingTop: 20,
        paddingBottom: 16,
        width: '100%',
        backgroundColor: '#121417',
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
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
    },
    profileContentTabs: {
        backgroundColor: '#181B20',
        width: '100%',
    },
    collectionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
        alignItems: 'flex-start',
    },
    createCollectionButton: {
        width: '48%',
        margin: '1%',
        height: 80,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
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
    createCollectionText: {
        color: '#888',
        fontSize: 40,
        fontWeight: '300',
    },
    collectionsContainer: {
        flex: 1,
    },
});