import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, StatusBar } from 'react-native';
import { COLORS, FONTS, SPACING } from '../theme';
import { ChevronDown, HelpCircle, Mail, Phone, MessageCircle, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };

    return (
        <TouchableOpacity style={styles.faqItem} onPress={toggleOpen} activeOpacity={0.7}>
            <View style={styles.faqHeader}>
                <Text style={styles.question}>{question}</Text>
                <ChevronDown size={20} color={isOpen ? COLORS.primary : COLORS.textTertiary} style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }} />
            </View>
            {isOpen && <Text style={styles.answer}>{answer}</Text>}
        </TouchableOpacity>
    );
};

const HelpSupportScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const faqs = [
        {
            question: "What is FitZing?",
            answer: "FitZing is your ultimate sports community app where you can find and join local tournaments, track your performance, and connect with other athletes."
        },
        {
            question: "How do I join a tournament?",
            answer: "Simply browse the 'Upcoming Events' on the home screen, select a tournament you're interested in, and click 'Register Now'. Follow the steps to complete your registration."
        },
        {
            question: "Can I create my own tournament?",
            answer: "Yes, if you have admin privileges, you can use the 'Plus' button in the bottom navigation to create and manage your own sports events."
        },
        {
            question: "How can I refer a friend?",
            answer: "Go to the sidebar menu, select 'Refer a Friend', copy your unique referral code, and share it with your friends!"
        },
        {
            question: "Is there a registration fee?",
            answer: "Registration fees vary depending on the tournament. Each event will clearly display its entry fee on the details page."
        }
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top || SPACING['12'] }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ChevronLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Help & Support</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.topSection}>
                    <HelpCircle size={48} color={COLORS.primary} />
                    <Text style={styles.title}>Help & Support</Text>
                    <Text style={styles.subtitle}>How can we help you today?</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <View style={styles.contactCard}>
                        <TouchableOpacity style={styles.contactRow}>
                            <Mail size={20} color={COLORS.primary} />
                            <View>
                                <Text style={styles.contactLabel}>Email Support</Text>
                                <Text style={styles.contactValue}>support@FitZing.com</Text>
                            </View>
                        </TouchableOpacity>
                        {/* <View style={styles.contactDivider} /> */}
                        {/* <TouchableOpacity style={styles.contactRow}>
                            <MessageCircle size={20} color={COLORS.primary} />
                            <View>
                                <Text style={styles.contactLabel}>Live Chat</Text>
                                <Text style={styles.contactValue}>Average response: 5 mins</Text>
                            </View>
                        </TouchableOpacity> */}
                        <View style={styles.contactDivider} />
                        <TouchableOpacity style={styles.contactRow}>
                            <Phone size={20} color={COLORS.primary} />
                            <View>
                                <Text style={styles.contactLabel}>Phone Call</Text>
                                <Text style={styles.contactValue}>Mon-Sat, 9am - 6pm</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: 0.3,
    },
    content: {
        padding: SPACING['24'],
        paddingBottom: SPACING['40'],
    },
    topSection: {
        alignItems: 'center',
        marginVertical: SPACING['32'],
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        marginTop: SPACING['12'],
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    section: {
        marginBottom: SPACING['32'],
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING['16'],
    },
    faqItem: {
        backgroundColor: COLORS.surface,
        borderRadius: 15,
        padding: SPACING['16'],
        marginBottom: SPACING['12'],
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    question: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
        paddingRight: SPACING['16'],
    },
    answer: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginTop: SPACING['12'],
    },
    contactCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: SPACING['16'],
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING['16'],
        paddingVertical: SPACING['12'],
    },
    contactLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    contactValue: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    contactDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING['8'],
    },
});

export default HelpSupportScreen;

