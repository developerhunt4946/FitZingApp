import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ticket, ArrowRight, PlayCircle } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import { useNavigation } from '@react-navigation/native';
import SCREEN_NAMES from '../constants/screenNames';

const BookingsScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconBg}>
                        <Ticket size={60} color={COLORS.primary} strokeWidth={1.5} />
                    </View>
                    <View style={styles.pulse1} />
                    <View style={styles.pulse2} />
                </View>

                <Text style={styles.title}>{STRINGS.BOOKINGS_LIVE_SOON}</Text>
                <Text style={styles.subtitle}>
                    {STRINGS.JOIN_LIVE_EVENTS}
                </Text>

                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <PlayCircle size={20} color={COLORS.secondary} />
                        <Text style={styles.featureText}>Track your joined tournaments</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <PlayCircle size={20} color={COLORS.secondary} />
                        <Text style={styles.featureText}>Manage team registrations</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <PlayCircle size={20} color={COLORS.secondary} />
                        <Text style={styles.featureText}>View match schedules & results</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.ctaButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate(SCREEN_NAMES.HOME)}
                >
                    <Text style={styles.ctaText}>Explore Live Events</Text>
                    <ArrowRight size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: SPACING['24'],
    },
    iconContainer: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING['40'],
    },
    iconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    pulse1: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
        zIndex: 1,
    },
    pulse2: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 1,
        borderColor: COLORS.primary + '15',
        zIndex: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING['12'],
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SPACING['40'],
        paddingHorizontal: SPACING['12'],
    },
    featuresList: {
        width: '100%',
        backgroundColor: COLORS.surface,
        padding: SPACING['20'],
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        marginBottom: SPACING['40'],
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    featureText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    ctaButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 56,
        borderRadius: 16,
        paddingHorizontal: SPACING['32'],
        width: '100%',
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    ctaText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});

export default BookingsScreen;
