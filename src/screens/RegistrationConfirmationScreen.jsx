import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, CheckCircle2, Circle, CreditCard, Info, AlertCircle } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import SCREEN_NAMES from '../constants/screenNames';
import { registerTeam } from '../redux/slices/tournamentSlice';

const RegistrationConfirmationScreen = ({ route }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { tournamentId, categoryId, categoryName, teamName, players, total, breakup } = route.params || {};

    const [registrationMethod, setRegistrationMethod] = useState('offline'); // 'offline' = Register without payment
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleRegister = async () => {
        if (registrationMethod !== 'offline') return;

        setLoading(true);
        setError(null);

        try {
            const result = await dispatch(registerTeam({
                tournamentId,
                categoryId,
                registrationData: {
                    name: teamName,
                    players: players
                }
            })).unwrap();

            setShowSuccess(true);
        } catch (err) {
            setError(err || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirmation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Summary Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Info size={18} color={COLORS.primary} />
                        <Text style={styles.cardTitle}>Registration Summary</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Team Name</Text>
                        <Text style={styles.summaryValue}>{teamName}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Category</Text>
                        <Text style={styles.summaryValue}>{categoryName}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Players</Text>
                        <Text style={styles.summaryValue}>{players.length}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>₹{Number(total).toFixed(2)}</Text>
                    </View>
                </View>

                {/* Player List Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Player List</Text>
                    {players.map((p, i) => (
                        <View key={i} style={styles.playerItem}>
                            <View style={styles.playerAvatar}>
                                <Text style={styles.playerInitial}>{p.firstName[0]}{p.lastName[0]}</Text>
                            </View>
                            <View style={styles.playerInfo}>
                                <Text style={styles.playerName}>{p.firstName} {p.lastName}</Text>
                                <Text style={styles.playerContact}>{p.email} | {p.phone}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Payment Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Registration Options</Text>

                    <TouchableOpacity
                        style={[styles.optionCard, registrationMethod === 'offline' && styles.optionCardActive]}
                        onPress={() => setRegistrationMethod('offline')}
                    >
                        <View style={styles.optionInfo}>
                            <Text style={styles.optionTitle}>Register without payment</Text>
                            <Text style={styles.optionDesc}>Register your team and pay later at the venue.</Text>
                        </View>
                        {registrationMethod === 'offline' ? (
                            <CheckCircle2 size={22} color={COLORS.primary} />
                        ) : (
                            <Circle size={22} color={COLORS.gray300} />
                        )}
                    </TouchableOpacity>

                    <View style={[styles.optionCard, styles.optionCardDisabled]}>
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionTitle, { color: COLORS.gray400 }]}>Pay Online (coming soon)</Text>
                            <Text style={styles.optionDesc}>Pay securely using UPI, Card or Netbanking.</Text>
                        </View>
                        <Circle size={22} color={COLORS.gray200} />
                    </View>
                </View>
            </ScrollView>

            {/* Error Message */}
            {error && (
                <View style={styles.errorContainer}>
                    <AlertCircle size={18} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Bottom Action */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.confirmBtn, loading && styles.disabledBtn]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.confirmBtnText}>Complete Registration</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Success Modal */}
            <Modal visible={showSuccess} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.successCard}>
                        <View style={styles.successIcon}>
                            <CheckCircle2 size={60} color={COLORS.white} />
                        </View>
                        <Text style={styles.successTitle}>Registration Successful!</Text>
                        <Text style={styles.successSubtitle}>Your team "{teamName}" has been successfully registered for {categoryName}.</Text>

                        <TouchableOpacity
                            style={styles.homeBtn}
                            onPress={() => {
                                setShowSuccess(false);
                                navigation.navigate('MainTabs');
                            }}
                        >
                            <Text style={styles.homeBtnText}>Go to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray100,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING['16'],
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 15,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.primary,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 12,
    },
    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    playerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    playerInitial: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '800',
    },
    playerName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    playerContact: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
        marginBottom: 12,
    },
    optionCardActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '05',
    },
    optionCardDisabled: {
        backgroundColor: COLORS.gray50,
        opacity: 0.8,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    optionDesc: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    footer: {
        padding: SPACING['16'],
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    confirmBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    disabledBtn: {
        backgroundColor: COLORS.gray400,
    },
    confirmBtnText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '800',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: SPACING['16'],
        marginBottom: 8,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 32,
        width: '100%',
        alignItems: 'center',
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.success,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    successSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    homeBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    homeBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
    },
});

export default RegistrationConfirmationScreen;
