/** This module holds the UI logic for garden creation. **/
import { available_ground, available_ground_base } from "./data.js";
import { GardenLayer, DecorLayer, OverlayLayer, CelestialLayer, CelestialType, LayerType } from "./garden_layers.js";
import { available_backgrounds, available_tileables } from "./gen_garden.js";
import { clearCanvas, imageFromPopup, wildcard_canvases } from "./image_handling.js";
import { draggableLayerMouseDownHandler } from "./drag_and_drop.js";
import { hexToRgb } from "./shared.js";
/*const PROPERTIES = {
  "base": { "defaultPalette": "CunEjC0KIh", "mainColor": "#FF0000", "secondColor": "#AA0000", "accentColor": "#FFAA00", "icon": "▒", "hovertext": "unused..." },
  "garden": { "defaultPalette": "CunEjC0KIh", "mainColor": "#1C2121", "secondColor": "#151818", "accentColor": "#273831", "icon": "⚘", "hovertext": "Create a new garden layer. This is where all the plants and goodies go!" },
  "decor": { "defaultPalette": "CunEjC0KIh", "mainColor": "#262221", "secondColor": "#1C1919", "accentColor": "#3D362B", "defaultContent": "mountains", "icon": "ꕔ", "hovertext": "Create a new decor layer. This lets you add mountains and the like." },
  "overlay": { "mainColor": "#211515", "secondColor": "#171213", "accentColor": "#3C2121", "defaultColor": "#night", "defaultOpacity": 0.25, "icon": "⚙", "hovertext": "Currently unused, how mysterious!" },
  "celestial": { "defaultPalette": "early evening", "mainColor": "#1B1D24", "secondColor": "#141519", "accentColor": "#252A3C", "defaultContent": "Sky_Gradient", "defaultCustomPalette": ["#192446", "#335366", "#426f7a"], "icon": "☾", "hovertext": "Create a new celestial layer, for adding skies, stars, fog, etc. Don't forget to drag the new layer up a bit if you're doing fog!" }
}// old overlay: 1F191A*/
const PROPERTIES = {
    "base": { "defaultPalette": "CunEjC0KIh", "mainColor": "#FF0000", "accentColor": "#AA0000", "mainColorLight": "#FF00FF", "accentColorLight": "#FFAA00", "icon": "▒", "hovertext": "unused..." },
    "garden": { "defaultPalette": "CunEjC0KIh", "mainColor": "#273831", "accentColor": "#375549", "mainColorLight": "#659683", "accentColorLight": "#7fcdad", "icon": "⚘", "hovertext": "Create a new garden layer. This is where all the plants and goodies go!" },
    "decor": { "defaultPalette": "CunEjC0KIh", "mainColor": "#3D362B", "accentColor": "#7d6d53", "mainColorLight": "#b39b75", "accentColorLight": "#f8d6a0", "defaultContent": "mountains", "icon": "⧋", "hovertext": "Create a new decor layer. This lets you add mountains and the like." },
    "overlay": { "mainColor": "#3C2121", "accentColor": "#6C4141", "mainColorLight": "#b17474", "accentColorLight": "#f5a4a4", "defaultColor": "#night", "defaultOpacity": 0.25, "icon": "⚙", "hovertext": "Currently unused, how mysterious!" },
    "celestial": { "defaultPalette": "early evening", "mainColor": "#252A3C", "accentColor": "#353e60", "mainColorLight": "#647099", "accentColorLight": "#a1b3f3", "defaultContent": "Sky_Gradient", "defaultCustomPalette": ["#192446", "#335366", "#426f7a"], "icon": "☾", "hovertext": "Create a new celestial layer, for adding skies, stars, fog, etc. Don't forget to drag the new layer up a bit if you're doing fog!" }
};
function regexDidntWork(rgbish_val) {
    // There was a polite rgb.match(/\d+/g) that kept failing on #ffffff, #fefeff..., so cast kitchen sink.
    if (rgbish_val[0] === "#") {
        return hexToRgb(rgbish_val);
    }
    return rgbish_val.match(/\d+/g).map(Number);
}
function pageInDarkMode() {
    const rgb = window.getComputedStyle(document.body, null).getPropertyValue("background-color");
    const rgb_average = (rgb.match(/\d+/g).map(Number).reduce((a, b) => a + b)) / 3;
    // TODO: side effect, but it's the best place to put it during the refactor. Move once I can
    const font_rgb = window.getComputedStyle(document.documentElement).getPropertyValue("--font-color");
    const font_rgb_average = (regexDidntWork(font_rgb).reduce((a, b) => a + b)) / 3;
    if (rgb_average < 50 && Math.abs(font_rgb_average - 100) < 15) {
        document.documentElement.style.setProperty("--garden-font-color", "rgb(255, 244, 220)");
    }
    else if (rgb_average >= 50 && Math.abs(font_rgb_average - 170) < 15) {
        document.documentElement.style.setProperty("--garden-font-color", "rgb(0, 17, 51)");
    }
    else {
        document.documentElement.style.setProperty("--garden-font-color", window.getComputedStyle(document.documentElement).getPropertyValue("--font-color"));
    }
    return rgb_average < 50;
}
const pageLoadedInDarkMode = pageInDarkMode();
class LayerDiv {
    type;
    selfDiv;
    controlButtonDiv;
    mainColor;
    editDiv;
    secondColor;
    accentColor;
    editButton;
    hideButton;
    name;
    editMode = true;
    layer;
    id;
    // In order to allow people to sync sizes, we need to be able to feed sizes back into the fields after creation. Bit gross but there you go.
    widthInput;
    yOffsetInput;
    xOffsetInput;
    scaleInput;
    // Lets ups propagate changes up to the layer manager
    onEditCallback;
    // TODO: https://htmldom.dev/drag-and-drop-element-in-a-list/
    constructor(layer, id, onEditCallback, type = "base") {
        // This properties stuff is to save some pain with super() and derived class colors
        this.mainColor = pageLoadedInDarkMode ? PROPERTIES[type]["mainColor"] : PROPERTIES[type]["mainColorLight"];
        this.accentColor = pageLoadedInDarkMode ? PROPERTIES[type]["accentColor"] : PROPERTIES[type]["accentColorLight"];
        this.selfDiv = this.buildGenericDiv(this.mainColor);
        this.selfDiv.className = "draggable_layer_div";
        this.selfDiv.style.cursor = "move";
        this.selfDiv.style.userSelect = "none";
        this.onEditCallback = async function () {
            if (this.layer) {
                await this.layer.update();
            }
            onEditCallback();
        }.bind(this);
        this.selfDiv.addEventListener('mousedown', draggableLayerMouseDownHandler.bind({ callOnDrag: onEditCallback }));
        this.selfDiv.style.borderColor = this.accentColor;
        this.layer = layer;
        this.id = "layer_" + id;
        this.selfDiv.id = this.id;
        const decorDiv = this.buildGenericDiv(this.mainColor);
        decorDiv.className = "layer_box_div";
        this.controlButtonDiv = document.createElement("div");
        this.controlButtonDiv.id = "controls_";
        this.controlButtonDiv.style.display = "flex";
        this.controlButtonDiv.style.flexWrap = "wrap";
        this.editButton = this.buildEditButton();
        this.hideButton = this.buildHideButton();
        const deleteButton = this.buildDeleteButton();
        this.editDiv = this.buildEditDiv();
        decorDiv.style.padding = "0vh";
        decorDiv.style.margin = "0vh";
        decorDiv.style.height = "fit-content";
        this.controlButtonDiv.appendChild(this.editButton);
        const namePlate = document.createElement("input");
        namePlate.type = "text";
        namePlate.className = "layer_label";
        namePlate.style.height = "1.75em";
        namePlate.style.flexGrow = "1";
        namePlate.value = this.id;
        this.controlButtonDiv.appendChild(this.hideButton);
        this.controlButtonDiv.appendChild(namePlate);
        this.controlButtonDiv.appendChild(deleteButton);
        decorDiv.appendChild(this.controlButtonDiv);
        decorDiv.appendChild(this.editDiv);
        this.selfDiv.appendChild(decorDiv);
        this.selfDiv.style.transition = "height 0.4s ease-in-out 0s";
        this.editDiv.style.height = "fit-content";
        this.toggleEditMode();
    }
    buildGenericDiv(color) {
        const genericDiv = document.createElement("div");
        genericDiv.className = "layer_option_div";
        genericDiv.style.backgroundColor = color;
        //genericDiv.id = this.generateId("generic");
        genericDiv.style.cursor = "default";
        genericDiv.style.userSelect = "default";
        genericDiv.style.height = "fit-content";
        return genericDiv;
    }
    buildOptionsHolderDiv() {
        const optionsHolderDiv = this.buildGenericDiv(this.accentColor);
        optionsHolderDiv.style.textAlign = "left";
        optionsHolderDiv.style.width = "43%";
        return optionsHolderDiv;
    }
    toggleEditMode() {
        this.editMode = !this.editMode;
        if (!this.editMode) {
            //this.editDiv.style.marginTop = "-18vh";
            this.editDiv.style.height = "0em";
            //this.selfDiv.style.minHeight = "0vh";
        }
        else {
            //this.editDiv.style.marginTop = "0vh";
            //this.selfDiv.style.minHeight = "fit-content";
            this.editDiv.style.height = "7.5em";
        }
        this.editButton.classList.toggle('active');
    }
    toggleVisibility() {
        this.hideButton.classList.toggle('active');
        this.layer.isVisible = !this.layer.isVisible;
        this.hideButton.innerHTML = this.layer.isVisible ? "👁" : "–";
        this.onEditCallback();
    }
    buildEditButton() {
        const editButton = document.createElement("button");
        editButton.className = "layer_control";
        editButton.innerText = "✎";
        editButton.title = "expand layer for editing";
        editButton.addEventListener('click', this.toggleEditMode.bind(this));
        editButton.style.backgroundColor = this.accentColor;
        return editButton;
    }
    buildHideButton() {
        const hideButton = document.createElement("button");
        hideButton.className = "layer_control";
        hideButton.innerText = "👁";
        hideButton.title = "show or hide layer";
        hideButton.addEventListener('click', this.toggleVisibility.bind(this));
        hideButton.style.backgroundColor = this.accentColor;
        return hideButton;
    }
    buildDeleteButton() {
        const deleteButton = document.createElement("button");
        deleteButton.className = "layer_control";
        deleteButton.innerText = "✕";
        deleteButton.title = "delete layer";
        deleteButton.addEventListener('click', function () { this.doDelete(); }.bind(this));
        deleteButton.style.backgroundColor = this.accentColor;
        return deleteButton;
    }
    doDelete() {
        delete this.layer;
        document.getElementById(this.id).remove();
        this.onEditCallback();
    }
    buildGenericDropdown(target, optionList) {
        const selectBox = document.createElement("select");
        selectBox.id = this.generateId("selectbox", target);
        selectBox.className = "garden_dropdown";
        selectBox.style.width = "90%";
        for (const option of optionList) {
            const newOption = new Option(option, option);
            if (option == this.layer[target]) {
                newOption.selected = true;
            }
            else {
                newOption.selected = false;
            }
            selectBox.options[selectBox.options.length] = newOption;
        }
        selectBox.onchange = async function () {
            this.layer[target] = selectBox.value;
            await this.onEditCallback();
        }.bind(this, target);
        selectBox.style.display = "block";
        return selectBox;
    }
    generateId(childType, descriptor) {
        const id = this.id + "_" + childType + "_" + descriptor;
        return id;
    }
    buildGenericFillIn(target, labelText, color, hovertext, coerceNumber = false) {
        const fillIn = document.createElement("input");
        fillIn.className = "garden-dim-bar";
        fillIn.id = this.generateId("fillin", target);
        fillIn.style.width = "50%";
        fillIn.onchange = async function () {
            if (coerceNumber) {
                this.layer[target] = parseFloat(fillIn.value);
            }
            else {
                this.layer[target] = fillIn.value;
            }
            await this.onEditCallback();
        }.bind(this, target);
        fillIn.value = this.layer[target] == 1 ? this.layer[target].toPrecision(2) : this.layer[target];
        const label = document.createElement("label");
        label.setAttribute("for", fillIn.id);
        label.setAttribute("title", hovertext);
        label.innerHTML = labelText;
        return [fillIn, label];
    }
    buildPositionDiv() {
        const pairs = [["x_offset", "x:", "layer's horizontal offset"], ["y_offset", "y:", "layer's vertical offset"], ["width", "width:", "width of layer"], ["scale", "scale:", "multiply layer size by this amount"]];
        const holdDiv = this.buildGenericDiv(this.accentColor);
        for (let i = 0; i < pairs.length; i++) {
            const [fillIn, label] = this.buildGenericFillIn(pairs[i][0], pairs[i][1], this.mainColor, pairs[i][2], true);
            fillIn.style.width = "2em";
            if (pairs[i][0] != "width") {
                if (pairs[i][0] == "y_offset") {
                    this.yOffsetInput = fillIn;
                }
                else if (pairs[i][0] == "x_offset") {
                    this.xOffsetInput = fillIn;
                }
                else if (pairs[i][0] == "scale") {
                    this.scaleInput = fillIn;
                }
            }
            else {
                this.widthInput = fillIn;
                this.widthInput.onchange = async function () {
                    await this.layer.setWidth(parseFloat(this.widthInput.value));
                    await this.onEditCallback();
                }.bind(this);
            }
            const fragmentDiv = document.createElement("div");
            fragmentDiv.style.display = "flex";
            fragmentDiv.style.margin = "0.25em";
            fragmentDiv.appendChild(label);
            fragmentDiv.appendChild(fillIn);
            holdDiv.appendChild(fragmentDiv);
        }
        //holdDiv.style.cssFloat = "right";
        return holdDiv;
    }
    buildEditDiv() {
        const editDiv = document.createElement("div");
        editDiv.className = "layer_background_div";
        editDiv.style.backgroundColor = this.mainColor;
        editDiv.style.textAlign = "right";
        editDiv.appendChild(this.buildGenericDropdown("name", ["Larry", "Moe", "Curly"]));
        editDiv.appendChild(this.buildGenericDropdown("name", ["Sue", "Anne", "Barbara"]));
        editDiv.appendChild(this.buildPositionDiv());
        editDiv.style.height = "10vh";
        editDiv.style.padding = "0";
        editDiv.style.transition = "margin 0.4s ease-in-out 0s";
        return editDiv;
    }
}
class GardenLayerDiv extends LayerDiv {
    swapButton;
    onChangeGardenCallback;
    constructor(layer, id, onEditCallback, onChangeGardenCallback) {
        super(layer, id, onEditCallback, "garden");
        // see note on these fields in the parent class, this is bad kludge.
        // Maybe we could pass a modified callback? It's wasteful for the x offset,
        // but that's about it.
        this.onChangeGardenCallback = onChangeGardenCallback;
        this.swapButton = this.buildSwapButton();
        const delete_button = this.selfDiv.childNodes[0].childNodes[0].lastChild;
        this.selfDiv.childNodes[0].childNodes[0].insertBefore(this.swapButton, delete_button);
        //this.selfDiv.insertBefore(this.swapButton, this.selfDiv.childNodes[3]);
        this.yOffsetInput.onchange = async function () {
            this.layer["y_offset"] = parseFloat(this.yOffsetInput.value);
            await this.layer.updateMain();
            await this.layer.updateGround();
            await this.onEditCallback();
        }.bind(this);
    }
    buildEditDiv() {
        const editDiv = document.createElement("div");
        editDiv.className = "layer_background_div";
        editDiv.style.backgroundColor = this.mainColor;
        const dropdownDiv = this.buildGenericDiv(this.accentColor);
        const groundCoverSelect = this.buildGenericDropdown("groundCover", Object.keys(available_ground));
        const groundSelect = this.buildGenericDropdown("ground", Object.keys(available_ground_base));
        groundCoverSelect.onchange = async function () {
            this.layer.groundCover = groundCoverSelect.value;
            await this.layer.updateGround();
            this.onEditCallback();
        }.bind(this);
        groundSelect.onchange = async function () {
            this.layer.ground = groundSelect.value;
            await this.layer.updateGround();
            this.onEditCallback();
        }.bind(this);
        dropdownDiv.appendChild(groundCoverSelect);
        dropdownDiv.appendChild(groundSelect);
        const [fillIn, label] = this.buildGenericFillIn("groundPaletteSeed", "colors:", this.mainColor, "seed providing colors for ground");
        fillIn.onchange = async function () {
            this.layer.groundPaletteSeed = fillIn.value;
            await this.layer.updateGround();
            this.onEditCallback();
        }.bind(this);
        dropdownDiv.appendChild(label);
        dropdownDiv.appendChild(fillIn);
        editDiv.appendChild(dropdownDiv);
        editDiv.appendChild(this.buildPositionDiv());
        return editDiv;
    }
    buildSwapButton() {
        const swapButton = document.createElement("button");
        swapButton.className = "layer_control";
        swapButton.innerText = "☆"; // ★
        swapButton.title = "edit this garden layer's seed list";
        swapButton.addEventListener('click', this.setActiveGarden.bind(this));
        swapButton.style.backgroundColor = this.accentColor;
        return swapButton;
    }
    setActiveGarden() {
        if (this.layer.isActive) {
            return;
        }
        this.layer.isActive = true;
        this.swapButton.innerText = "★";
        this.onChangeGardenCallback();
    }
    unsetActiveGarden() {
        this.layer.isActive = false;
        this.swapButton.innerText = "☆";
    }
}
class DecorLayerDiv extends LayerDiv {
    constructor(layer, id, onEditCallback) {
        super(layer, id, onEditCallback, "decor");
    }
    buildEditDiv() {
        const editDiv = document.createElement("div");
        editDiv.className = "layer_background_div";
        editDiv.style.backgroundColor = this.mainColor;
        const dropdownDiv = this.buildOptionsHolderDiv();
        const contentSelect = this.buildGenericDropdown("content", Object.keys(available_tileables));
        dropdownDiv.appendChild(contentSelect);
        const [fillIn, label] = this.buildGenericFillIn("contentPaletteSeed", "colors:", this.accentColor, "seed providing colors for decor");
        dropdownDiv.appendChild(label);
        dropdownDiv.appendChild(fillIn);
        editDiv.appendChild(dropdownDiv);
        editDiv.appendChild(this.buildPositionDiv());
        return editDiv;
    }
}
class OverlayLayerDiv extends LayerDiv {
    constructor(layer, id, onEditCallback) {
        super(layer, id, onEditCallback, "overlay");
    }
    buildEditDiv() {
        const editDiv = document.createElement("div");
        editDiv.className = "layer_background_div";
        editDiv.style.backgroundColor = this.mainColor;
        editDiv.innerHTML = "Effects layer under construction! The overlay stuff was moved to the celestial (blue moon) tab, pick \"fog\".<br><br>Eventually, I want this to handle decor like picture frames";
        /*let leftOptionsDiv = this.buildOptionsHolderDiv();
        let rightOptionsDiv = this.buildOptionsHolderDiv();
        let [_fillInCast, label] = this.buildGenericFillIn("color", "color:", this.mainColor);
        let fillIn = _fillInCast as HTMLInputElement;
        fillIn.value = PROPERTIES["overlay"]["defaultColor"];
        leftOptionsDiv.appendChild(label);
        leftOptionsDiv.appendChild(fillIn);
        let [_fillIn2Cast, label2] = this.buildGenericFillIn("opacity", "alpha:", this.mainColor, true);
        let fillIn2 = _fillIn2Cast as HTMLInputElement;
        fillIn2.value = ""+PROPERTIES["overlay"]["defaultOpacity"];
        rightOptionsDiv.appendChild(label2);
        rightOptionsDiv.appendChild(fillIn2);
        editDiv.appendChild(leftOptionsDiv);
        editDiv.appendChild(rightOptionsDiv);*/
        return editDiv;
    }
}
class CelestialLayerDiv extends LayerDiv {
    constructor(layer, id, onEditCallback) {
        super(layer, id, onEditCallback, "celestial");
    }
    buildEditDiv() {
        const editDiv = document.createElement("div");
        editDiv.className = "layer_background_div";
        editDiv.style.backgroundColor = this.mainColor;
        const dropdownDiv = this.buildGenericDiv(this.accentColor);
        // TODO: Typescript is amazing fantastic awesome but the enums might be worth holding off on
        const contentSelect = this.buildGenericDropdown("content", Object.keys(CelestialType).filter(value => isNaN(Number(value))));
        const skyPaletteSelect = this.buildGenericDropdown("skyPalette", Object.keys(available_backgrounds));
        skyPaletteSelect.onchange = async function () {
            this.layer["skyPalette"] = skyPaletteSelect.value;
            if (skyPaletteSelect.value == "custom") {
                this.get_custom_palette(this.layer, this.onEditCallback);
            }
            else {
                await this.onEditCallback();
            }
        }.bind(this, skyPaletteSelect);
        const [opacityFillIn, opacityLabel] = this.buildGenericFillIn("opacity", "opacity:", this.mainColor, "opacity of layer", true);
        dropdownDiv.appendChild(contentSelect);
        dropdownDiv.appendChild(skyPaletteSelect);
        dropdownDiv.appendChild(opacityLabel);
        dropdownDiv.appendChild(opacityFillIn);
        editDiv.appendChild(dropdownDiv);
        return editDiv;
    }
    get_custom_palette(cl, callback) {
        const modal = document.createElement("div");
        //modal.classList.add("block_window");
        const modal_display = document.createElement("div");
        modal_display.classList.add("popup");
        document.body.appendChild(modal);
        const textbox = document.createElement("text");
        textbox.innerHTML = "Enter a comma-separated list of hex colors. You can also put just one for a solid color, or a seed to use its first palette<br>";
        const fillIn = document.createElement("input");
        fillIn.value = cl.customPalette.toString();
        fillIn.oninput = async function () {
            cl.setCustomPalette(fillIn.value);
            await callback();
        };
        const button_container = document.createElement("div");
        button_container.style.padding = "20px";
        const accept_button = document.createElement("input");
        accept_button.type = "button";
        accept_button.onclick = async function () {
            cl.setCustomPalette(fillIn.value);
            document.body.removeChild(modal);
            await callback();
        };
        accept_button.value = "Set Gradient";
        accept_button.classList.add("chunky_fullwidth");
        button_container.appendChild(textbox);
        button_container.appendChild(fillIn);
        button_container.appendChild(document.createElement("br"));
        button_container.appendChild(document.createElement("br"));
        button_container.appendChild(accept_button);
        modal_display.appendChild(button_container);
        modal.appendChild(modal_display);
    }
}
// This big box of layers that goes on the right and lets you make more.
class LayerManager {
    foreCanvas;
    backCanvas;
    fullCanvas;
    activeLayerDivs;
    selfDiv;
    layerHolderDiv;
    activeGardenDiv;
    layers_created = 0;
    width = 450;
    height = 80;
    scale = 1;
    updateCallback;
    gardenToggleCallback;
    activeGardenChangedCallback; // Optional callback for alerting other UI elements to active garden changes
    activeGardenSeeds;
    isVisible = false;
    divToLayerMapper = {}; // Associates div IDs to the layer they represent
    get_id() {
        this.layers_created++;
        return this.layers_created;
    }
    constructor(managedCanvas, activeGardenSeeds) {
        this.selfDiv = document.createElement("div");
        this.selfDiv.id = "layer_manager";
        this.layerHolderDiv = document.createElement("div");
        this.layerHolderDiv.id = "layer_holder";
        this.layerHolderDiv.style.width = "100%";
        this.fullCanvas = managedCanvas;
        this.foreCanvas = document.createElement("canvas");
        this.foreCanvas.width = this.fullCanvas.width;
        this.foreCanvas.height = this.fullCanvas.height;
        this.backCanvas = document.createElement("canvas");
        this.backCanvas.width = this.fullCanvas.width;
        this.backCanvas.height = this.fullCanvas.height;
        this.activeLayerDivs = [];
        this.activeGardenSeeds = activeGardenSeeds;
        this.updateCallback = this.redraw.bind(this);
        this.gardenToggleCallback = this.swapActiveGarden.bind(this);
        this.activeGardenChangedCallback = function () { };
        this.selfDiv.appendChild(this.buildLayerButton("garden", this.makeGardenLayer));
        this.selfDiv.appendChild(this.buildLayerButton("decor", this.makeDecorLayer));
        this.selfDiv.appendChild(this.buildLayerButton("celestial", this.makeCelestialLayer));
        this.selfDiv.appendChild(this.buildLayerButton("overlay", this.makeOverlayLayer));
        this.selfDiv.appendChild(this.layerHolderDiv);
        // Usually we await. Can't in the constructor, so we do it a little funky
        const newGardenLayer = new GardenLayer(this.fullCanvas.width, this.fullCanvas.height, 0, 0, [], PROPERTIES["garden"]["defaultPalette"], "grass [palette]", "clumpy dirt", 1);
        const newGardenLayerDiv = new GardenLayerDiv(newGardenLayer, this.get_id(), this.updateCallback, this.gardenToggleCallback);
        this.activeGardenDiv = newGardenLayerDiv;
        newGardenLayerDiv.setActiveGarden();
        this.divToLayerMapper[newGardenLayerDiv.selfDiv.id] = newGardenLayerDiv;
        this.layerHolderDiv.insertBefore(newGardenLayerDiv.selfDiv, this.layerHolderDiv.firstChild);
    }
    clearAllButActive() {
        for (const id of Object.keys(this.divToLayerMapper)) {
            const layerDiv = this.divToLayerMapper[id];
            // TODO: See swapActiveGarden(), there's something odd in deletion propagation
            // While we could probably clean that up "in post", it might be better served as refactor.
            if (layerDiv.layer === undefined) {
                continue;
            }
            if (!layerDiv.layer.isActive) {
                layerDiv.doDelete();
                delete this.divToLayerMapper[id];
            }
        }
    }
    toggleVisibility() {
        this.isVisible = !this.isVisible;
        if (!this.isVisible) {
            this.selfDiv.style.marginRight = "-300%";
        }
        else {
            this.selfDiv.style.marginRight = "0%";
        }
    }
    async setHeight(height) {
        this.height = height;
        this.fullCanvas.height = height;
        this.foreCanvas.height = height;
        this.backCanvas.height = height;
        for (let i = this.layerHolderDiv.children.length; i > 0; i--) {
            const layerDivObj = this.divToLayerMapper[this.layerHolderDiv.children[i - 1].id];
            if (layerDivObj.layer === undefined) {
                continue;
            }
            await layerDivObj.layer.setHeight(height);
        }
    }
    async setWidth(width) {
        this.width = width;
        this.fullCanvas.width = width;
        this.foreCanvas.width = width;
        this.backCanvas.width = width;
        for (let i = this.layerHolderDiv.children.length; i > 0; i--) {
            const layer = this.divToLayerMapper[this.layerHolderDiv.children[i - 1].id].layer;
            if (layer === undefined) {
                continue;
            }
            if ((layer instanceof CelestialLayer) || (layer instanceof OverlayLayer)) {
                layer.setWidth(width);
            }
        }
    }
    setScale(scale) {
        this.scale = scale;
    }
    buildLayerButton(type, callback) {
        const layerButton = document.createElement("button");
        layerButton.className = "layer_create";
        layerButton.innerText = PROPERTIES[type]["icon"];
        layerButton.title = PROPERTIES[type]["hovertext"];
        layerButton.addEventListener('click', callback.bind(this));
        layerButton.style.backgroundColor = pageLoadedInDarkMode ? PROPERTIES[type]["accentColor"] : PROPERTIES[type]["accentColorLight"];
        layerButton.style.width = "5vw";
        layerButton.style.height = "3vw";
        return layerButton;
    }
    addLayerAndAnimate(newLayerDiv, openEditMode, pushFirst = false) {
        this.divToLayerMapper[newLayerDiv.selfDiv.id] = newLayerDiv;
        if (pushFirst) {
            this.layerHolderDiv.insertBefore(newLayerDiv.selfDiv, this.layerHolderDiv.childNodes[0]);
        }
        else {
            this.layerHolderDiv.appendChild(newLayerDiv.selfDiv);
        }
        if (openEditMode) {
            setTimeout(() => { newLayerDiv.toggleEditMode(); }, 10);
            this.updateCallback();
        }
        return newLayerDiv;
    }
    async loadFromSaveString(save_string) {
        const save_obj = JSON.parse(save_string);
        this.clearAllButActive();
        let layer;
        for (let i = 0; i < save_obj["layers"].length; i++) {
            layer = save_obj["layers"][i];
            if (layer["type"] == LayerType.Garden && layer["seeds"].length > 0) {
                let parsed_seeds = this.parseSeedList(layer["seeds"].join(","), this.loadFromSaveString.bind(this, save_string));
                if (layer["seeds"].length != parsed_seeds.length) {
                    return;
                }
            }
        }
        //await (<GardenLayer>this.activeGardenDiv.layer).updateMain();
        //await (<GardenLayer>this.activeGardenDiv.layer).updateGround();
        //this.setScale(save_string["s"]);
        for (let i = 0; i < save_obj["layers"].length; i++) {
            // Javascript not having true named args will kill me in the end
            layer = save_obj["layers"][i];
            if (layer["type"] == LayerType.Garden) {
                await this.makeGardenLayer(false, layer["seeds"], layer["palette"], layer["gcover"], layer["ground"], layer["w"], layer["h"], layer["x"], layer["y"], layer["s"]);
            }
            else if (layer["type"] == LayerType.Decor) {
                await this.makeDecorLayer(false, layer["content"], layer["palette"], layer["w"], this.fullCanvas.height, layer["x"], layer["y"], layer["s"]);
            }
            else if (layer["type"] == LayerType.Celestial) {
                const cust = layer["palette"] == "custom" ? layer["cust"] : PROPERTIES["celestial"]["defaultCustomPalette"];
                await this.makeCelestialLayer(false, layer["content"], layer["palette"], layer["a"], cust);
            }
        }
    }
    async makeGardenLayer(openEditMode = true, seedList = [], palette = PROPERTIES["garden"]["defaultPalette"], groundCover = "grass [palette]", ground = "clumpy dirt", width = this.fullCanvas.width / this.scale, height = this.fullCanvas.height / this.scale, x_offset = 0, y_offset = 0, scale = 1) {
        const newGardenLayer = new GardenLayer(width, height, x_offset, y_offset, seedList, palette, groundCover, ground, scale);
        //await newGardenLayer.updateMain();
        //await newGardenLayer.updateGround();
        const newGardenLayerDiv = new GardenLayerDiv(newGardenLayer, this.get_id(), this.updateCallback, this.gardenToggleCallback);
        await newGardenLayer.updateMain();
        await newGardenLayer.updateGround();
        return this.addLayerAndAnimate(newGardenLayerDiv, openEditMode);
    }
    async makeDecorLayer(openEditMode = true, content = PROPERTIES["decor"]["defaultContent"], palette = PROPERTIES["decor"]["defaultPalette"], width = this.fullCanvas.width / this.scale, height = this.fullCanvas.height / this.scale, x_offset = 0, y_offset = 0, scale = 1) {
        const newDecorLayer = new DecorLayer(width, height, x_offset, y_offset, content, palette, scale);
        const newDecorLayerDiv = new DecorLayerDiv(newDecorLayer, this.get_id(), this.updateCallback);
        await newDecorLayer.update();
        return this.addLayerAndAnimate(newDecorLayerDiv, openEditMode);
    }
    async makeOverlayLayer(openEditMode = true) {
        const newOverlayLayer = new OverlayLayer(this.fullCanvas.width / this.scale, this.fullCanvas.height / this.scale, 0, 0, PROPERTIES["overlay"]["defaultColor"], PROPERTIES["overlay"]["default_opacity"], false, 1);
        const newOverlayLayerDiv = new OverlayLayerDiv(newOverlayLayer, this.get_id(), this.updateCallback);
        return this.addLayerAndAnimate(newOverlayLayerDiv, openEditMode);
    }
    // If you're wondering why palette and customPalette are split -- bad JS "overloading", the customPalette-free form is useful for the randomize button
    async makeCelestialLayer(openEditMode = true, type = PROPERTIES["celestial"]["defaultContent"], palette = PROPERTIES["celestial"]["defaultPalette"], opacity = 1, customPalette = PROPERTIES["celestial"]["defaultCustomPalette"]) {
        const newCelestialLayer = new CelestialLayer(this.fullCanvas.width / this.scale, this.fullCanvas.height / this.scale, 0, 0, type, palette, customPalette, opacity, 1);
        const newCelestialLayerDiv = new CelestialLayerDiv(newCelestialLayer, this.get_id(), this.updateCallback);
        newCelestialLayer.update();
        return this.addLayerAndAnimate(newCelestialLayerDiv, openEditMode);
    }
    parseSeedList(seedList, callback) {
        const seeds = seedList.split(" ").join("").replace(/[\r\n]+/gm, '').replace(/(^,)|(,$)/g, '').split(",");
        for (let i = 0; i < seeds.length; i++) {
            if (seeds[i][0] == "*") {
                const cleaned_seed = seeds[i].split("%")[0].replace("<", "");
                if (!Object.prototype.hasOwnProperty.call(wildcard_canvases, cleaned_seed)) {
                    imageFromPopup(document.body, cleaned_seed, callback.bind(seedList));
                    return [];
                }
            }
        }
        return seeds;
    }
    async regenActiveGarden(seedList) {
        let parsedSeedList;
        if (seedList) {
            parsedSeedList = this.parseSeedList(seedList, this.regenActiveGarden.bind(this, seedList));
        }
        else {
            parsedSeedList = [];
        }
        this.activeGardenDiv.layer.seedList = parsedSeedList;
        this.activeGardenDiv.layer.generateContent();
        this.activeGardenDiv.layer.assignSmartPositions();
        await this.activeGardenDiv.layer.updateMain();
        await this.activeGardenDiv.layer.updateGround();
        this.redraw();
    }
    swapActiveGarden() {
        let oldActiveGarden;
        let newActiveGarden;
        for (let i = this.layerHolderDiv.children.length; i > 0; i--) {
            // TODO: right now we just free the layer. Should propagate the deletion fully to the manager.
            const layerDivObj = this.divToLayerMapper[this.layerHolderDiv.children[i - 1].id];
            if (layerDivObj.layer === undefined) {
                continue;
            }
            if (layerDivObj.layer.isActive) {
                if (this.activeGardenDiv.id === layerDivObj.id) {
                    oldActiveGarden = layerDivObj;
                }
                else {
                    newActiveGarden = layerDivObj;
                }
            }
        }
        if (newActiveGarden) {
            this.activeGardenDiv = newActiveGarden;
            this.activeGardenSeeds.value = newActiveGarden.layer.seedList;
            if (oldActiveGarden) {
                oldActiveGarden.unsetActiveGarden();
            }
            this.activeGardenChangedCallback();
        }
    }
    getSaveString() {
        const save_struct = { "version": 0.1, "w": this.width, "h": this.height, "s": this.scale, "layers": [] };
        for (let i = 0; i < this.layerHolderDiv.children.length; i++) {
            save_struct["layers"].push(this.divToLayerMapper[this.layerHolderDiv.children[i].id].layer.getSaveData());
        }
        return JSON.stringify(save_struct);
    }
    redraw() {
        clearCanvas(this.foreCanvas);
        clearCanvas(this.backCanvas);
        clearCanvas(this.fullCanvas);
        for (let i = this.layerHolderDiv.children.length; i > 0; i--) {
            // TODO: right now we just free the layer. Should propagate the deletion fully to the manager.
            const layerDivObj = this.divToLayerMapper[this.layerHolderDiv.children[i - 1].id];
            if (layerDivObj.layer === undefined || !layerDivObj.layer.isVisible) {
                continue;
            }
            layerDivObj.layer.place(this.foreCanvas, this.backCanvas);
        }
        const fullCtx = this.fullCanvas.getContext("2d");
        this.fullCanvas.height = this.height * this.scale;
        this.fullCanvas.width = this.width * this.scale;
        fullCtx.imageSmoothingEnabled = false;
        fullCtx.drawImage(this.backCanvas, 0, 0, this.width * this.scale, this.height * this.scale);
        fullCtx.drawImage(this.foreCanvas, 0, 0, this.width * this.scale, this.height * this.scale);
    }
}
export { LayerManager, GardenLayerDiv, CelestialLayerDiv };
