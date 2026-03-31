import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, PlayCircle, Trophy } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import SCREEN_NAMES from '../constants/screenNames';

const StartMatchScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { fixtureId, teamAObj, teamBObj, tournamentId } = route.params || {};

    const handleStartMatch = () => {
        navigation.replace(SCREEN_NAMES.POINTS_SCORING, {
            fixtureId,
            teamAObj,
            teamBObj,
            tournamentId,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>Match Setup</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.matchCard}>
                    <View style={styles.teamsContainer}>
                        {/* Team A */}
                        <View style={styles.teamWrapper}>
                            <View style={styles.teamInitialContainer}>
                                <Text style={styles.teamInitial}>
                                    {teamAObj?.name?.[0]?.toUpperCase() || 'A'}
                                </Text>
                            </View>
                            <Text style={styles.teamName} numberOfLines={2}>{teamAObj?.name || 'Team A'}</Text>
                        </View>

                        <View style={styles.vsContainer}>
                            <View style={styles.vsLine} />
                            <View style={styles.vsCircle}>
                                <Text style={styles.vsText}>VS</Text>
                            </View>
                            <View style={styles.vsLine} />
                        </View>

                        {/* Team B */}
                        <View style={styles.teamWrapper}>
                            <View style={[styles.teamInitialContainer, { backgroundColor: COLORS.secondary + '10', borderColor: COLORS.secondary }]}>
                                <Text style={[styles.teamInitial, { color: COLORS.secondary }]}>
                                    {teamBObj?.name?.[0]?.toUpperCase() || 'B'}
                                </Text>
                            </View>
                            <Text style={styles.teamName} numberOfLines={2}>{teamBObj?.name || 'Team B'}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.infoContainer}>
                        <Trophy size={20} color={COLORS.primary} />
                        <Text style={styles.infoText}>Ready to begin scoring</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.startMatchButton} onPress={handleStartMatch}>
                    <PlayCircle size={24} color={COLORS.white} />
                    <Text style={styles.startMatchButtonText}>START MATCH</Text>
                </TouchableOpacity>
            </View>
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
        borderBottomColor: COLORS.borderLight,
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
    content: {
        flex: 1,
        padding: SPACING['20'],
        justifyContent: 'center',
    },
    matchCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: SPACING['24'],
        marginBottom: SPACING['32'],
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamWrapper: {
        flex: 1,
        alignItems: 'center',
        gap: 12,
    },
    teamInitialContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    teamInitial: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.primary,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
    },
    vsContainer: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vsLine: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.borderLight,
    },
    vsCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 4,
        elevation: 2,
    },
    vsText: {
        fontSize: 14,
        fontWeight: '900',
        color: COLORS.textTertiary,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING['24'],
        paddingTop: SPACING['20'],
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    startMatchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    startMatchButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
});

export default StartMatchScreen;
