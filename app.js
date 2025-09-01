/* =========================
   Ensei UGT – Web (app.js)
   ========================= */

/* ---------- State ---------- */
let token = null;

let selectedPlatform = 'twitter';     // platform chip
let selectedType = 'engage';          // 'engage' | 'content' | 'ambassador'
let selectedModel = 'fixed';          // 'fixed' | 'degen'
let selectedTasks = new Set();        // task chips under the chosen type
let premium = 0;                      // 0 | 1 (All vs Premium)

let lockPerUser = false;              // input lock for auto calc

/* ---------- DOM helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const headers = () =>
  token
    ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

/* ---------- Pricing config ---------- */
/** Fees (fee-inclusive UI) */
const PLATFORM_FEE_RATE = 1.00;  // +100%
const PREMIUM_RATE = 4.00; // +400% when Premium is selected (4X multiplier)

/** Currency */
let HONOR_TO_USD = 1 / 450; // server wallet can override
let TON_USD_RATE = 6.00;    // (kept for later use if needed)

/** Degen Mission Specification */
const DEGEN_DURATIONS = [
  { hours: 1, cost: 15, maxWinners: 1, label: '1 hr' },
  { hours: 3, cost: 30, maxWinners: 2, label: '3 hrs' },
  { hours: 6, cost: 80, maxWinners: 3, label: '6 hrs' },
  { hours: 8, cost: 150, maxWinners: 3, label: '8 hrs' },
  { hours: 12, cost: 180, maxWinners: 5, label: '12 hrs' },
  { hours: 18, cost: 300, maxWinners: 5, label: '18 hrs' },
  { hours: 24, cost: 400, maxWinners: 5, label: '24 hrs' },
  { hours: 36, cost: 500, maxWinners: 10, label: '36 hrs' },
  { hours: 48, cost: 600, maxWinners: 10, label: '48 hrs' },
  { hours: 72, cost: 800, maxWinners: 10, label: '3 days' },
  { hours: 96, cost: 1000, maxWinners: 10, label: '4 days' },
  { hours: 168, cost: 1500, maxWinners: 10, label: '7 days' },
  { hours: 240, cost: 2000, maxWinners: 10, label: '10 days' }
];

/** Audience size presets (two-way binding) */
const AUDIENCE_PRESETS = [
  { name: 'Starter', hours: 1 },
  { name: 'Small', hours: 12 },
  { name: 'Medium', hours: 36 },
  { name: 'Large', hours: 96 },
  { name: 'Complete', hours: 240 }
];

/** Base honors (pre-fee) per task, per platform and mission type */
const BASE = {
  twitter: {
    engage: {
      like: 20, retweet: 300, comment: 200, quote: 700
    },
    content: {
      meme: 700, thread: 1800, article: 2400, videoreview: 3600
    },
    ambassador: {
      pfp: 400, name_bio_keywords: 600, pinned_tweet: 800, poll: 900,
      spaces: 1800, community_raid: 1200
    }
  },
  instagram: {
    engage: {
      like: 30, comment: 220, follow: 250, story_repost: 350
    },
    content: {
      feed_post: 700, reel: 3600, carousel: 1600, meme: 700
    },
    ambassador: {
      pfp: 400, hashtag_in_bio: 600, story_highlight: 800
    }
  },
  tiktok: {
    engage: {
      like: 25, comment: 200, repost_duet: 350, follow: 250
    },
    content: {
      skit: 3600, challenge: 3600, product_review: 2400, status_style: 700
    },
    ambassador: {
      pfp: 400, hashtag_in_bio: 600, pinned_branded_video: 1200
    }
  },
  facebook: {
    engage: {
      like: 20, comment: 180, follow: 200, share_post: 300
    },
    content: {
      group_post: 700, video: 2400, meme_flyer: 700
    },
    ambassador: {
      pfp: 400, bio_keyword: 600, pinned_post: 800
    }
  },
  whatsapp: {
    engage: {
      status_50_views: 600
    },
    content: {
      flyer_clip_status: 900, broadcast_message: 1200
    },
    ambassador: {
      pfp: 400, keyword_in_about: 600
    }
  },
  snapchat: {
    engage: {
      story_100_views: 800, snap_repost: 400
    },
    content: {
      meme_flyer_snap: 700, branded_snap_video: 2400
    },
    ambassador: {
      pfp_avatar: 400, hashtag_in_profile: 600, branded_lens: 1400
    }
  },
  telegram: {
    engage: {
      join_channel: 250, react_to_post: 150, reply_in_group: 220, share_invite: 300
    },
    content: {
      channel_post: 700, short_video_in_channel: 2400, guide_thread: 1800
    },
    ambassador: {
      pfp: 400, mention_in_bio: 600, pin_invite_link: 800
    }
  }
};

/* ---------- UI builders ---------- */
function buildPlatformChips() {
  const box = $('#platforms');
  if (!box) return;
  // already present in HTML; just ensure one is active
  if (!box.querySelector('.platform-chip.active')) {
    const first = box.querySelector('.platform-chip');
    if (first) first.classList.add('active');
  }
}

function buildMissionTypeChips() {
  const box = $('#types');
  if (!box) return;
  box.innerHTML = '';
  const types = [
    { key: 'engage', label: 'Engage' },
    { key: 'content', label: 'Content Creation' },
    { key: 'ambassador', label: 'Ambassador' }
  ];
  types.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'chip' + (i === 0 ? ' active' : '');
    div.dataset.mtype = t.key;
    div.textContent = t.label;
    box.appendChild(div);
  });
  selectedType = 'engage';
}

function buildModelChips() {
  const box = $('#model-type');
  if (!box) return;
  // already in HTML with two chips; normalize selection
  $$('#model-type .chip').forEach(c => c.classList.remove('active'));
  const fixed = box.querySelector('[data-model="fixed"]');
  if (fixed) fixed.classList.add('active');
  selectedModel = 'fixed';
}

function paintTasks() {
  const wrap = $('#engage-tasks'); // we reuse the container for all types
  if (!wrap) return;
  const dict = (BASE[selectedPlatform] || {})[selectedType] || {};
  wrap.innerHTML = Object.keys(dict).map(k =>
    `<div class="chip" data-task="${k}">${prettyTaskName(k)}</div>`
  ).join('');
  selectedTasks.clear();
  // bind clicks
  $$('#engage-tasks .chip').forEach(el => {
    el.addEventListener('click', () => {
      const k = el.dataset.task;
      if (selectedTasks.has(k)) {
        selectedTasks.delete(k);
        el.classList.remove('active');
      } else {
        selectedTasks.add(k);
        el.classList.add('active');
      }
      // when model = fixed, per-user is auto from tasks; when degen, also auto (with tier)
      lockPerUser = true;
      updatePricePreview();
      if (selectedModel === 'degen') {
        paintDegenDuration(); // update duration options with new task-based pricing
        paintWinnerCap(); // update winner cap options
      }
    });
  });
}

function prettyTaskName(k) {
  return {
    // twitter
    like: 'Like', retweet: 'Retweet', comment: 'Comment', quote: 'Quote',
    thread: 'Thread', article: 'Article', videoreview: 'Video review',
    name_bio_keywords: 'Keywords in name/bio',
    spaces: 'Spaces', community_raid: 'Community Raid',
    // instagram
    story_repost: 'Story repost', feed_post: 'Feed post',
    // tiktok
    repost_duet: 'Repost/Duet', status_style: 'Status-style post',
    pinned_branded_video: 'Pinned branded video',
    // facebook
    share_post: 'Share post', group_post: 'Group post',
    meme_flyer: 'Meme/flyer',
    // whatsapp
    status_50_views: 'Status (50+ views)', flyer_clip_status: 'Flyer/clip status',
    broadcast_message: 'Broadcast message', keyword_in_about: 'Keyword in "About"',
    // snapchat
    story_100_views: 'Story (100+ views)', snap_repost: 'Snap repost',
    branded_snap_video: 'Branded snap video', pfp_avatar: 'PFP/avatar change',
    branded_lens: 'Branded lens',
    // telegram
    join_channel: 'Join channel', react_to_post: 'React to post',
    reply_in_group: 'Reply in group', share_invite: 'Share invite',
    channel_post: 'Channel post', short_video_in_channel: 'Short video in channel',
    guide_thread: 'Guide / thread',
    // shared
    pfp: 'PFP change', hashtag_in_bio: 'Hashtag in bio',
    pinned_tweet: 'Pinned tweet', poll: 'Poll',
    bio_keyword: 'Bio keyword', pinned_post: 'Pinned post',
  }[k] || k;
}

function paintTypeFields() {
  const box = $('#type-fields');
  const engageOnly = $('#engage-only');
  if (!box) return;

  if (selectedType === 'engage' && selectedPlatform === 'twitter') {
    box.innerHTML = `
      <label>Tweet link</label>
      <input id="tweet_url" placeholder="https://x.com/username/status/123" />
    `;
  } else if (selectedType === 'engage' && selectedPlatform === 'telegram') {
    box.innerHTML = `
      <label>Channel or Group link</label>
      <input id="tg_invite" placeholder="https://t.me/your_group_or_channel" />
    `;
  } else if (selectedType === 'content') {
    box.innerHTML = `
      <label>Mission brief</label>
      <textarea id="brief" rows="3" placeholder="Describe what the creator should post or do."></textarea>
    `;
  } else if (selectedType === 'ambassador') {
    box.innerHTML = `
      <label>Ambassador guidelines</label>
      <textarea id="brief" rows="3" placeholder="Describe the ambassador actions required."></textarea>
    `;
  } else {
    box.innerHTML = '';
  }

  engageOnly.style.display = 'block'; // we use it as "task area" for all types
}

/* ---------- Degen Mission UI ---------- */
function paintDegenDuration() {
  const durCol = $('#duration')?.parentElement;
  if (!durCol) return;

  if (selectedModel !== 'degen') {
    // For fixed model, ensure we have a number input
    const currentInput = $('#duration');
    if (currentInput && currentInput.tagName !== 'INPUT') {
      // If it's not an input, create one
      const input = document.createElement('input');
      input.id = 'duration';
      input.type = 'number';
      input.value = '24';
      durCol.replaceChild(input, currentInput);
      $('#duration').addEventListener('input', updatePricePreview);
    }
    return;
  }

  // For degen model, ensure we have a select dropdown
  const currentInput = $('#duration');
  if (currentInput && currentInput.tagName !== 'SELECT') {
    // Create select dropdown for degen
    const select = document.createElement('select');
    select.id = 'duration';
    select.className = 'duration-dropdown';

    select.innerHTML = DEGEN_DURATIONS.map(d => {
      const { totalCostUsd } = computeDegenCosts(d.cost, premium, d.maxWinners, selectedTasks.size);
      return `<option value="${d.hours}">${d.hours}h — $${fmtUsd(totalCostUsd)}</option>`;
    }).join('');

    // Set default to 24h (index 7)
    select.selectedIndex = 7;

    durCol.replaceChild(select, currentInput);
    select.addEventListener('change', updatePricePreview);
  } else if (currentInput && currentInput.tagName === 'SELECT') {
    // Update existing select with new options
    currentInput.innerHTML = DEGEN_DURATIONS.map(d => {
      const { totalCostUsd } = computeDegenCosts(d.cost, premium, d.maxWinners, selectedTasks.size);
      return `<option value="${d.hours}">${d.hours}h — $${fmtUsd(totalCostUsd)}</option>`;
    }).join('');

    // Keep current selection if valid, otherwise default to 24h
    if (currentInput.selectedIndex < 0 || currentInput.selectedIndex >= DEGEN_DURATIONS.length) {
      currentInput.selectedIndex = 7; // 24h default
    }
  }

  // Update audience slider to match current duration (only for degen)
  if (selectedModel === 'degen') {
    const slider = $('#audience');
    if (slider) {
      const currentHours = Number($('#duration').value);
      const durationMap = [1, 12, 36, 96, 240]; // Starter, Small, Medium, Large, Complete
      const sliderIndex = durationMap.findIndex(hours => hours === currentHours);
      if (sliderIndex !== -1) {
        slider.value = sliderIndex;
      } else {
        slider.value = 2; // Default to Medium (36h)
      }
    }
  }
}

function paintWinnerCap() {
  const capCol = $('#cap')?.parentElement;
  if (!capCol) return;

  if (selectedModel !== 'degen') {
    // For fixed model, ensure we have a number input
    const currentInput = $('#cap');
    if (currentInput && currentInput.tagName !== 'INPUT') {
      // If it's not an input, create one
      const input = document.createElement('input');
      input.id = 'cap';
      input.type = 'number';
      input.value = '100';
      input.min = '60';
      capCol.replaceChild(input, currentInput);
      $('#cap').addEventListener('input', (e) => {
        if (selectedModel === 'fixed') {
          const value = Number(e.target.value);
          if (value < 60) {
            e.target.value = 60;
          }
        }
        updatePricePreview();
      });
    }
    return;
  }

  // For degen model, ensure we have a select dropdown
  const currentInput = $('#cap');
  if (currentInput && currentInput.tagName !== 'SELECT') {
    // Create select dropdown for degen
    const select = document.createElement('select');
    select.id = 'winnerCap';

    // Get current duration selection
    const durationInput = $('#duration');
    const selectedHours = durationInput ? Number(durationInput.value) : 24;
    const duration = DEGEN_DURATIONS.find(d => d.hours === selectedHours) || DEGEN_DURATIONS[2]; // default to 6hrs

    select.innerHTML = Array.from({ length: duration.maxWinners }, (_, i) => i + 1).map(w => {
      return `<option value="${w}">${w}</option>`;
    }).join('');

    capCol.replaceChild(select, currentInput);
    select.addEventListener('change', updatePricePreview);
  } else if (currentInput && currentInput.tagName === 'SELECT') {
    // Update existing select with new options
    const durationInput = $('#duration');
    const selectedHours = durationInput ? Number(durationInput.value) : 24;
    const duration = DEGEN_DURATIONS.find(d => d.hours === selectedHours) || DEGEN_DURATIONS[2];

    currentInput.innerHTML = Array.from({ length: duration.maxWinners }, (_, i) => i + 1).map(w => {
      return `<option value="${w}">${w}</option>`;
    }).join('');

    // Reset to first option if current selection exceeds new max
    if (Number(currentInput.value) > duration.maxWinners) {
      currentInput.value = '1';
    }
  }
}

function paintDegenLiveMath() {
  const mathBox = $('#degen-live-math');
  if (!mathBox || selectedModel !== 'degen') {
    if (mathBox) mathBox.style.display = 'none';
    return;
  }
  // Hide the breakdown for cleaner UI
  mathBox.style.display = 'none';
}

/* ---------- Degen Math ---------- */
function computeDegenCosts(baseCost, premiumOnly, winnersCap, taskCount = 1) {
  // Base cost increases by duration amount for each additional task
  const adjustedCost = baseCost + (baseCost * (taskCount - 1));
  const totalCostUsd = premiumOnly ? adjustedCost * 5 : adjustedCost;
  const userPoolHonors = Math.round(totalCostUsd * 225); // C * 225 (or C * 5 * 225 for premium)
  const perWinnerHonors = Math.floor(userPoolHonors / winnersCap);
  return { totalCostUsd, userPoolHonors, perWinnerHonors };
}

/* ---------- Math ---------- */
function currentBaseSum() {
  const dict = (BASE[selectedPlatform] || {})[selectedType] || {};
  let base = 0;
  selectedTasks.forEach(k => base += (dict[k] || 0));
  return base; // pre-fee honors per user (sum of selected tasks)
}

function applyFees(base) {
  // platform fee (fee-inclusive), then premium uplift (if chosen)
  const withPlatform = base * (1 + PLATFORM_FEE_RATE);
  const withPremium = withPlatform * (1 + (premium ? PREMIUM_RATE : 0));
  return Math.ceil(withPremium);
}

function perUserHonors() {
  if (selectedModel === 'degen') {
    const dropdown = $('#duration');
    const capSel = $('#winnerCap');
    if (!dropdown || !capSel) return 0;

    const selectedHours = Number(dropdown.value);
    const selectedWinners = Number(capSel.value);
    const duration = DEGEN_DURATIONS.find(d => d.hours === selectedHours) || DEGEN_DURATIONS[2];

    const { perWinnerHonors } = computeDegenCosts(duration.cost, premium, selectedWinners, selectedTasks.size);
    return perWinnerHonors;
  }

  // Fixed model
  const base = currentBaseSum();
  if (base <= 0) return 0;
  return applyFees(base);
}

function totals() {
  if (selectedModel === 'degen') {
    const dropdown = $('#duration');
    const capSel = $('#winnerCap');
    if (!dropdown || !capSel) return { per: 0, cap: 0, totalHonors: 0, totalUsd: 0 };

    const selectedHours = Number(dropdown.value);
    const selectedWinners = Number(capSel.value);
    const duration = DEGEN_DURATIONS.find(d => d.hours === selectedHours) || DEGEN_DURATIONS[2];

    const { totalCostUsd, userPoolHonors } = computeDegenCosts(duration.cost, premium, selectedWinners, selectedTasks.size);
    return {
      per: userPoolHonors / selectedWinners,
      cap: selectedWinners,
      totalHonors: userPoolHonors,
      totalUsd: totalCostUsd
    };
  }

  // Fixed model
  const per = perUserHonors();
  const cap = Number($('#cap')?.value || 0);
  const totalHonors = Math.max(0, Math.round(per * cap));
  const totalUsd = totalHonors * HONOR_TO_USD;
  return { per, cap, totalHonors, totalUsd };
}

/* ---------- Painters ---------- */
function fmtUsd(n) {
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updatePricePreview() {
  const { per, totalHonors, totalUsd } = totals();

  // Update per-user field
  const perField = $('#perUser');
  if (perField) {
    if (selectedModel === 'degen') {
      perField.value = per;
      perField.readOnly = true;
      perField.disabled = true;
    } else if (lockPerUser) {
      perField.value = per;
      perField.readOnly = true;
      perField.disabled = true;
    } else {
      perField.readOnly = false;
      perField.disabled = false;
    }
  }

  // main price pill — show only USD for both models
  const price = $('#priceBox');
  if (price) {
    price.textContent = `$${fmtUsd(totalUsd)}`;
  }

  // breakdown "Total" — show only USD for both models
  const pp = $('#ppTotal');
  if (pp) {
    pp.textContent = `$${fmtUsd(totalUsd)}`;
  }

  // Show/hide audience slider based on model
  const audienceSection = $('#audience')?.parentElement;
  if (audienceSection) {
    audienceSection.style.display = selectedModel === 'degen' ? 'block' : 'none';
  }

  // Update Degen-specific UI
  if (selectedModel === 'degen') {
    paintWinnerCap();
    paintDegenLiveMath();
  }
}

/* ---------- Event wiring ---------- */
// Navigation (delegated)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.nav button[data-page]');
  if (!btn) return;
  e.preventDefault();
  switchPage(btn.dataset.page);
});

// Platforms
$('#platforms')?.addEventListener('click', (e) => {
  const chip = e.target.closest('.platform-chip');
  if (!chip) return;
  $$('#platforms .platform-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  selectedPlatform = chip.dataset.platform || 'twitter';

  // when platform changes, rebuild mission types/tasks
  buildMissionTypeChips();
  paintTypeFields();
  paintTasks();
  lockPerUser = true;
  paintDegenDuration();
  updatePricePreview();
});

// Mission types
document.addEventListener('click', (e) => {
  const chip = e.target.closest('#types .chip');
  if (!chip) return;
  $$('#types .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');

  selectedType = chip.dataset.mtype || 'engage';
  selectedTasks.clear();
  paintTypeFields();
  paintTasks();
  lockPerUser = true;
  paintDegenDuration();
  updatePricePreview();
});

// Model chips
$('#model-type')?.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip[data-model]');
  if (!chip) return;
  $$('#model-type .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  selectedModel = chip.dataset.model || 'fixed';
  lockPerUser = true; // models always auto-calc per user

  if (selectedModel === 'degen') {
    paintDegenDuration();
    paintWinnerCap();
    // Set audience slider to Medium (36h) for degen
    const slider = $('#audience');
    if (slider) slider.value = 2;
  } else {
    // For fixed model, ensure proper inputs
    paintDegenDuration(); // This will restore number inputs
    paintWinnerCap(); // This will restore number inputs
  }
  updatePricePreview();
});

// Premium chips (affects price)
$('#premium')?.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  $$('#premium .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  premium = Number(chip.dataset.prem || 0); // 0 or 1
  lockPerUser = true;
  updatePricePreview();
});

// Free inputs
$('#cap')?.addEventListener('input', (e) => {
  if (selectedModel === 'fixed') {
    const value = Number(e.target.value);
    if (value < 60) {
      e.target.value = 60;
    }
  }
  updatePricePreview();
});
$('#perUser')?.addEventListener('input', () => {
  if (!lockPerUser) updatePricePreview();
});

// Audience slider and duration dropdown sync (only for degen model)
$('#audience')?.addEventListener('input', (e) => {
  if (selectedModel === 'degen') {
    const sliderValue = Number(e.target.value);
    const dropdown = $('#duration');
    if (dropdown && dropdown.tagName === 'SELECT') {
      // Map audience slider to duration options
      const durationMap = [1, 12, 36, 96, 240]; // Starter, Small, Medium, Large, Complete
      const selectedHours = durationMap[sliderValue] || 24;
      const index = DEGEN_DURATIONS.findIndex(d => d.hours === selectedHours);
      if (index !== -1) {
        dropdown.selectedIndex = index;
        paintWinnerCap(); // Update winner cap options
        updatePricePreview();
      }
    }
  }
});

$('#duration')?.addEventListener('change', (e) => {
  if (selectedModel === 'degen') {
    const dropdownValue = Number(e.target.value);
    const slider = $('#audience');
    if (slider) {
      // Map duration back to audience slider
      const durationMap = [1, 12, 36, 96, 240]; // Starter, Small, Medium, Large, Complete
      const sliderIndex = durationMap.findIndex(hours => hours === dropdownValue);
      if (sliderIndex !== -1) {
        slider.value = sliderIndex;
      }
    }
    paintWinnerCap(); // Update winner cap options
  }
  updatePricePreview();
});

/* ---------- Routing ---------- */
function switchPage(p) {
  $$('.nav button').forEach(b => b.classList.toggle('active', b.dataset.page === p));
  $$('.route').forEach(s => s.classList.add('hidden'));
  const show = $('#page-' + p);
  if (show) show.classList.remove('hidden');

  if (p === 'discover') loadFeed();
  if (p === 'mymissions') loadMy();
  if (p === 'wallet') refreshWallet();
  if (p === 'dashboard') refreshMetrics();
  if (p === 'claim') refreshClaim();
  if (p === 'review') loadPending();
}

/* ---------- Create Mission ---------- */
$('#create')?.addEventListener('click', async () => {
  if (!token) return alert('Login first');

  if (selectedModel === 'degen') {
    const capSel = $('#winnerCap');
    if (!capSel || Number(capSel.value) === 0) {
      alert('Please select a winner cap greater than 0.');
      return;
    }
  } else {
    if (selectedTasks.size === 0) {
      alert('Select at least one task.');
      return;
    }
  }

  // duration handling for payload
  let durationHours = Number($('#duration')?.value || 24);
  let winnersCap = Number($('#cap')?.value || 0);

  if (selectedModel === 'degen') {
    const dropdown = $('#duration');
    const capSel = $('#winnerCap');
    if (dropdown) durationHours = Number(dropdown.value);
    if (capSel) winnersCap = Number(capSel.value);
  }

  const { totalCostUsd, userPoolHonors, perWinnerHonors } = selectedModel === 'degen'
    ? computeDegenCosts(
      DEGEN_DURATIONS.find(d => d.hours === durationHours)?.cost || 80,
      premium,
      winnersCap,
      selectedTasks.size
    )
    : { totalCostUsd: 0, userPoolHonors: 0, perWinnerHonors: 0 };

  const payload = {
    platform: selectedPlatform,
    type: selectedType,                 // engage | content | ambassador
    model: selectedModel,               // fixed | degen
    title: `Mission — ${selectedPlatform} — ${selectedType}`,
    tasks: Array.from(selectedTasks),   // concrete tasks
    premium: !!premium,
    cap: selectedModel === 'degen' ? winnersCap : Number($('#cap')?.value || 0),
    rewards_per_user: selectedModel === 'degen' ? perWinnerHonors : perUserHonors(),
    duration_hours: durationHours,
    // Degen-specific fields
    total_cost_usd: selectedModel === 'degen' ? totalCostUsd : undefined,
    user_pool_honors: selectedModel === 'degen' ? userPoolHonors : undefined,
    per_winner_honors: selectedModel === 'degen' ? perWinnerHonors : undefined,
    // optional fields by platform/type
    tweet_url: ($('#tweet_url') || {}).value,
    tg_invite: ($('#tg_invite') || {}).value,
    brief: ($('#brief') || {}).value,
    instructions: ($('#instructions') || {}).value || '',
  };

  try {
    const r = await fetch('/api/ugt/missions', {
      method: 'POST', headers: headers(), body: JSON.stringify(payload)
    });
    const d = await r.json();
    if (d.error) return alert(d.error);
    alert('Mission created: ' + d.id);
    loadMy();
    switchPage('review');
  } catch (e) {
    console.error(e); alert('Failed to create mission.');
  }
});

/* ---------- Discover / My / Review ---------- */
async function loadFeed() {
  try {
    const r = await fetch('/api/ugt/missions');
    const list = await r.json();
    const box = $('#feed'); box.innerHTML = '';
    list.forEach(m => {
      const div = document.createElement('div');
      div.className = 'card'; div.style.marginBottom = '10px';
      const actions = (m.tasks || m.interactions || []).join(' • ');

      let badge = `${m.rewards_per_user} honors`;
      if (m.model === 'degen') {
        badge = `DEGEN · ${m.user_pool_honors?.toLocaleString() || 0} honors pool`;
      }

      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <b>${m.title || (m.platform + ' ' + m.type).toUpperCase()}</b>
            <div class="muted">${actions || '—'}</div>
          </div>
          <div class="badge">${badge}</div>
        </div>
        <div class="muted">Ends: ${m.end_at ? new Date(m.end_at).toLocaleString() : '—'}</div>
        <div class="right"><button class="btn" data-id="${m.id}">Start & Submit Proof</button></div>
      `;
      div.querySelector('button').onclick = async () => {
        if (!token) return alert('Login first');
        const proof = prompt('Paste proof URL or note:'); if (!proof) return;
        const rr = await fetch(`/api/ugt/missions/${m.id}/submit`, {
          method: 'POST', headers: headers(), body: JSON.stringify({ proofs: [proof] })
        });
        const dd = await rr.json(); alert('Submission ' + dd.status);
      };
      box.appendChild(div);
    });
  } catch (e) { console.error(e); }
}

async function loadMy() {
  if (!token) return;
  try {
    const r = await fetch('/api/ugt/missions/my', { headers: headers() });
    const list = await r.json();
    const tb = $('#mytable'); tb.innerHTML = '';
    list.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${m.title || (m.platform + ' ' + m.type)}</td>
        <td>${new Date(m.created_at).toLocaleDateString()}</td>
        <td>${m.cap}</td><td>${m.rewards_per_user}</td><td>${m.status}</td>`;
      tb.appendChild(tr);
    });
  } catch (e) { console.error(e); }
}

async function loadPending() {
  if (!token) return;
  try {
    const r = await fetch('/api/ugt/review/pending', { headers: headers() });
    const list = await r.json();
    const tb = $('#pendingTable'); tb.innerHTML = '';
    list.forEach(row => {
      const proofs = (row.proofs || []).map(p => `<a href="${p}" target="_blank">${p}</a>`).join('<br>');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.title || (row.platform + ' ' + row.type)}</td>
        <td>${row.user_id}</td>
        <td>${proofs || '—'}</td>
        <td>${new Date(row.created_at).toLocaleString()}</td>
        <td>
          <button class="btn" data-approve="${row.id}">Approve</button>
          <button class="btn" style="background:#f4b4b4" data-reject="${row.id}">Reject</button>
        </td>`;
      tb.appendChild(tr);
    });

    tb.querySelectorAll('[data-approve]').forEach(b => {
      b.onclick = async () => {
        const sid = b.getAttribute('data-approve');
        const res = await fetch(`/api/ugt/submissions/${sid}/review`, {
          method: 'POST', headers: headers(), body: JSON.stringify({ approve: true })
        });
        await res.json(); loadPending(); refreshClaim();
      };
    });
    tb.querySelectorAll('[data-reject]').forEach(b => {
      b.onclick = async () => {
        const sid = b.getAttribute('data-reject');
        const msg = prompt('Reason (optional):') || '';
        const res = await fetch(`/api/ugt/submissions/${sid}/review`, {
          method: 'POST', headers: headers(), body: JSON.stringify({ approve: false, message: msg })
        });
        await res.json(); loadPending();
      };
    });
  } catch (e) { console.error(e); }
}

/* ---------- Dashboard / Wallet / Claim ---------- */
async function refreshMetrics() {
  if (!token) return;
  try {
    const r = await fetch('/api/ugt/metrics', { headers: headers() }); const d = await r.json();
    $('#metric-missions').innerText = d.missionsLast7 ?? 0;
    $('#metric-dist').innerText = (d.totalRewardsDistributed ?? 0).toLocaleString();
    $('#metric-earned').innerText = ((d.missionsCompleted ?? 0) * 200).toLocaleString() + ' honors';
    refreshClaim();
  } catch (e) { console.error(e); }
}

async function refreshClaim() {
  if (!token) return;
  try {
    const r = await fetch('/api/ugt/claimable', { headers: headers() }); const d = await r.json();
    $('#metric-claim').innerText = (d.claimable ?? 0).toLocaleString() + ' honors';
    $('#claimable').innerText = (d.claimable ?? 0).toLocaleString() + ' honors';
  } catch (e) { console.error(e); }
}

$('#claimBtn')?.addEventListener('click', async () => {
  if (!token) return alert('Login first');
  try {
    const r = await fetch('/api/ugt/claim', { method: 'POST', headers: headers() });
    const d = await r.json();
    alert('Claimed ' + d.claimed + ' honors'); refreshWallet(); refreshClaim();
  } catch (e) { console.error(e); }
});

async function refreshWallet() {
  if (!token) return;
  try {
    const r = await fetch('/api/wallet/me', { headers: headers() });
    const w = await r.json();
    HONOR_TO_USD = w.honorsToUsd || HONOR_TO_USD;
    const usd = (w.honors * HONOR_TO_USD).toFixed(2);
    $('#walletBox').innerHTML = `<div><b>${(w.honors || 0).toLocaleString()} honors</b> ≈ $${usd}</div>
      <div class="muted">Min withdraw: ${w.withdrawMin?.toLocaleString?.() ?? '—'}</div>`;
    $('#balances').innerText = `Honors: ${(w.honors || 0).toLocaleString()} • ≈ $${usd}`;
    // refresh price labels when FX changes
    paintDegenDuration();
    updatePricePreview();
  } catch (e) { console.error(e); }
}

$('#wd')?.addEventListener('click', async () => {
  if (!token) return alert('Login first');
  const a = $('#addr')?.value || prompt('TON address'); if (!a) return;
  try {
    const r = await fetch('/api/wallet/withdraw', {
      method: 'POST', headers: headers(), body: JSON.stringify({ address: a })
    });
    const d = await r.json();
    if (d.error) alert(d.error); else { alert('Withdraw queued'); refreshWallet(); }
  } catch (e) { console.error(e); }
});

/* ---------- Login ---------- */
$('#login')?.addEventListener('click', async () => {
  try {
    const r = await fetch('/api/auth/demo-login', {
      method: 'POST', headers: headers(), body: JSON.stringify({ handle: 'guest' })
    });
    const d = await r.json();
    if (!d.token) return alert('Login failed');
    token = d.token;
    $('#login').innerText = 'Logged in';
    await refreshWallet();
    await refreshMetrics();
    switchPage('dashboard');
  } catch (e) { console.error(e); }
});

/* ---------- First render ---------- */
document.addEventListener('DOMContentLoaded', () => {
  buildPlatformChips();
  buildMissionTypeChips();
  buildModelChips();
  paintTypeFields();
  paintTasks();
  lockPerUser = true;           // auto-calc per-user by default

  // Ensure fixed model starts with correct input types
  paintDegenDuration();         // sets up duration input for fixed model
  paintWinnerCap();             // sets up cap input for fixed model

  switchPage('create');         // start on Create so you can test flow quickly
  updatePricePreview();
});