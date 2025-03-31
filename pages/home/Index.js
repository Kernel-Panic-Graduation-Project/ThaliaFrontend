import { useTranslation } from "react-i18next";
import Home from "./Home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "../../hooks/useScreenOptions";

const Index = ({ route }) => {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        options={{
          title: t("Home"),
        }}
        component={Home}
      />
    </Stack.Navigator>
  );
}

export default Index;
