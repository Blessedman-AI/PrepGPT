import os from 'os';
import fs from 'fs';
import path from 'path';

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();

  // Priority order: look for WiFi first, then Ethernet, then others
  const priorityOrder = ['Wi-Fi', 'WiFi', 'wlan0', 'Ethernet', 'eth0'];

  // First, try priority interfaces
  for (const name of priorityOrder) {
    if (interfaces[name]) {
      for (const networkInterface of interfaces[name]) {
        if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
          return networkInterface.address;
        }
      }
    }
  }

  // Fallback: find any non-internal IPv4 address
  for (const name of Object.keys(interfaces)) {
    for (const networkInterface of interfaces[name]) {
      if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
        return networkInterface.address;
      }
    }
  }

  throw new Error('No local IP address found');
}

function updateConfigFiles(ipAddress) {
  const apiUrl = `http://${ipAddress}:5000/api`;

  // Update app.json
  try {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    const appJsonContent = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

    appJsonContent.expo.extra.apiUrl = apiUrl;

    fs.writeFileSync(appJsonPath, JSON.stringify(appJsonContent, null, 2));
    console.log(`✅ Updated app.json with API URL: ${apiUrl}`);
  } catch (error) {
    console.error('❌ Error updating app.json:', error.message);
  }

  // Update eas.json
  try {
    const easJsonPath = path.join(process.cwd(), 'eas.json');
    const easJsonContent = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

    // Update all build profiles that have EXPO_PUBLIC_API_URL
    if (easJsonContent.build.development?.env?.EXPO_PUBLIC_API_URL) {
      easJsonContent.build.development.env.EXPO_PUBLIC_API_URL = apiUrl;
    }
    if (easJsonContent.build.production?.env?.EXPO_PUBLIC_API_URL) {
      easJsonContent.build.production.env.EXPO_PUBLIC_API_URL = apiUrl;
    }

    fs.writeFileSync(easJsonPath, JSON.stringify(easJsonContent, null, 2));
    console.log(`✅ Updated eas.json with API URL: ${apiUrl}`);
  } catch (error) {
    console.error('❌ Error updating eas.json:', error.message);
  }
}

try {
  const ipAddress = getLocalIPAddress();
  console.log(`🌐 Detected IP address: ${ipAddress}`);
  updateConfigFiles(ipAddress);
  console.log('🎉 All config files updated successfully!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
