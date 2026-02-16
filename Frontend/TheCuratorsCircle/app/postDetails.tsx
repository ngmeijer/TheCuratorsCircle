import {ActivityIndicator, Image, ScrollView, StyleSheet, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {getPost} from "../api/databaseClient"
import { useLocalSearchParams } from 'expo-router'; // 1. Import the hook
import { PostDto } from "@/DTOs/PostDto";
import {ImageTextInput} from "@/components/ImageTextInput";
import { IconTextButton } from "@/components/IconTextButton";

export default function PostDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [postData, setPostData] = useState<PostDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    if (!postData) {
        return (
            <View style={styles.container}>
                <Text>Post not found (ID: {id})</Text>
            </View>
        );
    }

    return (
        <ScrollView
                style={styles.screen}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}>
                <View style={styles.mediaStatsContainer}>
                    <Image
                        source={{ uri: postData.mediaData.posterUrl }}
                        style={styles.mediaBanner}
                    />
                    <Text style={styles.mediaTitle}>{postData.mediaData.title}</Text>
                    <View style={styles.heroSection}>
                        <Text style={styles.releaseYear}>{postData.mediaData.releaseYear}</Text>
                        <Text style={styles.genres}>{postData.mediaData.genre}</Text>
                        <Text style={styles.duration}>{postData.mediaData.runtimeInMinutes}</Text>
                    </View>
                    <Text style={styles.rating}>{postData.mediaData.rating} / 10</Text>
                </View>
                <View style={styles.engagementBar}>
                    <IconTextButton
                        iconSource="heart-outline"
                        text={postData.likeCount}
                        iconSize={24}
                        containerStyle={styles.engagementButton}
                        iconStyle={styles.engagementButtonIcon}
                        textStyle={styles.engagementButtonText}>
                    </IconTextButton>
                    <IconTextButton
                        iconSource="chatbubble-outline"
                        text={postData.commentCount}
                        iconSize={24}
                        containerStyle={styles.engagementButton}
                        iconStyle={styles.engagementButtonIcon}
                        textStyle={styles.engagementButtonText}>
                    </IconTextButton>
                    <IconTextButton
                        iconSource="bookmark-outline"
                        text={postData.shareCount}
                        iconSize={24}
                        containerStyle={styles.engagementButton}
                        iconStyle={styles.engagementButtonIcon}
                        textStyle={styles.engagementButtonText}>
                    </IconTextButton>
                </View>
                <View style={styles.content}>
                    <Text style={styles.postName}>{postData.name}</Text>
                    <Text style={styles.createdAt}>{postData.createdAt}</Text>
                    <Text style={styles.plot}>{postData.mediaData.plot}</Text>
                    <Text style={styles.plot}>{postData.mediaData.plot}</Text>
                    <Text style={styles.plot}>{postData.mediaData.plot}</Text>
                    <Text style={styles.plot}>{postData.mediaData.plot}</Text>
                    <Text style={styles.plot}>{postData.mediaData.plot}</Text>

                </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0f1724',
    },

    contentContainer: {
        paddingBottom: 40,
    },
    container: {
        flex: 1,
        backgroundColor: "#000E14",
    },
    content: {
        marginHorizontal:20,
    },
    mediaStatsContainer: {
        position: "relative",
    },
    mediaTitle: {
        paddingHorizontal:10,
        position: "absolute",
        bottom: 80,
        left: 20,
        color: "#D6F1FF",
        fontSize: 32,
        fontWeight: "bold",
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 10,
    },
    mediaBanner: {
        width: "100%",
        height: 420,
    },
    heroSection: {
        position: "absolute",
        bottom: 50,
        left: 30,
        width: "80%",
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 40,
    },
    releaseYear: {
        color: "#D6F1FF",
    },
    genres: {
        color: "#D6F1FF",
    },
    duration: {
        color: "#D6F1FF",
    },
    rating: {
        position: "absolute",
        bottom: 10,
        left: 0,
        right: 20,
        color: "#D6F1FF",
        fontSize: 22,
        marginHorizontal:20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width:"25%",
        textAlign: "center",
        borderRadius: 10,
    },
    engagementBar: {
        marginVertical:20,
        justifyContent: "space-around",
        flexDirection: "row",
    },
    engagementButton: {
        justifyContent: "center",
        alignItems: "center",
    },
    engagementButtonIcon: {
        color: "#D6F1FF",
    },
    engagementButtonText: {
        textAlign: "center",
        fontSize: 12,
        color: "#D6F1FF",
    },
    postName: {
        color:"#D6F1FF",
        fontSize:32,
    },
    createdAt: {
        fontSize:16,
        color:"#85D6FF",
    },
    plot: {
        color:"#85D6FF",
        fontSize:14,
    }
});