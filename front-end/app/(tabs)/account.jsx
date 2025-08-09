import { View, Text } from 'react-native';
import AccountScreen from '../../components/account/AccountScreen';

export default function Profile() {
  return (
    <View
      style={{
        flex: 1,
        // backgroundColor: '#F9FAFB',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <AccountScreen />
    </View>
  );
}
