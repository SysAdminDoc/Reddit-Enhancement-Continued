# Changelog

All notable changes to Reddit-Enhancement-Continued will be documented in this file.

## [2.8.2] - 2026-08-03

- Added: Keyboard-driven gallery navigation with adjacent-image preloading and dimensions metadata.
- Added: Resilient Redgifs v2 and Streamable API video expandos with signed-media and host-player fallbacks.
- Added: Catbox, ImgChest, and ImgBB image-page expandos with safe CDN extraction and multi-image controls.
- Added: Syndication-first X/Twitter previews with media rendering and no-iframe oEmbed fallback.
- Added: Native v.redd.it DASH video/audio remux through MediaSource with codec and embed fallbacks.
- Added: Per-subreddit filter overrides with inherited, replacement, and disabled modes.
- Added: Named regex filter rules with flags, enable/disable controls, resettable persistent hit counts, and debounced storage writes.
- Added: Typed plain-text block-list export/import with keyword compatibility, regex records, merge deduplication, and clipboard copy.
- Added: Comment Sweep controls for persistent bulk tagging or hiding of matching loaded comment history.
- Added: Opt-in explainable low-effort title heuristic using configurable length, uppercase, and emoji signals.
- Added: Opt-in live comment refresh with new-comment insertion, processing, highlight dismissal, and interval control.
- Added: Per-comment citation quote action that formats selected text as Markdown blockquotes and inserts or copies it.
- Added: Persistent per-user private notes in the existing tag records, with popup editing and user-info/hover display.
- Added: Opt-in `>!...!<` spoiler parsing for comments and live Markdown preview with click-to-reveal behavior.
- Added: Markdown preview and formatting controls to dynamically inserted native reply forms.
- Added: Persistent Saved Searches & Filters menu with safe URL normalization and reusable filter presets.
- Added: Credential-free multi-reddit builder for named combined subreddit feeds with local persistence.
- Added: Session-scoped thread tabs that remember comment links across reloads with close and clear controls.
- Added: Inbox-only bulk "Mark all as read" action using Reddit's same-origin read-all endpoint with modhash protection.
- Added: Opt-in AES-GCM encrypted sync snapshots with private Gist, Pastebin, and WebDAV adapters; passphrases are never stored.
- Added: Per-device settings profile scope with safe shared/device store switching and reload handoff.
- Added: Settings Diff tab with compact non-default values, sync-secret redaction, and individual reset actions.
- Changed: Factory reset now saves and downloads a pre-reset backup and preserves the last backup for later retrieval.
- Changed: MutationObservers now use keyed teardown/reconnection lifecycle management for SPA and bfcache transitions.
- Added: NER long-scroll observer leak regression coverage that verifies repeated registration does not grow active observers.
- Added: Configurable Reddit API canary check with cached interval status and warning toast on schema or reachability failures.
- Added: Optional touch-device horizontal swipe navigation with configurable threshold and input/media exclusions.
- Changed: REC dialogs now expose accessible names, modal semantics, Escape close, focus trapping, and focus restoration.
- Added: Opt-in Discord-style experimental layout with channel context, chat-like cards, and accessible author initials.
- Added: Theme Palette Editor with sanitized per-theme overrides, reset controls, and JSON import/export.
- Added: Per-theme local font-pairing picker with system-only stacks and immediate CSS application.
- Added: Opt-in local analytics panel with coarse counters and reset controls; no content or network telemetry is collected.

## [v2.7.5]

- Changed: Update RedditEnhancementContinued.user.js
- Changed: Update RedditEnhancementContinued.user.js
- Changed: Update RedditEnhancementContinued.user.js
- Changed: Update RedditEnhancementContinued.user.js
- Changed: Update README.md
- Changed: Update RedditEnhancementContinued.user.js
- Changed: Update RedditEnhancementContinued.user.js
- Rename RedditEnhancementLite.user.js to RedditEnhancementContinued.user.js
- Changed: Update README.md
- Added: Add files via upload

## Roadmap archive — 2026-08-10 — ROADMAP.md

<details>
<summary>Original roadmap snapshot</summary>

```markdown
# Reddit Enhancement Continued Roadmap

Single-file userscript for old.reddit.com — 14 themes, inline media, comment polish, navigation, filters, vote/view estimators. Roadmap extends filter depth, hardens against Reddit API changes, and adds cross-device settings.

## Planned Features

### Media

### Filtering

### Comments

### Navigation

### Settings / Sync

### Performance / Stability

## Competitive Research
- **RES / RES-Slim** — feature ancestor. Lesson: REC's unique hooks are the 14 themes, vote-burst FX, and the settings UX polish.
- **Reddit Classic Plus / Classic Reddit++** — already credited in README. Lesson: keep pulling upstream-compatible tweaks.
- **Old Reddit Redirect** — tiny, focused. Lesson: REC already subsumes it; advertise explicitly.
- **Baconreader / Apollo (dead)** — polished mobile clients. Lesson: bring their card layout ideas to the desktop Wide/Card view.

## Nice-to-Haves

## Open-Source Research (Round 2)

### Related OSS Projects
- https://github.com/honestbleeps/Reddit-Enhancement-Suite — Upstream RES; maintenance-only. Canonical feature reference.
- https://github.com/Tetrax-10/reddit-tweaks — Active MV3 extension with hover-card and video-expando fixes.
- https://github.com/dessant/old-reddit-redirect — Minimal new→old redirector; 100k+ users.
- https://github.com/libertysoft3/Reddit-Enhancement-Suite-old — RES fork targeting Reddit clones.
- https://github.com/ArthurLimoge/redesign-reddit-classic — CSS-only old.reddit simulator on new.reddit.
- https://github.com/arthurk/reddit-old — Small old.reddit redirector.
- https://github.com/ccorcos/redditp — Slideshow viewer for r/pics-style subs; borrowable expando UX.
- https://github.com/erikdesjardins/UnsavedComments — Niche RES companion; shows how single-purpose userscripts integrate with RES.

### Features to Borrow
- Host-handler registry lifted from upstream RES (87 hosts in RES-Slim) — currently REC may be lighter; backport as needed.
- Comment tree hide persistor + new-comment count (RES modules `commentHidePersistor`, `newCommentCount`).
- Source-snudown markdown view toggle for comment authors (RES).
- Keyboard navigation subset already roadmapped — model on `commentNavigator` + `selectedEntry`.
- Hover-card latency + aspect-ratio fixes from Tetrax-10/reddit-tweaks.
- Optional new→old redirector bundled or recommended (dessant).
- Per-subreddit feature flag overrides (RES filteReddit-style).
- "Show parent on hover" (RES `showParent`) for deeply nested threads.

### Patterns & Architectures Worth Studying
- **Single-file userscript with internal module registry** — current architecture; enforce `modules[id] = {go, options, isEnabled}` shape mirroring upstream RES for future-proof compatibility.
- **Trusted Types policy** for Reddit old-www innerHTML writes — already standard for other SysAdminDoc userscripts.
- **Module lazy-load** — only boot comment modules on `/comments/` URLs, only media modules on link pages.
- **IndexedDB-backed settings** with GM_* fallback — cross-tab state sync for read-comment tracking.
- **Accessibility pass pattern** (already in roadmap) — model focus-trap on RES's `settingsNavigation` since it's battle-tested.
```

</details>
