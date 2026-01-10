import { Text, View, StyleSheet, Image } from 'react-native';
import {router} from "expo-router";
import {StyledButton} from "@/components/StyledButton";

export default function ProfilePage(){
    async function handleEditProfile() {

    }
        return (
        <View style={styles.container}>
            <Image
                style={{width: 75, height: 75}}
            />
            <Text style={styles.text}>Test User</Text>
            <Text style={styles.text}>@testUser</Text>
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
    detailsContainer: {
        backgroundColor: '#25292e',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff'
    },
    button: {
        backgroundColor:'#adb5c2',
        alignItems: 'center',
        marginVertical:25,
        marginHorizontal:15,
        borderRadius: 10
    },
});