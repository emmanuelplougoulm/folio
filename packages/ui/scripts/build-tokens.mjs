// Génère les variables CSS (--f-*) et un JSON plat par thème depuis les tokens DTCG.
// Les primitives ne sont pas exportées : les composants n'utilisent que les tokens sémantiques.
import StyleDictionary from 'style-dictionary';
import { formattedVariables, fileHeader } from 'style-dictionary/utils';

const OUT = 'src/styles/';
const isPrimitive = (token) => token.path[0] === 'primitive';

StyleDictionary.registerFormat({
  name: 'folio/css-theme',
  format: async ({ dictionary, file, options }) => {
    const header = await fileHeader({ file });
    const vars = formattedVariables({
      format: 'css',
      dictionary,
      outputReferences: false,
      usesDtcg: true
    });
    const indented = (n) =>
      vars
        .split('\n')
        .map((line) => ' '.repeat(n) + line.trim())
        .join('\n');
    if (options.theme === 'dark') {
      return (
        `${header}[data-theme='dark'] {\n  color-scheme: dark;\n${indented(2)}\n}\n\n` +
        `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme='light']) {\n    color-scheme: dark;\n${indented(4)}\n  }\n}\n`
      );
    }
    return `${header}:root,\n[data-theme='light'] {\n  color-scheme: light;\n${indented(2)}\n}\n`;
  }
});

const themes = ['light', 'dark'];

for (const theme of themes) {
  const sd = new StyleDictionary({
    usesDtcg: true,
    source: [
      'tokens/primitives.tokens.json',
      'tokens/base.tokens.json',
      `tokens/semantic.${theme}.tokens.json`
    ],
    log: { verbosity: 'default', warnings: 'error' },
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: 'f',
        buildPath: OUT,
        files: [
          {
            destination: `tokens-${theme}.generated.css`,
            format: 'folio/css-theme',
            options: { theme },
            // Le thème sombre ne redéfinit que les couleurs.
            filter: (t) => !isPrimitive(t) && (theme === 'light' || t.path[0] === 'color')
          }
        ]
      },
      json: {
        transformGroup: 'js',
        buildPath: OUT,
        files: [
          {
            destination: `tokens-${theme}.generated.json`,
            format: 'json/flat',
            filter: (t) => t.path[0] === 'color'
          }
        ]
      }
    }
  });
  await sd.buildAllPlatforms();
}
