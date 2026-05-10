import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MediaSearchResult } from '@/api/databaseClient';

interface Props {
    selectedMedia: MediaSearchResult;
    onContinue: () => void;
}

export function SelectStep({ selectedMedia, onContinue }: Props) {
    return (
        <View style={styles.content}>
            <Text style={styles.title}>Selected</Text>
            <View style={styles.selectedContainer}>
                {selectedMedia.posterUrl && selectedMedia.posterUrl !== '' && (
                    <Image source={{ uri: selectedMedia.posterUrl }} style={styles.selectedPoster} />
                )}
                <Text style={styles.selectedTitle}>{selectedMedia.title}</Text>
                <Text style={styles.selectedYear}>{selectedMedia.year}</Text>
            </View>
            <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
        </View>
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
    selectedContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    selectedPoster: {
        width: 150,
        height: 225,
        borderRadius: 8,
    },
    selectedTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 12,
    },
    selectedYear: {
        color: '#888',
        fontSize: 14,
    },
    continueButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
