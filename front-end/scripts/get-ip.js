import os from 'os';
import fs from 'fs';
import path from 'path';

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
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
  const configPath = path.join(process.cwd(), 'config', 'api.js');

  try {
    let configContent = fs.readFileSync(configPath, 'utf8');

    // Replace hardcoded IP addresses in URL strings
    const urlPattern = /http:\/\/[\d.]+:5000\/api/g;

    if (urlPattern.test(configContent)) {
      configContent = configContent.replace(urlPattern, apiUrl);
      fs.writeFileSync(configPath, configContent);
      console.log(`✅ Updated config/api.js with API URL: ${apiUrl}`);
    } else {
      console.log('⚠️  No matching URL pattern found to update');
    }
  } catch (error) {
    console.error('❌ Error updating API config file:', error.message);
  }
}

try {
  const ipAddress = getLocalIPAddress();
  console.log(`🌐 Detected IP address: ${ipAddress}`);
  updateConfigFiles(ipAddress);
  console.log('🎉 Config updated successfully!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
