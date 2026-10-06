# Male hook injury assets

Both `male-left-hook/` and `male-right-hook/` contain the original ten uploaded
reaction PNGs. Archive filenames are retained; directory and player-hand mapping
determine which hook uses each pack.

Each reaction `male_hook_LEFT_OR_RIGHT_stage_NN.png` is paired with
`idle/male_idle_LEFT_OR_RIGHT_damage_10_stage_NN.png` in the same pack (replace
`LEFT_OR_RIGHT` with lowercase `left` or `right`). The idle sprite is an upright
guard pose carrying the corresponding injury severity and transparent background.
The idle images come directly from the uploaded LEFT and RIGHT idle damage ZIPs.
PNG bytes are unchanged. Display-only scale and anchor registration in
`src/idle-registration.js` aligns their cropped upper-body canvases. The existing
SVG viewport clips stray source crop strips above the head in later stages.

`src/injury-state.js` explicitly pairs all twenty reaction and idle assets.
Fresh fights start with LeftDamage = 0 and RightDamage = 0. Each male hook
increments only its own counter, capped at ten; health values are independent.
The latest hook uses its own counter for reaction severity. Idle uses that side's
full guard sprite plus a feathered facial overlay from the opposite side's stored
stage, keeping both cheek injuries visible together. The uploaded LEFT pack marks
the viewer-right cheek, and RIGHT marks the viewer-left cheek; images are not flipped.
Straights, uppercuts and counters preserve both levels. Restart clears both, and
nothing is stored across page loads.

Both head and torso guard layers use the current idle PNG, so generic reactions
and the opponent's attack animation also retain the injuries. Hook recovery lasts 525 ms: impact start, head snap, strongest recoil and eased
recovery to the same damaged guard. Combat damage, controls,
health and selection behavior are unchanged.
