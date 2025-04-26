import { useTranslation } from "react-i18next";
import Profile from "./Profile";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "../../hooks/useScreenOptions";
import ChangePassword from "./ChangePassword";
import ChangeEmail from "./ChangeEmail";
import SpeechLibrary from "../speech_library/SpeechLibrary";
import SpeechItem from "../speech_library/SpeechItem";
import AddVoice from "../add_voice/AddVoice";

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
      {/* Speech Library Screens */}
      <Stack.Screen 
        name="SpeechLibrary"
        options={{
          title: t("Voice Recordings"),
          headerBackTitleVisible: false,
        }}
        component={SpeechLibrary}
      />
      <Stack.Screen 
        name="AddVoice"
        options={{
          title: t("Add Voice"),
          headerBackTitleVisible: false,
        }}
        component={AddVoice}
      />
      <Stack.Screen 
        name="Speech"
        options={{
          title: t("Voice Details"),
          headerBackTitleVisible: false,
        }}
        component={SpeechItem} 
      />
    </Stack.Navigator>
  );
}

export default Index;
