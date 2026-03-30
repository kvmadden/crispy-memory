# Jennarate: Food Logic -- Code Audit & Correction Plan

**Audit Date:** 2026-03-30
**Audited by:** 50 parallel analysis agents covering every line of App.jsx (2912 lines), main.jsx, index.html, vite.config.js, deploy.yml, package.json, and the STABLE comparison file.

---

## Summary

- **Critical bugs (app-breaking):** 5
- **High-severity bugs (incorrect behavior):** 19
- **Medium-severity bugs (edge cases, data drift):** 18
- **Low-severity issues (anti-patterns, dead code, cosmetic):** 14
- **Total confirmed issues:** 56

---

## CRITICAL -- App-Breaking Bugs

### C1. Answer key prefix mismatch (`_` vs `*`) in MoodQuiz
**Lines:** 2033, 2048, 2068, 2075
**Problem:** Answers are **stored** with `_` prefix (`newAns["_"+key]=p`) but **read** with `*` prefix (`ans["*"+key]`). These never match.
**Impact:** Answered-question badges never display. The "any unanswered" guard is always true. Users get no feedback that their answer was recorded. The quiz can loop infinitely on round 2.
**Fix:** Change all read-side `"*"` prefixes to `"_"` (or vice versa for writes). Also add a round > 2 fallback to force-resolve the mood.

### C2. Side effect during render -- `resolve()` called in render body
**Line:** 1883
**Problem:** `if(qs.length===0){resolve();return null;}` calls `resolve()` (which sets state, starts timers, navigates) directly during the render phase.
**Impact:** Violates React rules. Triggers "Cannot update a component while rendering a different component" warnings. Can cause infinite re-render loops.
**Fix:** Move this into a `useEffect` that watches `qs.length`.

### C3. H2H "idk" (null) vote undo corrupts scores
**Lines:** 1901-1903
**Problem:** When `oldVote` is `null` (idk), `oldVote !== undefined` is `true`, so the undo block runs. But `null` is falsy, so `oldVote ? curQ.y : curQ.n` picks `curQ.n`, subtracting "No" weights that were never added.
**Impact:** Changing vote from "idk" to Yes/No corrupts per-person mood scores in head-to-head mode.
**Fix:** Change condition to `if(oldVote !== undefined && oldVote !== null)` or `if(oldVote != null)`.

### C4. Order cascade priority bug -- families get couple-sized orders
**Line:** 82 (scoreAll, best-order matching)
**Problem:** The order matching cascade checks `meal-match any-scenario` (step 2) before `scenario-match no-meal` (step 3). Family/group orders often lack `ml` tags, so step 2 matches a couple order first.
**Impact:** Families see couple-sized order recommendations instead of family-sized ones.
**Fix:** Swap steps 2 and 3 so scenario match takes priority over meal match, OR backfill `ml` tags on all family/group orders.

### C5. `getMealContext` uses integer hours against fractional boundaries
**Line:** 20
**Problem:** `var h=new Date().getHours()` returns an integer (0-23), but meal boundaries use fractional values (4.5, 8.5, 10.5). At 4:15 AM, `h=4` fails `4 >= 4.5`, so breakfast is missed.
**Impact:** ~30-minute misclassification at every half-hour boundary. The `isOpenNow` function correctly uses fractional hours, proving this is inconsistent.
**Fix:** `var h=new Date().getHours()+new Date().getMinutes()/60;`

---

## HIGH -- Incorrect Behavior

### H1. `deadlock` callback has 3 stale closure bugs
**Line:** 192
**Problem:** Dependency array uses `ppl` instead of `allPpl`, and is missing `_selWithCtx` and `_filterSkips`. Compare with `resolve` and `reroll` which have correct deps.
**Fix:** Change deps to `[rests, allPpl, hist, mealOverride, customMealTimes, gs2, _selWithCtx, _filterSkips]`.

### H2. `streak` never resets for non-picked restaurants
**Line:** 193
**Problem:** `pick()` increments `streak` for the chosen restaurant but never resets it to 0 for others. Streaks accumulate across non-consecutive picks.
**Fix:** Reset `streak: 0` for all non-matching restaurants in the `setR` mapper.

### H3. `pick()` doesn't update `to90`, `to365`, or `ld`
**Line:** 193
**Problem:** Only `to` and `lo` are updated. The 90-day/365-day order counts and last-ordered date become stale over time.
**Fix:** Update `to90`, `to365`, and `ld` in the `pick` callback.

### H4. New people not merged into saved data (asymmetric migration)
**Line:** 150
**Problem:** `mergedR` has logic to append new restaurants from defaults, but `mergedP` does not. New people added to the PEOPLE array never appear for existing users.
**Fix:** Add the same `forEach/find/push` pattern from `mergedR` to `mergedP`.

### H5. Session skip not applied before reroll (stale state)
**Line:** 820
**Problem:** `setSessionSkips(...)` then `reroll(false)` on the same tick. The reroll reads old `sessionSkips` because state hasn't flushed.
**Fix:** Pass the skip ID directly to reroll, or use a ref for sessionSkips.

### H6. `mood-other` context rule fires for nearly all moods
**Line:** 82 (scoreAll ctx rules)
**Problem:** `cx.when==="mood-other" && sel.mood!=="healthy"` applies for every mood except healthy, instead of only moods without a dedicated handler.
**Fix:** Exclude all explicitly handled moods: comfort, trash-goblin, healthy, etc.

### H7. `jInvolved` matches any female, not just Jenna
**Line:** 82 (scoreAll)
**Problem:** `var jInvolved=hasJ||sel.sp.some(...)` is true for any female. Easter eggs like "Jenna's calling the shots here" fire even when Jenna is absent.
**Fix:** Separate `jInvolved` (Jenna specifically) from `hasFemale` (any female).

### H8. Roulette random bias (`.3` should be `.5`)
**Line:** 82 (scoreAll)
**Problem:** `(Math.random()-.3)*22` has a mean of +4.4 instead of 0. Inflates all roulette scores, affecting confidence labels.
**Fix:** Change to `(Math.random()-.5)*22`.

### H9. Meal fit scoring cliff at 0.4 boundary
**Line:** 82 (scoreAll)
**Problem:** A fit of 0.40 gets `-1.5` penalty, but 0.39 gets `-15`. A 13.5-point swing from a tiny difference.
**Fix:** Smooth the transition or adjust thresholds.

### H10. Fallback latenight meal context has `lightBias:true` (should be `false`)
**Line:** 31
**Problem:** The fallback return has `lightBias:true` but `MEAL_DEFS` latenight has `lightBias:false`. Causes incorrect healthy-food boosting late at night.
**Fix:** Change to `lightBias:false`.

### H11. `theme-auto` CSS missing light-mode overrides
**Lines:** 2832-2842
**Problem:** `.theme-light` defines overrides for `.insightsShimmer`, `.jfl-stat`, `.btm-nav`, `.jfl-card` box-shadow, but the `@media(prefers-color-scheme:light)` block for `.theme-auto` omits all of these.
**Fix:** Copy the missing overrides into the `theme-auto` media query block.

### H12. Landing page header buttons invisible in light mode
**Lines:** 352-354
**Problem:** Hardcoded `rgba(255,255,255,.08)` background. In light mode, these are white-on-white.
**Fix:** Use the same `isDk` conditional styling that `TopBar` uses.

### H13. CSV import counts items as orders (inflated `to`)
**Line:** 2191
**Problem:** `agg[name].count++` runs per CSV row (per item), not per order. An order with 5 items counts as 5 orders.
**Fix:** Deduplicate by order timestamp before counting.

### H14. CSV import overwrites manually-tracked order counts
**Lines:** 2240-2246
**Problem:** `upd.to = info.count` replaces rather than merges with existing `to` values.
**Fix:** Add to existing count: `upd.to = (existingR.to || 0) + info.count`.

### H15. `ct:"mexican"` boosts ALL fast-food restaurants
**Line:** 82 (scoreAll catMap)
**Problem:** `catMap["mexican"] = ["mexican","fast-food"]`. A Mexican craving gives +12 to McDonald's, Wendy's, etc.
**Fix:** Remove `"fast-food"` from the mexican mapping. Same issue exists for `"burgers"`.

### H16. Exhausted state unreachable through normal reject-all flow
**Lines:** 749, 753, 817
**Problem:** Rejecting the last result calls `go("dashboard")` instead of incrementing `resIdx` to trigger the exhausted UI ("You're impossible tonight").
**Fix:** When on last result, increment `resIdx` to enter the exhausted state.

### H17. H2H used-question filter compares string to number
**Line:** 2091
**Problem:** `used` array contains question text strings, but the filter compares `used.indexOf(idx)` where `idx` is a numeric index. Never matches.
**Fix:** Compare against question text: `used.indexOf(q2.q)`.

### H18. EmojiEdit cannot be cleared to empty
**Line:** 2288
**Problem:** `value={emIn||p.val}` -- empty string is falsy, so it snaps back to original value.
**Fix:** Use `emIn !== null ? emIn : p.val` or `emIn ?? p.val`.

### H19. Hardcoded `FEMALE_IDS` list ignores the `g` property on people
**Lines:** 82, 1551, 2461
**Problem:** Three separate hardcoded arrays of female IDs instead of using `p.g === "f"`. Won't reflect user edits to gender.
**Fix:** Replace all three lists with `p.g === "f"` checks.

---

## MEDIUM -- Edge Cases & Data Drift

### M1. Biased shuffle via `Math.random()-0.5` in `.sort()` (6 instances)
**Lines:** 1632, 1633, 1636, 1639, 1649, 1938
**Fix:** Replace with Fisher-Yates shuffle.

### M2. `bestS=0` in resolveH2H ignores negative scores
**Line:** 1921
**Fix:** Initialize `bestS = -Infinity`.

### M3. `_ct` key counted as answered question (inflates totalAnswered)
**Line:** 2106
**Fix:** Skip keys that don't match the `_[rn]\\d+q\\d+` pattern.

### M4. Hardcoded 3-question assumption can freeze quiz
**Lines:** 2068, 2072
**Fix:** Use `qs.length` instead of magic number `3`.

### M5. `MEAL_FIT` mutated as module-level var, not React state
**Line:** 2348
**Fix:** Either persist MEAL_FIT changes through the save system, or convert to state.

### M6. Body background desyncs from CSS variables on `theme-auto`
**Line:** 181
**Fix:** Add `matchMedia.addEventListener("change", ...)` with cleanup for auto theme.

### M7. Overlay background hardcoded to dark mode
**Line:** 2878 (CSS)
**Fix:** Use CSS variables for the overlay background.

### M8. `setR` called inside forEach loop during CSV import
**Lines:** 2254-2257
**Fix:** Collect all updates, call `setR` once after the loop.

### M9. Component functions defined inside parent (Sheet, EmojiEdit, MenuRow, SubBar)
**Lines:** 2276, 2287, 2293, 2303
**Fix:** Move these outside the App component or wrap in `useMemo`.

### M10. `setTimeout` in resolve/quickpick can force-navigate away from user's current screen
**Lines:** 190, 386, 542
**Fix:** Check that `vw` hasn't changed before navigating in the timeout callback.

### M11. Missing space in CSV upload status message
**Line:** 2265
**Fix:** Change `"· "` to `" · "`.

### M12. `removeRule` unconditionally closes editor on any rule deletion
**Line:** 2660
**Fix:** Only set `obvEditIdx(null)` when removing the rule being edited; adjust index for rules below.

### M13. `vcfg`/`ccfg` lookups crash on unexpected vetoRisk/confidence values
**Line:** 660
**Fix:** Add fallback: `var v=vcfg[res.vetoRisk]||vcfg.moderate`.

### M14. Anniversary nudges produce duplicates ("first ordered" for every past-year order)
**Line:** 446
**Fix:** Deduplicate by restaurant ID, keeping only the earliest date.

### M15. `bo` flag type inconsistency (boolean `true` vs string values)
**Line:** 194 vs 2381
**Fix:** Standardize on string values for `bo`, or handle both types in display logic.

### M16. Date column regex unanchored -- matches unrelated columns
**Line:** 2181
**Fix:** Anchor the `date` alternative: `/created.?at|order.?date|^date$/i`.

### M17. Prototype pollution risk in CSV import
**Line:** 2190
**Fix:** Use a `Map` instead of plain object for `agg`, or guard against `__proto__`/`constructor`.

### M18. `fam5` tag requires all 3 kids but gates individual-child questions
**Lines:** 1566, 1600
**Fix:** Create per-child tags (e.g., `has-madi`, `has-jack`, `has-emmy`) for individual questions.

---

## LOW -- Anti-patterns, Dead Code, Cosmetic

### L1. Chick-fil-A late-night roast is dead code (filtered by isOpenNow)
### L2. `answeredThisRound` computed but never used (dead code)
### L3. `rrc` (reroll counter) incremented but never read (dead state)
### L4. Chaos mode (`ch=true`) in reroll is never invoked from any call site
### L5. `cycleTheme` never returns to "auto" mode
### L6. Global scrollbar hiding removes scroll affordance on desktop
### L7. No back button from MoodQuiz (step2) to step1
### L8. `isDuo1` ternary produces identical text in both branches
### L9. Save effect fires on every state change with no debounce
### L10. No rating UI exists -- rating scoring logic is dead code
### L11. Dead `fmtH(24)` branch (unreachable input value)
### L12. Deploy workflow triggers on stale branch `claude/review-app-progress-pBPut`
### L13. Package name is `crispy-memory` (GitHub placeholder), missing build/dev scripts
### L14. Missing `ml` (meal) tag on 83 of 108 order entries in restaurant data

---

## Recommended Correction Order

**Phase 1 -- Critical (fix first, app-breaking)**
1. C1: Fix `_`/`*` prefix mismatch in MoodQuiz
2. C2: Move `resolve()` call from render body to useEffect
3. C3: Fix null vote undo in H2H
4. C4: Fix order cascade priority
5. C5: Fix getMealContext to use fractional hours

**Phase 2 -- High (incorrect behavior visible to users)**
6. H1: Fix deadlock dependency array
7. H2-H3: Fix pick() to reset streaks and update to90/to365/ld
8. H4: Add people migration parity with restaurants
9. H5: Fix session skip timing
10. H6-H7: Fix mood-other and jInvolved logic
11. H8: Fix roulette random bias
12. H10: Fix fallback latenight lightBias
13. H11-H12: Fix theme-auto CSS and landing page button styling
14. H13-H14: Fix CSV import counting and merging
15. H15: Fix cuisine tag category mappings
16. H16: Make exhausted state reachable
17. H17: Fix H2H used-question deduplication
18. H18-H19: Fix EmojiEdit clearing and hardcoded gender lists

**Phase 3 -- Medium (edge cases, data integrity)**
19. M1: Replace biased shuffles with Fisher-Yates
20. M2-M4: Fix quiz scoring edge cases
21. M5-M7: Fix theme/state management issues
22. M8-M9: Fix render performance anti-patterns
23. M10-M18: Remaining medium issues

**Phase 4 -- Low (cleanup)**
24. L1-L14: Dead code removal, missing features, deploy cleanup
