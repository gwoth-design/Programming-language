
export enum TokenType{
    Number, 
    Identifier,

    Let,
    Const,
    Fn,

    String, 
    Character,

    BooleanStmt,

    SingleComment, //Single line comment #
    LongCommment, //multiline comment ~

    Do,
    While,

    If,
    Else,
    Elif,

    SpeachMarks,

    Break,

    Equals, // =
    Comma, // ,
    Dot,
    Colon, // :
    Semicolon, // ;
    OpenBracket,  // (
    CloseBracket, // )
    OpenBrakey, // {
    CloseBrakey, // }
    OpenSquareBracket, // [
    CloseSquareBracket, // ]
    BinaryOperator, // + - * / // % **
    BooleanOperator, // == != >= <=
    EOL, //siginifies end of line. THIS IS MAINLY ONLY NEEDED FOR COMMENTS
    EOF, //signifies end of file
}

const KEYWORDS: Record<string, TokenType> = {
    let: TokenType.Let,
    const: TokenType.Const,
    fn: TokenType.Fn,
    if: TokenType.If,
    do: TokenType.Do,
    while: TokenType.While,
    else: TokenType.Else,
    elif: TokenType.Elif,
    break: TokenType.Break,
};

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
    return str == ' ' || str == '¬' || str == '\t' || str == "\r";
}

function isOp (str: string){
    return str == "!" || str == "=" || str == ">" || str == "<" || str == "==";
}

function isint(str: string){
    const c = str.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
    return (c >= bounds[0] && c <= bounds[1])
}

export function tokenize (sourceCode: string): Token[]{
    let skipCode = false;
    const tokens = new Array<Token>();
    const srcc = sourceCode.split("");
    const src: string[] = srcc.map((str) => str.replace(/\n/g, '¬'));

    //continue reading and making tokens until the end of the file
    while (src.length > 0){
        if(src[0] == "#"){
            skipCode = true;
        }
        else if(src[0] == "¬"){
            skipCode = false;
        }
        if(skipCode){
            src.shift();
            continue;
        }
        if(src[0] == "("){
            tokens.push(token(src.shift(), TokenType.OpenBracket));
        }
        else if(src[0] == ")"){
            tokens.push(token(src.shift(), TokenType.CloseBracket));
        }

        else if(src[0] == "{"){
            tokens.push(token(src.shift(), TokenType.OpenBrakey));
        }

        else if(src[0] == "}"){
            tokens.push(token(src.shift(), TokenType.CloseBrakey));
        }
        /*else if(src[0] == "#"){
            tokens.push(token(src.shift(), TokenType.SingleComment));
        }
        else if(src[0] == "~"){
            tokens.push(token(src.shift(), TokenType.LongCommment));
        }*/
        else if(src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%"){
            tokens.push(token(src.shift(), TokenType.BinaryOperator));
        }
        else if(src[0] == "=" && src[1] != "="){
            tokens.push(token(src.shift(), TokenType.Equals));
        }
        else if(src[0] == ";"){
            tokens.push(token(src.shift(), TokenType.Semicolon));
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
            tokens.push(token(src.shift(), TokenType.OpenSquareBracket));
        }
        else if(src[0] == "]"){
            tokens.push(token(src.shift(), TokenType.CloseSquareBracket));
        }
        else if(src[0] == '"'){
            tokens.push(token(src.shift(), TokenType.SpeachMarks));
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
                //console.log(ident);
                const reserved = KEYWORDS[ident]
                //console.log(typeof reserved + " " + ident);
                if(typeof reserved == "number"){
                    tokens.push(token(ident, reserved));
                }
                else{
                    tokens.push(token(ident, TokenType.Identifier));
                }
            }
            else if(isskippable(src[0])){
                /*if(src[0] == '\n'){
                    tokens.push(token('\n', TokenType.EOL));
                }*/
                src.shift(); // skip the character
            }
            else if(isOp(src[0])){
                let op = ""
                while(src.length > 0 && isOp(src[0])){
                    op += src.shift();
                }
                tokens.push(token(op, TokenType.BooleanOperator));
                //console.log(op);
            }
            else{
                console.log("Unrecognised character found in source: ", src[0]);
                Deno.exit(1);
            }
        }
    }
    tokens.push({value: "EndOfFile", type: TokenType.EOF});
    //console.log(tokens)
    return tokens;
}

//const source = await Deno.readTextFile("./test.lum");
//for(const token of tokenize(source)){
    // console.log(token);
//}