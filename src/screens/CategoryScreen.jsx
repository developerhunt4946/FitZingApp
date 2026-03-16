import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ArrowLeft, ChevronRight, Users, Eye, Zap, Trophy } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import SCREEN_NAMES from '../constants/screenNames'

const CategoryScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { tournamentId } = route.params;
    const { tournaments } = useSelector((state) => state.tournament);

    const tournament = tournaments.find((t) => t.id === tournamentId);

    if (!tournament) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{STRINGS.TOURNAMENT_NOT_FOUND}</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>{STRINGS.GO_BACK}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const renderCategoryCard = (category) => (
        <View key={category.id} style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <View style={styles.specRow}>
                        <Users size={14} color={COLORS.textTertiary} />
                        <Text style={styles.specText}>
                            {category.minPlayers}-{category.maxPlayers} Players
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.leaderboardIconBtn}
                    onPress={() => navigation.navigate(SCREEN_NAMES.LEADERBOARD, {
                        tournamentId,
                        categoryId: category.id,
                        categoryName: category.name
                    })}
                >
                    <Trophy size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.secondaryAction]}
                    onPress={() => navigation.navigate(SCREEN_NAMES.REGISTERED_TEAMS, {
                        tournamentId,
                        categoryId: category.id,
                        categoryName: category.name
                    })}
                >
                    <Eye size={18} color={COLORS.primary} />
                    <Text style={styles.secondaryActionText}>{STRINGS.SHOW_TEAMS}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.primaryAction]}
                    onPress={() => navigation.navigate(SCREEN_NAMES.ROUNDS, {
                        tournamentId,
                        categoryId: category.id,
                        categoryName: category.name,
                        tournamentFormat: tournament.format
                    })}
                >
                    <Zap size={18} color={COLORS.white} />
                    <Text style={styles.primaryActionText}>{STRINGS.VIEW_ROUNDS}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{STRINGS.CATEGORIES}</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{tournament.name}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {tournament.categories?.length > 0 ? (
                    tournament.categories.map(renderCategoryCard)
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No categories found for this tournament.</Text>
                    </View>
                )}
            </ScrollView>
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
        padding: 8,
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
    scrollContent: {
        padding: SPACING['16'],
        paddingBottom: 40,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING['16'],
        marginBottom: SPACING['16'],
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 6,
    },
    leaderboardIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
    },
    specRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    specText: {
        fontSize: 13,
        color: COLORS.textTertiary,
    },
    badge: {
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING['16'],
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 44,
        borderRadius: 10,
    },
    primaryAction: {
        backgroundColor: COLORS.primary,
    },
    primaryActionText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '700',
    },
    secondaryAction: {
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    secondaryActionText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 20,
    },
    backBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    backBtnText: {
        color: COLORS.white,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textTertiary,
    },
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
});

export default CategoryScreen;
