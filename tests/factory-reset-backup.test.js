const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'RedditEnhancementContinued.user.js'), 'utf8');
const hooks = {};
const values = new Map();
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
    GM_getValue(key, fallback) { return values.has(key) ? values.get(key) : fallback; },
    GM_setValue(key, value) { values.set(key, value); },
    GM_deleteValue(key) { values.delete(key); },
    GM_addStyle() {}, GM_registerMenuCommand() {}, GM_xmlhttpRequest() {}, GM_setClipboard() {},
    requestAnimationFrame(callback) { callback(); }, setTimeout() {}, clearTimeout() {},
    fetch() { throw new Error('fetch should not run during factory reset tests'); }
});

const payload = hooks.createFactoryBackup();
assert.equal(typeof JSON.parse(payload), 'object');
const stored = JSON.parse(values.get('rel_factory_backup_v1'));
assert.equal(stored.version, '2.8.1');
assert.equal(stored.payload, payload);

console.log('Factory reset backup tests passed');
