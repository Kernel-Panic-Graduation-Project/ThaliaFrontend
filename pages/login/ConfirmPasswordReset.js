import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, Keyboard } from 'react-native';
import { useTranslation } from "react-i18next";
import { FontAwesome6 } from "@expo/vector-icons";
import ExpandableButton from "../../components/ExpandableButton";
import { useTheme } from "../../context/ThemeContext";
import apiClient from '../../utils/Backend';

const ConfirmPasswordReset = ({ route, navigation }) => {
  const { email } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // Create 6 separate states for each digit
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Create refs for each digit input
  const inputRefs = useRef([]);
  
  // Initialize the refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);
  
  // Handle code input changes
  const handleCodeChange = (text, index) => {
    // Only allow digits
    if (!/^\d*$/.test(text)) return;
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Auto-advance to next input if a digit was entered
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  // Handle backspace key
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && code[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResetPassword = async () => {
    const resetCode = code.join('');
    
    if (resetCode.length !== 6) {
      Alert.alert(
        t("Error"),
        t("Please enter the 6-digit code sent to your email."),
        [{ text: t("OK") }]
      );
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert(
        t("Error"),
        t("Please enter and confirm your new password."),
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
    Keyboard.dismiss();

    try {
      await apiClient.post('/api/confirm-password-reset/', {
        email: email,
        code: resetCode,
        new_password: newPassword
      });
      
      setIsLoading(false);
      
      Alert.alert(
        t("Success"),
        t("Your password has been reset successfully."),
        [{ 
          text: t("Login Now"),
          onPress: () => navigation.navigate('Login')
        }]
      );
    } catch (error) {
      console.error('Password reset confirmation error:', error);
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
          <FontAwesome6 name="key" size={40} color={theme.colors.primaryTextInverted} />
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: theme.colors.primaryText }]}>
          {t("Verify Code")}
        </Text>
        
        <Text style={[styles.description, { color: theme.colors.secondaryText }]}>
          {t("We've sent a 6-digit code to")} {email}. {t("Enter the code below to reset your password.")}
        </Text>
        
        {/* 6-digit code input */}
        <View style={styles.codeContainer}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={`code-${index}`}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.codeInput, { 
                backgroundColor: theme.colors.surface, 
                borderColor: theme.colors.border,
                color: theme.colors.primaryText
              }]}
              value={code[index]}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>
        
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

        <ExpandableButton 
          style={[styles.resetButton, { backgroundColor: theme.colors.primary }]} 
          onPress={handleResetPassword}
        >
          <Text style={[styles.resetButtonText, { color: theme.colors.primaryTextInverted }]}>
            {isLoading ? t("Resetting...") : t("Reset Password")}
          </Text>
        </ExpandableButton>

        <ExpandableButton 
          style={[styles.resendButton, { 
            backgroundColor: 'transparent',
          }]} 
          onPress={() => navigation.replace('RequestPasswordReset')}
        >
          <Text style={[styles.resendButtonText, { color: theme.colors.primary }]}>
            {t("Didn't receive the code? Request again")}
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 22,
    fontWeight: '600',
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
  resetButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default ConfirmPasswordReset;