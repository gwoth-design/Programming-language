import { NumberVal, RuntimeVal } from "./values.ts";
import { BinaryExpr, Identifier, NumericLiteral, Program, Stmt, VarDecleration } from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_identifier, eval_binary_expr } from "./eval/expressions.ts";
import { eval_program, eval_var_decleration } from "./eval/statements.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal{

    switch (astNode.kind){
        case "NumericLiteral":
            return { 
                value: ((astNode as NumericLiteral).value),
                type: "number",
            } as NumberVal;
        
        case "Identifier":
            return eval_identifier(astNode as Identifier, env);
        
        case "BinaryExpr":
            return eval_binary_expr(astNode as BinaryExpr, env);
        
        case "Program":
            return eval_program(astNode as Program, env);
        
        case "VarDecleration":
            return eval_var_decleration(astNode as VarDecleration, env);
        
        default:
            console.error("This AST Node has not yet been setup for interpretation: ", astNode);
            Deno.exit(1);
    }

}