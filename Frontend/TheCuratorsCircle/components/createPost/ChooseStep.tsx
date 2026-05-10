import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
    onChooseCollection: () => void;
    onChoosePost: () => void;
}

export function ChooseStep({ onChooseCollection, onChoosePost }: Props) {
    return (
        <View style={styles.content}>
            <Text style={styles.title}>What would you like to create?</Text>

            <TouchableOpacity style={styles.optionCard} onPress={onChooseCollection}>
                <View style={styles.optionIconContainer}>
                    <Ionicons name="folder-open" size={32} color="#fff" />
                </View>
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Create Collection</Text>
                    <Text style={styles.optionDescription}>Save media to a board</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={onChoosePost}>
                <View style={styles.optionIconContainer}>
                    <Ionicons name="create" size={32} color="#fff" />
                </View>
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Create Post</Text>
                    <Text style={styles.optionDescription}>Share media with others</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
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
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    optionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    optionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    optionDescription: {
        color: '#888',
        fontSize: 14,
        marginTop: 4,
    },
});
