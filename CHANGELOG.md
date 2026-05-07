# Changelog

All notable changes to BirdX are documented in this file.

## v2.0.0 - 2026-05-07

### Added

- Added WebRTC voice calls for direct messages.
- Added Socket.IO call signaling for call start, accept, reject, end, offer, answer, and ICE candidate events.
- Added TURN/STUN configuration through environment variables for more reliable mobile audio.
- Added a redesigned professional call screen with call state, duration, mute, audio retry, accept, reject, and end controls.
- Added incoming call ringtone while the web app is open.
- Added incoming call push notifications for installed/running PWA clients.
- Added notification click routing to open the related chat.
- Added Android PWA install fallback flow and improved install guide text.
- Added complete message reaction toggling with server persistence and live updates.
- Added reaction hydration when loading messages.
- Added `.env.example` TURN variables.

### Changed

- Improved call room joining so users can receive call signaling even when they are not currently viewing that chat.
- Improved remote audio playback handling for mobile browsers and autoplay restrictions.
- Improved service worker cache versioning and cache cleanup.
- Improved PWA manifest metadata for Android installation.
- Updated the README for the 2.0.0 release.

### Fixed

- Fixed post/message reactions not being applied or displayed after selecting an emoji.
- Fixed missing reaction data in loaded message payloads.
- Fixed several call edge cases where signaling could be missed by users outside the active chat view.
- Fixed PWA installation reliability issues on some Android browsers.

## v1.0.0

- Initial BirdX release.
- Forked from Songbird.
- Added BirdX branding and authentication UI updates.
- Added install script.
