import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Trash2, ChevronLeft, Inbox } from 'lucide-react-native';
import { COLORS, SPACING, FONTS } from '../theme';
import { clearAllNotifications, markAllAsRead } from '../redux/slices/notificationSlice';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NotificationScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { items } = useSelector((state) => state.notifications);

    const handleClearAll = () => {
        dispatch(clearAllNotifications());
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderItem = ({ item }) => (
        <View style={[styles.notificationItem, !item.read && styles.unreadItem]}>
            <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, !item.read && styles.activeIconCircle]}>
                    <Bell size={20} color={item.read ? COLORS.textTertiary : COLORS.white} />
                </View>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
                    <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
                </View>
                <Text style={styles.body} numberOfLines={2}>
                    {item.body}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Header with SafeArea Inset */}
            <View style={[styles.header, { paddingTop: insets.top || SPACING['12'] }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ChevronLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {items.length > 0 ? (
                        <TouchableOpacity onPress={handleClearAll} style={styles.iconBtn}>
                            <Trash2 size={20} color={COLORS.error} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                </View>
            </View>

            {items.length > 0 && (
                <View style={styles.actionRow}>
                    <Text style={styles.countText}>{items.length} notifications</Text>
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Text style={styles.markReadText}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* List */}
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + SPACING['24'] }
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Inbox size={48} color={COLORS.gray400} />
                        </View>
                        <Text style={styles.emptyTitle}>No notifications yet</Text>
                        <Text style={styles.emptySubtitle}>
                            We'll notify you when something important happens in your tournaments.
                        </Text>
                    </View>
                }
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
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING['16'],
        paddingVertical: SPACING['12'],
        backgroundColor: COLORS.background,
    },
    countText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    markReadText: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '700',
    },
    listContent: {
        flexGrow: 1,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: SPACING['16'],
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    unreadItem: {
        backgroundColor: COLORS.primary + '03',
    },
    iconContainer: {
        marginRight: SPACING['12'],
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIconCircle: {
        backgroundColor: COLORS.primary,
    },
    contentContainer: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
        paddingRight: 8,
    },
    unreadText: {
        color: COLORS.text,
        fontWeight: '800',
    },
    time: {
        fontSize: 11,
        color: COLORS.textTertiary,
        fontWeight: '500',
    },
    body: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 120,
        paddingHorizontal: SPACING['40'],
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING['20'],
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default NotificationScreen;
