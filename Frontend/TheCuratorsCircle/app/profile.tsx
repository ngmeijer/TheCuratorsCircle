import {Text, View, StyleSheet, ActivityIndicator, Pressable, ScrollView, useWindowDimensions, TextInput} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router, useFocusEffect } from "expo-router";
import { DynamicDataButton } from "@/components/DynamicDataButton";
import { StyledButton } from "@/components/StyledButton";
import CollectionButton from "@/components/CollectionButton";
import CreateCollectionModal from "@/components/CreateCollectionModal";
import EditProfileModal from "@/components/EditProfileModal";
import Post from "@/components/Post";
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useCallback, useState } from "react";
import { Colours } from "@/theme/colours";
import { getCollections, getPosts, getUserProfileByAlias, getCurrentUserProfile, createUserProfile } from "@/api/databaseClient";
import { PostDto } from "@/DTOs/PostDto"
import { CollectionDto } from "@/DTOs/CollectionDto"
import { UserProfileDto } from "@/DTOs/UserProfileDto";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const handlePostPress = (postId: string) => {
    console.log(`Navigating to post: ${postId}`);
    router.push({
        pathname: "/postDetails",
        params: { id: postId}
    });
}

export function useUserProfile(alias?: string) {
    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (alias) {
                data = await getUserProfileByAlias(alias);
            } else {
                data = await getCurrentUserProfile();
            }
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
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { profile, loading: loadingProfile, error: profileError, refresh: refreshProfile } = useUserProfile();
    const { posts, loadingPosts } = useProfilePosts();
    const { collections, loadingCollections, refreshCollections } = useProfileCollections();
    const [activeTab, setActiveTab] = useState<"collections" | "posts">("collections");
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    
    const [newUsername, setNewUsername] = useState('');
    const [newDisplayName, setNewDisplayName] = useState('');
    const [newBio, setNewBio] = useState('');
    const [creatingProfile, setCreatingProfile] = useState(false);
    const [createError, setCreateError] = useState('');

    const handleEditProfile = () => {
        setEditModalVisible(true);
    };

    const handleCreateProfileSubmit = async () => {
        if (!newUsername.trim()) {
            setCreateError('Username is required');
            return;
        }
        if (!newUsername.startsWith('@')) {
            setCreateError('Username must start with @');
            return;
        }

        setCreatingProfile(true);
        setCreateError('');
        try {
            await createUserProfile({
                username: newUsername.trim(),
                displayName: newDisplayName.trim(),
                bio: newBio.trim(),
            });
            refreshProfile();
        } catch (err: any) {
            setCreateError(err.message || 'Failed to create profile');
        } finally {
            setCreatingProfile(false);
        }
    };

    const createButtonWidth = (width - 24) / 2;

    // Get current username and display name from profile
    const currentUsername = profile?.usernamesHistory?.[0] || "@username";
    const displayName = profile?.displayName || "Your Name";
    const bio = profile?.bio || "No bio yet. Tap edit to add one!";
    const collectionsCount = collections?.length || 0;

    if (loadingProfile || loadingPosts || loadingCollections) {
        return <ActivityIndicator size="large" color="#fff" />;
    }

    // Show error or prompt to create profile if not found
    if (profileError || !profile) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScrollView contentContainerStyle={styles.createProfileContainer}>
                    <View style={styles.createProfileHeader}>
                        <View style={styles.placeholderProfilePicture}>
                            <Ionicons name="person" size={40} color="#666" />
                        </View>
                    </View>

                    <View style={styles.createProfileForm}>
                        <Text style={styles.inputLabel}>Username</Text>
                        <TextInput
                            style={styles.createProfileInput}
                            placeholder="@username"
                            placeholderTextColor="#666"
                            value={newUsername}
                            onChangeText={(text) => {
                                setNewUsername(text);
                                setCreateError('');
                            }}
                            maxLength={30}
                            autoCapitalize="none"
                        />

                        <Text style={styles.inputLabel}>Display Name</Text>
                        <TextInput
                            style={styles.createProfileInput}
                            placeholder="Your name"
                            placeholderTextColor="#666"
                            value={newDisplayName}
                            onChangeText={(text) => {
                                setNewDisplayName(text);
                                setCreateError('');
                            }}
                            maxLength={50}
                        />

                        <Text style={styles.inputLabel}>Bio</Text>
                        <TextInput
                            style={[styles.createProfileInput, styles.bioInput]}
                            placeholder="Write something about yourself here!"
                            placeholderTextColor="#666"
                            value={newBio}
                            onChangeText={(text) => {
                                setNewBio(text);
                                setCreateError('');
                            }}
                            maxLength={500}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        {createError ? (
                            <Text style={styles.errorText}>{createError}</Text>
                        ) : null}

                        <StyledButton
                            style={styles.createProfileButton}
                            title={creatingProfile ? "Creating..." : "Create Profile"}
                            onPress={handleCreateProfileSubmit}
                            disabled={creatingProfile}
                        />
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <>
            <ScrollView 
                style={[styles.container, { paddingTop: insets.top }]} 
                stickyHeaderIndices={[1]}
                contentInsetAdjustmentBehavior="never"
            >
            <View style={styles.profileHeader}>
                <View style={styles.profileLeftSection}>
                    <Text style={styles.fullName}>
                        {displayName}
                    </Text>
                    <Text style={styles.username}>{currentUsername}</Text>
                    <Text style={styles.biography}>{bio}</Text>
                </View>
                
                <View style={styles.profileRightSection}>
                    <View style={styles.profilePicturePlaceholder}>
                        <Ionicons name="person" size={40} color="#666" />
                    </View>
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
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
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
        backgroundColor: '#0d0f12',
    },
    profileHeader: {
        paddingTop: 8,
        paddingBottom: 0,
        width: '100%',
        backgroundColor: '#1a1d23',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    profileLeftSection: {
        width: '70%',
        paddingRight: 12,
        paddingLeft: 16,
        paddingTop: 28,
        justifyContent: 'center',
        backgroundColor: '#1a1d23',
    },
    profileRightSection: {
        width: '30%',
        alignItems: "center",
        paddingRight: 24,
        paddingTop: 30,
    },
    statsColumn: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statItem: {
        alignItems: 'center',
        marginVertical: 2,
    },
    statData: {
        color: Colours.textPrimary,
        fontSize: 20,
        fontFamily: "LeagueSpartan_600SemiBold",
    },
    statName: {
        color: '#888',
        fontSize: 12,
    },
    profilePicture: {
        width: 70,
        height: 70,
        borderRadius: 25,
        marginBottom: 8,
    },
    profilePicturePlaceholder: {
        width: 70,
        height: 70,
        borderRadius: 25,
        marginBottom: 8,
        backgroundColor: '#2A2E35',
        alignItems: 'center',
        justifyContent: 'center',
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
        padding: 4,
        borderRadius: 8,
        marginTop: 8,
        minHeight: 140,
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
        right: 2,
        backgroundColor: '#7C6DFF',
        padding: 8,
        borderRadius: 20,
    },
    profileContentTabs: {
        width: '100%',
        backgroundColor:"#1a1d23",
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
    createProfileContainer: {
        padding: 16,
        alignItems: 'center',
    },
    createProfileHeader: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 20,
    },
    placeholderProfilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2A2E35',
        alignItems: 'center',
        justifyContent: 'center',
    },
    createProfileForm: {
        width: '100%',
        paddingHorizontal: 8,
    },
    inputLabel: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 8,
        marginTop: 12,
    },
    createProfileInput: {
        backgroundColor: '#2A2E35',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    bioInput: {
        height: 100,
        paddingTop: 12,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
    createProfileButton: {
        width: '100%',
        backgroundColor: '#7C6DFF',
        marginTop: 24,
    },
});