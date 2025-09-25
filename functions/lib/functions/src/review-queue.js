"use strict";
// Review Queue Callable Function
// Fetches reviewable items server-side to bypass Firestore permission issues
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewQueue = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
exports.getReviewQueue = functions.https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    if (!uid)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required');
    console.log('getReviewQueue called by user:', uid);
    const db = admin.firestore();
    // Pull a small window, then filter server-side.
    const snap = await db
        .collection('mission_participations')
        .where('status', 'in', ['active', 'completed'])
        .orderBy('created_at', 'desc')
        .limit(50)
        .get();
    // Look up existing review receipts (deterministic key)
    const makeKey = (pId, tId, submitter) => `${pId}:${tId}:${submitter}:${uid}`;
    const items = [];
    for (const doc of snap.docs) {
        const p = doc.data();
        const participationId = doc.id;
        // Never review yourself
        if (p.user_id === uid)
            continue;
        const tasks = Array.isArray(p.tasks_completed) ? p.tasks_completed : [];
        for (const t of tasks) {
            if (t?.verificationMethod !== 'link')
                continue;
            if (!t?.url || typeof t.url !== 'string')
                continue;
            // Accept twitter.com and x.com
            const u = t.url;
            try {
                const urlObj = new URL(u);
                const hostOk = /(^|\.)twitter\.com$|(^|\.)x\.com$/.test(urlObj.hostname);
                if (!hostOk)
                    continue;
            }
            catch {
                // Invalid URL, skip
                continue;
            }
            const handle = t?.urlValidation?.extractedHandle;
            const isValid = t?.urlValidation?.isValid === true;
            if (!handle || !isValid)
                continue;
            const key = makeKey(participationId, t.task_id, p.user_id);
            const reviewed = await db.collection('reviews').doc(key).get();
            if (reviewed.exists)
                continue;
            items.push({
                participationId,
                missionId: p.mission_id,
                submitterUid: p.user_id,
                taskId: t.task_id,
                url: u,
                createdAt: (t.created_at?.toDate?.() ?? new Date(t.created_at ?? Date.now())).toISOString(),
                handle
            });
            // Return just one to keep UX "one-at-a-time"
            if (items.length === 1)
                return { item: items[0] };
        }
    }
    return { item: null };
});
