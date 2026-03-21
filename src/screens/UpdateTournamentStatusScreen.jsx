import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ChevronDown, CheckCircle2, Zap, Clock, Info, Trophy } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import { updateTournamentStatus } from '../redux/slices/tournamentSlice';
import { AppAlert } from '../components';

const STATUS_OPTIONS = [
    { label: 'Registration Open', value: 'registration_open', icon: Clock, color: '#3B82F6' },
    { label: 'Live', value: 'Live', icon: Zap, color: '#F59E0B' },
    { label: 'Completed', value: 'completed', icon: CheckCircle2, color: '#10B981' },
];

const UpdateTournamentStatusScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { tournamentId, currentStatus, tournamentName } = route.params;

    const [status, setStatus] = useState(currentStatus || 'registration_open');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
    });

    const selectedOption = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];

    const showAlert = (title, message, type = 'info') => {
        setAlertConfig({ visible: true, title, message, type });
    };

    const handleUpdateStatus = async () => {
        setLoading(true);
        try {
            await dispatch(updateTournamentStatus({ id: tournamentId, status })).unwrap();
            showAlert('Success', 'Tournament status updated successfully.', 'success');
            setTimeout(() => {
                navigation.goBack();
            }, 1500);
        } catch (err) {
            showAlert('Error', err?.message || err || 'Failed to update status', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderPickerModal = () => (
        <Modal
            visible={pickerVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setPickerVisible(false)}
        >
            <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setPickerVisible(false)}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select New Status</Text>
                        <View style={styles.modalDivider} />
                    </View>
                    
                    {STATUS_OPTIONS.map((item) => {
                        const Icon = item.icon;
                        const isSelected = item.value === status;
                        
                        return (
                            <TouchableOpacity
                                key={item.value}
                                style={[styles.statusItem, isSelected && styles.statusItemSelected]}
                                onPress={() => {
                                    setStatus(item.value);
                                    setPickerVisible(false);
                                }}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                                    <Icon size={20} color={item.color} />
                                </View>
                                <Text style={[styles.statusItemText, isSelected && { color: item.color, fontWeight: '700' }]}>
                                    {item.label}
                                </Text>
                                {isSelected && <CheckCircle2 size={20} color={item.color} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tournament Management</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.infoCard}>
                    <View style={styles.tournamentIconBadge}>
                        <Trophy size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.tournamentInfo}>
                        <Text style={styles.tournamentLabel}>Tournament Name</Text>
                        <Text style={styles.tournamentName}>{tournamentName}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>UPDATE STATUS</Text>
                    <Text style={styles.sectionDesc}>Select the current stage of this tournament.</Text>
                    
                    <TouchableOpacity 
                        style={styles.pickerTrigger} 
                        onPress={() => setPickerVisible(true)}
                    >
                        <View style={styles.pickerTriggerLeft}>
                            <View style={[styles.triggerIconContainer, { backgroundColor: selectedOption.color + '15' }]}>
                                <selectedOption.icon size={20} color={selectedOption.color} />
                            </View>
                            <View>
                                <Text style={styles.triggerLabel}>Tournament Status</Text>
                                <Text style={[styles.triggerValue, { color: selectedOption.color }]}>
                                    {selectedOption.label}
                                </Text>
                            </View>
                        </View>
                        <ChevronDown size={20} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.guideCard}>
                    <Info size={18} color={COLORS.primary} />
                    <View style={styles.guideTextContainer}>
                        <Text style={styles.guideTitle}>Why update status?</Text>
                        <Text style={styles.guideDesc}>
                            Updating the status helps players know if registration is open, if the matches are currently ongoing, or if the event has concluded.
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.updateBtn, loading && styles.updateBtnDisabled]} 
                    onPress={handleUpdateStatus}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.updateBtnText}>Update Tournament Status</Text>
                    )}
                </TouchableOpacity>
            </View>

            {renderPickerModal()}

            <AppAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
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
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    content: {
        flex: 1,
        padding: SPACING['20'],
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING['16'],
        borderRadius: 20,
        marginBottom: SPACING['24'],
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tournamentIconBadge: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING['16'],
    },
    tournamentInfo: {
        flex: 1,
    },
    tournamentLabel: {
        fontSize: 10,
        color: COLORS.textTertiary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    tournamentName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },
    section: {
        marginBottom: SPACING['24'],
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textSecondary,
        marginBottom: 4,
        letterSpacing: 1,
    },
    sectionDesc: {
        fontSize: 13,
        color: COLORS.textTertiary,
        marginBottom: 16,
    },
    pickerTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: SPACING['16'],
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    pickerTriggerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    triggerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    triggerLabel: {
        fontSize: 10,
        color: COLORS.textTertiary,
        fontWeight: '600',
        marginBottom: 2,
    },
    triggerValue: {
        fontSize: 15,
        fontWeight: '800',
    },
    guideCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary + '08',
        padding: SPACING['16'],
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary + '15',
    },
    guideTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    guideTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 4,
    },
    guideDesc: {
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    footer: {
        padding: SPACING['20'],
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    updateBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    updateBtnDisabled: {
        opacity: 0.6,
    },
    updateBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '800',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: SPACING['24'],
        paddingBottom: SPACING['40'],
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: SPACING['24'],
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 16,
    },
    modalDivider: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: 2,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING['16'],
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statusItemSelected: {
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    statusItemText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '600',
    },
});

export default UpdateTournamentStatusScreen;
