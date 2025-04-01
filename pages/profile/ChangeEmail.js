import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useTranslation } from "react-i18next";
import ExpandableButton from "../../components/ExpandableButton";
import { useTheme } from "../../context/ThemeContext";
import apiClient from '../../utils/Backend';
import { useViewStyle } from '../../hooks/useViewStyle';
import { useUser } from '../../context/UserContext';

const ChangeEmail = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const viewStyle = useViewStyle();
  const { userData, saveUser } = useUser();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeEmail = async () => {
    if (!currentPassword || !newEmail) {
      Alert.alert(
        t("Error"),
        t("Please fill in all fields."),
        [{ text: t("OK") }]
      );
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert(
        t("Error"),
        t("Please enter a valid email address."),
        [{ text: t("OK") }]
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/change-email/', {
        current_password: currentPassword,
        new_email: newEmail
      });
      
      setIsLoading(false);
      
      // Update user data with the new email
      saveUser({
        ...userData,
        email: newEmail
      });
      
      Alert.alert(
        t("Success"),
        t("Your email has been updated successfully."),
        [{ 
          text: t("OK"),
          onPress: () => navigation.goBack()
        }]
      );
    } catch (error) {
      console.error('Change email error:', error);
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
          {t("Change Email")}
        </Text>
        
        <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
          {t("Enter your password and a new email address to update your account.")}
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
          {t("New Email")}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            color: theme.colors.primaryText
          }]}
          placeholder={t("Enter your new email address")}
          placeholderTextColor={theme.colors.secondaryText}
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
          autoCapitalize="none"
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
            onPress={handleChangeEmail}
          >
            <Text style={[styles.buttonText, { color: theme.colors.primaryTextInverted }]}>
              {isLoading ? t("Updating...") : t("Update Email")}
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
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangeEmail;