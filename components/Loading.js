import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { useViewStyle } from "../hooks/useViewStyle";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

const Loading = ({ text }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const viewStyle = useViewStyle();

    return (
      <View style={[viewStyle, styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.secondaryText }]}>
          {text ? t(text) : t("Loading...")}
        </Text>
      </View>
    );
};

const styles = StyleSheet.create({
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

export default Loading;