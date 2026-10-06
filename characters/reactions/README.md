# Male hook injury assets

Both `male-left-hook/` and `male-right-hook/` contain the original ten uploaded
reaction PNGs. Archive filenames are retained; directory and player-hand mapping
determine which hook uses each pack.

Each reaction `male_hook_LEFT_OR_RIGHT_stage_NN.png` is paired with
`idle/male_idle_LEFT_OR_RIGHT_damage_10_stage_NN.png` in the same pack (replace
`LEFT_OR_RIGHT` with lowercase `left` or `right`). The idle sprite is an upright
guard pose carrying the corresponding injury severity and transparent background.
The idle images come directly from the uploaded LEFT and RIGHT idle damage ZIPs.
PNG bytes are unchanged. Display-only eye-anchor registration in `src/face-damage-layout.js` aligns the
localized injury layers. Their masks exclude crop strips, hair and the rest of
the source pose.

`src/injury-state.js` explicitly pairs all twenty reaction and idle assets.
Fresh fights start with LeftDamage = 0 and RightDamage = 0. Each male hook
increments only its own counter, capped at ten; health values are independent.
The latest hook uses its own counter for reaction severity. Impact travel and
persistent injury are explicitly separate in HOOK_MAPPING: a left hook travels
screen-right but injures the boxer's anatomical left cheek (screen-right), and a
right hook travels screen-left but injures his anatomical right cheek (screen-left).
Idle always keeps one stable master guard beneath localized, feathered eye/cheek
injury layers from both stored stages. Each injury image is registered to the
neutral eye anchor; no full face halves or differently posed heads are stitched
across the nose. Neither reaction nor injury artwork is mirrored.
Straights, uppercuts and counters preserve both levels. Restart clears both, and
nothing is stored across page loads.

Both head and torso guard layers use the current idle PNG, so generic reactions
and the opponent's attack animation also retain the injuries. Hook recovery lasts 525 ms: impact start, head snap, strongest recoil and eased
recovery to the same damaged guard. Combat damage, controls,
health and selection behavior are unchanged.
