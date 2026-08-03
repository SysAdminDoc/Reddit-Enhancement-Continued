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
    fetch() { throw new Error('fetch should not run during block-list tests'); }
});

const text = `# Reddit Enhancement Continued block list v1\nkeyword:cats\ndomain:example.com\nsubreddit:news\nflair:spoiler\nuser:spammer\n/legacy regex/\nregex:Low effort|low[- ]effort|i\n`;
const parsed = hooks.parseBlockList(text);
assert.equal(JSON.stringify(parsed.keywords), JSON.stringify(['cats', '/legacy regex/']));
assert.equal(JSON.stringify(parsed.domains), JSON.stringify(['example.com']));
assert.equal(JSON.stringify(parsed.subreddits), JSON.stringify(['news']));
assert.equal(parsed.regexGroups[0].name, 'Low effort');
assert.equal(parsed.regexGroups[0].pattern, 'low[- ]effort');

const serialized = hooks.serializeBlockList({
    keywords: ['cats'], domains: ['example.com'], subreddits: ['news'], flairs: ['spoiler'], users: ['spammer'],
    regexGroups: [{ name: 'Low effort', pattern: 'low[- ]effort', flags: 'i' }]
});
assert.match(serialized, /keyword:cats/);
assert.match(serialized, /regex:Low effort\|low\[- \]effort\|i/);

console.log('block-list tests passed');
