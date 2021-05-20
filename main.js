document.getElementById('iLanguageFile').addEventListener('change', function (e){
    var files = e.target.files;
    const reader = new FileReader()
    reader.readAsText(files[0]);
    reader.onload = (event) => processData(event.target.result)
}, false);

function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var titles = allTextLines[0].split(',');
    var headers = allTextLines[1].split(',');
    var lines = [];

    for (var i=2; i<5; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(headers[j]+":"+data[j]);
            }
            lines.push(tarr);
        }
    }
    console.log(titles)
    console.log(lines)
    // alert(lines);
}
