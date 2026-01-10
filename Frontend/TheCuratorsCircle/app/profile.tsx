import {Text, View, StyleSheet, Image} from 'react-native';
import {router} from "expo-router";
import {DynamicDataButton} from "@/components/DynamicDataButton";
import {StyledButton} from "@/components/StyledButton";

export default function ProfilePage() {
    async function handleEditProfile() {

    }

    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Image
                    source={require('../assets/images/IMG-20251121-WA0007.jpeg')}
                    style={{width: 75, height: 75}}
                />

                <Text style={styles.text}>Test User</Text>
                <Text style={styles.text}>@testUser</Text>
                <Text style={styles.biography}>This is a test biography, bla bla bla bla.</Text>
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
                    textStyle={{color: '#000'}}
                    title="Edit profile"
                    onPress={handleEditProfile}
                />
            </View>

            <View style={styles.profileContentTabs}>
                <Text>Collections will be shown here.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileHeader: {
        flex: 1,
        marginTop: 20,
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileActions: {
        backgroundColor:"green",
        flex:1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    profileContentTabs: {
        flex:2,
        backgroundColor: 'red',
        width: '100%',
        alignItems: 'center',
    },
    text: {
        color: '#fff'
    },
    button: {
        backgroundColor: '#adb5c2',
        alignItems: 'center',
        marginVertical: 25,
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
        backgroundColor: 'grey',
        marginVertical:20,
    },
    biography: {
        color: 'white',
        textAlign: 'center',
        width: 250,
    },
});