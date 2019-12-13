const $ = require('jquery')

const lookup = {'3':['3_a', '3_b'], '5':['5a', '5b'], '20': ['20a', '20b']}

$(() => {
    $show = $('#show')
    $next = $('#next')
    $question = $('#question')
    $proofs = $('#proofs')

    $show.on('click', ()=>{$proofs.show()})

    $navs = $('.nav')

    for (const x of Array(24).keys()) {
        $navs.append($(`<button>${x+1}</button>`).on('click', ()=>{

            switchTo(x+1)

        }))
    }

    function switchTo(xx){

        $question.attr('src', `/assets/review_questions/${xx}.png`)

        let proofs = []

        if (xx.toString() in lookup){
            proofs.push(...lookup[v.toString()])
        }
        else{
            proofs = [xx.toString()]
        }

        $proofs.empty().hide()
        proofs.forEach((value)=>{
            $proofs.append($(`<img src="/assets/review_proofs/${value}.png" alt="not-stonks">`))
        })
    }

    $next.on('click', ()=>{
        let v = Math.floor((Math.random() * 24) + 1);
        switchTo(v)


    })

})
