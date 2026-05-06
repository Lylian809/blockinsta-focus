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

## Next Best Opportunities

- Improve real-world robustness of Instagram selectors
- Improve YouTube thumbnail removal consistency on more page layouts
- Add a small in-popup explanation for settings that disable related options automatically
- Improve wording consistency and localization quality across popup and docs
- Consider a dedicated first-run onboarding flow beyond the popup preset copy
- Add browser-side safeguards around repeated redirects or site DOM churn
- Refine support/donation flow UX

## Risks / Known Issues

- Supported websites change their DOM frequently
- Some copy is still split between English docs and French product UI
- Wider host coverage means more mobile and alternate web variants are reached, so selector drift across those surfaces needs periodic regression checks
- YouTube search-only mode still depends on DOM selectors that may vary across experiments and logged-in layouts
- Recurrent automation must avoid making low-value commits
- The new regression checklist is manual for now, so its value still depends on consistent use before release
- Every change should stay small, safe, and genuinely useful
