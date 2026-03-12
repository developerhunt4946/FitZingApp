import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../theme';
import {
    ArrowLeft,
    Users,
    User,
    Phone,
    Trophy,
    Award,
    Gamepad2,
    Percent,
    CheckCircle2,
    ChevronDown,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { registerESportsTeam } from '../services/tournamentServices';
import { createPaymentOrder, verifyPayment } from '../services/paymentServices';
import { AppAlert } from '../components';
import {
  CFEnvironment,
  CFSession,
  CFThemeBuilder,
  CFDropCheckoutPayment,
  CFPaymentGatewayService,
} from 'react-native-cashfree-pg-sdk';

// Determine which Game ID label to use based on category
const getGameIdLabel = (categoryName) => {
    if (!categoryName) return 'Game ID';
    const lower = categoryName.toLowerCase();
    if (lower.includes('bgmi') || lower.includes('pubg')) return 'BGMI ID';
    if (lower.includes('free fire') || lower.includes('ff')) return 'Free Fire ID';
    if (lower.includes('valorant')) return 'Valorant ID';
    if (lower.includes('cod') || lower.includes('call of duty')) return 'COD ID';
    if (lower.includes('clash royale') || lower.includes('cr')) return 'Clash Royale ID';
    return 'Game ID';
};

const ESportsRegistrationScreen = ({ route }) => {
    const navigation = useNavigation();
    const { tournament } = route.params;

    const categoryName = tournament?.categoryName || '';
    const gameIdLabel = getGameIdLabel(categoryName);
    const numPlayers = tournament?.playersPerTeams || 4;

    const entryFeePerTeam = Number(tournament?.entryFeePerTeam) || 0;
    const entryFeePerPlayer = Number(tournament?.entryFeePerPlayer) || 0;
    const discount = Number(tournament?.discount) || 0;
    const prizePool = Number(tournament?.prizePool) || 0;

    const hasDiscount = discount > 0;
    const discountedFee = hasDiscount ? entryFeePerTeam * (1 - discount / 100) : entryFeePerTeam;
    const discountedFeePerPlayer = hasDiscount ? entryFeePerPlayer * (1 - discount / 100) : entryFeePerPlayer;
    const saved = entryFeePerTeam - discountedFee;
    const savedPerPlayer = entryFeePerPlayer - discountedFeePerPlayer;

    // Build initial player records
    const buildInitialPlayers = () => {
        return Array.from({ length: numPlayers }, (_, i) => ({
            id: i,
            name: '',
            gameId: '',
            expanded: i === 0,
        }));
    };

    const [teamName, setTeamName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [players, setPlayers] = useState(buildInitialPlayers);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
    });

    const showAlert = (title, message, type = 'info', onConfirm = null) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            onConfirm,
        });
    };

    const updatePlayer = (index, field, value) => {
        setPlayers((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const togglePlayer = (index) => {
        setPlayers((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], expanded: !updated[index].expanded };
            return updated;
        });
    };

    const validate = () => {
        if (!teamName.trim()) {
            showAlert('Team Name Required', 'Please enter your team name.', 'error');
            return false;
        }
        if (!whatsapp.trim() || whatsapp.length < 10) {
            showAlert('WhatsApp Number', 'Please enter a valid WhatsApp number.', 'error');
            return false;
        }
        for (let i = 0; i < players.length; i++) {
            const p = players[i];
            if (!p.name.trim()) {
                showAlert('Player Info', `Please enter the name for Player ${i + 1}.`, 'error');
                return false;
            }
            if (!p.gameId.trim()) {
                showAlert('Player Info', `Please enter the ${gameIdLabel} for Player ${i + 1}.`, 'error');
                return false;
            }
        }
        return true;
    };

    useEffect(() => {
        CFPaymentGatewayService.setCallback({
            onVerify(orderID) {
                console.log('payment verified callback', orderID);
                handlePaymentVerify(orderID);
            },
            onError(error, orderID) {
                console.log('payment error callback', error, orderID);
                setLoading(false);
                showAlert('Payment Failed', error?.message || 'Transaction failed or was cancelled.', 'error');
            },
        });

        return () => {
            CFPaymentGatewayService.removeCallback();
        };
    }, []);

    const handlePaymentVerify = async (orderId) => {
        try {
            const verifyRes = await verifyPayment(orderId);
            // Cashfree backend returns paymentStatus as 'SUCCESS' generally
            if (verifyRes?.paymentStatus === 'SUCCESS' || verifyRes?.payment_status === 'SUCCESS' || verifyRes?.status === 'SUCCESS') {
                // Proceed with eSports Team registration
                const payload = {
                    tournamentId: tournament._id,
                    teamName: teamName.trim(),
                    whatsappNumber: whatsapp.trim(),
                    players: players.map(p => ({
                        name: p.name.trim(),
                        gameId: p.gameId.trim()
                    }))
                };

                await registerESportsTeam(payload);
                setLoading(false);
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    navigation.goBack();
                    navigation.goBack();
                }, 2200);
            } else {
                setLoading(false);
                showAlert('Payment Pending/Failed', 'Your payment was not successful. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Verify error:', error);
            setLoading(false);
            showAlert('Verification Failed', 'Failed to verify payment status. If money was deducted, please contact support.', 'error');
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);

        try {
            // Check if tournament is free (no fee)
            if (discountedFee === 0) {
                // If it's a free tournament, directly register without Cashfree
                const payload = {
                    tournamentId: tournament.id,
                    teamName: teamName.trim(),
                    whatsappNumber: whatsapp.trim(),
                    players: players.map(p => ({
                        name: p.name.trim(),
                        gameId: p.gameId.trim()
                    }))
                };

                await registerESportsTeam(payload);
                setLoading(false);
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    navigation.goBack();
                    navigation.goBack();
                }, 2200);
                return;
            }

            // 1. Create order
            const orderPayload = {
                orderAmount: discountedFee,
                customerId: 'esports_' + Date.now().toString(),
                customerName: teamName.trim().substring(0, 50) || 'Team Captain',
                customerPhone: whatsapp.trim(),
                customerEmail: 'esports@fitzing.in',
                orderNote: `ESports Registration for ${tournament?.name || 'Tournament'}`.substring(0, 50)
            };

            const orderResponse = await createPaymentOrder(orderPayload);
            const paymentSessionId = orderResponse?.payment_session_id || orderResponse?.data?.payment_session_id || orderResponse?.session_id;
            const orderId = orderResponse?.order_id || orderResponse?.data?.order_id || orderResponse?.orderId;
            
            if (!paymentSessionId || !orderId) {
                throw new Error('Invalid response from payment server (missing session ID).');
            }

            // 2. Open Cashfree session
            try {
                const session = new CFSession(paymentSessionId, orderId, CFEnvironment.SANDBOX);
                const theme = new CFThemeBuilder()
                    .setNavigationBarBackgroundColor(COLORS.primary)
                    .setNavigationBarTextColor('#ffffff')
                    .setButtonBackgroundColor(COLORS.primary)
                    .setButtonTextColor('#ffffff')
                    .setPrimaryTextColor(COLORS.text)
                    .setSecondaryTextColor(COLORS.textSecondary)
                    .build();

                const dropPayment = new CFDropCheckoutPayment(session, null, theme);
                CFPaymentGatewayService.doPayment(dropPayment);
                // Keep loading state true while Webview is opening. The SDK callbacks will handle success/failure.
            } catch (sdkError) {
                setLoading(false);
                showAlert('Payment Error', 'Failed to initialize payment gateway window.', 'error');
                console.error(sdkError);
            }

        } catch (error) {
            setLoading(false);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create payment order.';
            showAlert('Order Failed', errorMessage, 'error');
            console.error('createOrder error:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <StatusBar barStyle={'dark-content'} />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Register Team</Text>
                    <Text style={styles.headerSub}>{tournament?.name}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Team Info ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Users size={17} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Team Details</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Team Name <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={teamName}
                            onChangeText={setTeamName}
                            placeholder="e.g. Alpha Squad"
                            placeholderTextColor={COLORS.textTertiary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Phone size={14} color={COLORS.primary} />
                            <Text style={styles.label}>WhatsApp Number <Text style={styles.required}>*</Text></Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={whatsapp}
                            onChangeText={setWhatsapp}
                            placeholder="e.g. 9876543210"
                            placeholderTextColor={COLORS.textTertiary}
                            keyboardType="phone-pad"
                            maxLength={15}
                        />
                    </View>
                </View>

                {/* ── Player Details ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Gamepad2 size={17} color={COLORS.secondary} />
                        <Text style={styles.sectionTitle}>Player Details ({numPlayers} Players)</Text>
                    </View>

                    {players.map((player, index) => (
                        <View key={player.id} style={styles.playerCard}>
                            <TouchableOpacity
                                style={styles.playerHeader}
                                onPress={() => togglePlayer(index)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.playerNumBadge}>
                                    <Text style={styles.playerNumText}>{index + 1}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.playerLabel}>
                                        {player.name.trim() ? player.name : `Player ${index + 1}`}
                                    </Text>
                                    {player.gameId.trim() ? (
                                        <Text style={styles.playerGameId}>{gameIdLabel}: {player.gameId}</Text>
                                    ) : null}
                                </View>
                                <ChevronDown
                                    size={18}
                                    color={COLORS.textTertiary}
                                    style={{ transform: [{ rotate: player.expanded ? '180deg' : '0deg' }] }}
                                />
                            </TouchableOpacity>

                            {player.expanded && (
                                <View style={styles.playerFields}>
                                    <View style={styles.inputGroup}>
                                        <View style={styles.labelRow}>
                                            <User size={13} color={COLORS.textSecondary} />
                                            <Text style={styles.label}>Player Name <Text style={styles.required}>*</Text></Text>
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            value={player.name}
                                            onChangeText={(val) => updatePlayer(index, 'name', val)}
                                            placeholder={`Player ${index + 1} name`}
                                            placeholderTextColor={COLORS.textTertiary}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <View style={styles.labelRow}>
                                            <Gamepad2 size={13} color={COLORS.textSecondary} />
                                            <Text style={styles.label}>{gameIdLabel} <Text style={styles.required}>*</Text></Text>
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            value={player.gameId}
                                            onChangeText={(val) => updatePlayer(index, 'gameId', val)}
                                            placeholder={`Enter ${gameIdLabel}`}
                                            placeholderTextColor={COLORS.textTertiary}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* ── Prize & Fee Breakup ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Trophy size={17} color={COLORS.secondary} />
                        <Text style={styles.sectionTitle}>Prize & Fee Breakup</Text>
                    </View>

                    <View style={styles.breakupCard}>
                        {/* Prize Pool */}
                        <View style={styles.breakupRow}>
                            <View style={styles.breakupLeft}>
                                <Award size={16} color={COLORS.secondary} />
                                <Text style={styles.breakupLabel}>Prize Pool</Text>
                            </View>
                            <Text style={[styles.breakupValue, { color: COLORS.secondary }]}>
                                ₹{prizePool.toLocaleString('en-IN')}
                            </Text>
                        </View>

                        <View style={styles.breakupDivider} />

                        {/* Entry Fee per team */}
                        <View style={styles.breakupRow}>
                            <View style={styles.breakupLeft}>
                                <Users size={16} color={COLORS.textSecondary} />
                                <Text style={styles.breakupLabel}>Entry Fee (Team)</Text>
                            </View>
                            {hasDiscount ? (
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.strikeText}>₹{entryFeePerTeam.toFixed(2)}</Text>
                                    <Text style={styles.breakupValue}>₹{discountedFee.toFixed(2)}</Text>
                                </View>
                            ) : (
                                <Text style={styles.breakupValue}>₹{entryFeePerTeam.toFixed(2)}</Text>
                            )}
                        </View>

                        {/* Entry fee per player */}
                        {/* <View style={styles.breakupRow}>
                            <View style={styles.breakupLeft}>
                                <User size={16} color={COLORS.textSecondary} />
                                <Text style={styles.breakupLabel}>Entry Fee (per Player)</Text>
                            </View>
                            {hasDiscount ? (
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.strikeText}>₹{entryFeePerPlayer.toFixed(2)}</Text>
                                    <Text style={styles.breakupValue}>₹{discountedFeePerPlayer.toFixed(2)}</Text>
                                </View>
                            ) : (
                                <Text style={styles.breakupValue}>₹{entryFeePerPlayer.toFixed(2)}</Text>
                            )}
                        </View> */}

                        {/* Discount */}
                        {hasDiscount && (
                            <>
                                <View style={styles.breakupDivider} />
                                <View style={styles.breakupRow}>
                                    <View style={styles.breakupLeft}>
                                        <Percent size={16} color="#22C55E" />
                                        <Text style={[styles.breakupLabel, { color: '#22C55E' }]}>
                                            Discount ({discount}%) on team
                                        </Text>
                                    </View>
                                    <Text style={[styles.breakupValue, { color: '#22C55E' }]}>
                                        - ₹{saved.toFixed(2)}
                                    </Text>
                                </View>
                                {/* <View style={styles.breakupRow}>
                                    <View style={styles.breakupLeft}>
                                        <Percent size={16} color="#22C55E" />
                                        <Text style={[styles.breakupLabel, { color: '#22C55E' }]}>
                                            Discount ({discount}%) per player
                                        </Text>
                                    </View>
                                    <Text style={[styles.breakupValue, { color: '#22C55E' }]}>
                                        - ₹{savedPerPlayer.toFixed(2)}
                                    </Text>
                                </View> */}
                            </>
                        )}

                        <View style={styles.breakupDivider} />

                        {/* Total to pay */}
                        <View style={[styles.breakupRow, { marginTop: 4 }]}>
                            <Text style={styles.totalLabel}>Total Payable</Text>
                            <Text style={styles.totalValue}>₹{discountedFee.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Text style={styles.submitBtnText}>Confirm Registration</Text>
                            <Text style={styles.submitBtnSub}>
                                Team: ₹{discountedFee.toFixed(0)} · Per Player: ₹{discountedFeePerPlayer.toFixed(0)}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Custom Alert */}
            <AppAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
                showCancel={alertConfig.type === 'confirm'}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.gray50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
    headerSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
    scroll: { padding: SPACING['16'], paddingBottom: SPACING['40'] },

    section: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING['16'],
        marginBottom: SPACING['16'],
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING['16'],
    },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },

    inputGroup: { marginBottom: SPACING['14'] },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
    required: { color: COLORS.error },
    input: {
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
        paddingHorizontal: SPACING['14'],
        paddingVertical: 12,
        fontSize: 15,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },

    playerCard: {
        backgroundColor: COLORS.background,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        overflow: 'hidden',
    },
    playerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING['12'],
        gap: 12,
    },
    playerNumBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerNumText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
    playerLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    playerGameId: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    playerFields: {
        padding: SPACING['12'],
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },

    // Prize Breakup
    breakupCard: {
        backgroundColor: COLORS.background,
        borderRadius: 14,
        padding: SPACING['14'],
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    breakupRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    breakupLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    breakupLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    breakupValue: { fontSize: 15, fontWeight: '800', color: COLORS.text },
    strikeText: {
        fontSize: 11,
        color: COLORS.textTertiary,
        textDecorationLine: 'line-through',
        fontWeight: '500',
    },
    breakupDivider: { height: 1, backgroundColor: COLORS.borderLight },
    totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    totalValue: { fontSize: 20, fontWeight: '900', color: COLORS.primary },

    footer: {
        padding: SPACING['16'],
        paddingBottom: SPACING['20'],
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
    submitBtnSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 3 },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successBox: {
        width: '82%',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
    },
    successTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginTop: 16 },
    successSub: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 10,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default ESportsRegistrationScreen;
