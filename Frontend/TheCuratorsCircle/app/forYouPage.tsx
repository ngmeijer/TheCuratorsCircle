import React from 'react';
import {View, FlatList, StyleSheet, Text, Pressable} from 'react-native';
import Post from '../components/Post';
import { posts } from '../mock/posts';
import {StyledButton} from "@/components/StyledButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import {router} from "expo-router";

export default function ForYouPage() {
    return (
        <View style={styles.container}>
            {/* Optional header */}
            <View style={styles.header}>
                <Text style={styles.logo}>For You</Text>
            </View>
            {/*<Pressable style={styles.profileButton} onPress={() => console.log('Google')}>*/}
            {/*    <Ionicons name="logo-google" size={28} />*/}
            {/*</Pressable>*/}

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Post item={item} />}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={{ paddingBottom: 60 }}
            />
            <View style={styles.quickAccessMenu}>
                <Pressable style={styles.button} onPress={() => console.log('Google')}>
                    <Ionicons name="albums" size={28} />
                </Pressable>

                <Pressable style={styles.button} onPress={() => console.log('Google')}>
                    <Ionicons name="create" size={28} />
                </Pressable>

                <Pressable style={styles.button} onPress={() => router.push('/profile')}>
                    <Ionicons name="person-circle" size={28} />
                </Pressable>
            </View>

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
    quickAccessMenu: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        bottom: 30,
        left: 60,
        right: 60,
        backgroundColor: 'white',
        padding: 6,
        borderRadius: 12,
        elevation: 5,      // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    button: {
        padding: 4,
        marginVertical: 2,
        alignItems: 'center',
    },
});
