# Fokus Browser Regression Checklist

Use this checklist before a release or after any change to `content.js`, `popup.html`, `popup.css`, or `popup.js`.

Test on a Chromium browser with the unpacked extension reloaded.

## Popup

- Popup opens without layout break on Chrome or Brave
- Current saved toggles render correctly on first open
- When a supported site is open, the matching site card is visually highlighted and the other site cards are deemphasized without becoming hard to read
- If sync storage is unavailable, the popup shows the persistent local-storage badge and explanatory note
- Per-site mode badges match the saved state for Instagram, YouTube, and TikTok
- The popup protection count reflects only real blocking or filtering protections, not helper behavior like Instagram redirect-to-inbox
- Changing one toggle updates the status message
- `Rafraichir l'onglet actif` reloads the same inspected tab instead of another selected tab after window or focus changes
- Unsupported-tab quick-open buttons navigate the same inspected tab instead of a different selected tab after window or focus changes
- If Chromium cannot provide a usable active tab target, the unsupported-tab quick-open buttons open the chosen supported site in a new tab with accurate popup feedback
- `Bloquer completement Instagram` disables the Instagram sub-options
- `Mode messages seulement` enables or disables `Rediriger vers les messages` correctly
- `Bloquer completement YouTube` disables the YouTube sub-options
- `Bloquer Shorts` saves and restores correctly after reopening the popup
- `Reinitialiser` restores the Fokus default preset

## Instagram

- `Bloquer completement Instagram` shows the Fokus blocking overlay
- The Instagram blocking overlay takes keyboard focus and announces its main message clearly
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
- The YouTube blocking overlay takes keyboard focus and announces its main message clearly
- `Supprimer les miniatures` removes thumbnails on the home feed
- `Supprimer les miniatures` removes thumbnails on search results
- `Supprimer les miniatures` removes thumbnails on sidebar recommendations
- `Bloquer Shorts` removes Shorts shelves and entry points from the home feed
- `Bloquer Shorts` blocks direct `/shorts/` URLs with the Fokus overlay
- The blocked Shorts overlay offers a working return path back to regular YouTube without disabling the protection
- `Accueil en mode recherche uniquement` hides the home recommendations
- `Accueil en mode recherche uniquement` shows the calm home note on `/`
- The calm home note is announced as a passive status update rather than trapping focus
- Video watch pages remain usable when YouTube is not fully blocked

## TikTok

- `Bloquer completement TikTok` shows the Fokus blocking overlay
- TikTok content becomes visible again after turning the setting off and refreshing

## Final Sanity Check

- No site stays blocked after disabling its blocking setting
- No obvious flicker or redirect loop appears during navigation
- `HOT.md` reflects the latest completed improvement and next opportunities
- Release ZIP build still works if packaging changes were made
