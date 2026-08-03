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
    fetch() { throw new Error('fetch should not run during low-effort tests'); }
});

const noisy = hooks.scoreLowEffortTitle('WOW COOL \uD83D\uDE02\uD83D\uDD25');
assert.equal(noisy.score, 3);
assert.equal(JSON.stringify(noisy.reasons), JSON.stringify(['short', 'uppercase', 'emoji']));
assert.equal(hooks.isLowEffortTitle('WOW COOL \uD83D\uDE02\uD83D\uDD25', 2), true);
assert.equal(hooks.isLowEffortTitle('A short title', 2), false);
assert.equal(hooks.isLowEffortTitle('A short title', 1), true);
assert.equal(hooks.scoreLowEffortTitle('A thoughtful title with normal casing and enough context').score, 0);

console.log('low-effort filter tests passed');
