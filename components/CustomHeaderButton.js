import { Pressable } from 'react-native-gesture-handler'
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const CustomHeaderButton = ({ onPress, children }) => {
  const { theme } = useTheme();
  
  return (
    <Pressable
      style={{
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        marginHorizontal: 4,
      }}
      onPress={onPress}
    >
      {children ? (
        children
      ) : (
        <FontAwesome6 name="circle-xmark" size={20} color={theme.colors.primaryText} />
      )}
    </Pressable>
  );
};

export default CustomHeaderButton;