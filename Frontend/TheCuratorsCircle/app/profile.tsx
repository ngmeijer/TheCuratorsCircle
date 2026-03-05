import {Text, View, StyleSheet, Image, ActivityIndicator, Pressable, ScrollView, useWindowDimensions} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {router, useFocusEffect} from "expo-router";
import {DynamicDataButton} from "@/components/DynamicDataButton";
import {StyledButton} from "@/components/StyledButton";
import CollectionButton from "@/components/CollectionButton";
import CreateCollectionModal from "@/components/CreateCollectionModal";
import EditProfileModal from "@/components/EditProfileModal";
import Post from "@/components/Post";
import React, {useEffect, useCallback, useState} from "react";
import {Colours} from "@/theme/colours";
import {getCollections, getPosts, getUserProfileByAlias, createUserProfile} from "@/api/databaseClient";
import { PostDto } from "@/DTOs/PostDto"
import { CollectionDto } from "@/DTOs/CollectionDto"
import { UserProfileDto } from "@/DTOs/UserProfileDto";

const handlePostPress = (postId: string) => {
    console.log(`Navigating to post: ${postId}`);
    router.push({
        pathname: "/postDetails",
        params: { id: postId}
    });
}

export function useUserProfile(alias: string) {
    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUserProfileByAlias(alias);
            setProfile(data);
        } catch (err: any) {
            console.error("Error loading profile:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [alias]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return { profile, loading, error, refresh: loadProfile };
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
    // TODO: Get this from auth context after login
    const CURRENT_USER_ALIAS = "@testerJerry";
    
    const { width } = useWindowDimensions();
    const { profile, loading: loadingProfile, error: profileError, refresh: refreshProfile } = useUserProfile(CURRENT_USER_ALIAS);
    const { posts, loadingPosts } = useProfilePosts();
    const { collections, loadingCollections, refreshCollections } = useProfileCollections();
    const [activeTab, setActiveTab] = useState<"collections" | "posts">("collections");
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);

    const handleEditProfile = () => {
        setEditModalVisible(true);
    };

    const createButtonWidth = (width - 24) / 2;

    // Get current username and display name from profile
    const currentUsername = profile?.usernamesHistory?.[0] || CURRENT_USER_ALIAS;
    const displayName = profile?.displayName || "Your Name";
    const bio = profile?.bio || "No bio yet. Tap edit to add one!";
    const collectionsCount = collections?.length || 0;

    if (loadingProfile || loadingPosts || loadingCollections) {
        return <ActivityIndicator size="large" color="#fff" />;
    }

    // Show error or prompt to create profile if not found
    if (profileError || !profile) {
        return (
            <View style={styles.container}>
                <View style={styles.profileHeader}>
                    <Image
                        source={require('../assets/images/IMG-20251121-WA0007.jpeg')}
                        style={styles.profilePicture}
                    />
                    <Text style={styles.fullName}>No Profile Found</Text>
                    <Text style={styles.username}>@{CURRENT_USER_ALIAS.replace('@', '')}</Text>
                    <Text style={styles.biography}>
                        {profileError ? `Error: ${profileError}` : "Create your profile to get started!"}
                    </Text>
                </View>
                <View style={styles.profileActions}>
                    <StyledButton
                        style={styles.editProfileButton}
                        title="Create Profile"
                        onPress={async () => {
                            try {
                                await createUserProfile({
                                    username: CURRENT_USER_ALIAS,
                                    displayName: "Your Name",
                                    bio: "Tell us about yourself!"
                                });
                                refreshProfile();
                            } catch (err: any) {
                                console.error("Error creating profile:", err);
                            }
                        }}
                    />
                </View>
            </View>
        );
    }

    const renderHeader = () => (
        <View>
            <View style={styles.profileHeader}>
                <Image
                    source={require('../assets/images/IMG-20251121-WA0007.jpeg')}
                    style={styles.profilePicture}
                />

                <Text style={styles.fullName}>
                    {displayName}
                </Text>
                <Text style={styles.username}>{currentUsername}</Text>
                <Text style={styles.biography}>{bio}</Text>
            </View>

            <View style={styles.profileActions}>
                <View style={styles.dataButtons}>
                    <DynamicDataButton
                        name="Collections"
                        data={String(collectionsCount)}
                        onPress={() => router.push("/collectionsPage")}
                        buttonStyle={styles.button}
                        nameTextStyle={styles.detailsNameButton}
                        dataTextStyle={styles.detailsDataButton}
                    />
                    <DynamicDataButton
                        name="Followers"
                        data="0"
                        onPress={() => router.push("/collectionsPage")}
                        buttonStyle={styles.button}
                        nameTextStyle={styles.detailsNameButton}
                        dataTextStyle={styles.detailsDataButton}
                    />
                    <DynamicDataButton
                        name="Following"
                        data="0"
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
        <>
            <ScrollView style={styles.container} stickyHeaderIndices={[1]}>
            <View style={styles.profileHeader}>
                <Image
                    source={require('../assets/images/IMG-20251121-WA0007.jpeg')}
                    style={styles.profilePicture}
                />

                <Text style={styles.fullName}>
                    {displayName}
                </Text>
                <Text style={styles.username}>{currentUsername}</Text>
                <Text style={styles.biography}>{bio}</Text>
            </View>

            <View style={styles.profileActions}>
                <View style={styles.dataButtons}>
                    <DynamicDataButton
                        name="Collections"
                        data={String(collectionsCount)}
                        onPress={() => router.push("/collectionsPage")}
                        buttonStyle={styles.button}
                        nameTextStyle={styles.detailsNameButton}
                        dataTextStyle={styles.detailsDataButton}
                    />
                    <DynamicDataButton
                        name="Followers"
                        data="0"
                        onPress={() => router.push("/collectionsPage")}
                        buttonStyle={styles.button}
                        nameTextStyle={styles.detailsNameButton}
                        dataTextStyle={styles.detailsDataButton}
                    />
                    <DynamicDataButton
                        name="Following"
                        data="0"
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
                <View style={styles.collectionsContainer}>
                    <FlashList
                        data={[{ id: 'create-new', type: 'create' } as any, ...collections.map(c => ({ ...c, type: 'collection' }))]}
                        renderItem={({ item }: any) => {
                            if (item.type === 'create') {
                                return (
                                    <Pressable 
                                        style={[styles.createCollectionButton, { width: createButtonWidth - 8, height: 75 }]}
                                        onPress={() => setModalVisible(true)}
                                    >
                                        <Text style={styles.createCollectionText}>+</Text>
                                    </Pressable>
                                );
                            }
                            return (
                                <CollectionButton 
                                    item={item} 
                                />
                            );
                        }}
                        masonry
                        numColumns={2}
                        keyExtractor={(item: any) => item.id}
                        contentContainerStyle={styles.listContent}
                    />
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
        <CreateCollectionModal 
            visible={modalVisible} 
            onClose={() => setModalVisible(false)}
            onSuccess={() => {
                setModalVisible(false);
                refreshCollections();
            }}
        />
        <EditProfileModal 
            visible={editModalVisible}
            profile={profile}
            onClose={() => setEditModalVisible(false)}
            onSuccess={() => {
                setEditModalVisible(false);
                refreshProfile();
            }}
        />
        </>
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
        flex: 1,
    },
    listContent: {
        padding: 8,
    },
    createCollectionButton: {
        margin: 4,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    collectionsContainer: {
        flex: 1,
        minHeight: 300,
    },
    posts: {
        flex: 1,
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
});