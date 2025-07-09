import { useAuthStore } from "../store/authStore";


const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  return (
    <></>
  );
};

export default AppNavigator;