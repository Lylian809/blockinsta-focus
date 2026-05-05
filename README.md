# Fokus

Fokus is a Manifest V3 browser extension for Chrome, Brave, and Edge.

It helps reduce distracting parts of:

- Instagram
- YouTube
- TikTok

The goal is simple: keep the useful parts, block the addictive parts.

## What Fokus can do

### Instagram

- full block
- messages-only mode
- hide Stories
- hide Reels
- hide Explore
- hide feed
- hide search
- optional redirect to inbox

### YouTube

- full block
- hide thumbnails
- search-only home mode

### TikTok

- full block

## Who this is for

Fokus is for people who want to:

- keep Instagram DMs without getting pulled into Reels or Stories
- use YouTube as a utility instead of a recommendation machine
- block TikTok completely

## Install locally

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select this folder
5. Pin the extension if you want quick access

## How to use it

1. Click the Fokus icon in your browser toolbar
2. Open the popup
3. Turn features on or off for each platform
4. Refresh the target tab if the page does not update immediately

Examples:

- Instagram: enable `Mode messages seulement`
- YouTube: enable `Supprimer les miniatures`
- TikTok: enable `Bloquer completement TikTok`

## How it works

Fokus is fully client-side.

It does not use:

- API keys
- a backend
- a database
- remote code execution

It works by:

- injecting content scripts on supported sites
- hiding or blocking distracting UI areas
- storing settings with `chrome.storage`

## Privacy

Fokus does not send your data to any server.

Current permissions:

- `storage`

Current host access:

- `instagram.com`
- `youtube.com`
- `tiktok.com`

The extension stores only local user preferences such as enabled or disabled blocking options.

## Project structure

- `manifest.json` - extension manifest
- `content.js` - per-site blocking logic
- `popup.html` - popup markup
- `popup.css` - popup styles
- `popup.js` - popup behavior and settings persistence
- `icons/` - extension icons

## Supported browsers

- Google Chrome
- Brave
- Microsoft Edge

Any Chromium-based browser with Manifest V3 support should work.

## Limitations

- Instagram, YouTube, and TikTok change their DOM regularly
- some selectors may need updates over time
- this extension is optimized for the web versions of these platforms

## Publish to the Chrome Web Store

1. Create a Chrome Web Store developer account
2. Pay the one-time registration fee
3. Zip the extension files with `manifest.json` at the root
4. Upload the zip in the Chrome Web Store dashboard
5. Fill out the listing, privacy, and distribution fields
6. Submit for review

## Notes for contributors

- Keep the extension lightweight
- Avoid adding trackers, analytics, or external dependencies unless absolutely necessary
- Prefer simple selectors and readable logic
- Test changes directly on the live web apps before publishing
