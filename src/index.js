function insertMemoizeOneImport(program, t) {
  const existingImport = program.body.find(
    node =>
      node.type === "ImportDeclaration" && node.source.value === "memoize-one"
  );

  if (existingImport) {
    return existingImport.specifiers[0].local;
  }

  const newImport = new t.ImportDeclaration(
    [new t.ImportDefaultSpecifier(new t.Identifier("memoizeOne"))],
    new t.StringLiteral("memoize-one")
  );

  program.body.unshift(newImport);

  return newImport.specifiers[0].local;
}

let createdFunctions = 0;

function createLambdaCreator(program, memoizeIdentifier, lambda, babel) {
  const { traverse, types: t } = babel;
  const afterImportIndex =
    program.body.length -
    program.body
      .slice()
      .reverse()
      .findIndex(node => node.type === "ImportDeclaration");

  const creatorIdentifier = new t.Identifier(
    `$createMemoizedLambda${createdFunctions}`
  );

  const identifiersInLambda = [];

  const identifierVisitor = {
    Identifier(path) {
      if (lambda.params.find(param => param.name === path.node.name)) {
        return;
      }
      identifiersInLambda.push(path.node);
    }
  };

  traverse(lambda.body, identifierVisitor, { noScope: true }); // 360 no scope lol

  const lambdaCreator = new t.VariableDeclaration("const", [
    new t.VariableDeclarator(
      creatorIdentifier,
      t.CallExpression(memoizeIdentifier, [
        new t.ArrowFunctionExpression(identifiersInLambda, lambda)
      ])
    )
  ]);

  createdFunctions++;

  program.body.splice(afterImportIndex, 0, lambdaCreator);

  return [creatorIdentifier, identifiersInLambda];
}

export default function(babel) {
  const { types: t } = babel;

  return {
    name: "inline-lambda-transform",
    visitor: {
      JSXAttribute(path, pluginPass) {
        const { program } = pluginPass.file.ast;

        if (path.node.value.type !== "JSXExpressionContainer") {
          return;
        }

        const expression = path.node.value.expression;

        if (expression.type !== "ArrowFunctionExpression") {
          return;
        }

        const memoizeIdentifier = insertMemoizeOneImport(program, t);

        const [
          lambdaCreatorIdentifier,
          argumentsToLambda
        ] = createLambdaCreator(program, memoizeIdentifier, expression, babel);

        path.node.value.expression = new t.CallExpression(
          lambdaCreatorIdentifier,
          argumentsToLambda
        );
      }
    }
  };
}
