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

## Next Best Opportunities

- Improve real-world robustness of Instagram selectors
- Improve YouTube search-only behavior and thumbnail removal consistency
- Improve wording consistency and localization quality across the content-script overlays
- Consider a dedicated first-run onboarding flow beyond the popup preset copy
- Add browser-side safeguards around repeated redirects or site DOM churn
- Refine support/donation flow UX

## Risks / Known Issues

- Supported websites change their DOM frequently
- Overlay copy still needs the same polish pass as the popup
- Recurrent automation must avoid making low-value commits
- Every change should stay small, safe, and genuinely useful
