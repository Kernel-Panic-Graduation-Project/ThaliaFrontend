import { useTranslation } from "react-i18next";
import Profile from "./Profile";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "../../hooks/useScreenOptions";

const Index = ({ route }) => {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        options={{
          title: t("Profile"),
        }}
        component={Profile}
      />
    </Stack.Navigator>
  );
}

export default Index;
