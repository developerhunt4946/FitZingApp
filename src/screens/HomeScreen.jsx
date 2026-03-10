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
import { Bell, User, Trophy, ChevronRight, Award, Calendar } from 'lucide-react-native';
import { fetchTournaments, fetchESportsTournaments } from '../redux/slices/tournamentSlice';
import { fetchSports } from '../redux/slices/sportsSlice';
import STRINGS from '../constants/strings';
import SCREEN_NAMES from '../constants/screenNames';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── eSports Card ─────────────────────────────────────────────────
const ESportsTournamentCard = ({ item }) => {
  const navigation = useNavigation();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const hasDiscount = Number(item.discount) > 0;
  const entryFee = Number(item.entryFeePerTeam) || 0;
  const discountAmt = hasDiscount ? entryFee * (1 - Number(item.discount) / 100) : entryFee;

  return (
    <TouchableOpacity
      style={esStyles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate(SCREEN_NAMES.ESPORTS_TOURNAMENT_DETAILS, { tournamentId: item.id })}
    >
      <Image source={{ uri: item.imageURL }} style={esStyles.image} resizeMode="cover" />
      <View style={esStyles.overlay} />

      <View style={esStyles.tag}>
        <Award size={10} color={COLORS.white} />
        <Text style={esStyles.tagText}>eSPORTS</Text>
      </View>

      {hasDiscount && (
        <View style={esStyles.discountBadge}>
          <Text style={esStyles.discountText}>{item.discount}% OFF</Text>
        </View>
      )}

      <View style={esStyles.feeBadge}>
        {hasDiscount ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={esStyles.origFee}>₹{entryFee.toFixed(0)}/team</Text>
            <Text style={esStyles.feeText}>₹{discountAmt.toFixed(0)}</Text>
          </View>
        ) : (
          <Text style={esStyles.feeText}>₹{entryFee.toFixed(0)}/team</Text>
        )}
      </View>

      <View style={esStyles.cardContent}>
        <Text style={esStyles.name} numberOfLines={1}>{item.name}</Text>
        <View style={esStyles.infoRow}>
          <Trophy size={12} color={COLORS.secondary} />
          <Text style={esStyles.category}>{item.categoryName}</Text>
        </View>
        <View style={esStyles.footer}>
          <View style={esStyles.infoRow}>
            <Calendar size={12} color={COLORS.primary} />
            <Text style={esStyles.dateText}>{formatDate(item.date)}</Text>
          </View>
          <View style={esStyles.infoBadge}>
            <User size={11} color={COLORS.white} />
            <Text style={esStyles.infoText}>{item.playersPerTeams}v{item.playersPerTeams}</Text>
          </View>
        </View>
        <Text style={esStyles.prize}>🏆 Prize Pool: ₹{Number(item.prizePool).toLocaleString('en-IN')}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Home Screen ──────────────────────────────────────────────────
const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  const { tournaments, loading, error, eSportsTournaments, eSportsLoading } = useSelector(state => state.tournament);
  const { sports } = useSelector(state => state.sports);
  const { unreadCount } = useSelector(state => state.notifications);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const firstName = user?.first_name || user?.firstName || user?.name || 'Athlete';

  const sortedTournaments = React.useMemo(() => {
    if (!tournaments) return [];
    return [...tournaments].sort((a, b) => {
      const statusA = (a.status || 'upcoming').toLowerCase();
      const statusB = (b.status || 'upcoming').toLowerCase();
      if (statusA === 'upcoming' && statusB !== 'upcoming') return -1;
      if (statusA !== 'upcoming' && statusB === 'upcoming') return 1;
      return new Date(a.startDate || 0) - new Date(b.startDate || 0);
    });
  }, [tournaments]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    dispatch(fetchTournaments());
    dispatch(fetchSports());
    dispatch(fetchESportsTournaments());
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.avatarBtn} onPress={() => setSidebarOpen(true)} activeOpacity={0.75}>
              <View style={styles.avatar}>
                <User size={20} color={COLORS.white} />
              </View>
              <View style={styles.onlineDot} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.welcomeText}>{STRINGS.WELCOME_BACK}</Text>
              <Text style={styles.userName} numberOfLines={1}>{firstName} 👋</Text>
            </View>

            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.75} onPress={() => navigation.navigate(SCREEN_NAMES.NOTIFICATION)}>
              <Bell size={22} color={COLORS.text} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Sports Categories ── */}
          <View style={[styles.sportsSection, { marginTop: SPACING['16'] }]}>
            <FlatList
              data={sports}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sportsList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.sportItem} activeOpacity={0.7}>
                  <View style={styles.sportIconBg}>
                    <Image source={{ uri: item.imageUrl }} style={styles.sportIcon} resizeMode="contain" />
                  </View>
                  <Text style={styles.sportName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* ── Physical Tournaments ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{STRINGS.EXCLUSIVE_TOURNAMENTS}</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate(SCREEN_NAMES.ALL_TOURNAMENTS)}>
              <View style={styles.seeAllRow}>
                <Text style={styles.seeAll}>{STRINGS.VIEW_ALL}</Text>
                <ChevronRight size={14} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <TournamentList tournaments={sortedTournaments} loading={loading} error={error} />

          {!loading && sortedTournaments.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Trophy size={40} color={COLORS.primary} opacity={0.5} />
              </View>
              <Text style={styles.emptyTitle}>Events are coming! 🏆</Text>
              <Text style={styles.emptySubtitle}>Get ready to compete. New tournaments will appear here soon.</Text>
              <TouchableOpacity style={styles.refreshBtn} onPress={() => dispatch(fetchTournaments())}>
                <Text style={styles.refreshBtnText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── eSports Tournaments ── */}
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.eSportsBadge}>
                <Award size={12} color={COLORS.white} />
              </View>
              <Text style={styles.sectionTitle}>eSports Tournaments</Text>
            </View>
          </View>

          {eSportsLoading ? (
            <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: COLORS.textSecondary }}>Loading eSports events...</Text>
            </View>
          ) : eSportsTournaments && eSportsTournaments.length > 0 ? (
            <FlatList
              data={eSportsTournaments}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SPACING['16'], gap: SPACING['16'], paddingBottom: SPACING['16'] }}
              renderItem={({ item }) => <ESportsTournamentCard item={item} />}
              snapToInterval={280 + SPACING['16']}
              decelerationRate="fast"
              snapToAlignment="start"
            />
          ) : (
            <View style={{ height: 100, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' }}>No eSports tournaments yet. Check back soon! 🎮</Text>
            </View>
          )}

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

  // ── Sports Categories ──
  sportsSection: {
    marginTop: SPACING['20'],
  },
  sportsList: {
    paddingHorizontal: SPACING['16'],
    gap: 10,
  },
  sportItem: {
    alignItems: 'center',
    width: 60,
  },
  sportIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  sportIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  sportName: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },

  // ── Empty State ──
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  refreshBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  refreshBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
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
  eSportsBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ─── eSports Card Styles ───────────────────────────────────────────
const esStyles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  image: {
    width: '100%',
    height: 150,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  tag: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  feeBadge: {
    position: 'absolute',
    bottom: 160,
    right: 10,
    transform: [{ translateY: 160 }],
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  origFee: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  feeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  cardContent: {
    padding: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 10,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  infoText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '700',
  },
  prize: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default HomeScreen;