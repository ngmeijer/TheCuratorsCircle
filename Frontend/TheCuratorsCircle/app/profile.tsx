import {Text, View, StyleSheet, ActivityIndicator, Pressable, ScrollView, useWindowDimensions} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { DynamicDataButton } from "@/components/DynamicDataButton";
import { StyledButton } from "@/components/StyledButton";
import CollectionButton from "@/components/CollectionButton";
import CreateCollectionModal from "@/components/CreateCollectionModal";
import EditProfileModal from "@/components/EditProfileModal";
import Post from "@/components/Post";
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useCallback, useState } from "react";
import { Colours } from "@/theme/colours";
import { getCollections, getPosts, getUserProfileByAlias, getCurrentUserProfile, getFollowingCount, getFollowersCount, getUserProfileById, followUser, unfollowUser, getIsFollowing, getCollectionsByUserId } from "@/api/databaseClient";
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

export function useUserProfile(alias?: string, userId?: string) {
    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (userId) {
                data = await getUserProfileById(userId);
            } else if (alias) {
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
    }, [alias, userId]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return { profile, loading, error, refresh: loadProfile };
}

export function useProfilePosts(userId?: string) {
    const [posts, setPosts] = useState<PostDto[]>([]);
    const [loadingPosts, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        async function loadPosts() {
            setLoading(true);
            try {
                const posts = await getPosts(userId);
                setPosts(posts);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadPosts();
    }, [userId]);

    return { posts, loadingPosts };
}

export function useProfileCollections(userId?: string) {
    const [collections, setCollections] = useState<CollectionDto[]>([]);
    const [loadingCollections, setLoading] = useState(true);

    const loadCollections = useCallback(async () => {
        setLoading(true);
        try {
            const data = userId 
                ? await getCollectionsByUserId(userId)
                : await getCollections();
            setCollections(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useFocusEffect(
        useCallback(() => {
            loadCollections();
        }, [loadCollections])
    );

    return { collections, loadingCollections, refreshCollections: loadCollections };
}

export function useFollowCounts(persistentId: string | null) {
    const [followingCount, setFollowingCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCounts() {
            if (!persistentId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [following, followers] = await Promise.all([
                    getFollowingCount(persistentId),
                    getFollowersCount(persistentId)
                ]);
                setFollowingCount(following);
                setFollowersCount(followers);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadCounts();
    }, [persistentId]);

    return { followingCount, followersCount, loading };
}

export function useFollowStatus(targetUserId: string | null) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStatus() {
            if (!targetUserId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const currentUser = await getCurrentUserProfile();
                if (currentUser) {
                    setIsCurrentUser(currentUser.persistentId === targetUserId);
                    if (currentUser.persistentId !== targetUserId) {
                        const following = await getIsFollowing(targetUserId);
                        setIsFollowing(following);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadStatus();
    }, [targetUserId]);

    const toggleFollow = async () => {
        if (isCurrentUser || !targetUserId) return;
        try {
            if (isFollowing) {
                await unfollowUser(targetUserId);
                setIsFollowing(false);
            } else {
                await followUser(targetUserId);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
        }
    };

    return { isFollowing, isCurrentUser, loading, toggleFollow };
}

export default function ProfilePage() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ alias?: string; userId?: string }>();
    const isViewingOther = !!params.alias || !!params.userId;
    const { profile, loading: loadingProfile, error: profileError, refresh: refreshProfile } = useUserProfile(params.alias, params.userId);
    const { posts, loadingPosts } = useProfilePosts(profile?.persistentId);
    const collectionsUserId = isViewingOther ? profile?.persistentId : undefined;
    const { collections, loadingCollections, refreshCollections } = useProfileCollections(collectionsUserId);
    const { followingCount, followersCount } = useFollowCounts(profile?.persistentId || null);
    const { isFollowing, isCurrentUser, toggleFollow } = useFollowStatus(profile?.persistentId || null);
    
    const [activeTab, setActiveTab] = useState<"collections" | "posts">("collections");
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    
    useEffect(() => {
        if (!loadingProfile && !profile && !isViewingOther) {
            router.replace('/createProfile');
        }
    }, [loadingProfile, profile, isViewingOther]);

    if (loadingProfile || loadingPosts || loadingCollections) {
        return <ActivityIndicator size="large" color="#fff" />;
    }

    if (!profile) {
        return <ActivityIndicator size="large" color="#fff" />;
    }

    const handleEditProfile = () => {
        setEditModalVisible(true);
    };

    const createButtonWidth = (width - 24) / 2;

    const currentUsername = profile?.usernamesHistory?.[0] || "@username";
    const displayName = profile?.displayName || "Your Name";
    const bio = profile?.bio || "No bio yet. Tap edit to add one!";
    const collectionsCount = collections?.length || 0;

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
                    {!isViewingOther && (
                        <Pressable style={styles.editButton} onPress={handleEditProfile}>
                            <Ionicons name="pencil" size={18} color="#fff" />
                        </Pressable>
                    )}
                    {isViewingOther && !isCurrentUser && (
                        <Pressable style={styles.followIconButton} onPress={toggleFollow}>
                            <Ionicons 
                                name={isFollowing ? "checkmark-circle" : "person-add"} 
                                size={28} 
                                color={isFollowing ? "#4CAF50" : "#FFB454"} 
                            />
                        </Pressable>
                    )}
                    <View style={styles.statsColumn}>
                        <Pressable style={styles.statItem} onPress={() => router.push({ pathname: '/followingList', params: { userId: profile.persistentId, type: 'followers' } })}>
                            <Text style={styles.statData}>{followersCount}</Text>
                            <Text style={styles.statName}>Followers</Text>
                        </Pressable>
                        <Pressable style={styles.statItem} onPress={() => router.push({ pathname: '/followingList', params: { userId: profile.persistentId, type: 'following' } })}>
                            <Text style={styles.statData}>{followingCount}</Text>
                            <Text style={styles.statName}>Following</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <View style={styles.profileContentTabs}>
                <View style={styles.profileContentButtons}>
                    <StyledButton
                        title={`Collections (${collectionsCount})`}
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
                        title={`Posts (${posts.length})`}
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
                        data={[...(isViewingOther ? [] : [{ id: 'create-new', type: 'create' } as any]), ...collections.map(c => ({ ...c, type: 'collection' }))]}
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
    profileLeftSectionOther: {
        width: '60%',
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
    followIconButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    followButton: {
        position: 'absolute',
        top: 50,
        right: 2,
        backgroundColor: '#7C6DFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    followButtonRow: {
        position: 'absolute',
        top: 50,
        right: 2,
        backgroundColor: '#7C6DFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    followButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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
    placeholderProfilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2A2E35',
        alignItems: 'center',
        justifyContent: 'center',
    },
});