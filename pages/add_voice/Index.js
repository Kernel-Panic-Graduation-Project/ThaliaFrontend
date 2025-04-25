import SpeechLibrary from "./SpeechLibrary"
import SpeechItem from "./SpeechItem";
import AddVoice from "./AddVoice";
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
        name="SpeechLibrary"
        options={{
          title: t("SpeechLibrary"),
        }}
        component={SpeechLibrary}
      />
      <Stack.Screen 
        name="Speech"
        options={{
          title: t("Speech"),
        }}
        component={SpeechItem} 
      />
      <Stack.Screen 
        name="AddVoice"
        options={{
          title: t("Add Voice"),
        }}
        component={AddVoice} 
      />
    </Stack.Navigator>
  );
};

export default Index;