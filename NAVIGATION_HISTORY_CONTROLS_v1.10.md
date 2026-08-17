# Massage Flow — Navigation and History Controls v1.10

## Preview return

The Program Preview action area now includes **「返回時長」**. It returns the user to the preceding duration-selection screen without discarding selected regions, sides, session context, or controlled preview edits.

## History deletion

Each local history entry now exposes **「刪除呢次紀錄」**. Selecting it opens an inline confirmation panel; the user can cancel or choose **「確認刪除」**. Confirmation removes only that entry from local history. The existing storage effect persists the changed list automatically, while other history entries remain unchanged.

## Verification

A pure-data regression test verifies that removal targets only the requested entry and that remaining nested targets are still cloned. The full suite passes with **22 active tests**, alongside type checking and linting.
