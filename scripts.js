/*!
* Start Bootstrap - Personal v1.0.1 (https://startbootstrap.com/template-overviews/personal)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-personal/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

window.addEventListener("DOMContentLoaded", () => {
  const runawayPage = document.body.dataset.runawayPage === "home";

  if (!runawayPage) {
    return;
  }

  const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH", "IFRAME", "BR"]);

  const shouldWrapTextNode = (node) => {
    const parent = node.parentElement;

    if (!parent || !node.nodeValue.trim()) {
      return false;
    }

    if (skipTags.has(parent.tagName)) {
      return false;
    }

    if (parent.closest(".runaway-word, .hero-title-word, [data-runaway-ignore]")) {
      return false;
    }

    return true;
  };

  const wrapTextNodes = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return shouldWrapTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      const parts = node.nodeValue.split(/(\s+)/);

      parts.forEach((part) => {
        if (!part) {
          return;
        }

        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }

        const word = document.createElement("span");
        word.className = "runaway-word";
        word.textContent = part;
        fragment.appendChild(word);
      });

      node.parentNode.replaceChild(fragment, node);
    });
  };

  wrapTextNodes(document.body);

  const words = Array.from(document.querySelectorAll(".runaway-word"));
  let lastPointer = null;
  let frameId = null;

  const resetWord = (word) => {
    word.style.setProperty("--word-x", "0px");
    word.style.setProperty("--word-y", "0px");
    word.style.setProperty("--word-rotate", "0deg");
    word.classList.remove("is-evading");
  };

  const resetAllWords = () => {
    words.forEach(resetWord);
  };

  const updateWords = () => {
    frameId = null;

    if (!lastPointer) {
      resetAllWords();
      return;
    }

    words.forEach((word) => {
      const rect = word.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = lastPointer.x - centerX;
      const deltaY = lastPointer.y - centerY;
      const distance = Math.hypot(deltaX, deltaY);
      const triggerDistance = Math.max(72, rect.width * 1.6);

      if (distance >= triggerDistance) {
        resetWord(word);
        return;
      }

      const strength = (triggerDistance - distance) / triggerDistance;
      const moveX = Math.min(26, 8 + rect.width * 0.18);
      const moveY = 20;
      const safeDistance = distance || 1;
      const offsetX = (-deltaX / safeDistance) * moveX * strength;
      const offsetY = (-deltaY / safeDistance) * moveY * strength;
      const rotation = Math.max(-8, Math.min(8, offsetX * 0.45));

      word.style.setProperty("--word-x", `${offsetX.toFixed(1)}px`);
      word.style.setProperty("--word-y", `${offsetY.toFixed(1)}px`);
      word.style.setProperty("--word-rotate", `${rotation.toFixed(1)}deg`);
      word.classList.add("is-evading");
    });
  };

  const queueUpdate = () => {
    if (frameId !== null) {
      return;
    }

    frameId = window.requestAnimationFrame(updateWords);
  };

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    lastPointer = { x: event.clientX, y: event.clientY };
    queueUpdate();
  });

  document.addEventListener("pointerleave", () => {
    lastPointer = null;
    queueUpdate();
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") {
      return;
    }

    const word = event.target.closest(".runaway-word");

    if (!word) {
      return;
    }

    const randomX = (Math.random() - 0.5) * 44;
    const randomY = -12 - Math.random() * 24;
    const randomRotate = (Math.random() - 0.5) * 16;

    word.style.setProperty("--word-x", `${randomX.toFixed(1)}px`);
    word.style.setProperty("--word-y", `${randomY.toFixed(1)}px`);
    word.style.setProperty("--word-rotate", `${randomRotate.toFixed(1)}deg`);
    word.classList.add("is-evading");

    window.setTimeout(() => resetWord(word), 220);
  });

  window.addEventListener("resize", () => {
    lastPointer = null;
    queueUpdate();
  });
});
