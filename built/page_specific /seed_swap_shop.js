import { drawPlantForSquare, random_from_list, gen_plant_data, mulberry32, foliage_by_category, palettes_by_category, xmur3, encode_plant_data_v2, work_canvas_size } from "../gen_plant.js";
import { getSeedPoints, collectSeed, addSeedPoints, getSeedCollection } from "../shared.js";
const days_to_gen = 3;
const prices = [1, 1, 2, 2, 2, 4, 4, 5, 4, 4, 2, 2, 2, 1, 1];
var random_seed;
var swappable_seeds = {};
const text = { 0: "Today's offerings ", 1: "Yesterday's offerings ", 2: "Offerings from 2 days ago (disappear tomorrow) " };
var swapped_seeds = [];
const daily_specials = gen_daily_specials();
const price_colors = { 1: "#8CDF8F", 2: "#DFC48C", 4: "#DF8C9C", 5: "#CF8CDF" };
let claimed_seeds = [];
let dragging = false;
function gen_divs() {
    let parent = document.getElementById("content_div");
    claimed_seeds = new Set(getSeedCollection());
    for (let i = 0; i < days_to_gen; i++) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        random_seed = d.getDate().toString() + d.getMonth().toString() + d.getFullYear().toString() + "_shop_salty";
        let new_text = document.createElement('h3');
        new_text.innerHTML = text[i] + ("(daily special: " + daily_specials[i][0] + ")");
        let new_row = document.createElement('div');
        new_row.className = "swap_row";
        parent.appendChild(new_text);
        parent.appendChild(new_row);
        for (let j = 0; j < prices.length; j++) {
            let id = i + "_" + j;
            add_swap_square(new_row, j, id, prices[j], i);
        }
    }
}
function gen_daily_specials() {
    let results = [];
    for (let i = 0; i < days_to_gen; i++) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        let random_salt = d.getDate().toString() + d.getMonth().toString() + d.getFullYear().toString() + "_shop_saltyyy";
        let random_seed = mulberry32(xmur3(random_salt)());
        let foliage_options = Object.keys(foliage_by_category);
        let foliage_1 = random_from_list(foliage_options, random_seed);
        let foliage_2 = random_from_list(foliage_options, random_seed);
        if (foliage_1 == "rare") {
            foliage_1 = random_from_list(foliage_options, random_seed); // double roll!
        }
        if (foliage_2 == "rare") {
            foliage_2 = random_from_list(foliage_options, random_seed);
        }
        let palette_options = Object.keys(palettes_by_category);
        let palette_1 = random_from_list(palette_options, random_seed);
        let palette_2 = random_from_list(palette_options, random_seed);
        let specials_text = "";
        if (palette_1 == palette_2) {
            specials_text += palette_1 + " ";
        }
        else {
            specials_text += palette_1 + " and " + palette_2 + " ";
        }
        let foliage_text_1, foliage_text_2;
        if (foliage_1 == "foliage" || foliage_1 == "grass") {
            foliage_text_1 = foliage_1;
        }
        else {
            foliage_text_1 = foliage_1 + "s";
        }
        if (foliage_2 == "foliage" || foliage_2 == "grass") {
            foliage_text_2 = foliage_2;
        }
        else {
            foliage_text_2 = foliage_2 + "s";
        }
        if (foliage_1 == foliage_2) {
            specials_text += foliage_text_1;
        }
        else {
            specials_text += foliage_text_1 + " and " + foliage_text_2;
        }
        let foliage_set = foliage_by_category[foliage_1].concat(foliage_by_category[foliage_2]);
        let palette_set = palettes_by_category[palette_1].concat(palettes_by_category[palette_2]);
        results.push([specials_text, [foliage_set, palette_set]]);
    }
    return results;
}
// Largely similar to bingo squares
function add_swap_square(parent, column_offset, id, price, day) {
    let swap_square = document.createElement('button');
    swap_square.id = id;
    swap_square.className = 'swap_box';
    swap_square.setAttribute("data-price", price);
    let plant_data = gen_plant_data(0, random_seed + String(column_offset));
    if (price == 4 || price == 5) {
        let specials_prng = mulberry32(xmur3(random_seed + String(column_offset))());
        plant_data["foliage"] = random_from_list(daily_specials[day][1][0], specials_prng);
        plant_data["foliage_palette"] = random_from_list(daily_specials[day][1][1], specials_prng);
        plant_data["feature_palette"] = random_from_list(daily_specials[day][1][1], specials_prng);
        plant_data["accent_palette"] = random_from_list(daily_specials[day][1][1], specials_prng);
    }
    let seed = encode_plant_data_v2(plant_data);
    let data_url = drawPlantForSquare(seed);
    swap_square.style.background = 'url(' + data_url + ')  no-repeat center center';
    swap_square.style.backgroundSize = work_canvas_size * 3 + "px";
    swappable_seeds[id] = seed;
    let label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'label_over_plant_canvas';
    label.style.position = "relative";
    label.style.top = "5%";
    label.style.color = price_colors[price];
    let label_text = price.toString() + " rs";
    label.appendChild(document.createTextNode(label_text));
    label.style.verticalAlign = "top";
    swap_square.appendChild(label);
    parent.appendChild(swap_square);
    if (claimed_seeds.has(seed)) {
        mark_swap_claimed(id);
    }
    else {
        swap_square.addEventListener("mouseup", claim_swap);
        swap_square.addEventListener("touchmove", function () { dragging = true; });
        /*swap_square.addEventListener('touchend', function (e) {
            claim_swap(e);
            e.preventDefault();
        })*/
    }
    return id;
}
function mark_swap_claimed(id) {
    var bingo_square = document.getElementById(id);
    bingo_square.className = "swap_box_bought";
    bingo_square.lastChild.innerHTML = "Owned!";
    bingo_square = bingo_square.cloneNode(true); // Kill the event listeners
}
async function claim_swap(e) {
    if (dragging) {
        dragging = false;
        return;
    }
    var id = e.target.id;
    var price = e.target.getAttribute("data-price");
    let seed_points = getSeedPoints();
    if (swapped_seeds.indexOf(swappable_seeds[id]) == -1 && seed_points >= price) {
        mark_swap_claimed(id);
        swapped_seeds.push(swappable_seeds[id]);
        document.getElementById("seeds_earned").innerHTML = swapped_seeds.join(", ");
        collectSeed(swappable_seeds[id]);
        addSeedPoints(price * -1);
        updateSeedPointTotal();
    }
}
function updateSeedPointTotal() {
    document.getElementById("sp_count").textContent = "Current raw seedstuff: " + getSeedPoints();
}
function do_preload() {
    updateSeedPointTotal();
    document.getElementById("load_text").remove();
    gen_divs();
}
do_preload();
