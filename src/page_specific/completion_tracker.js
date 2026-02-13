
import { getSeedCollection, getMarkedBases, getMarkedPalettes, buildColorMessage, getGoodieCollection, collectGoodie, getOffsetColor } from "../shared.js";
import { decode_plant_data, foliage_by_category, palettes_by_category, overall_palette, gen_plant_data, encode_plant_data_v2, gen_named, drawPlantForSquare } from "../gen_plant.js";
import { PALETTE_PREVIEW_IMG, all_palettes, reformatted_named, QUESTION_IMG } from "../data.js";
import { replace_color_palette } from "../image_handling.js";

let marking_bases = false;
let marking_palettes = false;
let marked_bases = getMarkedBases();
let marked_palettes = getMarkedPalettes();
let owned_bases = new Set();
let owned_palettes = new Set();
let seed_list = getSeedCollection();
let goodie_collection = new Set(getGoodieCollection());
const base_help_text = "View the bases you've discovered! Reroll to see a new color scheme drawn from palettes you've discovered.";
const palette_help_text = "View the palettes you've discovered! Click them to build a palette for the base viewer. Click Mark then a palette to toggle a square mark on bingo/swap/etc seeds using that palette.";
const marker_help_text = "You've entered Marking Mode! Any palette clicked will get a colored border; a little marker in this color will appear on an earnable plant that contains that palette. Use this to find plants with palettes you want to collect! Click a palette again to deselect it. Click the button again to exit marking mode and return to palette select mode.";

for (let seed of seed_list) {
    let seed_data = decode_plant_data(seed);
    owned_bases.add(seed_data["foliage"]);
    owned_palettes.add(seed_data["foliage_palette"]);
    owned_palettes.add(seed_data["feature_palette"]);
    owned_palettes.add(seed_data["accent_palette"]);
}
let selected_palettes = [0, 20, 19];
let owned_palettes_list = Array.from(owned_palettes);

function randomizeSelectedPalettes() {
    if (owned_palettes_list.length == 0) { return; }
    selected_palettes[0] = owned_palettes_list[Math.floor(Math.random() * owned_palettes_list.length)];
    selected_palettes[1] = owned_palettes_list[Math.floor(Math.random() * owned_palettes_list.length)];
    selected_palettes[2] = owned_palettes_list[Math.floor(Math.random() * owned_palettes_list.length)];
}
randomizeSelectedPalettes();

function gen_base_divs(reroll_palettes = false) {
    if (reroll_palettes) {
        randomizeSelectedPalettes();
    }
    let parent = document.getElementById("base_content_div");
    parent.innerHTML = "";
    // We want to ensure that "rare" comes last
    let categories = Object.keys(foliage_by_category);
    categories.splice(categories.indexOf("rare"), 1);
    categories.push("rare");
    for (let category of categories) {
        let new_row = document.createElement('div');
        let row_heading = document.createElement('h3');
        new_row.className = "collection_display";
        row_heading.textContent = category;
        parent.appendChild(row_heading);
        parent.appendChild(new_row);
        for (let j = 0; j < foliage_by_category[category].length; j++) {
            let id = category + "_" + j;
            add_swap_square(new_row, j, id, foliage_by_category[category][j]);
        }
    }
    drawPalettePreview("palette_canvas");
}

function drawPalettePreview(id) {
    let canvas = document.getElementById(id);
    let ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = PALETTE_PREVIEW_IMG;
    img.crossOrigin = "anonymous"
    img.onload = function () {
        ctx.imageSmoothingEnabled = false
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        var new_overall_palette = all_palettes[selected_palettes[0]]["palette"].concat(all_palettes[selected_palettes[2]]["palette"]).concat(all_palettes[selected_palettes[1]]["palette"]);
        replace_color_palette(overall_palette, new_overall_palette, ctx, 128, 96);
        ctx.scale(0.5, 0.5);
    };
    document.getElementById("base_text").innerHTML = getMarkerDescText(base_help_text);
    document.getElementById("palette_text").innerHTML = getMarkerDescText(palette_help_text);
}

function getMarkerDescText(base_text) {
    return base_text + "<br><br>Palette: " + buildColorMessage({ "foliage": 1, "foliage_palette": selected_palettes[0], "feature_palette": selected_palettes[1], "accent_palette": selected_palettes[2] }, false);
}


function mark(is_bases) {
    let target = is_bases ? document.getElementById("mark_bases") : document.getElementById("mark_palettes");
    const sentinel = is_bases ? marking_bases : marking_palettes;
    target.value = sentinel ? "Mark" : "Stop Marking";
    document.getElementById("palette_text").innerHTML = sentinel ? palette_help_text : marker_help_text;
    if (is_bases) { marking_bases = !sentinel; } else { marking_palettes = !sentinel; }
}


function gen_palette_divs() {
    let parent = document.getElementById("palette_content_div");
    parent.innerHTML = '';
    for (let category of Object.keys(palettes_by_category)) {
        let new_row = document.createElement('div');
        let row_heading = document.createElement('h3');
        new_row.className = "collection_display";
        new_row.style.gridTemplateColumns = "repeat(auto-fill, minmax(100px, max-content))";
        row_heading.textContent = category;
        parent.appendChild(row_heading);
        parent.appendChild(new_row);
        for (let i = 0; i < palettes_by_category[category].length; i++) {
            //let palette = all_palettes[horrid_list[i][1]]["palette"];
            let palette_redirect = palettes_by_category[category][i];
            addPalette(new_row, palette_redirect);
        }
        drawPalettePreview("palette_canvas_2");
    }
}


function gen_goodie_divs() {
    let parent = document.getElementById("goodie_content_div");
    parent.innerHTML = '';
    let completion_row = document.createElement('div');
    completion_row.className = "collection_display";
    completion_row.style.gridTemplateColumns = "repeat(auto-fill, minmax(100px, max-content))";

    let buy_row = document.createElement('div');
    buy_row.className = "collection_display";
    buy_row.style.gridTemplateColumns = "repeat(auto-fill, minmax(100px, max-content))";

    let buy_explanation = document.createElement('h3');
    buy_explanation.innerHTML = "Items below this text can be bought, and don't count towards completion percentage"

    let completion = new Set();
    let buy = new Set();
    for (let name of Object.keys(reformatted_named)) {
        if (Object.hasOwn(reformatted_named[name], "earn")) {
            completion.add(name);
        } else if (Object.hasOwn(reformatted_named[name], "buy")) {
            buy.add(name);
        }
    }

    parent.appendChild(completion_row);
    parent.appendChild(buy_explanation);
    parent.appendChild(buy_row);
    for (let name of completion) {
        add_goodie_square(completion_row, name);
    }
    for (let name of buy) {
        add_goodie_square(buy_row, name);
    }
}

// Largely similar to bingo squares
function add_swap_square(parent, column_offset, id, base_to_use) {
    let swap_square = document.createElement('div');
    swap_square.id = id;
    swap_square.className = 'plant_box_nohover';
    let border_offset = marked_bases.indexOf(id);
    swap_square.style.borderColor = border_offset == -1 ? "transparent" : getOffsetColor(border_offset);
    swap_square.style.borderWidth = "thick";
    let plant_data = gen_plant_data(0);
    let data_url = QUESTION_IMG;
    if (owned_bases.has(base_to_use)) {
        plant_data["foliage"] = base_to_use;
        plant_data["foliage_palette"] = selected_palettes[0];
        plant_data["feature_palette"] = selected_palettes[1];
        plant_data["accent_palette"] = selected_palettes[2];
        let seed = encode_plant_data_v2(plant_data);
        data_url = drawPlantForSquare(seed, swap_square.width, false);
    }
    swap_square.style.background = 'url(' + data_url + ')  no-repeat center center';
    swap_square.onclick = function () {
        if (marking_bases) {
            let was_marked = swapIsMarked(base_to_use, marked_bases);
            swap_square.style.borderColor = was_marked ? "transparent" : getOffsetColor(marked_bases.indexOf(base_to_use));
            alert(marked_bases.toString());
            localStorage.marked_bases = marked_bases.toString();
            alert(localStorage.marked_bases);
        } else if(!owned_bases.has(base_to_use)){
            //swap_square.style.transition = "none";
            swap_square.style.transition = "opacity 1s ease-in-out";
            swap_square.style.filter = "contrast(0%) opacity(50%)";
            swap_square.style.opacity = "0";
            setTimeout(
            ()=>{
                let plant_data = gen_plant_data(0);
                plant_data["foliage"] = base_to_use;
                plant_data["foliage_palette"] = 135;
                plant_data["feature_palette"] = 135;
                plant_data["accent_palette"] = 135;
                let seed = encode_plant_data_v2(plant_data);
                let shadow_url = drawPlantForSquare(seed, swap_square.width, false);
                swap_square.style.background = 'url(' + shadow_url + ')  no-repeat center center';
                swap_square.style.opacity = "1";
            }, 1000
            );
        }
    }
    parent.appendChild(swap_square);
    return id;
}

// Largely similar to bingo squares
function add_goodie_square(parent, name) {
    let goodie_square = document.createElement('div');
    goodie_square.id = name + "_goodie_square";
    goodie_square.className = 'plant_box_nohover';
    let work_canvas = gen_named(name);
    let canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    let scale_ctx = canvas.getContext("2d");
    scale_ctx.imageSmoothingEnabled = false;
    scale_ctx.drawImage(work_canvas, 0, 0, 96, 96);
    goodie_square.style.background = 'url(' + canvas.toDataURL() + ')  no-repeat center center';
    if (!goodie_collection.has(name)) {
        goodie_square.style.opacity = 0.15;
    }
    goodie_square.onclick = function () { setGoodieDisplay(name) };
    parent.appendChild(goodie_square);
}

function setGoodieDisplay(goodie_name) {
    let info = reformatted_named[goodie_name];
    document.getElementById("goodie_name").innerHTML = "Name: " + goodie_name;
    document.getElementById("goodie_artist").innerHTML = "Artist: " + info["artist"];
    document.getElementById("goodie_desc").innerHTML = "<i>" + info["desc"];
    if (Object.hasOwn(info, "buy")) {
        document.getElementById("goodie_cost").innerHTML = "Buy: " + info["buy"];
    } else {
        document.getElementById("goodie_cost").innerHTML = "";
    }
    if (Object.hasOwn(info, "earn")) {
        if (info["earn"] == "Conservation set") {
            document.getElementById("goodie_earn").innerHTML = "Earn: This item's part of the conservation set, go <a href=conservation_set.html>here</a> to learn how to earn them!"
        } else {
            document.getElementById("goodie_earn").innerHTML = "Earn: " + info["earn"];
        }
    } else {
        document.getElementById("goodie_earn").innerHTML = "";
    }
    // Comedy
    if (goodie_collection.has(goodie_name)) {
        document.getElementById("goodie_claim_button").style.opacity = 0;
        document.getElementById("goodie_claim_button").onclick = function () { return };
    } else {
        document.getElementById("goodie_claim_button").style.opacity = 1;
        document.getElementById("goodie_claim_button").onclick = claim_selected_goodie;
    }
    let work_canvas = gen_named(goodie_name);
    let canvas = document.getElementById("goodie_canvas");
    canvas.width = 128;
    canvas.height = 128;
    let scale_ctx = canvas.getContext("2d");
    scale_ctx.clearRect(0, 0, 128, 128);
    scale_ctx.imageSmoothingEnabled = false;
    scale_ctx.drawImage(work_canvas, 0, 0, 128, 128);
}

function show_collection_category(to_reveal) {
    marking_bases = false;
    marking_palettes = false;
    let bases = document.getElementById("base_div");
    let palettes = document.getElementById("palette_div");
    let goodies = document.getElementById("goodie_div");
    let bases_button = document.getElementById("show_bases_button");
    let palettes_button = document.getElementById("show_palettes_button");
    let goodies_button = document.getElementById("show_goodies_button");
    bases.setAttribute("hidden", "hidden");
    palettes.setAttribute("hidden", "hidden");
    goodies.setAttribute("hidden", "hidden");
    bases_button.classList.remove("active");
    palettes_button.classList.remove("active");
    goodies_button.classList.remove("active");
    if (to_reveal == "bases") {
        gen_base_divs();
        bases.removeAttribute("hidden");
        bases_button.classList.add("active");
    } else if (to_reveal == "palettes") {
        gen_palette_divs();
        palettes.removeAttribute("hidden");
        palettes_button.classList.add("active");
    } else {
        gen_goodie_divs();
        goodies.removeAttribute("hidden");
        goodies_button.classList.add("active");
    }
}

function addPalette(parent, palette_redirect) {
    let palette_div = document.createElement("div");
    palette_div.style.width = "100px";
    palette_div.style.height = "25px";
    palette_div.style.boxSizing = "border-box";
    palette_div.style.borderStyle = "solid";
    palette_div.style.borderColor = "transparent";
    let border_offset = marked_palettes.indexOf(palette_redirect);
    palette_div.style.borderColor = border_offset == -1 ? "transparent" : getOffsetColor(border_offset);
    palette_div.style.borderWidth = "thick";
    let data_url = "https://i.imgur.com/Hh8Nmck.png"
    if (owned_palettes.has(palette_redirect)) {
        let palette = all_palettes[palette_redirect]["palette"];
        let canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 25;
        canvas.background = "#FFFFFF";
        let ctx = canvas.getContext("2d");
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = "#" + palette[i];
            ctx.fillRect(25 * i, 0, 25 + 25 * i, 25);
        }
        data_url = canvas.toDataURL();
        palette_div.onclick = function () {
            // Marking mode: "favoriting" palettes
            if (marking_palettes) {
                let was_marked = swapIsMarked(palette_redirect, marked_palettes);
                palette_div.style.borderColor = was_marked ? "transparent" : getOffsetColor(marked_palettes.indexOf(palette_redirect));
                localStorage.marked_palettes = marked_palettes.toString();
                // Not marking, pick them as usual
            } else {
                selected_palettes.unshift(palette_redirect);
                selected_palettes.pop();
                drawPalettePreview("palette_canvas_2");
            }
        }
    }
    palette_div.style.background = 'url(' + data_url + ')  no-repeat center center';
    parent.appendChild(palette_div);
}

// Used with Marking Mode. Basically, check if something is in our target list. If it is,
// replace with the sentinel value -1 (we use offset to determine color, so the sentinel avoids messing with our colors).
// If it isn't present, replace the first instance of the sentinel value with it, or append if no sentinels are present.
// If it is, replace it with a sentinel.
// Basically it just push/pops without shuffling the list around.
// Returns whether the value was marked (present)
function swapIsMarked(value, target_list) {
    let was_marked = false;
    let value_idx = target_list.indexOf(value);
    if (value_idx == -1) {  // It's not present; add to the list
        // Replace a sentinel value with it, append if there are none.
        let replacement_idx = target_list.indexOf(-1);
        if (replacement_idx == -1) {
            target_list.push(value);
        } else {
            target_list[replacement_idx] = value;
        }
    } else {  // It's present; remove from the list
        was_marked = true;
        if (value_idx == (target_list.length - 1)) {
            target_list.pop();
        } else {
            target_list[value_idx] = -1;
        }
    }
    return was_marked;
}

function claim_selected_goodie() {
    let goodie_name = document.getElementById("goodie_name").innerHTML.split(" ")[1];
    collectGoodie(goodie_name);
    goodie_collection = new Set(getGoodieCollection());
    setGoodieDisplay(goodie_name, true);
    document.getElementById(goodie_name + "_goodie_square").style.opacity = 1;
    document.getElementById("goodie_claim_button").style.opacity = 0;
    document.getElementById("goodie_claim_button").onclick = function () { return; }
}

function do_preload_completion_tracker() {
    gen_base_divs();
    let load_text = document.getElementById("load_text")
    if (load_text) { load_text.remove(); }
}

do_preload_completion_tracker();

document.getElementById("show_bases_button").onclick = () => { show_collection_category("bases") };
document.getElementById("show_palettes_button").onclick = () => { show_collection_category("palettes") };
document.getElementById("show_goodies_button").onclick = () => { show_collection_category("goodies") };
document.getElementById("reroll_bases_palette").onclick = gen_base_divs.bind(true);
document.getElementById("mark_palettes").onclick = ()=>{mark(false)};
