import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  margin?: 'none' | 'sm' | 'md' | 'lg';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  style?: ViewStyle;
  activeOpacity?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  margin = 'none',
  borderRadius = 'md',
  disabled = false,
  style,
  activeOpacity = 0.7,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: COLORS.white,
      borderRadius: BORDER_RADIUS[borderRadius],
    };

    // Padding variations
    const paddingStyles: Record<string, ViewStyle> = {
      none: { padding: 0 },
      sm: { padding: SPACING.sm },
      md: { padding: SPACING.md },
      lg: { padding: SPACING.lg },
    };

    // Margin variations
    const marginStyles: Record<string, ViewStyle> = {
      none: { margin: 0 },
      sm: { margin: SPACING.sm },
      md: { margin: SPACING.md },
      lg: { margin: SPACING.lg },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: COLORS.white,
        ...SHADOWS.sm,
      },
      outlined: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
      },
      elevated: {
        backgroundColor: COLORS.white,
        ...SHADOWS.lg,
      },
      filled: {
        backgroundColor: COLORS.gray50,
        borderWidth: 1,
        borderColor: COLORS.gray100,
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

export default Card;
