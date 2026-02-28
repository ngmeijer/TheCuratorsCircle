import {ActivityIndicator, Image, ScrollView, StyleSheet, Text, View, Pressable} from "react-native";
import React, {useEffect, useState} from "react";
import {getPost, getMediaById, MediaSearchResult} from "../api/databaseClient"
import { useLocalSearchParams } from 'expo-router';
import { PostDto } from "@/DTOs/PostDto";
import { IconTextButton } from "@/components/IconTextButton";
import { useRouter } from "expo-router";

type TabType = 'details' | 'discussion' | 'collections' | 'rating';

export default function PostDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [postData, setPostData] = useState<PostDto | null>(null);
    const [media, setMedia] = useState<MediaSearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('details');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log("Fetching post data for id:", id);
                const data = await getPost(id);
                setPostData(data);

                if (data?.mediaId && data?.mediaType) {
                    const mediaResult = await getMediaById(data.mediaId, data.mediaType);
                    setMedia(mediaResult);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) fetchData();
    }, [id]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return <DetailsTab media={media} />;
            case 'discussion':
                return <DiscussionTab postData={postData} />;
            case 'collections':
                return <CollectionsTab />;
            case 'rating':
                return <RatingTab />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#FFB454" />
            </View>
        );
    }

    if (!postData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Post not found (ID: {id})</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}>
                <View style={styles.mediaStatsContainer}>
                    {media?.posterUrl && (
                        <Image
                            source={{ uri: media.posterUrl }}
                            style={styles.mediaBanner}
                        />
                    )}
                    <View style={styles.gradientOverlay} />
                    <Text style={styles.mediaTitle}>{media?.title || 'Unknown'}</Text>
                    <View style={styles.heroSection}>
                        <Text style={styles.heroText}>{media?.year || 'N/A'}</Text>
                        <View style={styles.dot} />
                        <Text style={styles.heroText}>{media?.type || postData.mediaType}</Text>
                    </View>
                    {media?.rating && (
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>{media.rating}</Text>
                            <Text style={styles.ratingMax}>/10</Text>
                        </View>
                    )}
                </View>

                <View style={styles.postHeader}>
                    <Text style={styles.postTitle}>{postData.title}</Text>
                    {postData.caption && (
                        <Text style={styles.postCaption}>{postData.caption}</Text>
                    )}
                    <Text style={styles.createdAt}>{new Date(postData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</Text>
                </View>

                <View style={styles.engagementBar}>
                    <IconTextButton
                        iconSource="heart-outline"
                        text={String(postData.likeCount)}
                        iconSize={22}
                        containerStyle={styles.engagementButton}
                        iconStyle={styles.engagementButtonIcon}
                        textStyle={styles.engagementButtonText}
                    />
                    <IconTextButton
                        iconSource="chatbubble-outline"
                        text={String(postData.commentCount)}
                        iconSize={22}
                        containerStyle={styles.engagementButton}
                        iconStyle={styles.engagementButtonIcon}
                        textStyle={styles.engagementButtonText}
                    />
                    <IconTextButton
                        iconSource="bookmark-outline"
                        text={String(postData.shareCount)}
                        iconSize={22}
                        containerStyle={styles.engagementButton}
                        iconStyle={styles.engagementButtonIcon}
                        textStyle={styles.engagementButtonText}
                    />
                </View>

                <View style={styles.tabBar}>
                    <TabButton 
                        title="Details" 
                        active={activeTab === 'details'} 
                        onPress={() => setActiveTab('details')} 
                    />
                    <TabButton 
                        title="Discussion" 
                        active={activeTab === 'discussion'} 
                        onPress={() => setActiveTab('discussion')} 
                    />
                    <TabButton 
                        title="Collections" 
                        active={activeTab === 'collections'} 
                        onPress={() => setActiveTab('collections')} 
                    />
                    <TabButton 
                        title="Rating" 
                        active={activeTab === 'rating'} 
                        onPress={() => setActiveTab('rating')} 
                    />
                </View>

                <View style={styles.tabContent}>
                    {renderTabContent()}
                </View>
            </ScrollView>
        </View>
    );
}

function TabButton({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
    return (
        <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
            <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{title}</Text>
        </Pressable>
    );
}

function DetailsTab({ media }: { media: MediaSearchResult | null }) {
    if (!media) return null;

    return (
        <View style={styles.detailsContainer}>
            {media.plot && (
                <>
                    <Text style={styles.sectionTitle}>Plot</Text>
                    <Text style={styles.plotText}>{media.plot}</Text>
                </>
            )}
            
            {media.genre && (
                <>
                    <Text style={styles.sectionTitle}>Genre</Text>
                    <Text style={styles.infoText}>{media.genre}</Text>
                </>
            )}
        </View>
    );
}

function DiscussionTab({ postData }: { postData: PostDto | null }) {
    if (!postData) return null;

    return (
        <View style={styles.emptyTabContainer}>
            <Text style={styles.emptyTabTitle}>No discussions yet</Text>
            <Text style={styles.emptyTabText}>Be the first to start a discussion!</Text>
        </View>
    );
}

function CollectionsTab() {
    return (
        <View style={styles.emptyTabContainer}>
            <Text style={styles.emptyTabTitle}>Not in any collections</Text>
            <Text style={styles.emptyTabText}>Save this post to a collection to see it here.</Text>
        </View>
    );
}

function RatingTab() {
    return (
        <View style={styles.emptyTabContainer}>
            <Text style={styles.emptyTabTitle}>Rate this</Text>
            <Text style={styles.emptyTabText}>Your rating will appear here after you rate.</Text>
            <View style={styles.ratingStarsContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <Pressable key={star} style={styles.largeStarButton}>
                        <Text style={styles.largeStarText}>{star}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0f1724',
    },
    scrollView: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#0f1724",
    },
    errorText: {
        color: "#D6F1FF",
        textAlign: 'center',
        marginTop: 40,
    },
    contentContainer: {
        paddingBottom: 40,
    },
    mediaStatsContainer: {
        position: "relative",
    },
    gradientOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        backgroundColor: 'transparent',
        backgroundImage: 'linear-gradient(to bottom, transparent, #0f1724)',
    },
    mediaTitle: {
        position: "absolute",
        bottom: 95,
        left: 30,
        right: 20,
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "700",
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    mediaBanner: {
        width: "100%",
        height: 380,
    },
    heroSection: {
        position: "absolute",
        bottom: 20,
        left: 20,
        flexDirection: "row",
        alignItems: "center",
        maxWidth: "90%",
        flexWrap: "wrap",
        paddingRight: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    heroText: {
        color: "#D6F1FF",
        fontSize: 14,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#D6F1FF",
        marginHorizontal: 8,
    },
    ratingBadge: {
        position: "absolute",
        bottom: 95,
        right: 20,
        flexDirection: "row",
        alignItems: "baseline",
        backgroundColor: '#FFB454',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    ratingText: {
        color: "#0f1724",
        fontSize: 20,
        fontWeight: "700",
    },
    ratingMax: {
        color: "#0f1724",
        fontSize: 14,
        fontWeight: "500",
    },
    postHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    postTitle: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "600",
    },
    postCaption: {
        color: "#85D6FF",
        fontSize: 14,
        marginTop: 8,
        lineHeight: 20,
    },
    createdAt: {
        fontSize: 14,
        color: "#85D6FF",
        marginTop: 8,
    },
    engagementBar: {
        marginVertical: 16,
        marginHorizontal: 20,
        justifyContent: "space-between",
        flexDirection: "row",
    },
    engagementButton: {
        justifyContent: "center",
        alignItems: "center",
        minWidth: 50,
    },
    engagementButtonIcon: {
        color: "#85D6FF",
    },
    engagementButtonText: {
        textAlign: 'center',
        fontSize: 12,
        color: "#85D6FF",
        marginTop: 4,
    },
    tabBar: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: '#2A2E35',
        marginHorizontal: 20,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        borderBottomColor: '#FFB454',
    },
    tabButtonText: {
        color: '#85D6FF',
        fontSize: 14,
        fontWeight: "500",
    },
    tabButtonTextActive: {
        color: '#FFB454',
    },
    tabContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    detailsContainer: {
        flex: 1,
    },
    sectionTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
    },
    plotText: {
        color: "#85D6FF",
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 20,
    },
    infoText: {
        color: "#85D6FF",
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 16,
    },
    emptyTabContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTabTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptyTabText: {
        color: '#85D6FF',
        fontSize: 14,
        textAlign: 'center',
    },
    ratingStarsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20,
    },
    largeStarButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2A2E35',
        justifyContent: 'center',
        alignItems: 'center',
    },
    largeStarText: {
        color: '#FFB454',
        fontSize: 16,
        fontWeight: "700",
    },
});
