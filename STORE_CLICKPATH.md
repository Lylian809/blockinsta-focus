# Fokus - Exact Chrome Web Store Click Path

Use this when you are ready to publish.

## Before you start

Make sure you have:

- a Chrome Web Store developer account
- the one-time registration fee paid
- the final ZIP file from `dist/`

Recommended file:

- `dist/Fokus-v0.2.1-store.zip`

## Exact steps

1. Open the Chrome Web Store Developer Dashboard
2. Click `Add new item`
3. Upload `Fokus-v0.2.1-store.zip`
4. Wait for the draft item to be created
5. Open the draft listing

## In the listing form

Fill these sections:

### Store listing

- Name: `Fokus`
- Short description: use the text from `STORE_SUBMISSION.md`
- Detailed description: use the text from `STORE_SUBMISSION.md`
- Category: `Productivity`
- Language: start with English if you want the fastest clean submission

### Graphics

Prepare and upload:

- extension icon
- at least 1 screenshot

Recommended screenshots:

1. popup overview
2. Instagram messages-only mode
3. YouTube without thumbnails
4. TikTok blocked

### Privacy

Use the answers from:

- `PRIVACY.md`
- `STORE_SUBMISSION.md`

### Distribution

- choose public distribution if you want anyone to install it

## Final review before submit

Check:

- the ZIP opens correctly
- `manifest.json` is at the ZIP root
- the version matches `0.2.1`
- the extension loads locally
- the privacy form matches the real code

## After submission

1. Submit for review
2. Watch for any reviewer feedback
3. If Chrome asks for changes:
   - update the code
   - bump the version
   - rebuild the ZIP
   - upload the new package
