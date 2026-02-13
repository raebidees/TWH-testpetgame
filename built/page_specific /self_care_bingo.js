import { gen_plant_data, encode_plant_data_v2, drawPlantForSquare } from "../gen_plant.js";
import { shuffleArray } from "../shared.js";
import { restoreBingoStateIfPresent, generate_board, setForcedSeed } from "../bingo.js";
const d = new Date();
// Fun fact! Javascript apparently numbers days 1-31 but months 0-11. We toString so it doesn't matter, but it's interesting.
// Anyways, this (messily) ensures a fixed set of plants each day. I'd prefer something more OO come refactor time.
var forced_random_seed = d.getDate().toString() + d.getMonth().toString() + d.getFullYear().toString() + "caresalt";
setForcedSeed(forced_random_seed);
var selected_seeds = new Set();
const choose_from = 25;
const max_choose = 7;
async function do_setup() {
    document.getElementById("load_text").remove();
    let restored_state = false;
    try {
        restored_state = restoreBingoStateIfPresent(true);
    }
    catch (e) {
        console.log(e);
        alert("Malformed old bingo state, generating a new board!");
    }
    if (!restored_state) {
        launch_plant_dialogue();
    }
}
function launch_plant_dialogue() {
    let modal = document.createElement("div");
    modal.classList.add("bingo-popup");
    modal.style.padding = "2vh";
    modal.style.textAlign = "center";
    let explanatory_text = document.createElement("span");
    explanatory_text.id = "explanatory_text";
    let grid = document.createElement("div");
    grid.id = "self_care_plant_selector";
    for (let i = 0; i < choose_from; i++) {
        add_self_care_square(grid, i);
    }
    let button_container = document.createElement("div");
    button_container.classList.add("center-what-i-hold");
    let accept_button = document.createElement("input");
    accept_button.id = "self_care_ready_button";
    accept_button.type = "button";
    accept_button.value = "Ready!";
    accept_button.onclick = function () {
        if (selected_seeds.size != max_choose) {
            return;
        }
        document.body.removeChild(modal);
        generate_board(5, "s", shuffleArray(Array.from(selected_seeds)));
    };
    accept_button.classList.add("chunky_wrap");
    modal.appendChild(explanatory_text);
    modal.appendChild(grid);
    button_container.appendChild(accept_button);
    modal.appendChild(button_container);
    document.body.appendChild(modal);
    update_remaining();
}
function update_remaining() {
    let remaining = max_choose - selected_seeds.size;
    document.getElementById("explanatory_text").textContent = "Choose " + remaining + " plants as rewards for today's self-care bingo:";
    let button = document.getElementById("self_care_ready_button");
    button.value = "Pick " + remaining + " more above";
    if (remaining == 0) {
        button.style.color = window.getComputedStyle(document.body, null).getPropertyValue("--font-color");
        button.value = "Let's go!";
    }
    else {
        button.style.color = window.getComputedStyle(document.body, null).getPropertyValue("--text-outline");
    }
}
// Largely similar to bingo squares
async function add_self_care_square(parent, id) {
    let swap_square = document.createElement('button');
    swap_square.id = "selfcare_plant_" + id;
    swap_square.classList.add('self_care_choice');
    swap_square.onclick = function (e) {
        let square = document.getElementById(e.target.id);
        let was_active = square.classList.contains("active");
        if (was_active) {
            square.classList.remove("active");
            square.style.borderColor = window.getComputedStyle(document.body, null).getPropertyValue("--hover-color");
            square.style.backgroundColor = window.getComputedStyle(document.body, null).getPropertyValue("--background-color");
            selected_seeds.delete(square.getAttribute("data-seed"));
        }
        else {
            if (selected_seeds.size >= max_choose) {
                return;
            }
            square.classList.add("active");
            square.style.borderColor = window.getComputedStyle(document.body, null).getPropertyValue("--accent-medium");
            square.style.backgroundColor = window.getComputedStyle(document.body, null).getPropertyValue("--hover-color");
            selected_seeds.add(square.getAttribute("data-seed"));
        }
        update_remaining();
    };
    let plant_data = gen_plant_data(0, forced_random_seed + id);
    let seed = encode_plant_data_v2(plant_data);
    let data_url = drawPlantForSquare(seed);
    swap_square.setAttribute("data-seed", seed);
    swap_square.style.background = 'url(' + data_url + ')  no-repeat center center';
    parent.appendChild(swap_square);
    return id;
}
do_setup();
