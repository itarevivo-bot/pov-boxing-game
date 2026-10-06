// Register injury artwork to one stable guard using the affected eye anchor.
// Source packs have opposite screen cheeks; no sprite is mirrored.
const sourceEyes = {
  left: [[158,112],[174,112],[170,113],[165,114],[160,115],[172,117],[177,118],[172,119],[166,121],[163,123]],
  right: [[217,111],[234,112],[232,112],[227,114],[225,114],[205,127],[232,130],[230,132],[227,133],[223,134]],
};
const sizes = {
  left: [[376,396],[396,396],[397,396],[396,396],[397,396],[390,397],[396,397],[397,397],[396,397],[397,397]],
  right: [[378,396],[396,396],[397,396],[396,396],[397,396],[370,397],[396,397],[397,397],[396,397],[397,397]],
};
export function faceDamageLayout(side, index) {
  const screenSide = side === 'left' ? 'right' : 'left';
  const [eyeX, eyeY] = sourceEyes[screenSide][index];
  const [width, height] = sizes[screenSide][index];
  const target = screenSide === 'left' ? [423,264] : [526,254];
  return { x: target[0] - eyeX * 2.33, y: target[1] - eyeY * 2.33, width: width * 2.33, height: height * 2.33 };
}
