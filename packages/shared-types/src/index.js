"use strict";
// ============================================================================
// MISSION TYPES
// ============================================================================
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAudiencePresets = exports.validateDegenPresets = exports.calculateFixedCosts = exports.calculateDegenCosts = exports.honorsToUsd = exports.usdToHonors = exports.getAudiencePresetByName = exports.getDegenPresetByLabel = exports.getDegenPresetByHours = exports.AUDIENCE_PRESETS = exports.DEGEN_PRESETS = exports.PLATFORM_FEE_RATE = exports.USER_POOL_FACTOR = exports.PREMIUM_COST_MULTIPLIER = exports.USD_PER_HONOR = exports.HONORS_PER_USD = void 0;
// ============================================================================
// PRICING CONSTANTS & FUNCTIONS
// ============================================================================
var pricing_1 = require("./pricing");
Object.defineProperty(exports, "HONORS_PER_USD", { enumerable: true, get: function () { return pricing_1.HONORS_PER_USD; } });
Object.defineProperty(exports, "USD_PER_HONOR", { enumerable: true, get: function () { return pricing_1.USD_PER_HONOR; } });
Object.defineProperty(exports, "PREMIUM_COST_MULTIPLIER", { enumerable: true, get: function () { return pricing_1.PREMIUM_COST_MULTIPLIER; } });
Object.defineProperty(exports, "USER_POOL_FACTOR", { enumerable: true, get: function () { return pricing_1.USER_POOL_FACTOR; } });
Object.defineProperty(exports, "PLATFORM_FEE_RATE", { enumerable: true, get: function () { return pricing_1.PLATFORM_FEE_RATE; } });
Object.defineProperty(exports, "DEGEN_PRESETS", { enumerable: true, get: function () { return pricing_1.DEGEN_PRESETS; } });
Object.defineProperty(exports, "AUDIENCE_PRESETS", { enumerable: true, get: function () { return pricing_1.AUDIENCE_PRESETS; } });
Object.defineProperty(exports, "getDegenPresetByHours", { enumerable: true, get: function () { return pricing_1.getDegenPresetByHours; } });
Object.defineProperty(exports, "getDegenPresetByLabel", { enumerable: true, get: function () { return pricing_1.getDegenPresetByLabel; } });
Object.defineProperty(exports, "getAudiencePresetByName", { enumerable: true, get: function () { return pricing_1.getAudiencePresetByName; } });
Object.defineProperty(exports, "usdToHonors", { enumerable: true, get: function () { return pricing_1.usdToHonors; } });
Object.defineProperty(exports, "honorsToUsd", { enumerable: true, get: function () { return pricing_1.honorsToUsd; } });
Object.defineProperty(exports, "calculateDegenCosts", { enumerable: true, get: function () { return pricing_1.calculateDegenCosts; } });
Object.defineProperty(exports, "calculateFixedCosts", { enumerable: true, get: function () { return pricing_1.calculateFixedCosts; } });
Object.defineProperty(exports, "validateDegenPresets", { enumerable: true, get: function () { return pricing_1.validateDegenPresets; } });
Object.defineProperty(exports, "validateAudiencePresets", { enumerable: true, get: function () { return pricing_1.validateAudiencePresets; } });
// ============================================================================
// PLATFORM TASKS
// ============================================================================
__exportStar(require("./platformTasks"), exports);
