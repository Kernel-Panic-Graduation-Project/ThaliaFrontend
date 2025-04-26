import {StatusBar} from 'expo-status-bar';
import {StyleSheet} from 'react-native';
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import HomeIndex from "./pages/home/Index";
import LibraryIndex from "./pages/library/Index";
import ProfileIndex from "./pages/profile/Index";
import Login from "./pages/login/Login";
import Signup from "./pages/login/Signup";
import {NavigationContainer} from "@react-navigation/native";
import {FontAwesome6} from "@expo/vector-icons";
import {I18nextProvider, useTranslation} from "react-i18next";
import i18n from './utils/i18n';
import {ThemeProvider, useTheme} from "./context/ThemeContext";
import { UserProvider, useUser } from './context/UserContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScreenOptions } from './hooks/useScreenOptions';
import RequestPasswordReset from './pages/login/RequestPasswordReset';
import ConfirmPasswordReset from './pages/login/ConfirmPasswordReset';
import Loading from "./components/Loading";
import { UIProvider } from './context/UIContext';
import { useUI } from './context/UIContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isTabBarVisible } = useUI();

  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.secondary,
      tabBarStyle: {
        backgroundColor: theme.colors.background,
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        borderTopColor: 'transparent',
        display: isTabBarVisible ? 'flex' : 'none',
      },
      animation: 'fade',
      tabBarLabelPosition: 'beside-icon',
    }}>
      <Tab.Screen name={"HomeTab"} component={HomeIndex} options={{
        tabBarIcon: ({color, size}) => <FontAwesome6 name="house" size={size} color={color} />,
        title: "Thalia",
      }} />
      <Tab.Screen name={"LibraryTab"} component={LibraryIndex} options={{
        tabBarIcon: ({color, size}) => <FontAwesome6 name="book" size={size} color={color} />,
        title: t("Library"),
      }} />
      <Tab.Screen name={"ProfileTab"} component={ProfileIndex} options={{
        tabBarIcon: ({color, size}) => <FontAwesome6 name="user" size={size} color={color} />,
        title: t("Profile"),
      }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { userData, isLoading } = useUser();
  const { theme } = useTheme();
  const screenOptions = useScreenOptions();

  if (isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.dark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.primaryText,
          border: theme.colors.border,
          notification: theme.colors.error,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          light: {
            fontFamily: 'System',
            fontWeight: '300',
          },
          thin: {
            fontFamily: 'System',
            fontWeight: '100',
          },
        }
      }}
    >
      <Stack.Navigator
        initialRouteName={userData ? "MainApp" : "Login"}
        screenOptions={{
          ...screenOptions,
          headerShown: false
        }}
      >
        {userData ? (
          // Authenticated routes
          <Stack.Screen name="MainApp" component={MainTabs} />
        ) : (
          // Public routes
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="RequestPasswordReset" component={RequestPasswordReset} />
            <Stack.Screen name="ConfirmPasswordReset" component={ConfirmPasswordReset} />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style={theme.dark ? "light" : "dark"} />
    </NavigationContainer>
  );
};

export default function App() {
  const { theme } = useTheme();

  return (
    <GestureHandlerRootView>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <UserProvider>
            <UIProvider>
              <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <AppNavigator />
              </SafeAreaView>
            </UIProvider>
          </UserProvider>
        </ThemeProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
