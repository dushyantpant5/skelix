import _traverse from '@babel/traverse'
// @babel/traverse ships CJS — the default import may be the function itself or wrapped under .default
const traverse = ((_traverse as any).default ?? _traverse) as typeof _traverse
import * as t from '@babel/types'
import type { ParseResult } from '@babel/parser'
import type { File } from '@babel/types'
import type { JsxNode } from '../ir/types.js'

function getTagName(node: t.JSXOpeningElement): string {
  const name = node.name
  if (t.isJSXIdentifier(name)) return name.name
  if (t.isJSXMemberExpression(name)) {
    const obj = t.isJSXIdentifier(name.object) ? name.object.name : 'Unknown'
    return `${obj}.${name.property.name}`
  }
  return 'Unknown'
}

function getAttributes(opening: t.JSXOpeningElement): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const attr of opening.attributes) {
    if (!t.isJSXAttribute(attr)) continue
    const key = t.isJSXIdentifier(attr.name) ? attr.name.name : String(attr.name)
    if (attr.value === null) {
      attrs[key] = 'true'
    } else if (t.isStringLiteral(attr.value)) {
      attrs[key] = attr.value.value
    } else if (t.isJSXExpressionContainer(attr.value)) {
      if (t.isStringLiteral(attr.value.expression)) {
        attrs[key] = attr.value.expression.value
      } else if (t.isTemplateLiteral(attr.value.expression)) {
        attrs[key] = attr.value.expression.quasis.map(q => q.value.cooked ?? '').join(' ')
      } else {
        attrs[key] = ''
      }
    }
  }
  return attrs
}

/** Pre-pass: collect lengths of statically-declared arrays (const items = [...]) */
function collectStaticArrayLengths(ast: ParseResult<File>): Map<string, number> {
  const lengths = new Map<string, number>()
  traverse(ast, {
    VariableDeclarator(path) {
      const { id, init } = path.node
      if (t.isIdentifier(id) && t.isArrayExpression(init)) {
        lengths.set(id.name, init.elements.length)
      }
    },
  })
  return lengths
}

function findRootJsx(body: t.Statement[]): t.JSXElement | t.JSXFragment | null {
  for (const stmt of body) {
    if (t.isReturnStatement(stmt) && stmt.argument) {
      if (t.isJSXElement(stmt.argument)) return stmt.argument
      if (t.isJSXFragment(stmt.argument)) return stmt.argument
    }
    if (t.isExpressionStatement(stmt) && t.isJSXElement(stmt.expression)) {
      return stmt.expression
    }
  }
  return null
}

function extractJsxElement(
  node: t.JSXElement,
  isLoopChild: boolean,
  isConditional: boolean,
  arrayLengths: Map<string, number>,
  staticLoopCount?: number,
): JsxNode {
  const tag = getTagName(node.openingElement)
  const attributes = getAttributes(node.openingElement)
  const children: JsxNode[] = []

  for (const child of node.children) {
    if (t.isJSXElement(child)) {
      children.push(extractJsxElement(child, false, false, arrayLengths))
    } else if (t.isJSXExpressionContainer(child)) {
      const expr = child.expression
      if (t.isCallExpression(expr)) {
        // Handle .map() calls — detect static array length when available
        const callee = expr.callee
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.property, { name: 'map' })
        ) {
          let loopCount: number | undefined
          if (t.isIdentifier(callee.object)) {
            loopCount = arrayLengths.get(callee.object.name)
          }

          const callback = expr.arguments[0]
          if (
            (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) &&
            t.isJSXElement(callback.body)
          ) {
            const child = extractJsxElement(callback.body, true, false, arrayLengths)
            children.push({ ...child, staticLoopCount: loopCount })
          } else if (
            (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) &&
            t.isBlockStatement(callback.body)
          ) {
            for (const stmt of callback.body.body) {
              if (t.isReturnStatement(stmt) && stmt.argument && t.isJSXElement(stmt.argument)) {
                const child = extractJsxElement(stmt.argument, true, false, arrayLengths)
                children.push({ ...child, staticLoopCount: loopCount })
              }
            }
          }
        }
      } else if (t.isLogicalExpression(expr) && expr.operator === '&&') {
        // {condition && <Element />} — keep the single branch
        if (t.isJSXElement(expr.right)) {
          children.push(extractJsxElement(expr.right, false, true, arrayLengths))
        }
      } else if (t.isConditionalExpression(expr)) {
        // {condition ? <A /> : <B />} — only take the primary (truthy) branch
        if (t.isJSXElement(expr.consequent)) {
          children.push(extractJsxElement(expr.consequent, false, true, arrayLengths))
        }
        // alternate branch intentionally omitted — skeleton shows the default state
      }
    } else if (t.isJSXText(child)) {
      const text = child.value.trim()
      if (text) {
        children.push({
          tag: '__text__',
          attributes: {},
          children: [],
          isLoopChild: false,
          isConditional: false,
          textContent: text,
        })
      }
    } else if (t.isJSXFragment(child)) {
      for (const fragChild of child.children) {
        if (t.isJSXElement(fragChild)) {
          children.push(extractJsxElement(fragChild, false, false, arrayLengths))
        }
      }
    }
  }

  // Extract render prop functions (e.g. <FormField render={() => <JSX />} />)
  for (const attr of node.openingElement.attributes) {
    if (!t.isJSXAttribute(attr) || !t.isJSXExpressionContainer(attr.value)) continue
    const expr = attr.value.expression
    if (t.isArrowFunctionExpression(expr) || t.isFunctionExpression(expr)) {
      const body = expr.body
      if (t.isJSXElement(body)) {
        children.push(extractJsxElement(body, false, false, arrayLengths))
      } else if (t.isBlockStatement(body)) {
        const found = findRootJsx(body.body)
        if (found && t.isJSXElement(found)) {
          children.push(extractJsxElement(found, false, false, arrayLengths))
        }
      }
    }
  }

  // Tabs — only keep the TabsContent matching defaultValue to avoid rendering all panels
  if (tag === 'Tabs' && attributes.defaultValue) {
    const defaultValue = attributes.defaultValue
    const filteredChildren = children.filter(child => {
      if (child.tag === 'TabsContent') {
        return child.attributes.value === defaultValue
      }
      return true
    })
    return { tag, attributes, children: filteredChildren, isLoopChild, isConditional, staticLoopCount }
  }

  return { tag, attributes, children, isLoopChild, isConditional, staticLoopCount }
}

export interface ExtractResult {
  tree: JsxNode | null
  componentName: string | null
}

/** Extract both the JSX tree and the exported component's function name from the AST */
export function extractJsxTree(ast: ParseResult<File>): ExtractResult {
  let rootNode: JsxNode | null = null
  let componentName: string | null = null
  const arrayLengths = collectStaticArrayLengths(ast)

  function resolveRoot(found: t.JSXElement | t.JSXFragment): JsxNode {
    if (t.isJSXElement(found)) {
      return extractJsxElement(found, false, false, arrayLengths)
    }
    const children: JsxNode[] = []
    for (const child of found.children) {
      if (t.isJSXElement(child)) children.push(extractJsxElement(child, false, false, arrayLengths))
    }
    return { tag: 'div', attributes: {}, children, isLoopChild: false, isConditional: false }
  }

  traverse(ast, {
    // Arrow function component: const Foo = () => <JSX />
    ArrowFunctionExpression(path) {
      if (rootNode) return
      const body = path.node.body

      // Capture the variable name (const Foo = () => ...)
      if (!componentName && t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
        componentName = path.parent.id.name
      }

      if (t.isJSXElement(body)) {
        rootNode = extractJsxElement(body, false, false, arrayLengths)
        path.stop()
      } else if (t.isJSXFragment(body)) {
        rootNode = resolveRoot(body)
        path.stop()
      } else if (t.isBlockStatement(body)) {
        const found = findRootJsx(body.body)
        if (found) {
          rootNode = resolveRoot(found)
          path.stop()
        }
      }
    },

    FunctionDeclaration(path) {
      if (rootNode) return
      if (!componentName && path.node.id) componentName = path.node.id.name
      const found = findRootJsx(path.node.body.body)
      if (found) {
        rootNode = resolveRoot(found)
        path.stop()
      }
    },

    FunctionExpression(path) {
      if (rootNode) return
      if (!componentName && t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
        componentName = path.parent.id.name
      }
      const found = findRootJsx(path.node.body.body)
      if (found) {
        rootNode = resolveRoot(found)
        path.stop()
      }
    },
  })

  return { tree: rootNode, componentName }
}
