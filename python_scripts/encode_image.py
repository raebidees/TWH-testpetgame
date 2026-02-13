# Transform the image at some URL into the base64 form.

import base64
import io
import requests
import subprocess  # used to run pngcrush
import sys

from PIL import Image

if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise ValueError("provide the url, ya goof")
    url = sys.argv[1]
    response = requests.get(url, headers= {"user-agent": "curl/8.1.1", "accept": "*/*"})
    raw_base64 = io.BytesIO(response.content)
    # We try indexing the image, though so far the indexing header seemingly ate more space than the indexing saved
    # In theory, we can do this just fine in PIL, but imagemagick gave better results
    sprite = Image.open(raw_base64)
    #sprite = sprite.convert(mode="P", palette=Image.ADAPTIVE)
    #buff = io.BytesIO()
    #sprite.save(buff, format="PNG")
    sprite.save("working.png")
    subprocess.run(["pngcrush", "-ow", "-rem allb", "-reduce", "working.png"])
    subprocess.run(["magick", "working.png", "-type", "Palette", "-transparent", "#000000", "worked.png"])
    subprocess.run(["pngcrush", "-ow", "-rem", "allb", "-reduce", "worked.png"])
    print("\n\n\n")
    base64_val = base64.b64encode(io.BytesIO(open("working.png", "rb").read()).getvalue()).decode("utf-8")
    indexed_base64_val = base64.b64encode(io.BytesIO(open("worked.png", "rb").read()).getvalue()).decode("utf-8")
    print(len(indexed_base64_val), len(base64_val))
    if len(indexed_base64_val) < len(base64_val):
        print(f"Compressed!")
        print("data:image/png;base64,"+ indexed_base64_val)
    else:
        print("data:image/png;base64,"+ base64_val)
