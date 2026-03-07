import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '../theme';
import { Sidebar, TournamentList } from '../components';
import { Bell, User, Trophy, Zap, ChevronRight } from 'lucide-react-native';
import { fetchTournaments } from '../redux/slices/tournamentSlice';
import STRINGS from '../constants/strings';
import SCREEN_NAMES from '../constants/screenNames';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Dummy Banners ────────────────────────────────────────────────
const BANNERS = [
  {
    id: '1',
    uri: 'https://images.unsplash.com/photo-1540747913346-19212a4f5b0a?w=800&q=80',
    title: 'Summer Cricket League',
    subtitle: 'Register now · Spots filling fast',
    accent: '#2B47D1',
  },
  {
    id: '2',
    uri: 'https://images.unsplash.com/photo-1547941126-3d5322b218b0?w=800&q=80',
    title: 'Badminton Championship',
    subtitle: 'Open for all skill levels',
    accent: '#6B3FD4',
  },
  {
    id: '3',
    uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    title: 'Football Super Cup',
    subtitle: '5-a-side · Starts next week',
    accent: '#0EA5E9',
  },
];

// ─── Quick Stats ──────────────────────────────────────────────────
const QUICK_STATS = [
  { label: STRINGS.EVENTS_JOINED, value: '12', icon: Trophy, color: '#2B47D1' },
  { label: STRINGS.WINS, value: '7', icon: Zap, color: '#22C55E' },
  { label: STRINGS.UPCOMING, value: '3', icon: null, color: '#F59E0B' },
];

// ─── Banner Item ──────────────────────────────────────────────────
const BannerItem = ({ item }) => (
  <View style={styles.bannerCard}>
    <Image
      source={{ uri: item.uri }}
      style={styles.bannerImage}
      resizeMode="cover"
    />
    {/* Gradient overlay text */}
    <View style={[styles.bannerOverlay, { backgroundColor: item.accent + 'CC' }]}>
      <Text style={styles.bannerTitle}>{item.title}</Text>
      <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
    </View>
  </View>
);

// ─── Home Screen ──────────────────────────────────────────────────
const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  const { tournaments, loading, error } = useSelector(state => state.tournament);
  const { unreadCount } = useSelector(state => state.notifications);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  // Memoized sorted tournaments
  const sortedTournaments = React.useMemo(() => {
    if (!tournaments) return [];
    return [...tournaments].sort((a, b) => {
      const statusA = (a.status || 'upcoming').toLowerCase();
      const statusB = (b.status || 'upcoming').toLowerCase();

      // Priority 1: Upcoming status
      if (statusA === 'upcoming' && statusB !== 'upcoming') return -1;
      if (statusA !== 'upcoming' && statusB === 'upcoming') return 1;

      // Priority 2: Start Date (earliest first)
      const dateA = new Date(a.startDate || 0);
      const dateB = new Date(b.startDate || 0);
      return dateA - dateB;
    });
  }, [tournaments]);

  const bannerRef = useRef(null);
  const currentIndex = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const firstName = user?.first_name || user?.firstName || user?.name || 'Athlete';

  // Entry fade + fetch tournaments
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    dispatch(fetchTournaments());
  }, []);

  // Auto-scroll banner every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentIndex.current + 1) % BANNERS.length;
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
      currentIndex.current = next;
      setActiveDot(next);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onBannerViewable = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      currentIndex.current = idx;
      setActiveDot(idx);
    }
  };

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Sidebar ── */}
      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Header ─────────────────────────────────── */}
          <View style={styles.header}>
            {/* Left: Avatar → opens sidebar */}
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => setSidebarOpen(true)}
              activeOpacity={0.75}
            >
              <View style={styles.avatar}>
                <User size={20} color={COLORS.white} />
              </View>
              {/* Online dot */}
              <View style={styles.onlineDot} />
            </TouchableOpacity>

            {/* Center: Welcome text */}
            <View style={styles.headerCenter}>
              <Text style={styles.welcomeText}>{STRINGS.WELCOME_BACK}</Text>
              <Text style={styles.userName} numberOfLines={1}>{firstName} 👋</Text>
            </View>

            {/* Right: Notification bell */}
            <TouchableOpacity
              style={styles.notifBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate(SCREEN_NAMES.NOTIFICATION)}
            >
              <Bell size={22} color={COLORS.text} />
              {/* Badge */}
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Banner Slider ───────────────────────────── */}
          <View style={styles.bannerSection}>
            <FlatList
              ref={bannerRef}
              data={BANNERS}
              keyExtractor={item => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <BannerItem item={item} />}
              onViewableItemsChanged={onBannerViewable}
              viewabilityConfig={viewabilityConfig.current}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH - SPACING['32'],
                offset: (SCREEN_WIDTH - SPACING['32']) * index,
                index,
              })}
            />
            {/* Dots */}
            <View style={styles.dotsRow}>
              {BANNERS.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, activeDot === i && styles.dotActive]}
                />
              ))}
            </View>
          </View>

          {/* ── Quick Stats ─────────────────────────────── */}
          {/* <View style={styles.statsRow}>
            {QUICK_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <View key={stat.label} style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: stat.color + '18' }]}>
                    {Icon
                      ? <Icon size={16} color={stat.color} />
                      : <View style={[styles.miniDot, { backgroundColor: stat.color }]} />
                    }
                  </View>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>
*/}
          {/* ── All Tournaments ───────────────────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{STRINGS.EXCLUSIVE_TOURNAMENTS}</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.seeAllRow}>
                <Text style={styles.seeAll}>{STRINGS.VIEW_ALL}</Text>
                <ChevronRight size={14} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <TournamentList
            tournaments={sortedTournaments}
            loading={loading}
            error={error}
          />

          {/* ── Upcoming Events Placeholder ─────────────── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{STRINGS.UPCOMING_EVENTS}</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.seeAllRow}>
                <Text style={styles.seeAll}>{STRINGS.VIEW_ALL}</Text>
                <ChevronRight size={14} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Event Cards Placeholder */}
          {['Cricket League — Round 2', 'Badminton Open Singles', 'Football 5-a-side'].map((ev, i) => (
            <TouchableOpacity key={i} style={styles.eventCard} activeOpacity={0.8}>
              <View style={[styles.eventAccent, { backgroundColor: [COLORS.primary, COLORS.secondary, COLORS.accent][i] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{ev}</Text>
                <Text style={styles.eventDate}>Mar {10 + i * 3}, 2026 · 9:00 AM</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────
const BANNER_WIDTH = SCREEN_WIDTH - SPACING['32'];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING['24'],
  },

  // ── Header ──
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
  avatarBtn: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  headerCenter: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  notifBtn: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
  },

  // ── Banner ──
  bannerSection: {
    marginTop: SPACING['16'],
    paddingHorizontal: SPACING['16'],
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.gray200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING['16'],
    paddingVertical: SPACING['4'],
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING['10'],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray300,
  },
  dotActive: {
    width: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING['16'],
    gap: 10,
    marginTop: SPACING['16'],
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING['12'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING['6'],
  },
  miniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Events ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING['16'],
    marginTop: SPACING['20'],
    marginBottom: SPACING['10'],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: SPACING['16'],
    marginBottom: SPACING['10'],
    padding: SPACING['14'],
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  eventAccent: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  eventDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
});

export default HomeScreen;