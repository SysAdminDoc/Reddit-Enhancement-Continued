const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'RedditEnhancementContinued.user.js'), 'utf8');
const hooks = {};
const emptyNode = {
    appendChild() {}, remove() {}, setAttribute() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener() {}, classList: { contains() { return false; }, add() {}, remove() {} }
};
const document = {
    readyState: 'loading', body: emptyNode, head: emptyNode, documentElement: emptyNode,
    createElement() { return { ...emptyNode, style: {}, classList: { contains() { return false; }, add() {}, remove() {} } }; },
    createTextNode(text) { return { textContent: text }; }, querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener() {}
};
const window = {
    __REC_TEST_HOOKS__: hooks,
    location: { hostname: 'old.reddit.com', pathname: '/', search: '', hash: '', href: 'https://old.reddit.com/' },
    addEventListener() {}, getComputedStyle() { return { display: '' }; }
};
window.window = window;
window.document = document;

vm.runInNewContext(source, {
    window, document, console, URL, URLSearchParams,
    MutationObserver: class { observe() {} },
    GM_getValue() { return null; }, GM_setValue() {}, GM_deleteValue() {}, GM_addStyle() {},
    GM_registerMenuCommand() {}, GM_xmlhttpRequest() {}, GM_setClipboard() {},
    requestAnimationFrame(callback) { callback(); }, setTimeout() {}, clearTimeout() {},
    fetch() { throw new Error('fetch should not run during analytics tests'); }
});

const stats = hooks.normalizeAnalyticsStats({ adsBlocked: 4.8, postsFiltered: -2, pageViews: '7', extra: 999 });
assert.equal(JSON.stringify(stats), JSON.stringify({ adsBlocked: 4, postsFiltered: 0, mediaExpanded: 0, pageViews: 7, lastUpdated: null }));

console.log('Analytics panel tests passed');
