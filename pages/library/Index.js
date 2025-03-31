import StoryDetail from "./StoryDetail";
import Libary from "./Library"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useScreenOptions } from "../../hooks/useScreenOptions";
import { useTheme } from "../../context/ThemeContext";

const Index = ({ route }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const screenOptions = useScreenOptions();
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen 
        name="Library"
        options={{
          title: t("Library"),
        }}
        component={Libary}
      />
      <Stack.Screen 
        name="Story"
        options={{
          title: t("Story"),
        }}
        component={StoryDetail} 
      />
    </Stack.Navigator>
  );
};

export default Index;