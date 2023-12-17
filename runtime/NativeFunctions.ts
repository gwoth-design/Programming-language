import Environment from "./environment.ts";
import { BooleanVal, MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER, NumberVal, RuntimeVal } from "./values.ts";

export function createGlobalEnv(){
    const env = new Environment();
    env.declareVar("true", MK_BOOL(true), true);
    env.declareVar("false", MK_BOOL(false), true);
    env.declareVar("null", MK_NULL(), true);

    //define native method
    env.declareVar("print", MK_NATIVE_FN((args, scope) => {
        //TODO make work with more values and such
        if(args[0].type == "number"){
            const value = <NumberVal>args[0]
            console.log((value.value));
        }
        else if(args[0].type == "boolean"){
            const value = <BooleanVal>args[0]
            console.log((value.value));
        }
        else{
            console.log(...args);
        }
        return MK_NULL();
    }), true);

    function timeFunction(args: RuntimeVal[], env: Environment){
        return MK_NUMBER(Date.now());
    }
    env.declareVar("time", MK_NATIVE_FN(timeFunction), true);

    return env;
}
