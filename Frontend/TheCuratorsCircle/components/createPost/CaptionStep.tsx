import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { MediaSearchResult } from '@/api/databaseClient';

interface Props {
    selectedMedia: MediaSearchResult | null;
    title: string;
    caption: string;
    loading: boolean;
    onChangeTitle: (text: string) => void;
    onChangeCaption: (text: string) => void;
    onSubmit: () => void;
}

export function CaptionStep({ selectedMedia, title, caption, loading, onChangeTitle, onChangeCaption, onSubmit }: Props) {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
        >
            <ScrollView>
                <Text style={styles.title}>Create your post</Text>
                {selectedMedia && (
                    <View style={styles.previewContainer}>
                        {selectedMedia.posterUrl && selectedMedia.posterUrl !== '' && (
                            <Image source={{ uri: selectedMedia.posterUrl }} style={styles.previewPoster} />
                        )}
                        <Text style={styles.previewTitle}>{selectedMedia.title}</Text>
                    </View>
                )}
                <Text style={styles.fieldLabel}>Title (required)</Text>
                <TextInput
                    style={styles.titleInput}
                    placeholder="A short catchphrase..."
                    placeholderTextColor="#888"
                    value={title}
                    onChangeText={onChangeTitle}
                    maxLength={100}
                />
                <Text style={styles.fieldLabel}>Caption (optional)</Text>
                <TextInput
                    style={styles.captionInput}
                    placeholder="Expand on your title..."
                    placeholderTextColor="#888"
                    value={caption}
                    onChangeText={onChangeCaption}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={onSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Share</Text>
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
    previewContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    previewPoster: {
        width: 100,
        height: 150,
        borderRadius: 8,
    },
    previewTitle: {
        color: '#fff',
        fontSize: 16,
        marginTop: 8,
    },
    fieldLabel: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 8,
        marginTop: 16,
    },
    titleInput: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 16,
        color: '#fff',
        fontSize: 16,
    },
    captionInput: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        minHeight: 120,
        marginBottom: 24,
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
