import { StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { COLORS, FONT_SIZES } from '../constants';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types';
import { AuthScreen, CalendarScreen, CreateProjectScreen, CreateTaskScreen, DashboardScreen, EditTaskScreen, FileViewerScreen, NotificationsScreen, ProfileScreen, ProjectDetailsScreen, ProjectsScreen, SettingsScreen, TaskDetailsScreen, TasksScreen, TeamMembersScreen } from '../screens';
import { NavigationContainer } from '@react-navigation/native';

// Place TabIcon here, before TabNavigator
const TabIcon = ({
  name,
  color,
  size,
}: {
  name: string;
  color: string;
  size: number;
}) => (
  <View
    style={[
      styles.tabIcon,
      {
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: size / 2,
      },
    ]}
  >
    <Text style={[styles.tabIconText, { color: COLORS.white }]}>
      {name.charAt(0).toUpperCase()}
    </Text>
  </View>
);

// Define this outside TabNavigator
const renderDashboardIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="dashboard" color={color} size={size} />
);

// Add this at the top level, outside TabNavigator
const renderProjectsIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="projects" color={color} size={size} />
);

// At the top level, outside TabNavigator
const renderTasksIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="tasks" color={color} size={size} />
);

// At the top level, outside TabNavigator
const renderCalendarIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="calendar" color={color} size={size} />
);

// At the top level, outside TabNavigator
const renderProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <TabIcon name="profile" color={color} size={size} />
);

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab Navigator Component
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: renderDashboardIcon,
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: renderProjectsIcon,
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: renderTasksIcon,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: renderCalendarIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const MainStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontSize: FONT_SIZES.lg,
          fontWeight: '600',
        },
        presentation: 'card',
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProjectDetails"
        component={ProjectDetailsScreen}
        options={{
          title: 'Project Details',
        }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={{
          title: 'Task Details',
        }}
      />
      <Stack.Screen
        name="CreateProject"
        component={CreateProjectScreen}
        options={{
          title: 'Create Project',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          title: 'Create Task',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{
          title: 'Edit Task',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="TeamMembers"
        component={TeamMembersScreen}
        options={{
          title: 'Team Members',
        }}
      />
      <Stack.Screen
        name="FileViewer"
        component={FileViewerScreen}
        options={{
          title: 'File Viewer',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card',
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuthStore();
  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
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
