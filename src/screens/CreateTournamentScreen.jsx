import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../theme';
import STRINGS from '../constants/strings';

const CreateTournamentScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Plus size={48} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>{STRINGS.CREATE_TOURNAMENT}</Text>
                <Text style={styles.subtitle}>
                    This feature is coming soon. You'll be able to organize and manage your own sports tournaments here.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>{STRINGS.GO_BACK}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING['32'],
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING['24'],
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING['12'],
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING['32'],
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING['24'],
        paddingVertical: SPACING['12'],
        borderRadius: 12,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CreateTournamentScreen;
