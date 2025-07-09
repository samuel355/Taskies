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

export default AppNavigator;