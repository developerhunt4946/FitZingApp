import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../theme';
import {
    ArrowLeft,
    Calendar,
    Trophy,
    Info,
    Users,
    Award,
    DollarSign,
    Zap,
    Percent,
    AlignLeft,
} from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import SCREEN_NAMES from '../constants/screenNames';
import { fetchESportsTournamentById } from '../redux/slices/tournamentSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ESportsTournamentDetailsScreen = ({ route }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { tournamentId } = route.params;

    const { eSportsTournaments, selectedESportsTournament, eSportsLoading } = useSelector(
        (state) => state.tournament
    );

    // Try to find in list first, fall back to selectedESportsTournament
    const tournament =
        eSportsTournaments?.find((t) => t.id === tournamentId) ||
        (selectedESportsTournament?.id === tournamentId ? selectedESportsTournament : null);

    React.useEffect(() => {
        if (!tournament) {
            dispatch(fetchESportsTournamentById(tournamentId));
        }
    }, [tournamentId]);

    const formatFullDate = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (eSportsLoading || !tournament) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>
                        {eSportsLoading ? 'Loading...' : 'Tournament not found.'}
                    </Text>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.canGoBack()
                                ? navigation.goBack()
                                : navigation.navigate('MainTabs')
                        }
                        style={styles.backBtn}
                    >
                        <Text style={styles.backBtnText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const hasDiscount = Number(tournament.discount) > 0;
    const entryFeePerTeam = Number(tournament.entryFeePerTeam) || 0;
    const entryFeePerPlayer = Number(tournament.entryFeePerPlayer) || 0;
    const discountedFee = hasDiscount
        ? entryFeePerTeam * (1 - Number(tournament.discount) / 100)
        : entryFeePerTeam;
    const discountedFeePerPlayer = hasDiscount
        ? entryFeePerPlayer * (1 - Number(tournament.discount) / 100)
        : entryFeePerPlayer;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Banner */}
                <View style={[styles.bannerContainer, { height: 280 + insets.top }]}>
                    <Image
                        source={{ uri: tournament.imageURL }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                    <View style={styles.bannerOverlay} />

                    {/* eSports Pill */}
                    <View style={[styles.eSportsPill, { bottom: 20 }]}>
                        <Award size={12} color={COLORS.white} />
                        <Text style={styles.eSportsPillText}>eSPORTS</Text>
                    </View>

                    {/* Back button */}
                    <SafeAreaView edges={['top']} style={styles.headerRow}>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.canGoBack()
                                    ? navigation.goBack()
                                    : navigation.navigate('MainTabs')
                            }
                            style={styles.iconBtn}
                        >
                            <ArrowLeft size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Badges */}
                    <View style={styles.badgeRow}>
                        <View style={[styles.statusBadge, { backgroundColor: COLORS.primary + '20' }]}>
                            <Text style={[styles.statusText, { color: COLORS.primary }]}>
                                {tournament.status?.toUpperCase()}
                            </Text>
                        </View>
                        <View style={[styles.formatBadge, { backgroundColor: COLORS.secondary + '20' }]}>
                            <Trophy size={14} color={COLORS.secondary} />
                            <Text style={[styles.formatText, { color: COLORS.secondary }]}>
                                {tournament.categoryName?.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{tournament.name}</Text>

                    {/* Event date row */}
                    <View style={styles.locationRow}>
                        <View style={styles.locationIcon}>
                            <Calendar size={18} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.locationLabel}>Event Date</Text>
                            <Text style={styles.locationValue}>{formatFullDate(tournament.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Stats Grid */}
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Users size={20} color={COLORS.primary} />
                            <View>
                                <Text style={styles.gridLabel}>Teams</Text>
                                <Text style={styles.gridValue}>
                                    {tournament.minimumTeams}–{tournament.maximumTeams}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <Zap size={20} color={COLORS.accent} />
                            <View>
                                <Text style={styles.gridLabel}>Players / Team</Text>
                                <Text style={styles.gridValue}>{tournament.playersPerTeams}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Award size={20} color={COLORS.secondary} />
                            <View>
                                <Text style={styles.gridLabel}>Prize Pool</Text>
                                <Text style={styles.gridValue}>
                                    ₹{Number(tournament.prizePool).toLocaleString('en-IN')}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <AlignLeft size={20} color={COLORS.primary} />
                            <View>
                                <Text style={styles.gridLabel}>Rounds</Text>
                                <Text style={styles.gridValue}>{tournament.noOfRounds}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Entry Fees */}
                    <View style={styles.sectionHeader}>
                        <DollarSign size={18} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Entry Fees</Text>
                    </View>

                    <View style={styles.feesCard}>
                        <View style={styles.feeRow}>
                            <Text style={styles.feeLabel}>Per Team</Text>
                            {hasDiscount ? (
                                <View style={styles.priceRow}>
                                    <Text style={styles.originalPrice}>₹{entryFeePerTeam.toFixed(2)}</Text>
                                    <Text style={styles.feeValue}>₹{discountedFee.toFixed(2)}</Text>
                                </View>
                            ) : (
                                <Text style={styles.feeValue}>₹{entryFeePerTeam.toFixed(2)}</Text>
                            )}
                        </View>
                        <View style={[styles.feeRow, { borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 12, marginTop: 4 }]}>
                            <Text style={styles.feeLabel}>Per Player</Text>
                            {hasDiscount ? (
                                <View style={styles.priceRow}>
                                    <Text style={styles.originalPrice}>₹{Number(tournament.entryFeePerPlayer).toFixed(2)}</Text>
                                    <Text style={styles.feeValue}>₹{discountedFeePerPlayer.toFixed(2)}</Text>
                                </View>
                            ) : (
                                <Text style={styles.feeValue}>₹{Number(tournament.entryFeePerPlayer).toFixed(2)}</Text>
                            )}
                        </View>
                        {hasDiscount && (
                            <View style={styles.discountRow}>
                                <Percent size={13} color={COLORS.success || '#22C55E'} />
                                <Text style={[styles.feeLabel, { color: COLORS.success || '#22C55E' }]}>
                                    {tournament.discount}% discount applied
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    {!!tournament.description && (
                        <>
                            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                                <Info size={18} color={COLORS.primary} />
                                <Text style={styles.sectionTitle}>About</Text>
                            </View>
                            <Text style={styles.description}>{tournament.description}</Text>
                        </>
                    )}

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Fixed Bottom Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.footerBtn, styles.primaryBtn]}
                    onPress={() => navigation.navigate(SCREEN_NAMES.ESPORTS_REGISTRATION, { tournament })}
                >
                    <Text style={styles.primaryBtnText}>Register Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { flexGrow: 1 },
    bannerContainer: { width: '100%', overflow: 'hidden' },
    bannerImage: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    eSportsPill: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    eSportsPillText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    headerRow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['16'],
        paddingTop: SPACING['12'],
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentCard: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: SPACING['20'],
        paddingTop: SPACING['24'],
    },
    badgeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '700' },
    formatBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    formatText: { fontSize: 10, fontWeight: '700' },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
        lineHeight: 32,
        marginBottom: 20,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    locationIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationLabel: { fontSize: 12, color: COLORS.textTertiary, fontWeight: '500' },
    locationValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
    divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 16 },
    grid: { flexDirection: 'row', justifyContent: 'space-between' },
    gridItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    gridLabel: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '500' },
    gridValue: { fontSize: 13, color: COLORS.text, fontWeight: '700' },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    feesCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        marginBottom: 8,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    feeLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    feeValue: { fontSize: 15, color: COLORS.text, fontWeight: '800' },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    originalPrice: {
        fontSize: 12,
        color: COLORS.textTertiary,
        textDecorationLine: 'line-through',
        fontWeight: '500',
    },
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 22,
        marginBottom: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        padding: SPACING['16'],
        paddingBottom: SPACING['24'],
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    footerBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtn: { backgroundColor: COLORS.primary },
    primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 20 },
    backBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    backBtnText: { color: COLORS.white, fontWeight: '700' },
});

export default ESportsTournamentDetailsScreen;
