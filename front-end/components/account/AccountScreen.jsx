import React, { useState, useEffect, useCallback } from 'react';

// import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedText from '../../Themes/ThemedText';

const AccountScreen = () => {
  const { user, refreshUserData, signOut, apiCall } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // console.log('👤user is', user);

  const handleLogout = () => {
    router.push('/login');
  };

  const fetchProfileData = async () => {
    try {
      const response = await apiCall('/user/profile');

      setProfileData(response.data.data);
    } catch (error) {
      // console.error('AS error ✅', error.message);
      if (
        error.message.includes('expired') ||
        error.message.includes('Authentication required')
      ) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: handleLogout }]
        );
      } else {
        console.error('Profile fetch error:', error);
        Alert.alert('Error', 'Failed to load profile data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  // console.log('🧔Profile data is', profileData);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
  };

  useFocusEffect(
    useCallback(() => {
      // ✅ useCallback result is passed to useFocusEffect
      fetchProfileData();
    }, [])
  );

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const getSubscriptionBadgeColor = (tier) => {
    return tier === 'premium' ? '#10B981' : '#6B7280';
  };

  const getSubscriptionIcon = (tier) => {
    return tier === 'premium' ? 'diamond' : 'person';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getPromptsDisplay = () => {
    if (!profileData)
      return (
        <ThemedText variant="muted" style={{ fontSize: 14 }}>
          N/A
        </ThemedText>
      );

    if (profileData.subscriptionTier === 'premium') {
      return 'Unlimited';
    }

    return `${profileData.promptsLeft || 0} left today`;
  };

  const getPromptsColor = () => {
    if (!profileData) return '#6B7280';

    if (profileData.subscriptionTier === 'premium') {
      return '#10B981';
    }

    const prompts = profileData.promptsLeft || 0;
    if (prompts <= 2) return '#EF4444';
    if (prompts <= 5) return '#F59E0B';
    return '#10B981';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        {/* <Text style={styles.loadingText}>Loading profile...</Text> */}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <ThemedText variant="bgWhite" style={styles.avatarText}>
                {profileData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </ThemedText>
            </View>
            <View style={styles.userDetails}>
              <ThemedText style={styles.userName}>
                {profileData?.name || 'N/A'}
              </ThemedText>

              <ThemedText variant="muted" style={styles.userEmail}>
                {profileData?.email || 'N/A'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Subscription Status Card */}
        <View style={styles.card}>
          <View style={[styles.cardHeader]}>
            <Ionicons
              name={getSubscriptionIcon(profileData?.subscriptionTier)}
              size={24}
              color={getSubscriptionBadgeColor(profileData?.subscriptionTier)}
            />
            <ThemedText style={styles.cardTitle}>Subscription</ThemedText>
          </View>

          <View style={styles.subscriptionInfo}>
            <View style={styles.subscriptionBadge}>
              <Text
                style={[
                  styles.subscriptionText,
                  {
                    color: getSubscriptionBadgeColor(
                      profileData?.subscriptionTier
                    ),
                  },
                ]}
              >
                {profileData?.subscriptionTier
                  ? profileData.subscriptionTier.charAt(0).toUpperCase() +
                    profileData.subscriptionTier.slice(1).toLowerCase() +
                    ' ' +
                    'tier'
                  : 'Free tier'}
              </Text>
            </View>

            {profileData?.subscriptionTier === 'premium' && (
              <View style={styles.subscriptionDetails}>
                <Text style={styles.detailText}>
                  Status: {profileData?.subscriptionData?.status || 'Active'}
                </Text>
                <Text style={styles.detailText}>
                  Expires:{' '}
                  {formatDate(profileData?.subscriptionData?.currentPeriodEnd)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Prompts Usage Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#3B82F6" />
            <ThemedText style={styles.cardTitle}>Daily Prompts</ThemedText>
          </View>

          <View style={styles.promptsInfo}>
            <Text style={[styles.promptsCount, { color: getPromptsColor() }]}>
              {getPromptsDisplay()}
            </Text>

            {profileData?.subscriptionTier === 'free' && (
              <View style={styles.promptsProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          ((profileData?.promptsLeft || 0) / 3) * 100
                        }%`,
                        backgroundColor: getPromptsColor(),
                      },
                    ]}
                  />
                </View>
                <ThemedText variant="muted" style={styles.progressText}>
                  {profileData?.promptsLeft || 0} / 3 prompts remaining
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Account Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#6B7280" />
            <ThemedText style={styles.cardTitle}>Account Info</ThemedText>
          </View>

          <View style={styles.accountInfo}>
            <View style={styles.infoRow}>
              <ThemedText variant="muted" style={styles.infoLabel}>
                Member since:
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(profileData?.createdAt)}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last active:</Text>
              <Text style={styles.infoValue}>
                {formatDate(profileData?.updatedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {profileData?.subscriptionTier === 'free' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/paywall')}
            >
              <Ionicons name="diamond-outline" size={20} color="#FFFFFF" />
              <ThemedText variant="bgWhite" style={styles.upgradeButtonText}>
                Upgrade to Premium
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <ThemedText variant="error" style={styles.signOutButtonText}>
              Sign Out
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    // backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    // backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: '100%',
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    // color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',

    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    // color: '#111827',
    marginLeft: 8,
  },
  subscriptionInfo: {
    alignItems: 'flex-start',
  },
  subscriptionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  subscriptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subscriptionDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  promptsInfo: {
    alignItems: 'flex-start',
  },
  promptsCount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  promptsProgress: {
    width: '100%',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    // color: '#6B7280',
  },
  accountInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 8,

    alignSelf: 'center',
  },
  signOutButtonText: {
    // color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountScreen;
