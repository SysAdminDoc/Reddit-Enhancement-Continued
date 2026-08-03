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
    fetch() { throw new Error('fetch should not run during social-preview tests'); }
});

assert.equal(hooks.extractTweetId('https://x.com/example/status/1234567890'), '1234567890');
assert.equal(hooks.extractTweetId('https://twitter.com/example/status/9876543210?s=20'), '9876543210');
assert.equal(hooks.extractTweetId('https://x.com/example/post/123'), null);

const media = hooks.selectTweetMedia({
    mediaDetails: [
        { type: 'photo', media_url_https: 'https://pbs.twimg.com/photo.jpg', original_info: { width: 1200, height: 800 } },
        { type: 'video', media_url_https: 'https://pbs.twimg.com/poster.jpg', video_info: { variants: [
            { content_type: 'video/mp4', bitrate: 500, url: 'https://video.twimg.com/low.mp4' },
            { content_type: 'video/mp4', bitrate: 1000, url: 'https://video.twimg.com/high.mp4' }
        ] } }
    ],
    photos: [{ url: 'https://pbs.twimg.com/photo.jpg' }]
});
assert.equal(media.length, 2);
assert.equal(media[0].width, 1200);
assert.equal(media[1].variants.length, 2);

console.log('social preview tests passed');
