import {StatusBar} from 'expo-status-bar';
import {ActivityIndicator, StyleSheet, View, Text} from 'react-native';
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import HomeIndex from "./pages/home/Index";
import FavoritesIndex from "./pages/favorites/Index";
import LibraryIndex from "./pages/library/Index";
import ProfileIndex from "./pages/profile/Index";
import Login from "./pages/login/Index";
import Signup from "./pages/login/Signup";
import {NavigationContainer} from "@react-navigation/native";
import {FontAwesome6} from "@expo/vector-icons";
import {I18nextProvider, useTranslation} from "react-i18next";
import i18n from './utils/i18n';
import {ThemeProvider, useTheme} from "./context/ThemeContext";
import { UserProvider, useUser } from './context/UserContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useViewStyle } from './hooks/useViewStyle';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  const {t} = useTranslation();
  const {theme} = useTheme();

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
      },
      tabBarHideOnKeyboard: true,
      tabBarLabelPosition: 'beside-icon',
    }}>
      <Tab.Screen name={"HomeTab"} component={HomeIndex} options={{
        tabBarIcon: ({color, size}) => <FontAwesome6 name="house" size={size} color={color} />,
        title: "Thalia",
      }} />
      <Tab.Screen name={"FavoritesTab"} component={FavoritesIndex} options={{
        tabBarIcon: ({color, size}) => <FontAwesome6 name="heart" size={size} color={color} />,
        title: t("Favorites"),
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
  const { t } = useTranslation();
  const { theme } = useTheme();
  const viewStyle = useViewStyle();

  if (isLoading) {
    return (
      <View style={[viewStyle, styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
          {t("Loading...")}
        </Text>
      </View>
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
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background }
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
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
              <AppNavigator />
            </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
