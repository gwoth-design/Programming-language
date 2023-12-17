// deno-lint-ignore-file no-empty-interface
export type NodeType = 
    //STATEMENTS
    | "Program" 
    | "VarDecleration"
    | "FunctionDeclaration"

    //EXPRESSIONS
    | "AssignmentExpr"
    | "MemberExpr"
    | "CallExpr"
    //LITERALS
    | "Property"
    | "ObjectLiteral"
    | "NumericLiteral" 
    | "Identifier" 
    | "BooleanExpr"
    | "IfStatement"
    | "comment"
    | "null"
    | "AssignmentExprString"
    | "BinaryExpr";


export interface Stmt {
    kind: NodeType;
}

export interface AssignmentExpr extends Expr{
    kind: "AssignmentExpr";
    assigne: Expr;
    value?: Expr;
}

export interface VarDeclerationString extends Expr{
    kind: "AssignmentExprString";
    assigne: string;
    value?: string;
    constant: boolean;
}

export interface Program extends Stmt{
    kind: "Program";
    body: Stmt[];
}

export interface VarDecleration extends Stmt{
    kind: "VarDecleration";
    constant: boolean;
    identifier: string;
    value?: Expr;
}

export interface FunctionDeclaration extends Stmt{
    kind: "FunctionDeclaration";
    parameters: string[];
    name: string;
    body: Stmt[];
}

export interface Expr extends Stmt {}

export interface BinaryExpr extends Expr{
    kind: "BinaryExpr"
    left: Expr;
    right: Expr;
    operator: string;
}

export interface Identifier extends Expr{
    kind: "Identifier";
    symbol: string;
}

export interface NumericLiteral extends Expr{
    kind: "NumericLiteral";
    value: number;
}

export interface Property extends Expr{
    kind: "Property";
    key: string; 
    value?: Expr;
}

export interface ObjectLiteral extends Expr{
    kind: "ObjectLiteral";
    properties: Property[];
}

export interface CallExpr extends Expr{
    kind: "CallExpr"
    args: Expr[];
    caller: Expr;
}

export interface MemberExpr extends Expr{
    kind: "MemberExpr"
    object: Expr;
    property: Expr;
    computed: boolean;
}

export interface BooleanExpr extends Expr{
    kind: "BooleanExpr";
    left: Expr;
    right: Expr;
    boolop: string;
}

export interface IfStatement extends Stmt{
    kind: "IfStatement"
    expressions: BooleanExpr[];
    body: Stmt[];
    do: boolean;
    while: boolean;
    else: boolean;
    elif: boolean;
    bodyElse: Stmt[];
}

export interface comment extends Stmt{
    kind: "comment";
}

export interface NULL extends Stmt{
    kind: "null";
}