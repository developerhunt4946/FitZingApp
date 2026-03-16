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
    Modal,
    TextInput,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ChevronDown, ChevronUp, Trash2, Users, Plus, Info, X } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import { fetchGroups, createGroups, deleteGroup } from '../redux/slices/tournamentSlice';
import { AppAlert } from '../components';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GroupsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { tournamentId, categoryId, categoryName, roundNo, roundId, round } = route.params;

    const { groups, groupsLoading, loading, error } = useSelector((state) => state.tournament);
    const groupsArray = Array.isArray(groups) ? groups : [];
    const filteredGroups = roundId ? groupsArray.filter(g => String(g.roundId) === String(roundId)) : groupsArray;
    const [expandedGroups, setExpandedGroups] = useState({});

    const [isCreateModalVisible, setCreateModalVisible] = useState(false);
    const [numGroups, setNumGroups] = useState('2');
    const [maxTeams, setMaxTeams] = useState('4');

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
    });

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

    const handleOpenCreateModal = () => {
        setCreateModalVisible(true);
    };

    const showAlert = (title, message, type = 'info', onConfirm = null) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            onConfirm,
        });
    };

    const handleCreateGroups = async () => {
        try {
            await dispatch(createGroups({
                tournamentId,
                categoryId,
                roundId,
                numberOfGroups: parseInt(numGroups) || 2,
                teamsPerGroup: parseInt(maxTeams) || 4,
            })).unwrap();
            setCreateModalVisible(false);
            showAlert('Success', 'Groups created successfully.', 'success');
            dispatch(fetchGroups({ tournamentId, categoryId }));
        } catch (err) {
            showAlert('Error', typeof err === 'string' ? err : (err?.message || 'Failed to create groups'), 'error');
        }
    };

    const handleDeleteGroup = (groupId) => {
        showAlert(
            'Delete Group',
            'Are you sure you want to delete this group?',
            'confirm',
            async () => {
                try {
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                    await dispatch(deleteGroup({ tournamentId, categoryId, groupId })).unwrap();
                    showAlert('Success', 'Group deleted successfully.', 'success');
                    dispatch(fetchGroups({ tournamentId, categoryId }));
                } catch (err) {
                    showAlert('Error', err || 'Failed to delete group', 'error');
                }
            }
        );
    };

    const getGroupName = (index) => {
        return String.fromCharCode(65 + index); // 0 -> A, 1 -> B...
    };

    const renderGroupItem = ({ item, index }) => {
        const isExpanded = expandedGroups[item.groupId];
        const groupDisplayName = item.name || `Group ${getGroupName(index)}`;
        return (
            <View style={styles.groupCard}>
                <TouchableOpacity
                    style={styles.groupHeader}
                    activeOpacity={0.7}
                    onPress={() => toggleGroup(item.groupId)}
                >
                    <View style={styles.groupTitleRow}>
                        <View style={styles.groupBadge}>
                            <Text style={styles.groupBadgeText}>{getGroupName(index)}</Text>
                        </View>
                        <View>
                            <Text style={styles.groupTitle}>{groupDisplayName}</Text>
                            <Text style={styles.teamCount}>{item.teams?.length || 0} Teams</Text>
                        </View>
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
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{roundNo ? `Round ${roundNo} - ` : ''}{categoryName}</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreateModal}>
                    <Plus size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {groupsLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : filteredGroups?.length > 0 ? (
                <FlatList
                    data={filteredGroups}
                    keyExtractor={(item, index) => item.id || item.groupId || index.toString()}
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
                        Create groups to assign teams for Round {roundNo}.
                    </Text>

                    <TouchableOpacity
                        style={styles.createBtn}
                        onPress={handleOpenCreateModal}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Plus size={20} color={COLORS.white} />
                                <Text style={styles.createBtnText}>Create Groups</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Create Groups Modal */}
            <Modal
                visible={isCreateModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCreateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Groups</Text>
                            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                                <X size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Number of Groups</Text>
                            <TextInput
                                style={styles.input}
                                value={numGroups}
                                onChangeText={setNumGroups}
                                keyboardType="numeric"
                                placeholder="e.g. 2"
                            />

                            <View style={{ height: 20 }} />

                            <Text style={styles.label}>Max Teams per Group</Text>
                            <TextInput
                                style={styles.input}
                                value={maxTeams}
                                onChangeText={setMaxTeams}
                                keyboardType="numeric"
                                placeholder="e.g. 4"
                            />

                            <View style={styles.infoBox}>
                                <Info size={16} color={COLORS.textTertiary} />
                                <Text style={styles.infoText}>
                                    Teams will be randomly assigned based on these parameters for Round {roundNo}.
                                </Text>
                            </View>
                        </ScrollView>
                        <TouchableOpacity style={styles.submitBtn} onPress={handleCreateGroups}>
                            {loading ? <ActivityIndicator color={COLORS.white} /> : (
                                <Text style={styles.submitBtnText}>Generate Groups</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Custom Alert */}
            <AppAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
                showCancel={alertConfig.type === 'confirm'}
                confirmText={alertConfig.type === 'confirm' ? 'Delete' : 'OK'}
            />
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
    addBtn: {
        padding: 4,
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
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING['20'],
        backgroundColor: COLORS.surface,
    },
    groupTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    groupBadge: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    groupBadgeText: {
        color: COLORS.surface,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    teamCount: {
        fontSize: 13,
        color: COLORS.textTertiary,
        marginTop: 2,
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
        paddingHorizontal: SPACING['20'],
        paddingBottom: SPACING['20'],
        backgroundColor: COLORS.surface,
    },
    teamItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        gap: 12,
    },
    teamIndex: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    teamIndexText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    teamName: {
        fontSize: 15,
        color: COLORS.text,
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
    },
    createBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
    },
    modalBody: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.text,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '05',
        padding: 12,
        borderRadius: 10,
        marginTop: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.primary + '10',
    },
    infoText: {
        fontSize: 11,
        color: COLORS.textTertiary,
        flex: 1,
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    submitBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default GroupsScreen;
