#!/usr/bin/env node

/**
 * Mission Status Test Script
 * 
 * Tests the mission status system with various scenarios
 * Run this to verify the system works correctly
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'ensei-6c8e0'
  });
}

const db = admin.firestore();

async function createTestMission(type = 'fixed', winnersPerTask = 200) {
  console.log(`\n🧪 Creating test ${type} mission with ${winnersPerTask} winners per task`);
  
  const missionData = {
    type,
    winnersPerTask: type === 'fixed' ? winnersPerTask : null,
    tasks: [
      { id: 'like', label: 'Like' },
      { id: 'retweet', label: 'Retweet' },
      { id: 'follow', label: 'Follow' }
    ],
    startAt: admin.firestore.Timestamp.now(),
    endAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
    created_by: 'test-user',
    platform: 'twitter',
    model: 'fixed'
  };
  
  const missionRef = await db.collection('missions').add(missionData);
  console.log(`✅ Created mission: ${missionRef.id}`);
  
  return missionRef.id;
}

async function addVerifications(missionId, taskId, count) {
  console.log(`\n📝 Adding ${count} verifications for task ${taskId}`);
  
  const batch = db.batch();
  
  for (let i = 0; i < count; i++) {
    const completionRef = db.collection('missions').doc(missionId).collection('completions').doc();
    const completionData = {
      taskId,
      userId: `test-user-${i}`,
      status: 'verified',
      verifiedAt: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now()
    };
    
    batch.set(completionRef, completionData);
  }
  
  await batch.commit();
  console.log(`✅ Added ${count} verifications`);
}

async function checkAggregates(missionId) {
  console.log(`\n📊 Checking aggregates for mission ${missionId}`);
  
  const aggRef = db.collection('missions').doc(missionId).collection('aggregates').doc('counters');
  const aggDoc = await aggRef.get();
  
  if (aggDoc.exists) {
    const data = aggDoc.data();
    console.log(`📈 Aggregates:`, data);
    return data;
  } else {
    console.log(`❌ No aggregates found`);
    return null;
  }
}

async function testFixedMission() {
  console.log(`\n🚀 Testing Fixed Mission Scenario`);
  
  const missionId = await createTestMission('fixed', 200);
  
  // Test 1: Add 180 verifications (90% of cap)
  await addVerifications(missionId, 'like', 180);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for function
  let aggregates = await checkAggregates(missionId);
  
  if (aggregates?.taskCounts?.like === 180) {
    console.log(`✅ Test 1 passed: 90% cap reached (180/200)`);
  } else {
    console.log(`❌ Test 1 failed: Expected 180, got ${aggregates?.taskCounts?.like}`);
  }
  
  // Test 2: Fill to cap
  await addVerifications(missionId, 'like', 20);
  await new Promise(resolve => setTimeout(resolve, 2000));
  aggregates = await checkAggregates(missionId);
  
  if (aggregates?.taskCounts?.like === 200) {
    console.log(`✅ Test 2 passed: Cap reached (200/200)`);
  } else {
    console.log(`❌ Test 2 failed: Expected 200, got ${aggregates?.taskCounts?.like}`);
  }
  
  // Test 3: Try to exceed cap (should be blocked)
  await addVerifications(missionId, 'like', 10);
  await new Promise(resolve => setTimeout(resolve, 2000));
  aggregates = await checkAggregates(missionId);
  
  if (aggregates?.taskCounts?.like === 200) {
    console.log(`✅ Test 3 passed: Cap enforced (still 200/200)`);
  } else {
    console.log(`❌ Test 3 failed: Cap not enforced, got ${aggregates?.taskCounts?.like}`);
  }
  
  return missionId;
}

async function testDegenMission() {
  console.log(`\n🚀 Testing Degen Mission Scenario`);
  
  const missionId = await createTestMission('degen', null);
  
  // Test: Add many verifications (should not be capped)
  await addVerifications(missionId, 'like', 500);
  await new Promise(resolve => setTimeout(resolve, 2000));
  const aggregates = await checkAggregates(missionId);
  
  if (aggregates?.taskCounts?.like === 500) {
    console.log(`✅ Degen test passed: Unlimited verifications (500/∞)`);
  } else {
    console.log(`❌ Degen test failed: Expected 500, got ${aggregates?.taskCounts?.like}`);
  }
  
  return missionId;
}

async function testRaceCondition() {
  console.log(`\n🚀 Testing Race Condition Scenario`);
  
  const missionId = await createTestMission('fixed', 200);
  
  // Fill to 199 (one slot left)
  await addVerifications(missionId, 'like', 199);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Try to add 2 verifications simultaneously (race condition)
  console.log(`🏁 Simulating race condition: 2 users trying to claim last slot`);
  await Promise.all([
    addVerifications(missionId, 'like', 1),
    addVerifications(missionId, 'like', 1)
  ]);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  const aggregates = await checkAggregates(missionId);
  
  if (aggregates?.taskCounts?.like === 200) {
    console.log(`✅ Race condition test passed: Only one succeeded (200/200)`);
  } else {
    console.log(`❌ Race condition test failed: Expected 200, got ${aggregates?.taskCounts?.like}`);
  }
  
  return missionId;
}

async function cleanup(missionIds) {
  console.log(`\n🧹 Cleaning up test missions`);
  
  for (const missionId of missionIds) {
    // Delete completions
    const completionsSnapshot = await db.collection('missions').doc(missionId).collection('completions').get();
    const batch = db.batch();
    completionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    // Delete aggregates
    const aggRef = db.collection('missions').doc(missionId).collection('aggregates').doc('counters');
    await aggRef.delete();
    
    // Delete mission
    await db.collection('missions').doc(missionId).delete();
    
    console.log(`✅ Cleaned up mission ${missionId}`);
  }
}

async function main() {
  console.log(`🧪 Starting Mission Status Tests`);
  
  const missionIds = [];
  
  try {
    // Run tests
    missionIds.push(await testFixedMission());
    missionIds.push(await testDegenMission());
    missionIds.push(await testRaceCondition());
    
    console.log(`\n🎉 All tests completed!`);
    
  } catch (error) {
    console.error(`❌ Test failed:`, error);
  } finally {
    // Cleanup
    if (missionIds.length > 0) {
      await cleanup(missionIds);
    }
  }
  
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}
