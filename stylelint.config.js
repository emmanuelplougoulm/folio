/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  ignoreFiles: [
    '**/dist/**',
    '**/storybook-static/**',
    '**/coverage/**',
    '**/*.generated.css'
  ],
  rules: {
    // Les bundlers résolvent les @import en chaîne (paquets npm compris).
    'import-notation': 'string',
    // Classes BEM préfixées : f-button, f-button__icon, f-button--primary
    'selector-class-pattern': [
      '^(f|tb)-[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message:
          'Utiliser une classe BEM préfixée par « f- » (Folio) ou « tb- » (testbed)'
      }
    ],
    'custom-property-pattern': [
      '^f-[a-z0-9]+(-[a-z0-9]+)*$',
      { message: 'Les custom properties sont préfixées par « --f- »' }
    ]
  },
  overrides: [
    {
      // Composants : aucune valeur en dur, aucune fuite globale
      files: ['packages/ui/src/components/**/*.{vue,css}', 'apps/*/src/**/*.{vue,css}'],
      rules: {
        'color-no-hex': true,
        'color-named': 'never',
        'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'oklch', 'lab', 'lch'],
        'selector-max-universal': 0,
        'selector-max-type': [0, { ignore: ['compounded', 'descendant'] }],
        'selector-disallowed-list': [
          [':root', 'html', 'body'],
          { message: 'Pas de style global dans un composant' }
        ],
        'declaration-property-value-disallowed-list': {
          '/^(margin|padding|gap|inset|top|right|bottom|left|border-radius|font-size)/': [
            '/\\d+px/'
          ]
        }
      }
    }
  ]
};
