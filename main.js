document.getElementById('iLanguageFile').addEventListener('change', function (e){
    var files = e.target.files;
    const reader = new FileReader()
    reader.readAsText(files[0]);
    reader.onload = (event) => processData(event.target.result)
}, false);

document.getElementById('sConvert').addEventListener('mouseup', function (e){
    var inputData = document.getElementById('iInput').value;
    splitInput(inputData);
}, false);

var titles;
var salutations;
var salutation;
var titleArray = [];
var title;
var letterSalutation;
var gender;
var firstnames;
var lastname;
var leftover;


function splitInput(text){
    var splitText = text.split(' ');
    var i = salutations[1].indexOf("other");
    if(salutations[0].includes(splitText[0])){
        i = salutations[0].indexOf(splitText[0]);
        text = text.substring(splitText[0].length+1, text.length);
    }
    recursiveOuterFunction(text)
    var names = getNamesFromLeftovers(text, titleArray);
    var left = getLeftoversFromLeftovers(text, titleArray, names);
    var tarr = [...names];
    lastname = getLastName(tarr);
    console.log(lastname);
    tarr = [...names];
    var firstnamesArr = getFirstNames(tarr);
    firstnames = firstnamesArr.join(", ")
    console.log(firstnames);
    leftover = left.join(", ");
    console.log(leftover);
    title = titleArray.join(", ");
    console.log(title);
}

function getLastName(array){
    return array.pop();
}

function getFirstNames(array){
    array.pop();
    return array;
}

function getNamesFromLeftovers(text, array){
    var arr = [];
    text = text.substring(text.indexOf(array[array.length-1])+array[array.length-1].length+1 ,text.length);
    var tarr = text.split(" ");
    for(var j = 0; j < tarr.length; j++){
        if(tarr[j] != " " && tarr[j] != ""){
            arr.push(tarr[j]);
        }
    }
    return(arr);
}

function getLeftoversFromLeftovers(text, array, namesArr){
    var arr = [];
    for(var j = 0; j < array.length; j++){
        text = text.replace(array[j], "");
    }
    var tarr = text.split(" ");
    for(var j = 0; j < tarr.length; j++){
        if(tarr[j] != " " && tarr[j] != "" && namesArr.includes(tarr[j]) != true){
            arr.push(tarr[j]);
        }
    }
    return(arr);
}

function recursiveOuterFunction(text){
    recursiveInnerFunction(text);
    if(text.indexOf(" ")==-1){ return ""; } 
    text = text.substring(text.indexOf(" "), text.length);
    if(text[0] == " "){ text=text.substring(1, text.length); }
    if(text!=""){ recursiveOuterFunction(text); }
    return text;
}

function recursiveInnerFunction(text){
    for(var j = 0; j < titles.length; j++){
        if(titles[j] == text){
            titleArray.push(titles[j]);
            break;
        }
    }
    if(text.lastIndexOf(" ")==-1){ return ""; } 
    text = text.substring(0, text.lastIndexOf(" "));
    if(text!=""){ recursiveInnerFunction(text); }
    return text;
}

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    salutations = [];
    titles = allTextLines[0].split(',');
    var headers = allTextLines[1].split(',');
    for (var i=1; i<5; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            
            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(data[j]);
            }
            salutations.push(tarr);
        }
    }
    // alert(lines);
}

function clearAllFields(){
    document.getElementById("iSalutation").value = "";
    document.getElementById('male').checked = false;
    document.getElementById('female').checked = false;
    document.getElementById('other').checked = false;
    document.getElementById('iSalutationLetter').value= "";
    document.getElementById("iTitle").value = "";
    document.getElementById("iFirstName").value = "";
    document.getElementById("iLastName").value = "";
    document.getElementById("iLeftover").value = "";
}

function fillAllFields(){
    document.getElementById("iSalutation").value = salutation;
    if(gender == "male"){
        document.getElementById('male').checked = true;
    }else if(gender == "female"){
        document.getElementById('female').checked = true;
    }else{
        document.getElementById('other').checked = true;
    }
    document.getElementById('iSalutationLetter').value= letterSalutation;
    document.getElementById("iTitle").value = title;
    document.getElementById("iFirstName").value = firstnames;
    document.getElementById("iLastName").value = lastname;
    document.getElementById("iLeftover").value = leftover;
}
