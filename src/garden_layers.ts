/**
Defines classes for the various types of layer we can have in a garden.

Layers behave in much the same way as they do in an art program, allowing us to edit
only part of the piece at a time, as well as reorder which sits "on top".

There are a total of 4 types of layer: garden (the main one, arguably), color
(for applying overlays and backgrounds), celestial (skies and stars),
and decor (for applying things like mountains).

Additionally, there's the generic layer the rest inherit from.

Each should be able to build its completed canvas from its raw "save form", generally
its content (image URL, list of seeds, ...), a seed palette, width, and offset. So
there's quite a bit of logic in this module.
**/

import { all_palettes, available_ground, available_ground_base, FOLIAGE_SPRITE_DATA, NAMED_SPRITE_DATA, reformatted_named } from "./data.js";
import { decode_plant_data, overall_palette, work_canvas_size } from "./gen_plant.js";
import { createSpacedPlacementQueue, shuffleArray, hasPixelInRow, get_overlay_color_from_name } from "./shared.js";
import { get_canvas_for_named_component, get_canvas_for_plant, available_tileables, available_backgrounds } from "./gen_garden.js";
import { refs, replace_color_palette_single_image, applyOverlay,  draw_outline_v2, tile_along_y, drawSkyGradient} from "./image_handling.js"

const LAYER_HEIGHT = 100;
const GARDEN_ITEM_SIZE = work_canvas_size;

///////////////////////  GENERIC LAYER   ///////////////////////////////////////


/**
The base, abstract Layer.

Defines the functionality guaranteed by any layer--making, placing, and adjusting dimensions.
**/

enum LayerType {
  Garden = 1,
  Decor = 2,
  Celestial = 3,
}

abstract class Layer {
  x_offset: number;
  y_offset: number;
  width: number;
  canvas: HTMLCanvasElement;
  height: number;
  isActive: boolean;  // We hold this, but the layer manager's the one that needs it. Only gardens can be active (for now?)
  scale: number;
  isVisible: boolean;

  constructor(width: number, height: number, x_offset: number, y_offset: number, scale: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.x_offset = x_offset;
    this.y_offset = y_offset;
    this.width = width;
    this.height = height;
    this.isActive = false;
    this.scale = scale;
    this.isVisible = true;
  }

  place_fore(place_onto_canvas: HTMLCanvasElement) {
    const place_onto_ctx = place_onto_canvas.getContext("2d");
    place_onto_ctx.imageSmoothingEnabled = false;  // In case of scaling
    place_onto_ctx.drawImage(this.canvas, this.x_offset, this.y_offset * -1, this.width * this.scale, this.height * this.scale);
  }

  place_back(place_onto_canvas: HTMLCanvasElement) {
    const place_onto_ctx = place_onto_canvas.getContext("2d");
    place_onto_ctx.drawImage(this.canvas, this.x_offset, this.y_offset * -1, this.canvas.width, this.canvas.height);
  }

  place(fore_canvas: HTMLCanvasElement, back_canvas: HTMLCanvasElement) {
    this.place_fore(fore_canvas);
    this.place_back(back_canvas);
  }

  clearCanvas() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setHeight(height: number) {
    this.canvas.height = height;
    this.height = height;
    this.update();
  }

  setWidth(width: number) {
    this.canvas.width = width;
    this.width = width;
    this.update();
  }

  setScale(scale: number) {
    this.scale = scale;
    this.update();
  }

  getSaveData() {
    return {};
  }

  abstract update(): void;
}

///////////////////////  GARDEN LAYER   ////////////////////////////////////////

/** Describes the type of a GardenItem (seed, catalog) so we know how to draw it.**/
enum GardenItemType {
  Seed = 1,
  Catalog,
  Overlay,
}

/**
Describes the height of the item (ex: a shrub might be short, a tree might be tall).

This is used for "smart spacing", where we try to spread things so similar heights
don't overlap.
**/
enum GardenItemHeightCategory {
  Tiny = 1,
  Short,
  Medium,
  Tall,
  Towering
}

/**
The base, abstract GardenItem.

Like layers, they only guarantee creation and placement.
**/
abstract class GardenItem {
  identity: string;
  type: GardenItemType;

  constructor(identity: string, type: GardenItemType) {
    this.identity = identity;
    this.type = type
  }

  abstract place(place_onto_canvas: HTMLCanvasElement): void;

  getSeed() {
    return this.identity;
  }
}

/**
Garden items that go "in" the garden.

Things like trees, crystals, various animals, catalog items, etc. Obvious physical objects.
These are the guys we need things like heights and offsets for. They're what first comes to
mind when you think "thing to put in a garden".
**/
class GardenPlacedItem extends GardenItem {
  offset: number;  // fraction of the way across the canvas to put it. .7 = 70%, near the right
  offsetSpecified: boolean;  // Whether the offset was provided by the user (so don't scramble it!)
  canvas: HTMLCanvasElement;
  heightCategory: GardenItemHeightCategory;
  isFlipped: boolean;
  constructor(identity: string, type: GardenItemType, offset: number, canvas: HTMLCanvasElement, height: GardenItemHeightCategory, offsetSpecified: boolean, isFlipped: boolean) {
    super(identity, type);
    this.offset = offset;
    this.canvas = canvas;
    this.heightCategory = height;
    this.offsetSpecified = offsetSpecified;
    this.isFlipped = isFlipped;
  }

  place(place_onto_canvas: HTMLCanvasElement, use_offset = true) {
    const place_onto_ctx = place_onto_canvas.getContext("2d");
    const acting_offset = use_offset ? this.offset : 1
    place_onto_ctx.imageSmoothingEnabled = false;
    place_onto_ctx.drawImage(this.canvas, place_onto_canvas.width * acting_offset, 0, GARDEN_ITEM_SIZE * 2, GARDEN_ITEM_SIZE * 2);
  }

  flipCanvas() {
    const flip_canvas = document.createElement("canvas")
    flip_canvas.width = this.canvas.width;
    flip_canvas.height = this.canvas.height;
    const ctx = flip_canvas.getContext("2d");
    ctx.setTransform(-1, 0, 0, 1, this.canvas.width, 0);
    ctx.drawImage(this.canvas, 0, 0);
    this.canvas = flip_canvas;
  }

  getSeed(force_position = true) {
    const pos = force_position || this.offsetSpecified ? "%" + (this.offset * 100).toFixed(2).toString() : "";
    return this.identity + pos + (this.isFlipped ? "<" : "");
  }
}

/**
Garden items that go "on" the garden.

This covers our weird case of overlays. Overlays are defined by users within the list of seeds,
so it's cleanest to handle them within the same logic as the rest, but they're conceptually
pretty different--essentially a configurable tint, used to visually send things to the
"background" or simulate fog or silhouette.
**/
class GardenOverlayItem extends GardenItem {
  opacity: number;  // Like GardenPlacedItem's offset, is a fraction.
  constructor(identity: string, type: GardenItemType, opacity: number) {
    super(identity, type);
    this.opacity = opacity;
  }

  place(place_onto_canvas: HTMLCanvasElement) {
    applyOverlay(place_onto_canvas, this.identity, this.opacity);
  }

  getSeed() {
    return this.identity + "%" + (this.opacity * 100).toFixed(2).toString();
  }
}

/**
A Layer representing a garden.

These are the meat and potatoes of the tool. They hold a number of garden items like
flowers and statues, arrange them semi-intelligently based on height (or take heights
provided by users), apply any overlays the users want, and generally account for
most of the first functionality you'd think of in a tool like this.
**/
class GardenLayer extends Layer {
  seedList: string[];
  content: Array<GardenItem>;
  smart_coords: object;
  canvasGarden: HTMLCanvasElement;
  canvasGround: HTMLCanvasElement;
  groundPaletteSeed: string;
  groundCover: string;
  ground: string;
  draw_outline: false;

  constructor(width: number, height: number, x_offset: number, y_offset: number, seedList: string[], groundPaletteSeed: string, groundCover: string, ground: string, scale: number) {
    super(1, 1, x_offset, y_offset, scale);
    this.seedList = seedList;
    this.generateContent();
    this.canvasGarden = document.createElement("canvas") as HTMLCanvasElement;
    this.canvasGarden.height = LAYER_HEIGHT;
    this.canvasGround = document.createElement("canvas") as HTMLCanvasElement;
    // We have a lot more things to set dimensions on than the other layers
    this.groundPaletteSeed = groundPaletteSeed;
    this.groundCover = groundCover;
    this.ground = ground;
    this.setHeight(height);
    this.setWidth(width);
    this.assignSmartPositions();
  }

  getSaveData() {
    return {
      "type": LayerType.Garden,
      "x": this.x_offset,
      "y": this.y_offset,
      "w": this.width,
      "h": this.height - LAYER_HEIGHT,
      "seeds": this.content.map((entry): string => { return entry.getSeed(); }),
      "palette": this.groundPaletteSeed,
      "gcover": this.groundCover,
      "ground": this.ground,
      "s": this.scale,
    }
  }

  generateContent() {
    // Iterating over Typescript enums is very strange and perhaps not worth it? Do NOT remove that filter.
    this.smart_coords = {};
    Object.values(GardenItemHeightCategory).filter(value => !isNaN(Number(value))).forEach(height => {
      this.smart_coords[height] = createSpacedPlacementQueue(this.width, <number>height * 24 - <number>height);
    });
    // Javascript's inability to pause execution outside certain special calls (alert()) means we can't handle wildcards while
    // generating a garden. By the time we reach GardenLayer, we expect all wildcards to be resolved and the seeds in a
    // nice list.
    this.content = [];
    this.seedList.forEach(seed => {
      this.content.push(this.makeGardenItem(seed));
    })
  }

  /** Use the height of contained GardenPlacedItems to pick (hopefully appealing) spots for them.**/
  assignSmartPositions() {
    Object.values(GardenItemHeightCategory).filter(value => !isNaN(Number(value))).forEach(height => {
      shuffleArray(this.smart_coords[height])
    });
    const assign_offset = [0, 0, 0, 0, 0, 0];
    for (const gardenItem of this.content) {
      if ((gardenItem instanceof GardenPlacedItem) && !gardenItem.offsetSpecified) {
        const placeable = <GardenPlacedItem>gardenItem;
        const height = placeable.heightCategory;
        if (assign_offset[height] >= this.smart_coords[height].length) {
          // TODO: generating a spaced placement queue and then converting to fraction either
          // either way is a little silly. We do want fractions, though, in case the garden's resized
          placeable.offset = Math.random() * (this.width - height * 36) / this.width;
        } else {
          gardenItem.offset = this.smart_coords[height][assign_offset[height]] / this.width;
          assign_offset[height]++;
        }
      }
    }
  }

  /** Create a GardenItem from an entry in the seed list (like #blue or GawR7as64e%50) **/
  makeGardenItem(identity: string) {
    let type: GardenItemType;
    let canvas: HTMLCanvasElement;
    let height;
    let canvas_func: (identity: string) => HTMLCanvasElement | string;  // todo: appeasing, real sig will be identity: string => canvas
    const percent_pos = identity.indexOf('%');
    const is_flipped = identity.endsWith("<");
    if (is_flipped) { identity = identity.slice(0, identity.length - 1); }
    let percent_val = null;
    let custom_pos = false;
    if (percent_pos > -1) {
      percent_val = parseFloat(identity.slice(percent_pos + 1)) / 100;
      identity = identity.slice(0, percent_pos);
      custom_pos = true;
    }
    if (identity.startsWith("#")) {
      type = GardenItemType.Overlay;
      if (percent_pos == null) { percent_val = 0.25; }
      return new GardenOverlayItem(identity, type, percent_val)
    } else if (identity.startsWith("!")) {
      type = GardenItemType.Catalog;
      identity = identity.slice(1);
      height = this.heightClassFromHeight(NAMED_SPRITE_DATA[reformatted_named[identity]["offset"]]["h"]);
      canvas_func = get_canvas_for_named_component;
    } else if (identity.startsWith("*")) {
      type = GardenItemType.Catalog;
      // Subtle difference: no slice (to avoid name collisions on ex: !crate and *crate)
      // It's not worth making everything async just for the ultra-edge-case of loads of differently-sized wildcards.
      height = 2;
      canvas_func = get_canvas_for_named_component;
    } else {
      type = GardenItemType.Seed;
      height = this.heightClassFromHeight(FOLIAGE_SPRITE_DATA[decode_plant_data(identity)["foliage"]]["h"]);
      canvas_func = get_canvas_for_plant;
    }

    canvas = <HTMLCanvasElement>canvas_func(identity);
    if (is_flipped) {
      const flip_canvas = document.createElement("canvas")
      flip_canvas.width = canvas.width;
      flip_canvas.height = canvas.height;
      const ctx = flip_canvas.getContext("2d");
      ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
      ctx.drawImage(canvas, 0, 0);
      canvas = flip_canvas;
    }

    if (percent_pos == null) { percent_val = Math.random(); }
    return new GardenPlacedItem(type == GardenItemType.Catalog ? "!" + identity : identity, type, percent_val, canvas, height, custom_pos, is_flipped);
  }

  /**
  Figure out something's GardenItemHeightCategory based on its first fully-transparent row.
  
  "Fully-transparent row" meaning a y-coordinate in the image with no alpha anywhere.
  
  We go top-down to account for hovering sprites like fish.
  **/
  classifyHeight(canvas: HTMLCanvasElement) {
    const image_data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    if (hasPixelInRow(image_data, work_canvas_size * 0.8, canvas.width)) {
      return GardenItemHeightCategory.Towering;
    }
    if (hasPixelInRow(image_data, work_canvas_size * 0.6, canvas.width)) {
      return GardenItemHeightCategory.Tall;
    }
    else if (hasPixelInRow(image_data, work_canvas_size * 0.4, canvas.width)) {
      return GardenItemHeightCategory.Medium;
    }
    else if (!hasPixelInRow(image_data, work_canvas_size * 0.2, canvas.width)) {
      return GardenItemHeightCategory.Short;
    }
    return GardenItemHeightCategory.Tiny;
  }

  heightClassFromHeight(num: number) {
    // The num-1 is for the case of a height of work_canvas_size (0 offset)
    return Math.ceil((num - 1) / (work_canvas_size/5));
  }

  /** Update the contents of the main canvas, which holds all the plants. **/
  updateMain() {
    const ctxGarden = this.canvasGarden.getContext("2d");
    ctxGarden.clearRect(0, 0, this.canvasGarden.width, this.canvasGarden.height);
    for (let i = 0; i < this.content.length; i++) {
      this.content[i].place(this.canvasGarden);
    }
    if (this.draw_outline) { draw_outline_v2(this.canvasGarden); }
    //alert(this.canvasGarden.toDataURL());
    //alert(this.canvasGarden.toDataURL());
    //ctxGarden.drawImage(outline, 0, 0);
    this.update();
  }

  /** Update the contents of the ground canvas, grass/sand/stone/etc.**/
  async updateGround() {
    const ctxGround = this.canvasGround.getContext("2d");
    ctxGround.imageSmoothingEnabled = false;
    ctxGround.clearRect(0, 0, this.canvasGround.width, this.canvasGround.height);
    const colorData = decode_plant_data(this.groundPaletteSeed);
    const newPalette = all_palettes[colorData["foliage_palette"]]["palette"].concat(all_palettes[colorData["accent_palette"]]["palette"]).concat(all_palettes[colorData["feature_palette"]]["palette"]);
    const recoloredGround = replace_color_palette_single_image(overall_palette, newPalette, await refs["ground_base" + available_ground_base[this.ground]["offset"]]);
    const recoloredGroundCover = replace_color_palette_single_image(overall_palette, newPalette, await refs[available_ground[this.groundCover]]);
    // Draw everything but the groundcover. We keep going til we're fully off the canvas
    const incrementBy = recoloredGround.height * 2;
    let groundYPos = LAYER_HEIGHT;
    // The *2 in the LAYER_HEIGHT is a buffer in case someone, for some reason, sets an offset greater than the functional size.
    while (groundYPos < (LAYER_HEIGHT + this.y_offset)) {
      tile_along_y(ctxGround, recoloredGround, groundYPos, this.width);
      groundYPos += incrementBy;
    }
    // Draw the groundcover...and ONLY the groundcover.
    // Why doesn't it use the tileable function, which is almost exactly identical?
    // Simple: my pixel art is trash. The original version of this function contained a bug that slightly squashes
    // the art vertically, which somehow makes it look much, *much* better, especially the riverbed and meat ones.
    // Until I can make something that looks equally good, this "bug" is promoted to feature
    let groundXPos = 0;
    while (groundXPos < this.canvas.width) {
      // the world isn't ready for this truth (see above comment block):
      //ctx.drawImage(recolored_ground, ground_x_pos, 70-recolored_ground.height*2, 200, recolored_ground.height*2);
      ctxGround.drawImage(recoloredGroundCover, groundXPos, LAYER_HEIGHT - 6, 200, 6);
      groundXPos += 200;
    }
    this.update();
  }

  /** Applies both canvases to the main one, preparing it to be drawn. **/
  update() {
    this.clearCanvas();
    const ctx = this.canvas.getContext("2d");
    ctx.drawImage(this.canvasGarden, 0, LAYER_HEIGHT-work_canvas_size*2, this.canvasGarden.width, this.canvasGarden.height);
    ctx.drawImage(this.canvasGround, 0, 0, this.canvasGround.width, this.canvasGround.height);
  }

  /** Gardens never go on the background layer. **/
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  place_back(_place_onto_canvas: HTMLCanvasElement) {
    return
  }

  place_fore(place_onto_canvas: HTMLCanvasElement) {
    const place_onto_ctx = place_onto_canvas.getContext("2d");
    // We place at the BOTTOM of the image, so the y_offset usually moves things upwards.
    // That's because folks are more likely to want sky than ground, and positive y "feels" better somehow
    // The LAYER_HEIGHT math is to account first for the height allowed for plants, then for the padding height
    // that allows for y offsets equal to the height of the canvas (see setHeight)
    place_onto_ctx.imageSmoothingEnabled = false;
    place_onto_ctx.drawImage(this.canvas, this.x_offset, this.height - LAYER_HEIGHT * (1 + this.scale) - this.y_offset,
      this.width * this.scale, this.height * this.scale);
  }

  async setHeight(height: number) {
    // All the + LAYER_HEIGHT is to create a canvas large enough for someone to y_offset all the way to the top of the screen.
    // If we had it exactly equal to the expected canvas size, there'd be LAYER_HEIGHT of empty space at the bottom if they tried.
    const new_height = height + LAYER_HEIGHT;
    if(this.height != new_height){
      this.height = new_height;
      this.canvas.height = new_height;
      this.canvasGround.height = new_height;
      // The main garden canvas, being stacked on top of the ground, never needs to care about height
      await this.updateGround();
    }
  }

  async setWidth(width: number) {
    if(this.width != width){
      this.width = width;
      this.canvas.width = width;
      this.canvasGround.width = width;
      this.canvasGarden.width = width;
      this.updateMain();
      await this.updateGround();
    }
  }
}

///////////////////////  DECOR LAYER   /////////////////////////////////////////

/** The decor layer draws mid/foreground things like stalagmites and trees.**/
class DecorLayer extends Layer {
  content: string;
  contentPaletteSeed: string;
  palette: string[];

  constructor(width: number, height: number, x_offset: number, y_offset: number, content: string, contentPaletteSeed: string, scale: number) {
    super(width, height, x_offset, y_offset, scale);
    this.content = content;
    this.contentPaletteSeed = contentPaletteSeed;
  }

  // Really, this can place any tileable, it's just our only tileables are decor.
  async placeDecor() {
    this.canvas.width = this.width;
    const tileCtx = this.canvas.getContext("2d");
    tileCtx.imageSmoothingEnabled = false;
    if (Object.prototype.hasOwnProperty.call(available_tileables[this.content], "bottom") || Object.prototype.hasOwnProperty.call(available_tileables[this.content], "middle")) {
      let acting_bottom = "bottom";
      if (!Object.prototype.hasOwnProperty.call(available_tileables[this.content], "bottom")) { acting_bottom = "middle" };
      const bottom = await this.recolorOwnTileable(acting_bottom);
      tile_along_y(tileCtx, bottom, this.canvas.height - bottom.height * 2, this.width);
      // "middle" only has any meaning if there's also a bottom
      if (Object.prototype.hasOwnProperty.call(available_tileables[this.content], "middle")) {
        const middle = await this.recolorOwnTileable("middle");
        const bottom_img_height = refs[available_tileables[this.content][acting_bottom]].height * 2;
        const middle_img_height = refs[available_tileables[this.content]["middle"]].height * 2;
        let current_y = this.canvas.height - bottom_img_height - middle_img_height;
        while (current_y > -middle_img_height) {
          tile_along_y(tileCtx, middle, current_y, this.width);
          current_y -= middle_img_height;
        }
      }
    }
    if (Object.prototype.hasOwnProperty.call(available_tileables[this.content], "top")) {
      const top = await this.recolorOwnTileable("top");
      tile_along_y(tileCtx, top, 0, this.width);
    }
  }

  async recolorOwnTileable(portion: string) {
    return replace_color_palette_single_image(overall_palette, this.palette, await refs[available_tileables[this.content][portion]]);
  }

  async update() {
    const colorData = decode_plant_data(this.contentPaletteSeed);
    this.palette = all_palettes[colorData["foliage_palette"]]["palette"].concat(all_palettes[colorData["accent_palette"]]["palette"]).concat(all_palettes[colorData["feature_palette"]]["palette"]);
    this.clearCanvas();
    await this.placeDecor();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  place_back(_place_onto_canvas: HTMLCanvasElement) {
    return
  }

  getSaveData() {
    return {
      "type": LayerType.Decor,
      "x": this.x_offset,
      "y": this.y_offset,
      "w": this.width,
      "h": this.height,
      "content": this.content,
      "palette": this.contentPaletteSeed,
      "s": this.scale
    }
  }
}

///////////////////////  OVERLAY LAYER   ///////////////////////////////////////
class OverlayLayer extends Layer {
  color: string;
  opacity: number;
  affectsBackground: boolean;
  rgbPalette: number[];

  constructor(width: number, height: number, x_offset: number, y_offset: number, color: string, opacity: number, affectsBackground: boolean, scale: number) {
    super(width, height, x_offset, y_offset, scale);
    this.color = color;
    this.opacity = opacity;
    this.affectsBackground = affectsBackground;
  }

  update() {
    // "Caching" as an overlay layer is pointless; we have to calculate on
    // demand, since the canvas might have updated beneath us.
    return;
  }

  place_fore(place_onto_canvas: HTMLCanvasElement) {
    applyOverlay(place_onto_canvas, this.color, this.opacity);
  }

  place_back(place_onto_canvas: HTMLCanvasElement) {
    if (!this.affectsBackground) { return; }
    applyOverlay(place_onto_canvas, this.color, this.opacity);
  }
}

///////////////////////  CELESTIAL LAYER   /////////////////////////////////////
enum CelestialType {
  Stars,
  Sky_Gradient,
  Sky_Chunked,
  Fog
}

class CelestialLayer extends Layer {
  skyPalette: string;
  customPalette: string[];
  content: string;
  opacity: number;

  constructor(width: number, height: number, x_offset: number, y_offset: number, content: string, skyPalette: string, customPalette: string[], opacity: number, scale: number) {
    super(width, height, x_offset, y_offset, scale);
    this.content = content;
    this.skyPalette = skyPalette;
    this.customPalette = customPalette;
    this.opacity = opacity;
  }

  update() {
    this.clearCanvas();
    const type = CelestialType[this.content];
    // First, we parse the sky color(s)
    let actingPalette: string[];
    const ctx = this.canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = this.opacity;
    if (this.skyPalette == "custom") {
      actingPalette = this.customPalette;
    } else {
      actingPalette = available_backgrounds[this.skyPalette];
    }
    if (type == CelestialType.Sky_Gradient) {
      drawSkyGradient(this.canvas, actingPalette, this.opacity);
    } else if (type == CelestialType.Sky_Chunked) {
      const step = 1 / (actingPalette.length);
      for (let i = actingPalette.length - 1; i >= 0; i--) {
        ctx.fillStyle = actingPalette[i];
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * step * (i + 1));
      }
    } else if (type == CelestialType.Stars) {
      this.generateStarfield(actingPalette[0]);
    } else if (type == CelestialType.Fog) {
      return;
    }
  }

  generateStarfield(accentColor: string) {
    // First we need to decide how many stars to make relative to pixels in the canvas, at max
    // There's essentially 4 levels: [1, 2, 3, 4] in a thousand
    const star_ratio = (Math.random() * 4 + 1) / 1000;
    const pixel_indices = this.canvas.width * this.canvas.height - 1 // Let's get that 0 index out of the way
    // Now we pick our potential star positions
    const dim_pixel_pos = [];
    const bright_pixel_pos = [];
    for (let i = 0; i < (pixel_indices * star_ratio); i++) {
      const star_roll = Math.random() * 1000;
      // To give some variation in the star count, there's a 30% chance that any given star gets cut.
      if (star_roll < 300) { continue; }
      // Now small, dim stars...
      if (star_roll < 800) {
        dim_pixel_pos.push(Math.round(Math.random() * pixel_indices));
      } else if (star_roll < 870) {
        bright_pixel_pos.push(Math.round(Math.random() * pixel_indices));
      } else {
        // Math out the large, cross-shaped stars
        const star_core = Math.round(Math.random() * pixel_indices);
        bright_pixel_pos.push(star_core);
        if (star_core > 0) { dim_pixel_pos.push(star_core - 1); }
        if (star_core < pixel_indices) { dim_pixel_pos.push(star_core + 1); }
        if (star_core > this.canvas.width) { dim_pixel_pos.push(star_core - this.canvas.width); }
        if (star_core < pixel_indices - this.canvas.width) { dim_pixel_pos.push(star_core + this.canvas.width); }
      } // Might add shooting stars and the like later
    }
    const ctx = this.canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const main_img = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const main_imgData = main_img.data;
    const rgb_to_use = get_overlay_color_from_name(accentColor, 1);
    for (let i = 0; i < bright_pixel_pos.length; i++) {
      const pos = bright_pixel_pos[i] * 4;
      main_imgData[pos] = 255;
      main_imgData[pos + 1] = 255;
      main_imgData[pos + 2] = 255;
      main_imgData[pos + 3] = 255;
    }
    for (let i = 0; i < dim_pixel_pos.length; i++) {
      const pos = dim_pixel_pos[i] * 4;
      main_imgData[pos] = rgb_to_use[0];
      main_imgData[pos + 1] = rgb_to_use[1];
      main_imgData[pos + 2] = rgb_to_use[2];
      main_imgData[pos + 3] = 100 + Math.random() * 155;
    }
    ctx.putImageData(main_img, 0, 0);
  }

  place_fore(place_onto_canvas: HTMLCanvasElement) {
    if (CelestialType[this.content] == CelestialType.Fog) {
      let actingPalette;
      if (this.skyPalette != "custom") {
        actingPalette = available_backgrounds[this.skyPalette]
      } else {
        actingPalette = this.customPalette;
      }
      // Some day we may have fogs that are fullscreen (cover the stars)
      applyOverlay(place_onto_canvas, actingPalette, this.opacity);//, true);
    }
  }

  setCustomPalette(paletteText: string) {
    if (paletteText.startsWith("#")) {
      this.customPalette = paletteText.toLowerCase().split(" ").join("").split(",");
    } else {
      this.customPalette = all_palettes[decode_plant_data(paletteText)["foliage_palette"]]["palette"].map(x => "#" + x);
    }
    this.update();
  }

  getSaveData() {
    return {
      "type": LayerType.Celestial,
      "content": this.content,
      "palette": this.skyPalette,
      "cust": this.skyPalette == "custom" ? this.customPalette : [],
      "a": this.opacity
    }
  }
}

/**
Shallow clone a garden layer from another garden layer. Mostly used by the layer manager.

Some day I, too, will be able to structuredClone()
**/
/**function cloneGardenLayer(gardenLayer: GardenLayer){
// Empty seed list to start so we don't waste time regenerating canvases
const newGarden = new GardenLayer(gardenLayer.width, gardenLayer.height, gardenLayer.x_offset, gardenLayer.y_offset, [], gardenLayer.groundPaletteSeed, gardenLayer.groundCover, gardenLayer.ground, 1);
newGarden.smart_coords = gardenLayer.smart_coords;
newGarden.content = gardenLayer.content;
newGarden.canvasGarden = gardenLayer.canvasGarden;
newGarden.canvasGround = gardenLayer.canvasGround;
newGarden.canvas = gardenLayer.canvas;
newGarden.seedList = gardenLayer.seedList;
return newGarden;
}**/

export { Layer, GardenLayer, DecorLayer, OverlayLayer, CelestialLayer, CelestialType, LayerType };
