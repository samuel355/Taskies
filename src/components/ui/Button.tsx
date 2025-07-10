import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
    };

    // Size variations
    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? COLORS.gray300 : COLORS.primary,
        borderColor: disabled ? COLORS.gray300 : COLORS.primary,
      },
      secondary: {
        backgroundColor: disabled ? COLORS.gray100 : COLORS.secondary,
        borderColor: disabled ? COLORS.gray100 : COLORS.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: disabled ? COLORS.gray300 : COLORS.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      danger: {
        backgroundColor: disabled ? COLORS.gray300 : COLORS.error,
        borderColor: disabled ? COLORS.gray300 : COLORS.error,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size variations
    const sizeStyles: Record<string, TextStyle> = {
      sm: {
        fontSize: FONT_SIZES.sm,
      },
      md: {
        fontSize: FONT_SIZES.base,
      },
      lg: {
        fontSize: FONT_SIZES.lg,
      },
    };

    // Variant styles
    const variantStyles: Record<string, TextStyle> = {
      primary: {
        color: COLORS.white,
      },
      secondary: {
        color: COLORS.white,
      },
      outline: {
        color: disabled ? COLORS.gray400 : COLORS.primary,
      },
      ghost: {
        color: disabled ? COLORS.gray400 : COLORS.primary,
      },
      danger: {
        color: COLORS.white,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
          style={{ marginRight: SPACING.sm }}
        />
      );
    }

    if (icon) {
      return (
        <View
          style={{
            marginRight: iconPosition === 'left' ? SPACING.sm : 0,
            marginLeft: iconPosition === 'right' ? SPACING.sm : 0,
          }}
        >
          {icon}
        </View>
      );
    }

    return null;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {iconPosition === 'left' && renderIcon()}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      {iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
};

export default Button;
