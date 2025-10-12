"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HONORS_PER_USD = void 0;
exports.getFixedMissionPriceUSD = getFixedMissionPriceUSD;
exports.usdToHonors = usdToHonors;
exports.HONORS_PER_USD = 450;
function getFixedMissionPriceUSD(cap) {
    if (cap <= 100)
        return 10;
    if (cap <= 200)
        return 15;
    return 25; // 500
}
function usdToHonors(usd) {
    return Math.round(usd * exports.HONORS_PER_USD);
}
