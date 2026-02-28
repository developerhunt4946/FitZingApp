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
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, Calendar, MapPin, Info, Users, Briefcase, Award, Camera, Image as ImageIcon } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import { COLORS, FONTS, SPACING } from '../theme';
import STRINGS from '../constants/strings';
import { createTournament, clearTournamentError } from '../redux/slices/tournamentSlice';

const CreateTournamentScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.tournament);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        format: 'knockout',
        startDate: '',
        endDate: '',
        entryFee: '',
        discount: '0',
        categories: [{ name: '', entryFee: '', status: 'upcoming', isActive: true }],
        sponsors: [{ name: '', logo: '' }],
        organizers: [{ name: '', contact: '' }],
        image: null,
    });

    const [datePickerConfig, setDatePickerConfig] = useState({
        visible: false,
        field: '', // 'startDate' or 'endDate'
        date: new Date(),
    });

    const [imagePickerVisible, setImagePickerVisible] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddItem = (type) => {
        setFormData((prev) => ({
            ...prev,
            [type]: [
                ...prev[type],
                type === 'categories'
                    ? { name: '', entryFee: '', status: 'upcoming', isActive: true }
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
                Alert.alert('Error', response.errorMessage);
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
        if (!formData.name || !formData.location || !formData.startDate || !formData.endDate) {
            Alert.alert('Required Fields', 'Please fill in the tournament name, location, and dates.');
            return;
        }

        const payload = {
            ...formData,
            entryFee: Number(formData.entryFee) || 0,
            discount: Number(formData.discount) || 0,
            categories: formData.categories.map(cat => ({
                ...cat,
                entryFee: Number(cat.entryFee) || 0
            })),
            // Use selected image URI if available
            imageURL: formData.image?.uri || "https://img.freepik.com/free-vector/cricket-stadium-background_1048-5221.jpg",
        };

        // Remove internal image asset from payload
        delete payload.image;

        try {
            const resultAction = await dispatch(createTournament(payload));
            if (createTournament.fulfilled.match(resultAction)) {
                Alert.alert('Success', 'Tournament created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', resultAction.payload || 'Failed to create tournament');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
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
                    {renderInput(STRINGS.TOURNAMENT_NAME, formData.name, (val) => handleChange('name', val), 'Enter event name', <Award size={18} color={COLORS.primary} />)}
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
                            <TextInput
                                style={styles.itemInput}
                                value={cat.entryFee}
                                onChangeText={(val) => handleNestedChange('categories', index, 'entryFee', val)}
                                placeholder="Category Entry Fee"
                                placeholderTextColor={COLORS.textTertiary}
                                keyboardType="numeric"
                            />
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

            {/* Image Picker Modal */}
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
});

export default CreateTournamentScreen;
