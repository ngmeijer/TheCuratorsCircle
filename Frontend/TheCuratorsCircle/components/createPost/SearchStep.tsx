import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MediaCategory, MediaSearchResult } from '@/api/databaseClient';

interface Props {
    category: MediaCategory;
    searchQuery: string;
    onChangeQuery: (query: string) => void;
    onSearch: () => void;
    searching: boolean;
    results: MediaSearchResult[];
    onSelectMedia: (media: MediaSearchResult) => void;
}

export function SearchStep({ category, searchQuery, onChangeQuery, onSearch, searching, results, onSelectMedia }: Props) {
    return (
        <View style={styles.content}>
            <Text style={styles.title}>Search {category}</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Search for a ${category}...`}
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={onChangeQuery}
                    onSubmitEditing={onSearch}
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
                    <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {searching ? (
                <ActivityIndicator size="large" color="#fff" style={styles.loader} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.resultItem} onPress={() => onSelectMedia(item)}>
                            {item.posterUrl && item.posterUrl !== '' && (
                                <Image source={{ uri: item.posterUrl }} style={styles.resultPoster} />
                            )}
                            <View style={styles.resultInfo}>
                                <Text style={styles.resultTitle}>{item.title}</Text>
                                <Text style={styles.resultYear}>{item.year}</Text>
                                <Text style={styles.resultType}>{item.type}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        searchQuery.length > 0 ? (
                            <Text style={styles.emptyText}>No results found</Text>
                        ) : null
                    }
                />
            )}
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
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        padding: 12,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        marginTop: 40,
    },
    resultItem: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    resultPoster: {
        width: 60,
        height: 90,
        borderRadius: 4,
    },
    resultInfo: {
        marginLeft: 12,
        flex: 1,
        justifyContent: 'center',
    },
    resultTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultYear: {
        color: '#888',
        fontSize: 14,
    },
    resultType: {
        color: '#3b82f6',
        fontSize: 12,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 40,
    },
});
