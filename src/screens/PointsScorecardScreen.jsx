import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Trophy, Zap, Target, Circle } from 'lucide-react-native';
import { getPointsScorecard } from '../services/pointsScoringService';
import { COLORS, SPACING, FONTS } from '../theme';

const PointsScorecardScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { fixtureId } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [scoreData, setScoreData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScorecard = async () => {
            if (!fixtureId) {
                setError('No fixture ID provided.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await getPointsScorecard(fixtureId);
                if (res.status === 'success') {
                    setScoreData(res.data);
                } else {
                    setError('Failed to fetch scorecard.');
                }
            } catch (err) {
                setError(err.message || 'Error occurred while fetching scorecard');
            } finally {
                setLoading(false);
            }
        };

        fetchScorecard();
    }, [fixtureId]);

    const getPointIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'smash':
                return <Zap size={16} color={COLORS.primary} />;
            case 'drop':
                return <Target size={16} color={COLORS.secondary} />;
            default:
                return <Circle size={12} color={COLORS.textTertiary} fill={COLORS.textTertiary} />;
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading Scorecard...</Text>
            </SafeAreaView>
        );
    }

    if (error || !scoreData) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.errorText}>{error || 'Scorecard data is unavailable.'}</Text>
            </SafeAreaView>
        );
    }

    const { matchDetails, scoreSummary, sets } = scoreData;

    let displayTeam1Sets = scoreSummary?.team1SetsWon || 0;
    let displayTeam2Sets = scoreSummary?.team2SetsWon || 0;

    // Fallback if backend doesn't properly tally the single set to 1
    if (matchDetails?.status === 'completed' && matchDetails?.winnerId && displayTeam1Sets === 0 && displayTeam2Sets === 0) {
        displayTeam1Sets = matchDetails.winnerId === matchDetails.team1?.id ? 1 : 0;
        displayTeam2Sets = matchDetails.winnerId === matchDetails.team2?.id ? 1 : 0;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scorecard</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Match Overview Card */}
                <View style={styles.overviewCard}>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{matchDetails.status.toUpperCase()}</Text>
                    </View>

                    <View style={styles.teamsRow}>
                        <View style={styles.teamBadge}>
                            <Text style={styles.teamName} numberOfLines={2}>{matchDetails.team1.name}</Text>
                            {matchDetails.winnerId === matchDetails.team1.id && <Trophy size={16} color="#F59E0B" style={styles.trophyIcon} />}
                        </View>
                        <View style={styles.vsContainer}>
                            <Text style={styles.vsText}>VS</Text>
                        </View>
                        <View style={styles.teamBadge}>
                            <Text style={styles.teamName} numberOfLines={2}>{matchDetails.team2.name}</Text>
                            {matchDetails.winnerId === matchDetails.team2.id && <Trophy size={16} color="#F59E0B" style={styles.trophyIcon} />}
                        </View>
                    </View>

                    <View style={styles.setsSummary}>
                        <Text style={styles.setsSummaryLabel}>Sets Won</Text>
                        <Text style={styles.setsSummaryScore}>
                            {displayTeam1Sets} - {displayTeam2Sets}
                        </Text>
                    </View>
                </View>

                {/* Score History List */}
                <View style={styles.historyContainer}>
                    <Text style={styles.historyTitle}>Set Breakdown</Text>
                    
                    {sets && sets.length > 0 ? sets.map((set, index) => (
                        <View key={index} style={styles.setCard}>
                            <View style={styles.setHeader}>
                                <Text style={styles.setNumberText}>Set {set.setNumber}</Text>
                                <View style={styles.setScorePill}>
                                    <Text style={styles.setScoreText}>{set.team1Score} - {set.team2Score}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.pointHistoryList}>
                                {set.pointHistory && set.pointHistory.length > 0 ? set.pointHistory.map((point, pIndex) => {
                                    const isTeam1 = point.teamId === matchDetails.team1.id;
                                    const pointThemeColor = isTeam1 ? COLORS.primary : COLORS.secondary;
                                    
                                    return (
                                        <View key={point.id || pIndex} style={styles.pointItem}>
                                            <View style={styles.sequenceBubble}>
                                                <Text style={styles.sequenceText}>{point.sequence}</Text>
                                            </View>
                                            
                                            <View style={styles.pointDetails}>
                                                <Text style={styles.pointPlayerName}>
                                                    {point.playerName} 
                                                </Text>
                                                <Text style={[styles.pointTeamName, { color: pointThemeColor }]}>
                                                    scored for {isTeam1 ? matchDetails.team1.name : matchDetails.team2.name}
                                                </Text>
                                            </View>
                                            
                                            <View style={styles.pointTypeBadge}>
                                                {getPointIcon(point.pointType)}
                                                <Text style={styles.pointTypeText}>{point.pointType}</Text>
                                            </View>
                                        </View>
                                    );
                                }) : (
                                    <Text style={styles.noPointsText}>No points recorded for this set.</Text>
                                )}
                            </View>
                        </View>
                    )) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateText}>No sets have been played yet.</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING['16'],
    },
    errorText: {
        marginTop: SPACING['20'],
        color: COLORS.error,
        fontSize: 16,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['16'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        elevation: 2,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING['16'],
        paddingBottom: SPACING['32'],
    },
    overviewCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING['20'],
        alignItems: 'center',
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: SPACING['24'],
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    statusBadge: {
        backgroundColor: COLORS.success + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: SPACING['16'],
    },
    statusText: {
        color: COLORS.success,
        fontSize: 12,
        fontWeight: '800',
    },
    teamsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: SPACING['20'],
    },
    teamBadge: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    teamName: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
    },
    trophyIcon: {
        marginTop: 4,
    },
    vsContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.gray50,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: SPACING['12'],
    },
    vsText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textTertiary,
    },
    setsSummary: {
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingVertical: SPACING['12'],
        paddingHorizontal: SPACING['32'],
        borderRadius: 16,
    },
    setsSummaryLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
    },
    setsSummaryScore: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.primary,
    },
    historyContainer: {
        width: '100%',
    },
    historyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING['16'],
    },
    setCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        marginBottom: SPACING['16'],
        overflow: 'hidden',
    },
    setHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        backgroundColor: COLORS.gray50,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    setNumberText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    setScorePill: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    setScoreText: {
        color: COLORS.white,
        fontWeight: '800',
        fontSize: 14,
    },
    pointHistoryList: {
        padding: SPACING['16'],
    },
    pointItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING['16'],
    },
    sequenceBubble: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING['12'],
    },
    sequenceText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    pointDetails: {
        flex: 1,
    },
    pointPlayerName: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.text,
    },
    pointTeamName: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    pointTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    pointTypeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    noPointsText: {
        fontSize: 14,
        color: COLORS.textTertiary,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: SPACING['12'],
    },
    emptyStateContainer: {
        paddingVertical: SPACING['32'],
        alignItems: 'center',
    },
    emptyStateText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PointsScorecardScreen;
