import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme';

const { width } = Dimensions.get('window');

const AppAlert = ({
    visible,
    title,
    message,
    type = 'info', // 'success', 'error', 'info', 'warning', 'confirm'
    onClose,
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle2 size={32} color={COLORS.primary} />;
            case 'error':
                return <AlertCircle size={32} color={COLORS.error} />;
            case 'warning':
                return <AlertTriangle size={32} color="#F59E0B" />;
            case 'confirm':
                return <AlertCircle size={32} color={COLORS.primary} />;
            default:
                return <Info size={32} color={COLORS.primary} />;
        }
    };

    const getHeaderColor = () => {
        switch (type) {
            case 'success':
                return COLORS.primary + '10';
            case 'error':
                return COLORS.error + '10';
            case 'warning':
                return '#FFF7ED';
            default:
                return COLORS.primary + '10';
        }
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <View style={[styles.header, { backgroundColor: getHeaderColor() }]}>
                        <View style={styles.iconContainer}>
                            {getIcon()}
                        </View>
                    </View>

                    <View style={styles.content}>
                        {title && <Text style={styles.title}>{title}</Text>}
                        {message && <Text style={styles.message}>{message}</Text>}
                    </View>

                    <View style={styles.footer}>
                        {showCancel && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={() => {
                                if (onConfirm) {
                                    onConfirm();
                                } else {
                                    onClose();
                                }
                            }}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING['20'],
    },
    alertContainer: {
        width: width * 0.85,
        maxWidth: 340,
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    header: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
    },
    confirmButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '700',
    },
    cancelButton: {
        backgroundColor: COLORS.background,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: '700',
    },
});

export default AppAlert;
