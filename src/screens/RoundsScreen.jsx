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
    fetchGroups
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

    const [isCreateModalVisible, setCreateModalVisible] = useState(false);
    const [groupSize, setGroupSize] = useState('4');

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
            dispatch(fetchGroups({ tournamentId, categoryId })); // Added fetchGroups
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
        if (tournamentFormat === 'group') {
            setCreateModalVisible(true);
        } else {
            // Knockout mode
            try {
                await dispatch(generateRounds({
                    tournamentId,
                    categoryId,
                    mode: 'knockout',
                    groupSize: 0
                })).unwrap();
                showAlert('Success', 'Knockout round generated successfully.', 'success');
                dispatch(fetchRounds({ tournamentId, categoryId }));
            } catch (err) {
                showAlert('Error', err || 'Failed to generate knockout round', 'error');
            }
        }
    };

    const submitCreateRound = async () => {
        try {
            await dispatch(generateRounds({
                tournamentId,
                categoryId,
                mode: 'group',
                groupSize: parseInt(groupSize) || 4
            })).unwrap();
            setCreateModalVisible(false);
            showAlert('Success', 'Rounds generated successfully.', 'success');
            dispatch(fetchRounds({ tournamentId, categoryId }));
        } catch (err) {
            showAlert('Error', err || 'Failed to generate rounds', 'error');
        }
    };

    const handleStartRound = async (round) => {
        // Group format check: verify groups exist for this category
        if (tournamentFormat === 'group') {
            if (!groups || groups.length === 0) {
                showAlert('Groups Required', 'Please create groups for this round before starting.', 'warning');
                return;
            }
        }

        try {
            await dispatch(updateRoundStatus({
                roundId: round.id,
                status: 'inProgress',
                name: `${categoryName} - ${round.name}`
            })).unwrap();

            // Auto generate fixtures
            try {
                await dispatch(generateFixtures({
                    tournamentId,
                    categoryId,
                    roundNo: round.roundNo
                })).unwrap();
                showAlert('Success', 'Round started and fixtures generated successfully', 'success');
            } catch (fixtureErr) {
                showAlert('Warning', 'Round started but failed to generate fixtures: ' + (fixtureErr || 'Unknown error'), 'warning');
            }

            dispatch(fetchRounds({ tournamentId, categoryId }));
        } catch (err) {
            showAlert('Error', err || 'Failed to start round', 'error');
        }
    };

    const handleViewMatches = (round) => {
        const statusLower = (round.status || '').toLowerCase().replace(/[_\s-]/g, '');
        const isNotStarted = !round.status || statusLower === 'notstarted';
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

        const statusStyles = getStatusStyles(item.status);

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
                    <TouchableOpacity
                        style={styles.groupsIconBtn}
                        onPress={() => navigation.navigate(SCREEN_NAMES.GROUPS, {
                            tournamentId,
                            categoryId,
                            categoryName,
                            roundNo: item.roundNo,
                            roundId: item.id
                        })}
                    >
                        <Users size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.roundActions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.startBtn]}
                        onPress={() => handleStartRound(item)}
                        disabled={item.status === 'inProgress' || item.status === 'completed'}
                    >
                        <Play size={16} color={COLORS.white} fill={COLORS.white} />
                        <Text style={styles.actionBtnText}>
                            {item.status === 'inProgress' ? 'In Progress' : item.status === 'completed' ? 'Completed' : 'Start Round'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.actionBtn,
                            styles.viewBtn,
                            (!item.status || item.status.toLowerCase() === 'notstarted') && { opacity: 0.5 }
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

    const renderCreateRoundModal = () => (
        <Modal
            visible={isCreateModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setCreateModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalTitleContainer}>
                            <View style={styles.modalIconBadge}>
                                <Zap size={20} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={styles.modalTitle}>Configure Round</Text>
                                <Text style={styles.modalSubtitle}>Step 1: Group Settings</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => setCreateModalVisible(false)}
                            style={styles.modalCloseBtn}
                        >
                            <X size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Users size={16} color={COLORS.textSecondary} />
                                <Text style={styles.label}>Group Size</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                value={groupSize}
                                onChangeText={setGroupSize}
                                keyboardType="numeric"
                                placeholder="e.g. 4"
                                placeholderTextColor={COLORS.textTertiary}
                            />
                            <View style={styles.infoBox}>
                                <Info size={14} color={COLORS.primary} />
                                <Text style={styles.infoText}>
                                    This determines how many teams will be assigned to each group in this round.
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                        onPress={submitCreateRound}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Text style={styles.submitBtnText}>Continue</Text>
                                <ChevronRight size={18} color={COLORS.white} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
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
                    <Text style={styles.headerTitle}>{STRINGS.ROUNDS}</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{categoryName}</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={handleCreateRound}>
                    <Plus size={24} color={COLORS.primary} />
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
                                <Text style={styles.generateBtnText}>Create First Round</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {renderCreateRoundModal()}

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
});

export default RoundsScreen;
