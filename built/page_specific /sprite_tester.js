import { all_foliage, FOLIAGE_SPRITE_DATA } from "../data.js";
import { gen_plant_data, encode_plant_data_v2, drawPlantForSquare, work_canvas_size } from "../gen_plant.js";
import { do_preload_initial } from "../gen_garden.js";
import { sortAndVerifySeedList } from "../shared.js";
import { LayerManager } from "../garden_ui.js";
import { preload_single_image } from "../image_handling.js";
const add_plant_idx = all_foliage.length; // We can only ever test one plant at a time using this patched-together system.
var gm;
const color_lookup = {
    174: { 215: { 64: 'A' } }, 118: { 201: { 53: 'B' } }, 80: { 170: { 55: 'C' } }, 47: { 144: { 43: 'D' } },
    254: { 244: { 204: 'E' } }, 253: { 228: { 123: 'F' } }, 255: { 212: { 48: 'G' }, 148: { 58: 'M' } },
    236: { 182: { 0: 'H' } }, 243: { 173: { 221: 'I' } }, 216: { 127: { 188: 'J' } }, 192: { 89: { 160: 'K' } },
    170: { 51: { 132: 'L' } }, 233: { 0: { 255: 'N' } }, 200: { 255: { 183: 'O' } }, 159: { 227: { 137: 'P' } }
};
async function preloadSeedTester() {
    await do_preload_initial();
    gm = new LayerManager(document.getElementById("output_canvas"), "");
    gm.toggleVisibility();
}
async function genTestGarden() {
    let modified_seed_list = sortAndVerifySeedList(document.getElementById("partial_seed_list").value);
    let num_to_gen = document.getElementById("seed_quantity").value;
    let seeds_to_add = [];
    let img = await preload_single_image(document.getElementById("image_injector").value);
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    let img_data = context.getImageData(0, 0, work_canvas_size, work_canvas_size).data;
    let data = "";
    let custom_colors = {};
    let accursed_color_lookup = structuredClone(color_lookup);
    for (let i = 0; i < img_data.length; i += 4) {
        if (img_data[i + 3] < 40) {
            data += '0';
        }
        else if (img_data[i] in accursed_color_lookup && img_data[i + 1] in accursed_color_lookup[img_data[i]] && img_data[i + 2] in accursed_color_lookup[img_data[i]][img_data[i + 1]]) {
            data += accursed_color_lookup[img_data[i]][img_data[i + 1]][img_data[i + 2]];
        }
        else if (img_data[i] == 255 && img_data[i] == 255 && img_data[i] == 255) {
            data += '1';
        }
        else {
            let char_code = String.fromCharCode(97 + Object.keys(custom_colors).length);
            accursed_color_lookup[img_data[i]] = {};
            accursed_color_lookup[img_data[i]][img_data[i + 1]] = {};
            accursed_color_lookup[img_data[i]][img_data[i + 1]][img_data[i + 2]] = char_code;
            custom_colors[char_code] = [img_data[i], img_data[i + 1], img_data[i + 2], img_data[i + 3]];
            data += char_code;
        }
    }
    FOLIAGE_SPRITE_DATA[add_plant_idx] = { "w": work_canvas_size, "h": work_canvas_size, "l": 0, "m": 0, "e": data, "x": custom_colors, "s": 1 };
    for (let i = 0; i < num_to_gen; i++) {
        let new_data = gen_plant_data(7);
        new_data["foliage"] = add_plant_idx;
        seeds_to_add.push(encode_plant_data_v2(new_data));
    }
    // We "mix" the test seeds into the existing garden stuff, so long as there's seeds to mix into.
    if (seeds_to_add.length > 2) {
        for (let i = 0; i < seeds_to_add.length; i++) {
            modified_seed_list.splice(Math.floor(Math.random() * (modified_seed_list.length - 1)) + 1, 0, seeds_to_add[i]);
        }
    }
    gm.regenActiveGarden(modified_seed_list.join());
    let color_div = document.getElementById("sprite_color_tester");
    color_div.innerHTML = "";
    for (let i = 0; i < 20; i++) {
        let swap_square = document.createElement('button');
        swap_square.className = 'dotted_plant_box';
        swap_square.style.borderWidth = 0;
        let plant_data = gen_plant_data(0);
        plant_data["foliage"] = add_plant_idx;
        let data_url = drawPlantForSquare(encode_plant_data_v2(plant_data));
        swap_square.style.background = 'url(' + data_url + ')  no-repeat center center';
        color_div.appendChild(swap_square);
    }
}
preloadSeedTester();
document.getElementById("gen_sprite_test_garden").onclick = genTestGarden;
