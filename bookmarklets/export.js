(function () {
    /* v. 0.10, github.com/give-me/bookmarklets */
    let dialog, events = [], extras = [], csp = false;
    // Get elements with a dialog and others
    switch (location.hostname) {
        case 'claude.ai':
            // Dialog
            dialog = document.querySelector('div[data-test-render-count]').parentElement;
            events = dialog.querySelectorAll('div[data-testid="user-message"], div[data-test-render-count]>div>div>div.font-claude-response');
            // Open artifacts
            extras.push(document.querySelector('div.ease-out.w-full[class*="overflow-"]'));
            break;
        case 'chatgpt.com':
            // Dialog
            dialog = document.querySelector('article').parentElement;
            events = dialog.querySelectorAll('div[data-message-author-role]');
            // Open canvas
            extras.push(document.querySelector('section.popover>section'));
            // CSP is strict
            csp = true;
            break;
        case 'grok.com':
            // Dialog
            dialog = document.querySelector('div#last-reply-container').parentElement;
            events = dialog.querySelectorAll('div.message-bubble');
            // Open thoughts
            extras.push(document.querySelector('aside'));
            // CSP is strict
            csp = true;
            break;
        case 'gemini.google.com':
            // Dialog
            dialog = document.querySelector('#chat-history');
            events = dialog.querySelectorAll('user-query-content, message-content');
            // Open panels
            extras.push(document.querySelector('code-immersive-panel>div.container'));
            extras.push(document.querySelector('deep-research-immersive-panel>div.container'));
            extras.push(document.querySelector('extended-response-panel response-container'));
            // CSP is strict
            csp = true;
            break;
        default:
            return alert(location.hostname + ' is not supported');
    }
    // Filter arrays
    events = [...events].filter(Boolean);
    extras = [...extras].filter(Boolean);
    // Log found elements for debugging
    console.group(`Found elements at ${location.hostname}:`);
    console.debug('dialog', dialog);
    console.debug('events', events);
    console.debug('extras', extras);
    console.groupEnd();
    // Combine dialog and extras into an array
    let blocks = [dialog, ...extras];
    // Get a timestamp for the filename
    let ts = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    // Offer options to the user
    if (confirm('Confirm if you prefer export PDF instead of text')) {
        if (csp || confirm('Confirm if the PDF should be searchable')) {
            // Clone elements to a temporary element
            let temp = document.createElement('div');
            temp.id = 'id-' + Math.random().toString(36).slice(2, 9);
            blocks.forEach(el => temp.appendChild(el.cloneNode(true)));
            // Print the temporary element
            let style = document.createElement('style');
            style.textContent = `@media print{body>*{display:none!important}#${temp.id}{display:flex!important;flex-direction:column}}`;
            document.head.appendChild(style);
            document.body.appendChild(temp);
            print();
            // Clean up after printing
            setTimeout(() => {
                document.head.removeChild(style);
                document.body.removeChild(temp);
            }, 1000);
        } else {
            let script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.12.1/html2pdf.bundle.min.js';
            script.onload = function () {
                // Create a PDF from the first element
                let pdf = html2pdf().set({
                    margin: 5,
                    filename: `${ts}.pdf`,
                    html2canvas: {scale: 2, logging: false}
                }).from(blocks.shift());
                // Add rest elements to the PDF
                blocks.forEach(el => pdf = pdf.toPdf().get('pdf').then(pdfObj => pdfObj.addPage()).from(el).toContainer().toCanvas().toPdf());
                // Render the PDF
                pdf.save();
            };
            document.body.appendChild(script);
        }
    } else {
        // Generate text from dialog messages and extras
        let txt = events.map((e, i) => `# ${i % 2 ? 'AI' : 'Me'}:\n\n${e.innerText.trim()}\n\n`).join('');
        txt += extras.map((e, i) => `# Extra ${i + 1}:\n\n${e.innerText.trim()}\n\n`).join('');
        // extras.forEach((e, i) => txt += `# Extra ${i + 1}:\n\n${e.innerText.trim()}\n\n`);
        // Create a link to download the text file
        let href = URL.createObjectURL(new Blob(['\uFEFF', txt], {type: 'text/plain;charset=utf-8'}));
        let link = Object.assign(document.createElement('a'), {href: href, download: `${ts}.txt`});
        // Click the link to start the download
        link.click();
        // Clean up after downloading
        URL.revokeObjectURL(link.href);
    }
})();