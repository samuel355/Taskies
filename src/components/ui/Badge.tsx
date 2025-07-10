import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  outline?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  customColor?: string;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  outline = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  customColor,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
    };

    // Size variations
    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        minHeight: 20,
      },
      md: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        minHeight: 24,
      },
      lg: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        minHeight: 32,
      },
    };

    // Shape variations
    const shapeStyles: Record<string, ViewStyle> = {
      rounded: {
        borderRadius: BORDER_RADIUS.sm,
      },
      pill: {
        borderRadius: BORDER_RADIUS.full,
      },
      square: {
        borderRadius: 0,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: outline ? 'transparent' : COLORS.gray100,
        borderWidth: outline ? 1 : 0,
        borderColor: COLORS.gray300,
      },
      primary: {
        backgroundColor: outline ? 'transparent' : COLORS.primary,
        borderWidth: outline ? 1 : 0,
        borderColor: COLORS.primary,
      },
      secondary: {
        backgroundColor: outline ? 'transparent' : COLORS.secondary,
        borderWidth: outline ? 1 : 0,
        borderColor: COLORS.secondary,
      },
      success: {
        backgroundColor: outline ? 'transparent' : COLORS.success,
        borderWidth: outline ? 1 : 0,
        borderColor: COLORS.success,
      },
      warning: {
        backgroundColor: outline ? 'transparent' : COLORS.warning,
        borderWidth: outline ? 1 : 0,
        borderColor: COLORS.warning,
      },
      error: {
        backgroundColor: outline ? 'transparent' : COLORS.error,
        borderWidth: outline ? 1 : 0,
        borderColor: COLORS.error,
      },
      info: {
        backgroundColor: outline ? 'transparent' : COLORS.info,
        borderWidth: outline ? 1 : 0,
        borderColor: COLORS.info,
      },
    };

    let finalStyle = {
      ...baseStyle,
      ...sizeStyles[size],
      ...shapeStyles[shape],
      ...variantStyles[variant],
    };

    // Apply custom color if provided
    if (customColor) {
      finalStyle = {
        ...finalStyle,
        backgroundColor: outline ? 'transparent' : customColor,
        borderColor: customColor,
        borderWidth: outline ? 1 : 0,
      };
    }

    return finalStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size variations
    const sizeStyles: Record<string, TextStyle> = {
      sm: {
        fontSize: FONT_SIZES.xs,
      },
      md: {
        fontSize: FONT_SIZES.sm,
      },
      lg: {
        fontSize: FONT_SIZES.base,
      },
    };

    // Variant styles
    const variantStyles: Record<string, TextStyle> = {
      default: {
        color: outline ? COLORS.gray700 : COLORS.gray700,
      },
      primary: {
        color: outline ? COLORS.primary : COLORS.white,
      },
      secondary: {
        color: outline ? COLORS.secondary : COLORS.white,
      },
      success: {
        color: outline ? COLORS.success : COLORS.white,
      },
      warning: {
        color: outline ? COLORS.warning : COLORS.white,
      },
      error: {
        color: outline ? COLORS.error : COLORS.white,
      },
      info: {
        color: outline ? COLORS.info : COLORS.white,
      },
    };

    let finalStyle = {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };

    // Apply custom color text if provided
    if (customColor) {
      finalStyle = {
        ...finalStyle,
        color: outline ? customColor : COLORS.white,
      };
    }

    return finalStyle;
  };

  const renderIcon = () => {
    if (!icon) return null;

    return (
      <View
        style={{
          marginRight: iconPosition === 'left' ? SPACING.xs : 0,
          marginLeft: iconPosition === 'right' ? SPACING.xs : 0,
        }}
      >
        {icon}
      </View>
    );
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      {iconPosition === 'left' && renderIcon()}
      <Text style={[getTextStyle(), textStyle]}>{label}</Text>
      {iconPosition === 'right' && renderIcon()}
    </View>
  );
};

export default Badge;
