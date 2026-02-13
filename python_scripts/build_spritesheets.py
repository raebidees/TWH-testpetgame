import base64
import io
import json
import math
import os
import requests
import subprocess  # used to run pngcrush
from collections import defaultdict

from PIL import Image, ImageDraw

SPRITES_PER_ROW = 10
SPRITE_DIMENSION = 48  # ex: 32 x 32 px. Also sounds refreshing, too sweet for me though.
GROUND_DIMENSION = 32  # for ground tiles, which fill me with pain
DATA_FILE = "src/data.js"
OUTPATH = "images"


fetch_out = ["all_foliage",
             #"reformatted_named",
             #"available_ground_base"
            ]

def to_rgb(hex):
    return tuple(int(hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

base_foliage_palette = set(to_rgb(x) for x in ["#aed740", "#76c935", "#50aa37", "#2f902b"])
base_accent_palette = set(to_rgb(x) for x in ["fef4cc", "fde47b", "ffd430", "ecb600"])
base_feature_palette = set(to_rgb(x) for x in ["f3addd", "d87fbc", "c059a0", "aa3384"])

hex_codes = ["#aed740", "#76c935", "#50aa37", "#2f902b",
            # accent
            "fef4cc", "fde47b", "ffd430", "ecb600",
            # feature
            "f3addd", "d87fbc", "c059a0", "aa3384",
            # complex, simple, 25%alphaglow, 10%alphaglow
            "ff943a", "e900ff", "c8ffb7", "9fe389"
            ]
custom_colors = {}

def create_accursed_lookup(make_empty=False):
    accursed_color_lookup = defaultdict(lambda: defaultdict(dict))
    if make_empty:
        return accursed_color_lookup
    for idx, code in enumerate(hex_codes):
        rgb_tuple = to_rgb(code)
        accursed_color_lookup[rgb_tuple[0]][rgb_tuple[1]][rgb_tuple[2]] = chr(idx + 65)
    return accursed_color_lookup

def extract_json_from_js_var(var_name):
    with open(DATA_FILE, "r") as f:
        json_string = ""
        for line in f:
            if (var_name + " =") in line:  # fragile, could do with regex
                json_string += "=".join(line.split("=")[1:])
                break
        for line in f:
            if ("// END " + var_name) in line:  # I leave this there myself
                break
            json_string += line
    formatted = json.loads(json_string)
    # One of them is weird because it's much easier to have it as a dict in js
    if var_name == "reformatted_named":
        return[dict(name=x, **y) for x,y in formatted.items()]
    if var_name == "available_ground_base":
        return [y for y in formatted.values()]
    if var_name == "all_palettes":
        return[y["palette"] for y in formatted]
    return formatted        

def assemble_spritesheet_from_list(var_name):
    #if(var_name == "available_ground_base"):
    #    SPRITE_DIMENSION = GROUND_DIMENSION
    json_list = extract_json_from_js_var(var_name)
    num_rows = math.ceil(len(json_list)/SPRITES_PER_ROW)
    spritesheet = Image.new("RGBA",(SPRITES_PER_ROW * SPRITE_DIMENSION, num_rows * SPRITE_DIMENSION))
    sprite_calc_info = []
    last_used_custom_colors=False
    accursed_color_lookup = create_accursed_lookup()
    for idx, sprite_info in enumerate(json_list):
        if idx % 10 == 0:
            print(f"Finished {idx} of {var_name}")
        x_offset = (idx % SPRITES_PER_ROW) * SPRITE_DIMENSION
        y_offset = (math.floor(idx / SPRITES_PER_ROW)) * SPRITE_DIMENSION
        response = requests.get(sprite_info["source"], headers= {"user-agent": "curl/8.1.1", "accept": "*/*"})
        sprite = Image.open(io.BytesIO(response.content)).convert('RGBA')
        if(sprite.size[0] > 90):
            print(f"Missing image? {sprite_info["name"]}")
            sprite = Image.new("RGBA", (10, 10))
            rect = ImageDraw.Draw(sprite)  
            rect.rectangle([(1, 1), (9, 9)], fill ="#aed740", outline ="#fde47b")
        width, height = sprite.size
        bounding_box = sprite.getbbox()
        if last_used_custom_colors:
            accursed_color_lookup = create_accursed_lookup(var_name == "reformatted_named")
        custom_colors = {}
        last_used_custom_colors = False
        last_used_sub_elements = False
        if(bounding_box is None):
            sprite_calc_info.append({"w": width, "h": height, "wc": width/2, "m": 0})
        else:
            left, upper, right, bottom = sprite.getbbox()
            counts = {0: 0, 1: 0, 2:0}
            data = ""
            bbox_sprite = sprite.crop(bounding_box)
            for idx, pixel in enumerate(bbox_sprite.getdata()):
                if pixel[3] < 40:
                    data += '0'
                elif pixel[0] in accursed_color_lookup and pixel[1] in accursed_color_lookup[pixel[0]] and pixel[2] in accursed_color_lookup[pixel[0]][pixel[1]]:
                    data += accursed_color_lookup[pixel[0]][pixel[1]][pixel[2]]
                elif pixel[0] == 255 and pixel[1] == 255 and pixel[2] == 255:
                    data += '1'  # is reserved for hard white, a common "custom" color
                else:
                    if var_name == "reformatted_named":
                        if len(custom_colors.keys()) < 26:
                            char_code = chr(65 + len(custom_colors.keys()))
                        else:
                            char_code = chr((97-26) + len(custom_colors.keys()))
                    else:
                        char_code = chr(97 + len(custom_colors.keys()))
                    accursed_color_lookup[pixel[0]][pixel[1]][pixel[2]] = char_code
                    custom_colors[char_code] = [pixel[0], pixel[1], pixel[2], pixel[3]]
                    data += char_code
                    last_used_custom_colors = True
                if(data[-1] == 'M' or data[-1] == 'N'):
                    last_used_sub_elements = True
                if pixel[:3] in base_foliage_palette:
                    counts[0] += 1
                elif pixel[:3] in base_feature_palette:
                    counts[1] += 1
                elif pixel[:3] in base_accent_palette:
                    counts[2] += 1
            if(len(custom_colors.keys()) > 50):
                print(f"{sprite_info["name"]} used {len(custom_colors.keys())} colors")
            sprite_calc_info.append({"w":right - left, "h": height-upper, "wc": (right + left)/2 + left, "l": height-bottom, "m": max(counts, key=counts.get), "e": data, "x": custom_colors, "s": int(last_used_sub_elements)})
        spritesheet.paste(sprite, (x_offset + (SPRITE_DIMENSION - width)//2, y_offset + (SPRITE_DIMENSION - height)))
    spritesheet.save(f"{OUTPATH}/{var_name}-uncrushed.png")
    subprocess.run([os.path.expanduser("~/misc_tools/pngcrush/pngcrush/pngcrush"), f"{OUTPATH}/{var_name}-uncrushed.png", f"{OUTPATH}/{var_name}.png"])
    # Base64 encode and embed into files
    encoded = base64.b64encode(io.BytesIO(open(f"{OUTPATH}/{var_name}-uncrushed.png", "rb").read()).getvalue()).decode("utf-8")
    indexed_base64_val = base64.b64encode(io.BytesIO(open(f"{OUTPATH}/{var_name}.png", "rb").read()).getvalue()).decode("utf-8")
    if len(indexed_base64_val) < len(encoded):
        print(f"using indexed for {var_name}")
        encoded = indexed_base64_val
    if(var_name == "all_foliage"):
        sedstr = f'/var FOLIAGE_SPRITE_DATA/c\ var FOLIAGE_SPRITE_DATA = {sprite_calc_info}'
        subprocess.run(["sed", "-i", sedstr, os.path.abspath("./src/data.js")])
        sedstr = f'/var FOLIAGE_SPRITESHEET/c\ var FOLIAGE_SPRITESHEET = "data:image/png;base64,{encoded}";'
    elif(var_name == "reformatted_named"):
        sedstr = f'/var NAMED_SPRITE_DATA/c\ var NAMED_SPRITE_DATA = {sprite_calc_info}'
        subprocess.run(["sed", "-i", sedstr, os.path.abspath("./src/data.js")])
        sedstr = f'/var NAMED_SPRITESHEET/c\ var NAMED_SPRITESHEET = "data:image/png;base64,{encoded}";'
    elif(var_name == "available_ground_base"):
        sedstr = f'/var GROUND_BASE_SPRITESHEET/c\ var GROUND_BASE_SPRITESHEET = "data:image/png;base64,{encoded}";'
    else:
        raise ValueError(f"sedstr is unconfigured for {var_name}!")
    subprocess.run(["sed", "-i", sedstr, os.path.abspath("./src/data.js")])

if __name__ == "__main__":
    # We do this every time because somehow this became the universal script and I don't want to forget to do this.
    min_palettes = extract_json_from_js_var("all_palettes")
    sedstr = f'/const all_palettes/c\ const all_palettes = {min_palettes};'
    subprocess.run(["sed", "-i", sedstr, os.path.abspath("./src/virtually_universal_config.ts")])
    for var in fetch_out:
        assemble_spritesheet_from_list(var)
