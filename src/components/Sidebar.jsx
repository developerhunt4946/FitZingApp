import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { COLORS, SPACING, FONTS } from '../theme';
import STRINGS from '../constants/strings';
import {
    X,
    Calendar,
    Bell,
    Users,
    Gift,
    Settings,
    HelpCircle,
    LogOut,
    ChevronRight,
    Trophy,
    User,
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import SCREEN_NAMES from '../constants/screenNames';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.78;

const MENU_ITEMS = [
    { icon: User, label: STRINGS.PROFILE || 'Profile', color: COLORS.primary, screen: SCREEN_NAMES.PROFILE },
    { icon: Bell, label: STRINGS.NOTIFICATIONS, color: '#F59E0B', screen: SCREEN_NAMES.NOTIFICATION },
    { icon: Trophy, label: STRINGS.MY_ACHIEVEMENTS, color: '#22C55E', screen: SCREEN_NAMES.MY_ACHIEVEMENTS },
    { icon: Users, label: STRINGS.REFER_FRIEND, color: '#A855F7', screen: SCREEN_NAMES.REFER_FRIEND },
    { icon: HelpCircle, label: STRINGS.HELP_SUPPORT, color: COLORS.textSecondary, screen: SCREEN_NAMES.HELP_SUPPORT },
];

const Sidebar = ({ visible, onClose }) => {
    const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;
    // isRendered controls Modal mounting; visible drives animation
    const [isRendered, setIsRendered] = useState(false);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        if (visible) {
            // 1. Reset to starting position (off-screen + transparent)
            slideAnim.setValue(-SIDEBAR_WIDTH);
            overlayAnim.setValue(0);
            // 2. Mount the Modal
            setIsRendered(true);
            // 3. After modal mounts, animate in
            requestAnimationFrame(() => {
                Animated.parallel([
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        tension: 65,
                        friction: 12,
                        useNativeDriver: true,
                    }),
                    Animated.timing(overlayAnim, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        } else {
            // Animate out first, then unmount
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -SIDEBAR_WIDTH,
                    duration: 240,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (finished) setIsRendered(false);
            });
        }
    }, [visible]);

    const handleLogout = () => {
        onClose();
        setTimeout(() => dispatch(logout()), 250);
    };

    const handlePress = (screen) => {
        onClose();
        if (screen) {
            navigation.navigate(screen);
        }
    };

    const firstName = user?.first_name || user?.firstName || user?.name || 'Athlete';
    const email = user?.email || '';

    return (
        <Modal
            visible={isRendered}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            {/* Overlay */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
            </TouchableWithoutFeedback>

            {/* Sidebar Panel */}
            <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
                <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                        <X size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    {/* User Profile Card */}
                    <TouchableOpacity 
                        style={styles.profileCard} 
                        activeOpacity={0.7}
                        onPress={() => handlePress(SCREEN_NAMES.PROFILE)}
                    >
                        <View style={styles.avatarLarge}>
                            <User size={28} color={COLORS.white} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.profileName} numberOfLines={1}>{firstName}</Text>
                            <Text style={styles.profileEmail} numberOfLines={1}>{email}</Text>
                            <View style={styles.badgeRow}>
                                <Trophy size={11} color={COLORS.primary} />
                                <Text style={styles.badgeText}>{STRINGS.ATHLETE_BADGE}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Menu Items */}
                    <View style={styles.menuList}>
                        {MENU_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <TouchableOpacity
                                    key={item.label}
                                    style={styles.menuItem}
                                    activeOpacity={0.65}
                                    onPress={() => handlePress(item.screen)}
                                >
                                    <View style={[styles.menuIconWrap, { backgroundColor: item.color + '18' }]}>
                                        <Icon size={18} color={item.color} />
                                    </View>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    <ChevronRight size={14} color={COLORS.textTertiary} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>


                    {/* Bottom: Logout */}
                    <View style={styles.sidebarBottom}>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.7}>
                            <LogOut size={16} color={COLORS.error} />
                            <Text style={styles.logoutText}>{STRINGS.LOGOUT}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: COLORS.surface,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 16,
    },
    closeBtn: {
        alignSelf: 'flex-end',
        paddingHorizontal: 12,
        marginRight: 4,
    },

    // Profile
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: SPACING['20'],
        paddingBottom: SPACING['12'],
    },
    avatarLarge: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    profileName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.primary + '18',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.primary,
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING['20'],
        marginVertical: SPACING['8'],
    },

    // Menu
    menuList: {
        flex: 1,
        paddingHorizontal: SPACING['12'],
        paddingTop: SPACING['4'],
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 11,
        paddingHorizontal: SPACING['8'],
        borderRadius: 10,
        marginBottom: 2,
    },
    menuIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.text,
    },

    // Bottom logout
    sidebarBottom: {
        paddingBottom: SPACING['8'],
    },
    logoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: SPACING['20'],
        paddingVertical: SPACING['12'],
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.error,
    },
});

export default Sidebar;
