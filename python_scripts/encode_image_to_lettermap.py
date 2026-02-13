import base64
import io
import sys
import json
import math
import os
import requests
import subprocess  # used to run pngcrush
from collections import defaultdict
import base64

from PIL import Image, ImageDraw

def to_rgb(hex):
    return tuple(int(hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

base_foliage_palette = set(to_rgb(x) for x in ["#aed740", "#76c935", "#50aa37", "#2f902b"])
base_accent_palette = set(to_rgb(x) for x in ["fef4cc", "fde47b", "ffd430", "ecb600"])
base_feature_palette = set(to_rgb(x) for x in ["f3addd", "d87fbc", "c059a0", "aa3384"])

accursed_color_lookup = defaultdict(lambda: defaultdict(dict))
hex_codes = ["#aed740", "#76c935", "#50aa37", "#2f902b",
            # accent
            "fef4cc", "fde47b", "ffd430", "ecb600",
            # feature
            "f3addd", "d87fbc", "c059a0", "aa3384",
            # complex, simple, 25%alphaglow, 10%alphaglow
            "ff943a", "e900ff", "c8ffb7", "9fe389"
            ]
custom_colors = {}
for idx, code in enumerate(hex_codes):
    rgb_tuple = to_rgb(code)
    accursed_color_lookup[rgb_tuple[0]][rgb_tuple[1]][rgb_tuple[2]] = chr(idx + 65)

nonsense = ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AYht+mFUUqDu0g4pChOlkoKuKoVShChVArtOpgcukfNGlIUlwcBdeCgz+LVQcXZ10dXAVB8AfE0clJ0UVK/C4ptIjxjuMe3vvel7vvAKFZZZoVSgCabpuZVFLM5VfF3lcEaYaQQERmljEnSWn4jq97BPh+F+dZ/nV/jgG1YDEgIBLPMsO0iTeIpzdtg/M+cZSVZZX4nHjcpAsSP3Jd8fiNc8llgWdGzWxmnjhKLJa6WOliVjY14inimKrplC/kPFY5b3HWqnXWvid/YbigryxzndYIUljEEiSIUFBHBVXYiNOuk2IhQ+dJH/+w65fIpZCrAkaOBdSgQXb94H/wu7dWcXLCSwongZ4Xx/kYBXp3gVbDcb6PHad1AgSfgSu94681gZlP0hsdLXYEDG4DF9cdTdkDLneAoSdDNmVXCtISikXg/Yy+KQ9EboH+Na9v7XOcPgBZ6lX6Bjg4BMZKlL3u8+6+7r79W9Pu3w8vYHKMYzGybwAAAAZiS0dEAFAAqgA3rQIJDQAAAA1JREFUCNdjuFG/5z8AB1kDE2w6+UQAAAAASUVORK5CYII=",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AYht+mFUUqDu0g4pChOlkoKuKoVShChVArtOpgcukfNGlIUlwcBdeCgz+LVQcXZ10dXAVB8AfE0clJ0UVK/C4ptIjxjuMe3vvel7vvAKFZZZoVSgCabpuZVFLM5VfF3lcEaYaQQERmljEnSWn4jq97BPh+F+dZ/nV/jgG1YDEgIBLPMsO0iTeIpzdtg/M+cZSVZZX4nHjcpAsSP3Jd8fiNc8llgWdGzWxmnjhKLJa6WOliVjY14inimKrplC/kPFY5b3HWqnXWvid/YbigryxzndYIUljEEiSIUFBHBVXYiNOuk2IhQ+dJH/+w65fIpZCrAkaOBdSgQXb94H/wu7dWcXLCSwongZ4Xx/kYBXp3gVbDcb6PHad1AgSfgSu94681gZlP0hsdLXYEDG4DF9cdTdkDLneAoSdDNmVXCtISikXg/Yy+KQ9EboH+Na9v7XOcPgBZ6lX6Bjg4BMZKlL3u8+6+7r79W9Pu3w8vYHKMYzGybwAAAAZiS0dEAFAAqgA3rQIJDQAAABtJREFUCNdj/Lz27v+nl+4zMD29dJ/hxa0nDABvMgtSgMJTmAAAAABJRU5ErkJggg==",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAFCAYAAACAcVaiAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AYht+mFUUqDu0g4pChOlkoKuKoVShChVArtOpgcukfNGlIUlwcBdeCgz+LVQcXZ10dXAVB8AfE0clJ0UVK/C4ptIjxjuMe3vvel7vvAKFZZZoVSgCabpuZVFLM5VfF3lcEaYaQQERmljEnSWn4jq97BPh+F+dZ/nV/jgG1YDEgIBLPMsO0iTeIpzdtg/M+cZSVZZX4nHjcpAsSP3Jd8fiNc8llgWdGzWxmnjhKLJa6WOliVjY14inimKrplC/kPFY5b3HWqnXWvid/YbigryxzndYIUljEEiSIUFBHBVXYiNOuk2IhQ+dJH/+w65fIpZCrAkaOBdSgQXb94H/wu7dWcXLCSwongZ4Xx/kYBXp3gVbDcb6PHad1AgSfgSu94681gZlP0hsdLXYEDG4DF9cdTdkDLneAoSdDNmVXCtISikXg/Yy+KQ9EboH+Na9v7XOcPgBZ6lX6Bjg4BMZKlL3u8+6+7r79W9Pu3w8vYHKMYzGybwAAAAZiS0dEAFAAqgA3rQIJDQAAAEVJREFUCNcFwaENgDAAALDCFRPTPMCBGK4hmUNyABpFliwYSOZ3wGhBS6XDAPdy9JpfY0ul1/wKUzR+1yNM0bWfwDavHX4g0hdUYotWOwAAAABJRU5ErkJggg==",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAADCAYAAABfwxXFAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AYht+mFUUqDu0g4pChOlkoKuKoVShChVArtOpgcukfNGlIUlwcBdeCgz+LVQcXZ10dXAVB8AfE0clJ0UVK/C4ptIjxjuMe3vvel7vvAKFZZZoVSgCabpuZVFLM5VfF3lcEaYaQQERmljEnSWn4jq97BPh+F+dZ/nV/jgG1YDEgIBLPMsO0iTeIpzdtg/M+cZSVZZX4nHjcpAsSP3Jd8fiNc8llgWdGzWxmnjhKLJa6WOliVjY14inimKrplC/kPFY5b3HWqnXWvid/YbigryxzndYIUljEEiSIUFBHBVXYiNOuk2IhQ+dJH/+w65fIpZCrAkaOBdSgQXb94H/wu7dWcXLCSwongZ4Xx/kYBXp3gVbDcb6PHad1AgSfgSu94681gZlP0hsdLXYEDG4DF9cdTdkDLneAoSdDNmVXCtISikXg/Yy+KQ9EboH+Na9v7XOcPgBZ6lX6Bjg4BMZKlL3u8+6+7r79W9Pu3w8vYHKMYzGybwAAAAZiS0dEAFAAqgA3rQIJDQAAADFJREFUCNdjYEACvz+Z/UfmMzEwMDAciFzw/0b9nv8MDAwMN+r3/D8QuQCiCM7AwgYATx8W4XkVhqAAAAAASUVORK5CYII=",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TtSKVDnbQ4pChOlkQFXHUKhShQqgVWnUwufQLmjQkLS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPMNKtrHND0qplKxMVMdlUMvCKAEHowhIjMLGNOkpLwHF/38PH1LsazvM/9OfrVnMUAn0g8ywyzSrxBPL1ZNTjvE4dZUVaJz4nHTLog8SPXFZffOBccFnhm2Eyn5onDxGKhg5UOZkVTI54ijqqaTvlCxmWV8xZnrVxjrXvyFwZz+soy12kOI4FFLEGCCAU1lFBGFTFadVIspGg/7uGPOH6JXAq5SmDkWEAFGmTHD/4Hv7u18pMTblIwDnS/2PbHCBDYBZp12/4+tu3mCeB/Bq70tr/SAGY+Sa+3tegRENoGLq7bmrIHXO4Ag0+GbMqO5Kcp5PPA+xl9UxYYuAX61tzeWvs4fQDS1FXyBjg4BEYLlL3u8e7ezt7+PdPq7wc0nHKOY//6AQAAAAZiS0dEAAAAAAAA+UO7fwAAALNJREFUGNNtjrEOwWAURs8vtorFY0hEgjDyBh7CM1hql3gUg261iomkYpEwGmoraaQd/Z+hKm24y82958s9F/6UJBVn8y+g9ABApdY1AJUc2iT4BhR7mOsEmwQqhRR72NsM43SyRfNYVuRXXqGLTQJJkk5tRT4q/VGENgkU+SjyM57rjGKP+9r8aoCqJLzLSLtnyrzlAvDYdlk0egzqjmBjWJ2HAniFLuNlX5GPPh2A6b6nN1bBc2BsiDjSAAAAAElFTkSuQmCC",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAADCAYAAABfwxXFAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TtSKVDnbQ4pChOlkQFXHUKhShQqgVWnUwufQLmjQkLS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPMNKtrHND0qplKxMVMdlUMvCKAEHowhIjMLGNOkpLwHF/38PH1LsazvM/9OfrVnMUAn0g8ywyzSrxBPL1ZNTjvE4dZUVaJz4nHTLog8SPXFZffOBccFnhm2Eyn5onDxGKhg5UOZkVTI54ijqqaTvlCxmWV8xZnrVxjrXvyFwZz+soy12kOI4FFLEGCCAU1lFBGFTFadVIspGg/7uGPOH6JXAq5SmDkWEAFGmTHD/4Hv7u18pMTblIwDnS/2PbHCBDYBZp12/4+tu3mCeB/Bq70tr/SAGY+Sa+3tegRENoGLq7bmrIHXO4Ag0+GbMqO5Kcp5PPA+xl9UxYYuAX61tzeWvs4fQDS1FXyBjg4BEYLlL3u8e7ezt7+PdPq7wc0nHKOY//6AQAAAAZiS0dEAFIAGgBKPCip/AAAADFJREFUCNdjYEACN+r3/EfmMzEwMDD8v2Lw/++T6v8MDAwMf59U//9/xQCiCM7AwgYAjacY1XrGe9QAAAAASUVORK5CYII=",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAFCAYAAACAcVaiAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TtSKVDnbQ4pChOlkQFXHUKhShQqgVWnUwufQLmjQkLS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPMNKtrHND0qplKxMVMdlUMvCKAEHowhIjMLGNOkpLwHF/38PH1LsazvM/9OfrVnMUAn0g8ywyzSrxBPL1ZNTjvE4dZUVaJz4nHTLog8SPXFZffOBccFnhm2Eyn5onDxGKhg5UOZkVTI54ijqqaTvlCxmWV8xZnrVxjrXvyFwZz+soy12kOI4FFLEGCCAU1lFBGFTFadVIspGg/7uGPOH6JXAq5SmDkWEAFGmTHD/4Hv7u18pMTblIwDnS/2PbHCBDYBZp12/4+tu3mCeB/Bq70tr/SAGY+Sa+3tegRENoGLq7bmrIHXO4Ag0+GbMqO5Kcp5PPA+xl9UxYYuAX61tzeWvs4fQDS1FXyBjg4BEYLlL3u8e7ezt7+PdPq7wc0nHKOY//6AQAAAAZiS0dEAFIAGgBKPCip/AAAAD9JREFUCNcFwbERQEAQAMB1FShFH0oSq0dEFR8ZJQjN+OBTf3ZBbyUhIOsmrymjt5JRd32cDd+9JLznCjyHhB89JhhiuRSuUwAAAABJRU5ErkJggg==",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAYAAACXU8ZrAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TtSKVDnbQ4pChOlkQFXHUKhShQqgVWnUwufQLmjQkLS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPMNKtrHND0qplKxMVMdlUMvCKAEHowhIjMLGNOkpLwHF/38PH1LsazvM/9OfrVnMUAn0g8ywyzSrxBPL1ZNTjvE4dZUVaJz4nHTLog8SPXFZffOBccFnhm2Eyn5onDxGKhg5UOZkVTI54ijqqaTvlCxmWV8xZnrVxjrXvyFwZz+soy12kOI4FFLEGCCAU1lFBGFTFadVIspGg/7uGPOH6JXAq5SmDkWEAFGmTHD/4Hv7u18pMTblIwDnS/2PbHCBDYBZp12/4+tu3mCeB/Bq70tr/SAGY+Sa+3tegRENoGLq7bmrIHXO4Ag0+GbMqO5Kcp5PPA+xl9UxYYuAX61tzeWvs4fQDS1FXyBjg4BEYLlL3u8e7ezt7+PdPq7wc0nHKOY//6AQAAAAZiS0dEAFIAGgBKPCip/AAAAGdJREFUCNdVjSEOgDAAA28EB4afTPAHHsWjUJDwh8k9AUnCxJCsCFgYVU2vaeHVtY1K0QkgRce1jRlR88mca0eKTlXbmyJ/Sik6KUw0w2EUprwMQBVmkLflheStyit5+5lc3hf0g8AN0bk6XjUnWzIAAAAASUVORK5CYII=",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAHCAYAAADAp4fuAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TtSKVDnbQ4pChOlkQFXHUKhShQqgVWnUwufQLmjQkLS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPMNKtrHND0qplKxMVMdlUMvCKAEHowhIjMLGNOkpLwHF/38PH1LsazvM/9OfrVnMUAn0g8ywyzSrxBPL1ZNTjvE4dZUVaJz4nHTLog8SPXFZffOBccFnhm2Eyn5onDxGKhg5UOZkVTI54ijqqaTvlCxmWV8xZnrVxjrXvyFwZz+soy12kOI4FFLEGCCAU1lFBGFTFadVIspGg/7uGPOH6JXAq5SmDkWEAFGmTHD/4Hv7u18pMTblIwDnS/2PbHCBDYBZp12/4+tu3mCeB/Bq70tr/SAGY+Sa+3tegRENoGLq7bmrIHXO4Ag0+GbMqO5Kcp5PPA+xl9UxYYuAX61tzeWvs4fQDS1FXyBjg4BEYLlL3u8e7ezt7+PdPq7wc0nHKOY//6AQAAAAZiS0dEAFIAGgBKPCip/AAAAHBJREFUCNc1jb0JwzAUhA9BlnGlxqT1CNnBO9iFNgrEGsATBF4pSJVOAwj8XOqdC1lXffcDB9wyFXZ2HVgimHwrag4wFW6/iaaCmkMLj88fpsK+dAC4DzNZItbz0ZamAibP5Tuy5nAfJA8AeL2f7P4Cvbc9Z2cEVAAAAAAASUVORK5CYII=",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAICAYAAAA1BOUGAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TtSKVDnbQ4pChOlkQFXHUKhShQqgVWnUwufQLmjQkLS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPMNKtrHND0qplKxMVMdlUMvCKAEHowhIjMLGNOkpLwHF/38PH1LsazvM/9OfrVnMUAn0g8ywyzSrxBPL1ZNTjvE4dZUVaJz4nHTLog8SPXFZffOBccFnhm2Eyn5onDxGKhg5UOZkVTI54ijqqaTvlCxmWV8xZnrVxjrXvyFwZz+soy12kOI4FFLEGCCAU1lFBGFTFadVIspGg/7uGPOH6JXAq5SmDkWEAFGmTHD/4Hv7u18pMTblIwDnS/2PbHCBDYBZp12/4+tu3mCeB/Bq70tr/SAGY+Sa+3tegRENoGLq7bmrIHXO4Ag0+GbMqO5Kcp5PPA+xl9UxYYuAX61tzeWvs4fQDS1FXyBjg4BEYLlL3u8e7ezt7+PdPq7wc0nHKOY//6AQAAAAZiS0dEAFIAGgBKPCip/AAAAMJJREFUCNdNiq9qQnEcR8/3pzBkPoJVhorsBsWqb6DCBpY130BMgslgs1uMYhDtgrcIXli8TLlLgsHsnzTwY3CCpxwOHAPYdhdKN5cGMD+tyI47SjeXFr+ev3HJgm25D9lxR4DFUj2cSxZQ6OkQ7fkdVnSI9rx9tASAQk8P+42RFHpqB0UUejKA6aas9fFC//WP2s8LX/kE9YxvTDdl/Q+0g6LeBzkAqpOSXD3jm98YsT5eFO0cgABmn4HxTHVS0nPfAKApUxXy027EAAAAAElFTkSuQmCC",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAGCAYAAADkOT91AAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TtSKVDnbQ4pChOlkQFXHUKhShQqgVWnUwufQLmjQkLS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPMNKtrHND0qplKxMVMdlUMvCKAEHowhIjMLGNOkpLwHF/38PH1LsazvM/9OfrVnMUAn0g8ywyzSrxBPL1ZNTjvE4dZUVaJz4nHTLog8SPXFZffOBccFnhm2Eyn5onDxGKhg5UOZkVTI54ijqqaTvlCxmWV8xZnrVxjrXvyFwZz+soy12kOI4FFLEGCCAU1lFBGFTFadVIspGg/7uGPOH6JXAq5SmDkWEAFGmTHD/4Hv7u18pMTblIwDnS/2PbHCBDYBZp12/4+tu3mCeB/Bq70tr/SAGY+Sa+3tegRENoGLq7bmrIHXO4Ag0+GbMqO5Kcp5PPA+xl9UxYYuAX61tzeWvs4fQDS1FXyBjg4BEYLlL3u8e7ezt7+PdPq7wc0nHKOY//6AQAAAAZiS0dEAFIAGgBKPCip/AAAAEVJREFUCNc9iiEWgDAMxdKeqPfjUKjtFJM9AhIxMcs+hhKXvBjAXkOaJz6bsdcQgDJ4rkPUcXdQhowPZQCo/N+9gs8GwAtYpCGIQT9HNwAAAABJRU5ErkJggg==",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAFCAYAAACXU8ZrAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TtSKVDnbQ4pChOlkQFXHUKhShQqgVWnUwufQLmjQkLS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPMNKtrHND0qplKxMVMdlUMvCKAEHowhIjMLGNOkpLwHF/38PH1LsazvM/9OfrVnMUAn0g8ywyzSrxBPL1ZNTjvE4dZUVaJz4nHTLog8SPXFZffOBccFnhm2Eyn5onDxGKhg5UOZkVTI54ijqqaTvlCxmWV8xZnrVxjrXvyFwZz+soy12kOI4FFLEGCCAU1lFBGFTFadVIspGg/7uGPOH6JXAq5SmDkWEAFGmTHD/4Hv7u18pMTblIwDnS/2PbHCBDYBZp12/4+tu3mCeB/Bq70tr/SAGY+Sa+3tegRENoGLq7bmrIHXO4Ag0+GbMqO5Kcp5PPA+xl9UxYYuAX61tzeWvs4fQDS1FXyBjg4BEYLlL3u8e7ezt7+PdPq7wc0nHKOY//6AQAAAAZiS0dEAFIAGgBKPCip/AAAAJRJREFUCNdNiiELwkAYQN8diHVg9xcYVsQm9hVX/CWiYf/IoDPMbDEMLiwMjQMdJoUDz3j3WXT42uM9AKSOCc6IbzPZXmadB2cEQAEEZyS/LVXqrYQoQdsCQKlRhW8z0XyZNkdZv3tq/zqRnvs8r5XMNxO0LdAAYne/l9RbmrtTg2FMvigJUdI1HgcEYFWO5d+ljuUDcwFI7+CX2HUAAAAASUVORK5CYII=",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TtSKVDnbQ4pChOlkQFXHUKhShQqgVWnUwufQLmjQkLS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPMNKtrHND0qplKxMVMdlUMvCKAEHowhIjMLGNOkpLwHF/38PH1LsazvM/9OfrVnMUAn0g8ywyzSrxBPL1ZNTjvE4dZUVaJz4nHTLog8SPXFZffOBccFnhm2Eyn5onDxGKhg5UOZkVTI54ijqqaTvlCxmWV8xZnrVxjrXvyFwZz+soy12kOI4FFLEGCCAU1lFBGFTFadVIspGg/7uGPOH6JXAq5SmDkWEAFGmTHD/4Hv7u18pMTblIwDnS/2PbHCBDYBZp12/4+tu3mCeB/Bq70tr/SAGY+Sa+3tegRENoGLq7bmrIHXO4Ag0+GbMqO5Kcp5PPA+xl9UxYYuAX61tzeWvs4fQDS1FXyBjg4BEYLlL3u8e7ezt7+PdPq7wc0nHKOY//6AQAAAAZiS0dEAC8AkAAr631CGgAAAJRJREFUGNNNj7ERwkAMBPf0hA6+ABfhwFRB5B5cAwnx1+PIPcAMoQtwQAE/DIRYJP8GRZq5095J/M3ncQFAcXDPE4Csitvr7ooDgFvTK7RJgKteVhEQgOeJ0CYOBYnWkS2e9ogClmougOXZi0mKA9b0WGjTjp9CpEQ44L50WCG45VnX53vftY7V+HvvfDs6gC9d7cAX34I7CdWoLQwAAAAASUVORK5CYII=",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAABhGlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw0AcxV9TtSKVDnbQ4pChOlkQFXHUKhShQqgVWnUwufQLmjQkLS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQqPMNKtrHND0qplKxMVMdlUMvCKAEHowhIjMLGNOkpLwHF/38PH1LsazvM/9OfrVnMUAn0g8ywyzSrxBPL1ZNTjvE4dZUVaJz4nHTLog8SPXFZffOBccFnhm2Eyn5onDxGKhg5UOZkVTI54ijqqaTvlCxmWV8xZnrVxjrXvyFwZz+soy12kOI4FFLEGCCAU1lFBGFTFadVIspGg/7uGPOH6JXAq5SmDkWEAFGmTHD/4Hv7u18pMTblIwDnS/2PbHCBDYBZp12/4+tu3mCeB/Bq70tr/SAGY+Sa+3tegRENoGLq7bmrIHXO4Ag0+GbMqO5Kcp5PPA+xl9UxYYuAX61tzeWvs4fQDS1FXyBjg4BEYLlL3u8e7ezt7+PdPq7wc0nHKOY//6AQAAAAZiS0dEAFIAGgBKPCip/AAAAGhJREFUCNcFwSEOQFAAx+HfcxOZjc3eVEcQdLdQBEWS3jnokiQxRRAcQJRsov19HwDfVSvvU76rVuQC0BHrHlG1Wu4R6YjlAcx+RpduzH4GgGfC3SzPC8DyvAxlYTibicgFVKtVn7QA/P2ZJ+4wTf0bAAAAAElFTkSuQmCC",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAQAAAAnZu5uAAAADElEQVQIW2NgIAsAAAA3AAHczgFpAAAAAElFTkSuQmCC",

"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAJklEQVQI12NgAIIT/7f///flzH8QzYAsAAJwCZgADID42FViMxMA8XhNvSlu1EkAAAAASUVORK5CYII="]
      

def calc_sprite_data_entry(dataURL):
        sprite = Image.open(io.BytesIO(base64.b64decode(dataURL + '=='))).convert('RGBA')
        width, height = sprite.size
        bounding_box = sprite.getbbox()
        uses_custom_colors=False
        bbox = sprite.getbbox()
        if not bbox:
            print({"w":1, "h": 1, "wc": 1, "l": 0, "m": 0, "e": "0", "x": 0})
            return
        left, upper, right, bottom = bbox
        counts = {0: 0, 1: 0, 2:0}
        data = ""
        for idx, pixel in enumerate(sprite.crop(bounding_box).getdata()):
            if pixel[3] == 0:
                data += '0'
            elif pixel[0] in accursed_color_lookup and pixel[1] in accursed_color_lookup[pixel[0]] and pixel[2] in accursed_color_lookup[pixel[0]][pixel[1]]:
                data += accursed_color_lookup[pixel[0]][pixel[1]][pixel[2]]
            elif pixel[0] == 255 and pixel[1] == 255 and pixel[2] == 255:
                data += '1'  # is reserved for hard white, a common "custom" color
            else:
                data += 'C'
                uses_custom_colors = True
            if data[-1] == 'M' or data[-1] == 'N':
                uses_custom_colors = True
            if pixel[:3] in base_foliage_palette:
                counts[0] += 1
            elif pixel[:3] in base_feature_palette:
                counts[1] += 1
            elif pixel[:3] in base_accent_palette:
                counts[2] += 1
        print({"w":right - left, "h": height-upper, "wc": (right + left)/2 + left, "l": height-bottom, "m": max(counts, key=counts.get), "e": data, "x": int(uses_custom_colors)})


if __name__ == "__main__":
    for entry in nonsense:
        calc_sprite_data_entry(entry[21:])
