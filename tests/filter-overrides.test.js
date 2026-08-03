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
    location: { hostname: 'old.reddit.com', pathname: '/', href: 'https://old.reddit.com/' },
    addEventListener() {}, getComputedStyle() { return { display: '' }; }
};
window.window = window;
window.document = document;

vm.runInNewContext(source, {
    window, document, console, URL,
    MutationObserver: class { observe() {} },
    GM_getValue() { return null; }, GM_setValue() {}, GM_deleteValue() {}, GM_addStyle() {},
    GM_registerMenuCommand() {}, GM_xmlhttpRequest() {}, GM_setClipboard() {},
    requestAnimationFrame(callback) { callback(); }, setTimeout() {}, clearTimeout() {},
    fetch() { throw new Error('fetch should not run during filter tests'); }
});

const base = {
    keywords: ['global'], domains: ['global.example'], subreddits: [], flairs: [], users: [],
    hideNSFW: true, useRegex: false
};
const merged = hooks.mergeSubredditFilters(base, {
    mode: 'merge', keywords: ['local'], domains: ['local.example'], hideNSFW: false
});
assert.equal(JSON.stringify(merged.keywords), JSON.stringify(['global', 'local']));
assert.equal(JSON.stringify(merged.domains), JSON.stringify(['global.example', 'local.example']));
assert.equal(merged.hideNSFW, false);

const replaced = hooks.mergeSubredditFilters(base, {
    mode: 'replace', keywords: ['only-local'], domains: [], hideNSFW: null
});
assert.equal(JSON.stringify(replaced.keywords), JSON.stringify(['only-local']));
assert.equal(JSON.stringify(replaced.domains), JSON.stringify([]));
assert.equal(replaced.hideNSFW, true);

const disabled = hooks.mergeSubredditFilters(base, { enabled: false });
assert.equal(disabled.enabled, false);

console.log('filter override tests passed');
