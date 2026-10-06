# Male hook injury assets

Both `male-left-hook/` and `male-right-hook/` contain the original ten uploaded
reaction PNGs. Archive filenames are retained; directory and player-hand mapping
determine which hook uses each pack.

Each reaction `male_hook_LEFT_OR_RIGHT_stage_NN.png` is paired with
`idle/male_LEFT_OR_RIGHT_hook_idle_stage_NN.png` in the same pack (replace
`LEFT_OR_RIGHT` with lowercase `left` or `right`). The idle sprite is an upright
guard pose carrying the corresponding injury severity and transparent background.
The idle images were generated separately from the clean master and matching
reaction references; they are not included in the uploaded ZIPs. Flying impact
droplets are excluded from the idle pose.

`src/injury-state.js` is the explicit manifest of all twenty pairs. Injury starts
at zero in a fresh fight. Received male hooks select stages 01–10 using the existing
health bands, and the highest reached stage is retained. Straights, uppercuts,
recovery and opponent counters do not clear or reduce it. Switching hook hands
uses that hand's reaction/idle pair at the retained stage. Restarting a fight clears
injury to the original clean master; nothing is stored across page loads.

Both head and torso guard layers use the current idle PNG, so generic reactions
and the opponent's attack animation also retain the injuries. Hook recovery lasts 525 ms: impact start, head snap, strongest recoil and eased
recovery to the same damaged guard. Combat damage, controls,
health and selection behavior are unchanged.
