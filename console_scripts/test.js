const fs = require('fs')
const {logHTML, getTrinketFilename, downloadImages, scrapeAsRawJSON, cleanNotesHTML, generateNormalizedTrinketsJSON} = require('./scrawler')
// import {logHTML} from "./scrawler.js";
const path = require('path')
const {writeFilePromise,parseEffects} = require("./scrawler")


describe("clean note", () => {

        const rawTrinkets = require(path.resolve(__dirname, 'trinkets_raw.json'))

        test("visually", () => {
            for (const trinket of rawTrinkets) {
                if (trinket.notes) {
                    console.log(cleanNotesHTML(trinket.notes))
                }

            }
        })


    }
)


test('logHTML function', () => {

    return logHTML("")
})


test('convert trinket name to image file name', () => {
    expect(getTrinketFilename('The Thot Slayer')).toBe('the_thot_slayer')
    expect(getTrinketFilename("Hunter's gun")).toBe('hunters_gun')
    expect(getTrinketFilename("\n<p>Severed Hand<img alt=\"Exclusive to The Shieldbreaker DLC\" src=\"https://gamepedia.cursecdn.com/darkestdungeon_gamepedia/thumb/7/76/Poptext_health_damage_block.png/20px-Poptext_health_damage_block.png?version=80b8ad49c017c2a55542d6fb957b079b\" decoding=\"async\" title=\"Exclusive to The Shieldbreaker DLC\" width=\"20\" height=\"20\" style=\"vertical-align: text-bottom\" srcset=\"https://gamepedia.cursecdn.com/darkestdungeon_gamepedia/thumb/7/76/Poptext_health_damage_block.png/30px-Poptext_health_damage_block.png?version=80b8ad49c017c2a55542d6fb957b079b 1.5x, https://gamepedia.cursecdn.com/darkestdungeon_gamepedia/thumb/7/76/Poptext_health_damage_block.png/40px-Poptext_health_damage_block.png?version=80b8ad49c017c2a55542d6fb957b079b 2x\">\n</p>\n")).toBe('severed_hand')

})

test('scrape', () => {
    return scrapeAsRawJSON()
})


test('download', () => {
    return downloadImages()
}, 100000)


test("normalize", () => {
    return generateNormalizedTrinketsJSON().then(
        normalizedTrinkets => {
            writeFilePromise(path.resolve(__dirname, "trinkets.json"), JSON.stringify(normalizedTrinkets))
            // for (let t of normalizedTrinkets){
            //     console.log(t)
            // }
        }
    )
})


test('parse effects', () => {
    return parseEffects()
})
