// ==UserScript==
// @name         Reddit Enhancement Continued
// @namespace    https://github.com/SysAdminDoc/Reddit-Enhancement-Continued
// @version      2.8.2
// @description  A comprehensive enhancement suite for old.reddit.com - themes, navigation, filtering, media, and more
// @author       Reddit Enhancement Continued
// @match        https://old.reddit.com/*
// @match        https://www.reddit.com/*
// @match        https://reddit.com/*
// @exclude      https://*.reddit.com/poll/*
// @exclude      https://*.reddit.com/gallery/*
// @exclude      https://www.reddit.com/media*
// @exclude      https://chat.reddit.com/*
// @exclude      https://www.reddit.com/appeal*
// @exclude      https://www.reddit.com/notifications*
// @exclude      https://embed.reddit.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      i.redd.it
// @connect      v.redd.it
// @connect      preview.redd.it
// @connect      imgur.com
// @connect      i.imgur.com
// @connect      gfycat.com
// @connect      redgifs.com
// @connect      streamable.com
// @connect      api.streamable.com
// @connect      api.redgifs.com
// @connect      catbox.moe
// @connect      files.catbox.moe
// @connect      imgchest.com
// @connect      cdn.imgchest.com
// @connect      imgbb.com
// @connect      ibb.co
// @connect      i.ibb.co
// @connect      cdn.syndication.twimg.com
// @connect      publish.twitter.com
// @connect      reddit.com
// @connect      old.reddit.com
// @connect      www.reddit.com
// @connect      api.reddit.com
// @connect      api.github.com
// @connect      pastebin.com
// @run-at       document-start
// @icon         https://b.thumbs.redditmedia.com/JeP1WF0kEiiH1gT8vOr_7kFAwIlHzRBHjLDZIkQP61Q.jpg
// @downloadURL  https://github.com/SysAdminDoc/Reddit-Enhancement-Continued/raw/refs/heads/main/RedditEnhancementContinued.user.js
// @updateURL    https://github.com/SysAdminDoc/Reddit-Enhancement-Continued/raw/refs/heads/main/RedditEnhancementContinued.user.js
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // =========================================================================
    // CONFIGURATION & STORAGE
    // =========================================================================
    const VERSION = '2.8.2';

    const CONFIG = {
        version: VERSION,
        storageKeys: {
            settings: 'rel_settings_v2',
            userTags: 'rel_user_tags',
            visitedComments: 'rel_visited_comments',
            filters: 'rel_filters_v2',
            subredditShortcuts: 'rel_sr_shortcuts',
            ignoredUsers: 'rel_ignored_users',
            voteWeights: 'rel_vote_weights',
            commentMacros: 'rel_comment_macros',
            settingsBackup: 'rel_backup',
            savedViews: 'rel_saved_views_v1',
            multiReddits: 'rel_multireddits_v1',
            customPalettes: 'rel_custom_palettes_v1',
            fontPairings: 'rel_font_pairings_v1',
            analytics: 'rel_analytics_v1'
        },
        defaults: {
            // Core
            darkMode: true,
            theme: 'amoled',
            neverEndingReddit: true,
            nerPauseAfterPages: 0,
            inlineImageExpansion: true,
            userTagging: true,
            keyboardNav: true,
            commentHighlighting: true,
            spoilerTags: true,
            liveCommentRefresh: false,
            liveCommentRefreshSeconds: 60,
            collapseChildComments: true,
            collapseChildCommentsDefault: true,
            collapseChildCommentsNested: false,
            collapseChildCommentsHideNested: false,
            postFiltering: true,
            lowEffortHeuristic: false,
            lowEffortThreshold: 2,
            highlightNewComments: true,
            oldRedditRedirect: true,
            oldFavicon: true,
            collapsibleSidebar: true,
            hideAutoModerator: true,
            embedYouTube: true,
            embedRedditPreviews: true,
            inlineImageFix: true,
            embedSocialMedia: true,
            // New v2 features
            commentDepthIndicators: true,
            formattingToolbar: true,
            livePreview: true,
            voteEnhancements: true,
            singleClickOpener: true,
            pageNavigator: true,
            subredditShortcuts: true,
            userHighlighter: true,
            selectedEntryHighlight: true,
            expandContinueThread: true,
            noParticipation: true,
            showTimestamps: true,
            hideGoldButton: true,
            hideShareButton: true,
            hideSaveButton: true,
            hideCrosspostButton: true,
            hideReportButton: true,
            hideSidebar: true,
            autoHideAfterVote: false,
            scrollToTopOnNav: true,
            showUserInfo: true,
            customCSS: '',
            // Depth color scheme
            depthColorScheme: 'rainbow',
            // Keyboard shortcut modifier
            kbModifier: 'none',
            // New v2.1 features from uploaded scripts
            removeSubredditStyles: true,
            wideView: true,
            subredditDescription: true,
            stateSaver: true,
            downloadButtons: true,
            adBlocker: true,
            // v2.4 UX enhancements
            enhancedUI: true,
            // v2.7 Classic Reddit++ features
            viewCounter: true,
            voteEstimator: true,
            fullScores: true,
            userPrefix: true,
            notificationRedirect: true,
            trendingSubreddits: false,
            syncProvider: 'none',
            syncEndpoint: '',
            syncUsername: '',
            syncToken: '',
            perDeviceProfile: false,
            savedViewsMenu: true,
            multiRedditBuilder: true,
            sessionTabs: true,
            markAllAsRead: true,
            apiCanary: true,
            apiCanaryIntervalHours: 24,
            touchGestures: true,
            touchSwipeThreshold: 80,
            discordLayout: false,
            analyticsEnabled: false,
            // Migration flag (skip v2.2.1 migration for new installs)
            _migratedV221: true
        }
    };

    // =========================================================================
    // STORAGE ENGINE
    // =========================================================================
    const Storage = {
        get(key, defaultValue = null) {
            try {
                const value = GM_getValue(key, null);
                return value !== null ? JSON.parse(value) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },
        set(key, value) {
            GM_setValue(key, JSON.stringify(value));
        },
        remove(key) {
            GM_deleteValue(key);
        },
        downloadJSON(json, filename) {
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        },
        createFactoryBackup() {
            const payload = this.exportAll();
            this.set(FACTORY_BACKUP_KEY, { version: VERSION, createdAt: new Date().toISOString(), payload });
            try { this.downloadJSON(payload, `rel-factory-backup-${new Date().toISOString().slice(0, 10)}.json`); } catch {}
            return payload;
        },
        exportAll() {
            const data = {};
            Object.entries(CONFIG.storageKeys).forEach(([name, key]) => {
                data[name] = Storage.get(key);
            });
            return JSON.stringify(data, null, 2);
        },
        importAll(jsonString) {
            try {
                const data = JSON.parse(jsonString);
                Object.entries(CONFIG.storageKeys).forEach(([name, key]) => {
                    if (data[name] !== undefined) {
                        Storage.set(key, data[name]);
                    }
                });
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    const FACTORY_BACKUP_KEY = 'rel_factory_backup_v1';
    const SHARED_SETTINGS_KEY = 'rel_settings_v2';
    const PROFILE_MODE_KEY = 'rel_profile_mode_v1';
    const PROFILE_ID_KEY = 'rel_profile_id_v1';
    let profileMode = Storage.get(PROFILE_MODE_KEY, 'shared') === 'device' ? 'device' : 'shared';
    let profileId = Storage.get(PROFILE_ID_KEY, '');
    if (!/^[a-z0-9-]{8,80}$/i.test(String(profileId))) {
        profileId = `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        Storage.set(PROFILE_ID_KEY, profileId);
    }
    function buildProfileStorageKey(mode, id = profileId) {
        return mode === 'device' ? `${SHARED_SETTINGS_KEY}_${String(id).replace(/[^a-z0-9-]/gi, '').slice(0, 80)}` : SHARED_SETTINGS_KEY;
    }
    CONFIG.storageKeys.settings = buildProfileStorageKey(profileMode);

    // Load settings with migration from v1
    let settings = Storage.get(CONFIG.storageKeys.settings, null);
    if (!settings) {
        const oldSettings = Storage.get('rel_settings', null);
        settings = oldSettings ? { ...CONFIG.defaults, ...oldSettings } : { ...CONFIG.defaults };
    }
    Object.keys(CONFIG.defaults).forEach(key => {
        if (settings[key] === undefined) settings[key] = CONFIG.defaults[key];
    });
    settings.perDeviceProfile = profileMode === 'device';

    // Migration from v2.2.0: reset features that caused post hiding
    if (!settings._migratedV221) {
        settings.adBlocker = CONFIG.defaults.adBlocker;
        settings.removeSubredditStyles = CONFIG.defaults.removeSubredditStyles;
        settings._migratedV221 = true;
        Storage.set(CONFIG.storageKeys.settings, settings);
        console.log('REL: Migrated settings from v2.2.0 - reset adBlocker and removeSubredditStyles to safe defaults');
    }

    function normalizeUserTag(tag) {
        if (!tag || typeof tag !== 'object' || Array.isArray(tag)) return null;
        return {
            text: String(tag.text || '').trim().slice(0, 120),
            color: String(tag.color || 'none'),
            note: String(tag.note || '').trim().slice(0, 1000)
        };
    }

    let userTags = Storage.get(CONFIG.storageKeys.userTags, {});
    if (!userTags || typeof userTags !== 'object' || Array.isArray(userTags)) userTags = {};
    Object.entries(userTags).forEach(([username, tag]) => {
        const normalized = normalizeUserTag(tag);
        if (!normalized) {
            delete userTags[username];
            return;
        }
        userTags[username] = normalized;
    });
    let filters = Storage.get(CONFIG.storageKeys.filters, {
        keywords: [], domains: [], subreddits: [], flairs: [], users: [],
        useRegex: false, hideNSFW: false, hideVisited: false, subredditOverrides: {}, regexGroups: []
    });
    if (!filters || typeof filters !== 'object' || Array.isArray(filters)) filters = {};
    ['keywords', 'domains', 'subreddits', 'flairs', 'users'].forEach(key => {
        if (!Array.isArray(filters[key])) filters[key] = [];
    });
    if (!filters.subredditOverrides || typeof filters.subredditOverrides !== 'object' || Array.isArray(filters.subredditOverrides)) {
        filters.subredditOverrides = {};
    }
    if (!Array.isArray(filters.regexGroups)) filters.regexGroups = [];
    filters.regexGroups = filters.regexGroups.filter(rule => rule && typeof rule === 'object').map((rule, index) => ({
        id: String(rule.id || `regex-${index + 1}`),
        name: String(rule.name || `Rule ${index + 1}`),
        pattern: String(rule.pattern || ''),
        flags: String(rule.flags || 'i').replace(/[^dgimsuvy]/g, ''),
        enabled: rule.enabled !== false,
        hits: Number.isFinite(Number(rule.hits)) ? Math.max(0, Number(rule.hits)) : 0
    }));
    let visitedComments = Storage.get(CONFIG.storageKeys.visitedComments, {});
    let ignoredUsers = Storage.get(CONFIG.storageKeys.ignoredUsers, []);
    let voteWeights = Storage.get(CONFIG.storageKeys.voteWeights, {});
    let subredditShortcuts = Storage.get(CONFIG.storageKeys.subredditShortcuts, []);
    let commentMacros = Storage.get(CONFIG.storageKeys.commentMacros, [
        { name: 'Shrug', text: String.fromCharCode(175) + '\\_(ツ)_/' + String.fromCharCode(175) },
        { name: 'Table Flip', text: '(' + String.fromCharCode(9583) + String.fromCharCode(176) + String.fromCharCode(9633) + String.fromCharCode(176) + ')' + String.fromCharCode(9583) + String.fromCharCode(65077) + ' ' + String.fromCharCode(9531) + String.fromCharCode(9473) + String.fromCharCode(9531) },
        { name: 'Disapproval', text: String.fromCharCode(3232) + '_' + String.fromCharCode(3232) }
    ]);
    let savedViews = Storage.get(CONFIG.storageKeys.savedViews, []);
    if (!Array.isArray(savedViews)) savedViews = [];
    let multiReddits = Storage.get(CONFIG.storageKeys.multiReddits, []);
    if (!Array.isArray(multiReddits)) multiReddits = [];
    let customPalettes = Storage.get(CONFIG.storageKeys.customPalettes, {});
    if (!customPalettes || typeof customPalettes !== 'object' || Array.isArray(customPalettes)) customPalettes = {};
    let fontPairings = Storage.get(CONFIG.storageKeys.fontPairings, {});
    if (!fontPairings || typeof fontPairings !== 'object' || Array.isArray(fontPairings)) fontPairings = {};
    let analyticsStats = Storage.get(CONFIG.storageKeys.analytics, {});
    if (!analyticsStats || typeof analyticsStats !== 'object' || Array.isArray(analyticsStats)) analyticsStats = {};

    function saveSettings() { Storage.set(CONFIG.storageKeys.settings, settings); }
    function saveUserTags() { Storage.set(CONFIG.storageKeys.userTags, userTags); }
    function saveFilters() { Storage.set(CONFIG.storageKeys.filters, filters); }
    function saveVisitedComments() { Storage.set(CONFIG.storageKeys.visitedComments, visitedComments); }
    function saveIgnoredUsers() { Storage.set(CONFIG.storageKeys.ignoredUsers, ignoredUsers); }
    function saveVoteWeights() { Storage.set(CONFIG.storageKeys.voteWeights, voteWeights); }
    function saveShortcuts() { Storage.set(CONFIG.storageKeys.subredditShortcuts, subredditShortcuts); }
    function saveMacros() { Storage.set(CONFIG.storageKeys.commentMacros, commentMacros); }
    function saveSavedViews() { Storage.set(CONFIG.storageKeys.savedViews, savedViews); }
    function saveMultiReddits() { Storage.set(CONFIG.storageKeys.multiReddits, multiReddits); }

    // =========================================================================
    // OLD REDDIT REDIRECT
    // =========================================================================
    if (settings.oldRedditRedirect && window.location.hostname === 'www.reddit.com') {
        if (!window.location.pathname.startsWith('/media') &&
            !window.location.pathname.startsWith('/poll') &&
            !window.location.pathname.startsWith('/gallery') &&
            !window.location.pathname.startsWith('/appeal') &&
            !window.location.pathname.startsWith('/notifications') &&
            !window.location.pathname.startsWith('/chat')) {
            window.location.hostname = 'old.reddit.com';
            return;
        }
    }

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================
    const Utils = {
        isOldReddit() {
            return window.location.hostname === 'old.reddit.com' ||
                   document.querySelector('#header') !== null;
        },
        isCommentsPage() {
            return document.body?.classList.contains('comments-page') ||
                   window.location.pathname.includes('/comments/');
        },
        isListingPage() {
            return document.body?.classList.contains('listing-page') ||
                   document.querySelector('.sitetable.linklisting') !== null;
        },
        isSubreddit() {
            const m = window.location.pathname.match(/^\/r\/([^/]+)/);
            return m ? m[1] : null;
        },
        isUserPage() {
            return window.location.pathname.startsWith('/user/') ||
                   window.location.pathname.startsWith('/u/');
        },
        getUsername() {
            const el = document.querySelector('.user a');
            return el ? el.textContent : null;
        },
        debounce(fn, delay) {
            let timer;
            return function(...args) {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delay);
            };
        },
        throttle(fn, limit) {
            let waiting = false;
            return function(...args) {
                if (!waiting) {
                    fn.apply(this, args);
                    waiting = true;
                    setTimeout(() => { waiting = false; }, limit);
                }
            };
        },
        createElement(tag, attrs = {}, children = []) {
            const el = document.createElement(tag);
            Object.entries(attrs).forEach(([k, v]) => {
                if (k === 'className') el.className = v;
                else if (k === 'innerHTML') el.innerHTML = v;
                else if (k === 'textContent') el.textContent = v;
                else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
                else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
                else el.setAttribute(k, v);
            });
            children.forEach(child => {
                if (typeof child === 'string') el.appendChild(document.createTextNode(child));
                else if (child) el.appendChild(child);
            });
            return el;
        },
        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
            return String(num);
        },
        timeAgo(date) {
            const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
            if (seconds < 60) return 'just now';
            if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
            if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
            if (seconds < 2592000) return Math.floor(seconds / 86400) + 'd ago';
            if (seconds < 31536000) return Math.floor(seconds / 2592000) + 'mo ago';
            return Math.floor(seconds / 31536000) + 'y ago';
        },
        escapeHTML(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },
        copyToClipboard(text) {
            try { GM_setClipboard(text); return true; }
            catch (e) {
                try {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    return true;
                } catch (e2) { return false; }
            }
        },
        getThingData(thing) {
            if (!thing) return null;
            return {
                id: thing.getAttribute('data-fullname') || thing.id,
                author: thing.getAttribute('data-author') || thing.querySelector('.author')?.textContent,
                subreddit: thing.getAttribute('data-subreddit') || thing.querySelector('.subreddit')?.textContent?.replace('/r/', ''),
                domain: thing.getAttribute('data-domain'),
                url: thing.getAttribute('data-url'),
                isNSFW: thing.classList.contains('over18'),
                score: parseInt(thing.querySelector('.score.unvoted')?.title || '0'),
                permalink: thing.getAttribute('data-permalink'),
                flair: thing.querySelector('.linkflairlabel')?.textContent?.trim()
            };
        },
        notify(message, type = 'info', duration = 3000) {
            const toast = Utils.createElement('div', {
                className: `rel-toast rel-toast-${type}`,
                textContent: message
            });
            document.body.appendChild(toast);
            requestAnimationFrame(() => toast.classList.add('rel-toast-show'));
            setTimeout(() => {
                toast.classList.remove('rel-toast-show');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },
        processNewContent(container) {
            if (settings.inlineImageExpansion) ImageExpansionModule.process(container);
            if (settings.userTagging) UserTaggingModule.process(container);
            if (settings.collapseChildComments) CollapseChildCommentsModule.process(container);
            if (settings.commentHighlighting) CommentHighlightingModule.process(container);
            if (settings.hideAutoModerator) HideAutoModeratorModule.process(container);
            IgnoredUsersModule.process(container);
            if (settings.embedYouTube) YouTubeEmbedModule.process(container);
            if (settings.embedRedditPreviews) RedditPreviewModule.process(container);
            if (settings.inlineImageFix) InlineImageFixModule.process(container);
            if (settings.embedSocialMedia) SocialMediaPreviewModule.process(container);
            if (settings.commentDepthIndicators) CommentDepthModule.process(container);
            if (settings.singleClickOpener) SingleClickModule.process(container);
            if (settings.userHighlighter) UserHighlighterModule.process(container);
            if (settings.showTimestamps) TimestampModule.process(container);
            if (settings.expandContinueThread) ExpandThreadModule.process(container);
            if (settings.voteEnhancements) VoteEnhancementsModule.process(container);
            if (settings.formattingToolbar) FormattingToolbarModule.process(container);
            if (settings.formattingToolbar) QuoteSelectionModule.process(container);
            if (settings.spoilerTags) SpoilerTagModule.process(container);
            if (settings.selectedEntryHighlight) SelectedEntryModule.process(container);
            if (settings.postFiltering) FilterModule.process(container);
            if (settings.noParticipation) NoParticipationModule.process(container);
            if (settings.showUserInfo) UserInfoModule.process(container);
            if (settings.downloadButtons) DownloadButtonsModule.process(container);
            if (settings.adBlocker) AdBlockModule.process(container);
            if (settings.viewCounter) ViewCounterModule.process(container);
            if (settings.voteEstimator) VoteEstimatorModule.process(container);
        }
    };

    // =========================================================================
    // MUTATION OBSERVER REGISTRY
    // =========================================================================
    const ObserverRegistry = {
        records: new Map(),
        keys: new Map(),

        observe(target, callback, options, key = '') {
            if (!target || typeof callback !== 'function') return null;
            if (key && this.keys.has(key)) this.unregister(this.keys.get(key));
            const observer = new MutationObserver(callback);
            try {
                observer.observe(target, options);
            } catch (error) {
                console.warn('REL ObserverRegistry: could not observe target', error);
                return null;
            }
            this.records.set(observer, { observer, target, callback, options, key, connected: true });
            if (key) this.keys.set(key, observer);
            return observer;
        },

        disconnect(observer) {
            const record = this.records.get(observer);
            if (!record) {
                observer?.disconnect?.();
                return false;
            }
            record.observer.disconnect();
            record.connected = false;
            return true;
        },

        unregister(observer) {
            const record = this.records.get(observer);
            if (!record) return false;
            record.observer.disconnect();
            this.records.delete(observer);
            if (record.key && this.keys.get(record.key) === observer) this.keys.delete(record.key);
            return true;
        },

        disconnectAll() {
            this.records.forEach(record => {
                record.observer.disconnect();
                record.connected = false;
            });
        },

        reconnectAll() {
            this.records.forEach(record => {
                try {
                    record.observer.observe(record.target, record.options);
                    record.connected = true;
                } catch {
                    record.connected = false;
                }
            });
        },

        audit() {
            return [...this.records.values()].map(record => ({ key: record.key, connected: record.connected }));
        },

        clear() {
            this.records.forEach(record => record.observer.disconnect());
            this.records.clear();
            this.keys.clear();
        }
    };

    const ObserverLifecycleModule = {
        init() {
            window.addEventListener('pagehide', () => ObserverRegistry.disconnectAll());
            window.addEventListener('pageshow', event => { if (event.persisted) ObserverRegistry.reconnectAll(); });
        }
    };

    // =========================================================================
    // MODAL ACCESSIBILITY MODULE
    // =========================================================================
    const ModalA11yModule = {
        current: null,
        focusableSelector: 'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',

        getFocusable(container) {
            return [...container.querySelectorAll(this.focusableSelector)].filter(element => {
                if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false;
                return element.offsetWidth !== 0 || element.offsetHeight !== 0 || element === document.activeElement;
            });
        },

        getNextFocusIndex(length, currentIndex, backwards = false) {
            if (length <= 0) return -1;
            if (currentIndex < 0) return backwards ? length - 1 : 0;
            return (currentIndex + (backwards ? -1 : 1) + length) % length;
        },

        attach(container, panel, close) {
            panel.setAttribute('role', 'dialog');
            panel.setAttribute('aria-modal', 'true');
            panel.setAttribute('tabindex', '-1');
            const heading = panel.querySelector('h1, h2, h3, [data-modal-title]');
            if (heading) {
                const id = heading.id || `rel-modal-title-${Date.now().toString(36)}`;
                heading.id = id;
                panel.setAttribute('aria-labelledby', id);
            } else if (!panel.getAttribute('aria-label')) {
                panel.setAttribute('aria-label', 'Reddit Enhancement Continued dialog');
            }
            const previous = document.activeElement;
            let closed = false;
            const onKeydown = event => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    close();
                    return;
                }
                if (event.key !== 'Tab') return;
                const focusable = this.getFocusable(panel);
                if (focusable.length === 0) {
                    event.preventDefault();
                    panel.focus();
                    return;
                }
                const currentIndex = focusable.indexOf(document.activeElement);
                const nextIndex = this.getNextFocusIndex(focusable.length, currentIndex, event.shiftKey);
                const atBoundary = event.shiftKey ? currentIndex <= 0 : currentIndex === focusable.length - 1;
                if (currentIndex < 0 || atBoundary) {
                    event.preventDefault();
                    focusable[nextIndex]?.focus?.();
                }
            };
            container.addEventListener('keydown', onKeydown);
            const record = {
                cleanup: () => {
                    if (closed) return;
                    closed = true;
                    container.removeEventListener('keydown', onKeydown);
                    if (this.current === record) this.current = null;
                    previous?.focus?.();
                }
            };
            this.current?.cleanup?.();
            this.current = record;
            requestAnimationFrame(() => this.getFocusable(panel)[0]?.focus?.() || panel.focus());
            return record.cleanup;
        },

        getDialogAttributes() {
            return { role: 'dialog', modal: 'true', labelledBy: true, focusTrap: true };
        }
    };

    // =========================================================================
    // THEME ENGINE
    // =========================================================================
    const Themes = {
        // Base color definitions per theme
        definitions: {
            dracula: {
                name: 'Dracula',
                bg: '#282a36', bgAlt: '#21222c', bgLight: '#343746',
                surface: '#44475a', surfaceHover: '#4e5270',
                fg: '#f8f8f2', fgMuted: '#bbb8c3', fgDim: '#6272a4',
                accent: '#bd93f9', accentHover: '#caa4ff',
                link: '#8be9fd', linkVisited: '#ff79c6',
                upvote: '#ff79c6', downvote: '#50fa7b',
                border: '#44475a', borderLight: '#383a4a',
                success: '#50fa7b', warning: '#f1fa8c', error: '#ff5555',
                highlight: 'rgba(189,147,249,0.12)', selection: 'rgba(189,147,249,0.25)',
                headerBg: '#21222c', headerFg: '#f8f8f2',
                inputBg: '#383a4a', inputFg: '#f8f8f2', inputBorder: '#555770',
                tagBg: '#44475a', tagFg: '#f8f8f2',
                buttonBg: '#6272a4', buttonFg: '#f8f8f2',
                shadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.75)',
                scrollbar: '#555770', scrollbarHover: '#6272a4'
            },
            nord: {
                name: 'Nord',
                bg: '#2e3440', bgAlt: '#272c36', bgLight: '#3b4252',
                surface: '#434c5e', surfaceHover: '#4c566a',
                fg: '#eceff4', fgMuted: '#bfc5cf', fgDim: '#7b88a1',
                accent: '#88c0d0', accentHover: '#8fbcbb',
                link: '#88c0d0', linkVisited: '#b48ead',
                upvote: '#bf616a', downvote: '#a3be8c',
                border: '#3b4252', borderLight: '#434c5e',
                success: '#a3be8c', warning: '#ebcb8b', error: '#bf616a',
                highlight: 'rgba(136,192,208,0.12)', selection: 'rgba(136,192,208,0.25)',
                headerBg: '#272c36', headerFg: '#eceff4',
                inputBg: '#3b4252', inputFg: '#eceff4', inputBorder: '#4c566a',
                tagBg: '#434c5e', tagFg: '#eceff4',
                buttonBg: '#5e81ac', buttonFg: '#eceff4',
                shadow: 'rgba(0,0,0,0.35)', overlay: 'rgba(0,0,0,0.7)',
                scrollbar: '#4c566a', scrollbarHover: '#5e81ac'
            },
            solarizedDark: {
                name: 'Solarized Dark',
                bg: '#002b36', bgAlt: '#002029', bgLight: '#073642',
                surface: '#0a4050', surfaceHover: '#0d4f60',
                fg: '#fdf6e3', fgMuted: '#c4bda8', fgDim: '#657b83',
                accent: '#268bd2', accentHover: '#2e9ee8',
                link: '#268bd2', linkVisited: '#d33682',
                upvote: '#cb4b16', downvote: '#859900',
                border: '#073642', borderLight: '#094452',
                success: '#859900', warning: '#b58900', error: '#dc322f',
                highlight: 'rgba(38,139,210,0.12)', selection: 'rgba(38,139,210,0.25)',
                headerBg: '#002029', headerFg: '#fdf6e3',
                inputBg: '#073642', inputFg: '#fdf6e3', inputBorder: '#0a4050',
                tagBg: '#0a4050', tagFg: '#fdf6e3',
                buttonBg: '#268bd2', buttonFg: '#fdf6e3',
                shadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.75)',
                scrollbar: '#0a4050', scrollbarHover: '#268bd2'
            },
            gruvbox: {
                name: 'Gruvbox',
                bg: '#282828', bgAlt: '#1d2021', bgLight: '#3c3836',
                surface: '#504945', surfaceHover: '#665c54',
                fg: '#ebdbb2', fgMuted: '#c9b88c', fgDim: '#928374',
                accent: '#fabd2f', accentHover: '#fdd560',
                link: '#83a598', linkVisited: '#d3869b',
                upvote: '#fb4934', downvote: '#b8bb26',
                border: '#3c3836', borderLight: '#504945',
                success: '#b8bb26', warning: '#fabd2f', error: '#fb4934',
                highlight: 'rgba(250,189,47,0.12)', selection: 'rgba(250,189,47,0.25)',
                headerBg: '#1d2021', headerFg: '#ebdbb2',
                inputBg: '#3c3836', inputFg: '#ebdbb2', inputBorder: '#504945',
                tagBg: '#504945', tagFg: '#ebdbb2',
                buttonBg: '#689d6a', buttonFg: '#ebdbb2',
                shadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.75)',
                scrollbar: '#504945', scrollbarHover: '#689d6a'
            },
            catppuccin: {
                name: 'Catppuccin Mocha',
                bg: '#1e1e2e', bgAlt: '#181825', bgLight: '#313244',
                surface: '#45475a', surfaceHover: '#585b70',
                fg: '#cdd6f4', fgMuted: '#b0b8d1', fgDim: '#6c7086',
                accent: '#cba6f7', accentHover: '#dbb8ff',
                link: '#89b4fa', linkVisited: '#f38ba8',
                upvote: '#f38ba8', downvote: '#a6e3a1',
                border: '#313244', borderLight: '#45475a',
                success: '#a6e3a1', warning: '#f9e2af', error: '#f38ba8',
                highlight: 'rgba(203,166,247,0.12)', selection: 'rgba(203,166,247,0.25)',
                headerBg: '#181825', headerFg: '#cdd6f4',
                inputBg: '#313244', inputFg: '#cdd6f4', inputBorder: '#45475a',
                tagBg: '#45475a', tagFg: '#cdd6f4',
                buttonBg: '#74c7ec', buttonFg: '#1e1e2e',
                shadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.75)',
                scrollbar: '#45475a', scrollbarHover: '#74c7ec'
            },
            amoled: {
                name: 'AMOLED Black',
                bg: '#000000', bgAlt: '#000000', bgLight: '#111111',
                surface: '#1a1a1a', surfaceHover: '#252525',
                fg: '#e0e0e0', fgMuted: '#aaaaaa', fgDim: '#666666',
                accent: '#4fc3f7', accentHover: '#6dd3ff',
                link: '#4fc3f7', linkVisited: '#ce93d8',
                upvote: '#ff5252', downvote: '#69f0ae',
                border: '#1a1a1a', borderLight: '#222222',
                success: '#69f0ae', warning: '#ffd740', error: '#ff5252',
                highlight: 'rgba(79,195,247,0.1)', selection: 'rgba(79,195,247,0.2)',
                headerBg: '#000000', headerFg: '#e0e0e0',
                inputBg: '#111111', inputFg: '#e0e0e0', inputBorder: '#333333',
                tagBg: '#1a1a1a', tagFg: '#e0e0e0',
                buttonBg: '#333333', buttonFg: '#e0e0e0',
                shadow: 'rgba(0,0,0,0.6)', overlay: 'rgba(0,0,0,0.85)',
                scrollbar: '#333333', scrollbarHover: '#4fc3f7'
            },
            oneDark: {
                name: 'One Dark',
                bg: '#282c34', bgAlt: '#21252b', bgLight: '#2c313c',
                surface: '#3e4451', surfaceHover: '#4b5263',
                fg: '#abb2bf', fgMuted: '#9199a5', fgDim: '#5c6370',
                accent: '#61afef', accentHover: '#74baf2',
                link: '#61afef', linkVisited: '#c678dd',
                upvote: '#e06c75', downvote: '#98c379',
                border: '#3e4451', borderLight: '#2c313c',
                success: '#98c379', warning: '#e5c07b', error: '#e06c75',
                highlight: 'rgba(97,175,239,0.12)', selection: 'rgba(97,175,239,0.25)',
                headerBg: '#21252b', headerFg: '#abb2bf',
                inputBg: '#2c313c', inputFg: '#abb2bf', inputBorder: '#3e4451',
                tagBg: '#3e4451', tagFg: '#abb2bf',
                buttonBg: '#528bca', buttonFg: '#abb2bf',
                shadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.75)',
                scrollbar: '#3e4451', scrollbarHover: '#528bca'
            },
            light: {
                name: 'Light (Reddit Classic)',
                bg: '#ffffff', bgAlt: '#f6f7f8', bgLight: '#eef0f2',
                surface: '#e2e4e6', surfaceHover: '#d6d8da',
                fg: '#1a1a1b', fgMuted: '#5a5c5e', fgDim: '#878a8c',
                accent: '#0079d3', accentHover: '#005fa3',
                link: '#0079d3', linkVisited: '#7b5090',
                upvote: '#ff4500', downvote: '#7193ff',
                border: '#e2e4e6', borderLight: '#edeff1',
                success: '#46d160', warning: '#e9a820', error: '#ea0027',
                highlight: 'rgba(0,121,211,0.08)', selection: 'rgba(0,121,211,0.15)',
                headerBg: '#cee3f8', headerFg: '#1a1a1b',
                inputBg: '#ffffff', inputFg: '#1a1a1b', inputBorder: '#c4c6c8',
                tagBg: '#e2e4e6', tagFg: '#1a1a1b',
                buttonBg: '#0079d3', buttonFg: '#ffffff',
                shadow: 'rgba(0,0,0,0.1)', overlay: 'rgba(0,0,0,0.5)',
                scrollbar: '#c4c6c8', scrollbarHover: '#888'
            },
            tokyoNight: {
                name: 'Tokyo Night',
                bg: '#1a1b26', bgAlt: '#16161e', bgLight: '#24283b',
                surface: '#2f3549', surfaceHover: '#3b4261',
                fg: '#c0caf5', fgMuted: '#9aa5ce', fgDim: '#565f89',
                accent: '#7aa2f7', accentHover: '#89b4fa',
                link: '#7dcfff', linkVisited: '#bb9af7',
                upvote: '#f7768e', downvote: '#9ece6a',
                border: '#292e42', borderLight: '#3b4261',
                success: '#9ece6a', warning: '#e0af68', error: '#f7768e',
                highlight: 'rgba(122,162,247,0.12)', selection: 'rgba(122,162,247,0.25)',
                headerBg: '#16161e', headerFg: '#c0caf5',
                inputBg: '#24283b', inputFg: '#c0caf5', inputBorder: '#3b4261',
                tagBg: '#2f3549', tagFg: '#c0caf5',
                buttonBg: '#7aa2f7', buttonFg: '#1a1b26',
                shadow: 'rgba(0,0,0,0.45)', overlay: 'rgba(0,0,0,0.75)',
                scrollbar: '#3b4261', scrollbarHover: '#7aa2f7'
            },
            rosePine: {
                name: 'Rose Pine',
                bg: '#191724', bgAlt: '#1f1d2e', bgLight: '#26233a',
                surface: '#312e48', surfaceHover: '#3d3958',
                fg: '#e0def4', fgMuted: '#bfbdd4', fgDim: '#6e6a86',
                accent: '#c4a7e7', accentHover: '#d4bff7',
                link: '#9ccfd8', linkVisited: '#f6c177',
                upvote: '#eb6f92', downvote: '#31748f',
                border: '#26233a', borderLight: '#312e48',
                success: '#9ccfd8', warning: '#f6c177', error: '#eb6f92',
                highlight: 'rgba(196,167,231,0.12)', selection: 'rgba(196,167,231,0.25)',
                headerBg: '#1f1d2e', headerFg: '#e0def4',
                inputBg: '#26233a', inputFg: '#e0def4', inputBorder: '#3d3958',
                tagBg: '#312e48', tagFg: '#e0def4',
                buttonBg: '#c4a7e7', buttonFg: '#191724',
                shadow: 'rgba(0,0,0,0.45)', overlay: 'rgba(0,0,0,0.75)',
                scrollbar: '#3d3958', scrollbarHover: '#c4a7e7'
            },
            kanagawa: {
                name: 'Kanagawa',
                bg: '#1f1f28', bgAlt: '#16161d', bgLight: '#2a2a37',
                surface: '#363646', surfaceHover: '#43434f',
                fg: '#dcd7ba', fgMuted: '#c8c093', fgDim: '#727169',
                accent: '#7e9cd8', accentHover: '#8fb4e8',
                link: '#7fb4ca', linkVisited: '#957fb8',
                upvote: '#e82424', downvote: '#98bb6c',
                border: '#2a2a37', borderLight: '#363646',
                success: '#98bb6c', warning: '#e6c384', error: '#e82424',
                highlight: 'rgba(126,156,216,0.12)', selection: 'rgba(126,156,216,0.25)',
                headerBg: '#16161d', headerFg: '#dcd7ba',
                inputBg: '#2a2a37', inputFg: '#dcd7ba', inputBorder: '#43434f',
                tagBg: '#363646', tagFg: '#dcd7ba',
                buttonBg: '#7e9cd8', buttonFg: '#1f1f28',
                shadow: 'rgba(0,0,0,0.45)', overlay: 'rgba(0,0,0,0.75)',
                scrollbar: '#43434f', scrollbarHover: '#7e9cd8'
            },
            everforest: {
                name: 'Everforest',
                bg: '#2d353b', bgAlt: '#272e33', bgLight: '#343f44',
                surface: '#3d484d', surfaceHover: '#475258',
                fg: '#d3c6aa', fgMuted: '#b8ad92', fgDim: '#7a8478',
                accent: '#a7c080', accentHover: '#b8d190',
                link: '#83c092', linkVisited: '#d699b6',
                upvote: '#e67e80', downvote: '#83c092',
                border: '#3d484d', borderLight: '#475258',
                success: '#83c092', warning: '#dbbc7f', error: '#e67e80',
                highlight: 'rgba(167,192,128,0.12)', selection: 'rgba(167,192,128,0.25)',
                headerBg: '#272e33', headerFg: '#d3c6aa',
                inputBg: '#343f44', inputFg: '#d3c6aa', inputBorder: '#475258',
                tagBg: '#3d484d', tagFg: '#d3c6aa',
                buttonBg: '#a7c080', buttonFg: '#2d353b',
                shadow: 'rgba(0,0,0,0.4)', overlay: 'rgba(0,0,0,0.7)',
                scrollbar: '#475258', scrollbarHover: '#a7c080'
            },
            synthwave: {
                name: 'Synthwave',
                bg: '#1b1720', bgAlt: '#151019', bgLight: '#261e2e',
                surface: '#352b3f', surfaceHover: '#433752',
                fg: '#f0e4fc', fgMuted: '#c8b8dc', fgDim: '#7b6995',
                accent: '#ff7edb', accentHover: '#ff9ce5',
                link: '#36f9f6', linkVisited: '#fede5d',
                upvote: '#fe4450', downvote: '#72f1b8',
                border: '#2a2139', borderLight: '#352b3f',
                success: '#72f1b8', warning: '#fede5d', error: '#fe4450',
                highlight: 'rgba(255,126,219,0.12)', selection: 'rgba(255,126,219,0.25)',
                headerBg: '#151019', headerFg: '#f0e4fc',
                inputBg: '#261e2e', inputFg: '#f0e4fc', inputBorder: '#433752',
                tagBg: '#352b3f', tagFg: '#f0e4fc',
                buttonBg: '#ff7edb', buttonFg: '#1b1720',
                shadow: 'rgba(0,0,0,0.5)', overlay: 'rgba(0,0,0,0.8)',
                scrollbar: '#433752', scrollbarHover: '#ff7edb'
            },
            githubDark: {
                name: 'GitHub Dark',
                bg: '#0d1117', bgAlt: '#010409', bgLight: '#161b22',
                surface: '#21262d', surfaceHover: '#30363d',
                fg: '#e6edf3', fgMuted: '#b1bac4', fgDim: '#7d8590',
                accent: '#58a6ff', accentHover: '#79c0ff',
                link: '#58a6ff', linkVisited: '#bc8cff',
                upvote: '#f85149', downvote: '#3fb950',
                border: '#21262d', borderLight: '#30363d',
                success: '#3fb950', warning: '#d29922', error: '#f85149',
                highlight: 'rgba(88,166,255,0.1)', selection: 'rgba(88,166,255,0.2)',
                headerBg: '#010409', headerFg: '#e6edf3',
                inputBg: '#161b22', inputFg: '#e6edf3', inputBorder: '#30363d',
                tagBg: '#21262d', tagFg: '#e6edf3',
                buttonBg: '#238636', buttonFg: '#ffffff',
                shadow: 'rgba(0,0,0,0.5)', overlay: 'rgba(0,0,0,0.8)',
                scrollbar: '#30363d', scrollbarHover: '#58a6ff'
            }
        },

        getTheme() {
            const base = this.definitions[settings.theme] || this.definitions.dracula;
            const overrides = customPalettes[settings.theme] || {};
            return { ...base, ...overrides };
        },

        isDark() {
            return settings.darkMode && settings.theme !== 'light';
        },

        generateCSS() {
            const t = this.getTheme();
            if (!settings.darkMode) return '';
            if (settings.theme === 'light') return '';

            return `
                /* ===== THEME: ${t.name} ===== */

                /* === GLOBAL FOUNDATIONS === */
                html, body {
                    background-color: ${t.bg} !important;
                    color: ${t.fg} !important;
                }
                body > .content, .content[role="main"],
                .side, .footer-parent, .footer,
                .drop-choices, .drop-choices a.choice,
                .linklisting, .commentarea, .sitetable,
                .wiki-page, .wiki-page-content,
                .search-page, .login-page, .submit-page,
                #sr-header-area, .listing-chooser,
                .organic-listing, .infobar,
                .roundfield, .roundfield legend,
                .login-form, .login-form-side {
                    background-color: ${t.bg} !important;
                    color: ${t.fg} !important;
                }

                /* === HEADER === */
                #header { background-color: ${t.headerBg} !important; border-bottom: 1px solid ${t.border} !important; }
                #header-img { opacity: 0.9; }
                #header .tabmenu li a { color: ${t.fgMuted} !important; background: transparent !important; border: none !important; }
                #header .tabmenu li a:hover { color: ${t.fg} !important; }
                #header .tabmenu li.selected a {
                    background-color: ${t.accent} !important; color: ${t.bg} !important;
                    border: none !important; border-radius: 3px 3px 0 0 !important;
                }
                #header-bottom-left { background: transparent !important; }
                #header-bottom-left a, .pagename a, #header .hover { color: ${t.headerFg} !important; }
                #header-bottom-right { color: ${t.fgMuted} !important; }
                #header-bottom-right a { color: ${t.fgMuted} !important; }
                #header-bottom-right a:hover { color: ${t.accent} !important; }
                #header-bottom-right .separator { color: ${t.fgDim} !important; }

                /* Subreddit bar */
                #sr-header-area {
                    background-color: ${t.bgAlt} !important;
                    border-color: ${t.border} !important;
                    color: ${t.fgMuted} !important;
                }
                #sr-header-area a, #sr-header-area .separator,
                #sr-header-area .sr-list a, #sr-header-area .dropdown { color: ${t.fgMuted} !important; }
                #sr-header-area a:hover { color: ${t.accent} !important; }
                #sr-header-area .width-clip { background: transparent !important; }
                #sr-more-link { color: ${t.fgDim} !important; }

                /* === LINKS === */
                a { color: ${t.link} !important; }
                a:visited { color: ${t.linkVisited} !important; }
                .thing .title a.title { color: ${t.fg} !important; }
                .thing .title a.title:visited { color: ${t.fgMuted} !important; }

                /* === POSTS / THINGS === */
                .thing { background-color: ${t.bg} !important; border-color: ${t.border} !important; }
                .thing:hover { background-color: ${t.bgLight} !important; }
                .thing .midcol, .thing .thumbnail { background: transparent !important; }
                .thing .thumbnail.self, .thing .thumbnail.default,
                .thing .thumbnail.nsfw, .thing .thumbnail.image {
                    background: ${t.bgLight} !important; border: 1px solid ${t.border} !important; border-radius: 6px;
                    display: flex !important; align-items: center; justify-content: center;
                    min-width: 70px; min-height: 50px; position: relative;
                }
                /* Icon indicators for empty thumbnails */
                .thing .thumbnail.self::after {
                    content: '\\1F4DD'; font-size: 20px; opacity: 0.25;
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                }
                .thing .thumbnail.default::after {
                    content: '\\1F517'; font-size: 20px; opacity: 0.25;
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                }
                .thing .thumbnail.nsfw::after {
                    content: '18+'; font-size: 11px; font-weight: 700; opacity: 0.4;
                    color: ${t.error}; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                }
                .thing .thumbnail.image::after {
                    content: '\\1F5BC'; font-size: 20px; opacity: 0.25;
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                }
                /* Hide icon when thumbnail has an actual image */
                .thing .thumbnail img ~ ::after,
                .thing .thumbnail:has(img)::after { display: none !important; }
                .tagline, .tagline a, .tagline .stickied-tagline, .search-result-meta { color: ${t.fgDim} !important; }
                .tagline a:hover { color: ${t.accent} !important; }
                .tagline .author { color: ${t.link} !important; }
                .tagline .submitter { color: ${t.success} !important; }
                .tagline .moderator { color: ${t.accent} !important; }
                .tagline .admin { color: ${t.error} !important; }
                .tagline .friend { color: ${t.warning} !important; }
                .tagline time { color: ${t.fgDim} !important; }
                p.title .domain { color: ${t.fgDim} !important; }
                p.title .domain a { color: ${t.fgDim} !important; }
                .flat-list, .flat-list li, .buttons li { background: transparent !important; }
                .flat-list li a, .buttons li a { color: ${t.fgDim} !important; }
                .flat-list li a:hover, .buttons li a:hover { color: ${t.accent} !important; }

                /* Hide child comments toggle buttons */
                .rel-collapse-btn { color: ${t.fgDim} !important; }
                .rel-collapse-btn:hover { color: ${t.accent} !important; }
                .rel-toggle-all-children { color: ${t.fgDim} !important; }
                .rel-toggle-all-children:hover { color: ${t.accent} !important; }
                .menuarea { color: ${t.fgDim} !important; }
                .rank { color: ${t.fgDim} !important; }
                .score { color: ${t.fgMuted} !important; }
                .entry .buttons li { background: none !important; }
                .thing .entry { background: transparent !important; }
                .link .entry .buttons li a { color: ${t.fgDim} !important; }
                .stickied-tagline { color: ${t.success} !important; }
                .thing.stickied .entry a.title { color: ${t.success} !important; }
                .reportbtn, .reportbtn a { color: ${t.fgDim} !important; }

                /* Crosspost */
                .crosspost-preview, .crosspost-thing-preview {
                    background: ${t.bgLight} !important; border-color: ${t.border} !important;
                    color: ${t.fg} !important;
                }

                /* Self text / expando on listing pages */
                .self-text, .expando .usertext-body {
                    background: transparent !important; color: ${t.fg} !important;
                }
                .expando {
                    background: ${t.bgLight} !important;
                    border: 1px solid ${t.border} !important;
                    border-radius: 4px !important;
                }
                .expando .usertext-body .md {
                    background: ${t.bgLight} !important;
                    color: ${t.fg} !important;
                }
                .expando .usertext-body .md p,
                .expando .usertext-body .md li,
                .expando .usertext-body .md span,
                .expando .usertext-body .md h1,
                .expando .usertext-body .md h2,
                .expando .usertext-body .md h3 {
                    color: ${t.fg} !important;
                }
                .expando .usertext-body .md a {
                    color: ${t.link} !important;
                }
                .thing .expando {
                    background: ${t.bgLight} !important;
                    border: 1px solid ${t.border} !important;
                }

                /* === VOTING ARROWS === */
                .midcol { background: transparent !important; }
                .arrow { filter: brightness(0.7) saturate(0.5); }
                .arrow.up:hover, .arrow.upmod { filter: none; }
                .arrow.down:hover, .arrow.downmod { filter: none; }
                .score.likes { color: ${t.upvote} !important; }
                .score.dislikes { color: ${t.downvote} !important; }
                .score.unvoted { color: ${t.fgMuted} !important; }

                /* === COMMENTS === */
                .comment { background-color: ${t.bg} !important; border-color: ${t.border} !important; }
                .comment:hover { background-color: transparent !important; }
                .comment .child { border-left: 2px solid ${t.border} !important; }
                .comment .md, .comment .md p, .comment .md li { color: ${t.fg} !important; }
                .comment.collapsed .entry { opacity: 0.5; }
                .commentarea { background-color: ${t.bg} !important; }
                .commentarea .menuarea { background: ${t.bg} !important; color: ${t.fgDim} !important; }
                .commentarea .panestack-title { border-color: ${t.border} !important; color: ${t.fg} !important; }
                .commentarea .menuarea .toggle a { color: ${t.fgDim} !important; }
                .comment-visits-box { background: ${t.bgLight} !important; border-color: ${t.border} !important; color: ${t.fg} !important; }
                .morecomments a, .morerecursion a { color: ${t.accent} !important; }
                .expand { color: ${t.fgDim} !important; }
                .noncollapsed .expand:hover { color: ${t.accent} !important; }
                .deleted .entry .tagline { color: ${t.fgDim} !important; }
                .grayed .entry .tagline { color: ${t.fgDim} !important; }

                /* Comment form */
                .usertext-edit { background: ${t.bg} !important; border: 1px solid ${t.border} !important; border-radius: 4px; }
                .usertext-edit textarea {
                    background: ${t.inputBg} !important; color: ${t.inputFg} !important;
                    border-color: ${t.inputBorder} !important;
                }
                .usertext-edit .bottom-area { background: ${t.bgLight} !important; }
                .usertext-edit .bottom-area a, .usertext-edit .markhelp { color: ${t.fgDim} !important; }
                .usertext-edit .md { background: ${t.bg} !important; }
                .markhelp { background: ${t.bgLight} !important; border-color: ${t.border} !important; }
                .markhelp td, .markhelp th { border-color: ${t.border} !important; color: ${t.fg} !important; }

                /* === SIDEBAR === */
                .side {
                    background-color: ${t.bg} !important; color: ${t.fg} !important;
                    border-left: 1px solid ${t.border} !important;
                }
                .side *, .side .titlebox *, .side .spacer *, .side .md *,
                .side h1, .side h2, .side h3, .side h4, .side h5, .side h6,
                .side p, .side li, .side span, .side div,
                .side .titlebox .bottom, .side .redditname a {
                    color: ${t.fg} !important;
                }
                .side a { color: ${t.link} !important; }
                .side a:visited { color: ${t.linkVisited} !important; }
                .sidecontentbox { background: transparent !important; border-color: ${t.border} !important; }
                .sidecontentbox .title h1 { color: ${t.fg} !important; }
                .sidecontentbox .content { background: transparent !important; border-color: ${t.border} !important; }
                .icon-menu a { color: ${t.fg} !important; }
                .icon-menu a:hover { background: ${t.bgLight} !important; }
                .titlebox .bottom { border-color: ${t.border} !important; }
                .titlebox .word { color: ${t.fgMuted} !important; }
                .titlebox .number { color: ${t.fg} !important; }
                .subscribers .word, .users-online .word { color: ${t.fgMuted} !important; }
                .subscribers .number, .users-online .number { color: ${t.fg} !important; }
                .titlebox form.toggle { color: ${t.fgDim} !important; }
                .titlebox .tagline { color: ${t.fgDim} !important; }
                .side .spacer { background: transparent !important; }
                .side .searchpane { background: transparent !important; border-color: ${t.border} !important; }
                .linkinfo { background: ${t.bgLight} !important; border-color: ${t.border} !important; color: ${t.fg} !important; }
                .linkinfo .shortlink input { background: ${t.inputBg} !important; color: ${t.inputFg} !important; border-color: ${t.inputBorder} !important; }

                /* Subscribe / submit buttons */
                .morelink, .morelink a {
                    background: ${t.buttonBg} !important; color: ${t.buttonFg} !important;
                    border: none !important; border-radius: 4px !important;
                }
                .morelink:hover, .morelink:hover a { background: ${t.accentHover} !important; }
                .morelink .nub { display: none !important; }
                .fancy-toggle-button a, .option.active { background: ${t.accent} !important; color: ${t.bg} !important; border-radius: 3px !important; }

                /* Sidebar account activity */
                .account-activity-box { background: ${t.bgLight} !important; border-color: ${t.border} !important; color: ${t.fg} !important; }
                .account-activity-box a { color: ${t.link} !important; }

                /* Sidebar rules */
                .md ol, .md ul { color: ${t.fg} !important; }

                /* === INPUTS & FORMS === */
                input[type="text"], input[type="search"], input[type="url"],
                input[type="password"], input[type="email"], input[type="number"],
                textarea, select, .c-form-control {
                    background-color: ${t.inputBg} !important;
                    color: ${t.inputFg} !important;
                    border-color: ${t.inputBorder} !important;
                }
                input[type="text"]:focus, input[type="search"]:focus,
                input[type="url"]:focus, input[type="password"]:focus,
                textarea:focus, select:focus {
                    border-color: ${t.accent} !important;
                    outline: none !important;
                    box-shadow: 0 0 0 2px ${t.selection} !important;
                }
                input[type="checkbox"], input[type="radio"] { accent-color: ${t.accent}; }

                /* Buttons (scoped to avoid breaking arrows) */
                .side .morelink, button.btn, input[type="submit"],
                .save-button button, .cancel-button button,
                .c-btn-primary, .newbutton {
                    background: ${t.buttonBg} !important;
                    color: ${t.buttonFg} !important;
                    border: 1px solid ${t.border} !important;
                    border-radius: 3px !important;
                }
                .c-btn-primary:hover { background: ${t.accentHover} !important; }

                /* === DROPDOWNS & MENUS === */
                .drop-choices {
                    background: ${t.bgLight} !important; border: 1px solid ${t.border} !important;
                    box-shadow: 0 2px 8px ${t.shadow} !important;
                }
                .drop-choices a.choice { color: ${t.fg} !important; }
                .drop-choices a.choice:hover { background: ${t.surface} !important; color: ${t.accent} !important; }
                .hover-bubble, .reddit-infobar { background: ${t.bgLight} !important; border-color: ${t.border} !important; color: ${t.fg} !important; }

                /* === SEARCH === */
                #search input[type="text"], #searchexpander {
                    background: ${t.inputBg} !important; color: ${t.inputFg} !important;
                    border-color: ${t.inputBorder} !important;
                }
                .search-result { background: ${t.bg} !important; border-color: ${t.border} !important; }
                .search-result-header .search-title { color: ${t.fg} !important; }
                .search-result-body { color: ${t.fgMuted} !important; }
                .search-expando { background: ${t.bgLight} !important; border-color: ${t.border} !important; }
                .search-result-group-header { background: ${t.bgLight} !important; color: ${t.fg} !important; border-color: ${t.border} !important; }
                .combined-search-page .search-result-listing { background: ${t.bg} !important; }
                .combined-search-page .search-result-listing .contents { border-color: ${t.border} !important; }
                .searchfacets .searchfacet { background: ${t.bgLight} !important; border-color: ${t.border} !important; }
                .searchfacets .searchfacet .title { color: ${t.fg} !important; }

                /* === WIKI & MARKDOWN === */
                .wiki-page, .wiki-page .wiki-page-content, .wiki-page-content .md {
                    background: ${t.bg} !important; color: ${t.fg} !important;
                }
                .wiki-page .pageactions { background: ${t.bgLight} !important; border-color: ${t.border} !important; }
                .wiki-page .pageactions .wikiaction { color: ${t.fgDim} !important; }
                .wiki-page .pageactions .wikiaction-current { color: ${t.accent} !important; border-color: ${t.accent} !important; }
                .md blockquote { border-left: 3px solid ${t.accent} !important; color: ${t.fgMuted} !important; background: ${t.bgLight} !important; padding: 4px 8px !important; }
                .md code { background: ${t.bgLight} !important; color: ${t.accent} !important; border: 1px solid ${t.border} !important; padding: 1px 4px; border-radius: 3px; }
                .md pre { background: ${t.bgLight} !important; color: ${t.fg} !important; border: 1px solid ${t.border} !important; padding: 8px; border-radius: 4px; }
                .md pre code { border: none !important; padding: 0; background: transparent !important; color: ${t.fg} !important; }
                .md table { border-color: ${t.border} !important; border-collapse: collapse; }
                .md th { background: ${t.bgLight} !important; color: ${t.fg} !important; border: 1px solid ${t.border} !important; padding: 4px 8px; }
                .md td { border: 1px solid ${t.border} !important; color: ${t.fg} !important; padding: 4px 8px; }
                .md hr { border-color: ${t.border} !important; }
                .md a { color: ${t.link} !important; }
                .md h1, .md h2, .md h3, .md h4, .md h5, .md h6 { color: ${t.fg} !important; }
                .md em { color: ${t.fgMuted} !important; }
                .md strong { color: ${t.fg} !important; }
                .md del { color: ${t.fgDim} !important; }
                .md sup { color: ${t.fgMuted} !important; }
                .md .spoiler { background: ${t.surface} !important; color: transparent; }
                .md .spoiler:hover { color: ${t.fg} !important; }
                .md .spoiler.rel-spoiler-revealed { color: ${t.fg} !important; }

                /* === EXPANDO === */
                .expando {
                    background: ${t.bgLight} !important; border: 1px solid ${t.border} !important;
                    border-radius: 4px; margin: 4px 0;
                }
                .expando-button { filter: brightness(0.8) !important; }

                /* === INFO BARS === */
                .infobar { background: ${t.bgLight} !important; color: ${t.fg} !important; border-color: ${t.border} !important; }
                .infobar.welcomebar { background: ${t.bgLight} !important; }

                /* === FLAIR === */
                .flair, .linkflairlabel {
                    background: ${t.tagBg} !important; color: ${t.tagFg} !important;
                    border: 1px solid ${t.border} !important; border-radius: 3px !important;
                }

                /* === MODALS & OVERLAYS === */
                .modal-dialog { background: ${t.bgLight} !important; color: ${t.fg} !important; border-color: ${t.border} !important; }
                .modal-dialog .modal-header { background: ${t.bgAlt} !important; border-color: ${t.border} !important; color: ${t.fg} !important; }
                .modal-dialog .modal-body { background: ${t.bgLight} !important; color: ${t.fg} !important; }
                .modal-dialog .modal-footer { background: ${t.bgAlt} !important; border-color: ${t.border} !important; }

                /* === SUBMIT PAGE === */
                .submit-page .formtabs-content { background: ${t.bg} !important; border-color: ${t.border} !important; }
                .submit-page .formtab-content { background: ${t.bg} !important; }
                .submit-page .tabmenu li a { background: ${t.bgLight} !important; color: ${t.fgMuted} !important; border-color: ${t.border} !important; }
                .submit-page .tabmenu li.selected a { background: ${t.accent} !important; color: ${t.bg} !important; }
                .submit-page .roundfield { background: ${t.bgLight} !important; border-color: ${t.border} !important; color: ${t.fg} !important; }
                .submit-page .roundfield legend { background: ${t.bgLight} !important; color: ${t.fg} !important; }
                .linefield { background: transparent !important; border-color: ${t.border} !important; }
                .submit_text { color: ${t.fgMuted} !important; }

                /* === USER PROFILE PAGES === */
                .profilepage .spacer, .profilepage .sidecontentbox {
                    background: transparent !important; color: ${t.fg} !important;
                }
                .trophy-area { background: transparent !important; }
                .trophy-area .content, .trophy-name, .trophy-description { color: ${t.fg} !important; }
                .trophy-area .trophy-info { color: ${t.fgDim} !important; }
                .titlebox .karma { color: ${t.fg} !important; }
                .titlebox .karma-breakdown { color: ${t.fgMuted} !important; }

                /* Tabmenu on user pages */
                .tabmenu { background: transparent !important; }
                .tabmenu li a { color: ${t.fgMuted} !important; background: transparent !important; }
                .tabmenu li.selected a { color: ${t.accent} !important; border-bottom: 2px solid ${t.accent} !important; }

                /* === LOGIN / REGISTER === */
                .login-form, .login-form-side {
                    background: ${t.bgLight} !important; color: ${t.fg} !important;
                    border-color: ${t.border} !important;
                }
                .login-form label, .login-form-side label { color: ${t.fg} !important; }
                .login-form .error, .login-form-side .error { color: ${t.error} !important; }
                .login-form .bottom-btn { color: ${t.fgDim} !important; }

                /* === SCROLLBAR === */
                ::-webkit-scrollbar { width: 10px; }
                ::-webkit-scrollbar-track { background: ${t.bgAlt}; }
                ::-webkit-scrollbar-thumb { background: ${t.scrollbar}; border-radius: 5px; }
                ::-webkit-scrollbar-thumb:hover { background: ${t.scrollbarHover}; }

                /* === PROMOTED / ADS - handled by AdBlockModule === */
                .goldvertisement, .premium-banner-outer { display: none !important; }

                /* === FOOTER === */
                .footer, .footer-parent, .bottommenu { background: ${t.bgAlt} !important; border-color: ${t.border} !important; color: ${t.fgDim} !important; }
                .footer a, .bottommenu a { color: ${t.fgDim} !important; }
                .debuginfo { background: ${t.bgAlt} !important; color: ${t.fgDim} !important; }

                /* === LISTINGS === */
                .listing-chooser { background: ${t.bg} !important; border-color: ${t.border} !important; }
                .listing-chooser li { border-color: ${t.border} !important; }
                .listing-chooser li:hover { background: ${t.bgLight} !important; }
                .listing-chooser .grippy { background: ${t.surface} !important; }
                .organic-listing { background: ${t.bg} !important; border-color: ${t.border} !important; }

                /* Nav pills (sort tabs) */
                .menuarea, .nav-buttons { background: transparent !important; }
                .menuarea .spacer { background: transparent !important; }

                /* === MISC REMAINING === */
                .rank { color: ${t.fgDim} !important; }
                .thing .title.click .may-blank { color: ${t.fgMuted} !important; }
                .liveupdate-listing { background: ${t.bg} !important; }
                .rounded { background: ${t.bgLight} !important; border-color: ${t.border} !important; }
                .message { background: ${t.bg} !important; border-color: ${t.border} !important; }
                .message.unread { background: ${t.bgLight} !important; border-left: 3px solid ${t.accent} !important; }
                .message .entry { background: transparent !important; }
                .message .subject a { color: ${t.fg} !important; }
                .message .head { color: ${t.fgDim} !important; }
                .messagepage .sitetable { background: transparent !important; }
                .multi-page .sidebar { background: ${t.bg} !important; }

                /* Share overlay / popup */
                .c-close, .c-close:hover { color: ${t.fgDim} !important; }

                /* RES compatibility classes */
                .res-nightmode .thing, .res-nightmode .comment { background-color: ${t.bg} !important; }

                /* === SELECTION === */
                ::selection { background: ${t.selection} !important; color: ${t.fg} !important; }

                /* === OVERRIDE SUBREDDIT CUSTOM STYLESHEETS === */
                .link .usertext-body .md, .usertext-body .md { color: ${t.fg} !important; }
            `;
        }
    };

    // =========================================================================
    // THEME PALETTE MODULE
    // =========================================================================
    const PaletteModule = {
        PALETTE_KEYS: [
            'bg', 'bgAlt', 'bgLight', 'surface', 'surfaceHover', 'fg', 'fgMuted', 'fgDim',
            'accent', 'accentHover', 'link', 'linkVisited', 'upvote', 'downvote', 'border',
            'borderLight', 'success', 'warning', 'error', 'highlight', 'selection', 'headerBg',
            'headerFg', 'inputBg', 'inputFg', 'inputBorder', 'tagBg', 'tagFg', 'buttonBg',
            'buttonFg', 'shadow', 'overlay', 'scrollbar', 'scrollbarHover'
        ],

        normalizeValue(value) {
            const candidate = String(value || '').trim();
            if (/^#[0-9a-f]{3,8}$/i.test(candidate)) return candidate;
            if (/^(?:rgba?|hsla?)\([0-9.%\s,]+\)$/i.test(candidate)) return candidate;
            if (/^[a-z]+$/i.test(candidate) && ['transparent', 'black', 'white', 'inherit', 'currentcolor'].includes(candidate.toLowerCase())) return candidate;
            return null;
        },

        normalizePalettes(source) {
            if (!source || typeof source !== 'object' || Array.isArray(source)) return {};
            const result = {};
            Object.entries(source).forEach(([themeId, palette]) => {
                if (!Themes.definitions[themeId] || !palette || typeof palette !== 'object' || Array.isArray(palette)) return;
                const safe = {};
                this.PALETTE_KEYS.forEach(key => {
                    const value = this.normalizeValue(palette[key]);
                    if (value) safe[key] = value;
                });
                if (Object.keys(safe).length) result[themeId] = safe;
            });
            return result;
        },

        setOverride(themeId, key, value) {
            if (!Themes.definitions[themeId] || !this.PALETTE_KEYS.includes(key)) return false;
            const safe = this.normalizeValue(value);
            if (!safe) {
                Utils.notify('Use a hex, rgba/hsla, or basic CSS color value.', 'warning');
                return false;
            }
            const base = Themes.definitions[themeId][key];
            if (safe === base) {
                if (customPalettes[themeId]) delete customPalettes[themeId][key];
            } else {
                customPalettes[themeId] = { ...(customPalettes[themeId] || {}), [key]: safe };
            }
            if (customPalettes[themeId] && Object.keys(customPalettes[themeId]).length === 0) delete customPalettes[themeId];
            Storage.set(CONFIG.storageKeys.customPalettes, customPalettes);
            SettingsModule.applyThemeCSS();
            return true;
        },

        reset(themeId) {
            if (!Themes.definitions[themeId]) return false;
            delete customPalettes[themeId];
            Storage.set(CONFIG.storageKeys.customPalettes, customPalettes);
            SettingsModule.applyThemeCSS();
            Utils.notify(`Reset ${Themes.definitions[themeId].name} palette`, 'success');
            return true;
        },

        serialize() {
            return JSON.stringify(customPalettes, null, 2);
        },

        importSerialized(serialized) {
            try {
                const parsed = JSON.parse(serialized);
                const normalized = this.normalizePalettes(parsed);
                customPalettes = normalized;
                Storage.set(CONFIG.storageKeys.customPalettes, customPalettes);
                SettingsModule.applyThemeCSS();
                return true;
            } catch { return false; }
        }
    };
    customPalettes = PaletteModule.normalizePalettes(customPalettes);

    // =========================================================================
    // FONT PAIRING MODULE
    // =========================================================================
    const FontPairingModule = {
        PAIRS: {
            system: {
                name: 'System UI',
                body: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            },
            humanist: {
                name: 'Humanist',
                body: '"Trebuchet MS", "Segoe UI", sans-serif',
                heading: '"Gill Sans", "Trebuchet MS", sans-serif'
            },
            classic: {
                name: 'Classic Web',
                body: 'Arial, Helvetica, sans-serif',
                heading: 'Verdana, Arial, sans-serif'
            },
            editorial: {
                name: 'Editorial',
                body: 'Georgia, "Times New Roman", serif',
                heading: 'Georgia, "Times New Roman", serif'
            },
            mono: {
                name: 'Mono Accent',
                body: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                heading: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace'
            }
        },

        normalizePairing(value) {
            return Object.prototype.hasOwnProperty.call(this.PAIRS, value) ? value : 'system';
        },

        getPairing(themeId = settings.theme) {
            return this.normalizePairing(fontPairings[themeId]);
        },

        setPairing(themeId, pairing) {
            if (!Themes.definitions[themeId]) return false;
            const normalized = this.normalizePairing(pairing);
            if (normalized === 'system') delete fontPairings[themeId];
            else fontPairings[themeId] = normalized;
            Storage.set(CONFIG.storageKeys.fontPairings, fontPairings);
            this.apply();
            return true;
        },

        apply() {
            document.querySelectorAll('[data-rel-font-pairing]').forEach(style => style.remove());
            const pairing = this.PAIRS[this.getPairing()];
            if (!pairing || this.getPairing() === 'system') {
                document.body.removeAttribute('data-rel-font-pairing');
                return;
            }
            const style = document.createElement('style');
            style.setAttribute('data-rel-font-pairing', this.getPairing());
            style.textContent = `
                body, body input, body textarea, body select, body button { font-family: ${pairing.body} !important; }
                body h1, body h2, body h3, body .title, body .author, body .rel-settings-header, body .rel-settings-tabs { font-family: ${pairing.heading} !important; }
            `;
            document.head.appendChild(style);
            document.body.setAttribute('data-rel-font-pairing', this.getPairing());
        },

        init() { this.apply(); }
    };

    // =========================================================================
    // LOCAL ANALYTICS MODULE
    // =========================================================================
    const AnalyticsModule = {
        COUNTERS: ['adsBlocked', 'postsFiltered', 'mediaExpanded', 'pageViews'],
        saveTimer: null,

        normalizeStats(source) {
            const input = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
            const result = {};
            this.COUNTERS.forEach(key => { result[key] = Number.isFinite(Number(input[key])) ? Math.max(0, Math.floor(Number(input[key]))) : 0; });
            result.lastUpdated = typeof input.lastUpdated === 'string' ? input.lastUpdated : null;
            return result;
        },

        getStats() {
            return this.normalizeStats(analyticsStats);
        },

        flush() {
            analyticsStats = this.normalizeStats(analyticsStats);
            analyticsStats.lastUpdated = new Date().toISOString();
            Storage.set(CONFIG.storageKeys.analytics, analyticsStats);
            this.saveTimer = null;
        },

        increment(key, amount = 1) {
            if (!settings.analyticsEnabled || !this.COUNTERS.includes(key)) return;
            analyticsStats = this.getStats();
            analyticsStats[key] += Math.max(0, Math.floor(Number(amount) || 0));
            clearTimeout(this.saveTimer);
            this.saveTimer = setTimeout(() => this.flush(), 500);
        },

        reset() {
            analyticsStats = this.normalizeStats({});
            this.flush();
        },

        init() {
            if (settings.analyticsEnabled) this.increment('pageViews');
        }
    };

    // =========================================================================
    // BASE STYLES
    // =========================================================================
    const Styles = {
        base: `
            /* Toast Notifications */
            .rel-toast {
                position: fixed; bottom: 20px; right: 20px; z-index: 1000001;
                padding: 12px 20px; border-radius: 6px; font-size: 13px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3); transform: translateY(100px);
                opacity: 0; transition: all 0.3s ease; max-width: 350px;
            }
            .rel-toast-show { transform: translateY(0); opacity: 1; }
            .rel-toast-info { background: #0079d3; color: #fff; }
            .rel-toast-success { background: #46d160; color: #fff; }
            .rel-toast-error { background: #ea0027; color: #fff; }
            .rel-toast-warning { background: #e9a820; color: #222; }

            /* REL Buttons */
            .rel-button {
                display: inline-block; padding: 2px 8px; margin: 0 4px;
                font-size: 11px; font-weight: bold; cursor: pointer;
                border: 1px solid #ccc; border-radius: 3px;
                background: linear-gradient(to bottom, #fff 0%, #e9e9e9 100%);
                color: #333; font-family: verdana, arial, helvetica, sans-serif;
                transition: all 0.15s ease;
            }
            .rel-button:hover { background: linear-gradient(to bottom, #f5f5f5 0%, #ddd 100%); border-color: #999; }

            /* Settings Gear Button */
            .rel-settings-btn {
                cursor: pointer; padding: 0 8px; font-size: 16px;
                opacity: 0.7; transition: opacity 0.2s;
            }
            .rel-settings-btn:hover { opacity: 1; }

            /* Settings Panel */
            .rel-settings-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.7); z-index: 999999;
                display: flex; align-items: center; justify-content: center;
                backdrop-filter: blur(2px);
            }
            .rel-settings-panel {
                background: #1e1e2e; color: #cdd6f4;
                border-radius: 12px; max-width: 750px; width: 92%;
                max-height: 88vh; display: flex; flex-direction: column;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                overflow: hidden;
            }
            .rel-settings-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 16px 20px; border-bottom: 1px solid #313244;
            }
            .rel-settings-header h2 {
                margin: 0; font-size: 18px; color: #cdd6f4;
                display: flex; align-items: center; gap: 8px;
            }
            .rel-settings-header .rel-version { font-size: 11px; color: #6c7086; font-weight: normal; }
            .rel-settings-close {
                background: none; border: none; color: #6c7086; font-size: 22px;
                cursor: pointer; padding: 4px 8px; border-radius: 4px;
            }
            .rel-settings-close:hover { color: #f38ba8; background: rgba(243,139,168,0.1); }

            /* Settings Tabs */
            .rel-settings-tabs {
                display: flex; border-bottom: 1px solid #313244;
                padding: 0 16px; overflow-x: auto; flex-shrink: 0;
            }
            .rel-tab {
                padding: 10px 14px; font-size: 12px; cursor: pointer;
                color: #6c7086; border-bottom: 2px solid transparent;
                transition: all 0.2s; white-space: nowrap; background: none; border-top: none; border-left: none; border-right: none;
            }
            .rel-tab:hover { color: #cdd6f4; }
            .rel-tab.active { color: #cba6f7; border-bottom-color: #cba6f7; }

            /* Settings Body */
            .rel-settings-body {
                flex: 1; overflow-y: auto; padding: 16px 20px;
            }
            .rel-tab-content { display: none; }
            .rel-tab-content.active { display: block; }

            .rel-settings-section { margin-bottom: 16px; }
            .rel-settings-section h3 {
                margin: 0 0 8px 0; color: #a6adc8; font-size: 12px;
                text-transform: uppercase; letter-spacing: 0.5px;
            }
            .rel-setting-item {
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 12px; background: #313244; border-radius: 6px;
                margin-bottom: 6px; gap: 12px;
            }
            .rel-setting-item:hover { background: #3b3d54; }
            .rel-setting-info { flex: 1; min-width: 0; }
            .rel-setting-info label { font-size: 13px; color: #cdd6f4; display: block; }
            .rel-setting-info .rel-setting-desc { font-size: 11px; color: #6c7086; margin-top: 2px; }

            /* Toggle Switch */
            .rel-toggle { position: relative; width: 40px; height: 22px; flex-shrink: 0; }
            .rel-toggle input { opacity: 0; width: 0; height: 0; }
            .rel-toggle-slider {
                position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                background-color: #45475a; transition: 0.25s; border-radius: 22px;
            }
            .rel-toggle-slider:before {
                position: absolute; content: ""; height: 16px; width: 16px;
                left: 3px; bottom: 3px; background: #6c7086;
                transition: 0.25s; border-radius: 50%;
            }
            .rel-toggle input:checked + .rel-toggle-slider { background-color: #cba6f7; }
            .rel-toggle input:checked + .rel-toggle-slider:before { transform: translateX(18px); background: #1e1e2e; }

            /* Theme Picker */
            .rel-theme-grid {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                gap: 8px; margin: 8px 0;
            }
            .rel-theme-card {
                border: 2px solid #45475a; border-radius: 8px; padding: 8px;
                cursor: pointer; text-align: center; transition: all 0.2s;
            }
            .rel-theme-card:hover { border-color: #6c7086; }
            .rel-theme-card.active { border-color: #cba6f7; box-shadow: 0 0 8px rgba(203,166,247,0.3); }
            .rel-theme-preview {
                height: 36px; border-radius: 4px; margin-bottom: 6px;
                display: flex; align-items: stretch; overflow: hidden;
            }
            .rel-theme-preview > div { flex: 1; }
            .rel-theme-name { font-size: 11px; color: #a6adc8; }

            /* Select Dropdown */
            .rel-select {
                background: #313244; color: #cdd6f4; border: 1px solid #45475a;
                border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer;
            }
            .rel-select:focus { border-color: #cba6f7; outline: none; }

            /* Input Fields */
            .rel-input {
                background: #313244; color: #cdd6f4; border: 1px solid #45475a;
                border-radius: 4px; padding: 6px 10px; font-size: 12px; width: 100%;
            }
            .rel-input:focus { border-color: #cba6f7; outline: none; }
            .rel-textarea {
                background: #313244; color: #cdd6f4; border: 1px solid #45475a;
                border-radius: 4px; padding: 8px 10px; font-size: 12px;
                width: 100%; min-height: 60px; resize: vertical; font-family: monospace;
            }

            /* Filter List */
            .rel-filter-list { margin: 8px 0; }
            .rel-filter-item {
                display: flex; align-items: center; justify-content: space-between;
                padding: 6px 10px; background: #313244; border-radius: 4px;
                margin-bottom: 4px; font-size: 12px;
            }
            .rel-filter-item .rel-filter-remove {
                color: #f38ba8; cursor: pointer; padding: 2px 6px; border-radius: 3px;
                background: none; border: none; font-size: 14px;
            }
            .rel-filter-item .rel-filter-remove:hover { background: rgba(243,139,168,0.15); }
            .rel-filter-add-row { display: flex; gap: 6px; margin-top: 6px; }
            .rel-filter-add-row .rel-input { flex: 1; }
            .rel-btn-small {
                padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;
                border: none; transition: all 0.15s;
            }
            .rel-btn-primary { background: #cba6f7; color: #1e1e2e; }
            .rel-btn-primary:hover { background: #dbb8ff; }
            .rel-btn-danger { background: #f38ba8; color: #1e1e2e; }
            .rel-btn-danger:hover { background: #f5a0b5; }
            .rel-btn-secondary { background: #45475a; color: #cdd6f4; }
            .rel-btn-secondary:hover { background: #585b70; }

            /* Settings Footer */
            .rel-settings-footer {
                padding: 12px 20px; border-top: 1px solid #313244;
                display: flex; justify-content: space-between; align-items: center;
            }
            .rel-settings-footer .rel-footer-actions { display: flex; gap: 8px; }

            /* Page Navigator */
            .rel-page-nav {
                position: fixed; right: 16px; bottom: 80px; z-index: 99999;
                display: flex; flex-direction: column; gap: 6px;
            }
            .rel-page-nav-btn {
                width: 36px; height: 36px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; font-size: 16px; transition: all 0.2s;
                border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }

            /* Comment Depth Indicators */
            .rel-depth-0 > .entry { border-left: 3px solid #ff5555 !important; padding-left: 6px; }
            .rel-depth-1 > .entry { border-left: 3px solid #ff79c6 !important; padding-left: 6px; }
            .rel-depth-2 > .entry { border-left: 3px solid #ffb86c !important; padding-left: 6px; }
            .rel-depth-3 > .entry { border-left: 3px solid #f1fa8c !important; padding-left: 6px; }
            .rel-depth-4 > .entry { border-left: 3px solid #50fa7b !important; padding-left: 6px; }
            .rel-depth-5 > .entry { border-left: 3px solid #8be9fd !important; padding-left: 6px; }
            .rel-depth-6 > .entry { border-left: 3px solid #bd93f9 !important; padding-left: 6px; }
            .rel-depth-7 > .entry { border-left: 3px solid #ff5555 !important; padding-left: 6px; }
            .rel-depth-8 > .entry { border-left: 3px solid #ff79c6 !important; padding-left: 6px; }
            .rel-depth-9 > .entry { border-left: 3px solid #ffb86c !important; padding-left: 6px; }

            /* Formatting Toolbar */
            .rel-format-bar {
                display: flex; gap: 2px; padding: 4px 6px;
                border-bottom: 1px solid #45475a; flex-wrap: wrap; align-items: center;
            }
            .rel-format-btn {
                padding: 3px 7px; border-radius: 3px; font-size: 12px;
                cursor: pointer; border: 1px solid transparent; transition: all 0.15s;
                font-family: monospace; line-height: 1;
            }
            .rel-format-btn:hover { border-color: #6c7086; }
            .rel-format-sep { width: 1px; height: 18px; margin: 0 4px; }

            /* Live Preview */
            .rel-live-preview {
                padding: 8px 12px; font-size: 13px; max-height: 200px;
                overflow-y: auto; border-top: 1px solid #45475a; display: none;
            }
            .rel-live-preview.active { display: block; }
            .rel-live-preview h1, .rel-live-preview h2, .rel-live-preview h3 { margin: 4px 0; }

            /* Single Click Opener */
            .rel-sco { font-size: 10px; margin-left: 4px; }
            .rel-sco a { text-decoration: none !important; }

            /* User Highlighter */
            .rel-user-op { color: #50fa7b !important; font-weight: bold; }
            .rel-user-admin { color: #ff5555 !important; font-weight: bold; }
            .rel-user-mod { color: #8be9fd !important; font-weight: bold; }
            .rel-user-friend { color: #ffb86c !important; font-weight: bold; }

            /* Selected Entry */
            .rel-selected-thing { outline: 2px solid rgba(203,166,247,0.4); outline-offset: -2px; border-radius: 2px; }

            /* User Info Popup */
            .rel-user-info-popup {
                position: absolute; z-index: 100000; border-radius: 8px;
                padding: 12px; min-width: 220px; max-width: 300px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.4); font-size: 12px;
                pointer-events: auto;
            }
            .rel-user-info-popup h4 { margin: 0 0 8px 0; font-size: 14px; }
            .rel-user-info-stat { display: flex; justify-content: space-between; padding: 3px 0; }

            /* Continue Thread Expander */
            .rel-expand-thread {
                cursor: pointer; padding: 2px 8px; margin-left: 4px;
                font-size: 11px; border-radius: 3px;
            }
            .rel-expand-thread:hover { opacity: 0.8; }

            /* Vote Weight Badge */
            .rel-vote-weight {
                font-size: 10px; padding: 0 4px; border-radius: 3px;
                margin-left: 4px; font-weight: bold;
            }

            /* NER Page Marker */
            .rel-ner-marker {
                text-align: center; padding: 10px; margin: 10px 0;
                border-top: 1px dashed; font-size: 12px; opacity: 0.6;
            }

            /* Subreddit Shortcuts Bar */
            .rel-sr-shortcuts {
                display: inline-flex; gap: 4px; margin-left: 8px; align-items: center;
            }
            .rel-sr-shortcuts a {
                padding: 1px 6px; border-radius: 3px; font-size: 11px;
                text-decoration: none; transition: all 0.15s;
            }
            .rel-sr-shortcuts a:hover { opacity: 0.8; text-decoration: underline; }
            .rel-sr-shortcuts .rel-sr-add {
                cursor: pointer; font-size: 13px; opacity: 0.6; padding: 0 4px;
            }
            .rel-sr-shortcuts .rel-sr-add:hover { opacity: 1; }

            /* Macro Menu */
            .rel-macro-menu {
                position: absolute; z-index: 100001; border-radius: 6px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.4); overflow: hidden;
                min-width: 150px;
            }
            .rel-macro-item {
                padding: 8px 12px; font-size: 12px; cursor: pointer; border: none;
                width: 100%; text-align: left;
            }
            .rel-macro-item:hover { opacity: 0.85; }

            /* Timestamp enhancements */
            .rel-timestamp { font-size: 10px; cursor: help; }

            /* Ignored user */
            .rel-ignored-user { opacity: 0.25; transition: opacity 0.2s; }
            .rel-ignored-user:hover { opacity: 1; }

            /* Keyboard nav hint */
            .rel-kb-hint {
                position: fixed; bottom: 8px; left: 8px; z-index: 99998;
                font-size: 10px; opacity: 0.4; pointer-events: none;
            }

            /* Hide gold button */
            .rel-hide-gold .give-gold-button { display: none !important; }
            .rel-hide-share li.share { display: none !important; }
            .rel-hide-save li.link-save-button, .rel-hide-save li.comment-save-button { display: none !important; }
            .rel-hide-crosspost li.crosspost-button { display: none !important; }
            .rel-hide-report li.report-button { display: none !important; }

            /* Tag styles */
            .rel-user-tag {
                display: inline-block; padding: 0 5px; border-radius: 3px;
                font-size: 10px; margin-left: 4px; cursor: pointer;
                font-weight: bold; vertical-align: middle;
            }
            .rel-tag-popup {
                position: fixed; z-index: 100001; border-radius: 8px;
                padding: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                min-width: 280px;
            }
            .rel-tag-popup input, .rel-tag-popup select {
                width: 100%; padding: 6px; margin: 4px 0; border-radius: 4px;
                font-size: 12px;
            }

            /* Collapse child comment buttons */
            .rel-collapse-btn {
                font-size: 10px; cursor: pointer; margin-left: 6px;
                opacity: 0.7; transition: opacity 0.2s;
            }
            .rel-collapse-btn:hover { opacity: 1; }

            /* Page-wide toggle all children link */
            .rel-toggle-all-children {
                cursor: pointer; font-size: 12px;
                opacity: 0.8; transition: opacity 0.2s;
            }
            .rel-toggle-all-children:hover { opacity: 1; text-decoration: underline; }

            /* Download button */
            .flat-list li a[title="Download image"] { font-weight: bold; }

            /* Subreddit description box */
            #rel-sr-description h3 { font-weight: bold; }
            #rel-sr-description p { line-height: 1.5; }

            /* State saver indicator */
            .rel-state-indicator {
                position: fixed; bottom: 8px; right: 60px; z-index: 99998;
                font-size: 10px; opacity: 0; pointer-events: none;
                transition: opacity 0.3s;
            }
            .rel-state-indicator.active { opacity: 0.5; }
        `,

        getThemedBase() {
            const t = Themes.getTheme();
            if (!settings.darkMode || settings.theme === 'light') return '';
            return `
                /* Themed component overrides */
                .rel-settings-header .rel-version { color: ${t.fgDim}; }
                .rel-settings-panel { background: ${t.bgLight}; color: ${t.fg}; }
                .rel-settings-header { border-color: ${t.border}; }
                .rel-settings-header h2 { color: ${t.fg}; }
                .rel-settings-close { color: ${t.fgDim}; }
                .rel-settings-close:hover { color: ${t.error}; background: rgba(255,0,0,0.08); }
                .rel-settings-tabs { border-color: ${t.border}; }
                .rel-tab { color: ${t.fgDim}; }
                .rel-tab:hover { color: ${t.fg}; }
                .rel-tab.active { color: ${t.accent}; border-bottom-color: ${t.accent}; }
                .rel-setting-item { background: ${t.surface}; }
                .rel-setting-item:hover { background: ${t.surfaceHover}; }
                .rel-setting-info label { color: ${t.fg}; }
                .rel-setting-info .rel-setting-desc { color: ${t.fgDim}; }
                .rel-settings-section h3 { color: ${t.fgMuted}; }
                .rel-toggle-slider { background-color: ${t.surface}; }
                .rel-toggle-slider:before { background: ${t.fgDim}; }
                .rel-toggle input:checked + .rel-toggle-slider { background-color: ${t.accent}; }
                .rel-toggle input:checked + .rel-toggle-slider:before { background: ${t.bg}; }
                .rel-theme-card { border-color: ${t.surface}; }
                .rel-theme-card:hover { border-color: ${t.fgDim}; }
                .rel-theme-card.active { border-color: ${t.accent}; box-shadow: 0 0 8px ${t.selection}; }
                .rel-theme-name { color: ${t.fgMuted}; }
                .rel-select, .rel-input, .rel-textarea { background: ${t.inputBg}; color: ${t.inputFg}; border-color: ${t.inputBorder}; }
                .rel-select:focus, .rel-input:focus, .rel-textarea:focus { border-color: ${t.accent}; }
                .rel-filter-item { background: ${t.surface}; color: ${t.fg}; }
                .rel-filter-item .rel-filter-remove { color: ${t.error}; }
                .rel-btn-primary { background: ${t.accent}; color: ${t.bg}; }
                .rel-btn-danger { background: ${t.error}; color: ${t.bg}; }
                .rel-btn-secondary { background: ${t.surface}; color: ${t.fg}; }
                .rel-settings-footer { border-color: ${t.border}; }
                .rel-page-nav-btn { background: ${t.surface}; color: ${t.fg}; }
                .rel-page-nav-btn:hover { background: ${t.surfaceHover}; }
                .rel-format-bar { border-color: ${t.border}; background: ${t.bgLight}; }
                .rel-format-btn { color: ${t.fg}; background: transparent; }
                .rel-format-btn:hover { background: ${t.surface}; border-color: ${t.border}; }
                .rel-format-sep { background: ${t.border}; }
                .rel-live-preview { background: ${t.bgAlt}; color: ${t.fg}; border-color: ${t.border}; }
                .rel-user-info-popup { background: ${t.bgLight}; color: ${t.fg}; border: 1px solid ${t.border}; }
                .rel-expand-thread { background: ${t.surface}; color: ${t.accent}; }
                .rel-macro-menu { background: ${t.bgLight}; border: 1px solid ${t.border}; }
                .rel-macro-item { background: ${t.bgLight}; color: ${t.fg}; }
                .rel-macro-item:hover { background: ${t.surface}; }
                .rel-toast-info { background: ${t.accent}; color: ${t.bg}; }
                .rel-toast-success { background: ${t.success}; color: ${t.bg}; }
                .rel-toast-error { background: ${t.error}; color: ${t.bg}; }
                .rel-tag-popup { background: ${t.bgLight}; color: ${t.fg}; border: 1px solid ${t.border}; }
                .rel-tag-popup input, .rel-tag-popup select { background: ${t.inputBg}; color: ${t.inputFg}; border: 1px solid ${t.inputBorder}; }
                .rel-button { background: ${t.surface}; color: ${t.fg}; border-color: ${t.border}; }
                .rel-button:hover { background: ${t.surfaceHover}; border-color: ${t.fgDim}; }
                .rel-ner-marker { border-color: ${t.border}; color: ${t.fgDim}; }
                .rel-sr-shortcuts a { background: ${t.surface}; color: ${t.fg}; }
                .rel-kb-hint { color: ${t.fgDim}; }
                .rel-selected-thing { outline-color: ${t.selection}; }
            `;
        },

        generateUXCSS() {
            if (!settings.enhancedUI) return '';
            const t = Themes.getTheme();
            const isDark = settings.darkMode && settings.theme !== 'light';
            const bA = isDark ? '0.08' : '0.12';
            const bHA = isDark ? '0.16' : '0.2';
            const hA = isDark ? '0.05' : '0.04';
            const sA = isDark ? '0.03' : '0.02';
            const nc = isDark
                ? ['#5b8aff','#5ec46a','#e8a54b','#e85d5d','#b36bdb','#3dc5c9']
                : ['#3b6fd4','#3a8a42','#c98620','#c94040','#8e4ab5','#2a9a9e'];

            return `
                /* ==== REL UX ENHANCEMENTS v2.4 ==== */

                /* --- TYPOGRAPHY SYSTEM --- */
                body, .md, .usertext-body, .side, .commentarea, .content, .sitetable,
                .thing .entry, .menuarea, .infobar, .footer, .footer-parent {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
                                 Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue',
                                 Arial, sans-serif !important;
                }
                .md code, .md pre, .md pre code {
                    font-family: 'Cascadia Code', 'Fira Code', 'SF Mono', 'JetBrains Mono',
                                 Consolas, 'DejaVu Sans Mono', Menlo, monospace !important;
                }
                textarea, input[type="text"], input[type="search"], input[type="url"],
                input[type="password"], input[type="email"], select { font-family: inherit !important; }

                .md { font-size: 15px !important; line-height: 1.6 !important; }
                .comment .md { font-size: 14.5px !important; line-height: 1.6 !important; }
                .comment .md p { margin: 0.4em 0 !important; }
                .comment .md p:first-child { margin-top: 0 !important; }
                .comment .md p:last-child { margin-bottom: 0 !important; }
                .link p.title { font-size: 16px !important; line-height: 1.4 !important; }
                .link .title a.title { font-weight: 500 !important; letter-spacing: -0.01em; }
                .tagline { font-size: 12px !important; line-height: 1.5 !important; letter-spacing: 0.01em; }
                .flat-list li a, .flat-list li .toggle a, .buttons li a {
                    font-size: 12px !important; font-weight: 500 !important;
                }
                p.title .domain { font-size: 11px !important; }
                .score { font-weight: 700 !important; }
                .selftext .md { max-width: none; }
                .comment .md { max-width: none; }
                .md h1, .md h2, .md h3, .md h4, .md h5, .md h6 {
                    line-height: 1.3 !important; letter-spacing: -0.01em;
                    margin-top: 1em !important; margin-bottom: 0.4em !important;
                }
                .md h1 { font-size: 1.5em !important; font-weight: 700 !important; }
                .md h2 { font-size: 1.3em !important; font-weight: 600 !important; }
                .md h3 { font-size: 1.15em !important; font-weight: 600 !important; }

                /* --- TRANSITIONS --- */
                a, .tagline a, .flat-list li a, .buttons li a, .expand,
                .arrow, .morelink, .rel-collapse-btn, .rel-toggle-all-children {
                    transition: color 0.15s ease, background-color 0.12s ease,
                                border-color 0.15s ease, opacity 0.15s ease !important;
                }
                .thing, .thing.link, .comment .entry {
                    transition: background-color 0.15s ease, border-color 0.2s ease,
                                box-shadow 0.25s cubic-bezier(.25,.8,.25,1) !important;
                }
                textarea, input[type="text"], input[type="search"], select {
                    transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
                }
                .comment .child { transition: border-color 0.15s ease !important; }
                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        transition-duration: 0.01ms !important;
                        animation-duration: 0.01ms !important;
                    }
                }

                /* --- CARD POST LAYOUT (listing pages) --- */
                body.listing-page .linklisting .thing.link {
                    margin: 0 0 8px 0 !important;
                    padding: 10px 14px 8px !important;
                    border: 1px solid ${isDark ? 'rgba(255,255,255,'+bA+')' : 'rgba(0,0,0,'+bA+')'} !important;
                    border-radius: 8px !important;
                }
                body.listing-page .linklisting .thing.link:hover {
                    border-color: ${isDark ? 'rgba(255,255,255,'+bHA+')' : 'rgba(0,0,0,'+bHA+')'} !important;
                    box-shadow: 0 2px 12px ${t.shadow} !important;
                }
                body.listing-page .link .rank { display: none !important; }
                .thumbnail { border-radius: 6px !important; overflow: hidden; margin-right: 12px !important; position: relative !important; }
                .thumbnail img { border-radius: 6px !important; position: relative; z-index: 1; }
                .thing .entry { padding: 2px 0 0 4px !important; }
                .thing .tagline { margin-bottom: 3px !important; }
                .link .usertext-body .md {
                    padding: 10px 14px !important; border-radius: 6px !important;
                    margin-top: 6px !important;
                    border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} !important;
                }

                /* --- COMMENTS - ENHANCED THREADS --- */
                .commentarea .comment > .entry {
                    padding: 6px 10px 4px !important; border-radius: 4px !important;
                }
                .commentarea .comment > .entry:hover {
                    background: ${isDark ? 'rgba(255,255,255,'+hA+')' : 'rgba(0,0,0,'+hA+')'} !important;
                }

                /* Rainbow thread nesting */
                .commentarea .comment .child {
                    margin-left: 4px !important; padding-left: 14px !important;
                    border-left-width: 2px !important; border-left-style: solid !important;
                }
                .commentarea .sitetable.nestedlisting > .comment > .child { border-left-color: ${nc[0]} !important; }
                .commentarea .child .comment > .child { border-left-color: ${nc[1]} !important; }
                .commentarea .child .child .comment > .child { border-left-color: ${nc[2]} !important; }
                .commentarea .child .child .child .comment > .child { border-left-color: ${nc[3]} !important; }
                .commentarea .child .child .child .child .comment > .child { border-left-color: ${nc[4]} !important; }
                .commentarea .child .child .child .child .child .comment > .child { border-left-color: ${nc[5]} !important; }
                .commentarea .child .child .child .child .child .child .comment > .child { border-left-color: ${nc[0]} !important; }
                .commentarea .child .child .child .child .child .child .child .comment > .child { border-left-color: ${nc[1]} !important; }
                .commentarea .comment > .child:hover { border-left-color: ${t.accent} !important; }

                /* Top-level comment separator */
                .commentarea > .sitetable.nestedlisting > .comment {
                    padding-top: 10px !important; padding-bottom: 4px !important;
                    margin-bottom: 2px !important;
                    border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'} !important;
                }

                /* Collapse toggle */
                .comment .entry .tagline .expand {
                    display: inline-block !important; font-weight: 700 !important;
                    font-size: 13px !important; padding: 1px 5px !important;
                    border-radius: 4px !important; cursor: pointer !important; margin-right: 4px !important;
                }
                .comment .entry .tagline .expand:hover {
                    background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} !important;
                    color: ${t.accent} !important;
                }
                .comment.collapsed .entry { opacity: 0.5 !important; }
                .comment.collapsed:hover .entry { opacity: 0.75 !important; }

                /* More comments */
                .morecomments { margin: 6px 0 !important; }
                .morecomments a {
                    padding: 3px 10px !important; border-radius: 4px !important;
                    font-size: 12px !important; font-weight: 500 !important;
                }
                .morecomments a:hover {
                    background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} !important;
                }

                /* --- ACTION BUTTONS --- */
                ul.flat-list.buttons {
                    display: flex !important; flex-wrap: wrap !important;
                    gap: 1px !important; padding: 2px 0 0 !important; margin: 0 !important;
                }
                .flat-list.buttons li a,
                .flat-list.buttons li .toggle a,
                .flat-list.buttons li span a {
                    display: inline-block !important; padding: 3px 8px !important;
                    border-radius: 4px !important; text-decoration: none !important;
                }
                .flat-list.buttons li a:hover,
                .flat-list.buttons li .toggle a:hover,
                .flat-list.buttons li span a:hover {
                    background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} !important;
                    color: ${t.fg} !important;
                }
                .flat-list.buttons li:first-child a { font-weight: 600 !important; }

                /* --- VOTE COLUMN --- */
                .midcol { text-align: center !important; margin-right: 6px !important; }
                .arrow { border-radius: 2px !important; }
                .arrow:hover { opacity: 0.8 !important; }
                .arrow.up:hover, .arrow.upmod { opacity: 1 !important; }
                .arrow.down:hover, .arrow.downmod { opacity: 1 !important; }

                /* --- BLOCKQUOTES --- */
                .md blockquote {
                    border-left: 3px solid ${t.accent} !important;
                    background: ${isDark ? 'rgba(255,255,255,'+sA+')' : 'rgba(0,0,0,'+sA+')'} !important;
                    margin: 0.6em 0 !important; padding: 0.5em 1em !important;
                    border-radius: 0 6px 6px 0 !important; font-size: 0.95em !important;
                }
                .md blockquote blockquote {
                    border-left-color: ${t.fgDim} !important;
                    background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'} !important;
                }
                .md blockquote p:first-child { margin-top: 0 !important; }
                .md blockquote p:last-child { margin-bottom: 0 !important; }

                /* --- CODE BLOCKS --- */
                .md code {
                    background: ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'} !important;
                    padding: 0.15em 0.4em !important; border-radius: 4px !important;
                    font-size: 0.88em !important; border: none !important;
                    color: ${isDark ? '#e06c75' : '#d63384'} !important;
                }
                .md pre {
                    background: ${isDark ? '#0d1117' : '#f6f8fa'} !important;
                    color: ${isDark ? '#c9d1d9' : '#24292f'} !important;
                    padding: 14px 16px !important; border-radius: 8px !important;
                    border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'} !important;
                    overflow-x: auto !important; font-size: 13px !important;
                    line-height: 1.55 !important; tab-size: 4 !important; margin: 0.6em 0 !important;
                }
                .md pre code {
                    background: transparent !important; padding: 0 !important;
                    border: none !important; color: inherit !important;
                    font-size: inherit !important; border-radius: 0 !important;
                }

                /* --- TABLES --- */
                .md table { border-collapse: collapse !important; margin: 0.6em 0 !important; font-size: 13px !important; }
                .md th, .md td { padding: 8px 12px !important; text-align: left !important; }
                .md th {
                    font-weight: 600 !important;
                    background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'} !important;
                }
                .md tr:nth-child(even) td {
                    background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} !important;
                }

                /* --- LINKS IN MARKDOWN --- */
                .md a {
                    text-decoration: underline !important;
                    text-decoration-color: ${isDark ? 'rgba(125,180,255,0.3)' : 'rgba(0,90,180,0.25)'} !important;
                    text-underline-offset: 0.15em !important;
                    text-decoration-thickness: 1px !important;
                    text-decoration-skip-ink: auto !important;
                }
                .md a:hover {
                    text-decoration-color: ${isDark ? 'rgba(125,180,255,0.8)' : 'rgba(0,90,180,0.7)'} !important;
                }
                .tagline a, .flat-list a, .title a, .morecomments a,
                .tabmenu a, .side a, #header a, .search-result a { text-decoration: none !important; }

                /* --- FLAIR & BADGES --- */
                .flair, .linkflairlabel {
                    border-radius: 10px !important; padding: 1px 8px !important;
                    font-size: 11px !important; font-weight: 500 !important;
                }
                .linkflairlabel {
                    background: ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'} !important;
                    border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
                }
                /* Role badges styled in ROLE FLAIR section below */

                /* --- HEADER & NAV --- */
                #header { box-shadow: 0 1px 3px ${t.shadow} !important; }
                #sr-header-area { border: none !important; line-height: 28px !important; font-size: 12px !important; }
                #header-bottom-left .tabmenu li a {
                    display: inline-block !important; padding: 5px 12px !important;
                    border-radius: 6px !important; font-size: 13px !important;
                    font-weight: 500 !important; border: none !important;
                }
                #header-bottom-left .tabmenu li a:hover {
                    background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} !important;
                }
                #header-bottom-left .tabmenu li.selected a {
                    border-radius: 6px !important; font-weight: 600 !important;
                }
                .pagename a { font-weight: 700 !important; font-size: 18px !important; letter-spacing: -0.02em !important; }
                .pagename { margin-right: 8px !important; }

                /* --- SEARCH --- */
                #search input[type="text"] {
                    padding: 7px 12px !important; border-radius: 6px !important; font-size: 13px !important;
                }

                /* --- SIDEBAR --- */
                .side { font-size: 13px !important; }
                .side .md { line-height: 1.5 !important; font-size: 13px !important; }
                .side .titlebox { padding: 12px !important; border-radius: 8px !important; }
                .morelink { border-radius: 8px !important; text-align: center !important; font-weight: 600 !important; }
                .morelink .nub { display: none !important; }
                .sidebox.create { display: none !important; }

                /* --- TEXTAREA & INPUTS --- */
                .usertext-edit textarea {
                    font-size: 14px !important; line-height: 1.6 !important;
                    padding: 10px 12px !important; border-radius: 6px !important;
                    min-height: 100px !important; resize: vertical !important;
                }
                .usertext-edit .bottom-area { border-radius: 0 0 6px 6px !important; padding: 6px 10px !important; }
                .usertext-edit { border-radius: 8px !important; overflow: hidden !important; }

                /* --- FOCUS STATES --- */
                a:focus-visible, button:focus-visible, .arrow:focus-visible,
                textarea:focus-visible, input:focus-visible, select:focus-visible {
                    outline: none !important;
                    box-shadow: 0 0 0 2px ${isDark ? 'rgba(88,166,255,0.5)' : 'rgba(0,90,180,0.4)'} !important;
                    border-radius: 4px;
                }
                textarea:focus, input[type="text"]:focus, input[type="search"]:focus,
                input[type="url"]:focus, input[type="password"]:focus, select:focus {
                    box-shadow: 0 0 0 3px ${isDark ? 'rgba(88,166,255,0.15)' : 'rgba(0,90,180,0.12)'} !important;
                    outline: none !important;
                }

                /* --- MENUS & DROPDOWNS --- */
                .commentarea .menuarea { padding: 8px 0 !important; margin-bottom: 6px !important; }
                .menuarea .dropdown.lightdrop .selected { font-weight: 600 !important; font-size: 12px !important; }
                .drop-choices { border-radius: 6px !important; overflow: hidden !important; box-shadow: 0 4px 16px ${t.shadow} !important; }
                .drop-choices a.choice { padding: 6px 14px !important; font-size: 13px !important; }
                .expando-button { border-radius: 4px !important; }
                .linkinfo { border-radius: 8px !important; padding: 10px 14px !important; }

                /* --- MISC POLISH --- */
                .rel-ner-marker {
                    border-radius: 6px !important; padding: 8px 16px !important;
                    margin: 12px 0 !important; font-size: 11px !important; font-weight: 600 !important;
                    letter-spacing: 0.03em !important; text-transform: uppercase !important;
                }
                .rel-page-nav-btn { border-radius: 8px !important; backdrop-filter: blur(8px) !important; }
                .md .spoiler { border-radius: 4px !important; padding: 1px 6px !important; cursor: pointer !important; }
                ::-webkit-scrollbar { width: 8px !important; }
                ::-webkit-scrollbar-thumb { border-radius: 8px !important; }
                .md hr { border: none !important; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} !important; margin: 1em 0 !important; }
                .md ul, .md ol { padding-left: 1.8em !important; margin: 0.4em 0 !important; }
                .md li { margin: 0.15em 0 !important; line-height: 1.55 !important; }
                .md img:not(.flair):not([width="16"]):not([height="16"]) { border-radius: 6px !important; max-width: 100% !important; }
                html { scroll-behavior: smooth; }
                body.listing-page .nav-buttons { padding: 12px 0 !important; }
                body.listing-page .nav-buttons .nextprev a {
                    padding: 6px 16px !important; border-radius: 6px !important;
                    font-weight: 500 !important; font-size: 13px !important;
                }
                .promoted-tag, .sponsored-indicator, .promotedlink .promoted-tag { display: none !important; }

                /* --- CAKE DAY CELEBRATION --- */
                @keyframes rel-cakeday-shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                /* Entry highlight for comments with cake day users */
                .comment .entry:has(a.cakeday) {
                    border-left: 3px solid transparent !important;
                    border-image: linear-gradient(180deg, #ff6b6b, #ffa726, #ffee58, #66bb6a, #42a5f5, #ab47bc) 1 !important;
                    padding-left: 10px !important;
                    background: ${isDark
                        ? 'linear-gradient(135deg, rgba(255,167,38,0.06) 0%, rgba(255,87,34,0.03) 50%, rgba(171,71,188,0.04) 100%)'
                        : 'linear-gradient(135deg, rgba(255,167,38,0.08) 0%, rgba(255,87,34,0.04) 50%, rgba(171,71,188,0.05) 100%)'
                    } !important;
                    border-radius: 6px !important;
                    position: relative !important;
                }
                /* Shimmer bar on top */
                .comment .entry:has(a.cakeday)::before {
                    content: '' !important;
                    position: absolute !important;
                    top: 0 !important; left: 0 !important; right: 0 !important;
                    height: 2px !important;
                    background: linear-gradient(90deg,
                        transparent, #ff6b6b, #ffa726, #ffee58, #66bb6a, #42a5f5, #ab47bc, transparent
                    ) !important;
                    background-size: 200% 100% !important;
                    animation: rel-cakeday-shimmer 3s linear infinite !important;
                    border-radius: 6px 6px 0 0 !important;
                }
                /* Cake day badge after username */
                .tagline .userattrs:has(a.cakeday)::after {
                    content: 'Cake Day!' !important;
                    display: inline-block !important;
                    margin-left: 6px !important;
                    padding: 1px 8px !important;
                    border-radius: 10px !important;
                    font-size: 10px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.03em !important;
                    background: linear-gradient(135deg, #ffa726, #ff7043) !important;
                    color: #fff !important;
                    vertical-align: middle !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
                    box-shadow: 0 1px 4px rgba(255,167,38,0.3) !important;
                }
                /* Animated glow on cake emoji */
                @keyframes rel-cakeday-flame {
                    0%, 100% { d: path('M10 3.5 Q10 1 10 1 Q10 1 10 3.5'); opacity: 0.9; }
                    25% { d: path('M10 3.5 Q8.5 1 10 0.5 Q11 1 10 3.5'); opacity: 1; }
                    50% { d: path('M10 3.5 Q9 0.5 10 0 Q11.5 1 10 3.5'); opacity: 0.95; }
                    75% { d: path('M10 3.5 Q11 1 10 0.5 Q9 0.8 10 3.5'); opacity: 1; }
                }
                @keyframes rel-cakeday-flame-glow {
                    0%, 100% { filter: drop-shadow(0 0 2px #ff9800) drop-shadow(0 0 4px rgba(255,152,0,0.4)); }
                    50% { filter: drop-shadow(0 0 3px #ffb74d) drop-shadow(0 0 6px rgba(255,152,0,0.6)); }
                }
                @keyframes rel-cakeday-name {
                    0% { color: #ff6b6b; text-shadow: 0 0 6px rgba(255,107,107,0.6), 0 0 12px rgba(255,107,107,0.3); }
                    16% { color: #ffa726; text-shadow: 0 0 6px rgba(255,167,38,0.6), 0 0 12px rgba(255,167,38,0.3); }
                    33% { color: #ffee58; text-shadow: 0 0 6px rgba(255,238,88,0.6), 0 0 12px rgba(255,238,88,0.3); }
                    50% { color: #66bb6a; text-shadow: 0 0 6px rgba(102,187,106,0.6), 0 0 12px rgba(102,187,106,0.3); }
                    66% { color: #42a5f5; text-shadow: 0 0 6px rgba(66,165,245,0.6), 0 0 12px rgba(66,165,245,0.3); }
                    83% { color: #ab47bc; text-shadow: 0 0 6px rgba(171,71,188,0.6), 0 0 12px rgba(171,71,188,0.3); }
                    100% { color: #ff6b6b; text-shadow: 0 0 6px rgba(255,107,107,0.6), 0 0 12px rgba(255,107,107,0.3); }
                }
                a.author.cakeday {
                    animation: rel-cakeday-name 3s linear infinite !important;
                    font-weight: 700 !important;
                    font-size: 13px !important;
                    letter-spacing: 0.02em !important;
                }
                .userattrs a.cakeday {
                    font-size: 0 !important;
                    line-height: 0 !important;
                    display: inline-block !important;
                    width: 20px !important; height: 20px !important;
                    vertical-align: middle !important;
                    text-decoration: none !important;
                    background: none !important;
                    position: relative !important;
                    animation: rel-cakeday-flame-glow 1.5s ease-in-out infinite !important;
                }
                .userattrs a.cakeday::before {
                    content: '' !important;
                    position: absolute !important;
                    inset: 0 !important;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cdefs%3E%3ClinearGradient id='cake' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23ff7eb3'/%3E%3Cstop offset='100%25' stop-color='%23ff3d7f'/%3E%3C/linearGradient%3E%3ClinearGradient id='frost' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23fff3e0'/%3E%3Cstop offset='100%25' stop-color='%23ffe0b2'/%3E%3C/linearGradient%3E%3ClinearGradient id='fl' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23fff176'/%3E%3Cstop offset='40%25' stop-color='%23ffb74d'/%3E%3Cstop offset='100%25' stop-color='%23ff7043'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='3' y='10' width='14' height='7' rx='2' fill='url(%23cake)'/%3E%3Crect x='3' y='10' width='14' height='3' rx='1.5' fill='url(%23frost)'/%3E%3Ccircle cx='6' cy='11.5' r='0.8' fill='%23e91e63' opacity='0.6'/%3E%3Ccircle cx='10' cy='11.5' r='0.8' fill='%234caf50' opacity='0.6'/%3E%3Ccircle cx='14' cy='11.5' r='0.8' fill='%232196f3' opacity='0.6'/%3E%3Crect x='9.5' y='5' width='1' height='5.5' rx='0.5' fill='%23fff9c4'/%3E%3Cellipse cx='10' cy='3' rx='2' ry='3' fill='url(%23fl)' opacity='0.9'%3E%3Canimate attributeName='ry' values='3;2.5;3.2;2.8;3' dur='0.8s' repeatCount='indefinite'/%3E%3Canimate attributeName='rx' values='2;1.6;2.2;1.8;2' dur='0.6s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0.9;1;0.85;1;0.9' dur='0.7s' repeatCount='indefinite'/%3E%3C/ellipse%3E%3Crect x='2' y='16' width='16' height='1.5' rx='0.75' fill='%23e0e0e0' opacity='0.15'/%3E%3C/svg%3E") !important;
                    background-size: contain !important;
                    background-repeat: no-repeat !important;
                    background-position: center !important;
                }
                /* Post listing entries with cake day */
                .thing.link .entry:has(a.cakeday) {
                    border-left: 3px solid transparent !important;
                    border-image: linear-gradient(180deg, #ff6b6b, #ffa726, #ffee58, #66bb6a, #42a5f5, #ab47bc) 1 !important;
                    padding-left: 10px !important;
                    background: ${isDark
                        ? 'linear-gradient(135deg, rgba(255,167,38,0.05) 0%, rgba(171,71,188,0.03) 100%)'
                        : 'linear-gradient(135deg, rgba(255,167,38,0.07) 0%, rgba(171,71,188,0.04) 100%)'
                    } !important;
                    border-radius: 6px !important;
                }

                /* --- ROLE FLAIR: OP / MOD / ADMIN --- */
                @keyframes rel-op-glow {
                    0%, 100% { text-shadow: 0 0 4px rgba(56,139,253,0.4); }
                    50% { text-shadow: 0 0 8px rgba(56,139,253,0.7), 0 0 16px rgba(56,139,253,0.3); }
                }
                @keyframes rel-mod-glow {
                    0%, 100% { text-shadow: 0 0 4px rgba(45,164,78,0.4); }
                    50% { text-shadow: 0 0 8px rgba(45,164,78,0.7), 0 0 16px rgba(45,164,78,0.3); }
                }
                @keyframes rel-admin-glow {
                    0%, 100% { text-shadow: 0 0 4px rgba(207,34,46,0.4); }
                    50% { text-shadow: 0 0 8px rgba(207,34,46,0.7), 0 0 16px rgba(207,34,46,0.3); }
                }

                /* OP (Submitter) - Blue theme */
                a.author.submitter {
                    color: #58a6ff !important;
                    font-weight: 700 !important;
                    animation: rel-op-glow 2.5s ease-in-out infinite !important;
                }
                .tagline .userattrs a.submitter {
                    background: linear-gradient(135deg, #1f6feb, #388bfd) !important;
                    color: #fff !important;
                    padding: 1px 8px !important; border-radius: 10px !important;
                    font-size: 10px !important; font-weight: 700 !important;
                    text-decoration: none !important;
                    box-shadow: 0 1px 4px rgba(56,139,253,0.3) !important;
                    letter-spacing: 0.03em !important;
                }
                .tagline .userattrs a.submitter::before {
                    content: '📢 ' !important;
                    font-size: 10px !important;
                }
                /* OP comment highlight */
                .comment .entry:has(a.author.submitter) {
                    border-left: 2px solid #388bfd !important;
                    padding-left: 8px !important;
                    background: ${isDark ? 'rgba(56,139,253,0.04)' : 'rgba(56,139,253,0.06)'} !important;
                    border-radius: 4px !important;
                }

                /* Moderator - Green theme */
                a.author.moderator {
                    color: #3fb950 !important;
                    font-weight: 700 !important;
                    animation: rel-mod-glow 2.5s ease-in-out infinite !important;
                }
                .tagline .userattrs a.moderator {
                    background: linear-gradient(135deg, #238636, #2da44e) !important;
                    color: #fff !important;
                    padding: 1px 8px !important; border-radius: 10px !important;
                    font-size: 10px !important; font-weight: 700 !important;
                    text-decoration: none !important;
                    box-shadow: 0 1px 4px rgba(45,164,78,0.3) !important;
                    letter-spacing: 0.03em !important;
                }
                .tagline .userattrs a.moderator::before {
                    content: '🛡 ' !important;
                    font-size: 10px !important;
                }
                /* Mod comment highlight */
                .comment .entry:has(a.author.moderator) {
                    border-left: 2px solid #2da44e !important;
                    padding-left: 8px !important;
                    background: ${isDark ? 'rgba(45,164,78,0.04)' : 'rgba(45,164,78,0.06)'} !important;
                    border-radius: 4px !important;
                }

                /* Admin - Red theme */
                a.author.admin {
                    color: #f85149 !important;
                    font-weight: 700 !important;
                    animation: rel-admin-glow 2.5s ease-in-out infinite !important;
                }
                .tagline .userattrs a.admin {
                    background: linear-gradient(135deg, #b62324, #cf222e) !important;
                    color: #fff !important;
                    padding: 1px 8px !important; border-radius: 10px !important;
                    font-size: 10px !important; font-weight: 700 !important;
                    text-decoration: none !important;
                    box-shadow: 0 1px 4px rgba(207,34,46,0.3) !important;
                    letter-spacing: 0.03em !important;
                }
                .tagline .userattrs a.admin::before {
                    content: '👑 ' !important;
                    font-size: 10px !important;
                }
                /* Admin comment highlight */
                .comment .entry:has(a.author.admin) {
                    border-left: 2px solid #cf222e !important;
                    padding-left: 8px !important;
                    background: ${isDark ? 'rgba(207,34,46,0.04)' : 'rgba(207,34,46,0.06)'} !important;
                    border-radius: 4px !important;
                }

                /* Friend - Orange theme */
                a.author.friend {
                    color: #f0883e !important;
                    font-weight: 600 !important;
                }
                .tagline .userattrs a.friend {
                    background: linear-gradient(135deg, #bd561d, #db6d28) !important;
                    color: #fff !important;
                    padding: 1px 8px !important; border-radius: 10px !important;
                    font-size: 10px !important; font-weight: 700 !important;
                    text-decoration: none !important;
                    box-shadow: 0 1px 4px rgba(219,109,40,0.3) !important;
                }
                .tagline .userattrs a.friend::before {
                    content: '⭐ ' !important;
                    font-size: 10px !important;
                }

                /* --- HIDE UNNECESSARY ELEMENTS --- */
                a.reddiquette { display: none !important; }
                a.option.active { display: none !important; }
                div.nav-buttons { display: none !important; }
                div.rel-ner-marker { display: none !important; }
                div.footer-parent { display: none !important; }
                div.ad-container.link.promoted { display: none !important; }
                a.about-this-ad-button { display: none !important; }
                span.selected.title { color: #999999 !important; }
                #header-bottom-right { background: ${t.bg} !important; }
                #header-bottom-left { background: ${t.bg} !important; }
                body #header #header-bottom-left { background: ${t.bg} !important; background-image: none !important; }
                #sr-more-link { background-color: #000000 !important; }

                /* --- COMMENT TEXTAREA FULL WIDTH --- */
                div.usertext-edit.md-container { width: 100% !important; box-sizing: border-box !important; }
                div.usertext-edit textarea { width: 100% !important; box-sizing: border-box !important; }
                div.usertext-edit p { width: 100% !important; box-sizing: border-box !important; }

                /* --- BOTTOM AREA TIGHTEN --- */
                div.bottom-area { margin-top: -14px !important; margin-bottom: -10px !important; }
            `;
        }
    };

    // =========================================================================
    // SETTINGS MODULE (Tabbed Panel with Theme Picker)
    // =========================================================================
    const SettingsModule = {
        init() {
            // Add gear icon to userbar
            const userbar = document.querySelector('#header-bottom-right');
            if (userbar) {
                const gear = Utils.createElement('span', {
                    className: 'rel-settings-btn',
                    textContent: '\u2699',
                    title: 'Reddit Enhancement Continued Settings',
                    onClick: () => this.showPanel()
                });
                userbar.prepend(gear);
            }
            GM_registerMenuCommand('REL Settings', () => this.showPanel());
        },

        showPanel() {
            if (document.querySelector('.rel-settings-overlay')) return;

            const t = Themes.getTheme();
            const overlay = Utils.createElement('div', { className: 'rel-settings-overlay' });
            let closeOverlay = () => overlay.remove();

            const tabs = [
                { id: 'appearance', label: 'Appearance' },
                { id: 'content', label: 'Content' },
                { id: 'comments', label: 'Comments' },
                { id: 'navigation', label: 'Navigation' },
                { id: 'filtering', label: 'Filtering' },
                { id: 'privacy', label: 'Privacy' },
                { id: 'sync', label: 'Sync' },
                { id: 'diff', label: 'Diff' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'backup', label: 'Backup' }
            ];

            const settingDefs = {
                appearance: [
                    { key: 'darkMode', label: 'Dark Mode', desc: 'Enable dark theme' },
                    { key: 'theme', label: 'Theme', desc: 'Choose color scheme', type: 'theme' },
                    { key: 'oldFavicon', label: 'Old Reddit Favicon', desc: 'Restore the classic Snoo favicon' },
                    { key: 'collapsibleSidebar', label: 'Collapsible Sidebar', desc: 'Toggle sidebar visibility' },
                    { key: 'hideGoldButton', label: 'Hide Gold Button', desc: 'Remove give gold buttons' },
                    { key: 'hideShareButton', label: 'Hide Share Button', desc: 'Remove share buttons from posts and comments' },
                    { key: 'hideSaveButton', label: 'Hide Save Button', desc: 'Remove save buttons from posts and comments' },
                    { key: 'hideCrosspostButton', label: 'Hide Crosspost Button', desc: 'Remove crosspost buttons from posts' },
                    { key: 'hideReportButton', label: 'Hide Report Button', desc: 'Remove report buttons from posts and comments' },
                    { key: 'hideSidebar', label: 'Auto-Hide Sidebar', desc: 'Start with sidebar collapsed' },
                    { key: 'selectedEntryHighlight', label: 'Selected Entry Highlight', desc: 'Outline currently focused post/comment' },
                    { key: 'customCSS', label: 'Custom CSS', desc: 'Add your own CSS rules', type: 'textarea' },
                    { key: 'removeSubredditStyles', label: 'Remove Subreddit Styles', desc: 'Strip custom CSS from subreddits for consistent dark mode' },
                    { key: 'wideView', label: 'Wide View', desc: 'Expand content area to use full screen width' },
                    { key: 'enhancedUI', label: 'Enhanced UI', desc: 'Modern typography, card layouts, rainbow threads, polished interactions' },
                    { key: 'discordLayout', label: 'Discord-Style Layout (Experimental)', desc: 'Use channel-like headers and chat-style cards; reload to apply' },
                    { type: 'paletteEditor' },
                    { type: 'fontPicker' }
                ],
                content: [
                    { key: 'inlineImageExpansion', label: 'Inline Image Expansion', desc: 'Expand images and videos inline' },
                    { key: 'inlineImageFix', label: 'Inline Image Fix', desc: 'Auto-convert image links in comments' },
                    { key: 'embedYouTube', label: 'YouTube Embeds', desc: 'Embed YouTube videos inline' },
                    { key: 'embedRedditPreviews', label: 'Reddit Post Previews', desc: 'Preview linked Reddit posts' },
                    { key: 'embedSocialMedia', label: 'Social Media Previews', desc: 'Preview Twitter/X and other links' },
                    { key: 'singleClickOpener', label: 'Single Click Opener', desc: 'Add [l+c] links to open link and comments' },
                    { key: 'showTimestamps', label: 'Enhanced Timestamps', desc: 'Show full timestamps on hover' },
                    { key: 'voteEnhancements', label: 'Vote Enhancements', desc: 'Color-coded scores and vote weight tracking' },
                    { key: 'showUserInfo', label: 'User Info Popup', desc: 'Show user info on hover' },
                    { key: 'downloadButtons', label: 'Download Buttons', desc: 'Add download buttons for images on posts' },
                    { key: 'subredditDescription', label: 'Subreddit Description', desc: 'Show About Community box in sidebar from new Reddit API' },
                    { key: 'viewCounter', label: 'Post View Counter', desc: 'Display estimated view counts on posts (from Classic Reddit++)' },
                    { key: 'voteEstimator', label: 'Vote Estimator', desc: 'Show estimated upvote/downvote counts and percentage (from Classic Reddit++)' },
                    { key: 'fullScores', label: 'Full Scores', desc: 'Show full numbers instead of abbreviated (e.g. 1,234 vs 1.2k)' },
                    { key: 'userPrefix', label: 'Username /u/ Prefix', desc: 'Add /u/ before usernames' },
                    { key: 'trendingSubreddits', label: 'Trending Subreddits', desc: 'Show simulated trending subreddits bar on front page' }
                ],
                comments: [
                    { key: 'commentHighlighting', label: 'Comment Highlighting', desc: 'Highlight new comments since last visit' },
                    { key: 'commentDepthIndicators', label: 'Depth Indicators', desc: 'Rainbow color bars showing comment depth' },
                    { key: 'collapseChildComments', label: 'Hide Child Comments', desc: 'Add per-comment and page-wide toggle buttons to collapse reply threads (RES-style)' },
                    { key: 'collapseChildCommentsDefault', label: 'Auto-Hide Children', desc: 'Automatically hide all child comments on page load' },
                    { key: 'collapseChildCommentsNested', label: 'Nested Toggle Buttons', desc: 'Add hide/show buttons on all comments with children, not just top-level' },
                    { key: 'collapseChildCommentsHideNested', label: 'Hide Deeply Nested', desc: 'When hiding all, also recursively hide children of nested comments' },
                    { key: 'formattingToolbar', label: 'Formatting Toolbar', desc: 'Markdown formatting buttons and live preview' },
                    { key: 'livePreview', label: 'Live Preview', desc: 'Preview markdown as you type' },
                    { key: 'spoilerTags', label: 'Inline Spoiler Tags', desc: 'Respect >!...!< spoiler syntax in comments' },
                    { key: 'expandContinueThread', label: 'Expand Continue Thread', desc: 'Load continued threads inline' },
                    { key: 'liveCommentRefresh', label: 'Live Comment Refresh', desc: 'Insert new comments without reloading the page' },
                    { key: 'liveCommentRefreshSeconds', label: 'Refresh Interval (seconds)', desc: 'Automatic comment refresh interval (15-600)', type: 'number', min: 15, max: 600 },
                    { key: 'hideAutoModerator', label: 'Hide Bot Comments', desc: 'Auto-collapse AutoModerator, mod-bots, and other known bot comments' },
                    { key: 'depthColorScheme', label: 'Depth Colors', desc: 'Color scheme for depth indicators', type: 'select',
                      options: [
                          { value: 'rainbow', label: 'Rainbow' },
                          { value: 'warm', label: 'Warm' },
                          { value: 'cool', label: 'Cool' },
                          { value: 'pastel', label: 'Pastel' }
                      ]
                    }
                ],
                navigation: [
                    { key: 'neverEndingReddit', label: 'Never Ending Reddit', desc: 'Infinite scroll through pages' },
                    { key: 'keyboardNav', label: 'Keyboard Navigation', desc: 'Navigate with j/k, vote with a/z' },
                    { key: 'pageNavigator', label: 'Page Navigator', desc: 'Floating scroll-to-top/bottom buttons' },
                    { key: 'subredditShortcuts', label: 'Subreddit Shortcuts', desc: 'Custom subreddit shortcut bar' },
                    { key: 'savedViewsMenu', label: 'Saved Searches & Filters', desc: 'Show a header menu for saved searches and filter presets' },
                    { key: 'multiRedditBuilder', label: 'Multi-Reddit Builder', desc: 'Build and save combined subreddit feeds locally' },
                    { key: 'sessionTabs', label: 'Session Tabs', desc: 'Remember open comment threads across reloads in this browser session' },
                    { key: 'markAllAsRead', label: 'Inbox Mark All Read', desc: 'Add a bulk mark-as-read action to old Reddit message pages' },
                    { key: 'perDeviceProfile', label: 'Per-Device Profile', desc: 'Keep settings in this browser profile instead of the shared userscript store', type: 'profile' },
                    { key: 'oldRedditRedirect', label: 'Old Reddit Redirect', desc: 'Redirect to old.reddit.com automatically' },
                    { key: 'scrollToTopOnNav', label: 'Scroll to Top', desc: 'Scroll to top when navigating pages' },
                    { key: 'nerPauseAfterPages', label: 'NER Pause After Pages', desc: 'Pause infinite scroll after N pages (0 = never)', type: 'number', min: 0, max: 50 },
                    { key: 'autoHideAfterVote', label: 'Auto-Hide After Vote', desc: 'Hide posts after upvoting or downvoting' },
                    { key: 'stateSaver', label: 'State Saver', desc: 'Preserve scroll position when navigating back from posts' },
                    { key: 'notificationRedirect', label: 'Notification Redirect', desc: 'Redirect old.reddit.com/notifications to sh.reddit.com (which actually works)' },
                    { key: 'apiCanary', label: 'Reddit API Canary', desc: 'Periodically check a public JSON response for API/schema changes' },
                    { key: 'apiCanaryIntervalHours', label: 'Canary Interval (hours)', desc: 'Minimum time between API canary checks (1-168)', type: 'number', min: 1, max: 168 },
                    { key: 'touchGestures', label: 'Touch Swipe Gestures', desc: 'Use horizontal swipes to move between listing pages' },
                    { key: 'touchSwipeThreshold', label: 'Swipe Threshold (px)', desc: 'Minimum horizontal movement for a swipe (40-240)', type: 'number', min: 40, max: 240 }
                ],
                filtering: [
                    { key: 'postFiltering', label: 'Post Filtering', desc: 'Filter posts by keyword, domain, subreddit, flair' },
                    { key: 'lowEffortHeuristic', label: 'Low-Effort Heuristic', desc: 'Opt-in title heuristic using length, capitalization, and emoji density' },
                    { key: 'lowEffortThreshold', label: 'Low-Effort Score Threshold', desc: 'Signals required before hiding a post (1-3)', type: 'number', min: 1, max: 3 },
                    { key: 'userTagging', label: 'User Tagging', desc: 'Tag users with custom labels and colors' },
                    { key: 'userHighlighter', label: 'User Highlighter', desc: 'Color-code OP, mods, admins, and friends' },
                    { type: 'commentSweep' },
                    { type: 'filterEditor' }
                ],
                privacy: [
                    { key: 'adBlocker', label: 'Ad Blocker', desc: 'Hide all promoted posts, sponsored content, gold ads, and Reddit Premium banners' },
                    { key: 'noParticipation', label: 'No Participation', desc: 'Enforce NP mode on np.reddit.com links' },
                    { type: 'ignoredUsers' }
                ],
                sync: [
                    { type: 'sync' }
                ],
                diff: [
                    { type: 'settingsDiff' }
                ],
                analytics: [
                    { type: 'analytics' }
                ],
                backup: [
                    { type: 'backupRestore' }
                ]
            };

            const panel = Utils.createElement('div', { className: 'rel-settings-panel' });

            // Header
            const header = Utils.createElement('div', { className: 'rel-settings-header' });
            header.innerHTML = `<h2>\u2699 Reddit Enhancement Continued <span class="rel-version">v${VERSION}</span></h2>`;
            const closeBtn = Utils.createElement('button', { className: 'rel-settings-close', textContent: '\u2715', 'aria-label': 'Close settings', onClick: () => closeOverlay() });
            header.appendChild(closeBtn);
            panel.appendChild(header);

            // Tabs
            const tabBar = Utils.createElement('div', { className: 'rel-settings-tabs' });
            tabs.forEach((tab, i) => {
                const btn = Utils.createElement('button', {
                    className: 'rel-tab' + (i === 0 ? ' active' : ''),
                    textContent: tab.label,
                    'data-tab': tab.id,
                    onClick: (e) => {
                        tabBar.querySelectorAll('.rel-tab').forEach(t => t.classList.remove('active'));
                        e.target.classList.add('active');
                        body.querySelectorAll('.rel-tab-content').forEach(c => c.classList.remove('active'));
                        body.querySelector(`[data-content="${tab.id}"]`).classList.add('active');
                    }
                });
                tabBar.appendChild(btn);
            });
            panel.appendChild(tabBar);

            // Body
            const body = Utils.createElement('div', { className: 'rel-settings-body' });
            tabs.forEach((tab, i) => {
                const content = Utils.createElement('div', {
                    className: 'rel-tab-content' + (i === 0 ? ' active' : ''),
                    'data-content': tab.id
                });

                const defs = settingDefs[tab.id] || [];
                defs.forEach(def => {
                    if (def.type === 'theme') {
                        content.appendChild(this.buildThemePicker());
                    } else if (def.type === 'paletteEditor') {
                        content.appendChild(this.buildPaletteEditor());
                    } else if (def.type === 'fontPicker') {
                        content.appendChild(this.buildFontPicker());
                    } else if (def.type === 'filterEditor') {
                        content.appendChild(this.buildFilterEditor());
                    } else if (def.type === 'commentSweep') {
                        content.appendChild(this.buildCommentSweep());
                    } else if (def.type === 'backupRestore') {
                        content.appendChild(this.buildBackupRestore());
                    } else if (def.type === 'sync') {
                        content.appendChild(this.buildSyncSettings());
                    } else if (def.type === 'settingsDiff') {
                        content.appendChild(this.buildSettingsDiff());
                    } else if (def.type === 'analytics') {
                        content.appendChild(this.buildAnalyticsPanel());
                    } else if (def.type === 'ignoredUsers') {
                        content.appendChild(this.buildIgnoredUsers());
                    } else if (def.type === 'textarea') {
                        content.appendChild(this.buildTextareaSetting(def));
                    } else if (def.type === 'select') {
                        content.appendChild(this.buildSelectSetting(def));
                    } else if (def.type === 'number') {
                        content.appendChild(this.buildNumberSetting(def));
                    } else if (def.type === 'profile') {
                        content.appendChild(this.buildProfileSetting(def));
                    } else {
                        content.appendChild(this.buildToggle(def));
                    }
                });

                body.appendChild(content);
            });
            panel.appendChild(body);

            // Footer
            const footer = Utils.createElement('div', { className: 'rel-settings-footer' });
            footer.innerHTML = `<span style="font-size:11px;opacity:0.5;">Changes auto-save. Reload for some settings.</span>`;
            const actions = Utils.createElement('div', { className: 'rel-footer-actions' });
            const reloadBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-primary',
                textContent: 'Reload Page',
                onClick: () => location.reload()
            });
            actions.appendChild(reloadBtn);
            footer.appendChild(actions);
            panel.appendChild(footer);

            overlay.appendChild(panel);
            let cleanupModal;
            closeOverlay = () => { cleanupModal?.(); overlay.remove(); };
            cleanupModal = ModalA11yModule.attach(overlay, panel, closeOverlay);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
            document.body.appendChild(overlay);
        },

        buildToggle(def) {
            const item = Utils.createElement('div', { className: 'rel-setting-item' });
            item.innerHTML = `
                <div class="rel-setting-info">
                    <label>${Utils.escapeHTML(def.label)}</label>
                    <div class="rel-setting-desc">${Utils.escapeHTML(def.desc)}</div>
                </div>
            `;
            const toggle = Utils.createElement('label', { className: 'rel-toggle' });
            const input = Utils.createElement('input', { type: 'checkbox' });
            input.checked = !!settings[def.key];
            input.addEventListener('change', () => {
                settings[def.key] = input.checked;
                saveSettings();
                if (def.key === 'darkMode') {
                    document.body.classList.toggle('rel-dark-mode', input.checked);
                    this.applyThemeCSS();
                }
                if (def.key === 'hideGoldButton') {
                    document.body.classList.toggle('rel-hide-gold', input.checked);
                }
                if (def.key === 'hideShareButton') {
                    document.body.classList.toggle('rel-hide-share', input.checked);
                }
                if (def.key === 'hideSaveButton') {
                    document.body.classList.toggle('rel-hide-save', input.checked);
                }
                if (def.key === 'hideCrosspostButton') {
                    document.body.classList.toggle('rel-hide-crosspost', input.checked);
                }
                if (def.key === 'hideReportButton') {
                    document.body.classList.toggle('rel-hide-report', input.checked);
                }
            });
            toggle.appendChild(input);
            toggle.appendChild(Utils.createElement('span', { className: 'rel-toggle-slider' }));
            item.appendChild(toggle);
            return item;
        },

        buildSelectSetting(def) {
            const item = Utils.createElement('div', { className: 'rel-setting-item' });
            item.innerHTML = `
                <div class="rel-setting-info">
                    <label>${Utils.escapeHTML(def.label)}</label>
                    <div class="rel-setting-desc">${Utils.escapeHTML(def.desc)}</div>
                </div>
            `;
            const select = Utils.createElement('select', { className: 'rel-select' });
            def.options.forEach(opt => {
                const option = Utils.createElement('option', { value: opt.value, textContent: opt.label });
                if (settings[def.key] === opt.value) option.selected = true;
                select.appendChild(option);
            });
            select.addEventListener('change', () => {
                settings[def.key] = select.value;
                saveSettings();
            });
            item.appendChild(select);
            return item;
        },

        buildNumberSetting(def) {
            const item = Utils.createElement('div', { className: 'rel-setting-item' });
            item.innerHTML = `
                <div class="rel-setting-info">
                    <label>${Utils.escapeHTML(def.label)}</label>
                    <div class="rel-setting-desc">${Utils.escapeHTML(def.desc)}</div>
                </div>
            `;
            const input = Utils.createElement('input', {
                type: 'number', className: 'rel-input', style: { width: '60px' },
            });
            input.min = def.min || 0;
            input.max = def.max || 999;
            input.value = settings[def.key] || 0;
            input.addEventListener('change', () => {
                settings[def.key] = parseInt(input.value) || 0;
                saveSettings();
            });
            item.appendChild(input);
            return item;
        },

        buildTextareaSetting(def) {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = `<h3>${Utils.escapeHTML(def.label)}</h3><div class="rel-setting-desc" style="margin-bottom:6px;">${Utils.escapeHTML(def.desc)}</div>`;
            const ta = Utils.createElement('textarea', { className: 'rel-textarea' });
            ta.value = settings[def.key] || '';
            ta.addEventListener('input', Utils.debounce(() => {
                settings[def.key] = ta.value;
                saveSettings();
            }, 500));
            section.appendChild(ta);
            return section;
        },

        buildPaletteEditor() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Theme Palette Editor</h3><div class="rel-setting-desc" style="margin-bottom:8px;">Edit safe color tokens for a theme. Overrides are stored separately from built-in themes and can be exported or reset.</div>';
            const themeSelect = Utils.createElement('select', { className: 'rel-select', style: { marginBottom: '8px' } });
            Object.entries(Themes.definitions).forEach(([id, theme]) => {
                const option = Utils.createElement('option', { value: id, textContent: theme.name });
                if (id === settings.theme) option.selected = true;
                themeSelect.appendChild(option);
            });
            section.appendChild(themeSelect);
            const grid = Utils.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(110px, 1fr) minmax(130px, 1fr)', gap: '5px 8px', maxHeight: '360px', overflowY: 'auto' } });
            const render = () => {
                grid.innerHTML = '';
                const id = themeSelect.value;
                const base = Themes.definitions[id] || Themes.definitions.dracula;
                const overrides = customPalettes[id] || {};
                PaletteModule.PALETTE_KEYS.forEach(key => {
                    const label = Utils.createElement('label', { textContent: key.replace(/[A-Z]/g, match => ` ${match}`).replace(/^./, match => match.toUpperCase()), style: { fontSize: '11px', alignSelf: 'center' } });
                    const value = overrides[key] || base[key] || '';
                    const input = Utils.createElement('input', {
                        type: /^#[0-9a-f]{6}$/i.test(value) ? 'color' : 'text',
                        className: 'rel-input', value,
                        style: { width: '100%', boxSizing: 'border-box', minHeight: '26px' }
                    });
                    input.title = value;
                    input.addEventListener('change', () => PaletteModule.setOverride(id, key, input.value));
                    grid.appendChild(label);
                    grid.appendChild(input);
                });
            };
            themeSelect.addEventListener('change', render);
            render();
            section.appendChild(grid);
            const actions = Utils.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' } });
            actions.appendChild(Utils.createElement('button', { className: 'rel-btn-small rel-btn-secondary', textContent: 'Reset Theme Palette', type: 'button', onClick: () => { PaletteModule.reset(themeSelect.value); render(); } }));
            actions.appendChild(Utils.createElement('button', { className: 'rel-btn-small rel-btn-secondary', textContent: 'Export Palettes', type: 'button', onClick: () => { Storage.downloadJSON(PaletteModule.serialize(), `rel-palettes-${new Date().toISOString().slice(0, 10)}.json`); Utils.notify('Theme palettes exported', 'success'); } }));
            const importInput = Utils.createElement('input', { type: 'file', accept: '.json', style: { display: 'none' } });
            importInput.addEventListener('change', () => {
                const file = importInput.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    if (PaletteModule.importSerialized(reader.result)) { render(); Utils.notify('Theme palettes imported', 'success'); }
                    else Utils.notify('Invalid palette file', 'error');
                };
                reader.readAsText(file);
            });
            actions.appendChild(Utils.createElement('button', { className: 'rel-btn-small rel-btn-secondary', textContent: 'Import Palettes', type: 'button', onClick: () => importInput.click() }));
            section.appendChild(actions);
            section.appendChild(importInput);
            return section;
        },

        buildFontPicker() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Font Pairing</h3><div class="rel-setting-desc" style="margin-bottom:8px;">Choose a local system font pairing for the selected theme. No fonts are downloaded.</div>';
            const themeSelect = Utils.createElement('select', { className: 'rel-select', style: { marginBottom: '8px' } });
            Object.entries(Themes.definitions).forEach(([id, theme]) => {
                const option = Utils.createElement('option', { value: id, textContent: theme.name });
                if (id === settings.theme) option.selected = true;
                themeSelect.appendChild(option);
            });
            const pairSelect = Utils.createElement('select', { className: 'rel-select', style: { width: '100%', marginBottom: '8px' } });
            const renderPairs = () => {
                pairSelect.innerHTML = '';
                const selected = FontPairingModule.getPairing(themeSelect.value);
                Object.entries(FontPairingModule.PAIRS).forEach(([id, pair]) => {
                    const option = Utils.createElement('option', { value: id, textContent: pair.name });
                    if (id === selected) option.selected = true;
                    pairSelect.appendChild(option);
                });
            };
            themeSelect.addEventListener('change', renderPairs);
            pairSelect.addEventListener('change', () => FontPairingModule.setPairing(themeSelect.value, pairSelect.value));
            section.appendChild(Utils.createElement('label', { textContent: 'Theme', style: { display: 'block', fontSize: '11px', marginBottom: '3px' } }));
            section.appendChild(themeSelect);
            section.appendChild(Utils.createElement('label', { textContent: 'Font pair', style: { display: 'block', fontSize: '11px', margin: '6px 0 3px' } }));
            section.appendChild(pairSelect);
            renderPairs();
            return section;
        },

        buildThemePicker() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Theme</h3>';
            const grid = Utils.createElement('div', { className: 'rel-theme-grid' });

            Object.entries(Themes.definitions).forEach(([id, theme]) => {
                const card = Utils.createElement('div', {
                    className: 'rel-theme-card' + (settings.theme === id ? ' active' : ''),
                    onClick: () => {
                        settings.theme = id;
                        if (id === 'light') { settings.darkMode = false; }
                        else { settings.darkMode = true; }
                        saveSettings();
                        grid.querySelectorAll('.rel-theme-card').forEach(c => c.classList.remove('active'));
                        card.classList.add('active');
                        this.applyThemeCSS();
                        FontPairingModule.apply();
                        Utils.notify(`Theme: ${theme.name}`, 'success', 1500);
                    }
                });

                const preview = Utils.createElement('div', { className: 'rel-theme-preview' });
                preview.innerHTML = `<div style="background:${theme.bg}"></div><div style="background:${theme.surface}"></div><div style="background:${theme.accent}"></div><div style="background:${theme.link}"></div>`;
                card.appendChild(preview);
                card.appendChild(Utils.createElement('div', { className: 'rel-theme-name', textContent: theme.name }));
                grid.appendChild(card);
            });

            section.appendChild(grid);
            return section;
        },

        buildFilterEditor() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Content Filters</h3>';

            const filterTypes = [
                { key: 'keywords', label: 'Keywords (title text)', placeholder: 'Enter keyword or /regex/' },
                { key: 'domains', label: 'Domains', placeholder: 'example.com' },
                { key: 'subreddits', label: 'Subreddits', placeholder: 'subreddit name' },
                { key: 'flairs', label: 'Flairs', placeholder: 'flair text' }
            ];

            filterTypes.forEach(ft => {
                const group = Utils.createElement('div', { style: { marginBottom: '12px' } });
                group.innerHTML = `<label style="font-size:12px;font-weight:bold;display:block;margin-bottom:4px;">${ft.label}</label>`;

                const list = Utils.createElement('div', { className: 'rel-filter-list' });
                const renderList = () => {
                    list.innerHTML = '';
                    (filters[ft.key] || []).forEach((val, i) => {
                        const item = Utils.createElement('div', { className: 'rel-filter-item' });
                        item.innerHTML = `<span>${Utils.escapeHTML(val)}</span>`;
                        const removeBtn = Utils.createElement('button', {
                            className: 'rel-filter-remove',
                            textContent: '\u2715',
                            onClick: () => {
                                filters[ft.key].splice(i, 1);
                                saveFilters();
                                renderList();
                            }
                        });
                        item.appendChild(removeBtn);
                        list.appendChild(item);
                    });
                };
                renderList();
                group.appendChild(list);

                const addRow = Utils.createElement('div', { className: 'rel-filter-add-row' });
                const addInput = Utils.createElement('input', { className: 'rel-input', placeholder: ft.placeholder });
                const addBtn = Utils.createElement('button', {
                    className: 'rel-btn-small rel-btn-primary', textContent: 'Add',
                    onClick: () => {
                        const val = addInput.value.trim();
                        if (val && !filters[ft.key].includes(val)) {
                            filters[ft.key].push(val);
                            saveFilters();
                            renderList();
                            addInput.value = '';
                        }
                    }
                });
                addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addBtn.click(); });
                addRow.appendChild(addInput);
                addRow.appendChild(addBtn);
                group.appendChild(addRow);
                section.appendChild(group);
            });

            section.appendChild(this.buildSubredditOverrides());
            section.appendChild(this.buildRegexGroupEditor());
            section.appendChild(this.buildBlockListTools());

            return section;
        },

        serializeBlockList(source = filters) {
            const lines = ['# Reddit Enhancement Continued block list v1'];
            const fields = [
                ['keywords', 'keyword'], ['domains', 'domain'], ['subreddits', 'subreddit'],
                ['flairs', 'flair'], ['users', 'user']
            ];
            fields.forEach(([field, prefix]) => {
                (Array.isArray(source[field]) ? source[field] : []).forEach(value => {
                    const clean = String(value).replace(/[\r\n]/g, ' ').trim();
                    if (clean) lines.push(`${prefix}:${clean}`);
                });
            });
            (Array.isArray(source.regexGroups) ? source.regexGroups : []).forEach(rule => {
                const name = String(rule.name || 'Unnamed').replace(/[|\r\n]/g, ' ').trim();
                const pattern = String(rule.pattern || '').replace(/[\r\n]/g, ' ');
                const flags = String(rule.flags || 'i').replace(/[^dgimsuvy]/g, '');
                if (name && pattern) lines.push(`regex:${name}|${pattern}|${flags}`);
            });
            return lines.join('\n') + '\n';
        },

        parseBlockList(text) {
            const result = { keywords: [], domains: [], subreddits: [], flairs: [], users: [], regexGroups: [] };
            const fields = {
                keyword: 'keywords', domain: 'domains', subreddit: 'subreddits', flair: 'flairs', user: 'users'
            };
            String(text || '').split(/\r?\n/).forEach(rawLine => {
                const line = rawLine.trim();
                if (!line || line.startsWith('#')) return;
                const separator = line.indexOf(':');
                const prefix = separator > 0 ? line.slice(0, separator).toLowerCase() : '';
                const value = separator > 0 ? line.slice(separator + 1).trim() : line;
                if (!value) return;
                if (fields[prefix]) {
                    if (!result[fields[prefix]].includes(value)) result[fields[prefix]].push(value);
                    return;
                }
                if (prefix === 'regex') {
                    const parts = value.split('|');
                    const name = parts.shift()?.trim();
                    const flags = parts.pop()?.trim() || 'i';
                    const pattern = parts.join('|');
                    if (!name || !pattern) return;
                    try { new RegExp(pattern, flags); }
                    catch { return; }
                    result.regexGroups.push({
                        id: `regex-import-${result.regexGroups.length + 1}`,
                        name, pattern, flags: flags.replace(/[^dgimsuvy]/g, ''), enabled: true, hits: 0
                    });
                    return;
                }
                if (!result.keywords.includes(line)) result.keywords.push(line);
            });
            return result;
        },

        buildBlockListTools() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Shared Block List</h3><div class="rel-setting-desc" style="margin-bottom:8px;">Plain text, one rule per line. Typed rules and unprefixed keywords are supported.</div>';
            const row = Utils.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } });
            const exportBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-secondary', textContent: 'Export .txt',
                onClick: () => {
                    const blob = new Blob([this.serializeBlockList()], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const anchor = document.createElement('a');
                    anchor.href = url;
                    anchor.download = `rel-block-list-${new Date().toISOString().slice(0, 10)}.txt`;
                    anchor.click();
                    URL.revokeObjectURL(url);
                    Utils.notify('Block list exported', 'success');
                }
            });
            const importBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-secondary', textContent: 'Import .txt',
                onClick: () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.txt,text/plain';
                    input.addEventListener('change', () => {
                        const file = input.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                            const imported = this.parseBlockList(reader.result);
                            let count = 0;
                            ['keywords', 'domains', 'subreddits', 'flairs', 'users'].forEach(field => {
                                imported[field].forEach(value => {
                                    if (!filters[field].includes(value)) { filters[field].push(value); count++; }
                                });
                            });
                            imported.regexGroups.forEach(rule => {
                                const duplicate = filters.regexGroups.some(existing =>
                                    existing.name === rule.name && existing.pattern === rule.pattern && existing.flags === rule.flags
                                );
                                if (!duplicate) { filters.regexGroups.push(rule); count++; }
                            });
                            saveFilters();
                            Utils.notify(`Imported ${count} block-list rules`, 'success');
                        };
                        reader.readAsText(file);
                    });
                    input.click();
                }
            });
            const copyBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-secondary', textContent: 'Copy .txt',
                onClick: () => {
                    Utils.copyToClipboard(this.serializeBlockList());
                    Utils.notify('Block list copied', 'success');
                }
            });
            row.appendChild(exportBtn);
            row.appendChild(importBtn);
            row.appendChild(copyBtn);
            section.appendChild(row);
            return section;
        },

        buildRegexGroupEditor() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Named Regex Rules</h3><div class="rel-setting-desc" style="margin-bottom:8px;">Named rules run against post titles. Matches increment a persistent hit counter.</div>';
            const list = Utils.createElement('div', { className: 'rel-filter-list' });
            const renderList = () => {
                list.innerHTML = '';
                filters.regexGroups.forEach((rule, index) => {
                    const item = Utils.createElement('div', { className: 'rel-filter-item', style: { display: 'block', padding: '8px' } });
                    const header = Utils.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } });
                    const enabled = Utils.createElement('input', { type: 'checkbox' });
                    enabled.checked = rule.enabled;
                    enabled.addEventListener('change', () => { rule.enabled = enabled.checked; saveFilters(); });
                    header.appendChild(enabled);
                    header.appendChild(Utils.createElement('strong', { textContent: rule.name }));
                    header.appendChild(Utils.createElement('span', { textContent: `/${rule.pattern}/${rule.flags}`, style: { fontFamily: 'monospace', fontSize: '11px', opacity: '0.8' } }));
                    header.appendChild(Utils.createElement('span', { textContent: `${rule.hits} hits`, style: { marginLeft: 'auto', fontSize: '11px', opacity: '0.7' } }));
                    const reset = Utils.createElement('button', {
                        className: 'rel-btn-small rel-btn-secondary', textContent: 'Reset',
                        onClick: () => { rule.hits = 0; saveFilters(); renderList(); }
                    });
                    header.appendChild(reset);
                    const remove = Utils.createElement('button', {
                        className: 'rel-filter-remove', textContent: '\u2715', title: 'Remove rule',
                        onClick: () => { filters.regexGroups.splice(index, 1); saveFilters(); renderList(); }
                    });
                    header.appendChild(remove);
                    item.appendChild(header);
                    list.appendChild(item);
                });
            };
            renderList();
            section.appendChild(list);

            const form = Utils.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr 70px auto', gap: '6px', marginTop: '8px' } });
            const nameInput = Utils.createElement('input', { className: 'rel-input', placeholder: 'rule name' });
            const patternInput = Utils.createElement('input', { className: 'rel-input', placeholder: 'pattern, e.g. low effort' });
            const flagsInput = Utils.createElement('input', { className: 'rel-input', placeholder: 'flags', value: 'i', title: 'Regex flags' });
            const add = Utils.createElement('button', { className: 'rel-btn-small rel-btn-primary', textContent: 'Add' });
            const addRule = () => {
                const name = nameInput.value.trim();
                const pattern = patternInput.value.trim();
                const flags = flagsInput.value.trim().replace(/[^dgimsuvy]/g, '');
                if (!name || !pattern) return;
                try { new RegExp(pattern, flags); }
                catch { Utils.notify('Invalid regular expression or flags', 'error'); return; }
                filters.regexGroups.push({
                    id: `regex-${Date.now()}-${filters.regexGroups.length}`,
                    name, pattern, flags, enabled: true, hits: 0
                });
                saveFilters();
                nameInput.value = '';
                patternInput.value = '';
                flagsInput.value = 'i';
                renderList();
            };
            add.addEventListener('click', addRule);
            [nameInput, patternInput, flagsInput].forEach(input => input.addEventListener('keydown', event => {
                if (event.key === 'Enter') addRule();
            }));
            form.appendChild(nameInput);
            form.appendChild(patternInput);
            form.appendChild(flagsInput);
            form.appendChild(add);
            section.appendChild(form);
            return section;
        },

        buildSubredditOverrides() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Per-Subreddit Overrides</h3><div class="rel-setting-desc" style="margin-bottom:8px;">Add local rules to a subreddit, replace its global rules, or disable filtering there.</div>';
            const list = Utils.createElement('div', { className: 'rel-filter-list' });

            const ensureOverride = (name) => {
                const key = name.trim().replace(/^\/r\//i, '').toLowerCase();
                if (!key) return null;
                if (!filters.subredditOverrides[key] || typeof filters.subredditOverrides[key] !== 'object') {
                    filters.subredditOverrides[key] = {
                        enabled: true, mode: 'merge', hideNSFW: null,
                        keywords: [], domains: [], flairs: [], users: []
                    };
                }
                const override = filters.subredditOverrides[key];
                ['keywords', 'domains', 'flairs', 'users'].forEach(field => {
                    if (!Array.isArray(override[field])) override[field] = [];
                });
                if (!['merge', 'replace'].includes(override.mode)) override.mode = 'merge';
                if (typeof override.enabled !== 'boolean') override.enabled = true;
                if (![true, false, null].includes(override.hideNSFW)) override.hideNSFW = null;
                return { key, override };
            };

            const renderList = () => {
                list.innerHTML = '';
                Object.keys(filters.subredditOverrides).sort().forEach(name => {
                    const { override } = ensureOverride(name);
                    const item = Utils.createElement('div', { className: 'rel-filter-item', style: { display: 'block', padding: '8px' } });
                    const title = Utils.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' } });
                    title.appendChild(Utils.createElement('strong', { textContent: `/r/${name}` }));

                    const enabled = Utils.createElement('input', { type: 'checkbox' });
                    enabled.checked = override.enabled;
                    enabled.title = 'Enable filtering for this subreddit';
                    enabled.addEventListener('change', () => {
                        override.enabled = enabled.checked;
                        saveFilters();
                    });
                    title.appendChild(enabled);

                    const mode = Utils.createElement('select', { className: 'rel-select', title: 'Rule mode' });
                    [['merge', 'Add to global'], ['replace', 'Use only local']].forEach(([value, label]) => {
                        const option = Utils.createElement('option', { value, textContent: label });
                        option.selected = override.mode === value;
                        mode.appendChild(option);
                    });
                    mode.addEventListener('change', () => { override.mode = mode.value; saveFilters(); });
                    title.appendChild(mode);

                    const removeBtn = Utils.createElement('button', {
                        className: 'rel-filter-remove', textContent: '\u2715', title: 'Remove override',
                        onClick: () => { delete filters.subredditOverrides[name]; saveFilters(); renderList(); }
                    });
                    title.appendChild(removeBtn);
                    item.appendChild(title);

                    const addRule = (field, placeholder) => {
                        const row = Utils.createElement('div', { className: 'rel-filter-add-row', style: { marginTop: '4px' } });
                        const input = Utils.createElement('input', { className: 'rel-input', placeholder });
                        const add = Utils.createElement('button', { className: 'rel-btn-small rel-btn-secondary', textContent: `Add ${field.slice(0, -1)}` });
                        const addValue = () => {
                            const value = input.value.trim();
                            if (value && !override[field].includes(value)) {
                                override[field].push(value);
                                saveFilters();
                                renderList();
                            }
                            input.value = '';
                        };
                        add.addEventListener('click', addValue);
                        input.addEventListener('keydown', event => { if (event.key === 'Enter') addValue(); });
                        row.appendChild(input);
                        row.appendChild(add);
                        item.appendChild(row);
                        if (override[field].length) {
                            const values = Utils.createElement('div', { style: { fontSize: '11px', opacity: '0.8', marginTop: '3px' } });
                            values.textContent = override[field].join(', ');
                            item.appendChild(values);
                        }
                    };
                    addRule('keywords', 'local keyword or /regex/');
                    addRule('domains', 'local domain');
                    addRule('flairs', 'local flair');
                    addRule('users', 'local username');

                    const nsfw = Utils.createElement('select', { className: 'rel-select', style: { marginTop: '6px' } });
                    [['inherit', 'NSFW: inherit'], ['true', 'NSFW: hide'], ['false', 'NSFW: allow']].forEach(([value, label]) => {
                        const option = Utils.createElement('option', { value, textContent: label });
                        option.selected = override.hideNSFW === null ? value === 'inherit' : String(override.hideNSFW) === value;
                        nsfw.appendChild(option);
                    });
                    nsfw.addEventListener('change', () => {
                        override.hideNSFW = nsfw.value === 'inherit' ? null : nsfw.value === 'true';
                        saveFilters();
                    });
                    item.appendChild(nsfw);
                    list.appendChild(item);
                });
            };
            renderList();
            section.appendChild(list);

            const addRow = Utils.createElement('div', { className: 'rel-filter-add-row' });
            const addInput = Utils.createElement('input', { className: 'rel-input', placeholder: 'subreddit name' });
            const addBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-primary', textContent: 'Add Override',
                onClick: () => {
                    const result = ensureOverride(addInput.value);
                    if (!result) return;
                    saveFilters();
                    addInput.value = '';
                    renderList();
                }
            });
            addInput.addEventListener('keydown', event => { if (event.key === 'Enter') addBtn.click(); });
            addRow.appendChild(addInput);
            addRow.appendChild(addBtn);
            section.appendChild(addRow);
            return section;
        },

        buildIgnoredUsers() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Ignored Users</h3>';

            const list = Utils.createElement('div', { className: 'rel-filter-list' });
            const renderList = () => {
                list.innerHTML = '';
                ignoredUsers.forEach((user, i) => {
                    const item = Utils.createElement('div', { className: 'rel-filter-item' });
                    item.innerHTML = `<span>/u/${Utils.escapeHTML(user)}</span>`;
                    const removeBtn = Utils.createElement('button', {
                        className: 'rel-filter-remove', textContent: '\u2715',
                        onClick: () => {
                            ignoredUsers.splice(i, 1);
                            saveIgnoredUsers();
                            renderList();
                        }
                    });
                    item.appendChild(removeBtn);
                    list.appendChild(item);
                });
            };
            renderList();
            section.appendChild(list);

            const addRow = Utils.createElement('div', { className: 'rel-filter-add-row' });
            const addInput = Utils.createElement('input', { className: 'rel-input', placeholder: 'username' });
            const addBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-primary', textContent: 'Add',
                onClick: () => {
                    const val = addInput.value.trim().replace(/^\/?u\//, '');
                    if (val && !ignoredUsers.includes(val)) {
                        ignoredUsers.push(val);
                        saveIgnoredUsers();
                        renderList();
                        addInput.value = '';
                    }
                }
            });
            addRow.appendChild(addInput);
            addRow.appendChild(addBtn);
            section.appendChild(addRow);
            return section;
        },

        buildCommentSweep() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Comment Sweep</h3><div class="rel-setting-desc" style="margin-bottom:8px;">Bulk-tag or hide matching comments currently loaded on this page, including loaded thread history.</div>';
            const row = Utils.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: '6px', alignItems: 'center' } });
            const username = Utils.createElement('input', { className: 'rel-input', placeholder: 'username' });
            const action = Utils.createElement('select', { className: 'rel-select' });
            [['tag', 'Tag'], ['hide', 'Hide']].forEach(([value, label]) => action.appendChild(Utils.createElement('option', { value, textContent: label })));
            const tagText = Utils.createElement('input', { className: 'rel-input', placeholder: 'tag text (for Tag)' });
            const color = Utils.createElement('select', { className: 'rel-select' });
            Object.keys(UserTaggingModule.tagColors).forEach(value => color.appendChild(Utils.createElement('option', { value, textContent: value })));
            color.value = 'aqua';
            const run = Utils.createElement('button', { className: 'rel-btn-small rel-btn-primary', textContent: 'Sweep' });
            const status = Utils.createElement('div', { style: { marginTop: '6px', fontSize: '11px', opacity: '0.75' } });
            const updateActionVisibility = () => {
                tagText.style.display = action.value === 'tag' ? '' : 'none';
                color.style.display = action.value === 'tag' ? '' : 'none';
            };
            action.addEventListener('change', updateActionVisibility);
            run.addEventListener('click', () => {
                const count = CommentSweepModule.sweep(username.value, action.value, tagText.value, color.value);
                status.textContent = `${action.value === 'hide' ? 'Hidden' : 'Tagged'} ${count} matching comment${count === 1 ? '' : 's'}.`;
                Utils.notify(status.textContent, count ? 'success' : 'info');
            });
            [username, tagText].forEach(input => input.addEventListener('keydown', event => { if (event.key === 'Enter') run.click(); }));
            row.appendChild(username);
            row.appendChild(action);
            row.appendChild(tagText);
            row.appendChild(color);
            row.appendChild(run);
            section.appendChild(row);
            section.appendChild(status);
            updateActionVisibility();
            return section;
        },

        buildBackupRestore() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Backup & Restore</h3><div class="rel-setting-desc" style="margin-bottom:10px;">Export or import all settings, tags, filters, and macros.</div>';

            const row = Utils.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '12px' } });

            const exportBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-primary', textContent: 'Export Settings',
                onClick: () => {
                    const data = Storage.exportAll();
                    Storage.downloadJSON(data, `rel-backup-${new Date().toISOString().slice(0,10)}.json`);
                    Utils.notify('Settings exported!', 'success');
                }
            });

            const importBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-secondary', textContent: 'Import Settings',
                onClick: () => {
                    const input = document.createElement('input');
                    input.type = 'file'; input.accept = '.json';
                    input.addEventListener('change', () => {
                        const file = input.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                            if (Storage.importAll(reader.result)) {
                                Utils.notify('Settings imported! Reloading...', 'success');
                                setTimeout(() => location.reload(), 1000);
                            } else {
                                Utils.notify('Invalid backup file', 'error');
                            }
                        };
                        reader.readAsText(file);
                    });
                    input.click();
                }
            });

            const resetBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-danger', textContent: 'Reset All',
                onClick: () => {
                    if (confirm('Reset ALL Reddit Enhancement Continued settings to defaults? This cannot be undone.')) {
                        Storage.createFactoryBackup();
                        Object.values(CONFIG.storageKeys).forEach(key => Storage.remove(key));
                        Utils.notify('Backup saved and all settings reset. Reloading...', 'warning');
                        setTimeout(() => location.reload(), 1000);
                    }
                }
            });

            row.appendChild(exportBtn);
            row.appendChild(importBtn);
            row.appendChild(resetBtn);
            section.appendChild(row);

            // Copy to clipboard
            const copyBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-secondary', textContent: 'Copy Settings to Clipboard',
                onClick: () => {
                    Utils.copyToClipboard(Storage.exportAll());
                    Utils.notify('Settings copied to clipboard!', 'success');
                }
            });
            section.appendChild(copyBtn);

            const factoryBackup = Storage.get(FACTORY_BACKUP_KEY, null);
            if (factoryBackup?.payload) {
                const factoryBtn = Utils.createElement('button', {
                    className: 'rel-btn-small rel-btn-secondary', textContent: 'Download Last Factory Backup',
                    style: { marginLeft: '8px' },
                    onClick: () => {
                        Storage.downloadJSON(factoryBackup.payload, `rel-factory-backup-${String(factoryBackup.createdAt || '').slice(0, 10) || 'saved'}.json`);
                        Utils.notify('Factory backup downloaded', 'success');
                    }
                });
                copyBtn.after(factoryBtn);
            }

            // User Tags export/import
            const tagLabel = Utils.createElement('h3', {
                textContent: 'User Tags',
                style: { margin: '14px 0 6px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }
            });
            section.appendChild(tagLabel);

            const tagRow = Utils.createElement('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } });

            const exportTagsBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-secondary', textContent: 'Export Tags',
                onClick: () => {
                    const data = JSON.stringify(userTags, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `rel-user-tags-${new Date().toISOString().slice(0,10)}.json`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    Utils.notify(`Exported ${Object.keys(userTags).length} tags`, 'success');
                }
            });

            const importTagsBtn = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-secondary', textContent: 'Import Tags',
                onClick: () => {
                    const input = document.createElement('input');
                    input.type = 'file'; input.accept = '.json';
                    input.addEventListener('change', () => {
                        const file = input.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                            try {
                                const imported = JSON.parse(reader.result);
                                if (typeof imported !== 'object' || Array.isArray(imported)) throw new Error('Invalid format');
                                let count = 0;
                                Object.entries(imported).forEach(([user, tag]) => {
                                    if (tag && typeof tag === 'object' && (tag.text || tag.note)) {
                                        userTags[user] = normalizeUserTag(tag);
                                        count++;
                                    }
                                });
                                saveUserTags();
                                Utils.notify(`Imported ${count} tags. Reload to see changes.`, 'success');
                            } catch (e) {
                                Utils.notify('Invalid tags file', 'error');
                            }
                        };
                        reader.readAsText(file);
                    });
                    input.click();
                }
            });

            tagRow.appendChild(exportTagsBtn);
            tagRow.appendChild(importTagsBtn);
            section.appendChild(tagRow);

            return section;
        },

        buildProfileSetting(def) {
            const item = Utils.createElement('div', { className: 'rel-setting-item' });
            item.innerHTML = `
                <div class="rel-setting-info">
                    <label>${Utils.escapeHTML(def.label)}</label>
                    <div class="rel-setting-desc">${Utils.escapeHTML(def.desc)} Switching profiles reloads the page.</div>
                </div>
            `;
            const toggle = Utils.createElement('label', { className: 'rel-toggle' });
            const input = Utils.createElement('input', { type: 'checkbox' });
            input.checked = profileMode === 'device';
            input.addEventListener('change', () => ProfileModule.setMode(input.checked ? 'device' : 'shared'));
            toggle.appendChild(input);
            toggle.appendChild(Utils.createElement('span', { className: 'rel-toggle-slider' }));
            item.appendChild(toggle);
            return item;
        },

        buildSyncSettings() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Encrypted Cloud Sync</h3><div class="rel-setting-desc" style="margin-bottom:10px;">Sync an encrypted settings snapshot to your own Gist, Pastebin paste, or WebDAV file. The passphrase is requested for each operation and never stored.</div>';

            const provider = Utils.createElement('select', { className: 'rel-select', style: { width: '100%', marginBottom: '8px' } });
            [
                { value: 'none', label: 'Disabled' },
                { value: 'gist', label: 'GitHub Gist' },
                { value: 'pastebin', label: 'Pastebin' },
                { value: 'webdav', label: 'WebDAV (CORS required)' }
            ].forEach(option => {
                const node = Utils.createElement('option', { value: option.value, textContent: option.label });
                if (settings.syncProvider === option.value) node.selected = true;
                provider.appendChild(node);
            });

            const endpoint = Utils.createElement('input', { type: 'url', className: 'rel-input', placeholder: 'Gist ID, paste URL, or WebDAV file URL', style: { width: '100%', boxSizing: 'border-box', marginBottom: '8px' } });
            endpoint.value = settings.syncEndpoint || '';
            const username = Utils.createElement('input', { type: 'text', className: 'rel-input', placeholder: 'WebDAV username (optional)', style: { width: '100%', boxSizing: 'border-box', marginBottom: '8px' } });
            username.value = settings.syncUsername || '';
            const token = Utils.createElement('input', { type: 'password', className: 'rel-input', placeholder: 'GitHub token / Pastebin API key / WebDAV password', style: { width: '100%', boxSizing: 'border-box', marginBottom: '8px' } });
            token.value = settings.syncToken || '';

            const field = (label, input) => {
                const wrapper = Utils.createElement('label', { style: { display: 'block', fontSize: '12px', marginBottom: '4px' } });
                wrapper.appendChild(Utils.createElement('span', { textContent: label, style: { display: 'block', marginBottom: '3px' } }));
                wrapper.appendChild(input);
                return wrapper;
            };
            section.appendChild(field('Provider', provider));
            section.appendChild(field('Endpoint', endpoint));
            section.appendChild(field('Username', username));
            section.appendChild(field('Token / password', token));

            const status = Utils.createElement('div', { textContent: 'No sync operation has run.', style: { minHeight: '18px', margin: '8px 0', fontSize: '11px', opacity: '0.75' } });
            const save = () => {
                settings.syncProvider = provider.value;
                settings.syncEndpoint = endpoint.value.trim();
                settings.syncUsername = username.value.trim();
                settings.syncToken = token.value;
                saveSettings();
            };
            [provider, endpoint, username, token].forEach(input => input.addEventListener('change', save));

            const operation = async (kind) => {
                save();
                const passphrase = prompt(`Enter the encryption passphrase to ${kind} settings:`);
                if (!passphrase) return;
                status.textContent = kind === 'upload' ? 'Encrypting and uploading...' : 'Downloading and decrypting...';
                try {
                    if (kind === 'upload') {
                        const result = await SyncModule.upload(passphrase);
                        if (result?.endpoint) {
                            endpoint.value = result.endpoint;
                            save();
                        }
                        status.textContent = 'Encrypted snapshot uploaded.';
                        Utils.notify('Encrypted settings synced', 'success');
                    } else {
                        await SyncModule.download(passphrase);
                        status.textContent = 'Snapshot decrypted. Reload to apply imported settings.';
                        Utils.notify('Encrypted settings downloaded; reload to apply', 'success');
                    }
                } catch (error) {
                    status.textContent = error.message || 'Sync failed.';
                    Utils.notify(status.textContent, 'error');
                }
            };
            const actions = Utils.createElement('div', { style: { display: 'flex', gap: '6px', marginTop: '4px' } });
            actions.appendChild(Utils.createElement('button', { className: 'rel-btn-small rel-btn-primary', textContent: 'Upload encrypted', type: 'button', onClick: () => operation('upload') }));
            actions.appendChild(Utils.createElement('button', { className: 'rel-btn-small rel-btn-secondary', textContent: 'Download encrypted', type: 'button', onClick: () => operation('download') }));
            section.appendChild(status);
            section.appendChild(actions);
            return section;
        },

        buildSettingsDiff() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Settings Diff</h3><div class="rel-setting-desc" style="margin-bottom:10px;">Only settings that differ from the built-in defaults are listed. Resetting a row changes that setting only.</div>';
            const list = Utils.createElement('div', { style: { display: 'grid', gap: '6px' } });
            const render = () => {
                list.innerHTML = '';
                const differences = SettingsDiffModule.getDiff(settings, CONFIG.defaults);
                if (differences.length === 0) {
                    list.appendChild(Utils.createElement('div', { textContent: 'This profile matches the built-in defaults.', style: { opacity: '0.7', fontSize: '12px' } }));
                    return;
                }
                differences.forEach(difference => {
                    const row = Utils.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(100px, 1.5fr) minmax(100px, 1.5fr) auto', gap: '6px', alignItems: 'center', padding: '6px', border: '1px solid rgba(128,128,128,0.3)', borderRadius: '4px', fontSize: '11px' } });
                    row.appendChild(Utils.createElement('strong', { textContent: difference.key }));
                    row.appendChild(Utils.createElement('span', { textContent: `Current: ${difference.current}` }));
                    row.appendChild(Utils.createElement('span', { textContent: `Default: ${difference.defaultValue}`, style: { opacity: '0.7' } }));
                    row.appendChild(Utils.createElement('button', {
                        type: 'button', textContent: 'reset', className: 'rel-btn-small rel-btn-secondary',
                        onClick: () => {
                            if (difference.key === 'perDeviceProfile') {
                                ProfileModule.setMode('shared');
                                return;
                            }
                            settings[difference.key] = CONFIG.defaults[difference.key];
                            saveSettings();
                            render();
                            Utils.notify(`Reset ${difference.key}`, 'success');
                        }
                    }));
                    list.appendChild(row);
                });
            };
            render();
            section.appendChild(list);
            return section;
        },

        buildAnalyticsPanel() {
            const section = Utils.createElement('div', { className: 'rel-settings-section' });
            section.innerHTML = '<h3>Local Analytics</h3><div class="rel-setting-desc" style="margin-bottom:10px;">Opt-in counters stay in this userscript profile. REC records only totals; it does not collect URLs, titles, usernames, or network telemetry.</div>';
            const toggleRow = Utils.createElement('div', { className: 'rel-setting-item' });
            toggleRow.appendChild(Utils.createElement('span', { textContent: 'Enable local counters' }));
            const toggle = Utils.createElement('label', { className: 'rel-toggle' });
            const enabled = Utils.createElement('input', { type: 'checkbox' });
            enabled.checked = !!settings.analyticsEnabled;
            enabled.addEventListener('change', () => {
                settings.analyticsEnabled = enabled.checked;
                saveSettings();
                if (enabled.checked) AnalyticsModule.increment('pageViews');
                renderStats();
            });
            toggle.appendChild(enabled);
            toggle.appendChild(Utils.createElement('span', { className: 'rel-toggle-slider' }));
            toggleRow.appendChild(toggle);
            section.appendChild(toggleRow);
            const stats = Utils.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', gap: '8px', margin: '12px 0' } });
            const renderStats = () => {
                stats.innerHTML = '';
                const values = AnalyticsModule.getStats();
                [
                    ['adsBlocked', 'Ads blocked'],
                    ['postsFiltered', 'Posts filtered'],
                    ['mediaExpanded', 'Media expanded'],
                    ['pageViews', 'Pages visited']
                ].forEach(([key, label]) => {
                    const card = Utils.createElement('div', { style: { padding: '8px', border: '1px solid rgba(128,128,128,0.3)', borderRadius: '5px' } });
                    card.appendChild(Utils.createElement('div', { textContent: label, style: { fontSize: '11px', opacity: '0.7' } }));
                    card.appendChild(Utils.createElement('strong', { textContent: String(values[key]), style: { display: 'block', fontSize: '20px', marginTop: '3px' } }));
                    stats.appendChild(card);
                });
            };
            renderStats();
            section.appendChild(stats);
            const reset = Utils.createElement('button', { className: 'rel-btn-small rel-btn-secondary', textContent: 'Reset Counters', type: 'button', onClick: () => { AnalyticsModule.reset(); renderStats(); Utils.notify('Local analytics reset', 'success'); } });
            section.appendChild(reset);
            return section;
        },

        applyThemeCSS() {
            // Remove old theme styles
            document.querySelectorAll('[data-rel-theme]').forEach(el => el.remove());
            if (settings.darkMode && settings.theme !== 'light') {
                const themeCSS = Themes.generateCSS();
                const style1 = document.createElement('style');
                style1.setAttribute('data-rel-theme', 'main');
                style1.textContent = themeCSS;
                document.head.appendChild(style1);

                const themedBase = Styles.getThemedBase();
                const style2 = document.createElement('style');
                style2.setAttribute('data-rel-theme', 'components');
                style2.textContent = themedBase;
                document.head.appendChild(style2);

                document.body.classList.add('rel-dark-mode');
            } else {
                document.body.classList.remove('rel-dark-mode');
            }

            // UX enhancements (works with any theme including light)
            const uxCSS = Styles.generateUXCSS();
            if (uxCSS) {
                const style3 = document.createElement('style');
                style3.setAttribute('data-rel-theme', 'ux');
                style3.textContent = uxCSS;
                document.head.appendChild(style3);
            }
        }
    };

    // =========================================================================
    // SETTINGS DIFF MODULE
    // =========================================================================
    const SettingsDiffModule = {
        sensitiveKeys: new Set(['syncToken']),

        equal(left, right) {
            try { return JSON.stringify(left) === JSON.stringify(right); } catch { return left === right; }
        },

        formatValue(value, key = '') {
            if (this.sensitiveKeys.has(key)) return value ? '[configured]' : '[empty]';
            if (value === undefined) return '[missing]';
            if (typeof value === 'string') {
                const compact = value.replace(/\s+/g, ' ').trim();
                return compact.length > 120 ? `${compact.slice(0, 117)}...` : (compact || '[empty]');
            }
            if (typeof value === 'object') {
                try {
                    const serialized = JSON.stringify(value);
                    return serialized.length > 120 ? `${serialized.slice(0, 117)}...` : serialized;
                } catch { return '[unserializable]'; }
            }
            return String(value);
        },

        getDiff(current = {}, defaults = CONFIG.defaults) {
            const source = current && typeof current === 'object' ? current : {};
            const baseline = defaults && typeof defaults === 'object' ? defaults : {};
            return [...new Set([...Object.keys(baseline), ...Object.keys(source)])]
                .filter(key => !key.startsWith('_') && !this.equal(source[key], baseline[key]))
                .sort()
                .map(key => ({
                    key,
                    current: this.formatValue(source[key], key),
                    defaultValue: this.formatValue(baseline[key], key)
                }));
        }
    };

    // =========================================================================
    // PROFILE SCOPE MODULE
    // =========================================================================
    const ProfileModule = {
        getMode() { return profileMode; },
        getProfileId() { return profileId; },
        getStorageKey(mode = profileMode) { return buildProfileStorageKey(mode, profileId); },

        setMode(mode) {
            const nextMode = mode === 'device' ? 'device' : 'shared';
            if (nextMode === profileMode) return false;
            const nextSettings = { ...settings, perDeviceProfile: nextMode === 'device' };
            Storage.set(buildProfileStorageKey(nextMode), nextSettings);
            Storage.set(PROFILE_MODE_KEY, nextMode);
            profileMode = nextMode;
            Utils.notify(`Switched to ${nextMode === 'device' ? 'per-device' : 'shared'} profile; reloading`, 'success');
            setTimeout(() => location.reload(), 300);
            return true;
        }
    };

    // =========================================================================
    // REDDIT API CANARY MODULE
    // =========================================================================
    const ApiCanaryModule = {
        STORAGE_KEY: 'rel_api_canary_v1',
        endpoint: '/r/reddit/about.json?raw_json=1',

        validatePayload(payload) {
            const data = payload?.data;
            return !!data && typeof data === 'object' && typeof data.display_name === 'string' && typeof data.subscribers === 'number';
        },

        shouldCheck(lastChecked, now = Date.now(), intervalHours = settings.apiCanaryIntervalHours) {
            const interval = Math.max(1, Math.min(168, Number(intervalHours) || 24)) * 60 * 60 * 1000;
            return !Number.isFinite(Number(lastChecked)) || now - Number(lastChecked) >= interval;
        },

        async check(force = false) {
            if (!settings.apiCanary && !force) return null;
            const previous = Storage.get(this.STORAGE_KEY, null);
            if (!force && previous && !this.shouldCheck(previous.checkedAt)) return previous;
            let result;
            try {
                const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
                const timeout = controller ? setTimeout(() => controller.abort(), 15000) : null;
                const response = await fetch(this.endpoint, {
                    credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' },
                    signal: controller?.signal
                });
                if (timeout) clearTimeout(timeout);
                const payload = await response.json();
                const valid = response.ok && this.validatePayload(payload);
                result = { checkedAt: Date.now(), ok: valid, status: response.status, shape: valid ? 'reddit-about-v1' : 'unexpected' };
            } catch (error) {
                result = { checkedAt: Date.now(), ok: false, status: 0, shape: 'unreachable', error: String(error?.message || error).slice(0, 160) };
            }
            Storage.set(this.STORAGE_KEY, result);
            if (!result.ok) {
                console.warn('REL API canary warning:', result);
                Utils.notify('Reddit API response changed or is unreachable. Some REC features may need attention.', 'warning', 7000);
            }
            return result;
        },

        init() {
            if (!settings.apiCanary) return;
            this.check().catch(() => {});
        }
    };

    // =========================================================================
    // ENCRYPTED CLOUD SYNC MODULE
    // =========================================================================
    const SyncModule = {
        PREFIX: 'REC-SYNC-1.',
        FILE_NAME: 'reddit-enhancement-continued.sync',
        PBKDF2_ITERATIONS: 210000,

        getCrypto() {
            const cryptoApi = window.crypto || (typeof crypto !== 'undefined' ? crypto : null);
            if (!cryptoApi?.subtle || !cryptoApi.getRandomValues) throw new Error('Web Crypto is unavailable in this browser');
            return cryptoApi;
        },

        getTextEncoder() {
            const Encoder = window.TextEncoder || (typeof TextEncoder !== 'undefined' ? TextEncoder : null);
            if (!Encoder) throw new Error('Text encoding is unavailable in this browser');
            return new Encoder();
        },

        getTextDecoder() {
            const Decoder = window.TextDecoder || (typeof TextDecoder !== 'undefined' ? TextDecoder : null);
            if (!Decoder) throw new Error('Text decoding is unavailable in this browser');
            return new Decoder();
        },

        toBase64(bytes) {
            const encoder = window.btoa || (typeof btoa !== 'undefined' ? btoa : null);
            if (!encoder) throw new Error('Base64 encoding is unavailable in this browser');
            let binary = '';
            for (const byte of bytes) binary += String.fromCharCode(byte);
            return encoder(binary);
        },

        fromBase64(value) {
            const decoder = window.atob || (typeof atob !== 'undefined' ? atob : null);
            if (!decoder) throw new Error('Base64 decoding is unavailable in this browser');
            const binary = decoder(value);
            return Uint8Array.from(binary, character => character.charCodeAt(0));
        },

        async deriveKey(passphrase, salt, usages) {
            const cryptoApi = this.getCrypto();
            const base = await cryptoApi.subtle.importKey('raw', this.getTextEncoder().encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']);
            return cryptoApi.subtle.deriveKey(
                { name: 'PBKDF2', salt, iterations: this.PBKDF2_ITERATIONS, hash: 'SHA-256' },
                base,
                { name: 'AES-GCM', length: 256 },
                false,
                usages
            );
        },

        createSnapshot() {
            const data = JSON.parse(Storage.exportAll());
            if (data.settings && typeof data.settings === 'object') {
                delete data.settings.syncProvider;
                delete data.settings.syncEndpoint;
                delete data.settings.syncUsername;
                delete data.settings.syncToken;
            }
            return { schema: 1, exportedAt: new Date().toISOString(), data };
        },

        async encryptSnapshot(passphrase, snapshot = this.createSnapshot()) {
            if (!String(passphrase || '')) throw new Error('An encryption passphrase is required');
            const cryptoApi = this.getCrypto();
            const salt = cryptoApi.getRandomValues(new Uint8Array(16));
            const iv = cryptoApi.getRandomValues(new Uint8Array(12));
            const key = await this.deriveKey(String(passphrase), salt, ['encrypt']);
            const plaintext = this.getTextEncoder().encode(JSON.stringify(snapshot));
            const ciphertext = await cryptoApi.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
            return this.PREFIX + JSON.stringify({
                v: 1,
                iterations: this.PBKDF2_ITERATIONS,
                salt: this.toBase64(salt),
                iv: this.toBase64(iv),
                data: this.toBase64(new Uint8Array(ciphertext))
            });
        },

        async decryptSnapshot(serialized, passphrase) {
            if (!String(passphrase || '')) throw new Error('An encryption passphrase is required');
            const source = String(serialized || '');
            if (!source.startsWith(this.PREFIX)) throw new Error('Unsupported sync payload');
            let envelope;
            try { envelope = JSON.parse(source.slice(this.PREFIX.length)); } catch { throw new Error('Invalid sync payload'); }
            if (envelope.v !== 1 || !envelope.salt || !envelope.iv || !envelope.data) throw new Error('Incomplete sync payload');
            if (Number(envelope.iterations) !== this.PBKDF2_ITERATIONS) throw new Error('Unsupported sync encryption parameters');
            const cryptoApi = this.getCrypto();
            const key = await this.deriveKey(String(passphrase), this.fromBase64(envelope.salt), ['decrypt']);
            let plaintext;
            try {
                plaintext = await cryptoApi.subtle.decrypt({ name: 'AES-GCM', iv: this.fromBase64(envelope.iv) }, key, this.fromBase64(envelope.data));
            } catch {
                throw new Error('Could not decrypt sync payload; check the passphrase');
            }
            let snapshot;
            try { snapshot = JSON.parse(this.getTextDecoder().decode(plaintext)); } catch { throw new Error('Decrypted sync payload is not valid JSON'); }
            if (!snapshot || snapshot.schema !== 1 || !snapshot.data || typeof snapshot.data !== 'object') throw new Error('Invalid decrypted settings snapshot');
            return snapshot;
        },

        restoreSnapshot(snapshot) {
            const imported = { ...snapshot.data };
            const currentSettings = Storage.get(CONFIG.storageKeys.settings, { ...CONFIG.defaults });
            if (imported.settings && typeof imported.settings === 'object') {
                imported.settings = {
                    ...currentSettings,
                    ...imported.settings,
                    syncProvider: settings.syncProvider,
                    syncEndpoint: settings.syncEndpoint,
                    syncUsername: settings.syncUsername,
                    syncToken: settings.syncToken,
                    perDeviceProfile: settings.perDeviceProfile
                };
            }
            Storage.importAll(JSON.stringify(imported));
        },

        normalizeProvider(provider) {
            return ['gist', 'pastebin', 'webdav'].includes(String(provider || '').toLowerCase()) ? String(provider).toLowerCase() : 'none';
        },

        getGistId(endpoint) {
            const value = String(endpoint || '').trim();
            if (!value) return '';
            if (/^[A-Za-z0-9]+$/.test(value)) return value;
            try {
                const parsed = new URL(value);
                const match = parsed.pathname.match(/\/gists\/([A-Za-z0-9]+)/i);
                return match ? match[1] : '';
            } catch { return ''; }
        },

        getPasteRawUrl(endpoint) {
            const value = String(endpoint || '').trim();
            if (/^[A-Za-z0-9]+$/.test(value)) return `https://pastebin.com/raw/${value}`;
            try {
                const parsed = new URL(value);
                if (!/(^|\.)pastebin\.com$/i.test(parsed.hostname)) return '';
                const match = parsed.pathname.match(/\/raw\/([A-Za-z0-9]+)|\/([A-Za-z0-9]+)$/i);
                const id = match?.[1] || match?.[2];
                return id ? `https://pastebin.com/raw/${id}` : '';
            } catch { return ''; }
        },

        getWebDavUrl(endpoint) {
            try {
                const parsed = new URL(String(endpoint || '').trim());
                return /^https?:$/.test(parsed.protocol) ? parsed.href : '';
            } catch { return ''; }
        },

        request(provider, url, options = {}) {
            const method = options.method || 'GET';
            const headers = options.headers || {};
            const body = options.body || null;
            if (provider === 'webdav') {
                return fetch(url, { method, headers, body, credentials: 'omit' }).then(async response => ({
                    status: response.status, ok: response.ok, text: await response.text()
                }));
            }
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method, url, headers, data: body || undefined,
                    onload: response => resolve({ status: response.status, ok: response.status >= 200 && response.status < 300, text: response.responseText || '' }),
                    onerror: () => reject(new Error('Cloud provider request failed')),
                    ontimeout: () => reject(new Error('Cloud provider request timed out'))
                });
            });
        },

        authHeaders(provider) {
            const headers = {};
            if (provider === 'gist') {
                if (settings.syncToken) headers.Authorization = `Bearer ${settings.syncToken}`;
                headers.Accept = 'application/vnd.github+json';
            } else if (provider === 'webdav' && (settings.syncUsername || settings.syncToken)) {
                headers.Authorization = `Basic ${this.toBase64(this.getTextEncoder().encode(`${settings.syncUsername}:${settings.syncToken}`))}`;
            }
            return headers;
        },

        parseResponse(response, fallback = 'Cloud provider rejected the request') {
            if (response.ok) return response;
            let detail = '';
            try { detail = JSON.parse(response.text).message || ''; } catch {}
            throw new Error(detail || `${fallback} (HTTP ${response.status})`);
        },

        async upload(passphrase) {
            const provider = this.normalizeProvider(settings.syncProvider);
            if (provider === 'none') throw new Error('Choose a sync provider first');
            const encrypted = await this.encryptSnapshot(passphrase);
            if (encrypted.length > 10 * 1024 * 1024) throw new Error('Encrypted snapshot exceeds the 10 MB sync limit');

            if (provider === 'gist') {
                if (!settings.syncToken) throw new Error('A GitHub token is required to upload a Gist');
                const id = this.getGistId(settings.syncEndpoint);
                const url = id ? `https://api.github.com/gists/${id}` : 'https://api.github.com/gists';
                const response = await this.request(provider, url, {
                    method: id ? 'PATCH' : 'POST',
                    headers: { ...this.authHeaders(provider), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description: 'Reddit Enhancement Continued encrypted settings', public: false, files: { [this.FILE_NAME]: { content: encrypted } } })
                });
                this.parseResponse(response);
                let result;
                try { result = JSON.parse(response.text); } catch { result = {}; }
                return { endpoint: result.id || id };
            }

            if (provider === 'pastebin') {
                if (!settings.syncToken) throw new Error('A Pastebin API key is required to upload a paste');
                const body = new URLSearchParams({
                    api_dev_key: settings.syncToken,
                    api_option: 'paste',
                    api_paste_code: encrypted,
                    api_paste_private: '1',
                    api_paste_expire_date: 'N'
                });
                const response = await this.request(provider, 'https://pastebin.com/api/api_post.php', {
                    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString()
                });
                this.parseResponse(response);
                if (!/^https:\/\/pastebin\.com\/[A-Za-z0-9]+$/i.test(response.text.trim())) throw new Error(response.text.trim() || 'Pastebin did not return a paste URL');
                return { endpoint: response.text.trim() };
            }

            const url = this.getWebDavUrl(settings.syncEndpoint);
            if (!url) throw new Error('A valid WebDAV file URL is required');
            const response = await this.request(provider, url, {
                method: 'PUT', headers: { ...this.authHeaders(provider), 'Content-Type': 'text/plain; charset=UTF-8' }, body: encrypted
            });
            this.parseResponse(response);
            return { endpoint: url };
        },

        async download(passphrase) {
            const provider = this.normalizeProvider(settings.syncProvider);
            if (provider === 'none') throw new Error('Choose a sync provider first');
            let response;
            if (provider === 'gist') {
                const id = this.getGistId(settings.syncEndpoint);
                if (!id) throw new Error('A Gist ID or Gist URL is required');
                response = await this.request(provider, `https://api.github.com/gists/${id}`, { headers: this.authHeaders(provider) });
                this.parseResponse(response);
                let gist;
                try { gist = JSON.parse(response.text); } catch { throw new Error('GitHub returned invalid Gist data'); }
                const file = gist.files?.[this.FILE_NAME];
                if (!file) throw new Error('The Gist does not contain an REC sync file');
                if (file.truncated && file.raw_url) response = await this.request(provider, file.raw_url, { headers: this.authHeaders(provider) });
                else return this.restoreSnapshot(await this.decryptSnapshot(file.content, passphrase));
            } else if (provider === 'pastebin') {
                const url = this.getPasteRawUrl(settings.syncEndpoint);
                if (!url) throw new Error('A Pastebin URL or paste ID is required');
                response = await this.request(provider, url);
            } else {
                const url = this.getWebDavUrl(settings.syncEndpoint);
                if (!url) throw new Error('A valid WebDAV file URL is required');
                response = await this.request(provider, url, { headers: this.authHeaders(provider) });
            }
            this.parseResponse(response);
            this.restoreSnapshot(await this.decryptSnapshot(response.text, passphrase));
        }
    };

    // =========================================================================
    // DARK MODE MODULE
    // =========================================================================
    const DarkModeModule = {
        init() {
            if (settings.darkMode && settings.theme !== 'light') {
                document.body.classList.add('rel-dark-mode');
            }
            if (settings.hideGoldButton) {
                document.body.classList.add('rel-hide-gold');
            }
            if (settings.hideShareButton) {
                document.body.classList.add('rel-hide-share');
            }
            if (settings.hideSaveButton) {
                document.body.classList.add('rel-hide-save');
            }
            if (settings.hideCrosspostButton) {
                document.body.classList.add('rel-hide-crosspost');
            }
            if (settings.hideReportButton) {
                document.body.classList.add('rel-hide-report');
            }
        }
    };

    // =========================================================================
    // OLD FAVICON MODULE
    // =========================================================================
    const OldFaviconModule = {
        init() {
            if (!settings.oldFavicon) return;
            const setFavicon = () => {
                const icons = [...document.querySelectorAll('link[rel~="icon"]')];
                if (!icons.length) return;
                const copy = icons[0].cloneNode(true);
                copy.href = 'https://b.thumbs.redditmedia.com/JeP1WF0kEiiH1gT8vOr_7kFAwIlHzRBHjLDZIkQP61Q.jpg';
                icons.forEach(x => x.parentNode.removeChild(x));
                document.head.appendChild(copy);
            };
            setFavicon();
            window.addEventListener('load', setFavicon);
        }
    };

    // =========================================================================
    // COLLAPSIBLE SIDEBAR MODULE
    // =========================================================================
    const CollapsibleSidebarModule = {
        _storageKey: 'rel_sidebar_hidden',

        _applyState(side, btn, hidden) {
            side.style.display = hidden ? 'none' : '';
            btn.textContent = hidden ? '\u25B6 Sidebar' : '\u25C0 Sidebar';
            const content = document.querySelector('.content[role="main"]');
            if (content) content.style.marginRight = hidden ? '0' : '';
            Storage.set(this._storageKey, hidden);
        },

        init() {
            if (!settings.collapsibleSidebar) return;
            const side = document.querySelector('.side');
            if (!side) return;

            // Persisted state wins; fall back to hideSidebar default
            const savedState = Storage.get(this._storageKey, null);
            const startHidden = savedState !== null ? savedState : !!settings.hideSidebar;

            const self = this;
            const btn = Utils.createElement('div', {
                style: {
                    position: 'fixed', right: '0', top: '50%', transform: 'translateY(-50%)',
                    zIndex: '99997', cursor: 'pointer', padding: '8px 4px',
                    borderRadius: '4px 0 0 4px', fontSize: '14px', opacity: '0.6',
                    transition: 'opacity 0.2s', writingMode: 'vertical-lr'
                },
                textContent: '\u25C0 Sidebar',
                onClick: () => {
                    const isHidden = side.style.display === 'none';
                    self._applyState(side, btn, !isHidden);
                }
            });

            const t = Themes.getTheme();
            if (settings.darkMode) {
                btn.style.background = t.surface;
                btn.style.color = t.fg;
            } else {
                btn.style.background = '#e0e0e0';
                btn.style.color = '#333';
            }
            btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
            btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.6'; });

            document.body.appendChild(btn);

            // Apply initial state
            if (startHidden) {
                this._applyState(side, btn, true);
            }
        }
    };

    // =========================================================================
    // USER TAGGING MODULE
    // =========================================================================
    const UserTaggingModule = {
        tagColors: {
            none: 'transparent', aqua: '#5bc0de', blue: '#0079d3', green: '#5cb85c',
            orange: '#f0ad4e', pink: '#ff79c6', purple: '#bd93f9', red: '#d9534f',
            teal: '#20c997', yellow: '#f1fa8c'
        },

        init() {
            if (!settings.userTagging) return;
            this.process(document);
        },

        process(container) {
            if (!settings.userTagging) return;
            const authors = container.querySelectorAll('.author:not([data-rel-tagged])');
            authors.forEach(author => {
                author.setAttribute('data-rel-tagged', '1');
                const username = author.textContent;
                if (!username) return;

                const tagBtn = Utils.createElement('span', {
                    className: 'rel-user-tag',
                    textContent: userTags[username] ? userTags[username].text : '\u2605',
                    title: userTags[username]?.note ? `Tag user\n${userTags[username].note}` : 'Tag user',
                    onClick: (e) => { e.preventDefault(); e.stopPropagation(); this.showTagPopup(username, e); }
                });

                if (userTags[username]) {
                    const color = this.tagColors[userTags[username].color] || userTags[username].color;
                    tagBtn.style.background = color;
                    tagBtn.style.color = '#fff';
                } else {
                    tagBtn.style.opacity = '0.4';
                    tagBtn.style.fontSize = '9px';
                }

                author.parentNode.insertBefore(tagBtn, author.nextSibling);
            });
        },

        showTagPopup(username, event) {
            document.querySelectorAll('.rel-tag-popup').forEach(p => p.remove());

            const popup = Utils.createElement('div', { className: 'rel-tag-popup' });
            const existing = userTags[username] || { text: '', color: 'none' };

            popup.innerHTML = `
                <h4 style="margin:0 0 10px;font-size:14px;">Tag: ${Utils.escapeHTML(username)}</h4>
                <input type="text" class="rel-tag-text" placeholder="Tag text" value="${Utils.escapeHTML(existing.text)}" style="margin-bottom:8px;">
                <select class="rel-tag-color" style="margin-bottom:10px;">
                    ${Object.keys(this.tagColors).map(c => `<option value="${c}" ${existing.color === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
                <textarea class="rel-tag-note" maxlength="1000" placeholder="Private note (optional)" style="width:100%;min-height:60px;box-sizing:border-box;margin-bottom:10px;">${Utils.escapeHTML(existing.note || '')}</textarea>
                <div style="display:flex;gap:6px;">
                    <button class="rel-btn-small rel-btn-primary rel-tag-save">Save</button>
                    <button class="rel-btn-small rel-btn-danger rel-tag-remove">Remove</button>
                    <button class="rel-btn-small rel-btn-secondary rel-tag-cancel">Cancel</button>
                </div>
            `;

            popup.style.left = Math.min(event.clientX, window.innerWidth - 300) + 'px';
            popup.style.top = Math.min(event.clientY, window.innerHeight - 200) + 'px';

            // AbortController for clean listener cleanup
            const ac = new AbortController();
            const closePopup = () => { popup.remove(); ac.abort(); };

            popup.querySelector('.rel-tag-save').addEventListener('click', () => {
                const text = popup.querySelector('.rel-tag-text').value.trim();
                const color = popup.querySelector('.rel-tag-color').value;
                const note = popup.querySelector('.rel-tag-note').value.trim();
                if (text || note) {
                    userTags[username] = { text, color, note };
                    saveUserTags();
                    this.updateAllTags(username);
                }
                closePopup();
            });

            popup.querySelector('.rel-tag-remove').addEventListener('click', () => {
                delete userTags[username];
                saveUserTags();
                this.updateAllTags(username);
                closePopup();
            });

            popup.querySelector('.rel-tag-cancel').addEventListener('click', closePopup);

            const textInput = popup.querySelector('.rel-tag-text');
            setTimeout(() => textInput.focus(), 50);
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') popup.querySelector('.rel-tag-save').click();
                if (e.key === 'Escape') closePopup();
            });

            document.body.appendChild(popup);
            document.addEventListener('click', (e) => {
                if (!popup.contains(e.target) && !e.target.classList.contains('rel-user-tag')) {
                    closePopup();
                }
            }, { signal: ac.signal });
        },

        updateAllTags(username) {
            document.querySelectorAll('.author').forEach(author => {
                if (author.textContent === username) {
                    const tag = author.nextElementSibling;
                    if (tag && tag.classList.contains('rel-user-tag')) {
                        if (userTags[username]) {
                            tag.textContent = userTags[username].text;
                            const color = this.tagColors[userTags[username].color] || userTags[username].color;
                            tag.style.background = color;
                            tag.style.color = '#fff';
                            tag.style.opacity = '1';
                            tag.style.fontSize = '';
                            tag.title = userTags[username].note ? `Tag user\n${userTags[username].note}` : 'Tag user';
                        } else {
                            tag.textContent = '\u2605';
                            tag.style.background = 'transparent';
                            tag.style.opacity = '0.4';
                            tag.style.fontSize = '9px';
                            tag.title = 'Tag user';
                        }
                    }
                }
            });
        }
    };

    // =========================================================================
    // COMMENT SWEEP MODULE
    // =========================================================================
    const CommentSweepModule = {
        normalizeUsername(username) {
            return String(username || '').trim().replace(/^\/u\//i, '').trim();
        },

        matchesAuthor(author, username) {
            const expected = this.normalizeUsername(username).toLowerCase();
            return Boolean(expected && this.normalizeUsername(author).toLowerCase() === expected);
        },

        findMatchingComments(root, username) {
            const expected = this.normalizeUsername(username);
            if (!expected) return [];
            return [...root.querySelectorAll('.comment')].filter(comment => {
                const author = comment.getAttribute('data-author') || comment.querySelector('.author')?.textContent;
                return this.matchesAuthor(author, expected);
            });
        },

        sweep(username, action, tagText = 'swept', color = 'aqua') {
            const normalized = this.normalizeUsername(username);
            if (!normalized) return 0;
            const comments = this.findMatchingComments(document, normalized);
            if (action === 'hide') {
                if (!ignoredUsers.some(user => this.matchesAuthor(user, normalized))) {
                    ignoredUsers.push(normalized);
                    saveIgnoredUsers();
                }
                // IgnoredUsersModule marks comments as processed. Clear only matching
                // markers so a sweep can be safely repeated after initial page load.
                comments.forEach(comment => comment.removeAttribute('data-rel-ignored'));
                IgnoredUsersModule.process(document);
            } else {
                const canonical = comments[0]?.getAttribute('data-author') || comments[0]?.querySelector('.author')?.textContent || normalized;
                userTags[canonical] = { text: String(tagText || 'swept').trim() || 'swept', color };
                saveUserTags();
                UserTaggingModule.updateAllTags(canonical);
            }
            return comments.length;
        }
    };

    // =========================================================================
    // IMAGE EXPANSION MODULE
    // =========================================================================
    const ImageExpansionModule = {
        imageHosts: {
            'i.redd.it': url => url,
            'preview.redd.it': url => url,
            'i.imgur.com': url => url,
            'files.catbox.moe': url => url,
            'cdn.imgchest.com': url => url,
            'i.ibb.co': url => url,
            'imgur.com': url => {
                const m = url.match(/imgur\.com\/(?:a\/|gallery\/)?(\w+)/);
                return m ? `https://i.imgur.com/${m[1]}.jpg` : null;
            }
        },
        imagePageHosts: ['catbox.moe', 'imgchest.com', 'imgbb.com', 'ibb.co'],
        videoHosts: ['v.redd.it', 'gfycat.com', 'redgifs.com', 'streamable.com'],
        redgifsToken: null,
        redgifsTokenExpiresAt: 0,
        redgifsTokenPromise: null,

        requestJSON(url, headers = {}) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    headers: { Accept: 'application/json', ...headers },
                    timeout: 15000,
                    onload: (response) => {
                        if (response.status < 200 || response.status >= 300) {
                            const error = new Error(`Request failed with status ${response.status}`);
                            error.status = response.status;
                            reject(error);
                            return;
                        }
                        try {
                            resolve(JSON.parse(response.responseText));
                        } catch (error) {
                            reject(error);
                        }
                    },
                    onerror: () => reject(new Error('Network request failed')),
                    ontimeout: () => reject(new Error('Network request timed out'))
                });
            });
        },

        requestText(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    headers: { Accept: 'text/html,application/xhtml+xml' },
                    timeout: 15000,
                    onload: (response) => {
                        if (response.status < 200 || response.status >= 300) {
                            reject(new Error(`Request failed with status ${response.status}`));
                            return;
                        }
                        resolve(response.responseText || '');
                    },
                    onerror: () => reject(new Error('Network request failed')),
                    ontimeout: () => reject(new Error('Network request timed out'))
                });
            });
        },

        requestArrayBuffer(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    responseType: 'arraybuffer',
                    timeout: 30000,
                    onload: (response) => {
                        if (response.status < 200 || response.status >= 300 || !response.response) {
                            reject(new Error(`Request failed with status ${response.status}`));
                            return;
                        }
                        resolve(response.response);
                    },
                    onerror: () => reject(new Error('Network request failed')),
                    ontimeout: () => reject(new Error('Network request timed out'))
                });
            });
        },

        isSupportedImageUrl(url) {
            return /^https?:\/\/(?:[^/]+\.)?(?:catbox\.moe|imgchest\.com|imgbb\.com|ibb\.co)\//i.test(url);
        },

        extractImageUrlsFromHTML(html, baseUrl) {
            const urls = [];
            const attributePattern = /(?:content|data-src|data-original|src|href)\s*=\s*["']([^"']+)["']/gi;
            let match;
            while ((match = attributePattern.exec(html)) !== null) {
                let candidate = match[1].replace(/&amp;/g, '&').replace(/\\\//g, '/');
                try { candidate = new URL(candidate, baseUrl).href; } catch { continue; }
                if (this.isSupportedImageUrl(candidate) && !urls.includes(candidate)) urls.push(candidate);
            }
            return urls;
        },

        async resolveImageUrls(url) {
            const directUrls = [];
            for (const [host, resolver] of Object.entries(this.imageHosts)) {
                if (!url.includes(host)) continue;
                const resolved = resolver(url);
                if (resolved && (/\.(jpg|jpeg|png|gif|webp|bmp|avif)(?:\?.*)?$/i.test(resolved) || this.isSupportedImageUrl(resolved))) {
                    directUrls.push(resolved);
                }
                break;
            }
            if (directUrls.length > 0) return [...new Set(directUrls)];

            if (this.imagePageHosts.some(host => url.includes(host))) {
                const html = await this.requestText(url);
                return this.extractImageUrlsFromHTML(html, url);
            }
            return [url];
        },

        renderImageCollection(urls, container, thing) {
            const t = Themes.getTheme();
            let currentIdx = 0;
            const viewer = document.createElement('div');
            viewer.style.cssText = 'position:relative;text-align:center;';

            const img = document.createElement('img');
            img.style.cssText = 'display:block;max-width:100%;max-height:600px;margin:0 auto;border-radius:4px;cursor:pointer;';
            img.addEventListener('click', () => window.open(urls[currentIdx], '_blank'));
            // Preserve the existing drag-to-resize behavior for direct and resolved images.
            let startY;
            let startH;
            img.addEventListener('mousedown', (event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                startY = event.clientY;
                startH = img.offsetHeight;
                const onMove = (moveEvent) => {
                    img.style.maxHeight = 'none';
                    img.style.height = Math.max(50, startH + (moveEvent.clientY - startY)) + 'px';
                };
                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
            viewer.appendChild(img);

            const update = () => {
                img.src = urls[currentIdx];
                img.alt = `Expanded image ${currentIdx + 1} of ${urls.length}`;
                label.textContent = urls.length > 1 ? `${currentIdx + 1} / ${urls.length}` : '';
            };

            const label = document.createElement('span');
            label.style.cssText = `font-size:12px;color:${t.fgMuted};`;
            const controls = document.createElement('div');
            controls.style.cssText = `display:flex;justify-content:center;align-items:center;gap:10px;padding:6px 0;`;

            if (urls.length > 1) {
                const buttonStyle = `padding:4px 10px;border-radius:4px;cursor:pointer;border:1px solid ${t.border};background:${t.surface};color:${t.fg};font-size:12px;`;
                const prev = document.createElement('button');
                prev.type = 'button';
                prev.textContent = '\u25C0 Prev';
                prev.style.cssText = buttonStyle;
                prev.addEventListener('click', () => {
                    currentIdx = (currentIdx - 1 + urls.length) % urls.length;
                    update();
                });
                const next = document.createElement('button');
                next.type = 'button';
                next.textContent = 'Next \u25B6';
                next.style.cssText = buttonStyle;
                next.addEventListener('click', () => {
                    currentIdx = (currentIdx + 1) % urls.length;
                    update();
                });
                controls.appendChild(prev);
                controls.appendChild(label);
                controls.appendChild(next);
            }

            container.appendChild(viewer);
            if (urls.length > 1) container.appendChild(controls);
            update();

            img.addEventListener('error', () => {
                container.innerHTML = '';
                const link = document.createElement('a');
                link.href = thing.getAttribute('data-url') || urls[currentIdx];
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = 'Image failed to load; open original';
                link.style.color = t.accent;
                container.appendChild(link);
            });
        },

        async loadImage(url, container, thing) {
            const t = Themes.getTheme();
            const loading = Utils.createElement('div', {
                className: 'rel-media-loading',
                textContent: 'Loading image...',
                style: { padding: '10px', color: t.fgDim, fontSize: '12px' }
            });
            container.appendChild(loading);
            try {
                const urls = (await this.resolveImageUrls(url)).filter(Boolean);
                if (urls.length === 0) throw new Error('No image URL found');
                loading.remove();
                this.renderImageCollection(urls, container, thing);
            } catch {
                loading.remove();
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = 'Open image on host';
                link.style.color = t.accent;
                container.appendChild(link);
            }
        },

        extractRedgifsId(url) {
            const match = url.match(/redgifs\.com\/(?:watch|ifr|v)\/([a-z0-9]+)/i);
            return match ? match[1] : null;
        },

        extractStreamableId(url) {
            const match = url.match(/streamable\.com\/(?:e\/|o\/)?([a-z0-9]+)/i);
            return match ? match[1] : null;
        },

        extractRedditVideoId(url) {
            const match = url.match(/v\.redd\.it\/([a-z0-9]+)/i);
            return match ? match[1] : null;
        },

        buildRedditVideoUrls(url, quality = '720') {
            const id = this.extractRedditVideoId(url);
            if (!id) return null;
            const base = `https://v.redd.it/${encodeURIComponent(id)}`;
            return {
                video: `${base}/DASH_${quality}.mp4`,
                audio: `${base}/DASH_AUDIO_128.mp4`
            };
        },

        renderRedditEmbed(fullname, container) {
            const postId = fullname.replace('t3_', '');
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.redditmedia.com/${postId}?ref_source=embed&ref=share&embed=true&theme=dark`;
            iframe.style.cssText = 'width:100%;max-width:640px;height:360px;border:none;border-radius:6px;';
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('loading', 'lazy');
            container.appendChild(iframe);
        },

        getSupportedMediaType(candidates) {
            if (typeof MediaSource === 'undefined' || typeof MediaSource.isTypeSupported !== 'function') return null;
            return candidates.find(type => MediaSource.isTypeSupported(type)) || null;
        },

        appendMediaBuffer(sourceBuffer, data) {
            return new Promise((resolve, reject) => {
                const onUpdate = () => {
                    sourceBuffer.removeEventListener('updateend', onUpdate);
                    sourceBuffer.removeEventListener('error', onError);
                    resolve();
                };
                const onError = () => {
                    sourceBuffer.removeEventListener('updateend', onUpdate);
                    sourceBuffer.removeEventListener('error', onError);
                    reject(new Error('MediaSource buffer error'));
                };
                sourceBuffer.addEventListener('updateend', onUpdate, { once: true });
                sourceBuffer.addEventListener('error', onError, { once: true });
                try { sourceBuffer.appendBuffer(data); }
                catch (error) {
                    sourceBuffer.removeEventListener('updateend', onUpdate);
                    sourceBuffer.removeEventListener('error', onError);
                    reject(error);
                }
            });
        },

        async loadRedditVideo(url, container) {
            const qualities = ['720', '480', '360', '240'];
            let videoData = null;
            let selectedUrls = null;
            for (const quality of qualities) {
                const urls = this.buildRedditVideoUrls(url, quality);
                if (!urls) throw new Error('Invalid Reddit video URL');
                try {
                    videoData = await this.requestArrayBuffer(urls.video);
                    selectedUrls = urls;
                    break;
                } catch {}
            }
            if (!videoData || !selectedUrls) throw new Error('Reddit video track unavailable');
            const audioData = await this.requestArrayBuffer(selectedUrls.audio);

            const videoType = this.getSupportedMediaType([
                'video/mp4; codecs="avc1.4D401F"',
                'video/mp4; codecs="avc1.640028"',
                'video/mp4'
            ]);
            const audioType = this.getSupportedMediaType([
                'audio/mp4; codecs="mp4a.40.2"',
                'audio/mp4'
            ]);
            if (!videoType || !audioType) throw new Error('MediaSource MP4 codecs unavailable');

            const mediaSource = new MediaSource();
            const objectUrl = URL.createObjectURL(mediaSource);
            const video = document.createElement('video');
            video.controls = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.style.cssText = 'display:block;width:100%;max-width:720px;max-height:600px;border-radius:6px;background:#000;';
            video.src = objectUrl;
            container.innerHTML = '';
            container.appendChild(video);
            container._relMediaCleanup = () => URL.revokeObjectURL(objectUrl);

            await new Promise((resolve, reject) => {
                const onOpen = async () => {
                    mediaSource.removeEventListener('sourceopen', onOpen);
                    try {
                        const videoBuffer = mediaSource.addSourceBuffer(videoType);
                        const audioBuffer = mediaSource.addSourceBuffer(audioType);
                        await this.appendMediaBuffer(videoBuffer, videoData);
                        await this.appendMediaBuffer(audioBuffer, audioData);
                        if (mediaSource.readyState === 'open') mediaSource.endOfStream();
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };
                mediaSource.addEventListener('sourceopen', onOpen, { once: true });
            });
        },

        selectRedgifsMedia(payload) {
            const gif = payload?.gif || payload?.data?.gif || payload?.data || payload;
            const urls = gif?.urls || {};
            const candidates = [
                urls.hd, urls.sd, urls.file, urls.mp4,
                gif?.hd, gif?.sd, gif?.file_url, gif?.url
            ].filter(value => typeof value === 'string' && value.length > 0);
            const url = candidates.find(value => /^https?:\/\//i.test(value));
            if (!url) return null;
            return {
                url,
                width: Number(gif.width || 0),
                height: Number(gif.height || 0),
                hasAudio: gif.hasAudio === true || gif.has_audio === true,
                poster: urls.vthumbnail || urls.thumbnail || gif.thumbnail || ''
            };
        },

        selectStreamableFile(payload) {
            const files = payload?.files && typeof payload.files === 'object' ? payload.files : {};
            const candidates = Object.entries(files)
                .map(([format, file]) => ({ format, file }))
                .filter(({ file }) => file && (!file.status || file.status === 2) && typeof file.url === 'string')
                .map(({ format, file }) => ({
                    url: file.url.startsWith('//') ? `https:${file.url}` : file.url,
                    format,
                    width: Number(file.width || 0),
                    height: Number(file.height || 0),
                    bitrate: Number(file.bitrate || 0),
                    duration: Number(file.duration || 0)
                }))
                .filter(file => /^https?:\/\//i.test(file.url));

            candidates.sort((a, b) => {
                const resolution = (b.width * b.height) - (a.width * a.height);
                return resolution || b.bitrate - a.bitrate;
            });
            return candidates[0] || null;
        },

        async getRedgifsToken(forceRefresh = false) {
            if (!forceRefresh && this.redgifsToken && Date.now() < this.redgifsTokenExpiresAt) {
                return this.redgifsToken;
            }
            if (this.redgifsTokenPromise) return this.redgifsTokenPromise;

            this.redgifsTokenPromise = this.requestJSON('https://api.redgifs.com/v2/auth/temporary')
                .then(data => {
                    if (!data?.token) throw new Error('Redgifs token missing');
                    this.redgifsToken = data.token;
                    // Keep a safety margin because the API token lifetime is external state.
                    this.redgifsTokenExpiresAt = Date.now() + 10 * 60 * 1000;
                    return this.redgifsToken;
                })
                .finally(() => { this.redgifsTokenPromise = null; });
            return this.redgifsTokenPromise;
        },

        async loadRedgifsVideo(id) {
            let token = await this.getRedgifsToken();
            try {
                return this.selectRedgifsMedia(await this.requestJSON(
                    `https://api.redgifs.com/v2/gifs/${encodeURIComponent(id)}`,
                    { Authorization: `Bearer ${token}` }
                ));
            } catch (error) {
                if (error.status !== 401) throw error;
                token = await this.getRedgifsToken(true);
                return this.selectRedgifsMedia(await this.requestJSON(
                    `https://api.redgifs.com/v2/gifs/${encodeURIComponent(id)}`,
                    { Authorization: `Bearer ${token}` }
                ));
            }
        },

        createVideoElement(media) {
            const video = document.createElement('video');
            video.controls = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'metadata';
            video.style.cssText = 'display:block;width:100%;max-width:720px;max-height:600px;border-radius:6px;background:#000;';
            if (media.width > 0) video.width = media.width;
            if (media.height > 0) video.height = media.height;
            if (media.poster) video.poster = media.poster;

            const source = document.createElement('source');
            source.src = media.url;
            if (/\.m3u8(?:\?|$)/i.test(media.url)) source.type = 'application/vnd.apple.mpegurl';
            else source.type = 'video/mp4';
            video.appendChild(source);
            return video;
        },

        async loadVideo(thing, container, url) {
            const t = Themes.getTheme();
            const fullname = thing.getAttribute('data-fullname') || '';
            if (url.includes('v.redd.it') && fullname) {
                try {
                    await this.loadRedditVideo(url, container);
                } catch {
                    container.innerHTML = '';
                    this.renderRedditEmbed(fullname, container);
                }
                return;
            }
            const loading = Utils.createElement('div', {
                className: 'rel-media-loading',
                textContent: 'Loading video...',
                style: { padding: '10px', color: t.fgDim, fontSize: '12px' }
            });
            container.appendChild(loading);

            try {
                let media = null;
                const redgifsId = this.extractRedgifsId(url);
                if (redgifsId) {
                    media = await this.loadRedgifsVideo(redgifsId);
                } else {
                    const streamableId = this.extractStreamableId(url);
                    if (streamableId) {
                        const data = await this.requestJSON(`https://api.streamable.com/videos/${encodeURIComponent(streamableId)}`);
                        media = this.selectStreamableFile(data);
                    }
                }

                if (media) {
                    loading.remove();
                    container.appendChild(this.createVideoElement(media));
                    return;
                }
                throw new Error('No playable media URL');
            } catch (error) {
                loading.remove();
                const streamableId = this.extractStreamableId(url);
                if (streamableId) {
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://streamable.com/o/${encodeURIComponent(streamableId)}`;
                    iframe.style.cssText = 'width:100%;max-width:720px;height:405px;border:none;border-radius:6px;';
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.setAttribute('loading', 'lazy');
                    container.appendChild(iframe);
                    return;
                }

                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = 'Open video on host';
                link.style.color = t.accent;
                container.appendChild(link);
            }
        },

        parseGalleryImages(post) {
            const items = Array.isArray(post?.gallery_data?.items) ? post.gallery_data.items : [];
            const metadata = post?.media_metadata && typeof post.media_metadata === 'object'
                ? post.media_metadata
                : {};

            return items.map(item => {
                const meta = metadata[item.media_id];
                if (!meta) return null;

                // Reddit normally exposes the original image as `s`, but older
                // responses sometimes only include the largest preview entry.
                const source = meta.s || meta.o || meta.p?.[meta.p.length - 1];
                const url = source?.u || source?.gif || source?.mp4;
                if (!url) return null;

                return {
                    url: url.replace(/&amp;/g, '&'),
                    width: Number(source.x || source.width || 0),
                    height: Number(source.y || source.height || 0),
                    caption: typeof item.caption === 'string' ? item.caption.trim() : ''
                };
            }).filter(Boolean);
        },

        getGalleryIndex(index, delta, length) {
            if (!Number.isInteger(length) || length < 1) return 0;
            return (index + delta + length) % length;
        },

        preloadGalleryImage(image) {
            if (!image?.url || typeof Image !== 'function') return;
            const preload = new Image();
            preload.decoding = 'async';
            preload.src = image.url;
        },

        init() {
            if (!settings.inlineImageExpansion) return;
            this.process(document);
        },

        process(container) {
            if (!settings.inlineImageExpansion) return;
            const things = container.querySelectorAll('.thing.link:not([data-rel-expanded])');
            things.forEach(thing => {
                thing.setAttribute('data-rel-expanded', '1');
                const url = thing.getAttribute('data-url') || '';
                const entry = thing.querySelector('.entry');
                if (!entry) return;

                // Skip if Reddit already has a working expando
                const existingExpando = thing.querySelector('.expando-button');
                if (existingExpando && !existingExpando.classList.contains('collapsed')) return;

                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(url) ||
                                Object.keys(this.imageHosts).some(h => url.includes(h)) ||
                                this.imagePageHosts.some(h => url.includes(h));
                const isVideo = this.videoHosts.some(h => url.includes(h));
                const isGallery = url.includes('/gallery/') || thing.classList.contains('gallery');

                if (isImage || isVideo || isGallery) {
                    const label = isGallery ? '[+gallery]' : (isImage ? '[+img]' : '[+vid]');
                    const type = isGallery ? 'gallery' : (isImage ? 'image' : 'video');
                    const expandBtn = Utils.createElement('span', {
                        className: 'rel-button',
                        textContent: label,
                        style: { marginLeft: '4px' },
                        onClick: () => this.toggleExpand(thing, url, type, expandBtn)
                    });
                    const buttons = entry.querySelector('.flat-list.buttons');
                    if (buttons) buttons.prepend(expandBtn);
                }
            });
        },

        toggleExpand(thing, url, type, btn) {
            const existing = thing.querySelector('.rel-media-expando');
            if (existing) {
                existing._relGalleryCleanup?.();
                existing._relMediaCleanup?.();
                existing.remove();
                btn.textContent = type === 'gallery' ? '[+gallery]' : (type === 'image' ? '[+img]' : '[+vid]');
                return;
            }

            const container = Utils.createElement('div', {
                className: 'rel-media-expando',
                style: { margin: '8px 0', maxWidth: '100%', overflow: 'hidden' }
            });

            if (type === 'image') {
                this.loadImage(url, container, thing);
            } else if (type === 'video') {
                this.loadVideo(thing, container, url);
            } else if (type === 'gallery') {
                this.loadGallery(thing, container);
            }

            const entry = thing.querySelector('.entry');
            entry.appendChild(container);
            btn.textContent = type === 'gallery' ? '[-gallery]' : (type === 'image' ? '[-img]' : '[-vid]');
            AnalyticsModule.increment('mediaExpanded');
        },

        async loadGallery(thing, container) {
            const t = Themes.getTheme();
            container.innerHTML = `<div style="padding:10px;color:${t.fgDim};font-size:12px;">Loading gallery...</div>`;
            try {
                const fullname = thing.getAttribute('data-fullname') || '';
                const postId = fullname.replace('t3_', '');
                if (!postId) throw new Error('No post ID');

                const resp = await fetch(`https://old.reddit.com/by_id/${fullname}.json`);
                const data = await resp.json();
                const post = data?.data?.children?.[0]?.data;
                if (!post) throw new Error('No post data');

                const images = this.parseGalleryImages(post);

                if (images.length === 0) throw new Error('No images found');

                container.innerHTML = '';
                let currentIdx = 0;

                const move = (delta) => {
                    currentIdx = this.getGalleryIndex(currentIdx, delta, images.length);
                    updateView();
                };

                const viewer = document.createElement('div');
                viewer.tabIndex = 0;
                viewer.setAttribute('role', 'region');
                viewer.setAttribute('aria-label', 'Gallery viewer. Use the left and right arrow keys to navigate.');
                viewer.style.cssText = 'position:relative;text-align:center;outline:none;';

                const img = document.createElement('img');
                img.style.cssText = 'max-width:100%;max-height:600px;border-radius:6px;cursor:pointer;';
                img.addEventListener('click', () => window.open(images[currentIdx].url, '_blank'));
                viewer.appendChild(img);

                const counter = document.createElement('div');
                counter.style.cssText = `font-size:12px;color:${t.fgMuted};padding:6px 0;display:flex;align-items:center;justify-content:center;gap:12px;`;

                const label = document.createElement('span');
                label.setAttribute('aria-live', 'polite');

                const dimensions = document.createElement('span');
                dimensions.className = 'rel-gallery-dimensions';
                dimensions.style.opacity = '0.8';

                const updateView = () => {
                    const image = images[currentIdx];
                    img.src = image.url;
                    img.alt = image.caption || `Gallery image ${currentIdx + 1} of ${images.length}`;
                    label.textContent = `${currentIdx + 1} / ${images.length}${image.caption ? ' - ' + image.caption : ''}`;
                    dimensions.textContent = image.width > 0 && image.height > 0
                        ? `${image.width} × ${image.height}`
                        : '';
                    this.preloadGalleryImage(images[this.getGalleryIndex(currentIdx, 1, images.length)]);
                    this.preloadGalleryImage(images[this.getGalleryIndex(currentIdx, -1, images.length)]);
                };

                const prevBtn = document.createElement('button');
                prevBtn.type = 'button';
                prevBtn.textContent = '\u25C0 Prev';
                prevBtn.style.cssText = `padding:4px 10px;border-radius:4px;cursor:pointer;border:1px solid ${t.border};background:${t.surface};color:${t.fg};font-size:12px;`;
                prevBtn.addEventListener('click', () => move(-1));

                const nextBtn = document.createElement('button');
                nextBtn.type = 'button';
                nextBtn.textContent = 'Next \u25B6';
                nextBtn.style.cssText = prevBtn.style.cssText;
                nextBtn.addEventListener('click', () => move(1));

                const keyHandler = (event) => {
                    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                    const target = event.target;
                    if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
                    event.preventDefault();
                    event.stopPropagation();
                    move(event.key === 'ArrowLeft' ? -1 : 1);
                };
                document.addEventListener('keydown', keyHandler, true);
                container._relGalleryCleanup = () => document.removeEventListener('keydown', keyHandler, true);

                counter.appendChild(prevBtn);
                counter.appendChild(label);
                counter.appendChild(dimensions);
                counter.appendChild(nextBtn);

                container.appendChild(viewer);
                container.appendChild(counter);
                updateView();
            } catch (e) {
                container.innerHTML = `<div style="padding:8px;color:${t.fgDim};font-size:12px;">Gallery could not be loaded. <a href="${Utils.escapeHTML(thing.getAttribute('data-url') || '#')}" target="_blank" style="color:${t.accent};">Open on Reddit</a></div>`;
            }
        }
    };

    // =========================================================================
    // NEVER ENDING REDDIT MODULE
    // =========================================================================
    const NeverEndingRedditModule = {
        currentPage: 1,
        loading: false,
        paused: false,

        init() {
            if (!settings.neverEndingReddit) return;
            if (!Utils.isListingPage()) return;

            this.nextPageUrl = this.getNextPageUrl();
            if (!this.nextPageUrl) return;

            window.addEventListener('scroll', Utils.throttle(() => {
                if (this.loading || this.paused) return;
                const scrollPos = window.innerHeight + window.scrollY;
                const docHeight = document.documentElement.scrollHeight;
                if (scrollPos >= docHeight - 1000) {
                    this.loadNextPage();
                }
            }, 300));
        },

        getNextPageUrl() {
            const next = document.querySelector('.next-button a');
            return next ? next.href : null;
        },

        async loadNextPage() {
            if (this.loading || !this.nextPageUrl) return;
            this.loading = true;

            // Check pause threshold
            if (settings.nerPauseAfterPages > 0 && this.currentPage >= settings.nerPauseAfterPages) {
                this.showPauseButton();
                return;
            }

            const loader = Utils.createElement('div', {
                className: 'rel-ner-marker',
                textContent: 'Loading page ' + (this.currentPage + 1) + '...'
            });
            const sitetable = document.querySelector('.sitetable.linklisting');
            if (!sitetable) { this.loading = false; return; }
            sitetable.appendChild(loader);

            try {
                const resp = await fetch(this.nextPageUrl);
                const html = await resp.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newPosts = doc.querySelectorAll('.sitetable.linklisting > .thing');

                this.currentPage++;
                loader.textContent = '\u2014 Page ' + this.currentPage + ' \u2014';

                newPosts.forEach(post => sitetable.appendChild(post));

                const nextBtn = doc.querySelector('.next-button a');
                this.nextPageUrl = nextBtn ? nextBtn.href : null;

                // Only process newly added posts, not the entire sitetable
                newPosts.forEach(post => Utils.processNewContent(post));
            } catch (e) {
                loader.textContent = 'Error loading next page. Click to retry.';
                loader.style.cursor = 'pointer';
                loader.addEventListener('click', () => {
                    loader.remove();
                    this.loading = false;
                    this.loadNextPage();
                });
            }
            this.loading = false;
        },

        showPauseButton() {
            const sitetable = document.querySelector('.sitetable.linklisting');
            if (!sitetable) return;
            const t = Themes.getTheme();
            const pauseDiv = Utils.createElement('div', {
                className: 'rel-ner-marker',
                style: { cursor: 'pointer', padding: '15px', fontSize: '14px' },
                innerHTML: `<strong>Paused after ${this.currentPage} pages.</strong> Click to load more.`,
                onClick: () => {
                    pauseDiv.remove();
                    this.currentPage = 0;
                    this.loading = false;
                    this.loadNextPage();
                }
            });
            sitetable.appendChild(pauseDiv);
        }
    };

    // =========================================================================
    // COLLAPSE CHILD COMMENTS MODULE
    // =========================================================================
    // =========================================================================
    // HIDE CHILD COMMENTS MODULE (RES-style)
    // =========================================================================
    const CollapseChildCommentsModule = {
        // Track global hide-all state for NER integration
        allChildrenHidden: false,
        pageToggleLink: null,

        init() {
            if (!settings.collapseChildComments) return;
            if (!Utils.isCommentsPage()) return;

            // Add page-wide toggle button to menuarea
            this.addPageToggle();

            // Process existing comments
            this.process(document);

            // Auto-hide on load if enabled
            if (settings.collapseChildCommentsDefault) {
                this.toggleAll(true);
            }
        },

        // Page-wide "hide all child comments" toggle in the comment area menubar
        addPageToggle() {
            const menuarea = document.querySelector('.commentarea .menuarea');
            if (!menuarea) return;
            if (menuarea.querySelector('.rel-toggle-all-children')) return;

            const sep = document.createTextNode(' | ');
            const link = Utils.createElement('a', {
                className: 'rel-toggle-all-children',
                href: 'javascript:void(0)',
                textContent: 'hide all child comments',
                title: 'Toggle visibility of all child comments (Shift+C)',
                onClick: (e) => {
                    e.preventDefault();
                    this.toggleAll(!this.allChildrenHidden);
                }
            });
            menuarea.appendChild(sep);
            menuarea.appendChild(link);
            this.pageToggleLink = link;
        },

        // Toggle ALL child comments on the page
        toggleAll(hide) {
            this.allChildrenHidden = hide;

            // Update page toggle text
            if (this.pageToggleLink) {
                this.pageToggleLink.textContent = hide ? 'show all child comments' : 'hide all child comments';
            }

            // Get all top-level comments
            const commentArea = document.querySelector('.commentarea > .sitetable.nestedlisting');
            if (!commentArea) return;

            const topLevelComments = commentArea.querySelectorAll(':scope > .thing.comment');
            topLevelComments.forEach(comment => {
                this.setChildVisibility(comment, hide, settings.collapseChildCommentsHideNested);
            });

            // If hideNested is enabled, also process nested comments
            if (hide && settings.collapseChildCommentsHideNested) {
                document.querySelectorAll('.thing.comment').forEach(comment => {
                    this.setChildVisibility(comment, true, true);
                });
            }
        },

        // Set visibility on a single comment's .child container
        setChildVisibility(comment, hide, recursive) {
            const childDiv = comment.querySelector(':scope > .child');
            if (!childDiv) return;
            const childComments = childDiv.querySelectorAll(':scope .comment');
            if (childComments.length === 0) return;

            childDiv.style.display = hide ? 'none' : '';

            // Update the per-comment toggle button if it exists
            const btn = comment.querySelector(':scope > .entry .rel-collapse-btn');
            if (btn) {
                const count = childDiv.querySelectorAll(':scope > .sitetable > .comment, :scope > .sitetable > .thing.comment').length || childComments.length;
                btn.textContent = hide ?
                    `[+] show ${count} ${count === 1 ? 'child' : 'children'}` :
                    `[\u2013] hide ${count} ${count === 1 ? 'child' : 'children'}`;
            }

            // Recursively process nested comments if requested
            if (recursive && hide) {
                childComments.forEach(nested => {
                    this.setChildVisibility(nested, true, true);
                });
            }
        },

        // Process new comments (initial load + NER)
        process(container) {
            if (!settings.collapseChildComments) return;
            const comments = container.querySelectorAll('.comment:not([data-rel-collapse])');
            comments.forEach(comment => {
                comment.setAttribute('data-rel-collapse', '1');
                const childDiv = comment.querySelector(':scope > .child');
                if (!childDiv || !childDiv.querySelector('.comment')) return;

                // Determine if this is a top-level comment
                const isTopLevel = comment.parentElement?.classList.contains('nestedlisting') &&
                    comment.parentElement?.parentElement?.classList.contains('commentarea');

                // Only add buttons to top-level by default, or all if nested option enabled
                if (!isTopLevel && !settings.collapseChildCommentsNested) return;

                const flatList = comment.querySelector(':scope > .entry .flat-list.buttons');
                if (!flatList || flatList.querySelector('.rel-collapse-btn')) return;

                const directChildren = childDiv.querySelectorAll(':scope > .sitetable > .comment, :scope > .sitetable > .thing.comment');
                const count = directChildren.length || childDiv.querySelectorAll('.comment').length;

                const btn = Utils.createElement('li', {});
                const link = Utils.createElement('a', {
                    className: 'rel-collapse-btn',
                    textContent: `[\u2013] hide ${count} ${count === 1 ? 'child' : 'children'}`,
                    href: 'javascript:void(0)',
                    onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const isHidden = childDiv.style.display === 'none';
                        childDiv.style.display = isHidden ? '' : 'none';
                        link.textContent = isHidden ?
                            `[\u2013] hide ${count} ${count === 1 ? 'child' : 'children'}` :
                            `[+] show ${count} ${count === 1 ? 'child' : 'children'}`;
                    }
                });
                btn.appendChild(link);
                flatList.appendChild(btn);

                // If auto-hide is active (either from default or from toggleAll), apply
                if (this.allChildrenHidden && isTopLevel) {
                    childDiv.style.display = 'none';
                    link.textContent = `[+] show ${count} ${count === 1 ? 'child' : 'children'}`;
                } else if (settings.collapseChildCommentsDefault && isTopLevel) {
                    childDiv.style.display = 'none';
                    link.textContent = `[+] show ${count} ${count === 1 ? 'child' : 'children'}`;
                }
            });
        }
    };

    // =========================================================================
    // COMMENT HIGHLIGHTING MODULE
    // =========================================================================
    const CommentHighlightingModule = {
        init() {
            if (!settings.commentHighlighting) return;
            if (!Utils.isCommentsPage()) return;
            this.process(document);
        },

        process(container) {
            if (!settings.commentHighlighting || !Utils.isCommentsPage()) return;
            const threadId = window.location.pathname.split('/')[4];
            if (!threadId) return;

            const lastVisit = visitedComments[threadId] || 0;
            const now = Date.now();

            const comments = container.querySelectorAll('.comment:not([data-rel-highlighted])');
            const t = Themes.getTheme();

            comments.forEach(comment => {
                comment.setAttribute('data-rel-highlighted', '1');
                const timeEl = comment.querySelector('time');
                if (!timeEl) return;
                const commentTime = new Date(timeEl.getAttribute('datetime')).getTime();
                if (commentTime > lastVisit && lastVisit > 0) {
                    const age = now - commentTime;
                    const maxAge = 3 * 24 * 60 * 60 * 1000;
                    const intensity = Math.max(0.05, Math.min(0.2, 0.2 * (1 - age / maxAge)));
                    const color = settings.darkMode ? t.accent : '#0079d3';
                    comment.style.borderLeft = `3px solid ${color}`;
                    // Convert hex or rgb to rgba
                    let rgba;
                    if (color.startsWith('#')) {
                        const r = parseInt(color.slice(1,3), 16), g = parseInt(color.slice(3,5), 16), b = parseInt(color.slice(5,7), 16);
                        rgba = `rgba(${r},${g},${b},${intensity})`;
                    } else if (color.startsWith('rgb')) {
                        rgba = color.replace(')', `,${intensity})`).replace('rgb(', 'rgba(');
                    } else {
                        rgba = color;
                    }
                    comment.style.backgroundColor = rgba;
                }
            });

            visitedComments[threadId] = now;

            // Clean old entries (>7 days)
            const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
            Object.keys(visitedComments).forEach(key => {
                if (visitedComments[key] < weekAgo) delete visitedComments[key];
            });
            saveVisitedComments();
        }
    };

    // =========================================================================
    // LIVE COMMENT REFRESH MODULE
    // =========================================================================
    const CommentRefreshModule = {
        intervalId: null,
        loading: false,

        init() {
            if (!settings.liveCommentRefresh || !Utils.isCommentsPage()) return;
            GM_addStyle(`
                .rel-new-comment > .entry { outline: 2px solid ${Themes.getTheme().success}; outline-offset: 2px; background: color-mix(in srgb, ${Themes.getTheme().success} 8%, transparent); }
                .rel-new-comment-label { margin-left: 6px; border: 0; background: transparent; color: ${Themes.getTheme().success}; cursor: pointer; font-size: 11px; font-weight: bold; }
            `);
            const host = document.querySelector('.commentarea .menuarea') || document.querySelector('.commentarea .panestack-title');
            if (!host) return;

            const button = Utils.createElement('button', {
                className: 'rel-btn-small rel-btn-secondary rel-comment-refresh',
                textContent: '\u21BB Refresh comments',
                title: 'Load new comments without reloading the page',
                style: { marginLeft: '8px' },
                onClick: () => this.refresh()
            });
            const status = Utils.createElement('span', {
                className: 'rel-comment-refresh-status',
                style: { marginLeft: '6px', fontSize: '11px', opacity: '0.7' }
            });
            host.appendChild(button);
            host.appendChild(status);
            this.statusElement = status;
            const seconds = Math.max(15, Math.min(600, Number(settings.liveCommentRefreshSeconds) || 60));
            this.intervalId = setInterval(() => this.refresh(), seconds * 1000);
        },

        buildRefreshUrl(href) {
            const url = new URL(href);
            url.searchParams.set('sort', 'new');
            return url.href;
        },

        getCommentId(comment) {
            return comment?.getAttribute('data-fullname') || comment?.id?.match(/(?:thing|comment)_?([a-z0-9]+)/i)?.[1] || null;
        },

        getParentId(comment) {
            return comment?.getAttribute('data-parent-fullname') || null;
        },

        collectNewRoots(incoming, existingIds) {
            const nodes = [...incoming].filter(node => {
                const id = this.getCommentId(node);
                return id && !existingIds.has(id);
            });
            const newIds = new Set(nodes.map(node => this.getCommentId(node)));
            return nodes.filter(node => !newIds.has(this.getParentId(node)));
        },

        findComment(id) {
            if (!id) return null;
            return [...document.querySelectorAll('.comment[data-fullname]')]
                .find(comment => this.getCommentId(comment) === id) || null;
        },

        markNew(comment) {
            comment.classList.add('rel-new-comment');
            const tagline = comment.querySelector('.tagline');
            if (!tagline || tagline.querySelector('.rel-new-comment-label')) return;
            const label = document.createElement('button');
            label.type = 'button';
            label.className = 'rel-new-comment-label';
            label.textContent = '[new]';
            label.title = 'Dismiss new-comment highlight';
            label.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                comment.classList.remove('rel-new-comment');
                label.remove();
            });
            tagline.appendChild(label);
        },

        appendRoot(node, existingIds) {
            const parent = this.findComment(this.getParentId(node));
            const target = parent?.querySelector(':scope > .child') ||
                document.querySelector('.commentarea .sitetable.nestedlisting') ||
                document.querySelector('.commentarea .sitetable');
            if (!target) return 0;

            const clone = node.cloneNode(true);
            this.markNew(clone);
            clone.querySelectorAll('.comment[data-fullname]').forEach(nested => {
                if (nested !== clone && existingIds.has(this.getCommentId(nested))) nested.remove();
            });
            clone.querySelectorAll('.comment[data-fullname]').forEach(comment => this.markNew(comment));
            target.appendChild(clone);
            Utils.processNewContent(clone);
            return clone.querySelectorAll('.comment[data-fullname]').length || 1;
        },

        setStatus(text, error = false) {
            if (this.statusElement) {
                this.statusElement.textContent = text;
                this.statusElement.style.color = error ? Themes.getTheme().error : '';
            }
        },

        async refresh() {
            if (this.loading) return 0;
            this.loading = true;
            this.setStatus(' refreshing...');
            try {
                const existingIds = new Set([...document.querySelectorAll('.comment[data-fullname]')]
                    .map(comment => this.getCommentId(comment)).filter(Boolean));
                const response = await fetch(this.buildRefreshUrl(window.location.href), {
                    credentials: 'same-origin',
                    headers: { Accept: 'text/html' }
                });
                if (!response.ok) throw new Error(`Refresh failed: ${response.status}`);
                const html = await response.text();
                const parsed = new DOMParser().parseFromString(html, 'text/html');
                const incoming = parsed.querySelectorAll('.comment[data-fullname]');
                const roots = this.collectNewRoots(incoming, existingIds);
                let added = 0;
                roots.forEach(root => { added += this.appendRoot(root, existingIds); });
                this.setStatus(added ? ` ${added} new comment${added === 1 ? '' : 's'}` : ' up to date');
                return added;
            } catch (error) {
                console.warn('REL CommentRefreshModule:', error);
                this.setStatus(' refresh failed', true);
                return 0;
            } finally {
                this.loading = false;
            }
        }
    };

    // =========================================================================
    // KEYBOARD NAVIGATION MODULE
    // =========================================================================
    const KeyboardNavModule = {
        currentIndex: -1,
        things: [],
        _dirty: true,

        init() {
            if (!settings.keyboardNav) return;
            this.updateThings();
            document.addEventListener('keydown', (e) => this.handleKey(e));
            // Invalidate cache when DOM changes (NER pages, expand thread, etc)
            this.observer = ObserverRegistry.observe(
                document.querySelector('.sitetable') || document.body,
                () => { this._dirty = true; },
                { childList: true, subtree: true },
                'keyboard-navigation'
            );
        },

        updateThings() {
            if (!this._dirty) return;
            this.things = Array.from(document.querySelectorAll('.thing.link, .thing.comment'));
            this._dirty = false;
        },

        handleKey(e) {
            if (!settings.keyboardNav) return;
            // Ignore when typing in inputs
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (e.target.isContentEditable) return;

            const key = e.key.toLowerCase();

            // Shift+C: Toggle all child comments (RES-style)
            if (e.shiftKey && key === 'c' && Utils.isCommentsPage()) {
                e.preventDefault();
                if (settings.collapseChildComments) {
                    CollapseChildCommentsModule.toggleAll(!CollapseChildCommentsModule.allChildrenHidden);
                }
                return;
            }

            // Don't process modified keys for other shortcuts (except Shift for ? help)
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            if (e.shiftKey && key !== '?') return;

            switch (key) {
                case 'j': this.move(1); break;
                case 'k': this.move(-1); break;
                case 'a': this.vote('up'); break;
                case 'z': this.vote('down'); break;
                case 'x': this.expandMedia(); break;
                case 'enter': this.openLink(); break;
                case 'c': this.openComments(); break;
                case 'l': this.openLink(); break;
                case 'h': this.hidePost(); break;
                case 'r': this.replyToThing(); break;
                case '?': this.showHelp(); e.preventDefault(); break;
                case '.': this.showCommandLine(); e.preventDefault(); break;
                default: return;
            }
        },

        move(direction) {
            this.updateThings();
            if (this.things.length === 0) return;

            // Remove highlight from current
            if (this.currentIndex >= 0 && this.things[this.currentIndex]) {
                this.things[this.currentIndex].classList.remove('rel-selected-thing');
            }

            this.currentIndex = Math.max(0, Math.min(this.things.length - 1, this.currentIndex + direction));
            const thing = this.things[this.currentIndex];
            if (thing) {
                thing.classList.add('rel-selected-thing');
                thing.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },

        vote(direction) {
            if (this.currentIndex < 0) return;
            const thing = this.things[this.currentIndex];
            if (!thing) return;
            const arrow = thing.querySelector(direction === 'up' ? '.arrow.up, .arrow.upmod' : '.arrow.down, .arrow.downmod');
            if (arrow) arrow.click();
            if (settings.autoHideAfterVote && thing.classList.contains('link')) {
                setTimeout(() => {
                    thing.style.opacity = '0.3';
                    thing.style.maxHeight = '40px';
                    thing.style.overflow = 'hidden';
                    thing.style.transition = 'all 0.3s';
                }, 300);
            }
        },

        expandMedia() {
            if (this.currentIndex < 0) return;
            const thing = this.things[this.currentIndex];
            if (!thing) return;
            const expandBtn = thing.querySelector('.expando-button, .rel-button');
            if (expandBtn) expandBtn.click();
        },

        openLink() {
            if (this.currentIndex < 0) return;
            const thing = this.things[this.currentIndex];
            if (!thing) return;
            const link = thing.querySelector('a.title') || thing.querySelector('.entry a');
            if (link) window.open(link.href, '_blank');
        },

        openComments() {
            if (this.currentIndex < 0) return;
            const thing = this.things[this.currentIndex];
            if (!thing) return;
            const comments = thing.querySelector('.comments, a[href*="/comments/"]');
            if (comments) window.open(comments.href, '_blank');
        },

        hidePost() {
            if (this.currentIndex < 0) return;
            const thing = this.things[this.currentIndex];
            if (!thing) return;
            const hideBtn = thing.querySelector('.hide-button a, form.hide-button .option');
            if (hideBtn) hideBtn.click();
        },

        replyToThing() {
            if (this.currentIndex < 0) return;
            const thing = this.things[this.currentIndex];
            if (!thing) return;
            const replyBtn = thing.querySelector('.flat-list a[onclick*="reply"]') ||
                             thing.querySelector('a.comments');
            if (replyBtn) replyBtn.click();
        },

        showHelp() {
            const existing = document.querySelector('.rel-kb-help-overlay');
            if (existing) { ModalA11yModule.current?.cleanup?.(); existing.remove(); return; }

            let closeOverlay = () => {};
            const overlay = Utils.createElement('div', {
                className: 'rel-kb-help-overlay rel-settings-overlay',
                onClick: (e) => { if (e.target === overlay) closeOverlay(); }
            });

            const t = Themes.getTheme();
            const panel = Utils.createElement('div', {
                className: 'rel-settings-panel',
                style: { maxWidth: '500px', padding: '20px' }
            });

            panel.innerHTML = `
                <h2 style="margin:0 0 16px;border-bottom:1px solid ${t.border};padding-bottom:10px;">Keyboard Shortcuts</h2>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:13px;">
                    <div><kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">j</kbd> / <kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">k</kbd> - Next / Previous</div>
                    <div><kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">a</kbd> / <kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">z</kbd> - Upvote / Downvote</div>
                    <div><kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">x</kbd> - Expand media</div>
                    <div><kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">Enter</kbd> / <kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">l</kbd> - Open link</div>
                    <div><kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">c</kbd> - Open comments</div>
                    <div><kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">h</kbd> - Hide post</div>
                    <div><kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">r</kbd> - Reply</div>
                    <div><kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">Shift</kbd>+<kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">C</kbd> - Hide/show all child comments</div>
                    <div><kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">.</kbd> - Command line</div>
                    <div><kbd style="background:${t.surface};padding:2px 6px;border-radius:3px;">?</kbd> - This help</div>
                </div>
                <p style="margin:12px 0 0;font-size:11px;opacity:0.5;">Press Escape or click outside to close</p>
            `;
            overlay.appendChild(panel);
            let cleanupModal;
            closeOverlay = () => { cleanupModal?.(); overlay.remove(); };
            cleanupModal = ModalA11yModule.attach(overlay, panel, closeOverlay);
            document.body.appendChild(overlay);
        },

        showCommandLine() {
            const existing = document.querySelector('.rel-command-line');
            if (existing) { ModalA11yModule.current?.cleanup?.(); existing.remove(); return; }

            let closeCommand = () => {};
            const t = Themes.getTheme();
            const cl = Utils.createElement('div', {
                className: 'rel-command-line',
                style: {
                    position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
                    zIndex: '1000000', width: '500px', maxWidth: '90vw'
                }
            });
            const input = Utils.createElement('input', {
                type: 'text', className: 'rel-input',
                placeholder: '/r/subreddit, /u/user, or search...',
                style: {
                    width: '100%', fontSize: '16px', padding: '12px 16px',
                    borderRadius: '8px', boxShadow: `0 4px 20px ${t.shadow}`,
                    background: settings.darkMode ? t.bgLight : '#fff',
                    color: settings.darkMode ? t.fg : '#333',
                    border: `2px solid ${t.accent}`
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { closeCommand(); return; }
                if (e.key !== 'Enter') return;
                const val = input.value.trim();
                if (!val) return;
                if (val.startsWith('/r/')) {
                    window.location.href = `https://old.reddit.com${val}`;
                } else if (val.startsWith('/u/') || val.startsWith('u/')) {
                    window.location.href = `https://old.reddit.com/${val.startsWith('/') ? val : '/' + val}`;
                } else {
                    window.location.href = `https://old.reddit.com/search?q=${encodeURIComponent(val)}`;
                }
            });

            cl.appendChild(input);
            let cleanupModal;
            const outsideHandler = event => { if (!cl.contains(event.target)) closeCommand(); };
            closeCommand = () => { cleanupModal?.(); cl.remove(); document.removeEventListener('click', outsideHandler); };
            cleanupModal = ModalA11yModule.attach(cl, cl, closeCommand);
            document.body.appendChild(cl);
            setTimeout(() => input.focus(), 50);
            document.addEventListener('click', outsideHandler);
        }
    };

    // =========================================================================
    // FILTER MODULE
    // =========================================================================
    const FilterModule = {
        regexSaveTimer: null,

        init() {
            if (!settings.postFiltering) return;
            this.process(document);
        },

        process(container) {
            if (!settings.postFiltering) return;
            const things = container.querySelectorAll('.thing.link:not([data-rel-filtered])');
            if (things.length === 0) return;

            let hiddenCount = 0;
            things.forEach(thing => {
                thing.setAttribute('data-rel-filtered', '1');
                const data = Utils.getThingData(thing);
                if (!data) return;

                if (this.shouldFilter(data)) {
                    hiddenCount++;
                    // SAFETY: If we would hide ALL posts, something is wrong - abort
                    if (hiddenCount >= things.length) {
                        console.warn('REL FilterModule: Would hide ALL posts - aborting filter. Check your filter settings.');
                        container.querySelectorAll('.thing.link[data-rel-hidden]').forEach(t => {
                            t.style.display = '';
                            t.removeAttribute('data-rel-hidden');
                        });
                        return;
                    }
                    thing.style.display = 'none';
                    thing.setAttribute('data-rel-hidden', '1');
                }
            });

            // Also filter by ignored users
            if (ignoredUsers.length > 0) {
                const allThings = container.querySelectorAll('.thing:not([data-rel-ignore-checked])');
                allThings.forEach(thing => {
                    thing.setAttribute('data-rel-ignore-checked', '1');
                    const author = thing.getAttribute('data-author') || thing.querySelector('.author')?.textContent;
                    if (author && ignoredUsers.includes(author)) {
                        thing.classList.add('rel-ignored-user');
                    }
                });
            }
            if (hiddenCount > 0 && hiddenCount < things.length) AnalyticsModule.increment('postsFiltered', hiddenCount);
        },

        refresh() {
            document.querySelectorAll('.thing.link[data-rel-filtered]').forEach(thing => {
                thing.removeAttribute('data-rel-filtered');
                thing.removeAttribute('data-rel-hidden');
                thing.style.display = '';
            });
            this.process(document);
        },

        shouldFilter(data) {
            const activeFilters = this.getEffectiveFilters(data.subreddit);
            if (activeFilters.enabled === false) return false;

            const title = data.url ? document.querySelector(`[data-fullname="${data.id}"] a.title`)?.textContent || '' : '';
            let namedRegexMatched = false;
            for (const rule of (activeFilters.regexGroups || [])) {
                if (!rule.enabled || !rule.pattern) continue;
                if (this.testRegexRule(rule, title)) {
                    rule.hits = Number(rule.hits || 0) + 1;
                    namedRegexMatched = true;
                }
            }
            if (namedRegexMatched) {
                this.scheduleRegexSave();
                return true;
            }

            if (settings.lowEffortHeuristic && this.isLowEffortTitle(title, settings.lowEffortThreshold)) return true;

            // NSFW filter
            if (activeFilters.hideNSFW && data.isNSFW) return true;

            // Keyword filter
            for (const kw of (activeFilters.keywords || [])) {
                if (kw.startsWith('/') && kw.endsWith('/')) {
                    try {
                        const regex = new RegExp(kw.slice(1, -1), 'i');
                        if (regex.test(title)) return true;
                    } catch (e) {}
                } else {
                    if (title.toLowerCase().includes(kw.toLowerCase())) return true;
                }
            }

            // Domain filter
            if (data.domain) {
                for (const d of (activeFilters.domains || [])) {
                    if (data.domain.includes(d)) return true;
                }
            }

            // Subreddit filter
            if (data.subreddit) {
                for (const sr of (activeFilters.subreddits || [])) {
                    if (data.subreddit.toLowerCase() === sr.toLowerCase()) return true;
                }
            }

            // Flair filter
            if (data.flair) {
                for (const f of (activeFilters.flairs || [])) {
                    if (data.flair.toLowerCase().includes(f.toLowerCase())) return true;
                }
            }

            // User filter
            if (data.author) {
                for (const u of (activeFilters.users || [])) {
                    if (data.author.toLowerCase() === u.toLowerCase()) return true;
                }
            }

            return false;
        },

        mergeSubredditFilters(base, override) {
            if (!override || typeof override !== 'object') return { ...base };
            if (override.enabled === false) return { ...base, enabled: false };
            const fields = ['keywords', 'domains', 'subreddits', 'flairs', 'users'];
            const merged = { ...base };
            fields.forEach(field => {
                const local = Array.isArray(override[field]) ? override[field] : [];
                merged[field] = override.mode === 'replace'
                    ? [...local]
                    : [...new Set([...(Array.isArray(base[field]) ? base[field] : []), ...local])];
            });
            const localRegex = Array.isArray(override.regexGroups) ? override.regexGroups : [];
            merged.regexGroups = override.mode === 'replace'
                ? [...localRegex]
                : [...(Array.isArray(base.regexGroups) ? base.regexGroups : []), ...localRegex];
            if ([true, false].includes(override.hideNSFW)) merged.hideNSFW = override.hideNSFW;
            return merged;
        },

        testRegexRule(rule, text) {
            try {
                const regex = new RegExp(rule.pattern, rule.flags || 'i');
                regex.lastIndex = 0;
                const matched = regex.test(text);
                regex.lastIndex = 0;
                return matched;
            } catch {
                return false;
            }
        },

        scoreLowEffortTitle(title) {
            const value = String(title || '').trim();
            if (!value) return { score: 0, reasons: [] };
            const letters = value.match(/[A-Za-z]/g) || [];
            const uppercase = value.match(/[A-Z]/g) || [];
            const emoji = [...value].filter(character => /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(character));
            const reasons = [];
            if (Array.from(value).length <= 20) reasons.push('short');
            if (letters.length >= 4 && uppercase.length / letters.length >= 0.75) reasons.push('uppercase');
            if (emoji.length >= 2 && emoji.length / Math.max(1, Array.from(value).length) >= 0.12) reasons.push('emoji');
            return { score: reasons.length, reasons };
        },

        isLowEffortTitle(title, threshold = 2) {
            const score = this.scoreLowEffortTitle(title).score;
            return score >= Math.max(1, Math.min(3, Number(threshold) || 2));
        },

        scheduleRegexSave() {
            clearTimeout(this.regexSaveTimer);
            this.regexSaveTimer = setTimeout(() => {
                saveFilters();
                this.regexSaveTimer = null;
            }, 750);
        },

        getEffectiveFilters(subreddit) {
            const name = String(subreddit || '').replace(/^\/r\//i, '').toLowerCase();
            const override = name ? filters.subredditOverrides?.[name] : null;
            return this.mergeSubredditFilters(filters, override);
        }
    };

    // =========================================================================
    // HIDE AUTOMODERATOR MODULE
    // =========================================================================
    const HideAutoModeratorModule = {
        // Common bot/automod patterns
        botPatterns: [
            'automoderator', 'botdefense', 'assistantbot', 'remindmebot',
            'sneakpeekbot', 'wikisummarizerbot', 'fatfingerhelperbot',
            'repostsleuthbot', 'savevideo', 'haikibot', 'sub_doesnt_exist_bot'
        ],

        isBot(name) {
            if (!name) return false;
            const lower = name.toLowerCase();
            // Exact match against known bots
            if (this.botPatterns.includes(lower)) return true;
            // Suffix match for subreddit mod-bots (e.g. ClaudeAI-mod-bot)
            if (lower.endsWith('-mod-bot') || lower.endsWith('_mod_bot') || lower.endsWith('modbot')) return true;
            return false;
        },

        init() {
            if (!settings.hideAutoModerator) return;
            this.injectCSS();
            this.process(document);
        },

        injectCSS() {
            const t = Themes.getTheme();
            GM_addStyle(`
                .rel-automod-hidden > .entry > .usertext-body,
                .rel-automod-hidden > .entry > form > .usertext-body,
                .rel-automod-hidden > .child,
                .rel-automod-hidden > .entry > .flat-list {
                    display: none !important;
                }
                .rel-automod-label {
                    display: none;
                    font-size: 11px;
                    color: ${t.fgDim};
                    margin-left: 6px;
                    cursor: pointer;
                    font-style: italic;
                    opacity: 0.7;
                }
                .rel-automod-label:hover {
                    opacity: 1;
                    color: ${t.accent};
                    text-decoration: underline;
                }
                .rel-automod-hidden > .entry > .tagline .rel-automod-label {
                    display: inline !important;
                }
                .rel-automod-hidden > .entry {
                    opacity: 0.5 !important;
                    padding: 4px 10px !important;
                }
                .rel-automod-hidden > .entry:hover {
                    opacity: 0.8 !important;
                }
                .rel-automod-hidden > .midcol {
                    display: none !important;
                }
            `);
        },

        process(container) {
            if (!settings.hideAutoModerator) return;
            const comments = container.querySelectorAll('.comment:not([data-rel-automod])');
            comments.forEach(comment => {
                comment.setAttribute('data-rel-automod', '1');
                const authorName = comment.getAttribute('data-author') ||
                    comment.querySelector('.author')?.textContent;

                if (!this.isBot(authorName)) return;

                // Hide via our own class (no jQuery dependency)
                comment.classList.add('rel-automod-hidden');

                // Add toggle label to tagline
                const tagline = comment.querySelector('.tagline');
                if (tagline && !tagline.querySelector('.rel-automod-label')) {
                    const label = document.createElement('span');
                    label.className = 'rel-automod-label';
                    label.textContent = '[bot comment hidden - click to show]';
                    label.addEventListener('click', (e) => {
                        e.stopPropagation();
                        comment.classList.toggle('rel-automod-hidden');
                        label.textContent = comment.classList.contains('rel-automod-hidden')
                            ? '[bot comment hidden - click to show]'
                            : '[click to hide]';
                    });
                    tagline.appendChild(label);
                }
            });
        }
    };

    // =========================================================================
    // IGNORED USERS MODULE
    // =========================================================================
    const IgnoredUsersModule = {
        init() {
            if (!ignoredUsers.length) return;
            this.process(document);
        },

        process(container) {
            if (!ignoredUsers.length) return;
            const comments = container.querySelectorAll('.comment:not([data-rel-ignored])');
            const t = Themes.getTheme();
            comments.forEach(comment => {
                comment.setAttribute('data-rel-ignored', '1');
                const authorName = (comment.getAttribute('data-author') ||
                    comment.querySelector('.author')?.textContent || '').toLowerCase();
                if (!authorName || !ignoredUsers.some(u => u.toLowerCase() === authorName)) return;

                comment.classList.add('rel-ignored-user');
                const entry = comment.querySelector(':scope > .entry');
                const child = comment.querySelector(':scope > .child');
                if (entry) {
                    // Hide comment body and children
                    const body = entry.querySelector('.usertext-body') || entry.querySelector('form > .usertext-body');
                    if (body) body.style.display = 'none';
                    if (child) child.style.display = 'none';
                    const buttons = entry.querySelector('.flat-list.buttons');
                    if (buttons) buttons.style.display = 'none';
                    entry.style.opacity = '0.4';
                    entry.style.padding = '4px 10px';

                    const tagline = entry.querySelector('.tagline');
                    if (tagline && !tagline.querySelector('.rel-ignored-label')) {
                        const label = document.createElement('span');
                        label.className = 'rel-ignored-label';
                        label.textContent = '[ignored user - click to show]';
                        label.style.cssText = `font-size:11px;color:${t.fgDim};margin-left:6px;cursor:pointer;font-style:italic;opacity:0.7;`;
                        label.addEventListener('mouseenter', () => { label.style.opacity = '1'; label.style.color = t.accent; });
                        label.addEventListener('mouseleave', () => { label.style.opacity = '0.7'; label.style.color = t.fgDim; });
                        label.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const isHidden = comment.classList.contains('rel-ignored-user');
                            comment.classList.toggle('rel-ignored-user');
                            if (isHidden) {
                                if (body) body.style.display = '';
                                if (child) child.style.display = '';
                                if (buttons) buttons.style.display = '';
                                entry.style.opacity = '';
                                entry.style.padding = '';
                                label.textContent = '[click to hide]';
                            } else {
                                if (body) body.style.display = 'none';
                                if (child) child.style.display = 'none';
                                if (buttons) buttons.style.display = 'none';
                                entry.style.opacity = '0.4';
                                entry.style.padding = '4px 10px';
                                label.textContent = '[ignored user - click to show]';
                            }
                        });
                        tagline.appendChild(label);
                    }
                }
            });
        }
    };

    // =========================================================================
    // YOUTUBE EMBED MODULE
    // =========================================================================
    const YouTubeEmbedModule = {
        init() {
            if (!settings.embedYouTube) return;
            this.process(document);
        },

        process(container) {
            if (!settings.embedYouTube) return;
            const links = container.querySelectorAll('.md a[href*="youtube.com"], .md a[href*="youtu.be"]');
            links.forEach(link => {
                if (link.getAttribute('data-rel-yt')) return;
                link.setAttribute('data-rel-yt', '1');

                const videoId = this.extractVideoId(link.href);
                if (!videoId) return;

                const btn = Utils.createElement('span', {
                    className: 'rel-button',
                    textContent: '[\u25B6 YT]',
                    style: { marginLeft: '4px', fontSize: '10px' },
                    onClick: (e) => {
                        e.preventDefault();
                        const existing = link.parentNode.querySelector('.rel-yt-embed');
                        if (existing) { existing.remove(); btn.textContent = '[\u25B6 YT]'; return; }
                        const iframe = Utils.createElement('div', {
                            className: 'rel-yt-embed',
                            innerHTML: `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allowfullscreen style="max-width:100%;border-radius:6px;margin:6px 0;"></iframe>`
                        });
                        link.parentNode.insertBefore(iframe, link.nextSibling);
                        btn.textContent = '[\u25BC YT]';
                    }
                });
                link.parentNode.insertBefore(btn, link.nextSibling);
            });
        },

        extractVideoId(url) {
            const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            return m ? m[1] : null;
        }
    };

    // =========================================================================
    // REDDIT POST PREVIEW MODULE
    // =========================================================================
    const RedditPreviewModule = {
        cache: {},

        init() {
            if (!settings.embedRedditPreviews) return;
            this.process(document);
        },

        process(container) {
            if (!settings.embedRedditPreviews) return;
            const links = container.querySelectorAll('.md a[href*="reddit.com/r/"]:not([data-rel-preview])');
            links.forEach(link => {
                link.setAttribute('data-rel-preview', '1');
                // Only match post links
                if (!/\/comments\/\w+/.test(link.href) && !/\/r\/\w+\/s\//.test(link.href)) return;
                if (link.href === window.location.href) return;

                const btn = Utils.createElement('span', {
                    className: 'rel-button',
                    textContent: '[\u25B6 Preview]',
                    style: { marginLeft: '4px', fontSize: '10px' },
                    onClick: (e) => {
                        e.preventDefault();
                        const existing = link.parentNode.querySelector('.rel-reddit-preview');
                        if (existing) { existing.remove(); btn.textContent = '[\u25B6 Preview]'; return; }
                        this.loadPreview(link, btn);
                    }
                });
                link.parentNode.insertBefore(btn, link.nextSibling);
            });
        },

        async loadPreview(link, btn) {
            const t = Themes.getTheme();
            const url = link.href.split('?')[0];
            const jsonUrl = url.endsWith('/') ? url + '.json' : url + '/.json';

            try {
                const cacheKey = jsonUrl;
                let data = this.cache[cacheKey];
                if (!data) {
                    const resp = await fetch(jsonUrl, { headers: { 'Accept': 'application/json' } });
                    data = await resp.json();
                    this.cache[cacheKey] = data;
                }

                const post = data[0]?.data?.children?.[0]?.data;
                if (!post) return;

                const preview = Utils.createElement('div', {
                    className: 'rel-reddit-preview',
                    style: {
                        margin: '6px 0', padding: '10px', borderRadius: '6px',
                        border: `1px solid ${settings.darkMode ? t.border : '#ddd'}`,
                        background: settings.darkMode ? t.bgLight : '#f9f9f9',
                        fontSize: '12px', maxWidth: '600px'
                    }
                });

                preview.innerHTML = `
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <strong style="color:${settings.darkMode ? t.fg : '#333'}">${Utils.escapeHTML(post.title)}</strong>
                        <span style="color:${settings.darkMode ? t.fgDim : '#888'}">\u2B06 ${Utils.formatNumber(post.score)}</span>
                    </div>
                    <div style="color:${settings.darkMode ? t.fgDim : '#666'};font-size:11px;">
                        r/${Utils.escapeHTML(post.subreddit)} \u00B7 u/${Utils.escapeHTML(post.author)} \u00B7 ${post.num_comments} comments
                    </div>
                    ${post.selftext ? `<div style="margin-top:6px;color:${settings.darkMode ? t.fgMuted : '#444'};max-height:100px;overflow:hidden;">${Utils.escapeHTML(post.selftext.substring(0, 300))}${post.selftext.length > 300 ? '...' : ''}</div>` : ''}
                `;

                link.parentNode.insertBefore(preview, link.nextSibling.nextSibling || link.nextSibling);
                btn.textContent = '[\u25BC Preview]';
            } catch (e) {
                btn.textContent = '[Preview failed]';
            }
        }
    };

    // =========================================================================
    // INLINE IMAGE FIX MODULE
    // =========================================================================
    const InlineImageFixModule = {
        imagePatterns: [
            /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i,
            /i\.redd\.it\//i,
            /i\.imgur\.com\//i,
            /preview\.redd\.it\//i
        ],

        init() {
            if (!settings.inlineImageFix) return;
            this.process(document);
        },

        process(container) {
            if (!settings.inlineImageFix) return;
            const links = container.querySelectorAll('.md a:not([data-rel-imgfix])');
            links.forEach(link => {
                link.setAttribute('data-rel-imgfix', '1');
                const href = link.href;
                const isImage = this.imagePatterns.some(p => p.test(href));
                if (!isImage) return;

                // Check if link text is just a URL or image placeholder
                const text = link.textContent.trim();
                const isPlaceholder = /^(<?\s*)?(https?:\/\/|image|img|\[img\]|photo|pic)/i.test(text) || text === href;
                if (!isPlaceholder && !text.match(/\.(jpg|png|gif|webp)/i)) return;

                const container = Utils.createElement('div', {
                    style: { margin: '6px 0', display: 'inline-block' }
                });
                const img = Utils.createElement('img', {
                    src: href,
                    style: { maxWidth: '100%', maxHeight: '400px', borderRadius: '4px', cursor: 'pointer' },
                    onClick: () => window.open(href, '_blank'),
                    loading: 'lazy'
                });
                img.addEventListener('error', () => {
                    container.innerHTML = `<a href="${Utils.escapeHTML(href)}" target="_blank">${Utils.escapeHTML(text)}</a>`;
                });
                container.appendChild(img);
                link.parentNode.insertBefore(container, link.nextSibling);
                link.style.display = 'none';
            });
        }
    };

    // =========================================================================
    // SOCIAL MEDIA PREVIEW MODULE
    // =========================================================================
    const SocialMediaPreviewModule = {
        platforms: {
            twitter: { pattern: /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/, label: 'Tweet' },
        },

        requestJSON(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    headers: { Accept: 'application/json' },
                    timeout: 15000,
                    onload: (response) => {
                        if (response.status < 200 || response.status >= 300) {
                            reject(new Error(`Request failed with status ${response.status}`));
                            return;
                        }
                        try { resolve(JSON.parse(response.responseText)); }
                        catch (error) { reject(error); }
                    },
                    onerror: () => reject(new Error('Network request failed')),
                    ontimeout: () => reject(new Error('Network request timed out'))
                });
            });
        },

        extractTweetId(url) {
            const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
            return match ? match[1] : null;
        },

        selectTweetMedia(data) {
            const media = [];
            const add = (item, type = item?.type) => {
                if (!item) return;
                const url = item.media_url_https || item.media_url || item.url;
                if (!url || !/^https?:\/\//i.test(url)) return;
                if (!media.some(entry => entry.url === url)) {
                    media.push({
                        url,
                        type: type || 'photo',
                        width: Number(item.original_info?.width || item.width || 0),
                        height: Number(item.original_info?.height || item.height || 0),
                        poster: item.media_url_https || item.media_url || '',
                        variants: item.video_info?.variants || []
                    });
                }
            };

            (data?.mediaDetails || data?.media_details || []).forEach(item => add(item));
            (data?.photos || []).forEach(item => add(item, 'photo'));
            return media;
        },

        async fetchTweetPreview(id) {
            const syndication = await this.requestJSON(
                `https://cdn.syndication.twimg.com/tweet-result?id=${encodeURIComponent(id)}&lang=en`
            );
            if (syndication && typeof syndication === 'object' && Object.keys(syndication).length > 0) {
                return { kind: 'syndication', data: syndication };
            }

            const oembed = await this.requestJSON(
                `https://publish.twitter.com/oembed?url=${encodeURIComponent(`https://x.com/i/status/${id}`)}&omit_script=1`
            );
            if (oembed?.html) return { kind: 'oembed', data: oembed };
            throw new Error('Tweet preview unavailable');
        },

        appendSyndicationPreview(preview, tweet, link) {
            const t = Themes.getTheme();
            const user = tweet.user || {};
            const header = document.createElement('div');
            header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';

            if (user.profile_image_url_https) {
                const avatar = document.createElement('img');
                avatar.src = user.profile_image_url_https;
                avatar.alt = '';
                avatar.width = 32;
                avatar.height = 32;
                avatar.style.cssText = 'width:32px;height:32px;border-radius:50%;';
                header.appendChild(avatar);
            }

            const identity = document.createElement('div');
            const name = document.createElement('strong');
            name.textContent = user.name || 'X user';
            identity.appendChild(name);
            if (user.screen_name) {
                const handle = document.createElement('span');
                handle.textContent = ` @${user.screen_name}`;
                handle.style.opacity = '0.7';
                identity.appendChild(handle);
            }
            header.appendChild(identity);
            preview.appendChild(header);

            const text = document.createElement('p');
            text.textContent = tweet.text || tweet.full_text || '';
            text.style.cssText = 'margin:0 0 8px;white-space:pre-wrap;line-height:1.45;';
            preview.appendChild(text);

            const media = this.selectTweetMedia(tweet).slice(0, 4);
            media.forEach(item => {
                if (item.type === 'video' || item.variants.some(variant => variant.content_type === 'video/mp4')) {
                    const variants = item.variants
                        .filter(variant => variant.content_type === 'video/mp4' && variant.url)
                        .sort((a, b) => Number(b.bitrate || 0) - Number(a.bitrate || 0));
                    const video = document.createElement('video');
                    video.controls = true;
                    video.preload = 'metadata';
                    video.playsInline = true;
                    video.src = variants[0]?.url || item.url;
                    video.poster = item.poster;
                    video.style.cssText = 'display:block;max-width:100%;max-height:480px;margin:6px 0;border-radius:4px;background:#000;';
                    preview.appendChild(video);
                } else {
                    const image = document.createElement('img');
                    image.src = item.url;
                    image.alt = 'Image attached to post';
                    image.loading = 'lazy';
                    image.style.cssText = 'display:block;max-width:100%;max-height:480px;margin:6px 0;border-radius:4px;';
                    preview.appendChild(image);
                }
            });

            const stats = document.createElement('div');
            stats.style.cssText = `font-size:11px;color:${t.fgMuted};margin-top:8px;`;
            const statParts = [];
            if (tweet.like_count != null) statParts.push(`${tweet.like_count} likes`);
            if (tweet.retweet_count != null) statParts.push(`${tweet.retweet_count} reposts`);
            if (tweet.reply_count != null) statParts.push(`${tweet.reply_count} replies`);
            stats.textContent = statParts.join(' \u2022 ');
            if (stats.textContent) preview.appendChild(stats);

            const open = document.createElement('a');
            open.href = link.href;
            open.target = '_blank';
            open.rel = 'noopener noreferrer';
            open.textContent = 'Open on X \u2197';
            open.style.cssText = `display:inline-block;margin-top:8px;color:${settings.darkMode ? t.accent : '#1da1f2'};`;
            preview.appendChild(open);
        },

        appendOEmbedPreview(preview, oembed, link) {
            try {
                const parsed = new DOMParser().parseFromString(oembed.html, 'text/html');
                parsed.querySelectorAll('script, iframe, object, embed').forEach(node => node.remove());
                const blockquote = parsed.body.firstElementChild;
                if (!blockquote) throw new Error('No oEmbed markup');
                preview.appendChild(document.importNode(blockquote, true));
            } catch {
                const fallback = document.createElement('a');
                fallback.href = link.href;
                fallback.target = '_blank';
                fallback.rel = 'noopener noreferrer';
                fallback.textContent = 'Open post on X \u2197';
                preview.appendChild(fallback);
            }
        },

        async renderPreview(preview, link, config) {
            const id = this.extractTweetId(link.href);
            if (!id || config.label !== 'Tweet') throw new Error('Unsupported social link');
            const result = await this.fetchTweetPreview(id);
            preview.textContent = '';
            if (result.kind === 'syndication') this.appendSyndicationPreview(preview, result.data, link);
            else this.appendOEmbedPreview(preview, result.data, link);
        },

        init() {
            if (!settings.embedSocialMedia) return;
            this.process(document);
        },

        process(container) {
            if (!settings.embedSocialMedia) return;
            const links = container.querySelectorAll('.md a:not([data-rel-social])');
            links.forEach(link => {
                link.setAttribute('data-rel-social', '1');
                for (const [platform, config] of Object.entries(this.platforms)) {
                    if (config.pattern.test(link.href)) {
                        const btn = Utils.createElement('span', {
                            className: 'rel-button',
                            textContent: `[\u25B6 ${config.label}]`,
                            style: { marginLeft: '4px', fontSize: '10px' },
                            onClick: (e) => {
                                e.preventDefault();
                            const existing = link.parentNode.querySelector('.rel-social-preview');
                            if (existing) { existing.remove(); return; }
                            const t = Themes.getTheme();
                            const preview = Utils.createElement('div', {
                                    className: 'rel-social-preview',
                                    style: {
                                        margin: '6px 0', padding: '10px', borderRadius: '6px',
                                        border: `1px solid ${settings.darkMode ? t.border : '#ddd'}`,
                                        background: settings.darkMode ? t.bgLight : '#f0f0f0',
                                        fontSize: '12px'
                                    },
                                    textContent: `Loading ${config.label}...`
                                });
                                link.parentNode.insertBefore(preview, link.nextSibling);
                                this.renderPreview(preview, link, config).catch(() => {
                                    preview.textContent = '';
                                    const fallback = document.createElement('a');
                                    fallback.href = link.href;
                                    fallback.target = '_blank';
                                    fallback.rel = 'noopener noreferrer';
                                    fallback.textContent = `Open ${config.label} in new tab \u2197`;
                                    fallback.style.color = settings.darkMode ? t.accent : '#1da1f2';
                                    preview.appendChild(fallback);
                                });
                            }
                        });
                        link.parentNode.insertBefore(btn, link.nextSibling);
                        break;
                    }
                }
            });
        }
    };

    // =========================================================================
    // COMMENT DEPTH INDICATORS MODULE
    // =========================================================================
    const CommentDepthModule = {
        colors: {
            rainbow: ['#ff5555','#ff79c6','#ffb86c','#f1fa8c','#50fa7b','#8be9fd','#bd93f9','#ff5555','#ff79c6','#ffb86c'],
            warm: ['#ff6b6b','#ee5a24','#f0932b','#ffbe76','#f9ca24','#ff6348','#eb4d4b','#e55039','#fa8231','#fed330'],
            cool: ['#70a1ff','#5352ed','#3742fa','#2ed573','#1e90ff','#7bed9f','#00d2d3','#54a0ff','#5f27cd','#01a3a4'],
            pastel: ['#ffa8a8','#fcc2d7','#eebefa','#d0bfff','#bac8ff','#a5d8ff','#99e9f2','#96f2d7','#b2f2bb','#ffec99']
        },

        init() {
            if (!settings.commentDepthIndicators) return;
            this.process(document);
        },

        process(container) {
            if (!settings.commentDepthIndicators) return;
            const comments = container.querySelectorAll('.comment:not([data-rel-depth])');
            comments.forEach(comment => {
                let depth = 0;
                let parent = comment.parentElement;
                while (parent) {
                    if (parent.classList && parent.classList.contains('comment')) depth++;
                    parent = parent.parentElement;
                }
                comment.setAttribute('data-rel-depth', depth);
                comment.classList.add('rel-depth-' + (depth % 10));

                // Apply dynamic color based on scheme
                const scheme = this.colors[settings.depthColorScheme] || this.colors.rainbow;
                const color = scheme[depth % scheme.length];
                const entry = comment.querySelector(':scope > .entry');
                if (entry) {
                    entry.style.borderLeft = `3px solid ${color}`;
                    entry.style.paddingLeft = '6px';
                }
            });
        }
    };

    // =========================================================================
    // COMMENT NAVIGATOR MODULE
    // =========================================================================
    const CommentNavigatorModule = {
        currentIndex: -1,
        mode: 'top', // 'top', 'new', 'op'
        comments: [],

        init() {
            if (!Utils.isCommentsPage()) return;
            this.buildUI();
        },

        buildUI() {
            const t = Themes.getTheme();
            const isDark = settings.darkMode && settings.theme !== 'light';

            const nav = document.createElement('div');
            nav.className = 'rel-comment-nav';
            nav.style.cssText = `position:fixed;right:10px;bottom:80px;z-index:99996;display:flex;flex-direction:column;gap:4px;opacity:0;pointer-events:none;transition:opacity 0.3s;`;

            const modes = [
                { id: 'top', label: 'Top', title: 'Navigate top-level comments' },
                { id: 'new', label: 'New', title: 'Navigate new/highlighted comments' },
                { id: 'op', label: 'OP', title: 'Navigate OP comments' }
            ];

            const modeRow = document.createElement('div');
            modeRow.style.cssText = 'display:flex;gap:2px;border-radius:6px;overflow:hidden;';
            modes.forEach(m => {
                const btn = document.createElement('button');
                btn.textContent = m.label;
                btn.title = m.title;
                btn.dataset.mode = m.id;
                btn.style.cssText = `padding:4px 8px;font-size:10px;font-weight:600;cursor:pointer;border:none;background:${m.id === this.mode ? t.accent : t.surface};color:${m.id === this.mode ? t.bg : t.fg};transition:all 0.15s;`;
                btn.addEventListener('click', () => {
                    this.mode = m.id;
                    this.currentIndex = -1;
                    this.updateComments();
                    modeRow.querySelectorAll('button').forEach(b => {
                        b.style.background = b.dataset.mode === m.id ? t.accent : t.surface;
                        b.style.color = b.dataset.mode === m.id ? t.bg : t.fg;
                    });
                    countLabel.textContent = `${this.comments.length} ${m.label.toLowerCase()}`;
                });
                modeRow.appendChild(btn);
            });
            nav.appendChild(modeRow);

            const countLabel = document.createElement('div');
            countLabel.style.cssText = `font-size:10px;text-align:center;color:${t.fgDim};padding:2px;`;
            nav.appendChild(countLabel);

            const btnRow = document.createElement('div');
            btnRow.style.cssText = 'display:flex;gap:4px;';

            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = '\u25B2';
            prevBtn.title = 'Previous comment';
            prevBtn.style.cssText = `flex:1;padding:6px;border-radius:6px;cursor:pointer;border:1px solid ${t.border};background:${t.surface};color:${t.fg};font-size:12px;`;
            prevBtn.addEventListener('click', () => this.navigate(-1, countLabel));

            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = '\u25BC';
            nextBtn.title = 'Next comment';
            nextBtn.style.cssText = prevBtn.style.cssText;
            nextBtn.addEventListener('click', () => this.navigate(1, countLabel));

            btnRow.appendChild(prevBtn);
            btnRow.appendChild(nextBtn);
            nav.appendChild(btnRow);

            document.body.appendChild(nav);

            // Show/hide based on scroll
            let visible = false;
            window.addEventListener('scroll', Utils.throttle(() => {
                const shouldShow = window.scrollY > 300;
                if (shouldShow !== visible) {
                    nav.style.opacity = shouldShow ? '1' : '0';
                    nav.style.pointerEvents = shouldShow ? 'auto' : 'none';
                    visible = shouldShow;
                }
            }, 200));

            this.updateComments();
            countLabel.textContent = `${this.comments.length} top`;
        },

        updateComments() {
            switch (this.mode) {
                case 'top':
                    this.comments = Array.from(document.querySelectorAll('.commentarea > .sitetable.nestedlisting > .comment'));
                    break;
                case 'new':
                    this.comments = Array.from(document.querySelectorAll('.comment[style*="border-left: 3px"]'));
                    break;
                case 'op':
                    this.comments = Array.from(document.querySelectorAll('.comment:has(.author.submitter)'));
                    break;
            }
        },

        navigate(direction, label) {
            this.updateComments();
            if (this.comments.length === 0) return;
            this.currentIndex = Math.max(0, Math.min(this.comments.length - 1, this.currentIndex + direction));
            const comment = this.comments[this.currentIndex];
            if (comment) {
                comment.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Brief highlight flash
                const entry = comment.querySelector(':scope > .entry');
                if (entry) {
                    const t = Themes.getTheme();
                    entry.style.outline = `2px solid ${t.accent}`;
                    setTimeout(() => { entry.style.outline = ''; }, 1500);
                }
            }
            if (label) label.textContent = `${this.currentIndex + 1}/${this.comments.length}`;
        }
    };

    // =========================================================================
    // COMMENT SEARCH MODULE
    // =========================================================================
    const CommentSearchModule = {
        init() {
            if (!Utils.isCommentsPage()) return;
            this.addSearchButton();
        },

        addSearchButton() {
            const menuarea = document.querySelector('.commentarea .menuarea');
            if (!menuarea) return;
            const t = Themes.getTheme();
            const btn = document.createElement('span');
            btn.className = 'rel-comment-search-btn';
            btn.textContent = '\uD83D\uDD0D Search Comments';
            btn.title = 'Search within comments';
            btn.style.cssText = `cursor:pointer;font-size:12px;color:${t.accent};margin-left:10px;font-weight:500;`;
            btn.addEventListener('click', () => this.showSearchBar());
            menuarea.appendChild(btn);
        },

        showSearchBar() {
            let existing = document.querySelector('.rel-comment-search-bar');
            if (existing) { existing.remove(); return; }

            const t = Themes.getTheme();
            const bar = document.createElement('div');
            bar.className = 'rel-comment-search-bar';
            bar.style.cssText = `position:sticky;top:0;z-index:99998;padding:8px 14px;display:flex;align-items:center;gap:8px;background:${t.bgLight};border-bottom:1px solid ${t.border};box-shadow:0 2px 8px ${t.shadow};`;

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Search comments...';
            input.style.cssText = `flex:1;padding:6px 10px;border-radius:6px;border:1px solid ${t.border};background:${t.inputBg};color:${t.inputFg};font-size:13px;font-family:inherit;`;

            const countSpan = document.createElement('span');
            countSpan.style.cssText = `font-size:12px;color:${t.fgDim};white-space:nowrap;min-width:60px;`;

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '\u2715';
            closeBtn.style.cssText = `background:none;border:none;color:${t.fgDim};font-size:16px;cursor:pointer;padding:4px;`;
            closeBtn.addEventListener('click', () => { this.clearHighlights(); bar.remove(); });

            bar.appendChild(input);
            bar.appendChild(countSpan);
            bar.appendChild(closeBtn);

            const commentarea = document.querySelector('.commentarea');
            if (commentarea) commentarea.insertBefore(bar, commentarea.firstChild);

            input.focus();
            let currentMatch = -1;
            let matches = [];

            const doSearch = () => {
                this.clearHighlights();
                const query = input.value.trim().toLowerCase();
                if (!query || query.length < 2) { countSpan.textContent = ''; matches = []; return; }

                matches = [];
                document.querySelectorAll('.comment .md').forEach(md => {
                    if (md.textContent.toLowerCase().includes(query)) {
                        matches.push(md);
                        md.classList.add('rel-search-match');
                        md.style.outline = `2px solid ${t.accent}`;
                        md.style.outlineOffset = '2px';
                        md.style.borderRadius = '4px';
                        // Ensure parent comments are uncollapsed
                        let parent = md.closest('.comment');
                        while (parent) {
                            if (parent.classList.contains('collapsed')) {
                                parent.classList.remove('collapsed');
                                parent.classList.add('noncollapsed');
                            }
                            const childDiv = parent.closest('.child');
                            if (childDiv && childDiv.style.display === 'none') childDiv.style.display = '';
                            parent = childDiv?.closest('.comment');
                        }
                    }
                });
                countSpan.textContent = matches.length ? `${matches.length} found` : 'No results';
                currentMatch = -1;
            };

            input.addEventListener('input', Utils.debounce(doSearch, 250));
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { this.clearHighlights(); bar.remove(); return; }
                if (e.key === 'Enter' && matches.length > 0) {
                    currentMatch = (currentMatch + 1) % matches.length;
                    matches[currentMatch].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    countSpan.textContent = `${currentMatch + 1}/${matches.length}`;
                }
            });
        },

        clearHighlights() {
            document.querySelectorAll('.rel-search-match').forEach(el => {
                el.classList.remove('rel-search-match');
                el.style.outline = '';
                el.style.outlineOffset = '';
            });
        }
    };

    // =========================================================================
    // FORMATTING TOOLBAR MODULE
    // =========================================================================
    const FormattingToolbarModule = {
        init() {
            if (!settings.formattingToolbar) return;
            this.process(document);
        },

        process(container) {
            if (!settings.formattingToolbar) return;
            const textareas = container.querySelectorAll('.usertext-edit textarea:not([data-rel-toolbar])');
            textareas.forEach(ta => {
                ta.setAttribute('data-rel-toolbar', '1');
                const edit = ta.closest('.usertext-edit');
                if (!edit) return;

                const toolbar = Utils.createElement('div', { className: 'rel-format-bar' });

                const buttons = [
                    { label: 'B', title: 'Bold (Ctrl+B)', wrap: ['**', '**'] },
                    { label: 'I', title: 'Italic (Ctrl+I)', wrap: ['*', '*'] },
                    { label: '~~', title: 'Strikethrough', wrap: ['~~', '~~'] },
                    { label: 'sup', title: 'Superscript', wrap: ['^(', ')'] },
                    { type: 'sep' },
                    { label: '\u{1F517}', title: 'Link', action: 'link' },
                    { label: '""', title: 'Quote', action: 'quote' },
                    { label: '<>', title: 'Code', wrap: ['`', '`'] },
                    { label: '{}', title: 'Code Block', action: 'codeblock' },
                    { type: 'sep' },
                    { label: '\u2022', title: 'Bullet List', action: 'bullet' },
                    { label: '1.', title: 'Numbered List', action: 'number' },
                    { label: 'H', title: 'Heading', wrap: ['\n## ', '\n'] },
                    { label: '\u2014', title: 'Horizontal Rule', action: 'hr' },
                    { type: 'sep' },
                    { label: '\u2318', title: 'Macros', action: 'macros' },
                    { label: '\u{1F441}', title: 'Toggle Preview', action: 'preview' }
                ];

                buttons.forEach(b => {
                    if (b.type === 'sep') {
                        toolbar.appendChild(Utils.createElement('div', { className: 'rel-format-sep' }));
                        return;
                    }
                    const btn = Utils.createElement('button', {
                        className: 'rel-format-btn',
                        textContent: b.label,
                        title: b.title,
                        type: 'button',
                        onClick: (e) => {
                            e.preventDefault();
                            if (b.wrap) this.wrapSelection(ta, b.wrap[0], b.wrap[1]);
                            else if (b.action) this.doAction(ta, b.action, e);
                        }
                    });
                    toolbar.appendChild(btn);
                });

                try { ta.before(toolbar); } catch(e) { edit.prepend(toolbar); }

                // Live preview
                if (settings.livePreview) {
                    const preview = Utils.createElement('div', { className: 'rel-live-preview' });
                    edit.appendChild(preview);
                    ta.addEventListener('input', Utils.debounce(() => {
                        if (preview.classList.contains('active')) {
                            preview.innerHTML = this.renderMarkdown(ta.value);
                        }
                    }, 300));
                }

                // Ctrl+B, Ctrl+I shortcuts
                ta.addEventListener('keydown', (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        if (e.key === 'b') { e.preventDefault(); this.wrapSelection(ta, '**', '**'); }
                        if (e.key === 'i') { e.preventDefault(); this.wrapSelection(ta, '*', '*'); }
                    }
                });
            });
        },

        wrapSelection(ta, before, after) {
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const selected = ta.value.substring(start, end) || 'text';
            const newText = before + selected + after;
            ta.setRangeText(newText, start, end, 'select');
            ta.focus();
            ta.dispatchEvent(new Event('input'));
        },

        doAction(ta, action, event) {
            switch (action) {
                case 'link': {
                    const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd) || 'link text';
                    this.wrapSelection(ta, '[', `](https://)`);
                    break;
                }
                case 'quote':
                    this.wrapSelection(ta, '\n> ', '\n');
                    break;
                case 'codeblock':
                    this.wrapSelection(ta, '\n    ', '\n');
                    break;
                case 'bullet': {
                    const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd);
                    const lines = selected ? selected.split('\n').map(l => '* ' + l).join('\n') : '* item';
                    ta.setRangeText('\n' + lines + '\n', ta.selectionStart, ta.selectionEnd, 'end');
                    ta.dispatchEvent(new Event('input'));
                    break;
                }
                case 'number': {
                    const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd);
                    const lines = selected ? selected.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n') : '1. item';
                    ta.setRangeText('\n' + lines + '\n', ta.selectionStart, ta.selectionEnd, 'end');
                    ta.dispatchEvent(new Event('input'));
                    break;
                }
                case 'hr':
                    ta.setRangeText('\n\n---\n\n', ta.selectionStart, ta.selectionEnd, 'end');
                    ta.dispatchEvent(new Event('input'));
                    break;
                case 'macros':
                    this.showMacroMenu(ta, event);
                    break;
                case 'preview': {
                    const preview = ta.closest('.usertext-edit').querySelector('.rel-live-preview');
                    if (preview) {
                        preview.classList.toggle('active');
                        if (preview.classList.contains('active')) {
                            preview.innerHTML = this.renderMarkdown(ta.value);
                        }
                    }
                    break;
                }
            }
        },

        showMacroMenu(ta, event) {
            document.querySelectorAll('.rel-macro-menu').forEach(m => m.remove());
            const menu = Utils.createElement('div', { className: 'rel-macro-menu' });
            menu.style.left = event.clientX + 'px';
            menu.style.top = event.clientY + 'px';

            commentMacros.forEach(macro => {
                const item = Utils.createElement('button', {
                    className: 'rel-macro-item',
                    textContent: macro.name,
                    onClick: () => {
                        let text = macro.text;
                        const sr = Utils.isSubreddit();
                        text = text.replace(/\{\{subreddit\}\}/g, sr || '');
                        text = text.replace(/\{\{selected\}\}/g, ta.value.substring(ta.selectionStart, ta.selectionEnd));
                        ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
                        ta.dispatchEvent(new Event('input'));
                        menu.remove();
                    }
                });
                menu.appendChild(item);
            });

            document.body.appendChild(menu);
            document.addEventListener('click', function handler(e) {
                if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', handler); }
            });
        },

        renderMarkdown(text) {
            // Simple markdown rendering
            let html = Utils.escapeHTML(text);
            // Reddit spoiler syntax: >!hidden text!<
            if (settings.spoilerTags) html = html.replace(/&gt;!([\s\S]*?)!&lt;/g, '<span class="spoiler rel-inline-spoiler">$1</span>');
            // Bold
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            // Italic
            html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
            // Strikethrough
            html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
            // Code
            html = html.replace(/`(.+?)`/g, '<code style="background:rgba(128,128,128,0.2);padding:1px 4px;border-radius:2px;">$1</code>');
            // Headings
            html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
            html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
            html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
            // Links
            html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
            // Quotes
            html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid #666;padding-left:8px;margin:4px 0;opacity:0.8;">$1</blockquote>');
            // HR
            html = html.replace(/^---$/gm, '<hr>');
            // Newlines
            html = html.replace(/\n/g, '<br>');
            return html;
        }
    };

    // =========================================================================
    // SINGLE CLICK OPENER MODULE
    // =========================================================================
    const SingleClickModule = {
        init() { if (settings.singleClickOpener) this.process(document); },
        process(container) {
            if (!settings.singleClickOpener) return;
            const things = container.querySelectorAll('.thing.link:not([data-rel-sco])');
            things.forEach(thing => {
                thing.setAttribute('data-rel-sco', '1');
                const buttons = thing.querySelector('.flat-list.buttons');
                if (!buttons) return;

                const titleLink = thing.querySelector('a.title');
                const commentsLink = thing.querySelector('a.comments, .flat-list a.bylink');
                if (!titleLink || !commentsLink) return;

                const sco = Utils.createElement('li', { className: 'rel-sco' });
                sco.innerHTML = `<a href="javascript:void(0)" title="Open link + comments in new tabs">[l+c]</a>`;
                sco.querySelector('a').addEventListener('click', (e) => {
                    e.preventDefault();
                    window.open(titleLink.href, '_blank');
                    window.open(commentsLink.href, '_blank');
                });
                buttons.appendChild(sco);
            });
        }
    };

    // =========================================================================
    // USER HIGHLIGHTER MODULE
    // =========================================================================
    const UserHighlighterModule = {
        init() { if (settings.userHighlighter) this.process(document); },
        process(container) {
            if (!settings.userHighlighter) return;
            const authors = container.querySelectorAll('.author:not([data-rel-highlight])');
            authors.forEach(author => {
                author.setAttribute('data-rel-highlight', '1');
                if (author.classList.contains('submitter')) author.classList.add('rel-user-op');
                if (author.classList.contains('moderator')) author.classList.add('rel-user-mod');
                if (author.classList.contains('admin')) author.classList.add('rel-user-admin');
                if (author.classList.contains('friend')) author.classList.add('rel-user-friend');
            });
        }
    };

    // =========================================================================
    // TIMESTAMP MODULE
    // =========================================================================
    const TimestampModule = {
        init() { if (settings.showTimestamps) this.process(document); },
        process(container) {
            if (!settings.showTimestamps) return;
            const times = container.querySelectorAll('time:not([data-rel-timestamp])');
            times.forEach(time => {
                time.setAttribute('data-rel-timestamp', '1');
                const dt = time.getAttribute('datetime');
                if (dt) {
                    const date = new Date(dt);
                    time.title = date.toLocaleString() + ' (' + Utils.timeAgo(dt) + ')';
                }
            });
        }
    };

    // =========================================================================
    // EXPAND CONTINUE THREAD MODULE
    // =========================================================================
    const ExpandThreadModule = {
        init() { if (settings.expandContinueThread) this.process(document); },
        process(container) {
            if (!settings.expandContinueThread) return;
            const moreLinks = container.querySelectorAll('.morecomments a:not([data-rel-expand])');
            moreLinks.forEach(link => {
                link.setAttribute('data-rel-expand', '1');
                if (!link.textContent.includes('continue this thread')) return;

                const expandBtn = Utils.createElement('span', {
                    className: 'rel-expand-thread',
                    textContent: '[load inline]',
                    onClick: async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        expandBtn.textContent = '[loading...]';
                        try {
                            const resp = await fetch(link.href);
                            const html = await resp.text();
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const newComments = doc.querySelector('.commentarea .sitetable');
                            if (newComments) {
                                const parent = link.closest('.morecomments') || link.closest('.child');
                                if (parent) {
                                    const wrapper = Utils.createElement('div', { className: 'rel-expanded-thread' });
                                    wrapper.innerHTML = newComments.innerHTML;
                                    parent.parentNode.insertBefore(wrapper, parent.nextSibling);
                                    Utils.processNewContent(wrapper);
                                    expandBtn.textContent = '[loaded]';
                                    link.style.display = 'none';
                                }
                            } else {
                                expandBtn.textContent = '[no comments]';
                            }
                        } catch (err) {
                            expandBtn.textContent = '[error]';
                        }
                    }
                });
                link.parentNode.insertBefore(expandBtn, link.nextSibling);
            });
        }
    };

    // =========================================================================
    // VOTE ENHANCEMENTS MODULE
    // =========================================================================
    const VoteEnhancementsModule = {
        init() {
            if (settings.voteEnhancements) {
                this.injectCSS();
                this.process(document);
            }
        },

        injectCSS() {
            const t = Themes.getTheme();
            GM_addStyle(`
                @keyframes rel-vote-bounce {
                    0% { transform: scale(1); }
                    30% { transform: scale(1.6); }
                    50% { transform: scale(0.85); }
                    70% { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
                @keyframes rel-vote-particle {
                    0% { opacity: 1; transform: translate(var(--vx), var(--vy)) scale(1); }
                    100% { opacity: 0; transform: translate(calc(var(--vx) * 3.5), calc(var(--vy) * 3.5)) scale(0); }
                }
                @keyframes rel-vote-ring {
                    0% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.3); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); }
                }
                @keyframes rel-vote-flash {
                    0% { opacity: 0.5; }
                    100% { opacity: 0; }
                }
                .rel-vote-burst {
                    position: absolute; pointer-events: none; z-index: 99999;
                }
                .rel-vote-particle {
                    position: absolute; border-radius: 50%;
                    animation: rel-vote-particle 0.6s cubic-bezier(.25,.8,.25,1) forwards;
                }
                .rel-vote-ring {
                    position: absolute; top: 50%; left: 50%;
                    width: 30px; height: 30px; border-radius: 50%;
                    border: 2px solid currentColor; background: none;
                    animation: rel-vote-ring 0.5s ease-out forwards;
                    pointer-events: none;
                }
                .rel-vote-flash {
                    position: absolute; top: 50%; left: 50%;
                    width: 20px; height: 20px; border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: rel-vote-flash 0.3s ease-out forwards;
                    pointer-events: none;
                }
                .arrow.rel-vote-anim {
                    animation: rel-vote-bounce 0.4s cubic-bezier(.25,.8,.25,1) !important;
                }
            `);
        },

        spawnBurst(arrow, direction) {
            const t = Themes.getTheme();
            const colors = direction === 'up'
                ? [t.upvote, '#ffb74d', '#fff176', '#ff8a65']
                : [t.downvote, '#64b5f6', '#81c784', '#4dd0e1'];

            const rect = arrow.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const burst = document.createElement('div');
            burst.className = 'rel-vote-burst';
            burst.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:0;height:0;`;

            // Ring
            const ring = document.createElement('div');
            ring.className = 'rel-vote-ring';
            ring.style.color = colors[0];
            ring.style.borderColor = colors[0];
            burst.appendChild(ring);

            // Flash
            const flash = document.createElement('div');
            flash.className = 'rel-vote-flash';
            flash.style.background = `radial-gradient(circle, ${colors[0]}80, transparent)`;
            burst.appendChild(flash);

            // Particles
            const count = 8;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
                const dist = 8 + Math.random() * 6;
                const vx = Math.cos(angle) * dist;
                const vy = Math.sin(angle) * dist - (direction === 'up' ? 4 : -4);
                const p = document.createElement('div');
                p.className = 'rel-vote-particle';
                const size = 3 + Math.random() * 3;
                p.style.cssText = `
                    width:${size}px;height:${size}px;
                    background:${colors[Math.floor(Math.random() * colors.length)]};
                    --vx:${vx}px;--vy:${vy}px;
                    animation-delay:${Math.random() * 0.08}s;
                    box-shadow: 0 0 ${size}px ${colors[0]}80;
                `;
                burst.appendChild(p);
            }

            document.body.appendChild(burst);

            // Bounce the arrow
            arrow.classList.remove('rel-vote-anim');
            void arrow.offsetWidth;
            arrow.classList.add('rel-vote-anim');

            setTimeout(() => {
                burst.remove();
                arrow.classList.remove('rel-vote-anim');
            }, 700);
        },

        // Native vote handler - toggles visual state and submits vote via fetch
        castVote(thing, direction) {
            const fullname = thing.getAttribute('data-fullname');
            if (!fullname) return;

            const midcol = thing.querySelector(':scope > .midcol');
            const entry = thing.querySelector(':scope > .entry');
            const upArrow = thing.querySelector(':scope > .midcol .arrow.up, :scope > .midcol .arrow.upmod');
            const downArrow = thing.querySelector(':scope > .midcol .arrow.down, :scope > .midcol .arrow.downmod');

            // Determine current state
            const wasUpvoted = upArrow && upArrow.classList.contains('upmod');
            const wasDownvoted = downArrow && downArrow.classList.contains('downmod');

            let dir = 0; // 0 = unvote, 1 = upvote, -1 = downvote
            if (direction === 'up') {
                dir = wasUpvoted ? 0 : 1; // Toggle: if already upvoted, unvote
            } else {
                dir = wasDownvoted ? 0 : -1; // Toggle: if already downvoted, unvote
            }

            // Update arrow classes
            if (upArrow) {
                upArrow.classList.toggle('up', dir !== 1);
                upArrow.classList.toggle('upmod', dir === 1);
            }
            if (downArrow) {
                downArrow.classList.toggle('down', dir !== -1);
                downArrow.classList.toggle('downmod', dir === -1);
            }

            // Update thing/entry/midcol vote state classes
            [thing, entry, midcol].forEach(el => {
                if (!el) return;
                el.classList.toggle('unvoted', dir === 0);
                el.classList.toggle('likes', dir === 1);
                el.classList.toggle('dislikes', dir === -1);
            });

            // Submit vote to Reddit API
            const modhash = document.querySelector('input[name="uh"]')?.value
                || (typeof unsafeWindow !== 'undefined' && unsafeWindow?.reddit?.modhash)
                || '';
            const form = new URLSearchParams({ id: fullname, dir: dir, uh: modhash });
            fetch('/api/vote', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: form.toString()
            }).catch(() => {}); // Silent fail - visual state already updated
        },

        process(container) {
            if (!settings.voteEnhancements) return;
            const t = Themes.getTheme();

            // Color-code scores
            const scores = container.querySelectorAll('.score:not([data-rel-vote])');
            scores.forEach(score => {
                score.setAttribute('data-rel-vote', '1');
                const val = parseInt(score.title || score.textContent);
                if (isNaN(val)) return;
                if (val > 100) score.style.color = t.success;
                else if (val > 50) score.style.color = t.accent;
                else if (val < -5) score.style.color = t.error;
            });

            // Vote weight tracking
            const things = container.querySelectorAll('.thing:not([data-rel-vw])');
            things.forEach(thing => {
                thing.setAttribute('data-rel-vw', '1');
                const author = thing.getAttribute('data-author') || thing.querySelector('.author')?.textContent;
                if (!author) return;

                // Display existing vote weight
                if (voteWeights[author]) {
                    const weight = voteWeights[author];
                    const badge = Utils.createElement('span', {
                        className: 'rel-vote-weight',
                        textContent: `[${weight > 0 ? '+' : ''}${weight}]`,
                        style: {
                            color: weight > 0 ? t.success : t.error,
                            background: weight > 0 ? 'rgba(80,250,123,0.1)' : 'rgba(255,85,85,0.1)'
                        }
                    });
                    const tagline = thing.querySelector(':scope > .entry .tagline');
                    if (tagline) tagline.appendChild(badge);
                }

                // Track votes
                const upArrow = thing.querySelector(':scope > .entry .arrow.up, :scope > .entry .arrow.upmod, :scope > .midcol .arrow.up, :scope > .midcol .arrow.upmod');
                const downArrow = thing.querySelector(':scope > .entry .arrow.down, :scope > .entry .arrow.downmod, :scope > .midcol .arrow.down, :scope > .midcol .arrow.downmod');

                if (upArrow) {
                    upArrow.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        if (!voteWeights[author]) voteWeights[author] = 0;
                        const wasUp = upArrow.classList.contains('upmod');
                        // Toggle off = undo previous upvote; toggle on = new upvote
                        voteWeights[author] += wasUp ? -1 : 1;
                        if (voteWeights[author] === 0) delete voteWeights[author];
                        saveVoteWeights();
                        this.castVote(thing, 'up');
                        if (!wasUp) this.spawnBurst(upArrow, 'up');
                    }, true);
                }
                if (downArrow) {
                    downArrow.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        if (!voteWeights[author]) voteWeights[author] = 0;
                        const wasDown = downArrow.classList.contains('downmod');
                        voteWeights[author] += wasDown ? 1 : -1;
                        if (voteWeights[author] === 0) delete voteWeights[author];
                        saveVoteWeights();
                        this.castVote(thing, 'down');
                        if (!wasDown) this.spawnBurst(downArrow, 'down');
                    }, true);
                }
            });
        }
    };

    // =========================================================================
    // PAGE NAVIGATOR MODULE
    // =========================================================================
    const PageNavigatorModule = {
        init() {
            if (!settings.pageNavigator) return;
            const t = Themes.getTheme();
            const nav = Utils.createElement('div', { className: 'rel-page-nav' });

            const topBtn = Utils.createElement('button', {
                className: 'rel-page-nav-btn',
                innerHTML: '\u25B2',
                title: 'Scroll to top',
                onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
            });

            const bottomBtn = Utils.createElement('button', {
                className: 'rel-page-nav-btn',
                innerHTML: '\u25BC',
                title: 'Scroll to bottom',
                onClick: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
            });

            nav.appendChild(topBtn);
            nav.appendChild(bottomBtn);
            document.body.appendChild(nav);

            // Show/hide based on scroll
            let visible = false;
            window.addEventListener('scroll', Utils.throttle(() => {
                const shouldShow = window.scrollY > 300;
                if (shouldShow !== visible) {
                    nav.style.opacity = shouldShow ? '1' : '0';
                    nav.style.pointerEvents = shouldShow ? 'auto' : 'none';
                    visible = shouldShow;
                }
            }, 200));
            nav.style.opacity = '0';
            nav.style.pointerEvents = 'none';
            nav.style.transition = 'opacity 0.3s';
        }
    };

    // =========================================================================
    // SUBREDDIT SHORTCUTS MODULE
    // =========================================================================
    const SubredditShortcutsModule = {
        container: null,

        init() {
            if (!settings.subredditShortcuts) return;
            const srBar = document.querySelector('#sr-header-area .sr-list');
            if (!srBar) return;

            if (subredditShortcuts.length === 0) {
                const existing = srBar.querySelectorAll('a.choice');
                existing.forEach(a => {
                    const sr = a.textContent.trim();
                    if (sr && !subredditShortcuts.includes(sr)) {
                        subredditShortcuts.push(sr);
                    }
                });
                if (subredditShortcuts.length > 0) saveShortcuts();
            }

            this.container = Utils.createElement('span', { className: 'rel-sr-shortcuts' });
            srBar.appendChild(this.container);
            this.render();
        },

        render() {
            if (!this.container) return;
            const t = Themes.getTheme();
            this.container.innerHTML = '';
            const isDark = settings.darkMode && settings.theme !== 'light';

            subredditShortcuts.forEach((sr, idx) => {
                const wrapper = document.createElement('span');
                wrapper.style.cssText = 'position:relative;display:inline-block;';

                const link = Utils.createElement('a', {
                    href: `/r/${sr}`,
                    textContent: sr,
                    title: `/r/${sr}`
                });
                wrapper.appendChild(link);

                const removeBtn = document.createElement('span');
                removeBtn.textContent = '\u00D7';
                removeBtn.title = `Remove /r/${sr}`;
                removeBtn.style.cssText = `position:absolute;top:-4px;right:-4px;font-size:10px;font-weight:700;cursor:pointer;color:${t.error};background:${t.bg};border-radius:50%;width:12px;height:12px;line-height:12px;text-align:center;display:none;border:1px solid ${t.border};z-index:1;`;
                removeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    subredditShortcuts.splice(idx, 1);
                    saveShortcuts();
                    this.render();
                    Utils.notify(`Removed /r/${sr}`, 'info');
                });
                wrapper.appendChild(removeBtn);

                wrapper.addEventListener('mouseenter', () => { removeBtn.style.display = 'block'; });
                wrapper.addEventListener('mouseleave', () => { removeBtn.style.display = 'none'; });

                this.container.appendChild(wrapper);
            });

            // Add button
            const addBtn = Utils.createElement('span', {
                className: 'rel-sr-add',
                textContent: '+',
                title: 'Add subreddit shortcut',
                onClick: () => {
                    const sr = prompt('Enter subreddit name:');
                    if (sr) {
                        const clean = sr.replace(/^\/?r\//, '').trim();
                        if (clean && !subredditShortcuts.includes(clean)) {
                            subredditShortcuts.push(clean);
                            saveShortcuts();
                            this.render();
                            Utils.notify(`Added /r/${clean}`, 'success');
                        }
                    }
                }
            });
            this.container.appendChild(addBtn);
        }
    };

    // =========================================================================
    // SELECTED ENTRY MODULE
    // =========================================================================
    const SelectedEntryModule = {
        init() { /* Handled by keyboard nav */ },
        process(container) { /* Markers applied by keyboard nav */ }
    };

    // =========================================================================
    // NO PARTICIPATION MODULE
    // =========================================================================
    const NoParticipationModule = {
        init() {
            if (!settings.noParticipation) return;
            if (window.location.hostname === 'np.reddit.com') {
                // Disable voting
                GM_addStyle(`
                    .arrow { pointer-events: none !important; opacity: 0.3 !important; }
                    .reply-button, [data-event-action="comment"] { pointer-events: none !important; opacity: 0.3 !important; }
                `);
                Utils.notify('No Participation mode active - voting and commenting disabled', 'warning', 5000);
            }
        },
        process(container) {
            if (!settings.noParticipation) return;
            // Convert np links to regular in link lists
            const links = container.querySelectorAll('a[href*="np.reddit.com"]:not([data-rel-np])');
            links.forEach(link => {
                link.setAttribute('data-rel-np', '1');
                link.title = 'NP link - No Participation';
                link.style.opacity = '0.7';
            });
        }
    };

    // =========================================================================
    // USER INFO POPUP MODULE
    // =========================================================================
    const UserInfoModule = {
        cache: {},
        hoverTimer: null,
        currentPopup: null,

        init() { if (settings.showUserInfo) this.process(document); },
        process(container) {
            if (!settings.showUserInfo) return;
            const authors = container.querySelectorAll('.author:not([data-rel-userinfo])');
            authors.forEach(author => {
                author.setAttribute('data-rel-userinfo', '1');
                author.addEventListener('mouseenter', (e) => {
                    clearTimeout(this.hoverTimer);
                    this.hoverTimer = setTimeout(() => this.showPopup(author, e), 500);
                });
                author.addEventListener('mouseleave', () => {
                    clearTimeout(this.hoverTimer);
                    setTimeout(() => {
                        if (this.currentPopup && !this.currentPopup.matches(':hover')) {
                            this.currentPopup.remove();
                            this.currentPopup = null;
                        }
                    }, 300);
                });
            });
        },

        async showPopup(author, event) {
            if (this.currentPopup) { this.currentPopup.remove(); this.currentPopup = null; }

            const username = author.textContent;
            if (!username || username === '[deleted]') return;

            const t = Themes.getTheme();
            const popup = Utils.createElement('div', { className: 'rel-user-info-popup' });
            popup.style.left = (event.clientX + 10) + 'px';
            popup.style.top = (event.clientY + 10) + 'px';
            popup.innerHTML = `<h4>u/${Utils.escapeHTML(username)}</h4><div style="opacity:0.6;">Loading...</div>`;

            popup.addEventListener('mouseleave', () => {
                popup.remove();
                this.currentPopup = null;
            });

            document.body.appendChild(popup);
            this.currentPopup = popup;

            // Ensure popup stays on screen
            const rect = popup.getBoundingClientRect();
            if (rect.right > window.innerWidth) popup.style.left = (window.innerWidth - rect.width - 10) + 'px';
            if (rect.bottom > window.innerHeight) popup.style.top = (window.innerHeight - rect.height - 10) + 'px';

            try {
                let data = this.cache[username];
                if (!data) {
                    const resp = await fetch(`https://old.reddit.com/user/${username}/about.json`);
                    data = await resp.json();
                    this.cache[username] = data;
                }

                const d = data.data;
                if (!d) { popup.innerHTML = `<h4>u/${Utils.escapeHTML(username)}</h4><div>User not found</div>`; return; }

                const created = new Date(d.created_utc * 1000);
                const age = Utils.timeAgo(created);

                popup.innerHTML = `
                    <h4 style="color:${t.accent};">u/${Utils.escapeHTML(username)}</h4>
                    <div class="rel-user-info-stat"><span>Post Karma:</span><span>${Utils.formatNumber(d.link_karma)}</span></div>
                    <div class="rel-user-info-stat"><span>Comment Karma:</span><span>${Utils.formatNumber(d.comment_karma)}</span></div>
                    <div class="rel-user-info-stat"><span>Account Age:</span><span>${age}</span></div>
                    <div class="rel-user-info-stat"><span>Created:</span><span>${created.toLocaleDateString()}</span></div>
                    ${d.is_gold ? '<div style="color:#ffd700;font-size:11px;margin-top:4px;">Gold member</div>' : ''}
                    ${d.is_mod ? '<div style="color:#5bc0de;font-size:11px;margin-top:2px;">Moderator</div>' : ''}
                    ${voteWeights[username] ? `<div style="margin-top:4px;font-size:11px;">Vote weight: <strong style="color:${voteWeights[username] > 0 ? t.success : t.error}">${voteWeights[username] > 0 ? '+' : ''}${voteWeights[username]}</strong></div>` : ''}
                    ${userTags[username] ? `<div style="margin-top:4px;font-size:11px;">Tag: <span style="background:${UserTaggingModule.tagColors[userTags[username].color] || '#666'};color:#fff;padding:1px 5px;border-radius:3px;">${Utils.escapeHTML(userTags[username].text || '\u2605')}</span></div>${userTags[username].note ? `<div style="margin-top:4px;font-size:11px;opacity:0.85;">Note: ${Utils.escapeHTML(userTags[username].note)}</div>` : ''}` : ''}
                `;
            } catch (e) {
                popup.innerHTML = `<h4>u/${Utils.escapeHTML(username)}</h4><div style="opacity:0.6;">Could not load user info</div>`;
            }
        }
    };

    // =========================================================================
    // AD BLOCKER MODULE
    // =========================================================================
    const AdBlockModule = {
        init() {
            if (!settings.adBlocker) return;
            this.injectCSS();
        },

        injectCSS() {
            // MINIMAL safe CSS - only target elements that are guaranteed ads
            GM_addStyle(`
                /* REL Ad Blocker - minimal safe rules */
                .thing.promoted { display: none !important; }
                .thing.promotedlink { display: none !important; }
                #siteTable_organic { display: none !important; }
                .goldvertisement { display: none !important; }

                /* Reddit nag bars and banners */
                div.reddit-infobar.md-container-small.with-icon.locked-infobar { display: none !important; }
                div.email-collection-banner { display: none !important; }
                button.redesign-beta-optin { display: none !important; }
                form.premium-banner { display: none !important; }
                div.hidden-post-placeholder { display: none !important; }
            `);
        },

        process(container) {
            if (!settings.adBlocker) return;
            let blocked = 0;
            container.querySelectorAll('.thing.promoted, .thing.promotedlink').forEach(el => {
                el.style.display = 'none';
                if (!el.hasAttribute('data-rel-ad-counted')) {
                    el.setAttribute('data-rel-ad-counted', '1');
                    blocked++;
                }
            });
            if (blocked) AnalyticsModule.increment('adsBlocked', blocked);
        }
    };

    // =========================================================================
    // SUBREDDIT STYLE REMOVER MODULE
    // =========================================================================
    const SubredditStyleRemoverModule = {
        init() {
            if (!settings.removeSubredditStyles) return;
            // Skip observer if early init already set it up (avoid duplicate)
            if (!this._earlyInitDone) {
                const disableStyles = () => {
                    document.querySelectorAll(
                        'link[rel="applied_subreddit_stylesheet"], link[title="applied_subreddit_stylesheet"]'
                    ).forEach(s => {
                        if (s.getAttribute('media') !== 'not all') {
                            s.setAttribute('data-rel-disabled', '1');
                            s.setAttribute('media', 'not all');
                        }
                    });
                };
                disableStyles();
                const head = document.head || document.documentElement;
                this.observer = ObserverRegistry.observe(head, disableStyles, { childList: true }, 'subreddit-style-remover');
            }
            // Also uncheck "Use subreddit style" checkbox if present
            const styleOverride = document.getElementById('sr-style-bar');
            if (styleOverride) {
                const checkbox = styleOverride.querySelector('input[type="checkbox"]');
                if (checkbox && checkbox.checked) {
                    checkbox.click();
                }
            }
        }
    };

    // =========================================================================
    // WIDE VIEW MODULE
    // =========================================================================
    const WideViewModule = {
        init() {
            if (!settings.wideView) return;
            GM_addStyle(`
                body > .content { max-width: none !important; margin: 0 !important; padding: 0 16px !important; }
                .content[role="main"] { max-width: none !important; }
                .sitetable, .linklisting { max-width: none !important; }
                .side { position: sticky; top: 0; max-height: 100vh; overflow-y: auto; }
                .thing .title { max-width: none !important; }
                .commentarea { max-width: none !important; }
                body.listing-page .content { margin: 0 auto !important; max-width: 100% !important; }
                .wiki-page .wiki-page-content { max-width: none !important; }
                .searchpane { max-width: none !important; }
            `);
        }
    };

    // =========================================================================
    // SUBREDDIT DESCRIPTION MODULE
    // =========================================================================
    const SubredditDescriptionModule = {
        TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 days cache

        init() {
            if (!settings.subredditDescription) return;
            const sr = Utils.isSubreddit();
            if (!sr) return;
            this.loadDescription(sr);
        },

        getCacheKey(sub) { return 'rel_srdesc_' + sub.toLowerCase(); },

        readCache(sub) {
            try {
                const raw = localStorage.getItem(this.getCacheKey(sub));
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed.v !== 'string' || typeof parsed.t !== 'number') return null;
                if ((Date.now() - parsed.t) > this.TTL_MS) return null;
                return parsed.v;
            } catch { return null; }
        },

        writeCache(sub, desc) {
            try { localStorage.setItem(this.getCacheKey(sub), JSON.stringify({ v: desc, t: Date.now() })); } catch {}
        },

        async loadDescription(subreddit) {
            const sidebar = document.querySelector('.side');
            if (!sidebar) return;

            // Check cache first
            let desc = this.readCache(subreddit);

            if (!desc) {
                try {
                    const resp = await fetch(`https://old.reddit.com/r/${subreddit}/about.json`, {
                        headers: { 'Accept': 'application/json' }
                    });
                    const json = await resp.json();
                    desc = json?.data?.public_description?.trim() || '';
                    if (desc) this.writeCache(subreddit, desc);
                } catch (e) {
                    console.error('REL: Failed to load subreddit description', e);
                    return;
                }
            }

            if (!desc) return;

            // Check if sidebar already has a description
            const existingDesc = sidebar.querySelector('.titlebox .md p');
            if (existingDesc && existingDesc.textContent.trim().length > 20) return;

            const t = Themes.getTheme();
            const box = Utils.createElement('div', {
                id: 'rel-sr-description',
                className: 'spacer',
                style: {
                    background: settings.darkMode ? t.bgLight : '#f6f7f8',
                    border: `1px solid ${settings.darkMode ? t.border : '#e0e0e0'}`,
                    borderRadius: '6px', padding: '12px', marginBottom: '10px'
                }
            });
            box.innerHTML = `
                <h3 style="margin:0 0 6px;font-size:13px;font-weight:bold;color:${settings.darkMode ? t.fg : '#1a1a1b'};">About Community</h3>
                <p style="margin:0;font-size:12px;color:${settings.darkMode ? t.fgMuted : '#5a5c5e'};line-height:1.5;">${Utils.escapeHTML(desc)}</p>
            `;

            // Insert before the existing titlebox
            const titlebox = sidebar.querySelector('.titlebox');
            if (titlebox) {
                sidebar.insertBefore(box, titlebox.closest('.spacer') || titlebox);
            } else {
                sidebar.prepend(box);
            }
        }
    };

    // =========================================================================
    // STATE SAVER MODULE
    // =========================================================================
    const StateSaverModule = {
        init() {
            if (!settings.stateSaver) return;
            if (!Utils.isListingPage()) return;

            // Save scroll position before navigating to a comments page
            document.addEventListener('click', (e) => {
                const a = e.target.closest('a');
                if (!a || !a.href) return;
                // Only intercept comment links
                if (!a.href.includes('/comments/')) return;
                // Don't intercept external links
                if (!a.href.includes('reddit.com')) return;
                // Don't intercept if modifier keys held (user wants new tab)
                if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;

                // Save current scroll and page state
                const stateKey = 'rel_state_' + window.location.pathname + window.location.search;
                try {
                    sessionStorage.setItem(stateKey, JSON.stringify({
                        scrollY: window.scrollY,
                        timestamp: Date.now()
                    }));
                } catch {}
            });

            // Restore scroll position on page load
            this.restoreState();
        },

        restoreState() {
            const stateKey = 'rel_state_' + window.location.pathname + window.location.search;
            try {
                const raw = sessionStorage.getItem(stateKey);
                if (!raw) return;
                const state = JSON.parse(raw);
                // Only restore if less than 30 minutes old
                if (Date.now() - state.timestamp > 30 * 60 * 1000) {
                    sessionStorage.removeItem(stateKey);
                    return;
                }
                // Use performance navigation to detect back/forward
                const navType = performance.getEntriesByType('navigation')[0]?.type;
                if (navType === 'back_forward' || document.referrer.includes('/comments/')) {
                    // Wait for content to render then scroll
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            window.scrollTo(0, state.scrollY);
                        }, 100);
                    });
                }
                // Clean up after restore
                sessionStorage.removeItem(stateKey);
            } catch {}
        }
    };

    // =========================================================================
    // DOWNLOAD BUTTONS MODULE
    // =========================================================================
    const DownloadButtonsModule = {
        init() {
            if (!settings.downloadButtons) return;
            this.process(document);
        },

        process(container) {
            if (!settings.downloadButtons) return;
            const things = container.querySelectorAll('.thing.link:not([data-rel-download])');
            things.forEach(thing => {
                thing.setAttribute('data-rel-download', '1');
                const url = thing.getAttribute('data-url') || '';
                if (!url) return;

                // Check if this is a downloadable image
                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(url) ||
                                url.includes('i.redd.it') || url.includes('i.imgur.com') ||
                                url.includes('preview.redd.it');
                if (!isImage) return;

                const buttons = thing.querySelector('.flat-list.buttons');
                if (!buttons) return;

                const t = Themes.getTheme();
                const dlBtn = Utils.createElement('li', {});
                const dlLink = Utils.createElement('a', {
                    href: 'javascript:void(0)',
                    textContent: '\u2913 download',
                    title: 'Download image',
                    style: {
                        color: settings.darkMode ? t.accent : '#0079d3',
                        cursor: 'pointer'
                    },
                    onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.downloadImage(url, thing, dlLink);
                    }
                });
                dlBtn.appendChild(dlLink);
                buttons.appendChild(dlBtn);
            });
        },

        async downloadImage(url, thing, btn) {
            const originalText = btn.textContent;
            btn.textContent = '\u2913 downloading...';

            // Resolve the actual image URL
            let imgUrl = url;
            if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
                const m = url.match(/imgur\.com\/(?:a\/|gallery\/)?(\w+)/);
                if (m) imgUrl = `https://i.imgur.com/${m[1]}.jpg`;
            }

            // Get filename from title
            const title = thing.querySelector('a.title')?.textContent || 'reddit-image';
            const cleanTitle = title.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().substring(0, 80);
            const ext = imgUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)/i)?.[1] || 'jpg';
            const filename = `${cleanTitle}.${ext}`;

            try {
                // Use GM_xmlhttpRequest to bypass CORS
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: imgUrl,
                    responseType: 'blob',
                    onload: (response) => {
                        try {
                            const blob = response.response;
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(blob);
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(a.href);
                            btn.textContent = '\u2713 saved';
                            setTimeout(() => { btn.textContent = originalText; }, 3000);
                        } catch (err) {
                            btn.textContent = '\u2717 error';
                            setTimeout(() => { btn.textContent = originalText; }, 3000);
                        }
                    },
                    onerror: () => {
                        // Fallback: open in new tab for manual save
                        window.open(imgUrl, '_blank');
                        btn.textContent = originalText;
                    }
                });
            } catch (e) {
                window.open(imgUrl, '_blank');
                btn.textContent = originalText;
            }
        }
    };

    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    function init() {
        ObserverLifecycleModule.init();
        // Disable subreddit styles IMMEDIATELY at document-start
        // Uses media="not all" instead of .remove() to preserve layout-critical CSS
        // Notification redirect (runs early, before DOM processing)
        NotificationRedirectModule.init();

        if (settings.removeSubredditStyles) {
            SubredditStyleRemoverModule._earlyInitDone = true;
            const disableStyles = () => {
                document.querySelectorAll(
                    'link[rel="applied_subreddit_stylesheet"], link[title="applied_subreddit_stylesheet"]'
                ).forEach(s => {
                    if (s.getAttribute('media') !== 'not all') {
                        s.setAttribute('data-rel-disabled', '1');
                        s.setAttribute('media', 'not all');
                    }
                });
            };
            disableStyles();
            // Watch for late-loading sheets
            const head = document.head || document.documentElement;
            if (head) {
                ObserverRegistry.observe(head, disableStyles, { childList: true }, 'subreddit-style-remover');
            }
        }

        // Inject ad-block CSS at document-start for zero-flicker
        // MINIMAL: only .thing.promoted and .thing.promotedlink
        if (settings.adBlocker) {
            GM_addStyle(`
                .thing.promoted { display: none !important; }
                .thing.promotedlink { display: none !important; }
                #siteTable_organic { display: none !important; }
                div.reddit-infobar.md-container-small.with-icon.locked-infobar { display: none !important; }
                div.email-collection-banner { display: none !important; }
                button.redesign-beta-optin { display: none !important; }
                form.premium-banner { display: none !important; }
                div.hidden-post-placeholder { display: none !important; }
            `);
        }

        // Inject base styles immediately
        GM_addStyle(Styles.base);

        // Apply theme CSS
        if (settings.darkMode && settings.theme !== 'light') {
            GM_addStyle(Themes.generateCSS());
            GM_addStyle(Styles.getThemedBase());
        }

        // Apply UX enhancements
        const uxInit = Styles.generateUXCSS();
        if (uxInit) GM_addStyle(uxInit);

        // Apply custom CSS
        if (settings.customCSS) {
            GM_addStyle(settings.customCSS);
        }

        // Note: Reddit's jQuery is closure-scoped in their bundles, so we cannot
        // polyfill missing methods (slideUp, ajax, thing, etc.) from userscript context.
        // Instead, we intercept clicks and handle reply/vote/collapse natively above.

        // Wait for DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initModules);
        } else {
            initModules();
        }
    }

    // =========================================================================
    // CLASSIC REDDIT++ FEATURES (adapted from Classic Reddit++ by SlippingGitty)
    // =========================================================================

    // --- Notification Redirect ---
    const NotificationRedirectModule = {
        init() {
            if (!settings.notificationRedirect) return;
            if (window.location.href.includes('old.reddit.com/notifications')) {
                window.location.href = window.location.href.replace('old.reddit.com/notifications', 'sh.reddit.com/notifications');
            }
        }
    };

    // --- Shared Post Data Cache (used by ViewCounter + VoteEstimator) ---
    const PostDataCache = {
        cache: {},
        pending: {},
        fetch(postId, callback) {
            if (this.cache[postId]) { callback(this.cache[postId]); return; }
            if (this.pending[postId]) { this.pending[postId].push(callback); return; }
            this.pending[postId] = [callback];
            GM_xmlhttpRequest({
                method: 'GET',
                url: `https://www.reddit.com/by_id/t3_${postId}.json`,
                headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
                onload: (response) => {
                    try {
                        const data = JSON.parse(response.responseText);
                        const post = data.data.children[0].data;
                        this.cache[postId] = post;
                        (this.pending[postId] || []).forEach(cb => cb(post));
                    } catch (e) {
                        (this.pending[postId] || []).forEach(cb => cb(null));
                    }
                    delete this.pending[postId];
                },
                onerror: () => {
                    (this.pending[postId] || []).forEach(cb => cb(null));
                    delete this.pending[postId];
                }
            });
        }
    };

    // --- View Counter ---
    const ViewCounterModule = {
        init() {
            if (!settings.viewCounter) return;
            this.process(document);
        },
        process(container) {
            if (!settings.viewCounter) return;
            // Comment page - single post
            if (window.location.pathname.includes('/comments/')) {
                const urlMatch = window.location.pathname.match(/\/comments\/([a-z0-9]+)\//i);
                const postId = urlMatch ? urlMatch[1] : null;
                const selfPost = document.querySelector('.thing.self, .thing.link');
                if (postId && selfPost && !selfPost.hasAttribute('data-rel-views')) {
                    selfPost.setAttribute('data-rel-views', '1');
                    PostDataCache.fetch(postId, (post) => this.insertViewCount(selfPost, post));
                }
                return;
            }
            // Listing page
            container.querySelectorAll('.thing.link:not([data-rel-views])').forEach(el => {
                el.setAttribute('data-rel-views', '1');
                const postId = el.dataset.fullname?.replace('t3_', '');
                if (!postId) return;
                PostDataCache.fetch(postId, (post) => this.insertViewCount(el, post));
            });
        },
        formatNumber(num) {
            if (!num || num === 0) return '? views';
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M views';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K views';
            return num + ' views';
        },
        insertViewCount(el, post) {
            const tagline = el.querySelector('.tagline');
            if (!tagline || tagline.querySelector('.rel-view-count')) return;
            let views = null;
            if (post) {
                views = post.view_count || post.num_views || post.viewCount || null;
                if (!views) {
                    const score = post.score || 0;
                    const ratio = post.upvote_ratio || 0.5;
                    if (ratio > 0.5) views = Math.round(score / (2 * ratio - 1)) * 25;
                }
            }
            const t = Themes.getTheme();
            const span = document.createElement('span');
            span.className = 'rel-view-count';
            span.textContent = this.formatNumber(views);
            span.style.cssText = `margin-right:6px;color:${t.fgMuted};font-size:0.85em;opacity:0.8;`;
            const score = tagline.querySelector('.score');
            if (score) score.after(span);
            else tagline.prepend(span);
        }
    };

    // --- Vote Estimator ---
    const VoteEstimatorModule = {
        init() {
            if (!settings.voteEstimator) return;
            this.addEstimatesToCommentPage();
            this.process(document);
        },
        process(container) {
            if (!settings.voteEstimator) return;
            const linkListing = document.querySelector('.linklisting');
            if (!linkListing) return;
            container.querySelectorAll('.thing.link:not([data-rel-votes])').forEach(post => {
                post.setAttribute('data-rel-votes', '1');
                const postId = post.dataset.fullname?.replace('t3_', '');
                if (!postId) return;
                PostDataCache.fetch(postId, (pd) => {
                    if (!pd) return;
                    const score = pd.score || 0;
                    const ratio = pd.upvote_ratio || 0.5;
                    const pct = Math.round(ratio * 100);
                    const upvotes = this.calcUpvotes(score, pct);
                    if (upvotes === null) return;
                    const downvotes = upvotes - score;
                    const tagline = post.querySelector('.tagline');
                    if (!tagline || tagline.querySelector('.rel-vote-est')) return;
                    const t = Themes.getTheme();
                    const span = document.createElement('span');
                    span.className = 'rel-vote-est';
                    span.style.cssText = 'font-size:0.85em;margin-left:4px;';
                    span.innerHTML = `(<span style="color:${t.upvote || '#ff8b60'}">${this.addCommas(upvotes)}</span>|<span style="color:${t.downvote || '#9494ff'}">${this.addCommas(downvotes)}</span>|<span style="color:${t.success || '#50fa7b'}">${pct}%</span>)`;
                    const scoreEl = tagline.querySelector('.score');
                    if (scoreEl) scoreEl.after(span);
                });
            });
        },
        addCommas(n) {
            return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        calcUpvotes(score, pct) {
            if (score === 0 || pct === 50) return null;
            return Math.round((pct / 100 * score) / (2 * (pct / 100) - 1));
        },
        addEstimatesToCommentPage() {
            const linkinfoScores = document.querySelectorAll('.linkinfo .score');
            linkinfoScores.forEach(scoreEl => {
                const numEl = scoreEl.querySelector('.number');
                if (!numEl) return;
                const points = parseInt(numEl.textContent.replace(/[^0-9]/g, ''), 10);
                const pctMatch = scoreEl.textContent.match(/(\d{1,3})\s?%/);
                const pct = pctMatch ? parseInt(pctMatch[1], 10) : 0;
                if (points === 50 && pct === 50) return;
                const upvotes = this.calcUpvotes(points, pct);
                if (upvotes === null) return;
                const downvotes = upvotes - points;
                const total = upvotes + downvotes;
                const t = Themes.getTheme();
                scoreEl.insertAdjacentHTML('afterend', `
                    <span style="font-size:80%;color:${t.upvote || '#ff8b60'};margin-left:5px;">${this.addCommas(upvotes)} upvotes</span>
                    <span style="font-size:80%;color:${t.downvote || '#9494ff'};margin-left:5px;">${this.addCommas(downvotes)} downvotes</span>
                    <span style="font-size:80%;color:${t.fgMuted};margin-left:5px;">${this.addCommas(total)} total</span>
                `);
            });
        }
    };

    // --- Full Scores ---
    const FullScoresModule = {
        init() {
            if (!settings.fullScores) return;
            GM_addStyle(`
                .link .score { font-size: 0 !important; }
                .link .score::before { content: attr(title); font-size: 12px !important; }
                .link .score::first-letter { font-size: 12px !important; }
            `);
        }
    };

    // --- Username /u/ Prefix ---
    const UserPrefixModule = {
        init() {
            if (!settings.userPrefix) return;
            GM_addStyle(`a.author::before { content: "/u/"; text-transform: none !important; }`);
        }
    };

    // --- Trending Subreddits ---
    const TrendingSubredditsModule = {
        subredditsPool: [
            '/r/AskReddit','/r/funny','/r/pics','/r/gaming','/r/science','/r/worldnews','/r/movies',
            '/r/todayilearned','/r/memes','/r/technology','/r/news','/r/space','/r/interestingasfuck',
            '/r/art','/r/personalfinance','/r/books','/r/history','/r/food','/r/sports','/r/Music',
            '/r/travel','/r/photography','/r/gadgets','/r/television','/r/aww','/r/anime','/r/manga',
            '/r/programming','/r/python','/r/buildapc','/r/cars','/r/fitness','/r/cooking',
            '/r/coffee','/r/nature','/r/mademesmile','/r/nostalgia','/r/futurology','/r/dataisbeautiful'
        ],
        init() {
            if (!settings.trendingSubreddits) return;
            const isFrontPage = window.location.pathname === '/' || window.location.pathname === '/index.html';
            if (!isFrontPage) return;

            const siteTable = document.getElementById('siteTable');
            if (!siteTable) return;

            const t = Themes.getTheme();
            const isDark = settings.darkMode && settings.theme !== 'light';

            // Pick 5 random subreddits (cached daily via GM storage)
            const cacheKey = 'rel_trending_cache';
            const now = Date.now();
            let cached = null;
            try { cached = JSON.parse(GM_getValue(cacheKey, 'null')); } catch(e) {}

            let subs;
            if (cached && (now - cached.ts < 86400000)) {
                subs = cached.subs;
            } else {
                const shuffled = [...this.subredditsPool].sort(() => 0.5 - Math.random());
                subs = shuffled.slice(0, 5);
                GM_setValue(cacheKey, JSON.stringify({ subs, ts: now }));
            }

            const bar = document.createElement('div');
            bar.className = 'rel-trending-bar';
            bar.style.cssText = `display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 14px;margin-bottom:8px;border-radius:6px;font-size:12px;background:${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};border:1px solid ${t.border};`;

            const icon = document.createElement('span');
            icon.textContent = '\uD83D\uDD25';
            icon.style.fontSize = '14px';
            bar.appendChild(icon);

            const label = document.createElement('strong');
            label.textContent = 'Trending:';
            label.style.color = t.fg;
            bar.appendChild(label);

            subs.forEach(sub => {
                const a = document.createElement('a');
                a.href = sub;
                a.textContent = sub;
                a.style.cssText = `color:${t.link};text-decoration:none;padding:2px 6px;border-radius:4px;background:${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};`;
                bar.appendChild(a);
            });

            siteTable.insertBefore(bar, siteTable.firstChild);
        }
    };

    // =========================================================================
    // DISCORD-STYLE LAYOUT MODULE (EXPERIMENTAL)
    // =========================================================================
    const DiscordLayoutModule = {
        styleInjected: false,

        getChannelLabel(pathname = window.location.pathname) {
            const match = String(pathname || '').match(/\/r\/([^/]+)/i);
            return match ? `# ${match[1].toLowerCase()}` : '# home';
        },

        getInitials(author) {
            const value = String(author || '').replace(/^\[deleted\]$/i, 'deleted').trim();
            if (!value) return '?';
            const words = value.split(/[^A-Za-z0-9]+/).filter(Boolean);
            return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : value.slice(0, 2)).toUpperCase();
        },

        injectStyles() {
            if (this.styleInjected) return;
            const t = Themes.getTheme();
            GM_addStyle(`
                body.rel-discord-layout { background:${t.bg} !important; }
                body.rel-discord-layout #header { border-bottom:1px solid ${t.border} !important; }
                body.rel-discord-layout .content { max-width:1100px !important; margin:0 auto !important; }
                body.rel-discord-layout .rel-discord-channel { display:flex; align-items:center; gap:10px; padding:12px 16px; margin:8px 0; border:1px solid ${t.border}; border-radius:8px; background:${t.bgLight}; }
                body.rel-discord-layout .rel-discord-channel-icon { width:30px; height:30px; display:grid; place-items:center; border-radius:8px; background:${t.accent}; color:${t.bg}; font-weight:800; }
                body.rel-discord-layout .rel-discord-channel-label { font-size:16px; font-weight:700; color:${t.fg}; }
                body.rel-discord-layout .rel-discord-channel-meta { font-size:11px; color:${t.fgDim}; }
                body.rel-discord-layout .thing.link { display:grid !important; grid-template-columns:42px minmax(0,1fr) !important; gap:8px; padding:12px !important; margin:8px 0 !important; border:1px solid ${t.border} !important; border-radius:8px !important; background:${t.bgLight} !important; }
                body.rel-discord-layout .thing.link > .midcol { grid-column:1; grid-row:1; width:36px !important; float:none !important; }
                body.rel-discord-layout .thing.link > .entry { grid-column:2; grid-row:1; min-width:0; }
                body.rel-discord-layout .comment { margin-top:6px !important; padding:8px !important; border-radius:7px !important; }
                body.rel-discord-layout .comment > .entry { position:relative; padding-left:40px !important; min-height:32px; }
                body.rel-discord-layout .comment .rel-discord-avatar { position:absolute; left:0; top:0; width:30px; height:30px; display:grid; place-items:center; border-radius:50%; background:${t.surface}; color:${t.accent}; font-size:10px; font-weight:800; }
                body.rel-discord-layout .comment .author { font-weight:700 !important; color:${t.accent} !important; }
                body.rel-discord-layout .comment .tagline { margin-bottom:3px; }
                body.rel-discord-layout .comment .usertext-body { border-radius:0 7px 7px 7px; background:${t.bgLight}; padding:5px 8px; }
                body.rel-discord-layout .comment .child { border-left:1px solid ${t.border} !important; }
            `);
            this.styleInjected = true;
        },

        buildChannelHeader() {
            if (document.querySelector('.rel-discord-channel')) return;
            const content = document.querySelector('.content[role="main"], body > .content, .content');
            if (!content) return;
            const header = Utils.createElement('div', { className: 'rel-discord-channel' });
            header.appendChild(Utils.createElement('span', { className: 'rel-discord-channel-icon', textContent: '#' }));
            const copy = Utils.createElement('div');
            copy.appendChild(Utils.createElement('div', { className: 'rel-discord-channel-label', textContent: this.getChannelLabel() }));
            copy.appendChild(Utils.createElement('div', { className: 'rel-discord-channel-meta', textContent: 'Reddit Enhancement Continued experimental layout' }));
            header.appendChild(copy);
            content.prepend(header);
        },

        process(container) {
            if (!settings.discordLayout) return;
            container.querySelectorAll('.thing.link').forEach(post => post.classList.add('rel-discord-post'));
            container.querySelectorAll('.comment:not([data-rel-discord])').forEach(comment => {
                comment.setAttribute('data-rel-discord', '1');
                const entry = comment.querySelector(':scope > .entry');
                if (!entry || entry.querySelector('.rel-discord-avatar')) return;
                const author = comment.getAttribute('data-author') || entry.querySelector('.author')?.textContent;
                entry.prepend(Utils.createElement('span', { className: 'rel-discord-avatar', textContent: this.getInitials(author), 'aria-hidden': 'true' }));
            });
        },

        init() {
            if (!settings.discordLayout) return;
            document.body.classList.add('rel-discord-layout');
            this.injectStyles();
            this.buildChannelHeader();
            this.process(document);
        }
    };

    // =========================================================================
    // TOUCH SWIPE GESTURES MODULE
    // =========================================================================
    const TouchGestureModule = {
        start: null,
        classifySwipe(start, end, threshold = settings.touchSwipeThreshold) {
            if (!start || !end) return null;
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const minimum = Math.max(40, Math.min(240, Number(threshold) || 80));
            if (Math.abs(dx) < minimum || Math.abs(dx) < Math.abs(dy) * 1.35) return null;
            return dx < 0 ? 'next' : 'previous';
        },

        shouldIgnoreTarget(target) {
            return !!target?.closest?.('input, textarea, select, button, a, [contenteditable="true"], .expando, .rel-settings-overlay, .rel-multi-reddit-overlay');
        },

        getPageLink(direction) {
            const selectors = direction === 'next'
                ? ['.next-button a', 'a[rel="next"]', '.nextprev a.next']
                : ['.prev-button a', 'a[rel="prev"]', '.nextprev a.prev'];
            for (const selector of selectors) {
                const link = document.querySelector(selector);
                if (link?.href) return link;
            }
            return null;
        },

        navigate(direction) {
            const link = this.getPageLink(direction);
            if (!link) return false;
            window.location.href = link.href;
            return true;
        },

        init() {
            if (!settings.touchGestures || !('ontouchstart' in window)) return;
            document.addEventListener('touchstart', event => {
                if (event.touches.length !== 1 || this.shouldIgnoreTarget(event.target)) {
                    this.start = null;
                    return;
                }
                const touch = event.touches[0];
                this.start = { x: touch.clientX, y: touch.clientY };
            }, { passive: true });
            document.addEventListener('touchend', event => {
                if (!this.start || event.changedTouches.length !== 1) return;
                const touch = event.changedTouches[0];
                const direction = this.classifySwipe(this.start, { x: touch.clientX, y: touch.clientY });
                this.start = null;
                if (direction) this.navigate(direction);
            }, { passive: true });
        }
    };

    // =========================================================================
    // SESSION TABS MODULE
    // =========================================================================
    const SessionTabsModule = {
        STORAGE_KEY: 'rel_session_tabs_v1',
        tabs: [],
        bar: null,

        getThreadId(url) {
            try {
                const parsed = new URL(String(url || ''), 'https://old.reddit.com');
                const match = parsed.pathname.match(/\/comments\/([A-Za-z0-9]+)(?:\/|$)/i);
                return match ? match[1].toLowerCase() : null;
            } catch {
                return null;
            }
        },

        normalizeTab(tab) {
            if (!tab || typeof tab !== 'object' || Array.isArray(tab)) return null;
            let url;
            try {
                const parsed = new URL(String(tab.url || ''), 'https://old.reddit.com');
                if (!/^https?:$/.test(parsed.protocol) || !/(^|\.)reddit\.com$/i.test(parsed.hostname)) return null;
                if (!parsed.pathname.includes('/comments/')) return null;
                url = parsed.pathname + parsed.search + parsed.hash;
            } catch {
                return null;
            }
            const id = this.getThreadId(url);
            if (!id) return null;
            return {
                id,
                url,
                title: String(tab.title || `Thread ${id}`).trim().slice(0, 120) || `Thread ${id}`,
                openedAt: Number.isFinite(Number(tab.openedAt)) ? Number(tab.openedAt) : Date.now(),
                lastViewedAt: Number.isFinite(Number(tab.lastViewedAt)) ? Number(tab.lastViewedAt) : Date.now()
            };
        },

        read() {
            try {
                const raw = sessionStorage.getItem(this.STORAGE_KEY);
                const parsed = raw ? JSON.parse(raw) : [];
                return Array.isArray(parsed) ? parsed.map(tab => this.normalizeTab(tab)).filter(Boolean).slice(-20) : [];
            } catch {
                return [];
            }
        },

        write() {
            try { sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tabs.slice(-20))); } catch {}
        },

        currentThread() {
            const id = this.getThreadId(window.location.href || window.location.pathname);
            if (!id) return null;
            const title = document.querySelector('.thing.link.self .title, .linklisting .thing.self .title, .commentarea .thing.link .title')?.textContent?.trim();
            return this.normalizeTab({ id, url: window.location.pathname + window.location.search + window.location.hash, title: title || `Thread ${id}` });
        },

        add(tab) {
            const normalized = this.normalizeTab(tab);
            if (!normalized) return false;
            const existing = this.tabs.find(item => item.id === normalized.id);
            const next = existing ? { ...existing, ...normalized, openedAt: existing.openedAt, lastViewedAt: Date.now() } : normalized;
            this.tabs = [...this.tabs.filter(item => item.id !== normalized.id), next].slice(-20);
            this.write();
            this.render();
            return true;
        },

        close(id) {
            const before = this.tabs.length;
            this.tabs = this.tabs.filter(tab => tab.id !== id);
            if (before === this.tabs.length) return false;
            this.write();
            this.render();
            return true;
        },

        clear() {
            this.tabs = [];
            this.write();
            this.render();
        },

        init() {
            if (!settings.sessionTabs) return;
            this.tabs = this.read();
            const current = this.currentThread();
            if (current) this.add(current);
            document.addEventListener('click', event => {
                const link = event.target.closest?.('a[href*="/comments/"]');
                if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                this.add({ url: link.href, title: link.textContent?.trim() || undefined });
            }, true);
            this.render();
        },

        render() {
            if (this.bar) this.bar.remove();
            const host = document.querySelector('#header') || document.querySelector('#sr-header-area') || document.body;
            if (!host || this.tabs.length === 0) return;
            const bar = Utils.createElement('div', {
                className: 'rel-session-tabs',
                style: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', padding: '4px 8px', borderTop: '1px solid rgba(128,128,128,0.25)', borderBottom: '1px solid rgba(128,128,128,0.25)', fontSize: '11px' }
            });
            const label = Utils.createElement('span', { textContent: 'Threads:', style: { opacity: '0.65', marginRight: '2px' } });
            bar.appendChild(label);
            const currentId = this.getThreadId(window.location.href || window.location.pathname);
            this.tabs.forEach(tab => {
                const wrapper = Utils.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', maxWidth: '260px', border: '1px solid rgba(128,128,128,0.35)', borderRadius: '4px', overflow: 'hidden' } });
                const link = Utils.createElement('a', { href: tab.url, textContent: tab.title, title: tab.url, style: { padding: '3px 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: tab.id === currentId ? '700' : '400' } });
                wrapper.appendChild(link);
                const close = Utils.createElement('button', { type: 'button', textContent: '\u00D7', title: 'Close thread tab', style: { border: '0', background: 'transparent', cursor: 'pointer', padding: '2px 5px' }, onClick: event => { event.preventDefault(); event.stopPropagation(); this.close(tab.id); } });
                wrapper.appendChild(close);
                bar.appendChild(wrapper);
            });
            const clear = Utils.createElement('button', { type: 'button', textContent: 'clear', title: 'Clear session tabs', style: { border: '0', background: 'transparent', cursor: 'pointer', padding: '3px 5px', opacity: '0.7' }, onClick: event => { event.preventDefault(); this.clear(); } });
            bar.appendChild(clear);
            host.appendChild(bar);
            this.bar = bar;
        }
    };

    // =========================================================================
    // INBOX MARK-ALL-READ MODULE
    // =========================================================================
    const InboxReadModule = {
        button: null,
        isMessagePath(pathname = window.location.pathname) {
            return String(pathname || '').startsWith('/message/');
        },

        getModhash() {
            return document.querySelector('input[name="uh"]')?.value
                || window.r?.config?.modhash
                || (typeof unsafeWindow !== 'undefined' && unsafeWindow?.r?.config?.modhash)
                || '';
        },

        buildRequestBody(modhash = '') {
            const body = new URLSearchParams({ filter_types: '' });
            if (modhash) body.set('uh', modhash);
            return body.toString();
        },

        init() {
            if (!settings.markAllAsRead || !this.isMessagePath()) return;
            const host = document.querySelector('.messagepage .menuarea, .messagepage .menuarea .spacer, .menuarea');
            if (!host || host.querySelector('.rel-mark-all-read')) return;
            this.button = Utils.createElement('button', {
                className: 'rel-mark-all-read rel-btn-small rel-btn-secondary',
                textContent: 'Mark all as read',
                type: 'button',
                style: { marginLeft: '8px', cursor: 'pointer' },
                onClick: () => this.markAll()
            });
            host.appendChild(this.button);
        },

        async markAll() {
            if (!this.button || this.button.disabled) return false;
            const original = this.button.textContent;
            const modhash = this.getModhash();
            if (!modhash) {
                Utils.notify('Reddit did not expose a modhash; inbox was not changed.', 'warning');
                return false;
            }
            this.button.disabled = true;
            this.button.textContent = 'Marking...';
            try {
                const response = await fetch('/api/read_all_messages', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Modhash': modhash },
                    body: this.buildRequestBody(modhash)
                });
                if (!response.ok && response.status !== 202) throw new Error(`HTTP ${response.status}`);
                document.querySelectorAll('.message.unread').forEach(message => message.classList.remove('unread'));
                this.button.textContent = 'All marked read';
                Utils.notify('Inbox messages queued as read', 'success');
                setTimeout(() => {
                    if (this.button) {
                        this.button.disabled = false;
                        this.button.textContent = original;
                    }
                }, 2000);
                return true;
            } catch (error) {
                console.warn('REL InboxReadModule:', error);
                this.button.disabled = false;
                this.button.textContent = original;
                Utils.notify('Could not mark inbox messages as read', 'error');
                return false;
            }
        }
    };

    // =========================================================================
    // SAVED SEARCHES & FILTERS MODULE
    // =========================================================================
    const SavedViewsModule = {
        menu: null,
        button: null,

        normalizeFilterSnapshot(snapshot) {
            const source = snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) ? snapshot : {};
            const copy = { useRegex: !!source.useRegex, hideNSFW: !!source.hideNSFW, hideVisited: !!source.hideVisited };
            ['keywords', 'domains', 'subreddits', 'flairs', 'users'].forEach(key => {
                copy[key] = Array.isArray(source[key])
                    ? [...new Set(source[key].map(value => String(value || '').trim()).filter(Boolean))].slice(0, 500)
                    : [];
            });
            copy.regexGroups = Array.isArray(source.regexGroups) ? source.regexGroups
                .filter(rule => rule && typeof rule === 'object')
                .map((rule, index) => ({
                    id: String(rule.id || `regex-${index + 1}`).slice(0, 120),
                    name: String(rule.name || `Rule ${index + 1}`).trim().slice(0, 120),
                    pattern: String(rule.pattern || '').slice(0, 500),
                    flags: String(rule.flags || 'i').replace(/[^dgimsuvy]/g, ''),
                    enabled: rule.enabled !== false
                }))
                .filter(rule => rule.pattern)
                .slice(0, 200) : [];
            return copy;
        },

        normalizeView(view, index = 0) {
            if (!view || typeof view !== 'object' || Array.isArray(view)) return null;
            const kind = view.kind === 'filter' ? 'filter' : 'search';
            let url = '';
            try {
                const parsed = new URL(String(view.url || '/'), 'https://old.reddit.com');
                if (!/^https?:$/.test(parsed.protocol) || !/(^|\.)reddit\.com$/i.test(parsed.hostname)) return null;
                url = parsed.pathname + parsed.search + parsed.hash;
            } catch {
                return null;
            }
            const fallbackName = kind === 'search' ? 'Saved search' : 'Saved filters';
            return {
                id: String(view.id || `saved-${index + 1}`).slice(0, 120),
                name: String(view.name || fallbackName).trim().slice(0, 100) || fallbackName,
                kind,
                url,
                filters: kind === 'filter' ? this.normalizeFilterSnapshot(view.filters) : null,
                createdAt: Number.isFinite(Number(view.createdAt)) ? Number(view.createdAt) : Date.now(),
                updatedAt: Number.isFinite(Number(view.updatedAt)) ? Number(view.updatedAt) : Date.now()
            };
        },

        buildSearchUrl(query) {
            const value = String(query || '').trim();
            if (!value) return '/search';
            const url = new URL('/search', 'https://old.reddit.com');
            url.searchParams.set('q', value);
            return url.pathname + url.search;
        },

        getCurrentSearch() {
            const params = new URLSearchParams(window.location.search || '');
            const query = params.get('q')?.trim();
            if (!query) return null;
            return {
                name: `Search: ${query}`.slice(0, 100),
                url: window.location.pathname + window.location.search + window.location.hash
            };
        },

        init() {
            if (!settings.savedViewsMenu) return;
            savedViews = savedViews.map((view, index) => this.normalizeView(view, index)).filter(Boolean).slice(-50);
            saveSavedViews();
            const userbar = document.querySelector('#header-bottom-right');
            if (!userbar || userbar.querySelector('.rel-saved-views-wrap')) return;

            const wrapper = Utils.createElement('span', {
                className: 'rel-saved-views-wrap',
                style: { position: 'relative', display: 'inline-block', marginRight: '6px' }
            });
            this.button = Utils.createElement('button', {
                className: 'rel-saved-views-btn',
                textContent: '\u2605 saved',
                title: 'Saved searches and filters',
                type: 'button',
                style: { cursor: 'pointer', border: '0', background: 'transparent', color: 'inherit', padding: '2px 4px' },
                onClick: event => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.toggleMenu(wrapper);
                }
            });
            wrapper.appendChild(this.button);
            userbar.prepend(wrapper);
            document.addEventListener('click', event => {
                if (this.menu && !wrapper.contains(event.target)) this.closeMenu();
            });
        },

        closeMenu() {
            if (this.menu) this.menu.remove();
            this.menu = null;
        },

        toggleMenu(wrapper) {
            if (this.menu) {
                this.closeMenu();
                return;
            }
            const t = Themes.getTheme();
            const menu = Utils.createElement('div', {
                className: 'rel-saved-views-menu',
                style: {
                    position: 'absolute', top: '24px', right: '0', width: '310px', maxWidth: '90vw',
                    zIndex: '100000', padding: '10px', border: `1px solid ${t.border}`,
                    borderRadius: '6px', background: t.bgLight, color: t.fg,
                    boxShadow: `0 5px 20px ${t.shadow || 'rgba(0,0,0,0.35)'}`
                }
            });
            const title = Utils.createElement('strong', { textContent: 'Saved searches & filters' });
            title.style.display = 'block';
            title.style.marginBottom = '8px';
            menu.appendChild(title);

            const actions = Utils.createElement('div', { style: { display: 'flex', gap: '5px', marginBottom: '8px' } });
            const currentSearch = this.getCurrentSearch();
            if (currentSearch) actions.appendChild(this.makeActionButton('Save search', () => this.saveSearch(currentSearch)));
            actions.appendChild(this.makeActionButton('Save filters', () => this.saveFilters()));
            menu.appendChild(actions);

            if (savedViews.length === 0) {
                menu.appendChild(Utils.createElement('div', { textContent: 'Nothing saved yet.', style: { color: t.fgDim, fontSize: '12px' } }));
            } else {
                const list = Utils.createElement('div', { style: { display: 'grid', gap: '5px', maxHeight: '300px', overflowY: 'auto' } });
                [...savedViews].reverse().forEach(view => list.appendChild(this.renderView(view, t)));
                menu.appendChild(list);
            }
            this.menu = menu;
            wrapper.appendChild(menu);
        },

        makeActionButton(label, action) {
            return Utils.createElement('button', {
                type: 'button', textContent: label,
                style: { flex: '1', cursor: 'pointer', padding: '4px 6px', border: '1px solid currentColor', borderRadius: '4px', background: 'transparent', color: 'inherit' },
                onClick: event => { event.preventDefault(); action(); }
            });
        },

        renderView(view, theme) {
            const row = Utils.createElement('div', { style: { display: 'flex', gap: '5px', alignItems: 'center', padding: '5px', border: `1px solid ${theme.border}`, borderRadius: '4px' } });
            const label = Utils.createElement('span', { textContent: `${view.kind === 'filter' ? '\u2699' : '\u2315'} ${view.name}`, title: view.url });
            label.style.cssText = 'min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;';
            row.appendChild(label);
            row.appendChild(Utils.createElement('button', {
                type: 'button', textContent: 'open', title: view.kind === 'filter' ? 'Apply filter preset' : 'Open saved search',
                style: { cursor: 'pointer', padding: '2px 5px' },
                onClick: event => { event.preventDefault(); this.apply(view); }
            }));
            row.appendChild(Utils.createElement('button', {
                type: 'button', textContent: '\u00D7', title: 'Delete saved view',
                style: { cursor: 'pointer', padding: '2px 5px' },
                onClick: event => { event.preventDefault(); this.remove(view.id); }
            }));
            return row;
        },

        saveSearch(current = this.getCurrentSearch()) {
            if (!current) return false;
            const name = (prompt('Name this saved search:', current.name) || '').trim().slice(0, 100);
            if (!name) return false;
            this.add({ name, kind: 'search', url: current.url });
            return true;
        },

        saveFilters() {
            const name = (prompt('Name this filter preset:', 'Saved filters') || '').trim().slice(0, 100);
            if (!name) return false;
            this.add({ name, kind: 'filter', url: window.location.pathname || '/', filters: this.normalizeFilterSnapshot(filters) });
            return true;
        },

        add(view) {
            const normalized = this.normalizeView({ ...view, id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: Date.now(), updatedAt: Date.now() }, savedViews.length);
            if (!normalized) return false;
            savedViews = [...savedViews.filter(existing => existing.name.toLowerCase() !== normalized.name.toLowerCase()), normalized].slice(-50);
            saveSavedViews();
            if (this.menu) {
                const wrapper = this.menu.parentElement;
                this.closeMenu();
                if (wrapper) this.toggleMenu(wrapper);
            }
            Utils.notify(`Saved ${normalized.kind} "${normalized.name}"`, 'success');
            return true;
        },

        apply(view) {
            if (!view) return false;
            if (view.kind === 'filter') {
                filters = { ...filters, ...this.normalizeFilterSnapshot(view.filters) };
                saveFilters();
                FilterModule.refresh();
                this.closeMenu();
                Utils.notify(`Applied filter preset "${view.name}"`, 'success');
            } else {
                const normalized = this.normalizeView(view);
                if (!normalized) return false;
                window.location.href = normalized.url;
            }
            return true;
        },

        remove(id) {
            const before = savedViews.length;
            savedViews = savedViews.filter(view => view.id !== id);
            if (savedViews.length === before) return false;
            saveSavedViews();
            const wrapper = this.menu?.parentElement;
            this.closeMenu();
            if (wrapper) this.toggleMenu(wrapper);
            return true;
        }
    };

    // =========================================================================
    // MULTI-REDDIT BUILDER MODULE
    // =========================================================================
    const MultiRedditModule = {
        overlay: null,
        modalCleanup: null,

        normalizeSubreddit(value) {
            const name = String(value || '').trim().replace(/^\/r\//i, '').replace(/^r\//i, '');
            return /^[A-Za-z0-9_][A-Za-z0-9_\-]{1,49}$/.test(name) ? name : null;
        },

        normalizeMultiReddit(item, index = 0) {
            if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
            const subreddits = Array.isArray(item.subreddits)
                ? [...new Set(item.subreddits.map(value => this.normalizeSubreddit(value)).filter(Boolean))].slice(0, 50)
                : [];
            if (subreddits.length === 0) return null;
            const sort = ['hot', 'new', 'top', 'rising', 'controversial'].includes(item.sort) ? item.sort : 'hot';
            const fallbackName = subreddits.slice(0, 3).join(' + ');
            return {
                id: String(item.id || `multi-${index + 1}`).slice(0, 120),
                name: String(item.name || fallbackName).trim().slice(0, 80) || fallbackName,
                subreddits,
                sort,
                createdAt: Number.isFinite(Number(item.createdAt)) ? Number(item.createdAt) : Date.now(),
                updatedAt: Number.isFinite(Number(item.updatedAt)) ? Number(item.updatedAt) : Date.now()
            };
        },

        buildUrl(subreddits, sort = 'hot') {
            const names = (Array.isArray(subreddits) ? subreddits : String(subreddits || '').split(/[+,\s]+/))
                .map(value => this.normalizeSubreddit(value)).filter(Boolean);
            if (names.length === 0) return '/';
            const url = `/r/${[...new Set(names)].join('+')}/`;
            return sort && sort !== 'hot' ? `${url}?sort=${encodeURIComponent(sort)}` : url;
        },

        init() {
            if (!settings.multiRedditBuilder) return;
            multiReddits = multiReddits.map((item, index) => this.normalizeMultiReddit(item, index)).filter(Boolean).slice(-30);
            saveMultiReddits();
            const userbar = document.querySelector('#header-bottom-right');
            if (!userbar || userbar.querySelector('.rel-multi-reddit-wrap')) return;
            const wrapper = Utils.createElement('span', {
                className: 'rel-multi-reddit-wrap',
                style: { display: 'inline-block', marginRight: '6px' }
            });
            const button = Utils.createElement('button', {
                className: 'rel-multi-reddit-btn',
                textContent: '\u2637 multi',
                title: 'Build a combined subreddit feed',
                type: 'button',
                style: { cursor: 'pointer', border: '0', background: 'transparent', color: 'inherit', padding: '2px 4px' },
                onClick: event => { event.preventDefault(); this.showBuilder(); }
            });
            wrapper.appendChild(button);
            userbar.prepend(wrapper);
            GM_registerMenuCommand('REC Multi-Reddit Builder', () => this.showBuilder());
        },

        makeButton(label, action, theme) {
            return Utils.createElement('button', {
                type: 'button', textContent: label,
                style: { cursor: 'pointer', padding: '5px 8px', border: `1px solid ${theme.border}`, borderRadius: '4px', background: theme.surface, color: theme.fg },
                onClick: event => { event.preventDefault(); action(); }
            });
        },

        showBuilder(editItem = null) {
            if (this.overlay) this.close();
            const t = Themes.getTheme();
            const overlay = Utils.createElement('div', {
                className: 'rel-multi-reddit-overlay',
                style: { position: 'fixed', inset: '0', zIndex: '100001', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
            });
            const panel = Utils.createElement('div', {
                className: 'rel-multi-reddit-panel',
                style: { width: '520px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '16px', border: `1px solid ${t.border}`, borderRadius: '8px', background: t.bgLight, color: t.fg, boxShadow: `0 10px 40px ${t.shadow || 'rgba(0,0,0,0.4)'}` }
            });
            const title = Utils.createElement('h2', { textContent: editItem ? 'Edit multi-reddit' : 'Multi-reddit builder', style: { margin: '0 0 6px' } });
            panel.appendChild(title);
            panel.appendChild(Utils.createElement('p', { textContent: 'Combine subreddits into one old Reddit feed. Enter one name per line or separate names with +.', style: { margin: '0 0 12px', color: t.fgDim, fontSize: '12px' } }));

            const name = Utils.createElement('input', { type: 'text', className: 'rel-input', placeholder: 'Name, e.g. Tech reading', value: editItem?.name || '', style: { width: '100%', boxSizing: 'border-box', marginBottom: '8px' } });
            const subreddits = Utils.createElement('textarea', { className: 'rel-input', placeholder: 'technology\nprogramming\nopensource', style: { width: '100%', minHeight: '110px', boxSizing: 'border-box', marginBottom: '8px' } });
            subreddits.value = editItem?.subreddits?.join('\n') || '';
            const sort = Utils.createElement('select', { className: 'rel-input', style: { width: '100%', boxSizing: 'border-box', marginBottom: '12px' } });
            ['hot', 'new', 'top', 'rising', 'controversial'].forEach(value => {
                const option = Utils.createElement('option', { value, textContent: value });
                if ((editItem?.sort || 'hot') === value) option.selected = true;
                sort.appendChild(option);
            });
            panel.appendChild(Utils.createElement('label', { textContent: 'Name', style: { display: 'block', marginBottom: '4px', fontSize: '12px' } }));
            panel.appendChild(name);
            panel.appendChild(Utils.createElement('label', { textContent: 'Subreddits', style: { display: 'block', marginBottom: '4px', fontSize: '12px' } }));
            panel.appendChild(subreddits);
            panel.appendChild(Utils.createElement('label', { textContent: 'Sort order', style: { display: 'block', marginBottom: '4px', fontSize: '12px' } }));
            panel.appendChild(sort);

            const formActions = Utils.createElement('div', { style: { display: 'flex', gap: '6px', justifyContent: 'flex-end', marginBottom: '16px' } });
            formActions.appendChild(this.makeButton('Cancel', () => this.close(), t));
            formActions.appendChild(this.makeButton(editItem ? 'Update' : 'Save', () => {
                const parsed = this.normalizeMultiReddit({
                    id: editItem?.id,
                    name: name.value,
                    subreddits: subreddits.value.split(/[+,\s]+/),
                    sort: sort.value,
                    createdAt: editItem?.createdAt,
                    updatedAt: Date.now()
                });
                if (!parsed) {
                    Utils.notify('Add at least one valid subreddit (letters, numbers, _ or -).', 'warning');
                    return;
                }
                this.save(parsed);
                this.showBuilder();
            }, t));
            panel.appendChild(formActions);

            const heading = Utils.createElement('h3', { textContent: 'Saved feeds', style: { margin: '0 0 8px' } });
            panel.appendChild(heading);
            const list = Utils.createElement('div', { style: { display: 'grid', gap: '6px' } });
            if (multiReddits.length === 0) list.appendChild(Utils.createElement('div', { textContent: 'No feeds saved yet.', style: { color: t.fgDim, fontSize: '12px' } }));
            multiReddits.slice().reverse().forEach(item => {
                const row = Utils.createElement('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', padding: '7px', border: `1px solid ${t.border}`, borderRadius: '4px' } });
                const label = Utils.createElement('span', { textContent: `${item.name} · ${item.subreddits.join(' + ')}`, title: item.subreddits.join(', ') });
                label.style.cssText = 'min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;';
                row.appendChild(label);
                row.appendChild(this.makeButton('open', () => { window.location.href = this.buildUrl(item.subreddits, item.sort); }, t));
                row.appendChild(this.makeButton('edit', () => this.showBuilder(item), t));
                row.appendChild(this.makeButton('\u00D7', () => { this.remove(item.id); this.showBuilder(); }, t));
                list.appendChild(row);
            });
            panel.appendChild(list);
            overlay.appendChild(panel);
            overlay.addEventListener('click', event => { if (event.target === overlay) this.close(); });
            document.body.appendChild(overlay);
            this.overlay = overlay;
            this.modalCleanup = ModalA11yModule.attach(overlay, panel, () => this.close());
            name.focus();
        },

        close() {
            this.modalCleanup?.();
            this.modalCleanup = null;
            if (this.overlay) this.overlay.remove();
            this.overlay = null;
        },

        save(item) {
            multiReddits = [...multiReddits.filter(existing => existing.id !== item.id && existing.name.toLowerCase() !== item.name.toLowerCase()), item].slice(-30);
            saveMultiReddits();
            Utils.notify(`Saved multi-reddit "${item.name}"`, 'success');
        },

        remove(id) {
            multiReddits = multiReddits.filter(item => item.id !== id);
            saveMultiReddits();
        }
    };

    // =========================================================================
    // COMMENT QUOTE SELECTION MODULE
    // =========================================================================
    const QuoteSelectionModule = {
        init() {
            if (!settings.formattingToolbar) return;
            this.process(document);
        },

        formatQuote(text) {
            const value = String(text || '').trim();
            return value ? value.split(/\r?\n/).map(line => `> ${line}`).join('\n') : '';
        },

        getSelectedText(comment) {
            const selection = window.getSelection?.();
            if (!selection || selection.isCollapsed || !selection.rangeCount) return '';
            const anchor = selection.anchorNode;
            const focus = selection.focusNode;
            if (!anchor || !focus || !comment.contains(anchor) || !comment.contains(focus)) return '';
            return selection.toString().trim();
        },

        insertIntoTextarea(text, comment) {
            const textarea = comment.querySelector('textarea') || document.querySelector('.rel-reply-form textarea:focus, .usertext-edit textarea:focus');
            if (!textarea) return false;
            const start = Number.isInteger(textarea.selectionStart) ? textarea.selectionStart : textarea.value.length;
            const end = Number.isInteger(textarea.selectionEnd) ? textarea.selectionEnd : start;
            const prefix = textarea.value && start > 0 && !textarea.value.slice(0, start).endsWith('\n') ? '\n' : '';
            textarea.setRangeText(`${prefix}${text}\n`, start, end, 'end');
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
            return true;
        },

        process(container) {
            if (!settings.formattingToolbar) return;
            container.querySelectorAll('.comment:not([data-rel-quote])').forEach(comment => {
                comment.setAttribute('data-rel-quote', '1');
                const buttons = comment.querySelector(':scope > .entry .flat-list.buttons');
                if (!buttons) return;
                const item = Utils.createElement('li', { className: 'rel-quote-button' });
                const link = Utils.createElement('a', {
                    href: 'javascript:void(0)', textContent: 'quote', title: 'Quote selected comment text as Markdown'
                });
                let pendingSelection = '';
                link.addEventListener('mousedown', event => {
                    pendingSelection = this.getSelectedText(comment);
                    event.preventDefault();
                });
                link.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    const quote = this.formatQuote(pendingSelection || this.getSelectedText(comment));
                    pendingSelection = '';
                    if (!quote) {
                        Utils.notify('Select comment text before choosing quote', 'info');
                        return;
                    }
                    if (this.insertIntoTextarea(quote, comment)) {
                        Utils.notify('Quote inserted', 'success');
                    } else if (Utils.copyToClipboard(quote)) {
                        Utils.notify('Quote copied to clipboard', 'success');
                    } else {
                        Utils.notify('Could not insert or copy quote', 'error');
                    }
                });
                item.appendChild(link);
                buttons.appendChild(item);
            });
        }
    };

    // =========================================================================
    // INLINE SPOILER TAG MODULE
    // =========================================================================
    const SpoilerTagModule = {
        extractSpoilerText(text) {
            return [...String(text || '').matchAll(/>!([\s\S]*?)!</g)].map(match => match[1]);
        },

        process(container) {
            if (!settings.spoilerTags) return;
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
            const textNodes = [];
            let node;
            while ((node = walker.nextNode())) textNodes.push(node);
            textNodes.forEach(textNode => {
                const parent = textNode.parentElement;
                if (!parent || parent.closest('a, code, pre, .spoiler') || !this.extractSpoilerText(textNode.nodeValue).length) return;
                const value = textNode.nodeValue;
                const fragment = document.createDocumentFragment();
                let cursor = 0;
                const pattern = />!([\s\S]*?)!</g;
                let match;
                while ((match = pattern.exec(value))) {
                    if (match.index > cursor) fragment.appendChild(document.createTextNode(value.slice(cursor, match.index)));
                    const spoiler = document.createElement('span');
                    spoiler.className = 'spoiler rel-inline-spoiler';
                    spoiler.textContent = match[1];
                    spoiler.title = 'Click to reveal spoiler';
                    spoiler.addEventListener('click', event => {
                        event.preventDefault();
                        spoiler.classList.toggle('rel-spoiler-revealed');
                    });
                    fragment.appendChild(spoiler);
                    cursor = match.index + match[0].length;
                }
                if (cursor < value.length) fragment.appendChild(document.createTextNode(value.slice(cursor)));
                parent.replaceChild(fragment, textNode);
            });
        }
    };

    if (window.__REC_TEST_HOOKS__) {
        Object.assign(window.__REC_TEST_HOOKS__, {
            parseGalleryImages: ImageExpansionModule.parseGalleryImages.bind(ImageExpansionModule),
            getGalleryIndex: ImageExpansionModule.getGalleryIndex.bind(ImageExpansionModule),
            extractRedgifsId: ImageExpansionModule.extractRedgifsId.bind(ImageExpansionModule),
            extractStreamableId: ImageExpansionModule.extractStreamableId.bind(ImageExpansionModule),
            extractRedditVideoId: ImageExpansionModule.extractRedditVideoId.bind(ImageExpansionModule),
            buildRedditVideoUrls: ImageExpansionModule.buildRedditVideoUrls.bind(ImageExpansionModule),
            selectRedgifsMedia: ImageExpansionModule.selectRedgifsMedia.bind(ImageExpansionModule),
            selectStreamableFile: ImageExpansionModule.selectStreamableFile.bind(ImageExpansionModule),
            isSupportedImageUrl: ImageExpansionModule.isSupportedImageUrl.bind(ImageExpansionModule),
            extractImageUrlsFromHTML: ImageExpansionModule.extractImageUrlsFromHTML.bind(ImageExpansionModule),
            extractTweetId: SocialMediaPreviewModule.extractTweetId.bind(SocialMediaPreviewModule),
            selectTweetMedia: SocialMediaPreviewModule.selectTweetMedia.bind(SocialMediaPreviewModule),
            buildRefreshUrl: CommentRefreshModule.buildRefreshUrl.bind(CommentRefreshModule),
            formatQuote: QuoteSelectionModule.formatQuote.bind(QuoteSelectionModule),
            extractSpoilerText: SpoilerTagModule.extractSpoilerText.bind(SpoilerTagModule),
            renderMarkdown: FormattingToolbarModule.renderMarkdown.bind(FormattingToolbarModule),
            normalizeUserTag,
            mergeSubredditFilters: FilterModule.mergeSubredditFilters.bind(FilterModule),
            getEffectiveFilters: FilterModule.getEffectiveFilters.bind(FilterModule),
            testRegexRule: FilterModule.testRegexRule.bind(FilterModule),
            scoreLowEffortTitle: FilterModule.scoreLowEffortTitle.bind(FilterModule),
            isLowEffortTitle: FilterModule.isLowEffortTitle.bind(FilterModule),
            serializeBlockList: SettingsModule.serializeBlockList.bind(SettingsModule),
            parseBlockList: SettingsModule.parseBlockList.bind(SettingsModule),
            normalizeSavedView: SavedViewsModule.normalizeView.bind(SavedViewsModule),
            normalizeFilterSnapshot: SavedViewsModule.normalizeFilterSnapshot.bind(SavedViewsModule),
            buildSearchUrl: SavedViewsModule.buildSearchUrl.bind(SavedViewsModule),
            normalizeSubreddit: MultiRedditModule.normalizeSubreddit.bind(MultiRedditModule),
            normalizeMultiReddit: MultiRedditModule.normalizeMultiReddit.bind(MultiRedditModule),
            buildMultiRedditUrl: MultiRedditModule.buildUrl.bind(MultiRedditModule),
            getThreadId: SessionTabsModule.getThreadId.bind(SessionTabsModule),
            normalizeSessionTab: SessionTabsModule.normalizeTab.bind(SessionTabsModule),
            isMessagePath: InboxReadModule.isMessagePath.bind(InboxReadModule),
            buildMarkAllReadBody: InboxReadModule.buildRequestBody.bind(InboxReadModule),
            normalizeSyncProvider: SyncModule.normalizeProvider.bind(SyncModule),
            getGistId: SyncModule.getGistId.bind(SyncModule),
            getPasteRawUrl: SyncModule.getPasteRawUrl.bind(SyncModule),
            getWebDavUrl: SyncModule.getWebDavUrl.bind(SyncModule),
            createSyncSnapshot: SyncModule.createSnapshot.bind(SyncModule),
            encryptSyncSnapshot: SyncModule.encryptSnapshot.bind(SyncModule),
            decryptSyncSnapshot: SyncModule.decryptSnapshot.bind(SyncModule),
            buildProfileStorageKey,
            getProfileMode: ProfileModule.getMode.bind(ProfileModule),
            getSettingsDiff: SettingsDiffModule.getDiff.bind(SettingsDiffModule),
            validateCanaryPayload: ApiCanaryModule.validatePayload.bind(ApiCanaryModule),
            shouldCheckApiCanary: ApiCanaryModule.shouldCheck.bind(ApiCanaryModule),
            classifySwipe: TouchGestureModule.classifySwipe.bind(TouchGestureModule),
            getNextFocusIndex: ModalA11yModule.getNextFocusIndex.bind(ModalA11yModule),
            getDialogAttributes: ModalA11yModule.getDialogAttributes.bind(ModalA11yModule),
            getDiscordChannelLabel: DiscordLayoutModule.getChannelLabel.bind(DiscordLayoutModule),
            getDiscordInitials: DiscordLayoutModule.getInitials.bind(DiscordLayoutModule),
            normalizePaletteValue: PaletteModule.normalizeValue.bind(PaletteModule),
            normalizePalettes: PaletteModule.normalizePalettes.bind(PaletteModule),
            normalizeFontPairing: FontPairingModule.normalizePairing.bind(FontPairingModule),
            getFontPairing: FontPairingModule.getPairing.bind(FontPairingModule),
            normalizeAnalyticsStats: AnalyticsModule.normalizeStats.bind(AnalyticsModule),
            createFactoryBackup: Storage.createFactoryBackup.bind(Storage),
            observeForTest: ObserverRegistry.observe.bind(ObserverRegistry),
            disconnectObservers: ObserverRegistry.disconnectAll.bind(ObserverRegistry),
            reconnectObservers: ObserverRegistry.reconnectAll.bind(ObserverRegistry),
            auditObservers: ObserverRegistry.audit.bind(ObserverRegistry),
            clearObservers: ObserverRegistry.clear.bind(ObserverRegistry),
            normalizeUsername: CommentSweepModule.normalizeUsername.bind(CommentSweepModule),
            matchesAuthor: CommentSweepModule.matchesAuthor.bind(CommentSweepModule)
        });
    }

    function initModules() {
        // Apply body classes
        DarkModeModule.init();
        FontPairingModule.init();
        AnalyticsModule.init();

        // Style/Layout modules (run early)
        SubredditStyleRemoverModule.init();
        WideViewModule.init();
        DiscordLayoutModule.init();
        AdBlockModule.init();

        // UI modules
        CollapsibleSidebarModule.init();
        OldFaviconModule.init();
            SettingsModule.init();
            PageNavigatorModule.init();
            TouchGestureModule.init();
            SubredditShortcutsModule.init();
            SavedViewsModule.init();
            MultiRedditModule.init();
            SessionTabsModule.init();
            InboxReadModule.init();
            ApiCanaryModule.init();
            SubredditDescriptionModule.init();

        // Content modules
        UserTaggingModule.init();
        UserHighlighterModule.init();
        ImageExpansionModule.init();
        InlineImageFixModule.init();
        YouTubeEmbedModule.init();
        RedditPreviewModule.init();
        SocialMediaPreviewModule.init();
        SingleClickModule.init();
        TimestampModule.init();
        DownloadButtonsModule.init();

        // Comment modules
        CollapseChildCommentsModule.init();
        CommentHighlightingModule.init();
        CommentDepthModule.init();
        FormattingToolbarModule.init();
        QuoteSelectionModule.init();
        SpoilerTagModule.process(document);
        ExpandThreadModule.init();
        HideAutoModeratorModule.init();
        IgnoredUsersModule.init();
        CommentNavigatorModule.init();
        CommentSearchModule.init();
        CommentRefreshModule.init();

        // Fallback comment toggle - handles expand/collapse when Reddit's jQuery is broken
        // ($(...).thing / $(...).slideUp errors in reddit-init.js)
        // Override Reddit's global togglecomment which relies on broken jQuery .thing() plugin
        const nativeToggle = function(el) {
            const comment = el.closest ? el.closest('.comment') : el.parentElement && el.parentElement.closest('.comment');
            if (!comment) return false;
            const isCollapsed = comment.classList.contains('collapsed');
            if (isCollapsed) {
                comment.classList.remove('collapsed');
                comment.classList.add('noncollapsed');
            } else {
                comment.classList.add('collapsed');
                comment.classList.remove('noncollapsed');
            }
            return false;
        };
        // Inject togglecomment override into page scope
        const script = document.createElement('script');
        script.textContent = `window.togglecomment = ${nativeToggle.toString()};`;
        document.documentElement.appendChild(script);
        script.remove();

        // Native reply handler - intercepts reply clicks before Reddit's broken jQuery runs
        // Strip inline onclick from all reply buttons to prevent Reddit's broken reply() from firing
        const stripReplyOnclick = (root) => {
            root.querySelectorAll('.reply-button a[onclick], a[onclick*="reply"]').forEach(a => {
                a.removeAttribute('onclick');
                a.setAttribute('data-rel-reply', '1');
            });
        };
        stripReplyOnclick(document);
        // Native dropdown menu handler - Reddit's open_menu() uses broken jQuery
        // Strip inline onclick from all dropdowns
        const stripDropdownOnclick = (root) => {
            root.querySelectorAll('.dropdown[onclick*="open_menu"]').forEach(dd => {
                dd.removeAttribute('onclick');
                dd.setAttribute('data-rel-dropdown', '1');
                dd.style.cursor = 'pointer';
            });
        };
        stripDropdownOnclick(document);
        // Single consolidated MutationObserver for both reply and dropdown onclick stripping
        ObserverRegistry.observe(document.body || document.documentElement, muts => {
            muts.forEach(m => m.addedNodes.forEach(n => {
                if (n.nodeType === 1) {
                    stripReplyOnclick(n);
                    stripDropdownOnclick(n);
                }
            }));
        }, { childList: true, subtree: true }, 'native-event-sanitizer');

        document.addEventListener('click', function(e) {
            const replyLink = e.target.closest('.reply-button a, a[data-rel-reply]');
            if (!replyLink) return;
            e.preventDefault();
            e.stopPropagation();

            // Walk up to the .entry, then to the .thing - avoids nesting confusion
            const entry = replyLink.closest('.entry');
            const thing = entry?.closest('.thing');
            if (!thing || !entry) return;

            // Check for our existing reply form (toggle it)
            const existingRelForm = entry.querySelector(':scope > .rel-reply-form');
            if (existingRelForm) {
                const isHidden = existingRelForm.style.display === 'none';
                existingRelForm.style.display = isHidden ? 'block' : 'none';
                if (isHidden) {
                    const ta = existingRelForm.querySelector('textarea');
                    if (ta) ta.focus();
                }
                return;
            }

            const thingId = thing.getAttribute('data-fullname') || '';
            const modhash = document.querySelector('input[name="uh"]')?.value || '';
            const t = Themes.getTheme();

            const formWrapper = document.createElement('div');
            formWrapper.className = 'rel-reply-form';
            formWrapper.style.cssText = 'margin: 6px 0; padding: 0;';
            formWrapper.innerHTML = `
                <div class="usertext-edit md-container" style="width:100%;box-sizing:border-box;">
                    <div class="md">
                        <textarea rows="6" name="text" style="width:100%;box-sizing:border-box;min-height:120px;resize:vertical;padding:10px 12px;border-radius:6px;font-size:14px;line-height:1.6;background:${t.bgLight};color:${t.fg};border:1px solid ${t.border};font-family:inherit;"></textarea>
                    </div>
                    <div class="bottom-area" style="padding:6px 0;">
                        <div class="usertext-buttons" style="display:flex;gap:8px;">
                            <button type="button" class="rel-reply-save" style="padding:6px 16px;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;border:none;background:${t.accent};color:${t.bg};">save</button>
                            <button type="button" class="rel-reply-cancel" style="padding:6px 16px;border-radius:6px;cursor:pointer;font-size:13px;border:1px solid ${t.border};background:${t.surface};color:${t.fg};">cancel</button>
                        </div>
                    </div>
                </div>`;

            // Insert form INSIDE the .entry, after the buttons - avoids .child nesting issues
            entry.appendChild(formWrapper);

            const textarea = formWrapper.querySelector('textarea');
            const saveBtn = formWrapper.querySelector('.rel-reply-save');
            const cancelBtn = formWrapper.querySelector('.rel-reply-cancel');

            // Native reply forms are created after initial module startup; run
            // the same formatter path so toolbar and live preview are present.
            Utils.processNewContent(formWrapper);

            textarea.focus();

            cancelBtn.addEventListener('click', () => { formWrapper.style.display = 'none'; });

            saveBtn.addEventListener('click', () => {
                const text = textarea.value.trim();
                if (!text) return;
                saveBtn.textContent = 'saving...';
                saveBtn.disabled = true;

                const body = new URLSearchParams({ thing_id: thingId, uh: modhash, text: text, api_type: 'json' });
                fetch('/api/comment', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: body.toString()
                }).then(r => r.json()).then(data => {
                    let inserted = false;
                    let child = thing.querySelector(':scope > .child');
                    if (!child) {
                        child = document.createElement('div');
                        child.className = 'child';
                        thing.appendChild(child);
                    }

                    // Try jquery format first (HTML blob from Reddit)
                    if (data?.jquery) {
                        for (const cmd of data.jquery) {
                            if (cmd[3]?.[0] && typeof cmd[3][0] === 'string' && cmd[3][0].includes('class="thing')) {
                                child.insertAdjacentHTML('afterbegin', cmd[3][0]);
                                inserted = true;
                                break;
                            }
                        }
                    }

                    // Fallback: JSON format (api_type=json response)
                    if (!inserted && data?.json?.data?.things?.[0]?.data) {
                        const c = data.json.data.things[0].data;
                        const loggedUser = document.querySelector('.user a')?.textContent || c.author || 'you';
                        const commentHtml = `
                            <div class="thing comment id-${c.name} noncollapsed" data-fullname="${c.name}" data-author="${c.author}">
                                <div class="entry">
                                    <p class="tagline">
                                        <a href="/user/${c.author}" class="author">${c.author}</a>
                                        <span class="score dislikes">1 point</span>
                                        <span class="score unvoted">1 point</span>
                                        <span class="score likes">1 point</span>
                                        <time class="live-timestamp" datetime="${new Date().toISOString()}">just now</time>
                                    </p>
                                    <div class="md"><p>${c.body_html ? new DOMParser().parseFromString(c.body_html, 'text/html').body.innerHTML : Utils.escapeHTML(text)}</p></div>
                                    <ul class="flat-list buttons">
                                        <li class="first"><a class="bylink" href="${c.permalink || '#'}">permalink</a></li>
                                    </ul>
                                </div>
                                <div class="child"></div>
                            </div>`;
                        child.insertAdjacentHTML('afterbegin', commentHtml);
                        inserted = true;
                    }

                    formWrapper.style.display = 'none';
                    textarea.value = '';
                    saveBtn.textContent = 'save';
                    saveBtn.disabled = false;

                    // Process new comment for theming, tagging, depth indicators etc
                    if (inserted && child.firstElementChild) {
                        Utils.processNewContent(child.firstElementChild);
                    }
                }).catch(() => {
                    saveBtn.textContent = 'save';
                    saveBtn.disabled = false;
                    alert('Error posting comment. Please try again.');
                });
            });
        }, true);

        // Toggle dropdown on click
        document.addEventListener('click', function(e) {
            const dropdown = e.target.closest('.dropdown[data-rel-dropdown]');
            if (!dropdown) return;
            e.preventDefault();
            e.stopPropagation();

            // Find the associated .drop-choices (next sibling)
            const choices = dropdown.parentElement?.querySelector('.drop-choices');
            if (!choices) return;

            // Close all other open dropdowns first
            document.querySelectorAll('.drop-choices').forEach(d => {
                if (d !== choices) d.style.display = 'none';
            });

            // Toggle this one
            const isOpen = choices.style.display === 'block';
            choices.style.display = isOpen ? 'none' : 'block';

            // Position the dropdown
            if (!isOpen) {
                const rect = dropdown.getBoundingClientRect();
                choices.style.position = 'absolute';
                choices.style.top = (rect.bottom + window.scrollY) + 'px';
                choices.style.left = rect.left + 'px';
            }
        }, true);

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target.closest('.dropdown[data-rel-dropdown]')) return;
            document.querySelectorAll('.drop-choices').forEach(d => {
                if (!d.contains(e.target)) d.style.display = 'none';
            });
        }, false);

        // Vote modules
        VoteEnhancementsModule.init();

        // Navigation modules
        NeverEndingRedditModule.init();
        KeyboardNavModule.init();
        NoParticipationModule.init();
        UserInfoModule.init();
        StateSaverModule.init();

        // Classic Reddit++ features
        ViewCounterModule.init();
        VoteEstimatorModule.init();
        FullScoresModule.init();
        UserPrefixModule.init();
        TrendingSubredditsModule.init();

        // Filter module (run last)
        FilterModule.init();

        console.log(`Reddit Enhancement Continued v${VERSION} loaded - ${Object.keys(Themes.definitions).length} themes, ${Object.keys(settings).filter(k => settings[k] === true).length} features active`);

        // Safety check: verify posts are visible after all modules loaded
        setTimeout(() => {
            const allThings = document.querySelectorAll('#siteTable .thing.link');
            const visibleThings = document.querySelectorAll('#siteTable .thing.link:not([style*="display: none"])');

            if (allThings.length > 0 && visibleThings.length === 0) {
                console.warn('REL: All posts hidden via inline styles - restoring visibility');
                allThings.forEach(el => { el.style.display = ''; el.removeAttribute('data-rel-hidden'); });
            } else if (allThings.length > 0) {
                let cssHiddenCount = 0;
                allThings.forEach(el => {
                    if (window.getComputedStyle(el).display === 'none') cssHiddenCount++;
                });
                if (cssHiddenCount > 0 && cssHiddenCount >= allThings.length * 0.9) {
                    console.warn(`REL: ${cssHiddenCount}/${allThings.length} posts hidden by CSS - removing ad blocker styles`);
                    document.querySelectorAll('style').forEach(s => {
                        if (s.textContent.includes('.thing.promoted') || s.textContent.includes('REL Ad Blocker')) {
                            s.remove();
                        }
                    });
                }
            }
        }, 1000);
    }

    // Start
    init();

})();
