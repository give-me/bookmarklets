(function () {
    /* v. 0.8, github.com/give-me/bookmarklets */
    let elements = [], csp = false;
    // Get elements with a dialog and others
    switch (location.hostname) {
        case 'claude.ai':
            // Dialog
            elements.push(document.querySelector('div[data-test-render-count]').parentElement);
            // Open artifacts
            elements.push(document.querySelector('div.ease-out.w-full[class*="overflow-"]'));
            break;
        case 'chatgpt.com':
            // Dialog
            elements.push(document.querySelector('article').parentElement);
            // Open canvas
            elements.push(document.querySelector('section.popover>main'));
            // CSP is strict
            csp = true;
            break;
        case 'grok.com':
            // Dialog
            elements.push(document.querySelector('div.\\@container\\/main>div:first-child>div'));
            // Open thoughts
            elements.push(document.querySelector('aside'));
            break;
        case 'gemini.google.com':
            // Dialog
            elements.push(document.querySelector('#chat-history'));
            // Open thoughts
            elements.push(document.querySelector('extended-response-panel response-container'));
            // CSP is strict
            csp = true;
            break;
        default:
            return alert(location.hostname + ' is not supported');
    }
    console.debug(`Found elements at ${location.hostname}:`, elements);
    elements = elements.filter(n => n);
    if (csp || confirm('Confirm if a PDF should be searchable')) {
        // Clone elements to a temporary element
        let temp = document.createElement('div');
        temp.id = 'id-' + Math.random().toString(36).slice(2, 9);
        elements.forEach(el => el && temp.appendChild(el.cloneNode(true)));
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
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.3/html2pdf.bundle.min.js';
        script.onload = function () {
            // Get a timestamp and elements with a dialog and artifacts
            let ts = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
            // Create a PDF from the first element
            let pdf = html2pdf().set({
                margin: 5,
                filename: `${ts}.pdf`,
                html2canvas: {scale: 2, logging: false}
            }).from(elements.shift());
            // Add rest elements to the PDF
            elements.forEach(el => pdf = pdf.toPdf().get('pdf').then(pdfObj => pdfObj.addPage()).from(el).toContainer().toCanvas().toPdf());
            // Render the PDF
            pdf.save();
        };
        document.body.appendChild(script);
    }
})();