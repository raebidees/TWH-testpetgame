import { drawPlantForSquare, gen_plant_data, encode_plant_data_v2 } from "../gen_plant.js";
import { getDissolvingRS, bubble_out, bubble_up } from "../shared.js";
const d = new Date();
//const available_sounds = [new Audio("sounds/fsharp_3_bell.mp3"), new Audio("sounds/asharp_bell.mp3"),
//                            new Audio("sounds/csharp_bell.mp3"), new Audio("sounds/fsharp_4_bell.mp3")];
const num_tasks_per_set = 3; // Every X, increment the salt
const plants_to_choose_from = 7; // How many plants each tasks presents
const forced_random_seed = d.getDate().toString() + d.getMonth().toString() + d.getFullYear().toString() + "todo";
const max_outstanding_tasks = 10; // To incentivize avoiding overwhelming yourself, the max number of tasks you can have outstanding while still choosing plants
var task_sets_generated = 0;
const task_hints = ["Done anything nice for yourself lately?", "Anyone you've been meaning to respond to?",
    "How are you doing on food?", "How go the hobbies as of late?", "Any meals you're excited for?",
    "Got anything coming up you'd want to prep for?", "How are you doing on deadlines, anything coming up?",
    "Anything you need picked up from the store?", "Ooh, how go the longterm projects?",
    "Any paperwork you have to get through?", "What're you're looking forward to?",
    "How's school/work going?", "Is there anything you've been meaning to tidy up?",
    "What're you thinking for the future? Any plans you're excited about?",
    "Have you got any birthdays or anniversaries coming up?", "Anything your body needs?",
    "Any big tasks you could break down into smaller ones?", "Anything to add to your calendar?"
];
var active_plant_selector;
const checkbox_flash = window.getComputedStyle(document.documentElement).getPropertyValue("--accent-bright");
const checkbox_neutral = window.getComputedStyle(document.documentElement).getPropertyValue("--accent-medium");
// Generate a brand new task; most logic is connected to task elements, so a bit beefy
function generateTask(is_checked = false, reward_seed = "", desc = "") {
    let id = task_sets_generated;
    let list_item = document.createElement("li");
    list_item.setAttribute("idx", id);
    list_item.classList.add("center-what-i-hold");
    // Textbox, handles saving tasks and spawning selection box
    let textbox_holder = document.createElement("div");
    textbox_holder.style.marginTop = "auto";
    textbox_holder.style.maxWidth = "100em";
    textbox_holder.style.transition = "width 1s";
    let textbox = document.createElement("span");
    textbox.role = "textbox";
    textbox.style.width = "100%";
    textbox_holder.style.width = "0px";
    textbox.contentEditable = true;
    textbox_holder.appendChild(textbox);
    textbox.className = "dotted-fill-in";
    textbox.id = "desc_" + id;
    textbox.placeholder = task_hints[Math.floor(Math.random() * task_hints.length)];
    if (desc != "") {
        textbox.textContent = desc;
    }
    ;
    textbox.addEventListener("focusout", saveTasks, true);
    //let target_width = window.matchMedia('(min-width: 600px)') ? "60vw" : "90vw";
    setTimeout(function () {
        textbox_holder.style.width = "100%";
        //textbox_holder.style.flexGrow = 1;
    }, 200);
    // We'll come back to this, we just need it up front for the bind.
    let prize_display_square = document.createElement('button');
    let prize_choose_function = function () { makePlantSelector(textbox); };
    // Checkbox, handles animation, overall state tracking, and strikethrough
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo_checkbox";
    checkbox.id = "task_" + id;
    if (is_checked) {
        checkbox.checked = true;
        textbox.disabled = true;
        checkbox.classList.add("disabled_cust");
        textbox.style.textDecoration = "line-through";
        textbox.contentEditable = false;
        //setTimeout(function () { checkbox.dispatchEvent(new CustomEvent("change")) }, 75); // Let task creation finish
    }
    if (document.body.animate) {
        checkbox.addEventListener('change', bubble_up);
    }
    checkbox.addEventListener('change', function () {
        textbox.disabled = true;
        checkbox.classList.add("disabled_cust");
        prize_display_square.removeEventListener("click", prize_choose_function, true);
        textbox.style.textDecoration = "line-through";
        textbox.contentEditable = false;
        checkbox.style.accentColor = checkbox_flash;
        saveTasks();
        if (active_plant_selector != undefined && active_plant_selector.getAttribute("idx") == id) {
            gracefullyRemoveOldSelector();
        }
        if (Math.random() < 1 / 7 || getListStatus()["checked"] > 9) {
            document.getElementById("todo_clear_completed").classList.add("todo_glowing");
        }
        setTimeout(function () { checkbox.style.accentColor = checkbox_neutral; }, 5);
        //setTimeout(function () { checkbox.style.accentColor = "#36243c"; }, 5)
    }.bind({ "textbox": textbox, "checkbox": checkbox, "id": id, "prize_display_square": prize_display_square }));
    list_item.appendChild(checkbox);
    // Though the checkbox needs the textbox for the onclick, we add it after to get the layout right
    list_item.appendChild(textbox_holder);
    // Prize display, defaults to first awardable prize for the set
    prize_display_square.id = "task_" + id + "_reward";
    prize_display_square.classList.add('todo_choice');
    list_item.appendChild(prize_display_square);
    if (reward_seed == "") {
        let salt = forced_random_seed + (Math.floor(id / num_tasks_per_set) * plants_to_choose_from + id % num_tasks_per_set);
        let plant_data = gen_plant_data(0, salt);
        reward_seed = encode_plant_data_v2(plant_data);
    }
    let data_url = drawPlantForSquare(reward_seed);
    prize_display_square.setAttribute("data-seed", reward_seed);
    prize_display_square.style.background = 'url(' + data_url + ')  no-repeat center center';
    prize_display_square.addEventListener("click", prize_choose_function, true);
    document.getElementById("task_div").appendChild(list_item);
    textbox.focus();
    textbox.scrollIntoView();
    task_sets_generated += 1;
}
// Generate the "reward box" that displays while editing a task. Contains plants to pick from.
function makePlantSelector(element) {
    // First off, handle existing reward boxes--we only want one open at a time for coherence
    if (active_plant_selector != undefined) {
        if (active_plant_selector.getAttribute("idx") == element.parentNode.parentNode.getAttribute("idx")) {
            // Toggle display
            if (active_plant_selector.getBoundingClientRect()["height"] > 5) {
                setTimeout(function () { active_plant_selector.style.height = "0px"; }, 5);
            }
            else {
                setTimeout(function () { active_plant_selector.style.height = active_plant_selector.getAttribute("target-height"); }, 5);
            }
            return;
        }
        else {
            gracefullyRemoveOldSelector();
        }
    }
    // Set up some mildly nightmarish nesting to handle the expand/contract animations
    // Our textbox receiving focus is in a div for handling alignment, the element above that is our list entry.
    let id = element.parentNode.parentNode.getAttribute("idx");
    let plant_select_hider_div = document.createElement("div");
    plant_select_hider_div.style.overflow = "hidden";
    plant_select_hider_div.style.height = "fit-content";
    let plant_select_div = document.createElement("div");
    plant_select_div.setAttribute("idx", id);
    let can_select = getListStatus()["unchecked"] < max_outstanding_tasks;
    let textbox = document.createElement("p");
    textbox.innerHTML = can_select ? "Choose what you'll earn when you complete this task!" : "Once there's less than " + max_outstanding_tasks + " unfinished tasks, you can select from all the rewards!";
    textbox.style.margin = "0px";
    textbox.style.paddingTop = "8px";
    plant_select_div.appendChild(textbox);
    plant_select_div.id = "todo_plant_selector_container";
    let grid = document.createElement("div");
    grid.id = "todo_plant_selector";
    let size = window.innerWidth > 450 ? 144 : 96;
    if (size == 96) {
        grid.classList.add("todo_plant_selector_minified");
    }
    else {
        grid.classList.add("todo_plant_selector_standard");
    }
    // Generate the selection of plants to choose from
    let prize_display_square = document.getElementById("task_" + id + "_reward");
    for (let i = 0; i < plants_to_choose_from; i++) {
        let prize_select_square = document.createElement('button');
        prize_select_square.classList.add('todo_choice');
        prize_select_square.style.width = size + "px";
        prize_select_square.style.height = size + "px";
        let salt = forced_random_seed + (Math.floor(id / num_tasks_per_set) * plants_to_choose_from + i % plants_to_choose_from);
        let plant_data = gen_plant_data(0, salt);
        let seed = encode_plant_data_v2(plant_data);
        let data_url = drawPlantForSquare(seed, size);
        let prize_url = data_url;
        prize_select_square.setAttribute("data-seed", seed);
        prize_select_square.style.background = 'url(' + data_url + ')  no-repeat center center';
        if (size == 96) {
            prize_url = drawPlantForSquare(seed);
        } // Return to realsize for the display.
        if (can_select) {
            prize_select_square.onclick = function () {
                prize_display_square.setAttribute("data-seed", seed);
                setTimeout(function () { prize_display_square.style.background = 'url(' + prize_url + ')  no-repeat center center'; }, 100);
                bubble_out(prize_display_square, seed);
                setTimeout(function () { plant_select_div.style.height = "0px"; }, 5);
                // This feels like such a bad idea, but it works...eat the next call to this function, then return focus to the task.
                document.getElementById('desc_' + id).focus();
            }.bind(prize_display_square, prize_select_square, seed, prize_url);
        }
        else {
            if (i != id % num_tasks_per_set) {
                prize_select_square.style.opacity = 0.2;
            }
            prize_select_square.onclick = function () { setTimeout(function () { plant_select_div.style.height = "0px"; }, 5); };
        }
        grid.appendChild(prize_select_square);
    }
    // Stitch it all together
    plant_select_div.appendChild(grid);
    plant_select_hider_div.appendChild(plant_select_div);
    element.parentNode.appendChild(plant_select_hider_div);
    plant_select_div.setAttribute("target-height", plant_select_div.getBoundingClientRect()["height"] + "px");
    plant_select_div.style.height = "0px";
    setTimeout(function () { plant_select_div.style.height = plant_select_div.getAttribute("target-height"); }, 5);
    active_plant_selector = plant_select_div;
}
// Get rid of an old "reward box"
function gracefullyRemoveOldSelector() {
    let old_selector = active_plant_selector;
    old_selector.disabled = true;
    old_selector.style.height = "0px";
    setTimeout(function () {
        old_selector.parentNode.remove();
    }.bind(old_selector), 760);
}
function rememberTasks() {
    let text;
    let force_fill_plants = false;
    if (localStorage.todo_tasks == undefined) {
        text = "uD3TIPCX7mOWelcome to the to-do list! Click a task to edit it, click the sprite to its right to pick what plant it'll give you. The selection changes every five tasks, and you can pick duplicates.|SEP|uD1BB2COlGNClick the box on the left to mark a task complete and the plant will be added to your collection! These first three are all freebies.|SEP|uCMq71B-AIsClearing completed tasks (bottom button) may reward RS. The chance doubles once the button starts glowing. Happy tasking!";
        force_fill_plants = true;
    }
    else {
        text = localStorage.todo_tasks;
    }
    if (localStorage.todo_count != undefined) {
        let count = localStorage.todo_count.split("|SEP|");
        if (count[0] == d.getDate()) {
            task_sets_generated = Number(count[1]);
        }
    }
    let tasks = text.split("|SEP|");
    let task_count = 0;
    for (const task of tasks) {
        if (task.length < 10) {
            continue;
        }
        let checked = task[0] == "c" ? true : false;
        let seed = force_fill_plants ? "" : task.slice(1, 11);
        let desc = task.slice(11);
        setTimeout(function () { generateTask(checked, seed, desc); }.bind(checked, seed, desc), task_count * 150);
        task_count++;
    }
    if (force_fill_plants) {
        setTimeout(function () { saveTasks(); }, task_count * 150 + 50);
    }
    while (task_count < 5) {
        setTimeout(function () { generateTask(); }, task_count * 150);
        task_count++;
    }
}
// Stash the existing filled-out tasks
function saveTasks() {
    let msg = "";
    const children = document.getElementById("task_div").childNodes;
    for (const node of children) {
        if (node.id === undefined) {
            continue;
        }
        let idx = node.getAttribute("idx");
        let desc = document.getElementById("desc_" + idx).textContent;
        if (desc == "") {
            continue;
        }
        msg += document.getElementById("task_" + idx).checked ? "c" : "u";
        msg += document.getElementById("task_" + idx + "_reward").getAttribute("data-seed");
        msg += desc + "|SEP|";
    }
    localStorage.todo_tasks = msg;
    localStorage.todo_count = d.getDate() + "|SEP|" + (task_sets_generated - getListStatus()["unchecked"]);
    let p = document.createElement("p");
    p.innerHTML = "Saved progress!";
    p.style.position = 'fixed';
    p.style.bottom = "10px";
    p.style.left = "10px";
    document.body.appendChild(p);
    const anim = p.animate([{ opacity: 1 }, { opacity: 1 }, { opacity: 0 }], { duration: 2000, easing: 'linear' });
    anim.onfinish = () => { p.remove(); };
}
// Find out how many things are checked/unchecked
function getListStatus() {
    let unchecked = 0;
    let checked = 0;
    const children = document.getElementById("task_div").childNodes;
    for (const node of children) {
        // Mystery text node?
        if (node.id === undefined) {
            continue;
        }
        // Object oriented would probably make this less seedy
        let idx = node.getAttribute("idx");
        if (document.getElementById("task_" + idx).checked) {
            checked++;
        }
        else {
            unchecked++;
        }
    }
    return { "unchecked": unchecked, "checked": checked };
}
// Remove checked things from the list with a nice little animation
function clearCompleted() {
    let checked = 0;
    const children = document.getElementById("task_div").childNodes;
    let clearButton = document.getElementById("todo_clear_completed");
    let multiplier = clearButton.classList.contains("todo_glowing") ? 2 : 1;
    clearButton.classList.remove("todo_glowing");
    const reward_rs = getDissolvingRS(clearButton, Math.floor(Math.random() * 2 + 1), 0.15 * multiplier);
    if (multiplier > 1) {
        reward_rs();
    }
    for (let i = children.length - 1; i > 0; i--) {
        let node = children[i];
        if (node.id === undefined) {
            continue;
        }
        let idx = node.getAttribute("idx");
        if (document.getElementById("task_" + idx).checked) {
            checked++;
            setTimeout(function () {
                node.classList.add("fadeout");
                let elem = document.getElementById("desc_" + idx);
                elem.style.height = elem.offsetHeight;
                elem.style.whiteSpace = "nowrap";
                elem.style.width = "0px";
                reward_rs();
                setTimeout(function () { node.remove(); }, 760);
            }.bind(idx, checked), checked * 200);
        }
    }
    setTimeout(function () { saveTasks(); }, 800 + checked * 200);
}
function doSetup() {
    rememberTasks();
    document.getElementById("load_text").remove();
    document.getElementById("todo_clear_completed").style.display = "inline-block";
}
doSetup();
document.getElementById("todo_add_new").onclick = function () { generateTask(false, "", ""); };
document.getElementById("todo_clear_completed").onclick = clearCompleted;
