import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { getInitials } from '../../utils';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'square' | 'rounded';
  backgroundColor?: string;
  textColor?: string;
  borderWidth?: number;
  borderColor?: string;
  showBorder?: boolean;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  textStyle?: TextStyle;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  variant = 'circle',
  backgroundColor,
  textColor,
  borderWidth = 2,
  borderColor = COLORS.white,
  showBorder = false,
  showOnlineStatus = false,
  isOnline = false,
  style,
  imageStyle,
  textStyle,
}) => {
  const getSizeStyle = (): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
      xs: {
        width: 24,
        height: 24,
      },
      sm: {
        width: 32,
        height: 32,
      },
      md: {
        width: 40,
        height: 40,
      },
      lg: {
        width: 48,
        height: 48,
      },
      xl: {
        width: 56,
        height: 56,
      },
      '2xl': {
        width: 64,
        height: 64,
      },
    };

    return sizeStyles[size];
  };

  const getTextSize = (): TextStyle => {
    const textSizes: Record<string, TextStyle> = {
      xs: {
        fontSize: FONT_SIZES.xs,
      },
      sm: {
        fontSize: FONT_SIZES.sm,
      },
      md: {
        fontSize: FONT_SIZES.base,
      },
      lg: {
        fontSize: FONT_SIZES.lg,
      },
      xl: {
        fontSize: FONT_SIZES.xl,
      },
      '2xl': {
        fontSize: FONT_SIZES['2xl'],
      },
    };

    return textSizes[size];
  };

  const getBorderRadius = (): number => {
    switch (variant) {
      case 'circle':
        return 999;
      case 'square':
        return 0;
      case 'rounded':
        return BORDER_RADIUS.md;
      default:
        return 999;
    }
  };

  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;

    // Generate consistent color based on name
    if (name) {
      const colors = [
        COLORS.primary,
        COLORS.secondary,
        COLORS.warning,
        COLORS.error,
        '#8B5CF6',
        '#06B6D4',
        '#F97316',
        '#84CC16',
        '#EC4899',
        '#6366F1',
      ];

      const hash = name.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);

      return colors[Math.abs(hash) % colors.length];
    }

    return COLORS.gray400;
  };

  const getAvatarStyle = (): ViewStyle => {
    const sizeStyle = getSizeStyle();

    return {
      ...sizeStyle,
      backgroundColor: getBackgroundColor(),
      borderRadius: getBorderRadius(),
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      ...(showBorder && {
        borderWidth,
        borderColor,
      }),
    };
  };

  const getImageStyle = (): ImageStyle => {
    const sizeStyle = getSizeStyle();

    return {
      ...sizeStyle,
      borderRadius: getBorderRadius(),
    };
  };

  const getTextStyle = (): TextStyle => {
    const textSizeStyle = getTextSize();

    return {
      ...textSizeStyle,
      color: textColor || COLORS.white,
      fontWeight: '600',
    };
  };

  const getOnlineStatusStyle = (): ViewStyle => {
    const statusSizes: Record<string, ViewStyle> = {
      xs: {
        width: 6,
        height: 6,
        borderRadius: 3,
        borderWidth: 1,
      },
      sm: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1,
      },
      md: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
      },
      lg: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
      },
      xl: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
      },
      '2xl': {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
      },
    };

    const statusPositions: Record<string, ViewStyle> = {
      xs: {
        bottom: -1,
        right: -1,
      },
      sm: {
        bottom: -1,
        right: -1,
      },
      md: {
        bottom: -1,
        right: -1,
      },
      lg: {
        bottom: 0,
        right: 0,
      },
      xl: {
        bottom: 0,
        right: 0,
      },
      '2xl': {
        bottom: 2,
        right: 2,
      },
    };

    return {
      ...statusSizes[size],
      ...statusPositions[size],
      position: 'absolute',
      backgroundColor: isOnline ? COLORS.success : COLORS.gray400,
      borderColor: COLORS.white,
    };
  };

  const renderContent = () => {
    if (src) {
      return (
        <Image
          source={{ uri: src }}
          style={[getImageStyle(), imageStyle]}
          resizeMode="cover"
        />
      );
    }

    if (name) {
      return (
        <Text style={[getTextStyle(), textStyle]}>
          {getInitials(name.split(' ')[0] || '', name.split(' ')[1] || '')}
        </Text>
      );
    }

    return (
      <View style={[getImageStyle(), { backgroundColor: COLORS.gray300 }]} />
    );
  };

  const renderOnlineStatus = () => {
    if (!showOnlineStatus) return null;

    return <View style={getOnlineStatusStyle()} />;
  };

  return (
    <View style={[{ position: 'relative' }, style]}>
      <View style={getAvatarStyle()}>
        {renderContent()}
      </View>
      {renderOnlineStatus()}
    </View>
  );
};

export default Avatar;
