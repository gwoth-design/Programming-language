import { AssignmentExpr, BinaryExpr, BooleanExpr, CallExpr, Identifier, ObjectLiteral, VarDeclerationString } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BooleanVal, FunctionValue, MK_NULL, NativeFnValue, NumberVal, ObjectVal, RuntimeVal, ValueType } from "../values.ts";

function eval_numeric_binary_expr(lhs: NumberVal, rhs: NumberVal, operator: string): NumberVal{
    let result: number;
    if(operator == "+"){
        result = lhs.value + rhs.value;
    }
    else if(operator == "-"){
        result = lhs.value - rhs.value;
    }
    else if(operator == "*"){
        result = lhs.value * rhs.value;
    }
    else if(operator == "/"){
        result = lhs.value / rhs.value;
    }
    else if(operator == "%"){ 
        result = lhs.value % rhs.value;
    }
    else if(operator == "//"){ //for now isnt actually floor division
        result = Math.floor(lhs.value / rhs.value);
    }

    else{
        result = 0;
    }

    return { value: result, type: "number"};
}

function eval_all_boolean_expr(lhs: NumberVal, rhs: NumberVal, operator: string): BooleanVal{
    let result = true;

    if(operator == ">"){
        result = lhs.value > rhs.value;
    }
    else if(operator == "<"){
        result = lhs.value < rhs.value;
    }
    else if(operator == ">="){
        result = lhs.value >= rhs.value;
    }
    else if(operator == "<="){
        result = lhs.value <= rhs.value;
    }
    else if(operator == "!="){
        result = lhs.value != rhs.value;
    }
    else if(operator == "=="){
        result = lhs.value == rhs.value;
    }
    else if(operator == "!"){
        result = lhs.value != rhs.value;
    }

    return { value: result, type: "boolean"};
}

export function eval_boolean_expr(boolop: BooleanExpr, env: Environment): RuntimeVal{
    const lhs = evaluate(boolop.left, env);
    const rhs = evaluate(boolop.right, env);

    return eval_all_boolean_expr(lhs as NumberVal, rhs as NumberVal, boolop.boolop);
}

export function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal{

    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);

    if(lhs.type == "number" && rhs.type == "number"){
        return eval_numeric_binary_expr(lhs as NumberVal, rhs as NumberVal, binop.operator);
    }
    return MK_NULL();
}

export function eval_identifier(ident: Identifier, env: Environment): RuntimeVal{
    const val = env.lookupVar(ident.symbol);
    return val;
}

export function eval_assignment (node: AssignmentExpr, env: Environment): RuntimeVal{
    if(node.assigne.kind !== "Identifier"){
        throw `Invalid LHS inside assignment expression ${JSON.stringify(node.assigne)}`;
    }
    const varname = (node.assigne as Identifier).symbol;
    const nodeValue = node.value; // Assuming node.value is of type 'Expr | undefined'
    if (nodeValue) {
    return env.assignVar(varname, evaluate(nodeValue, env));
    } else {
        return MK_NULL();
    }
}


export function eval_assignment_string(node: VarDeclerationString, env: Environment): RuntimeVal{
    const varname = node.assigne;
    const nodeValue = node.value; // Assuming node.value is of type 'Expr | undefined'
    if (nodeValue) {
        return env.declareVar(varname, {type: nodeValue as ValueType}, node.constant);
    } else {
        return MK_NULL();
    }
}

export function eval_object_expr (obj: ObjectLiteral, env: Environment): RuntimeVal{

    const object = {type: "object", properties: new Map()} as ObjectVal;
    for (const {key, value} of obj.properties ){
        const runtimeVal = (value == undefined) ? env.lookupVar(key) : evaluate(value, env)
        object.properties.set(key, runtimeVal);
    }
    return object;

}
export function eval_call_expr (expr: CallExpr, env: Environment): RuntimeVal{

    const args = expr.args.map((arg) => evaluate(arg, env));
    const fn = evaluate(expr.caller, env);

    if(fn.type == "native-fn"){
        const result = (fn as NativeFnValue).call(args, env);
        return result;
    }
    if (fn.type == "function"){
        const func = fn as FunctionValue;
        const scope = new Environment(func.declarationEnv);

        for (let i = 0; i < func.parameters.length; i++){
            //TODO check the bounds here
            //verify there are enough paramateres and arguments
            const varname = func.parameters[i];
            scope.declareVar(varname, args[i], false);
        }


        let result: RuntimeVal = MK_NULL();
        //evalueate function body stmt bt stmt
        for(const stmt of func.body){
            result = evaluate(stmt, scope);
        }

        return result;
    }
    throw "Cannot call value that is not a function: " + JSON.stringify(fn);

}