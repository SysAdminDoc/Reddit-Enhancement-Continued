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
    fetch() { throw new Error('fetch should not run during palette editor tests'); }
});

assert.equal(hooks.normalizePaletteValue('#aabbcc'), '#aabbcc');
assert.equal(hooks.normalizePaletteValue('rgba(1, 2, 3, .4)'), 'rgba(1, 2, 3, .4)');
assert.equal(hooks.normalizePaletteValue('url(javascript:alert(1))'), null);
assert.equal(hooks.normalizePaletteValue('#fff; color:red'), null);
const palettes = hooks.normalizePalettes({ dracula: { accent: '#123456', bad: 'url(x)' }, unknown: { bg: '#000000' } });
assert.equal(palettes.dracula.accent, '#123456');
assert.equal(palettes.dracula.bad, undefined);
assert.equal(palettes.unknown, undefined);

console.log('Palette editor tests passed');
