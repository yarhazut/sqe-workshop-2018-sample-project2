import $ from 'jquery';
import {showSubCode, parseCode, substituteCode, getIfDictionary} from './code-analyzer';



$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        //toTable=[];
        let codeToParse = $('#codePlaceholder').val();
        let params = document.getElementById('inputText').value;
        // let parsedCode = parseCode(codeToParse);
        // $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let table = parseCode(codeToParse);
        table.forEach(function(item){
            $('#parsedCode').append('<tr><td>'+item.line+'</td><td>'+item.type+'</td><td>'+item.name+'</td><td>'+item.condition+'</td><td>'+item.value+'</td></tr>');
        });

        //console.log(JSON.stringify(table));
        //let table2= substituteCode(table);
        let newCode= showSubCode(codeToParse, params);
        let subTable= document.getElementById('subTable');//html table for newCode
        let ifDictionary= getIfDictionary();
        for (let i=0; i< newCode.length; i++){
            var row = subTable.insertRow(i);
            var cell1 = row.insertCell(0);
            cell1.innerHTML = newCode[i];
            if (i in ifDictionary){
                if (ifDictionary[i]==true)
                    row.className= 'green';
                else
                    row.className= 'red';
            }

        }

        //console.log(table2);
    });


});
