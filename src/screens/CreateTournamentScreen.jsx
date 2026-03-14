import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, Calendar, MapPin, Info, Users, Briefcase, CheckCircle2, Trophy, Award, Camera, Image as ImageIcon } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import { COLORS, FONTS, SPACING } from '../theme';
import STRINGS from '../constants/strings';
import { createTournament, clearTournamentError } from '../redux/slices/tournamentSlice';
import { fetchSports } from '../redux/slices/sportsSlice';
import { uploadToCloudinary } from '../services/cloudinaryService';
import SCREEN_NAMES from '../constants/screenNames';
import { AppAlert } from '../components';

const CreateTournamentScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.tournament);
    const { sports: sportsList } = useSelector((state) => state.sports);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        sports: { id: '', name: '' },
        format: 'group',
        startDate: '',
        endDate: '',
        entryFee: '',
        discount: '0',
        categories: [{
            name: '',
            entryFee: '',
            minPlayers: '',
            maxPlayers: '',
            minAge: '',
            maxAge: '',
            discount: '0',
            status: 'upcoming',
            isActive: true
        }],
        sponsors: [{ name: '', logo: '' }],
        organizers: [{ name: '', contact: '' }],
        image: null,
        oversPerInnings: '',
        winnerPrize: '',
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

    const [datePickerConfig, setDatePickerConfig] = useState({
        visible: false,
        field: '', // 'startDate' or 'endDate'
        date: new Date(),
    });

    const [imagePickerVisible, setImagePickerVisible] = useState(false);
    const [formatPickerVisible, setFormatPickerVisible] = useState(false);
    const [sportsPickerVisible, setSportsPickerVisible] = useState(false);

    const [typeSelectionVisible, setTypeSelectionVisible] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setTypeSelectionVisible(true);
        }, [])
    );

    React.useEffect(() => {
        if (!sportsList || sportsList.length === 0) {
            dispatch(fetchSports());
        }
    }, []);

    const FORMAT_OPTIONS = [
        { label: 'Group', value: 'group' },
        { label: 'Knockout', value: 'knockout' },
        { label: 'League', value: 'league' },
        { label: 'Group + Knockout', value: 'group_knockout' },
    ];

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddItem = (type) => {
        setFormData((prev) => ({
            ...prev,
            [type]: [
                ...prev[type],
                type === 'categories'
                    ? {
                        name: '',
                        entryFee: '',
                        minPlayers: '',
                        maxPlayers: '',
                        minAge: '',
                        maxAge: '',
                        discount: '0',
                        status: 'upcoming',
                        isActive: true
                    }
                    : type === 'sponsors'
                        ? { name: '', logo: '' }
                        : { name: '', contact: '' },
            ],
        }));
    };

    const handleRemoveItem = (type, index) => {
        if (formData[type].length > 1) {
            setFormData((prev) => ({
                ...prev,
                [type]: prev[type].filter((_, i) => i !== index),
            }));
        }
    };

    const handleNestedChange = (type, index, field, value) => {
        const updatedList = [...formData[type]];
        updatedList[index][field] = value;
        setFormData((prev) => ({ ...prev, [type]: updatedList }));
    };

    const handleDateSelect = (date) => {
        const formattedDate = date.toISOString().split('T')[0];
        setFormData((prev) => ({ ...prev, [datePickerConfig.field]: formattedDate }));
        setDatePickerConfig((prev) => ({ ...prev, visible: false }));
    };

    const handleImagePick = async (type) => {
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

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            location: '',
            sports: { id: '', name: '' },
            format: 'group',
            startDate: '',
            endDate: '',
            entryFee: '',
            discount: '0',
            categories: [{
                name: '',
                entryFee: '',
                minPlayers: '',
                maxPlayers: '',
                minAge: '',
                maxAge: '',
                discount: '0',
                status: 'upcoming',
                isActive: true
            }],
            sponsors: [{ name: '', logo: '' }],
            organizers: [{ name: '', contact: '' }],
            image: null,
            oversPerInnings: '',
            winnerPrize: '',
        });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.location || !formData.startDate || !formData.endDate || !formData.sports.id) {
            showAlert('Required Fields', 'Please fill in the tournament name, location, dates, and select a sport.', 'warning');
            return;
        }

        const payload = {
            ...formData,
            entryFee: Number(formData.entryFee) || 0,
            discount: Number(formData.discount) || 0,
            categories: formData.categories.map(cat => ({
                ...cat,
                entryFee: Number(cat.entryFee) || 0,
                minPlayers: Number(cat.minPlayers) || 0,
                maxPlayers: Number(cat.maxPlayers) || 0,
                minAge: Number(cat.minAge) || 0,
                maxAge: Number(cat.maxAge) || 0,
                discount: Number(cat.discount) || 0,
            })),
            imageURL: '', // Will be filled after upload
            oversPerInnings: Number(formData.oversPerInnings) || 0,
            winnerPrize: Number(formData.winnerPrize) || 0,
        };

        try {
            // 1. Upload image to Cloudinary if selected
            let uploadedImageUrl = "https://img.freepik.com/free-vector/cricket-stadium-background_1048-5221.jpg";
            if (formData.image) {
                try {
                    uploadedImageUrl = await uploadToCloudinary(formData.image);
                } catch (uploadError) {
                    showAlert('Upload Failed', uploadError.message || 'Failed to upload image. Using default image.', 'warning');
                }
            }

            payload.imageURL = uploadedImageUrl;

            const resultAction = await dispatch(createTournament(payload));
            if (createTournament.fulfilled.match(resultAction)) {
                // Success!
                setShowSuccessModal(true);
                resetForm();
                // Optionally navigate after a delay
                setTimeout(() => {
                    setShowSuccessModal(false);
                    navigation.goBack();
                }, 2000);
            } else {
                showAlert('Error', resultAction.payload || 'Failed to create tournament', 'error');
            }
        } catch (error) {
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
                <Text style={styles.headerTitle}>{STRINGS.CREATE_TOURNAMENT}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Image Picker Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tournament Image</Text>
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
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    {renderInput(
                        'Select Sport',
                        formData.sports.name,
                        null,
                        'Which sport is this for?',
                        <Trophy size={18} color={COLORS.primary} />,
                        'default',
                        false,
                        true,
                        () => setSportsPickerVisible(true)
                    )}
                    {renderInput(STRINGS.TOURNAMENT_NAME, formData.name, (val) => handleChange('name', val), 'Enter event name', <Award size={18} color={COLORS.primary} />)}
                    {renderInput(
                        'Tournament Format',
                        FORMAT_OPTIONS.find(opt => opt.value === formData.format)?.label,
                        null,
                        'Select Format',
                        <Users size={18} color={COLORS.primary} />,
                        'default',
                        false,
                        true,
                        () => setFormatPickerVisible(true)
                    )}
                    {renderInput(STRINGS.DESCRIPTION, formData.description, (val) => handleChange('description', val), 'Tell us about the tournament...', <Info size={18} color={COLORS.primary} />, 'default', true)}
                    {renderInput(STRINGS.LOCATION, formData.location, (val) => handleChange('location', val), 'Venue address/City', <MapPin size={18} color={COLORS.primary} />)}
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: SPACING['8'] }}>
                            {renderInput(
                                STRINGS.START_DATE,
                                formData.startDate,
                                null,
                                'Select Date',
                                <Calendar size={18} color={COLORS.primary} />,
                                'default',
                                false,
                                true,
                                () => setDatePickerConfig({ visible: true, field: 'startDate', date: formData.startDate ? new Date(formData.startDate) : new Date() })
                            )}
                        </View>
                        <View style={{ flex: 1, marginLeft: SPACING['8'] }}>
                            {renderInput(
                                STRINGS.END_DATE,
                                formData.endDate,
                                null,
                                'Select Date',
                                <Calendar size={18} color={COLORS.primary} />,
                                'default',
                                false,
                                true,
                                () => setDatePickerConfig({ visible: true, field: 'endDate', date: formData.endDate ? new Date(formData.endDate) : new Date() })
                            )}
                        </View>
                    </View>
                </View>

                {/* Pricing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pricing & Settings</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: SPACING['8'] }}>
                            {renderInput(STRINGS.ENTRY_FEE, formData.entryFee, (val) => handleChange('entryFee', val), '0.00', null, 'numeric')}
                        </View>
                        <View style={{ flex: 1, marginLeft: SPACING['8'] }}>
                            {renderInput(STRINGS.DISCOUNT, formData.discount, (val) => handleChange('discount', val), '0%', null, 'numeric')}
                        </View>
                    </View>
                    <View style={[styles.row, { marginTop: SPACING['16'] }]}>
                        <View style={{ flex: 1, marginRight: SPACING['8'] }}>
                            {renderInput(STRINGS.OVERS_PER_INNINGS, formData.oversPerInnings, (val) => handleChange('oversPerInnings', val), 'Enter overs', null, 'numeric')}
                        </View>
                        <View style={{ flex: 1, marginLeft: SPACING['8'] }}>
                            {renderInput(STRINGS.WINNER_PRIZE, formData.winnerPrize, (val) => handleChange('winnerPrize', val), 'Prize amount', null, 'numeric')}
                        </View>
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{STRINGS.CATEGORIES}</Text>
                        <TouchableOpacity onPress={() => handleAddItem('categories')} style={styles.addButton}>
                            <Plus size={16} color={COLORS.primary} />
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {formData.categories.map((cat, index) => (
                        <View key={index} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Users size={16} color={COLORS.secondary} />
                                <TouchableOpacity onPress={() => handleRemoveItem('categories', index)}>
                                    <X size={16} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.itemInput}
                                value={cat.name}
                                onChangeText={(val) => handleNestedChange('categories', index, 'name', val)}
                                placeholder="Category Name (e.g. Under-19)"
                                placeholderTextColor={COLORS.textTertiary}
                            />
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: SPACING['8'] }}>
                                    <TextInput
                                        style={styles.itemInput}
                                        value={cat.entryFee}
                                        onChangeText={(val) => handleNestedChange('categories', index, 'entryFee', val)}
                                        placeholder="Entry Fee"
                                        placeholderTextColor={COLORS.textTertiary}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: SPACING['8'] }}>
                                    <TextInput
                                        style={styles.itemInput}
                                        value={cat.discount}
                                        onChangeText={(val) => handleNestedChange('categories', index, 'discount', val)}
                                        placeholder="Discount %"
                                        placeholderTextColor={COLORS.textTertiary}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: SPACING['8'] }}>
                                    <TextInput
                                        style={styles.itemInput}
                                        value={cat.minPlayers}
                                        onChangeText={(val) => handleNestedChange('categories', index, 'minPlayers', val)}
                                        placeholder="Min Players"
                                        placeholderTextColor={COLORS.textTertiary}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: SPACING['8'] }}>
                                    <TextInput
                                        style={styles.itemInput}
                                        value={cat.maxPlayers}
                                        onChangeText={(val) => handleNestedChange('categories', index, 'maxPlayers', val)}
                                        placeholder="Max Players"
                                        placeholderTextColor={COLORS.textTertiary}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: SPACING['8'] }}>
                                    <TextInput
                                        style={styles.itemInput}
                                        value={cat.minAge}
                                        onChangeText={(val) => handleNestedChange('categories', index, 'minAge', val)}
                                        placeholder="Min Age"
                                        placeholderTextColor={COLORS.textTertiary}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: SPACING['8'] }}>
                                    <TextInput
                                        style={styles.itemInput}
                                        value={cat.maxAge}
                                        onChangeText={(val) => handleNestedChange('categories', index, 'maxAge', val)}
                                        placeholder="Max Age"
                                        placeholderTextColor={COLORS.textTertiary}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Sponsors */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{STRINGS.SPONSORS}</Text>
                        <TouchableOpacity onPress={() => handleAddItem('sponsors')} style={styles.addButton}>
                            <Plus size={16} color={COLORS.primary} />
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {formData.sponsors.map((sponsor, index) => (
                        <View key={index} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Briefcase size={16} color={COLORS.secondary} />
                                <TouchableOpacity onPress={() => handleRemoveItem('sponsors', index)}>
                                    <X size={16} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.itemInput}
                                value={sponsor.name}
                                onChangeText={(val) => handleNestedChange('sponsors', index, 'name', val)}
                                placeholder="Sponsor Name"
                                placeholderTextColor={COLORS.textTertiary}
                            />
                        </View>
                    ))}
                </View>

                {/* Organizers */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{STRINGS.ORGANIZERS}</Text>
                        <TouchableOpacity onPress={() => handleAddItem('organizers')} style={styles.addButton}>
                            <Plus size={16} color={COLORS.primary} />
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {formData.organizers.map((organizer, index) => (
                        <View key={index} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Users size={16} color={COLORS.secondary} />
                                <TouchableOpacity onPress={() => handleRemoveItem('organizers', index)}>
                                    <X size={16} color={COLORS.error} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.itemInput}
                                value={organizer.name}
                                onChangeText={(val) => handleNestedChange('organizers', index, 'name', val)}
                                placeholder={STRINGS.ORGANIZER_NAME}
                                placeholderTextColor={COLORS.textTertiary}
                            />
                            <TextInput
                                style={styles.itemInput}
                                value={organizer.contact}
                                onChangeText={(val) => handleNestedChange('organizers', index, 'contact', val)}
                                placeholder={STRINGS.CONTACT_INFO}
                                placeholderTextColor={COLORS.textTertiary}
                            />
                        </View>
                    ))}
                </View>


                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>{STRINGS.SUBMIT}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Format Picker Modal */}
            <Modal
                transparent
                visible={formatPickerVisible}
                animationType="fade"
                onRequestClose={() => setFormatPickerVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setFormatPickerVisible(false)}
                >
                    <View style={styles.imagePickerMenu}>
                        <Text style={styles.modalTitle}>Select Tournament Format</Text>
                        {FORMAT_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.menuItem}
                                onPress={() => {
                                    handleChange('format', option.value);
                                    setFormatPickerVisible(false);
                                }}
                            >
                                <Text style={[
                                    styles.menuText,
                                    formData.format === option.value && { color: COLORS.primary, fontWeight: '700' }
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.cancelItem} onPress={() => setFormatPickerVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal
                transparent
                visible={imagePickerVisible}
                animationType="fade"
                onRequestClose={() => setImagePickerVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setImagePickerVisible(false)}
                >
                    <View style={styles.imagePickerMenu}>
                        <Text style={styles.modalTitle}>Choose Tournament Image</Text>
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

            {/* Sports Picker Modal */}
            <Modal
                transparent
                visible={sportsPickerVisible}
                animationType="fade"
                onRequestClose={() => setSportsPickerVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSportsPickerVisible(false)}
                >
                    <View style={styles.imagePickerMenu}>
                        <Text style={styles.modalTitle}>Select Sport</Text>
                        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                            {sportsList && sportsList.map((sport) => (
                                <TouchableOpacity
                                    key={sport.id}
                                    style={styles.menuItem}
                                    onPress={() => {
                                        handleChange('sports', { id: sport.id, name: sport.name });
                                        setSportsPickerVisible(false);
                                    }}
                                >
                                    <Image source={{ uri: sport.imageUrl }} style={{ width: 24, height: 24, marginRight: 10, resizeMode: 'contain' }} />
                                    <Text style={[
                                        styles.menuText,
                                        formData.sports.id === sport.id && { color: COLORS.primary, fontWeight: '700' }
                                    ]}>
                                        {sport.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.cancelItem} onPress={() => setSportsPickerVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Success Modal */}
            <Modal
                transparent
                visible={showSuccessModal}
                animationType="fade"
            >
                <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
                    <View style={styles.successContainer}>
                        <CheckCircle2 size={60} color={COLORS.success} />
                        <Text style={styles.successTitle}>Tournament Created!</Text>
                        <Text style={styles.successSubtitle}>Your event has been published successfully.</Text>
                    </View>
                </View>
            </Modal>

            {/* Date Picker Component */}
            <DatePicker
                modal
                open={datePickerConfig.visible}
                date={datePickerConfig.date}
                mode="date"
                onConfirm={handleDateSelect}
                onCancel={() => setDatePickerConfig((prev) => ({ ...prev, visible: false }))}
                buttonColor={COLORS.primary}
            />

            {/* Selection Modal */}
            <Modal
                transparent
                visible={typeSelectionVisible}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.selectionModal}>
                        <Text style={styles.selectionTitle}>Create Tournament</Text>
                        <Text style={styles.selectionSubtitle}>What type of tournament do you want to create?</Text>

                        <TouchableOpacity
                            style={styles.selectionOption}
                            onPress={() => setTypeSelectionVisible(false)}
                        >
                            <View style={[styles.selectionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                                <Trophy size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.selectionTextContainer}>
                                <Text style={styles.selectionOptionTitle}>Physical Tournament</Text>
                                <Text style={styles.selectionOptionDesc}>Cricket, Football, Badminton, etc.</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.selectionOption}
                            onPress={() => {
                                setTypeSelectionVisible(false);
                                navigation.navigate(SCREEN_NAMES.CREATE_ESPORTS_TOURNAMENT);
                            }}
                        >
                            <View style={[styles.selectionIcon, { backgroundColor: COLORS.secondary + '15' }]}>
                                <Award size={24} color={COLORS.secondary} />
                            </View>
                            <View style={styles.selectionTextContainer}>
                                <Text style={styles.selectionOptionTitle}>eSports Tournament</Text>
                                <Text style={styles.selectionOptionDesc}>BGMI, Free Fire, Valorant, etc.</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelLink}
                            onPress={() => {
                                setTypeSelectionVisible(false);
                                navigation.goBack();
                            }}
                        >
                            <Text style={styles.cancelLinkText}>Cancel</Text>
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
        paddingHorizontal: SPACING['20'],
        paddingVertical: SPACING['16'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING['20'],
        paddingBottom: SPACING['40'],
    },
    section: {
        marginBottom: SPACING['24'],
        backgroundColor: COLORS.surface,
        padding: SPACING['16'],
        borderRadius: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING['16'],
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING['16'],
    },
    inputGroup: {
        marginBottom: SPACING['16'],
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING['8'],
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginLeft: SPACING['8'],
    },
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
    inputText: {
        fontSize: 15,
        color: COLORS.text,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    imagePlaceholder: {
        width: '100%',
        height: 180,
        backgroundColor: COLORS.gray50,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        borderStyle: 'dashed',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderContent: {
        alignItems: 'center',
    },
    imagePlaceholderText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: SPACING['8'],
    },
    imagePlaceholderSubtext: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginTop: 4,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    editImageBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    imagePickerMenu: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SPACING['24'],
        paddingBottom: Platform.OS === 'ios' ? SPACING['40'] : SPACING['24'],
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING['20'],
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING['16'],
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    menuText: {
        fontSize: 16,
        color: COLORS.text,
        marginLeft: SPACING['12'],
        fontWeight: '500',
    },
    cancelItem: {
        marginTop: SPACING['12'],
        paddingVertical: SPACING['16'],
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        color: COLORS.error,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    addButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: 4,
    },
    itemCard: {
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
        padding: SPACING['12'],
        marginBottom: SPACING['12'],
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING['8'],
    },
    itemInput: {
        fontSize: 14,
        color: COLORS.text,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        marginBottom: SPACING['8'],
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING['8'],
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
    },

    // Success Modal
    successContainer: {
        backgroundColor: COLORS.surface,
        width: '80%',
        padding: SPACING['32'],
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginTop: SPACING['16'],
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    selectionModal: {
        width: '90%',
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 24,
        alignSelf: 'center',
        marginBottom: 'auto',
        marginTop: 'auto',
    },
    selectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    selectionSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    selectionOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    selectionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    selectionTextContainer: {
        flex: 1,
    },
    selectionOptionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    selectionOptionDesc: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    cancelLink: {
        marginTop: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelLinkText: {
        fontSize: 15,
        color: COLORS.textTertiary,
        fontWeight: '600',
    },
});

export default CreateTournamentScreen;
