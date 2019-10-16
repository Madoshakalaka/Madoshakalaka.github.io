const axios = require('axios')
const $ = require('jquery')


function isVoiceless(c) {
    return 'pksfʃt'.includes(c)
}

function isNotPhoneme(c) {
    return !('wvŋpɝɑɾbɚɔʊnujmkiədæɛosɵeʒlzʌgɹfɪhðʃat'.includes(c)) || c.trim().length === 0
}

function isAspiratedStop(str, i) {
    return 'ptk'.includes(str.charAt(i)) && (i === 0 || isNotPhoneme(str.charAt(i - 1)))
}

function isVowel(c) {
    return 'ɝɑɚɔʊuiəæɛoeʌɪa'.includes(c) && c.length > 0
}

function isNasal(c) {
    return 'mnŋ'.includes(c) && c.length > 0
}

function isObstruent(c) {
    return 'pbtdkgfvɵðszʃʒh'.includes(c) && c.length > 0
}

function isStop(c){
    return 'pbtdkg'.includes(c) && c.length > 0
}

function isDiphthong(s, old_char) {
    const sum = s + old_char
    return sum === 'oʊ' || sum === 'aɪ' || sum === 'aʊ' || sum === 'eɪ' || sum === 'ɔɪ'
}

function isConsonant(c) {
    return 'wvŋpɾbnjmkdsɵʒlzʌgfhðʃt'.includes(c) && c !== ''

}

function isPunctuationOrWhitespace(c){
    return c.trim().length === 0 || ! "wvŋpɝɑɾbɚɔʊnujmkiədæɛosɵeʒlzʌgɹfɪhðʃat".includes(c)
}

$(() => {
        const $to_ipa = $('#to-ipa')
        const $english = $('#english')
        const $ipa = $('#ipa')
        const $narrowlize = $('#narrowlize')
        toIPA()


        let ipaWithMarkings = ''

        function toIPA() {
            $to_ipa.attr('disabled', true)


            axios.get('http://edmontonhelp.com/phonetics', {
                params: {text: $english.val().normalize('NFC')}
            })
                .then((res) => {
                    let newStr = ''
                    for (let i = 0; i < res.data.result.length; i++) {
                        if (res.data.result.slice(i, i + 2) === 'ɑɪ') {
                            newStr += 'aɪ'
                            i++
                            continue
                        }
                        if (res.data.result.slice(i, i + 2) === 'ɑʊ') {
                            newStr += 'aʊ'
                            i++
                            continue
                        }
                        if (res.data.result.slice(i, i + 2) === 'əʊ') {
                            newStr += 'oʊ'
                            i++
                            continue
                        }
                        if (res.data.result.slice(i, i + 2) === 'l̩') {
                            // console.log(res.data.result.charAt(i + 3), '1')
                            if ((i + 3 === res.data.result.length || isPunctuationOrWhitespace(res.data.result.charAt(i + 2))) &&
                                (i === 0 || isConsonant(res.data.result.charAt(i - 1)))) {
                                newStr += 'l'
                                continue
                            } else {

                                newStr += 'ɫ'
                                i++
                                continue
                            }
                        }
                        newStr += res.data.result.charAt(i)
                    }
                    ipaWithMarkings = newStr
                    $ipa.val(newStr.replace(/[ˈˌ]/g, ''))
                }).finally($to_ipa.attr('disabled', false))

        }

        $to_ipa.on('click', toIPA)

        function narrowlize() {
            let res = ''

            let old_ipa
            if ((ipaWithMarkings.normalize('NFC').replace(/[ˈˌ]/g, '')) === $ipa.val()) {
                old_ipa = ipaWithMarkings.normalize('NFC')
            } else {
                old_ipa = $ipa.val().normalize('NFC')
            }

            const raising = $("#raising").is(":checked")
            const aspiratedStop = $("#aspirated-stops").is(":checked")
            const devoicing = $("#devoicing").is(":checked")
            const nasalization = $("#nasalization").is(":checked")
            const dentalization = $("#dentalization").is(":checked")
            const syllabification = $("#syllabification").is(":checked")
            const flapping = $("#flapping").is(":checked")
            const velarization = $("#velarization").is(":checked")
            const liquid_syllabification = $("#liquid-syllabification").is(":checked")
            const unreleased = $("#unreleased-stop").is(":checked")

            for (let i = 0; i < old_ipa.length; i++) {
                const old_char = old_ipa.charAt(i)

                if (raising) {
                    if (old_char === 'a' && i + 2 < old_ipa.length && 'ɪʊ'.includes(old_ipa.charAt(i + 1)) && isVoiceless(old_ipa.charAt(i + 2))) {
                        res += '<span style="color: #2a7ae2;">' + 'ə' + '</span>'
                        continue
                    }
                }

                if (aspiratedStop) {
                    if (isAspiratedStop(old_ipa, i)) {
                        res += old_char + '<span style="color: #8147e2;">' + '<sup>h</sup>' + '</span>'
                        continue
                    }
                }

                if (devoicing) {
                    if ('wjlɹ'.includes(old_char) && i > 0 && isAspiratedStop(old_ipa, i - 1)) {
                        res += '<span style="color: #e260ba;">' + old_char + '̥' + '</span>'
                        continue
                    }

                }
                if (nasalization) {
                    if (isVowel(old_char) && i + 1 < old_ipa.length && isNasal(old_ipa.charAt(i + 1)) && i - 1 > 0 && !isDiphthong(old_ipa.charAt(i - 1), old_char)) {
                        res += '<span style="color: #e25f58;">' + old_char + '̃' + '</span>'
                        continue
                    }
                }
                if (dentalization) {
                    if ('tdn'.includes(old_char) && i + 1 < old_ipa.length && 'ɵð'.includes(old_ipa.charAt(i + 1))) {
                        res += '<span style="color: #e2bc69;">' + old_char + '̪' + '</span>'
                        continue
                    }
                }
                if (syllabification) {
                    if ('mnŋ'.includes(old_char) && (i + 1 === old_ipa.length || (isNotPhoneme(old_ipa.charAt(i + 1)) && old_ipa.charAt(i + 1) !== '̩')) && (i - 1 > 0 && isObstruent(old_ipa.charAt(i - 1)))) {
                        res += '<span style="color: #c0e26b;">' + old_char + '̩' + '</span>'
                        continue
                    } else if ('mnŋ'.includes(old_char) && i + 1 < old_ipa.length && old_ipa.charAt(i + 1) === '̩') {
                        res += '<span style="color: #c0e26b;">' + old_char + '</span>'
                        continue
                    }
                }
                if (flapping) {
                    if (old_char === 'ɾ') {
                        res += '<span style="color: #77e26b;">' + 'ɾ' + '</span>'
                        continue
                    }

                    if ('td'.includes(old_char) && i - 1 > 0 && i + 1 < old_ipa.length && isVowel(old_ipa.charAt(i - 1)) && isVowel(old_ipa.charAt(i + 1))) {
                        res += '<span style="color: #77e26b;">' + 'ɾ' + '</span>'
                        continue
                    }
                }

                if (velarization) {
                    if (old_char === 'ɫ') {
                        res += '<span style="color: #5de2c3;">' + 'ɫ' + '</span>'
                        continue
                    }
                    if (old_char === 'l') {
                        if ((i - 1 > 0 && isVowel(old_ipa.charAt(i - 1))) && (i + 1 === old_ipa.length || isConsonant(old_ipa.charAt(i + 1))))  {
                            if (i === 0 || isNotPhoneme(old_ipa.charAt(i -1))){
                                continue
                            }
                            res += '<span style="color: #5de2c3;">' + 'ɫ' + '</span>'
                            continue
                        }

                    }


                }

                if (liquid_syllabification){
                    if ((old_ipa.slice(i, i+2) === 'l̩' || old_ipa.slice(i, i+2) === 'r̩') && (i+2===old_ipa.length||isPunctuationOrWhitespace(old_ipa.charAt(i+2))) && (i===0||isConsonant(old_ipa.charAt(i-1))) ){
                        res += '<span style="color: #b0e0e2;">' + old_char + '</span>'
                        continue
                    }


                }

                if (unreleased){
                    if (isStop(old_char) && (i + 1 === old_ipa.length || isStop(old_ipa.charAt(i+1)))){
                        res += '<span style="color: #e2d6a3;">' + old_char + '̚' + '</span>'
                        continue
                    }


                }


                if (!'ˈˌ'.includes(old_char)) res += old_char

            }
            $('#result').html(res.replace(/\n/g, "<br />"))

        }

        $narrowlize.on('click', narrowlize)


    }
)