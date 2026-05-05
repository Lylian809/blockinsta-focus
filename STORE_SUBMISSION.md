# Fokus - Chrome Web Store Submission Pack

This file is a copy/paste helper for the Chrome Web Store dashboard.

Official references used:

- Prepare your extension: https://developer.chrome.com/docs/webstore/prepare
- Publish in the Chrome Web Store: https://developer.chrome.com/docs/webstore/publish

## 1. Store name

Fokus

## 2. Short description

Block distracting parts of Instagram, YouTube, and TikTok while keeping the useful parts.

## 3. Detailed description

Fokus helps you stay intentional on social platforms.

Instead of blocking everything by default, Fokus lets you decide what stays useful and what gets removed.

With Fokus, you can:

- keep Instagram messages while hiding Reels, Stories, Explore, feed, and search
- block Instagram completely when needed
- hide YouTube thumbnails to reduce temptation
- turn YouTube into a search-first experience
- block YouTube completely
- block TikTok completely

Fokus is designed for people who want to:

- stay reachable on Instagram without falling into Reels
- use YouTube as a tool instead of a recommendation loop
- remove TikTok access from the browser entirely

Fokus runs fully in the browser and keeps settings simple.

No account.
No backend.
No API key.

## 4. Category suggestion

Productivity

## 5. Language

You can submit the listing in English first.
If you want, you can later add a French listing variant.

## 6. Privacy / data disclosure draft

### Single purpose

Fokus modifies supported social media websites in the browser to hide or block distracting interface elements based on user-selected settings.

### Does the extension collect data?

No, Fokus does not collect, transmit, sell, or share personal or sensitive user data.

### What does the extension store?

Fokus stores only user preferences for enabled or disabled blocking options by using `chrome.storage`.

### Does the extension use remote code?

No.

### Does the extension send data to external servers?

No.

### Permissions explanation

- `storage`: used to save the user's blocking preferences
- host permissions for Instagram, YouTube, and TikTok: used to apply the selected blocking behavior on those sites

## 7. Test instructions for reviewers

1. Install the extension.
2. Open the extension popup.
3. On Instagram:
   - enable `Mode messages seulement`
   - open `https://www.instagram.com/`
   - confirm distracting surfaces are hidden or redirected to messages
4. On YouTube:
   - enable `Supprimer les miniatures`
   - open `https://www.youtube.com/`
   - confirm thumbnails are hidden
5. On TikTok:
   - enable `Bloquer complètement TikTok`
   - open `https://www.tiktok.com/`
   - confirm the site is blocked by the extension

No login is required to verify the main behavior.

## 8. Screenshots to prepare

Recommended screenshots:

1. Popup overview showing Instagram, YouTube, and TikTok sections
2. Instagram messages-only mode
3. YouTube without thumbnails
4. TikTok blocked screen

## 9. Final pre-submit checklist

- manifest version is correct
- version number is updated before upload
- `manifest.json` is at the root of the ZIP
- icons are included
- screenshots are ready
- privacy answers match the actual code
- no temporary files are included in the ZIP
- extension works after loading unpacked

## 10. ZIP content reminder

The ZIP uploaded to the Chrome Web Store should include the extension files with `manifest.json` at the root, not inside a parent folder.
