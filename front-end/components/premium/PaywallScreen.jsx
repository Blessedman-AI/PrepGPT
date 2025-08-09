import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { features, plans } from '../../utils/data';
import ThemedText from '../../Themes/ThemedText';
import { useRouter } from 'expo-router';

// const { width } = Dimensions.get('window');

// Move components outside to prevent recreation on every render
const FeatureItem = React.memo(({ icon, text }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Ionicons name={icon} size={20} color="#3B82F6" />
    </View>
    <ThemedText variant="primary" style={styles.featureText}>
      {text}
    </ThemedText>
  </View>
));

const PlanOption = React.memo(({ plan, selectedPlan, onSelectPlan }) => {
  const handlePress = useCallback(() => {
    onSelectPlan(plan.id);
  }, [plan.id, onSelectPlan]);

  const planContainerStyle = useMemo(
    () => [
      styles.planContainer,
      selectedPlan === plan.id && styles.selectedPlan,
      plan.popular && styles.popularPlan,
    ],
    [selectedPlan, plan.id, plan.popular]
  );

  const radioButtonStyle = useMemo(
    () => [
      styles.radioButton,
      selectedPlan === plan.id && styles.radioButtonSelected,
    ],
    [selectedPlan, plan.id]
  );

  return (
    <TouchableOpacity style={planContainerStyle} onPress={handlePress}>
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}

      <View style={styles.planContent}>
        <View style={styles.planDetails}>
          <ThemedText style={styles.planName}>{plan.name}</ThemedText>
          <View style={styles.priceRow}>
            <ThemedText style={styles.planPrice}>{plan.price}</ThemedText>
            <ThemedText variant="muted" style={styles.planPeriod}>
              {plan.period}
            </ThemedText>
          </View>
          {plan.savings && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>{plan.savings}</Text>
            </View>
          )}
        </View>

        <View style={radioButtonStyle}>
          {selectedPlan === plan.id && <View style={styles.radioButtonInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const PaywallScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  // const colorScheme = useColorScheme();
  const router = useRouter();

  const handleSubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      // Here you would integrate with Expo In-App Purchases or RevenueCat
      // Example: await InAppPurchases.purchaseItemAsync(selectedPlan);

      // Simulate purchase process
      setTimeout(() => {
        setIsLoading(false);
        // Navigate back or show success
        console.log('Purchase initiated for:', selectedPlan);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      console.error('Purchase failed:', error);
    }
  }, [selectedPlan]);

  const handleClose = useCallback(() => {
    // router.push('/account');
    router.back();
  }, [router]);

  const handleSelectPlan = useCallback((planId) => {
    setSelectedPlan(planId);
  }, []);

  // Memoize the selected plan details to avoid recalculation
  const selectedPlanDetails = useMemo(() => {
    return plans.find((p) => p.id === selectedPlan);
  }, [selectedPlan]);

  // Memoize the subscribe button style
  const subscribeButtonStyle = useMemo(
    () => [styles.subscribeButton, isLoading && styles.disabledButton],
    [isLoading]
  );

  // Memoize subscribe button text
  const subscribeButtonText = useMemo(() => {
    if (isLoading) return null;
    return `Start Premium - ${selectedPlanDetails?.price}${selectedPlanDetails?.period}`;
  }, [isLoading, selectedPlanDetails]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Upgrade to Premium</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.card}>
          <View>
            <Ionicons name="diamond" size={40} color="#3B82F6" />
          </View>

          <ThemedText style={styles.heroTitle}>
            Unlock Premium Features
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Create unlimited quizzes with advanced AI features and priority
            support
          </ThemedText>
        </View>

        {/* Features */}
        <View style={styles.card}>
          {features.map((feature, index) => (
            <FeatureItem key={index} icon={feature.icon} text={feature.text} />
          ))}
        </View>

        {/* Pricing Plans */}
        <View style={styles.pricingSection}>
          <ThemedText style={styles.pricingTitle}>Choose Your Plan</ThemedText>
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <PlanOption
                key={plan.id}
                plan={plan}
                selectedPlan={selectedPlan}
                onSelectPlan={handleSelectPlan}
              />
            ))}
          </View>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={subscribeButtonStyle}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          <View>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.subscribeText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.subscribeText}>{subscribeButtonText}</Text>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 19, 21, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
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
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  pricingSection: {
    marginBottom: 22,
    marginTop: 12,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  plansContainer: {
    gap: 18,
  },
  planContainer: {
    backgroundColor: 'rgba(214, 214, 214, 0.3)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    flexDirection: 'column',
    borderWidth: 2,
    borderColor: 'rgba(214, 214, 214, 0.5)',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  popularPlan: {
    borderColor: '#8B5CF6',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planDetails: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  planPeriod: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  savingsBadge: {
    backgroundColor: 'rgba(34, 197, 94, 1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  savingsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3B82F6',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  subscribeButton: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#3B82F6',
  },
  disabledButton: {
    opacity: 0.5,
  },
  subscribeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  footerLink: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
});

// Add display names for debugging
FeatureItem.displayName = 'FeatureItem';
PlanOption.displayName = 'PlanOption';

export default PaywallScreen;
