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
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ChevronDown, ChevronUp, Trash2, Users, Plus, Info } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import { fetchGroups, createGroups, deleteGroup } from '../redux/slices/tournamentSlice';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GroupsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { tournamentId, categoryId, categoryName } = route.params;

    const { groups, groupsLoading, loading, error } = useSelector((state) => state.tournament);
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        dispatch(fetchGroups({ tournamentId, categoryId }));
    }, [dispatch, tournamentId, categoryId]);

    const toggleGroup = (groupId) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };

    const handleCreateGroups = async () => {
        try {
            await dispatch(createGroups({ tournamentId, categoryId })).unwrap();
            Alert.alert('Success', 'Groups created successfully.');
        } catch (err) {
            Alert.alert('Error', err || 'Failed to create groups');
        }
    };

    const handleDeleteGroup = (groupId) => {
        Alert.alert(
            'Delete Group',
            'Are you sure you want to delete this group?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(deleteGroup({ tournamentId, categoryId, groupId })).unwrap();
                            Alert.alert('Success', 'Group deleted successfully.');
                        } catch (err) {
                            Alert.alert('Error', err || 'Failed to delete group');
                        }
                    },
                },
            ]
        );
    };

    const renderGroupItem = ({ item }) => {
        const isExpanded = expandedGroups[item.groupId];
        return (
            <View style={styles.groupCard}>
                <TouchableOpacity
                    style={styles.groupHeader}
                    activeOpacity={0.7}
                    onPress={() => toggleGroup(item.groupId)}
                >
                    <View style={styles.groupTitleRow}>
                        <View style={styles.groupBadge}>
                            <Text style={styles.groupBadgeText}>{item.groupId}</Text>
                        </View>
                        <Text style={styles.groupTitle}>Group {item.groupId}</Text>
                        <Text style={styles.teamCount}>({item.teams?.length || 0} Teams)</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => handleDeleteGroup(item.groupId)}
                            style={styles.deleteBtn}
                        >
                            <Trash2 size={18} color={COLORS.error} />
                        </TouchableOpacity>
                        {isExpanded ? (
                            <ChevronUp size={24} color={COLORS.textTertiary} />
                        ) : (
                            <ChevronDown size={24} color={COLORS.textTertiary} />
                        )}
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.teamsList}>
                        {item.teams?.map((team, index) => (
                            <View key={team.id} style={styles.teamItem}>
                                <View style={styles.teamIndex}>
                                    <Text style={styles.teamIndexText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.teamName}>{team.name}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{STRINGS.GROUPS}</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{categoryName}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {groupsLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : groups?.length > 0 ? (
                <FlatList
                    data={groups}
                    keyExtractor={(item) => item.groupId}
                    renderItem={renderGroupItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text style={styles.listHeaderText}>Active Groups</Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Users size={48} color={COLORS.primary} opacity={0.5} />
                    </View>
                    <Text style={styles.emptyTitle}>No Groups Created</Text>
                    <Text style={styles.emptySubtitle}>
                        You can automatically assign registered teams into balanced groups.
                    </Text>

                    <TouchableOpacity
                        style={styles.createBtn}
                        onPress={handleCreateGroups}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Plus size={20} color={COLORS.white} />
                                <Text style={styles.createBtnText}>{STRINGS.CREATE_GROUPS}</Text>
                            </>
                        )}
                    </TouchableOpacity>
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
    listHeader: {
        marginBottom: 16,
    },
    listHeaderText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textTertiary,
        textTransform: 'uppercase',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        overflow: 'hidden',
        elevation: 2,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING['16'],
        backgroundColor: COLORS.surface,
    },
    groupTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    groupBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupBadgeText: {
        color: COLORS.white,
        fontWeight: '800',
        fontSize: 16,
    },
    groupTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.text,
    },
    teamCount: {
        fontSize: 13,
        color: COLORS.textTertiary,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    deleteBtn: {
        padding: 4,
    },
    teamsList: {
        paddingHorizontal: SPACING['16'],
        paddingBottom: SPACING['16'],
        backgroundColor: COLORS.surface,
    },
    teamItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        gap: 12,
    },
    teamIndex: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    teamIndexText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textTertiary,
    },
    teamName: {
        fontSize: 15,
        color: COLORS.textSecondary,
        fontWeight: '600',
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
    createBtn: {
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
    createBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default GroupsScreen;
