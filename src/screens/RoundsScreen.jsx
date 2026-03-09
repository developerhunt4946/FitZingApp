import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Trophy, Zap, ChevronRight, Info } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import { generateFixtures } from '../redux/slices/tournamentSlice';

const RoundsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { tournamentId, categoryId, categoryName } = route.params;

    const { loading, error } = useSelector((state) => state.tournament);
    // Note: Assuming rounds might be part of tournament/category data or fetched separately
    // For now, we'll treat it as "empty" if we need to show the generate button
    const [rounds, setRounds] = useState([]);

    const handleGenerateRounds = async () => {
        try {
            const result = await dispatch(generateFixtures({ tournamentId, categoryId })).unwrap();
            console.log('Fixtures Generation Response:', JSON.stringify(result, null, 2));
            Alert.alert('Success', 'Rounds generated successfully. Check console for details.');
            // After generation, we would typically refresh data or update local state
        } catch (err) {
            console.error('Generation Error:', err);
            Alert.alert('Error', err || 'Failed to generate rounds');
        }
    };

    const renderRoundItem = ({ item }) => (
        <TouchableOpacity style={styles.roundCard} activeOpacity={0.7}>
            <View style={styles.roundInfo}>
                <Text style={styles.roundTitle}>Round {item.roundNo}</Text>
                <Text style={styles.matchCount}>{item.matches?.length || 0} Matches</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>
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
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : rounds.length > 0 ? (
                <FlatList
                    data={rounds}
                    keyExtractor={(item) => item.id || item.roundNo.toString()}
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
                        Registration is complete? You can now generate the tournament fixtures.
                    </Text>

                    <TouchableOpacity
                        style={styles.generateBtn}
                        onPress={handleGenerateRounds}
                        disabled={loading}
                    >
                        <Zap size={20} color={COLORS.white} />
                        <Text style={styles.generateBtnText}>{STRINGS.GENERATE_ROUNDS}</Text>
                    </TouchableOpacity>

                    <View style={styles.infoBox}>
                        <Info size={16} color={COLORS.textTertiary} />
                        <Text style={styles.infoText}>
                            Generating rounds will automatically pair teams for the first round.
                        </Text>
                    </View>
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
    listContent: {
        padding: SPACING['16'],
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    generateBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 12,
        borderRadius: 10,
        marginTop: 40,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    infoText: {
        fontSize: 11,
        color: COLORS.textTertiary,
        flex: 1,
    },
    roundCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: SPACING['20'],
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 2,
    },
    roundTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    matchCount: {
        fontSize: 13,
        color: COLORS.textTertiary,
    },
});

export default RoundsScreen;
