import {Text, View, StyleSheet, Image, ActivityIndicator, Pressable, ScrollView, useWindowDimensions} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {router, useFocusEffect} from "expo-router";
import {DynamicDataButton} from "@/components/DynamicDataButton";
import {StyledButton} from "@/components/StyledButton";
import CollectionButton from "@/components/CollectionButton";
import CreateCollectionModal from "@/components/CreateCollectionModal";
import EditProfileModal from "@/components/EditProfileModal";
import Post from "@/components/Post";
import Ionicons from '@expo/vector-icons/Ionicons';
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
                <View style={styles.editButtonContainer}>
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
                <View style={styles.profileLeftSection}>
                    <Text style={styles.fullName}>
                        {displayName}
                    </Text>
                    <Text style={styles.username}>{currentUsername}</Text>
                    <Text style={styles.biography}>{bio}</Text>
                </View>
                
                <View style={styles.profileRightSection}>
                    <Image
                        source={require('../assets/images/IMG-20251121-WA0007.jpeg')}
                        style={styles.profilePicture}
                    />
                    <Pressable style={styles.editButton} onPress={handleEditProfile}>
                        <Ionicons name="pencil" size={18} color="#fff" />
                    </Pressable>
                    <View style={styles.statsColumn}>
                        <View style={styles.statItem}>
                            <Text style={styles.statData}>{collectionsCount}</Text>
                            <Text style={styles.statName}>Collections</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statData}>0</Text>
                            <Text style={styles.statName}>Followers</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statData}>0</Text>
                            <Text style={styles.statName}>Following</Text>
                        </View>
                    </View>
                </View>
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
                <View style={styles.profileLeftSection}>
                    <Text style={styles.fullName}>
                        {displayName}
                    </Text>
                    <Text style={styles.username}>{currentUsername}</Text>
                    <Text style={styles.biography}>{bio}</Text>
                </View>
                
                <View style={styles.profileRightSection}>
                    <Image
                        source={require('../assets/images/IMG-20251121-WA0007.jpeg')}
                        style={styles.profilePicture}
                    />
                    <Pressable style={styles.editButton} onPress={handleEditProfile}>
                        <Ionicons name="pencil" size={18} color="#fff" />
                    </Pressable>
                    <View style={styles.statsColumn}>
                        <View style={styles.statItem}>
                            <Text style={styles.statData}>{collectionsCount}</Text>
                            <Text style={styles.statName}>Collections</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statData}>0</Text>
                            <Text style={styles.statName}>Followers</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statData}>0</Text>
                            <Text style={styles.statName}>Following</Text>
                        </View>
                    </View>
                </View>
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
    profileHeader: {
        paddingTop: 0,
        paddingBottom: 8,
        width: '100%',
        backgroundColor: '#121417',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    profileLeftSection: {
        width: '70%',
        paddingRight: 12,
        paddingLeft: 16,
        justifyContent: 'center',
        backgroundColor: '#121417',
    },
    profileRightSection: {
        width: '30%',
        alignItems: 'center',
        paddingRight: 12,
        paddingTop: 30,
        backgroundColor: '#121417',
    },
    statsColumn: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statItem: {
        alignItems: 'center',
        marginVertical: 8,
    },
    statData: {
        color: Colours.textPrimary,
        fontSize: 20,
        fontFamily: "LeagueSpartan_600SemiBold",
    },
    statName: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    profilePicture: {
        width: 70,
        height: 70,
        borderRadius: 25,
        marginBottom: 8,
    },
    fullName: {
        color: Colours.textPrimary,
        fontFamily: "LeagueSpartan_600SemiBold",
        fontSize: 24,
        marginTop: -20,
    },
    username: {
        fontSize: 20,
        color: '#FFB454',
        fontFamily: "LeagueSpartan_600SemiBold",
    },
    biography: {
        color: '#fff',
        fontFamily: "Inter_400Regular",
        textAlign: 'left',
        backgroundColor: '#2A2E35',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        minHeight: 120,
    },
    editButtonContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 4,
        backgroundColor: '#121417',
    },
    editButton: {
        position: 'absolute',
        top: 50,
        right: 8,
        backgroundColor: '#7C6DFF',
        padding: 8,
        borderRadius: 20,
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
    profileContentButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 4,
    },
    createCollectionText: {
        color: '#888',
        fontSize: 40,
        fontWeight: '300',
    },
    editProfileButton: {
        width: '95%',
        backgroundColor: '#7C6DFF',
        marginVertical: 10,
        alignSelf: 'center',
    },
});