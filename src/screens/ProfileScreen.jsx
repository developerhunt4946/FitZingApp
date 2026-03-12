import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { User, Phone, MapPin, CheckCircle, ChevronLeft, Camera, LogOut } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../theme';
import STRINGS from '../constants/strings';
import { updateProfile, clearError } from '../redux/slices/authSlice';
import { AppInput, DatePickerInput, AppAlert } from '../components';

const ProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        firstName: user?.firstName || user?.first_name || '',
        lastName: user?.lastName || user?.last_name || '',
        phone: user?.phone || user?.mobile || '',
        dateOfBirth: user?.dateOfBirth || user?.dob || '',
        city: user?.city || '',
        state: user?.state || '',
    });

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

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user?.firstName || user?.first_name || '',
                lastName: user?.lastName || user?.last_name || '',
                phone: user?.phone || user?.mobile || '',
                dateOfBirth: user?.dateOfBirth || user?.dob || '',
                city: user?.city || '',
                state: user?.state || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (error) {
            showAlert(STRINGS.UPDATE_FAILED, error, 'error');
            dispatch(clearError());
        }
    }, [error]);

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const resultAction = await dispatch(updateProfile(formData));
            if (updateProfile.fulfilled.match(resultAction)) {
                showAlert(STRINGS.SUCCESS || 'Success', STRINGS.PROFILE_UPDATED, 'success');
            }
        } catch (err) {
            console.error('Save profile error:', err);
        }
    };


    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <View style={styles.headerGradient}>
                <View style={styles.headerToolbar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ChevronLeft size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{STRINGS.EDIT_PROFILE}</Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <LogOut size={22} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.avatarContainer}>
                    <View style={styles.avatarBorder}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <Camera size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userNameText}>{user?.firstName || user?.first_name} {user?.lastName || user?.last_name}</Text>
                    <Text style={styles.userEmailText}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{(user?.role || user?.userRole || 'User').toUpperCase()}</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flexOne}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Personal Information</Text>
                        <View style={styles.row}>
                            <View style={styles.flexOne}>
                                <AppInput
                                    label={STRINGS.FIRST_NAME}
                                    value={formData.firstName}
                                    onChangeText={(text) => handleChange('firstName', text)}
                                    leftIcon={<User size={18} color={COLORS.primary} />}
                                    placeholder="First Name"
                                />
                            </View>
                            <View style={{ width: SPACING['12'] }} />
                            <View style={styles.flexOne}>
                                <AppInput
                                    label={STRINGS.LAST_NAME}
                                    value={formData.lastName}
                                    onChangeText={(text) => handleChange('lastName', text)}
                                    leftIcon={<User size={18} color={COLORS.primary} />}
                                    placeholder="Last Name"
                                />
                            </View>
                        </View>

                        <DatePickerInput
                            label={STRINGS.BIRTH_DATE}
                            value={formData.dateOfBirth}
                            onChange={(text) => handleChange('dateOfBirth', text)}
                            maxYear={new Date().getFullYear() - 13}
                        />

                        <AppInput
                            label={STRINGS.MOBILE}
                            value={formData.phone}
                            onChangeText={(text) => handleChange('phone', text)}
                            leftIcon={<Phone size={18} color={COLORS.primary} />}
                            placeholder="Mobile Number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Location Details</Text>
                        <AppInput
                            label={STRINGS.CITY}
                            value={formData.city}
                            onChangeText={(text) => handleChange('city', text)}
                            leftIcon={<MapPin size={18} color={COLORS.primary} />}
                            placeholder="City"
                        />
                        <AppInput
                            label={STRINGS.STATE}
                            value={formData.state}
                            onChangeText={(text) => handleChange('state', text)}
                            leftIcon={<MapPin size={18} color={COLORS.primary} />}
                            placeholder="State"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <View style={styles.buttonGradient}>
                                <CheckCircle size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>{STRINGS.SAVE_CHANGES}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

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
    flexOne: {
        flex: 1,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 30,
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    headerToolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['20'],
        marginBottom: SPACING['20'],
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 0.5,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
    },
    avatarBorder: {
        padding: 5,
        borderRadius: 65,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        position: 'relative',
        marginBottom: SPACING['8'],
    },
    avatarCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '800',
        color: COLORS.primary,
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: COLORS.accent,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    userNameText: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.white,
    },
    userEmailText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING['20'],
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING['20'],
        marginBottom: SPACING['20'],
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING['20'],
        letterSpacing: 0.3,
    },
    row: {
        flexDirection: 'row',
    },
    saveButton: {
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: SPACING['8'],
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    roleBadge: {
        marginTop: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    roleText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
});

export default ProfileScreen;
