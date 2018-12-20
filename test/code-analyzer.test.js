import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {showSubCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {

    // // it('is parsing an substitusion with if', () => {
    // //     //     assert.equal(JSON.stringify(showSubCode('function foo(x, y, z){\n' +
    // //     //         '    let a = x + 1;\n' +
    // //     //         '    let b = a + y;\n' +
    // //     //         '    let c = 0;\n' +
    // //     //         '    \n' +
    // //     //         '    if (b < z) {\n' +
    // //     //         '        c = c + 5;\n' +
    // //     //         '        return x;\n' +
    // //     //         '    } else if (b < z * 2) {\n' +
    // //     //         '        c = 5;\n' +
    // //     //         '        return x;\n' +
    // //     //         '    } else {\n' +
    // //     //         '        c = c + z + 5;\n' +
    // //     //         '        return x;\n' +
    // //     //         '    }\n' +
    // //     //         '["function foo(x, y, z){","    if (((x) + (1)) + (y) < z) {","        return x + y + z + (0) + (5);","    } else if (((x) + (1)) + (y) < z * 2) {","        return x + y + z + ((0) + (x)) + (5);","    } else {","        return x + y + z + ((0) + (z)) + (5);","    }","}"]');
    // //     // });
    //
    it('test1', () => {
        assert.equal(
            JSON.stringify(showSubCode('function foo(x, y, z){\n' +
                '   let a = z[0];\n' +
                '    let b = z[a];\n' +
                '    return c;\n' +
                '}', '1,2,[2,3]')),
            '["function foo(x, y, z){","    return c;","}"]');
    });

    it('test', () => {
        assert.equal(
            JSON.stringify(showSubCode('function foo(x, y, z){\n' +
                '    let a = x;\n' +
                '    let b = y;\n' +
                '    let c = z;\n' +
                '}', '\'a\',\'b\',\'c\'')),
            '["function foo(x, y, z){","    let a = x;","    let b = y;","    let c = z;","}"]');
    });

    it('test2', () => {
        assert.equal(
            JSON.stringify(showSubCode('function foo(x, y, z){\n' +
                '   let a = z[0];\n' +
                '    let b = z[a];\n' +
                '    return c;\n' +
                '}', '[1,2],3,0')),
            '["function foo(x, y, z){","    return c;","}"]');
    });



    it('is parsing a while substitution', () => {
        assert.equal(
            JSON.stringify(showSubCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}\n', '1,2,3')),
            '["function foo(x, y, z){","    while ((x) + (1) < z) {","        z = ((x) + (1)) + (((x) + (1)) + (y)) * 2;","    }","    return z;","}"]');
    });

    it('is parsing a global var with string substitution', () => {
        assert.equal(
            JSON.stringify(showSubCode('var start=0;\n' +
                'function foo(x, y, z){\n' +
                '    let a = y[start];\n' +
                '    let b = a + z;\n' +
                '    let c = x;\n' +
                '    \n' +
                '    while (y[b] < 10) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    return z;\n' +
                '}', '0,[0,1,0,1,2],3')),
            '["var start=0;","function foo(x, y, z){","    while (y[(y[0]) + (z)] < 10) {","        z = (y[0]) + ((y[0]) + (z)) * 2;","    }","    return z;","}"]');
    });

    it('global var initialized', () => {
        assert.equal(
            JSON.stringify(showSubCode('var start=0;\n' +
                'function foo(x, y, z){\n' +
                '    let a = y[start];\n' +
                '    let b = a + z;\n' +
                '    let c = x;\n' +
                '    \n' +
                '    while (y[b] < 10) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    return z;\n' +
                '}', '0,[0,1,0,1,2],3')),
            '["var start=0;","function foo(x, y, z){","    while (y[(y[0]) + (z)] < 10) {","        z = (y[0]) + ((y[0]) + (z)) * 2;","    }","    return z;","}"]');
    });

    // it('check array#1', () => {//no
    //     assert.equal(
    //         JSON.stringify(showSubCode('function foo(x, y){\n' +
    //             '    let a = y;\n' +
    //             '    let b = y;\n' +
    //             '    if (x[b] < 10) {\n' +
    //             '        b = 1 + b;\n' +
    //             '    }\n' +
    //             '    else if(x[b]<x[b+1]){\n' +
    //             '        return a[0];\n' +
    //             '    }\n' +
    //             '    return 0;\n' +
    //             '}', '[0,1,0,1,2,0,0,0,0],1')),
    //         '["function foo(x, y){","    if (x[y] < 10) {","    }","    else if(x[y]<x[y+1]){","        return y[0];","    }","    return 0;","}"]');
    // });
    // it('check array#2', () => {
    //     assert.equal(
    //         JSON.stringify(showSubCode('', '')),
    //         '');
    // });
    it('', () => {
        assert.equal(
            JSON.stringify(showSubCode('function foo(x){\n' +
                '    let a = x[0];\n' +
                '    let b = x[a];\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (c < a) {\n' +
                '        c = 0;\n' +
                '    }\n' +
                '\telse if (b < c) {\n' +
                '        c = c + 5;\n' +
                '    }\n' +
                '    return c;\n' +
                '}', '[1,2,3]')),
            '["function foo(x){","    if (0 < x[0]) {","    }","\\telse if (x[x[0]] < 0) {","    }","    return (0) + (5);","}"]');
    });

    it('', () => {
        assert.equal(
            JSON.stringify(showSubCode('function foo(x, y, z){\n' +
                'let u=0;\n' +
                '   if (x>0){\n' +
                'y=1;}\n' +
                'else if (x>4){\n' +
                'x=2;}\n' +
                'else{\n' +
                'x=9;}\n' +
                '}\n', '1,2,3')),
            '["function foo(x, y, z){","let u=0;","   if (x>0){","y=1;}","else if (x>4){","x=2;}","else{","x=9;}","}"]');
    });

    it('', () => {
        assert.equal(
            JSON.stringify(showSubCode('function foo(x, y, z){\n' +
                '\n' +
                '    if (1 < 9) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } \n' +
                '\n' +
                '    else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}', '1,2,3')),
            '["function foo(x, y, z){","    if (1 < 9) {","        c = c + 5;","        return x + y + z + c;","    } ","    else {","        c = c + z + 5;","        return x + y + z + c;","    }","}"]');
    });

    // it('', () => {
    //     assert.equal(
    //         JSON.stringify(showSubCode('function foo(x){\n' +
    //             '    let a = x[0];\n' +
    //             '    let b = x[a];\n' +
    //             '    let c = 0;\n' +
    //             '    \n' +
    //             '    if (a < b) {\n' +
    //             '        c = 0;\n' +
    //             '    }\n' +
    //             '\telse if (b < c) {\n' +
    //             '        c = c + 5;\n' +
    //             '    }\n' +
    //             '    return c;\n' +
    //             '}', '1,2,3')),
    //         '["function foo(x){","    if (x[0] < x[x[0]]) {","    }","\\telse if (x[x[0]] < 0) {","    }","    return (0) + (5);","}"]');
    // });



    // it('test', () => {
    //     assert.equal(
    //         JSON.stringify(showSubCode('function foo( x, y, z){\n' +
    //             '   let a = z[0];\n' +
    //             '    let b = z[a];\n' +
    //             '    let c = 0;\n' +
    //             '    \n' +
    //             '    if (c < x) {\n' +
    //             '        c = 0;\n' +
    //             '    }\n' +
    //             '\telse if (y < c) {\n' +
    //             '        y = x + 5;\n' +
    //             '    }\n' +
    //             '    return c;\n' +
    //             '}', '1,2,[2,3]')),
    //         '["function foo(x, y, z){","    if (0 < x) {","    }","\t else if (y < 0) {","        y = x + 5;","    }","    return 0;","}"]');
    //
    // });


    //
    //
    // it('check array#4', () => {
    //     assert.equal(
    //         JSON.stringify(showSubCode('function foo(x, y, z){\n' +
    //             '    let a = z;\n' +
    //             '    let b = x[a];\n' +
    //             '    let c = x[b];\n' +
    //             '    \n' +
    //             '    if (c < z) {\n' +
    //             '        c = b;\n' +
    //             '    }\n' +
    //             '\telse if (y < c) {\n' +
    //             '        y = z + 5;\n' +
    //             '    }\n' +
    //             '    return c;\n' +
    //             '}', '[1,2],3,0')),
    //         '["function foo(x, y, z){","    if (x[x[z]] < z) {","    }","\\telse if (y < x[x[z]]) {","        y = z + 5;","    }","    return x[x[z]];","}"]');
    // });
    //
    //
    // it('if inside if', () => {
    //     //     assert.equal(
    //     //         JSON.stringify(showSubCode('function foo(x, y, z, q){\n' +
    //     //             '    let a = x + 1;\n' +
    //     //             '    let b = a + y;\n' +
    //     //             '    let c = z[a];\n' +
    //     //             '    \n' +
    //     //             '    if (b < q) {\n' +
    //     //             '        c = c + 5;\n' +
    //     //             '        a= z[a];\n' +
    //     //             '            if (b>a){\n' +
    //     //             '               c = c+a;\n' +
    //     //             '            }\n' +
    //     //             '            else{\n' +
    //     //             '               c=c-a;\n' +
    //     //             '            }\n' +
    //     //             '        return a + c + b;\n' +
    //     //             '    } else if (b < a * 2) {\n' +
    //     //             '        c = c + x + 5;\n' +
    //     //             '        return a + c + a;\n' +
    //     //             '    } else {\n' +
    //     //             '        c = c + a + 5;\n' +
    //     //             '        return a + c + a;\n' +
    //     //             '    }\n' +
    //     //             '}', '0,1,[2,3],4')),
    //     //         '["function foo(x, y, z, q){","    if (((x) + (1)) + (y) < q) {","            if (((x) + (1)) + (y)>z[(x) + (1)]){","            }","            else{","            }","        return z[(x) + (1)] + (z[(x) + (1)]) + (5) + ((x) + (1)) + (y);","    } else if (((x) + (1)) + (y) < (x) + (1) * 2) {","        return (x) + (1) + ((z[(x) + (1)]) + (x)) + (5) + (x) + (1);","    } else {","        return (x) + (1) + ((z[(x) + (1)]) + ((x) + (1))) + (5) + (x) + (1);","    }","}"]');
    //     // });
    //
    //
    // it('', () => {
    //     assert.equal(
    //         JSON.stringify(showSubCode('', '')),
    //         '');
    // });
    //
    //
    //
    //
    it('is parsing a simple variable declaration 2 correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('var a;')),
            '[{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":"null (or nothing)"}]');
    });
    //
    it('is parsing a function declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function max(a, b){}')),
            '[{"line":1,"type":"FunctionDeclaration","name":"max","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"b","condition":"","value":""}]');
    });
    //
    it('is parsing a while statement correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    while (a < z) {\n' +
                '        x = a;\n' +
                '        y = z;\n' +
                '    }\n' +
                '    return z;\n' +
                '}\n')),
            '[{"line":1,"type":"FunctionDeclaration","name":"foo","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"x","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"y","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"z","condition":"","value":""},{"line":2,"type":"VariableDeclaration","name":"a","condition":"","value":"(x) + (1)"},{"line":3,"type":"WhileStatement","name":"","condition":"(a) < (z)","value":""},{"line":4,"type":"AssignmentExpression","name":"x","condition":"","value":"a"},{"line":5,"type":"AssignmentExpression","name":"y","condition":"","value":"z"},{"line":7,"type":"ReturnStatement","name":"","condition":"","value":"z"}]');
    });

    ///from this part- write expected!!!


    // update exp should be after for dec  //no
    // it('is parsing a for statement correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('for (var i=0; i<5; i++){\n' +
    //             'M[i]= -1;\n' +
    //             '}')),
    //         '[{"line":1,"type":"VariableDeclaration","name":"i","condition":"","value":0},{"line":1,"type":"UpdateExpression","name":"","condition":"","value":"i++"},{"line":1,"type":"ForStatement","name":"","condition":"i < 5","value":""},{"line":2,"type":"AssignmentExpression","name":"M[i]","condition":"","value":"-1"}]'
    //     );
    // });

    // it('is parsing an if_Statement correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('function foo(x, y, z){\n' +
    //             '    let a = x + 1;    \n' +
    //             '    if (a < z) {\n' +
    //             '        y= 5;\n' +
    //             '        return x + y;\n' +
    //             '    } else if (x < z * 2) {\n' +
    //             '        y =  x + 5;\n' +
    //             '        return x;\n' +
    //             '    } else {\n' +
    //             '        return  z;\n' +
    //             '    }\n' +
    //             '}')),
    //         '[{"line":1,"type":"FunctionDeclaration","name":"foo","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"x","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"y","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"z","condition":"","value":""},{"line":2,"type":"VariableDeclaration","name":"a","condition":"","value":"(x) + (1)"},{"line":3,"type":"IfStatement","name":"","condition":"(a) < (z)","value":""},{"line":4,"type":"AssignmentExpression","name":"y","condition":"","value":5},{"line":5,"type":"ReturnStatement","name":"","condition":"","value":"(x) + (y)"},{"line":6,"type":"ElseIfStatement","name":"","condition":"(x) < ((z) * (2))","value":""},{"line":7,"type":"AssignmentExpression","name":"y","condition":"","value":"(x) + (5)"},{"line":8,"type":"ReturnStatement","name":"","condition":"","value":"x"},{"line":9,"type":"ElseStatement","name":"","condition":"","value":""},{"line":10,"type":"ReturnStatement","name":"","condition":"","value":"z"}]'
    //     );
    // });

    // it('is parsing an if_else_Statement correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('if (x<2) \n' +
    //             'x=2;\n' +
    //             'else if (x>3) \n' +
    //             'x=3;')),
    //         '[{"line":1,"type":"IfStatement","name":"","condition":"x < 2","value":""},{"line":2,"type":"AssignmentExpression","name":"x","condition":"","value":2},{"line":3,"type":"ElseIfStatement","name":"","condition":"x > 3","value":""},{"line":4,"type":"AssignmentExpression","name":"x","condition":"","value":3}]'
    //     );
    // });

    // it('is parsing an if_else_Statement_2 correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('function foo(x, y, z){
    //     let a = x + 1;
    //     if (a < z) {
    //         return a;
    //         return y;
    //     } else if (a < y) {
    //         a = a + 5;
    //         return y;
    //     } else if (a>y){
    //         a = z + 5;
    //         return y;
    //     }
    // }
    // ')),
    //         '[{"line":1,"type":"FunctionDeclaration","name":"foo","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"x","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"y","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"z","condition":"","value":""},{"line":2,"type":"VariableDeclaration","name":"a","condition":"","value":"(x) + (1)"},{"line":3,"type":"IfStatement","name":"","condition":"(a) < (z)","value":""},{"line":4,"type":"ReturnStatement","name":"","condition":"","value":"a"},{"line":5,"type":"ReturnStatement","name":"","condition":"","value":"y"},{"line":6,"type":"ElseIfStatement","name":"","condition":"(a) < (y)","value":""},{"line":7,"type":"AssignmentExpression","name":"a","condition":"","value":"(a) + (5)"},{"line":8,"type":"ReturnStatement","name":"","condition":"","value":"y"},{"line":9,"type":"ElseIfStatement","name":"","condition":"(a) > (y)","value":""},{"line":10,"type":"AssignmentExpression","name":"a","condition":"","value":"(z) + (5)"},{"line":11,"type":"ReturnStatement","name":"","condition":"","value":"y"}]'
    //     );
    // });

    // it('is parsing a return statement correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('function A(){\n' +
    //             'return x;\n' +
    //             '}')),
    //         '[{"line":1,"type":"FunctionDeclaration","name":"A","condition":"","value":""},{"line":2,"type":"ReturnStatement","name":"","condition":"","value":"x"}]'
    //     );
    // });

    it('is parsing a binary exp correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(y){\n' +
                'let x= y+2;\n' +
                '}')),
            '[{"line":1,"type":"FunctionDeclaration","name":"foo","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"y","condition":"","value":""},{"line":2,"type":"VariableDeclaration","name":"x","condition":"","value":"(y) + (2)"}]'
        );
    });
    //
    it('is parsing a binary exp from both sides correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                ' v+c<m+n\n' +
                '}')),
            '[{"line":1,"type":"FunctionDeclaration","name":"foo","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"x","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"y","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"z","condition":"","value":""}]'
        );
    });

    it('is parsing an unary exp correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '  let b= -1;\n' +
                '}')),
            '[{"line":1,"type":"FunctionDeclaration","name":"foo","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"x","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"y","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"z","condition":"","value":""},{"line":2,"type":"VariableDeclaration","name":"b","condition":"","value":"-1"}]'
        );
    });

    it('is parsing a binary exp ', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x+1+y+z;\n' +
                '    let b = a+y+2+1;\n' +
                '    let c = 0+y+x+z;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n')),
            '[{"line":1,"type":"FunctionDeclaration","name":"foo","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"x","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"y","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"z","condition":"","value":""},{"line":2,"type":"VariableDeclaration","name":"a","condition":"","value":"(((x) + (1)) + (y)) + (z)"},{"line":3,"type":"VariableDeclaration","name":"b","condition":"","value":"(((a) + (y)) + (2)) + (1)"},{"line":4,"type":"VariableDeclaration","name":"c","condition":"","value":"(((0) + (y)) + (x)) + (z)"},{"line":6,"type":"IfStatement","name":"","condition":"(b) < (z)","value":""},{"line":7,"type":"ReturnStatement","name":"","condition":"","value":"(((x) + (y)) + (z)) + (c)"}]'
        );
    });

    it('is parsing an update exp correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                ' i++;\n' +
                '}')),
            '[{"line":1,"type":"FunctionDeclaration","name":"foo","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"x","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"y","condition":"","value":""},{"line":1,"type":"VariableDeclaration","name":"z","condition":"","value":""},{"line":2,"type":"UpdateExpression","name":"","condition":"","value":"i++"}]'
        );
    });
    //
    // it('is parsing a member exp correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('M[1]=4;\n' +
    //             'x= M[i];')),
    //         '[{"line":1,"type":"AssignmentExpression","name":"M[1]","condition":"","value":4},{"line":2,"type":"AssignmentExpression","name":"x","condition":"","value":"M[i]"}]'
    //     );
    // });
    //
    // it('is parsing an update exp correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('i++;')),
    //         '[{"line":1,"type":"UpdateExpression","name":"","condition":"","value":"i++"}]'
    //     );
    // });

    it('is parsing a remove_doubles_func correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(){\n' +
                '    let a = x + 1;\n' +
                '    if (0 < 1) {\n' +
                '        return x;\n' +
                '    } else if (2 < 10) {\n' +
                '        return x;\n' +
                '    } else if (2 < 10) {\n' +
                '        return x;\n' +
                '    }else {\n' +
                '        return x;\n' +
                '    }\n' +
                '}')),
            '[{"line":1,"type":"FunctionDeclaration","name":"foo","condition":"","value":""},{"line":2,"type":"VariableDeclaration","name":"a","condition":"","value":"(x) + (1)"},{"line":3,"type":"IfStatement","name":"","condition":"(0) < (1)","value":""},{"line":4,"type":"ReturnStatement","name":"","condition":"","value":"x"},{"line":5,"type":"ElseIfStatement","name":"","condition":"(2) < (10)","value":""},{"line":6,"type":"ReturnStatement","name":"","condition":"","value":"x"},{"line":7,"type":"ElseIfStatement","name":"","condition":"(2) < (10)","value":""},{"line":8,"type":"ReturnStatement","name":"","condition":"","value":"x"},{"line":9,"type":"ElseStatement","name":"","condition":"","value":""},{"line":9,"type":"ElseStatement","name":"","condition":"","value":""},{"line":10,"type":"ReturnStatement","name":"","condition":"","value":"x"}]');
    });






    // it('is parsing a simple variable declaration correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('let a = 1;')),
    //         '[{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":1}]');
    // });
    //
    // it('is parsing a simple variable declaration correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('let a = 1;')),
    //         '[{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":1}]');
    // });
    //
    // it('is parsing a simple variable declaration correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('let a = 1;')),
    //         '[{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":1}]');
    // });
    //
    // it('is parsing a simple variable declaration correctly', () => {
    //     assert.equal(
    //         JSON.stringify(parseCode('let a = 1;')),
    //         '[{"line":1,"type":"VariableDeclaration","name":"a","condition":"","value":1}]');
    // });

});
