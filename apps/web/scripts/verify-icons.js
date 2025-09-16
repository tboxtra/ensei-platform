/**
 * Icon Verification Script
 * Verifies that downloaded icons are properly placed and named
 */

const fs = require('fs');
const path = require('path');

// Expected icon structure
const expectedIcons = {
  brand: [
    'ensei-logo.svg'
  ],
  platforms: [
    'twitter.svg',
    'instagram.svg',
    'tiktok.svg',
    'facebook.svg',
    'whatsapp.svg',
    'snapchat.svg',
    'telegram.svg',
    'youtube.svg',
    'linkedin.svg',
    'discord.svg'
  ],
  navigation: [
    'dashboard.svg',
    'discover.svg',
    'missions.svg',
    'review.svg',
    'claims.svg',
    'wallet.svg',
    'profile.svg',
    'settings.svg',
    'logout.svg'
  ],
  tasks: [
    'like.svg',
    'retweet.svg',
    'comment.svg',
    'quote.svg',
    'follow.svg',
    'meme.svg',
    'thread.svg',
    'article.svg',
    'videoreview.svg',
    'pfp.svg',
    'name-bio-keywords.svg',
    'pinned-tweet.svg',
    'poll.svg',
    'spaces.svg',
    'community-raid.svg'
  ],
  status: [
    'approved.svg',
    'pending.svg',
    'rejected.svg',
    'success.svg',
    'error.svg',
    'warning.svg'
  ],
  actions: [
    'engage.svg',
    'content.svg',
    'ambassador.svg',
    'custom.svg'
  ]
};

function verifyIcons() {
  const baseDir = path.join(__dirname, '..', 'public', 'icons');
  const results = {
    found: [],
    missing: [],
    extra: [],
    total: 0,
    foundCount: 0
  };

  console.log('🔍 Verifying Icon System...\n');

  // Check each category
  Object.entries(expectedIcons).forEach(([category, icons]) => {
    const categoryDir = path.join(baseDir, category);
    console.log(`📁 Checking ${category}/ directory:`);

    if (!fs.existsSync(categoryDir)) {
      console.log(`   ❌ Directory does not exist: ${categoryDir}`);
      icons.forEach(icon => {
        results.missing.push(`${category}/${icon}`);
        results.total++;
      });
      return;
    }

    const existingFiles = fs.readdirSync(categoryDir);
    
    icons.forEach(icon => {
      results.total++;
      if (existingFiles.includes(icon)) {
        results.found.push(`${category}/${icon}`);
        results.foundCount++;
        console.log(`   ✅ ${icon}`);
      } else {
        results.missing.push(`${category}/${icon}`);
        console.log(`   ❌ ${icon} (missing)`);
      }
    });

    // Check for extra files
    existingFiles.forEach(file => {
      if (!icons.includes(file) && file.endsWith('.svg')) {
        results.extra.push(`${category}/${file}`);
        console.log(`   📄 ${file} (extra file)`);
      }
    });

    console.log('');
  });

  // Summary
  console.log('📊 Verification Summary:');
  console.log(`   ✅ Found: ${results.foundCount}/${results.total} icons`);
  console.log(`   ❌ Missing: ${results.missing.length} icons`);
  console.log(`   📄 Extra files: ${results.extra.length} files`);

  if (results.found.length > 0) {
    console.log('\n✅ Found Icons:');
    results.found.forEach(icon => console.log(`   - ${icon}`));
  }

  if (results.missing.length > 0) {
    console.log('\n❌ Missing Icons:');
    results.missing.forEach(icon => console.log(`   - ${icon}`));
  }

  if (results.extra.length > 0) {
    console.log('\n📄 Extra Files:');
    results.extra.forEach(icon => console.log(`   - ${icon}`));
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (results.foundCount === 0) {
    console.log('   🚨 No custom icons found! The system will use library icons and emojis.');
    console.log('   📥 Download icons from Google Drive using the guide.');
  } else if (results.foundCount < results.total * 0.5) {
    console.log('   ⚠️  Less than 50% of icons found. Consider downloading more from Google Drive.');
  } else if (results.foundCount < results.total) {
    console.log('   ✅ Good progress! Download remaining icons for complete coverage.');
  } else {
    console.log('   🎉 Perfect! All expected icons are present.');
  }

  // System status
  console.log('\n🎯 System Status:');
  if (results.foundCount > 0) {
    console.log('   ✅ Custom icons will be used where available');
  }
  console.log('   ✅ Library icons (Heroicons/Lucide) will be used as fallbacks');
  console.log('   ✅ Emoji fallbacks will be used for missing icons');
  console.log('   ✅ System is fully functional regardless of missing icons');

  return results;
}

// Run verification
if (require.main === module) {
  verifyIcons();
}

module.exports = { verifyIcons };
