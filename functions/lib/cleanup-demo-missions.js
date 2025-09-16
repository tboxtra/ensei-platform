"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupDemoMissions = void 0;
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
async function cleanupDemoMissions() {
    try {
        console.log('🧹 Starting cleanup of demo missions...');
        // Get all missions
        const missionsSnapshot = await db.collection('missions').get();
        let deletedCount = 0;
        const batch = db.batch();
        missionsSnapshot.forEach((doc) => {
            var _a, _b, _c;
            const mission = doc.data();
            // Delete missions created by 'system' or demo users
            if (mission.created_by === 'system' ||
                mission.created_by === 'demo-user' ||
                ((_a = mission.title) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('demo')) ||
                ((_b = mission.title) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('sample')) ||
                ((_c = mission.title) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes('test'))) {
                console.log(`🗑️ Deleting demo mission: ${mission.title}`);
                batch.delete(doc.ref);
                deletedCount++;
            }
        });
        if (deletedCount > 0) {
            await batch.commit();
            console.log(`✅ Successfully deleted ${deletedCount} demo missions`);
        }
        else {
            console.log('ℹ️ No demo missions found to delete');
        }
        return { deletedCount };
    }
    catch (error) {
        console.error('❌ Error cleaning up demo missions:', error);
        throw error;
    }
}
exports.cleanupDemoMissions = cleanupDemoMissions;
// Run cleanup if called directly
if (require.main === module) {
    cleanupDemoMissions()
        .then(() => {
        console.log('🎉 Cleanup completed successfully');
        process.exit(0);
    })
        .catch((error) => {
        console.error('💥 Cleanup failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=cleanup-demo-missions.js.map