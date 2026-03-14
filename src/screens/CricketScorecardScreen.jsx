import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, X, Trophy, AlertCircle } from 'lucide-react-native';
import cricketScoringService from '../services/cricketScoringService';
import { COLORS, SPACING } from '../theme';

const CricketScorecardScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { fixtureId } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [scoreboard, setScoreboard] = useState(null);
    const [scorecardTab, setScorecardTab] = useState(1);

    useEffect(() => {
        fetchScoreboard();
    }, [fixtureId]);

    const fetchScoreboard = async () => {
        try {
            setIsLoading(true);
            const [fixtureRes, scoreboardRes] = await Promise.all([
                cricketScoringService.getFixtureDetails(fixtureId),
                cricketScoringService.getScoreboard(fixtureId)
            ]);

            let scoreboardData = null;
            let fixtureData = null;

            if (fixtureRes.status === 'success' && fixtureRes.data) {
                fixtureData = fixtureRes.data.fixture;
            }

            if (scoreboardRes.status === 'success' && scoreboardRes.data) {
                const { innings } = scoreboardRes.data;
                const processedInnings = innings.map(inn => {
                    const extrasCount = { wide: 0, noBall: 0, bye: 0, legBye: 0 };
                    if (inn.recentBalls) {
                        inn.recentBalls.forEach(b => {
                            if (b.extraType === 'wide') extrasCount.wide += (b.extras || 1);
                            else if (b.extraType === 'no-ball') extrasCount.noBall += (b.extras || 1);
                            else if (b.extraType === 'bye') extrasCount.bye += (b.extras || 1);
                            else if (b.extraType === 'leg-bye') extrasCount.legBye += (b.extras || 1);
                        });
                    }
                    return { ...inn, extras: extrasCount };
                });
                scoreboardData = { ...scoreboardRes.data, innings: processedInnings };

                if (processedInnings.length >= 2) {
                    setScorecardTab(2);
                }
            }

            setScoreboard({ ...scoreboardData, fixture: fixtureData });
        } catch (error) {
            console.error('Error fetching scoreboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMatchResult = () => {
        if (!scoreboard || !scoreboard.fixture) return null;
        const { fixture, innings } = scoreboard;

        if (fixture.status?.toLowerCase() !== 'completed') return "Match In Progress";

        if (fixture.winnerId) {
            const winnerTeam = fixture.winnerId === fixture.teamA ? fixture.teamAObj : fixture.teamBObj;
            const loserTeam = fixture.winnerId === fixture.teamA ? fixture.teamBObj : fixture.teamAObj;

            // Try to construct winning margin if innings data exist
            if (innings && innings.length >= 2) {
                const inn1 = innings[0];
                const inn2 = innings[1];

                const [runs1, wkts1] = inn1.score?.split('/').map(n => parseInt(n)) || [0, 0];
                const [runs2, wkts2] = inn2.score?.split('/').map(n => parseInt(n)) || [0, 0];

                const batFirstTeamId = fixture.battingTeamId;
                const isWinnerBatFirst = fixture.winnerId === batFirstTeamId;

                if (isWinnerBatFirst) {
                    // Won by runs
                    const margin = runs1 - runs2;
                    return `${winnerTeam?.name || 'Winner'} won by ${margin} runs`;
                } else {
                    // Won by wickets
                    const maxPlayers = fixture.category?.maxPlayers || 11;
                    const margin = maxPlayers - 1 - wkts2;
                    return `${winnerTeam?.name || 'Winner'} won by ${margin} wickets`;
                }
            }

            return `${winnerTeam?.name || 'Winner'} won the match`;
        }

        return "Match Compiled / Result Pending";
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} translucent={true} />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading Scorecard...</Text>
                </View>
            </View>
        );
    }

    if (!scoreboard) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} translucent={true} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.scorecardTitle}>Match Scorecard</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Failed to load scorecard.</Text>
                </View>
            </View>
        );
    }

    const { fixture, innings } = scoreboard;
    const currentInning = innings.find(inn => inn.inningsNo === scorecardTab);
    const matchResult = getMatchResult();

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} translucent={true} />

            <View style={styles.scorecardHeader}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.scorecardTitle} numberOfLines={1}>Match Scorecard</Text>
                        <Text style={styles.scorecardSubtitle} numberOfLines={1}>{fixture?.teamAObj?.name} vs {fixture?.teamBObj?.name}</Text>
                    </View>
                </View>
            </View>

            {/* Match Result Banner */}
            {matchResult && (
                <View style={styles.resultBanner}>
                    <Trophy size={18} color={COLORS.primary} />
                    <Text style={styles.resultText}>{matchResult}</Text>
                </View>
            )}

            {/* Innings Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, scorecardTab === 1 && styles.activeTab]}
                    onPress={() => setScorecardTab(1)}
                >
                    <Text style={[styles.tabText, scorecardTab === 1 && styles.activeTabText]}>Innings 1</Text>
                </TouchableOpacity>
                {innings.length >= 2 && (
                    <TouchableOpacity
                        style={[styles.tab, scorecardTab === 2 && styles.activeTab]}
                        onPress={() => setScorecardTab(2)}
                    >
                        <Text style={[styles.tabText, scorecardTab === 2 && styles.activeTabText]}>Innings 2</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {currentInning ? (
                    <>
                        {/* Batting Section */}
                        <View style={styles.scorecardSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>BATTING - {currentInning.battingTeam?.name}</Text>
                            </View>

                            <View style={styles.statsTableHeader}>
                                <Text style={[styles.colName, { flex: 4 }]}>Batter</Text>
                                <Text style={styles.colRuns}>R</Text>
                                <Text style={styles.colStats}>B</Text>
                                <Text style={styles.colStats}>4s</Text>
                                <Text style={styles.colStats}>6s</Text>
                                <Text style={styles.colSR}>SR</Text>
                            </View>

                            {currentInning.batting?.map((p) => (
                                <View key={p.player.id} style={styles.statsTableRow}>
                                    <View style={{ flex: 4 }}>
                                        <Text style={styles.batterNameModern} numberOfLines={1}>
                                            {p.player.firstName} {p.player.lastName}
                                        </Text>
                                        <Text style={[styles.statusBadge, p.dismissal !== 'Not Out' ? styles.outBadge : styles.notOutBadge]}>
                                            {p.dismissal === 'Not Out' ? 'not out' : 'out'}
                                        </Text>
                                    </View>
                                    <Text style={styles.colRuns}>{p.runs}</Text>
                                    <Text style={styles.colStats}>{p.ballsFaced}</Text>
                                    <Text style={styles.colStats}>{p.fours}</Text>
                                    <Text style={styles.colStats}>{p.sixes}</Text>
                                    <Text style={styles.colSR}>{p.ballsFaced > 0 ? ((p.runs / p.ballsFaced) * 100).toFixed(1) : '0.0'}</Text>
                                </View>
                            ))}

                            {/* Extras Breakdown */}
                            {(() => {
                                const ex = currentInning.extras || { wide: 0, noBall: 0, bye: 0, legBye: 0 };
                                const totalEx = (ex.wide || 0) + (ex.noBall || 0) + (ex.bye || 0) + (ex.legBye || 0);
                                if (totalEx === 0) return null;
                                return (
                                    <View style={styles.extrasRow}>
                                        <View>
                                            <Text style={styles.extrasLabel}>EXTRAS</Text>
                                            <View style={styles.extrasDetailList}>
                                                {ex.wide > 0 && <View style={styles.extraChip}><Text style={styles.extraChipText}>wd {ex.wide}</Text></View>}
                                                {ex.noBall > 0 && <View style={styles.extraChip}><Text style={styles.extraChipText}>NB {ex.noBall}</Text></View>}
                                                {ex.bye > 0 && <View style={styles.extraChip}><Text style={styles.extraChipText}>B {ex.bye}</Text></View>}
                                                {ex.legBye > 0 && <View style={styles.extraChip}><Text style={styles.extraChipText}>Lb {ex.legBye}</Text></View>}
                                            </View>
                                        </View>
                                        <Text style={styles.extrasValue}>{totalEx}</Text>
                                    </View>
                                );
                            })()}

                            {/* Total Row */}
                            <View style={styles.totalRowModern}>
                                <Text style={styles.totalLabel}>TOTAL</Text>
                                <Text style={styles.totalValue}>
                                    {currentInning.score}
                                </Text>
                            </View>
                        </View>

                        {/* Bowling Section */}
                        <View style={styles.scorecardSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>BOWLING - {currentInning.bowlingTeam?.name}</Text>
                            </View>
                            <View style={styles.statsTableHeader}>
                                <Text style={[styles.colName, { flex: 4 }]}>Bowler</Text>
                                <Text style={styles.colStats}>O</Text>
                                <Text style={styles.colStats}>M</Text>
                                <Text style={styles.colStats}>R</Text>
                                <Text style={styles.colStats}>W</Text>
                                <Text style={styles.colSR}>Econ</Text>
                            </View>
                            {currentInning.bowling?.map((p) => (
                                <View key={p.player.id} style={styles.statsTableRow}>
                                    <View style={{ flex: 4 }}>
                                        <Text style={styles.batterNameModern} numberOfLines={1}>
                                            {p.player.firstName} {p.player.lastName}
                                        </Text>
                                    </View>
                                    <Text style={styles.colStats}>{Math.floor(p.legalBalls / 6)}.{p.legalBalls % 6}</Text>
                                    <Text style={styles.colStats}>{p.maidens || 0}</Text>
                                    <Text style={styles.colStats}>{p.runsConceded}</Text>
                                    <Text style={styles.colStats}>{p.wickets}</Text>
                                    <Text style={styles.colSR}>
                                        {p.legalBalls > 0 ? ((p.runsConceded / p.legalBalls) * 6).toFixed(2) : '0.00'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </>
                ) : (
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>Innings data not available yet.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 10, color: COLORS.textSecondary, fontWeight: '600' },
    errorText: { color: COLORS.error, fontWeight: '600' },
    emptyText: { color: COLORS.textTertiary, fontStyle: 'italic' },
    scorecardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        elevation: 2,
    },
    backIcon: { padding: 4 },
    scorecardTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    scorecardSubtitle: { fontSize: 11, fontWeight: '600', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
    tabContainer: {
        flexDirection: 'row',
        padding: 15,
        gap: 12,
        backgroundColor: COLORS.surface
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tabText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
    activeTabText: { color: COLORS.white },
    scorecardSection: {
        margin: 15,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 4,
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
    statsTableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: COLORS.background + '50',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    statsTableRow: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight + '50',
        alignItems: 'center'
    },
    colName: { fontSize: 11, fontWeight: '700', color: COLORS.textTertiary, textTransform: 'uppercase' },
    colRuns: { width: 40, fontSize: 15, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
    colStats: { width: 35, fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center' },
    colSR: { width: 55, fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
    batterNameModern: { fontSize: 15, fontWeight: '700', color: COLORS.text },
    statusBadge: {
        fontSize: 9,
        fontWeight: '800',
        color: COLORS.white,
        backgroundColor: COLORS.textTertiary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 4,
        textTransform: 'uppercase'
    },
    outBadge: { backgroundColor: COLORS.error + '20', color: COLORS.error },
    notOutBadge: { backgroundColor: COLORS.success + '20', color: COLORS.success },
    extrasRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: COLORS.background + '30',
    },
    extrasLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
    extrasValue: { fontSize: 15, fontWeight: '800', color: COLORS.text },
    extrasDetailList: { flexDirection: 'row', gap: 8, marginTop: 4 },
    extraChip: {
        backgroundColor: COLORS.warning + '15',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.warning + '30',
    },
    extraChipText: { fontSize: 10, fontWeight: '700', color: COLORS.warning },
    totalRowModern: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.primary + '10',
    },
    totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
    totalValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
    resultBanner: {
        backgroundColor: COLORS.primary + '10',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary + '20',
    },
    resultText: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.primary,
        textAlign: 'center',
    },
    headerIcon: { padding: 8 },
});

export default CricketScorecardScreen;
