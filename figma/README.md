# Figma to SCSS Generator

Automatically convert Figma design tokens and text styles into SCSS variables and classes.

## Workflow

1. **Export Variables from Figma**
   - Use the [Figma Tokens plugin](https://www.figma.com/community/plugin/1301567053264748331)
   - Export your design tokens (colors, spacing, typography, breakpoints, etc.) as JSON
   - Save to: `figma/tokens/variables/design-tokens.json`

2. **Export Text Styles from Figma**
   - Use the [Export Figma Styles plugin](https://www.figma.com/community/plugin/1345288896177395044)
   - Export your text styles as JSON
   - Save to: `figma/tokens/styles/text-styles.json`

3. **Generate SCSS**
   ```bash
   npm run figma:sync
   ```
   This generates:
   - `src/scss/_design-tokens.scss` — Variables and breakpoint mixins
   - `src/scss/_typography.scss` — Typography classes

## File Structure

```
figma/
  tokens/
    variables/
      design-tokens.json
    styles/
      text-styles.json
  convert-figma-variables.js    # Converts variables JSON
  convert-figma-styles.js       # Converts styles JSON
  generate-scss.js              # Main orchestrator
  README.md                      # This file
```

## Notes

- Both JSON files are optional — the script will process whichever you provide
- Use mobile-first breakpoints: `breakpoint/mobile`, `breakpoint/tablet`, `breakpoint/desktop`
- Text styles are automatically converted to responsive classes with media queries
- All generated SCSS files are auto-generated and should not be edited manually
