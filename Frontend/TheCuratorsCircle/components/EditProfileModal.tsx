import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { updateUserProfile, createUserProfile, UpdateUserProfilePayload } from '@/api/databaseClient';
import { UserProfileDto } from '@/DTOs/UserProfileDto';

interface EditProfileModalProps {
    visible: boolean;
    profile?: UserProfileDto;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function EditProfileModal({ visible, profile, onClose, onSuccess }: EditProfileModalProps) {
    const isCreateMode = !profile;
    
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible) {
            if (profile) {
                const existingUsername = profile.usernamesHistory?.[0] || '';
                setUsername(existingUsername.startsWith('@') ? existingUsername.substring(1) : existingUsername);
                setDisplayName(profile.displayName || '');
                setBio(profile.bio || '');
            } else {
                setUsername('');
                setDisplayName('');
                setBio('');
            }
            setError('');
        }
    }, [visible, profile]);

    const handleSave = async () => {
        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        const finalUsername = '@' + username.trim();

        setLoading(true);
        setError('');
        try {
            if (isCreateMode) {
                await createUserProfile({
                    username: finalUsername,
                    displayName: displayName.trim(),
                    bio: bio.trim(),
                });
            } else {
                const payload: UpdateUserProfilePayload = {
                    username: finalUsername,
                    displayName: displayName.trim(),
                    bio: bio.trim(),
                };
                await updateUserProfile(profile.persistentId, payload);
            }
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || `Failed to ${isCreateMode ? 'create' : 'update'} profile`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {isCreateMode ? 'Create Profile' : 'Edit Profile'}
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Username</Text>
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

                        <Text style={styles.label}>Display Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your display name"
                            placeholderTextColor="#666"
                            value={displayName}
                            onChangeText={(text) => {
                                setDisplayName(text);
                                setError('');
                            }}
                            maxLength={50}
                        />

                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            placeholder="Tell us about yourself"
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
                            <Text style={styles.error}>{error}</Text>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isCreateMode ? 'Create Profile' : 'Save Changes'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 16,
    },
    label: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#2a2a2a',
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
        backgroundColor: '#2a2a2a',
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
    error: {
        color: '#ff6b6b',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#7C6DFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
