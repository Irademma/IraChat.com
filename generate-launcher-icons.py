#!/usr/bin/env python3
"""
Generate Android launcher icons from IraChat logo
"""

import os
import sys
from PIL import Image, ImageDraw

def create_launcher_icons():
    """Generate all required launcher icon sizes from the IraChat logo"""
    
    # Source logo path
    logo_path = "assets/images/LOGO.png"
    
    if not os.path.exists(logo_path):
        print(f"Error: Logo file not found at {logo_path}")
        return False
    
    try:
        # Load the source logo
        logo = Image.open(logo_path)
        print(f"Loaded logo: {logo.size}")
        
        # Convert to RGBA if not already
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        # Define all required icon sizes for Android
        icon_sizes = {
            'mipmap-mdpi': 48,
            'mipmap-hdpi': 72,
            'mipmap-xhdpi': 96,
            'mipmap-xxhdpi': 144,
            'mipmap-xxxhdpi': 192
        }
        
        # Create base directories
        base_res_path = "android/app/src/main/res"
        
        for density, size in icon_sizes.items():
            density_path = os.path.join(base_res_path, density)
            os.makedirs(density_path, exist_ok=True)
            
            # Resize logo for this density
            resized_logo = logo.resize((size, size), Image.Resampling.LANCZOS)
            
            # Create regular launcher icon
            ic_launcher_path = os.path.join(density_path, "ic_launcher.png")
            resized_logo.save(ic_launcher_path, "PNG", optimize=True)
            print(f"Created: {ic_launcher_path}")
            
            # Create foreground icon (same as regular for now)
            ic_launcher_foreground_path = os.path.join(density_path, "ic_launcher_foreground.png")
            resized_logo.save(ic_launcher_foreground_path, "PNG", optimize=True)
            print(f"Created: {ic_launcher_foreground_path}")
            
            # Create round launcher icon
            ic_launcher_round_path = os.path.join(density_path, "ic_launcher_round.png")
            
            # Create circular mask for round icon
            round_logo = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            mask = Image.new('L', (size, size), 0)
            draw = ImageDraw.Draw(mask)
            draw.ellipse((0, 0, size, size), fill=255)
            
            # Apply circular mask
            round_logo.paste(resized_logo, (0, 0))
            round_logo.putalpha(mask)
            
            round_logo.save(ic_launcher_round_path, "PNG", optimize=True)
            print(f"Created: {ic_launcher_round_path}")
        
        print("\n✅ All launcher icons generated successfully!")
        return True
        
    except Exception as e:
        print(f"Error generating launcher icons: {e}")
        return False

def update_launcher_xml():
    """Update the adaptive icon XML files"""
    
    # Update ic_launcher.xml
    ic_launcher_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>"""
    
    # Update ic_launcher_round.xml
    ic_launcher_round_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>"""
    
    # Write XML files
    anydpi_path = "android/app/src/main/res/mipmap-anydpi-v26"
    os.makedirs(anydpi_path, exist_ok=True)
    
    with open(os.path.join(anydpi_path, "ic_launcher.xml"), 'w') as f:
        f.write(ic_launcher_xml)
    
    with open(os.path.join(anydpi_path, "ic_launcher_round.xml"), 'w') as f:
        f.write(ic_launcher_round_xml)
    
    print("✅ Updated adaptive icon XML files")

def update_colors():
    """Update colors.xml with IraChat brand color"""
    
    colors_xml = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#87CEEB</color>
    <color name="splashscreen_background">#667eea</color>
</resources>"""
    
    colors_path = "android/app/src/main/res/values/colors.xml"
    with open(colors_path, 'w') as f:
        f.write(colors_xml)
    
    print("✅ Updated colors.xml with IraChat brand colors")

if __name__ == "__main__":
    print("🚀 Generating IraChat launcher icons...")
    
    if create_launcher_icons():
        update_launcher_xml()
        update_colors()
        print("\n🎉 All launcher icons updated successfully!")
        print("📱 The new IraChat logo will appear after rebuilding the app.")
    else:
        print("❌ Failed to generate launcher icons")
        sys.exit(1)
