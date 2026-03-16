import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Trophy } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import { getPointsTable } from '../services/tournamentServices';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Precise Column widths for absolute alignment
const RANK_W = 35;
const TEAM_W = SCREEN_WIDTH * 0.38;
const STAT_W = 30;
const PTS_W = 35;
const NRR_W = 65;

const LeaderboardScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { tournamentId, categoryId, categoryName } = route.params;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [error, setError] = useState(null);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const response = await getPointsTable(tournamentId, categoryId);
            if (response.status === 'success') {
                setLeaderboardData(response.data);
            } else {
                setError(response.message || 'Failed to load leaderboard');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [tournamentId, categoryId]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaderboard();
    };

    const renderFormBadge = (result, index) => {
        const color = result === 'W' ? COLORS.success : result === 'L' ? COLORS.error : COLORS.warning;
        return (
            <View key={index} style={[styles.formBadge, { backgroundColor: color }]}>
                <Text style={styles.formText}>{result}</Text>
            </View>
        );
    };

    const renderItem = ({ item, index }) => {
        const rank = index + 1;
        const isTop3 = rank <= 3;

        return (
            <View style={[styles.row, isTop3 && styles.highlightRow]}>
                {/* Rank Column */}
                <View style={[styles.col, { width: RANK_W }]}>
                    <Text style={[styles.cellText, isTop3 && styles.rankHighlight]}>{rank}</Text>
                </View>

                {/* Team & Form Column */}
                <View style={[styles.col, { width: TEAM_W, alignItems: 'flex-start', paddingLeft: 4 }]}>
                    <Text style={styles.teamNameText} numberOfLines={1}>{item.teamName}</Text>
                    <View style={styles.formWrapper}>
                        {item.last4Matches?.map((res, idx) => renderFormBadge(res, idx))}
                    </View>
                </View>

                {/* Combined Stats columns */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCol, { width: STAT_W }]}>
                        <Text style={styles.statText}>{item.playedMatches}</Text>
                    </View>
                    <View style={[styles.statCol, { width: STAT_W }]}>
                        <Text style={styles.statText}>{item.wins}</Text>
                    </View>
                    <View style={[styles.statCol, { width: STAT_W }]}>
                        <Text style={styles.statText}>{item.losses}</Text>
                    </View>
                    
                    {/* Points - Slightly emphasized */}
                    <View style={[styles.statCol, { width: PTS_W }]}>
                        <Text style={styles.ptsText}>{item.points}</Text>
                    </View>
                </View>

                {/* NRR Column */}
                <View style={[styles.col, { width: NRR_W, alignItems: 'flex-end' }]}>
                    <Text style={[styles.nrrText, item.nrr >= 0 ? styles.posNrr : styles.negNrr]}>
                        {item.nrr >= 0 ? '+' : ''}{item.nrr.toFixed(3)}
                    </Text>
                </View>
            </View>
        );
    };

    const Header = () => (
        <View style={styles.tableHeader}>
            <View style={[styles.col, { width: RANK_W }]}>
                <Text style={styles.headerLabel}>#</Text>
            </View>
            <View style={[styles.col, { width: TEAM_W, alignItems: 'flex-start', paddingLeft: 4 }]}>
                <Text style={styles.headerLabel}>TEAM</Text>
            </View>
            <View style={styles.statsRow}>
                <View style={[styles.statCol, { width: STAT_W }]}><Text style={styles.headerLabel}>P</Text></View>
                <View style={[styles.statCol, { width: STAT_W }]}><Text style={styles.headerLabel}>W</Text></View>
                <View style={[styles.statCol, { width: STAT_W }]}><Text style={styles.headerLabel}>L</Text></View>
                <View style={[styles.statCol, { width: PTS_W }]}><Text style={[styles.headerLabel, { color: COLORS.primary }]}>PTS</Text></View>
            </View>
            <View style={[styles.col, { width: NRR_W, alignItems: 'flex-end' }]}>
                <Text style={styles.headerLabel}>NRR</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{STRINGS.LEADERBOARD}</Text>
                    <Text style={styles.subtitle}>{categoryName}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : error ? (
                <View style={styles.errorWrap}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={leaderboardData}
                    keyExtractor={(item) => item.teamId}
                    renderItem={renderItem}
                    ListHeaderComponent={Header}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyView}>
                            <Trophy size={48} color={COLORS.textTertiary} opacity={0.2} />
                            <Text style={styles.emptyText}>Points table for this category will be available soon.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.surface,
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    backButton: {
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 11,
        color: COLORS.textTertiary,
        marginTop: 1,
        fontWeight: '500',
    },
    listContainer: {
        paddingBottom: 40,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        alignItems: 'center',
    },
    headerLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textTertiary,
        letterSpacing: 0.2,
    },
    row: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        alignItems: 'center',
    },
    highlightRow: {
        backgroundColor: '#FCFCFC',
    },
    col: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    rankHighlight: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    teamNameText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    formWrapper: {
        flexDirection: 'row',
        gap: 3,
    },
    formBadge: {
        width: 14,
        height: 14,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    formText: {
        fontSize: 8,
        fontWeight: '900',
        color: COLORS.white,
    },
    statsRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statCol: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    ptsText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.text,
    },
    nrrText: {
        fontSize: 12,
        fontWeight: '600',
    },
    posNrr: { color: COLORS.success },
    negNrr: { color: COLORS.error },
    loaderWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 14,
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: 16,
    },
    emptyView: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 20,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    retryText: {
        color: COLORS.white,
        fontWeight: '600'
    }
});

export default LeaderboardScreen;
