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

  // Update config/api.js (or wherever you put your API config)
  try {
    const apiConfigPath = path.join(process.cwd(), 'config', 'api.js');

    // Check if config/api.js exists, if not try other common locations
    let configPath = apiConfigPath;
    if (!fs.existsSync(apiConfigPath)) {
      const alternativePaths = [
        path.join(process.cwd(), 'constants', 'config.js'),
        path.join(process.cwd(), 'src', 'config', 'api.js'),
        path.join(process.cwd(), 'utils', 'api.js'),
      ];

      configPath = alternativePaths.find((p) => fs.existsSync(p));

      if (!configPath) {
        console.log(
          '⚠️  Could not find API config file. Please create config/api.js'
        );
        return;
      }
    }

    let configContent = fs.readFileSync(configPath, 'utf8');

    // Replace the hardcoded development URL
    const developmentUrlRegex =
      /(if\s*\(\s*buildType\s*===\s*['"]development['"]\s*\)\s*{\s*[^}]*return\s+['"])http:\/\/[^'"]+(["'])/;

    if (developmentUrlRegex.test(configContent)) {
      configContent = configContent.replace(
        developmentUrlRegex,
        `$1${apiUrl}$2`
      );
      fs.writeFileSync(configPath, configContent);
      console.log(
        `✅ Updated ${path.basename(configPath)} with API URL: ${apiUrl}`
      );
    } else {
      console.log(
        '⚠️  Could not find development API URL pattern in config file to update'
      );
      console.log(
        '💡 Make sure your config file has the expected structure with buildType === "development" check'
      );
    }
  } catch (error) {
    console.error('❌ Error updating API config file:', error.message);
  }

  // Note: We no longer update eas.json for development builds since the API URL is handled in JavaScript
  console.log(
    'ℹ️  eas.json not updated - development API URL is now handled in JavaScript config'
  );
  console.log(
    'ℹ️  Preview/production builds still use eas.json environment variables'
  );
}

try {
  const ipAddress = getLocalIPAddress();
  console.log(`🌐 Detected IP address: ${ipAddress}`);
  updateConfigFiles(ipAddress);
  console.log('🎉 Config files updated successfully!');
  console.log(
    '📱 Your development build will pick up the new IP on next JS update'
  );
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
