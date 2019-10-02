require('colors')
let jsdiff = require('diff')
import $ from "jquery"

function clean(){
    let a_string = $("#a_transcription").val().normalize('NFC')
    let b_string = $("#b_transcription").val().normalize('NFC')

    if ($("#bracket").is(":checked")){
        a_string = a_string.replace(/[\[\]]+/g, '')
        b_string = b_string.replace(/[\[\]]+/g, '')
    }
    if ($("#slash").is(":checked")){
        a_string = a_string.replace(/\//g, '')
        b_string = b_string.replace(/\//g, '')
    }
    if ($("#stress").is(":checked")){
        a_string = a_string.replace(/[ˈ'ˌ]+/g, '')
        b_string = b_string.replace(/[ˈ'ˌ]+/g, '')
    }
    if ($("#tie-bar").is(":checked")){
        a_string = a_string.replace(/͡/g, '')
        b_string = b_string.replace(/͡/g, '')
    }



    return [a_string, b_string]
}

$(document).ready(()=>{

    $('#compare').click(function(){
        const fragment = $("#result")
        fragment.text("")
        const [a_string, b_string] = clean()
        let diff = jsdiff.diffWords(a_string, b_string);

        let diffString = ""
        diff.forEach(function(part){
            // green for additions, red for deletions
            // grey for common parts
            const color = part.added ? 'red' :
                part.removed ? 'blue' : 'green';
            let span = document.createElement('span')
            span.style.color = color
            span.appendChild(document
                .createTextNode(part.value))
            fragment.append(span)
        });
    })


}

)

