import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router, useNavigation } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { searchMedia, createPost, createCollection, getCollections, MediaCategory, MediaSearchResult, CreatePostPayload } from '@/api/databaseClient';
import { ChooseStep } from '@/components/createPost/ChooseStep';
import { CreateCollectionStep } from '@/components/createPost/CreateCollectionStep';
import { CategoryStep } from '@/components/createPost/CategoryStep';
import { SearchStep } from '@/components/createPost/SearchStep';
import { SelectStep } from '@/components/createPost/SelectStep';
import { CollectionStep } from '@/components/createPost/CollectionStep';
import { CaptionStep } from '@/components/createPost/CaptionStep';

type Step = 'choose' | 'createCollection' | 'category' | 'search' | 'select' | 'pickCollection' | 'caption';

export default function CreatePost() {
    const navigation = useNavigation();
    const [step, setStep] = useState<Step>('choose');
    const stepRef = useRef(step);

    const [category, setCategory] = useState<MediaCategory | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MediaSearchResult[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<MediaSearchResult | null>(null);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<{ id: string; name: string } | null>(null);
    const [loadingCollections, setLoadingCollections] = useState(false);

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

    const handleBack = () => {
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

    const handleSelectCollection = (collection: { id: string; name: string }) => {
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

    const getHeaderTitle = () => {
        switch (step) {
            case 'choose': return 'Create New';
            case 'createCollection': return 'New Collection';
            case 'category': return 'Create Post';
            case 'search': return 'Search';
            case 'select': return 'Confirm';
            case 'pickCollection': return 'Add to Collection';
            case 'caption': return 'Caption';
            default: return 'Create';
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

            {step === 'choose' && (
                <ChooseStep
                    onChooseCollection={() => setStep('createCollection')}
                    onChoosePost={() => setStep('category')}
                />
            )}
            {step === 'createCollection' && (
                <CreateCollectionStep
                    collectionName={collectionName}
                    onChangeName={setCollectionName}
                    loading={loading}
                    onSubmit={handleCreateCollection}
                />
            )}
            {step === 'category' && (
                <CategoryStep
                    onSelect={(cat) => { setCategory(cat); setStep('search'); }}
                />
            )}
            {step === 'search' && category && (
                <SearchStep
                    category={category}
                    searchQuery={searchQuery}
                    onChangeQuery={setSearchQuery}
                    onSearch={handleSearch}
                    searching={searching}
                    results={searchResults}
                    onSelectMedia={handleSelectMedia}
                />
            )}
            {step === 'select' && selectedMedia && (
                <SelectStep
                    selectedMedia={selectedMedia}
                    onContinue={() => setStep('pickCollection')}
                />
            )}
            {step === 'pickCollection' && (
                <CollectionStep
                    collections={collections}
                    selectedCollection={selectedCollection}
                    loading={loadingCollections}
                    onSelectCollection={handleSelectCollection}
                    onContinue={handleContinueToCaption}
                />
            )}
            {step === 'caption' && (
                <CaptionStep
                    selectedMedia={selectedMedia}
                    title={title}
                    caption={caption}
                    loading={loading}
                    onChangeTitle={setTitle}
                    onChangeCaption={setCaption}
                    onSubmit={handleSubmit}
                />
            )}
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
});
