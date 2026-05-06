# Fokus Browser Regression Checklist

Use this checklist before a release or after any change to `content.js`, `popup.html`, `popup.css`, or `popup.js`.

Test on a Chromium browser with the unpacked extension reloaded.

## Popup

- Popup opens without layout break on Chrome or Brave
- Current saved toggles render correctly on first open
- Changing one toggle updates the status message
- `Bloquer completement Instagram` disables the Instagram sub-options
- `Mode messages seulement` enables or disables `Rediriger vers les messages` correctly
- `Bloquer completement YouTube` disables the YouTube sub-options
- `Reinitialiser` restores the Fokus default preset

## Instagram

- `Bloquer completement Instagram` shows the Fokus blocking overlay
- `Mode messages seulement` allows `/direct/inbox/`
- `Mode messages seulement` blocks the home feed with the messaging CTA
- `Rediriger vers les messages` sends blocked Instagram pages to `/direct/inbox/`
- `Bloquer les Stories` hides the Stories tray and story pages
- `Bloquer les Reels` removes the Reels entry point and blocks `/reels/`
- `Bloquer Explore` removes the Explore entry point and blocks `/explore/`
- `Bloquer le feed` hides the home feed
- `Bloquer la recherche` hides search access and search input

## YouTube

- `Bloquer completement YouTube` shows the Fokus blocking overlay
- `Supprimer les miniatures` removes thumbnails on the home feed
- `Supprimer les miniatures` removes thumbnails on search results
- `Supprimer les miniatures` removes thumbnails on sidebar recommendations
- `Accueil en mode recherche uniquement` hides the home recommendations
- `Accueil en mode recherche uniquement` shows the calm home note on `/`
- Video watch pages remain usable when YouTube is not fully blocked

## TikTok

- `Bloquer completement TikTok` shows the Fokus blocking overlay
- TikTok content becomes visible again after turning the setting off and refreshing

## Final Sanity Check

- No site stays blocked after disabling its blocking setting
- No obvious flicker or redirect loop appears during navigation
- `HOT.md` reflects the latest completed improvement and next opportunities
- Release ZIP build still works if packaging changes were made
