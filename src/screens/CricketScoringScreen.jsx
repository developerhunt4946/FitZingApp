import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Modal,
    FlatList,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
    ArrowLeft, 
    Settings, 
    User, 
    ChevronDown, 
    CheckCircle2,
    Lock,
    X,
    Trophy,
    LayoutList
} from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import { AppButton } from '../components';

// Match Constants
const MAX_OVERS = 5;
const MAX_BALLS = MAX_OVERS * 6;
const MAX_WICKETS = 10;

const TEAM_A_PLAYERS = [
    { id: 'a1', name: 'Ayush Sharma', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'a2', name: 'Virat Kohli', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'a3', name: 'Rohit Sharma', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'a4', name: 'KL Rahul', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'a5', name: 'Hardik Pandya', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'a6', name: 'Jasprit Bumrah', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'a7', name: 'Rishabh Pant', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'a8', name: 'Ravindra Jadeja', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
];

const TEAM_B_PLAYERS = [
    { id: 'b1', name: 'John Doe', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'b2', name: 'Steven Smith', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'b3', name: 'David Warner', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'b4', name: 'Glenn Maxwell', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'b5', name: 'Mitchell Starc', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'b6', name: 'Pat Cummins', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'b7', name: 'Josh Hazlewood', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
    { id: 'b8', name: 'Adam Zampa', runs: 0, balls: 0, sixes: 0, fours: 0, isOut: false, wickets: 0, overs: 0, ballsBowled: 0, runsConceded: 0 },
];

const WICKET_TYPES = [
    'Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket'
];

const CricketScoringScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const params = route?.params;

    // Initial Teams State
    const [teamAPlayers, setTeamAPlayers] = useState(TEAM_A_PLAYERS);
    const [teamBPlayers, setTeamBPlayers] = useState(TEAM_B_PLAYERS);

    // Match Lifecycle State
    const [currentInnings, setCurrentInnings] = useState(1);
    const [isMatchComplete, setIsMatchComplete] = useState(false);
    const [targetScore, setTargetScore] = useState(null);
    const [winnerMessage, setWinnerMessage] = useState('');

    // Scoring State (Reset per innings)
    const [score, setScore] = useState(0);
    const [wickets, setWickets] = useState(0);
    const [overs, setOvers] = useState(0);
    const [balls, setBalls] = useState(0);
    const [currentOverBalls, setCurrentOverBalls] = useState([]);
    const [history, setHistory] = useState([]); // Array of { innings, ball, event, score, wickets, batter, bowler }

    // Selection State
    const [strikerId, setStrikerId] = useState(null);
    const [nonStrikerId, setNonStrikerId] = useState(null);
    const [bowlerId, setBowlerId] = useState(null);
    const [lastBowlerId, setLastBowlerId] = useState(null);

    // Modal States
    const [wicketModalVisible, setWicketModalVisible] = useState(false);
    const [selectionModalVisible, setSelectionModalVisible] = useState(false);
    const [selectionType, setSelectionType] = useState(''); // 'striker', 'nonStriker', 'bowler', 'newBatsman'
    const [overCompleteModalVisible, setOverCompleteModalVisible] = useState(false);
    const [runOutModalVisible, setRunOutModalVisible] = useState(false);
    const [extraRunsModalVisible, setExtraRunsModalVisible] = useState(false);
    const [currentExtraType, setCurrentExtraType] = useState(''); // 'B', 'Lb', 'Wd', 'NB'
    const [inningsCompleteModalVisible, setInningsCompleteModalVisible] = useState(false);
    const [scorecardModalVisible, setScorecardModalVisible] = useState(false);
    const [scorecardTab, setScorecardTab] = useState(1);

    if (!params || !params.tossData || !params.teamAObj || !params.teamBObj) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={[styles.matchTitle, { marginLeft: 20 }]}>Loading Match Info...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const { teamAObj, teamBObj, tossData } = params;

    // Derived Teams
    const battingTeamPlayers = useMemo(() => {
        return currentInnings === 1 
            ? (tossData?.battingTeamId === teamAObj?.id ? teamAPlayers : teamBPlayers)
            : (tossData?.battingTeamId === teamAObj?.id ? teamBPlayers : teamAPlayers);
    }, [currentInnings, teamAPlayers, teamBPlayers, tossData, teamAObj]);
    
    const bowlingTeamPlayers = useMemo(() => {
        return currentInnings === 1 
            ? (tossData?.battingTeamId === teamAObj?.id ? teamBPlayers : teamAPlayers)
            : (tossData?.battingTeamId === teamAObj?.id ? teamAPlayers : teamBPlayers);
    }, [currentInnings, teamAPlayers, teamBPlayers, tossData, teamAObj]);

    const striker = useMemo(() => battingTeamPlayers.find(p => p.id === strikerId), [battingTeamPlayers, strikerId]);
    const nonStriker = useMemo(() => battingTeamPlayers.find(p => p.id === nonStrikerId), [battingTeamPlayers, nonStrikerId]);
    const bowler = useMemo(() => bowlingTeamPlayers.find(p => p.id === bowlerId), [bowlingTeamPlayers, bowlerId]);

    // Initialize players on load or transition
    useEffect(() => {
        if (!strikerId) setStrikerId(battingTeamPlayers[0].id);
        if (!nonStrikerId) setNonStrikerId(battingTeamPlayers[1].id);
        if (!bowlerId) setBowlerId(bowlingTeamPlayers[0].id);
    }, [currentInnings]);

    const updatePlayerStats = (id, stats, isBattingTeam = true) => {
        const updater = isBattingTeam 
            ? (currentInnings === 1 ? (tossData?.battingTeamId === teamAObj?.id ? setTeamAPlayers : setTeamBPlayers) : (tossData?.battingTeamId === teamAObj?.id ? setTeamBPlayers : setTeamAPlayers))
            : (currentInnings === 1 ? (tossData?.battingTeamId === teamAObj?.id ? setTeamBPlayers : setTeamAPlayers) : (tossData?.battingTeamId === teamAObj?.id ? setTeamAPlayers : setTeamBPlayers));
        
        updater(prev => prev.map(p => p.id === id ? { ...p, ...stats } : p));
    };

    const recordHistory = (event, currentScore, currentWickets) => {
        const entry = {
            innings: currentInnings,
            over: overs,
            ball: balls + 1,
            event,
            score: currentScore,
            wickets: currentWickets,
            batter: striker?.name,
            bowler: bowler?.name
        };
        setHistory(prev => [...prev, entry]);
    };

    const checkMatchEnd = (finalScore, finalWickets, finalOvers, finalBalls) => {
        const isAllOut = finalWickets >= MAX_WICKETS;
        const totalBallsPlayed = (finalOvers * 6) + finalBalls;
        const isOversDone = totalBallsPlayed >= MAX_BALLS;

        if (currentInnings === 2) {
            if (finalScore >= targetScore) {
                const bTeamName = tossData?.battingTeamId === teamAObj?.id ? teamBObj?.name : teamAObj?.name;
                setWinnerMessage(`${bTeamName} won by ${MAX_WICKETS - finalWickets} wickets!`);
                setIsMatchComplete(true);
                return true;
            }
            if (isAllOut || isOversDone) {
                if (finalScore < targetScore - 1) {
                    const aTeamName = tossData?.battingTeamId === teamAObj?.id ? teamAObj?.name : teamBObj?.name;
                    setWinnerMessage(`${aTeamName} won by ${targetScore - 1 - finalScore} runs!`);
                } else {
                    setWinnerMessage("Match Tied!");
                }
                setIsMatchComplete(true);
                return true;
            }
        } else {
            if (isAllOut || isOversDone) {
                setInningsCompleteModalVisible(true);
                return true;
            }
        }
        return false;
    };

    const handleRun = (runs, isExtra = false, extraType = '') => {
        if (balls >= 6 && !isExtra) return;
        if (isMatchComplete) return;

        let newScore = score + runs;
        let event = runs.toString();
        let newBalls = balls;

        if (isExtra) {
            if (extraType === 'Wd' || extraType === 'NB') {
                newScore = score + runs + 1;
                event = extraType + (runs > 0 ? `+${runs}` : '');
                setScore(newScore);
                setCurrentOverBalls(prev => [...prev, event]);
                recordHistory(event, newScore, wickets);
                updatePlayerStats(bowlerId, { runsConceded: (bowler.runsConceded || 0) + runs + 1 }, false);
                
                if (extraType === 'NB') {
                    updatePlayerStats(strikerId, {
                        runs: (striker.runs || 0) + runs,
                        balls: (striker.balls || 0) + 1,
                    }, true);
                }

                if (runs % 2 !== 0) switchStriker();
                checkMatchEnd(newScore, wickets, overs, balls);
                return; 
            } else {
                event = (runs > 0 ? runs : '') + extraType;
                newBalls = balls + 1;
                updatePlayerStats(bowlerId, { 
                    ballsBowled: (bowler.ballsBowled || 0) + 1, 
                    runsConceded: (bowler.runsConceded || 0) + runs 
                }, false);
                updatePlayerStats(strikerId, { balls: (striker.balls || 0) + 1 }, true);
                if (runs % 2 !== 0) switchStriker();
            }
        } else {
            newBalls = balls + 1;
            updatePlayerStats(strikerId, {
                runs: (striker.runs || 0) + runs,
                balls: (striker.balls || 0) + 1,
                fours: runs === 4 ? (striker.fours || 0) + 1 : (striker.fours || 0),
                sixes: runs === 6 ? (striker.sixes || 0) + 1 : (striker.sixes || 0),
            }, true);
            updatePlayerStats(bowlerId, {
                runsConceded: (bowler.runsConceded || 0) + runs,
                ballsBowled: (bowler.ballsBowled || 0) + 1,
            }, false);

            if (runs % 2 !== 0) switchStriker();
        }

        setScore(newScore);
        setCurrentOverBalls(prev => [...prev, event]);
        recordHistory(event, newScore, wickets);

        if (!checkMatchEnd(newScore, wickets, overs, newBalls)) {
            if (newBalls >= 6) {
                setBalls(6);
                setOverCompleteModalVisible(true);
            } else {
                setBalls(newBalls);
            }
        }
    };

    const handleWicket = (type) => {
        if (type === 'Run Out') {
            setWicketModalVisible(false);
            setRunOutModalVisible(true);
            return;
        }

        const newWickets = wickets + 1;
        setWickets(newWickets);
        setCurrentOverBalls(prev => [...prev, 'W']);
        setWicketModalVisible(false);
        recordHistory('W', score, newWickets);
        
        updatePlayerStats(strikerId, { isOut: true, balls: (striker.balls || 0) + 1 }, true);
        updatePlayerStats(bowlerId, { wickets: (bowler.wickets || 0) + 1, ballsBowled: (bowler.ballsBowled || 0) + 1 }, false);

        const newBalls = balls + 1;
        if (!checkMatchEnd(score, newWickets, overs, newBalls)) {
            setBalls(newBalls);
            setSelectionType('newBatsman');
            setSelectionModalVisible(true);
        }
    };

    const handleRunOut = () => {
        const newWickets = wickets + 1;
        setWickets(newWickets);
        setCurrentOverBalls(prev => [...prev, 'W']);
        setRunOutModalVisible(false);
        recordHistory('W(RO)', score, newWickets);

        updatePlayerStats(strikerId, { isOut: true }, true);
        const newBalls = balls + 1;
        updatePlayerStats(bowlerId, { ballsBowled: (bowler.ballsBowled || 0) + 1 }, false);

        if (!checkMatchEnd(score, newWickets, overs, newBalls)) {
            setBalls(newBalls);
            setSelectionType('striker');
            setSelectionModalVisible(true);
        }
    };

    const handleExtraRunPress = (type) => {
        setCurrentExtraType(type);
        setExtraRunsModalVisible(true);
    };

    const submitExtraRuns = (runs) => {
        handleRun(runs, true, currentExtraType);
        setExtraRunsModalVisible(false);
    };

    const completeOver = () => {
        setLastBowlerId(bowlerId);
        setOvers(prev => prev + 1);
        setBalls(0);
        setCurrentOverBalls([]);
        switchStriker();
        setOverCompleteModalVisible(false);
        
        const totalBowlerBalls = (bowler.ballsBowled || 0);
        updatePlayerStats(bowlerId, { overs: Math.floor(totalBowlerBalls / 6) }, false);

        if (!isMatchComplete) {
            setSelectionType('bowler');
            setSelectionModalVisible(true);
        }
    };

    const startSecondInnings = () => {
        setTargetScore(score + 1);
        setCurrentInnings(2);
        setScore(0);
        setWickets(0);
        setOvers(0);
        setBalls(0);
        setCurrentOverBalls([]);
        setStrikerId(null);
        setNonStrikerId(null);
        setBowlerId(null);
        setLastBowlerId(null);
        setInningsCompleteModalVisible(false);
    };

    const switchStriker = () => {
        const s = strikerId;
        const ns = nonStrikerId;
        setStrikerId(ns);
        setNonStrikerId(s);
    };

    const openSelectionModal = (type) => {
        if (type === 'bowler' && balls !== 0 && balls !== 6) return;
        setSelectionType(type);
        setSelectionModalVisible(true);
    };

    const selectPlayer = (player) => {
        if (selectionType === 'striker') setStrikerId(player.id);
        else if (selectionType === 'nonStriker') setNonStrikerId(player.id);
        else if (selectionType === 'bowler') setBowlerId(player.id);
        else if (selectionType === 'newBatsman') setStrikerId(player.id);
        
        setSelectionModalVisible(false);

        // If it was the last ball of the over and a batsman was just selected (after a wicket), show over complete
        if ((selectionType === 'newBatsman' || selectionType === 'striker') && balls >= 6) {
            setOverCompleteModalVisible(true);
        }
    };

    const calculateCRR = () => {
        const totalBalls = (overs * 6) + (balls === 6 ? 0 : balls);
        if (totalBalls === 0) return '0.00';
        return ((score / totalBalls) * 6).toFixed(2);
    };

    const isSelectionEnabled = (type) => {
        if (isMatchComplete) return false;
        if (type === 'bowler') return (balls === 0 || balls === 6);
        if (type === 'striker' || type === 'nonStriker') return (selectionType === 'newBatsman' || selectionType === 'striker');
        return false;
    };

    const filteredPlayersForSelection = useMemo(() => {
        if (selectionType === 'bowler') {
            return bowlingTeamPlayers.filter(p => p.id !== lastBowlerId);
        }
        return battingTeamPlayers.filter(p => !p.isOut && p.id !== strikerId && p.id !== nonStrikerId);
    }, [battingTeamPlayers, bowlingTeamPlayers, selectionType, lastBowlerId, strikerId, nonStrikerId]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.matchTitle}>{teamAObj?.name} vs {teamBObj?.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setScorecardModalVisible(true)} style={styles.headerIcon}>
                    <LayoutList size={22} color={COLORS.text} strokeWidth={2.5} />
                </TouchableOpacity>
            </View>

            {/* Scorecard Header */}
            <View style={styles.scoreContainer}>
                <View style={styles.teamScoreInfo}>
                    <Text style={styles.battingTeamName} numberOfLines={1}>
                        {(currentInnings === 1 
                            ? (tossData?.battingTeamId === teamAObj?.id ? teamAObj?.name : teamBObj?.name)
                            : (tossData?.battingTeamId === teamAObj?.id ? teamBObj?.name : teamAObj?.name)) + " (Inn " + currentInnings + ")"}
                    </Text>
                    <View style={styles.scoreRow}>
                        <Text style={styles.mainScore}>{score}/{wickets}</Text>
                        <Text style={styles.overText}>({overs}.{balls === 6 ? 0 : balls})</Text>
                    </View>
                    {targetScore && (
                        <Text style={styles.targetLabel}>Target: {targetScore} (Need {targetScore - score} in {MAX_BALLS - (overs * 6 + balls)} balls)</Text>
                    )}
                </View>
                <View style={styles.crrContainer}>
                    <Text style={styles.crrLabel}>CRR</Text>
                    <Text style={styles.crrValue}>{calculateCRR()}</Text>
                </View>
            </View>

            <ScrollView bounces={false} style={styles.mainContent} contentContainerStyle={styles.scrollContent}>
                {/* Players Section */}
                <View style={styles.playerSection}>
                    <View style={styles.playerCardRow}>
                        <View style={[styles.playerCard, striker && styles.activePlayerCard]}>
                            <View style={styles.playerHeader}>
                                <View style={styles.strikerIndicator}>
                                    <View style={[styles.strikerDot, { backgroundColor: striker ? COLORS.primary : 'transparent' }]} />
                                    <Text style={styles.playerLabel}>Striker</Text>
                                </View>
                                {isSelectionEnabled('striker') && <ChevronDown size={14} color={COLORS.primary} />}
                            </View>
                            <Text style={styles.playerName} numberOfLines={1}>{striker?.name || 'Select'}</Text>
                            <Text style={styles.playerStats}>{striker?.runs || 0} <Text style={styles.statsBalls}>({striker?.balls || 0})</Text></Text>
                        </View>

                        <View style={styles.playerCard}>
                            <View style={styles.playerHeader}>
                                <Text style={styles.playerLabel}>Non-Striker</Text>
                                {isSelectionEnabled('nonStriker') && <ChevronDown size={14} color={COLORS.textTertiary} />}
                            </View>
                            <Text style={styles.playerName} numberOfLines={1}>{nonStriker?.name || 'Select'}</Text>
                            <Text style={styles.playerStats}>{nonStriker?.runs || 0} <Text style={styles.statsBalls}>({nonStriker?.balls || 0})</Text></Text>
                        </View>
                    </View>

                    {/* Bowler Selection */}
                    <TouchableOpacity 
                        style={[styles.bowlerCard, !isSelectionEnabled('bowler') && { opacity: 0.8 }]} 
                        onPress={() => isSelectionEnabled('bowler') && openSelectionModal('bowler')}
                        activeOpacity={isSelectionEnabled('bowler') ? 0.7 : 1}
                    >
                        <View style={styles.bowlerInfo}>
                            <View style={styles.bowlerIconContainer}>
                                <User size={20} color={COLORS.secondary} />
                            </View>
                            <View>
                                <Text style={styles.playerLabel}>Bowler</Text>
                                <Text style={styles.bowlerName}>{bowler?.name || 'Select Bowler'}</Text>
                            </View>
                        </View>
                        <View style={styles.bowlerStatsContainer}>
                            <Text style={styles.bowlerStats}>
                                {bowler?.wickets || 0}-{bowler?.runsConceded || 0} ({bowler?.overs || 0}.{ (bowler?.ballsBowled || 0) % 6 })
                            </Text>
                            {isSelectionEnabled('bowler') && <ChevronDown size={16} color={COLORS.textTertiary} />}
                        </View>
                    </TouchableOpacity>

                    {/* This Over Balls */}
                    <View style={styles.overFlowContainer}>
                        <Text style={styles.overFlowLabel}>THIS OVER:</Text>
                        <View style={styles.ballsList}>
                            {currentOverBalls.length === 0 ? (
                                <Text style={styles.emptyOverText}>Over started...</Text>
                            ) : (
                                currentOverBalls.map((event, index) => (
                                    <View key={index} style={[styles.ballCircle, getBallStyles(event)]}>
                                        <Text style={[styles.ballText, { color: getBallTextColor(event) }]}>{event}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                </View>

                {/* Scoring Panel */}
                <View style={[styles.scoringPanel, (balls >= 6 || isMatchComplete) && { opacity: 0.3 }]} pointerEvents={(balls >= 6 || isMatchComplete) ? 'none' : 'auto'}>
                    <View style={styles.scoringRow}>
                        {[0, 1, 2, 3].map(run => (
                            <TouchableOpacity key={run} style={styles.scoreBtn} onPress={() => handleRun(run)}>
                                <Text style={styles.scoreBtnText}>{run}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.scoringRow}>
                        <TouchableOpacity style={[styles.scoreBtn, styles.boundaryFour]} onPress={() => handleRun(4)}>
                            <Text style={styles.boundaryText}>4</Text>
                            <Text style={styles.boundaryLabel}>FOUR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.scoreBtn, styles.boundarySix]} onPress={() => handleRun(6)}>
                            <Text style={styles.boundaryText}>6</Text>
                            <Text style={styles.boundaryLabel}>SIX</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.scoreBtn, styles.wicketBtn]} onPress={() => setWicketModalVisible(true)}>
                            <Text style={[styles.scoreBtnText, { color: COLORS.white }]}>OUT</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.scoringRow}>
                        {['Wd', 'NB', 'Lb', 'B'].map(extra => (
                            <TouchableOpacity key={extra} style={[styles.extraBtn]} onPress={() => handleExtraRunPress(extra)}>
                                <Text style={styles.extraBtnText}>{extra}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    {balls >= 6 && !isMatchComplete && overs < MAX_OVERS && (
                        <AppButton title="COMPLETE OVER" onPress={completeOver} containerStyle={styles.actionBtn} />
                    )}
                    {currentInnings === 1 && (wickets >= MAX_WICKETS || overs >= MAX_OVERS || (overs === MAX_OVERS - 1 && balls >= 6)) && (
                        <AppButton 
                            title="Complete Inn." 
                            onPress={() => setInningsCompleteModalVisible(true)}
                            variant="primary"
                            containerStyle={[styles.actionBtn, styles.completeInnBtn]}
                            textStyle={styles.completeInnText}
                        />
                    )}
                    {isMatchComplete && (
                        <AppButton title="MATCH COMPLETED" variant="secondary" containerStyle={styles.actionBtn} disable={true} />
                    )}
                </View>
            </ScrollView>

            {/* Scorecard Modal */}
            <Modal visible={scorecardModalVisible} animationType="slide">
                <SafeAreaView style={styles.scorecardModal}>
                    <View style={styles.scorecardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.scorecardTitle}>Match Scorecard</Text>
                            <Text style={styles.scorecardSubtitle}>{teamAObj?.name} vs {teamBObj?.name}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setScorecardModalVisible(false)} style={styles.closeIcon}>
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Innings Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity 
                            style={[styles.tab, scorecardTab === 1 && styles.activeTab]} 
                            onPress={() => setScorecardTab(1)}
                        >
                            <Text style={[styles.tabText, scorecardTab === 1 && styles.activeTabText]}>Innings 1</Text>
                        </TouchableOpacity>
                        {currentInnings >= 2 && (
                            <TouchableOpacity 
                                style={[styles.tab, scorecardTab === 2 && styles.activeTab]} 
                                onPress={() => setScorecardTab(2)}
                            >
                                <Text style={[styles.tabText, scorecardTab === 2 && styles.activeTabText]}>Innings 2</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    <ScrollView style={{ flex: 1 }}>
                        <View style={styles.scorecardSection}>
                            <Text style={styles.sectionTitle}>BATTING</Text>
                            <View style={styles.statsTableHeader}>
                                <Text style={[styles.colName, { flex: 4 }]}>Batter</Text>
                                <Text style={styles.colRuns}>R</Text>
                                <Text style={styles.colStats}>B</Text>
                                <Text style={styles.colStats}>4s</Text>
                                <Text style={styles.colStats}>6s</Text>
                                <Text style={styles.colSR}>SR</Text>
                            </View>
                            {(scorecardTab === currentInnings 
                                ? (scorecardTab === 1 
                                    ? (tossData?.battingTeamId === teamAObj?.id ? teamAPlayers : teamBPlayers)
                                    : (tossData?.battingTeamId === teamAObj?.id ? teamBPlayers : teamAPlayers))
                                : (scorecardTab === 1 
                                    ? (tossData?.battingTeamId === teamAObj?.id ? teamAPlayers : teamBPlayers)
                                    : (tossData?.battingTeamId === teamAObj?.id ? teamBPlayers : teamAPlayers))
                            ).filter(p => p.balls > 0 || (scorecardTab === currentInnings && (p.id === strikerId || p.id === nonStrikerId))).map((p) => (
                                <View key={p.id} style={styles.statsTableRow}>
                                    <View style={{ flex: 4 }}>
                                        <Text style={styles.batterName}>{p.name}{ (scorecardTab === currentInnings && (p.id === strikerId || p.id === nonStrikerId)) ? '*' : ''}</Text>
                                        <Text style={styles.batterStatus}>{p.isOut ? 'out' : 'not out'}</Text>
                                    </View>
                                    <Text style={styles.colRuns}>{p.runs}</Text>
                                    <Text style={styles.colStats}>{p.balls}</Text>
                                    <Text style={styles.colStats}>{p.fours}</Text>
                                    <Text style={styles.colStats}>{p.sixes}</Text>
                                    <Text style={styles.colSR}>{p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(1) : '0.0'}</Text>
                                </View>
                            ))}
                            {/* Total Row */}
                            <View style={[styles.statsTableRow, { backgroundColor: COLORS.background + '50', borderBottomWidth: 0 }]}>
                                <Text style={[styles.batterName, { flex: 4 }]}>TOTAL</Text>
                                <Text style={[styles.colRuns, { width: 'auto', flex: 1, textAlign: 'right', paddingRight: 10 }]}>
                                    {scorecardTab === currentInnings ? score : history.filter(h => h.innings === scorecardTab).slice(-1)[0]?.score || 0}
                                    /
                                    {scorecardTab === currentInnings ? wickets : history.filter(h => h.innings === scorecardTab).slice(-1)[0]?.wickets || 0}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.scorecardSection}>
                            <Text style={styles.sectionTitle}>BOWLING</Text>
                            <View style={styles.statsTableHeader}>
                                <Text style={[styles.colName, { flex: 4 }]}>Bowler</Text>
                                <Text style={styles.colStats}>O</Text>
                                <Text style={styles.colStats}>R</Text>
                                <Text style={styles.colStats}>W</Text>
                                <Text style={styles.colSR}>Econ</Text>
                            </View>
                            {(scorecardTab === 1 
                                ? (tossData?.battingTeamId === teamAObj?.id ? teamBPlayers : teamAPlayers)
                                : (tossData?.battingTeamId === teamAObj?.id ? teamAPlayers : teamBPlayers)
                            ).filter(p => p.ballsBowled > 0 || p.id === bowlerId).map((p) => (
                                <View key={p.id} style={styles.statsTableRow}>
                                    <Text style={[styles.batterName, { flex: 4 }]}>{p.name}</Text>
                                    <Text style={styles.colStats}>{p.overs}.{p.ballsBowled % 6}</Text>
                                    <Text style={styles.colStats}>{p.runsConceded}</Text>
                                    <Text style={styles.colStats}>{p.wickets}</Text>
                                    <Text style={styles.colSR}>
                                        {p.ballsBowled > 0 ? ((p.runsConceded / p.ballsBowled) * 6).toFixed(2) : '0.00'}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.scorecardSection}>
                            <Text style={styles.sectionTitle}>TIMELINE (BALL BY BALL)</Text>
                            {history.filter(h => h.innings === scorecardTab).map((h, i) => (
                                <View key={i} style={styles.historyRow}>
                                    <Text style={styles.historyOver}>{h.over}.{h.ball}</Text>
                                    <Text style={styles.historyDetail}>{h.bowler} to {h.batter}: <Text style={{fontWeight:'900', color: scorecardTab === 1 ? COLORS.primary : COLORS.secondary}}>{h.event}</Text></Text>
                                    <Text style={styles.historyRunning}>{h.score}/{h.wickets}</Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Innings transition Modal */}
            {inningsCompleteModalVisible && (
                <View style={styles.overlayMessage}>
                    <View style={styles.messageBox}>
                        <CheckCircle2 size={50} color={COLORS.success} />
                        <Text style={styles.messageTitle}>Innings Over!</Text>
                        <Text style={styles.messageScore}>{score}/{wickets} in {overs}.{balls === 6 ? 0 : balls} ov</Text>
                        <Text style={styles.messageText}>Target for next innings: <Text style={{ fontWeight: '900', color: COLORS.primary }}>{score + 1}</Text></Text>
                        <AppButton title="START 2ND INNINGS" containerStyle={{ width: '100%', marginTop: 20 }} onPress={startSecondInnings} />
                    </View>
                </View>
            )}

            {/* Match Complete Modal */}
            {isMatchComplete && (
                <View style={styles.overlayMessage}>
                    <View style={styles.messageBox}>
                        <Trophy size={60} color="#FFD700" />
                        <Text style={styles.messageTitle}>Match Complete!</Text>
                        <Text style={styles.winnerAnnounce}>{winnerMessage}</Text>
                        <TouchableOpacity style={styles.viewScoreBtn} onPress={() => setScorecardModalVisible(true)}>
                            <Text style={styles.viewScoreText}>Show Scorecard</Text>
                        </TouchableOpacity>
                        <AppButton title="BACK TO HOME" variant="primary" containerStyle={{ width: '100%', marginTop: 10 }} onPress={() => navigation.navigate('Home')} />
                    </View>
                </View>
            )}

            {/* Selection Modal */}
            <Modal visible={selectionModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.selectionModal}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { flex: 1 }]}>Select {selectionType === 'bowler' ? 'Bowler' : 'Batsman'}</Text>
                            <TouchableOpacity onPress={() => setSelectionModalVisible(false)} style={{ padding: 4 }}>
                                <X size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={filteredPlayersForSelection}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.playerSelectItem} onPress={() => selectPlayer(item)}>
                                    <Text style={styles.playerSelectItemText}>{item.name}</Text>
                                    <CheckCircle2 size={16} color={COLORS.primary} opacity={ (item.id === strikerId || item.id === nonStrikerId || item.id === bowlerId) ? 1 : 0} />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <Text style={{ color: COLORS.textTertiary }}>No available players found</Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Extra Runs Modal */}
            <Modal visible={extraRunsModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.wicketModal}>
                        <Text style={styles.modalTitle}>Runs for {currentExtraType === 'B' ? 'Byes' : currentExtraType === 'Lb' ? 'Leg Byes' : currentExtraType === 'Wd' ? 'Wide' : 'No Ball'}</Text>
                        <View style={styles.wicketGrid}>
                            {[0, 1, 2, 3, 4, 6].map(run => (
                                <TouchableOpacity key={run} style={styles.wicketTypeBtn} onPress={() => submitExtraRuns(run)}>
                                    <Text style={styles.wicketBtnText}>{currentExtraType === 'Wd' || currentExtraType === 'NB' ? `${currentExtraType}+${run}` : `${run} Run${run !== 1 ? 's' : ''}`}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setExtraRunsModalVisible(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Wicket Modal */}
            <Modal visible={wicketModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.wicketModal}>
                        <Text style={styles.modalTitle}>Select Wicket Type</Text>
                        <View style={styles.wicketGrid}>
                            {WICKET_TYPES.map(type => (
                                <TouchableOpacity key={type} style={styles.wicketTypeBtn} onPress={() => handleWicket(type)}>
                                    <Text style={styles.wicketBtnText}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setWicketModalVisible(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Run Out Modal */}
            <Modal visible={runOutModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.wicketModal}>
                        <Text style={styles.modalTitle}>Run Out!</Text>
                        <Text style={styles.modalSubtitle}>Please select the new striker and non-striker for the next ball.</Text>
                        <TouchableOpacity style={styles.choiceBtn} onPress={handleRunOut}>
                            <Text style={styles.choiceBtnText}>Select Players</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setRunOutModalVisible(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Over Complete Message */}
            {overCompleteModalVisible && (
                <View style={styles.overlayMessage}>
                    <View style={styles.messageBox}>
                        <CheckCircle2 size={40} color={COLORS.success} />
                        <Text style={styles.messageTitle}>Over Complete!</Text>
                        <Text style={styles.messageText}>The current over has been completed. Please proceed to the next over.</Text>
                        <View style={{ width: '100%', marginTop: 24, gap: 12 }}>
                            <AppButton title="COMPLETE OVER" onPress={completeOver} />
                            <TouchableOpacity style={{ alignSelf: 'center', padding: 10 }} onPress={() => setOverCompleteModalVisible(false)}>
                                <Text style={{ color: COLORS.textSecondary, fontWeight: '700' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const getBallStyles = (event) => {
    let bgColor = COLORS.background;
    if (event.includes('4')) bgColor = COLORS.primary;
    else if (event.includes('6')) bgColor = COLORS.secondary;
    else if (event === 'W' || event.includes('W(')) bgColor = COLORS.error;
    else if (event.includes('Wd') || event.includes('NB') || event.includes('Lb') || event.includes('B')) bgColor = COLORS.warning;
    return { backgroundColor: bgColor };
};

const getBallTextColor = (event) => {
    if (event.includes('4') || event.includes('6') || event === 'W' || event.includes('W(')) return COLORS.white;
    return COLORS.text;
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING['16'],
        paddingVertical: 12,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    headerIcon: { padding: 8 },
    headerCenter: { flex: 1, alignItems: 'center' },
    matchTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textTertiary, textTransform: 'uppercase' },
    scoreContainer: {
        backgroundColor: COLORS.surface,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20,
    },
    teamScoreInfo: { flex: 1 },
    battingTeamName: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
    scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    mainScore: { fontSize: 36, fontWeight: '900', color: COLORS.text },
    overText: { fontSize: 16, fontWeight: '700', color: COLORS.textTertiary },
    targetLabel: { fontSize: 12, fontWeight: '700', color: COLORS.error, marginTop: 4 },
    crrContainer: { alignItems: 'flex-end' },
    crrLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textTertiary },
    crrValue: { fontSize: 18, fontWeight: '900', color: COLORS.text },
    mainContent: { flex: 1 },
    scrollContent: { padding: SPACING['16'], paddingBottom: 60 },
    playerSection: { marginBottom: 20 },
    playerCardRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    playerCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.borderLight, elevation: 2 },
    activePlayerCard: { borderColor: COLORS.primary, borderWidth: 2, elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    strikerIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    strikerDot: { width: 8, height: 8, borderRadius: 4 },
    playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    playerLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textTertiary, textTransform: 'uppercase' },
    playerName: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
    playerStats: { fontSize: 16, fontWeight: '900', color: COLORS.text },
    statsBalls: { fontSize: 12, fontWeight: '600', color: COLORS.textTertiary },
    bowlerCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: 16, elevation: 2 },
    bowlerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    bowlerIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.secondary + '10', alignItems: 'center', justifyContent: 'center' },
    bowlerName: { fontSize: 14, fontWeight: '800', color: COLORS.text },
    bowlerStatsContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    bowlerStats: { fontSize: 13, fontWeight: '800', color: COLORS.secondary },
    overFlowContainer: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: COLORS.borderLight },
    overFlowLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textTertiary, marginBottom: 10 },
    ballsList: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    ballCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.borderLight },
    ballText: { fontSize: 11, fontWeight: '900' },
    emptyOverText: { fontSize: 12, fontStyle: 'italic', color: COLORS.textTertiary },
    scoringPanel: { gap: 12, marginBottom: 24 },
    scoringRow: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
    scoreBtn: { flex: 1, height: 52, backgroundColor: COLORS.surface, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.borderLight, elevation: 3 },
    scoreBtnText: { fontSize: 18, fontWeight: '900', color: COLORS.text },
    boundaryFour: { backgroundColor: '#E3F2FD', borderColor: '#2196F3', borderWidth: 1.5 },
    boundarySix: { backgroundColor: '#F3E5F5', borderColor: '#9C27B0', borderWidth: 1.5 },
    boundaryText: { fontSize: 20, fontWeight: '900', color: COLORS.text, lineHeight: 24 },
    boundaryLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textTertiary, marginTop: -2 },
    wicketBtn: { backgroundColor: COLORS.error, borderColor: COLORS.error },
    extraBtn: { flex: 1, height: 44, backgroundColor: COLORS.surface, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.warning + '50' },
    extraBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.warning },
    actionButtons: { flexDirection: 'row', gap: 12, marginVertical: 20, paddingHorizontal: 4, alignItems: 'center' },
    actionBtn: { flex: 1, height: 54 },
    completeInnBtn: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary, elevation: 8 },
    completeInnText: { fontSize: 15, fontWeight: '900' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    selectionModal: { backgroundColor: COLORS.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '70%', padding: 20, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },
    playerSelectItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    playerSelectItemText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    wicketModal: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, margin: 20, alignSelf: 'center', width: '90%', elevation: 20 },
    wicketGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20, marginBottom: 20, justifyContent: 'center' },
    wicketTypeBtn: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight },
    wicketBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    choiceBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
    choiceBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
    cancelBtn: { alignItems: 'center', padding: 12 },
    cancelBtnText: { color: COLORS.error, fontWeight: '800', fontSize: 14 },
    overlayMessage: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    messageBox: { backgroundColor: COLORS.surface, padding: 30, borderRadius: 24, alignItems: 'center', width: '85%' },
    messageTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginTop: 16, marginBottom: 8 },
    messageScore: { fontSize: 32, fontWeight: '900', color: COLORS.primary, marginBottom: 12 },
    messageText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
    winnerAnnounce: { fontSize: 20, fontWeight: '800', color: COLORS.primary, textAlign: 'center', marginVertical: 15 },
    viewScoreBtn: { padding: 15, marginVertical: 10 },
    viewScoreText: { color: COLORS.secondary, fontWeight: '800', textDecorationLine: 'underline' },
    scorecardModal: { flex: 1, backgroundColor: COLORS.background },
    scorecardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    scorecardTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text },
    scorecardSubtitle: { fontSize: 12, fontWeight: '600', color: COLORS.textTertiary, textTransform: 'uppercase' },
    closeIcon: { padding: 5 },
    tabContainer: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: COLORS.background },
    activeTab: { backgroundColor: COLORS.primary },
    tabText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
    activeTabText: { color: COLORS.white },
    scorecardSection: { backgroundColor: COLORS.surface, marginVertical: 10, paddingBottom: 10 },
    sectionTitle: { fontSize: 11, fontWeight: '900', color: COLORS.textTertiary, padding: 15, backgroundColor: COLORS.background, letterSpacing: 1 },
    statsTableHeader: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, backgroundColor: COLORS.surface },
    statsTableRow: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, alignItems: 'center' },
    colName: { fontSize: 11, fontWeight: '800', color: COLORS.textTertiary },
    colRuns: { width: 35, fontSize: 11, fontWeight: '800', color: COLORS.textTertiary, textAlign: 'center' },
    colStats: { width: 35, fontSize: 11, fontWeight: '800', color: COLORS.textTertiary, textAlign: 'center' },
    colSR: { width: 50, fontSize: 11, fontWeight: '800', color: COLORS.textTertiary, textAlign: 'center' },
    batterName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    batterStatus: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
    innTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 15 },
    historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    historyOver: { width: 40, fontSize: 12, fontWeight: '700', color: COLORS.textTertiary },
    historyDetail: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
    historyRunning: { fontSize: 12, fontWeight: '800', color: COLORS.text }
});

export default CricketScoringScreen;
