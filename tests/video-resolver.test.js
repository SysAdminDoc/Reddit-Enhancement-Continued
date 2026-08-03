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
    fetch() { throw new Error('fetch should not run during resolver tests'); }
});

assert.equal(hooks.extractRedgifsId('https://redgifs.com/watch/AbC123'), 'AbC123');
assert.equal(hooks.extractStreamableId('https://streamable.com/o/hn8hq'), 'hn8hq');
assert.equal(hooks.extractStreamableId('https://streamable.com/hn8hq'), 'hn8hq');
assert.equal(hooks.extractRedditVideoId('https://v.redd.it/abc123/DASH_720.mp4'), 'abc123');
assert.equal(JSON.stringify(hooks.buildRedditVideoUrls('https://v.redd.it/abc123', '480')), JSON.stringify({
    video: 'https://v.redd.it/abc123/DASH_480.mp4',
    audio: 'https://v.redd.it/abc123/DASH_AUDIO_128.mp4'
}));

const redgifs = hooks.selectRedgifsMedia({
    gif: {
        width: 1280,
        height: 720,
        has_audio: true,
        urls: {
            hd: 'https://files.redgifs.com/clip.mp4',
            vthumbnail: 'https://files.redgifs.com/clip.jpg'
        }
    }
});
assert.equal(JSON.stringify(redgifs), JSON.stringify({
    url: 'https://files.redgifs.com/clip.mp4',
    width: 1280,
    height: 720,
    hasAudio: true,
    poster: 'https://files.redgifs.com/clip.jpg'
}));

const streamable = hooks.selectStreamableFile({
    files: {
        'mp4-mobile': { status: 2, url: '//cdn.example/mobile.mp4', width: 640, height: 360, bitrate: 1000 },
        mp4: { status: 2, url: 'https://cdn.example/hd.mp4', width: 1280, height: 720, bitrate: 2000 },
        pending: { status: 1, url: 'https://cdn.example/pending.mp4', width: 3840, height: 2160 }
    }
});
assert.equal(streamable.url, 'https://cdn.example/hd.mp4');
assert.equal(streamable.width, 1280);
assert.equal(hooks.selectStreamableFile({ files: {} }), null);

console.log('video resolver tests passed');
