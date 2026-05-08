# Bookmarklet for Chatbots

This bookmarklet allows you to export the content from [Google's AI Mode](https://www.google.com/search?udm=50),
[Claude](https://claude.ai/), [ChatGPT](https://chatgpt.com/), [Grok](https://grok.com/)
and [Gemini](https://gemini.google.com/) to PDF or text with a single click. It's completely secure with no
installations, data sharing with third parties, or extensions needed. Everything runs entirely in your browser. For
chatbots that allow loading third-party libraries, the PDF can be searchable or not, depending on your choice. For other
chatbots, the PDF will always be searchable.

## How to use

1. Add a new bookmark to your browser with any name (e.g. "Export to PDF or text") and the following code as the URL:

   ```javascript
   javascript:(function () { /* v. 0.14, github.com/give-me/bookmarklets */ let dialog, events = [], extras = [], csp = false; switch (location.hostname) { case 'www.google.com': dialog = document.querySelector('div[data-xid=aim-mars-turn-root]'); events = dialog.querySelectorAll('span[role=heading], div[data-streaming-container]'); break; case 'claude.ai': dialog = document.querySelector('div[data-test-render-count]').parentElement; events = dialog.querySelectorAll('div[data-testid="user-message"], div.font-claude-response'); extras.push(document.querySelector('div.h-full.top-0 div.font-mono')); extras.push(document.querySelector('div#wiggle-file-content>div')); extras.push(document.querySelector('div#markdown-artifact>div')); extras.push(document.querySelector('div#artifacts-component-root-pdf>div')); break; case 'chatgpt.com': dialog = document.querySelector('#thread'); events = dialog.querySelectorAll('section>div>div>div>div[data-message-author-role]'); extras.push(document.querySelector('section.popover>section')); csp = true; break; case 'grok.com': dialog = document.querySelector('div#last-reply-container').parentElement; events = dialog.querySelectorAll('div.message-bubble'); extras.push(document.querySelector('aside')); csp = true; break; case 'gemini.google.com': dialog = document.querySelector('#chat-history'); events = dialog.querySelectorAll('user-query-content, message-content'); extras.push(document.querySelector('code-immersive-panel>div.container')); extras.push(document.querySelector('deep-research-immersive-panel>div.container')); extras.push(document.querySelector('extended-response-panel response-container')); csp = true; break; default: return alert(location.hostname + ' is not supported'); } events = [...events].filter(Boolean); extras = [...extras].filter(Boolean); console.group(`Found elements at ${location.hostname}:`); console.debug('dialog', dialog); console.debug('events', events); console.debug('extras', extras); console.groupEnd(); let blocks = [dialog, ...extras]; let ts = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14); if (confirm('Confirm if you prefer to export PDF instead of text')) { if (csp || confirm('Confirm if the PDF should be searchable')) { let temp = document.createElement('div'); temp.id = 'id-' + Math.random().toString(36).slice(2, 9); blocks.forEach(el => temp.appendChild(el.cloneNode(true))); let style = document.createElement('style'); style.textContent = `@media print{body>*{display:none!important}#${temp.id}{display:flex!important;flex-direction:column}}`; document.head.appendChild(style); document.body.appendChild(temp); print(); setTimeout(() => { document.head.removeChild(style); document.body.removeChild(temp); }, 1000); } else { let script = document.createElement('script'); script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.12.1/html2pdf.bundle.min.js'; script.onload = function () { let pdf = html2pdf().set({ margin: 5, filename: `${ts}.pdf`, html2canvas: {scale: 2, logging: false} }).from(blocks.shift()); blocks.forEach(el => pdf = pdf.toPdf().get('pdf').then(pdfObj => pdfObj.addPage()).from(el).toContainer().toCanvas().toPdf()); pdf.save(); }; document.body.appendChild(script); } } else { let txt = events.map(e => `# Message:\n\n${e.textContent.trim()}\n\n`).join(''); txt += extras.map((e, i) => `# Extra ${i + 1}:\n\n${e.textContent.trim()}\n\n`).join(''); let href = URL.createObjectURL(new Blob(['\uFEFF', txt], {type: 'text/plain;charset=utf-8'})); let link = Object.assign(document.createElement('a'), {href: href, download: `${ts}.txt`}); link.click(); URL.revokeObjectURL(link.href); } })();
   ```

2. Open any conversation in [Google's AI Mode](https://www.google.com/search?udm=50), [Claude](https://claude.ai/),
   [ChatGPT](https://chatgpt.com/), [Grok](https://grok.com/), or [Gemini](https://gemini.google.com/) and click on the
   bookmark.
3. Confirm if you prefer to export PDF instead of text. If PDF is chosen, confirm if the PDF should be searchable. Wait
   for the file to be generated.

## Under the hood

If you choose a searchable PDF, this bookmarklet will create a temporary print-specific stylesheet and a temporary
container, clone the content of the conversation and related data into this container. When printing, only this
container will be displayed while all other page elements will be hidden. The native browser print function is used,
which allows you to print directly or save as PDF. After printing, the temporary stylesheet and container will be
automatically removed.

If you choose a non-searchable PDF, this bookmarklet will load the [html2pdf](https://github.com/eKoopmans/html2pdf.js)
library from the Cloudflare CDN to work locally in order to avoid sending any data to any server. The library will be
used to convert the content of the conversation and related data to a PDF file (A4 format, portrait orientation, 5mm
margins, and 2x scale). The filename will be generated based on the current date and time.

## About

Source code is available [here](https://github.com/give-me/bookmarklets/blob/main/bookmarklets/export.js). When the user
interfaces of chatbots change, this tool may need to be updated because the content of conversations and related data
are found using CSS selectors.