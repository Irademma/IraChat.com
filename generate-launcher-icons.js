#!/usr/bin/env node
/**
 * Generate Android launcher icons from IraChat logo
 */

const fs = require('fs');
const path = require('path');

// Simple manual approach - copy the logo to all launcher locations
function copyLogoToLauncherLocations() {
    const logoPath = 'assets/images/LOGO.png';
    
    if (!fs.existsSync(logoPath)) {
        console.error(`❌ Logo file not found at ${logoPath}`);
        return false;
    }
    
    console.log('🚀 Copying IraChat logo to all launcher locations...');
    
    // Define all launcher icon locations
    const launcherLocations = [
        'android/app/src/main/res/mipmap-mdpi/ic_launcher.png',
        'android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png',
        'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png',
        'android/app/src/main/res/mipmap-hdpi/ic_launcher.png',
        'android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png',
        'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png',
        'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png',
        'android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png',
        'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png',
        'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png',
        'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png',
        'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png',
        'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
        'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png',
        'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png'
    ];
    
    try {
        // Read the logo file
        const logoBuffer = fs.readFileSync(logoPath);
        
        // Copy to all launcher locations
        launcherLocations.forEach(location => {
            // Create directory if it doesn't exist
            const dir = path.dirname(location);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Copy the logo
            fs.writeFileSync(location, logoBuffer);
            console.log(`✅ Updated: ${location}`);
        });
        
        console.log('\n🎉 All launcher icons updated with IraChat logo!');
        return true;
        
    } catch (error) {
        console.error(`❌ Error copying launcher icons: ${error.message}`);
        return false;
    }
}

function updateLauncherXML() {
    console.log('📝 Updating adaptive icon XML files...');
    
    const icLauncherXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
    
    const icLauncherRoundXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
    
    const anydpiPath = 'android/app/src/main/res/mipmap-anydpi-v26';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(anydpiPath)) {
        fs.mkdirSync(anydpiPath, { recursive: true });
    }
    
    // Write XML files
    fs.writeFileSync(path.join(anydpiPath, 'ic_launcher.xml'), icLauncherXml);
    fs.writeFileSync(path.join(anydpiPath, 'ic_launcher_round.xml'), icLauncherRoundXml);
    
    console.log('✅ Updated adaptive icon XML files');
}

function updateColors() {
    console.log('🎨 Updating colors.xml with IraChat brand colors...');
    
    const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#87CEEB</color>
    <color name="splashscreen_background">#667eea</color>
</resources>`;
    
    const colorsPath = 'android/app/src/main/res/values/colors.xml';
    
    // Create directory if it doesn't exist
    const dir = path.dirname(colorsPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(colorsPath, colorsXml);
    console.log('✅ Updated colors.xml with IraChat brand colors');
}

function removeOldWebpFiles() {
    console.log('🧹 Removing old .webp launcher files...');
    
    const webpFiles = [
        'android/app/src/main/res/mipmap-mdpi/ic_launcher.webp',
        'android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.webp',
        'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.webp',
        'android/app/src/main/res/mipmap-hdpi/ic_launcher.webp',
        'android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.webp',
        'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.webp',
        'android/app/src/main/res/mipmap-xhdpi/ic_launcher.webp',
        'android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.webp',
        'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.webp',
        'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.webp',
        'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.webp',
        'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.webp',
        'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp',
        'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.webp',
        'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.webp'
    ];
    
    webpFiles.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log(`🗑️ Removed: ${file}`);
        }
    });
}

// Main execution
console.log('🚀 Updating IraChat launcher icons...\n');

if (copyLogoToLauncherLocations()) {
    removeOldWebpFiles();
    updateLauncherXML();
    updateColors();
    
    console.log('\n🎉 All launcher icons updated successfully!');
    console.log('📱 Rebuild the app to see the new IraChat logo in the launcher.');
    console.log('💡 Run: npx expo run:android --device');
} else {
    console.log('❌ Failed to update launcher icons');
    process.exit(1);
}
