import React from 'react';
import {View, FlatList, StyleSheet, Text, Pressable} from 'react-native';
import Post from '../components/Post';
import { posts } from '../mock/posts';
import {StyledButton} from "@/components/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ForYouPage() {
    return (
        <View style={styles.container}>
            {/* Optional header */}
            <View style={styles.header}>
                <Text style={styles.logo}>For You</Text>
            </View>
            <Pressable style={styles.profileButton} onPress={() => console.log('Google')}>
                <Ionicons name="logo-google" size={28} />
            </Pressable>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Post item={item} />}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={{ paddingBottom: 60 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1724',
    },
    header: {
        paddingTop: 40,
        paddingBottom: 12,
        paddingHorizontal: 20,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    separator: {
        height: 25, // small gap between posts
    },
});
