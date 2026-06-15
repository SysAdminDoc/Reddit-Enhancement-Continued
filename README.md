# Reddit Enhancement Continued

A comprehensive enhancement suite for [old.reddit.com](https://old.reddit.com) — themes, media, comments, navigation, filtering, and more. Built as a single-file userscript with zero dependencies.

![Version](https://img.shields.io/badge/version-2.7.5-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-old.reddit.com-orange)

---

## Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox)
   - [Greasemonkey](https://www.greasespot.net/) (Firefox)

2. **[Click here to install Reddit Enhancement Continued](https://github.com/SysAdminDoc/Reddit-Enhancement-Continued/raw/refs/heads/main/RedditEnhancementContinued.user.js)** (or create a new userscript and paste the contents)

3. Visit [old.reddit.com](https://old.reddit.com) — the script loads automatically.

4. Click the **⚙ REL Settings** gear icon (bottom-right) to configure.

---

## Features

### 14 Themes

Every theme provides full coverage across all Reddit elements — headers, sidebars, comments, inputs, popups, buttons, and scrollbars.

| Dark Themes | | |
|---|---|---|
| Dracula | Nord | Solarized Dark |
| Gruvbox | Catppuccin Mocha | AMOLED Black |
| One Dark | Tokyo Night | Rose Pine |
| Kanagawa | Everforest | Synthwave |
| GitHub Dark | | |

| Light Theme |
|---|
| Light (Reddit Classic) |

### Content & Media

- **Inline Image Expansion** — Expand images and videos directly in the feed with drag-to-resize, supporting Reddit, Imgur, Gfycat, RedGifs, and Streamable
- **Inline Image Fix** — Auto-converts bare image links in comments to clickable inline images
- **YouTube Embeds** — Embeds YouTube videos inline with privacy-enhanced mode (youtube-nocookie.com)
- **Reddit Post Previews** — Preview linked Reddit posts without leaving the page
- **Social Media Previews** — Preview Twitter/X and other social media links
- **Single Click Opener** — Adds `[l+c]` buttons to open both link and comments simultaneously
- **Download Buttons** — Adds download buttons for images on posts
- **Post View Counter** — Displays estimated view counts on posts using Reddit's API with smart estimation fallback
- **Vote Estimator** — Shows estimated upvote/downvote counts and percentage breakdown
- **Full Scores** — Shows complete numbers instead of abbreviated (1,234 instead of 1.2k)

### Comments

- **Comment Highlighting** — Highlights new comments since your last visit with a colored left border
- **Rainbow Depth Indicators** — Color-coded nesting bars (rainbow, warm, cool, or pastel palettes)
- **Collapse Child Comments** — Per-comment and page-wide toggle buttons to collapse reply threads, with auto-hide and nested toggle options
- **Formatting Toolbar** — Markdown formatting buttons (bold, italic, strikethrough, links, code, lists, headings) with live preview
- **Expand Continue Thread** — Load continued comment threads inline without page navigation
- **Hide Bot Comments** — Auto-collapses AutoModerator, subreddit mod-bots, and other known bots with a click-to-reveal toggle
- **Animated Role Flair** — Pulsing glows, gradient badges, and emoji indicators for OP, moderators, admins, and friends

### Navigation

- **Never Ending Reddit** — Infinite scroll with configurable pause-after-N-pages
- **Keyboard Navigation** — Navigate posts/comments with `j`/`k`, vote with `a`/`z`, expand with `x`, open with `Enter`
- **Page Navigator** — Floating scroll-to-top/bottom buttons
- **Subreddit Shortcuts** — Custom shortcut bar for quick subreddit access
- **Old Reddit Redirect** — Automatically redirects `www.reddit.com` to `old.reddit.com`
- **Notification Redirect** — Redirects to `sh.reddit.com/notifications` (which actually works on old Reddit)
- **State Saver** — Preserves scroll position when navigating back from posts

### Filtering & Privacy

- **Post Filtering** — Filter posts by keyword, domain, subreddit, flair, or user with optional regex support
- **User Tagging** — Tag users with custom labels and colors that persist across threads
- **User Ignore List** — Hide all posts and comments from specific users
- **No Participation Mode** — Disables voting and commenting on `np.reddit.com` links
- **Ad Blocker** — Removes promoted posts and Reddit banners with a safety check that auto-restores content if legitimate posts are accidentally hidden
- **NSFW Filter** — Option to hide NSFW-flagged posts
- **Hide Visited** — Option to fade or hide previously visited links

### Appearance & UI

- **Enhanced UI** — Modern typography system, card-style post layout, polished interactions and hover effects
- **Collapsible Sidebar** — Toggle sidebar visibility with a floating tab
- **Wide View** — Expand content area to full screen width
- **Custom CSS** — Add your own CSS rules via the settings panel
- **Remove Subreddit Styles** — Strip custom CSS from subreddits for a consistent look
- **Classic Snoo Favicon** — Restores the 2006–2022 Reddit favicon
- **Hide Buttons** — Individually toggle hide/show for Gold, Share, Save, Crosspost, and Report buttons
- **Cake Day Celebration** — SVG cake icon, rainbow username shimmer, and particle effects for users on their cake day

### Vote Enhancements

- **Color-Coded Scores** — Upvoted (orange), downvoted (blue), and unvoted (muted) scores
- **Vote Burst Animations** — Particle effects, ring pulse, and flash on upvote/downvote
- **Vote Weight Tracking** — Tracks net votes per user and displays cumulative weight

---

## Settings

All settings are accessible from the **⚙** gear icon in the bottom-right corner. Settings are organized into tabs:

| Tab | What's in it |
|---|---|
| **Appearance** | Theme selection, dark mode, sidebar, wide view, button visibility, custom CSS |
| **Content** | Media embedding, image expansion, timestamps, user info, view counters, vote estimates |
| **Comments** | Highlighting, depth indicators, child collapse, formatting toolbar, bot hiding |
| **Navigation** | Infinite scroll, keyboard nav, shortcuts, redirects, state saver |
| **Filtering** | Keyword/domain/subreddit/flair/user filters, regex, NSFW toggle, ignore list |
| **Privacy** | No participation mode, ad blocker |
| **Backup** | Export/import all settings, tags, filters, and macros as JSON |

Changes auto-save. Some settings (like theme switching and button hiding) apply instantly; others require a page reload.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `j` / `k` | Next / previous post or comment |
| `a` / `z` | Upvote / downvote selected entry |
| `x` | Expand/collapse selected entry |
| `Enter` | Open selected link |
| `c` | Open comments for selected post |
| `r` | Reply to selected comment |
| `l` | Open link in new tab |
| `h` | Hide selected post |
| `s` | Save selected post |

---

## How It Works

Reddit Enhancement Continued is a single `~5,600` line userscript that runs at `document-start` for zero-flicker theme application. Key architectural decisions:

- **Zero jQuery dependency** — Old Reddit's jQuery bundle has broken plugins (`$.fn.thing`, slideUp, etc.). REL intercepts all click events natively via `MutationObserver` + capturing event listeners, handling replies, votes, dropdowns, and comment collapsing without touching Reddit's broken JavaScript.
- **Pure CSS theming** — Themes are applied via `GM_addStyle` with `!important` overrides, covering every Reddit element including subreddit custom stylesheets.
- **Shared API cache** — View Counter and Vote Estimator share a single `PostDataCache` to avoid duplicate API calls to Reddit's JSON endpoints.
- **NER-compatible modules** — Every module implements a `process(container)` method that handles both initial page load and dynamically loaded Never Ending Reddit content.
- **Safety checks** — The ad blocker includes a post-load verification that auto-restores content if >90% of posts are accidentally hidden.

---

## Compatibility

- **Browser**: Chrome, Firefox, Edge, Safari (any browser supporting userscript managers)
- **Userscript Manager**: Tampermonkey (recommended), Violentmonkey, Greasemonkey
- **Site**: `old.reddit.com` only — does not run on new Reddit (`sh.reddit.com`)
- **RES**: Compatible alongside Reddit Enhancement Suite

---

## Credits

- **Classic Reddit++ features** (view counter, vote estimator, full scores, username prefix, trending subreddits, notification redirect) adapted from [Classic Reddit++](https://greasyfork.org/en/scripts/456520-classic-reddit) by SlippingGitty
- **Old Reddit Favicon** based on [2006-2022 reddit favicon](https://greasyfork.org/en/scripts/456783-2006-2022-reddit-favicon) userscript
- Theme color palettes from their respective open-source projects (Dracula, Nord, Solarized, Gruvbox, Catppuccin, One Dark, Tokyo Night, Rose Pine, Kanagawa, Everforest)

---

## License

MIT
