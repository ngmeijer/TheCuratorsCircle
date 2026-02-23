import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { searchMedia, createPost, MediaCategory, MediaSearchResult, CreatePostPayload } from '@/api/databaseClient';

type Step = 'category' | 'search' | 'select' | 'caption';

const CATEGORIES: { id: MediaCategory; label: string; icon: string }[] = [
    { id: 'movie', label: 'Movie', icon: 'film' },
    { id: 'series', label: 'TV Show', icon: 'tv' },
    { id: 'game', label: 'Game', icon: 'game-controller' },
    { id: 'book', label: 'Book', icon: 'book' },
    { id: 'music', label: 'Music', icon: 'musical-notes' },
];

export default function CreatePost() {
    const navigation = useNavigation();
    const [step, setStep] = useState<Step>('category');
    const [category, setCategory] = useState<MediaCategory | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MediaSearchResult[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<MediaSearchResult | null>(null);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const handleBackPress = (e: any) => {
            e.preventDefault();
            handleBack();
        };
        
        const subscription = navigation.addListener('beforeRemove', handleBackPress);
        return () => subscription.remove();
    }, [navigation, step]);

    const handleCategorySelect = (cat: MediaCategory) => {
        setCategory(cat);
        setStep('search');
    };

    const handleSearch = async () => {
        if (!searchQuery.trim() || !category) return;
        
        setSearching(true);
        try {
            const results = await searchMedia(searchQuery, category);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Failed to search media');
        } finally {
            setSearching(false);
        }
    };

    const handleSelectMedia = (media: MediaSearchResult) => {
        setSelectedMedia(media);
        setStep('caption');
    };

    const handleSubmit = async () => {
        if (!selectedMedia || !caption.trim()) {
            Alert.alert('Error', 'Please add a caption');
            return;
        }

        setLoading(true);
        try {
            const payload: CreatePostPayload = {
                imageUrl: selectedMedia.posterUrl || '',
                caption: caption.trim(),
                mediaType: selectedMedia.type || category || 'movie',
                mediaId: selectedMedia.id,
                mediaMetadata: {
                    title: selectedMedia.title,
                    posterUrl: selectedMedia.posterUrl || '',
                    releaseYear: selectedMedia.year,
                },
            };

            await createPost(payload);
            Alert.alert('Success', 'Post created!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Create post error:', error);
            Alert.alert('Error', 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 'search') {
            setStep('category');
            setCategory(null);
        } else if (step === 'select') {
            setStep('search');
            setSearchResults([]);
        } else if (step === 'caption') {
            setStep('select');
            setCaption('');
        } else {
            router.back();
        }
    };

    const renderCategory = () => (
        <View style={styles.content}>
            <Text style={styles.title}>What are you sharing?</Text>
            <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={styles.categoryCard}
                        onPress={() => handleCategorySelect(cat.id)}
                    >
                        <Ionicons name={cat.icon as any} size={40} color="#fff" />
                        <Text style={styles.categoryLabel}>{cat.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderSearch = () => (
        <View style={styles.content}>
            <Text style={styles.title}>Search {category}</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={`Search for a ${category}...`}
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {searching ? (
                <ActivityIndicator size="large" color="#fff" style={styles.loader} />
            ) : (
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.resultItem}
                            onPress={() => handleSelectMedia(item)}
                        >
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

    const renderSelect = () => (
        <View style={styles.content}>
            <Text style={styles.title}>Selected</Text>
            {selectedMedia && (
                <View style={styles.selectedContainer}>
                    {selectedMedia.posterUrl && selectedMedia.posterUrl !== '' && (
                        <Image source={{ uri: selectedMedia.posterUrl }} style={styles.selectedPoster} />
                    )}
                    <Text style={styles.selectedTitle}>{selectedMedia.title}</Text>
                    <Text style={styles.selectedYear}>{selectedMedia.year}</Text>
                </View>
            )}
            <TouchableOpacity style={styles.continueButton} onPress={() => setStep('caption')}>
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );

    const renderCaption = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
        >
            <ScrollView>
                <Text style={styles.title}>Add a caption</Text>
                {selectedMedia && (
                    <View style={styles.previewContainer}>
                        {selectedMedia.posterUrl && selectedMedia.posterUrl !== '' && (
                            <Image source={{ uri: selectedMedia.posterUrl }} style={styles.previewPoster} />
                        )}
                        <Text style={styles.previewTitle}>{selectedMedia.title}</Text>
                    </View>
                )}
                <TextInput
                    style={styles.captionInput}
                    placeholder="Write a caption..."
                    placeholderTextColor="#888"
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {step === 'category' && 'Create Post'}
                    {step === 'search' && 'Search'}
                    {step === 'select' && 'Confirm'}
                    {step === 'caption' && 'Caption'}
                </Text>
                <View style={styles.placeholder} />
            </View>

            {step === 'category' && renderCategory()}
            {step === 'search' && renderSearch()}
            {step === 'select' && renderSelect()}
            {step === 'caption' && renderCaption()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1724',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    placeholder: {
        width: 40,
    },
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
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryLabel: {
        color: '#fff',
        fontSize: 16,
        marginTop: 8,
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
