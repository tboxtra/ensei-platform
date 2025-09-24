// TODO(Ensei): V2 exports compile issue
// Current status: index.ts not emitting to lib/index.js
// See debugging notes in DEBUG-NOTES.md and .tsc.effective.json
// Workaround: Build script copies lib/functions/index.js to lib/index.js

// functions/index.ts
// Import the main API function and review handler
import { api } from "./src/index";
import { submitReview } from "./src/review-handler";

// Export the main API function (contains all HTTP endpoints with CORS)
export { api };

// Export the review system callable function
export { submitReview };
