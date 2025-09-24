// TODO(Ensei): V2 exports compile issue
// Current status: index.ts not emitting to lib/index.js
// See debugging notes in DEBUG-NOTES.md and .tsc.effective.json
// Workaround: Build script copies lib/functions/index.js to lib/index.js

// functions/index.ts
import { onParticipationUpdate, onMissionCreate } from "./src/realtime-stats-updater";
import { onDegenWinnersChosen, onDegenMissionCompleted } from "./src/degen-winner-handler";

// If you still need legacy function(s), export them here explicitly too.
// export { syncMissionProgress } from "./src/legacy-sync-mission-progress";

// V2 names Firebase will discover
export const onParticipationUpdateV2 = onParticipationUpdate;
export const onMissionCreateV2 = onMissionCreate;
export const onDegenWinnersChosenV2 = onDegenWinnersChosen;
export { onDegenMissionCompleted }; // already desired name
