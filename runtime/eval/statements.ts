import { BooleanExpr, FunctionDeclaration, IfStatement, Program, Stmt, VarDecleration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BooleanVal, FunctionValue, MK_NULL, RuntimeVal } from "../values.ts";
import { eval_boolean_expr } from "./expressions.ts";

export function eval_program(program: Program, env: Environment): RuntimeVal{
    let lastEvaluated: RuntimeVal = MK_NULL();

    for(const statement of program.body){
        lastEvaluated = evaluate(statement, env);
    }

    return lastEvaluated;
}

export function eval_var_decleration(declaration: VarDecleration, env: Environment): RuntimeVal {
    const value = declaration.value ? evaluate(declaration.value, env) : MK_NULL();
    return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function eval_function_decleration(declaration: FunctionDeclaration, env: Environment): RuntimeVal {
    const fn = {
        type: "function",
        name: declaration.name,
        parameters: declaration.parameters,
        declarationEnv: env,
        body: declaration.body,
    } as FunctionValue;

    return env.declareVar(declaration.name, fn, true);
}

export function eval_if_statement(statement: IfStatement, env: Environment): RuntimeVal{
    let ExprVal = false;
    for(let i = 0; i < statement.expressions.length; i++){
        ExprVal = (eval_boolean_expr(statement.expressions[i] as BooleanExpr, env) as BooleanVal).value;
    }
    let bodyLine: Stmt;
    if(ExprVal){
        for(let i = 0; i < statement.body.length; i++){
            bodyLine = statement.body[i];
            evaluate(bodyLine, env);
        }
        if(statement.while){
            eval_if_statement(statement, env);
        }
    }
    else{
        if(statement.do){
            for(let i = 0; i < statement.body.length; i++){
                bodyLine = statement.body[i];
                evaluate(bodyLine, env);
            }
        }
        
    }

    return MK_NULL();
}