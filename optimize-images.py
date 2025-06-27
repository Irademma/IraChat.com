#!/usr/bin/env python3
"""
Image Optimization Script for IraChat
Compresses oversized images to reduce app bundle size
"""

from PIL import Image, ImageOps
import os
import sys

def optimize_image(input_path, output_path, max_size_kb=500, quality=85):
    """
    Optimize an image to reduce file size while maintaining quality
    """
    try:
        # Open and process image
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (removes alpha channel for JPEG)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background for transparency
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Auto-orient based on EXIF data
            img = ImageOps.exif_transpose(img)
            
            # Resize if too large (max 1024x1024 for mobile)
            max_dimension = 1024
            if max(img.size) > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                print(f"  📏 Resized to {img.size}")
            
            # Save with optimization
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            
            # Check file size
            file_size_kb = os.path.getsize(output_path) / 1024
            
            if file_size_kb > max_size_kb and quality > 60:
                # Reduce quality if still too large
                new_quality = max(60, quality - 10)
                img.save(output_path, 'JPEG', quality=new_quality, optimize=True)
                file_size_kb = os.path.getsize(output_path) / 1024
                print(f"  🔧 Reduced quality to {new_quality}")
            
            return file_size_kb
            
    except Exception as e:
        print(f"  ❌ Error optimizing {input_path}: {e}")
        return None

def optimize_irachat_images():
    """
    Optimize specific oversized images in IraChat
    """
    print("🎨 IraChat Image Optimization")
    print("=" * 40)
    
    # Images to optimize (oversized ones)
    images_to_optimize = [
        {
            'name': 'BACKGROUND.png',
            'max_size_kb': 500,
            'quality': 85,
            'description': 'Chat wallpaper background'
        },
        {
            'name': 'LOGO.png', 
            'max_size_kb': 200,
            'quality': 90,
            'description': 'App logo and icon'
        },
        {
            'name': 'splash.png',
            'max_size_kb': 200, 
            'quality': 90,
            'description': 'Splash screen image'
        }
    ]
    
    assets_dir = 'assets/images'
    backup_dir = 'assets/images/backup'
    
    # Create backup directory
    os.makedirs(backup_dir, exist_ok=True)
    
    total_original_size = 0
    total_optimized_size = 0
    
    for img_config in images_to_optimize:
        img_name = img_config['name']
        input_path = os.path.join(assets_dir, img_name)
        backup_path = os.path.join(backup_dir, img_name)
        
        if not os.path.exists(input_path):
            print(f"⚠️  {img_name} not found, skipping...")
            continue
            
        # Get original size
        original_size_kb = os.path.getsize(input_path) / 1024
        total_original_size += original_size_kb
        
        print(f"\n🖼️  Optimizing {img_name}...")
        print(f"  📊 Original: {original_size_kb:.1f}KB")
        print(f"  🎯 Target: <{img_config['max_size_kb']}KB")
        print(f"  📝 Purpose: {img_config['description']}")
        
        # Create backup
        import shutil
        shutil.copy2(input_path, backup_path)
        print(f"  💾 Backup created: {backup_path}")
        
        # Optimize image
        optimized_size_kb = optimize_image(
            input_path, 
            input_path,  # Overwrite original
            img_config['max_size_kb'],
            img_config['quality']
        )
        
        if optimized_size_kb:
            total_optimized_size += optimized_size_kb
            savings = original_size_kb - optimized_size_kb
            savings_percent = (savings / original_size_kb) * 100
            
            print(f"  ✅ Optimized: {optimized_size_kb:.1f}KB")
            print(f"  💾 Saved: {savings:.1f}KB ({savings_percent:.1f}%)")
            
            if optimized_size_kb <= img_config['max_size_kb']:
                print(f"  🎯 Target achieved!")
            else:
                print(f"  ⚠️  Still above target, but significantly reduced")
        else:
            print(f"  ❌ Optimization failed")
    
    # Summary
    total_savings = total_original_size - total_optimized_size
    total_savings_percent = (total_savings / total_original_size) * 100 if total_original_size > 0 else 0
    
    print(f"\n🎉 OPTIMIZATION COMPLETE!")
    print("=" * 40)
    print(f"📊 Original total: {total_original_size:.1f}KB")
    print(f"📊 Optimized total: {total_optimized_size:.1f}KB") 
    print(f"💾 Total saved: {total_savings:.1f}KB ({total_savings_percent:.1f}%)")
    print(f"📁 Backups stored in: {backup_dir}")
    
    print(f"\n🚀 Next steps:")
    print("1. Test app to ensure images still look good")
    print("2. If issues, restore from backup folder")
    print("3. Run: npx expo build --clear")
    print("4. Check new app size")

if __name__ == "__main__":
    # Check if PIL is available
    try:
        from PIL import Image, ImageOps
        optimize_irachat_images()
    except ImportError:
        print("❌ PIL (Pillow) not installed")
        print("Install with: pip install Pillow")
        print("Then run: python optimize-images.py")
