import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Collection {
    id: string;
    name: string;
}

interface Props {
    collections: Collection[];
    selectedCollection: Collection | null;
    loading: boolean;
    onSelectCollection: (collection: Collection) => void;
    onContinue: () => void;
}

export function CollectionStep({ collections, selectedCollection, loading, onSelectCollection, onContinue }: Props) {
    return (
        <View style={styles.content}>
            <Text style={styles.title}>Add to Collection</Text>
            <Text style={styles.subtitle}>Select a collection for this post (required)</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#fff" style={styles.loader} />
            ) : collections.length === 0 ? (
                <View style={styles.emptyCollections}>
                    <Text style={styles.emptyText}>No collections yet</Text>
                    <Text style={styles.emptySubtext}>Create a collection first from your profile</Text>
                </View>
            ) : (
                <ScrollView style={styles.collectionList}>
                    {collections.map((collection) => (
                        <TouchableOpacity
                            key={collection.id}
                            style={[
                                styles.collectionItem,
                                selectedCollection?.id === collection.id && styles.collectionItemSelected
                            ]}
                            onPress={() => onSelectCollection(collection)}
                        >
                            <Ionicons
                                name="folder"
                                size={24}
                                color={selectedCollection?.id === collection.id ? '#3b82f6' : '#fff'}
                            />
                            <Text style={[
                                styles.collectionName,
                                selectedCollection?.id === collection.id && styles.collectionNameSelected
                            ]}>
                                {collection.name}
                            </Text>
                            {selectedCollection?.id === collection.id && (
                                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {selectedCollection && (
                <TouchableOpacity style={[styles.continueButton, styles.marginTop]} onPress={onContinue}>
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
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
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
        marginTop: -16,
    },
    loader: {
        marginTop: 40,
    },
    collectionList: {
        flex: 1,
        marginTop: 16,
    },
    collectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    collectionItemSelected: {
        backgroundColor: '#1e3a5f',
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    collectionName: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        marginLeft: 12,
    },
    collectionNameSelected: {
        color: '#3b82f6',
        fontWeight: '600',
    },
    emptyCollections: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 40,
    },
    emptySubtext: {
        color: '#666',
        fontSize: 14,
        marginTop: 8,
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
    marginTop: {
        marginTop: 16,
    },
});
