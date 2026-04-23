import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const highlights = [
  { icon: 'car-sport-outline', label: 'Live slot access' },
  { icon: 'navigate-outline', label: 'City-ready parking' },
  { icon: 'shield-checkmark-outline', label: 'Secure account' },
] as const;

const LoginScreen = ({ navigation }: Props) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isDisabled = useMemo(
    () => !email.trim() || password.length < 6,
    [email, password]
  );

  const handleLogin = async () => {
    clearError();
    await login({
      email: email.trim(),
      password: password.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.select({ ios: 48, android: 0 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroSection}>
              <View style={styles.heroGlowTop} />
              <View style={styles.heroGlowBottom} />
              <View style={styles.badge}>
                <Ionicons name="sparkles-outline" size={14} color={colors.white} />
                <Text style={styles.badgeText}>Smart Parking</Text>
              </View>

              <Text style={styles.brand}>FleXpark</Text>
              <Text style={styles.title}>Welcome back to your parking hub</Text>
              <Text style={styles.subtitle}>
                Log in to check nearby slots, manage your stays, and move through the city faster.
              </Text>

              <View style={styles.highlightList}>
                {highlights.map((item) => (
                  <View key={item.label} style={styles.highlightChip}>
                    <Ionicons name={item.icon} size={16} color={colors.white} />
                    <Text style={styles.highlightText}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Log in</Text>
                <Text style={styles.formSubtitle}>
                  Enter your credentials to continue.
                </Text>
              </View>

              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <AppInput
                label="Email"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <AppInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />

              <TouchableOpacity activeOpacity={0.8} style={styles.helperRow} disabled={isLoading}>
                <Text style={styles.helperText}>Forgot password?</Text>
              </TouchableOpacity>

              <AppButton
                title={isLoading ? 'Accessing FleXpark...' : 'Access FleXpark'}
                onPress={handleLogin}
                disabled={isDisabled || isLoading}
                style={styles.primaryButton}
              />

              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Signing you in...</Text>
                </View>
              ) : null}

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>New to FleXpark?</Text>
                <AppButton
                  title="Create account"
                  onPress={() => navigation.navigate('SignIn')}
                  variant="ghost"
                  style={styles.ghostButton}
                  disabled={isLoading}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF3FF',
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heroSection: {
    overflow: 'hidden',
    backgroundColor: '#1D4ED8',
    borderRadius: 32,
    padding: spacing.xl,
    marginBottom: -18,
  },
  heroGlowTop: {
    position: 'absolute',
    top: -30,
    right: -10,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(56, 189, 248, 0.28)',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -50,
    left: -20,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 165, 233, 0.18)',
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: spacing.md,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  brand: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.white,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: spacing.lg,
  },
  highlightList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  highlightText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: spacing.xl,
    gap: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  formHeader: {
    marginBottom: spacing.md,
  },
  formTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  formSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  helperRow: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: spacing.md,
  },
  helperText: {
    color: '#0EA5E9',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  ghostButton: {
    paddingVertical: spacing.sm,
  },
});

export default LoginScreen;