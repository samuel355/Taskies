import { Text, View } from "react-native";
import { useAuthStore } from "../store/authStore";


const AppNavigator = () => {
  const { isLoading } = useAuthStore();
    // Loading state
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }
  return (
    <></>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  tabIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});

export default AppNavigator;