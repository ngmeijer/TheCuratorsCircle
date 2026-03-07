import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { createUserProfile, getCurrentUserProfile } from '@/api/databaseClient';
import { UserProfileDto } from '@/DTOs/UserProfileDto';
import { StyledButton } from '@/components/StyledButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

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

export default function CreateProfilePage() {
    const insets = useSafeAreaInsets();
    const { profile, loading: loadingProfile, refresh: refreshProfile } = useCurrentUserProfile();
    
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loadingProfile && profile) {
            router.replace('/forYouPage');
        }
    }, [loadingProfile, profile]);

    const handleCreate = async () => {
        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        setCreating(true);
        setError('');
        try {
            await createUserProfile({
                username: '@' + username.trim(),
                displayName: displayName.trim(),
                bio: bio.trim(),
            });
            router.replace('/forYouPage');
        } catch (err: any) {
            setError(err.message || 'Failed to create profile');
            setCreating(false);
        }
    };

    if (loadingProfile) {
        return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.header}>
                    <View style={styles.placeholderProfilePicture}>
                        <Ionicons name="person" size={40} color="#666" />
                    </View>
                </View>

                <Text style={styles.title}>Welcome to The Curators Circle</Text>
                <Text style={styles.subtitle}>Create your profile to get started</Text>

                <View style={styles.form}>
                    <Text style={styles.inputLabel}>Username</Text>
                    <View style={styles.usernameInputContainer}>
                        <Text style={styles.usernamePrefix}>@</Text>
                        <TextInput
                            style={styles.usernameInput}
                            placeholder="username"
                            placeholderTextColor="#666"
                            value={username}
                            onChangeText={(text) => {
                                const cleaned = text.replace('@', '');
                                setUsername(cleaned);
                                setError('');
                            }}
                            maxLength={29}
                            autoCapitalize="none"
                        />
                    </View>

                    <Text style={styles.inputLabel}>Display Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your name"
                        placeholderTextColor="#666"
                        value={displayName}
                        onChangeText={(text) => {
                            setDisplayName(text);
                            setError('');
                        }}
                        maxLength={50}
                    />

                    <Text style={styles.inputLabel}>Bio</Text>
                    <TextInput
                        style={[styles.input, styles.bioInput]}
                        placeholder="Write something about yourself here!"
                        placeholderTextColor="#666"
                        value={bio}
                        onChangeText={(text) => {
                            setBio(text);
                            setError('');
                        }}
                        maxLength={500}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    <StyledButton
                        style={styles.createButton}
                        title={creating ? "Creating..." : "Create Profile"}
                        onPress={handleCreate}
                        disabled={creating}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0f12',
    },
    contentContainer: {
        padding: 16,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 40,
    },
    placeholderProfilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2A2E35',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 32,
        textAlign: 'center',
    },
    form: {
        width: '100%',
        paddingHorizontal: 8,
    },
    inputLabel: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#2A2E35',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    usernameInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2E35',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    usernamePrefix: {
        color: '#666',
        fontSize: 16,
        paddingLeft: 12,
    },
    usernameInput: {
        flex: 1,
        padding: 12,
        color: '#fff',
        fontSize: 16,
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
    createButton: {
        width: '100%',
        backgroundColor: '#7C6DFF',
        marginTop: 24,
    },
});
