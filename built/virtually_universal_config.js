// Handles stuff that's universal to all the pages, so I can copy-paste blindly and only worry about editing this file.
// The only non-module thingy probably, lest we get flashes of unstyled content.
const broadcast_number = 2.10; // Version + possibly a broadcast-specific increment
const broadcast_title = "Release 2.10";
const broadcast_text = "Smaller release, but with some important fixes. Happy holidays!<ul><li>Added 'Reset Tutorial' button in Settings</li><li>Fixed text display for Settings' backup button</li><li>Improved visibility of 'earnables show palettes' graphics option</li><li>Moved 'legacy page' section off the front page</li><li>Showcase mode no longer clips large bases</li><li>3 new bases</li><li>3 new palettes</li><li>Fixed the first/worst of the image problems for UK folks</li>";
const all_palettes = [['aed740', '76c935', '50aa37', '2f902b'], ['a2ac4d', '8f974a', '66732a', '4b692f'], ['7ad8b7', '5eb995', '3e946d', '277b50'], ['9dbb86', '679465', '476f58', '2f4d47'], ['8fbe99', '58906f', '3f7252', '215a3f'], ['fdff07', 'b9d50f', '669914', '34670b'], ['b0f7a9', '7dcc75', '63aa5a', '448d3c'], ['c5af7a', 'a6905c', '806d40', '69582e'], ['6ee964', '54c44b', '3da136', '228036'], ['e7d7c1', 'a78a7f', '735751', '603f3d'], ['9c6695', '734978', '4c2d5c', '2f1847'], ['f8cd1e', 'd3a740', 'b2773a', '934634'], ['e4eaf3', 'c0cfe7', '9ab3db', '7389ad'], ['b98838', '8c6526', '674426', '54401f'], ['8f8090', '655666', '453946', '2a212b'], ['f5dbd7', 'eec3c3', 'd396a8', 'c9829d'], ['cdd1ff', '9fc0ff', '709ade', '4b5e95'], ['f6e9a4', 'e8b78e', 'd5737d', 'c45088'], ['e88c50', 'd0653e', 'af3629', '9b1f1f'], ['fef4cc', 'fde47b', 'ffd430', 'ecb600'], ['f3addd', 'd87fbc', 'c059a0', 'aa3384'], ['3ac140', '1b9832', '116d22', '085c17'], ['eaf4bd', 'aade87', '6cc750', '1aaa09'], ['b77e4e', '88572e', '674426', '543a24'], ['b7ed6c', '83d764', '47be5c', '0ca553'], ['f3eacf', 'e4d4be', 'ccb4a4', 'b69389'], ['edc55c', 'd99b61', 'bf7464', 'a6636c'], ['8bfdd6', '55dbc3', '25b8b5', '0b8c9d'], ['f5e2af', 'f3c13d', 'cba134', 'a7832d'], ['a66547', '6e3837', '542c37', '45283a'], ['cedd80', '95c27d', '52a279', '057d77'], ['fff9cf', 'f4d6bc', 'eaaba8', 'dc91b8'], ['b77e4e', '88572e', '674426', '543a24'], ['c5af7a', 'a6905c', '806d40', '69582e'], ['a6705a', '8b4e35', '6c2e1c', '571d0e'], ['fa9292', 'f55757', 'e32b2b', 'ca0e18'], ['93aaff', '5778f5', '3a5ad2', '233fa8'], ['ffcf80', 'ffb63e', 'ff9300', 'da7500'], ['f5fff4', 'dbf5d9', 'bee1bb', '9fc99c'], ['cd41d9', 'b309c0', '860d9e', '61067b'], ['8cf5f8', '30e8ed', '18c9d4', '0798a6'], ['b5c085', '7b9b64', '47774a', '305540'], ['9bcf4b', '719e34', '45681a', '274409'], ['4fb81d', '339324', '1d7628', '075a2d'], ['6e7706', '465f14', '234d21', '033a34'], ['78a562', '4e875a', '2a6e53', '0c584d'], ['077773', '135260', '21294d', '2e033a'], ['e0ea8a', 'bdbb5c', 'b0983a', 'a5791b'], ['fcf050', 'dca02a', 'c46212', 'ae2c00'], ['adef94', '71d86b', '2fc45a', '0aab68'], ['f6cfec', 'eca9ee', 'cd86e6', 'ab6ce0'], ['ffd2c6', 'ffb39c', 'ff8e69', 'f87e4a'], ['684e39', '513522', '391e10', '1f0c03'], ['fce382', 'ebab8a', 'dc5890', 'b027a1'], ['71f4a3', '68dbba', '4cb1c4', '3c7fb2'], ['c5e9fc', 'b5c1fa', 'a494f8', '9163f5'], ['f83234', 'c92637', '841732', '560e27'], ['fbeba5', 'c6b05f', '929564', '527259'], ['fff7cf', 'ece2b1', 'ddcea1', 'ccb78e'], ['fb8dc2', 'd75dd0', 'a44abf', '7c3fae'], ['e1e0ff', 'aaa8c1', '7c7a8f', '4c4b53'], ['a6a190', '938a7d', '74685a', '5a5144'], ['2e7747', '175143', '143841', '12253e'], ['7dc9d2', '4e85b1', '325689', '312f70'], ['405251', '2b393a', '1e252a', '14151e'], ['666fa9', '424071', '2c1f4c', '240539'], ['cc3a77', '942162', '5d1354', '2f0e4d'], ['59a89f', '325354', '2b262e', '2e0d19'], ['899571', '545a4a', '40463a', '2d302e'], ['99ad57', '54623c', '37422c', '151d1d'], ['c25a4a', '8f2e21', '711612', '4d0606'], ['9c0900', '6a0b00', '3e0600', '180200'], ['ddd784', 'c1c656', '99ae39', '769926'], ['b1ed11', '46d01b', '18b069', '168b98'], ['ccc65d', '99902f', '7f771d', '605a16'], ['8e8e4f', '6d703e', '4d542b', '3b4429'], ['b9d163', 'b7a949', '9b6d3b', '7c352c'], ['e3c510', 'bc8c0e', '864a0b', '541f08'], ['452a31', '3b1817', '29100e', '1a0a06'], ['ba7b59', 'a05d39', '7f4323', '66371c'], ['bc8060', '8c6047', '76523c', '644030'], ['b4a58a', '8e795e', '674d36', '432a1c'], ['e2cda7', 'd5835d', 'bd4b34', '692b26'], ['578759', '316140', '21372a', '101e11'], ['82d083', '53ab6b', '277e5a', '0d534b'], ['82d083', '81b964', '318945', '105949'], ['ab5b11', '8f4711', '5d2611', '481b13'], ['d8c6f2', 'a08dcb', '7466b0', '352e63'], ['759e94', '77725b', '785634', '7a4017'], ['b4f6eb', '76c6cd', '3a7b9c', '1f4f7f'], ['d0c26d', 'aaaa6a', '738a66', '446c62'], ['b8efe6', '83a3ce', '6b60b3', '6e3789'], ['c498a3', '9f7688', '6e446c', '472147'], ['d17936', 'b35d33', '7b2806', '421c16'], ['ecffdd', 'aed0c0', '718c93', '444e63'], ['9c4547', '7f3d4a', '51314d', '3b2b4f'], ['efeccc', 'd1cba6', '978d72', '6c6a6e'], ['479ec2', '3b76aa', '1e3663', '1a0945'], ['f8a818', 'fe5f14', 'c91831', '730c4e'], ['eca3b2', 'b65d86', '72205f', '440843'], ['f0d9ee', 'e0c0e4', 'bd9ad5', '9379bd'], ['d798f3', 'da6ace', 'ca3b97', 'a22152'], ['d4f1d7', 'c4e47b', 'e9db5d', 'ef924b'], ['ffe0b5', 'eea383', 'db5754', 'ca2e55'], ['f6f6f6', 'cccccc', 'aaaaaa', '888888'], ['444e63', '718c93', 'aed0c0', 'ecffdd'], ['c6f4da', '9fe1bf', '77cda6', '55b79a'], ['c4a163', 'a05846', '7a2740', '50044d'], ['eee0d0', 'aa8595', '736281', '26426d'], ['222552', '1b0e36', '120928', '01020d'], ['ddd1ff', 'c69ff6', 'be7cf1', 'ad4fe3'], ['a1f5be', '5f7a6f', '3b3643', '1e0221'], ['fcffd9', 'f6e8a0', 'f0cb7e', 'e7b45a'], ['ff0033', 'aa3388', '6633bb', '2222aa'], ['f6f2bc', 'ffff55', 'efac01', 'd47606'], ['450730', '870921', 'cd4c1c', 'ffe662'], ['f35074', 'a15056', '636035', '235028'], ['e7fffb', 'abfff0', '039278', '00332a'], ['aae8a5', '67bdb4', '48717c', '264852'], ['ffebe7', 'ffcdbe', 'ff82a9', '7f95d1'], ['ffa600', 'ff6361', 'bc5090', '58508d'], ['ffe600', 'ffa600', 'ff4800', '290700'], ['fef0a2', 'dfcfb0', 'bfaebd', 'a08dcb'], ['fff6e6', 'ffddd6', 'efc4d6', 'c6b6d6'], ['5b4457', '3f353d', '2f252d', '201920'], ['fff4dc', 'dfc48c', 'a89265', '806e4b'], ['c4fad1', '94d3a2', '71b280', '5e9e80'], ['433a36', '332b28', '26211e', '16100b'], ['dde5f6', 'ffffff', 'bbf0fa', 'aabbee'], ['2fcec9', '65868b', '83533d', '7f3456'], ['f38bb8', 'ed4170', 'a03a4b', '470d11'], ['fbd51a', 'f5b15c', 'e18328', '8a4f46'], ['f0ead2', 'dde5b4', 'c5d396', 'adc178'], ['caf0f6', '88a2c4', '475492', '03045e'], ['ffe3e0', 'ffb8c2', 'ff6bb5', 'ff1492'], ['aabac6', '8799a2', '5d6c70', '4e4f52'], ['d1cce4', '5f567b', '8d9aaa', '3d3049']];
// END all_palettes
// I use some sed jank to sync this all_palettes with the real one, to keep this totally separate from the modules.
function load_customizations() {
    let jraphics;
    if (localStorage.jraphicsTM == undefined) {
        jraphics = [124, 125, 126, 0, 0, 0];
    }
    else {
        jraphics = JSON.parse(localStorage.jraphicsTM);
    }
    const bg_palette = all_palettes[jraphics[0]];
    if (jraphics[3]) {
        bg_palette.reverse();
    }
    ;
    document.documentElement.style.setProperty("--background-color", "#" + bg_palette[3]);
    document.documentElement.style.setProperty("--input-color", "#" + bg_palette[2]);
    document.documentElement.style.setProperty("--hover-color", "#" + bg_palette[1]);
    document.documentElement.style.setProperty("--flash-color", "#" + bg_palette[0]);
    const font_palette = all_palettes[jraphics[1]];
    if (jraphics[4]) {
        font_palette.reverse();
    }
    ;
    document.documentElement.style.setProperty("--text-outline", "#" + font_palette[3]);
    document.documentElement.style.setProperty("--font-color", "#" + font_palette[1]);
    document.documentElement.style.setProperty("--link-color", "#" + font_palette[0]);
    const accent_palette = all_palettes[jraphics[2]];
    if (jraphics[5]) {
        accent_palette.reverse();
    }
    ;
    document.documentElement.style.setProperty("--accent-medium", "#" + accent_palette[2]);
    document.documentElement.style.setProperty("--accent-bright", "#" + accent_palette[0]);
}
function display_release_note() {
    let last_broadcast_number;
    if (localStorage.last_broadcast_number == undefined) {
        last_broadcast_number = 0;
    }
    else {
        last_broadcast_number = JSON.parse(localStorage.last_broadcast_number);
    }
    if (last_broadcast_number != -1 && last_broadcast_number < broadcast_number) {
        const modal = document.createElement("div");
        modal.classList.add("block_window");
        document.body.appendChild(modal);
        const modal_display = document.createElement("div");
        modal_display.classList.add("bingo-popup");
        modal_display.style.padding = "2em";
        const header = document.createElement("h2");
        header.textContent = broadcast_title;
        header.style.textAlign = "center";
        modal_display.appendChild(header);
        const modal_text = document.createElement("p");
        modal_text.innerHTML = broadcast_text;
        modal_display.appendChild(modal_text);
        const accept_button = document.createElement("button");
        accept_button.onclick = function () { localStorage.last_broadcast_number = broadcast_number; document.body.removeChild(modal); };
        accept_button.innerText = "Accept";
        accept_button.classList.add("chunky_fullwidth");
        modal_display.appendChild(accept_button);
        modal.appendChild(modal_display);
    }
    ;
}
load_customizations();
display_release_note();
