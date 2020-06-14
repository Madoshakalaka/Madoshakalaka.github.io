const $ = require('jquery')
const {titleCase} = require("./trinket_utils")
import 'datatables.net'
import 'datatables.net-buttons'
import 'datatables.net-searchpanes'
import 'datatables.net-select'

const trinkets = require('../console_scripts/trinkets.json')
const trinket_effects = require('../console_scripts/trinket_effects.json')

const {Trinket, DLC, sortCriteria} = require('./trinket_utils.js')

// const buttons = require( 'datatables.net-buttons' )();


const headerPropNames = ["imageURL", "name", "raritySpan", "origin", "effectsLi", "restriction", "notes", "dlc", "quoteFont", "setEffectsLi", "shardCost", "prestige"]
const invisibleProps = ["origin", 'dlc', "shardCost", "prestige", 'notes', "quoteFont"]
const searchableColProps = ["name", "effectsLi", "setEffectsLi", "raritySpan" ,"restriction"]
const propToDisplayName = {
    "imageURL": "Image",
    "name": "Name",
    "raritySpan": "Rarity",
    "origin": "Origin",
    "effectsLi": "Effects",
    "restriction": "Class",
    "notes": "Notes",
    "dlc": "DLC",
    "quoteFont": "Quotes",
    "setEffectsLi": "Set Effects",
    "shardCost": "Shard Cost",
    "prestige": "Prestige"
}

const displayNameToProp = Object.keys(propToDisplayName).reduce(function(obj, key) {
    obj[propToDisplayName[key]] = key;
    return obj;
}, {});

const filterColProps = ["restriction", "dlc"]



function getColInd(propName) {
    return headerPropNames.indexOf(propName)
}

/**
 *
 * @param table
 */
function prepareColToggle(table) {
    let template = document.getElementById('template:switch')
    for (const invisibleProp of invisibleProps) {
        let fragment = template.content.cloneNode(true)
        let toggle = fragment.querySelector('input')
        toggle.addEventListener('change', function () {
            const column = table.column(getColInd(invisibleProp))
            if (this.checked) {
                column.visible(true)
            } else {
                column.visible(false)
            }
        })
        fragment.querySelector('.toggle-name').innerText = propToDisplayName[invisibleProp]
        document.getElementById('col-switch-container').appendChild(fragment)
    }


}


function getStatVal(statName, trinketName){
    return trinket_effects[trinketName][statName]
}

let selectedStat = undefined

$.extend( $.fn.dataTable.ext.type.order, {
    "stat-name-desc": function ( a, b ) {

        if (selectedStat){
            a = getStatVal( selectedStat, a)
            b = getStatVal( selectedStat, b);
            return ((a < b) ? -1 : ((a > b) ? 1 : 0));
        }else{
            return ((a < b) ? -1 : ((a > b) ? 1 : 0));
        }
    },    "stat-name-asc": function ( a, b ) {

        if (selectedStat){
            a = getStatVal( selectedStat, a) || 0
            b = getStatVal( selectedStat, b) || 0
            return ((a < b) ? 1 : ((a > b) ? -1 : 0));
        }else{
            return ((a < b) ? -1 : ((a > b) ? 1 : 0));
        }
    }

} );


$(() => {

    for (const effectName of sortCriteria.sort()){
        $('#effect-names').append(`<option value='${effectName}'>`)
    }


    const invisibleColumnDef = {
        "targets": invisibleProps.map(propName => headerPropNames.indexOf(propName)),
        "visible": false
    }

    const allInds = [...Array(headerPropNames.length).keys()]
    // const nameIndRemoved = allInds.filter(i => headerPropNames[i] !== "name")
    // const searchBanListColumnDef = {"targets": nameIndRemoved, "searchable": false}
    const orderBanListColumnDef = {"targets": allInds, orderable: false}
    const nameColDef = {"targets": [getColInd("name")], "sType":"stat-name"}

    const table = $('table').DataTable({
        "order": [[1, "asc"]],
        "columnDefs": [invisibleColumnDef, orderBanListColumnDef, nameColDef],
        //
        // language: {
        //     searchPlaceholder: "Trinket Name"
        // },
        searchPanes: {
            // viewTotal: true
            columns: filterColProps.map(v => getColInd(v)),
        },
        dom: 'Prtip'
    })

    $("#effect-input").keyup(function (){
        const titleCaseValue = titleCase(this.value)
        if (sortCriteria.includes(titleCaseValue)) {
            selectedStat = titleCaseValue
            // table.column(1).data().sort(function (name1, name2){
            //     const row1Key = trinket_effects[name1][titleCaseValue] || Infinity
            //     const row2Key = trinket_effects[name2][titleCaseValue] || Infinity
            //     return row1Key - row2Key
            // })
            table.draw()
        }else if (!this.value.trim()){
            selectedStat = undefined
            table.draw()
        }
    })

    $('th').each(function(i){

        // console.log(this.html())
        const propName = displayNameToProp[this.innerHTML]
        if (! searchableColProps.includes(propName)){
            return
        }

        const title = $(this).text();


        $(this).append(`<br><input type="text" placeholder="Search ${title}" />`)
    })

    // const $effectsSearchInput = $('#effectsLi-search-input')
    // const $setEffectsSearchInput = $('#setEffectsLi-search-input')

    table.columns().every( function () {
        const that = this;
        const headerPropName = headerPropNames[this.index()]
        if (! searchableColProps.includes(headerPropName)){
            return
        }



        $( 'input', this.header() ).on( 'keyup change', function () {
            // if (headerPropName === 'effectsLi'){
            //     $setEffectsSearchInput.val(this.value)
            // }else if (headerPropName === 'setEffectsLi'){
            //     $setEffectsSearchInput.val(this.value)
            // }
            if ( that.search() !== this.value ) {
                that
                    .search( this.value )
                    .draw();
            }
        } );
    })



    prepareColToggle(table)


    for (const trinket of trinkets) {
        const t = new Trinket(...Object.values(trinket))
        table.row.add(Object.values(t.displayForm()))
    }



    table.searchPanes.rebuildPane()
    table.draw()


    const lazyLoadInstance = new LazyLoad();
    lazyLoadInstance.update();


})