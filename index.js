import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import puppeteer from 'puppeteer';
import axe from 'axe-core';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Resolve the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function runAxe(directory) {
  const urlsFile = path.join(directory, 'urls.json');
  const violationsFile = path.join(directory, 'violations.json');
  const indexFile = path.join(directory, 'index.html');

  // Read URLs from the specified directory
  const urls = JSON.parse(await readFile(urlsFile, 'utf-8'));

  const violations = [];

  // Launch Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const url of urls) {
    console.log(`Scanning ${url}...`);
    await page.goto(url);

    // Inject and run axe-core
    await page.addScriptTag({ path: path.resolve(__dirname, 'node_modules/axe-core/axe.min.js') });
    const results = await page.evaluate(() => axe.run());
    violations.push({ url, violations: results.violations });
  }

  await browser.close();

  // Write violations.json
  await writeFile(violationsFile, JSON.stringify(violations, null, 2), 'utf-8');
  console.log(`Violations written to ${violationsFile}`);

  // Generate standalone index.html
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Axe Accessibility Violations</title>
  <style>
    :root {
      --color-primary: #0a3d86;
      --color-white: #ffffff;
      --spacing: 1rem;
      --color-grey-lightest: #f2f2f2;
      --color-black: #000000;
      --transition-time: 0.3s;
      --border: 1px solid var(--color-primary);
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      line-height: 1.5;
      font-family: Arial, sans-serif;
      color: var(--color-black);
    }

    header,
    main,
    footer {
      padding: 2rem;
    }

    a {
      color: var(--color-primary);
    }
    a:hover,
    a:focus-visible {
      text-decoration: none;
    }

    a,
    button,
    input,
    select,
    textarea {
      transition: var(--transition-time);
    }

    h2 ~ h2 {
      margin-block-start: 2rem;
      padding-block-start: 2rem;
      border-top: 1px solid var(--color-primary);
    }

    .bg {
      background-color: var(--color-primary);
      color: #ffffff;
    }

    .bg a {
      color: #ffffff;
    }

    header nav ul {
      display: flex;
      gap: 1rem;
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    header.bg nav a {
      display: inline-block;
      padding: 0.5rem 1rem;
      background-color: var(--color-white);
      color: var(--color-primary);
      text-decoration: none;
      border: 1px solid var(--color-primary);
    }
    header.bg nav a:hover,
    header.bg nav a:focus-visible {
      background-color: var(--color-primary);
      color: var(--color-white);
      border-color: var(--color-white);
      transform: scale(1.01);
    }

    header .logo {
      width: 250px;
      max-width: 100%;
    }

    .impact {
      padding: 0.15rem;
      border: var(--border);
      color: var(--color-black);
      border-color: var(--color-black);
    }
    .impact--minor {
      background-color: #f3ea00;
    }
    .impact--moderate {
      background-color: #d4cd00;
    }
    .impact--serious {
      background-color: #b36200;
      color: var(--color-white);
    }
    .impact--critical {
      color: var(--color-white);
      background-color: #dc0000;
    }


    .violations {
      max-width: 120ch;
      width: 100%;
      padding: 1rem;
      background-color: var(--color-grey-lightest);
      /* border: var(--border); */
      border-radius: 1rem;;
    }

    .violations__list > li {
      margin-block-end: 1rem;
      background: #fff;
      padding: 1rem;
      border-radius: 1rem;
    }
    .violations__list > li li {
      margin-block-start: 0.5rem;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      border-bottom: 1px dotted;
    }

    .violations__list details > p {
        background: #000;
        padding: 1rem;
        color: #fff;
        border-radius: 1rem;
    }

    .grid {
      display: grid;
      gap: var(--spacing);
      /* grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); */
      grid-template-columns: 1fr;
    }
  </style>
</head>
<body>
<header class="bg">
     <div>
      <svg xmlns="http://www.w3.org/2000/svg" id="Layer_2" class="logo" data-name="Layer 2" viewBox="0 0 340.62 80">
        <title>Dirigo Interactive</title>
        <defs>
          <style>
            .cls-1 {
              fill: #fff;
            }
          </style>
        </defs>
        <g id="Layer_1-2" data-name="Layer 1">
          <g>
            <path class="cls-1" d="M100.62.76h17.51c14.21,0,24.12,9.95,24.12,22.93v.13c0,12.99-9.91,23.06-24.12,23.06h-17.51V.76ZM110.16,9.57v28.5h7.98c8.41,0,14.09-5.76,14.09-14.13v-.13c0-8.36-5.67-14.25-14.09-14.25h-7.98Z"></path>
            <path class="cls-1" d="M152.22.76h9.6v46.11h-9.6V.76Z"></path>
            <path class="cls-1" d="M173.85.76h20.63c5.73,0,10.16,1.58,13.21,4.69,2.56,2.6,3.8,6.02,3.8,10.39v.13c0,7.54-3.99,12.16-9.91,14.25l11.34,16.66h-11.22l-10.03-15.01h-8.29v15.01h-9.54V.76ZM193.86,23.25c4.99,0,7.98-2.72,7.98-6.78v-.13c0-4.5-3.12-6.78-8.16-6.78h-10.28v13.68h10.47Z"></path>
            <path class="cls-1" d="M221.65.76h9.6v46.11h-9.6V.76Z"></path>
            <path class="cls-1" d="M241.22,23.94v-.13c0-12.99,9.97-23.82,23.75-23.82,8.16,0,12.96,2.22,17.76,6.27l-6.05,7.41c-3.43-2.98-6.79-4.75-12.03-4.75-7.48,0-13.4,6.71-13.4,14.76v.13c0,8.61,5.8,15.01,14.09,15.01,3.8,0,7.04-.95,9.72-2.91v-7.03h-10.35v-8.42h19.63v19.89c-4.74,4.05-11.03,7.28-19.32,7.28-14.15,0-23.81-10.01-23.81-23.69Z"></path>
            <path class="cls-1" d="M292.51,23.94v-.13c0-12.99,10.16-23.82,24.12-23.82s24,10.58,24,23.69v.13c0,12.99-10.16,23.82-24.12,23.82s-24-10.58-24-23.69ZM330.59,23.94v-.13c0-8.11-5.92-14.89-14.09-14.89s-13.96,6.65-13.96,14.76v.13c0,8.11,5.8,14.89,14.09,14.89s13.96-6.65,13.96-14.76Z"></path>
          </g>
          <g>
            <path class="cls-1" d="M100.62,58.14h4.48v21.51h-4.48v-21.51Z"></path>
            <path class="cls-1" d="M113.61,58.14h4.1l10.2,13.56v-13.56h4.42v21.51h-3.81l-10.52-14v14h-4.39v-21.51Z"></path>
            <path class="cls-1" d="M145.61,62.33h-6.51v-4.2h17.47v4.2h-6.48v17.31h-4.48v-17.31Z"></path>
            <path class="cls-1" d="M163.34,58.14h15.9v4.05h-11.48v4.61h10.12v4.05h-10.12v4.76h11.63v4.05h-16.05v-21.51Z"></path>
            <path class="cls-1" d="M186.73,58.14h9.62c2.67,0,4.74.74,6.16,2.19,1.19,1.21,1.77,2.81,1.77,4.84v.06c0,3.52-1.86,5.67-4.62,6.65l5.29,7.77h-5.23l-4.68-7h-3.87v7h-4.45v-21.51ZM196.07,68.63c2.33,0,3.72-1.27,3.72-3.16v-.06c0-2.1-1.45-3.16-3.81-3.16h-4.8v6.38h4.88Z"></path>
            <path class="cls-1" d="M219.02,57.99h4.13l9.1,21.65h-4.68l-1.98-4.9h-9.16l-1.98,4.9h-4.56l9.13-21.65ZM223.99,70.72l-2.97-7.3-2.99,7.3h5.96Z"></path>
            <path class="cls-1" d="M236.46,68.95v-.06c0-6.15,4.53-11.11,11.02-11.11,4.01,0,6.34,1.36,8.34,3.31l-2.85,3.34c-1.66-1.54-3.31-2.48-5.52-2.48-3.66,0-6.31,3.1-6.31,6.88v.06c0,3.78,2.59,6.94,6.31,6.94,2.47,0,3.98-1,5.67-2.57l2.85,2.92c-2.15,2.33-4.62,3.81-8.66,3.81-6.22,0-10.84-4.87-10.84-11.05Z"></path>
            <path class="cls-1" d="M267.85,62.33h-6.51v-4.2h17.47v4.2h-6.48v17.31h-4.48v-17.31Z"></path>
            <path class="cls-1" d="M285.78,58.14h4.48v21.51h-4.48v-21.51Z"></path>
            <path class="cls-1" d="M296.94,58.14h4.94l5.7,15.42,5.7-15.42h4.83l-8.6,21.66h-3.95l-8.6-21.66Z"></path>
            <path class="cls-1" d="M324.58,58.14h15.9v4.05h-11.48v4.61h10.12v4.05h-10.12v4.76h11.63v4.05h-16.05v-21.51Z"></path>
          </g>
          <g>
            <path class="cls-1" d="M36.15,79.15H0V.08h36.15c8.39,0,15.92,1.64,22.38,4.87,6.52,3.26,11.7,7.91,15.39,13.82,3.69,5.92,5.56,12.93,5.56,20.85s-1.87,14.93-5.56,20.84c-3.69,5.91-8.87,10.56-15.39,13.82-6.46,3.23-13.99,4.87-22.38,4.87ZM5.14,74.01h31.01c7.59,0,14.34-1.45,20.08-4.32,5.67-2.83,10.15-6.85,13.33-11.95,3.17-5.09,4.78-11.18,4.78-18.12s-1.61-13.03-4.78-18.12c-3.18-5.09-7.67-9.11-13.33-11.94-5.74-2.87-12.49-4.32-20.08-4.32H5.14v68.78Z"></path>
            <g>
              <polygon class="cls-1" points="23.75 57.69 34.52 64.34 34.52 18.87 23.75 18.87 23.75 57.69"></polygon>
              <polygon class="cls-1" points="45.49 18.87 34.53 25.57 34.53 18.87 45.49 18.87"></polygon>
            </g>
          </g>
        </g>
      </svg>

    </div>
    <h1>Accessibility Report</h1>
    <nav>
      <ul>
        <li><a href="#summary">Summary</a></li>
        <li><a href="#violations">Violations</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <div id="app"></div>
  </main>
  <script>
    // Embedded violations data
    const violationsData = ${JSON.stringify(violations, null, 2)};

    const app = document.querySelector('#app');

    const toSentenceCase = (string) => {
      return string
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const replaceHyphensWithSpaces = (string) => string.replace(/-/g, ' ');

    const escapeHtml = (unsafe) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const numberOfURLsTested = violationsData.length;
    const allViolations = violationsData.flatMap(v => v.violations.map(violation => ({ ...violation, url: v.url })));
    const numberOfViolations = allViolations.length;

    // Group violations by type
    const violationsByType = allViolations.reduce((acc, violation) => {
      if (!acc[violation.id]) {
        acc[violation.id] = [];
      }
      acc[violation.id].push(violation);
      return acc;
    }, {});

    // Create variables for each violation type dynamically
    const violationTypes = Object.keys(violationsByType);
    const violationVariables = violationTypes.reduce((acc, type) => {
      acc[type] = violationsByType[type];
      return acc;
    }, {});

    // Get unique URLs with violations
    const uniqueURLsWithViolations = [...new Set(allViolations.map(violation => violation.url))];

    // Count the number of issues for each impact level
    const impactCounts = allViolations.reduce((acc, violation) => {
      const impact = violation.impact || 'unknown';
      if (!acc[impact]) {
        acc[impact] = 0;
      }
      acc[impact] += 1;
      return acc;
    }, {});

    // Set the content of the app element
    app.innerHTML = \`
      <h2 id="summary">Summary</h2>
      <h3>URLs with violations</h3>
      <p>We tested <strong>\${numberOfURLsTested} URLs</strong> and found <strong>\${uniqueURLsWithViolations.length} URLs</strong> with accessibility violations <strong>(\${(uniqueURLsWithViolations.length / numberOfURLsTested * 100).toFixed(2)}%</strong> of URLs).</p>
      <p>The total number of violations found was <strong>\${numberOfViolations}</strong></p>

      <h3>Issues by Impact</h3>
      <ul>
        \${Object.entries(impactCounts).map(([impact, count]) => \`
          <li>\${toSentenceCase(impact)}: \${count}</li>
        \`).join('')}
      </ul>

      <h3>Issues by Type</h3>
      <ul>
        \${violationTypes.map(type => \`
          <li>
            \${violationVariables[type].length} \${replaceHyphensWithSpaces(toSentenceCase(type))}
          </li>
        \`).join('')}
      </ul>

      <h3>URLs with Violations</h3>
      <details>
        <summary>\${uniqueURLsWithViolations.length} URLs</summary>
          <ul>
          \${uniqueURLsWithViolations.map(url => \`
            <li>
              <a href="\${url}">\${url}</a>
            </li>
          \`).join('')}
        </ul>
      </details>

      <h2 id="violations">Accessibility Violations</h2>
      <div class="grid">
      \${violationTypes.map(type => \`
        <article class="violations">
            <h3>\${toSentenceCase(replaceHyphensWithSpaces(type))}</h3>
            <p></p>
            <p>Impact: <span class="impact impact--\${violationVariables[type][0]['impact']}">\${toSentenceCase(violationVariables[type][0]['impact'])}</span></p>
            <p>Description: \${escapeHtml(violationVariables[type][0]['description'])}</p>
            <details>
            <summary>There are <strong>\${violationVariables[type].length} \${type} violations</strong> across <strong>\${uniqueURLsWithViolations.length} URLs</strong>.</summary>
          <ol class="violations__list">
            \${violationVariables[type].map((violation, index) => \`
              <li>
                <a id="link-\${index}" class="view-violations" href="\${violation.url}">\${violation.url}</a>
                <div>
                <details>
                        <summary aria-describedby="link-\${index}">Instances: \${violation.nodes.length}</summary>
                        <p><strong>Failure Summary:</strong> \${violation.nodes[0]['failureSummary']}</p>
                        <ol>
                          \${violation.nodes.map(node => \`
                            <li>
                              <strong>HTML:</strong> <code>\${escapeHtml(node.html)}</code><br>
                              <strong>Target:</strong> \${node.target.join(' > ')}<br>
                            </li>
                          \`).join('')}
                          </ol>
                        </details>
                </div>
              </li>
            \`).join('')}
          </ol>
          </details>
        </article>
      \`).join('')}
      </div>
    \`;
  </script>
</body>
</html>
  `;

  await writeFile(indexFile, htmlContent, 'utf-8');
  console.log(`Standalone index.html written to ${indexFile}`);
}

// Get the directory argument
const args = process.argv.slice(2);
const dirIndex = args.indexOf('--dir');
if (dirIndex === -1 || !args[dirIndex + 1]) {
  console.error('Error: Please specify a directory using --dir <directory>');
  process.exit(1);
}
const directory = path.resolve(process.cwd(), args[dirIndex + 1]); // Resolve relative to current working directory
runAxe(directory).catch(err => {
  console.error(err);
  process.exit(1);
});