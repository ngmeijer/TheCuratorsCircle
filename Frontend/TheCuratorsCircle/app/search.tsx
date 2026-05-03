import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { searchUsers, followUser, unfollowUser, getIsFollowing, getCurrentUserProfile } from '@/api/databaseClient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledButton } from '@/components/StyledButton';

interface SearchResult {
    persistentId: string;
    ownerUid: string;
    usernamesHistory: string[];
    displayName: string;
    bio: string;
}

export default function SearchPage() {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const profile = await getCurrentUserProfile();
                if (profile) {
                    setCurrentUserId(profile.persistentId);
                }
            } catch (err) {
                console.error('Error loading current user:', err);
            }
        }
        loadCurrentUser();
    }, []);

    const handleSearch = useCallback(async () => {
        if (!query || query.length < 2) return;

        setLoading(true);
        setError(null);
        console.log('[Search] Searching for:', query);
        try {
            const users = await searchUsers(query);
            console.log('[Search] Got', users.length, 'results:', users);
            setResults(users);

            // Check follow status for each user
            const status: Record<string, boolean> = {};
            for (const user of users) {
                try {
                    status[user.persistentId] = await getIsFollowing(user.persistentId);
                } catch {
                    status[user.persistentId] = false;
                }
            }
            setFollowingStatus(status);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error('[Search] Error:', message);
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [query]);

    const handleFollowToggle = async (userId: string) => {
        try {
            const isFollowing = followingStatus[userId];
            if (isFollowing) {
                await unfollowUser(userId);
                setFollowingStatus(prev => ({ ...prev, [userId]: false }));
            } else {
                await followUser(userId);
                setFollowingStatus(prev => ({ ...prev, [userId]: true }));
            }
        } catch (err) {
            console.error('Follow error:', err);
        }
    };

    const renderItem = ({ item }: { item: SearchResult }) => {
        const username = item.usernamesHistory?.[0] || '@unknown';
        const isFollowing = followingStatus[item.persistentId] || false;
        const isCurrentUser = currentUserId === item.persistentId;

        return (
            <Pressable 
                style={styles.resultCard}
                onPress={() => router.push({ pathname: '/profile', params: { userId: item.persistentId } })}
            >
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={24} color="#666" />
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.displayName}>{item.displayName || 'No name'}</Text>
                    <Text style={styles.username}>{username}</Text>
                </View>
                {isCurrentUser ? (
                    <View style={styles.youTag}>
                        <Text style={styles.youText}>You</Text>
                    </View>
                ) : (
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
                <Text style={styles.title}>Search Users</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by username..."
                    placeholderTextColor="#666"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <Pressable style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="search" size={20} color="#fff" />
                </Pressable>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#fff" style={styles.loader} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.persistentId}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        query.length >= 2 ? (
                            <Text style={styles.noResults}>No users found</Text>
                        ) : (
                            <Text style={styles.hint}>Enter at least 2 characters to search</Text>
                        )
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
        paddingTop: 8,
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
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#2A2E35',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: '#7C6DFF',
        borderRadius: 8,
        padding: 12,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        marginTop: 40,
    },
    listContent: {
        padding: 16,
    },
    resultCard: {
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
    youTag: {
        backgroundColor: '#2A2E35',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#444',
    },
    youText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
    },
    noResults: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
    },
    hint: {
        color: '#666',
        fontSize: 14,
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
