import {View, Text, StyleSheet} from 'react-native';
import {useTranslation} from "react-i18next";
import { useViewStyle } from '../../hooks/useViewStyle';
import { useTheme } from '../../context/ThemeContext';

const Favorites = () => {
  const {t} = useTranslation();
  const {theme} = useTheme();
  const viewStyle = useViewStyle();

  return (
    <View style={viewStyle}>
      <Text style={[styles.title, {color: theme.colors.primaryText}]}>{t("Welcome to the Favorites Page!")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10
  },
});

export default Favorites;
