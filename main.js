document.getElementById('iLanguageFile').addEventListener('change', function (e){
    var files = e.target.files;
    const reader = new FileReader()
    filename = e.target.value.substring(12,e.target.value.length);
    reader.readAsText(files[0]);
    reader.onload = (event) => processData(event.target.result)
}, false);

document.getElementById('male').addEventListener('change', function (e){
    if(e.target.checked && salutations.length != 0){
        genderChanged("male");
    }
}, false);
document.getElementById('female').addEventListener('change', function (e){
    if(e.target.checked && salutations.length != 0){
        genderChanged("female");
    }
}, false);
document.getElementById('other').addEventListener('change', function (e){
    if(e.target.checked && salutations.length != 0){
        genderChanged("other");
    }
}, false);

document.getElementById('sConvert').addEventListener('mouseup', function (e){
    var inputData = document.getElementById('iInput').value;
    splitInput(inputData);
}, false);

document.getElementById('sAddTitleTemp').addEventListener('mouseup', function (e){
    var inputData = document.getElementById('iAddTitle').value;
    titles.push(inputData);
}, false);

document.getElementById('sAddTitle').addEventListener('mouseup', function (e){
    var inputData = document.getElementById('iAddTitle').value;
    titles.push(inputData);
    permTitles.push(inputData);
}, false);

document.getElementById('sDownloadCsv').addEventListener('mouseup', function (e){
    var csvContent = "data:text/csv;charset=utf-8,"+permTitles.join(",")+"\r\n";
    salutations.forEach(function(rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });
    var encodeUri = encodeURI(csvContent);
    var element = document.createElement('a');
    element.setAttribute('href', encodeUri);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

}, false);

var filename;
var titles;
var permTitles;
var salutations;
var salutation;
var titleArray = [];
var title;
var letterSalutation;
var gender;
var firstNamesArray = [];
var firstnames;
var lastname;
var leftover;


function splitInput(text){
    var lastNameFirst = false;
    clearAllFields();
    if(text.includes(",")){
        lastNameFirst=true;
        text = text.replace(",", "");
    }
    var splitText = text.split(' ');
    var i = salutations[1].indexOf("other");
    if(salutations[0].includes(splitText[0])){
        i = salutations[0].indexOf(splitText[0]);
        text = text.substring(splitText[0].length+1, text.length);
    }
    salutation = salutations[0][i];
    gender = salutations[1][i];
    letterSalutation = salutations[2][i];
    recursiveOuterFunction(text);
    var names = getNamesFromLeftovers(text, titleArray);
    var left = getLeftoversFromLeftovers(text, titleArray, names);
    var tarr = [...names];
    lastname = getLastName(tarr, lastNameFirst);
    tarr = [...names];
    firstNamesArray = getFirstNames(tarr, lastNameFirst);
    firstnames = firstNamesArray.join(", ")
    leftover = left.join(", ");
    title = titleArray.join(", ");
    fillAllFields();
}

function genderChanged(text){
    if(salutations[1].includes(text)){
        i = salutations[1].indexOf(text);
    } else {
        //errorhandling
        return;
    }
    salutation = salutations[0][i];
    gender = salutations[1][i];
    letterSalutation = salutations[2][i];
    updateSalutations();
}

function getLastName(array, lastNameFirst){
    if(lastNameFirst){
        return array.shift();
    }
    return array.pop();
}

function getFirstNames(array, lastNameFirst){
    if(lastNameFirst){
        array.shift()
        return array;
    }
    array.pop();
    return array;
}

function getNamesFromLeftovers(text, array){
    var arr = [];
    for(var j = 0; j < array.length; j++){
        text = text.replace(array[j], "");
    }
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

function recursiveInnerFunction(text){
    for(var j = 0; j < titles.length; j++){
        if(titles[j] == text){
            titleArray.push(titles[j]);
            return;
        }
    }
    if(text.indexOf(" ")==-1){ return; } 
    text = text.substring(text.indexOf(" "), text.length);
    if(text[0] == " "){ text=text.substring(1, text.length); }
    if(text!=""){ recursiveInnerFunction(text); }
    return;
}

function recursiveOuterFunction(text){
    recursiveInnerFunction(text);
    if(titleArray.length != 0){
        for(var j = 0; j<titleArray.length; j++){
            text=text.replace(titleArray[j],"");
        }
    }
    if(text.lastIndexOf(" ")==-1){ return; } 
    text = text.substring(0, text.lastIndexOf(" "));
    if(text!=""){ recursiveOuterFunction(text); }
    return;
}

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    salutations = [];
    permTitles = allTextLines[0].split(',');
    titles = [...permTitles];
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
}

function clearAllFields(){
    salutation = "";
    titleArray = [];
    title = "";
    letterSalutation = "";
    gender = "";
    firstNamesArray = [];
    firstnames = "";
    lastname = "";
    leftover = "";
    document.getElementById("iSalutation").value = "";
    document.getElementById('male').checked = false;
    document.getElementById('female').checked = false;
    document.getElementById('other').checked = false;
    document.getElementById('iSalutationLetter').value= "";
    document.getElementById("iTitle").value = "";
    document.getElementById("iFirstName").value = "";
    document.getElementById("iLastName").value = "";
    document.getElementById("iLeftover").value = "";iTotal
    document.getElementById("iTotal").value = "";
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
    fillTotal();
}

function fillTotal(){
    document.getElementById("iTotal").value = "";
    var totalString = letterSalutation+" ";
    if(salutation != ""){
        totalString += salutation+" ";
    }
    totalString += titleArray.join(" ") + " ";
    totalString += firstNamesArray.join(" ") + " ";
    totalString += lastname;
    document.getElementById("iTotal").value = totalString;
}

function updateSalutations(){
    document.getElementById("iSalutation").value = salutation;
    document.getElementById('iSalutationLetter').value= letterSalutation;
    fillTotal();
}
