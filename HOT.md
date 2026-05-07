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

- Made popup refresh and quick-open actions recover when the stored target tab disappears, so Fokus now refreshes its tab context and can fall back to opening the requested supported site in a new tab instead of failing on a stale tab id
- Made unsupported-tab quick-open shortcuts fall back to opening Instagram, YouTube, or TikTok in a new tab when Chromium cannot provide a usable active tab target, so the popup no longer leaves users stuck in `introuvable` or unidentified-tab states
- Made popup refresh and quick-open actions target the exact tab Fokus inspected, so multi-window or focus changes no longer risk reloading or navigating a different selected tab than the one shown in the popup context
- Clarified popup active-tab fallback states when Chrome hides the current tab URL, so unsupported or restricted tabs now surface an `adresse masquée` state with accurate quick-open guidance instead of looking like the active tab simply disappeared
- Tightened supported-site hostname detection in the popup and content script so Fokus now recognizes only real Instagram, YouTube, and TikTok domains or subdomains instead of falsely treating lookalike hosts such as `notyoutube.com` as supported
- Explicitly gitignored the machine-specific recurring Codex helper files so local scheduled-task scripts and notes stop polluting the worktree or risking accidental commits
- Hardened popup active-tab URL handling so unsupported-tab quick-open and refresh guidance no longer fail hard when Chromium returns an odd or temporarily unreadable tab URL, while shortcut feedback now reports the real destination label consistently during open and failure states
- Fixed the popup unsupported-tab quick-open flow so it now falls back to the intended supported-site context when Chromium briefly returns the pre-navigation tab URL, keeping the active-site emphasis, refresh guidance, and status copy aligned immediately after opening Instagram, YouTube, or TikTok in the current tab
- Added a dynamic quick-open helper note in the popup so unsupported-tab shortcuts now explain when Instagram opens directly to `Messagerie Instagram` because messages-only mode and inbox redirection are active, reducing ambiguity before the tab navigates
- Made the popup quick-open success state and optimistic active-tab context use the real destination label, so Instagram quick-open now stays consistent with `Messagerie Instagram` when messages-only redirection targets the inbox instead of falling back to the generic site name
- Made unsupported-tab quick-open labels reflect the real Fokus destination, so Instagram now surfaces as `Messagerie Instagram` when messages-only mode redirects there instead of implying the generic homepage
- Reconciled popup active-tab context against the real tab URL after quick-open navigation, so active-site emphasis, refresh guidance, and unsupported-tab recovery now settle back to Chromium's actual destination instead of relying only on optimistic popup state
- Kept the popup active-tab context in sync immediately after using an unsupported-tab quick-open shortcut, so the refresh card, summary note, and active-site emphasis now switch to the newly opened Instagram, YouTube, or TikTok tab state without requiring the popup to be reopened
- Added popup quick-open shortcuts for unsupported or browser-internal tabs so users can jump the current tab directly to Instagram, YouTube, or TikTok instead of hitting a dead-end when refresh is unavailable
- Added active-tab site emphasis in the popup so the currently open supported site is highlighted directly in the settings UI, while unsupported or browser-internal tabs keep all site cards available with clearer context
- Tightened the popup refresh action so it now enables reloading only on supported active tabs and clearly tells users to switch to Instagram, YouTube, or TikTok instead of offering a meaningless reload on unsupported pages
- Made the popup refresh action aware of the active tab so it now identifies supported sites, explains when the current page is unsupported, and disables the reload button on browser-internal or otherwise non-reloadable tabs
- Added a one-click active-tab refresh action in the popup so users can re-apply Fokus immediately on already-open pages or stale tabs without manually refreshing the site
- Added a persistent local-storage fallback badge and note in the popup summary so users now understand when Chrome sync storage is unavailable and Fokus can save settings only on the current device
- Added semantic popup control grouping with real per-site headings, fieldsets, and clearer keyboard focus states so Instagram, YouTube, and TikTok settings are easier to navigate with assistive tech and by keyboard alone
- Improved popup accessibility so each toggle now exposes its helper copy, dependency lock reason, and site context to assistive technologies, while Fokus also announces setting changes and reset actions more clearly for screen-reader users
- Improved blocked-surface accessibility so Fokus overlays now expose dialog semantics, move keyboard focus to the main action, and announce the YouTube calm-home note more reliably for assistive technologies
- Fixed the popup protection headline so helper behavior like Instagram redirect-to-inbox no longer counts as a separate active protection, keeping the summary metric aligned with the real blocking and filtering currently in effect
- Added live contextual help under the Instagram and YouTube popup controls so users now see the real effect of redirect-to-inbox and search-only home settings without having to infer why pages redirect or look intentionally empty
- Cleaned up contributor-facing release docs so the README and Chrome Web Store submission instructions no longer show corrupted TikTok copy or stale `0.2.2` release ZIP references
- Added a live preset-status badge and note inside the popup summary card so users can see immediately whether they are still on the recommended Fokus setup or have drifted into a custom configuration
- Added a stateful default-preset note in the popup so the reset card now tells users whether the recommended Fokus configuration is already active and disables the reset button when it would do nothing
- Added live per-site mode explanations in the popup so each Instagram, YouTube, and TikTok card now states plainly what remains accessible in the current configuration instead of relying only on badges and scattered toggles
- Clarified Instagram popup logic so `Mode messages seulement` now disables redundant lower-level Instagram filters in the UI and removes them from the active protection recap, keeping the popup aligned with real effective behavior
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

- Browser-validate the new stale-tab recovery flow so popup refresh and quick-open actions behave clearly if the originally inspected tab is closed before the user clicks
- Browser-validate the new no-active-tab shortcut fallback so `introuvable` and unidentified-tab states really recover by opening the chosen supported site in a fresh tab without misleading copy or stale popup context
- Browser-validate the exact-tab popup targeting on supported tabs, unsupported tabs, and multi-window Chromium sessions so refresh and quick-open actions still affect the intended tab after focus changes
- Browser-validate the new `adresse masquée` popup state on tabs where Chromium withholds the URL so the copy and shortcut guidance match real restricted-tab behavior
- Browser-validate the stricter hostname matching on supported, unsupported, and browser-owned tabs so the popup highlight, refresh action, and quick-open fallbacks stay correct with real Chromium tab URLs
- Browser-validate the popup quick-open and refresh flows on real unsupported tabs so this week's fallback hardening can be confirmed against Chromium behavior instead of relying on defensive copy alone
- Browser-validate the new unreadable-tab fallback state so odd Chromium tab URLs still produce helpful refresh guidance and quick-open behavior instead of confusing generic copy
- Validate the quick-open helper note against unsupported tabs and browser-owned pages so its wording stays accurate and non-redundant when Instagram opens to the inbox versus the standard homepage
- Validate the unsupported-tab quick-open flow against Instagram messages-only and standard-home flows so the shortcut label, optimistic fallback context, and delayed Chromium URL reconciliation all match the actual destination users land on
- Validate the reconciled quick-open flow on supported tabs, unsupported tabs, and browser-owned pages so the popup's delayed URL re-check still matches real Chromium navigation timing on slower transitions
- Validate the new active-tab site emphasis against supported tabs, unsupported tabs, and browser-owned pages so the popup stays helpful without over-dimming unrelated site cards
- Validate the supported-tab-only refresh card against already-open Instagram, YouTube, TikTok, and browser-owned tabs so popup feedback matches real Chromium behavior
- Improve real-world robustness of Instagram selectors
- Verify the new local-storage fallback UI against a browser profile where `chrome.storage.sync` is unavailable so the popup copy stays accurate and non-intrusive
- Verify the popup accessibility pass against a real keyboard-only flow and screen reader on Chromium, especially if new controls or onboarding steps are added
- Continue checking YouTube thumbnail removal consistency on additional experimental layouts
- Continue normalizing any remaining user-facing French copy to encoding-safe patterns across docs and store assets
- Review popup summary metrics whenever new helper-only options are added so status counts stay tied to real focus protections
- Add similar inline help for any future cross-toggle dependencies that become non-obvious in the popup
- Consider a dedicated first-run onboarding flow beyond the popup preset copy
- Add browser-side safeguards around repeated redirects or site DOM churn
- Refine support/donation flow UX

## Risks / Known Issues

- The popup now recovers if its stored target tab disappears before refresh or quick-open, but that stale-tab fallback still needs browser-side validation to confirm the copy and tab-context refresh feel trustworthy in real Chromium sessions
- The popup can now fall back to opening a new tab when Chromium does not expose a usable active tab target, but that recovery path still needs browser-side validation to confirm the success copy and refreshed tab context stay trustworthy after tab creation
- The popup now stores the inspected tab id and uses it for refresh and quick-open actions, but that exact-tab targeting still needs browser-side validation in multi-window Chromium sessions before it can be treated as fully proven
- The popup now distinguishes truly missing active tabs from Chrome-restricted `adresse masquée` tabs in code, but that new wording still needs browser-side validation on real unsupported pages where Chromium withholds `tab.url`
- The stricter supported-site hostname matching removes obvious false positives in code, but it still needs browser-side validation on real supported tabs and unsupported lookalike domains to confirm popup site emphasis and refresh gating behave exactly as intended
- The popup active-tab guidance has been hardened in code, but the unsupported-tab and browser-owned-tab flows still need browser-side validation before they can be considered fully trustworthy
- The new popup fallback for unreadable active-tab URLs still needs browser-side validation against real Chromium edge cases to confirm the `onglet non reconnu` label and quick-open guidance stay clear and trustworthy
- The quick-open helper note is now derived from popup settings only, so it still needs browser-side validation to ensure the copy remains aligned with the actual Instagram destination after Chromium navigation completes
- The unsupported-tab quick-open flow now falls back to the intended supported-site context when `chrome.tabs.update` briefly reports the old tab URL, but it still needs browser-side validation to ensure the optimistic wording and final Chromium destination stay aligned when Instagram message redirection is toggled on or off
- The unsupported-tab quick-open flow now does an optimistic switch plus a delayed real-URL reconciliation after `chrome.tabs.update`, so it still needs browser-side validation to ensure Chromium navigation timing does not leave the popup briefly out of sync on slower tab transitions
- The new active-tab site emphasis depends on popup-side tab detection and visual deemphasis, so it still needs browser-side validation to ensure unsupported-tab states remain readable and not misleading
- Supported websites change their DOM frequently
- Some copy is still split between English docs and French product UI
- The supported-tab-only refresh action depends on popup-side `chrome.tabs.query` and `chrome.tabs.reload` behavior, so it still needs browser-side validation on supported tabs and browser-owned pages
- The new local-storage fallback UI depends on reliably detecting `chrome.storage.sync` availability, so it still needs browser-side validation on a profile where sync is actually unavailable
- Terminal rendering can still make some UTF-8 text look noisier than it is, so copy edits should keep favoring encoding-safe patterns for shipped French strings
- Helper settings can be easy to misclassify in popup summaries, so derived UI metrics need explicit review whenever settings evolve
- Wider host coverage means more mobile and alternate web variants are reached, so selector drift across those surfaces needs periodic regression checks
- YouTube search-only mode and thumbnail hiding still depend on DOM selectors that may vary across experiments and logged-in layouts
- Recurrent automation must avoid making low-value commits
- The new regression checklist is manual for now, so its value still depends on consistent use before release
- Every change should stay small, safe, and genuinely useful
