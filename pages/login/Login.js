import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from "react-i18next";
import { FontAwesome6 } from "@expo/vector-icons";
import ExpandableButton from "../../components/ExpandableButton";
import { useTheme } from "../../context/ThemeContext";
import apiClient from '../../utils/Backend';
import { useUser } from '../../context/UserContext';

const Login = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { saveUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        t("Error"),
        t("Please enter both email and password."),
        [{ text: t("OK") }]
      );
      return;
    }

    setIsLoading(true);
    
    const payload = {
      email: email,
      password: password
    };
    apiClient.post('/api/login/', payload).then(response => {      
      saveUser({
        token: response.data.token,
        user_id: response.data.user_id,
        username: response.data.username,
        email: response.data.email
      });
      
      setIsLoading(false);
    }).catch(error => {
      console.error('Login error:', error);
      setIsLoading(false);
      
      let errorMessage = t("Invalid email or password.");
      
      Alert.alert(
        t("Error"),
        errorMessage,
        [{ text: t("OK") }]
      );
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.logoContainer}>
        <Text style={[styles.appName, { color: theme.colors.primary }]}>Thalia</Text>
        <Text style={[styles.tagline, { color: theme.colors.secondaryText }]}>
          {t("Your Story Companion")}
        </Text>
      </View>

      <View style={styles.formContainer}>
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
          placeholder={t("Enter your password")}
          placeholderTextColor={theme.colors.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('RequestPasswordReset')}
        >
          <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
            {t("Forgot Password?")}
          </Text>
        </TouchableOpacity>

        <ExpandableButton 
          style={[styles.loginButton, { backgroundColor: theme.colors.primary }]} 
          onPress={handleLogin}
        >
          <Text style={[styles.loginButtonText, { color: theme.colors.primaryTextInverted }]}>
            {isLoading ? t("Logging in...") : t("Login")}
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

      <View style={styles.signupContainer}>
        <Text style={[styles.signupText, { color: theme.colors.secondaryText }]}>
          {t("Don't have an account?")}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={[styles.signupLink, { color: theme.colors.primary }]}>
            {t("Sign up")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 24,
  },
  loginButtonText: {
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  signupText: {
    fontSize: 16,
  },
  signupLink: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default Login;