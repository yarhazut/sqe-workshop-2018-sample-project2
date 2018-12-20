import * as esprima from 'esprima';

var elseDictionary= [];
var toTable = [];
var endOfScope = [];
let main_types= ['FunctionDeclaration', 'VariableDeclarator', 'AssignmentExpression', 'WhileStatement',
    'IfStatement', 'ReturnStatement', 'ForStatement', 'UpdateExpression'];
let main_types_funcs= {
    'FunctionDeclaration': funcDecleration,
    'VariableDeclarator': varDeclerator,
    'AssignmentExpression': assignmentExp,
    'WhileStatement': whileStatement,
    'IfStatement': ifStatement,
    'ReturnStatement': returnStatement,
    'UpdateExpression': update_exp
};
let exp_types= {
    'Identifier': identifier,
    'Literal': literal,
    'BinaryExpression': binary_exp,
    'UnaryExpression': unary_exp,
    'MemberExpression': member_exp
};
var varTable = [];
var allVariables= [];
var paramsNames= [];
var locals = [];
var paramsDictionary= [];// primitives
var arrDictionary= [];// array members
var ifDictionary= [];// holds true/false for condition painting
var ifDictionary_WithOriginalLines= [];
var funcLine;
var latest = 0;
var latestBeforeIfStack = [];
var i;
var j;
var newCode = [];
//let inputType= 'notArray';

// const parseCode = (codeToParse) => {
//     return esprima.parseScript(codeToParse);
// };


//*****************************2nd part variables



//*****************************



const parseCode = (codeToParse) => {
    //return esprima.parseScript(codeToParse,{loc: true});
    elseDictionary= [];
    endOfScope = [];
    toTable = [];
    varTable = [];
    allVariables= [];
    paramsNames= [];
    locals = [];
    paramsDictionary= [];// primitives
    arrDictionary= [];// array members
    ifDictionary= [];// holds true/false for condition painting
    ifDictionary_WithOriginalLines= [];
    //var funcLine;
    latest = 0;
    latestBeforeIfStack = [];
    i=0;
    j=-1;
    funcLine=0;
    newCode = [];
    esprima.parseScript(codeToParse,{loc: true}, function(node,metadata){
        //et c= metadata.start.line;
        if (main_types.includes(node.type))
            main_types_funcs[node.type](node, metadata);
    });
    toTable.sort((a, b) => Number(a.line) - Number(b.line));
    // toTable.sort(function(a, b) {
    //     return cmp(a.line,b.line) || cmp(a.type,b.type);
    // })
    doubles_remove();
    doubles_remove_2();
    doubles_remove_3();
    //console.log(endOfScope);
    //console.log(elseDictionary);
    removeUndefinedFromElseArray();
    //fixEndOfScopes();
    return toTable;
};

// function fixEndOfScopes(){
//     for (let j=0; j<endOfScope.length; j++){
//         if (!(isIndexExistInToTable(endOfScope[j].end))){
//             endOfScope[j].end= getCurrectLine(endOfScope[j].end);
//         }
//         // if (!(isIndexExistInToTable(endOfScope[j].start))){
//         //     endOfScope[j].start= getCurrectLine(endOfScope[j].start);
//         // }
//     }
// }

// function isIndexExistInToTable(index){
//     for (let j=0; j<toTable.length; j++) {
//         if (toTable[j].line==index)
//             return true;
//     }
//     return false;
// }

// function getCurrectLine(index){
//     while (index>0){
//         if (isIndexExistInToTable(index))
//             return index;
//         index--;
//     }
// }

function funcDecleration(node, metadata){//v
    toTable.push({'line':metadata.start.line, 'type': node.type, 'name': node.id.name, 'condition': '', 'value':''});
    //for (param in node.params)
    node.params.forEach(function (param) {
        toTable.push({'line':metadata.start.line, 'type': 'VariableDeclaration', 'name': param.name, 'condition': '', 'value':''});
    });
}

function varDeclerator(node, metadata){//v
    var init;
    if (node.init == null)
        init= 'null (or nothing)';
    else
        init= exp_types[node.init.type](node.init);
    toTable.push({'line':metadata.start.line, 'type': 'VariableDeclaration', 'name': node.id.name, 'condition': '', 'value':init});
}

function whileStatement(node, metadata){//v
    let test= exp_types[node.test.type](node.test);
    toTable.push({'line':metadata.start.line, 'type': node.type, 'name': '', 'condition': test, 'value':''});
    endOfScope.push({'start': metadata.start.line, 'end': metadata.end.line});//addition***//+1
}

// function forStatement(node, metadata){//v
//     let test= exp_types[node.test.type](node.test);
//     toTable.push({'line':metadata.start.line, 'type': node.type, 'name': '', 'condition': test, 'value':''});
// }


function assignmentExp(node, metadata){//v
    let rightVal= exp_types[node.right.type](node.right);
    let leftVal= exp_types[node.left.type](node.left);
    toTable.push({'line':metadata.start.line, 'type': node.type, 'name': leftVal, 'condition': '', 'value':rightVal});
}


function ifStatement(node, metadata){
    let test= exp_types[node.test.type](node.test);
    toTable.push({'line':metadata.start.line, 'type': node.type, 'name': '', 'condition': test, 'value':''});
    // if (isNested(node.consequent.body))
    //     endOfScope.push(node.consequent.end.line);//+1
    // else
    //     endOfScope.push(metadata.start.line + node.consequent.body.length+1);//addition***//+1
    endOfScope.push({'start': metadata.start.line, 'end': node.consequent.loc.end.line});//+1
    if (node.alternate!= null)
        if_elseStatement(node.alternate, metadata.start.line);
}



function if_elseStatement(node, fatherLine){
    if (node.type=='IfStatement')
    {
        let test= exp_types[node.test.type](node.test);
        toTable.push({'line':node.loc.start.line, 'type': 'ElseIfStatement', 'name': '', 'condition': test, 'value':''});
        //endOfScope.push({'start':node.loc.start.line, 'end': node.loc.end.line});
        if (node.alternate!= null)
            if_elseStatement(node.alternate);
    }
    else{ //not null && not 'IfStatement'--> 'BlockStatement'
        toTable.push({'line':node.loc.start.line, 'type': 'ElseStatement', 'name': '', 'condition': '', 'value':''});
        endOfScope.push({'start':node.loc.start.line, 'end': node.loc.end.line});//+1
        // if (isNested(node.consequent.body))
        //     endOfScope.push(node.consequent.end.line);//+1
        // else
        //     endOfScope.push(node.loc.start.line + node.consequent.body.length+1);//addition***//+1
        elseDictionary.push({'else': node.loc.start.line, 'father': fatherLine});
    }
}
function removeUndefinedFromElseArray(){
    for(let j=0; j<elseDictionary.length; j++){
        //if (elseDictionary[j].father.includes('undefined'))
        if (!/^\d+$/.test(elseDictionary[j].father))
            elseDictionary.splice(j, 1);
    }
}


// function isNested(body){//v
//     for(let j=0; j<body.length; j++){
//         if (body[j].type=='WhileStatement' || body[j].type=='IfStatement')
//             return true;
//     }
//     return false;
// }

function returnStatement(node, metadata){
    let returnd_val= exp_types[node.argument.type](node.argument);
    toTable.push({'line':metadata.start.line, 'type': node.type, 'name': '', 'condition': '', 'value':returnd_val});
}



//exp_types
function binary_exp(node){
    let left='';
    let right='';
    if (node.left.type!='BinaryExpression')
        left= exp_types[node.left.type](node.left);
    else
        left+=binary_exp(node.left);
    if (node.right.type!='BinaryExpression')
        right= exp_types[node.right.type](node.right);
    else
        right+=binary_exp(node.right);
    return '('+ left +') ' +node.operator +' (' +right + ')';
}

function unary_exp(node){
    let operator= node.operator;
    let arg_value= exp_types[node.argument.type](node.argument);
    return operator+arg_value;
}

function member_exp(node){
    let object= exp_types[node.object.type](node.object);
    let property= exp_types[node.property.type](node.property);
    return object + '[' + property + ']';
}

function update_exp(node, metadata){
    let up_val= exp_types[node.argument.type](node.argument)+ node.operator;
    toTable.push({'line':metadata.start.line, 'type': node.type, 'name': '', 'condition': '', 'value':up_val});
}

function identifier(node){
    return node.name;
}

function literal(node){
    return node.value;
}

function doubles_remove() {// if vs if- else
    for (var i = 0; i < toTable.length - 1; i++) {
        if (is_double(i))
            toTable.splice(insexOfIF(i), 1);
    }
}

function is_double(i) {
    if (toTable[i].type.includes('IfStatement') && toTable[i + 1].type.includes('IfStatement') && toTable[i].line == toTable[i + 1].line)
        return true;
    return false;
}


function doubles_remove_2(){// if-else vs if-else
    for(var j=0; j< toTable.length-1; j++)
    {
        if (is_double_2(j))
            toTable.splice(insexOfIF(j),1);
    }
}

function doubles_remove_3(){// if-else vs if-else
    for(var j=0; j< toTable.length-1; j++)
    {
        if (is_double_3(j))
            toTable.splice(insexOfIF(j),1);
    }
}

function is_double_2(j) {
    if (toTable[j].type.includes('ElseIfStatement') && toTable[j+1].type.includes('ElseIfStatement') && (toTable[j].line==toTable[j+1].line))
        return true;
    return false;
}

function is_double_3(i) {
    if (toTable[i].type=='ElseStatement' && toTable[i + 1].type=='ElseStatement' && toTable[i].line == toTable[i + 1].line)
        return true;
    return false;
}

function insexOfIF(i){
    if (toTable[i].type.valueOf()== 'IfStatement'.valueOf())
        return i;
    return i+1;
}

//**************************************************SUBSTITUTION**********************************************************
// var varTable = [];
// var allVariables= [];
// var paramsNames= [];
// var locals = [];
// var paramsDictionary= [];// primitives
// var arrDictionary= [];// array members
// var ifDictionary= [];// holds true/false for condition painting
// var ifDictionary_WithOriginalLines= [];
// var funcLine;
// var latest = 0;
// var latestBeforeIfStack = [];
// var i;
// var newCode = [];
// //let inputType= 'notArray';


const substituteCode = (params) => {// main function-->varTable
    funcLine = findFuncLine();
    findAllVaiables();
    findLocals();
    findParamsNames();
    insertParamsToDictionary_MainFunc(params);
    initFirstLine();
    //latest = 1;
    for (i=1; i<toTable.length; i++) {
        //st();
        if (toTable[i].line == funcLine)
            copyNoChangeLine();
        else if (hasVariableChanged())
            updateLineForVarChange();
        else
            copyNoChangeLine();
        updateLatest();
    }
    //console.log(varTable);
    //console.log(latest);
    //console.log(paramsDictionary);
    //console.log(arrDictionary);
    //return varTable;
};

function findAllVaiables(){
    for (let line of toTable) {
        if (line.type=='VariableDeclaration')
            allVariables.push(line.name);
    }
}

function findParamsNames(){
    for (let c=0; c< toTable.length; c++){
        if (toTable[c].line == funcLine && toTable[c].type == 'VariableDeclaration'){
            paramsNames.push((toTable[c].name));
        }
    }
}

function findLocals(){
    let funcLine= findFuncLine();
    let returnLine = findLastReturnLine();
    for (let line of toTable) {
        if (line.line > funcLine && line.line< returnLine && line.type == 'VariableDeclaration')
            locals.push(line.name);
    }
}

function initFirstLine(){
    varTable[latest] = [];
    for (let variable of allVariables) {
        if (!locals.includes(variable))
            varTable[latest][variable]= variable;
        else
            varTable[latest][variable]= '';
    }
    if (toTable[0].type== 'VariableDeclaration'){
        if (toTable[0].value!= 'null (or nothing)')
            varTable[latest][toTable[0].name]= toTable[0].value;
    }
}


function copyNoChangeLine(){
    varTable[i] = [];
    for (let variable of allVariables) {
        varTable[i][variable]= varTable[latest][variable];
    }

    // let x= varTable[latest];
    // varTable[i]= x;
    // //varTable[i]= obj;
    if (toTable[i].type != 'IfStatement' && toTable[i].type != 'WhileStatement')
        latest = i;
}


function updateLineForVarChange(){
    varTable[i] = [];
    for (let variable of allVariables) {//copy prev line
        varTable[i][variable]= varTable[latest][variable];
    }
    //change the line
    let varName= toTable[i].name;
    let subVal= subVarValue((String)(toTable[i].value));
    (varTable[i])[varName]= subVal;
    //varTable[i]=obj;
    latest = i;
}

function subVarValue(updValue){
    var replaceVal;
    for (let variable of allVariables) {
        let seekFrom=0;
        let index= 1;
        while (index!= -1) {
            index = updValue.indexOf(variable, seekFrom);
            seekFrom = seekFrom + index + 1;
            if (index!= -1 && standByItSelf(updValue, index, variable.length)) {//add function 'smartIncludes'
                replaceVal = varTable[latest][variable];
                //updValue = updValue.replace(variable, localVal);
                updValue = replaceRange(updValue, index, index + variable.length, replaceVal);
            }
        }
    }
    return updValue;
}


function hasVariableChanged(){
    if(toTable[i].type == 'VariableDeclaration' || toTable[i].type == 'AssignmentExpression')
        return true;
}

function updateLatest(){
    // if (toTable[i].type == 'IfStatement')
    //     latestBeforeIf = latest;
    // if (toTable[i].type == 'ElseIfStatement')
    //     latest = latestBeforeIf;
    // // else--> latest= latestBeforeIf

    if (toTable[i].type == 'IfStatement' || toTable[i].type == 'WhileStatement'){// if block starts- save placeholder
        let token= checkValidationRangeForI(latest);
        latestBeforeIfStack.push({'latest': latest, 'token': token});// = latest;
    }

    else if (includesEnd(toTable[i].line+1)) {// end of scope (may move to else-if or else) +1 becouse the '{' is a line after
        //&& toTable[i].type != 'ReturnStatement'   //latest = latestBeforeIf;
        let token= latestBeforeIfStack.pop();
        if (lastValidLine(token.token) > toTable[i].line) {// valid
            latestBeforeIfStack.push(token);
            latest= token.latest;
        }
        else{// not valid
            if (latestBeforeIfStack.length != 0){
                token= latestBeforeIfStack.pop();
                latestBeforeIfStack.push(token);
                latest= token.latest;
            }

        }
    }
}

function lastValidLine(realLineIndex){//supports only 1 funcDec in the code
    var lineIndex;
    for (let y=0; y<toTable.length; y++){
        if (toTable[y].line == realLineIndex)
            lineIndex = y;
    }
    return toTable[lineIndex-1].line;
}
function includesEnd(index){//supports only 1 funcDec in the code
    for (let c=0; c< endOfScope.length; c++){
        if (endOfScope[c].end == index)
            return true;
    }
    return false;
}



function checkValidationRangeForI(){
    //let inRange= [];
    for (let x=0; x<endOfScope.length; x++){
        if (endOfScope[x].start < toTable[latest].line && endOfScope[x].end > toTable[latest].line)
            //inRange.push(endOfScope[x]);
            return endOfScope[x].end;
    }
    return toTable[toTable.length-1].line;
    // let minDistance= 1000;
    // for (let y=0; y<inRange.length; y++){
    //     if ()
    // }

}

function findFuncLine(){//supports only 1 funcDec in the code
    let index = -1;
    for (let line of toTable){
        if (line.type == 'FunctionDeclaration')
            index= line.line;
    }
    return index;
}


function findLastReturnLine(){//supports only 1 funcDec in the code
    let index = -1;
    for (let line of toTable) {
        if (line.type == 'ReturnStatement')
            index= line.line;
    }
    return index;
}

//*********************************************2nd Part- show substituted code**********************
// let j=-1;
//let arraysNamesToRemove= [];



const showSubCode = (codeToParse, params) =>{//2nd main function-->replace params with real values + painting
    elseDictionary= [];
    endOfScope = [];
    toTable = [];
    varTable = [];
    allVariables= [];
    paramsNames= [];
    locals = [];
    paramsDictionary= [];// primitives
    arrDictionary= [];// array members
    ifDictionary= [];// holds true/false for condition painting
    ifDictionary_WithOriginalLines= [];
    //var funcLine;
    latest = 0;
    latestBeforeIfStack = [];
    i=0;
    j=-1;
    funcLine=0;
    newCode = [];
    toTable = parseCode(codeToParse);
    substituteCode(params);
    //insertParamsToDictionary(params);
    //console.log(varTable);
    //console.log(JSON.stringify(toTable));
    //console.log(endOfScope);
    var lines = codeToParse.split('\n');
    var line;
    for (i=0; i< lines.length; i++) {
        line = lines[i];
        if (containsALocal(line) && atLeast1standsByItSelf(line)) {// a local exists in the line
            if (!local_As_VarDec_OR_AssExp(line, i)){
                line = smartReplaceALocal(line, i);
                newCode.push(line);
                j++;
            }
        }
        else { //copy as is
            pushNotEmpty(line);

        }
        if (!isOnlySpaces(line) && ifOrElseIfOrWhileStatement(i))
            paint_if_statement(line, i);
    }
    //console.log(ifDictionary);
    console.log(JSON.stringify(newCode));
    let x= getIfDictionary();
    return newCode;

};

function ifOrElseIfOrWhileStatement(i){
    let index= indexOfLineInArray(i);
    if (index!= -1){
        if (toTable[indexOfLineInArray(i)].type=='IfStatement' || toTable[indexOfLineInArray(i)].type=='ElseIfStatement' ||
            toTable[indexOfLineInArray(i)].type=='WhileStatement' || toTable[indexOfLineInArray(i)].type=='ElseStatement' )
            return true;
    }
    return false;
}

function insertParamsToDictionary_MainFunc(params){// called from mane function- grt the input from html into array(s)
    var splitedParams;
    if (params.startsWith('[') && params.endsWith(']')){//only array   [1,2,3]
        params= params.substring(1, params.lastIndexOf(']'));//remove '[]' from start and end
        splitedParams= params.split (',').filter(function(el) {return el.length != 0;});
        //arraysNamesToRemove.push(paramsNames[0]);//send arr name
        allVariables.splice(allVariables.indexOf(paramsNames[0]), 1);
        insertArrayMembsersIntoArrDic(splitedParams, paramsNames[0]);
    }
    else{//    1,2,3   or   1,[4,5],3
        if (params.includes('[')){//one of the parameters is array
            smartSplitforArray(params, paramsNames);
        }
        else{//only primitives
            splitedParams= params.split (',').filter(function(el) {return el.length != 0;});
            insertPrimitivesIntoParamsDic(splitedParams, 0);
        }
    }

}

function smartSplitforArray(params, paramsNames){
    let startIndexForInsert=0;//for primitives
    let indexForArrayName = -1;//for arrMembers
    var primitivesToInsert;
    var arrMembersToInsert;
    var splited_Primitives_ToInsert;
    var splited_ArrMembers_ToInsert;
    while (params.length!=0){
        let left= params.indexOf('[');
        let right= params.indexOf(']');
        if (left != -1 && right!= -1){
            primitivesToInsert= params.substring(0, left);
            if (primitivesToInsert.length!=0){
                splited_Primitives_ToInsert= primitivesToInsert.split (',').filter(function(el) {return el.length != 0;});
                let length= splited_Primitives_ToInsert.length;
                indexForArrayName= indexForArrayName+ length;
                insertPrimitivesIntoParamsDic(splited_Primitives_ToInsert, startIndexForInsert);
                startIndexForInsert= startIndexForInsert+ length;
            }
            arrMembersToInsert= params.substring(left+1, right);
            if (arrMembersToInsert.length!=0){
                indexForArrayName++;
                splited_ArrMembers_ToInsert= arrMembersToInsert.split (',').filter(function(el) {return el.length != 0;});
                insertArrayMembsersIntoArrDic(splited_ArrMembers_ToInsert, paramsNames[indexForArrayName]);
                //arraysNamesToRemove.push(paramsNames[indexForArrayName]);//send arr name
                allVariables.splice(allVariables.indexOf(paramsNames[indexForArrayName]), 1);
                startIndexForInsert++;
            }
            params= params.substring(right+2);
        }
        else{//only primitives left
            splited_Primitives_ToInsert= params.split (',').filter(function(el) {return el.length != 0;});
            insertPrimitivesIntoParamsDic(splited_Primitives_ToInsert, startIndexForInsert);
            params='';
        }
    }
}



function insertPrimitivesIntoParamsDic(splited, index){
    var paramToInsert;
    for (let k=0; k<splited.length; k++){
        if (!splited[k].startsWith('[') && !splited[k].endsWith('[')){//primitive
            paramToInsert= removeQuotes(splited[k]);
            paramsDictionary[paramsNames[index]]= paramToInsert;
            index++;
        }
        // else {
        //     arraysNamesToRemove.push(paramsNames[k]);
        //     allVariables.splice(allVariables.indexOf(paramsNames[k]), 1);
        //     let arr= splited[k].substring(1, splited[k].length-2);//remove '[]' from start and end
        //     arr= arr.split (',').filter(function(el) {return el.length != 0;});
        //     insertArrayMembsersIntoArrDic(arr, paramsNames[k]);
        // }
    }
}
function insertArrayMembsersIntoArrDic(arr, arrName){
    let paramIndex=0;
    //var splitedParams;
    for (let l=0; l<arr.length; l++){
        // if (arr[l].startsWith('[') && arr[l].endsWith(']')){//another array   [1,2,3]
        //     arr[l]= arr[l].substring(1, arr[l].length-2);//remove '[]' from start and end
        //     splitedParams= arr[l].split (',').filter(function(el) {return el.length != 0;});
        //     //arrIndexInInput.push();//the first(and only) argument is array
        //     arraysNamesToRemove.push(arrName[l]);//send arr name
        //     paramIndex++;
        //     insertArrayMembsersIntoArrDic(splitedParams, arrName[l]);
        // }
        // else{
        arrDictionary[arrName+'['+l+']']= removeQuotes(arr[l]);
        paramIndex++;
        //}

    }
}
function removeQuotes(param){
    if (param.startsWith('\''))
        param= param.substring(1, param.lastIndexOf('\''));//remove '\'' from start and end
    return param;
}


// function smartSplit(params){
//     //check for array
//     if (params.startsWith('[')){
//         params= params.substring(1, params.length-2);//remove '[]' from start and end
//         //inputType= 'array';//else- default for inputType= 'notArray'
//     }
//     let arr= params.split (',').filter(function(el) {return el.length != 0;});
//     //check for strings in the organs
//     for (let param of arr){
//         if (param.startsWith('\''))
//             param= param.substring(1, param.length-2);//remove '\'' from start and end
//     }
//     return arr;
// }


function paint_if_statement(line, i){
    if (line.includes('if'))
        line= line.substring(line.indexOf('('), line.lastIndexOf('{'));
    else if (line.includes('while'))
        line= line.substring(line.indexOf('('), line.lastIndexOf('{'));
    else{//includes 'else'
        if (includesInElseArr(lineOfLineInArray(i))){
            let fatherIndex= getElsesFather(lineOfLineInArray(i));
            if (String(ifDictionary_WithOriginalLines[fatherIndex]).includes('false'))
                ifDictionary[j]= true;
            else
                ifDictionary[j]= false;
        }
        return;
    }
    var numericVal;
    for (let variable of allVariables) {
        let seekFrom=0;
        let index= 1;
        while (index!= -1) {
            index = line.indexOf(variable, seekFrom);
            seekFrom = seekFrom + index + 1;
            if (index!= -1 && standByItSelf(line, index, variable.length)) {//add function 'smartIncludes'
                numericVal= paramsDictionary[variable];
                line = replaceRange(line, index, index + variable.length, numericVal);
            }
        }
    }
    //search for array members
    if (line.includes('[')){
        try{
            line= makeEvalInArrMember(line);
        }catch(err){
            line= replaceArrayMembers(line);
            line= makeEvalInArrMember(line);
        }

        line= replaceArrayMembers(line);
    }
    ifDictionary[j] = eval(line);
    ifDictionary_WithOriginalLines[lineOfLineInArray(i)]= eval(line);

}

function makeEvalInArrMember(line){
    var c;
    var openIndex;
    let toSub='';
    let i=0;
    while(i<line.length){
        while(line.charAt(i) != '[' && i<line.length){i++; c= line.charAt(i);}
        if (i>=line.length)
            return line;
        openIndex=i;
        i++;
        c= line.charAt(i);
        while (line.charAt(i)!= ']'){
            c= line.charAt(i);
            toSub= toSub + c;
            i++;
        }
        line= replaceRange(line, openIndex+1, line.indexOf(']',openIndex), eval(toSub));
        toSub='';
        i= line.indexOf(']',openIndex);
    }
    return line;
}


function includesInElseArr(line){
    for (let h=0; h<elseDictionary.length; h++){
        if (elseDictionary[h].else == line)
            return true;
    }
    return false;
}
function lineOfLineInArray(index) {
    for (let i=0; i<toTable.length; i++){
        if (toTable[i].line== index+1)
            return toTable[i].line;
    }
    return -1;
}

function getElsesFather(elseLine){
    for (let h=0; h<elseDictionary.length; h++) {
        if (elseDictionary[h].else == elseLine)
            return elseDictionary[h].father;
    }
}


function replaceArrayMembers(line){
    var newVal;
    for (var key in arrDictionary) {
        while (line.includes(key)){
            newVal= arrDictionary[key];
            line = replaceRange(line, line.indexOf(key), line.indexOf(key) + key.length, newVal);
        }
    }
    return line;
}

// function lineIncludesArrMember(line){
//     for (var key of arrDictionary){
//         if (line.includes(key))
//             return true;
//     }
// }





function replaceVariableWithActualValue(str, updatedValues){//replace with real values
    var replaceVal;
    for (let variable of allVariables) {
        let seekFrom=0;
        let index= 1;
        while (index!= -1) {
            index = str.indexOf(variable, seekFrom);
            seekFrom = seekFrom + index + 1;
            if (index!= -1 && standByItSelf(str, index, variable.length)) {//add function 'smartIncludes'
                //replaceVal = updatedValues[variable];
                //updValue = updValue.replace(variable, localVal);
                replaceVal=
                str = replaceRange(str, index, index + variable.length, replaceVal);
            }
        }
    }
    return str;
}





function pushNotEmpty(line){
    if (!isOnlySpaces(line)){
        newCode.push(line);
        j++;
    }

}

function isOnlySpaces(str){
    if (!str.replace(/\s/g, '').length)
        return true;
    return false;
}


function smartReplaceALocal(line, i){
    var lineIndex;
    for (let local of locals) {
        let seekFrom=0;
        let index= 1;
        while (index!= -1){
            index= line.indexOf(local, seekFrom);
            seekFrom= seekFrom + index + 1;
            if (index!= -1 && standByItSelf(line, index, local.length)) {
                lineIndex = indexOfLineInArray(i);
                line = replaceRange(line, index, index + local.length, varTable[lineIndex][local]);
            }
        }
    }
    return line;
}

function replaceRange(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end);
}

function local_As_VarDec_OR_AssExp(line, i) {//a local that is a varDec or assExp
    let index= indexOfLineInArray(i);
    //let y= toTable[index].name;
    return ((toTable[index].type=='VariableDeclaration' || toTable[index].type=='AssignmentExpression') &&
        locals.includes(toTable[index].name));
}

function indexOfLineInArray(index) {
    for (let i=0; i<toTable.length; i++){
        if (toTable[i].line== index+1)
            return i;
    }
    return -1;
}

function standByItSelf(line, index, varLength) {
    if (index==0 && index+varLength==line.length)//both sides null
        return true;
    if (index==0){//only left null
        if (index + varLength-1 < line.length-1 && !isValid(line.charAt(index+varLength)))
            return true;
    }
    if (index+ varLength == line.length){//only right null
        if (index-1 >= 0 && !isValid(line.charAt(index-1)))
            return true;
    }//both sides not null
    if (index-1 >= 0 && index + varLength-1 < line.length-1){
        if (!isValid(line.charAt(index-1)) && !isValid(line.charAt(index+varLength)))
            return true;
    }
    return false;
}

function atLeast1standsByItSelf(line) {
    for (let local of locals) {
        let seekFrom=0;
        let index= 1;
        while (index!= -1){
            index= line.indexOf(local, seekFrom);
            seekFrom= seekFrom + index + 1;
            if (index!= -1 && standByItSelf(line, index, local.length))
                return true;
        }
    }
    return false;

}

function isValid(str) { return /^\w+$/.test(str); }


function containsALocal(line){
    for(let local of locals) {
        if (line.includes(local))
            return true;
    }
    return false;
}

function getIfDictionary(line){
    return ifDictionary;
}












//function splitCondition(condition){
//     if (condition.includes('='))
//         return splitWithEqualChar(condition);
//     else
//         return splitWithoutEqualChar(condition);
// }
//
// function splitWithEqualChar(condition){
//     if (condition.includes('==')){
//         condition= condition.split ('==').filter(function(el) {return el.length != 0;});
//         return {'condition': condition, 'operator':'=='};
//     }
//     if (condition.includes('<=')){
//         condition= condition.split ('<=').filter(function(el) {return el.length != 0;});
//         return {'condition': condition, 'operator':'<='};
//     }
//     if (condition.includes('>=')){
//         condition= condition.split ('>=').filter(function(el) {return el.length != 0;});
//         return {'condition': condition, 'operator':'>='};
//     }
//     if (condition.includes('!=')){
//         condition= condition.split ('!=').filter(function(el) {return el.length != 0;});
//         return {'condition': condition, 'operator':'!='};
//     }
// }
//
// function splitWithoutEqualChar(condition){
//     if (condition.includes('<')){
//         condition= condition.split ('<').filter(function(el) {return el.length != 0;});
//         return {'condition': condition, 'operator':'<'};
//     }
//     if (condition.includes('>')){
//         condition= condition.split ('>').filter(function(el) {return el.length != 0;});
//         return {'condition': condition, 'operator':'>'};
//     }
// }









export {parseCode};
export {toTable};
export {substituteCode};
export {showSubCode};
export {getIfDictionary};
