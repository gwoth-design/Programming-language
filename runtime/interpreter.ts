import { NumberVal, RuntimeVal } from "./values.ts";
import { AssignmentExpr, BinaryExpr, BooleanExpr, CallExpr, FunctionDeclaration, Identifier, IfStatement, NumericLiteral, ObjectLiteral, Program, Stmt, VarDecleration, VarDeclerationString } from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_identifier, eval_binary_expr, eval_assignment, eval_object_expr, eval_call_expr, eval_boolean_expr, eval_assignment_string } from "./eval/expressions.ts";
import { eval_function_decleration, eval_if_statement, eval_program, eval_var_decleration } from "./eval/statements.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal{

    switch (astNode.kind){
        case "NumericLiteral":
            return { 
                value: ((astNode as NumericLiteral).value),
                type: "number",
            } as NumberVal;
        
        case "Identifier":
            return eval_identifier(astNode as Identifier, env);
        
        case "ObjectLiteral":
            return eval_object_expr(astNode as ObjectLiteral, env);
        case "CallExpr":
            return eval_call_expr(astNode as CallExpr, env);
    
        case "AssignmentExpr":
            return eval_assignment(astNode as AssignmentExpr, env);

        case "BinaryExpr":
            return eval_binary_expr(astNode as BinaryExpr, env);
        
        case "Program":
            return eval_program(astNode as Program, env);

        case "BooleanExpr":
            return eval_boolean_expr(astNode as BooleanExpr, env);
        
        case "VarDecleration":
            return eval_var_decleration(astNode as VarDecleration, env);
        case "FunctionDeclaration":
            return eval_function_decleration(astNode as FunctionDeclaration, env);
        case "IfStatement":
            //console.log(astNode as IfStatement);
            return eval_if_statement(astNode as IfStatement, env);
        case "AssignmentExprString":
            return eval_assignment_string(astNode as VarDeclerationString, env);
        default:
            console.error("This AST Node has not yet been setup for interpretation: ", astNode);
            Deno.exit(1);
    }

}