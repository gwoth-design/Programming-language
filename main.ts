import Parser from "./frontend/parser.ts";
import { CreateGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";


/*let [_, fileName] = Deno.args; // The first element in Deno.args is the script name

if (!fileName) {
  console.error("Please provide a file name.");
  Deno.exit(1);
}

try {
  const data = await Deno.readFile(fileName);
} catch (error) {
  console.error("Error reading the file:", error);
  Deno.exit(1);
}*/

const fileName = "./code/test.lum";
//run("./test.lum");
run(fileName); //takes input file
//repl();

function repl(){
    const parser = new Parser();
    const env = CreateGlobalEnv();
    console.log("\nRepl v0.1");

    while(true){
        const input = prompt(">");

        if(!input || input.includes("exit")){
            Deno.exit(1);
        }

        const program = parser.produceAST(input);

        const result = evaluate(program, env);
        console.log(result);
    }
}

async function run(filename: string){
    const parser = new Parser();
    const env = CreateGlobalEnv();

    const input = await Deno.readTextFile(filename);
    const program = parser.produceAST(input);
    //console.log(program);
    const result = evaluate(program, env);
    console.log(result);
}