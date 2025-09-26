"use strict";
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
exports.skipSubmission = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
exports.skipSubmission = functions.region("us-central1").https.onCall(async (data, context) => {
    const reviewerUid = context.auth?.uid;
    if (!reviewerUid)
        throw new functions.https.HttpsError("unauthenticated", "Sign in required");
    const { participationId, taskId, submitterId } = data || {};
    if (!participationId || !taskId || !submitterId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing ids");
    }
    const submissionKey = `${participationId}:${taskId}:${submitterId}`;
    const docId = `${submissionKey}:${reviewerUid}`;
    await db.doc(`review_skips/${docId}`).set({
        submissionKey,
        reviewerUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    // (Recommended) enable Firestore TTL on review_skips.createdAt so old skips auto-expire.
    return { ok: true };
});
