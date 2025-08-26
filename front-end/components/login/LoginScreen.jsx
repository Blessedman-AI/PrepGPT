import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/authContext';
import ThemedText from '../../Themes/ThemedText';
import ThemedTextInput from '../../Themes/ThemedTextInput';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import getErrorMessage from '../../utils/errorHandler';

const LoginScreen = () => {
  const { signIn, isLoading } = useAuth();
  const [errors, setErrors] = useState({});
  const [generalErrors, setGeneralErrors] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const router = useRouter();

  // const isLoading = true;
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleLogin = async () => {
  //   if (!validateForm()) return;
  //   console.log('Form data before login:', formData);

  //   try {
  //     await signIn(formData.email, formData.password);
  //   } catch (error) {
  //     console.log('😂 Login error:', error.message);
  //     // Or make it safe like this:
  //     console.error(
  //       '🤡Login error:',
  //       error.response?.data || 'No response data'
  //     );
  //     const uSerError = getErrorMessage(error);
  //     console.error('📞❤️‍🩹Login error message:', uSerError);
  //     setGeneralErrors(uSerError);
  //   }
  // };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const result = await signIn(formData.email, formData.password);

      if (result?.success && result.user) {
        router.push('/'); // ✅ only navigate if login worked
      }
    } catch (error) {
      // console.log('😂 Login error:', error.response);
      const uSerError = getErrorMessage(error);
      setGeneralErrors(uSerError);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  useEffect(() => {
    if (generalErrors) {
      const timeout = setTimeout(() => {
        setGeneralErrors(null);
      }, 5000);

      // Clear timeout if component unmounts or errors change before timeout ends
      return () => clearTimeout(timeout);
    }
  }, [generalErrors]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.content]}>
            <View style={styles.cancelContainer}>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Ionicons name="close" size={28} />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.headerTitle}>Welcome Back</ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedTextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  keyboardType="email-address"
                  autoCorrect={false}
                />

                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <ThemedTextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  secureTextEntry
                  keyboardType="password"
                  autoCapitalize="none"
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push('/signup')}
              >
                {generalErrors ? (
                  <Text style={styles.errorText}>{generalErrors}</Text>
                ) : (
                  <ThemedText variant="muted">
                    Don't have an account?{' '}
                    <ThemedText variant="primary" style={styles.linkHighlight}>
                      Sign up
                    </ThemedText>
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'teal',
  },
  keyboardAvoid: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cancelContainer: {
    position: 'absolute',
    top: 20,
    right: 22,
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    // color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    // color: '#e0f2f1',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    // backgroundColor: '#e5ebfe',
    // color: '#4b5563',
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    // borderColor: '#4b5563',
  },

  inputError: {
    borderColor: '#ff5252',
  },
  errorText: {
    color: '#ff5252',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 18,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#e0f2f1',
    fontSize: 15,
  },
  linkHighlight: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
