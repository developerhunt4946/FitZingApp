import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../theme';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Trophy,
    Info,
    ChevronRight,
    ShieldCheck,
    Zap,
    Users,
    UserCircle,
    Mail,
    Phone,
    Percent,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import STRINGS from '../constants/strings';
import SCREEN_NAMES from '../constants/screenNames';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TournamentDetailsScreen = ({ route }) => {
    const navigation = useNavigation();
    const { tournamentId } = route.params;
    const { tournaments } = useSelector((state) => state.tournament);

    // Find tournament in state (or fetch if not there, but let's assume it's in list)
    const tournament = tournaments.find((t) => t.id === tournamentId);

    if (!tournament) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{STRINGS.TOURNAMENT_NOT_FOUND}</Text>
                    <TouchableOpacity
                        onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate(SCREEN_NAMES.HOME)}
                        style={styles.backBtn}
                    >
                        <Text style={styles.backBtnText}>{STRINGS.GO_BACK}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const dummyBanner = 'https://static.vecteezy.com/system/resources/thumbnails/071/200/626/small/cricket-ball-and-bat-on-grass-photo.jpg';

    const formatFullDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Banner Section */}
                <View style={styles.bannerContainer}>
                    <Image source={{ uri: tournament?.imageURL }} style={styles.bannerImage} />
                    <View style={styles.bannerOverlay} />

                    {/* Header Actions */}
                    <SafeAreaView edges={['top']} style={styles.headerRow}>
                        <TouchableOpacity
                            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate(SCREEN_NAMES.HOME)}
                            style={styles.iconBtn}
                        >
                            <ArrowLeft size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content Section */}
                <View style={styles.contentCard}>
                    <View style={styles.badgeRow}>
                        <View style={[styles.statusBadge, { backgroundColor: COLORS.primary + '20' }]}>
                            <Text style={[styles.statusText, { color: COLORS.primary }]}>{tournament.status?.toUpperCase()}</Text>
                        </View>
                        <View style={[styles.formatBadge, { backgroundColor: COLORS.secondary + '20' }]}>
                            <Trophy size={14} color={COLORS.secondary} />
                            <Text style={[styles.formatText, { color: COLORS.secondary }]}>{tournament.format?.toUpperCase()}</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{tournament.name}</Text>

                    <View style={styles.locationRow}>
                        <View style={styles.locationIcon}>
                            <MapPin size={18} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.locationLabel}>{STRINGS.LOCATION}</Text>
                            <Text style={styles.locationValue}>{tournament.location}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Details Grid */}
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Calendar size={20} color={COLORS.primary} />
                            <View>
                                <Text style={styles.gridLabel}>{STRINGS.STARTS}</Text>
                                <Text style={styles.gridValue}>{formatFullDate(tournament.startDate).split('at')[0]}</Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <Zap size={20} color={COLORS.accent} />
                            <View>
                                <Text style={styles.gridLabel}>{STRINGS.ENTRY_FEE}</Text>
                                <Text style={styles.gridValue}>₹{tournament.entryFee}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    <View style={styles.sectionHeader}>
                        <Info size={18} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>{STRINGS.ABOUT_TOURNAMENT}</Text>
                    </View>
                    <Text style={styles.description}>{tournament.description}</Text>

                    {/* Categories */}
                    {tournament.categories?.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <ShieldCheck size={18} color={COLORS.primary} />
                                <Text style={styles.sectionTitle}>{STRINGS.CATEGORIES}</Text>
                            </View>
                            {tournament.categories.map((cat) => (
                                <View key={cat.id} style={styles.categoryItem}>
                                    <View style={styles.categoryHeader}>
                                        <Text style={styles.categoryName}>{cat.name}</Text>
                                        <Text style={styles.categoryFee}>₹{cat.entryFee}</Text>
                                    </View>

                                    <View style={styles.catSpecs}>
                                        <View style={styles.specItem}>
                                            <Users size={12} color={COLORS.textTertiary} />
                                            <Text style={styles.specText}>
                                                {cat.minPlayers}-{cat.maxPlayers} Players
                                            </Text>
                                        </View>
                                        <View style={styles.specItem}>
                                            <UserCircle size={12} color={COLORS.textTertiary} />
                                            <Text style={styles.specText}>
                                                Age: {cat.minAge}-{cat.maxAge}
                                            </Text>
                                        </View>
                                        {cat.discount > 0 && (
                                            <View style={styles.specItem}>
                                                <Percent size={12} color={COLORS.success || '#4CAF50'} />
                                                <Text style={[styles.specText, { color: COLORS.success || '#4CAF50' }]}>
                                                    {cat.discount}% Off
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </>
                    )}

                    {/* Organizers */}
                    {tournament.organizers?.length > 0 && (
                        <>
                            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                                <UserCircle size={18} color={COLORS.primary} />
                                <Text style={styles.sectionTitle}>{STRINGS.ORGANIZERS}</Text>
                            </View>
                            {tournament.organizers.map((org, index) => (org.name || org.contact) && (
                                <View key={index} style={styles.organizerCard}>
                                    <View style={styles.orgInfo}>
                                        <Text style={styles.orgName}>{org.name || 'Anonymous Organizer'}</Text>
                                        {org.contact && (
                                            <View style={styles.contactRow}>
                                                {org.contact.includes('@') ? (
                                                    <Mail size={12} color={COLORS.textTertiary} />
                                                ) : (
                                                    <Phone size={12} color={COLORS.textTertiary} />
                                                )}
                                                <Text style={styles.contactText}>{org.contact}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </>
                    )}

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Fixed Bottom Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={[styles.footerBtn, styles.secondaryBtn]}>
                    <Text style={styles.secondaryBtnText}>{STRINGS.SHOW_MATCHES}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.footerBtn, styles.primaryBtn]}
                    onPress={() => navigation.navigate(SCREEN_NAMES.REGISTRATION, {
                        tournamentId: tournament.id,
                        categories: tournament.categories
                    })}
                >
                    <Text style={styles.primaryBtnText}>{STRINGS.REGISTER_NOW}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    bannerContainer: {
        height: 300,
        width: '100%',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    headerRow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['16'],
        paddingTop: SPACING['12'],
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentCard: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: SPACING['20'],
        paddingTop: SPACING['24'],
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    formatBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    formatText: {
        fontSize: 10,
        fontWeight: '700',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
        lineHeight: 32,
        marginBottom: 20,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    locationIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationLabel: {
        fontSize: 12,
        color: COLORS.textTertiary,
        fontWeight: '500',
    },
    locationValue: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 16,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    gridItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    gridLabel: {
        fontSize: 11,
        color: COLORS.textTertiary,
        fontWeight: '500',
    },
    gridValue: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 22,
        marginBottom: 24,
    },
    categoryItem: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    categoryFee: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
    },
    catSpecs: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 4,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    specText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    organizerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    orgInfo: {
        flex: 1,
    },
    orgName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contactText: {
        fontSize: 12,
        color: COLORS.textTertiary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        padding: SPACING['16'],
        paddingBottom: SPACING['24'],
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    footerBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
    },
    primaryBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryBtn: {
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    secondaryBtnText: {
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
});

export default TournamentDetailsScreen;
