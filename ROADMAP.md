# Reddit Enhancement Continued Roadmap

Single-file userscript for old.reddit.com — 14 themes, inline media, comment polish, navigation, filters, vote/view estimators. Roadmap extends filter depth, hardens against Reddit API changes, and adds cross-device settings.

## Planned Features

### Media
- Native Reddit gallery navigator (arrow keys, preload next, dimensions badge)
- Redgifs / Streamable HLS refresh for 2026 API
- Catbox.moe / imgchest / imgbb expandos
- Twitter/X embed via syndication fallback (no external iframe)
- Inline `v.redd.it` audio remux (DASH audio + video)

### Filtering
- Per-subreddit filter overrides (strict on r/news, lenient on r/funny)
- Regex groups with named rules + hit counter per rule
- Shared block-list import format (text file, one rule per line)
- Sweep mode — bulk-tag or bulk-hide historical comments from a user
- AI-free "low effort post" heuristic (title length, cap ratio, emoji density) as an opt-in filter

### Comments
- Live comment refresh (without full reload) with highlight on new
- Citation-style quote button (selects text → formats as `>`)
- Per-user note sync across threads (already tagged — add rich notes field)
- Inline spoiler tag respect (`>!...!<`) parity with new Reddit
- Markdown live preview on reply form

### Navigation
- Saved filters / searches menu
- Multi-reddit builder UI inside REC
- Session tabs — remember open threads on reload
- "Mark all as read" bulk inbox action

### Settings / Sync
- Cloud sync via user's own gist/webdav/pastebin (opt-in, encrypted)
- Per-device profile toggle
- Settings diff against default (so you know what you actually customized)
- One-click factory reset with backup

### Performance / Stability
- `MutationObserver` tear-down audit on SPA-like reloads
- Memory leak tests for NER long-scroll sessions
- Reddit API change auto-detection (canary fetch) with toast warning

## Competitive Research
- **RES / RES-Slim** — feature ancestor. Lesson: REC's unique hooks are the 14 themes, vote-burst FX, and the settings UX polish.
- **Reddit Classic Plus / Classic Reddit++** — already credited in README. Lesson: keep pulling upstream-compatible tweaks.
- **Old Reddit Redirect** — tiny, focused. Lesson: REC already subsumes it; advertise explicitly.
- **Baconreader / Apollo (dead)** — polished mobile clients. Lesson: bring their card layout ideas to the desktop Wide/Card view.

## Nice-to-Haves
- Touch swipe gestures on touch-screen laptops
- Accessibility pass on all modals (focus trap, ARIA)
- "Reddit in the style of Discord" experimental layout
- Exportable theme palette editor
- Per-theme font-pairing picker
- Lightweight analytics panel ("your ad-block saved N posts")

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
