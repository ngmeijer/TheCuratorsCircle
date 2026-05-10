import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MediaCategory } from '@/api/databaseClient';

const CATEGORIES: { id: MediaCategory; label: string; icon: string }[] = [
    { id: 'movie', label: 'Movie', icon: 'film' },
    { id: 'series', label: 'TV Show', icon: 'tv' },
    { id: 'game', label: 'Game', icon: 'game-controller' },
    { id: 'book', label: 'Book', icon: 'book' },
    { id: 'music', label: 'Music', icon: 'musical-notes' },
];

interface Props {
    onSelect: (category: MediaCategory) => void;
}

export function CategoryStep({ onSelect }: Props) {
    return (
        <View style={styles.content}>
            <Text style={styles.title}>What are you sharing?</Text>
            <View style={styles.categoryList}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={styles.categoryRow}
                        onPress={() => onSelect(cat.id)}
                    >
                        <Ionicons name={cat.icon as any} size={28} color="#fff" />
                        <Text style={styles.categoryLabel}>{cat.label}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>
                ))}
            </View>
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
    categoryList: {
        gap: 12,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
    },
    categoryLabel: {
        color: '#fff',
        fontSize: 18,
        flex: 1,
        marginLeft: 16,
    },
});
