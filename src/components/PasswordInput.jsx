import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppInput from './AppInput';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { COLORS } from '../theme';

/**
 * PasswordInput - TextInput with lock icon + show/hide toggle using Lucide icons.
 */
const PasswordInput = ({ label = 'Password', ...props }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <AppInput
            label={label}
            secureTextEntry={!isVisible}
            leftIcon={
                <View style={{ opacity: isFocused ? 1 : 0.5 }}>
                    <Lock size={18} color={isFocused ? COLORS.primary : COLORS.textSecondary} />
                </View>
            }
            rightComponent={
                <TouchableOpacity
                    onPress={() => setIsVisible(prev => !prev)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <View style={{ opacity: isFocused ? 1 : 0.5 }}>
                        {isVisible
                            ? <EyeOff size={18} color={isFocused ? COLORS.primary : COLORS.textSecondary} />
                            : <Eye size={18} color={isFocused ? COLORS.primary : COLORS.textSecondary} />
                        }
                    </View>
                </TouchableOpacity>
            }
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
        />
    );
};

export default PasswordInput;
