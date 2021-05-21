//#region get HTTP Elements from DOM
/** gets the DOM element for the file upload and handles it's change event */
document.getElementById('iLanguageFile').addEventListener('change', function (e){
    var files = e.target.files;
    const reader = new FileReader()
    filename = e.target.value.substring(filepathPrefixLength,e.target.value.length);      //the filepath has problems when run locally, it gets prefixed with "C__fakepath_", this gets rid of it
    reader.readAsText(files[0]);
    reader.onload = (event) => processData(event.target.result)
}, false);

/** gets the DOM element for the male radio button and handles it's change event */
document.getElementById('male').addEventListener('change', function (e){
    if(e.target.checked && salutations.length != 0){
        genderChanged("male");
    }
}, false);

/** gets the DOM element for the female radio button and handles it's change event */
document.getElementById('female').addEventListener('change', function (e){
    if(e.target.checked && salutations.length != 0){
        genderChanged("female");
    }
}, false);

/** gets the DOM element for the neutral radio button and handles it's change event */
document.getElementById('other').addEventListener('change', function (e){
    if(e.target.checked && salutations.length != 0){
        genderChanged("other");
    }
}, false);

/** gets the DOM element for the letter salutation and handles it's input event */
document.getElementById('iSalutationLetter').addEventListener('input', function (e){
    letterSalutationChanged(e.target.value);
}, false);

/** gets the DOM element for the convert button and handles it's mouseup event. */
document.getElementById('sConvert').addEventListener('mouseup', function (e){
    var inputData = document.getElementById('iInput').value;
    splitAndParseInput(inputData);
}, false);

/** gets the DOM element for the button that adds titles to the titles array temporarily and handles it's mouseup event. */
document.getElementById('sAddTitleTemp').addEventListener('mouseup', function (e){
    var inputData = document.getElementById('iAddTitle').value;
    titles.push(inputData);
}, false);

/** gets the DOM element for the button that adds titles to the titles array permanently (which can be downloaded as a .csv) and handles it's mouseup event. */
document.getElementById('sAddTitle').addEventListener('mouseup', function (e){
    var inputData = document.getElementById('iAddTitle').value;
    titles.push(inputData);
    permTitles.push(inputData);
}, false);
//#endregion

//#region Downloader
/** gets the DOM element for the download button
 * this also creates a new undisplayed DOM element, that is of download type and clicks it
 * the download then starts and the DOM element is removed
 */
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
//#endregion

var filepathPrefixLength = 12;

//#region members
var filename;
var titles;
var permTitles;
var salutations;
var salutation;
var titleArray = [];
var removableTitle;
var title;
var letterSalutation;
var gender;
var firstNamesArray = [];
var firstnames;
var lastname;
var leftover;
//#endregion

/** the main function of this app, splits the input from the main input field and first checks if there is a "," somewhere in the name
 * this indicates that the entry is "lastname, firstname(s)" and not "firstname(s) lastname".
 * then it checks for a salutation (to get the gender),if there is no salutation, the neutral gender will be chosen.
 * some other splitting and parsing functions are called, that will mostly return arrays
 * it then puts together the different strings and fills all the fields
 */
function splitAndParseInput(text){
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
    removableTitle="";                                          //resetting for the following recursive function
    recursiveOuterFunction(text);
    var names = getNamesFromLeftovers(text, titleArray);
    var left = getLeftoversFromLeftovers(text, titleArray, names);
    var tarr = [...names];                                      //cloning the array, bacause in javascript normally arrays are set by reference and not by value
    lastname = getLastName(tarr, lastNameFirst);
    tarr = [...names];                                          //cloning the array, bacause in javascript normally arrays are set by reference and not by value
    firstNamesArray = getFirstNames(tarr, lastNameFirst);
    firstnames = firstNamesArray.join(" ")
    leftover = left.join(", ");
    title = titleArray.join(", ");
    fillAllFields();
}

/** event function for when the letter salutation is changed by the user
 * @param {string} text, the user's input
 */
function letterSalutationChanged(text){
    letterSalutation = text;
    fillTotal();
}

/** event function for when the gender is changed by the user
 * @param {string} text, the string equivalent of the gender, has to be present in the loaded .csv
 */
function genderChanged(text){
    if(salutations[1].includes(text)){
        i = salutations[1].indexOf(text);
    } else {
        return;
    }
    salutation = salutations[0][i];
    gender = salutations[1][i];
    letterSalutation = salutations[2][i];
    updateSalutations();
}

/** returns either the first or last entry of an the names array, depending on lastNameFirst
 * @param {array} array, the array with the names
 * @param {boolean} lastNameFirst, should be true when "lastname, firstname(s)" has been detected
 * 
 * @returns {string} the first or last entry of the names array, hopefully its the last name
 */
function getLastName(array, lastNameFirst){
    if(lastNameFirst){
        return array.shift();
    }
    return array.pop();
}

/** removes the first or last entry (lastname) of the names array, depending on lastNameFirst
 * @param {array} array, the array with the names
 * @param {boolean} lastNameFirst, should be true when "lastname, firstname(s)" has been detected
 * 
 * @returns {array} an array containing everything except the last or first entry
 */
function getFirstNames(array, lastNameFirst){
    if(lastNameFirst){
        array.shift()
        return array;
    }
    array.pop();
    return array;
}

/**this recursive function calls another recursive function and removes the last occurence of a matching title that the inner recursive function found,
 * so that it doesn't need to be processed if it was already matched.
 * It then removes the LEFT most "word" from the text and calls itself until there are no more words left.
 * 
 * @param {string} text, the text that should be matched
 */
function recursiveOuterFunction(text){
    recursiveInnerFunction(text);
    if(removableTitle != ""){
        text = removeLastOccurence(text, removableTitle);
    }
    if(text.lastIndexOf(" ")==-1){ return; } 
    text = text.substring(0, text.lastIndexOf(" "));
    if(text!=""){ 
        recursiveOuterFunction(text); 
    }
    return;
}

/**the inner function of the above recursive function, it first tries to match the string it receives with all entries in the .csv, if it does find a match, 
 * it pushes the match on a global array and marks the match for the outer function for removal.
 * it then removes the RIGHT most "word" from the text and calls itself until there are no more words left.
 * 
 * @param {string} text, the text that should be matched
 */
function recursiveInnerFunction(text){
    for(var j = 0; j < titles.length; j++){
        if(titles[j] == text){
            titleArray.push(titles[j]);
            removableTitle = titles[j];
            return;
        }
    }
    if(text.indexOf(" ")==-1){ return; } 
    text = text.substring(text.indexOf(" "), text.length);
    console.log(text);
    if(text[0] == " "){ text=text.substring(1, text.length); }
    if(text!=""){ recursiveInnerFunction(text); }
    return;
}

/** gets the names from the leftovers of the big recursive function, in this case names is anything to the right of the rightmost title
 * @param {string} text, the entire text (except for the salutation)
 * @param {array} array, the array of matched titles from the recursive function (not the one loaded from the .csv)
 * 
 * @returns {array} an array of hopefully all the names, no leftovers and no titles
 */
function getNamesFromLeftovers(text, array){
    var arr = [];
    var i = 0;
    if(array.length == 0){
        return(text.split(" "))
    }
    for(var j = 0; j < array.length; j++){
        if(text.lastIndexOf(array[j])+array[j].length > i){
            i = text.lastIndexOf(array[j])+array[j].length;
        }
    }
    text = text.substring((i),text.length);
    var tarr = text.split(" ");
    for(var j = 0; j < tarr.length; j++){
        if(tarr[j] != " " && tarr[j] != ""){
            arr.push(tarr[j]);
        }
    }
    return(arr);
}

/** gets the leftovers (everything that we don't know what it is, could be a title that was not added yet) from the leftovers of the big recursive function,
 * in this case leftovers is anything to the left of the rightmost title, that couldn't be matched with a title
 * @param {string} text, the entire text (except for the salutation)
 * @param {array} array, the array of matched titles from the recursive function (not the one loaded from the .csv)
 * @param {array} namesArr, the array from the previous function, so we don't accidentally get those too
 * 
 * @returns {array} an array of hopefully all the leftovers, no names and no titles
 */
function getLeftoversFromLeftovers(text, array, namesArr){
    var arr = [];
    console.log(array);
    //listen I know thie following looks stupid, but in the array the last entry is the longest and the first is the shortest, due to how the recursive
    //functions are built, thats why we have to start at the end and end at the start.
    for(var j = array.length-1; j >= 0; j--){               
        text = removeLastOccurence(text,array[j]);
    }
    var tarr = text.split(" ");
    for(var j = 0; j < tarr.length; j++){
        if(tarr[j] != " " && tarr[j] != "" && namesArr.includes(tarr[j]) != true){
            arr.push(tarr[j]);
        }
    }
    return(arr);
}

/** a helper function, that removes the last occurence of a string(toRemove) from another string(text) and returns the result(ret)
 * @param {string} text, the text that you want to remove something off
 * @param {string} toRemove, the text that should be removed, if it exists
 * 
 * @returns {string} the text, but without the very last occurence of the word you wanted to get rid of.
 */
function removeLastOccurence(text, toRemove){
    var ret = text;
    if(text.indexOf(toRemove) != -1){
        ret =  text.substring(0, text.lastIndexOf(toRemove))+text.substring(text.lastIndexOf(toRemove)+toRemove.length, text.length);
    }
    return ret;
}

/** takes one .cvs and splits it into two arrays, the first is all the titles (from the first line in the .csv)
 * the second is an array containing 3 more arrays, those are the possible salutation, then the genders and the letter salutations.
 * Every array in the salutations array has to have the same number of entries
 */
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

/**clears all the Fields, so that they are ready for a new Input */
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

/** fills all the fields with the data in the member variables */
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

/** fills the field containing all the concatenated information, with the leftovers removed */
function fillTotal(){
    document.getElementById("iTotal").value = "";
    var totalString = letterSalutation+" ";
    if(salutation != ""){
        totalString += salutation+" ";
    }
    if(titleArray.length != 0){
        totalString += titleArray.join(" ") + " ";
    }
    if(firstNamesArray.length != 0){
        totalString += firstNamesArray.join(" ") + " ";
    }
    totalString += lastname;
    document.getElementById("iTotal").value = totalString;
}

/** updates the salutations according to the change in radio buttons, also changes the text in the field containing the concatenated information */
function updateSalutations(){
    document.getElementById("iSalutation").value = salutation;
    document.getElementById('iSalutationLetter').value= letterSalutation;
    fillTotal();
}
