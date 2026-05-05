# Fokus Privacy Notes

Fokus is a local-only browser extension.

## What Fokus does

Fokus hides or blocks distracting parts of supported websites based on the user's own settings.

Supported sites:

- Instagram
- YouTube
- TikTok

## What Fokus stores

Fokus stores only user preferences with `chrome.storage`.

Examples:

- whether Instagram is fully blocked
- whether YouTube thumbnails are hidden
- whether TikTok is blocked

## What Fokus does not do

Fokus does not:

- create user accounts
- require login
- send analytics
- call a backend
- send browsing data to external servers
- collect personal data
- sell or share user data

## Permissions used

- `storage`
- host permissions for supported websites so the extension can apply user-selected blocking rules
