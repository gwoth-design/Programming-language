// deno-lint-ignore-file no-explicit-any
import { Stmt, Program, Expr, BinaryExpr, NumericLiteral, Identifier, VarDecleration, AssignmentExpr, Property, ObjectLiteral, CallExpr, MemberExpr, FunctionDeclaration, BooleanExpr, IfStatement, } from "./ast.ts";
import {tokenize, Token, TokenType} from "./lexer.ts";

export default class Parser{

    public comment = 0; // set up a comment boolean to tell the parser whether or not to keep skipping over code

    private tokens: Token[] = [];
    private prevToken: Token[] = [];

    private not_eof(): boolean{
        return this.tokens[0].type != TokenType.EOF;
    }
    
    private at(){
        return this.tokens[0] as Token;
    }
    private viewPrev(offset: number){
        return this.prevToken[this.prevToken.length + offset];
    }

    private savePrev(prev: Token){
        this.prevToken.push(prev);
    }

    private eat(){
        const prev = this.tokens.shift() as Token;
        this.savePrev(prev);
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
            case TokenType.Fn:
                return this.parse_fn_declaration();
            case TokenType.If:
                return this.parse_if_statement();
            default:
                return this.parse_expr();
        }

    }
    parse_fn_declaration(): Stmt {
      this.eat(); //eat fn keyword
      const name = this.expect(TokenType.Identifier, "Expected function name folowing fn keyword").value;

      const args = this.parse_args();
      const params: string[] = [];

      for (const arg of args){
        if(arg.kind !== "Identifier"){
            console.log(arg);
            throw "inside function declaration exprected paramters to be of type string";
        }
        console.log(arg);
        params.push((arg as Identifier).symbol);
      }

      this.expect(TokenType.OpenBrakey, "Expected function body following declaration");

      const body: Stmt[] = [];

      while(this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrakey){
        body.push(this.parse_stmt());
      }

      this.expect(TokenType.CloseBrakey, "Closing brace exprected inside function declaration");
      const fn = {
        body, name, parameters: params, kind: "FunctionDeclaration"
      } as FunctionDeclaration;

      return fn;
    }

    //IF STMT
    parse_if_statement(): Stmt{ //TODO Make sure that the expressions array can be added more than one seperated via a boolean if operator
        this.eat(); //eat if keyword
        const exprs = this.parse_If_stmt() as BooleanExpr[]; //list of all the expressions
        const stmts: BooleanExpr[] = [];
  
        for (const expr of exprs){
            stmts.push(expr)
        }

        this.expect(TokenType.OpenBrakey, "Expected function body following declaration");
  
        const body: Stmt[] = [];
  
        while(this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrakey){
          body.push(this.parse_stmt());
        }
  
        this.expect(TokenType.CloseBrakey, "Closing brace exprected inside function declaration");
        const If = {
            kind: "IfStatement", expressions: stmts, body,
        } as IfStatement;
  
        //console.log(If);
        return If;
    }

    private parse_If_stmt(): Expr[] {
        this.expect(TokenType.OpenBracket, "Expexred open parenthasis");
        const exprs = this.at().type == TokenType.CloseBracket ? [] : this.parse_if_expressions_list();
        this.expect(TokenType.CloseBracket, "Missing closeing parenthasis inside arguments list");
        return exprs;
    }

    private parse_if_expressions_list(): Expr[] {
        const exprs = [this.parse_assignment_expr()]; //maybve change direcily to boolean expressions parsing

        while (this.at().type == TokenType.BooleanStmt && this.eat()){
            exprs.push(this.parse_assignment_expr()); // same here
        }

        return exprs;
    }


    parse_var_decleration(): Stmt {
        const isConstant = this.eat().type == TokenType.Const;
        const identifier = this.expect(TokenType.Identifier, "Expected identifier name following let | const keywords.",).value;

        if(this.at().type == TokenType.Semicolon){
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
        this.expect(TokenType.Semicolon, "variable delcaration must end with semicolon");

        return decleration;
    }

    private parse_expr(): Expr{
        return this.parse_assignment_expr();
    }
    private parse_assignment_expr(): Expr {
        const left = this.parse_boolean_expr();

        if(this.at().type == TokenType.Equals){
            this.eat();
            const value = this.parse_boolean_expr();
            return {assigne: left, kind: "AssignmentExpr", value} as AssignmentExpr;
        }

        return left;
    }


    private parse_object_expr(): Expr {
      if(this.at().type !== TokenType.OpenBrakey || this.viewPrev(-3).type == TokenType.If){
        return this.parse_additive_expr();
      }

      this.eat();
      const properties = new Array<Property>();

      while(this.not_eof() && this.at().type != TokenType.CloseBrakey){

        const key = this.expect(TokenType.Identifier, "Object literal key exspected").value;
        if(this.at().type == TokenType.Comma){
            this.eat();
            properties.push({key, kind: "Property", value: undefined} as Property)
            continue;
        }
        else if(this.at().type == TokenType.CloseBrakey){
            properties.push({key, kind: "Property", value: undefined})
            continue;
        }

        this.expect(TokenType.Colon, "Missing colon following in ObjectExpr");
        const value = this.parse_expr();

        properties.push({kind: "Property", value, key});
        if(this.at().type != TokenType.CloseBrakey){
            this.expect(TokenType.Comma, "Expected comma or closing bracket following property");
        }

      }

      this.expect(TokenType.CloseBrakey, "Object literal missing closing brace. ");
      return { kind: "ObjectLiteral", properties } as ObjectLiteral;
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
        let left = this.parse_call_member_expr();

        while(this.at().value == "*" || this.at().value == "/" || this.at().value == "%" || this.at().value == "//"){
            const operator = this.eat().value;
            const right = this.parse_call_member_expr();
            left = {
                kind: "BinaryExpr",
                left, 
                right, 
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_boolean_expr(): Expr{
        let left = this.parse_object_expr();

        while(this.at().value == "!=" || this.at().value == "==" || this.at().value == ">=" || this.at().value == "<=" || this.at().value == ">" || this.at().value == "<" || this.at().value == "!"){//check to see if can do double char
            const operator = this.eat().value;
            const right = this.parse_object_expr();
            left = {
              kind: "BooleanExpr",
              left,
              right,
              boolop: operator,
            } as BooleanExpr;
        }

        return left;
    }


    private parse_call_member_expr(): Expr {
      const memeber = this.parse_member_expr();

      if(this.at().type == TokenType.OpenBracket){
        return this.parse_call_expr(memeber);
      }

      return memeber;
    }

    private parse_call_expr(caller: Expr): Expr {
        let call_expr: Expr = {
            kind: "CallExpr",
            caller,
            args: this.parse_args(),
        } as CallExpr;


        if(this.at().type == TokenType.OpenBracket){
            call_expr = this.parse_call_expr(call_expr);
        }

        return call_expr;
    }

    private parse_args(): Expr[] {
        this.expect(TokenType.OpenBracket, "Expexred open parenthasis");
        const args = this.at().type == TokenType.CloseBracket ? [] : this.parse_arguments_list();
        this.expect(TokenType.CloseBracket, "Missing closeing parenthasis inside arguments list");
        return args;
    }

    private parse_arguments_list(): Expr[] {
        const args = [this.parse_assignment_expr()];

        while (this.at().type == TokenType.Comma && this.eat()){
            args.push(this.parse_assignment_expr());
        }

        return args;
    }
    private parse_member_expr(): Expr {
        let object = this.parse_primary_expr();

        while(this.at().type == TokenType.Dot || this.at().type == TokenType.OpenSquareBracket){
            const operator = this.eat();
            let property: Expr;
            let computed: boolean;

            if(operator.type == TokenType.Dot){
                computed = false;
                property = this.parse_primary_expr();

                if(property.kind != "Identifier"){
                    throw `Cannot use dot operator without right hand side being identifier`;
                }
            }
            else{
                computed = true;
                property = this.parse_expr();
                this.expect(TokenType.CloseSquareBracket, "Missing closing bracket in computed value");
            }
            object = {kind: "MemberExpr", object, property, computed} as MemberExpr
        }

        return object;
        
    }


    private parse_primary_expr(): Expr{
        /*if(this.comment == 1 || this.comment == 2){
            return {kind: "null"};
        }*/
        const tk = this.at().type;
        //console.log(tk);
        switch(tk){
            case TokenType.Identifier:
                return {kind: "Identifier", symbol: this.eat().value} as Identifier;
            case TokenType.Number:
                return {kind: "NumericLiteral", value: parseFloat(this.eat().value),} as NumericLiteral;
                
            case TokenType.OpenBracket: {
                this.eat();
                const value = this.parse_expr();
                this.expect(
                    TokenType.CloseBracket,
                    "Unexspected token found inside parenthasised expression. Expected closing parenthesis.",
                )
                return value;
            }
            /*case TokenType.SingleComment:
                this.comment = 1;
                return {kind: "comment"};
            case TokenType.EOL:
                if(this.comment != 2){
                    this.comment = 0;
                }
                return {kind: "comment"};
            case TokenType.LongCommment:
                if(this.comment != 2){
                    this.comment = 2;
                }
                else{
                    this.comment = 0;
                }
                return {kind: "comment"};*/
            default:
                console.error("Unexspected token found during parsing!", this.at())
                Deno.exit(1);
        }
    }

}