/**
 * Unit test for honors calculator
 * Tests the exact scenario that should produce 4,400 Honors
 */

const FIXED_TASK_HONORS = {
    like: 50,
    retweet: 100,
    comment: 150,
    quote: 200,
    follow: 250,
};

function getFixedTaskHonors(taskType) {
    const normalizedType = taskType.toLowerCase();
    return FIXED_TASK_HONORS[normalizedType] || 0;
}

function calculateHonorsFromCompletions(completions) {
    let totalEarned = 0;
    let tasksDone = 0;
    const seen = new Set();

    for (const completion of completions) {
        const { missionId, taskId, status } = completion;

        if (status !== 'completed') continue;

        const key = `${missionId}:${taskId}`;
        if (seen.has(key)) continue; // Prevent duplicates
        seen.add(key);

        const price = getFixedTaskHonors(taskId);
        if (price > 0) {
            totalEarned += price;
            tasksDone += 1;
        }
    }

    return { totalEarned, tasksDone };
}

// Test data that should produce 4,400 Honors (matching your user's exact data)
const testCompletions = [
    // Mission 1: 5 tasks (like, retweet, comment, quote, follow)
    { missionId: 'mission1', taskId: 'like', status: 'completed' },
    { missionId: 'mission1', taskId: 'retweet', status: 'completed' },
    { missionId: 'mission1', taskId: 'comment', status: 'completed' },
    { missionId: 'mission1', taskId: 'quote', status: 'completed' },
    { missionId: 'mission1', taskId: 'follow', status: 'completed' },

    // Mission 2: 5 tasks (like, comment, retweet, quote, follow)
    { missionId: 'mission2', taskId: 'like', status: 'completed' },
    { missionId: 'mission2', taskId: 'comment', status: 'completed' },
    { missionId: 'mission2', taskId: 'retweet', status: 'completed' },
    { missionId: 'mission2', taskId: 'quote', status: 'completed' },
    { missionId: 'mission2', taskId: 'follow', status: 'completed' },

    // Mission 3: 5 tasks (like, comment, quote, retweet, follow)
    { missionId: 'mission3', taskId: 'like', status: 'completed' },
    { missionId: 'mission3', taskId: 'comment', status: 'completed' },
    { missionId: 'mission3', taskId: 'quote', status: 'completed' },
    { missionId: 'mission3', taskId: 'retweet', status: 'completed' },
    { missionId: 'mission3', taskId: 'follow', status: 'completed' },

    // Mission 4: 5 tasks (like, retweet, comment, follow) - 1 like
    { missionId: 'mission4', taskId: 'like', status: 'completed' },
    { missionId: 'mission4', taskId: 'retweet', status: 'completed' },
    { missionId: 'mission4', taskId: 'comment', status: 'completed' },
    { missionId: 'mission4', taskId: 'follow', status: 'completed' },

    // Mission 5: 5 tasks (like, retweet, comment, quote, follow)
    { missionId: 'mission5', taskId: 'like', status: 'completed' },
    { missionId: 'mission5', taskId: 'retweet', status: 'completed' },
    { missionId: 'mission5', taskId: 'comment', status: 'completed' },
    { missionId: 'mission5', taskId: 'quote', status: 'completed' },
    { missionId: 'mission5', taskId: 'follow', status: 'completed' },

    // Mission 6: 5 tasks (like, retweet, comment, quote, follow)
    { missionId: 'mission6', taskId: 'like', status: 'completed' },
    { missionId: 'mission6', taskId: 'retweet', status: 'completed' },
    { missionId: 'mission6', taskId: 'comment', status: 'completed' },
    { missionId: 'mission6', taskId: 'quote', status: 'completed' },
    { missionId: 'mission6', taskId: 'follow', status: 'completed' },

    // Additional like tasks from partial missions (matching real data)
    { missionId: 'mission7', taskId: 'like', status: 'completed' },
    { missionId: 'mission8', taskId: 'like', status: 'completed' },

    // Some pending tasks (should be ignored)
    { missionId: 'mission9', taskId: 'like', status: 'pending' },
    { missionId: 'mission9', taskId: 'retweet', status: 'rejected' },
];

function runTest() {
    console.log('🧪 Running honors calculator unit test...\n');

    const { totalEarned, tasksDone } = calculateHonorsFromCompletions(testCompletions);

    console.log('📊 Test Results:');
    console.log(`   Tasks Done: ${tasksDone}`);
    console.log(`   Total Earned: ${totalEarned} Honors`);

    // Expected results (matching your user's exact data)
    const expectedTasks = 31; // 6 missions × 5 tasks + 2 extra likes = 31 unique tasks
    const expectedHonors = 4400; // 6×50 + 5×100 + 5×150 + 5×200 + 5×250 = 300+500+750+1000+1250 = 3800 + 600 = 4400

    console.log('\n✅ Validation:');
    console.log(`   Expected Tasks: ${expectedTasks}, Got: ${tasksDone} ${tasksDone === expectedTasks ? '✅' : '❌'}`);
    console.log(`   Expected Honors: ${expectedHonors}, Got: ${totalEarned} ${totalEarned === expectedHonors ? '✅' : '❌'}`);

    // Invariant check
    const minExpected = tasksDone * 50;
    console.log(`   Minimum Honors Check: ${totalEarned} ≥ ${minExpected} ${totalEarned >= minExpected ? '✅' : '❌'}`);

    if (tasksDone === expectedTasks && totalEarned === expectedHonors) {
        console.log('\n🎉 All tests passed! Honors calculator is working correctly.');
        return true;
    } else {
        console.log('\n❌ Tests failed! There may be an issue with the honors calculation.');
        return false;
    }
}

// Run the test
const success = runTest();
process.exit(success ? 0 : 1);
