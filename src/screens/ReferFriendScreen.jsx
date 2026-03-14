import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ScrollView, StatusBar } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';
import { Share2, Copy, Users, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ReferFriendScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const referCode = 'FITZING69';

    const onShare = async () => {
        try {
            await Share.share({
                message: `Join me on FitZhing! Use my referral code ${referCode} and let's play together.`,
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top || SPACING['12'] }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ChevronLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Refer a Friend</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.topSection}>
                    <View style={styles.iconContainer}>
                        <Users size={60} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Refer a Friend</Text>
                    <Text style={styles.subtitle}>Invite your friends to Join FitZhing and earn exclusive rewards together!</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Your Referral Code</Text>
                    <View style={styles.codeContainer}>
                        <Text style={styles.code}>{referCode}</Text>
                        <TouchableOpacity style={styles.copyButton}>
                            <Copy size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                    <Share2 size={20} color={COLORS.white} />
                    <Text style={styles.shareButtonText}>Share with Friends</Text>
                </TouchableOpacity>

                <View style={styles.promoContainer}>
                    <Text style={styles.promoTitle}>How it works?</Text>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                        <Text style={styles.stepText}>Share your code with friends</Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                        <Text style={styles.stepText}>They sign up using your code</Text>
                    </View>
                    <View style={styles.stepRow}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                        <Text style={styles.stepText}>Both of you get rewarded!</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['16'],
        height: 56,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: 0.3,
    },
    scrollContent: {
        padding: SPACING['24'],
    },
    topSection: {
        alignItems: 'center',
        marginTop: SPACING['24'],
        marginBottom: SPACING['32'],
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING['16'],
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING['8'],
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: SPACING['16'],
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING['24'],
        alignItems: 'center',
        marginBottom: SPACING['24'],
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING['16'],
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING['24'],
        paddingVertical: SPACING['12'],
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    code: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginRight: SPACING['16'],
        letterSpacing: 2,
    },
    copyButton: {
        padding: SPACING['4'],
    },
    shareButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING['16'],
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        elevation: 6,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    shareButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    promoContainer: {
        marginTop: SPACING['32'],
    },
    promoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING['16'],
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING['12'],
        gap: SPACING['16'],
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
});

export default ReferFriendScreen;

