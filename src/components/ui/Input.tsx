import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  onRightIconPress?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  size = 'md',
  disabled = false,
  required = false,
  containerStyle,
  inputStyle,
  labelStyle,
  onRightIconPress,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: SPACING.md,
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
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
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: COLORS.white,
        borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.border,
      },
      filled: {
        backgroundColor: COLORS.gray100,
        borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.gray100,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.border,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      fontSize: FONT_SIZES.base,
      color: COLORS.textPrimary,
      padding: 0,
    };

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

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...inputStyle,
    };
  };

  const getLabelStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
      color: COLORS.textPrimary,
      marginBottom: SPACING.xs,
    };

    return {
      ...baseStyle,
      ...labelStyle,
    };
  };

  const getErrorStyle = (): TextStyle => {
    return {
      fontSize: FONT_SIZES.xs,
      color: COLORS.error,
      marginTop: SPACING.xs,
    };
  };

  const getHelperTextStyle = (): TextStyle => {
    return {
      fontSize: FONT_SIZES.xs,
      color: COLORS.textSecondary,
      marginTop: SPACING.xs,
    };
  };

  const renderLabel = () => {
    if (!label) return null;

    return (
      <Text style={getLabelStyle()}>
        {label}
        {required && <Text style={{ color: COLORS.error }}> *</Text>}
      </Text>
    );
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <View style={{ marginRight: SPACING.sm }}>
        {leftIcon}
      </View>
    );
  };

  const renderRightIcon = () => {
    if (!rightIcon) return null;

    const iconComponent = (
      <View style={{ marginLeft: SPACING.sm }}>
        {rightIcon}
      </View>
    );

    if (onRightIconPress) {
      return (
        <TouchableOpacity onPress={onRightIconPress} activeOpacity={0.7}>
          {iconComponent}
        </TouchableOpacity>
      );
    }

    return iconComponent;
  };

  const renderError = () => {
    if (!error) return null;

    return <Text style={getErrorStyle()}>{error}</Text>;
  };

  const renderHelperText = () => {
    if (!helperText || error) return null;

    return <Text style={getHelperTextStyle()}>{helperText}</Text>;
  };

  return (
    <View style={getContainerStyle()}>
      {renderLabel()}
      <View style={getInputContainerStyle()}>
        {renderLeftIcon()}
        <TextInput
          style={getInputStyle()}
          placeholderTextColor={COLORS.textSecondary}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        {renderRightIcon()}
      </View>
      {renderError()}
      {renderHelperText()}
    </View>
  );
};

export default Input;
