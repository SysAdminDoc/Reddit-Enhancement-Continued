const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'RedditEnhancementContinued.user.js'), 'utf8');
const hooks = {};
const emptyNode = {
    appendChild() {},
    remove() {},
    setAttribute() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    classList: { contains() { return false; }, add() {}, remove() {} }
};
const document = {
    readyState: 'loading', body: emptyNode, head: emptyNode, documentElement: emptyNode,
    createElement() { return { ...emptyNode, style: {}, classList: { contains() { return false; }, add() {}, remove() {} } }; },
    createTextNode(text) { return { textContent: text }; },
    querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}
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
    fetch() { throw new Error('fetch should not run during image-host tests'); }
});

assert.equal(hooks.isSupportedImageUrl('https://files.catbox.moe/example.jpg'), true);
assert.equal(hooks.isSupportedImageUrl('https://cdn.imgchest.com/example.png'), true);
assert.equal(hooks.isSupportedImageUrl('https://i.ibb.co/example.webp'), true);
assert.equal(hooks.isSupportedImageUrl('https://tracker.example/pixel.gif'), false);

const html = `
    <meta property="og:image" content="https://i.ibb.co/abc/one.jpg&amp;size=large">
    <img data-src="/media/two.png" src="https://cdn.imgchest.com/thumb.jpg">
    <img src="https://tracker.example/pixel.gif">
    <a href="https://files.catbox.moe/three.webp">download</a>
`;
const urls = hooks.extractImageUrlsFromHTML(html, 'https://imgchest.com/p/example');
assert.equal(JSON.stringify(urls), JSON.stringify([
    'https://i.ibb.co/abc/one.jpg&size=large',
    'https://imgchest.com/media/two.png',
    'https://cdn.imgchest.com/thumb.jpg',
    'https://files.catbox.moe/three.webp'
]));

console.log('image host tests passed');
