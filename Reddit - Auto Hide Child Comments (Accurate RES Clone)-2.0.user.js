// ==UserScript==
// @name         Reddit - Auto Hide Child Comments (Accurate RES Clone)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Auto hides child comments in old Reddit, just like RES. Adds toggle to show/hide them individually.
// @author       RES-inspired
// @match        https://old.reddit.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function hideChildren(comment, toggleBtn) {
    const childTable = comment.querySelector('div.child > .sitetable');
    if (childTable) {
      childTable.style.display = 'none';
      toggleBtn.textContent = '[+] Show child comments';
      toggleBtn.dataset.hidden = 'true';
    }
  }

  function showChildren(comment, toggleBtn) {
    const childTable = comment.querySelector('div.child > .sitetable');
    if (childTable) {
      childTable.style.display = '';
      toggleBtn.textContent = '[–] Hide child comments';
      toggleBtn.dataset.hidden = 'false';
    }
  }

  function toggleChildren(comment, toggleBtn) {
    const hidden = toggleBtn.dataset.hidden === 'true';
    if (hidden) {
      showChildren(comment, toggleBtn);
    } else {
      hideChildren(comment, toggleBtn);
    }
  }

  function addToggleButton(comment) {
    if (comment.querySelector('.child-toggle-button')) return;

    const flatList = comment.querySelector('.flat-list');
    if (!flatList) return;

    const childTable = comment.querySelector('div.child > .sitetable');
    if (!childTable) return;

    const toggleBtn = document.createElement('a');
    toggleBtn.href = 'javascript:void(0)';
    toggleBtn.textContent = '[+] Show child comments';
    toggleBtn.className = 'child-toggle-button';
    toggleBtn.style.marginLeft = '8px';
    toggleBtn.dataset.hidden = 'true';

    toggleBtn.addEventListener('click', () => {
      toggleChildren(comment, toggleBtn);
    });

    const li = document.createElement('li');
    li.appendChild(toggleBtn);
    flatList.appendChild(li);

    // Hide by default
    childTable.style.display = 'none';
  }

  function processAllComments() {
    const comments = document.querySelectorAll('.comment');
    comments.forEach(comment => addToggleButton(comment));
  }

  window.addEventListener('load', () => {
    // Use a slight delay to ensure all comments are in the DOM
    setTimeout(processAllComments, 500);
  });
})();
