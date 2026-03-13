import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CircleDot } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import SCREEN_NAMES from '../constants/screenNames';
import cricketScoringService from '../services/cricketScoringService';
import { AppAlert } from '../components';

const TossScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { teamA, teamB, teamAObj, teamBObj, fixtureId } = route.params;

    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [spinValue] = useState(new Animated.Value(0));
    const [tossWinner, setTossWinner] = useState(null);
    const [battingTeam, setBattingTeam] = useState(null);
    const [bowlingTeam, setBowlingTeam] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '1080deg'],
    });

    const flipCoin = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setResult(null);
        setTossWinner(null);
        setBattingTeam(null);
        setBowlingTeam(null);

        spinValue.setValue(0);
        Animated.timing(spinValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            const random = Math.random() > 0.5 ? 'Heads' : 'Tails';
            setResult(random);
            setIsSpinning(false);
        });
    };

    const handleTossWinnerSelect = (teamId) => {
        setTossWinner(teamId);
    };

    const handleChoiceSelect = (teamId, choice) => {
        if (!tossWinner) return;
        
        if (choice === 'batting') {
            setBattingTeam(teamId);
            setBowlingTeam(teamId === teamA ? teamB : teamA);
        } else {
            setBowlingTeam(teamId);
            setBattingTeam(teamId === teamA ? teamB : teamA);
        }
    };

    const isComplete = tossWinner && battingTeam && bowlingTeam;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Match Toss</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.teamsContainer}>
                    <View style={styles.teamBox}>
                        <Text style={styles.teamName} numberOfLines={2}>{teamAObj?.name || 'Team A'}</Text>
                    </View>
                    <View style={styles.vsBadge}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>
                    <View style={styles.teamBox}>
                        <Text style={styles.teamName} numberOfLines={2}>{teamBObj?.name || 'Team B'}</Text>
                    </View>
                </View>

                <View style={styles.coinContainer}>
                    <Animated.View style={[styles.coin, { transform: [{ rotateY: spin }] }]}>
                        <Svg width="120" height="120" viewBox="0 0 100 100">
                            <Circle cx="50" cy="50" r="48" fill="#FFD700" stroke="#B8860B" strokeWidth="4" />
                            <Circle cx="50" cy="50" r="40" fill="none" stroke="#B8860B" strokeWidth="1" strokeDasharray="2,2" />
                            <SvgText
                                x="50"
                                y="55"
                                fontSize="24"
                                fontWeight="bold"
                                fill="#B8860B"
                                textAnchor="middle"
                            >
                                {result ? (result === 'Heads' ? 'H' : 'T') : '?'}
                            </SvgText>
                        </Svg>
                    </Animated.View>

                    {result && !isSpinning && (
                        <View style={styles.resultBadge}>
                            <Text style={styles.resultText}>{result.toUpperCase()}</Text>
                        </View>
                    )}

                    <TouchableOpacity 
                        style={[styles.flipButton, isSpinning && styles.disabledButton]} 
                        onPress={flipCoin}
                        disabled={isSpinning}
                    >
                        <Text style={styles.flipButtonText}>{isSpinning ? 'SPINNING...' : 'FLIP COIN'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Toss Won By</Text>
                    <View style={styles.choiceRow}>
                        <TouchableOpacity 
                            style={[styles.choiceBtn, tossWinner === teamA && styles.choiceBtnActive]}
                            onPress={() => handleTossWinnerSelect(teamA)}
                        >
                            <Text style={[styles.choiceBtnText, tossWinner === teamA && styles.choiceBtnTextActive]}>
                                {teamAObj?.name || 'Team A'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.choiceBtn, tossWinner === teamB && styles.choiceBtnActive]}
                            onPress={() => handleTossWinnerSelect(teamB)}
                        >
                            <Text style={[styles.choiceBtnText, tossWinner === teamB && styles.choiceBtnTextActive]}>
                                {teamBObj?.name || 'Team B'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {tossWinner && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Decision</Text>
                        <View style={styles.choiceRow}>
                            <TouchableOpacity 
                                style={[styles.choiceBtn, battingTeam === tossWinner && styles.choiceBtnActive]}
                                onPress={() => handleChoiceSelect(tossWinner, 'batting')}
                            >
                                <Text style={[styles.choiceBtnText, battingTeam === tossWinner && styles.choiceBtnTextActive]}>
                                    BATTING
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.choiceBtn, bowlingTeam === tossWinner && styles.choiceBtnActive]}
                                onPress={() => handleChoiceSelect(tossWinner, 'bowling')}
                            >
                                <Text style={[styles.choiceBtnText, bowlingTeam === tossWinner && styles.choiceBtnTextActive]}>
                                    BOWLING
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {isComplete && (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Selection Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Batting:</Text>
                            <Text style={styles.summaryValue}>{battingTeam === teamA ? teamAObj?.name : teamBObj?.name}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Bowling:</Text>
                            <Text style={styles.summaryValue}>{bowlingTeam === teamA ? teamAObj?.name : teamBObj?.name}</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.submitButton, (!isComplete || isLoading) && styles.disabledButton]} 
                    disabled={!isComplete || isLoading}
                    onPress={async () => {
                        const tossData = {
                            tossWinnerId: tossWinner,
                            tossDecision: battingTeam === tossWinner ? 'batting' : 'bowling',
                            battingTeamId: battingTeam,
                            bowlingTeamId: bowlingTeam
                        };

                        setIsLoading(true);
                        try {
                            await cricketScoringService.submitTossResult(fixtureId, tossData);
                            
                            showAlert(
                                'Success', 
                                'Toss result submitted. Starting match...', 
                                'success',
                                () => {
                                    setAlertConfig(prev => ({ ...prev, visible: false }));
                                    navigation.navigate(SCREEN_NAMES.CRICKET_SCORING, {
                                        fixtureId,
                                        teamA,
                                        teamB,
                                        teamAObj,
                                        teamBObj,
                                        tossData
                                    });
                                }
                            );
                        } catch (error) {
                            showAlert('Error', 'Failed to submit toss result. Please try again.', 'error');
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    <Text style={styles.submitButtonText}>
                        {isLoading ? 'STARTING...' : 'START MATCH'}
                    </Text>
                </TouchableOpacity>
            </View>

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
    },
    backIcon: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING['20'],
        paddingBottom: 100,
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 40,
    },
    teamBox: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
        elevation: 2,
    },
    teamName: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
    },
    vsBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    vsText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '900',
    },
    coinContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    coin: {
        marginBottom: 20,
    },
    resultBadge: {
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
    },
    resultText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '900',
    },
    flipButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
        elevation: 4,
    },
    flipButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '800',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 12,
    },
    choiceRow: {
        flexDirection: 'row',
        gap: 12,
    },
    choiceBtn: {
        flex: 1,
        backgroundColor: COLORS.surface,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    choiceBtnActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '05',
    },
    choiceBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    choiceBtnTextActive: {
        color: COLORS.primary,
    },
    summaryCard: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
        marginTop: 10,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 13,
        color: COLORS.textTertiary,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '800',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        padding: SPACING['16'],
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: COLORS.disabled,
        elevation: 0,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
    },
});

export default TossScreen;
