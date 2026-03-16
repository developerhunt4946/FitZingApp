import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Alert,
    Modal,
    TextInput,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Trophy, Zap, ChevronRight, Info, Play, Eye, Users, Plus, X } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import SCREEN_NAMES from '../constants/screenNames';
import {
    fetchRounds,
    generateRounds,
    updateRoundStatus,
    fetchFixtures,
    generateFixtures,
    fetchGroups,
    createGroups,
    advanceTournament,
    createRound
} from '../redux/slices/tournamentSlice';
import { AppAlert } from '../components';

const RoundsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { tournamentId, categoryId, categoryName } = route.params;

    const {
        rounds,
        roundsLoading,
        loading,
        fixtures,
        fixturesLoading,
        tournaments,
        groups
    } = useSelector((state) => state.tournament);

    const tournament = tournaments.find(t => t.id === tournamentId);
    const tournamentFormat = tournament?.format?.toLowerCase() || 'group';

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
    });

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchRounds({ tournamentId, categoryId }));
            // dispatch(fetchGroups({ tournamentId, categoryId })); // Added fetchGroups
        }, [dispatch, tournamentId, categoryId])
    );

    const showAlert = (title, message, type = 'info', onConfirm = null) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            onConfirm,
        });
    };

    const handleCreateRound = async () => {
        try {
            await dispatch(createRound({
                tournamentId,
                categoryId,
                payload: {}
            })).unwrap();
            showAlert('Success', 'Round created successfully.', 'success');
            dispatch(fetchRounds({ tournamentId, categoryId }));
        } catch (err) {
            showAlert('Error', err?.message || err || 'Failed to create round', 'error');
        }
    };

    const handleGroupsPress = (round) => {
        // Always navigate to GroupsScreen - it will fetch groups and filter by roundId internally
        navigation.navigate(SCREEN_NAMES.GROUPS, {
            tournamentId,
            categoryId,
            categoryName,
            roundNo: round.roundNo,
            roundId: round.id,
            round,
        });
    };

    const handleStartRound = async (round) => {
        try {
            await dispatch(updateRoundStatus({
                roundId: round.id,
                roundStatus: 'InProgress',
            })).unwrap();

            // Step 3/7: Automatically generate fixtures after starting the round
            try {
                await dispatch(generateFixtures({
                    tournamentId,
                    categoryId,
                    payload: {}
                })).unwrap();
                showAlert('Success', 'Round started and fixtures generated successfully', 'success');
            } catch (fixtureErr) {
                showAlert('Warning', 'Round started but failed to generate fixtures: ' + (fixtureErr?.message || fixtureErr || 'Unknown error'), 'warning');
            }

            dispatch(fetchRounds({ tournamentId, categoryId }));
        } catch (err) {
            showAlert('Error', err?.message || err || 'Failed to start round', 'error');
        }
    };

    const handleCompleteRound = async (round) => {
        try {
            // Fetch fixtures for this round to check their status
            const fixturesResponse = await dispatch(fetchFixtures({
                tournamentId,
                categoryId,
                roundId: round.id
            })).unwrap();

            const incompleteMatches = fixturesResponse.filter(f =>
                f.status?.toLowerCase() === 'scheduled' ||
                f.status?.toLowerCase() === 'inprogress'
            );

            if (incompleteMatches.length > 0) {
                showAlert('Incomplete Matches', 'Please complete all matches for this round before completing the round.', 'warning');
                return;
            }

            // All matches are completed, proceed to complete round
            await dispatch(updateRoundStatus({
                roundId: round.id,
                roundStatus: 'Completed',
            })).unwrap();

            showAlert('Success', 'Round completed successfully.', 'success');
            dispatch(fetchRounds({ tournamentId, categoryId }));
        } catch (err) {
            showAlert('Error', err?.message || err || 'Failed to complete round', 'error');
        }
    };


    const handleViewMatches = (round) => {
        const statusLower = (round.roundStatus || '').toLowerCase().replace(/[_\s-]/g, '');
        const isNotStarted = !round.roundStatus || statusLower === 'notstarted';
        if (isNotStarted) {
            showAlert('Start Round First', 'Please start the round before viewing matches.', 'warning');
            return;
        }
        navigation.navigate(SCREEN_NAMES.MATCHES, {
            tournamentId,
            categoryId,
            roundId: round.id,
            roundName: round.name,
            categoryName
        });
    };

    const renderRoundItem = ({ item }) => {
        const getStatusStyles = (status) => {
            switch (status?.toLowerCase()) {
                case 'inprogress':
                    return { bg: '#FEF9C3', text: '#854D0E', label: 'In Progress' };
                case 'completed':
                    return { bg: '#DCFCE7', text: '#15803D', label: 'Completed' };
                default:
                    return { bg: COLORS.background, text: COLORS.textTertiary, label: 'Not Started' };
            }
        };

        const statusStyles = getStatusStyles(item.roundStatus);

        return (
            <View style={styles.roundCard}>
                <View style={styles.roundHeaderRow}>
                    <View style={styles.roundTitleInfo}>
                        <View style={styles.roundTitleRow}>
                            <Text style={styles.roundTitle}>{item.name}</Text>
                            {/* <View style={[styles.roundStatusBadge, { backgroundColor: statusStyles.bg }]}>
                                <Text style={[styles.roundStatusText, { color: statusStyles.text }]}>{statusStyles.label}</Text>
                            </View> */}
                        </View>
                        <Text style={styles.categoryInfo}>{categoryName}</Text>
                    </View>
                    {tournamentFormat === 'group' && (
                        <TouchableOpacity
                            style={styles.groupsIconBtn}
                            onPress={() => handleGroupsPress(item)}
                        >
                            <Users size={22} color={COLORS.primary} />
                            <Text style={styles.generateGroupsBtnText}>Groups</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.roundActions}>
                    <TouchableOpacity
                        style={[
                            styles.actionBtn,
                            item.roundStatus === 'completed' ? styles.viewBtn : styles.startBtn
                        ]}
                        onPress={() => {
                            if (item.roundStatus.toLowerCase() === 'inprogress') {
                                handleCompleteRound(item);
                            } else if (!item.roundStatus || item.roundStatus.toLowerCase() === 'notstarted' || item.roundStatus.toLowerCase() === 'scheduled') {
                                handleStartRound(item);
                            }
                        }}
                        disabled={item.roundStatus.toLowerCase() === 'completed' || loading}
                    >
                        {loading && (item.roundStatus.toLowerCase() === 'inprogress' || !item.roundStatus || item.roundStatus.toLowerCase() === 'notstarted' || item.roundStatus.toLowerCase() === 'scheduled') ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <>
                                {item.roundStatus?.toLowerCase() === 'inprogress' ? (
                                    <Zap size={16} color={COLORS.white} />
                                ) : (
                                    <Play size={16} color={COLORS.white} fill={COLORS.white} />
                                )}
                                <Text style={styles.actionBtnText}>
                                    {item.roundStatus?.toLowerCase() === 'inprogress' ? 'Complete' : item.roundStatus?.toLowerCase() === 'completed' ? 'Completed' : 'Start'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.actionBtn,
                            styles.viewBtn,
                            (!item.roundStatus || item.roundStatus.toLowerCase() === 'notstarted') && { opacity: 0.5 }
                        ]}
                        onPress={() => handleViewMatches(item)}
                    >
                        <Eye size={16} color={COLORS.primary} />
                        <Text style={styles.viewBtnText}>View Matches</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };


    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.screenTitle}>Tournament Rounds</Text>
                    <Text style={styles.categoryTitle}>{categoryName || 'Rounds'}</Text>
                </View>
                <TouchableOpacity
                    style={styles.createBtnHeader}
                    onPress={handleCreateRound}
                >
                    <Plus size={20} color={COLORS.primary} strokeWidth={2.5} />
                </TouchableOpacity>
            </View>

            {roundsLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : rounds && rounds.length > 0 ? (
                <FlatList
                    data={rounds}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRoundItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={() => {
                        const allRoundsCompleted = rounds && rounds.length > 0 && rounds.every(r => r.roundStatus?.toLowerCase() === 'completed');
                        if (!allRoundsCompleted) return null;

                        return (
                            <TouchableOpacity
                                style={styles.advanceBtn}
                                onPress={handleCreateRound}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color={COLORS.white} /> : (
                                    <>
                                        <Trophy size={20} color={COLORS.white} />
                                        <Text style={styles.advanceBtnText}>Generate Next Round</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Trophy size={48} color={COLORS.primary} opacity={0.5} />
                    </View>
                    <Text style={styles.emptyTitle}>No Rounds Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        You can now generate the tournament rounds.
                    </Text>

                    <TouchableOpacity
                        style={styles.generateBtn}
                        onPress={handleCreateRound}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color={COLORS.white} /> : (
                            <>
                                <Zap size={20} color={COLORS.white} />
                                <Text style={styles.generateBtnText}>Create Round</Text>
                            </>
                        )}
                    </TouchableOpacity>
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
    addBtn: {
        padding: 4,
    },
    listContent: {
        padding: SPACING['16'],
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roundCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING['20'],
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    roundHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    roundTitleInfo: {
        flex: 1,
    },
    roundTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    roundStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    roundStatusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    roundTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    categoryTitle: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    createBtnHeader: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING['16'],
    },
    categoryInfo: {
        fontSize: 13,
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    groupsIconBtn: {
        backgroundColor: COLORS.primary + '15',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    generateGroupsBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 16,
    },
    roundActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
        borderRadius: 12,
    },
    startBtn: {
        backgroundColor: COLORS.primary,
    },
    viewBtn: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    actionBtnText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '700',
    },
    viewBtnText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
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
        marginBottom: 32,
    },
    generateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        gap: 10,
        elevation: 4,
    },
    generateBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 32,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalIconBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    modalSubtitle: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginTop: 2,
        fontWeight: '600',
    },
    modalCloseBtn: {
        padding: 4,
        backgroundColor: COLORS.background,
        borderRadius: 8,
    },
    modalBody: {
        marginBottom: 32,
    },
    inputGroup: {
        gap: 12,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        gap: 10,
        backgroundColor: COLORS.primary + '08',
        padding: 12,
        borderRadius: 12,
        marginTop: 4,
        borderWidth: 1,
        borderColor: COLORS.primary + '10',
    },
    infoText: {
        fontSize: 11,
        color: COLORS.textTertiary,
        flex: 1,
        lineHeight: 16,
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
    },
    noMatchesText: {
        color: COLORS.textTertiary,
    },
    advanceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.secondary || '#10B981',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
        marginTop: 24,
        marginBottom: 40,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    advanceBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
    },
});

export default RoundsScreen;
