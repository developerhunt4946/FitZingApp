import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
    ChevronLeft,
    Plus,
    Trash2,
    Users,
    CreditCard,
    ShieldCheck,
    CheckCircle2,
    User,
    Mail,
    Phone,
    Calendar
} from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import { AppAlert, AppInput } from '../components';
import SCREEN_NAMES from '../constants/screenNames';

const RegistrationScreen = ({ route }) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { tournamentId, categories = [] } = route.params || {};

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [players, setPlayers] = useState([{ firstName: '', lastName: '', email: '', phone: '' }]);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
    });

    const showAlert = (title, message, type = 'info', onConfirm = null) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            onConfirm,
        });
    };

    const currentCategory = useMemo(() => {
        return categories.find(cat => cat.id === selectedCategory);
    }, [selectedCategory, categories]);

    const calculateTotal = useMemo(() => {
        if (!currentCategory) return { entryFee: 0, discount: 0, total: 0 };
        const entryFee = currentCategory.entryFee || 0;
        const discountPercent = currentCategory.discount || 0;
        const discountAmount = entryFee * (discountPercent / 100);
        const total = entryFee - discountAmount;
        return {
            entryFee: entryFee,
            discount: discountAmount,
            total: total
        };
    }, [currentCategory]);

    const handleAddPlayer = () => {
        if (currentCategory && players.length >= currentCategory.maxPlayers) {
            showAlert('Limit Reached', `Maximum ${currentCategory.maxPlayers} players allowed for this category.`, 'warning');
            return;
        }
        setPlayers([...players, { firstName: '', lastName: '', email: '', phone: '' }]);
    };

    const handleRemovePlayer = (index) => {
        if (players.length > 1) {
            const newPlayers = [...players];
            newPlayers.splice(index, 1);
            setPlayers(newPlayers);
        }
    };

    const handlePlayerChange = (index, field, value) => {
        const newPlayers = [...players];
        newPlayers[index][field] = value;
        setPlayers(newPlayers);
    };

    const validateForm = () => {
        if (!selectedCategory) {
            showAlert('Error', 'Please select a category.', 'error');
            return false;
        }
        if (!teamName.trim()) {
            showAlert('Error', 'Please enter a team name.', 'error');
            return false;
        }
        if (players.length < (currentCategory?.minPlayers || 1)) {
            showAlert('Error', `Minimum ${currentCategory.minPlayers} players required.`, 'error');
            return false;
        }
        if (players.length > (currentCategory?.maxPlayers || 99)) {
            showAlert('Error', `Maximum ${currentCategory.maxPlayers} players allowed.`, 'error');
            return false;
        }
        for (let i = 0; i < players.length; i++) {
            if (!players[i].firstName || !players[i].lastName || !players[i].email || !players[i].phone) {
                showAlert('Error', `Please fill all details for Player ${i + 1}.`, 'error');
                return false;
            }
        }
        return true;
    };

    const handlePayNow = () => {
        if (validateForm()) {
            navigation.navigate(SCREEN_NAMES.REGISTRATION_CONFIRMATION, {
                tournamentId,
                categoryId: selectedCategory,
                categoryName: currentCategory.name,
                teamName,
                players,
                total: calculateTotal.total,
                breakup: calculateTotal
            });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <View style={[styles.header, { paddingTop: insets.top || SPACING['12'] }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ChevronLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Registration</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                >
                    {/* Category Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <ShieldCheck size={20} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Select Category</Text>
                        </View>
                        <View style={styles.categoryGrid}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryCard,
                                        selectedCategory === cat.id && styles.categoryCardSelected
                                    ]}
                                    onPress={() => setSelectedCategory(cat.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.catCardHeader}>
                                        <Text style={[
                                            styles.categoryName,
                                            selectedCategory === cat.id && styles.categoryNameSelected
                                        ]}>{cat.name}</Text>
                                        {selectedCategory === cat.id && (
                                            <CheckCircle2 size={18} color={COLORS.primary} />
                                        )}
                                    </View>
                                    {cat.discount > 0 && (
                                        <View style={styles.discountBadge}>
                                            <Text style={styles.discountText}>{cat.discount}% OFF</Text>
                                        </View>
                                    )}
                                    <View style={styles.catConstraintRow}>
                                        <Text style={styles.catConstraintText}>Age: {cat.minAge}-{cat.maxAge} years</Text>
                                        <Text style={styles.catConstraintText}>Players: {cat.minPlayers}-{cat.maxPlayers}</Text>
                                    </View>
                                    {cat.discount > 0 ? (
                                        <View style={styles.priceRow}>
                                            <Text style={styles.originalPrice}>₹{(Number(cat?.entryFee) || 0).toFixed(2)}</Text>
                                            <Text style={styles.categoryFeeText}>₹{(Number(cat?.entryFee) * (1 - cat.discount / 100)).toFixed(2)}</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.categoryFeeText}>₹{(Number(cat?.entryFee) || 0).toFixed(2)}</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Team Details */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Users size={20} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Team Details</Text>
                        </View>
                        <AppInput
                            label="Team Name"
                            placeholder="Enter your team name"
                            value={teamName}
                            onChangeText={setTeamName}
                            leftIcon={<ShieldCheck size={18} color={COLORS.primary} />}
                        />
                    </View>

                    {/* Players Info */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Users size={20} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Players Information</Text>
                        </View>

                        {players.map((player, index) => (
                            <View key={index} style={styles.playerCard}>
                                <View style={styles.playerHeader}>
                                    <View style={styles.playerIndexBadge}>
                                        <Text style={styles.playerIndexText}>P{index + 1}</Text>
                                    </View>
                                    <Text style={styles.playerHeaderTitle}>Player Details</Text>
                                    {players.length > 1 && (
                                        <TouchableOpacity
                                            onPress={() => handleRemovePlayer(index)}
                                            style={styles.deleteBtn}
                                        >
                                            <Trash2 size={16} color={COLORS.error} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.playerRow}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <AppInput
                                            label="First Name"
                                            placeholder="First Name"
                                            value={player.firstName}
                                            onChangeText={(val) => handlePlayerChange(index, 'firstName', val)}
                                            leftIcon={<User size={18} color={COLORS.primary} />}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <AppInput
                                            label="Last Name"
                                            placeholder="Last Name"
                                            value={player.lastName}
                                            onChangeText={(val) => handlePlayerChange(index, 'lastName', val)}
                                            leftIcon={<User size={18} color={COLORS.primary} />}
                                        />
                                    </View>
                                </View>

                                <AppInput
                                    label="Email Address"
                                    placeholder="Enter email"
                                    value={player.email}
                                    keyboardType="email-address"
                                    onChangeText={(val) => handlePlayerChange(index, 'email', val)}
                                    leftIcon={<Mail size={18} color={COLORS.primary} />}
                                />

                                <AppInput
                                    label="Mobile Number"
                                    placeholder="Enter mobile number"
                                    value={player.phone}
                                    keyboardType="phone-pad"
                                    onChangeText={(val) => handlePlayerChange(index, 'phone', val)}
                                    leftIcon={<Phone size={18} color={COLORS.primary} />}
                                />
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.addPlayerBtn}
                            onPress={handleAddPlayer}
                            activeOpacity={0.6}
                        >
                            <Plus size={20} color={COLORS.primary} />
                            <Text style={styles.addPlayerText}>Add Another Player</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Fees Breakup */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <CreditCard size={20} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Fees Breakup</Text>
                        </View>
                        <View style={styles.feeCard}>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Entry Fee ({currentCategory?.name || 'Category'})</Text>
                                <Text style={styles.feeValue}>₹{(Number(calculateTotal?.entryFee) || 0).toFixed(2)}</Text>
                            </View>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Discount Deduction</Text>
                                <Text style={[styles.feeValue, { color: COLORS.success }]}>- ₹{(Number(calculateTotal?.discount) || 0).toFixed(2)}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.feeRow}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalValue}>₹{(Number(calculateTotal?.total) || 0).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Actions */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING['16'] }]}>
                <TouchableOpacity
                    style={[styles.payBtn, !selectedCategory && styles.disabledBtn]}
                    onPress={handlePayNow}
                    disabled={!selectedCategory}
                    activeOpacity={0.8}
                >
                    <Text style={styles.payBtnText}>Pay Now ₹{(Number(calculateTotal?.total) || 0).toFixed(2)}</Text>
                </TouchableOpacity>
            </View>

            {/* Custom Alert */}
            <AppAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={alertConfig.onConfirm}
                showCancel={alertConfig.type === 'confirm'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['16'],
        height: 56,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray100,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: 0.3,
    },
    scrollContent: {
        padding: SPACING['16'],
    },
    section: {
        marginBottom: SPACING['24'],
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: SPACING['16'],
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: 0.5,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryCard: {
        width: '48%',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    categoryCardSelected: {
        borderColor: COLORS.primary,
        borderWidth: 1.5,
        backgroundColor: COLORS.primary + '05',
    },
    catCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.text,
        flex: 1,
    },
    categoryNameSelected: {
        color: COLORS.primary,
    },
    catConstraintRow: {
        marginBottom: 12,
    },
    catConstraintText: {
        fontSize: 11,
        color: COLORS.textTertiary,
        fontWeight: '600',
        lineHeight: 16,
    },
    categoryFeeText: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.primary,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    originalPrice: {
        fontSize: 12,
        color: COLORS.textTertiary,
        textDecorationLine: 'line-through',
        fontWeight: '600',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 9,
        fontWeight: '800',
    },
    playerCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    playerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: COLORS.gray100,
        padding: 8,
        borderRadius: 12,
    },
    playerIndexBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    playerIndexText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '800',
    },
    playerHeaderTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteBtn: {
        padding: 6,
        backgroundColor: COLORS.error + '10',
        borderRadius: 8,
    },
    addPlayerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '05',
        marginTop: 4,
    },
    addPlayerText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },
    feeCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        elevation: 2,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    feeLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    feeValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 14,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.primary,
    },
    footer: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING['16'],
        paddingTop: SPACING['16'],
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    payBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    disabledBtn: {
        backgroundColor: COLORS.gray400,
        shadowOpacity: 0,
        elevation: 0,
    },
    payBtnText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});

export default RegistrationScreen;
