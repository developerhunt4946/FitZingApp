import React, { useState, useMemo, useEffect, useRef } from 'react';
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
    ActivityIndicator,
    Alert,
    AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cricketScoringService from '../services/cricketScoringService';
import { COLORS, SPACING } from '../theme';
import { LayoutList, ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Trophy, User, Users, X, RefreshCw, Plus, Minus, ChevronLeft, ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon, Trophy as TrophyIcon, User as UserIcon, Users as UsersIcon, X as XIcon, RefreshCw as RefreshCwIcon, Plus as PlusIcon, Minus as MinusIcon, ChevronLeft as ChevronLeftIcon2, ChevronRight as ChevronRightIcon2, Trophy as TrophyIcon2, User as UserIcon2, Users as UsersIcon2, X as XIcon2, RefreshCw as RefreshCwIcon2, Plus as PlusIcon2, Minus as MinusIcon2 } from 'lucide-react-native'
import { AppButton, AppAlert } from '../components';

const WICKET_TYPES = [
    'Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket'
];

const CricketScoringScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const params = route?.params;

    // API Data State
    const [isLoading, setIsLoading] = useState(true);
    const [fixture, setFixture] = useState(null);
    const [activeInningsData, setActiveInningsData] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [overBalls, setOverBalls] = useState([]); // Array of ball objects for current over

    // Initial Teams State
    const [teamAPlayers, setTeamAPlayers] = useState([]);
    const [teamBPlayers, setTeamBPlayers] = useState([]);

    // Match Constants (to be updated from API)
    const [maxOvers, setMaxOvers] = useState(5);
    const [maxWickets, setMaxWickets] = useState(10);

    // Match Lifecycle State
    const [currentInnings, setCurrentInnings] = useState(1);
    const [isMatchComplete, setIsMatchComplete] = useState(false);
    const [targetScore, setTargetScore] = useState(null);
    const [winnerMessage, setWinnerMessage] = useState('');

    // Scoring State
    const [score, setScore] = useState(0);
    const [wickets, setWickets] = useState(0);
    const [overs, setOvers] = useState(0);
    const [balls, setBalls] = useState(0);
    const [currentOverBalls, setCurrentOverBalls] = useState([]);
    const [history, setHistory] = useState([]);

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
    const [allInnings, setAllInnings] = useState([]);
    const [matchSummaryVisible, setMatchSummaryVisible] = useState(false);

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

    // Selection State
    const [strikerId, setStrikerId] = useState(null);
    const [nonStrikerId, setNonStrikerId] = useState(null);
    const [bowlerId, setBowlerId] = useState(null);
    const [lastBowlerId, setLastBowlerId] = useState(null);
    const fetchMatchData = async () => {
        if (!params?.fixtureId) return;

        try {
            setIsLoading(true);
            const response = await cricketScoringService.getFixtureDetails(params.fixtureId);

            if (response.status === 'success' && response.data) {
                const { fixture: f, activeInnings } = response.data;
                setFixture(f);
                setActiveInningsData(activeInnings);

                // Set Match Constants
                const oversLimit = f.oversLimit || f.tournament?.oversPerInnings || 5;
                setMaxOvers(oversLimit);
                // maxWickets will be derived from battingTeamPlayers length - 1

                // Map Players
                const mapPlayers = (players) => players.map(p => ({
                    id: p.id,
                    userId: p.userId || p.id,
                    name: `${p.firstName} ${p.lastName}`.trim(),
                    runs: 0,
                    balls: 0,
                    sixes: 0,
                    fours: 0,
                    isOut: false,
                    wickets: 0,
                    overs: 0,
                    ballsBowled: 0,
                    runsConceded: 0
                }));

                const tAPlayers = mapPlayers(f.teamAObj?.players || []);
                const tBPlayers = mapPlayers(f.teamBObj?.players || []);
                setTeamAPlayers(tAPlayers);
                setTeamBPlayers(tBPlayers);

                // Initialize Scoring from activeInnings
                if (activeInnings) {
                    setCurrentInnings(activeInnings.inningsNo || 1);
                    setScore(activeInnings.totalRuns || 0);
                    setWickets(activeInnings.wickets || 0);

                    const oversPlayed = activeInnings.oversPlayed || 0;
                    setOvers(Math.floor(oversPlayed));
                    setBalls(Math.round((oversPlayed % 1) * 10));
                }

                // Seed initial player selections (will be overwritten by fetchScoreboard)
                const battingPlayers = activeInnings?.inningsNo === 2
                    ? (f.battingTeamId === f.teamA ? tBPlayers : tAPlayers)
                    : (f.battingTeamId === f.teamA ? tAPlayers : tBPlayers);

                const bowlingPlayers = activeInnings?.inningsNo === 2
                    ? (f.battingTeamId === f.teamA ? tAPlayers : tBPlayers)
                    : (f.battingTeamId === f.teamA ? tBPlayers : tAPlayers);

                if (battingPlayers.length >= 2) {
                    setStrikerId(battingPlayers[0].id);
                    setNonStrikerId(battingPlayers[1].id);
                }
                if (bowlingPlayers.length >= 1) {
                    setBowlerId(bowlingPlayers[0].id);
                }

                // Return fresh arrays so the caller can pass them to fetchScoreboard
                return { tAPlayers, tBPlayers, freshFixture: f };
            }
        } catch (error) {
            console.error('Error fetching match data:', error);
            Alert.alert('Error', 'Failed to fetch latest match data');
        } finally {
            setIsLoading(false);
        }
        return null;
    };
    const syncPendingBallsLocally = async (freshFixture, freshTAPlayers, freshTBPlayers) => {
        if (!params?.fixtureId || !freshFixture) return null;
        try {
            const stored = await AsyncStorage.getItem(`over_balls_${params.fixtureId}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.length > 0) {
                    const { teamAObj, teamBObj } = freshFixture;
                    const tossData = {
                        tossWinnerId: freshFixture.tossWinnerId,
                        tossDecision: freshFixture.tossDecision,
                        battingTeamId: freshFixture.battingTeamId,
                        bowlingTeamId: freshFixture.bowlingTeamId
                    };

                    const inningsNo = activeInningsData?.inningsNo || currentInnings;

                    const payload = {
                        battingTeamId: inningsNo === 1
                            ? (tossData?.battingTeamId === teamAObj?.id ? teamAObj?.id : teamBObj?.id)
                            : (tossData?.battingTeamId === teamAObj?.id ? teamBObj?.id : teamAObj?.id),
                        bowlingTeamId: inningsNo === 1
                            ? (tossData?.battingTeamId === teamAObj?.id ? teamBObj?.id : teamAObj?.id)
                            : (tossData?.battingTeamId === teamAObj?.id ? teamAObj?.id : teamBObj?.id),
                        balls: parsed,
                    };

                    setIsSyncing(true);
                    await cricketScoringService.submitBallStats(params.fixtureId, payload);
                    await AsyncStorage.removeItem(`over_balls_${params.fixtureId}`);
                    setOverBalls([]);
                    setIsSyncing(false);
                    return true; // Sync was successful
                }
            }
        } catch (err) {
            console.error('Error auto-syncing pending local balls:', err);
            setIsSyncing(false);
            return false; // Sync failed (e.g. offline)
        }
        return null; // Nothing to sync
    };

    // Fetch Fixture Details -> Sync Offline Balls -> then Fetch Scoreboard
    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            const data = await fetchMatchData();
            if (data) {
                const { tAPlayers, tBPlayers, freshFixture } = data;

                // Attempt to sync any unsaved offline balls before fetching scoreboard
                const syncResult = await syncPendingBallsLocally(freshFixture, tAPlayers, tBPlayers);

                // Fetch the definitive state from the server
                await fetchScoreboard(tAPlayers, tBPlayers, syncResult === false);
            }
            setIsLoading(false);
        };
        initData();
    }, [params?.fixtureId]);

    /**
     * Fetches the live scoreboard from the DB and syncs player stats,
     * active striker/non-striker/bowler identities, and current score.
     *
     * @param {Array} freshTAPlayers - Team A players array freshly built by fetchMatchData.
     * @param {Array} freshTBPlayers - Team B players array.
     * @param {boolean} applyOfflineFallback - If true, unsynced local balls couldn't be uploaded,
     *                                         so we must manually apply them on top of the fetched score.
     */
    const fetchScoreboard = async (freshTAPlayers = null, freshTBPlayers = null, applyOfflineFallback = false) => {
        if (!params?.fixtureId) return;
        try {
            const response = await cricketScoringService.getScoreboard(params.fixtureId);
            if (response.status !== 'success' || !response.data) return;

            const { innings } = response.data;
            if (!innings || innings.length === 0) return;

            // Manually calculate extras breakdown from recentBalls for each inning
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

            setAllInnings(processedInnings);

            // Find the first incomplete inning. If all are complete, take the last one.
            let activeInn = processedInnings.find(inn => !inn.isCompleted);
            if (!activeInn) {
                activeInn = processedInnings[processedInnings.length - 1];
            }

            // --- Base Server Score ---
            let serverScore = 0;
            let serverWickets = 0;
            let serverOvers = 0;
            let serverBalls = 0;
            let serverOverBallsDisplay = [];

            const [runsStr, wktsStr] = (activeInn.score || '0/0').split('/');
            serverScore = parseInt(runsStr, 10) || 0;
            serverWickets = parseInt(wktsStr, 10) || 0;
            const oversPlayed = activeInn.oversPlayed || 0;
            serverOvers = Math.floor(oversPlayed);
            serverBalls = Math.round((oversPlayed % 1) * 10);
            setCurrentInnings(activeInn.inningsNo || 1);

            // --- Set Target Score if Inning 2 is starting/active ---
            if (innings.length > 1) {
                const inn1 = innings[0];
                const [inn1Runs] = (inn1.score || '0/0').split('/');
                setTargetScore(parseInt(inn1Runs, 10) + 1);
            } else {
                setTargetScore(null);
            }

            const isMidOver = (oversPlayed % 1) !== 0;
            if (isMidOver && activeInn.recentBalls && activeInn.recentBalls.length > 0) {
                // Slicing logic to only get balls from the current unfinished over
                let legalCount = 0;
                let sliceStartIndex = activeInn.recentBalls.length - 1;

                for (let i = activeInn.recentBalls.length - 1; i >= 0; i--) {
                    const b = activeInn.recentBalls[i];
                    // Wides and No-balls don't count as legal deliveries
                    if (b.extraType !== 'wide' && b.extraType !== 'no-ball') {
                        legalCount++;
                    }
                    if (legalCount >= serverBalls) {
                        sliceStartIndex = i;
                        break;
                    }
                }

                // If somehow the backend didn't send enough balls to fulfill serverBalls, we just take what we have
                if (legalCount < serverBalls) {
                    sliceStartIndex = 0;
                }

                const currentOverRecentBalls = activeInn.recentBalls.slice(sliceStartIndex);

                serverOverBallsDisplay = currentOverRecentBalls.map(b => {
                    if (b.isWicket) return 'W';
                    if (b.extraType === 'wide') return (b.extraRuns && b.extraRuns > 1) ? `Wd+${b.extraRuns - 1}` : 'Wd';
                    if (b.extraType === 'no-ball') return (b.extraRuns && b.extraRuns > 1) ? `NB+${b.extraRuns - 1}` : 'NB'; // Usually "extraRuns" for NB is runs from bat + 1 for NB.
                    if (b.extraType === 'leg-bye') return `${b.extraRuns > 0 ? b.extraRuns : (b.runs > 0 ? b.runs : '')}Lb`;
                    if (b.extraType === 'bye') return `${b.extraRuns > 0 ? b.extraRuns : (b.runs > 0 ? b.runs : '')}B`;
                    return String(b.runs);
                });
            }

            // --- Apply Offline Fallback if auto-sync failed ---
            if (applyOfflineFallback) {
                try {
                    const stored = await AsyncStorage.getItem(`over_balls_${params.fixtureId}`);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        setOverBalls(parsed); // Restore state for future syncs

                        let offlineExtraScore = 0;
                        let offlineExtraWickets = 0;
                        let offlineExtraBalls = 0;
                        let offlineBallsDisplay = [];

                        parsed.forEach(b => {
                            if (b.isWicket) {
                                offlineExtraWickets += 1;
                                offlineBallsDisplay.push('W');
                            } else {
                                offlineExtraScore += b.runs + (b.extraRuns || 0);

                                if (b.extraType === 'wide') offlineBallsDisplay.push(b.extraRuns > 1 ? `Wd+${b.extraRuns - 1}` : 'Wd');
                                else if (b.extraType === 'no-ball') offlineBallsDisplay.push(b.runs > 0 ? `NB+${b.runs}` : 'NB');
                                else if (b.extraType === 'leg-bye') offlineBallsDisplay.push(`${b.runs > 0 ? b.runs : ''}Lb`);
                                else if (b.extraType === 'bye') offlineBallsDisplay.push(`${b.runs > 0 ? b.runs : ''}B`);
                                else offlineBallsDisplay.push(String(b.runs));
                            }
                            // Wide and No-Ball do not count as legal deliveries
                            if (b.extraType !== 'wide' && b.extraType !== 'no-ball') {
                                offlineExtraBalls += 1;
                            }
                        });

                        serverScore += offlineExtraScore;
                        serverWickets += offlineExtraWickets;
                        serverBalls += offlineExtraBalls;
                        if (serverBalls >= 6) {
                            serverOvers += Math.floor(serverBalls / 6);
                            serverBalls = serverBalls % 6;
                        }
                        serverOverBallsDisplay = [...serverOverBallsDisplay, ...offlineBallsDisplay];
                    }
                } catch (e) {
                    console.error("Error applying offline fallback balls to scoreboard", e);
                }
            } else {
                // Normal sync successful, state is 100% accurate from server
                setOverBalls([]);
            }

            // --- Set Final Display State ---
            setScore(serverScore);
            setWickets(serverWickets);
            setOvers(serverOvers);
            setBalls(serverBalls);
            if (serverBalls === 0 && !isMidOver && serverOverBallsDisplay.length === 0) {
                setCurrentOverBalls([]); // Fresh over
            } else {
                setCurrentOverBalls(serverOverBallsDisplay);
            }

            // --- Build merged player arrays (batting + bowling in one pass each) ---
            // NOTE: The scoreboard batting[].player.id is the user's UUID.
            // The fixture's player.userId should also be the user's UUID.
            // However some API versions return id=userId without a separate userId field,
            // so we match against BOTH player.userId and player.id as a safe fallback.
            const matchesPlayer = (apiPlayerId, player) =>
                apiPlayerId === player.userId || apiPlayerId === player.id;

            const applyStats = (players) => players.map(player => {
                let updated = { ...player };

                // Iterate through all innings to get cumulative/relevant stats
                innings.forEach(inn => {
                    // Batting stats
                    if (inn.batting) {
                        const bat = inn.batting.find(b => matchesPlayer(b.player.id, player));
                        if (bat) {
                            updated.runs = bat.runs ?? updated.runs;
                            updated.balls = bat.ballsFaced ?? updated.balls;
                            updated.fours = bat.fours ?? updated.fours;
                            updated.sixes = bat.sixes ?? updated.sixes;
                            updated.isOut = bat.dismissal !== 'Not Out';
                        }
                    }

                    // Bowling stats
                    if (inn.bowling) {
                        const bowl = inn.bowling.find(b => matchesPlayer(b.player.id, player));
                        if (bowl) {
                            const legalBalls = bowl.legalBalls ?? 0;
                            // For bowling, we might want the total across all innings or just last active
                            // Usually a bowler doesn't bowl in both innings of a T20/limited overs match for the same side,
                            // but we'll take the stats from whichever inning they participated in.
                            updated.overs = Math.floor(legalBalls / 6);
                            updated.ballsBowled = legalBalls;
                            updated.runsConceded = bowl.runsConceded ?? updated.runsConceded;
                            updated.wickets = bowl.wickets ?? updated.wickets;
                        }
                    }
                });

                return updated;
            });

            // Helper to find a local player by API player.id (matching userId OR id)
            const findLocal = (apiPlayerId, allPlayers) =>
                allPlayers.find(p => matchesPlayer(apiPlayerId, p));

            if (freshTAPlayers && freshTBPlayers) {
                // Initial load path: use the arrays returned directly from fetchMatchData
                const mergedA = applyStats(freshTAPlayers);
                const mergedB = applyStats(freshTBPlayers);
                setTeamAPlayers(mergedA);
                setTeamBPlayers(mergedB);

                // Resolve striker / non-striker / bowler from the merged arrays
                const allPlayers = [...mergedA, ...mergedB];

                if (activeInn.batting) {
                    const notOut = activeInn.batting.filter(b => b.dismissal === 'Not Out');
                    if (notOut.length >= 1) {
                        const s = findLocal(notOut[0].player.id, allPlayers);
                        if (s) setStrikerId(s.id);
                    }
                    if (notOut.length >= 2) {
                        const ns = findLocal(notOut[1].player.id, allPlayers);
                        if (ns) setNonStrikerId(ns.id);
                    }
                }

                if (activeInn.bowling && activeInn.bowling.length > 0) {
                    const lastBowl = activeInn.bowling[activeInn.bowling.length - 1];
                    const b = findLocal(lastBowl.player.id, allPlayers);

                    if (serverBalls === 0 && serverOvers > 0) {
                        // Start of new over: last bowler in array is the one who just finished.
                        if (b) setLastBowlerId(b.id);
                        setBowlerId(null); // Must select new bowler
                    } else {
                        // Mid-over: last bowler in array is current bowler
                        if (b) setBowlerId(b.id);
                        if (activeInn.bowling.length > 1) {
                            const prevBowl = activeInn.bowling[activeInn.bowling.length - 2];
                            const pb = findLocal(prevBowl.player.id, allPlayers);
                            if (pb) setLastBowlerId(pb.id);
                        }
                    }
                }
            } else {
                // Post-sync path: use functional updaters to read + update current state
                setTeamAPlayers(prev => applyStats(prev));
                setTeamBPlayers(prev => applyStats(prev));

                // For player identities, do a single functional read of both teams
                setTeamAPlayers(teamA => {
                    setTeamBPlayers(teamB => {
                        const allPlayers = [...teamA, ...teamB];

                        if (activeInn.batting) {
                            const notOut = activeInn.batting.filter(b => b.dismissal === 'Not Out');
                            if (notOut.length >= 1) {
                                const s = findLocal(notOut[0].player.id, allPlayers);
                                if (s) setStrikerId(s.id);
                            }
                            if (notOut.length >= 2) {
                                const ns = findLocal(notOut[1].player.id, allPlayers);
                                if (ns) setNonStrikerId(ns.id);
                            }
                        }

                        if (activeInn.bowling && activeInn.bowling.length > 0) {
                            const lastBowl = activeInn.bowling[activeInn.bowling.length - 1];
                            const b = findLocal(lastBowl.player.id, allPlayers);

                            if (serverBalls === 0 && serverOvers > 0) {
                                if (b) setLastBowlerId(b.id);
                                setBowlerId(null);
                            } else {
                                if (b) setBowlerId(b.id);
                                if (activeInn.bowling.length > 1) {
                                    const prevBowl = activeInn.bowling[activeInn.bowling.length - 2];
                                    const pb = findLocal(prevBowl.player.id, allPlayers);
                                    if (pb) setLastBowlerId(pb.id);
                                }
                            }
                        }

                        return teamB; // no mutation
                    });
                    return teamA; // no mutation
                });
            }
        } catch (error) {
            console.error('Error fetching scoreboard:', error);
            // Non-fatal: silently fail so scoring can continue
        }
    };

    const saveBallsLocally = async (balls) => {
        if (!params?.fixtureId) return;
        try {
            await AsyncStorage.setItem(`over_balls_${params.fixtureId}`, JSON.stringify(balls));
        } catch (err) {
            console.error('Error saving local balls:', err);
        }
    };

    // Cleanup local storage if match changes or on completion (optional)
    // We keep it using fixtureId so it stays until synced.

    const { teamAObj, teamBObj } = fixture || {};
    const tossData = fixture ? {
        tossWinnerId: fixture.tossWinnerId,
        tossDecision: fixture.tossDecision,
        battingTeamId: fixture.battingTeamId,
        bowlingTeamId: fixture.bowlingTeamId
    } : null;

    // Derived Teams
    const battingTeamPlayers = useMemo(() => {
        if (!fixture || !tossData) return [];
        return currentInnings === 1
            ? (tossData?.battingTeamId === teamAObj?.id ? teamAPlayers : teamBPlayers)
            : (tossData?.battingTeamId === teamAObj?.id ? teamBPlayers : teamAPlayers);
    }, [currentInnings, teamAPlayers, teamBPlayers, tossData, teamAObj, fixture]);

    const bowlingTeamPlayers = useMemo(() => {
        if (!fixture || !tossData) return [];
        return currentInnings === 1
            ? (tossData?.battingTeamId === teamAObj?.id ? teamBPlayers : teamAPlayers)
            : (tossData?.battingTeamId === teamAObj?.id ? teamAPlayers : teamBPlayers);
    }, [currentInnings, teamAPlayers, teamBPlayers, tossData, teamAObj, fixture]);

    const striker = useMemo(() => battingTeamPlayers.find(p => p.id === strikerId), [battingTeamPlayers, strikerId]);
    const nonStriker = useMemo(() => battingTeamPlayers.find(p => p.id === nonStrikerId), [battingTeamPlayers, nonStrikerId]);
    const bowler = useMemo(() => bowlingTeamPlayers.find(p => p.id === bowlerId), [bowlingTeamPlayers, bowlerId]);

    const filteredPlayersForSelection = useMemo(() => {
        if (!fixture) return [];
        if (selectionType === 'bowler') {
            return bowlingTeamPlayers;
        }
        return battingTeamPlayers;
    }, [battingTeamPlayers, bowlingTeamPlayers, selectionType, fixture]);

    // Initialize players on load or transition
    useEffect(() => {
        if (!fixture || battingTeamPlayers.length === 0 || bowlingTeamPlayers.length === 0) return;
        if (!strikerId) setStrikerId(battingTeamPlayers[0].id);
        if (!nonStrikerId) setNonStrikerId(battingTeamPlayers[1].id);
        if (!bowlerId) setBowlerId(bowlingTeamPlayers[0].id);
    }, [currentInnings, battingTeamPlayers, bowlingTeamPlayers, fixture]);

    // ─── Unsaved data guard ────────────────────────────────────────────────────
    // Keep a ref so the beforeRemove / AppState callbacks always see the latest
    // overBalls without stale closure issues.
    const overBallsRef = useRef(overBalls);
    useEffect(() => { overBallsRef.current = overBalls; }, [overBalls]);

    // 1) BACK NAVIGATION guard — intercepts the hardware back button AND the
    //    Navigation back arrow while there are unsynced balls.
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (overBallsRef.current.length === 0) return; // nothing unsaved, let go
            e.preventDefault(); // block navigation

            showAlert(
                'Unsynced Data',
                "You have unsynced balls. What would you like to do?",
                'confirm',
                () => {
                    setOverBalls([]);
                    navigation.dispatch(e.data.action);
                }
            );
        });
        return unsubscribe;
    }, [navigation, params?.fixtureId, currentInnings, tossData, teamAObj, teamBObj]);

    // 2) APP BACKGROUND / KILL guard — when the app goes to background (home press,
    //    task-switch, or OS kill), silently auto-sync any unsaved balls so they are
    //    never lost even if the process gets killed before the user comes back.
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextState) => {
            if (nextState === 'background' && overBallsRef.current.length > 0) {
                try {
                    const payload = {
                        battingTeamId: currentInnings === 1
                            ? (tossData?.battingTeamId === teamAObj?.id ? teamAObj?.id : teamBObj?.id)
                            : (tossData?.battingTeamId === teamAObj?.id ? teamBObj?.id : teamAObj?.id),
                        bowlingTeamId: currentInnings === 1
                            ? (tossData?.battingTeamId === teamAObj?.id ? teamBObj?.id : teamAObj?.id)
                            : (tossData?.battingTeamId === teamAObj?.id ? teamAObj?.id : teamBObj?.id),
                        balls: overBallsRef.current,
                    };
                    await cricketScoringService.submitBallStats(params.fixtureId, payload);
                    await AsyncStorage.removeItem(`over_balls_${params.fixtureId}`);
                    // Update React state too, for when the app comes back to foreground
                    setOverBalls([]);
                } catch (err) {
                    console.error('Background auto-sync error:', err);
                    // Data remains in AsyncStorage as a fallback
                }
            }
        });
        return () => subscription.remove();
    }, [params?.fixtureId, currentInnings, tossData, teamAObj, teamBObj]);
    // ──────────────────────────────────────────────────────────────────────────

    if (isLoading || !fixture) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.centerContainer, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>Loading Match Data...</Text>
                </View>
            </SafeAreaView>
        );
    }

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
        const currentMaxWickets = battingTeamPlayers.length > 0 ? battingTeamPlayers.length - 1 : maxWickets;
        const isAllOut = finalWickets >= currentMaxWickets;
        const totalBallsPlayed = (finalOvers * 6) + finalBalls;
        const isOversDone = totalBallsPlayed >= (maxOvers * 6);

        if (currentInnings === 2) {
            if (finalScore >= targetScore) {
                const bTeamName = currentInnings === 1 ? (tossData?.battingTeamId === teamAObj?.id ? teamAObj?.name : teamBObj?.name) : (tossData?.battingTeamId === teamAObj?.id ? teamBObj?.name : teamAObj?.name);
                setWinnerMessage(`${bTeamName} won by ${maxWickets - finalWickets} wickets!`);
                setInningsCompleteModalVisible(false);
                return true;
            }
            if (isAllOut || isOversDone) {
                if (finalScore < targetScore - 1) {
                    const aTeamName = currentInnings === 1 ? (tossData?.battingTeamId === teamAObj?.id ? teamAObj?.name : teamBObj?.name) : (tossData?.battingTeamId === teamAObj?.id ? teamAObj?.name : teamBObj?.name);
                    const inn1Score = parseInt(allInnings[0].score.split('/')[0]);
                    setWinnerMessage(`${aTeamName} won by ${inn1Score - finalScore} runs!`);
                } else {
                    setWinnerMessage("Match Tied!");
                }
                setInningsCompleteModalVisible(false);
                return true;
            }
        } else {
            if (isAllOut || isOversDone) {
                return true;
            }
        }
        return false;
    };

    const handleRun = (runs, isExtra = false, extraType = '') => {
        const currentMaxWickets = battingTeamPlayers.length > 0 ? battingTeamPlayers.length - 1 : maxWickets;
        const inningsDone = wickets >= currentMaxWickets || (overs * 6 + balls) >= (maxOvers * 6);
        if (balls >= 6 && !isExtra && !inningsDone) {
            showAlert("Over Complete", "The current over is finished. Please sync and manually start a new over.", "warning");
            return;
        }
        if (isMatchComplete || inningsDone) return;

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

        setBalls(newBalls);

        // Add to local over data
        const ballData = {
            sequence: overBalls.length,
            over: overs,
            ball: isExtra && (extraType === 'Wd' || extraType === 'NB') ? balls : newBalls,
            strikerId: striker?.userId,
            nonStrikerId: nonStriker?.userId,
            bowlerId: bowler?.userId,
            runs: isExtra ? 0 : runs,
            isBoundary: runs === 4 || runs === 6,
            extraType: extraType === 'Wd' ? 'wide' : extraType === 'NB' ? 'no-ball' : extraType === 'Lb' ? 'leg-bye' : extraType === 'B' ? 'bye' : null,
            extraRuns: isExtra ? (extraType === 'Wd' || extraType === 'NB' ? runs + 1 : runs) : 0,
            isWicket: false,
            wicketType: null,
            dismissedPlayerId: null,
            caughtById: null,
            runoutById: null
        };

        const updatedBalls = [...overBalls, ballData];
        setOverBalls(updatedBalls);
        saveBallsLocally(updatedBalls);
    };

    const handleWicket = (type) => {
        const currentMaxWickets = battingTeamPlayers.length > 0 ? battingTeamPlayers.length - 1 : maxWickets;
        const inningsDone = wickets >= currentMaxWickets || (overs * 6 + balls) >= (maxOvers * 6);
        if (balls >= 6 && !inningsDone) {
            showAlert("Over Complete", "The current over is finished. Please sync and manually start a new over.", "warning");
            setWicketModalVisible(false);
            return;
        }
        if (inningsDone) {
            setWicketModalVisible(false);
            return;
        }

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
        const isEnd = checkMatchEnd(score, newWickets, overs, newBalls);

        if (!isEnd) {
            setBalls(newBalls);

            const alreadyOut = battingTeamPlayers.filter(p => p.isOut).length;
            const totalBatters = battingTeamPlayers.length;
            const availableNewBatters = totalBatters - (alreadyOut + 1) - 1;

            if (availableNewBatters <= 0) {
                // Should be caught by checkMatchEnd but as a safety:
                setInningsCompleteModalVisible(true);
            } else {
                setSelectionType('newBatsman');
                setSelectionModalVisible(true);
            }
        } else if (currentInnings === 1) {
            // End of 1st innings
            setBalls(newBalls);
            setInningsCompleteModalVisible(true);
        }

        // Add to local over data
        const ballData = {
            sequence: overBalls.length,
            over: overs,
            ball: newBalls,
            strikerId: striker?.userId,
            nonStrikerId: nonStriker?.userId,
            bowlerId: bowler?.userId,
            runs: 0,
            isBoundary: false,
            extraType: null,
            extraRuns: 0,
            isWicket: true,
            wicketType: type.toLowerCase().replace(' ', '-'),
            dismissedPlayerId: striker?.userId,
            caughtById: type === 'Caught' ? bowler?.userId : null, // Defaulting caughtBy to bowler if not specified
            runoutById: null
        };

        const updatedBalls = [...overBalls, ballData];
        setOverBalls(updatedBalls);
        saveBallsLocally(updatedBalls);
    };

    const handleRunOut = () => {
        if (balls >= 6) {
            showAlert("Over Complete", "The current over is finished. Please sync and manually start a new over.", "warning");
            setRunOutModalVisible(false);
            return;
        }

        const newWickets = wickets + 1;
        setWickets(newWickets);
        setCurrentOverBalls(prev => [...prev, 'W']);
        setRunOutModalVisible(false);
        recordHistory('W(RO)', score, newWickets);

        updatePlayerStats(strikerId, { isOut: true }, true);
        const newBalls = balls + 1;
        updatePlayerStats(bowlerId, { ballsBowled: (bowler.ballsBowled || 0) + 1 }, false);
        const isEnd = checkMatchEnd(score, newWickets, overs, newBalls);

        if (!isEnd) {
            setBalls(newBalls);

            // Check remaining available batters
            const alreadyOut = battingTeamPlayers.filter(p => p.isOut).length;
            const totalBatters = battingTeamPlayers.length;
            const availableNewBatters = totalBatters - (alreadyOut + 1) - 1;

            if (availableNewBatters <= 0) {
                setInningsCompleteModalVisible(true);
            } else {
                setSelectionType('striker');
                setSelectionModalVisible(true);
            }
        } else if (currentInnings === 1) {
            setBalls(newBalls);
            setInningsCompleteModalVisible(true);
        }

        // Add to local over data
        const ballData = {
            sequence: overBalls.length,
            over: overs,
            ball: newBalls,
            strikerId: striker?.userId,
            nonStrikerId: nonStriker?.userId,
            bowlerId: bowler?.userId,
            runs: 0,
            isBoundary: false,
            extraType: null,
            extraRuns: 0,
            isWicket: true,
            wicketType: 'run-out',
            dismissedPlayerId: striker?.userId,
            caughtById: null,
            runoutById: null // Would need actual player ID from modal if available
        };

        const updatedBalls = [...overBalls, ballData];
        setOverBalls(updatedBalls);
        saveBallsLocally(updatedBalls);
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

        const totalBowlerBalls = (bowler.ballsBowled || 0);
        updatePlayerStats(bowlerId, { overs: Math.floor(totalBowlerBalls / 6) }, false);

        if (!isMatchComplete) {
            setSelectionType('bowler');
            setSelectionModalVisible(true);
        }
    };

    const startSecondInnings = async () => {
        try {
            setIsSyncing(true);
            const battingTeamId = tossData?.battingTeamId;
            
            if (!battingTeamId) {
                showAlert("Error", "Batting team information missing.", "error");
                return;
            }

            await cricketScoringService.completeInnings(params.fixtureId, battingTeamId);
            
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
            
            // Re-fetch data to sync up with server's target calculation
            fetchInitialData();
        } catch (error) {
            showAlert("Error", "Failed to complete innings. Please try again.", "error");
        } finally {
            setIsSyncing(false);
        }
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
        // Validation check in case they somehow press a disabled item
        if (selectionType === 'bowler' && player.id === lastBowlerId) return;
        if (selectionType !== 'bowler' && (player.isOut || player.id === strikerId || player.id === nonStrikerId)) return;

        if (selectionType === 'striker') setStrikerId(player.id);
        else if (selectionType === 'nonStriker') setNonStrikerId(player.id);
        else if (selectionType === 'bowler') setBowlerId(player.id);
        else if (selectionType === 'newBatsman') setStrikerId(player.id);

        setSelectionModalVisible(false);
    };

    const calculateCRR = () => {
        const totalBalls = (overs * 6) + (balls === 6 ? 0 : balls);
        if (totalBalls === 0) return '0.00';
        return ((score / totalBalls) * 6).toFixed(2);
    };

    const isSelectionEnabled = (type) => {
        if (isMatchComplete) return false;

        const currentMaxWickets = battingTeamPlayers.length > 0 ? battingTeamPlayers.length - 1 : maxWickets;
        const inningsDone = wickets >= currentMaxWickets || (overs * 6 + balls) >= (maxOvers * 6);

        // Disable selection if innings is done
        if (inningsDone) return false;

        // Striker/non-striker can be changed:
        //  - At innings start (before any ball bowled in the innings)
        //  - Start of a new over (balls === 0), before first ball
        //  - After a wicket falls (driven by selectionType modal flow)
        if (type === 'striker' || type === 'nonStriker') {
            const isInningsStart = overs === 0 && balls === 0;
            const isOverStart = balls === 0;
            const isAfterWicket = selectionType === 'newBatsman' || selectionType === 'striker';
            return isInningsStart || isOverStart || isAfterWicket;
        }

        if (type === 'bowler') return (balls === 0);

        return false;
    };

    const handleSync = async () => {
        if (overBalls.length === 0 || isSyncing) return;

        try {
            setIsSyncing(true);
            const payload = {
                battingTeamId: currentInnings === 1 ? (tossData?.battingTeamId === teamAObj?.id ? teamAObj?.id : teamBObj?.id) : (tossData?.battingTeamId === teamAObj?.id ? teamBObj?.id : teamAObj?.id),
                bowlingTeamId: currentInnings === 1 ? (tossData?.battingTeamId === teamAObj?.id ? teamBObj?.id : teamAObj?.id) : (tossData?.battingTeamId === teamAObj?.id ? teamAObj?.id : teamBObj?.id),
                balls: overBalls
            };

            const response = await cricketScoringService.submitBallStats(params.fixtureId, payload);
            if (response.status === 'success' || response.status === 'true' || response.message?.includes('successfully')) {
                // Clear the local buffer — DO NOT touch any UI state.
                // Scoreboard will be refreshed from DB the next time the user enters this screen.
                setOverBalls([]);
                await AsyncStorage.removeItem(`over_balls_${params.fixtureId}`);
                showAlert('✓ Synced', 'Ball data saved to server.', 'success');
            } else {
                showAlert('Sync Failed', response.message || 'Unknown error occurred', 'error');
            }
        } catch (err) {
            console.error('Sync error:', err);
            showAlert('Sync Error', 'Failed to synchronize data with server', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

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
                    {isMatchComplete ? (
                        <Text style={[styles.targetLabel, { color: COLORS.primary }]}>{winnerMessage}</Text>
                    ) : (
                        targetScore && currentInnings === 2 && score < targetScore && (
                            <Text style={styles.targetLabel}>
                                {score === targetScore - 1 
                                    ? "Scores Level" 
                                    : `Target: ${targetScore} (Need ${targetScore - score} in ${(maxOvers * 6) - (overs * 6 + balls)} balls)`
                                }
                            </Text>
                        )
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
                        <TouchableOpacity
                            style={[styles.playerCard, striker && styles.activePlayerCard, !isSelectionEnabled('striker') && { opacity: 0.8 }]}
                            onPress={() => isSelectionEnabled('striker') && openSelectionModal('striker')}
                            activeOpacity={isSelectionEnabled('striker') ? 0.7 : 1}
                        >
                            <View style={styles.playerHeader}>
                                <View style={styles.strikerIndicator}>
                                    <View style={[styles.strikerDot, { backgroundColor: striker ? COLORS.primary : 'transparent' }]} />
                                    <Text style={styles.playerLabel}>Striker</Text>
                                </View>
                                {isSelectionEnabled('striker') && <ChevronDown size={14} color={COLORS.primary} />}
                            </View>
                            <Text style={styles.playerName} numberOfLines={1}>{striker?.name || 'Select'}</Text>
                            <Text style={styles.playerStats}>{striker?.runs || 0} <Text style={styles.statsBalls}>({striker?.balls || 0})</Text></Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.playerCard, !isSelectionEnabled('nonStriker') && { opacity: 0.8 }]}
                            onPress={() => isSelectionEnabled('nonStriker') && openSelectionModal('nonStriker')}
                            activeOpacity={isSelectionEnabled('nonStriker') ? 0.7 : 1}
                        >
                            <View style={styles.playerHeader}>
                                <Text style={styles.playerLabel}>Non-Striker</Text>
                                {isSelectionEnabled('nonStriker') && <ChevronDown size={14} color={COLORS.textTertiary} />}
                            </View>
                            <Text style={styles.playerName} numberOfLines={1}>{nonStriker?.name || 'Select'}</Text>
                            <Text style={styles.playerStats}>{nonStriker?.runs || 0} <Text style={styles.statsBalls}>({nonStriker?.balls || 0})</Text></Text>
                        </TouchableOpacity>
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
                                {bowler?.wickets || 0}-{bowler?.runsConceded || 0} ({bowler?.overs || 0}.{(bowler?.ballsBowled || 0) % 6})
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
                {(() => {
                    const currentMaxWickets = battingTeamPlayers.length > 0 ? battingTeamPlayers.length - 1 : maxWickets;
                    const inningsDone = wickets >= currentMaxWickets || (overs * 6 + balls) >= (maxOvers * 6) || (currentInnings === 2 && score >= targetScore);
                    const isDisabled = (balls >= 6 && !inningsDone) || inningsDone || isMatchComplete;
                    return (
                        <View style={[styles.scoringPanel, isDisabled && { opacity: 0.6 }]} pointerEvents={isDisabled ? 'none' : 'auto'}>
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
                    );
                })()}

                <View style={[styles.actionButtons, { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }]}>
                    <View style={{ width: '48%' }}>
                        <TouchableOpacity
                            style={[
                                styles.syncButton,
                                { flex: 1, marginVertical: 0 },
                                (isSyncing || overBalls.length === 0) && styles.syncButtonDisabled
                            ]}
                            onPress={handleSync}
                            disabled={isSyncing || overBalls.length === 0}
                        >
                            <RefreshCw size={18} color={COLORS.white} />
                            <Text style={styles.syncButtonText}>
                                {isSyncing ? "Syncing..." : `Sync ${overBalls.length} Balls`}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '48%' }}>
                        {(() => {
                            const currentMaxWickets = battingTeamPlayers.length > 0 ? battingTeamPlayers.length - 1 : maxWickets;
                            const isAllOut = wickets >= currentMaxWickets;
                            const isOversDone = (overs * 6 + balls) >= (maxOvers * 6);
                            const isChased = currentInnings === 2 && score >= targetScore;
                            const inningsDone = isAllOut || isOversDone || isChased;
                            
                            let buttonTitle = "COMPLETE OVER";
                            if (isMatchComplete) {
                                buttonTitle = "MATCH COMPLETED";
                            } else if (inningsDone) {
                                buttonTitle = currentInnings === 1 ? "COMPLETE INN. 1" : "COMPLETE MATCH";
                            }

                            return (
                                <AppButton
                                    title={buttonTitle}
                                    onPress={async () => {
                                        if (inningsDone) {
                                            if (currentInnings === 2) {
                                                // Handle Match Completion
                                                    // Redundant API call removed as per USER request
                                                    setIsMatchComplete(true); 
                                            } else {
                                                setInningsCompleteModalVisible(true);
                                            }
                                        } else {
                                            completeOver();
                                        }
                                    }}
                                    containerStyle={{ flex: 1 }}
                                    disabled={overBalls.length > 0 || (isMatchComplete && currentInnings === 1) || (!inningsDone && balls < 6)}
                                    loading={isSyncing && inningsDone && currentInnings === 2}
                                />
                            );
                        })()}
                    </View>
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
                        {/* Batting Section */}
                        <View style={styles.scorecardSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>BATTING</Text>
                                <View style={{ flexDirection: 'row', gap: 4 }}>
                                    <View style={[styles.statusBadge, styles.notOutBadge]}><Text style={styles.notOutBadge}>* Striker</Text></View>
                                </View>
                            </View>

                            <View style={styles.statsTableHeader}>
                                <Text style={[styles.colName, { flex: 4 }]}>Batter</Text>
                                <Text style={styles.colRuns}>R</Text>
                                <Text style={styles.colStats}>B</Text>
                                <Text style={styles.colStats}>4s</Text>
                                <Text style={styles.colStats}>6s</Text>
                                <Text style={styles.colSR}>SR</Text>
                            </View>

                            {(scorecardTab === 1
                                ? (tossData?.battingTeamId === teamAObj?.id ? teamAPlayers : teamBPlayers)
                                : (tossData?.battingTeamId === teamAObj?.id ? teamBPlayers : teamAPlayers)
                            ).filter(p => p.balls > 0 || (scorecardTab === currentInnings && (p.id === strikerId || p.id === nonStrikerId))).map((p) => {
                                const isActive = scorecardTab === currentInnings && (p.id === strikerId || p.id === nonStrikerId);
                                return (
                                    <View key={p.id} style={styles.statsTableRow}>
                                        <View style={{ flex: 4 }}>
                                            <Text
                                                style={styles.batterNameModern}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {p.name}{isActive ? '*' : ''}
                                            </Text>
                                            <Text style={[styles.statusBadge, p.isOut ? styles.outBadge : styles.notOutBadge]}>
                                                {p.isOut ? 'out' : 'not out'}
                                            </Text>
                                        </View>
                                        <Text style={styles.colRuns}>{p.runs}</Text>
                                        <Text style={styles.colStats}>{p.balls}</Text>
                                        <Text style={styles.colStats}>{p.fours}</Text>
                                        <Text style={styles.colStats}>{p.sixes}</Text>
                                        <Text style={styles.colSR}>{p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(1) : '0.0'}</Text>
                                    </View>
                                );
                            })}

                            {/* Extras Breakdown */}
                            {(() => {
                                const inn = allInnings.find(i => i.inningsNo === scorecardTab);
                                const ex = inn?.extras || { wide: 0, noBall: 0, bye: 0, legBye: 0 };
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
                                    {(() => {
                                        if (scorecardTab === currentInnings) return score;
                                        const inn = allInnings.find(i => i.inningsNo === scorecardTab);
                                        return inn ? inn.score.split('/')[0] : 0;
                                    })()}
                                    <Text style={{ fontSize: 16 }}> / </Text>
                                    {(() => {
                                        if (scorecardTab === currentInnings) return wickets;
                                        const inn = allInnings.find(i => i.inningsNo === scorecardTab);
                                        return inn ? inn.score.split('/')[1] : 0;
                                    })()}
                                </Text>
                            </View>
                        </View>

                        {/* Bowling Section */}
                        <View style={styles.scorecardSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>BOWLING</Text>
                            </View>
                            <View style={styles.statsTableHeader}>
                                <Text style={[styles.colName, { flex: 4 }]}>Bowler</Text>
                                <Text style={styles.colStats}>O</Text>
                                <Text style={styles.colStats}>M</Text>
                                <Text style={styles.colStats}>R</Text>
                                <Text style={styles.colStats}>W</Text>
                                <Text style={styles.colSR}>Econ</Text>
                            </View>
                            {(scorecardTab === 1
                                ? (tossData?.battingTeamId === teamAObj?.id ? teamBPlayers : teamAPlayers)
                                : (tossData?.battingTeamId === teamAObj?.id ? teamAPlayers : teamBPlayers)
                            ).filter(p => p.ballsBowled > 0 || (scorecardTab === currentInnings && p.id === bowlerId)).map((p) => (
                                <View key={p.id} style={styles.statsTableRow}>
                                    <View style={{ flex: 4 }}>
                                        <Text
                                            style={styles.batterNameModern}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {p.name}
                                        </Text>
                                    </View>
                                    <Text style={styles.colStats}>{p.overs}.{p.ballsBowled % 6}</Text>
                                    <Text style={styles.colStats}>{p.maidens || 0}</Text>
                                    <Text style={styles.colStats}>{p.runsConceded}</Text>
                                    <Text style={styles.colStats}>{p.wickets}</Text>
                                    <Text style={styles.colSR}>
                                        {p.ballsBowled > 0 ? ((p.runsConceded / p.ballsBowled) * 6).toFixed(2) : '0.00'}
                                    </Text>
                                </View>
                            ))}
                        </View>

                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Innings transition Modal */}
            <Modal visible={inningsCompleteModalVisible} transparent animationType="fade">
                <View style={styles.overlayMessage}>
                    <View style={styles.modernMessageBox}>
                        <TouchableOpacity 
                            style={styles.modalCloseBtnAbsolute} 
                            onPress={() => setInningsCompleteModalVisible(false)}
                        >
                            <X size={24} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                        <View style={styles.successIconBadge}>
                            <CheckCircle2 size={40} color={COLORS.white} strokeWidth={3} />
                        </View>

                        <Text style={styles.messageTitleModern}>Innings Over!</Text>

                        <View style={styles.scoreHighlightCard}>
                            <Text style={styles.scoreLabelModern}>FINAL SCORE</Text>
                            <Text style={styles.messageScoreModern}>
                                {score}/{wickets}
                                <Text style={styles.messageOversModern}> ({overs}.{balls === 6 ? 0 : balls})</Text>
                            </Text>
                        </View>

                        <View style={styles.targetCardModern}>
                            <Text style={styles.targetLabelSmall}>TARGET FOR NEXT INNINGS</Text>
                            <View style={styles.targetValueContainer}>
                                <Trophy size={20} color={COLORS.primary} strokeWidth={2.5} />
                                <Text style={styles.targetValueModern}>{score + 1}</Text>
                                <Text style={styles.targetDescModern}>Runs</Text>
                            </View>
                        </View>

                        <AppButton
                            title="START 2ND INNINGS"
                            containerStyle={styles.startInningsBtnModern}
                            onPress={startSecondInnings}
                            loading={isSyncing}
                        />
                    </View>
                </View>
            </Modal>

            {/* Match Complete Modal */}
            <Modal visible={isMatchComplete} transparent animationType="fade">
                <View style={styles.overlayMessage}>
                    <View style={styles.modernMessageBox}>
                        <TouchableOpacity 
                            style={styles.modalCloseBtnAbsolute} 
                            onPress={() => setIsMatchComplete(false)}
                        >
                            <X size={24} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                        <View style={[styles.successIconBadge, { backgroundColor: '#FFD700' }]}>
                            <Trophy size={40} color={COLORS.white} strokeWidth={2.5} />
                        </View>

                        <Text style={styles.messageTitleModern}>Match Complete!</Text>

                        <View style={styles.winnerCardModern}>
                            <Text style={styles.winnerAnnounceModern}>{winnerMessage}</Text>
                        </View>

                        <AppButton
                            title="SHOW SUMMARY"
                            containerStyle={styles.startInningsBtnModern}
                            onPress={() => setScorecardModalVisible(true)}
                        />

                        <TouchableOpacity
                            style={styles.backHomeBtnModern}
                            onPress={() => navigation.navigate(SCREEN_NAMES.HOME)}
                        >
                            <Text style={styles.backHomeTextModern}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <AppAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={() => {
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                    if (alertConfig.onConfirm) alertConfig.onConfirm();
                }}
                showCancel={alertConfig.type === 'confirm'}
            />

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
                            renderItem={({ item }) => {
                                const isCurrentlyBatting = item.id === strikerId || item.id === nonStrikerId;
                                const isCurrentlyBowling = item.id === bowlerId;

                                let isDisabled = false;
                                let disableReason = '';

                                if (selectionType === 'bowler') {
                                    if (item.id === lastBowlerId) {
                                        isDisabled = true;
                                        disableReason = 'Bowled Last Over';
                                    }
                                } else {
                                    if (item.isOut) {
                                        isDisabled = true;
                                        disableReason = 'Out';
                                    } else if (isCurrentlyBatting) {
                                        isDisabled = true;
                                        disableReason = 'Batting';
                                    }
                                }

                                return (
                                    <TouchableOpacity
                                        style={[styles.playerSelectItem, isDisabled && { opacity: 0.5 }]}
                                        onPress={() => !isDisabled && selectPlayer(item)}
                                        disabled={isDisabled}
                                    >
                                        <Text style={[
                                            styles.playerSelectItemText,
                                            isDisabled && { textDecorationLine: 'line-through' }
                                        ]}>
                                            {item.name}
                                        </Text>

                                        {isDisabled ? (
                                            <Text style={{ color: COLORS.error, fontSize: 12, fontWeight: 'bold' }}>{disableReason}</Text>
                                        ) : (
                                            <CheckCircle2 size={16} color={COLORS.primary} opacity={(isCurrentlyBatting || isCurrentlyBowling) ? 1 : 0} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
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
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalTitle}>Runs for {currentExtraType === 'B' ? 'Byes' : currentExtraType === 'Lb' ? 'Leg Byes' : currentExtraType === 'Wd' ? 'Wide' : 'No Ball'}</Text>
                            <TouchableOpacity onPress={() => setExtraRunsModalVisible(false)}>
                                <X size={24} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        </View>
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
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalTitle}>Select Wicket Type</Text>
                            <TouchableOpacity onPress={() => setWicketModalVisible(false)}>
                                <X size={24} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        </View>
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
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalTitle}>Run Out!</Text>
                            <TouchableOpacity onPress={() => setRunOutModalVisible(false)}>
                                <X size={24} color={COLORS.textTertiary} />
                            </TouchableOpacity>
                        </View>
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
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
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
    playerCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.borderLight },
    activePlayerCard: { borderColor: COLORS.primary, borderWidth: 2 },
    strikerIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    strikerDot: { width: 8, height: 8, borderRadius: 4 },
    playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    playerLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textTertiary, textTransform: 'uppercase' },
    playerName: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
    playerStats: { fontSize: 16, fontWeight: '900', color: COLORS.text },
    statsBalls: { fontSize: 12, fontWeight: '600', color: COLORS.textTertiary },
    bowlerCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: 16 },
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
    scoreBtn: { flex: 1, height: 52, backgroundColor: COLORS.surface, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.borderLight },
    scoreBtnText: { fontSize: 18, fontWeight: '900', color: COLORS.text },
    boundaryFour: { backgroundColor: '#E3F2FD', borderColor: '#2196F3', borderWidth: 1.5 },
    boundarySix: { backgroundColor: '#F3E5F5', borderColor: '#9C27B0', borderWidth: 1.5 },
    boundaryText: { fontSize: 20, fontWeight: '900', color: COLORS.text, lineHeight: 24 },
    boundaryLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textTertiary, marginTop: -2 },
    wicketBtn: { backgroundColor: COLORS.error, borderColor: COLORS.error },
    extraBtn: { flex: 1, height: 44, backgroundColor: COLORS.surface, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.warning + '50' },
    extraBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.warning },
    actionButtons: { flexDirection: 'row', gap: 12, marginVertical: 20, paddingHorizontal: 4, alignItems: 'center', flexWrap: 'wrap' },
    actionBtn: { flex: 1, height: 54 },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        minWidth: 150,
        justifyContent: 'center',
        gap: 8,
        height: 54,
    },
    syncButtonDisabled: {
        opacity: 0.7,
        backgroundColor: COLORS.textTertiary,
    },
    syncButtonText: {
        color: COLORS.white,
        fontWeight: '900',
        fontSize: 14,
    },
    rotatingIcon: {
        // You would typically use an Animated.Value for rotation, but as a shortcut:
    },
    completeInnBtn: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
    completeInnText: { fontSize: 15, fontWeight: '900' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    selectionModal: { backgroundColor: COLORS.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '70%', padding: 20, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },
    playerSelectItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    playerSelectItemText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    wicketModal: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 24, margin: 20, alignSelf: 'center', width: '90%', borderWidth: 1, borderColor: COLORS.borderLight },
    wicketGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20, marginBottom: 20, justifyContent: 'center' },
    wicketTypeBtn: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight },
    wicketBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    choiceBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
    choiceBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
    cancelBtn: { alignItems: 'center', padding: 12 },
    cancelBtnText: { color: COLORS.error, fontWeight: '800', fontSize: 14 },
    overlayMessage: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modernMessageBox: {
        backgroundColor: COLORS.surface,
        width: '90%',
        borderRadius: 32,
        padding: 30,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    successIconBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.success,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: -70, // Pop up effect
        borderWidth: 6,
        borderColor: COLORS.surface,
    },
    messageTitleModern: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    scoreHighlightCard: {
        width: '100%',
        backgroundColor: COLORS.background,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    scoreLabelModern: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 10,
    },
    messageScoreModern: {
        fontSize: 42,
        fontWeight: '900',
        color: COLORS.text,
    },
    messageOversModern: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textTertiary,
    },
    targetCardModern: {
        width: '100%',
        backgroundColor: COLORS.primary + '08',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
        borderStyle: 'dashed',
    },
    targetLabelSmall: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    targetValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    targetValueModern: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.primary,
    },
    targetDescModern: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
        opacity: 0.7,
    },
    startInningsBtnModern: {
        width: '100%',
        marginTop: 10,
    },
    messageBox: { backgroundColor: COLORS.surface, padding: 30, borderRadius: 24, alignItems: 'center', width: '85%' },
    messageTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginTop: 16, marginBottom: 8 },
    messageScore: { fontSize: 32, fontWeight: '900', color: COLORS.primary, marginBottom: 12 },
    messageText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
    winnerAnnounce: { fontSize: 20, fontWeight: '800', color: COLORS.primary, textAlign: 'center', marginVertical: 15 },
    viewScoreBtn: { padding: 15, marginVertical: 10 },
    viewScoreText: { color: COLORS.secondary, fontWeight: '800', textDecorationLine: 'underline' },
    scorecardModal: { flex: 1, backgroundColor: COLORS.background },
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
    batterName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    batterStatus: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
    innTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 15 },
    historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
    historyOver: { width: 40, fontSize: 12, fontWeight: '700', color: COLORS.textTertiary },
    historyDetail: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
    historyRunning: { fontSize: 12, fontWeight: '800', color: COLORS.text },
    winnerCardModern: {
        width: '100%',
        backgroundColor: COLORS.success + '10',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: COLORS.success + '20',
    },
    winnerAnnounceModern: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.success,
        textAlign: 'center',
        lineHeight: 30,
    },
    backHomeBtnModern: {
        marginTop: 20,
        padding: 10,
    },
    backHomeTextModern: {
        color: COLORS.textTertiary,
        fontWeight: '700',
        fontSize: 14,
        textDecorationLine: 'underline'
    },
    modalCloseBtnAbsolute: {
        position: 'absolute',
        right: 20,
        top: 20,
        zIndex: 10,
        padding: 4,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
});

export default CricketScoringScreen;
