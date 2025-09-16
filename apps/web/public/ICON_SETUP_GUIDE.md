# 🎨 Icon Setup Guide

## 📁 Google Drive Icons to Download

Please download these SVG files from your [Google Drive folder](https://drive.google.com/drive/folders/1pkoNozVoPpuu9dyQODsr-D4UMytiPr0L?usp=sharing) and place them in `/public/icons/`:

### ✅ Required Icons (Available in your Drive):
- `Claims.svg` → `/public/icons/Claims.svg`
- `Dashboard icon.svg` → `/public/icons/Dashboard_icon.svg`
- `Demo.svg` → `/public/icons/Demo.svg`
- `Discover and earn.svg` → `/public/icons/Discover_and_earn.svg`
- `Instagram logo.svg` → `/public/icons/Instagram_logo.svg`
- `Missions.svg` → `/public/icons/Missions.svg`
- `Review.svg` → `/public/icons/Review.svg`
- `Snapchat.svg` → `/public/icons/Snapchat.svg`
- `tiktok_for_business_japan_icon.jpeg.svg` → `/public/icons/tiktok_for_business_japan_icon.jpeg.svg`
- `Twitter logo.svg` → `/public/icons/Twitter_logo.svg`
- `Wallet.svg` → `/public/icons/Wallet.svg`
- `whatsapp_icon.png.svg` → `/public/icons/whatsapp_icon.png.svg`

### 🔄 Additional Icons Needed (Create or find):
- `facebook.svg` - Facebook logo
- `telegram.svg` - Telegram logo
- `youtube.svg` - YouTube logo
- `linkedin.svg` - LinkedIn logo
- `discord.svg` - Discord logo

### 🎯 Task Type Icons Needed:
- `like.svg` - Like/thumb up icon
- `retweet.svg` - Retweet/share icon
- `comment.svg` - Comment/chat icon
- `quote.svg` - Quote/quote tweet icon
- `follow.svg` - Follow/user icon
- `meme.svg` - Meme/funny icon
- `thread.svg` - Thread icon
- `article.svg` - Article/writing icon
- `videoreview.svg` - Video review icon
- `pfp.svg` - Profile picture icon
- `name_bio_keywords.svg` - Bio/keywords icon
- `pinned_tweet.svg` - Pin icon
- `poll.svg` - Poll icon
- `spaces.svg` - Spaces/audio icon
- `community_raid.svg` - Community/raid icon

### ⚙️ Action Icons Needed:
- `engage.svg` - Engagement/target icon
- `content.svg` - Content creation icon
- `ambassador.svg` - Ambassador/crown icon
- `custom.svg` - Custom/lightning icon

### 📊 Status Icons Needed:
- `approved.svg` - Checkmark/success icon
- `pending.svg` - Clock/waiting icon
- `rejected.svg` - X/error icon
- `success.svg` - Success checkmark
- `error.svg` - Error X
- `warning.svg` - Warning triangle

### 👤 General Icons Needed:
- `profile.svg` - User profile icon
- `settings.svg` - Settings/gear icon
- `logout.svg` - Logout/door icon
- `email.svg` - Email icon
- `globe.svg` - Globe/world icon
- `crown.svg` - Crown icon
- `target.svg` - Target icon
- `write.svg` - Writing/pencil icon
- `money.svg` - Money/dollar icon
- `users.svg` - Users/people icon
- `gear.svg` - Gear/settings icon
- `check.svg` - Checkmark
- `cross.svg` - X mark
- `star.svg` - Star icon

## 🚀 Quick Setup Steps:

1. **Download from Google Drive**: Go to your [Google Drive folder](https://drive.google.com/drive/folders/1pkoNozVoPpuu9dyQODsr-D4UMytiPr0L?usp=sharing) and download all the SVG files listed above.

2. **Place in Icons Directory**: Put each downloaded file in `/public/icons/` with the exact filename shown above.

3. **Create Missing Icons**: For the missing icons, you can:
   - Use free icon libraries like [Heroicons](https://heroicons.com/), [Lucide](https://lucide.dev/), or [Feather Icons](https://feathericons.com/)
   - Create simple SVG icons
   - Use the emoji fallbacks temporarily (already implemented)

4. **Test the Icons**: Once you've added the real SVG files, the Icon component will automatically use them instead of the emoji fallbacks.

## 🎨 Icon Component Usage:

The new Icon system is already integrated into your components:

```tsx
import { Icon, PlatformIcon, TaskIcon, NavigationIcon } from '@/components/ui/Icon';

// Basic usage
<Icon name="twitter" size={24} />

// Platform icons
<PlatformIcon platform="twitter" size={20} />

// Task icons
<TaskIcon taskType="like" size={16} />

// Navigation icons
<NavigationIcon page="dashboard" size={20} />
```

## 🔄 Current Status:

✅ **Completed:**
- Icon component system created
- Navigation layout updated
- Task submission modal updated
- Compact mission card updated
- Claim page updated
- Emoji fallbacks implemented

⏳ **Next Steps:**
- Download actual SVG files from Google Drive
- Replace placeholder SVGs with real icons
- Test all components with new icons

The system is designed to gracefully fall back to emojis if SVG files are missing, so your app will continue to work while you add the real icons!
