"use strict";
// TODO(Ensei): V2 exports compile issue
// Current status: index.ts not emitting to lib/index.js
// See debugging notes in DEBUG-NOTES.md and .tsc.effective.json
// Workaround: Build script copies lib/functions/index.js to lib/index.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitReview = void 0;
// functions/index.ts
// Temporarily comment out other functions to deploy review system
// import { onParticipationUpdate, onMissionCreate } from "./src/realtime-stats-updater";
// import { onDegenWinnersChosen, onDegenMissionCompleted } from "./src/degen-winner-handler";
const review_handler_1 = require("./src/review-handler");
Object.defineProperty(exports, "submitReview", { enumerable: true, get: function () { return review_handler_1.submitReview; } });
