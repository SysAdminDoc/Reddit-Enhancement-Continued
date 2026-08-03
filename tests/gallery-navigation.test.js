const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'RedditEnhancementContinued.user.js'), 'utf8');
const hooks = {};
const emptyNode = {
    appendChild() {},
    remove() {},
    setAttribute() {},
    removeAttribute() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    classList: { contains() { return false; }, add() {}, remove() {} }
};
const document = {
    readyState: 'loading',
    body: emptyNode,
    head: emptyNode,
    documentElement: emptyNode,
    createElement() { return { ...emptyNode, style: {}, classList: { contains() { return false; }, add() {}, remove() {} } }; },
    createTextNode(text) { return { textContent: text }; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {}
};
const window = {
    __REC_TEST_HOOKS__: hooks,
    location: { hostname: 'old.reddit.com', pathname: '/', href: 'https://old.reddit.com/' },
    addEventListener() {},
    getComputedStyle() { return { display: '' }; }
};
window.window = window;
window.document = document;

vm.runInNewContext(source, {
    window,
    document,
    console,
    MutationObserver: class { observe() {} },
    GM_getValue() { return null; },
    GM_setValue() {},
    GM_deleteValue() {},
    GM_addStyle() {},
    GM_registerMenuCommand() {},
    GM_xmlhttpRequest() {},
    GM_setClipboard() {},
    requestAnimationFrame(callback) { callback(); },
    setTimeout() {},
    clearTimeout() {},
    fetch() { throw new Error('fetch should not run during parser tests'); }
});

assert.equal(typeof hooks.parseGalleryImages, 'function');
assert.equal(typeof hooks.getGalleryIndex, 'function');

const images = hooks.parseGalleryImages({
    gallery_data: { items: [
        { media_id: 'one', caption: ' first image ' },
        { media_id: 'two' },
        { media_id: 'missing' }
    ] },
    media_metadata: {
        one: { s: { u: 'https://i.redd.it/one.jpg?x=1&amp;y=2', x: 1920, y: 1080 } },
        two: { p: [{ u: 'https://preview.redd.it/small.jpg', x: 100, y: 50 }, { u: 'https://preview.redd.it/large.jpg', x: 800, y: 400 }] }
    }
});

assert.equal(JSON.stringify(images), JSON.stringify([
    { url: 'https://i.redd.it/one.jpg?x=1&y=2', width: 1920, height: 1080, caption: 'first image' },
    { url: 'https://preview.redd.it/large.jpg', width: 800, height: 400, caption: '' }
]));
assert.equal(hooks.getGalleryIndex(0, -1, 3), 2);
assert.equal(hooks.getGalleryIndex(2, 1, 3), 0);
assert.equal(hooks.getGalleryIndex(1, 1, 0), 0);

console.log('gallery navigation tests passed');
