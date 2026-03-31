import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    ScrollView,
    TextInput,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Play, CheckCircle2, AlertCircle, Trophy, Zap, Search, X, LayoutList } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import {
    fetchFixtures,
    fetchRegisteredTeams,
    fetchTournamentFixtures
} from '../redux/slices/tournamentSlice';
import SCREEN_NAMES from '../constants/screenNames';
import cricketScoringService from '../services/cricketScoringService';
import { AppAlert } from '../components';

const MatchesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { tournamentId, categoryId, roundId, roundName, categoryName } = route.params;

    const { fixtures, fixturesLoading, tournaments } = useSelector((state) => state.tournament);
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'admin' || user?.userRole === 'admin';
    const [searchQuery, setSearchQuery] = useState('');

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

    const fetchData = useCallback(async () => {
        if (tournamentId && categoryId && roundId) {
            dispatch(fetchFixtures({ tournamentId, categoryId, roundId }));
        } else if (tournamentId) {
            dispatch(fetchTournamentFixtures(tournamentId));
        }
    }, [dispatch, tournamentId, categoryId, roundId]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const onRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const filteredFixtures = useMemo(() => {
        if (!fixtures) return [];
        if (!searchQuery.trim()) return fixtures;

        const query = searchQuery.toLowerCase();
        return fixtures.filter(item => {
            const teamAName = item.teamAObj?.name?.toLowerCase() || '';
            const teamBName = item.teamBObj?.name?.toLowerCase() || '';
            const status = item.status?.toLowerCase() || '';
            return teamAName.includes(query) || teamBName.includes(query) || status.includes(query);
        });
    }, [fixtures, searchQuery]);

    const handleStartMatch = async (item) => {
        console.log('Starting match for fixture:', item.id, 'Category:', categoryName);

        // Find tournament to check sport name
        const tournament = tournaments.find(t => t.id === tournamentId);
        const sportName = tournament?.sports?.name || '';
        const sportNameLower = sportName.toLowerCase();
        const isCricket = sportNameLower.includes('cricket');
        const isRacketSport = ['volleyball', 'tennis', 'badminton'].some(sport => sportNameLower.includes(sport));

        if (isCricket) {
            const currentStatus = item.status?.toLowerCase() || 'scheduled';

            // If already in progress, navigate directly
            if (currentStatus === 'inprogress') {
                if (item.tossWinnerId) {
                    navigation.navigate(SCREEN_NAMES.CRICKET_SCORING, {
                        fixtureId: item.id,
                        teamA: item.teamA,
                        teamB: item.teamB,
                        teamAObj: item.teamAObj,
                        teamBObj: item.teamBObj,
                        tossData: {
                            tossWinnerId: item.tossWinnerId,
                            tossDecision: item.tossDecision,
                            battingTeamId: item.battingTeamId,
                            bowlingTeamId: item.bowlingTeamId
                        }
                    });
                } else {
                    navigation.navigate(SCREEN_NAMES.TOSS, {
                        fixtureId: item.id,
                        teamA: item.teamA,
                        teamB: item.teamB,
                        teamAObj: item.teamAObj,
                        teamBObj: item.teamBObj,
                    });
                }
                return;
            }

            // If scheduled or NotStarted, call API
            if (currentStatus === 'scheduled' || currentStatus === 'notstarted') {
                try {
                    await cricketScoringService.updateMatchStatus(item.id, 'inProgress');

                    // Show success alert and navigate on confirm
                    showAlert(
                        'Success',
                        'Match has been started successfully!',
                        'success',
                        () => {
                            setAlertConfig(prev => ({ ...prev, visible: false }));
                            navigation.navigate(SCREEN_NAMES.TOSS, {
                                fixtureId: item.id,
                                teamA: item.teamA,
                                teamB: item.teamB,
                                teamAObj: item.teamAObj,
                                teamBObj: item.teamBObj,
                            });
                        }
                    );
                } catch (error) {
                    showAlert('Error', 'Failed to start the match. Please try again.', 'error');
                }
            }
        } else if (isRacketSport) {
            const currentStatus = item.status?.toLowerCase() || 'scheduled';

            // If already in progress, navigate directly to Points Scoring
            if (currentStatus === 'inprogress') {
                navigation.navigate(SCREEN_NAMES.POINTS_SCORING, {
                    fixtureId: item.id,
                    teamAObj: item.teamAObj,
                    teamBObj: item.teamBObj,
                    tournamentId,
                });
                return;
            }

            // If scheduled or NotStarted, call API
            if (currentStatus === 'scheduled' || currentStatus === 'notstarted') {
                try {
                    await cricketScoringService.updateMatchStatus(item.id, 'inProgress');

                    // Show success alert and navigate on confirm
                    showAlert(
                        'Success',
                        'Match has been started successfully!',
                        'success',
                        () => {
                            setAlertConfig(prev => ({ ...prev, visible: false }));
                            navigation.navigate(SCREEN_NAMES.START_MATCH, {
                                fixtureId: item.id,
                                teamAObj: item.teamAObj,
                                teamBObj: item.teamBObj,
                                tournamentId,
                            });
                        }
                    );
                } catch (error) {
                    showAlert('Error', 'Failed to start the match. Please try again.', 'error');
                }
            }
        } else {
            // Future handle for other sports
            showAlert('Coming Soon', 'Scoring for ' + (sportName || categoryName || 'this sport') + ' is coming soon!', 'info');
        }
    };

    const handleShowScorecard = (item) => {
        const tournament = tournaments.find(t => t.id === tournamentId);
        const sportName = tournament?.sports?.name || '';
        const sportNameLower = sportName.toLowerCase();
        const isRacketSport = ['volleyball', 'tennis', 'badminton'].some(sport => sportNameLower.includes(sport));

        if (isRacketSport) {
            navigation.navigate(SCREEN_NAMES.POINTS_SCORECARD, {
                fixtureId: item.id,
            });
        } else {
            navigation.navigate(SCREEN_NAMES.CRICKET_SCORECARD, {
                fixtureId: item.id,
            });
        }
    };

    const renderFixtureItem = ({ item }) => {
        const status = item.status?.toLowerCase() || 'scheduled';

        // Status based unique looks
        const getStatusStyles = () => {
            switch(status) {
                case 'inprogress':
                    return {
                        cardBorder: COLORS.warning,
                        badgeBg: COLORS.warningLight,
                        badgeColor: COLORS.warning,
                        dotColor: COLORS.warning,
                        label: 'LIVE'
                    };
                case 'completed':
                    return {
                        cardBorder: COLORS.success,
                        badgeBg: COLORS.successLight,
                        badgeColor: COLORS.success,
                        dotColor: COLORS.success,
                        label: 'COMPLETED'
                    };
                default:
                    return {
                        cardBorder: COLORS.borderLight,
                        badgeBg: COLORS.primary + '15',
                        badgeColor: COLORS.primary,
                        dotColor: COLORS.primary,
                        label: 'SCHEDULED'
                    };
            }
        };

        const statusStyles = getStatusStyles();

        return (
            <View style={[styles.matchCard, { borderColor: statusStyles.cardBorder }]}>
                <View style={styles.matchHeader}>
                    <View style={styles.matchNoContainer}>
                        <Text style={styles.matchNoText}>MATCH {item.matchNo}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: statusStyles.badgeBg }
                    ]}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: statusStyles.dotColor }
                        ]} />
                        <Text style={[
                            styles.statusText,
                            { color: statusStyles.badgeColor }
                        ]}>
                            {statusStyles.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.teamsContainer}>
                    {/* Team A */}
                    <View style={[styles.teamWrapper, item.winnerId === item.teamA && styles.winnerWrapper]}>
                        <View style={[styles.teamInitialContainer, status === 'inprogress' && { borderColor: COLORS.warning }]}>
                            <Text style={[styles.teamInitial, status === 'inprogress' && { color: COLORS.warning }]}>
                                {item.teamAObj?.name?.[0]?.toUpperCase() || '?'}
                            </Text>
                        </View>
                        <View style={styles.teamInfo}>
                            <Text style={styles.teamName} numberOfLines={1}>{item.teamAObj?.name || 'TBD'}</Text>
                            {item.teamAObj?.isVerified && (
                                <CheckCircle2 size={12} color={COLORS.primary} />
                            )}
                        </View>
                        {item.winnerId === item.teamA && (
                            <View style={styles.winnerTag}>
                                <Trophy size={10} color={COLORS.white} />
                                <Text style={styles.winnerTagText}>WINNER</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.vsContainer}>
                        <View style={styles.vsLine} />
                        <View style={styles.vsCircle}>
                            <Text style={styles.vsText}>VS</Text>
                        </View>
                        <View style={styles.vsLine} />
                    </View>

                    {/* Team B */}
                    <View style={[styles.teamWrapper, item.winnerId === item.teamB && styles.winnerWrapper]}>
                        <View style={[
                            styles.teamInitialContainer,
                            { backgroundColor: COLORS.secondary + '10' },
                            status === 'inprogress' && { borderColor: COLORS.secondary }
                        ]}>
                            <Text style={[styles.teamInitial, { color: COLORS.secondary }]}>
                                {item.teamBObj?.name?.[0]?.toUpperCase() || '?'}
                            </Text>
                        </View>
                        <View style={styles.teamInfo}>
                            <Text style={styles.teamName} numberOfLines={1}>{item.teamBObj?.name || 'TBD'}</Text>
                            {item.teamBObj?.isVerified && (
                                <CheckCircle2 size={12} color={COLORS.primary} />
                            )}
                        </View>
                        {item.winnerId === item.teamB && (
                            <View style={styles.winnerTag}>
                                <Trophy size={10} color={COLORS.white} />
                                <Text style={styles.winnerTagText}>WINNER</Text>
                            </View>
                        )}
                    </View>
                </View>

                {isAdmin ? (
                    item.status !== 'completed' && !item.isBye && (
                        <TouchableOpacity
                            style={[
                                styles.startMatchButton,
                                status === 'inprogress' && { backgroundColor: COLORS.warning }
                            ]}
                            onPress={() => handleStartMatch(item)}
                        >
                            <Zap size={16} color={COLORS.white} fill={COLORS.white} />
                            <Text style={styles.startMatchButtonText}>
                                {status === 'inprogress' ? 'CONTINUE MATCH' : 'START MATCH'}
                            </Text>
                        </TouchableOpacity>
                    )
                ) : (
                    (status === 'completed' || status === 'inprogress') && (
                        <TouchableOpacity
                            style={[
                                styles.startMatchButton,
                                { backgroundColor: status === 'inprogress' ? COLORS.warning : COLORS.success }
                            ]}
                            onPress={() => handleShowScorecard(item)}
                        >
                            <LayoutList size={16} color={COLORS.white} />
                            <Text style={styles.startMatchButtonText}>
                                {status === 'inprogress' ? 'VIEW LIVE SCORECARD' : 'SHOW SCORECARD'}
                            </Text>
                        </TouchableOpacity>
                    )
                )}

                {isAdmin && status === 'completed' && (
                    <TouchableOpacity
                        style={[
                            styles.startMatchButton,
                            { backgroundColor: COLORS.success }
                        ]}
                        onPress={() => handleShowScorecard(item)}
                    >
                        <LayoutList size={16} color={COLORS.white} />
                        <Text style={styles.startMatchButtonText}>SHOW SCORECARD</Text>
                    </TouchableOpacity>
                )}

                {!isAdmin && status === 'scheduled' && !item.isBye && (
                    <View style={styles.scheduledInfo}>
                        <AlertCircle size={14} color={COLORS.textTertiary} />
                        <Text style={styles.scheduledInfoText}>Match yet to start. Scorecard will be available once live.</Text>
                    </View>
                )}

                {item.isBye && (
                    <View style={styles.byeContainer}>
                        <AlertCircle size={14} color={COLORS.textTertiary} />
                        <Text style={styles.byeText}>This is a BYE match. Team A advances automatically.</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {roundName || 'Tournament Matches'}
                        </Text>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            {categoryName || 'All Categories'}
                        </Text>
                    </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <Search size={20} color={COLORS.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search teams or status..."
                        placeholderTextColor={COLORS.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={20} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {fixturesLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : filteredFixtures && filteredFixtures.length > 0 ? (
                <FlatList
                    data={filteredFixtures}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFixtureItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={fixturesLoading}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
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
        justifyContent: 'space-between',
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
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
        padding: 0,
    },
    matchCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: SPACING['16'],
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    matchNoContainer: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    matchNoText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.textTertiary,
        letterSpacing: 0.5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusScheduled: {
        backgroundColor: COLORS.primary + '15',
    },
    statusCompleted: {
        backgroundColor: COLORS.success + '15',
    },
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    statusTextScheduled: {
        color: COLORS.primary,
    },
    statusTextCompleted: {
        color: COLORS.success,
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    teamWrapper: {
        flex: 1,
        alignItems: 'center',
        gap: 10,
    },
    teamInitialContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.surface,
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    teamInitial: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.primary,
    },
    teamInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
    },
    teamName: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
    },
    winnerTag: {
        position: 'absolute',
        top: -10,
        backgroundColor: COLORS.success,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        elevation: 2,
    },
    winnerTagText: {
        color: COLORS.white,
        fontSize: 8,
        fontWeight: '900',
    },
    vsContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vsLine: {
        width: 1,
        height: 20,
        backgroundColor: COLORS.borderLight,
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
        marginVertical: 4,
        elevation: 2,
    },
    vsText: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.textTertiary,
    },
    startMatchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    startMatchButtonText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    byeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
        backgroundColor: COLORS.background,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        borderStyle: 'dashed',
    },
    byeText: {
        fontSize: 10,
        color: COLORS.textTertiary,
        flex: 1,
        fontWeight: '600',
        lineHeight: 14,
    },
    scheduledInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
        backgroundColor: COLORS.background,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        borderStyle: 'dashed',
    },
    scheduledInfoText: {
        fontSize: 10,
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
