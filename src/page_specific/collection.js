import { all_palettes, FOLIAGE_SPRITE_DATA, PALETTE_PREVIEW_IMG, all_foliage } from "../data.js";
import { getSeedCollectionAsString, export_save, addSeedPoints, getSeedPoints, collectSeed, makeSortCheckmark, toHue, getSeedCollection, bubble_out } from "../shared.js";
import { gen_plant, decode_plant_data, encode_plant_data_v2, foliage_by_category, palettes_by_category, parse_plant_data, overall_palette, work_canvas_size } from "../gen_plant.js";
import { replace_color_palette } from "../image_handling.js";

var collection_filter = { "base": new Set(), "palette": new Set() };
var sort_intervals = [];
let temporary_collection = [];
let on_temporary_collection = false;
var days_since_backup;
var showcase_mode;
const backup_sp_per_day = 3;
const max_sp_for_backup = 15;
// Take the average hue of all 4 colors of each palette
//const rainbow_offset = all_palettes.map((x, i) => all_palettes[i]["palette"].map(x=>toHue("#"+x)).reduce((a, b) => a + b)/4);
const rainbow_offset = all_palettes.map((x, i) => toHue("#" + all_palettes[i]["palette"][1]));

function getSeedCollectionAsStringWithTemp(){if(on_temporary_collection){return temporary_collection.join(",")} else {return getSeedCollectionAsString()}};
function getSeedCollectionWithTemp(){if(on_temporary_collection){return temporary_collection} else {return getSeedCollection()}};
function collectSeedWithTemp(seed_string){
    if(on_temporary_collection){ 
        if(seed_string.length == 0){return};
        let seeds = seed_string.split(",");
        let verified_seeds = [];
        for(const seed of seeds){
            if(seed.length == 10){
                verified_seeds.push(seed);
            } else {
                alert("You seem to have a malformed seed! Seeds are 10 characters long, but got "+seed+". Skipping!");
            }
        }
        temporary_collection = verified_seeds.concat(temporary_collection);
    } else {collectSeed(seed_string)}};


var first_chunk_on_last_sort = getSeedCollectionAsStringWithTemp().slice(0, 50);
// TODO: Potentially nasty refactor: replacing all these palette names with an enum somewhere.
const palette_codes = { 0: "foliage_palette", 1: "feature_palette", 2: "accent_palette" };
// Thanks to https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality for this clean oneliner
const areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value))


window.addEventListener("storage", () => { checkIfRefreshNeeded(); });

function doSeedOnclick(e) {
    const selected_function = document.getElementById('utility_button_box').getAttribute("selected_function");
    let seed = e.target.getAttribute('data-seed');
    if (seed == null) { return; }
    // There's probably some function passing refactor I could do
    if (selected_function == "analyze") { analyze_seed(seed); }
    else if (selected_function == "select") { select_seed(seed); }
    else if (selected_function == "recycle") { prep_recycle_seed(seed); }
    else if (selected_function == "mutate") { prep_mutate_seed(seed); }
}

function checkIfRefreshNeeded() {
    if (getSeedCollectionAsStringWithTemp().slice(0, 50) != first_chunk_on_last_sort) {
        display_collection();
    }
}

function getDisplayOptions() {
    if (localStorage.display_options == undefined) {
        localStorage.display_options = JSON.stringify({ "n": 0, "p": 0, "r": 1, "s": 0 });
    }
    const options = JSON.parse(localStorage.display_options);
    document.getElementById("hide_seeds").checked = options["n"];
    document.getElementById("show_palettes").checked = options["p"];
    document.getElementById("rainbow_palettes").checked = options["r"];
    document.getElementById("showcase_display").checked = options["s"];
}

function setDisplayOptions() {
    localStorage.display_options = JSON.stringify({
        "n": document.getElementById("hide_seeds").checked,
        "p": document.getElementById("show_palettes").checked,
        "r": document.getElementById("rainbow_palettes").checked,
        "s": document.getElementById("showcase_display").checked
    });
}

function doBackup() {
    export_save();
    let rewarded_points = Math.min(days_since_backup * backup_sp_per_day, max_sp_for_backup);
    if (rewarded_points > 0) {
        addSeedPoints(rewarded_points);
        updateSeedPoints();
        localStorage["last_backup"] = new Date();
    }
    document.getElementById("doBackup_button").value = "Backup";
}

function updateSeedPoints() {
    document.getElementById("seedstuff_tally").textContent = "Raw seedstuff: " + getSeedPoints();
}

// Really just a "find the first instance and snip" method
function removeSeedFromCollection(seed) {
    if(on_temporary_collection){
        let index = temporary_collection.indexOf(seed);
        if(index != -1) {
            temporary_collection.splice(index, 1);
            return true;
        }
        return false;
    }
    if (localStorage.seed_collection == undefined) { return false; }
    let seed_and_comma = seed + ",";
    let collection = getSeedCollectionAsString();
    let index = collection.indexOf(seed_and_comma);
    if (index != -1) {
        localStorage.seed_collection = collection.slice(0, index) + collection.slice(index + seed_and_comma.length);
        return true;
    }
    // Should only fire if it's the last (or only) seed...or it wasn't found
    index = collection.indexOf(seed);
    if (index != -1) {
        if (collection == seed) { delete localStorage.seed_collection } else {
            localStorage.seed_collection = collection.slice(0, index - 1) + collection.slice(index + seed.length);
        }
        return true;
    }
    return false;
}

function select_seed(seed) {
    let parent = document.getElementById("selection_display_div");
    let entry = create_collection_entry(parent.children.length, seed, document.getElementById("hide_seeds").checked, document.getElementById("show_palettes").checked);
    entry.onclick = function () { parent.removeChild(entry); if(parent.childNodes.length == 0){document.getElementById("copy_selection_button").value = "Copy all"}};
    parent.appendChild(entry);
    document.getElementById("copy_selection_button").value = "Copy selection";
}

function prep_recycle_seed(seed) {
    let parent = document.getElementById("recycle_display_div");
    let entry = create_collection_entry(parent.children.length, seed, document.getElementById("hide_seeds").checked, document.getElementById("show_palettes").checked);
    entry.onclick = function () { parent.removeChild(entry) };
    parent.appendChild(entry);
}

// The force option is used to clear all other seeds, it's how we select the child after a mutation operation.
function prep_mutate_seed(seed, force = false) {
    let first_splice = document.getElementById("first_splice");
    let second_splice = document.getElementById("second_splice");

    if (force) {
        if (first_splice.children.length > 0) { first_splice.removeChild(first_splice.children[0]); first_splice.setAttribute("data-seed", "") }
        if (second_splice.children.length > 0) { second_splice.removeChild(second_splice.children[0]); second_splice.setAttribute("data-seed", "") }
    }

    function setup_splice(parent) {
        parent.setAttribute("data-seed", seed);
        let entry = create_collection_entry(parent.id == "second_splice", seed, document.getElementById("hide_seeds").checked, document.getElementById("show_palettes").checked);
        entry.style.borderWidth = 0;
        if (parent.children.length > 0) {
            parent.removeChild(parent.children[0]);
        }
        parent.appendChild(entry);
        entry.onclick = function () { parent.removeChild(entry); parent.setAttribute("data-seed", ""); update_mutate() };
    }

    if (first_splice.children.length == 0) {
        setup_splice(first_splice);
    }
    // If first or both set
    else {
        if (first_splice.getAttribute("data-seed") == seed) { return; }  // prevent double-select
        setup_splice(second_splice);
    }

    update_mutate();
}

function draw_preview(canvas_element, seed_data) {
    let plant_canvas = gen_plant(seed_data, document.getElementById("show_palettes").checked);
    var preview_canvas = document.getElementById(canvas_element);
    var preview_ctx = preview_canvas.getContext("2d");
    preview_ctx.imageSmoothingEnabled = false;
    preview_ctx.clearRect(0, 0, preview_canvas.width, preview_canvas.height);
    preview_ctx.drawImage(plant_canvas, 0, 0, preview_canvas.width, preview_canvas.height);
}

function update_mutate() {
    if (document.getElementById("first_splice").children.length == 1 && document.getElementById("second_splice").children.length == 1) {
        document.getElementById("color_cycle_div").style.display = "none";  // I'd prefer to use hidden, but it's overwritten by display
        document.getElementById("splice_panel").style.display = "flex";
        update_splice();
    } else {
        document.getElementById("splice_panel").style.display = "none";  // I'd prefer to use hidden, but it's overwritten by display
        document.getElementById("color_cycle_div").style.display = "flex";
        update_cycle();
    }
}

function update_cycle() {
    let orig_seed;
    if (document.getElementById("first_splice").getAttribute("data-seed") != "") {
        orig_seed = document.getElementById("first_splice").getAttribute("data-seed");
    } else if (document.getElementById("second_splice").getAttribute("data-seed") != "") {
        orig_seed = document.getElementById("second_splice").getAttribute("data-seed");
    } else {
        var preview_canvas = document.getElementById("mutate_preview_canvas");
        var preview_ctx = preview_canvas.getContext("2d");
        preview_ctx.clearRect(0, 0, preview_canvas.width, preview_canvas.height);
        document.getElementById("color_cycle_panel").innerHTML = "";
        return;
    }
    let plant_data = decode_plant_data(orig_seed);
    let cycle_panel = document.getElementById("color_cycle_panel");
    draw_preview("mutate_preview_canvas", plant_data);
    let orig_foliage = plant_data["foliage_palette"];
    let orig_feature = plant_data["feature_palette"];
    let orig_accent = plant_data["accent_palette"];

    function create_shuffled_seed(foliage_palette, feature_palette, accent_palette) {
        plant_data["foliage_palette"] = foliage_palette;
        plant_data["feature_palette"] = feature_palette;
        plant_data["accent_palette"] = accent_palette;
        let entry = create_collection_entry(0, encode_plant_data_v2(plant_data), false, true);
        entry.children[0].textContent = on_temporary_collection ? "free" : "2 rs";
        entry.onclick = function (e) {
            if (on_temporary_collection || getSeedPoints() >= 2) {
                let gotten = removeSeedFromCollection(orig_seed);
                if (!gotten) {
                    alert("Couldn't find the seed you're rotating in your collection! Palette rotation cancelled.");
                    return;
                }
                bubble_out(e.target, e.target.getAttribute("data-seed"));
                if(!on_temporary_collection){
                    addSeedPoints(-2);
                    updateSeedPoints();
                }
                collectSeedWithTemp(e.target.getAttribute("data-seed"));
                prep_mutate_seed(e.target.getAttribute("data-seed"), true);
                display_collection();
            }
        }
        cycle_panel.appendChild(entry);
    }

    cycle_panel.innerHTML = "";  // Clear prior children
    create_shuffled_seed(orig_accent, orig_foliage, orig_feature);
    create_shuffled_seed(orig_feature, orig_accent, orig_foliage);
    create_shuffled_seed(orig_accent, orig_feature, orig_foliage);
}

function update_splice() {
    let first_seed_data = decode_plant_data(document.getElementById("first_splice").getAttribute("data-seed"));
    let second_seed_data = decode_plant_data(document.getElementById("second_splice").getAttribute("data-seed"));
    let merged_seed_data = {};
    function set_data(field_name) {
        if (!document.getElementById("splice_select_" + field_name).checked) {
            merged_seed_data[field_name] = first_seed_data[field_name];
        } else {
            merged_seed_data[field_name] = second_seed_data[field_name];
        }
    }
    set_data("foliage"); set_data("foliage_palette"); set_data("feature_palette"); set_data("accent_palette");
    merged_seed_data["complex_feature"] = first_seed_data["complex_feature"];
    merged_seed_data["simple_feature"] = first_seed_data["simple_feature"];
    let new_seed = encode_plant_data_v2(merged_seed_data);
    draw_preview("mutate_preview_canvas", merged_seed_data);
    document.getElementById("mutate_preview_canvas").setAttribute("data-seed", new_seed);
}

function claim_splice() {
    if(!on_temporary_collection){
        let gotten = removeSeedFromCollection(document.getElementById("first_splice").getAttribute("data-seed"));
        let gotten_2 = removeSeedFromCollection(document.getElementById("second_splice").getAttribute("data-seed"));
        if (!(gotten && gotten_2)) {
            alert("At least one of the seeds used in this splice couldn't be found in your collection. Found seed (if any) refunded and splice cancelled!");
            if (gotten) { collectSeedWithTemp(document.getElementById("first_splice").getAttribute("data-seed")) };
            if (gotten_2) { collectSeedWithTemp(document.getElementById("first_splice").getAttribute("data-seed")) };
            display_collection();
            return;
        }
    }
    let new_seed = document.getElementById("mutate_preview_canvas").getAttribute("data-seed");
    collectSeedWithTemp(new_seed);
    prep_mutate_seed(new_seed, true);
    bubble_out(document.getElementById("mutate_preview_canvas"), new_seed);
    display_collection();
}

function copy_selection() {
    let parent = document.getElementById("selection_display_div");
    let button = document.getElementById("copy_selection_button");
    let seed_list = [];
    for (let child of parent.children) {
        seed_list.push(child.getAttribute("data-seed"));
    }
    if(seed_list.length == 0){
        seed_list = getSeedCollectionWithTemp();
    }
    navigator.clipboard.writeText(seed_list.join(", "));
    button.value = "Copied!";
    setTimeout(function () { button.value = "Copy to clipboard"; }, 1000);
}

function launch_recycle_dialogue() {
    let modal = document.createElement("div");
    modal.classList.add("block_window");
    let modal_display = document.createElement("div");
    modal_display.classList.add("popup");
    document.body.appendChild(modal);
    let textbox = document.createElement("text");
    if(on_temporary_collection){
        textbox.textContent = "You're about to remove "+ document.getElementById("recycle_display_div").children.length + " seeds from your temporary collection! This won't affect your 'real' collection at all, and you won't get any raw seedstuff for it."
    } else {
        textbox.textContent = "You're about to recycle " + document.getElementById("recycle_display_div").children.length + " seed(s). These will be recycled into raw seedstuff at a rate of 1 raw seedstuff per seed found (so don't worry if you accidentally specified duplicates). If you're ready, hit the 'Claim RS' button. If these seeds were added to your collection by mistake and you just want to remove them, hit the 'Delete' button instead!";
    }
    let button_container = document.createElement("div");
    button_container.style.padding = "20px";
    let cancel_button = document.createElement("input");
    cancel_button.type = "button";
    cancel_button.onclick = function () { document.body.removeChild(modal) };
    cancel_button.value = "Cancel";
    cancel_button.classList.add("chunky_fullwidth");
    let claim_button = document.createElement("input");
    claim_button.type = "button";
    function delayedExit(message) {
        button_container.removeChild(remove_button);
        button_container.removeChild(claim_button);
        cancel_button.value = "Done!";
        textbox.textContent = message;
    }
    claim_button.onclick = function () { let earned = recycle_seeds(true); delayedExit("You now have " + getSeedPoints() + " raw seedstuff (" + earned + " more than before)") };
    claim_button.value = "Claim RS";
    claim_button.classList.add("chunky_fullwidth");
    if(on_temporary_collection){claim_button.style.display="none";}
    let remove_button = document.createElement("input");
    remove_button.type = "button";
    let remove_msg = on_temporary_collection? "Removed temporary seeds" : "Removed errant seeds. Thank you for your honesty!";
    remove_button.onclick = function () { recycle_seeds(false); delayedExit(remove_msg) };
    remove_button.value = "Delete (no RS)";
    remove_button.classList.add("chunky_fullwidth");
    button_container.appendChild(textbox);
    button_container.appendChild(document.createElement("br"));
    button_container.appendChild(document.createElement("br"));
    button_container.appendChild(claim_button);
    button_container.appendChild(remove_button);
    button_container.appendChild(cancel_button);
    modal_display.appendChild(button_container);
    modal.appendChild(modal_display);
}

function launch_add_dialogue() {
    let modal = document.createElement("div");
    modal.classList.add("block_window");
    let modal_display = document.createElement("div");
    modal_display.classList.add("add_seed_popup");
    document.body.appendChild(modal);
    let textbox = document.createElement("p");
    textbox.textContent = "Paste in a list of comma-separated seeds to add them to your collection! Won't do anything if the list is empty.";
    modal_display.append(textbox);
    let text_entry = document.createElement("textarea");
    text_entry.id = "seed_collection";
    text_entry.placeholder = "Click here and paste!"
    modal_display.append(text_entry);
    let claim_button = document.createElement("button");
    claim_button.onclick = function(){display_collection(); document.body.removeChild(modal);}
    claim_button.value = "Add Seeds";
    claim_button.innerText = "Add Seeds";
    claim_button.classList.add("chunky_fullwidth");
    modal_display.appendChild(claim_button);

    let tempbox = document.createElement("p");
    tempbox.textContent = "Or add them to your temporary collection, useful for screenshots or experimenting with (mutating is free!). The temporary collection is lost on page refresh.";
    modal_display.append(tempbox);   

    let temp_button = document.createElement("button");
    temp_button.onclick = function(){toggle_temporary_collection(0, true); document.body.removeChild(modal);}
    temp_button.value = "Add Seeds to Temporary Collection";
    temp_button.innerText = "Add Seeds to Temporary Collection";
    temp_button.classList.add("chunky_fullwidth");
    modal_display.appendChild(temp_button);

    modal.appendChild(modal_display);
}

function toggle_temporary_collection(_ignore, force_to=undefined){
    let disclaimer = document.getElementById("temp_collection_disclaimer");
    if(force_to != undefined){
        on_temporary_collection = force_to;
    } else {
        on_temporary_collection = !on_temporary_collection;
    }
    if(on_temporary_collection){
        disclaimer.innerHTML = "Viewing your temporary collection! <a href='javascript:void(0);'>Click to swap</a>."
    } else {
        disclaimer.innerHTML = "Viewing your normal collection! <a href='javascript:void(0);'>Click to swap</a>."
    }
    document.getElementById("first_splice").innerHTML = "";
    document.getElementById("second_splice").innerHTML = "";
    update_mutate();
    display_collection();
    flash_temporary_collection_disclaimer();
}

function flash_temporary_collection_disclaimer(){
    let disclaimer = document.getElementById("temp_collection_disclaimer");
    disclaimer.classList.remove("color_flash_animate");
    disclaimer.style.color = window.getComputedStyle(document.documentElement).getPropertyValue("--accent-bright");
    setTimeout(function(){
    disclaimer.classList.add("color_flash_animate");
    disclaimer.style.color = window.getComputedStyle(document.documentElement).getPropertyValue("--font-color");
    }.bind(disclaimer), 50);
}

function recycle_seeds(claim_sp) {
    let seed_list = document.getElementById("recycle_display_div");
    let earned_sp = 0;
    // Lots of ways to speed this up, but let's be honest, it's preemptive.
    for (let child of seed_list.children) {
        let seed = child.getAttribute("data-seed");
        let found = removeSeedFromCollection(seed);
        if (found) { earned_sp += 1 };
    }
    if (claim_sp) { addSeedPoints(earned_sp); updateSeedPoints(); }
    seed_list.innerHTML = '';  // Remove all children
    display_collection();
    return earned_sp;
}

function cancelOngoingSort() {
    for (let interval of sort_intervals) {
        clearInterval(interval);
    }
}

function doFilter() {
    let has_changed = compileFilter();
    display_collection(has_changed);
}

function forceFilter(base, palette) {
    collection_filter["base"] = new Set();
    collection_filter["palette"] = new Set();
    if (base != -1) {
        collection_filter["base"] = new Set([base]);
    }
    if (palette != -1) {
        let palette_set = new Set();
        palette_set.add(palette);
        collection_filter["palette"] = palette_set;
    }
    display_collection();
}

function compileFilter() {
    let has_changed = false;
    let new_base_set = new Set();
    for (let base_filter of document.getElementById("base_sort_categories_div").children) {
        if (base_filter.checked) {
            foliage_by_category[base_filter.value].forEach((item) => new_base_set.add(item));
        }
    }
    has_changed = !areSetsEqual(collection_filter["base"],new_base_set);
    collection_filter["base"] = new_base_set;
    let new_palette_set = new Set();
    for (let palette_filter of document.getElementById("palette_sort_categories_div").children) {
        if (palette_filter.checked) {
            palettes_by_category[palette_filter.value].forEach((item) => new_palette_set.add(item));
        }
    }
    has_changed = has_changed || !areSetsEqual(collection_filter["palette"],new_palette_set);
    collection_filter["palette"] = new_palette_set;
    return has_changed;
}

function applyFilter(filter_name, data_val) {
    if (data_val == undefined) { return false; }  // malformed seed
    if (collection_filter[filter_name].size == 0) { return true; }
    return collection_filter[filter_name].has(data_val);
}

function passesFilter(plant_data, colorFilterMode) {
    if (!applyFilter("base", plant_data["foliage"])) { return false; }
    if (colorFilterMode == 0) {  // any
        if (applyFilter("palette", plant_data["foliage_palette"])) { return true; }
        if (applyFilter("palette", plant_data["feature_palette"])) { return true; }
        if (applyFilter("palette", plant_data["accent_palette"])) { return true; }
    } else if (colorFilterMode == 1) { // all
        if (applyFilter("palette", plant_data["foliage_palette"]) &&
            applyFilter("palette", plant_data["feature_palette"]) &&
            applyFilter("palette", plant_data["accent_palette"])) {
            return true;
        }
    } else if (colorFilterMode == 2) { // main
        return applyFilter("palette", plant_data[palette_codes[FOLIAGE_SPRITE_DATA[plant_data["foliage"]]["m"]]]);
    }
    return false;
}

function display_collection(do_filter=true) {
    //clear what's already in there
    cancelOngoingSort();
    let prior_options = localStorage.display_options;
    setDisplayOptions();
    if(prior_options === localStorage.display_options && !do_filter){
        return;
    }
    first_chunk_on_last_sort = getSeedCollectionAsStringWithTemp().slice(0, 50);
    sort_intervals = [];
    var collection_div = document.getElementById("collection_display_div")
    var hide_seeds = document.getElementById("hide_seeds").checked;
    showcase_mode = document.getElementById("showcase_display").checked;
    document.getElementById("collection_display_div").className = showcase_mode ? "collection_showcase_display" : "collection_display";
    let show_palettes = document.getElementById("show_palettes").checked;
    while (collection_div.lastChild) { collection_div.removeChild(collection_div.lastChild); }
    if(document.getElementById("seed_collection")){
        var seed_string = document.getElementById("seed_collection").value.split(" ").join("").replace(/(^,)|(,$)|"/g, '');
        // This and the next line both "verify"--sloppy workaround for people putting !namedseeds in this field
        //let [new_seeds, new_named] = sortAndVerifySeedList(seed_string);
        collectSeedWithTemp(seed_string);
        document.getElementById("seed_collection").value = "";
    }
    let collection = getSeedCollectionWithTemp();
    document.getElementById("plant_tally").textContent = "Plants (and friends): " + collection.length;
    var sort_order_elem = document.getElementsByName('sort_order');
    var sort_order = "None";
    for (i = 0; i < sort_order_elem.length; i++) {
        if (sort_order_elem[i].checked){
            sort_order = sort_order_elem[i].value;
            break;
        }
    }
    collection = get_seed_collection_sorted_by(collection, sort_order);
    if (collection.length > 0 && !document.getElementById("first_splice").innerText) { prep_mutate_seed(collection[0]); }
    if (collection.length > 0 && !document.getElementById("analysis_output_text").innerText) { analyze_seed(collection[0]); }
    //var collection_width_elem = document.getElementsByName('collection_width');
    document.getElementById("title").title = "You have " + collection.length + " seeds and " + getSeedPoints() + " raw seedstuff!";
    for (var i = 0; i < collection.length; i++) {
        // The +10 is to avoid the first few plants mixing themselves around
        sort_intervals.push(setTimeout(add_collection_entry, i + 10, collection_div, i, collection[i], hide_seeds, show_palettes));
    }
}

// Take a list of seeds, return them in the order specified (ex: sort by the base "plant")
function get_seed_collection_sorted_by(collection, sort_key) {
    let needs_filtered = !(collection_filter["base"].size == 0 && collection_filter["palette"].size == 0)
    if (sort_key == "None" && !needs_filtered) { return collection };
    let parsed_seeds = {};
    let named_seed_data = { "foliage": 999, "foliage_palette": 999, "feature_palette": 999, "accent_palette": 999 }
    let color_mode = 0;
    let color_filter_elem = document.getElementsByName('color_filter');
    for (let i = 0; i < color_filter_elem.length; i++) {
        if (color_filter_elem[i].checked)
            color_mode = color_filter_elem[i].value;
    }
    for (let i = 0; i < collection.length; i++) {
        if (collection[i].startsWith("!")) {
            parsed_seeds[collection[i]] = named_seed_data;
        } else {
            let plant_data = decode_plant_data(collection[i]);
            if (needs_filtered && !passesFilter(plant_data, color_mode)) {
                continue;
            }
            parsed_seeds[collection[i]] = plant_data;
        }
    }
    if (needs_filtered) {
        let filtered_collection = [];
        let allowed_seeds = new Set(Object.keys(parsed_seeds));
        for (let entry of collection) {
            if (allowed_seeds.has(entry)) { filtered_collection.push(entry) }
        }
        collection = filtered_collection;
    }

    let lookup_redirect = document.getElementById("rainbow_palettes").checked && sort_key != "foliage" ? x => rainbow_offset[x] : x => x;
    if (sort_key == "None") { return collection; };
    if (sort_key == "alphabetical") { return collection.sort(); };
    if (sort_key == "main_palette") {
        return collection.sort(function (a, b) {
            // Look up the base in FOLIAGE_SPRITE_DATA and grab which palette is the main (majority pixels) palette
            return lookup_redirect(parsed_seeds[a][palette_codes[FOLIAGE_SPRITE_DATA[parsed_seeds[a]["foliage"]]["m"]]]) -
                lookup_redirect(parsed_seeds[b][palette_codes[FOLIAGE_SPRITE_DATA[parsed_seeds[b]["foliage"]]["m"]]]);
        });
    }
    return collection.sort(function (a, b) {
        return lookup_redirect(parsed_seeds[a][sort_key]) - lookup_redirect(parsed_seeds[b][sort_key]);
    });
}

function create_collection_entry(offset, seed, hide_seed, show_palette, premade_entry = null) {
    let entry;
    if (premade_entry === null) {
        entry = document.createElement('div');
    } else {
        entry = premade_entry;
    }
    var id = offset;
    entry.id = id;
    entry.className = showcase_mode ? 'showcase_collection_box' : 'collection_box';
    entry.setAttribute('data-seed', seed);  // For access with onclick
    entry.onclick = doSeedOnclick;
    var label = document.createElement('label');
    label.style.pointerEvents = "none";
    let final_size = showcase_mode ? work_canvas_size * 3 : work_canvas_size * 2;
    // Strip any positional info
    seed = seed.replace(/%[\d .]*/g, '');
    if (seed.length != 10) {
        alert("You seem to have a malformed seed! Seeds are 10 characters long, but got \"" + seed + "\". Skipping!");
    }
    else {
        var plant_canvas = gen_plant(decode_plant_data(seed), show_palette, final_size / work_canvas_size);
    }
    label.htmlFor = id;
    label.className = showcase_mode ? 'showcase_collection_label' : 'collection_label';
    let text_content;
    if (hide_seed) { text_content = offset + 1; } else { text_content = seed; }
    label.appendChild(document.createTextNode(text_content));
    let separator = document.createElement("span");
    separator.style.color = "transparent";
    separator.appendChild(document.createTextNode(", "));
    label.appendChild(separator);
    label.style.maxWidth = "86px";
    entry.appendChild(label);
    entry.style.background = 'url(' + plant_canvas.toDataURL() + ')  no-repeat bottom center';
    return entry;
}

// Exists solely to smooth use of setTimeout.
function add_collection_entry(parent, offset, seed, hide_seed, show_palette) {
    let placeholder_child = document.createElement("div");
    parent.appendChild(placeholder_child);
    create_collection_entry(offset, seed, hide_seed, show_palette, placeholder_child);
}

function buildColorFilterMessage(raw_plant_data){
  let color_msg = "";
  if(raw_plant_data["foliage"] == 160){
    color_msg += "This seed is malformed"
  } else {
    for(let category of ["foliage_palette", "feature_palette", "accent_palette"]){
      let link_color = "#"+ all_palettes[raw_plant_data[category]]["palette"][0];
      let id = "force_filter_"+category;
      color_msg += ("<a id=" + id +" href='javascript:void(0);' style='text-decoration-color: " + link_color + "'><span style='color: " + link_color + "'>" + all_palettes[raw_plant_data[category]]["name"]+"</a></span> ");
      setTimeout(()=>{document.getElementById(id).onclick = ()=>{forceFilter(-1, raw_plant_data[category])}}, 10);
    }
  }
  return color_msg;
}

function analyze_seed(seed_string) {
    var canvas = document.getElementById("analysis_output_canvas");
    var ctx = canvas.getContext("2d");
    canvas.removeAttribute("hidden");
    var raw_plant_data = decode_plant_data(seed_string);
    var plant_data = parse_plant_data(raw_plant_data);
    var img = new Image();
    img.src = PALETTE_PREVIEW_IMG;
    img.crossOrigin = "anonymous"
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        var new_overall_palette = plant_data["foliage_palette"].concat(plant_data["accent_palette"]).concat(plant_data["feature_palette"]);
        replace_color_palette(overall_palette, new_overall_palette, ctx, 64, 64);
    }
    var plant_canvas = gen_plant(raw_plant_data); // Maybe I should just scale the plants up in gen_plant...
    var preview_canvas = document.getElementById("analysis_preview_canvas");
    document.getElementById("analysis_preview_canvas_label").textContent = seed_string;
    var preview_ctx = preview_canvas.getContext("2d");
    preview_ctx.clearRect(0, 0, preview_canvas.width, preview_canvas.height);
    preview_ctx.imageSmoothingEnabled = false;
    preview_ctx.drawImage(plant_canvas, 0, 0, preview_canvas.width, preview_canvas.height);
    var text_output = document.getElementById("analysis_output_text");
    let color_msg = buildColorFilterMessage(raw_plant_data);
    text_output.innerHTML = "Name: " + "<a id='base_force_filter' href='javascript:void(0);'>" + all_foliage[plant_data["foliage"]]["name"] + "</a>";
    setTimeout(()=>{document.getElementById("base_force_filter").onclick = ()=>{forceFilter(plant_data["foliage"], -1)}}, 10);
    text_output.innerHTML += ("<br>Artist: " + all_foliage[plant_data["foliage"]]["artist"] + "<br>Type: " + all_foliage[plant_data["foliage"]]["categories"] + "<br>Colors: " + color_msg);
}

function doCollectionPreload() {
    document.getElementById("load_text").remove();
    getDisplayOptions();
    display_collection();
    let base_sort_div = document.getElementById("base_sort_categories_div");
    for (let category of Object.keys(foliage_by_category)) {
        makeSortCheckmark("base_sort_", category, base_sort_div);
    }
    let palette_sort_div = document.getElementById("palette_sort_categories_div");
    for (let palette of Object.keys(palettes_by_category)) {
        makeSortCheckmark("palette_sort_", palette, palette_sort_div);
    }
    if (localStorage["last_backup"] == undefined) { localStorage["last_backup"] = new Date() }
    days_since_backup = Math.round((+new Date() - +new Date(localStorage["last_backup"])) / 8.64e7);
    if (days_since_backup > 0) {
        document.getElementById("doBackup_button").value = "Backup (+" + Math.min(days_since_backup * backup_sp_per_day, max_sp_for_backup) + " rs)";
    }
    updateSeedPoints();
}

document.getElementById("seed_collection_sort_container").onclick = doFilter;
document.getElementById("add_button").onclick = launch_add_dialogue;
document.getElementById("splice_select_foliage").onclick = update_splice;
document.getElementById("splice_select_foliage_palette").onclick = update_splice;
document.getElementById("splice_select_feature_palette").onclick = update_splice;
document.getElementById("splice_select_accent_palette").onclick = update_splice;
document.getElementById("splice_claim_button").onclick = claim_splice;
document.getElementById("copy_selection_button").onclick = copy_selection;
document.getElementById("launch_recycle_dialogue_button").onclick = launch_recycle_dialogue;
document.getElementById("doBackup_button").onclick = doBackup;
document.getElementById("temp_collection_disclaimer").onclick = toggle_temporary_collection;
let sort_order_elem = document.getElementsByName('sort_order');
for (let i = 0; i < sort_order_elem.length; i++) {
    sort_order_elem[i].addEventListener('change', display_collection);
}


doCollectionPreload();

export { doBackup, launch_recycle_dialogue, doFilter, forceFilter, toggle_temporary_collection };
