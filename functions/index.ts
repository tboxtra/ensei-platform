// TODO(Ensei): V2 exports compile issue
// Current status: index.ts not emitting to lib/index.js
// See debugging notes in DEBUG-NOTES.md and .tsc.effective.json
// Workaround: Build script copies lib/functions/index.js to lib/index.js

// functions/index.ts
// Import the main API function and review handler
import { api } from "./src/index";
import { submitReview } from "./src/review-handler";
import { getReviewQueue } from "./src/review-queue";
import { skipSubmission } from "./src/review/skipSubmission";

// Export the main API function (contains all HTTP endpoints with CORS)
export { api };

// Export the review system callable functions
export { submitReview };
export { getReviewQueue };
export { skipSubmission };
