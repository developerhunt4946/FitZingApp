import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import { MapPin, Calendar, Users, Trophy, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import SCREEN_NAMES from '../constants/screenNames';
import STRINGS from '../constants/strings';

const TournamentCard = ({ item }) => {
    const navigation = useNavigation();

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const dummyImage = 'https://static.vecteezy.com/system/resources/thumbnails/071/200/626/small/cricket-ball-and-bat-on-grass-photo.jpg';

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate(SCREEN_NAMES.TOURNAMENT_DETAILS, { tournamentId: item.id })}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.imageURL }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status?.toUpperCase() || STRINGS.UPCOMING}</Text>
                </View>
                <View style={styles.feeBadge}>
                    <Text style={styles.feeText}>₹{item.entryFee}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.tournamentName} numberOfLines={1}>{item.name}</Text>

                <View style={styles.infoRow}>
                    <MapPin size={14} color={COLORS.textTertiary} />
                    <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.dateRow}>
                        <Calendar size={14} color={COLORS.primary} />
                        <Text style={styles.dateText}>{formatDate(item.startDate)}</Text>
                    </View>
                    <View style={styles.formatBadge}>
                        <Trophy size={12} color={COLORS.secondary} />
                        <Text style={styles.formatText}>{item.format?.toUpperCase()}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const TournamentList = ({ tournaments, loading, error }) => {
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!tournaments || tournaments.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No tournaments available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={tournaments}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <TournamentCard item={item} />}
                contentContainerStyle={styles.listContent}
                snapToAlignment="start"
                decelerationRate="fast"
                snapToInterval={280 + SPACING['16']}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING['16'],
    },
    listContent: {
        paddingHorizontal: SPACING['16'],
        gap: SPACING['16'],
    },
    card: {
        width: 280,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    imageContainer: {
        height: 140,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    statusBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    feeBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    feeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '800',
    },
    cardContent: {
        padding: SPACING['12'],
    },
    tournamentName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingTop: 10,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    formatBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.secondary + '10',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    formatText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    centerContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
        textAlign: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
});

export default TournamentList;
