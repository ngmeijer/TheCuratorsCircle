import {ActivityIndicator, Image, ScrollView, StyleSheet, Text, View, Pressable} from "react-native";
import React, {useEffect, useState} from "react";
import {getPost} from "../api/databaseClient"
import { useLocalSearchParams } from 'expo-router';
import { PostDto } from "@/DTOs/PostDto";
import { IconTextButton } from "@/components/IconTextButton";
import { useRouter } from "expo-router";

type TabType = 'details' | 'discussion' | 'collections' | 'rating';

export default function PostDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [postData, setPostData] = useState<PostDto | null>(null);
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
                return <DetailsTab postData={postData} />;
            case 'discussion':
                return <DiscussionTab />;
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
                    <Image
                        source={{ uri: postData.mediaData.posterUrl }}
                        style={styles.mediaBanner}
                    />
                    <View style={styles.gradientOverlay} />
                    <Text style={styles.mediaTitle}>{postData.mediaData.title}</Text>
                    <View style={styles.heroSection}>
                        <Text style={styles.heroText}>{postData.mediaData.releaseYear}</Text>
                        <View style={styles.dot} />
                        <Text style={styles.heroText}>{postData.mediaData.genre}</Text>
                        <View style={styles.dot} />
                        <Text style={styles.heroText}>{postData.mediaData.runtimeInMinutes}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>{postData.mediaData.rating}</Text>
                        <Text style={styles.ratingMax}>/10</Text>
                    </View>
                </View>

                <View style={styles.postHeader}>
                    <Text style={styles.postName}>{postData.name}</Text>
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

function DetailsTab({ postData }: { postData: PostDto | null }) {
    if (!postData) return null;

    const { mediaData } = postData;

    return (
        <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Plot</Text>
            <Text style={styles.plotText}>{mediaData.plot || 'No plot available.'}</Text>
            
            {mediaData.director && (
                <>
                    <Text style={styles.sectionTitle}>Director</Text>
                    <Text style={styles.infoText}>{mediaData.director}</Text>
                </>
            )}

            {mediaData.actors && (
                <>
                    <Text style={styles.sectionTitle}>Cast</Text>
                    <Text style={styles.infoText} numberOfLines={3}>{mediaData.actors}</Text>
                </>
            )}

            {mediaData.writer && (
                <>
                    <Text style={styles.sectionTitle}>Writer</Text>
                    <Text style={styles.infoText}>{mediaData.writer}</Text>
                </>
            )}

            {(mediaData.boxOffice && mediaData.boxOffice !== 'N/A') && (
                <>
                    <Text style={styles.sectionTitle}>Box Office</Text>
                    <Text style={styles.infoText}>{mediaData.boxOffice}</Text>
                </>
            )}

            {(mediaData.awards && mediaData.awards !== 'N/A') && (
                <>
                    <Text style={styles.sectionTitle}>Awards</Text>
                    <Text style={styles.infoText}>{mediaData.awards}</Text>
                </>
            )}

            {(mediaData.metascore || mediaData.imdbVotes) && (
                <>
                    <Text style={styles.sectionTitle}>Scores</Text>
                    <View style={styles.scoreCard}>
                        {mediaData.metascore && (
                            <View style={styles.scoreItem}>
                                <Text style={styles.scoreValue}>{mediaData.metascore}</Text>
                                <Text style={styles.scoreLabel}>Metascore</Text>
                            </View>
                        )}
                        {mediaData.imdbVotes && (
                            <View style={styles.scoreItem}>
                                <Text style={styles.scoreValue}>{mediaData.imdbVotes}</Text>
                                <Text style={styles.scoreLabel}>IMDb Votes</Text>
                            </View>
                        )}
                    </View>
                </>
            )}
        </View>
    );
}

function DiscussionTab() {
    return (
        <View style={styles.emptyTabContainer}>
            <Text style={styles.emptyTabTitle}>No discussions yet</Text>
            <Text style={styles.emptyTabText}>Be the first to start a discussion about this!</Text>
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
    postName: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "600",
    },
    createdAt: {
        fontSize: 14,
        color: "#85D6FF",
        marginTop: 4,
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
    scoreCard: {
        flexDirection: 'row',
        backgroundColor: '#1a1f2e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        gap: 24,
    },
    scoreItem: {
        alignItems: 'center',
    },
    scoreValue: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
    },
    scoreLabel: {
        color: "#85D6FF",
        fontSize: 12,
        marginTop: 4,
    },
    detailCard: {
        backgroundColor: '#1a1f2e',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    detailRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#2A2E35',
    },
    detailLabel: {
        color: '#85D6FF',
        fontSize: 14,
    },
    detailValue: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: "500",
    },
    userRatingCard: {
        backgroundColor: '#1a1f2e',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    ratingPrompt: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    starButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2A2E35',
        justifyContent: 'center',
        alignItems: 'center',
    },
    starText: {
        color: '#FFB454',
        fontSize: 12,
        fontWeight: "600",
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
