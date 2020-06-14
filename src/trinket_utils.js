/**
 *
 * @enum {string}
 */
const DLC = {
    CC: "Crimson Court",
    COM: "Color of Madness",
    BC: "Butcher's Circus"
}




const effectDisplayNameToPropName = {
    "ACC": "ACC",
    "SPD": "SPD",
    "Bleed Resist": "bleedResist",
    "DODGE": "dodge",
    "Bleed Skill Chance": "bleedSkillChance",
    "Blight Resist": "blightResist",
    "Blight Skill Chance": "blightSkillChance",
    "CRIT":"CRIT",
    "Debuff Resist":"debuffResist",
    "Debuff Skill Chance": "debuffSkillChance",
    "Disease Resist": "diseaseResist",
    "MAX HP": "maxHP",
    "Move Resist": "moveResist",
    "Move Skill Chance": "moveSkillChance",
    "PROT": "PROT",
    "Stun Resist": "stunResist",
    "Chance Party Surprised": "chancePartySurprised",
    "Scouting Chance": "scoutingChance",
    "on First Round": "firstRound",
    "HP Above": "HPAbove",
    "HP Below": "HPBelow",
    "Torch Above": "torchAbove",
    "Torch Below": "torchBelow"



}

class ParsedEffects {
    /**
     *
     * @param acc {?Number}
     */
    constructor(acc) {

    }

    static displayNameToPropName(displayName) {
        switch (displayName) {
            case "ACC":
                return "acc"
            case "SPD":
                return "spd"
            case "Bleed Resist":
                return "bleedResist"

        }
    }
}

class Trinket {
    /**
     *
     * @param imageURL {String}
     * @param name {String}
     * @param raritySpan {String} span with raritySpan color hardcoded inside style
     * @param origin {!String}
     * @param effectsLi {Array<String>} .html() of each li
     * @param restriction {!String}
     * @param notes {!String}
     * @param dlc {!DLC}
     * @param quoteFont {?String} <font> HTML with color
     * @param setEffectsLi {?Array<String>}
     * @param shardCost {?String}
     * @param prestige {?String}
     */
    constructor(imageURL, name, raritySpan, origin, effectsLi, restriction, notes, dlc, quoteFont, setEffectsLi, shardCost, prestige) {
        this.image = imageURL
        this.name = name
        this.raritySpan = raritySpan
        this.origin = origin
        this.effectsLi = effectsLi
        this.restriction = restriction
        this.notes = notes
        this.dlc = dlc
        this.quoteFont = quoteFont
        this.setEffectsLi = setEffectsLi
        this.shardCost = shardCost
        this.prestige = prestige
    }

    /**
     * @return {Object}
     */
    displayForm() {
        const newObject = {...this}
        newObject.image = `<img data-src="${this.image}"  alt="${this.name}">`
        newObject.effectsLi = '<ul>' + this.effectsLi.map(v => `<li>${v}</li>`).join('') + '</ul>'
        if ((this.dlc === DLC.CC || this.restriction === "Shieldbreaker") && !this.raritySpan) {
            newObject.raritySpan = "<span style=\"color:#b11900\">Crimson Court</span>"
        }
        if (! newObject.raritySpan){
            newObject.raritySpan = " "
        }
        if (this.setEffectsLi) {
            newObject.setEffectsLi = '<ul>' + this.setEffectsLi.map(v => `<li>${v}</li>`).join('') + '</ul>'
        }

        return newObject
    }
}



const sortCriteria = ["ACC", "SPD", "Bleed Resist", "DODGE",
    "Bleed Skill Chance", "Blight Resist", "CRIT",
    "Debuff Resist", "Debuff Skill Chance", "Disease Resist",
    "MAX HP", "Move Resist", "Move Skill Chance", "PROT", "Stun Resist", "Chance Party Surprised", "Scouting Chance", "Blight Skill Chance",
    "Stun Skill Chance", "DMG", "Stress", "Trap Disarm Chance", "Food Consumed", "Healing Received", "Death Blow Resist", "Healing Skills", "Virtue Chance",
    "Chance Monsters Surprised", "Resolve XP", "Healing when Eating", "Random Target Chance", "Shards Given", "Guard Duration", "Damage Reflection",
    "Blight Duration", "Death Blow Dealt Chance", "Restoration Duration", "Horror Duration", "Inflict Stress", "Armor Piercing"].map(v => titleCase(v))


function titleCase(str) {
    // Step 1. Lowercase the string
    str = str.toLowerCase()
    // str = "I'm a little tea pot".toLowerCase();
    // str = "i'm a little tea pot";

    // Step 2. Split the string into an array of strings
    str = str.split(' ')
    // str = "i'm a little tea pot".split(' ');
    // str = ["i'm", "a", "little", "tea", "pot"];

    // Step 3. Create the FOR loop
    for (let i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1)
        /* Here str.length = 5
          1st iteration: str[0] = str[0].charAt(0).toUpperCase() + str[0].slice(1);
                         str[0] = "i'm".charAt(0).toUpperCase()  + "i'm".slice(1);
                         str[0] = "I"                            + "'m";
                         str[0] = "I'm";
          2nd iteration: str[1] = str[1].charAt(0).toUpperCase() + str[1].slice(1);
                         str[1] = "a".charAt(0).toUpperCase()    + "a".slice(1);
                         str[1] = "A"                            + "";
                         str[1] = "A";
          3rd iteration: str[2] = str[2].charAt(0).toUpperCase()   + str[2].slice(1);
                         str[2] = "little".charAt(0).toUpperCase() + "little".slice(1);
                         str[2] = "L"                              + "ittle";
                         str[2] = "Little";
          4th iteration: str[3] = str[3].charAt(0).toUpperCase() + str[3].slice(1);
                         str[3] = "tea".charAt(0).toUpperCase()  + "tea".slice(1);
                         str[3] = "T"                            + "ea";
                         str[3] = "Tea";
          5th iteration: str[4] = str[4].charAt(0).toUpperCase() + str[4].slice(1);
                         str[4] = "pot".charAt(0).toUpperCase() + "pot".slice(1);
                         str[4] = "P"                           + "ot";
                         str[4] = "Pot";
          End of the FOR Loop*/
    }

    // Step 4. Return the output
    return str.join(' ') // ["I'm", "A", "Little", "Tea", "Pot"].join(' ') => "I'm A Little Tea Pot"
}

module.exports = {Trinket, DLC, sortCriteria, titleCase}