# Kevin Cao — personal website

A buildless personal site for GitHub Pages. One centered composition holds a brief overview on the left and all experience on the right. The layout is centered on desktop; on phones the two groups stack, and smaller screens may need vertical scrolling. The description becomes a three-row split-flap display when JavaScript is available; otherwise the original bio remains visible.

## Preview locally

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000. Stop the server with Ctrl+C.

Content: `index.html`. Styling: `css/style.css`. Split-flap messages and timing: `js/splitflap.js`. Classic serif typography uses a locally stored EB Garamond font with its license in `files/fonts/`. The palette is off-white and black with restrained green accents.

Keep the overview brief. Experience entries contain company logos, employment dates, titles, and organizations. A small photographic head-and-shoulders cutout sits above the overview label. No links, contact buttons, Miscellaneous section, or edge navigation. The split-flap display cycles through short personal sentences, without visible controls. Reduced-motion preferences show a static message. Playback stops while the tab is hidden.

The photographic head-and-shoulders cutout was extracted with the built-in image tool from the user-supplied photo; its extraction prompt is in `files/kevin-bust-prompt.txt`.

The opening reveal (`js/intro.js`) restores the original center-line and split-curtain animation. It skips reduced motion, clears on keyboard/pointer input, and has both JavaScript and CSS timeouts so slow resources cannot keep the page hidden.
