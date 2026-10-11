# marcn logo

## Brief and visual research

marcn distributes React Native components that developers copy into their own apps. The docs use monochrome OKLCH tokens and system sans typography. The identity should share that restraint and remain recognizable as a small mobile icon.

[shadcn/ui](https://ui.shadcn.com/) uses spare monochrome geometry; the [registry directory](https://ui.shadcn.com/docs/directory) shows how independent identities can sit within that ecosystem. [Native Shadcn](https://github.com/nativeshadcn/native-shadcn) and [gluestack](https://gluestack.io/) provide neighboring examples of the copyable native UI model. These are visual and product references, not a shared official brand system.

## Concepts explored

1. **Modular m** — overlapping component cards suggest the initial; paired with a compact lowercase sans wordmark.
2. **Lifted tile** — one tile leaves a component grid, suggesting copy and customization; paired with a slightly wider lowercase wordmark.
3. **Linked panels (selected reference)** — opposing panels connect through a curved diagonal ribbon; paired with a restrained lowercase `marcn` wordmark.

## Selected mark

The user selected the attached image, preserved here as `reference.png`. The SVG reconstructs that image's silhouette: an isolated upper-right panel and a continuous shape that joins the left panel to the lower-right panel. The curved negative space, asymmetric panel heights, rounded outside corners, and pointed inside corner are retained.

The mark contains two hand-authored paths. The rounded-square icon reproduces the smaller inverted treatment in the reference. This is a vector reconstruction of the selected artwork, with small curve smoothing rather than a new concept.

## Files and use

- `mark.svg` — transparent square canvas; fill follows `currentColor`.
- `lockup.svg` — horizontal mark and lowercase wordmark; follows `currentColor`.
- `mark-black.svg`, `lockup-black.svg` — standalone black artwork on white.
- `mark-white.svg`, `lockup-white.svg` — standalone white artwork on black.
- `icon.svg` — rounded square in `currentColor` with an inset white mark, matching the reference's app icon.
- `reference.png` — the user-selected reference.
- `preview.html` — reference comparison and marks at 16, 32, 64, and 256 px on light and dark backgrounds.
- `preview.png` — browser screenshot of the preview, checked against the reference.

Inline SVG inherits the surrounding text color. External SVG used through an `img` element does not inherit the page's color; use a fixed variant for that embedding method. The wordmark uses the docs' system sans stack and can vary slightly by platform. The mark itself has no font dependency.
