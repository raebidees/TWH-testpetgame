import { decode_plant_data, assemble_categories, encode_plant_data_v2, plant_cache } from "../gen_plant.js";
import { getSeedCollection, toHue } from "../shared.js";
import { all_palettes } from "../data.js";
import { LayerManager } from "../garden_ui.js";
import { do_preload_initial } from "../gen_garden.js";
const empty_slots = 10;
let gm;
let gl;
let owned_palettes = new Set();
let seed_list = getSeedCollection();
for (let seed of seed_list) {
    let seed_data = decode_plant_data(seed);
    owned_palettes.add(seed_data["foliage_palette"] + empty_slots);
    owned_palettes.add(seed_data["feature_palette"] + empty_slots);
    owned_palettes.add(seed_data["accent_palette"] + empty_slots);
}
let secrets_mode = false;
const hidden_palette = new Image();
hidden_palette.src = "https://i.imgur.com/Hh8Nmck.png";
hidden_palette.crossOrigin = "anonymous";
hidden_palette.onload = function () {
    do_stuff();
};
// 339324,adef94,46d01b,21372a
// ddd1ff,ccb5ff,d28efa,c75de8
for (let i = 0; i < empty_slots; i++) {
    owned_palettes.add(i);
    all_palettes.unshift({ "palette": ['eeeeee', 'cccccc', 'aaaaaa', '888888'], "categories": ["custom slots (click one and edit above)"] });
}
if (owned_palettes.length == all_palettes.length) {
    secrets_mode = true;
}
async function do_stuff() {
    await do_preload_initial();
    let da_canvas = document.getElementById("output_canvas");
    gm = new LayerManager(da_canvas, document.getElementById("seed_list"));
    gl = gm.activeGardenDiv.layer;
    document.getElementById("create_garden_organizer").appendChild(gm.selfDiv);
    await gl.updateGround();
    await gm.redraw();
    gm.selfDiv.style.display = "none";
    let palettes_by_category = assemble_categories(all_palettes);
    document.getElementById("palette_text").value = "";
    let da_box = document.getElementById("content_div");
    let horrid_list = [];
    for (let i = 0; i < all_palettes.length; i++) {
        horrid_list.push([toHue("#" + all_palettes[i]["palette"][1]), i]);
    }
    horrid_list = horrid_list.sort(function (a, b) { return b[0] - a[0]; });
    for (let category of Object.keys(palettes_by_category)) {
        let header = document.createElement("h3");
        header.textContent = category;
        da_box.appendChild(header);
        for (let i = 0; i < palettes_by_category[category].length; i++) {
            //let palette = all_palettes[horrid_list[i][1]]["palette"];
            let palette_redirect = palettes_by_category[category][i];
            let palette = all_palettes[palette_redirect]["palette"];
            let divvy = document.createElement("div");
            divvy.style.display = "inline-block";
            divvy.id = "palette_" + palette_redirect;
            if (secrets_mode || owned_palettes.has(palette_redirect)) {
                divvy.addEventListener("click", function () {
                    regenWithPalette(palette_redirect);
                    document.getElementById("palette_text").value = all_palettes[palette_redirect]["palette"];
                    document.getElementById("palette_text").setAttribute("data-offset", palette_redirect);
                    //setPalette(divvy, all_palettes[palette_redirect]["palette"]);
                });
            }
            else {
                divvy.addEventListener("click", function () {
                    if (secrets_mode) {
                        setPalette(divvy, palette, palette_redirect);
                        regenWithPalette(palette_redirect);
                        document.getElementById("palette_text").value = all_palettes[palette_redirect]["palette"];
                        document.getElementById("palette_text").setAttribute("data-offset", palette_redirect);
                    }
                });
            }
            setPalette(divvy, palette, palette_redirect);
            da_box.appendChild(divvy);
        }
    }
    /* Used for taking screenshots of palettes next to good example bases
    new_div = document.createElement("div");
    document.body.appendChild(new_div);
    for(let i=0; i<all_palettes.length; i++){
    //let palette = all_palettes[horrid_list[i][1]]["palette"];
    let palette_redirect = i;
    let palette = all_palettes[i]["palette"];
    plant_canvas = await gen_plant({"foliage": 118, "foliage_palette": i, "feature_palette": i, "accent_palette": i});
    var scale_canvas = document.createElement("canvas");
    scale_canvas.width = 96;
    scale_canvas.height = 96;
    var scale_ctx = scale_canvas.getContext("2d");
    scale_ctx.imageSmoothingEnabled = false;
    scale_ctx.drawImage(plant_canvas, 0, 0, 96, 96);
    plant_canvas_2 = await gen_plant({"foliage": 152, "foliage_palette": i, "feature_palette": i, "accent_palette": i});
    var scale_canvas_2 = document.createElement("canvas");
    scale_canvas_2.width = 96;
    scale_canvas_2.height = 96;
    var scale_ctx_2 = scale_canvas_2.getContext("2d");
    scale_ctx_2.imageSmoothingEnabled = false;
    scale_ctx_2.drawImage(plant_canvas_2, 0, 0, 96, 96);
    divvy = document.createElement("div");
    divvy.id = "palette_" + palette_redirect;
    divvy.style.height = "96px";
    divvy.style.display = "flex";
    setPalette(divvy, palette);
    divvy.appendChild(scale_canvas);
    divvy.appendChild(scale_canvas_2);
    new_div.appendChild(divvy);
    }*/
    doThisRegen();
}
function setPalette(parent, palette, palette_redirect) {
    parent.innerHTML = "";
    let canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 25;
    canvas.background = "#FFFFFF";
    let ctx = canvas.getContext("2d");
    if (secrets_mode || owned_palettes.has(Number(palette_redirect))) {
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = "#" + palette[i];
            ctx.fillRect(25 * i, 0, 25 + 25 * i, 25);
        }
    }
    else {
        ctx.drawImage(hidden_palette, 0, 0);
    }
    parent.appendChild(canvas);
}
function regenWithPalette(palette) {
    let seeds = gm.activeGardenDiv.layer.seedList;
    let edit_elem = document.getElementsByName('to_edit');
    let edit = "all";
    for (let i = 0; i < edit_elem.length; i++) {
        if (edit_elem[i].checked) {
            edit = edit_elem[i].value;
        }
    }
    for (let i = 0; i < seeds.length; i++) {
        let seed = seeds[i];
        let percent_pos = seed.indexOf('%');
        let percent_val = "";
        if (percent_pos > 0) {
            percent_val = seed.slice(percent_pos);
            seed = seed.slice(0, percent_pos);
        }
        let data = decode_plant_data(seed);
        if (edit == "all" || edit == "foliage") {
            data["foliage_palette"] = palette;
        }
        if (edit == "all" || edit == "feature") {
            data["feature_palette"] = palette;
        }
        if (edit == "all" || edit == "accent") {
            data["accent_palette"] = palette;
        }
        seeds[i] = encode_plant_data_v2(data) + percent_val;
    }
    tintedRegen(seeds);
}
document.getElementById("palette_text").addEventListener("keyup", updatePalette);
function updatePalette() {
    let palette = document.getElementById("palette_text");
    // Enable spooky mode
    if (!secrets_mode) {
        if (palette.value == "ARTINTHEFASTLANE") {
            alert("Secret code activated! You can now click unknown palettes to reveal them.");
            secrets_mode = true;
            return;
        }
    }
    let redirect = palette.getAttribute("data-offset");
    let new_palette = palette.value.split(",");
    all_palettes[redirect]["palette"] = new_palette;
    for (var member in plant_cache)
        delete plant_cache[member];
    setPalette(document.getElementById("palette_" + redirect), new_palette, redirect);
    regenWithPalette(redirect);
}
function tintedRegen(seed_list) {
    //gm.setHeight(parseInt(document.getElementById("garden_height").value));
    //gm.setWidth(parseInt(document.getElementById("garden_width").value));
    gm.regenActiveGarden(seed_list.toString());
}
function doThisRegen() {
    gm.setHeight(parseInt(document.getElementById("garden_height").value));
    gm.setWidth(parseInt(document.getElementById("garden_width").value));
    gm.regenActiveGarden(document.getElementById("seed_list").value);
}
