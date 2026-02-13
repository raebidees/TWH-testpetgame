import { WORLD, BACKDROPS, ITEMS } from "../wander_data.js";
import { refs, preload_single_image, imageFromPopup } from "../image_handling.js";
import { randomFromArray } from "../shared.js";
import { do_preload_initial } from "../gen_garden.js";
import { LayerManager } from "../garden_ui.js";
var gl;
var da_canvas;
var gm;
var world_region = "The Green Forever";
var super_region = "Root Maze";
var region = "Overgrown Root Tunnels";
var scene = "entry cavern";
var wanderables = [];
var last_wandered = ""; // Stop wandering to the same place twice in a row!
var backdrop;
var inventory = { "health": 100 };
var titles = {};
var player = "*player";
var replaces = {
    "$THEY": "they",
    "$THEIR": "their",
    "$THEM": "them",
    "$DIALOGTHEY": "they",
    "$DIALOGTHEIR": "their",
    "$DIALOGTHEM": "them",
    "$PLAYER": "Capensia",
    "$NAME": "Capensia",
    "$PLURAL": "",
    "$PLURALES": "",
    "$PLURALPLAYER": "",
};
const fields = [["<br>Name: ", "playername", "Muri"], ["<br>Pronouns: ", "playerthey", "they"], ["/", "playerthem", "them"], ["/", "playertheir", "their"]];
const test_sentence = "Test sentence: $PLAYER know$PLURALPLAYER $THEY will be meeting $THEIR friend Claudia later, so $THEY grab$PLURAL the cute hat she knit for $THEM; \"$NAME\" is stitched onto it. Hat in hand, $THEY head$PLURAL out the door.";
const makeSubstitutions = (s) => {
    return s.replace(/\$[A-Z]*/g, m => replaces[m]).replace(/\b\w/, (m) => m.toUpperCase());
};
const getRegion = function () {
    if (super_region === null) {
        return WORLD[world_region];
    }
    else if (region === null) {
        return WORLD[world_region]["REGIONS"][super_region];
    }
    return WORLD[world_region]["REGIONS"][super_region]["REGIONS"][region];
};
const getScreenData = function () {
    return getRegion()["SCENES"][scene];
};
function changeRegion() {
    wanderables = [];
    let get_wanderable = (name, scene) => { if (Object.hasOwn(scene, "wanderable") && scene["wanderable"] == true) {
        wanderables.push(name);
    } };
    if (super_region === null) {
        Object.entries(WORLD[world_region]["SCENES"]).forEach((entry) => get_wanderable(...entry));
    }
    else if (region === null) {
        Object.entries(WORLD[world_region]["REGIONS"][super_region]["SCENES"]).forEach((entry) => get_wanderable(...entry));
    }
    else {
        Object.entries(WORLD[world_region]["REGIONS"][super_region]["REGIONS"][region]["SCENES"]).forEach((entry) => get_wanderable(...entry));
    }
}
function createGrammarField(parent, labelname, fieldname, defaultfield) {
    let fillIn = document.createElement("input");
    fillIn.className = "garden-dim-bar";
    fillIn.id = fieldname + "_field";
    fillIn.value = defaultfield;
    let label = document.createElement("label");
    label.setAttribute("for", fillIn.id);
    label.innerHTML = labelname;
    fillIn.onchange = updateGrammarTest;
    parent.appendChild(label);
    parent.appendChild(fillIn);
}
function createChoiceField(parent, labelname, fieldname, choices, callback) {
    let label = document.createElement("label");
    label.innerHTML = labelname;
    parent.appendChild(label);
    let field;
    for (let i = 0; i < choices.length; i++) {
        label = document.createElement("label");
        label.innerHTML = choices[i];
        field = document.createElement("input");
        field.setAttribute("type", "radio");
        field.setAttribute("value", choices[i]);
        field.setAttribute("id", fieldname + "_field_" + i);
        field.setAttribute("name", fieldname);
        field.onchange = callback;
        label.setAttribute("for", fieldname + "_field_" + i);
        if (i === choices.length - 1) {
            field.setAttribute("checked", "checked");
        }
        parent.appendChild(label);
        parent.appendChild(field);
    }
}
async function updateImage() {
    let current_canvas = await refs["*player_wildcard_data_url"];
    let flip_canvas = document.createElement("canvas");
    flip_canvas.width = current_canvas.width;
    flip_canvas.height = current_canvas.height;
    let ctx = flip_canvas.getContext("2d");
    ctx.setTransform(-1, 0, 0, 1, current_canvas.width, 0);
    ctx.drawImage(current_canvas, 0, 0);
    refs["*player_wildcard_data_url"] = preload_single_image(flip_canvas.toDataURL());
}
function updateGrammarTest() {
    replaces["$DIALOGTHEY"] = document.getElementById("playerthey_field").value;
    replaces["$DIALOGTHEM"] = document.getElementById("playerthem_field").value;
    replaces["$DIALOGTHEIR"] = document.getElementById("playertheir_field").value;
    replaces["$NAME"] = document.getElementById("playername_field").value;
    const pronounsplural = document.getElementById("pronounsplural_field_1").checked;
    if (pronounsplural) {
        replaces["$PLURAL"] = "";
        replaces["$PLURALES"] = "";
    }
    else {
        replaces["$PLURAL"] = "s";
        replaces["$PLURALES"] = "es";
    }
    const secondperson = document.getElementById("person_field_0").checked;
    if (secondperson) {
        replaces["$THEY"] = "you";
        replaces["$THEM"] = "you";
        replaces["$THEIR"] = "your";
        replaces["$PLURAL"] = "";
        replaces["$PLURALES"] = "";
        replaces["$PLURALPLAYER"] = "";
        replaces["$PLAYER"] = "you";
    }
    else {
        replaces["$THEY"] = replaces["$DIALOGTHEY"];
        replaces["$THEM"] = replaces["$DIALOGTHEM"];
        replaces["$THEIR"] = replaces["$DIALOGTHEIR"];
        replaces["$PLURALPLAYER"] = "s";
        replaces["$PLAYER"] = replaces["$NAME"];
    }
    let field = document.getElementById("test_string");
    field.innerHTML = makeSubstitutions(test_sentence);
}
async function createCharacter() {
    let form = await imageFromPopup(document.body, "*player", () => { });
    form.removeChild(form.lastChild);
    let grammarDiv = document.createElement("div");
    createChoiceField(grammarDiv, "The sprite is facing: ", "facing", ["Left", " Right"], updateImage);
    for (let i = 0; i < fields.length; i++) {
        createGrammarField(grammarDiv, fields[i][0], fields[i][1], fields[i][2]);
    }
    createChoiceField(grammarDiv, "<br>Pronouns are: ", "pronounsplural", ["singular", "plural"], updateGrammarTest);
    createChoiceField(grammarDiv, "<br>Mode of address: ", "person", ["2nd person", " 3rd person"], updateGrammarTest);
    let test_field = document.createElement("p");
    test_field.innerHTML = test_sentence;
    test_field.id = "test_string";
    grammarDiv.appendChild(test_field);
    form.appendChild(grammarDiv);
    updateGrammarTest();
    let confirm_button = document.createElement("input");
    confirm_button.type = "button";
    confirm_button.value = "Start the Adventure";
    confirm_button.style.width = "auto";
    confirm_button.addEventListener("click", function () {
        if (refs["*player_wildcard_data_url"] === undefined) {
            alert("You need to provide a sprite!");
            return;
        }
        document.body.removeChild(form);
        do_remaining_stuff();
    });
    form.appendChild(confirm_button);
}
function do_stuff() {
    createCharacter();
    do_preload_initial();
}
async function do_remaining_stuff() {
    // We rely on as much of the create_garden stuff as we can, even if that means a little hackery.
    da_canvas = document.getElementById("output_canvas");
    gm = new LayerManager(da_canvas, document.getElementById("seed_list"));
    gm.setWidth(500);
    gm.setHeight(100);
    gm.setScale(2);
    gl = gm.activeGardenDiv.layer;
    gl.groundCover = "none";
    document.getElementById("create_garden_organizer").appendChild(gm.selfDiv);
    await loadScene();
    changeRegion();
    document.getElementById("layer_manager").style.display = "none";
    updateTitles();
    updateInventory();
}
do_stuff();
function loadScene(force_set_dims = false) {
    let scene_data = getScreenData();
    document.getElementById("scene_description").innerHTML = makeSubstitutions(scene_data["text"] instanceof Array ? randomFromArray(scene_data["text"]) : scene_data["text"]);
    let choices = [];
    let new_choice;
    for (let i = 0; i < scene_data["choices"].length; i++) {
        new_choice = buildChoice(scene_data["choices"][i]);
        if (new_choice === null) {
            continue;
        }
        choices.push(new_choice);
    }
    if (Object.hasOwn(scene_data, "gives")) {
        scene_data["gives"].forEach((x) => addToInventory(x));
    }
    document.getElementById("choices").replaceChildren(...choices);
    backdrop = scene_data["backdrop"] instanceof Array ? randomFromArray(scene_data["backdrop"]) : scene_data["backdrop"];
    if (backdrop === "$UNCHANGED") {
        return;
    }
    let savestring = JSON.stringify(BACKDROPS[backdrop]);
    // Doing the above is our cheap lazy deep copy for this case...
    if (Object.hasOwn(scene_data, "player_pos")) {
        let player_pos = scene_data["player_pos"][0] instanceof Array ? randomFromArray(scene_data["player_pos"]) : scene_data["player_pos"];
        let mod_obj = JSON.parse(savestring);
        let garden_layer = 0;
        for (let i = 0; i < mod_obj["layers"].length; i++) {
            if (mod_obj["layers"][i]["type"] == 1) {
                garden_layer++;
            }
            if (garden_layer === player_pos[1]) {
                mod_obj["layers"][i]["seeds"].unshift(player + player_pos[0]);
                break;
            }
        }
        savestring = JSON.stringify(mod_obj);
    }
    gm.loadFromSaveString(savestring).then(async () => {
        if (!force_set_dims) {
            let redraw = false;
            if (gm.scale != BACKDROPS[backdrop]["s"]) {
                gm.setScale(BACKDROPS[backdrop]["s"]);
                redraw = true;
            }
            if (gm.width != BACKDROPS[backdrop]["w"]) {
                gm.setWidth(BACKDROPS[backdrop]["w"]);
                await gl.updateGround();
                redraw = true;
            }
            if (gm.height != BACKDROPS[backdrop]["h"]) {
                await gm.setHeight(BACKDROPS[backdrop]["h"]);
                redraw = true;
            }
            if (redraw) {
                gm.redraw();
            }
        }
        else {
            gm.setWidth(BACKDROPS[backdrop]["w"]);
            gm.setScale(BACKDROPS[backdrop]["s"]);
            await gl.updateGround();
            await gm.setHeight(BACKDROPS[backdrop]["h"]);
            gm.redraw();
        }
    });
}
// Helper function, tests whether the inventory contains the named item at the amount required
// Takes an entry from one of choice's relevant fields: needs, consumes, etc.
function inventoryHas(entry) {
    return Object.hasOwn(inventory, entry[0]) && inventory[entry[0]] >= entry[1];
}
function updateTitles() {
    document.getElementById("player_title").innerHTML = [replaces["$NAME"]].concat(Object.keys(titles)).join(", ");
}
function updateInventory() {
    let string = "";
    for (let [key, val] of Object.entries(inventory)) {
        if (Object.hasOwn(ITEMS, key)) {
            string += ITEMS[key]["name"] + ": " + val + "<br>";
        }
    }
    document.getElementById("inventory").innerHTML = string;
}
function addToInventory(entry, is_title = false, remove_instead = false) {
    let inv = is_title ? titles : inventory;
    entry[1] = remove_instead ? entry[1] * -1 : entry[1];
    if (Object.hasOwn(inv, entry[0])) {
        inv[entry[0]] += entry[1];
    }
    else {
        inv[entry[0]] = entry[1];
    }
    if (is_title) {
        updateTitles();
    }
    else {
        updateInventory();
    }
    if (remove_instead && inv[entry[0]] === 0) {
        delete inv[entry[0]];
    }
}
function buildChoice(choice) {
    // First, figure out if this choice is selectable
    let is_selectable = true;
    if (Object.hasOwn(choice, "chance") && choice["chance"] < Math.random()) {
        is_selectable = false;
    }
    else {
        let invert = false;
        const to_check = ["needs", "consumes", "blocked by"];
        for (let i = 0; i < to_check.length; i++) {
            if (!is_selectable || !Object.hasOwn(choice, to_check[i])) {
                continue;
            }
            invert = to_check[i] === "blocked by";
            for (let j = 0; j < choice[to_check[i]].length; j++) {
                // invert functioning as a xor
                if (invert != !inventoryHas(choice[to_check[i]][j])) {
                    is_selectable = false;
                    break;
                }
            }
        }
    }
    if (choice["hidden"] && !is_selectable) {
        return null;
    }
    let new_choice = document.createElement("button");
    new_choice.type = "button";
    new_choice.classList.add("wander_choice");
    new_choice.innerHTML = makeSubstitutions(choice["text"]);
    new_choice.disabled = !is_selectable;
    if (is_selectable) {
        new_choice.onclick = async function () { await processChoice(choice); }.bind(choice);
    }
    return new_choice;
}
async function processChoice(choice) {
    scene = choice["goto"] instanceof Array ? randomFromArray(choice["goto"]) : choice["goto"];
    if (scene === "$WANDERABLE") {
        scene = randomFromArray(wanderables);
        // Just roll twice I guess. I'm considering a better overall solution than last_wandered anyways.
        scene = scene === last_wandered ? randomFromArray(wanderables) : scene;
        scene = scene === last_wandered ? randomFromArray(wanderables) : scene;
        last_wandered = scene;
    }
    if (Object.hasOwn(choice, "gives")) {
        choice["gives"].forEach((x) => addToInventory(x));
    }
    if (Object.hasOwn(choice, "consumes")) {
        choice["consumes"].forEach((x) => addToInventory(x, false, true));
    }
    if (Object.hasOwn(choice, "title")) {
        addToInventory([choice["title"], 1], true);
    }
    if (Object.hasOwn(choice, "after")) {
        getRegion()["SCENES"]["$AFTER"] = { "text": choice["after"], "choices": [{ "text": "Continue", "goto": choice["goto"] }], "backdrop": "$UNCHANGED" };
        scene = "$AFTER";
    }
    await loadScene(true);
}
