const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'RedditEnhancementContinued.user.js'), 'utf8');
const hooks = {};
const observers = [];
class FakeMutationObserver {
    constructor(callback) { this.callback = callback; this.connected = false; observers.push(this); }
    observe() { this.connected = true; }
    disconnect() { this.connected = false; }
}
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
    window, document, console, URL, URLSearchParams, MutationObserver: FakeMutationObserver,
    GM_getValue() { return null; }, GM_setValue() {}, GM_deleteValue() {}, GM_addStyle() {},
    GM_registerMenuCommand() {}, GM_xmlhttpRequest() {}, GM_setClipboard() {},
    requestAnimationFrame(callback) { callback(); }, setTimeout() {}, clearTimeout() {},
    fetch() { throw new Error('fetch should not run during observer leak tests'); }
});

const target = {};
hooks.clearObservers();
const initialObserverCount = observers.length;
for (let page = 0; page < 100; page++) {
    hooks.observeForTest(target, () => {}, { childList: true }, 'ner-long-scroll');
}
assert.equal(hooks.auditObservers().length, 1);
assert.equal(observers.length - initialObserverCount, 100);
assert.equal(hooks.auditObservers()[0].connected, true);

hooks.disconnectObservers();
assert.equal(hooks.auditObservers()[0].connected, false);
hooks.reconnectObservers();
assert.equal(hooks.auditObservers()[0].connected, true);
hooks.clearObservers();
assert.equal(hooks.auditObservers().length, 0);

console.log('NER observer leak tests passed');
