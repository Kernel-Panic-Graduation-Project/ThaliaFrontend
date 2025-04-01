import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useTranslation } from "react-i18next";
import { FontAwesome6 } from "@expo/vector-icons";
import ExpandableButton from "../../components/ExpandableButton";
import { useTheme } from "../../context/ThemeContext";
import apiClient from '../../utils/Backend';

const RequestPasswordReset = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert(
        t("Error"),
        t("Please enter a valid email address."),
        [{ text: t("OK") }]
      );
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/api/request-password-reset/', {
        email: email
      });
      
      setIsLoading(false);
      
      // Navigate to confirmation page
      navigation.navigate('ConfirmPasswordReset', { email });
    } catch (error) {
      console.error('Password reset request error:', error);
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
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
          <FontAwesome6 name="lock" size={40} color={theme.colors.primaryTextInverted} />
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: theme.colors.primaryText }]}>
          {t("Reset Password")}
        </Text>
        
        <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
          {t("Enter your email address and we'll send you a 6-digit code to reset your password.")}
        </Text>
        
        <Text style={[styles.label, { color: theme.colors.primaryText }]}>
          {t("Email")}
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            color: theme.colors.primaryText
          }]}
          placeholder={t("Enter your email address")}
          placeholderTextColor={theme.colors.secondaryText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <ExpandableButton 
          style={[styles.resetButton, { backgroundColor: theme.colors.primary }]} 
          onPress={handleRequestReset}
        >
          <Text style={[styles.resetButtonText, { color: theme.colors.primaryTextInverted }]}>
            {isLoading ? t("Sending...") : t("Send Reset Code")}
          </Text>
        </ExpandableButton>

        <ExpandableButton 
          style={[styles.cancelButton, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.primaryText }]}>
            {t("Back to Login")}
          </Text>
        </ExpandableButton>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
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
    marginBottom: 24,
  },
  resetButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RequestPasswordReset;