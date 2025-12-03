import { Text, View, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StyledButton } from "@/components/StyledButton";
import { ImageTextInput } from "@/components/ImageTextInput";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Login() {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    {/* Clickable logo */}
                    <Pressable
                        onPress={() => console.log("Logo pressed")}
                        style={styles.logoWrapper}
                    >
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={styles.logo}
                        />
                    </Pressable>

                    <Text style={styles.appDescription}>
                        Discover, collect, and share the entertainment that defines you.
                    </Text>
                </View>

                <View style={styles.inputFields}>
                    <ImageTextInput
                        placeholder="Email"
                        placeholderColor="#9ca3b6"
                        iconSource="mail-outline"
                        iconSize={18}
                        containerStyle={styles.textinputContainer}
                        inputStyle={styles.textinput}
                        iconStyle={styles.textIcon}
                    />
                    <ImageTextInput
                        placeholder="Password"
                        placeholderColor="#9ca3b6"
                        iconSource="lock-closed-outline"
                        iconSize={18}
                        containerStyle={styles.textinputContainer}
                        inputStyle={styles.textinput}
                        iconStyle={styles.textIcon}
                    />
                </View>

                <StyledButton
                    style={styles.loginButton}
                    title="Log In"
                    onPress={() => console.log("Pressed log in")}
                />

                <StyledButton
                    style={styles.signupButton}
                    textStyle={{ color: '#000' }}
                    title="Sign up"
                    onPress={() => console.log("Pressed sign up")}
                />

                <Text style={styles.signupHint}>Or continue with</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Pressable style={styles.socialButton} onPress={() => console.log('Google')}>
                        <Ionicons name="logo-google" size={28} />
                    </Pressable>

                    <Pressable style={styles.socialButton} onPress={() => console.log('Apple')}>
                        <Ionicons name="logo-apple" size={28} />
                    </Pressable>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7fa',
        alignItems: 'center',
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoWrapper: {
        width: 200,
        height: 150,
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    appDescription: {
        color: '#98a0b3',
        textAlign: 'center',
        maxWidth: 280,
    },
    inputFields: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 16,
    },
    textinputContainer: {
        width: '100%',
        maxWidth: 320,
        height: 50,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 12,
    },
    textIcon: {
        marginRight: 8,
    },
    textinput: {
        flex: 1,
        height: '100%',
        color: 'black',
        fontSize: 16,
    },
    loginButton: {
        width: '100%',
        maxWidth: 320,
        marginTop: 12,
    },
    signupButton: {
        width: '100%',
        maxWidth: 320,
        marginTop: 8,
        backgroundColor: 'transparent',
    },
    signupHint: {
        color: '#a2aaba',
        marginTop: 16,
    },
    bigTechButtons: {
        flexDirection: 'row',     // place buttons horizontally
        justifyContent: 'center', // center them
        gap: 16,                  // space between buttons
        marginTop: 16,            // distance from signup/login buttons
        width: '100%',
        maxWidth: 320,
    },

    socialButton: {
        width: 100,                 // or any fixed width
        height: 50,
        marginTop:10,// keep original height
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',  // centers the icon vertically
        alignItems: 'center',      // centers the icon horizontally
        borderWidth: 1,
        borderColor: '#ccc',
    },

    socialButtonImage: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
    },

});
