import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Play, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import { fetchFixtures } from '../redux/slices/tournamentSlice';

const MatchesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { tournamentId, categoryId, roundId, roundName, categoryName } = route.params;

    const { fixtures, fixturesLoading } = useSelector((state) => state.tournament);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchFixtures({ tournamentId, categoryId, roundId }));
        }, [dispatch, tournamentId, categoryId, roundId])
    );

    const renderFixtureItem = ({ item }) => (
        <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
                <View style={styles.matchNoContainer}>
                    <Text style={styles.matchNoText}>MATCH {item.matchNo}</Text>
                </View>
                <View style={[
                    styles.statusBadge, 
                    item.status === 'completed' ? styles.statusCompleted : styles.statusScheduled
                ]}>
                    <Text style={[
                        styles.statusText,
                        item.status === 'completed' ? styles.statusTextCompleted : styles.statusTextScheduled
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.teamsContainer}>
                {/* Team A */}
                <View style={[styles.teamWrapper, item.winnerId === item.teamA && styles.winnerWrapper]}>
                    <View style={styles.teamInfo}>
                        <Text style={styles.teamName} numberOfLines={1}>{item.teamAObj?.name || 'TBD'}</Text>
                        {item.teamAObj?.isVerified && (
                            <CheckCircle2 size={14} color={COLORS.primary} style={styles.verifiedIcon} />
                        )}
                    </View>
                    {item.winnerId === item.teamA && (
                        <View style={styles.winnerBadge}>
                            <Text style={styles.winnerBadgeText}>WINNER</Text>
                        </View>
                    )}
                </View>

                <View style={styles.vsContainer}>
                    <View style={styles.vsCircle}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>
                </View>

                {/* Team B */}
                <View style={[styles.teamWrapper, item.winnerId === item.teamB && styles.winnerWrapper]}>
                    <View style={styles.teamInfo}>
                        <Text style={styles.teamName} numberOfLines={1}>{item.teamBObj?.name || 'TBD'}</Text>
                        {item.teamBObj?.isVerified && (
                            <CheckCircle2 size={14} color={COLORS.primary} style={styles.verifiedIcon} />
                        )}
                    </View>
                    {item.winnerId === item.teamB && (
                        <View style={styles.winnerBadge}>
                            <Text style={styles.winnerBadgeText}>WINNER</Text>
                        </View>
                    )}
                </View>
            </View>

            {item.isBye && (
                <View style={styles.byeContainer}>
                    <AlertCircle size={14} color={COLORS.textTertiary} />
                    <Text style={styles.byeText}>This is a BYE match. Team A advances automatically.</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Matches</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{roundName} • {categoryName}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {fixturesLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : fixtures && fixtures.length > 0 ? (
                <FlatList
                    data={fixtures}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFixtureItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Play size={48} color={COLORS.primary} opacity={0.5} />
                    </View>
                    <Text style={styles.emptyTitle}>No Matches Found</Text>
                    <Text style={styles.emptySubtitle}>
                        Matches have not been generated for this round yet.
                    </Text>
                </View>
            )}
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
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: 10,
    },
    backIcon: {
        padding: 4,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    listContent: {
        padding: SPACING['16'],
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    matchCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING['16'],
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    matchNoContainer: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    matchNoText: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.textTertiary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusScheduled: {
        backgroundColor: COLORS.primary + '15',
    },
    statusCompleted: {
        backgroundColor: '#DCFCE7',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    statusTextScheduled: {
        color: COLORS.primary,
    },
    statusTextCompleted: {
        color: '#15803D',
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    teamWrapper: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
        minHeight: 100,
        justifyContent: 'center',
    },
    winnerWrapper: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '05',
    },
    teamInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    teamName: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
    },
    verifiedIcon: {
        marginTop: 2,
    },
    winnerBadge: {
        marginTop: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    winnerBadgeText: {
        color: COLORS.white,
        fontSize: 9,
        fontWeight: '900',
    },
    vsContainer: {
        width: 40,
        alignItems: 'center',
        zIndex: 1,
    },
    vsCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    vsText: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.textTertiary,
    },
    byeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        backgroundColor: COLORS.background,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        borderStyle: 'dashed',
    },
    byeText: {
        fontSize: 11,
        color: COLORS.textTertiary,
        flex: 1,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default MatchesScreen;
