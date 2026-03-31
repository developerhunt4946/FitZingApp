import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    TextInput,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CheckCircle2, Trophy, Search, X, Play, LayoutList } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme';
import apiClient from '../services/apiClient';
import SCREEN_NAMES from '../constants/screenNames';

const MyMatchesScreen = () => {
    const navigation = useNavigation();
    
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMyMatches = async () => {
        try {
            const response = await apiClient.get('/users/my-matches');
            if (response.data?.data?.matches) {
                setMatches(response.data.data.matches);
            } else if (response.data?.matches) {
                setMatches(response.data.matches);
            } else if (Array.isArray(response.data)) {
                setMatches(response.data);
            } else {
                setMatches([]);
            }
        } catch (error) {
            console.error('Error fetching my matches:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchMyMatches();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyMatches();
    };

    const filteredMatches = useMemo(() => {
        if (!matches || matches.length === 0) return [];
        if (!searchQuery.trim()) return matches;

        const query = searchQuery.toLowerCase();
        return matches.filter(item => {
            const teamAName = item.teamAObj?.name?.toLowerCase() || '';
            const teamBName = item.teamBObj?.name?.toLowerCase() || '';
            const status = item.status?.toLowerCase() || '';
            return teamAName.includes(query) || teamBName.includes(query) || status.includes(query);
        });
    }, [matches, searchQuery]);

    const handleShowScorecard = (item) => {
        const sportName = item.tournament?.sports?.name || item.tournamentObj?.sports?.name || '';
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
                        <Text style={styles.matchNoText}>MATCH {item.matchNo || '-'}</Text>
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

                {(status === 'completed' || status === 'inprogress') && (
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
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        My Matches
                    </Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                        All your history
                    </Text>
                </View>
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

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : filteredMatches && filteredMatches.length > 0 ? (
                <FlatList
                    data={filteredMatches}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={renderFixtureItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
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
                        You haven't played any matches yet or no match matches your search.
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
        justifyContent: 'center',
    },
    headerTitleContainer: {
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
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
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

export default MyMatchesScreen;
