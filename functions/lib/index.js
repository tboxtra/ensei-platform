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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminApi = exports.missions = exports.auth = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const firebaseAdmin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
firebaseAdmin.initializeApp();
// Create a simple Express app for the API
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'Ensei Platform API is working!' });
});
// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
// Export individual functions for better performance
exports.auth = functions.https.onCall(async (data, context) => {
    return { success: true, message: 'Auth function working' };
});
exports.missions = functions.https.onCall(async (data, context) => {
    return { success: true, message: 'Missions function working' };
});
exports.adminApi = functions.https.onCall(async (data, context) => {
    return { success: true, message: 'Admin API function working' };
});
//# sourceMappingURL=index.js.map