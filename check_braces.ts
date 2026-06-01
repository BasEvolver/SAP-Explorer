import * as path from 'path';
import * as ts from 'typescript';

const filePath = path.join(process.cwd(), 'src/components/scenarios/ScenariosDashboard.tsx');
const program = ts.createProgram([filePath], { 
    noEmit: true,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS
});

console.log("Syntactic diagnostics:");
const syntDiag = program.getSyntacticDiagnostics();
syntDiag.forEach(d => {
    if (d.file) {
        const pos = ts.getLineAndCharacterOfPosition(d.file, d.start!);
        console.log(`Line ${pos.line + 1}, col ${pos.character + 1}: ${d.messageText}`);
    } else {
        console.log(d.messageText);
    }
});
