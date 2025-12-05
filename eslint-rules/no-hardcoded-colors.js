/**
 * ESLint Rule: no-hardcoded-colors
 * 
 * Prevents hardcoded color values (hex, rgb, rgba) in JSX/TSX files.
 * Encourages use of design tokens (Tailwind utilities or CSS variables).
 * 
 * @example
 * // ❌ Bad
 * <div style={{ backgroundColor: '#18181b' }} />
 * <div style={{ color: 'rgb(24, 24, 27)' }} />
 * const bg = '#18181b'
 * 
 * // ✅ Good
 * <div className="bg-surface" />
 * <div style={{ backgroundColor: 'rgb(var(--color-surface))' }} />
 * import { getChartColors } from '@/lib/chartColors'
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded color values (hex, rgb, rgba)',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null, // Not auto-fixable (requires manual token selection)
    messages: {
      hardcodedHex: 'Hardcoded hex color "{{value}}" found. Use design tokens instead (e.g., className="bg-surface" or rgb(var(--color-*))).',
      hardcodedRgb: 'Hardcoded rgb/rgba color "{{value}}" found. Use design tokens instead (e.g., className="text-primary" or rgb(var(--color-*))).',
      suggestion: 'Consider using:\n- Tailwind: className="{{tailwind}}"\n- CSS Variable: rgb(var(--color-{{token}}))\n- Chart Utility: getChartColors().{{chartKey}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Regex patterns for allowed color strings',
          },
          ignoreFiles: {
            type: 'array',
            items: { type: 'string' },
            description: 'File patterns to ignore',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const allowedPatterns = (options.allowedPatterns || []).map(p => new RegExp(p))
    const ignoreFiles = options.ignoreFiles || []

    // Check if current file should be ignored
    const filename = context.getFilename()
    if (ignoreFiles.some(pattern => filename.includes(pattern))) {
      return {}
    }

    /**
     * Check if a value is a hardcoded color
     */
    function isHardcodedColor(value) {
      if (typeof value !== 'string') return null

      // Hex colors: #RGB, #RRGGBB, #RRGGBBAA
      const hexMatch = value.match(/#([0-9a-fA-F]{3,8})\b/)
      if (hexMatch) {
        // Allow if matches allowed patterns
        if (allowedPatterns.some(pattern => pattern.test(value))) {
          return null
        }
        return { type: 'hex', value, match: hexMatch[0] }
      }

      // RGB/RGBA colors: rgb(r, g, b), rgba(r, g, b, a)
      const rgbMatch = value.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/)
      if (rgbMatch) {
        // Allow rgb(var(--color-*)) pattern (design tokens)
        if (value.includes('var(')) {
          return null
        }
        // Allow if matches allowed patterns
        if (allowedPatterns.some(pattern => pattern.test(value))) {
          return null
        }
        return { type: 'rgb', value, match: rgbMatch[0] }
      }

      return null
    }

    /**
     * Suggest design token alternatives
     */
    function getSuggestions(colorType, value) {
      // Common color mappings
      const hexToToken = {
        '#18181b': { tailwind: 'bg-surface', token: 'surface', chartKey: 'background' },
        '#0a0a0a': { tailwind: 'bg-bg', token: 'bg', chartKey: 'background' },
        '#f4f4f5': { tailwind: 'text-primary', token: 'text-primary', chartKey: 'textColor' },
        '#a1a1aa': { tailwind: 'text-secondary', token: 'text-secondary', chartKey: 'textColor' },
        '#71717a': { tailwind: 'text-tertiary', token: 'text-tertiary', chartKey: 'textColor' },
        '#0fb34c': { tailwind: 'text-brand', token: 'brand', chartKey: 'accent' },
        '#22c55e': { tailwind: 'text-sentiment-bull', token: 'sentiment-bull', chartKey: 'bullColor' },
        '#f43f5e': { tailwind: 'text-sentiment-bear', token: 'sentiment-bear', chartKey: 'bearColor' },
      }

      const suggestion = hexToToken[value.toLowerCase()]
      if (suggestion) {
        return suggestion
      }

      // Generic suggestions
      return {
        tailwind: 'bg-* or text-*',
        token: '*',
        chartKey: 'see chartColors.ts',
      }
    }

    /**
     * Report hardcoded color
     */
    function reportColor(node, colorInfo) {
      const suggestions = getSuggestions(colorInfo.type, colorInfo.value)

      context.report({
        node,
        messageId: colorInfo.type === 'hex' ? 'hardcodedHex' : 'hardcodedRgb',
        data: {
          value: colorInfo.match,
          tailwind: suggestions.tailwind,
          token: suggestions.token,
          chartKey: suggestions.chartKey,
        },
      })
    }

    return {
      // Check JSX attribute values: <div style={{ backgroundColor: '#fff' }} />
      JSXAttribute(node) {
        if (node.value && node.value.type === 'JSXExpressionContainer') {
          const expression = node.value.expression

          // Object expression: { backgroundColor: '#fff' }
          if (expression.type === 'ObjectExpression') {
            expression.properties.forEach(prop => {
              if (prop.type === 'Property' && prop.value.type === 'Literal') {
                const colorInfo = isHardcodedColor(prop.value.value)
                if (colorInfo) {
                  reportColor(prop.value, colorInfo)
                }
              }
            })
          }

          // String literal: "#fff"
          if (expression.type === 'Literal') {
            const colorInfo = isHardcodedColor(expression.value)
            if (colorInfo) {
              reportColor(expression, colorInfo)
            }
          }
        }

        // String attribute: style="#fff" (rare but possible)
        if (node.value && node.value.type === 'Literal') {
          const colorInfo = isHardcodedColor(node.value.value)
          if (colorInfo) {
            reportColor(node.value, colorInfo)
          }
        }
      },

      // Check variable declarations: const bg = '#fff'
      VariableDeclarator(node) {
        if (node.init && node.init.type === 'Literal') {
          const colorInfo = isHardcodedColor(node.init.value)
          if (colorInfo) {
            // Only warn if variable name suggests it's a color
            const varName = node.id.name?.toLowerCase() || ''
            if (
              varName.includes('color') ||
              varName.includes('bg') ||
              varName.includes('background') ||
              varName.includes('border') ||
              varName.includes('text')
            ) {
              reportColor(node.init, colorInfo)
            }
          }
        }

        // Object properties: const style = { backgroundColor: '#fff' }
        if (node.init && node.init.type === 'ObjectExpression') {
          node.init.properties.forEach(prop => {
            if (prop.type === 'Property' && prop.value.type === 'Literal') {
              const colorInfo = isHardcodedColor(prop.value.value)
              if (colorInfo) {
                reportColor(prop.value, colorInfo)
              }
            }
          })
        }
      },

      // Check object properties in any context
      Property(node) {
        if (node.value.type === 'Literal') {
          // Only check if property key suggests it's a color
          const keyName = node.key.name?.toLowerCase() || node.key.value?.toLowerCase() || ''
          if (
            keyName.includes('color') ||
            keyName.includes('background') ||
            keyName.includes('border')
          ) {
            const colorInfo = isHardcodedColor(node.value.value)
            if (colorInfo) {
              reportColor(node.value, colorInfo)
            }
          }
        }
      },
    }
  },
}
