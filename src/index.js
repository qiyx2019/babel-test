const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const template = require("@babel/template").default;
const path = require('path');
const fs = require('fs');

let sourceCode = null;
sourceCode = fs.readFileSync(path.join(__dirname, './test.js'), 'utf-8')



const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['jsx']
});


const valueIden = t.identifier('name');
const nullIden = t.identifier('null');
const valueIdenTemp = template.statements(`
    if(NAME) {
      return NAME.toLowerCase();
    } else {
      return null;
    }
`)

const props_temp = template.statements(`
this.props.form.validateFields().then(FP).catch(EP)
`)
const generateCommentNode = (node) => {
  if (node.value.startsWith('##$')) {
    let value = node.value.substring(3);
    let begin = value.indexOf('(');
    let end = value.indexOf(')');
    let arg = value.substring(begin + 1, end);
    let oldArg = value.substring(begin, end + 1);
    value = value.replace(oldArg, '')
    let args = t.identifier(arg);
    let comment = t.callExpression(t.identifier(value), [args])
    return comment;
  }
}
traverse(ast, {
  ArrowFunctionExpression(path) {
    let parentName = path.parentPath.node.callee && path.parentPath.node.callee.property.name == 'validateFields';
    console.log(parentName)
    if (parentName) {
      let con = path.node.body.body[0].consequent,
        alt = path.node.body.body[0].alternate;
      let comment = con.body[0].leadingComments;
      if (comment.length) {
        let newComment = comment.map(item => generateCommentNode(item));
        con.body.unshift(...newComment);
        con.body.map(i => delete i.leadingComments);
      }

      let { params } = path.node;
      const propsTemp = props_temp({
        FP: t.arrowFunctionExpression([params[1]], con),
        EP: t.arrowFunctionExpression([params[0]], alt)
      })
      path.parentPath.replaceWithMultiple(propsTemp)
    }

  }
});

const { code, map } = generate(ast);
console.log(code)
fs.writeFileSync(path.join(__dirname, './test.js'), code)
