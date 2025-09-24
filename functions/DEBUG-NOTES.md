# Debug Notes – Functions Build Issue

## Problem
- `functions/index.ts` not compiling to `lib/index.js`
- V2 exports missing in build output
- Firebase deployment fails because it can't find `lib/index.js`

## Current Status
- ✅ V2 exports working in `lib/functions/index.js`
- ✅ Build script copies `lib/functions/index.js` to `lib/index.js` for deployment
- ❌ Root `index.ts` not compiling due to path/configuration issues

## Attempts Made
1. **Updated tsconfig.json**:
   - Set `noEmit: false`
   - Set `outDir: lib`
   - Set `rootDir: .` (caused issues with shared files outside functions/)
   - Removed `rootDir` to allow shared files

2. **Updated package.json build script**:
   - Added `rimraf lib && tsc -p tsconfig.json && cp lib/functions/index.js lib/index.js`
   - This works but is a workaround

3. **Verified TypeScript processing**:
   - `--listFiles` shows `index.ts` is included
   - `--diagnostics` shows files are being emitted
   - `--showConfig` shows correct configuration

4. **Checked for conflicts**:
   - Only one `index.ts` in functions/
   - No duplicate entry points

## Root Cause Analysis
The issue appears to be that TypeScript is compiling `functions/index.ts` to `lib/functions/index.js` instead of `lib/index.js`. This suggests:

1. **Path resolution issue**: The shared files outside `functions/` are causing TypeScript to treat the parent directory as the root
2. **Module resolution**: The `rootDir` setting conflicts with the shared files location
3. **Build output structure**: Files are being emitted to `lib/functions/` instead of `lib/`

## Next Steps
1. **Run diagnostic commands**:
   ```bash
   npx tsc -p tsconfig.json --showConfig > .tsc.effective.json
   npx tsc -p tsconfig.json --listFiles | grep index.ts
   npx tsc -p tsconfig.json --diagnostics
   ```

2. **Check for hidden issues**:
   - Verify no `extends` in tsconfig.json pulling in `noEmit: true`
   - Check if there are multiple tsconfig files being used
   - Confirm working directory when building

3. **Potential solutions**:
   - Move shared files inside `functions/shared/` to avoid path issues
   - Use explicit `rootDir` and adjust shared file imports
   - Create a proper entry point that doesn't conflict with shared files

## Current Workaround
The build script successfully copies `lib/functions/index.js` to `lib/index.js`, which allows deployment to work. The V2 exports are present and functional.

## Files Modified
- `functions/tsconfig.json` - TypeScript configuration
- `functions/package.json` - Build script
- `functions/src/realtime-stats-updater.ts` - V2 functions
- `functions/src/degen-winner-handler.ts` - V2 functions
- `functions/shared/honors.ts` - Shared honors mapping
- `functions/shared/degen-calculator.ts` - Shared degen calculator

## V2 Functions Created
- `onParticipationUpdateV2` - Real-time stats updates
- `onMissionCreateV2` - Mission creation tracking
- `onDegenWinnersChosenV2` - Degen winner selection
- `onDegenMissionCompleted` - Degen mission completion

## Deployment Status
- Functions are ready for deployment
- Build script works as workaround
- Need to resolve root compilation issue for clean build
