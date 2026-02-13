import { available_overlay_colors } from "./gen_garden.js";
import { all_palettes } from "./data.js";
import { work_canvas_size, samplePlantColor } from "./gen_plant.js";

// Contains general utility functions used by multiple pages.
// Modified version of the Okabe-Ito colorblind palette, replacing black with white due to dark website background
const OFFSET_COLORS = ["#FFFFFF", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7", "#999999"]


// Generate some spaced x-coordinates to ex: assign plants to
// Used with smart placement
function createSpacedPlacementQueue(total_width, with_spacing=64){
  let x_coords = [];
  // Random number between, by default, 0 and 16 (remember we already place ground-centered in a 64x area)
  var range = Math.floor(with_spacing/4);
  let current_x = Math.floor(Math.random()*range);
  // 64 below to avoid plants getting cut off on the edges.
  while(current_x < (total_width-64)){
    x_coords.push(current_x);
    current_x += with_spacing+Math.floor(Math.random()*range*2-range);
  }
  return x_coords
}


// Open a new page to claim the contents of a canvas.
function claimCanvas(canvas){
  var new_window = window.open();
  var image = new_window.document.createElement('img');
  var instructions = new_window.document.createElement('p');
  instructions.innerHTML = "Right-click the image and save it, or copy it to a host like Imgur or Discord";
  image.src = canvas.toDataURL();
  new_window.document.body.appendChild(image);
  new_window.document.body.appendChild(instructions);
  return new_window;
}


function collectSeed(seed){
  let seeds = sortAndVerifySeedList(seed);
  if (seeds.length == 0){
    return;
  }
  else if (localStorage.seed_collection == undefined) {
    localStorage.seed_collection = seeds;
  } else {
    localStorage.seed_collection = seeds + "," + localStorage.seed_collection;
  }
}


function buildColorMessage(raw_plant_data, do_links=true){
  let color_msg = "";
  if(raw_plant_data["foliage"] == 160){
    color_msg += "This seed is malformed"
  } else {
    for(let category of ["foliage_palette", "feature_palette", "accent_palette"]){
      let link_color = "#"+ all_palettes[raw_plant_data[category]]["palette"][0];
      if(do_links){
        color_msg += ("<a href='javascript:forceFilter(-1, " + raw_plant_data[category] + ");' style='text-decoration-color: " + link_color + "'><span style='color: " + link_color + "'>" + all_palettes[raw_plant_data[category]]["name"]+"</a></span> ");
      } else {
        color_msg += ("<span style='color: " + link_color + "'>" + all_palettes[raw_plant_data[category]]["name"]+"</span> ");
        
      }
    }
  }
  return color_msg;
}

function getDissolvingRS(parent, amount, chance){
  return function () {
    if(Math.random() > chance){
      return;
    }
    addSeedPoints(amount);
    let p = document.createElement("p");
    p.innerHTML = "+" + amount + " rs";
    p.className = "rs_message";
    //p.style.position = 'absolute';
    //p.style.top = `${e.clientY}`;
    //p.style.left = `${e.clientX}`;
    parent.appendChild(p);
    const anim = p.animate([
      {
        transform: `translate(0px, 0px)`,
        opacity: 1
      },
      {
        transform: `translate(0px, -50px)`,
        opacity: 0
      }
    ], {
      duration: 1000,
      easing: 'linear',
    });
    anim.onfinish = () => { p.remove() };
  }.bind(parent, amount, chance);
}


function addSeedPoints(amount_to_add){
  if (localStorage.seed_points == undefined) {
    localStorage.seed_points = amount_to_add;
  } else {
    localStorage.seed_points = Number(localStorage.seed_points) + amount_to_add;
  }
}


function getSeedPoints(){
  if (localStorage.seed_points == undefined) {
    localStorage.seed_points = 10;
  }
  return Number(localStorage.seed_points);
}


// Niche method for find-replace, you probably want its neighbor
function getSeedCollectionAsString(){
  if (localStorage.seed_collection == undefined) {
    return "";
  }
  return localStorage.seed_collection;
}


function getSeedCollection(){
  let collection = getSeedCollectionAsString();
  if (collection == "") {
    return [];
  }
  return collection.split(",");
}

function getGoodieCollection(){
  if (localStorage.goodie_collection == undefined) {
    localStorage.goodie_collection = ["nigel"];
  }
  return localStorage.goodie_collection.split(",");
}

function getMarkedBases(){
  if (localStorage.marked_bases == undefined) {
    return [];
  }
  return localStorage.marked_bases.split(",").map(Number);
}

function getMarkedPalettes(){
  if (localStorage.marked_palettes == undefined) {
    return [];
  }
  return localStorage.marked_palettes.split(",").map(Number);
}

function collectGoodie(goodie_name){
  if (localStorage.goodie_collection == undefined) {
    getGoodieCollection();  // Initialize
  }
  localStorage.goodie_collection = goodie_name + "," + localStorage.goodie_collection;
}


// Used mostly in the collection, parses a list of seeds, splitting it into named and unnamed
function sortAndVerifySeedList(raw_list){
  let true_seeds = [];
  if(raw_list.length == 0){
    return true_seeds;
  }
  let split_seeds = raw_list.split(" ").join("").replace(/(^,)|(,$)/g, '').split(",");;
  for(let seed of split_seeds){
    if(seed.startsWith("!")){
      continue;  // we skip these here
    }
    else if(seed.length != 10){
      alert("You seem to have a malformed seed! Seeds are 10 characters long, but got \""+seed+"\". Skipping!");
    } else {
      true_seeds.push(seed);
    }
  }
  return true_seeds;
}

// Given an index, retrieve the associated color. Color palette loops.
function getOffsetColor(idx){
  return OFFSET_COLORS[idx % OFFSET_COLORS.length];
}


// Returns true if there's a non-transparent pixel in `row` in ImageData `image_data`. Row is 0-indexed.
// Modified from https://stackoverflow.com/questions/11796554/automatically-crop-html5-canvas-to-contents
function hasPixelInRow(image_data, row, width=work_canvas_size){
  var index, x;
  for (x = 0; x < width; x++) {
    index = (row * width + x) * 4;
    if (image_data.data[index+3] > 0) {
      return true;
    }
  }
  return false;
}

// Shuffles an array in place
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const randomFromArray = (arr) => { return arr[Math.floor(Math.random()*arr.length)];}

const randomValueFromObject = (obj) => {
  var keys = Object.keys(obj);
  return obj[keys[ keys.length * Math.random() << 0]];
};

function hexToRgb(hex) {
  // taken from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function get_overlay_color_from_name(color, alpha){
  color = color.slice(1);
  if(Object.prototype.hasOwnProperty.call(available_overlay_colors, color)){ color = available_overlay_colors[color]; }
  let rgb_code = hexToRgb(color)
  rgb_code.push(255*alpha)
  return rgb_code;
}

function get_hex_from_name(color){
  color = color.slice(1);
  if(Object.prototype.hasOwnProperty.call(available_overlay_colors, color)){ color = available_overlay_colors[color]; }
  return color;
}

function getRandomKeyFromObj(obj){
  return Object.keys(obj)[Math.floor(Math.random() * Object.keys(obj).length)];
}


function addRadioButton(parent, name, label, checked, onclick=null) {
  let radio_button = document.createElement('input');
  radio_button.setAttribute('type', 'radio');
  radio_button.setAttribute('name', name);
  let id = name + "_" + label;
  radio_button.id = id;
  radio_button.checked = checked;
  radio_button.value = label;
  let radio_button_label = document.createElement('label');
  radio_button_label.setAttribute('for', id);
  radio_button_label.textContent = label;
  radio_button_label.classList.add("unselectable");
  if(onclick != null){
    radio_button.onclick = onclick;
  }
  parent.appendChild(radio_button);
  parent.appendChild(radio_button_label);
}

function addStylizedRadioButton(parent, name, label, checked, onclick=null) {
  let radio_button = document.createElement('input');
  radio_button.setAttribute('type', 'radio');
  radio_button.setAttribute('name', name);
  radio_button.className = "radio-button";
  radio_button.style.display = "none";
  let id = name + "_" + label;
  radio_button.id = id;
  radio_button.checked = checked;
  radio_button.value = label;
  let radio_button_label = document.createElement('label');
  radio_button_label.setAttribute('for', id);
  radio_button_label.textContent = label;
  radio_button_label.classList.add("unselectable");
  radio_button_label.classList.add("prompt_label");
  if(onclick != null){
    radio_button.onclick = onclick;
  }
  parent.appendChild(radio_button);
  parent.appendChild(radio_button_label);
}


function getRadioValue(name) {
  var ele = document.getElementsByName(name);
  for(let i = 0; i < ele.length; i++) {
    if(ele[i].checked) {return ele[i].value};
  }
}


function makeSortCheckmark(prefix, name, parent, checked=false) {
  let checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.value = name;
  checkbox.id = prefix+name;
  checkbox.checked = checked
  let label = document.createElement("label");
  label.setAttribute("for", checkbox.id);
  label.innerHTML = name;
  label.classList.add("unselectable");
  label.style.marginRight = "15px";
  parent.appendChild(checkbox);
  parent.appendChild(label);
  parent.appendChild(document.createElement("br"));
}

// From https://css-tricks.com/converting-color-spaces-in-javascript/
// Slight modification: we only need hue, and use lightness to break ties.
function toHue(H){
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r,g,b),
  cmax = Math.max(r,g,b),
  delta = cmax - cmin,
  h = 0,
  l = 0;
  
  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
  h = (r - g) / delta + 4;
  
  h = Math.round(h * 60);
  
  if (h < 0)
    h += 360;
  
  l = (cmax + cmin) / 2;
  l = +(l * 100).toFixed(1);
  
  return h+(1-l/100);
}


function getBase64(file) {
  return new Promise(function(resolve) {
    var reader = new FileReader();
    reader.onloadend = function() {
      resolve(reader.result)
    }
    reader.readAsDataURL(file);
  })
}

/**function cloneCanvas(orig) {
let clone = document.createElement('canvas');
let clone_ctx = clone.getContext('2d');
clone.width = orig.width; clone.height = orig.height;
clone_ctx.drawImage(orig, 0, 0);
return clone;
}**/

function gen_toggle_button(target_var, target_func, initial_val=true){
  let button = document.createElement("button");
  button.id = target_var + "_setting_toggle";
  button.className = "toggle_button";
  button.onclick = cycle_toggle_value.bind(button, target_var, target_func);
  button.textContent = "["+target_var.slice(0,1).toUpperCase()+target_var.slice(1)+": "+bool_to_text(initial_val)+"]";
  return button
}

function gen_func_button(text, target_func){
  let button = document.createElement("button");
  button.id = text;
  button.className = "toggle_button";
  button.onclick = target_func;
  button.textContent = "["+text+"]";
  return button
}

function get_toggle_button_setting(setting){
  let target_elem = document.getElementById(setting + "_setting_toggle");
  if(!target_elem){ return true;}
  let start_pos = setting.length+4;
  let val = target_elem.textContent.slice(start_pos, start_pos+1);
  if(val=="N"){return true;}else{return false;}  // ON or OFF
}

function cycle_toggle_value(setting, target_func){
  let target_elem = document.getElementById(setting + "_setting_toggle");
  let val = !get_toggle_button_setting(setting);
  target_elem.textContent = "["+setting.slice(0,1).toUpperCase()+setting.slice(1)+": "+bool_to_text(val)+"]";
  target_func();
}

function bool_to_text(bool){
  if(bool){return "ON";}
  else{return "OFF";}
}

// This next bit was shamelessly stolen from https://css-tricks.com/playing-with-particles-using-the-web-animations-api/
// Genuinely learning a lot here...maybe I'll even learn Javascript some day? :)
// But really, it's a fantastic tutorial. I should (TODO) revisit
function bubble_up(e) {
    let reward_seed = document.getElementById(e.target.id + "_reward").getAttribute("data-seed");
    collectSeed(reward_seed);
    document.getElementById("top_spacer").innerHTML += reward_seed + ",";
    let bubble_palette = samplePlantColor(reward_seed);
    for (let i = 0; i < 75; i++) {
        // We root them to a random location slightly below the bottom of the window
        createPlantParticle(Math.random() * window.innerWidth, window.innerHeight + 10, bubble_palette);
    }
}

function bubble_out(element, seed=null) {
    if(seed === null){
        seed = document.getElementById(element.id + "_reward").getAttribute("data-seed");
    }
    let bubble_palette = samplePlantColor(seed);
    let rect = element.getBoundingClientRect();
    let x = (rect.right-rect.left)/2+rect.left;
    let y = (rect.bottom-rect.top)/2+rect.top;
    for (let i = 0; i < 10; i++) {
        createPlantParticle(x, y, bubble_palette, false);
    }
}


function createPlantParticle(x, y, base_palette, up_only=true) {
    // Create a custom particle element
    const particle = document.createElement('plant_particle');
    // Append the element into the body
    document.body.appendChild(particle);
    // Calculate a random size from 10px to 50px
    const size = Math.floor(Math.random() * 40 + 10);
    // Apply the size on each particle
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    // Grab a color from a (plant) palette
    particle.style.background = getRandomizedColorFrom(base_palette);
    // Generate a random y destination within the bottom half-ish of the screen
    // or some random position within 100px
    let destinationX, destinationY;
    if(up_only){
        destinationX = x;  // TODO: dumb
        destinationY = y - Math.random() * window.innerHeight / 2 - 50;
    } else {
        destinationX = x + (Math.random() - 0.5) * 200;
        destinationY = y + (Math.random() - 0.5) * 200;
    }

    // Store the animation in a variable because we will need it later
    const animation = particle.animate([
        {
            // Set the origin position of the particle
            // We offset the particle with half its size to center it
            transform: `translate(${x - (size / 2)}px, ${y - (size / 2)}px)`,
            opacity: 1
        },
        {
            // We define the final coordinates as the second keyframe
            transform: `translate(${destinationX}px, ${destinationY}px)`,
            opacity: 0
        }
    ], {
        // Set a random duration from 1500 to 2500ms
        duration: 1500 + Math.random() * 1000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        // Delay every particle with a random value from 0ms to 200ms
        delay: Math.random() * 200
    });
    animation.onfinish = () => {
        particle.remove();
    };
}

// picks a random color, makes it more pastel and varies it a bit.
function getRandomizedColorFrom(palette) {
    const rgb_color = palette[Math.floor(Math.random() * palette.length)];
    return `rgb(${rgb_color[0] + 50}, ${rgb_color[1] + 50}, ${rgb_color[2] + 50})`;
}

// Gratefully taken from https://evanhahn.com/javascript-compression-streams-api-with-strings/#what-can-go-wrong
// Really only used to deincentivize modifying save data. Not much of a hurdle, but perhaps enough.
/**
 * Convert a string to its UTF-8 bytes and compress it.
 *
 * @param {string} str
 * @returns {Promise<Uint8Array>}
 */
async function compress(str) {
  // Convert the string to a byte stream.
  const stream = new Blob([str]).stream();

  // Create a compressed stream.
  const compressedStream = stream.pipeThrough(
    new CompressionStream("gzip")
  );

  // Read all the bytes from this stream.
  const chunks = [];
  for await (const chunk of compressedStream) {
    chunks.push(chunk);
  }
  return await concatUint8Arrays(chunks);
}

/**
 * Decompress bytes into a UTF-8 string.
 *
 * @param {Uint8Array} compressedBytes
 * @returns {Promise<string>}
 */
async function decompress(compressedBytes) {
  // Convert the bytes to a stream.
  const stream = new Blob([compressedBytes]).stream();

  // Create a decompressed stream.
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream("gzip")
  );

  // Read all the bytes from this stream.
  const chunks = [];
  for await (const chunk of decompressedStream) {
    chunks.push(chunk);
  }
  const stringBytes = await concatUint8Arrays(chunks);

  // Convert the bytes to a string.
  return new TextDecoder().decode(stringBytes);
}

/**
 * Combine multiple Uint8Arrays into one.
 *
 * @param {ReadonlyArray<Uint8Array>} uint8arrays
 * @returns {Promise<Uint8Array>}
 */
async function concatUint8Arrays(uint8arrays) {
  const blob = new Blob(uint8arrays);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

async function export_save(){
  var a = document.createElement('a');
  const compressedBytes = await compress(JSON.stringify(localStorage));
  // Couple bytes of gobbldygook up front so Linux stops un-gzipping my danged saves.
  // You reading the save file """encryption""" because you're up to something? :) Yeah just delete the first 4.
  var blob = new Blob([1,5,'a',2].concat([compressedBytes]), { 'type': 'application/octet-stream' });
  a.href = window.URL.createObjectURL(blob);
  a.download = "endless_garden_save_" + new Date().toJSON().slice(0, 10) + ".egsav";
  a.click();
}

// Meant to be attached to a filereader, see settings.html
function import_save(){
    document.getElementById("import_data_button").innerText = "Loading...";
    const file = this.files[0];
    const reader = new FileReader(file);
    reader.onload = async function(content) {
      try {
        let parsed_content = new Uint8Array(content.target.result);
        let save_data = await decompress(parsed_content.slice(4));
        let newLocalData = JSON.parse(save_data);
        for(let entry in newLocalData){
            localStorage[entry] = newLocalData[entry];
        }
        location.reload();
        document.getElementById("import_data_button").innerText = "Save Loaded!";
        setTimeout(function(){document.getElementById("import_data_button").innerText = "Import Save";}, 1500);
      } catch(e) {
          alert("Something was wrong with the data! Contact Ora for troubleshooting");
          document.getElementById("import_data_button").innerText = e;
      }
    };
    reader.readAsArrayBuffer(file);
}

function delete_save(e){
  let t;
    var repeat = function () {
        let remaining = 5;
        if(e.target.innerText[0] === "D"){
            remaining = 6;
        } else if(e.target.innerText[0] === "S"){
            return;
        } else {
            remaining = Number(e.target.innerText.slice(e.target.innerText.length-1,));
        }
        if(remaining > 1){
            e.target.innerText = "Hold for " + (remaining - 1);
        } else {
            localStorage.clear();
            e.target.innerText = "Save Deleted!";
            setTimeout(location.reload(), 300);
            return;
        }
        t = setTimeout(repeat, 1000);
    e.target.onmouseup = function () {
        clearTimeout(t);
        e.target.innerText = "Delete Save (hold to confirm)";
    };
  }
    repeat();
};




export {gen_toggle_button, gen_func_button, createSpacedPlacementQueue, shuffleArray, hasPixelInRow,
  get_overlay_color_from_name, claimCanvas, getBase64, get_hex_from_name, bubble_up, bubble_out,
  collectSeed, buildColorMessage, getDissolvingRS, getSeedCollection, getSeedPoints, collectGoodie,
  randomFromArray, randomValueFromObject, getRandomKeyFromObj, addRadioButton, makeSortCheckmark,
  getRadioValue, toHue, hexToRgb, addSeedPoints, getSeedCollectionAsString, getGoodieCollection, getMarkedBases,
  getMarkedPalettes, getOffsetColor, get_toggle_button_setting, sortAndVerifySeedList,
  export_save, import_save, delete_save, cycle_toggle_value, rgbToHex, addStylizedRadioButton};
  
  
  
