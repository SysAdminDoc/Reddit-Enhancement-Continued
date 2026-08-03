const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

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
    crypto: webcrypto,
    TextEncoder,
    TextDecoder,
    btoa,
    atob,
    location: { hostname: 'old.reddit.com', pathname: '/', search: '', hash: '', href: 'https://old.reddit.com/' },
    addEventListener() {}, getComputedStyle() { return { display: '' }; }
};
window.window = window;
window.document = document;

vm.runInNewContext(source, {
    window, document, console, URL, URLSearchParams, crypto: webcrypto, TextEncoder, TextDecoder, btoa, atob,
    MutationObserver: class { observe() {} },
    GM_getValue() { return null; }, GM_setValue() {}, GM_deleteValue() {}, GM_addStyle() {},
    GM_registerMenuCommand() {}, GM_xmlhttpRequest() {}, GM_setClipboard() {},
    requestAnimationFrame(callback) { callback(); }, setTimeout() {}, clearTimeout() {},
    fetch() { throw new Error('fetch should not run during sync crypto tests'); }
});

assert.equal(hooks.normalizeSyncProvider('GIST'), 'gist');
assert.equal(hooks.normalizeSyncProvider('disabled'), 'none');
assert.equal(hooks.getGistId('https://api.github.com/gists/abc123'), 'abc123');
assert.equal(hooks.getPasteRawUrl('abc123'), 'https://pastebin.com/raw/abc123');
assert.equal(hooks.getWebDavUrl('javascript:alert(1)'), '');

(async () => {
    const snapshot = { schema: 1, exportedAt: new Date().toISOString(), data: { settings: { darkMode: true }, userTags: {} } };
    const encrypted = await hooks.encryptSyncSnapshot('correct horse battery staple', snapshot);
    assert.match(encrypted, /^REC-SYNC-1\./);
    assert.notEqual(encrypted.includes('correct horse'), true);
    const decrypted = await hooks.decryptSyncSnapshot(encrypted, 'correct horse battery staple');
    assert.equal(decrypted.schema, 1);
    assert.equal(decrypted.data.settings.darkMode, true);
    await assert.rejects(() => hooks.decryptSyncSnapshot(encrypted, 'wrong passphrase'), /Could not decrypt/);
    console.log('Sync crypto tests passed');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
