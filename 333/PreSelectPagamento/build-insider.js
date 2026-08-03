/**
 * Gera preSelectPagamentoResumoCompra.min.js no formato Insider-safe (guia-insider.md).
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const { minify } = require('terser');

const DIR = __dirname;
const SRC = path.join(DIR, 'preSelectPagamentoResumoCompra.js');
const OUT = path.join(DIR, 'preSelectPagamentoResumoCompra.min.js');

function tryEvalStringExpr(node) {
  if (t.isStringLiteral(node)) return node.value;
  if (t.isBinaryExpression(node, { operator: '+' })) {
    const left = tryEvalStringExpr(node.left);
    const right = tryEvalStringExpr(node.right);
    if (left == null || right == null) return null;
    return left + right;
  }
  return null;
}

function isStaticStringy(node) {
  return tryEvalStringExpr(node) != null;
}

function coalesceElements(elements) {
  const chunks = [];
  let accParts = [];

  function flushAcc() {
    if (!accParts.length) return;
    chunks.push(t.stringLiteral(accParts.join('\n')));
    accParts = [];
  }

  elements.forEach((el) => {
    const val = tryEvalStringExpr(el);
    if (val != null) {
      accParts.push(val);
    } else {
      flushAcc();
      chunks.push(el);
    }
  });
  flushAcc();
  return chunks;
}

function expandCssJoinArrays(code) {
  const ast = parser.parse(code, {
    sourceType: 'script',
    allowReturnOutsideFunction: true
  });

  traverse(ast, {
    ReturnStatement(pathNode) {
      const arg = pathNode.node.argument;
      if (!arg || !t.isCallExpression(arg)) return;
      if (!t.isMemberExpression(arg.callee)) return;
      if (!t.isIdentifier(arg.callee.property, { name: 'join' })) return;
      if (!t.isArrayExpression(arg.callee.object)) return;

      const elements = arg.callee.object.elements.filter(Boolean);
      const chunks = coalesceElements(elements);
      const pushes = chunks.map((el) =>
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(t.identifier('_c'), t.identifier('push')),
            [el]
          )
        )
      );

      pathNode.replaceWithMultiple([
        t.variableDeclaration('var', [
          t.variableDeclarator(t.identifier('_c'), t.arrayExpression([]))
        ]),
        ...pushes,
        t.returnStatement(
          t.callExpression(
            t.memberExpression(t.identifier('_c'), t.identifier('join')),
            [t.stringLiteral('\n')]
          )
        )
      ]);
    }
  });

  return generate(ast, { retainLines: false, compact: false }).code;
}

async function main() {
  let code = fs.readFileSync(SRC, 'utf8');

  // Expandir CSS so se necessario; com compact + coalescencia de literais
  code = expandCssJoinArrays(code);

  // 2) Babel ES5 (IE11)
  const babelResult = babel.transformSync(code, {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: { ie: '11' },
          modules: false
        }
      ]
    ],
    babelrc: false,
    configFile: false,
    comments: false
  });
  code = babelResult.code;

  // 3) Terser Insider-safe (beautify evita W033 no JSHint do Insider)
  const terserResult = await minify(code, {
    compress: {
      sequences: false,
      join_vars: false
    },
    mangle: {
      reserved: ['_wjErr', '_c']
    },
    format: {
      beautify: true,
      indent_level: 0,
      semicolons: true,
      ascii_only: true,
      wrap_iife: true,
      comments: false,
      max_line_len: false,
      braces: true
    }
  });

  if (terserResult.error) {
    throw terserResult.error;
  }
  code = terserResult.code;

  // 4) catch(_wjErr) pos-mangle
  code = code.replace(/catch\s*\(\s*[a-zA-Z_$][\w$]*\s*\)/g, 'catch(_wjErr)');

  // Garantir ; apos break/continue/return/throw antes de } (W033)
  code = code.replace(/\b(break|continue|return|throw)(\s*\n\s*)\}/g, '$1;$2}');
  code = code.replace(/\b(break|continue)(\s*)\}/g, '$1;$2}');

  // 5) Separar dataLayer da primeira IIFE (so o primeiro match)
  code = code.replace(
    /^(window\.dataLayer[\s\S]*?\}\);)\s*(!\(function)/,
    '$1\n$2'
  );

  // Separar segunda IIFE raiz (resumo) da primeira
  var seenStrictIife = 0;
  code = code.replace(/!\(function\(\)\{\s*"use strict";/g, function (match) {
    seenStrictIife += 1;
    if (seenStrictIife === 2) return '\n' + match;
    return match;
  });

  fs.writeFileSync(OUT, code, 'utf8');

  // Validacoes
  const chars = code.length;
  const hasLet = /\blet\b/.test(code);
  const hasConst = /\bconst\b/.test(code);
  const hasArrow = /=>/.test(code);
  const hasBacktick = /`/.test(code);
  const badLines = code
    .split(/\r?\n/)
    .map((line, i) => ({ line, i: i + 1 }))
    .filter(({ line }) => /^\s*[,+]/.test(line));
  const badCatch = /catch\s*\(\s*t\s*\)/.test(code);

  let parseOk = true;
  try {
    // eslint-disable-next-line no-new-func
    new Function(code);
  } catch (e) {
    parseOk = false;
    console.error('Parse fail:', e.message);
  }

  console.log('OUT:', OUT);
  console.log('chars:', chars, chars <= 65535 ? 'OK' : 'OVER LIMIT');
  console.log('let:', hasLet, 'const:', hasConst, 'arrow:', hasArrow, 'backtick:', hasBacktick);
  console.log('W014-ish lines:', badLines.length);
  if (badLines.length) {
    badLines.slice(0, 10).forEach(({ i, line }) => console.log('  L' + i + ':', line.slice(0, 80)));
  }
  console.log('catch(t):', badCatch);
  console.log('parse:', parseOk ? 'OK' : 'FAIL');
  console.log('_c.push count:', (code.match(/_c\.push/g) || []).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
