import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTranslation } from "react-i18next";
import { FontAwesome6 } from "@expo/vector-icons";
import ExpandableButton from "../../components/ExpandableButton";
import { useTheme } from "../../context/ThemeContext";
import apiClient from '../../utils/Backend';
import { useUser } from '../../context/UserContext';

const Signup = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { saveUser } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password || password !== confirmPassword) {
      Alert.alert(
        t("Error"),
        t("Please fill in all fields and ensure passwords match."),
        [{ text: t("OK") }]
      );
      return;
    }

    setIsLoading(true);

    const payload = {username: username,
      email: email,
      password: password
    };
    apiClient.post('/api/signup/', payload).then(response => {
      saveUser({
        token: response.data.token,
        user_id: response.data.user_id,
        username: response.data.username,
        email: response.data.email
      });

      setIsLoading(false);
    }).catch(error => {
      console.error('Signup error:', error);
      setIsLoading(false);
      
      let errorMessage = t("Something went wrong. Please try again later.");
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert(
        t("Error"),
        errorMessage,
        [{ text: t("OK") }]
      );
    });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.logoContainer}>
        <Text style={[styles.appName, { color: theme.colors.primary }]}>Thalia</Text>
        <Text style={[styles.tagline, { color: theme.colors.secondaryText }]}>
          {t("Join our community of storytellers")}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: theme.colors.primaryText }]}>{t("Username")}</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            color: theme.colors.primaryText
          }]}
          placeholder={t("Enter your username")}
          placeholderTextColor={theme.colors.secondaryText}
          value={username}
          onChangeText={setUsername}
        />

        <Text style={[styles.label, { color: theme.colors.primaryText }]}>{t("Email")}</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            color: theme.colors.primaryText
          }]}
          placeholder={t("Enter your email")}
          placeholderTextColor={theme.colors.secondaryText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: theme.colors.primaryText }]}>{t("Password")}</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            color: theme.colors.primaryText
          }]}
          placeholder={t("Create a password")}
          placeholderTextColor={theme.colors.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={[styles.label, { color: theme.colors.primaryText }]}>{t("Confirm Password")}</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            color: theme.colors.primaryText
          }]}
          placeholder={t("Confirm your password")}
          placeholderTextColor={theme.colors.secondaryText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <ExpandableButton 
          style={[styles.signupButton, { backgroundColor: theme.colors.primary }]} 
          onPress={handleSignup}
        >
          <Text style={[styles.signupButtonText, { color: theme.colors.primaryTextInverted }]}>
            {isLoading ? t("Creating account...") : t("Create Account")}
          </Text>
        </ExpandableButton>

        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.dividerText, { color: theme.colors.secondaryText }]}>{t("OR")}</Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        </View>

        <ExpandableButton 
          style={[styles.socialButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
          onPress={() => {}}
        >
          <FontAwesome6 name="google" size={20} color={theme.colors.primaryText} />
          <Text style={[styles.socialButtonText, { color: theme.colors.primaryText }]}>
            {t("Continue with Google")}
          </Text>
        </ExpandableButton>
      </View>

      <View style={styles.loginContainer}>
        <Text style={[styles.loginText, { color: theme.colors.secondaryText }]}>
          {t("Already have an account?")}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
            {t("Login")}
          </Text>
        </TouchableOpacity>
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
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
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
  signupButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default Signup;