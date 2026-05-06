# HOT

## Product Direction

Fokus should become a polished focus companion that helps users keep only the useful parts of distracting platforms while removing high-friction and high-addiction surfaces.

Core principles:

- simple to understand
- fast to use
- emotionally calm
- visually clean
- reliable on real websites

## Recent Improvements

- Fixed the popup protection summary so stronger modes like full-site blocking no longer inflate the active protection count with disabled child toggles, keeping the recap aligned with the effective Fokus behavior
- Normalized the YouTube search-only home note copy in `content.js` with Unicode escapes so this visible in-page Fokus message stays legible across editing environments
- Normalized the remaining corrupted French copy in `content.js` overlays with Unicode escapes so shipped blocking messages stay legible across editing environments
- Normalized popup copy to HTML entities so French accents render reliably in the shipped UI even when local editing environments or terminals drift on file encoding
- Added per-site mode badges in the popup so users can see at a glance whether Instagram is blocked, messages-only, filtered, or open without scanning every toggle
- Added a storage fallback from `chrome.storage.sync` to `chrome.storage.local` so Fokus settings still load, save, and sync within the open popup even when sync storage is unavailable
- Added a compact popup configuration summary so users can understand the currently active Fokus protections at a glance instead of parsing every toggle
- Polished the French user-facing copy in the popup and in-page Fokus overlays so the extension feels more deliberate and less rough in everyday use
- Expanded manifest host matching to cover common user-facing subdomains like m.instagram.com, m.youtube.com, music.youtube.com, and m.tiktok.com so Fokus runs on more real-world entry points
- Multi-platform blocking support for Instagram, YouTube, and TikTok
- Instagram messages-only flow
- YouTube thumbnail suppression and search-focused home mode
- TikTok full blocking option
- Refined popup UI and branding
- Popup support card and one-click reset to recommended Fokus defaults
- Popup copy cleanup, clearer default-preset explanation, and accessible live status feedback
- Chrome Web Store submission docs and privacy docs
- Release packaging workflow
- Fix for Instagram redirect throttling loop
- Recurring local Codex task setup
- Clearer in-page Fokus overlays with calmer wording, stronger guidance, and more consistent blocked-state presentation
- Instagram navigation hiding now respects the actual Reels, Explore, and Search settings instead of over-blocking by default
- Popup settings now stay in sync with storage changes while the popup is open
- YouTube search-only home mode now explains the empty homepage state instead of leaving users on an ambiguous blank screen
- Added a browser regression checklist for popup, Instagram, YouTube, and TikTok flows to reduce accidental release regressions
- Popup settings that are disabled by stronger Fokus modes now explain why instead of appearing silently unavailable
- Fixed a malformed YouTube thumbnail selector so Fokus now hides preview images on more lockup-style YouTube cards

## Next Best Opportunities

- Improve real-world robustness of Instagram selectors
- Continue checking YouTube thumbnail removal consistency on additional experimental layouts
- Continue normalizing any remaining user-facing French copy to encoding-safe patterns across docs and store assets
- Add lightweight inline help for more setting interactions beyond the summary and per-site mode badges
- Consider a dedicated first-run onboarding flow beyond the popup preset copy
- Add browser-side safeguards around repeated redirects or site DOM churn
- Refine support/donation flow UX

## Risks / Known Issues

- Supported websites change their DOM frequently
- Some copy is still split between English docs and French product UI
- Terminal rendering can still make some UTF-8 text look noisier than it is, so copy edits should keep favoring encoding-safe patterns for shipped French strings
- Wider host coverage means more mobile and alternate web variants are reached, so selector drift across those surfaces needs periodic regression checks
- YouTube search-only mode and thumbnail hiding still depend on DOM selectors that may vary across experiments and logged-in layouts
- Recurrent automation must avoid making low-value commits
- The new regression checklist is manual for now, so its value still depends on consistent use before release
- Every change should stay small, safe, and genuinely useful
