// deno-lint-ignore-file no-explicit-any
import { Stmt, Program, Expr, BinaryExpr, NumericLiteral, Identifier, VarDecleration, AssignmentExpr } from "./ast.ts";
import {tokenize, Token, TokenType} from "./lexer.ts";

export default class Parser{

    private tokens: Token[] = [];

    private not_eof(): boolean{
        return this.tokens[0].type != TokenType.EOF;
    }
    
    private at(){
        return this.tokens[0] as Token;
    }

    private eat(){
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    private expect(type: TokenType, err: any){
        const prev = this.tokens.shift() as Token;
        if (!prev || prev.type != type){
            console.error("Parser Error:\n", err, prev, "Expecting: ", type);
            Deno.exit(1);
        }
        return prev;
    }

    public produceAST (sourceCode: string): Program{
        this.tokens = tokenize(sourceCode);

        const program: Program = {
            kind: "Program",
            body: [],
        };
        //parse whilst not end of file
        while (this.not_eof()){
            program.body.push(this.parse_stmt());
        }
        
        return program;
    }

    private parse_stmt(): Stmt{
        switch(this.at().type){
            case TokenType.Let:


            case TokenType.Const:
                return this.parse_var_decleration();
            
            default:
                return this.parse_expr();
        }

    }


    parse_var_decleration(): Stmt {
        const isConstant = this.eat().type == TokenType.Const;
        const identifier = this.expect(TokenType.Identifier, "Expected identifier name following let | const keywords.",).value;

        if(this.at().type == TokenType.SemiColon){
            this.eat();
            if(isConstant){
                throw "Must assign value to constant. No value provided";
            }

            return { kind: "VarDecleration", identifier, constant: isConstant } as VarDecleration;
        }

        this.expect(TokenType.Equals, "Expected equals token following identifier in var decleration");
        const decleration = { 
            kind: "VarDecleration", 
            value: this.parse_expr(), 
            identifier,
            constant: isConstant 
        } as VarDecleration;
        this.expect(TokenType.SemiColon, "variable delcaration must end with semicolon");

        return decleration;
    }

    private parse_expr(): Expr{
        return this.parse_assignment_expr();
    }
    parse_assignment_expr(): Expr {
        const left = this.parse_additive_expr();

        if(this.at().type == TokenType.Equals){
            this.eat();
            const value = this.parse_assignment_expr();
            return {assigne: left, kind: "AssignmentExpr", value} as AssignmentExpr;
        }

        return left;
    }

    private parse_additive_expr(): Expr{
        let left = this.parse_multiplicative_expr();

        while(this.at().value == "+" || this.at().value == "-"){
            const operator = this.eat().value;
            const right = this.parse_multiplicative_expr();
            left = {
                kind: "BinaryExpr",
                left, 
                right, 
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_multiplicative_expr(): Expr{
        let left = this.parse_primary_expr();

        while(this.at().value == "*" || this.at().value == "/" || this.at().value == "%"){
            const operator = this.eat().value;
            const right = this.parse_primary_expr();
            left = {
                kind: "BinaryExpr",
                left, 
                right, 
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_primary_expr(): Expr{
        const tk = this.at().type;

        switch(tk){
            case TokenType.Identifier:
                return {kind: "Identifier", symbol: this.eat().value} as Identifier;
            case TokenType.Number:
                return {kind: "NumericLiteral", value: parseFloat(this.eat().value),} as NumericLiteral;
                
            case TokenType.OpenParen: {
                this.eat();
                const value = this.parse_expr();
                this.expect(
                    TokenType.CloseParen,
                    "Unexspected token found inside parenthasised expression. Expected closing parenthesis.",
                )
                return value;
            }

            default:
                console.error("Unexspected token found during parsing!", this.at())
                Deno.exit(1);
        }
    }

}