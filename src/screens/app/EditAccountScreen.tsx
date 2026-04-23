import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import { useAuth } from '../../hooks/useAuth';
import type { AppStackParamList } from '../../types/navigation';
import { colors, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'EditAccount'>;

const EditAccountScreen = ({ navigation }: Props) => {
  const { user, logout, updateProfile, isLoading, error, clearError } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [middleName, setMiddleName] = useState(user?.middleName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setMiddleName(user?.middleName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  const isDisabled = useMemo(
    () =>
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim(),
    [email, firstName, lastName]
  );

  const handleSave = async () => {
    clearError();
    await updateProfile({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    });
    Alert.alert('Profile updated', 'Your account details have been saved.');
    navigation.goBack();
  };

  const handleLogout = async () => {
    clearError();
    await logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Edit Account</Text>
            <Text style={styles.subtitle}>
              Update your profile information and keep your contact details current.
            </Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <AppInput
              label="First Name"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <AppInput
              label="Middle Name"
              placeholder="Enter your middle name"
              value={middleName}
              onChangeText={setMiddleName}
            />
            <AppInput
              label="Last Name"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
            />
            <AppInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Updating your account...</Text>
              </View>
            ) : null}

            <View style={styles.buttonGroup}>
              <AppButton
                title={isLoading ? 'Saving Changes...' : 'Save Changes'}
                onPress={handleSave}
                disabled={isDisabled || isLoading}
              />
              <AppButton
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="secondary"
                disabled={isLoading}
              />
              <AppButton
                title={isLoading ? 'Logging Out...' : 'Log Out'}
                onPress={handleLogout}
                variant="ghost"
                disabled={isLoading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonGroup: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});

export default EditAccountScreen;