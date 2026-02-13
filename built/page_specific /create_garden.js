import { FOLIAGE_SPRITE_DATA, all_foliage } from "../data.js";
import { buildColorMessage, getSeedCollection, randomFromArray, randomValueFromObject, getGoodieCollection, getRandomKeyFromObj, claimCanvas, gen_toggle_button, gen_func_button, get_toggle_button_setting } from "../shared.js";
import { gen_plant, decode_plant_data, parse_plant_data, gen_named, getMainPaletteFromSeed, work_canvas_size } from "../gen_plant.js";
import { available_tileables, available_backgrounds, do_preload_initial, available_ground_base } from "../gen_garden.js";
import { CelestialLayer, GardenLayer } from "../garden_layers.js";
import { LayerManager, GardenLayerDiv, CelestialLayerDiv } from "../garden_ui.js";
var gl;
var da_canvas;
var gm;
var ready_to_random = false;
var randomizer_timeout_id;
var collection = getSeedCollection();
var activeGardenItem;
const pc_width = window.getComputedStyle(document.documentElement).getPropertyValue("--horiz-screen-cutoff");
const max_from_random_palette = 6;
const collection_by_main_color = function () {
    let by_color = {};
    for (const seedct in collection) {
        let data = decode_plant_data(collection[seedct]);
        let main = FOLIAGE_SPRITE_DATA[data["foliage"]]["m"];
        let palette;
        if (main == 0) {
            palette = data["foliage_palette"];
        }
        else if (main == 1) {
            palette = data["feature_palette"];
        }
        else {
            palette = data["accent_palette"];
        }
        if (Object.hasOwn(by_color, palette)) {
            by_color[palette].push(collection[seedct]);
        }
        else {
            by_color[palette] = [collection[seedct]];
        }
    }
    return by_color;
}();
async function do_stuff() {
    await do_preload_initial();
    da_canvas = document.getElementById("output_canvas");
    gm = new LayerManager(da_canvas, document.getElementById("seed_list"));
    gm.activeGardenChangedCallback = function () { gl = gm.activeGardenDiv.layer; rebuildPositionButtons(); };
    gm.toggleVisibility();
    gl = gm.activeGardenDiv.layer;
    document.getElementById("create_garden_organizer").appendChild(gm.selfDiv);
    // We need to pre-prime the ground canvas, since it and the seed list update independently
    await gl.updateGround();
    await gm.redraw();
    let options_parent = document.getElementById("garden_toggles_div");
    options_parent.appendChild(gen_toggle_button("outlines", gm.redraw, true));
    options_parent.appendChild(gen_toggle_button("palette lock", gm.redraw, false));
    options_parent.appendChild(gen_toggle_button("background lock", gm.redraw, false));
    const toggle_adjuster_menu = function () {
        let adjuster_div = document.getElementById("manual_seed_control_div");
        if (get_toggle_button_setting("plant adjuster")) {
            adjuster_div.style.display = "block";
        }
        else {
            adjuster_div.style.display = "none";
        }
    };
    options_parent.appendChild(gen_toggle_button("plant inspector", toggle_adjuster_menu, true));
    let utilities_parent = document.getElementById("garden_utilities_div");
    utilities_parent.appendChild(gen_func_button("SYNC SIZES", sync_sizes));
    // I'd like to do SOMETHING to indicate how to initially use the tool, but without it being obnoxious
    // for returning users.
    /*if(!document.getElementById("seed_list").value){
    document.getElementById("randomizer").classList.add("hint_glow");
    setTimeout(function(){document.getElementById("randomizer").classList.remove("hint_glow")}, 1000);
    }*/
    if (window.innerWidth <= pc_width) {
        toggleGardenSideMenu("right");
    }
}
async function load() {
    let modal = document.createElement("div");
    modal.classList.add("block_window");
    let modal_display = document.createElement("div");
    modal_display.classList.add("popup");
    document.body.appendChild(modal);
    let textbox = document.createElement("text");
    textbox.textContent = "Paste in the savedata for a garden (you get it on the claim screen):";
    let fillIn = document.createElement("input");
    let button_container = document.createElement("div");
    button_container.style.padding = "20px";
    let accept_button = document.createElement("input");
    let cancel_button = document.createElement("input");
    accept_button.type = "button";
    cancel_button.type = "button";
    accept_button.onclick = async function () {
        let json = JSON.parse(fillIn.value);
        await gm.loadFromSaveString(fillIn.value);
        document.getElementById("garden_height").value = json["h"];
        document.getElementById("garden_width").value = json["w"];
        document.getElementById("garden_scale").value = json["s"];
        document.body.removeChild(modal);
        await doThisRegen();
    };
    cancel_button.onclick = async function () {
        document.body.removeChild(modal);
    };
    accept_button.value = "Load";
    cancel_button.value = "Cancel";
    accept_button.classList.add("chunky_fullwidth");
    cancel_button.classList.add("chunky_fullwidth");
    button_container.appendChild(textbox);
    button_container.appendChild(fillIn);
    button_container.appendChild(document.createElement("br"));
    button_container.appendChild(document.createElement("br"));
    button_container.appendChild(accept_button);
    button_container.appendChild(cancel_button);
    modal_display.appendChild(button_container);
    modal.appendChild(modal_display);
}
function toggle_random() {
    let button = document.getElementById("randomizer");
    ready_to_random = !ready_to_random;
    button.value = ready_to_random ? ">Confirm?" : "Randomize";
}
async function sync_sizes() {
    // Error handling & setting params
    await doThisRegen();
    for (let id of Object.keys(gm.divToLayerMapper)) {
        let layerDiv = gm.divToLayerMapper[id];
        if (layerDiv.widthInput != undefined) {
            layerDiv.widthInput.value = gm.width;
            layerDiv.layer.setWidth(gm.width);
        }
        //if(layerDiv.scaleInput != undefined){ layerDiv.scaleInput.value = gm.scale; layerDiv.layer.setScale(gm.scale);}
    }
    // Refreshing
    await doThisRegen();
}
function apply_random_permutations_to_seed(seed) {
    if (Math.random() > 0.90) {
        seed += "%" + (Math.random() * 100 - 0.1).toFixed(1).toString();
    }
    if (Math.random() > 0.75) {
        seed += "<";
    }
    return seed;
}
async function random_from_collection() {
    if (!ready_to_random) {
        toggle_random();
        randomizer_timeout_id = setTimeout(toggle_random, 1000);
        return;
    }
    else {
        clearTimeout(randomizer_timeout_id);
        randomizer_timeout_id = setTimeout(toggle_random, 1000);
    }
    let chosen_seeds = [];
    let num_plants = Math.random() * (9 - 3) + 1;
    let matchColors = Math.random() < 0.9;
    let decorPaletteSeed;
    let groundPaletteSeed;
    let keep_last_palette = get_toggle_button_setting("palette lock") && gl.content.length > 0;
    // Logic for "matchy" colors
    if (keep_last_palette) {
        for (let i = 0; i < gl.content.length; i++) {
            if (gl.content[i].identity.startsWith("!")) {
                continue;
            }
            chosen_seeds.push(randomFromArray(collection_by_main_color[getMainPaletteFromSeed(gl.content[i].identity)]));
        }
        decorPaletteSeed = gl.content.length > 1 ? gl.content[1].identity.replace(/(?:%[\d .]*)?<?/g, '') : gl.groundPaletteSeed;
        groundPaletteSeed = gl.groundPaletteSeed;
    }
    else if (matchColors) {
        num_plants += Math.random() * 3;
        while (chosen_seeds.length < num_plants) {
            let choose_from = randomValueFromObject(collection_by_main_color);
            let num_choose = Math.min(max_from_random_palette, (Math.random() * choose_from.length + Math.min(2, choose_from.length / 2)) << 0);
            for (let i = 0; i < num_choose; i++) {
                chosen_seeds.push(randomFromArray(choose_from));
            }
        }
        if ((num_plants < 5 && Math.random() < 0.5) || (Math.random() < 0.1)) {
            if (Math.random() < 0.3) {
                chosen_seeds = chosen_seeds.concat(chosen_seeds).concat(chosen_seeds);
            }
            else {
                chosen_seeds = chosen_seeds.concat(chosen_seeds);
            }
        }
        decorPaletteSeed = chosen_seeds[0];
        groundPaletteSeed = chosen_seeds[1];
    }
    else {
        collection = getSeedCollection();
        decorPaletteSeed = collection[Math.floor(Math.random() * collection.length)];
        groundPaletteSeed = collection[Math.floor(Math.random() * collection.length)];
        chosen_seeds = [decorPaletteSeed, groundPaletteSeed];
        for (let i = 0; i < num_plants; i++) {
            let chosen_seed = collection[Math.floor(Math.random() * collection.length)];
            chosen_seeds.push(chosen_seed);
        }
    }
    let num_goodies = (Math.random() * 7 - 4) << 0;
    if (num_goodies > 0) {
        let goodies = getGoodieCollection();
        for (let i = 0; i < num_goodies; i++) {
            chosen_seeds.push("!" + randomFromArray(goodies));
        }
    }
    chosen_seeds = chosen_seeds.map(apply_random_permutations_to_seed);
    document.getElementById("seed_list").value = chosen_seeds.join(", ");
    if (get_toggle_button_setting("background lock")) {
        doThisRegen();
        return;
    }
    let target_width = document.getElementById("garden_width").value;
    gl.setWidth(target_width);
    gl.setHeight(da_canvas.height);
    gm.clearAllButActive();
    if (Math.random() < 0.8) {
        let skyPalette = getRandomKeyFromObj(available_backgrounds);
        gl.groundPaletteSeed = groundPaletteSeed;
        if (Math.random() < 0.3) {
            let foreFog = new CelestialLayer(target_width, da_canvas.height, 0, 0, "Fog", skyPalette, [], (Math.random() * 0.75 + 0.1).toFixed(2), 0);
            let foreFogDiv = new CelestialLayerDiv(foreFog, gm.get_id(), gm.updateCallback, gm.gardenToggleCallback);
            await gm.addLayerAndAnimate(foreFogDiv, false, true);
        }
        if (Math.random() < 0.2) {
            let foreSeeds = chosen_seeds.slice(chosen_seeds.length / 2);
            let foreGarden = new GardenLayer(target_width, da_canvas.height, -32, -30, foreSeeds.concat(foreSeeds), groundPaletteSeed, "grass [palette]", getRandomKeyFromObj(available_ground_base), 1.5);
            let foreGardenDiv = new GardenLayerDiv(foreGarden, gm.get_id(), gm.updateCallback, gm.gardenToggleCallback);
            await foreGarden.updateMain();
            await foreGarden.updateGround();
            await gm.addLayerAndAnimate(foreGardenDiv, false, true);
        }
        if (Math.random() < 0.92) {
            await gm.makeCelestialLayer(false, "Fog", skyPalette, (Math.random() * 0.5 + 0.2).toFixed(2));
        }
        if (Math.random() < 0.15) {
            let secondSeeds = chosen_seeds.slice(0, chosen_seeds.length / 2 << 0);
            let secondGarden = new GardenLayer(target_width, da_canvas.height, -32, da_canvas.height / 10 << 0, secondSeeds.concat(secondSeeds).concat(secondSeeds), groundPaletteSeed, "grass [palette]", getRandomKeyFromObj(available_ground_base), 1.5);
            let secondGardenDiv = new GardenLayerDiv(secondGarden, gm.get_id(), gm.updateCallback, gm.gardenToggleCallback);
            await secondGarden.updateMain();
            await secondGarden.updateGround();
            await gm.addLayerAndAnimate(secondGardenDiv, false);
        }
        if (Math.random() < 0.7) {
            await gm.makeDecorLayer(false, getRandomKeyFromObj(available_tileables), decorPaletteSeed);
        }
        if (Math.random() < 0.075) {
            // TO-DO: reimplements makeGardenLayer() just to get the y offset.
            let wallLayer = new GardenLayer(target_width, da_canvas.height, 0, da_canvas.height, [], groundPaletteSeed, "none", getRandomKeyFromObj(available_ground_base), 1);
            let wallLayerDiv = new GardenLayerDiv(wallLayer, gm.get_id(), gm.updateCallback, gm.gardenToggleCallback);
            await wallLayer.updateMain();
            await wallLayer.updateGround();
            await gm.addLayerAndAnimate(wallLayerDiv, false);
        }
        if (Math.random() < 0.25) {
            await gm.makeDecorLayer(false, getRandomKeyFromObj(available_tileables), decorPaletteSeed);
        }
        if (Math.random() < 0.60) {
            await gm.makeCelestialLayer(false, "Stars", skyPalette);
        }
        await gm.makeCelestialLayer(false, "Sky_Gradient", skyPalette);
    }
    doThisRegen();
}
async function doThisRegen() {
    // Make sure the user isn't trying to generate without an active garden layer
    let has_active = false;
    for (let i = gm.layerHolderDiv.children.length; i > 0; i--) {
        // TODO: right now we just free the layer. Should propagate the deletion fully to the manager.
        let layerDivObj = gm.divToLayerMapper[gm.layerHolderDiv.children[i - 1].id];
        if (!(layerDivObj.layer === undefined) && layerDivObj.layer.isActive) {
            has_active = true;
            break;
        }
    }
    if (!has_active) {
        alert("WARNING: No active garden layer! Click the star mark on one of the garden (green) layers. If you don't have any, click the green button in the top right.");
        return;
    }
    gl.draw_outline = get_toggle_button_setting("outlines");
    await gm.setHeight(parseInt(document.getElementById("garden_height").value));
    gm.setWidth(parseInt(document.getElementById("garden_width").value));
    gm.setScale(parseFloat(document.getElementById("garden_scale").value));
    gm.regenActiveGarden(document.getElementById("seed_list").value);
    rebuildPositionButtons();
}
function claim() {
    let new_window = claimCanvas(document.getElementById("output_canvas"));
    let garden_code_info = new_window.document.createElement('p');
    garden_code_info.innerHTML = "Garden code: ";
    let garden_code = new_window.document.createElement('p');
    garden_code.innerHTML = gm.getSaveString();
    new_window.document.body.appendChild(garden_code_info);
    new_window.document.body.appendChild(garden_code);
}
async function rebuildPositionButtons() {
    let position_buttons = await Promise.all(gl.content.map(async (gardenitem, idx) => { return create_manip_entry(idx, gardenitem, false, false); }));
    document.getElementById("seed_positioning_grid_div").replaceChildren(...position_buttons);
    activeGardenItem = gl.content[0];
    showManipMenu();
}
function togglePositionFixed() {
    let pos_fixed = document.getElementById('seed_positioning_fixed').checked;
    activeGardenItem.offsetSpecified = pos_fixed;
    document.getElementById("seed_positioning_offset").disabled = !pos_fixed;
    document.getElementById("seed_list").value = gl.content.map((entry) => { return entry.getSeed(false); });
    showManipMenu();
}
async function togglePositionFlipped() {
    activeGardenItem.isFlipped = document.getElementById('seed_positioning_flip_check').checked;
    activeGardenItem.flipCanvas();
    await gl.updateMain();
    gm.redraw();
    document.getElementById("seed_list").value = gl.content.map((entry) => { return entry.getSeed(false); });
    showManipMenu();
}
async function setPositionFixed() {
    activeGardenItem.offset = document.getElementById("seed_positioning_offset").value / 100;
    await gl.updateMain();
    gm.redraw();
    document.getElementById("seed_list").value = gl.content.map((entry) => { return entry.getSeed(false); });
    showManipMenu();
}
async function showManipMenu() {
    if (!activeGardenItem) {
        return;
    }
    let seed = activeGardenItem.identity;
    let cleaned_seed = seed.replace(/(?:%[\d .]*)?<?/g, '');
    let raw_plant_data = decode_plant_data(cleaned_seed);
    let plant_data = parse_plant_data(raw_plant_data);
    // Draw infobox
    let scaleCanvas = document.getElementById("seed_positioning_canvas");
    let info_canvas;
    if (seed.startsWith("!")) {
        document.getElementById("seed_positioning_desc").innerHTML = activeGardenItem.getSeed() + "<br>";
        info_canvas = gen_named(seed.slice(1));
    }
    else {
        document.getElementById("seed_positioning_desc").innerHTML = activeGardenItem.getSeed() + ", " + all_foliage[plant_data["foliage"]]["name"] + "<br>" + buildColorMessage(raw_plant_data, false);
        info_canvas = gen_plant(decode_plant_data(seed), true);
    }
    let scaleCtx = scaleCanvas.getContext("2d");
    scaleCanvas.width = 128;
    scaleCanvas.height = 128;
    let draw_callback = async () => { scaleCtx.clearRect(0, 0, 128, 128); scaleCtx.imageSmoothingEnabled = false; scaleCtx.drawImage(await info_canvas, 0, 0, 128, 128); };
    await draw_callback();
    // Draw controls
    document.getElementById("seed_positioning_offset").value = activeGardenItem.offset * 100;
    document.getElementById("seed_positioning_flip_check").checked = activeGardenItem.isFlipped;
    document.getElementById("seed_positioning_fixed").checked = activeGardenItem.offsetSpecified;
    // html radiobutton jank
    document.getElementById("seed_positioning_random").checked = !activeGardenItem.offsetSpecified;
    document.getElementById("seed_positioning_offset").disabled = !activeGardenItem.offsetSpecified;
    document.getElementById("seed_positioning_menu_div").style.display = "inline-block";
}
async function create_manip_entry(offset, gardenitem) {
    let id = "manip_select_" + offset;
    let entry = document.createElement('div');
    entry.id = id;
    entry.className = 'collection_box';
    entry.onclick = function (e) { activeGardenItem = gardenitem; showManipMenu(e); };
    var scale_canvas = document.createElement("canvas");
    let final_size = work_canvas_size * 2;
    scale_canvas.width = final_size;
    scale_canvas.height = final_size;
    var scale_ctx = scale_canvas.getContext("2d");
    scale_ctx.imageSmoothingEnabled = false;
    // Strip any positional info
    let seed = gardenitem.identity.replace(/(?:%[\d .]*)?<?/g, '');
    if (seed.startsWith("!")) {
        let normalization_canvas = await gen_named(seed.slice(1));
        scale_ctx.drawImage(normalization_canvas, 0, 0, final_size, final_size);
    }
    else {
        if (seed.length != 10) {
            alert("You seem to have a malformed seed! Seeds are 10 characters long, but got \"" + seed + "\". Skipping!");
        }
        else {
            //var plant_canvas = await gardenitem.canvas;
            scale_ctx.drawImage(await gardenitem.canvas, 0, 0, final_size, final_size);
        }
    }
    entry.style.background = 'url(' + scale_canvas.toDataURL() + ')  no-repeat bottom center';
    return entry;
}
function toggleGardenSideMenu(side = "left") {
    let targets = ["toggle_left_menu", "garden_options_menu"];
    if (side == "right") {
        targets = ["toggle_right_menu", "layer_manager"];
    }
    let clicked = document.getElementById(targets[0]);
    let state = side == "left" ? clicked.innerText.slice(3, 7) : clicked.innerText.slice(0, 4);
    let new_state = state == "hide" ? "show" : "hide";
    clicked.innerText = side == "left" ? clicked.innerText.slice(0, 3) + new_state + clicked.innerText.slice(7) : new_state + clicked.innerText.slice(4);
    let margin_trait = side === "left" ? "marginLeft" : "marginRight";
    if (state == "hide") {
        document.getElementById(targets[1]).style[margin_trait] = "-26em";
        document.getElementById(targets[1]).style.opacity = 0;
    }
    else {
        document.getElementById(targets[1]).style[margin_trait] = "0em";
        document.getElementById(targets[1]).style.opacity = 1;
    }
}
do_stuff();
document.getElementById("seed_positioning_offset").onpointerup = setPositionFixed;
document.getElementById("randomizer").onclick = random_from_collection;
document.getElementById("loader").onclick = load;
document.getElementById("regenerator").onclick = doThisRegen;
document.getElementById("claimer").onclick = claim;
document.getElementById("seed_positioning_flip_check").onclick = togglePositionFlipped;
document.getElementById("seed_positioning_random").onclick = togglePositionFixed;
document.getElementById("seed_positioning_fixed").onclick = togglePositionFixed;
document.getElementById("toggle_left_menu").onclick = () => { toggleGardenSideMenu("left"); };
document.getElementById("toggle_right_menu").onclick = () => { toggleGardenSideMenu("right"); };
document.getElementById("garden_options_menu").style.display = "none";
toggleGardenSideMenu("left");
setTimeout(() => { document.getElementById("garden_options_menu").style.display = "block"; }, 10);
