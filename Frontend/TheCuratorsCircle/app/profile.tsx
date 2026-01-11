import {Text, View, StyleSheet, Image, FlatList} from 'react-native';
import {router} from "expo-router";
import {DynamicDataButton} from "@/components/DynamicDataButton";
import {StyledButton} from "@/components/StyledButton";
import CollectionButton from "@/components/CollectionButton";
import Post from "@/components/Post";
import React from "react";

export default function ProfilePage() {
    async function handleEditProfile() {

    }

    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Image
                    source={require('../assets/images/IMG-20251121-WA0007.jpeg')}
                    style={styles.profilePicture}
                />

                <Text style={styles.fullName}>Jerry Meijer</Text>
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
                        style={styles.showCollectionsButton}
                        textStyle={{ color: '#000' }}
                        title="Collections"
                        onPress={() => console.log("Clicked show collections")}
                    />
                    <StyledButton
                        style={styles.showCollectionsButton}
                        textStyle={{ color: '#000' }}
                        title="Favourites"
                        onPress={() => console.log("Clicked show collections")}
                    />
                </View>
                <FlatList style={styles.collections}
                    data={collections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <CollectionButton item={item} />}
                    numColumns={2}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 60 }}
                />
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
    fullName:{
        fontSize: 24,
        fontWeight:"bold",
        color: '#E6E8EB'
    },
    username: {
      fontSize: 20,
        color: '#FFB454'
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
    text: {
        color: '#fff'
    },
    button: {
        backgroundColor: '#7C6DFF',
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
    },
    detailsDataButton: {
        color: '#fff',
    },
    editProfileButton: {
        width: 200,
        backgroundColor: '#7C6DFF',
        color:'red',
        marginVertical:10,
    },
    biography: {
        color: 'white',
        textAlign: 'center',
        width: 250,
    },
    profileContentButtons:{
        flexDirection:"row",
        justifyContent:"space-around",
    },
    showCollectionsButton: {

    },
    showFavouritesButton: {

    },
});


export const collections = [
    {
        id:"1",
        name: 'Collection name',
        url: 'https://picsum.photos/900/1600',
        itemCount: 45,
        category: "Movies",
    },
    {
        id:"2",
        name: 'Collection name',
        url: 'https://picsum.photos/1200/800',
        itemCount: 45,
        category: "Music",
    },
    {
        id:"3",
        name: 'Collection name',
        url: 'https://picsum.photos/800/1200',
        itemCount: 45,
        category: "Music",
    },
    {
        id:"4",
        name: 'Collection name',
        url: 'https://picsum.photos/1080/1350',
        itemCount: 45,
        category: "Music",
    },
    {
        id:"5",
        name: 'Collection name',
        url: 'https://picsum.photos/1600/900',
        itemCount: 45,
        category: "Music",
    }
];
