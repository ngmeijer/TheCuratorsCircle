import {ActivityIndicator, Image, StyleSheet, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {getPost} from "../api/databaseClient"
import { useLocalSearchParams } from 'expo-router'; // 1. Import the hook
import { PostDto } from "@/DTOs/PostDto";

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
        <View style={styles.container}>
            <Image
                source={{ uri: postData.mediaData.posterUrl }}
                style={{ width: '100%', height: 300 }}
            />
            <View style={styles.content}>
                <Text style={styles.header}>{postData.name}</Text>
                <Text style={styles.header}>{postData.mediaData.title}, {postData.mediaData.releaseYear}</Text>
                <Text style={styles.createdAt}>{postData.createdAt}</Text>
                <Text style={styles.plot}>{postData.mediaData.plot}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000E14",
    },
    content: {
        marginHorizontal:20,
    },
    header: {
        color:"#D6F1FF",
        fontSize:32,
        paddingTop: 6,
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