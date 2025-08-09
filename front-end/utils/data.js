export const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    savings: null,
    popular: false,
    sku: 'premium_monthly', // Your App Store/Play Store product ID
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$79.99',
    period: '/year',
    savings: 'Save 33%',
    popular: true,
    sku: 'premium_yearly', // Your App Store/Play Store product ID
  },
];

export const features = [
  { icon: 'flash', text: 'Unlimited quiz prompts' },
  { icon: 'star', text: 'Advanced question types' },
  { icon: 'sparkles', text: 'Priority AI processing' },
  // { icon: 'ribbon', text: 'Export to multiple formats' },
  { icon: 'checkmark-circle', text: 'Ad-free experience' },
  { icon: 'headset', text: 'Priority customer support' },
];
