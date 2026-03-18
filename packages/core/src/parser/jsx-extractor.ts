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
    // e.g. Foo.Bar -> "Foo.Bar"
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
        // Extract static parts of template literals
        attrs[key] = attr.value.expression.quasis.map(q => q.value.cooked ?? '').join(' ')
      } else {
        attrs[key] = ''
      }
    }
  }
  return attrs
}

function extractJsxElement(
  node: t.JSXElement,
  isLoopChild: boolean,
  isConditional: boolean
): JsxNode {
  const tag = getTagName(node.openingElement)
  const attributes = getAttributes(node.openingElement)
  const children: JsxNode[] = []

  for (const child of node.children) {
    if (t.isJSXElement(child)) {
      children.push(extractJsxElement(child, false, false))
    } else if (t.isJSXExpressionContainer(child)) {
      const expr = child.expression
      if (t.isCallExpression(expr)) {
        // Handle .map() calls
        const callee = expr.callee
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.property, { name: 'map' })
        ) {
          const callback = expr.arguments[0]
          if (
            (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) &&
            t.isJSXElement(callback.body)
          ) {
            children.push(extractJsxElement(callback.body, true, false))
          } else if (
            (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) &&
            t.isBlockStatement(callback.body)
          ) {
            // Find return statement
            for (const stmt of callback.body.body) {
              if (t.isReturnStatement(stmt) && stmt.argument && t.isJSXElement(stmt.argument)) {
                children.push(extractJsxElement(stmt.argument, true, false))
              }
            }
          }
        }
      } else if (t.isLogicalExpression(expr) && expr.operator === '&&') {
        // {condition && <Element />}
        if (t.isJSXElement(expr.right)) {
          children.push(extractJsxElement(expr.right, false, true))
        }
      } else if (t.isConditionalExpression(expr)) {
        // {condition ? <A /> : <B />}
        if (t.isJSXElement(expr.consequent)) {
          children.push(extractJsxElement(expr.consequent, false, true))
        }
        if (t.isJSXElement(expr.alternate)) {
          children.push(extractJsxElement(expr.alternate, false, true))
        }
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
          children.push(extractJsxElement(fragChild, false, false))
        }
      }
    }
  }

  return { tag, attributes, children, isLoopChild, isConditional }
}

function findRootJsx(body: t.Statement[]): t.JSXElement | t.JSXFragment | null {
  for (const stmt of body) {
    if (t.isReturnStatement(stmt) && stmt.argument) {
      if (t.isJSXElement(stmt.argument)) return stmt.argument
      if (t.isJSXFragment(stmt.argument)) return stmt.argument
      // Handle parenthesized returns
    }
    if (t.isExpressionStatement(stmt) && t.isJSXElement(stmt.expression)) {
      return stmt.expression
    }
  }
  return null
}

export function extractJsxTree(ast: ParseResult<File>): JsxNode | null {
  let rootNode: JsxNode | null = null

  traverse(ast, {
    // Arrow function component: const Foo = () => <JSX />
    ArrowFunctionExpression(path) {
      if (rootNode) return
      const body = path.node.body
      if (t.isJSXElement(body)) {
        rootNode = extractJsxElement(body, false, false)
        path.stop()
        return
      }
      if (t.isJSXFragment(body)) {
        // Wrap fragment children in a synthetic container
        const children: JsxNode[] = []
        for (const child of body.children) {
          if (t.isJSXElement(child)) children.push(extractJsxElement(child, false, false))
        }
        rootNode = { tag: 'div', attributes: {}, children, isLoopChild: false, isConditional: false }
        path.stop()
        return
      }
      if (t.isBlockStatement(body)) {
        const found = findRootJsx(body.body)
        if (found) {
          if (t.isJSXElement(found)) {
            rootNode = extractJsxElement(found, false, false)
          } else {
            const children: JsxNode[] = []
            for (const child of found.children) {
              if (t.isJSXElement(child)) children.push(extractJsxElement(child, false, false))
            }
            rootNode = { tag: 'div', attributes: {}, children, isLoopChild: false, isConditional: false }
          }
          path.stop()
        }
      }
    },
    // Function declaration/expression component
    FunctionDeclaration(path) {
      if (rootNode) return
      const found = findRootJsx(path.node.body.body)
      if (found) {
        if (t.isJSXElement(found)) {
          rootNode = extractJsxElement(found, false, false)
        } else {
          const children: JsxNode[] = []
          for (const child of found.children) {
            if (t.isJSXElement(child)) children.push(extractJsxElement(child, false, false))
          }
          rootNode = { tag: 'div', attributes: {}, children, isLoopChild: false, isConditional: false }
        }
        path.stop()
      }
    },
    FunctionExpression(path) {
      if (rootNode) return
      const found = findRootJsx(path.node.body.body)
      if (found) {
        if (t.isJSXElement(found)) {
          rootNode = extractJsxElement(found, false, false)
        } else {
          const children: JsxNode[] = []
          for (const child of found.children) {
            if (t.isJSXElement(child)) children.push(extractJsxElement(child, false, false))
          }
          rootNode = { tag: 'div', attributes: {}, children, isLoopChild: false, isConditional: false }
        }
        path.stop()
      }
    },
  })

  return rootNode
}
