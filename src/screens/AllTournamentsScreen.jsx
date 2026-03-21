import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Search, MapPin, Calendar, Trophy, ArrowLeft, Filter, X, MoreVertical } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import SCREEN_NAMES from '../constants/screenNames';
import STRINGS from '../constants/strings';

const AllTournamentsScreen = () => {
    const navigation = useNavigation();
    const { tournaments, loading, error } = useSelector((state) => state.tournament);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTournaments = useMemo(() => {
        if (!searchQuery.trim()) return tournaments;

        const query = searchQuery.toLowerCase();
        return tournaments.filter((t) => {
            const nameMatch = t.name?.toLowerCase().includes(query);
            const locationMatch = t.location?.toLowerCase().includes(query);
            const sportMatch = t.sports?.name?.toLowerCase().includes(query);
            const descriptionMatch = t.description?.toLowerCase().includes(query);

            return nameMatch || locationMatch || sportMatch || descriptionMatch;
        });
    }, [searchQuery, tournaments]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderTournamentCard = ({ item }) => {
        const hasDiscount = item.discount > 0;
        const entryFee = Number(item.entryFee) || 0;
        const finalPrice = hasDiscount ? entryFee * (1 - item.discount / 100) : entryFee;

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate(SCREEN_NAMES.TOURNAMENT_DETAILS, { tournamentId: item.id })}
            >
                <Image source={{ uri: item.imageURL }} style={styles.cardImage} />

                {hasDiscount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{item.discount}% OFF</Text>
                    </View>
                )}

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.tournamentName} numberOfLines={1}>{item.name}</Text>
                            <View style={styles.formatBadge}>
                                <Trophy size={10} color={COLORS.secondary} />
                                <Text style={styles.formatText}>{item.format?.toUpperCase()}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.moreBtn}
                            onPress={() => navigation.navigate(SCREEN_NAMES.UPDATE_TOURNAMENT_STATUS, {
                                tournamentId: item.id,
                                currentStatus: item.status,
                                tournamentName: item.name
                            })}
                        >
                            <MoreVertical size={20} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <MapPin size={14} color={COLORS.textTertiary} />
                        <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={styles.dateInfo}>
                            <Calendar size={14} color={COLORS.primary} />
                            <Text style={styles.dateText}>{formatDate(item.startDate)}</Text>
                        </View>

                        <View style={styles.priceContainer}>
                            {hasDiscount && (
                                <Text style={styles.originalPrice}>₹{entryFee.toFixed(2)}</Text>
                            )}
                            <Text style={styles.finalPrice}>₹{finalPrice.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Tournaments</Text>
                <View style={{ width: 40 }} /> {/* Spacer */}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color={COLORS.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search tournaments, location, or sports..."
                        placeholderTextColor={COLORS.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={18} color={COLORS.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <Filter size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : filteredTournaments.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Trophy size={60} color={COLORS.gray200} />
                    <Text style={styles.emptyTitle}>No Tournaments Found</Text>
                    <Text style={styles.emptySubtitle}>Try searching for something else</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTournaments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTournamentCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
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
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        backgroundColor: COLORS.white,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        gap: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        marginLeft: 8,
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.primary + '10',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING['16'],
        gap: 16,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 160,
    },
    discountBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: COLORS.success,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '800',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerLeft: {
        flex: 1,
        gap: 4,
    },
    tournamentName: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    moreBtn: {
        padding: 4,
        marginRight: -4,
    },
    formatBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    formatText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    originalPrice: {
        fontSize: 11,
        color: COLORS.textTertiary,
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    finalPrice: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.primary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
});

export default AllTournamentsScreen;
