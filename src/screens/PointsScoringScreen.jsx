import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, User, X, Zap, Target, PlusCircle, MinusCircle } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import { addPoint, deletePoint, getPointsByFixture } from '../services/pointsScoringService';
import cricketScoringService from '../services/cricketScoringService';
import SCREEN_NAMES from '../constants/screenNames';
import { AppAlert } from '../components';

const MOCK_PLAYERS_A = [
    { id: 'mock_a_1', userId: 'mock_a_1', firstName: 'Raj', lastName: 'Kumar' },
    { id: 'mock_a_2', userId: 'mock_a_2', firstName: 'Amit', lastName: 'Singh' },
    { id: 'mock_a_3', userId: 'mock_a_3', firstName: 'Suresh', lastName: 'Raina' }
];

const MOCK_PLAYERS_B = [
    { id: 'mock_b_1', userId: 'mock_b_1', firstName: 'Virat', lastName: 'Kohli' },
    { id: 'mock_b_2', userId: 'mock_b_2', firstName: 'MS', lastName: 'Dhoni' },
    { id: 'mock_b_3', userId: 'mock_b_3', firstName: 'Jasprit', lastName: 'Bumrah' }
];

const PointsScoringScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { fixtureId, teamAObj, teamBObj } = route.params || {};

    const nameA = teamAObj?.name || 'Team A';
    const nameB = teamBObj?.name || 'Team B';
    const initA = nameA[0]?.toUpperCase() || 'A';
    const initB = nameB[0]?.toUpperCase() || 'B';
    const teamAId = teamAObj?.id || teamAObj?._id || 'teamA_id';
    const teamBId = teamBObj?.id || teamBObj?._id || 'teamB_id';

    const [teamAPlayers, setTeamAPlayers] = useState([]);
    const [teamBPlayers, setTeamBPlayers] = useState([]);

    const playersA = teamAPlayers.length > 0 ? teamAPlayers : (teamAObj?.players?.length > 0 ? teamAObj.players : MOCK_PLAYERS_A);
    const playersB = teamBPlayers.length > 0 ? teamBPlayers : (teamBObj?.players?.length > 0 ? teamBObj.players : MOCK_PLAYERS_B);

    const [allPoints, setAllPoints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [statusA, setStatusA] = useState('S');
    const [statusB, setStatusB] = useState('P');

    const [modalData, setModalData] = useState({
        visible: false,
        title: '',
        teamName: '',
        teamId: '',
        isTeamA: true,
        pointType: 'normal',
    });

    const [alertConfig, setAlertConfig] = useState({ 
        visible: false, title: '', message: '', type: 'info', 
        onConfirm: null, showCancel: false, confirmText: 'OK' 
    });

    const showAlert = (title, message, type = 'error', onConfirm = null, showCancel = false, confirmText = 'OK') => {
        setAlertConfig({ visible: true, title, message, type, onConfirm, showCancel, confirmText });
    };

    const fetchPoints = useCallback(async () => {
        if (!fixtureId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getPointsByFixture(fixtureId);
            let pointsArray = [];
            if (Array.isArray(data)) {
                pointsArray = data;
            } else if (data && Array.isArray(data.data)) {
                pointsArray = data.data;
            } else if (data && data.points && Array.isArray(data.points)) {
                pointsArray = data.points;
            }
            setAllPoints(pointsArray);
        } catch (error) {
            console.log('Error fetching points', error);
            // Non-blocking error
        } finally {
            setLoading(false);
        }
    }, [fixtureId]);

    useEffect(() => {
        const fetchPlayersData = async () => {
            if (!fixtureId) return;
            try {
                const response = await cricketScoringService.getFixtureDetails(fixtureId);
                if (response.status === 'success' && response.data?.fixture) {
                    const f = response.data.fixture;
                    const mapPlayers = (players) => players.map(p => ({
                        id: p.id,
                        userId: p.userId || p.id,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        name: `${p.firstName} ${p.lastName}`.trim(),
                    }));
                    if (f.teamAObj?.players?.length > 0) setTeamAPlayers(mapPlayers(f.teamAObj.players));
                    if (f.teamBObj?.players?.length > 0) setTeamBPlayers(mapPlayers(f.teamBObj.players));
                }
            } catch (err) {
                console.log('Error fetching fixture players', err);
            }
        };

        fetchPlayersData();
        fetchPoints();
    }, [fetchPoints, fixtureId]);

    const scoreA = useMemo(() => Array.isArray(allPoints) ? allPoints.filter(p => p.teamId === teamAId).length : 0, [allPoints, teamAId]);
    const scoreB = useMemo(() => Array.isArray(allPoints) ? allPoints.filter(p => p.teamId === teamBId).length : 0, [allPoints, teamBId]);

    const handleOpenModal = (title, pointType, isTeamA) => {
        setModalData({
            visible: true,
            title,
            teamName: isTeamA ? nameA : nameB,
            teamId: isTeamA ? teamAId : teamBId,
            isTeamA,
            pointType,
        });
    };

    const handleSelectPlayer = async (player) => {
        const payload = {
            fixtureId,
            teamId: modalData.teamId,
            playerId: player.userId || player.id || player._id,
            pointValue: 1, // standard increment
            pointType: modalData.pointType, // 'normal', 'smash', 'drop'
            setNumber: 1 // standard assumes set 1 for now
        };

        // Optimistic UI updates could be placed here if desired
        setModalData(prev => ({ ...prev, visible: false }));

        try {
            // Using a temporary local state placeholder if fixtureId missing during testing
            if (!fixtureId) {
                 setAllPoints(prev => [...prev, { ...payload, id: Math.random().toString() }]);
                 return;
            }
            const res = await addPoint(payload);
            if (res && res.data) {
                setAllPoints(prev => [...prev, res.data]);
            } else {
                fetchPoints(); // Refresh entire list payload structure is unknown
            }
        } catch (err) {
            showAlert('Error', 'Failed to add point.');
        }
    };

    const handleDeleteLatestPoint = async (teamId) => {
        // Find latest point for this team
        const teamPoints = Array.isArray(allPoints) ? allPoints.filter(p => p.teamId === teamId) : [];
        if (teamPoints.length === 0) return;

        // Assuming points are appended chronologically
        const latestPoint = teamPoints[teamPoints.length - 1];

        try {
            if (!fixtureId || !latestPoint.id) {
                setAllPoints(prev => prev.filter(p => p.id !== latestPoint.id));
                return;
            }

            await deletePoint(latestPoint.id || latestPoint._id);
            // Optimistic Removal
            setAllPoints(prev => prev.filter(p => p.id !== latestPoint.id && p._id !== latestPoint._id));
        } catch (err) {
            showAlert('Error', 'Failed to undo point.');
            fetchPoints(); // Retain accuracy
        }
    };

    const handleCompleteMatch = async () => {
        if (!fixtureId) return;
        
        // Find winner based on score
        let winnerId = null;
        if (scoreA > scoreB) winnerId = teamAId;
        else if (scoreB > scoreA) winnerId = teamBId;

        showAlert(
            "Complete Match",
            "Are you sure you want to complete this match? You cannot change scores after this.",
            "confirm",
            async () => {
                setAlertConfig(prev => ({ ...prev, visible: false }));
                try {
                    setLoading(true);
                    await cricketScoringService.updateMatchStatus(fixtureId, 'completed', winnerId);
                    navigation.navigate(SCREEN_NAMES.HOME);
                } catch (err) {
                    setLoading(false);
                    showAlert('Error', 'Failed to complete match.');
                }
            },
            true, // showCancel
            "Complete" // confirmText
        );
    };

    const renderTeamScoring = (isTeamA) => {
        const teamName = isTeamA ? nameA : nameB;
        const score = isTeamA ? scoreA : scoreB;
        const status = isTeamA ? statusA : statusB;
        const setStatus = isTeamA ? setStatusA : setStatusB;
        const themeColor = isTeamA ? COLORS.primary : COLORS.secondary;
        const teamId = isTeamA ? teamAId : teamBId;

        return (
            <View style={styles.teamHalf}>
                {/* Header Information */}
                <View style={[styles.nameTag, { backgroundColor: themeColor + '15' }]}>
                    <Text style={[styles.nameTagText, { color: themeColor }]} numberOfLines={1}>{teamName}</Text>
                </View>

                {/* Main Score Display */}
                <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreText, { color: themeColor }]}>{score}</Text>
                    
                    <View style={styles.scoreActionRow}>
                        <TouchableOpacity 
                            onPress={() => handleDeleteLatestPoint(teamId)}
                            disabled={score === 0}
                            activeOpacity={0.7}
                            style={styles.actionIconContainer}
                        >
                            <MinusCircle size={36} color={score === 0 ? COLORS.textTertiary : COLORS.error} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => handleOpenModal('Add Point', 'point', isTeamA)}
                            activeOpacity={0.8}
                            style={styles.actionIconContainer}
                        >
                            <PlusCircle size={36} color={themeColor} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Serve and Pick Custom Radio Buttons */}
                <View style={styles.spRow}>
                    <TouchableOpacity 
                        style={[styles.spButton, status === 'S' && { backgroundColor: themeColor, borderColor: themeColor }]}
                        onPress={() => setStatus('S')}
                    >
                        <Text style={[styles.spButtonText, status === 'S' && { color: COLORS.white }]}>S</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.spButton, status === 'P' && { backgroundColor: themeColor, borderColor: themeColor }]}
                        onPress={() => setStatus('P')}
                    >
                        <Text style={[styles.spButtonText, status === 'P' && { color: COLORS.white }]}>P</Text>
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleOpenModal('Smash Hit', 'smash', isTeamA)}
                    >
                        <Zap size={16} color={themeColor} />
                        <Text style={[styles.actionButtonText, { color: themeColor }]}>Smash</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleOpenModal('Drop Hit', 'drop', isTeamA)}
                    >
                        <Target size={16} color={themeColor} />
                        <Text style={[styles.actionButtonText, { color: themeColor }]}>Drop</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>Set 1</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>Live Scoring</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Syncing Scorecard...</Text>
                </View>
            ) : (
                <View style={styles.scoringOverview}>
                    <View style={styles.innerScoringContainer}>
                        {renderTeamScoring(true)}
                        <View style={styles.verticalDivider} />
                        {renderTeamScoring(false)}
                    </View>
                    
                    <TouchableOpacity style={styles.completeMatchBtn} onPress={handleCompleteMatch} activeOpacity={0.8}>
                        <Text style={styles.completeMatchBtnText}>Complete Match</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Bottom Sheet Modal for Player Selection */}
            <Modal visible={modalData.visible} transparent animationType="slide" onRequestClose={() => setModalData(prev => ({ ...prev, visible: false }))}>
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setModalData(prev => ({ ...prev, visible: false }))}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />
                        
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{modalData.title}</Text>
                                <Text style={styles.modalSubtitle}>Who scored for {modalData.teamName}?</Text>
                            </View>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalData(prev => ({ ...prev, visible: false }))}>
                                <X size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.playersList}>
                            {(modalData.isTeamA ? playersA : playersB).map((player, index) => (
                                <TouchableOpacity 
                                    key={index} 
                                    style={styles.playerItem}
                                    onPress={() => handleSelectPlayer(player)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: (modalData.isTeamA ? COLORS.primary : COLORS.secondary) + '15' }]}>
                                        <Text style={[styles.avatarText, { color: (modalData.isTeamA ? COLORS.primary : COLORS.secondary) }]}>
                                            {player.firstName ? player.firstName[0].toUpperCase() : <User size={16} color={modalData.isTeamA ? COLORS.primary : COLORS.secondary} />}
                                        </Text>
                                    </View>
                                    <View style={styles.playerNameCol}>
                                        <Text style={styles.playerName}>{player.firstName || player.name} {player.lastName}</Text>
                                        <Text style={styles.playerRole}>Player</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            <AppAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
                showCancel={alertConfig.showCancel}
                confirmText={alertConfig.confirmText}
            />
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
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        justifyContent: 'space-between',
        elevation: 2,
        zIndex: 10,
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
        fontWeight: '900',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    scoringOverview: {
        flex: 1,
        padding: SPACING['16'],
    },
    innerScoringContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        overflow: 'hidden',
    },
    verticalDivider: {
        width: 1,
        backgroundColor: COLORS.borderLight,
    },
    teamHalf: {
        flex: 1,
        padding: SPACING['16'],
        alignItems: 'center',
    },
    nameTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: SPACING['24'],
        width: '100%',
        alignItems: 'center',
    },
    nameTagText: {
        fontSize: 14,
        fontWeight: '800',
    },
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING['24'],
        marginTop: SPACING['8'],
    },
    scoreActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginTop: SPACING['8'],
    },
    actionIconContainer: {
        padding: 4,
    },
    scoreText: {
        fontSize: 80,
        fontWeight: '900',
        minWidth: 80,
        textAlign: 'center',
        letterSpacing: -2,
        lineHeight: 90,
    },
    spRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: SPACING['24'],
        backgroundColor: COLORS.gray50,
        padding: 6,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    spButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    spButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    actionRow: {
        width: '100%',
        gap: 12,
        marginTop: 'auto',
    },
    actionButton: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 14,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 2,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '800',
    },
    completeMatchBtn: {
        width: '100%',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING['16'],
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING['20'],
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    completeMatchBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        minHeight: 400,
        maxHeight: '80%',
        paddingTop: SPACING['12'],
        paddingHorizontal: SPACING['24'],
        paddingBottom: SPACING['32'],
        elevation: 20,
    },
    modalHandle: {
        width: 48,
        height: 5,
        backgroundColor: COLORS.borderLight,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: SPACING['20'],
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING['24'],
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginTop: 4,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.gray50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playersList: {
        paddingBottom: SPACING['20'],
        gap: 12,
    },
    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING['16'],
        paddingHorizontal: SPACING['16'],
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        borderRadius: 20,
        backgroundColor: COLORS.background,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '900',
    },
    playerNameCol: {
        flex: 1,
    },
    playerName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 2,
    },
    playerRole: {
        fontSize: 12,
        color: COLORS.textTertiary,
        fontWeight: '600',
    },
});

export default PointsScoringScreen;
