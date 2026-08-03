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
    fetch() { throw new Error('fetch should not run during saved views tests'); }
});

assert.equal(hooks.buildSearchUrl('cats & dogs'), '/search?q=cats+%26+dogs');
assert.deepEqual(hooks.normalizeSavedView({
    kind: 'search', name: '  Search  ', url: 'https://www.reddit.com/search?q=cats'
}).url, '/search?q=cats');
assert.equal(hooks.normalizeSavedView({ kind: 'search', url: 'javascript:alert(1)' }), null);

const filters = hooks.normalizeFilterSnapshot({
    keywords: [' cats ', 'cats', 'dogs'],
    regexGroups: [{ name: 'caps', pattern: 'WOW', flags: 'gi', hits: 99 }],
    hideNSFW: true
});
assert.equal(JSON.stringify(filters.keywords), JSON.stringify(['cats', 'dogs']));
assert.equal(filters.regexGroups[0].hits, undefined);
assert.equal(filters.regexGroups[0].flags, 'gi');
assert.equal(filters.hideNSFW, true);

console.log('Saved views tests passed');
