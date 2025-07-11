# Reddit - Auto-Hide Child Comments

A lightweight userscript that automatically hides child comments on old Reddit, inspired by a similar feature in the Reddit Enhancement Suite (RES).

-----

## Introduction

This extension provides a simple and effective way to manage comment threads on `old.reddit.com`. By default, it collapses all child comments, presenting a clean, high-level view of the discussion. Users can then expand individual comment threads as needed. This functionality is a direct clone of a popular feature from the Reddit Enhancement Suite (RES), offered as a standalone script for those who want just this feature without the overhead of a larger extension.

-----

## Features

### 1\. Auto-Hide Child Comments

  * **What it does**: Automatically collapses all replies to top-level comments when a Reddit page loads.
  * **How it improves the target interface**: Reduces visual clutter in comment-heavy threads, allowing you to quickly scan the primary responses before diving into deeper conversations.
  * **Example usage**:
    ```javascript
    // Hides the child comment section by default on page load
    childTable.style.display = 'none';
    ```

### 2\. Individual Comment Toggling

  * **What it does**: Adds a toggle button next to the comment's action links (`permalink`, `embed`, `save`, etc.). This button allows you to show or hide the child comments for that specific parent comment.
  * **How it improves the target interface**: Gives you granular control over which comment threads you want to read, without having to expand all of them.
  * **Example usage**: The script adds a clickable link:
    ```html
    <a href="javascript:void(0)" class="child-toggle-button">[+] Show child comments</a>
    ```

-----

## Installation

### Prerequisites

  * A modern web browser that supports userscripts (e.g., Firefox, Chrome, Edge).
  * A userscript manager extension, such as **Tampermonkey** or **Greasemonkey**.

### Step-by-step instructions

1.  Install a userscript manager in your browser.
2.  Create a new userscript in your manager's dashboard.
3.  Copy the entire contents of the `Reddit - Auto Hide Child Comments (Accurate RES Clone)-2.0.user.js` file and paste it into the editor for the new userscript.
4.  Save the script. It will automatically be active on `old.reddit.com`.

-----

## Usage

Once installed, the userscript runs automatically.

  * Navigate to any comment page on `https://old.reddit.com`.
  * Child comments will be hidden by default.
  * To view the replies to a specific comment, click the **`[+] Show child comments`** link.
  * To hide them again, click the **`[–] Hide child comments`** link.

-----

## Configuration

This userscript does not require any special configuration. The behavior is standardized and not meant to be changed by the end-user.

-----

## Screenshots

*(Placeholder for screenshots of the UI in action)*

-----

### Core modules and their responsibilities

  * **Comment Processor (`processAllComments`)**: Scans the page for all comments and injects the toggle button into each one that has children.
  * **Event Listener**: A `window.addEventListener('load', ...)` call that initiates the comment processing after the page has fully loaded, ensuring all comments are present in the DOM.
  * **Toggle Handler (`toggleChildren`)**: Manages the state of the child comments (hidden or visible) when the toggle button is clicked.

-----

## API / Function Reference

### 1\. `hideChildren(comment, toggleBtn)`

  * **Parameters**:
      * `comment`: The DOM element of the parent comment.
      * `toggleBtn`: The DOM element of the toggle button.
  * **Return value**: `void`
  * **Purpose within the extension**: Hides the `div.child` element of a comment and updates the button text to `[+] Show child comments`.

### 2\. `showChildren(comment, toggleBtn)`

  * **Parameters**:
      * `comment`: The DOM element of the parent comment.
      * `toggleBtn`: The DOM element of the toggle button.
  * **Return value**: `void`
  * **Purpose within the extension**: Shows the `div.child` element of a comment and updates the button text to `[–] Hide child comments`.

### 3\. `toggleChildren(comment, toggleBtn)`

  * **Parameters**:
      * `comment`: The DOM element of the parent comment.
      * `toggleBtn`: The DOM element of the toggle button.
  * **Return value**: `void`
  * **Purpose within the extension**: Checks the current state of the child comments (via the `dataset.hidden` attribute) and calls either `showChildren` or `hideChildren`.

### 4\. `addToggleButton(comment)`

  * **Parameters**:
      * `comment`: The DOM element of the parent comment.
  * **Return value**: `void`
  * **Purpose within the extension**: Creates the toggle button, attaches the click event listener, and appends it to the comment's flat list of actions.

### 5\. `processAllComments()`

  * **Parameters**: None
  * **Return value**: `void`
  * **Purpose within the extension**: Selects all comments on the page and calls `addToggleButton` for each one.

-----

## Contributing

### How to report issues

  * Please open an issue on the GitHub repository.
  * Use the "Bug Report" template and provide as much detail as possible, including your browser version, userscript manager version, and steps to reproduce the issue.

### How to submit pull requests

  * Fork the repository and create a new branch for your feature or fix.
  * Ensure your code adheres to the existing style.
  * Submit a pull request with a clear description of the changes.

### Coding style guidelines

  * Follow the existing JavaScript style.
  * Use descriptive variable and function names.
  * Comment complex sections of code where necessary.

-----

## Changelog

### [2.0] - 2025-07-11

  * Initial public release.
  * Functionality for hiding and toggling child comments is stable.

-----

## License

This project is licensed under the **MIT License**.

-----

## Disclosure

This userscript is not affiliated with, endorsed by, or in any way officially connected with Reddit, Inc. It is an independent, open-source project created by a fan of the platform.
