import {Text, View, StyleSheet, Button, Image, TextInput, Alert} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StyledButton} from "@/components/StyledButton";
import { ImageTextInput } from "@/components/ImageTextInput";

export default function LoginScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    style={styles.logo}
                    source={require('../assets/images/android-icon-foreground.png')}
                />
                <Text style={styles.appTitle}>The Curator's Circle</Text>
                <Text style={styles.appDescription}>Discover, collect, and share the entertainment that defines you.</Text>
            </View>
            <View style={styles.inputFields}>
                <SafeAreaProvider>
                    <SafeAreaView>
                        <ImageTextInput
                            placeholder="Email"
                            iconSource="mail-outline"
                            iconSize={18}
                            containerStyle={styles.textinputContainer}
                            inputStyle={styles.textinput}
                            iconStyle={styles.textIcon}
                        />
                        <ImageTextInput
                            placeholder="Password"
                            iconSource="lock-closed-outline"
                            iconSize={18}
                            containerStyle={styles.textinputContainer}
                            inputStyle={styles.textinput}
                            iconStyle={styles.textIcon}
                        />
                    </SafeAreaView>
                </SafeAreaProvider>
            </View>
            <StyledButton
                style={styles.loginButton}
                title="Log In"
                onPress={() => console.log("Pressed log in")}
            />
            <StyledButton
                style={styles.signupButton}
                textStyle={{color: '#000'}}
                title="Sign up"
                onPress={() => console.log("Pressed sign up")}
            />
            <Text style={styles.signupHint}>Or continue with</Text>
            <View style={styles.bigTechButtons}>

            </View>
            {/*<Button*/}
            {/*    title="Register"*/}
            {/*    onPress={() => Alert.alert('Simple Button pressed')}*/}
            {/*/>*/}
            {/*<Button*/}
            {/*    title="Log in"*/}
            {/*    onPress={() => Alert.alert('Simple Button pressed')}*/}
            {/*/>*/}
            {/*<Text style={styles.text}>Or continue with</Text>*/}
            {/*<View style={styles.bigTechButtons}>*/}
            {/*    <Button*/}
            {/*        title="Google"*/}
            {/*        onPress={() => Alert.alert('Simple Button pressed')}*/}
            {/*    />*/}
            {/*    <Button*/}
            {/*        title="Apple"*/}
            {/*        onPress={() => Alert.alert('Simple Button pressed')}*/}
            {/*    />*/}
            {/*</View>*/}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 2,
        backgroundColor: '#f7f7fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appTitle: {
        color: '#0f1724',
        flex: 1,
        fontSize: 30,
        fontWeight: 'bold',
    },
    appDescription: {
        color: '#98a0b3',
        flex: 1,
        textAlign: 'center',
        maxWidth: 280
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginTop:30,
        marginBottom:-20
    },
    signupHint: {
        color: '#fff',
    },
    inputFields: {
        width: '100%',
        flex: 1,
    },
    loginButton:{
        margin:20,
    },
    signupButton:{
        backgroundColor: 'transparent',
    },
    bigTechButtons: {
        width: '100%',
        flex: 1,
    },
    input: {
        height: 40,
        margin: 18,
        paddingHorizontal: 10,
        borderWidth: 0,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        color: '#b5bbc9'
    },
    textinputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        height:50,
        width:'80%',
        marginVertical: 8,
    },
    textIcon: {
        marginRight: 8,
    },
    textinput: {
        flex: 1,
        height: '100%',
        color: '#fff',
        fontSize: 26,
    },
});