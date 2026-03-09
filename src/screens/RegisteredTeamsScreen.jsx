import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Modal,
    ScrollView,
    Linking,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Users, Eye, X, Mail, Phone, UserCircle, BadgeCheck, Search } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import { fetchRegisteredTeams } from '../redux/slices/tournamentSlice';

const RegisteredTeamsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { tournamentId, categoryId, categoryName } = route.params;

    const { registeredTeams, teamsLoading, error } = useSelector((state) => state.tournament);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchRegisteredTeams({ tournamentId, categoryId }));
    }, [dispatch, tournamentId, categoryId]);

    const filteredTeams = registeredTeams.filter(team =>
        team.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewDetails = (team) => {
        setSelectedTeam(team);
        setModalVisible(true);
    };

    const handleCall = (phone) => {
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        }
    };

    const renderTeamCard = ({ item }) => (
        <View style={styles.teamCard}>
            <View style={styles.teamInfo}>
                <View style={styles.teamNameRow}>
                    <Text style={styles.teamName}>{item.name}</Text>
                    {item.isVerified && (
                        <BadgeCheck size={18} color={COLORS.primary} fill={COLORS.primary + '20'} />
                    )}
                </View>
                <View style={styles.playerCountRow}>
                    <Users size={14} color={COLORS.textTertiary} />
                    <Text style={styles.playerCountText}>
                        {item.players?.length || 0} {STRINGS.PLAYERS}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => handleViewDetails(item)}
            >
                <Eye size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
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
                    <Text style={styles.headerTitle}>{STRINGS.REGISTERED_TEAMS}</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{categoryName}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <Search size={20} color={COLORS.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search teams..."
                        placeholderTextColor={COLORS.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                </View>
            </View>

            {teamsLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        onPress={() => dispatch(fetchRegisteredTeams({ tournamentId, categoryId }))}
                        style={styles.retryBtn}
                    >
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : registeredTeams.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Users size={48} color={COLORS.textTertiary} opacity={0.5} />
                    <Text style={styles.emptyText}>No teams registered yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTeams}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTeamCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        searchQuery ? (
                            <View style={styles.noResultContainer}>
                                <Text style={styles.noResultText}>No teams found matching "{searchQuery}"</Text>
                            </View>
                        ) : null
                    }
                />
            )}

            {/* Team Details Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{STRINGS.TEAM_DETAILS}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.teamSummary}>
                                <View style={styles.teamNameRow}>
                                    <Text style={styles.summaryTeamName}>{selectedTeam?.name}</Text>
                                    {selectedTeam?.isVerified && (
                                        <BadgeCheck size={22} color={COLORS.primary} fill={COLORS.primary + '20'} />
                                    )}
                                </View>
                            </View>

                            <View style={styles.playerListSection}>
                                <Text style={styles.sectionLabel}>{STRINGS.PLAYERS}</Text>
                                {selectedTeam?.players?.map((player, index) => (
                                    <View key={index} style={styles.playerCard}>
                                        <View style={styles.playerHeader}>
                                            <UserCircle size={20} color={COLORS.primary} />
                                            <Text style={styles.playerName}>
                                                {player.firstName} {player.lastName}
                                            </Text>
                                        </View>
                                        <View style={styles.playerContactInfo}>
                                            <View style={styles.contactItem}>
                                                <Mail size={14} color={COLORS.textTertiary} />
                                                <Text style={styles.contactText}>{player.email}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.contactItem}
                                                onPress={() => handleCall(player.phone)}
                                            >
                                                <Phone size={14} color={COLORS.primary} />
                                                <Text style={[styles.contactText, { color: COLORS.primary, fontWeight: '600' }]}>
                                                    {player.phone}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        paddingTop: 8,
    },
    searchContainer: {
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.text,
        paddingVertical: 0,
    },
    noResultContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    noResultText: {
        fontSize: 14,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
    teamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: SPACING['16'],
        borderRadius: 16,
        marginBottom: SPACING['12'],
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    teamInfo: {
        flex: 1,
    },
    teamNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    playerCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    playerCountText: {
        fontSize: 13,
        color: COLORS.textTertiary,
    },
    viewBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 14,
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    retryText: {
        color: COLORS.white,
        fontWeight: '700',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textTertiary,
        marginTop: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: SPACING['24'],
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING['20'],
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    teamSummary: {
        padding: SPACING['20'],
        backgroundColor: COLORS.surface,
        marginBottom: 12,
    },
    summaryTeamName: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    summaryStatus: {
        fontSize: 12,
        color: COLORS.success || '#22C55E',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    playerListSection: {
        paddingHorizontal: SPACING['20'],
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textTertiary,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    playerCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING['16'],
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    playerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    playerName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
    },
    playerContactInfo: {
        gap: 6,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contactText: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
});

export default RegisteredTeamsScreen;
