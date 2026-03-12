import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, Info, Users, Trophy, Award, Camera, Image as ImageIcon, CheckCircle2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import { COLORS, SPACING } from '../theme';
import STRINGS from '../constants/strings';
import { createESportsTournament, clearTournamentError } from '../redux/slices/tournamentSlice';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { AppAlert } from '../components';

const CreateESportsTournamentScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.tournament);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageURL: '',
        categoryName: '',
        prizePool: '',
        date: new Date(),
        noOfRounds: '',
        minimumTeams: '',
        maximumTeams: '',
        playersPerTeams: '',
        eventType: 'eSports',
        status: 'upcoming',
        entryFeePerTeam: '',
        entryFeePerPlayer: '',
        discount: '0',
        image: null,
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [imagePickerVisible, setImagePickerVisible] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateSelect = (date) => {
        setShowDatePicker(false);
        setFormData((prev) => ({ ...prev, date }));
    };

    const handleImagePick = async (type) => {
        const { launchCamera, launchImageLibrary } = require('react-native-image-picker');
        const options = {
            mediaType: 'photo',
            quality: 1,
            includeBase64: false,
        };

        const callback = (response) => {
            setImagePickerVisible(false);
            if (response.didCancel) return;
            if (response.errorCode) {
                showAlert('Error', response.errorMessage, 'error');
                return;
            }
            if (response.assets && response.assets.length > 0) {
                setFormData((prev) => ({ ...prev, image: response.assets[0] }));
            }
        };

        if (type === 'camera') {
            launchCamera(options, callback);
        } else {
            launchImageLibrary(options, callback);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.categoryName || !formData.date) {
            showAlert('Required Fields', 'Please fill in the tournament name, category, and date.', 'warning');
            return;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            categoryName: formData.categoryName,
            prizePool: formData.prizePool,
            date: formData.date.toISOString(),
            noOfRounds: parseInt(formData.noOfRounds) || 0,
            minimumTeams: parseInt(formData.minimumTeams) || 0,
            maximumTeams: parseInt(formData.maximumTeams) || 0,
            playersPerTeams: parseInt(formData.playersPerTeams) || 0,
            eventType: 'eSports',
            status: 'upcoming',
            entryFeePerTeam: parseInt(formData.entryFeePerTeam) || 0,
            entryFeePerPlayer: parseInt(formData.entryFeePerPlayer) || 0,
            discount: parseInt(formData.discount) || 0,
            imageURL: '',
        };

        try {
            let uploadedImageUrl = "https://img.freepik.com/free-vector/gaming-background-with-glitch-effect_23-2148098357.jpg";
            if (formData.image) {
                uploadedImageUrl = await uploadToCloudinary(formData.image);
            }
            payload.imageURL = uploadedImageUrl;

            const resultAction = await dispatch(createESportsTournament(payload));
            if (createESportsTournament.fulfilled.match(resultAction)) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    navigation.goBack();
                }, 2000);
            } else {
                showAlert('Error', resultAction.payload || 'Failed to create eSports tournament', 'error');
            }
        } catch (err) {
            showAlert('Error', 'An unexpected error occurred', 'error');
        }
    };

    const renderInput = (label, value, onChangeText, placeholder, icon, keyboardType = 'default', multiline = false, isPressable = false, onPress = null) => (
        <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
                {icon}
                <Text style={styles.label}>{label}</Text>
            </View>
            {isPressable ? (
                <TouchableOpacity style={styles.input} onPress={onPress}>
                    <Text style={[styles.inputText, !value && { color: COLORS.textTertiary }]}>
                        {value || placeholder}
                    </Text>
                </TouchableOpacity>
            ) : (
                <TextInput
                    style={[styles.input, multiline && styles.textArea]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType={keyboardType}
                    multiline={multiline}
                />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <X size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create eSports Tournament</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Image Picker Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tournament Banner</Text>
                    <TouchableOpacity
                        style={styles.imagePlaceholder}
                        onPress={() => setImagePickerVisible(true)}
                    >
                        {formData.image ? (
                            <Image source={{ uri: formData.image.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.imagePlaceholderContent}>
                                <ImageIcon size={32} color={COLORS.primary} strokeWidth={1.5} />
                                <Text style={styles.imagePlaceholderText}>Upload cover image</Text>
                                <Text style={styles.imagePlaceholderSubtext}>Tap to select from gallery or camera</Text>
                            </View>
                        )}
                        {formData.image && (
                            <View style={styles.editImageBadge}>
                                <Camera size={14} color={COLORS.white} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Basic Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tournament Details</Text>
                    {renderInput('Tournament Name', formData.name, (val) => handleChange('name', val), 'e.g. BGMI Winter Clash', <Award size={18} color={COLORS.primary} />)}
                    {renderInput('Game Category', formData.categoryName, (val) => handleChange('categoryName', val), 'e.g. BGMI, Free Fire', <Trophy size={18} color={COLORS.primary} />)}
                    {renderInput('Description', formData.description, (val) => handleChange('description', val), 'About the tournament...', <Info size={18} color={COLORS.primary} />, 'default', true)}

                    {renderInput(
                        'Tournament Date',
                        formData.date.toDateString(),
                        null,
                        'Select Date',
                        <Calendar size={18} color={COLORS.primary} />,
                        'default',
                        false,
                        true,
                        () => setShowDatePicker(true)
                    )}
                </View>

                {/* Teams & Rounds */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Team & Rounds</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: SPACING['8'] }}>
                            {renderInput('Min Teams', formData.minimumTeams, (val) => handleChange('minimumTeams', val), '0', null, 'numeric')}
                        </View>
                        <View style={{ flex: 1, marginLeft: SPACING['8'] }}>
                            {renderInput('Max Teams', formData.maximumTeams, (val) => handleChange('maximumTeams', val), '0', null, 'numeric')}
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: SPACING['8'] }}>
                            {renderInput('Players Per Team', formData.playersPerTeams, (val) => handleChange('playersPerTeams', val), '0', null, 'numeric')}
                        </View>
                        <View style={{ flex: 1, marginLeft: SPACING['8'] }}>
                            {renderInput('No. of Rounds', formData.noOfRounds, (val) => handleChange('noOfRounds', val), '0', null, 'numeric')}
                        </View>
                    </View>
                </View>

                {/* Prize & Fees */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Prize Pool & Fees</Text>
                    {renderInput('Prize Pool', formData.prizePool, (val) => handleChange('prizePool', val), '₹0.00', <Award size={18} color={COLORS.primary} />)}
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: SPACING['8'] }}>
                            {renderInput('Fee (Team)', formData.entryFeePerTeam, (val) => handleChange('entryFeePerTeam', val), '₹0.00', null, 'numeric')}
                        </View>
                        <View style={{ flex: 1, marginLeft: SPACING['8'] }}>
                            {renderInput('Fee (Player)', formData.entryFeePerPlayer, (val) => handleChange('entryFeePerPlayer', val), '₹0.00', null, 'numeric')}
                        </View>
                    </View>
                    {renderInput('Discount (%)', formData.discount, (val) => handleChange('discount', val), '0', null, 'numeric')}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Create eSports Event</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <DatePicker
                modal
                open={showDatePicker}
                date={formData.date}
                mode="date"
                onConfirm={handleDateSelect}
                onCancel={() => setShowDatePicker(false)}
            />

            <Modal transparent visible={imagePickerVisible} animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setImagePickerVisible(false)}>
                    <View style={styles.imagePickerMenu}>
                        <Text style={styles.modalTitle}>Choose Banner Image</Text>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleImagePick('camera')}>
                            <Camera size={20} color={COLORS.text} />
                            <Text style={styles.menuText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleImagePick('gallery')}>
                            <ImageIcon size={20} color={COLORS.text} />
                            <Text style={styles.menuText}>Choose from Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelItem} onPress={() => setImagePickerVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal transparent visible={showSuccessModal} animationType="fade">
                <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={styles.successContainer}>
                        <CheckCircle2 size={60} color={COLORS.success} />
                        <Text style={styles.successTitle}>eSports Event Created!</Text>
                        <Text style={styles.successSubtitle}>Your tournament is now live.</Text>
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
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING['20'],
        paddingVertical: SPACING['16'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    scrollContent: { padding: SPACING['20'], paddingBottom: SPACING['40'] },
    section: {
        marginBottom: SPACING['24'],
        backgroundColor: COLORS.surface,
        padding: SPACING['16'],
        borderRadius: 16,
        elevation: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING['16'] },
    inputGroup: { marginBottom: SPACING['16'] },
    labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING['8'] },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginLeft: SPACING['8'] },
    input: {
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
        paddingHorizontal: SPACING['16'],
        paddingVertical: 12,
        fontSize: 15,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        minHeight: 48,
        justifyContent: 'center',
    },
    inputText: { fontSize: 15, color: COLORS.text },
    textArea: { height: 80, textAlignVertical: 'top' },
    imagePlaceholder: {
        width: '100%',
        height: 150,
        backgroundColor: COLORS.gray50,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderContent: { alignItems: 'center' },
    imagePlaceholderText: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: SPACING['8'] },
    imagePlaceholderSubtext: { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },
    previewImage: { width: '100%', height: '100%', borderRadius: 16 },
    row: { flexDirection: 'row', marginBottom: 0 },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: SPACING['10'],
    },
    submitButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
    disabledButton: { opacity: 0.7 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    imagePickerMenu: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
    menuText: { fontSize: 16, color: COLORS.text, marginLeft: 16, fontWeight: '500' },
    cancelItem: { marginTop: 8, paddingVertical: 16, alignItems: 'center' },
    cancelText: { fontSize: 16, color: COLORS.error, fontWeight: '600' },
    successContainer: { width: '80%', backgroundColor: COLORS.surface, borderRadius: 24, padding: 32, alignItems: 'center' },
    successTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 16 },
    successSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
});

export default CreateESportsTournamentScreen;
