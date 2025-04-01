import { useTranslation } from "react-i18next";
import Profile from "./Profile";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "../../hooks/useScreenOptions";
import ChangePassword from "./ChangePassword";
import ChangeEmail from "./ChangeEmail";

const Index = ({ route }) => {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          title: t("Profile"),
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePassword} 
        options={{ 
          title: '',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="ChangeEmail" 
        component={ChangeEmail} 
        options={{ 
          title: '',
          headerBackTitleVisible: false,
        }} 
      />
    </Stack.Navigator>
  );
}

export default Index;
