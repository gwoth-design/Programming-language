import { createGlobalEnv } from "./NativeFunctions.ts";
import { MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER, RuntimeVal } from "./values.ts";


export function CreateGlobalEnv(){
    //calls native enviroinemnt caller to make for all native stuff :)
    const env = createGlobalEnv();
    return env;
}

export default class Environment{

    private parnet?: Environment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;

    constructor (parentENV?: Environment){
        //const global = parentENV? true: false;
        this.parnet = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVar (varname: string, value: RuntimeVal, constant: boolean): RuntimeVal{
        if(this.variables.has(varname)){
            throw `Cannot declare variable ${varname}, As it already exists.`;
        }

        this.variables.set(varname, value);

        if(constant){
            this.constants.add(varname);
        }
        return value;
    }

    public assignVar (varname: string, value: RuntimeVal): RuntimeVal{
        const env = this.resolve(varname);
        //cannot change constant
        if(env.constants.has(varname)){
            throw `Cannot reasign to variable ${varname} as it was declared as constant. `;
        }
        env.variables.set(varname, value);

        return value;
    }

    public lookupVar (varname: string): RuntimeVal{
        const env = this.resolve(varname);
        return env.variables.get(varname) as RuntimeVal;
    }

    public resolve(varname: string): Environment{
        if(this.variables.has(varname)){
            return this;
        }

        if(this.parnet == undefined){
            throw `Cannot resolve '${varname}' as it doesn not exist`;
        }

        return this.parnet.resolve(varname);
    }

}