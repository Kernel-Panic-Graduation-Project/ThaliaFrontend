import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useTranslation } from "react-i18next";
import { FontAwesome6 } from "@expo/vector-icons";
import ExpandableButton from "../../components/ExpandableButton";
import { useTheme } from "../../context/ThemeContext";
import apiClient from '../../utils/Backend';
import { useViewStyle } from '../../hooks/useViewStyle';

const ChangePassword = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const viewStyle = useViewStyle();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        t("Error"),
        t("Please fill in all fields."),
        [{ text: t("OK") }]
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t("Error"),
        t("New passwords do not match."),
        [{ text: t("OK") }]
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/change-password/', {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      setIsLoading(false);
      
      Alert.alert(
        t("Success"),
        t("Your password has been updated successfully."),
        [{ 
          text: t("OK"),
          onPress: () => navigation.goBack()
        }]
      );
    } catch (error) {
      console.error('Change password error:', error);
      setIsLoading(false);
      
      let errorMessage = t("Something went wrong. Please try again later.");
      
      if (error?.response?.data?.error) {
        errorMessage = t(error.response.data.error);
      }
      
      Alert.alert(
        t("Error"),
        errorMessage,
        [{ text: t("OK") }]
      );
    }
  };

  return (
    <ScrollView style={[viewStyle, styles.container]}>
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: theme.colors.primaryText }]}>
          {t("Change Password")}
        </Text>
        
        <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
          {t("Enter your current password and a new password to update your credentials.")}
        </Text>
        
        <Text style={[styles.label, { color: theme.colors.primaryText }]}>
          {t("Current Password")}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            color: theme.colors.primaryText
          }]}
          placeholder={t("Enter your current password")}
          placeholderTextColor={theme.colors.secondaryText}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />

        <Text style={[styles.label, { color: theme.colors.primaryText }]}>
          {t("New Password")}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            color: theme.colors.primaryText
          }]}
          placeholder={t("Enter your new password")}
          placeholderTextColor={theme.colors.secondaryText}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <Text style={[styles.label, { color: theme.colors.primaryText }]}>
          {t("Confirm New Password")}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            color: theme.colors.primaryText
          }]}
          placeholder={t("Confirm your new password")}
          placeholderTextColor={theme.colors.secondaryText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={styles.buttonsContainer}>
          <ExpandableButton 
            style={[styles.cancelButton, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, { color: theme.colors.primaryText }]}>
              {t("Cancel")}
            </Text>
          </ExpandableButton>

          <ExpandableButton 
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} 
            onPress={handleChangePassword}
          >
            <Text style={[styles.buttonText, { color: theme.colors.primaryTextInverted }]}>
              {isLoading ? t("Updating...") : t("Update Password")}
            </Text>
          </ExpandableButton>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
  },
  saveButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangePassword;