import { SourceFile, Node } from 'typescript';

export const loc = (sourceFile: SourceFile, node: Node) => {
  const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
  return {
    start: {
      line: start.line + 1,
      column: start.character,
    },
    end: {
      line: end.line + 1,
      column: end.character,
    },
  };
};
