// this_file: docs/assets/demo.js
// Tiny helper for the demo pages: wire up "Copy" buttons on every .code block.
// Each code block holds its source in a <pre>; the button copies that text.
(function () {
  function attach(block) {
    var pre = block.querySelector('pre');
    if (!pre) return;
    var btn = document.createElement('button');
    btn.className = 'copy';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      var text = pre.innerText;
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var r = document.createRange();
        r.selectNodeContents(pre);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        try {
          document.execCommand('copy');
          done();
        } catch (e) {}
        sel.removeAllRanges();
      }
    });
    block.appendChild(btn);
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.code').forEach(attach);
  });
})();
