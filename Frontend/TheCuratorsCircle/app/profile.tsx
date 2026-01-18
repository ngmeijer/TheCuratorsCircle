import {Text, View, StyleSheet, Image, FlatList, ActivityIndicator} from 'react-native';
import {router} from "expo-router";
import {DynamicDataButton} from "@/components/DynamicDataButton";
import {StyledButton} from "@/components/StyledButton";
import CollectionButton from "@/components/CollectionButton";
import Post from "@/components/Post";
import React from "react";
import {Colours} from "@/theme/colours";
import { useState } from "react";
import { posts } from '../mock/posts';
import { collections } from '../mock/collections';


export default function ProfilePage() {
    async function handleEditProfile() {

    }

    const [activeTab, setActiveTab] = useState<"collections" | "posts">("collections");

    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Image
                    source={require('../assets/images/IMG-20251121-WA0007.jpeg')}
                    style={styles.profilePicture}
                />

                <Text style={styles.fullName}>
                    Jerry Meijer
                </Text>
                <Text style={styles.username}>@testerJerry</Text>
                <Text style={styles.biography}>miauw miauw miauw.

                    miau miauw, meow miaow miauw… miauw miauw.
                    miauw miauw miauw miauw.

                    meow miaow,
                    miauw miau miauw.
                    miauw… miauw..</Text>
            </View>

            <View style={styles.profileActions}>
                <View style={styles.dataButtons}>
                    <DynamicDataButton
                        name="Collections"
                        data="5"
                        onPress={() => router.push("/collectionsPage")}
                        buttonStyle={styles.button}
                        nameTextStyle={styles.detailsNameButton}
                        dataTextStyle={styles.detailsDataButton}
                    />
                    <DynamicDataButton
                        name="Followers"
                        data="5"
                        onPress={() => router.push("/collectionsPage")}
                        buttonStyle={styles.button}
                        nameTextStyle={styles.detailsNameButton}
                        dataTextStyle={styles.detailsDataButton}
                    />
                    <DynamicDataButton
                        name="Following"
                        data="5"
                        onPress={() => router.push("/collectionsPage")}
                        buttonStyle={styles.button}
                        nameTextStyle={styles.detailsNameButton}
                        dataTextStyle={styles.detailsDataButton}
                    />
                    </View>

                <StyledButton
                    style={styles.editProfileButton}
                    title="Edit profile"
                    onPress={handleEditProfile}
                />
            </View>

            <View style={styles.profileContentTabs}>
                <View style={styles.profileContentButtons}>
                    <StyledButton
                        title="Collections"
                        onPress={() => setActiveTab("collections")}
                        style={[
                            styles.tabButton,
                            activeTab === "collections" && styles.activeTabButton
                        ]}
                        textStyle={[
                            styles.tabButtonText,
                            activeTab === "collections" && styles.activeTabText
                        ]}
                    />

                    <StyledButton
                        title="Posts"
                        onPress={() => setActiveTab("posts")}
                        style={[
                            styles.tabButton,
                            activeTab === "posts" && styles.activeTabButton
                        ]}
                        textStyle={[
                            styles.tabButtonText,
                            activeTab === "posts" && styles.activeTabText
                        ]}
                    />
                </View>
                {activeTab === "collections" ? (
                    <FlatList
                        key="collections"
                        data={collections}
                        numColumns={2}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <CollectionButton item={item} />}
                    />
                ) : (
                    <FlatList
                        key="posts"
                        data={posts}
                        numColumns={1}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <Post item={item} />}
                    />
                )}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121417',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileHeader: {
        flex: 2,
        marginTop: 20,
        width: '100%',
        backgroundColor: '#121417',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicture:{
      width:80, height:80,
        borderRadius: 30,
    },
    fullName: {
        color: Colours.textPrimary,
        fontFamily: "LeagueSpartan_600SemiBold",
        fontSize: 24
    },
    username: {
      fontSize: 20,
        color: '#FFB454',
        fontFamily: "LeagueSpartan_600SemiBold",
    },
    biography: {
        color: 'red',
        fontFamily: "Inter_400Regular",
        textAlign: 'center',
        width: 250,
        marginVertical:5,
    },
    profileActions: {
        backgroundColor:"#121417",
        flex:1,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
    },
    profileContentTabs: {
        flex:3,
        backgroundColor: '#181B20',
        width: '100%',
    },
    collections: {
        flex:5,
        flexDirection: 'column',
     },
    posts: {
        flex:5,
        flexDirection: 'column',
    },
    tabText: {
        color: "#AAA",
    },

    activeTabButton: {
        backgroundColor: "#FFB454",
    },
    activeTabText: {
        color: "#000",
    },
    tabButton: {
        backgroundColor: "#2A2E35",
        paddingHorizontal: 24,
    },
    tabButtonText: {
        color: "#AAA",
    },
    text: {
        color: '#fff'
    },
    button: {
        alignItems: 'center',
        textAlign: "auto",
        justifyContent: "center",
        width:75,
        height:50,
        marginVertical: 5,
        marginHorizontal: 15,
        borderRadius: 10
    },
    dataButtons: {
        flexDirection:"row"
    },
    detailsNameButton: {
        color: '#fff',
        fontSize:12
    },
    detailsDataButton: {
        color: '#fff',
        fontSize: 20,
        fontFamily:''
    },
    editProfileButton: {
        width: 200,
        backgroundColor: '#7C6DFF',
        color:'red',
        marginVertical:10,
    },
    profileContentButtons:{
        flexDirection:"row",
        justifyContent:"space-around",
        marginVertical:10,
    },
    showCollectionsButton: {

    },
    showPostsButton: {

    },
});