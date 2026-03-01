import React, { useState, useEffect, useRef } from 'react';
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
import { searchMedia, createPost, createCollection, getCollections, MediaCategory, MediaSearchResult, CreatePostPayload } from '@/api/databaseClient';

type Step = 'choose' | 'createCollection' | 'category' | 'search' | 'select' | 'pickCollection' | 'caption';

const CATEGORIES: { id: MediaCategory; label: string; icon: string }[] = [
    { id: 'movie', label: 'Movie', icon: 'film' },
    { id: 'series', label: 'TV Show', icon: 'tv' },
    { id: 'game', label: 'Game', icon: 'game-controller' },
    { id: 'book', label: 'Book', icon: 'book' },
    { id: 'music', label: 'Music', icon: 'musical-notes' },
];

export default function CreatePost() {
    const navigation = useNavigation();
    const [step, setStep] = useState<Step>('choose');
    const stepRef = useRef(step);
    
    useEffect(() => {
        stepRef.current = step;
    }, [step]);

    useEffect(() => {
        if (step === 'pickCollection') {
            loadCollections();
        }
    }, [step]);

    const loadCollections = async () => {
        setLoadingCollections(true);
        try {
            const cols = await getCollections();
            setCollections(cols.map((c: any) => ({ id: c.id, name: c.name })));
        } catch (error) {
            console.error('Failed to load collections:', error);
            Alert.alert('Error', 'Failed to load collections');
        } finally {
            setLoadingCollections(false);
        }
    };

    const [category, setCategory] = useState<MediaCategory | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MediaSearchResult[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<MediaSearchResult | null>(null);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const [collections, setCollections] = useState<{id: string; name: string}[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<{id: string; name: string} | null>(null);
    const [loadingCollections, setLoadingCollections] = useState(false);

    const handleBack = () => {
        console.log('handleBack called, step:', stepRef.current);
        if (stepRef.current === 'choose') {
            router.back();
        } else if (stepRef.current === 'createCollection') {
            setStep('choose');
            setCollectionName('');
        } else if (stepRef.current === 'category') {
            setStep('choose');
            setCategory(null);
        } else if (stepRef.current === 'search') {
            setStep('category');
            setCategory(null);
        } else if (stepRef.current === 'select') {
            setStep('search');
            setSearchResults([]);
        } else if (stepRef.current === 'pickCollection') {
            setStep('select');
            setSelectedCollection(null);
        } else if (stepRef.current === 'caption') {
            setStep('pickCollection');
            setTitle('');
            setCaption('');
        }
    };

    useEffect(() => {
        const handleBackPress = (e: any) => {
            if (stepRef.current !== 'choose') {
                e.preventDefault();
                handleBack();
            }
        };
        
        navigation.addListener('beforeRemove', handleBackPress);
        return () => {
            navigation.removeListener('beforeRemove', handleBackPress);
        };
    }, [navigation, step]);

    const handleChooseCollection = () => {
        setStep('createCollection');
    };

    const handleChoosePost = () => {
        setStep('category');
    };

    const handleCreateCollection = async () => {
        if (!collectionName.trim()) {
            Alert.alert('Error', 'Please enter a collection name');
            return;
        }

        setLoading(true);
        try {
            await createCollection({ name: collectionName.trim() });
            Alert.alert('Success', 'Collection created!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Create collection error:', error);
            Alert.alert('Error', error.message || 'Failed to create collection');
        } finally {
            setLoading(false);
        }
    };

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
        setStep('pickCollection');
    };

    const handleSelectCollection = (collection: {id: string; name: string}) => {
        setSelectedCollection(collection);
        setStep('caption');
    };

    const handleContinueToCaption = () => {
        if (!selectedCollection) {
            Alert.alert('Error', 'Please select a collection');
            return;
        }
        setStep('caption');
    };

    const handleSubmit = async () => {
        if (!selectedMedia || !title.trim()) {
            Alert.alert('Error', 'Please add a title');
            return;
        }

        if (!selectedCollection) {
            Alert.alert('Error', 'Please select a collection');
            return;
        }

        setLoading(true);
        try {
            const payload: CreatePostPayload = {
                title: title.trim(),
                caption: caption.trim(),
                mediaType: selectedMedia.type || category || 'movie',
                mediaId: selectedMedia.id,
                collectionId: selectedCollection.id,
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

    const renderChoose = () => (
        <View style={styles.content}>
            <Text style={styles.title}>What would you like to create?</Text>
            
            <TouchableOpacity
                style={styles.optionCard}
                onPress={handleChooseCollection}
            >
                <View style={styles.optionIconContainer}>
                    <Ionicons name="folder-open" size={32} color="#fff" />
                </View>
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Create Collection</Text>
                    <Text style={styles.optionDescription}>Save media to a board</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.optionCard}
                onPress={handleChoosePost}
            >
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

    const renderCreateCollection = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
        >
            <ScrollView>
                <Text style={styles.title}>New Collection</Text>
                <Text style={styles.fieldLabel}>Collection Name</Text>
                <TextInput
                    style={styles.titleInput}
                    placeholder="e.g., My Favorite Movies"
                    placeholderTextColor="#888"
                    value={collectionName}
                    onChangeText={setCollectionName}
                    maxLength={100}
                    autoFocus
                />
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleCreateCollection}
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

    const renderCategory = () => (
        <View style={styles.content}>
            <Text style={styles.title}>What are you sharing?</Text>
            <View style={styles.categoryList}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={styles.categoryRow}
                        onPress={() => handleCategorySelect(cat.id)}
                    >
                        <Ionicons name={cat.icon as any} size={28} color="#fff" />
                        <Text style={styles.categoryLabel}>{cat.label}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
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
            <TouchableOpacity style={styles.continueButton} onPress={() => setStep('pickCollection')}>
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPickCollection = () => (
        <View style={styles.content}>
            <Text style={styles.title}>Add to Collection</Text>
            <Text style={styles.subtitle}>Select a collection for this post (required)</Text>
            
            {loadingCollections ? (
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
                            onPress={() => handleSelectCollection(collection)}
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
                <TouchableOpacity 
                    style={[styles.continueButton, styles.marginTop]} 
                    onPress={handleContinueToCaption}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderCaption = () => (
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
                    onChangeText={setTitle}
                    maxLength={100}
                />
                <Text style={styles.fieldLabel}>Caption (optional)</Text>
                <TextInput
                    style={styles.captionInput}
                    placeholder="Expand on your title..."
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

    const getHeaderTitle = () => {
        switch (step) {
            case 'choose':
                return 'Create New';
            case 'createCollection':
                return 'New Collection';
            case 'category':
                return 'Create Post';
            case 'search':
                return 'Search';
            case 'select':
                return 'Confirm';
            case 'pickCollection':
                return 'Add to Collection';
            case 'caption':
                return 'Caption';
            default:
                return 'Create';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
                <View style={styles.placeholder} />
            </View>

            {step === 'choose' && renderChoose()}
            {step === 'createCollection' && renderCreateCollection()}
            {step === 'category' && renderCategory()}
            {step === 'search' && renderSearch()}
            {step === 'select' && renderSelect()}
            {step === 'pickCollection' && renderPickCollection()}
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
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
        marginTop: -16,
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
    emptySubtext: {
        color: '#666',
        fontSize: 14,
        marginTop: 8,
    },
    marginTop: {
        marginTop: 16,
    },
});
