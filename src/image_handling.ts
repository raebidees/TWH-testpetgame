import { hexToRgb, getBase64, get_hex_from_name } from "./shared.js";
import { work_canvas_size } from "./gen_plant.js";

// Holder for all the images we'll need
const refs = {};
const wildcard_canvases = {};

// In case of error (probably CORS)
const BAD_IMG_URL = "https://i.imgur.com/kxStIJE.png";

// Sound of me not being 100% confident in my async usage yet
function preload_single_image(url: string) {
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { resolve(img) };
        img.onerror = function () { img.src = BAD_IMG_URL; };
        img.src = url;
    });
    // Not yet supported in common versions of Safari
    /*return fetch(url)
    .then(response => response.blob())
    .then(blob => createImageBitmap(blob));*/
}

function load_sprite_from_groundsheet(img: HTMLImageElement, offset: number) {
    return new Promise(resolve => {
        const new_img = new Image();
        new_img.onload = () => { resolve(new_img); };
        new_img.onerror = function () { new_img.src = BAD_IMG_URL; };
        const canvas = document.createElement("canvas");
        let work_canvas_size = 32;
        canvas.width = work_canvas_size;
        canvas.height = work_canvas_size;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, work_canvas_size, work_canvas_size);
        // All spritesheets are 10 wide, N tall
        const source_offset_y = Math.floor(offset / 10) * work_canvas_size;
        const source_offset_x = (offset % 10) * work_canvas_size;
        ctx.drawImage(img, source_offset_x, source_offset_y, work_canvas_size, work_canvas_size, 0, 0, work_canvas_size, work_canvas_size);
        new_img.src = canvas.toDataURL();
    }).then(x => { (<HTMLImageElement>x).decode(); return x; }, () => { console.log("Failed loading at offset " + offset); });
}

async function preload_ground(name: string, URL: string, count: number) {
    const img = <HTMLImageElement> await new Promise(resolve => {
        const base64img = new Image();
        base64img.crossOrigin = "anonymous";
        base64img.onload = () => { resolve(base64img) };
        base64img.onerror = function () { base64img.src = BAD_IMG_URL; };
        base64img.src = URL;
    });
    return img.decode().then(() => {
        let offset = 0;
        while (offset < count) {
            refs[name + offset.toString()] = load_sprite_from_groundsheet(img, offset);
            offset++;
        }
    });
}

// Basically just wraps replace_color_palette
function replace_color_palette_single_image(old_palette: string[], new_palette: string[], img: HTMLCanvasElement) {
    const work_canvas = document.createElement("canvas");
    const work_ctx = work_canvas.getContext("2d");
    work_canvas.width = img.width;
    work_canvas.height = img.height;
    work_ctx.drawImage(img, 0, 0);
    replace_color_palette(old_palette, new_palette, work_ctx, img.width, img.height);
    return work_canvas;
}

// Build a "lookup tree" (implemented as a nested obj) used for checking if some pixel exists in a set of palettes.
// new_palettes must be the same length as old_palettes, and its corresponding idx'd palette RGB will be the leaf.
function buildPaletteSwapLookup(old_palettes: string[], new_palettes: string[]) {
    const lookup = {};
    for (let i = 0; i < old_palettes.length; i++) {
        const old_rgb = hexToRgb(old_palettes[i]);
        if (lookup[old_rgb[0]] == undefined) { lookup[old_rgb[0]] = {}; }
        if (lookup[old_rgb[0]][old_rgb[1]] == undefined) { lookup[old_rgb[0]][old_rgb[1]] = {}; }
        lookup[old_rgb[0]][old_rgb[1]][old_rgb[2]] = hexToRgb(new_palettes[i]);
    }
    return lookup
}
const inPaletteSwapLookup = function (lookup: { [x: number]: { [x: number]: { [x: number]: number; }; }; }, rgb: number[]) { return lookup[rgb[0]] != undefined && lookup[rgb[0]][rgb[1]] != undefined && lookup[rgb[0]][rgb[1]][rgb[2]] != undefined }

// Palettes MUST be the same length, FYI
function replace_color_palette(old_palette: string[], new_palette: string[], ctx: CanvasRenderingContext2D, work_canvas_width = work_canvas_size, work_canvas_height = work_canvas_size, alpha = null) {
    const paletteSwap = buildPaletteSwapLookup(old_palette, new_palette);
    let newRGB: number[];
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    const imageData = ctx.getImageData(0, 0, work_canvas_width, work_canvas_height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        // god this is painful to look at. I'm sorry.
        if (inPaletteSwapLookup(paletteSwap, [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]])) {
            newRGB = paletteSwap[imageData.data[i]][imageData.data[i + 1]][imageData.data[i + 2]];
            imageData.data[i] = newRGB[0];
            imageData.data[i + 1] = newRGB[1];
            imageData.data[i + 2] = newRGB[2];
            if (alpha != null) { imageData.data[i + 3] = alpha };
        }
    }
    // put the data back on the canvas
    ctx.putImageData(imageData, 0, 0);
}

function applyOverlay(stencil_canvas: HTMLCanvasElement, palette: string | string[], opacity: number, full_screen=false) {
    const stencil_ctx = stencil_canvas.getContext("2d");
    const return_canvas = document.createElement("canvas");
    let pick_canvas = document.createElement("canvas");
    const pick_ctx = pick_canvas.getContext("2d");
    return_canvas.width = stencil_canvas.width;
    pick_canvas.width = stencil_canvas.width;
    return_canvas.height = stencil_canvas.height;
    pick_canvas.height = stencil_canvas.height;
    if (!Array.isArray(palette)) {
        palette = ["#" + get_hex_from_name(palette)];
    }
    pick_canvas = drawSkyGradient(pick_canvas, palette, opacity);

    return_canvas.width = stencil_canvas.width;
    return_canvas.height = stencil_canvas.height;

    // With our color info loaded, we apply the color itself to its own canvas
    const main_imgData = stencil_ctx.getImageData(0, 0, return_canvas.width, return_canvas.height).data;
    // Zero out the opacity if there's nothing below
    if(!full_screen){
        const pick_imgData = pick_ctx.getImageData(0, 0, return_canvas.width, return_canvas.height);
        for (let i = 0; i < main_imgData.length; i += 4) {
            if (main_imgData[i + 3] == 0) {
                pick_imgData.data[i + 3] = 0;
            }
        }
        pick_ctx.putImageData(pick_imgData, 0, 0);
    }
    //return_ctx.putImageData(return_img, 0, 0);
    stencil_ctx.drawImage(pick_canvas, 0, 0);
    return ({ "canvas": return_canvas, "x_pos": 0, "y_pos": 0, "width": return_canvas.width, "height": return_canvas.height });
}

// tile an image left to right across a canvas at some y
// optionally, offset them all to the left (or right, if you prefer) to
// make the tileables look somewhat different from garden to garden
function tile_along_y(tileCtx: CanvasRenderingContext2D, img: HTMLCanvasElement, yPos: number, width: number, xOffset = 0) {
    let groundXPos = xOffset;
    while (groundXPos < width) {
        tileCtx.drawImage(img, groundXPos, yPos, img.width * 2, img.height * 2);
        groundXPos += img.width * 2;
    }
}

function clearCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Flexibly take input (URL, drag-and-drop, paste, or file upload) for a wildcard by creating a popup box
// attached to some parent. Load whatever we find into all_named
// This is far jankier than it needs to be since Javascript only pauses for prompt, alert, and confirm
// Largely taken from https://soshace.com/the-ultimate-guide-to-drag-and-drop-image-uploading-with-pure-javascript/
async function imageFromPopup(parent: HTMLElement, name_of_image: string, callback: () => void, target_size = work_canvas_size/3*2) {
    const form = document.createElement("div");
    form.className = "wildcard-popup";
    const helptext = document.createElement("div");
    helptext.innerHTML = "<h3>" + name_of_image + "</h3>Paste an image (or image URL), or drag-and-drop one from your files:";
    helptext.style.padding = "1vw";
    helptext.style.textAlign = "center";
    const urlTaker = document.createElement("input");
    urlTaker.style.minHeight = "3vh";
    const preview = document.createElement("img");
    const preview_container = document.createElement("div");
    preview_container.className = "plant_box";
    preview_container.appendChild(preview);
    const confirm_button = document.createElement("input");
    confirm_button.type = "button";
    confirm_button.value = "Confirm";
    confirm_button.style.width = "auto";
    urlTaker.addEventListener("input", async function () {
        if (urlTaker.files == null) {
            preview.src = await resize_for_garden(name_of_image, urlTaker.value, target_size);
        } else {
            await handleImage(urlTaker.files, name_of_image, preview, target_size);
        }
    })
    urlTaker.addEventListener("paste", function (event) {
        const items = (event.clipboardData).items;
        for (const index in items) {
            const item = items[index];
            if (item.kind === 'file') {
                const blob = item.getAsFile();
                handleImage([blob], name_of_image, preview, target_size);
            }
        }
    })
    confirm_button.addEventListener("click", function () {
        parent.removeChild(form);
        // we got here by interrupting initial garden generation; restart it
        callback();
    })
    function preventDefault(e: { preventDefault: () => void; stopPropagation: () => void; }) { e.preventDefault(); e.stopPropagation(); }
    function handleDrop(e) { handleImage(e.dataTransfer.files, name_of_image, preview, target_size); }
    form.addEventListener("dragenter", preventDefault, false);
    form.addEventListener("dragleave", preventDefault, false);
    form.addEventListener("dragover", preventDefault, false);
    form.addEventListener("drop", preventDefault, false);
    form.addEventListener("drop", handleDrop, false);
    form.appendChild(helptext);
    form.appendChild(urlTaker);
    form.appendChild(preview_container);
    form.appendChild(confirm_button);
    parent.appendChild(form);
    urlTaker.focus();
    return form;
}

// Helper for imageFromPopup, handles image file validation
async function handleImage(files: File[] | FileList, name_of_image: string, preview_img: HTMLImageElement, target_size: number) {
    if (files.length > 1) {
        alert("Multiple uploads detected, only the first will be used");
    }
    const file = files[0];
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (validTypes.indexOf(file.type) == -1) {
        alert("Bad file type, please use a png, gif, or jpeg");
    } else {
        const dataURL = await getBase64(file)
        preview_img.src = await resize_for_garden(name_of_image, dataURL, target_size);
    }
}

// TODO: this was hastily-written. Really needs some cleanup
// NOTE: only v2 because of a name collision in gen_garden.js. Can probably replace that with this...
function draw_outline_v2(template_canvas: HTMLCanvasElement) {
    const ctx = template_canvas.getContext("2d");
    const output_canvas = document.createElement("canvas");
    output_canvas.width = template_canvas.width;
    output_canvas.height = template_canvas.height;
    const main_img = ctx.getImageData(0, 0, template_canvas.width, template_canvas.height);
    const main_imgData = main_img.data;
    // We go left to right, marking each position where we switch from background to non-background and vice versa
    // we also get an additional pixel to the left or right to create a 2 pixel wide outline
    const points_to_color = [];
    // If no color is specified, we'll use the nearest (more or less) and darken it
    const colors_to_use = [];
    let outline_color;
    // We try to be smart with transparent overlays; we search for a background color.
    // We expect this loop to either die early or let us leave early
    for (let i = 0; i < main_imgData.length; i += 4) {
        if (main_imgData[i + 3] < 255) {
            outline_color = [main_imgData[i], main_imgData[i + 1], main_imgData[i + 2], main_imgData[i + 3]];
            break;
        }
    }
    // If we didn't find any non-opaque pixels, we have nothing to outline.
    if (outline_color == undefined) { return; }
    // Otherwise, we start the first proper loop, left to right.
    let last_was_background = (main_imgData.slice(0, 4).toString() == outline_color.toString());
    let this_is_background: boolean;
    let most_recent_color = [0, 0, 0];
    for (let i = 4; i < main_imgData.length; i += 4) {
        // Preemptive optimization is the enemy of progress, and yet. And yet.
        if (main_imgData[i + 3] < 200 || (main_imgData[i + 3] == outline_color[3] && main_imgData[i + 0] == outline_color[0] && main_imgData[i + 1] == outline_color[1] && main_imgData[i + 2] == outline_color[2])) {
            this_is_background = true;
        } else {
            this_is_background = false;
            most_recent_color = [main_imgData[i] * 0.75, main_imgData[i + 1] * 0.75, main_imgData[i + 2] * 0.75, 255];
            //most_recent_color = [main_imgData[i] * 1, main_imgData[i + 1] * 1, main_imgData[i + 2] * 1, 255];
        }
        // Note: because our "pixels" are 2x2, this shouldn't cause troubles at the corners...I think
        if (last_was_background && !this_is_background) {
            points_to_color.push(i - 4);
            //points_to_color.push(i-8);
            // NOTE: push twice due to double-thickness
            // TODO: could we do this before the resize? Easy 4x efficiency
            colors_to_use.push(most_recent_color);
            //colors_to_use.push(most_recent_color);

        } else if (this_is_background && !last_was_background) {
            points_to_color.push(i);
            colors_to_use.push(most_recent_color);
            //points_to_color.push(i+4);
            //colors_to_use.push(most_recent_color);
        }
        last_was_background = this_is_background;
    }
    // Now we repeat, drawing our lines top to bottom.
    last_was_background = (main_imgData.slice(0, 4).toString() == outline_color.toString());
    this_is_background = undefined;
    for (let j = 0; j < template_canvas.width; j++) {
        for (let k = 0; k < template_canvas.height; k++) {
            // This is so, so silly...
            if (j == 0 && k == 0) { k = 4 };  // skip our first again.
            // We use our loops to format us up so we look like the prior inner loop for easier troubleshooting.
            // TODO: At this point, I think the remainder could be refactored into a function. Would be a lot cleaner.
            const i = (j + k * template_canvas.width) * 4;
            if (main_imgData[i + 3] < 200 || (main_imgData[i + 3] == outline_color[3] && main_imgData[i + 0] == outline_color[0] && main_imgData[i + 1] == outline_color[1] && main_imgData[i + 2] == outline_color[2])) {
                this_is_background = true;
            } else {
                this_is_background = false;
                most_recent_color = [main_imgData[i] * 0.8, main_imgData[i + 1] * 0.8, main_imgData[i + 2] * 0.8, 255];
            }
            if (last_was_background && !this_is_background) {
                points_to_color.push(i - template_canvas.width * 4);
                //points_to_color.push(i-output_canvas.width*2*4);
                colors_to_use.push(most_recent_color);
                //colors_to_use.push(most_recent_color);
            } else if (this_is_background && !last_was_background) {
                points_to_color.push(i);
                //points_to_color.push(i+output_canvas.width*4);
                colors_to_use.push(most_recent_color);
                //colors_to_use.push(most_recent_color);
            }
            last_was_background = this_is_background;
        }
    }
    // And now we apply the color!
    // Note the reason we store points instead of coloring them in place is to avoid the top-down picking up the left-right
    // we want that little "curve" on the pixel outlines.
    for (let i = 0; i < points_to_color.length; i++) {
        const color_to_use = colors_to_use[i];
        main_imgData[points_to_color[i]] = color_to_use[0];
        main_imgData[points_to_color[i] + 1] = color_to_use[1];
        main_imgData[points_to_color[i] + 2] = color_to_use[2];
        main_imgData[points_to_color[i] + 3] = color_to_use[3];
    }
    ctx.putImageData(main_img, 0, 0);
    //alert(output_canvas.toDataURL());
    //return output_canvas;
}

// Shrinks an image at a URL down to work_canvas_size, then up to x2, then loads it into our refs
async function resize_for_garden(name_of_image: string, sourceURL: string, target_size: number) {
    const refURL = name_of_image + "_wildcard_data_url"
    const temp_img = <HTMLImageElement> await preload_single_image(sourceURL);
    // Forcibly resize down to the "normal entity" height
    const wildcard_canvas = document.createElement("canvas");
    wildcard_canvas.width = work_canvas_size;
    wildcard_canvas.height = work_canvas_size;
    const max_side = Math.max(temp_img.naturalHeight, temp_img.naturalWidth);
    const wildcard_ctx = wildcard_canvas.getContext("2d");
    wildcard_ctx.imageSmoothingEnabled = false;
    target_size = target_size > max_side ? max_side : target_size;
    // Do a bit of math so that, if the image isn't a perfect square, we don't squash it.
    wildcard_ctx.drawImage(temp_img, (work_canvas_size-target_size)/2, work_canvas_size - temp_img.naturalHeight * (target_size / max_side),
        temp_img.naturalWidth * (target_size / max_side),
        temp_img.naturalHeight * (target_size / max_side));
    const resized_dataURL = wildcard_canvas.toDataURL();//(temp_img.type);
    wildcard_canvases[name_of_image] = wildcard_canvas;
    refs[refURL] = await preload_single_image(resized_dataURL);
    const preview_canvas = document.createElement("canvas");
    const preview_context = preview_canvas.getContext("2d");
    preview_canvas.width = work_canvas_size * 2;
    preview_canvas.height = work_canvas_size * 2;
    preview_context.imageSmoothingEnabled = false;
    preview_context.drawImage(refs[refURL], 0, 0, work_canvas_size * 2, work_canvas_size * 2);
    return preview_canvas.toDataURL();//(temp_img.type);
}

function drawSkyGradient(canvas: HTMLCanvasElement, actingPalette: string[], opacity: number) {
    const ctx = canvas.getContext("2d");
    ctx.globalAlpha = opacity;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const step = 1 / (actingPalette.length);
    for (let i = 0; i < actingPalette.length - 1; i++) {
        grad.addColorStop(i * step, actingPalette[i]);
    }
    grad.addColorStop(1, actingPalette[actingPalette.length - 1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}

export {
    refs, replace_color_palette_single_image, preload_single_image, preload_ground, replace_color_palette,
    applyOverlay, draw_outline_v2, tile_along_y, imageFromPopup, clearCanvas, drawSkyGradient, wildcard_canvases
};
