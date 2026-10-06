# Authoritative injury severity references

Original ZIP images are stored byte-for-byte with original filenames:

- `left/male_idle_L0_R0.png` through `left/male_idle_L5_R0.png`
- `right/male_idle_L0_R0.png` through `right/male_idle_L0_R5.png`
- `equal/male_idle_L0_R0.png` through `equal/male_idle_L5_R5.png`

All three different clean images are retained; none silently overwrites another.
The filenames define L/R levels without mirroring, side swapping or reinterpretation.
Levels: 0 clean; 1 light; 2 moderate; 3 heavy; 4 very heavy; 5 near-KO.

These are reference cards, not ready-to-use transparent game sprites. LEFT/RIGHT
images are about 341×578; equal images are 512×512. They have baked-in level labels
and backgrounds (LEFT/RIGHT alpha is 235–255; equal alpha is uniformly 255).
Do not mount these cards behind the fighter or use them as cheek overlays.

The 18 source files cover 16 distinct states. Missing unequal mixed references:

L1_R2, L1_R3, L1_R4, L1_R5,
L2_R1, L2_R3, L2_R4, L2_R5,
L3_R1, L3_R2, L3_R4, L3_R5,
L4_R1, L4_R2, L4_R3, L4_R5,
L5_R1, L5_R2, L5_R3, L5_R4.

Playable idle needs one independently completed, consistently framed transparent
boxer image for each of the 36 exact states in `characters/idle/male-combined/`.
Only the original clean master is currently installed there. References must not
be substituted for a missing mixed state or combined using facial masks.
