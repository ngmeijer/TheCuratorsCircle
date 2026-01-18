import { Stack } from 'expo-router';
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useFonts, Inter_400Regular, LeagueSpartan_600SemiBold } from '@expo-google-fonts/dev';

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        LeagueSpartan_600SemiBold,
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading fonts...</Text>
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    }
});