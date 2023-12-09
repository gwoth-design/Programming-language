
export enum TokenType{
    Number, 
    Identifier,
    Let,
    Const,
    String, 
    Equals, // =
    Comma, // ,
    Dot,
    Colon, // :
    SemiColon, // ;
    OpenParen,  // (
    CloseParen, // )
    OpenBrace, // {
    CloseBrace, // }
    OpenBracket, // [
    CloseBracket, // ]
    BinaryOperator, // + - * / // % **
    EOF, //signifies end of file
}

const KEYWORDS: Record<string, TokenType> = {
    let: TokenType.Let,
    const: TokenType.Const,
}

export interface Token{
    value: string,
    type: TokenType,
}

function token (value = "", type: TokenType): Token{
    return {value, type};
}

function isalpha(src: string){
    return src.toUpperCase() != src.toLowerCase();
}

function isskippable (str: string){
    return str == ' ' || str == '\n' || str == '\t' || str == "\r";
}

function isint(str: string){
    const c = str.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
    return (c >= bounds[0] && c <= bounds[1])
}

export function tokenize (sourceCode: string): Token[]{
    const tokens = new Array<Token>();
    const src = sourceCode.split("");

    //continue reading and making tokens until the end of the file
    while (src.length > 0){
        if(src[0] == "("){
            tokens.push(token(src.shift(), TokenType.OpenParen));
        }
        else if(src[0] == ")"){
            tokens.push(token(src.shift(), TokenType.CloseParen));
        }

        else if(src[0] == "{"){
            tokens.push(token(src.shift(), TokenType.OpenBrace));
        }

        else if(src[0] == "}"){
            tokens.push(token(src.shift(), TokenType.CloseBrace));
        }

        else if(src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%"){
            tokens.push(token(src.shift(), TokenType.BinaryOperator));
        }
        else if(src[0] == "="){
            tokens.push(token(src.shift(), TokenType.Equals));
        }
        else if(src[0] == ";"){
            tokens.push(token(src.shift(), TokenType.SemiColon));
        }
        else if(src[0] == ":"){
            tokens.push(token(src.shift(), TokenType.Colon));
        }
        else if(src[0] == ","){
            tokens.push(token(src.shift(), TokenType.Comma));
        }
        else if(src[0] == "."){
            tokens.push(token(src.shift(), TokenType.Dot));
        }
        else if(src[0] == "["){
            tokens.push(token(src.shift(), TokenType.OpenBracket));
        }
        else if(src[0] == "]"){
            tokens.push(token(src.shift(), TokenType.CloseBracket));
        }
        else{
            //this handles all multicharacter tokens

            //create the number token
            if(isint(src[0])){
                let num = ""
                while(src.length > 0 && isint(src[0])){
                    num += src.shift();
                }
                tokens.push(token(num, TokenType.Number));
            }
            else if(isalpha(src[0])){
                let ident = ""
                while(src.length > 0 && isalpha(src[0])){
                    ident += src.shift();
                }

                //check if is a reserved keyword
                const reserved = KEYWORDS[ident]
                if(typeof reserved == "number"){
                    tokens.push(token(ident, reserved));
                }
                else{
                    tokens.push(token(ident, TokenType.Identifier));
                }
            }
            else if(isskippable(src[0])){
                src.shift(); // skip the character
            }
            else{
                console.log("Unrecognised character found in source: ", src[0]);
                Deno.exit(1);
            }
        }
    }
    tokens.push({type: TokenType.EOF, value: "EndOfFile"});
    return tokens;
}

//const source = await Deno.readTextFile("./test.lum");
//for(const token of tokenize(source)){
    // console.log(token);
//}