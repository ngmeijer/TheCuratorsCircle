import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getFollowingList, getFollowersList, followUser, unfollowUser, getIsFollowing, getCurrentUserProfile } from '@/api/databaseClient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledButton } from '@/components/StyledButton';

interface UserProfile {
    persistentId: string;
    ownerUid: string;
    usernamesHistory: string[];
    displayName: string;
    bio: string;
}

export default function FollowingListPage() {
    const insets = useSafeAreaInsets();
    const { userId, type } = useLocalSearchParams<{ userId: string; type: string }>();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

    const isFollowersList = type === 'followers';
    const title = isFollowersList ? 'Followers' : 'Following';

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);
            try {
                const currentUser = await getCurrentUserProfile();
                if (currentUser) {
                    setCurrentUserId(currentUser.persistentId);
                }

                const data = isFollowersList
                    ? await getFollowersList()
                    : await getFollowingList();

                setUsers(data);

                // Check follow status for each user
                const status: Record<string, boolean> = {};
                for (const user of data) {
                    try {
                        status[user.persistentId] = await getIsFollowing(user.persistentId);
                    } catch {
                        status[user.persistentId] = false;
                    }
                }
                setFollowingStatus(status);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error('Error loading list:', message);
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [userId, type]);

    const handleFollowToggle = async (targetUserId: string) => {
        try {
            const isFollowing = followingStatus[targetUserId];
            if (isFollowing) {
                await unfollowUser(targetUserId);
                setFollowingStatus(prev => ({ ...prev, [targetUserId]: false }));
            } else {
                await followUser(targetUserId);
                setFollowingStatus(prev => ({ ...prev, [targetUserId]: true }));
            }
        } catch (err) {
            console.error('Follow error:', err);
        }
    };

    const renderItem = ({ item }: { item: UserProfile }) => {
        const username = item.usernamesHistory?.[0] || '@unknown';
        const isCurrentUser = currentUserId === item.persistentId;
        const isFollowing = followingStatus[item.persistentId] || false;

        return (
            <Pressable 
                style={styles.userCard}
                onPress={() => router.push({ pathname: '/profile', params: { userId: item.persistentId } })}
            >
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={24} color="#666" />
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.displayName}>{item.displayName || 'No name'}</Text>
                    <Text style={styles.username}>{username}</Text>
                </View>
                {!isCurrentUser && (
                    <StyledButton
                        title={isFollowing ? 'Following' : 'Follow'}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(item.persistentId);
                        }}
                        style={isFollowing ? styles.followingButton : styles.followButton}
                    />
                )}
            </Pressable>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.title}>{title}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#fff" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.persistentId}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {isFollowersList ? 'No followers yet' : 'Not following anyone yet'}
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0f12',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    listContent: {
        padding: 16,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#2A2E35',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    displayName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    username: {
        color: '#888',
        fontSize: 14,
        marginTop: 2,
    },
    followButton: {
        backgroundColor: '#7C6DFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    followingButton: {
        backgroundColor: '#2A2E35',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#444',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
    errorText: {
        color: '#f87171',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 40,
        paddingHorizontal: 24,
    },
});
