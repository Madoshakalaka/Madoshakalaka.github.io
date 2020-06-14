const axios = require('axios')

const {JSDOM} = require('jsdom')
const fs = require('fs')
const path = require('path')
const util = require('util')
const cheerio = require("cheerio")
const textVersion = require("textversionjs")
const he = require('he')
const {Trinket, DLC, titleCase, sortCriteria} = require('../src/trinket_utils')


const readdirPromise = util.promisify(fs.readdir)
const statPromise = util.promisify(fs.stat)
const unlinkPromise = util.promisify(fs.unlink)
const writeFilePromise = util.promisify(fs.writeFile)

/**
 * this will rotate every call for a maximum of 10 files
 *
 * @param content {String}
 */
async function logHTML(content) {
    const logDir = path.resolve(__dirname, 'history_data')
    const logFiles = await readdirPromise(logDir)
    if (logFiles.length > 10) {

        const fileBirth = await Promise.all(logFiles.map(filename => statPromise(path.resolve(logDir, filename)).then(r => r.birthtimeMs)))

        let oldestFile = undefined
        let oldestBirth = Infinity
        logFiles.forEach((v, i) => {
            const birth = fileBirth[i]
            if (birth < oldestBirth) {
                oldestFile = v
                oldestBirth = birth
            }
        })

        await unlinkPromise(path.resolve(logDir, oldestFile))
    }

    const date = new Date()
    return writeFilePromise(path.resolve(logDir, `trinkets_${date.getFullYear()}_${date.getMonth()}_${date.getDay()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}.html`), content)


    // logFiles.sort(async (a,b)=>{
    //     const time = await
    // })

}


/**
 *
 * @param table {HTMLTableElement}
 * @return {Array<String>}
 */
function colToProperty(table) {
    const result = []
    for (let i = 0; i < table.rows[0].cells.length; i++) {
        const colName = table.rows[0].cells[i].textContent
        let colProp
        if (colName.startsWith('Trinket Name')) {
            colProp = 'name'
        } else if (colName.startsWith('Trinket Image')) {
            colProp = 'image'
        } else if (colName.startsWith('Rarity')) {
            colProp = 'raritySpan'
        } else if (colName.startsWith('Origin')) {
            colProp = 'origin'
        } else if (colName.startsWith('Effect')) {
            colProp = 'effect'
        } else if (colName.startsWith('Additional')) {
            colProp = 'notes'
        } else if (colName.startsWith('Quote')) {
            colProp = 'quoteFont'
        } else if (colName.startsWith('Class')) {
            colProp = 'restriction'
        } else if (colName.startsWith('Set')) {
            colProp = 'setEffect'
        } else if (colName.startsWith('Shard')) {
            colProp = 'shardCost'
        } else if (colName.startsWith('Prestige')) {
            colProp = 'prestige'
        } else {
            throw `Unknown column name: ${colName}`
        }
        result.push(colProp)
    }
    return result
}

/**
 * lowercase camelcase alphabetic only.
 * Strips the trailing <img> (CC/COM icon)
 *
 * @param {String} rawNameHTML
 * @return {String}
 */
function getTrinketFilename(rawNameHTML) {
    rawNameHTML = rawNameHTML.trim()
    if (rawNameHTML.startsWith("<")) {
        // displayName is wrapped inside <p>
        const $ = cheerio.load(rawNameHTML)
        rawNameHTML = $('p').text()
    } else {
        // strip the trailing dlc icon
        rawNameHTML = rawNameHTML.split('<')[0]
    }

    return rawNameHTML.replace(/[^a-z ]/gi, '').replace(/ /g, '_').toLowerCase()
}

/**
 * Capitalized initials. Space separated.
 *
 * @param {String} rawNameHTML
 * @return {String}
 */
function getTrinketDisplayName(rawNameHTML) {
    rawNameHTML = rawNameHTML.trim()
    if (rawNameHTML.startsWith("<")) {
        // displayName is wrapped inside <p>
        const $ = cheerio.load(rawNameHTML)
        return $('p').text().trim()
    } else {
        // strip the trailing dlc icon
        return rawNameHTML.split('<')[0].trim()
    }
}


async function scrapeAsRawJSON() {
    await // Make a request for a user with a given ID
        axios.get('https://darkestdungeon.gamepedia.com/Trinkets')
            .then(function (response) {
                // handle success
                const trinkets = []

                const myJSDom = new JSDOM(response.data)
                const $ = require('jquery')(myJSDom.window)


                let theTables = ""

                // let trinketTableCount = 0
                $.find('table.wikitable').forEach((table) => {


                    // console.log(v.rows[0].cells[0].textContent)
                    if (table.rows[0].cells[0].textContent.startsWith('Trinket Image')) {
                        theTables += table.outerHTML
                        const colPropMapping = colToProperty(table)


                        let rowBuffer = {}
                        for (let row of [...table.rows].slice(1)) {
                            const trinket = {}
                            let increment = 0

                            for (let colInd = 0; colInd < table.rows[0].cells.length; colInd++) {
                                const propName = colPropMapping[colInd]
                                const bufferedContent = rowBuffer[colInd]
                                let content = undefined
                                if (typeof bufferedContent === 'undefined') {
                                    const cell = row.cells[colInd - increment]
                                    content = cell.innerHTML
                                    if (cell.rowSpan === 2) {
                                        rowBuffer[colInd] = cell.innerHTML
                                    }
                                } else {
                                    content = bufferedContent
                                    delete rowBuffer[colInd]
                                    increment++
                                }
                                trinket[propName] = content
                            }
                            // console.log(trinket)
                            trinkets.push(trinket)
                            // rowBuffer = {}
                        }
                        // console.log(trinket)

                    }


                })


                return {theTables, trinkets}
            })
            .catch(function (error) {
                // handle error
                console.log(error)
            })
            .finally(function () {
                // always executed
            })
            .then(
                ({theTables, trinkets}) => {
                    return logHTML(theTables).then(() => trinkets)
                }
            ).then(trinkets => writeFilePromise(path.resolve(__dirname, 'trinkets_raw.json'), JSON.stringify(trinkets, null, 2))
        )
}

async function downloadImage(url, filename) {
    const writer = fs.createWriteStream(filename)

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}


async function downloadImages() {
    const rawTrinkets = require(path.resolve(__dirname, "trinkets_raw.json"))
    for (const trinket of rawTrinkets) {
        const $ = cheerio.load(trinket.image)
        const imageURL = $('img').prop('src')
        await downloadImage(imageURL, path.resolve(__dirname, '..', 'assets', 'trinket_images', getTrinketFilename(trinket.name) + '.png'))
    }
}

/**
 *
 * @param {?String} noteHTML
 * @return {String}
 */
function cleanNotesHTML(noteHTML) {
    if (noteHTML === null) {
        return ""
    }
    const blah = noteHTML.replace(/<\/?a[^>]*>/g, "")

    const pp = textVersion(blah)

    if (pp.trim()) {
        return pp
    } else {
        return ""
    }
}

/**
 *
 * @returns {Promise<Trinket[]>}
 */
async function generateNormalizedTrinketsJSON() {
    const rawTrinkets = require(path.resolve(__dirname, "trinkets_raw.json"))

    /**
     * @type {Trinket[]}
     */
    const trinkets = []
    for (const rawTrinket of rawTrinkets) {
        const displayName = getTrinketDisplayName(rawTrinket.name)

        // console.log(displayName)
        const $ = cheerio.load(rawTrinket.effect)
        const effects = []

        $('li').each((i, e) => {
            effects.push(he.decode(($(e).html())))
        })

        console.log(effects)


        const rawName = rawTrinket.name
        let dlc
        if (rawName.includes('Crimson Court DLC')) {
            dlc = DLC.CC
        } else if (rawName.includes('Color of Madness DLC') || rawTrinket?.restriction?.includes("Shieldbreaker")) {
            dlc = DLC.COM
        } else if (rawTrinket.raritySpan.includes("Ringmaster")) {
            dlc = DLC.BC
        } else {
            dlc = " "
        }

        let origin = rawTrinket?.origin?.trim()
        if (!origin) {
            origin = " "
        }
        // console.log(displayName)

        let quote = rawTrinket?.quote?.trim() || null

        let setEffectsLi = []
        if (rawTrinket.hasOwnProperty("setEffect")) {
            cheerio.load(rawTrinket.setEffect)('li').each((i, e) => {
                setEffectsLi.push(he.decode($(e).html()))
            })
        } else setEffectsLi = null

        let shardCost = rawTrinket?.shardCost?.trim() || null

        let prestige = rawTrinket?.prestige || null

        let restriction = rawTrinket?.restriction?.trim()
        if (!restriction || !he.decode(restriction).trim() || restriction === "None") {
            restriction = " "
        }


        trinkets.push(new Trinket(`/assets/trinket_images/${getTrinketFilename(rawTrinket.name)}.png`, displayName, rawTrinket?.raritySpan?.trim() || null, origin, effects, restriction, cleanNotesHTML(rawTrinket.notes), dlc, quote, setEffectsLi, shardCost, prestige
        ))
    }
    return trinkets
}




const statNames = ["ACC", "SPD", "Bleed Resist", "DODGE",
    "Bleed Skill Chance", "Blight Resist", "CRIT",
    "Debuff Resist", "Debuff Skill Chance", "Disease Resist",
    "MAX HP", "Move Resist", "Move Skill Chance", "PROT", "Stun Resist", "Chance Party Surprised", "Scouting Chance", "Blight Skill Chance",
    "Stun Skill Chance", "DMG", "Stress", "Trap Disarm Chance", "Food Consumed", "Healing Received", "Death Blow Resist", "Healing Skills", "Virtue Chance",
    "Chance Monsters Surprised", "Resolve XP", "Healing when Eating", "Random Target Chance", "Shards Given", "Guard Duration", "Damage Reflection",
    "Blight Duration", "Stun/Daze Skill Chance", "Death Blow Dealt Chance", "Restoration Duration", "Horror Duration"]





const notMeasurableEffects = ["+100% Heart Attack Stress Heal", "Bypass Guard while Stealthed", "On Melee Attack Hit: Daze (50% base) for 1 rds", "On Heal: Cure Blight", "+4 additional HP Healed Duration", "On Melee Attack Hit: Mark Target"]

async function parseEffects() {
    const trinkets = require(path.resolve(__dirname, 'trinkets.json'))
    let i = 0


    const statChange = `(?<amount>[+\\-]?\\d+%?) (?<stat_name>(${statNames.join("|")}))`
    const statChangeRE = new RegExp(statChange)

    const pmCritRE = /(?<amount>[+\-]\d+%) Crit/i

    const effectRE = new RegExp('^' + statChange + ".*$", "i")


    // console.log(b.source)
    //
    // const effectRE = new RegExp("^(?<amount>[+\\-]\\d+%?) (?<stat_name>(ACC|SPD|Bleed Resist)).*$")
    // console.log(effectRE.source)

    // const effectRE = /^(\s(?<range>(Melee|Ranged)) Skills)?(\s(?<first_round>on First Round))?(\sif HP (?<hp_condition>(above|below)) (?<hp_condition_value>\d{2}%))?$/

    const trinketEffects = {}
    for (const obj of trinkets) {
        const quantifiedEffects = {}

        i++
        const trinket = new Trinket(...Object.values(obj))
        const effects = []
        for (const effect of trinket.effectsLi.concat(trinket.setEffectsLi)) {
            if (effect && effect.trim()) {
                const effectTextVersion = textVersion(effect).trim()
                if (effectTextVersion) {
                    effects.push(effectTextVersion)
                }
            }
        }


        for (const effect of effects) {
            let classifiedStatName = undefined

            /**
             *
             * @type {String}
             */
            let strAmount = undefined

            /**
             *
             * @type {Number}
             */
            let digitizedAmount = undefined


            const match = effect.match(effectRE)


            const statChangeMatch = effect.match(statChangeRE)

            if (match || statChangeMatch) {
                const preferredMatch = match || statChangeMatch
                strAmount = preferredMatch.groups.amount
                // const parsedAmount = matchedAmount.includes('%') ? parseFloat(matchedAmount) / 100 : Number(matchedAmount)
                // console.log(`${effect} -> ${match.groups.stat_name}`)
                // console.log(`${effect} -> | ${parsedAmount} | ${match.groups.spec} | ${match.groups.range ? match.groups.range : ""} | ${match.groups.round ? match.groups.round : ""} |`)
                if (preferredMatch.groups.stat_name === "Stun/Daze Skill Chance") {
                    classifiedStatName = "Stun Skill Chance"
                } else {
                    classifiedStatName = titleCase(preferredMatch.groups.stat_name)
                }

            } else {
                if (effect.endsWith("Transformation Stress")) {

                } else if (effect === "Delayed Curse craving") {

                } else if (effect === "Immune to death by Crimson Curse") {

                } else if (effect === "Can't be Guarded") {

                } else if (effect === "Ignores Stealth") {

                } else if (effect.startsWith("On Attack Miss")) {
                    if (effect === "On Attack Miss: Self: Lose 5 HP") {

                    } else {
                        console.log(effect)
                        console.log(i)
                        throw "Bruh"
                    }
                } else if (effect.startsWith("On Attack:")) {
                    if (effect === "On Attack: Self: Stress +3 (25% chance)") {

                    } else {
                        console.log(effect)
                        console.log(i)
                        throw "Bruh"
                    }
                } else if (effect === "Hero Killed: Party: Stun (120% base)") {
                    // do nothing
                } else if (effect === "Hero Killed: Party: Stress +25") {
                    // do nothing
                } else if (effect === "On Monster Kill: Stress -2") {
                    // do nothing
                } else if (effect === "Hero Killed: Party: Stress +45") {
                    // do nothing
                } else if (effect.includes("Blight (") && effect.includes("pts/rd")) {
                    // blight weapon
                } else if (effect.startsWith("Crits Received Chance")) {
                    // do nothing
                } else if (effect.includes("Bleed (") && effect.includes("pts/rd")) {
                    // bleed weapon
                } else if (effect.includes("Inflict Stress")) {
                    // stress weapon (ring)
                    strAmount = effect.split("Inflict Stress")[1].trim().split(" ")[0]
                    classifiedStatName = "Inflict Stress"
                } else if (effect.startsWith("Armor Piercing: ")) {
                    // stress weapon (ring)
                    strAmount = effect.split("Armor Piercing: ")[1].trim().split(" ")[0]
                    classifiedStatName = "Armor Piercing"
                } else if (effect === "Bypass Guard vs Marked") {
                    // nothing
                } else if (notMeasurableEffects.includes(effect)) {
                    // nothing
                } else if (effect.includes("Crit Ranged Skills")) {
                    strAmount = effect.split("Crit Ranged Skills")[0].trim().split(" ").slice(-1)[0]
                    classifiedStatName = "Crit"
                } else if (effect.match(pmCritRE)) {
                    strAmount = effect.match(pmCritRE).groups.amount
                    classifiedStatName = "Crit"
                } else {

                    console.log(effect)
                    console.log(i)
                    throw "Bruh"
                }


            }
            if (classifiedStatName && strAmount) {

                if (strAmount.includes("%")) {
                    digitizedAmount = (parseFloat(strAmount) / 100).toFixed(2)
                } else {
                    digitizedAmount = parseInt(strAmount)
                }
                if (quantifiedEffects[classifiedStatName]) {
                    quantifiedEffects[classifiedStatName] += digitizedAmount
                } else {
                    quantifiedEffects[classifiedStatName] = digitizedAmount
                }
            }

        }
        trinketEffects[trinket.name] = quantifiedEffects

    }
    await writeFilePromise(path.resolve(__dirname, "trinket_effects.json"), JSON.stringify(trinketEffects))


}


module.exports = {
    logHTML,
    getTrinketFilename,
    downloadImages,
    scrapeAsRawJSON,
    cleanNotesHTML,
    generateNormalizedTrinketsJSON,
    writeFilePromise,
    parseEffects
}