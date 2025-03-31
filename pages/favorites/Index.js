import { useTranslation } from "react-i18next";
import Favorites from "./Favorites";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "../../hooks/useScreenOptions";

const Index = ({ route }) => {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Favorites"
        options={{
          title: t("Favorites"),
        }}
        component={Favorites}
      />
    </Stack.Navigator>
  );
}

export default Index;
