#!/usr/bin/env python3
"""
Create a splash screen with sky blue background and centered logo
"""

from PIL import Image, ImageDraw
import os

def create_splash_screen():
    # Sky blue color (matching your app.json #667eea)
    sky_blue = (102, 126, 234)  # RGB equivalent of #667eea
    
    # Standard splash screen dimensions (you can adjust these)
    width = 1080
    height = 1920
    
    # Create a new image with sky blue background
    splash = Image.new('RGB', (width, height), sky_blue)
    
    # Load your logo
    logo_path = 'assets/images/LOGO.png'
    if not os.path.exists(logo_path):
        print(f"Error: Logo file not found at {logo_path}")
        return
    
    logo = Image.open(logo_path)
    
    # Convert logo to RGBA if it isn't already (to handle transparency)
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')
    
    # Calculate logo size (make it about 1/4 of the screen width)
    logo_size = min(width // 4, height // 6)
    
    # Resize logo while maintaining aspect ratio
    logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Calculate position to center the logo
    logo_x = (width - logo.width) // 2
    logo_y = (height - logo.height) // 2
    
    # Paste the logo onto the splash screen
    splash.paste(logo, (logo_x, logo_y), logo)
    
    # Save the splash screen
    output_path = 'splash_screen_with_background.png'
    splash.save(output_path, 'PNG')
    print(f"Splash screen created: {output_path}")
    
    return output_path

if __name__ == "__main__":
    create_splash_screen()
