"use strict";
// TODO(Ensei): V2 exports compile issue
// Current status: index.ts not emitting to lib/index.js
// See debugging notes in DEBUG-NOTES.md and .tsc.effective.json
// Workaround: Build script copies lib/functions/index.js to lib/index.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.skipSubmission = exports.getReviewQueue = exports.submitReview = exports.api = void 0;
// functions/index.ts
// Import the main API function and review handler
const index_1 = require("./src/index");
Object.defineProperty(exports, "api", { enumerable: true, get: function () { return index_1.api; } });
const review_handler_1 = require("./src/review-handler");
Object.defineProperty(exports, "submitReview", { enumerable: true, get: function () { return review_handler_1.submitReview; } });
const review_queue_1 = require("./src/review-queue");
Object.defineProperty(exports, "getReviewQueue", { enumerable: true, get: function () { return review_queue_1.getReviewQueue; } });
const skipSubmission_1 = require("./src/review/skipSubmission");
Object.defineProperty(exports, "skipSubmission", { enumerable: true, get: function () { return skipSubmission_1.skipSubmission; } });
