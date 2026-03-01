import React, { useState } from 'react';
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
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createCollection } from '@/api/databaseClient';

interface CreateCollectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateCollectionModal({ visible, onClose, onSuccess }: CreateCollectionModalProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Please enter a collection name');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await createCollection({ name: name.trim() });
            setName('');
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create collection');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
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
                        <Text style={styles.title}>New Collection</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.label}>Collection Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., My Favorite Movies"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                setError('');
                            }}
                            maxLength={100}
                            autoFocus
                        />

                        {error ? (
                            <Text style={styles.error}>{error}</Text>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleCreate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Create Collection</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#0f1724',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        marginBottom: 16,
    },
    error: {
        color: '#ef4444',
        fontSize: 14,
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
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
