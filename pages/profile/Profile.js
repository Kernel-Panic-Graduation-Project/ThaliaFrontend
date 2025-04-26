import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import ExpandableButton from "../../components/ExpandableButton";
import { FontAwesome6 } from "@expo/vector-icons";
import apiClient from '../../utils/Backend';
import i18n from '../../utils/i18n';
import { useViewStyle } from '../../hooks/useViewStyle';

const Profile = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const viewStyle = useViewStyle();
  const { userData, resetUser } = useUser();
  
  // Get current language and dark mode state
  const isDarkMode = theme.dark;
  const currentLanguage = i18n.language;

  const handleLogout = async () => {
    apiClient.post('/api/logout/').then(response => {
      resetUser();
    }).catch(error => {
      console.error('Logout error:', error);
    });
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <ScrollView style={viewStyle}>
      <View>
        {userData && (
          <View style={styles.userInfoContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.avatarText, { color: theme.colors.primaryTextInverted }]}>
                {userData.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            
            <Text style={[styles.username, { color: theme.colors.primaryText }]}>
              {userData.username}
            </Text>
            
            <Text style={[styles.email, { color: theme.colors.secondaryText }]}>
              {userData.email}
            </Text>
            
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            {/* Settings Section */}
            <View style={styles.settingsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                <FontAwesome6 name="gear" size={16} color={theme.colors.primaryText} /> {t("Settings")}
              </Text>
              
              {/* Theme Toggle */}
              <View style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.settingTextContainer}>
                  <FontAwesome6 
                    name={isDarkMode ? "moon" : "sun"} 
                    size={18} 
                    color={isDarkMode ? "#9BA4B5" : "#FFB534"} 
                    style={styles.settingIcon}
                  />
                  <Text style={[styles.settingText, { color: theme.colors.primaryText }]}>
                    {t("Dark Mode")}
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.colors.secondary, true: theme.colors.primary }}
                  thumbColor={'#f4f3f4'}
                />
              </View>
              
              {/* Language Selection */}
              <View style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.settingTextContainer}>
                  <FontAwesome6 
                    name="language" 
                    size={18} 
                    color={theme.colors.primary} 
                    style={styles.settingIcon}
                  />
                  <Text style={[styles.settingText, { color: theme.colors.primaryText }]}>
                    {t("Language")}
                  </Text>
                </View>
                <View style={styles.languageButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      currentLanguage === 'tr' && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => handleLanguageChange('tr')}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        { color: currentLanguage === 'tr' ? theme.colors.primaryTextInverted : theme.colors.primaryText }
                      ]}
                    >
                      TR
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      currentLanguage === 'en' && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => handleLanguageChange('en')}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        { color: currentLanguage === 'en' ? theme.colors.primaryTextInverted : theme.colors.primaryText }
                      ]}
                    >
                      EN
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            {/* Account Section */}
            <View style={styles.settingsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                <FontAwesome6 name="user" size={16} color={theme.colors.primaryText} /> {t("Account")}
              </Text>
              
              <TouchableOpacity 
                style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate('ChangePassword')}
              >
                <View style={styles.settingTextContainer}>
                  <FontAwesome6 
                    name="lock" 
                    size={18} 
                    color={theme.colors.info} 
                    style={styles.settingIcon}
                  />
                  <Text style={[styles.settingText, { color: theme.colors.primaryText }]}>
                    {t("Change Password")}
                  </Text>
                </View>
                <FontAwesome6 
                  name="chevron-right" 
                  size={16} 
                  color={theme.colors.secondaryText} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate('ChangeEmail')}
              >
                <View style={styles.settingTextContainer}>
                  <FontAwesome6 
                    name="envelope" 
                    size={18} 
                    color={theme.colors.success} 
                    style={styles.settingIcon}
                  />
                  <Text style={[styles.settingText, { color: theme.colors.primaryText }]}>
                    {t("Update Email")}
                  </Text>
                </View>
                <FontAwesome6 
                  name="chevron-right" 
                  size={16} 
                  color={theme.colors.secondaryText} 
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            {/* Content Management Section */}
            <View style={styles.settingsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
                <FontAwesome6 name="wand-magic-sparkles" size={16} color={theme.colors.primaryText} /> {t("Content Management")}
              </Text>
              
              <TouchableOpacity 
                style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate('ManageCharacters')}
              >
                <View style={styles.settingTextContainer}>
                  <FontAwesome6 
                    name="users" 
                    size={18} 
                    color={theme.colors.primary} 
                    style={styles.settingIcon}
                  />
                  <Text style={[styles.settingText, { color: theme.colors.primaryText }]}>
                    {t("Manage Your Characters")}
                  </Text>
                </View>
                <FontAwesome6 
                  name="chevron-right" 
                  size={16} 
                  color={theme.colors.secondaryText} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate('SpeechLibrary')}
              >
                <View style={styles.settingTextContainer}>
                  <FontAwesome6 
                    name="microphone" 
                    size={18} 
                    color={theme.colors.info} 
                    style={styles.settingIcon}
                  />
                  <Text style={[styles.settingText, { color: theme.colors.primaryText }]}>
                    {t("Manage Your Voices")}
                  </Text>
                </View>
                <FontAwesome6 
                  name="chevron-right" 
                  size={16} 
                  color={theme.colors.secondaryText} 
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            {/* Logout Button */}
            <ExpandableButton 
              style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
              onPress={handleLogout}
            >
              <Text style={[styles.logoutButtonText, { color: theme.colors.primaryTextInverted }]}>
                <FontAwesome6 name="right-from-bracket" size={16} color={theme.colors.primaryTextInverted} /> {t("Logout")}
              </Text>
            </ExpandableButton>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold'
  },
  username: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8
  },
  email: {
    fontSize: 16,
    marginBottom: 20
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 20
  },
  settingsContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    alignSelf: 'flex-start'
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
  },
  languageButtonsContainer: {
    flexDirection: 'row',
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600'
  }
});

export default Profile;
