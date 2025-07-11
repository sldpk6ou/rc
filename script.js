document.addEventListener('DOMContentLoaded', () => {
    const abstractMapContainer = document.getElementById('abstractMapContainer');
    const prefecturePopup = document.getElementById('prefecturePopup');
    const popupCloseButton = prefecturePopup.querySelector('.close-button');
    const popupPrefectureName = document.getElementById('popupPrefectureName');
    const checklistItemsDiv = document.getElementById('checklistItems');
    const selectedItemsCountSpan = document.getElementById('selectedItemsCount');
    const totalItemsCountSpan = document.getElementById('totalItemsCount');
    const instagramPopup = document.getElementById('instagramPopup');
    const instagramCloseButton = instagramPopup.querySelector('.close-button');
    const instagramIdInput = document.getElementById('instagramIdInput');
    const saveInstagramIdButton = document.getElementById('saveInstagramId');
    const displayedInstagramId = document.getElementById('displayedInstagramId');
    const savePngButton = document.getElementById('savePngButton');


    // Reference image dimensions (from image_9a3db6.png)
    // IMPORTANT: These are the *original* dimensions of your image.
    const REFERENCE_IMAGE_ORIGINAL_WIDTH = 950;
    const REFERENCE_IMAGE_ORIGINAL_HEIGHT = 1250;

    // The dimensions of the abstract map container *after* conceptual rotation.
    // The original height becomes the new "conceptual width" on the web page.
    // The original width becomes the new "conceptual height" on the web page.
    const CONCEPTUAL_MAP_WIDTH = REFERENCE_IMAGE_ORIGINAL_HEIGHT; // 1250
    const CONCEPTUAL_MAP_HEIGHT = REFERENCE_IMAGE_ORIGINAL_WIDTH; // 950

    // The desired display width for our *rotated* abstract map container (the "shorter" side)
    // This value should match the 'height' in .abstract-map-container in style.css
    const DISPLAY_MAP_HEIGHT = 760; // This is now the base for scaling.

    // Calculate SCALE_FACTOR based on the conceptual height (original width)
    const SCALE_FACTOR = DISPLAY_MAP_HEIGHT / CONCEPTUAL_MAP_HEIGHT;

    // Data structure for prefecture items (same as before)
    const prefectureData = {
        "北海道": [
            { id: 'hkd_lavender', name: '富良野のラベンダー畑', checked: false },
            { id: 'hkd_ramen', name: '札幌ラーメン', checked: false },
            { id: 'hkd_niseko', name: 'ニセコスキー', checked: false }
        ],
        "青森": [
            { id: 'aom_nebuta', name: 'ねぶた祭り', checked: false },
            { id: 'aom_castle', name: '弘前城', checked: false }
        ],
        "秋田": [
            { id: 'akt_kanto', name: '竿燈まつり', checked: false },
            { id: 'akt_dog', name: '秋田犬', checked: false }
        ],
        "岩手": [
            { id: 'iwt_hiraizumi', name: '平泉', checked: false },
            { id: 'iwt_wanko', name: 'わんこそば', checked: false }
        ],
        "山形": [
            { id: 'ymg_zao', name: '蔵王の樹氷', checked: false },
            { id: 'ymg_sake', name: '日本酒', checked: false }
        ],
        "宮城": [
            { id: 'myg_matsushima', name: '松島', checked: false },
            { id: 'myg_gyutan', name: '牛タン', checked: false }
        ],
        "福島": [
            { id: 'fks_aizu', name: '会津若松城', checked: false },
            { id: 'fks_onsen', name: '飯坂温泉', checked: false }
        ],
        "茨城": [
            { id: 'ibrk_kairakuen', name: '偕楽園', checked: false },
            { id: 'ibrk_natto', name: '納豆', checked: false }
        ],
        "栃木": [
            { id: 'tchi_nikko', name: '日光東照宮', checked: false },
            { id: 'tchi_gyoza', name: '宇都宮餃子', checked: false }
        ],
        "群馬": [
            { id: 'gma_kusatsu', name: '草津温泉', checked: false },
            { id: 'gma_usui', name: '碓氷峠鉄道文化むら', checked: false }
        ],
        "埼玉": [
            { id: 'stm_kawagoe', name: '川越の小江戸', checked: false },
            { id: 'stm_bonsai', name: '大宮盆栽村', checked: false }
        ],
        "千葉": [
            { id: 'chb_disney', name: '東京ディズニーリゾート', checked: false },
            { id: 'chb_narita', name: '成田山新勝寺', checked: false }
        ],
        "東京": [
            { id: 'tky_shibuya', name: '渋谷スクランブル交差点', checked: false },
            { id: 'tky_skytree', name: '東京スカイツリー', checked: false },
            { id: 'tky_ghibli', name: 'ジブリ美術館', checked: false }
        ],
        "神奈川": [
            { id: 'knwg_hakone', name: '箱根', checked: false },
            { id: 'knwg_yokohama', name: '横浜中華街', checked: false }
        ],
        "新潟": [
            { id: 'ngt_rice', name: 'コシヒカリ', checked: false },
            { id: 'ngt_sake', name: '日本酒', checked: false }
        ],
        "富山": [
            { id: 'tym_kurobe', name: '黒部ダム', checked: false },
            { id: 'tym_hotaruika', name: 'ホタルイカ', checked: false }
        ],
        "石川": [
            { id: 'iskw_kenrokuen', name: '兼六園', checked: false },
            { id: 'iskw_kanazawa', name: '金沢21世紀美術館', checked: false }
        ],
        "福井": [
            { id: 'fk_dinosaur', name: '恐竜博物館', checked: false },
            { id: 'fk_tojinbo', name: '東尋坊', checked: false }
        ],
        "山梨": [
            { id: 'ymns_fuji', name: '富士山', checked: false },
            { id: 'ymns_wine', name: 'ワイン', checked: false }
        ],
        "長野": [
            { id: 'ngn_zenkoji', name: '善光寺', checked: false },
            { id: 'ngn_snowmonkeys', name: '地獄谷野猿公苑', checked: false }
        ],
        "岐阜": [
            { id: 'gifu_shirakawa', name: '白川郷', checked: false },
            { id: 'gifu_takayama', name: '飛騨高山', checked: false }
        ],
        "静岡": [
            { id: 'sizu_atami', name: '熱海温泉', checked: false },
            { id: 'sizu_tea', name: '静岡茶', checked: false }
        ],
        "愛知": [
            { id: 'aich_nagoya', name: '名古屋城', checked: false },
            { id: 'aich_toyota', name: 'トヨタ産業技術記念館', checked: false }
        ],
        "三重": [
            { id: 'mie_isejingu', name: '伊勢神宮', checked: false },
            { id: 'mie_ninja', name: '伊賀流忍者博物館', checked: false }
        ],
        "滋賀": [
            { id: 'shiga_biwako', name: '琵琶湖', checked: false },
            { id: 'shiga_hikone', name: '彦根城', checked: false }
        ],
        "京都": [
            { id: 'kyo_kinkakuji', name: '金閣寺', checked: false },
            { id: 'kyo_inari', name: '伏見稲荷大社', checked: false },
            { id: 'kyo_arashiyama', name: '嵐山竹林', checked: false }
        ],
        "大阪": [
            { id: 'osa_dotonbori', name: '道頓堀', checked: false },
            { id: 'osa_osakacastle', name: '大阪城', checked: false }
        ],
        "兵庫": [
            { id: 'hyg_himeji', name: '姫路城', checked: false },
            { id: 'hyg_kobebeef', name: '神戸ビーフ', checked: false }
        ],
        "奈良": [
            { id: 'nara_todaiji', name: '東大寺', checked: false },
            { id: 'nara_deer', name: '奈良の鹿', checked: false }
        ],
        "和歌山": [
            { id: 'wky_koyasan', name: '高野山', checked: false },
            { id: 'wky_kumano', name: '熊野古道', checked: false }
        ],
        "鳥取": [
            { id: 'tott_dunes', name: '鳥取砂丘', checked: false },
            { id: 'tott_gegege', name: '水木しげるロード', checked: false }
        ],
        "島根": [
            { id: 'shmn_izumo', name: '出雲大社', checked: false },
            { id: 'shmn_castle', name: '松江城', checked: false }
        ],
        "岡山": [
            { id: 'okym_korakuen', name: '岡山後楽園', checked: false },
            { id: 'okym_momotaro', name: '桃太郎伝説', checked: false }
        ],
        "広島": [
            { id: 'hrs_peace', name: '原爆ドーム', checked: false },
            { id: 'hrs_miyajima', name: '宮島（厳島神社）', checked: false }
        ],
        "山口": [
            { id: 'ymg_kintai', name: '錦帯橋', checked: false },
            { id: 'ymg_akitoyoshidai', name: '秋吉台', checked: false }
        ],
        "徳島": [
            { id: 'tksm_awaodori', name: '阿波踊り', checked: false },
            { id: 'tksm_naruto', name: '鳴門の渦潮', checked: false }
        ],
        "香川": [
            { id: 'kghw_udon', name: '讃岐うどん', checked: false },
            { id: 'kghw_ritsurin', name: '栗林公園', checked: false }
        ],
        "愛媛": [
            { id: 'ehm_matsuyama', name: '松山城', checked: false },
            { id: 'ehm_dogo', name: '道後温泉', checked: false }
        ],
        "高知": [
            { id: 'kch_katsurahama', name: '桂浜', checked: false },
            { id: 'kch_ryoma', name: '坂本龍馬', checked: false }
        ],
        "福岡": [
            { id: 'fku_yatai', name: '屋台', checked: false },
            { id: 'fku_dazaifu', name: '太宰府天満宮', checked: false }
        ],
        "佐賀": [
            { id: 'sga_arita', name: '有田焼', checked: false },
            { id: 'sga_balloon', name: '佐賀インターナショナルバルーンフェスタ', checked: false }
        ],
        "長崎": [
            { id: 'ngsk_peace', name: '平和公園', checked: false },
            { id: 'ngsk_gunkanjima', name: '軍艦島', checked: false }
        ],
        "熊本": [
            { id: 'kmmt_castle', name: '熊本城', checked: false },
            { id: 'kmmt_aso', name: '阿蘇山', checked: false }
        ],
        "大分": [
            { id: 'oita_beppu', name: '別府温泉', checked: false },
            { id: 'oita_yufuin', name: '由布院温泉', checked: false }
        ],
        "宮崎": [
            { id: 'myzk_takachiho', name: '高千穂峡', checked: false },
            { id: 'myzk_moai', name: 'サンメッセ日南', checked: false }
        ],
        "鹿児島": [
            { id: 'kgs_sakurajima', name: '桜島', checked: false },
            { id: 'kgs_yakushima', name: '屋久島', checked: false }
        ],
        "沖縄": [
            { id: 'oknw_shuri', name: '首里城', checked: false },
            { id: 'oknw_churaumi', name: '沖縄美ら海水族館', checked: false }
        ]
    };

    let totalCheckableItems = 0;
    let currentlyCheckedItems = 0;
    let currentInstagramId = '';

    // Function to initialize or update total items count
    function calculateTotalItems() {
        totalCheckableItems = 0;
        for (const prefecture in prefectureData) {
            totalCheckableItems += prefectureData[prefecture].length;
        }
        totalItemsCountSpan.textContent = totalCheckableItems;
    }

    // Function to update the counter display
    function updateCounter() {
        currentlyCheckedItems = 0;
        for (const prefecture in prefectureData) {
            prefectureData[prefecture].forEach(item => {
                if (item.checked) {
                    currentlyCheckedItems++;
                }
            });
        }
        selectedItemsCountSpan.textContent = currentlyCheckedItems;
    }

    // Function to render checklist items for a given prefecture
    function renderChecklist(prefectureName) {
        checklistItemsDiv.innerHTML = '';
        const items = prefectureData[prefectureName];
        if (items) {
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = item.id;
                checkbox.checked = item.checked;
                checkbox.addEventListener('change', (event) => {
                    item.checked = event.target.checked;
                    updateCounter();
                    localStorage.setItem('prefectureData', JSON.stringify(prefectureData)); // Save on change
                });

                const label = document.createElement('label');
                label.htmlFor = item.id;
                label.textContent = item.name;

                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(label);
                checklistItemsDiv.appendChild(itemDiv);
            });
        }
    }

    // Coordinates for each prefecture based on the provided image (pixel values)
    // These are from your `image_9a3db6.png` reference.
    // Added a 6th element to optionally specify a region class for styling.
     const prefectureCoords = [
        // Format: [x1, y1, x2, y2, "Prefecture Name", "region-class"]
        // These coords are from the provided image, manually determined for each block.
        // They are relative to the *original* image orientation.
        [721,114,948,252, "北海道", "region-hokkaido"], // Top right green block
        [721,291,811,338, "青森", "region-tohoku"],
        [813,291,902,338, "岩手", "region-tohoku"],
        [721,341,811,388, "秋田", "region-tohoku"],
        [813,341,902,388, "山形", "region-tohoku"],
        [813,391,902,437, "宮城", "region-tohoku"],
        [813,440,902,487, "福島", "region-tohoku"],

        [614,354,704,401, "新潟", "region-chubu"],
        [614,404,704,451, "富山", "region-chubu"],
        [524,404,612,451, "石川", "region-chubu"],
        [524,454,612,501, "福井", "region-chubu"],
        [721,490,811,537, "茨城", "region-kanto"],
        [721,540,811,587, "栃木", "region-kanto"],
        [721,590,811,637, "群馬", "region-kanto"],
        [721,640,811,687, "埼玉", "region-kanto"],
        [813,590,902,637, "千葉", "region-kanto"],
        [813,640,902,687, "東京", "region-kanto"],
        [813,690,902,737, "神奈川", "region-kanto"],
        [721,690,811,737, "山梨", "region-chubu"],
        [721,740,811,787, "長野", "region-chubu"],
        [614,454,704,501, "岐阜", "region-chubu"],
        [721,790,811,837, "静岡", "region-chubu"],
        [614,504,704,551, "愛知", "region-chubu"],
        [614,554,704,601, "三重", "region-kansai"],
        [524,504,612,551, "滋賀", "region-kansai"],
        [524,554,612,601, "京都", "region-kansai"],
        [524,604,612,651, "大阪", "region-kansai"],
        [434,554,522,601, "兵庫", "region-kansai"],
        [524,654,612,701, "奈良", "region-kansai"],
        [524,704,612,751, "和歌山", "region-kansai"],

        [344,554,432,601, "鳥取", "region-chugoku"],
        [344,604,432,651, "島根", "region-chugoku"],
        [344,654,432,701, "岡山", "region-chugoku"],
        [344,704,432,751, "広島", "region-chugoku"],
        [344,754,432,801, "山口", "region-chugoku"],

        [434,804,522,851, "徳島", "region-shikoku"],
        [434,854,522,901, "香川", "region-shikoku"],
        [434,904,522,951, "愛媛", "region-shikoku"],
        [434,954,522,1001, "高知", "region-shikoku"],

        [254,804,342,851, "福岡", "region-kyushu"],
        [254,854,342,901, "佐賀", "region-kyushu"],
        [254,904,342,951, "長崎", "region-kyushu"],
        [254,954,342,1001, "熊本", "region-kyushu"],
        [254,1004,342,1051, "大分", "region-kyushu"],
        [254,1054,342,1101, "宮崎", "region-kyushu"],
        [254,1104,342,1151, "鹿児島", "region-kyushu"],

        [76,1054,166,1101, "沖縄", "region-okinawa"]
    ];

    // Function to dynamically create and position the abstract prefecture blocks
    
    // Function to dynamically create and position the abstract prefecture blocks
    function createAbstractMapRegions() {
        prefectureCoords.forEach(pref => {
            const [x1_orig, y1_orig, x2_orig, y2_orig, name, regionClass] = pref;

            // Apply rotation to coordinates *before* scaling
            // New x becomes old y. New y becomes (original_width - old x).
            // This is a 90-degree clockwise rotation transformation.
            const rotatedX1 = y1_orig;
            const rotatedY1 = REFERENCE_IMAGE_ORIGINAL_WIDTH - x2_orig; // Use x2_orig for top-left after rotation

            const rotatedX2 = y2_orig;
            const rotatedY2 = REFERENCE_IMAGE_ORIGINAL_WIDTH - x1_orig; // Use x1_orig for bottom-right after rotation

            // Now, scale these *rotated* coordinates to fit the DISPLAY_MAP_HEIGHT
            const scaledX1 = rotatedX1 * SCALE_FACTOR;
            const scaledY1 = rotatedY1 * SCALE_FACTOR;
            const scaledX2 = rotatedX2 * SCALE_FACTOR;
            const scaledY2 = rotatedY2 * SCALE_FACTOR;

            const width = scaledX2 - scaledX1;
            const height = scaledY2 - scaledY1;

            const prefDiv = document.createElement('div');
            prefDiv.classList.add('prefecture-block');
            if (regionClass) {
                prefDiv.classList.add(regionClass); // Add region-specific color class
            }
            // Apply scaled and rotated coordinates to CSS properties
            prefDiv.style.left = `${scaledX1}px`;
            prefDiv.style.top = `${scaledY1}px`;
            prefDiv.style.width = `${width}px`;
            prefDiv.style.height = `${height}px`;
            prefDiv.dataset.prefecture = name;
            prefDiv.textContent = name.replace('県', '').replace('府', '').replace('都', '');

            prefDiv.addEventListener('click', (event) => {
                const prefectureName = event.target.dataset.prefecture;
                if (prefectureName && prefectureData[prefectureName]) {
                    popupPrefectureName.textContent = prefectureName;
                    renderChecklist(prefectureName);
                    prefecturePopup.style.display = 'flex';
                    prefecturePopup.classList.add('show');
                }
            });

            abstractMapContainer.appendChild(prefDiv);
        });
    }


    // Function to close any open popup
    function closePopups() {
        prefecturePopup.classList.remove('show');
        instagramPopup.classList.remove('show');
        setTimeout(() => { // Delay hiding to allow animation to complete
            prefecturePopup.style.display = 'none';
            instagramPopup.style.display = 'none';
        }, 300);
    }

    // Close popup when clicking the close button
    popupCloseButton.addEventListener('click', closePopups);
    instagramCloseButton.addEventListener('click', closePopups);

    // Close popup when clicking outside the popup content
    window.addEventListener('click', (event) => {
        if (event.target === prefecturePopup || event.target === instagramPopup) {
            closePopups();
        }
    });

    // Show Instagram ID input popup when clicking the display area
    displayedInstagramId.addEventListener('click', () => {
        instagramIdInput.value = currentInstagramId; // Pre-fill with current ID if any
        instagramPopup.style.display = 'flex';
        instagramPopup.classList.add('show');
    });

    saveInstagramIdButton.addEventListener('click', () => {
        currentInstagramId = instagramIdInput.value.trim();
        displayedInstagramId.textContent = currentInstagramId || 'N/A';
        localStorage.setItem('instagramId', currentInstagramId); // Save to localStorage
        closePopups();
    });

    // Save as PNG functionality
    savePngButton.addEventListener('click', () => {
        closePopups(); // Ensure popups are closed before screenshot
        // Temporarily hide elements that shouldn't appear in the screenshot
        savePngButton.classList.add('hide-on-screenshot');
        const counterBox = document.querySelector('.counter-box');
        const instagramDisplay = document.querySelector('.instagram-display');
        if (counterBox) counterBox.classList.add('hide-on-screenshot');
        if (instagramDisplay) instagramDisplay.classList.add('hide-on-screenshot');


        // The target for html2canvas is the main container to capture everything relevant.
        html2canvas(document.querySelector('.container'), {
            allowTaint: true,
            useCORS: true,
            scale: 2 // Increase resolution for better quality
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'japan_checklist.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Restore hidden elements after screenshot
            savePngButton.classList.remove('hide-on-screenshot');
            if (counterBox) counterBox.classList.remove('hide-on-screenshot');
            if (instagramDisplay) instagramDisplay.classList.remove('hide-on-screenshot');
        });
    });

    // Initializations
    calculateTotalItems();
    updateCounter(); // Initial update after loading from localStorage
    createAbstractMapRegions(); // Dynamically create the abstract map div elements

    // Load saved Instagram ID from localStorage if available
    if (localStorage.getItem('instagramId')) {
        currentInstagramId = localStorage.getItem('instagramId');
        displayedInstagramId.textContent = currentInstagramId;
    }

    // Load checked items from localStorage if available
    if (localStorage.getItem('prefectureData')) {
        const savedData = JSON.parse(localStorage.getItem('prefectureData'));
        // Merge saved checked status with current prefectureData structure
        for (const prefName in prefectureData) {
            if (savedData[prefName]) {
                prefectureData[prefName].forEach(item => {
                    const savedItem = savedData[prefName].find(sItem => sItem.id === item.id);
                    if (savedItem) {
                        item.checked = savedItem.checked;
                    }
                });
            }
        }
        updateCounter(); // Update counter based on loaded data
    }
});
