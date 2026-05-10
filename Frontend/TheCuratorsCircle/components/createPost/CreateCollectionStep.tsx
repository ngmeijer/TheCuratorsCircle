import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
} from 'react-native';

interface Props {
    collectionName: string;
    onChangeName: (name: string) => void;
    loading: boolean;
    onSubmit: () => void;
}

export function CreateCollectionStep({ collectionName, onChangeName, loading, onSubmit }: Props) {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
        >
            <ScrollView>
                <Text style={styles.title}>New Collection</Text>
                <Text style={styles.fieldLabel}>Collection Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., My Favorite Movies"
                    placeholderTextColor="#888"
                    value={collectionName}
                    onChangeText={onChangeName}
                    maxLength={100}
                    autoFocus
                />
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={onSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Create Collection</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 24,
    },
    fieldLabel: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 16,
        color: '#fff',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
