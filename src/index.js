const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const template = require("@babel/template").default;
const path = require('path');
const fs = require('fs');

let sourceCode = null;
sourceCode = fs.readFileSync(path.join(__dirname,'./test.js'),'utf-8') 
 


 
const ast = parser.parse(sourceCode,{
  sourceType:'unambiguous',
  plugins:['jsx']
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
const value_iden = valueIdenTemp({
  NAME:valueIden
},{allowSuperOutsideMethod:false})
let FP = t.identifier('value');
let EP = t.identifier('err');
const props_temp = template.statements(`
this.props.form.validateFields().then(FP).catch(EP)
`)
 
 
traverse(ast, {
  ArrowFunctionExpression(path) {
  
    let parentName = path.parentPath.node.callee&&path.parentPath.node.callee.property.name =='validateFields';
    console.log(parentName)
    if(parentName) {
      let con = path.node.body.body[0].consequent,
      alt = path.node.body.body[0].alternate;
      let params = path.node.params;
      const propsTemp =  props_temp({
        FP:t.arrowFunctionExpression([params[1]],con),
        EP:t.arrowFunctionExpression([params[0]],alt)
      })
      path.parentPath.replaceWithMultiple(propsTemp)
    }  
     
  }
});
 
const {code,map} = generate(ast);
console.log(code)
fs.writeFileSync('./test.js',code)
