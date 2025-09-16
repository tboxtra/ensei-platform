# 🎨 Google Drive Icons Download Guide - Phase 2

## 📁 **Your Google Drive Folder**
**Link:** [https://drive.google.com/drive/folders/1pkoNozVoPpuu9dyQODsr-D4UMytiPr0L?usp=sharing](https://drive.google.com/drive/folders/1pkoNozVoPpuu9dyQODsr-D4UMytiPr0L?usp=sharing)

## 🎯 **Download Instructions**

### **Step 1: Access Your Google Drive Folder**
1. Click the link above to open your Google Drive folder
2. You should see various SVG files and the Ensei logo

### **Step 2: Download Required Files**

#### **✅ Brand Icons (Priority 1)**
Download these files and place them in `/public/icons/brand/`:

| Google Drive File | Target Location | Notes |
|------------------|-----------------|-------|
| `Ensei logo` (any format) | `/public/icons/brand/ensei-logo.svg` | **Rename to ensei-logo.svg** |
| Any other brand assets | `/public/icons/brand/` | Keep original names |

#### **✅ Platform Icons (Priority 2)**
Download these files and place them in `/public/icons/platforms/`:

| Google Drive File | Target Location | Notes |
|------------------|-----------------|-------|
| `Twitter logo.svg` | `/public/icons/platforms/twitter.svg` | **Rename to twitter.svg** |
| `Instagram logo.svg` | `/public/icons/platforms/instagram.svg` | **Rename to instagram.svg** |
| `tiktok_for_business_japan_icon.jpeg.svg` | `/public/icons/platforms/tiktok.svg` | **Rename to tiktok.svg** |
| `Snapchat.svg` | `/public/icons/platforms/snapchat.svg` | **Rename to snapchat.svg** |
| `whatsapp_icon.png.svg` | `/public/icons/platforms/whatsapp.svg` | **Rename to whatsapp.svg** |

#### **✅ Navigation Icons (Priority 3)**
Download these files and place them in `/public/icons/navigation/`:

| Google Drive File | Target Location | Notes |
|------------------|-----------------|-------|
| `Dashboard icon.svg` | `/public/icons/navigation/dashboard.svg` | **Rename to dashboard.svg** |
| `Discover and earn.svg` | `/public/icons/navigation/discover.svg` | **Rename to discover.svg** |
| `Missions.svg` | `/public/icons/navigation/missions.svg` | **Rename to missions.svg** |
| `Review.svg` | `/public/icons/navigation/review.svg` | **Rename to review.svg** |
| `Claims.svg` | `/public/icons/navigation/claims.svg` | **Rename to claims.svg** |
| `Wallet.svg` | `/public/icons/navigation/wallet.svg` | **Rename to wallet.svg** |

#### **✅ Additional Icons (Priority 4)**
Look for any other SVG files in your Google Drive and organize them:

| Category | Directory | Notes |
|----------|-----------|-------|
| Task Icons | `/public/icons/tasks/` | Like, retweet, comment, etc. |
| Status Icons | `/public/icons/status/` | Approved, pending, rejected |
| Action Icons | `/public/icons/actions/` | Engage, content, ambassador |

## 🛠️ **Download Process**

### **Method 1: Individual Download (Recommended)**
1. **Right-click** on each file in Google Drive
2. Select **"Download"**
3. **Rename** the file according to the table above
4. **Move** to the correct directory in your project

### **Method 2: Bulk Download**
1. **Select multiple files** in Google Drive (Ctrl/Cmd + Click)
2. **Right-click** and select **"Download"**
3. Google Drive will create a ZIP file
4. **Extract** the ZIP and organize files according to the table

## 📂 **Directory Structure After Download**

```
public/icons/
├── brand/
│   ├── ensei-logo.svg          # Your main logo
│   └── [other brand assets]
├── platforms/
│   ├── twitter.svg             # From "Twitter logo.svg"
│   ├── instagram.svg           # From "Instagram logo.svg"
│   ├── tiktok.svg              # From "tiktok_for_business_japan_icon.jpeg.svg"
│   ├── snapchat.svg            # From "Snapchat.svg"
│   ├── whatsapp.svg            # From "whatsapp_icon.png.svg"
│   └── [other platform icons]
├── navigation/
│   ├── dashboard.svg           # From "Dashboard icon.svg"
│   ├── discover.svg            # From "Discover and earn.svg"
│   ├── missions.svg            # From "Missions.svg"
│   ├── review.svg              # From "Review.svg"
│   ├── claims.svg              # From "Claims.svg"
│   ├── wallet.svg              # From "Wallet.svg"
│   └── [other navigation icons]
├── tasks/
│   └── [task type icons]
├── status/
│   └── [status icons]
└── actions/
    └── [action icons]
```

## ⚡ **Quick Setup Script**

After downloading, run this command to verify your icons:

```bash
cd "/Users/mac/Desktop/Ensei Alexis/ensei-platform/apps/web"
node scripts/verify-icons.js
```

## 🔍 **What to Look For**

### **In Your Google Drive:**
- ✅ **Ensei logo** (any format - we'll convert to SVG)
- ✅ **Platform logos** (Twitter, Instagram, TikTok, etc.)
- ✅ **Navigation icons** (Dashboard, Missions, Wallet, etc.)
- ✅ **Any other SVG files** that might be useful

### **File Naming Issues:**
- ❌ Spaces in filenames (e.g., "Dashboard icon.svg")
- ❌ Special characters (e.g., "tiktok_for_business_japan_icon.jpeg.svg")
- ❌ Mixed formats (some might be PNG, JPG, etc.)

### **Solutions:**
- ✅ **Rename** files to simple, lowercase names
- ✅ **Convert** non-SVG files to SVG format
- ✅ **Organize** into proper directories

## 🎯 **Success Criteria**

After Phase 2, you should have:
- ✅ **Ensei logo** properly placed and named
- ✅ **Platform icons** for all major social media platforms
- ✅ **Navigation icons** for all main app sections
- ✅ **Organized directory structure**
- ✅ **Optimized SVG files**

## 🚀 **Next Steps**

1. **Download** all available icons from Google Drive
2. **Rename** files according to the table above
3. **Organize** into proper directories
4. **Test** the system with real icons
5. **Optimize** any remaining placeholder icons

---

**Need Help?** If you encounter any issues:
- Check the file names in your Google Drive
- Verify the download locations
- Run the verification script
- The system will automatically fallback to library icons for missing files
