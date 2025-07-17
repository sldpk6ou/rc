document.addEventListener('DOMContentLoaded', async () => {
    const abstractMapContainer = document.getElementById('abstract-map-container');
    const prefecturePopup = document.getElementById('checklist-popup');
    const popupCloseButton = document.getElementById('close-popup-btn');
    const popupPrefectureName = document.getElementById('popup-prefecture-name');
    const checklistItemsDiv = document.getElementById('checklistItems');
    const selectedItemsCountSpan = document.getElementById('selectedItemsCount');
    const totalItemsCountSpan = document.getElementById('totalItemsCount');
    const instagramPopup = document.getElementById('instagramPopup');
    const instagramCloseButton = instagramPopup.querySelector('.close-button');
    const instagramIdInput = document.getElementById('instagramIdInput');
    const saveInstagramIdButton = document.getElementById('saveInstagramId');
    const displayedInstagramId = document.getElementById('displayedInstagramId');
    const savePngButton = document.getElementById('savePngButton');
    const checkedItemsListDiv = document.getElementById('checkedItemsList');
    const noItemsMessage = checkedItemsListDiv.querySelector('.no-items-message');
	const checkedItemsPanel = document.getElementById('checked-items-panel'); // <--- ASSIGNMENT HAPPENS HERE!


	let checklistPopup; // This will hold the reference to the main popup overlay
	let popupContent; // This will hold the reference to the content area of the popup


	checklistPopup = document.getElementById('checklist-popup');
	popupContent = document.getElementById('popup-content');
	
    // Reference image dimensions based on your provided coordinates' max values
    // Assuming the source image for these coordinates is landscape.
    const MAP_SOURCE_WIDTH = 1448; // Max X coordinate value from provided data
    const MAP_SOURCE_HEIGHT = 1600;  // Max Y coordinate value from provided data

    // New: Target height for the displayed map on desktop as per your request
    const DISPLAY_MAP_TARGET_HEIGHT = 800; 
    const SCALE_FACTOR = DISPLAY_MAP_TARGET_HEIGHT / MAP_SOURCE_HEIGHT;

    // API Endpoint Definition
    const API_URL = 'prefectureData.js'; // <--- !!! IMPORTANT: REPLACE THIS WITH YOUR ACTUAL API URL !!!

	// --- Add console logs/errors for debugging if elements are still null ---
    if (!abstractMapContainer) console.error("Error: 'abstract-map-container' not found.");
    if (!checklistPopup) console.error("Error: 'checklist-popup' not found.");
    if (!popupPrefectureName) console.error("Error: 'popup-prefecture-name' not found. Please add <h2 id='popup-prefecture-name'></h2> to your HTML popup structure.");
    if (!popupContent) console.error("Error: 'popup-content' not found.");
    if (!popupCloseButton) console.error("Error: 'close-popup-btn' not found.");
	if (popupCloseButton) {
        // IMPORTANT: Ensure you're calling the function with the correct name: closeChecklistPopup or closePopups
        popupCloseButton.addEventListener('click', closeChecklistPopup); // Or closePopups if that's its name
    } else {
        console.error("ERROR: Close button 'close-popup-btn' not found!");
    }
	
	if (checklistPopup) {
        checklistPopup.addEventListener('click', (event) => {
            if (event.target === checklistPopup) {
                closeChecklistPopup();
            }
        });
    }
	
    let prefectureData = {};
    let totalCheckableItems = 0;
    let currentlyCheckedItems = 0;
    let currentInstagramId = '';

    const prefectureRegions = {
        "北海道": "北海道地方",
        "青森": "東北地方", "岩手": "東北地方", "宮城": "東北地方", "秋田": "東北地方", "山形": "東北地方", "福島": "東北地方",
        "茨城": "関東地方", "栃木": "関東地方", "群馬": "関東地方", "埼玉": "関東地方", "千葉": "関東地方", "東京": "関東地方", "神奈川": "関東地方",
        "新潟": "中部地方", "富山": "中部地方", "石川": "中部地方", "福井": "中部地方", "山梨": "中部地方", "長野": "中部地方", "岐阜": "中部地方", "静岡": "中部地方", "愛知": "中部地方",
        "三重": "関西地方", "滋賀": "関西地方", "京都": "関西地方", "大阪": "関西地方", "兵庫": "関西地方", "奈良": "関西地方", "和歌山": "関西地方",
        "鳥取": "中国地方", "島根": "中国地方", "岡山": "中国地方", "広島": "中国地方", "山口": "中国地方",
        "徳島": "四国地方", "香川": "四国地方", "愛媛": "四国地方", "高知": "四国地方",
        "福岡": "九州地方", "佐賀": "九州地方", "長崎": "九州地方", "熊本": "九州地方", "大分": "九州地方", "宮崎": "九州地方", "鹿児島": "九州地方",
        "沖縄": "沖縄地方"
    };

    function calculateTotalItems() {
        totalCheckableItems = 0;
        for (const prefecture in prefectureData) {
            totalCheckableItems += prefectureData[prefecture].length;
        }
        totalItemsCountSpan.textContent = totalCheckableItems;
    }

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

    function isAnyItemChecked(prefectureName) {
        const items = prefectureData[prefectureName];
        if (!items || items.length === 0) {
            return false;
        }
        return items.some(item => item.checked);
    }

    function updatePrefectureBlockVisual(prefectureName) {
        const prefectureBlock = abstractMapContainer.querySelector(`[data-prefecture="${prefectureName}"]`);
        if (prefectureBlock) {
            if (isAnyItemChecked(prefectureName)) {
                prefectureBlock.classList.add('prefecture-checked');
            } else {
                prefectureBlock.classList.remove('prefecture-checked');
            }
        }
    }

	function updatePrefectureBadge(prefectureName) {
		const prefectureBlock = abstractMapContainer.querySelector(`[data-prefecture="${prefectureName}"]`);
		if (!prefectureBlock) return;

		const badge = prefectureBlock.querySelector('.checked-count-badge');
		if (!badge) return;

		const items = prefectureData[prefectureName];
		if (!items) {
			badge.style.display = 'none';
			return;
		}

		const checkedCount = items.filter(item => item.checked).length;

		if (checkedCount > 0) {
			badge.textContent = checkedCount;
			badge.style.display = 'flex'; // Show the badge
		} else {
			badge.style.display = 'none'; // Hide the badge
		}
	}

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
                    updatePrefectureBlockVisual(prefectureName);
                    renderCheckedItemsList();
					updatePrefectureBadge(prefectureName); // NEW: Update the badge
                    localStorage.setItem('prefectureData', JSON.stringify(prefectureData));
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

    // Your provided coordinates (unchanged)
    const prefectureCoords = [
        [1221,114,1448,252, "北海道", "region-hokkaido"],
        [1221,291,1402,338, "青森", "region-tohoku"],
        [1221,341,1311,388, "秋田", "region-tohoku"],
        [1313,341,1402,388, "岩手", "region-tohoku"],
        [1221,391,1311,437, "山形", "region-tohoku"],
        [1313,391,1402,437, "宮城", "region-tohoku"],
        [1221,440,1402,487, "福島", "region-tohoku"],

        [1128,440,1218,487, "新潟", "region-chubu"],
        [1038,440,1126,487, "富山", "region-chubu"],
        [946,440,1036,487, "石川", "region-chubu"],
        [946,489,1036,542, "福井", "region-chubu"],

        [1221,490,1311,543, "群馬", "region-kanto"],
        [1313,490,1402,543, "栃木", "region-kanto"],
        [1313,545,1402,601, "茨城", "region-kanto"],
        [1221,545,1311,601, "埼玉", "region-kanto"],
        [1313,603,1402,694, "千葉", "region-kanto"],
        [1221,603,1311,650, "東京", "region-kanto"],
        [1221,652,1311,699, "神奈川", "region-kanto"],

        [1128,603,1218,650, "山梨", "region-chubu"],
        [1128,490,1218,601, "長野", "region-chubu"],
        [1038,490,1126,601, "岐阜", "region-chubu"],
        [1128,652,1218,699, "静岡", "region-chubu"],
        [1038,603,1126,650, "愛知", "region-chubu"],

        [946,545,1036,601, "滋賀", "region-kansai"],
        [946,603,1036,650, "三重", "region-kansai"],
        [854,545,944,601, "京都", "region-kansai"],
        [854,603,944,650, "奈良", "region-kansai"],
        [762,545,852,601, "兵庫", "region-kansai"],
        [762,603,852,650, "大阪", "region-kansai"],
        [762,652,944,699, "和歌山", "region-kansai"],

        [670,545,760,601, "鳥取", "region-chugoku"],
        [670,603,760,650, "岡山", "region-chugoku"],
        [578,545,668,601, "島根", "region-chugoku"],
        [578,603,668,650, "広島", "region-chugoku"],		
        [506,545,576,650, "山口", "region-chugoku"],

        [652,670,742,717, "香川", "region-shikoku"],
        [560,670,650,717, "愛媛", "region-shikoku"],
        [652,719,742,776, "徳島", "region-shikoku"],
        [560,719,650,776, "高知", "region-shikoku"],

        [221,545,311,601, "佐賀", "region-kyushu"],
        [313,545,403,601, "福岡", "region-kyushu"],
        [405,545,495,601, "大分", "region-kyushu"],
        [221,603,311,650, "長崎", "region-kyushu"],
        [313,603,403,650, "熊本", "region-kyushu"],
        [405,603,495,699, "宮崎", "region-kyushu"],
        [221,652,403,699, "鹿児島", "region-kyushu"],

        [221,771,311,819, "沖縄", "region-okinawa"]
    ];

    function createAbstractMapRegions() {
        prefectureCoords.forEach(pref => {
            const [x1_orig, y1_orig, x2_orig, y2_orig, name, regionClass] = pref;

            if (!prefectureData[name]) {
                console.warn(`No checklist data found for prefecture: ${name}. Skipping map block creation.`);
                return;
            }

            // Directly scale coordinates (no internal rotation)
            const scaledX1 = x1_orig * SCALE_FACTOR;
            const scaledY1 = y1_orig * SCALE_FACTOR;
            const scaledX2 = x2_orig * SCALE_FACTOR;
            const scaledY2 = y2_orig * SCALE_FACTOR;

            const width = scaledX2 - scaledX1;
            const height = scaledY2 - scaledY1;

            const prefDiv = document.createElement('div');
            prefDiv.classList.add('prefecture-block');
            if (regionClass) {
                prefDiv.classList.add(regionClass);
            }
            prefDiv.style.left = `${scaledX1}px`;
            prefDiv.style.top = `${scaledY1}px`;
            prefDiv.style.width = `${width}px`;
            prefDiv.style.height = `${height}px`;
            prefDiv.dataset.prefecture = name;
            prefDiv.textContent = name.replace('県', '').replace('府', '').replace('都', '');

            prefDiv.addEventListener('click', (event) => {
                const prefectureName = event.target.dataset.prefecture;
				if (prefectureName && prefectureData[prefectureName]) {
					popupPrefectureName.textContent = prefectureName; // This should now work
					// It looks like you're using 'prefecturePopup' in your current code.
					// If 'prefecturePopup' is meant to be the same as 'checklistPopup',
					// make sure you use 'checklistPopup' consistently, or define 'prefecturePopup'
					// at the top like the others.
					checklistPopup.style.display = 'flex'; // Use checklistPopup
					checklistPopup.classList.add('show'); // Use checklistPopup for class handling too
				}
            });
			
			// NEW: Create and append the badge
			const badge = document.createElement('span');
			badge.classList.add('checked-count-badge');
			prefDiv.appendChild(badge); // Add badge to the prefecture div

            abstractMapContainer.appendChild(prefDiv);
        });
    }

	function attachPrefectureClickHandlers() {
		const prefectureBlocks = abstractMapContainer.querySelectorAll('.prefecture-block');
		prefectureBlocks.forEach(block => {
			block.addEventListener('click', () => {
				const prefectureName = block.dataset.prefecture;
				if (prefectureName) {
					// This is likely the problematic section
					// The 'popupTitle' variable here needs to be correctly referenced.
					// It seems you're trying to access it directly within this anonymous function
					// without it being in scope or being re-fetched.
					showChecklistPopup(prefectureName); // This function should handle setting the title
				}
			});
		});
	}



	
	
	function showChecklistPopup(prefectureName) {
		const popup = document.getElementById('checklist-popup');
		const popupContent = document.getElementById('popup-content');
		const popupTitle = document.getElementById('popup-prefecture-name');

		if (!popupTitle || !popupContent || !checklistPopup) {
			console.error("Error: One or more popup elements not found. Check your HTML IDs.");
			console.log("popupTitle:", popupTitle, "popupContent:", popupContent, "checklistPopup:", checklistPopup);
			return; // Exit the function if elements aren't found
		}

		popupTitle.textContent = prefectureName; 
		popupContent.innerHTML = ''; // Clear previous content

		if (checklistPopup) { // Good practice to check if it was found
			checklistPopup.classList.add('active'); // Or use your 'show' class
			document.body.style.overflow = 'hidden';
		} else {
			console.error("checklistPopup element not found in showChecklistPopup.");
		}
		const items = prefectureData[prefectureName] || [];

		// Render checklist items in the popup
		const checklistDiv = document.createElement('div');
		checklistDiv.classList.add('checklist-items'); // Add a class for styling

		if (items.length === 0) {
			checklistDiv.innerHTML = '<p>No items found for this prefecture.</p>';
		} else {
			items.forEach(item => {
				const itemDiv = document.createElement('div');
				itemDiv.classList.add('checklist-item');

				const checkbox = document.createElement('input');
				checkbox.type = 'checkbox';
				checkbox.id = `item-${prefectureName}-${item.name.replace(/\s/g, '-')}`;
				checkbox.checked = item.checked;
				checkbox.addEventListener('change', () => {
					alert('a');
					item.checked = checkbox.checked;
					updatePrefectureBlockVisual(prefectureName);
					alert('b');
					savePrefectureData();
					alert('c');
					updateCheckedList(); // Update the main checked list
					alert('d');
					updatePrefectureBadge(prefectureName); // Update the badge
					alert('e');
				});

				const label = document.createElement('label');
				label.htmlFor = checkbox.id;
				label.textContent = item.name;

				itemDiv.appendChild(checkbox);
				itemDiv.appendChild(label);
				checklistDiv.appendChild(itemDiv);
			});
		}
		popupContent.appendChild(checklistDiv);
		// Display the popup
		/*
		popup.style.display = 'block'; // Make sure the popup element is set to 'block' or 'flex'
		popup.style.opacity = '1';
		popup.style.transform = 'scale(1)';
		*/
		checklistPopup.classList.add('active');
		document.body.style.overflow = 'hidden';
	}


    function renderCheckedItemsList() {
        checkedItemsListDiv.innerHTML = '';

        const checkedItemsByRegion = {};

        for (const prefectureName in prefectureData) {
            const regionName = prefectureRegions[prefectureName] || 'Other Region';
            const checkedItemsInPrefecture = prefectureData[prefectureName].filter(item => item.checked);

            if (checkedItemsInPrefecture.length > 0) {
                if (!checkedItemsByRegion[regionName]) {
                    checkedItemsByRegion[regionName] = [];
                }
                checkedItemsInPrefecture.forEach(item => {
                    checkedItemsByRegion[regionName].push({
                        prefecture: prefectureName,
                        name: item.name
                    });
                });
            }
        }
const sortedRegionNames = Object.keys(checkedItemsByRegion).sort();

        if (sortedRegionNames.length === 0) {
            checkedItemsListDiv.appendChild(noItemsMessage);
            noItemsMessage.style.display = 'block';
        } else {
            noItemsMessage.style.display = 'none';
            sortedRegionNames.forEach(regionName => {
                const regionHeader = document.createElement('h3');
                regionHeader.textContent = regionName;
                checkedItemsListDiv.appendChild(regionHeader);

                const ul = document.createElement('ul');
                checkedItemsByRegion[regionName].sort((a, b) => a.name.localeCompare(b.name));
                checkedItemsByRegion[regionName].forEach(item => {
                    const li = document.createElement('li');
                    const shortPrefectureName = item.prefecture.replace('県', '').replace('府', '').replace('都', '');
                    li.innerHTML = `<strong>${shortPrefectureName}:</strong> <span class="item-name">${item.name}</span>`;
                    ul.appendChild(li);
                });
                checkedItemsListDiv.appendChild(ul);
            });
        }
    }


	function closeChecklistPopup() { // Or function closePopups()
		if (checklistPopup) { // Ensure checklistPopup is defined and not null
			checklistPopup.classList.remove('active'); // Or 'show'
			document.body.style.overflow = ''; // Restore scroll
			
			const currentPrefectureName = popupPrefectureName ? popupPrefectureName.textContent : null;
			// If we successfully got the prefecture name, update its badge
			console.log(currentPrefectureName);
			if (currentPrefectureName) {
				updatePrefectureBadge(currentPrefectureName);
				console.log(`Updated badge for: ${currentPrefectureName}`); // For debugging
			} else {
				console.warn("Could not determine current prefecture name to update badge on dialog close.");
			}
			updateCheckedList();

		} else {
			console.error("Cannot close popup: 'checklistPopup' is null in closeChecklistPopup.");
		}
	}
	
	function closePopups() {
		// Check if checklistPopup (your main popup overlay element) is actually found
		if (checklistPopup) {
			// Remove the 'active' class (or 'show' class, depending on your CSS)
			// to hide the popup and trigger any CSS transitions.
			checklistPopup.classList.remove('active');

			// Restore the main page's scrollability.
			document.body.style.overflow = '';
		} else {
			// Log an error if the popup element wasn't found, which can help debugging.
			console.error("Error: 'checklistPopup' element is null in closeChecklistPopup function. Check your HTML ID 'checklist-popup'.");
		}
	}

	
	function savePrefectureData() {
		// Implement your logic to save prefecture data (e.g., to localStorage)
		// Example:
		if (typeof prefectureData !== 'undefined') { // Check if prefectureData exists
			localStorage.setItem('prefectureData', JSON.stringify(prefectureData));
			console.log("Prefecture data saved!");
		} else {
			console.warn("prefectureData is not defined, cannot save.");
		}
	}
	
    instagramCloseButton.addEventListener('click', closePopups);

	// This entire block must be in your script2.js
	function updateCheckedList() {
		if (!checkedItemsPanel) {
			console.error("Error: 'checkedItemsPanel' element not found. Check your HTML ID or variable assignment.");
			return;
		}

		checkedItemsPanel.innerHTML = ''; // Clear previous content

		// Add a heading for the list
		const listHeading = document.createElement('h2');
		listHeading.textContent = 'Your Checked Items';
		checkedItemsPanel.appendChild(listHeading);


		const allCheckedItems = []; // To store all checked items for the "no items" check

		for (const prefectureName in prefectureData) {
			if (prefectureData.hasOwnProperty(prefectureName)) {
				const items = prefectureData[prefectureName];
				const checkedInPrefecture = items.filter(item => item.checked);

				if (checkedInPrefecture.length > 0) {
					const prefectureHeader = document.createElement('h3');
					prefectureHeader.textContent = prefectureName;
					checkedItemsPanel.appendChild(prefectureHeader);

					const ul = document.createElement('ul');
					checkedInPrefecture.forEach(item => {
						const li = document.createElement('li');
						li.textContent = item.name;
						ul.appendChild(li);
					});
					checkedItemsPanel.appendChild(ul);

					allCheckedItems.push(...checkedInPrefecture); // Add to overall list
				}
			}
		}

		if (allCheckedItems.length === 0) {
			const noItemsMessage = document.createElement('p');
			noItemsMessage.textContent = 'No items checked yet.';
			checkedItemsPanel.appendChild(noItemsMessage);
		}
	}




    window.addEventListener('click', (event) => {
        if (event.target === prefecturePopup || event.target === instagramPopup) {
            closePopups();
        }
    });

    displayedInstagramId.addEventListener('click', () => {
        instagramIdInput.value = currentInstagramId;
        instagramPopup.style.display = 'flex';
        instagramPopup.classList.add('show');
    });

    saveInstagramIdButton.addEventListener('click', () => {
        currentInstagramId = instagramIdInput.value.trim();
        displayedInstagramId.textContent = currentInstagramId || 'N/A';
        localStorage.setItem('instagramId', currentInstagramId);
        closePopups();
    });

    savePngButton.addEventListener('click', () => {
        closePopups();
        savePngButton.classList.add('hide-on-screenshot');
        const counterBox = document.querySelector('.counter-box');
        const instagramDisplay = document.querySelector('.instagram-display');
        const checkedItemsPanel = document.querySelector('.checked-items-panel');
        if (counterBox) counterBox.classList.add('hide-on-screenshot');
        if (instagramDisplay) instagramDisplay.classList.add('hide-on-screenshot');
        if (checkedItemsPanel) checkedItemsPanel.classList.add('hide-on-screenshot');


        html2canvas(document.querySelector('.container'), {
            allowTaint: true,
            useCORS: true,
            scale: 2
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'japan_checklist.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            savePngButton.classList.remove('hide-on-screenshot');
            if (counterBox) counterBox.classList.remove('hide-on-screenshot');
            if (instagramDisplay) instagramDisplay.classList.remove('hide-on-screenshot');
            if (checkedItemsPanel) checkedItemsPanel.classList.remove('hide-on-screenshot');
        });
    });

    async function fetchPrefectureData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const processedData = {};
            for (const prefName in data) {
                const foundCoord = prefectureCoords.find(coord => coord[4] === prefName);
                if (foundCoord) {
                    processedData[prefName] = data[prefName].map(item => ({ ...item, checked: false }));
                } else {
                    console.warn(`API returned data for "${prefName}" but no map coordinates found. Skipping.`);
                }
            }
            return processedData;
        } catch (error) {
            console.error('Error fetching prefecture data:', error);
            return {};
        }
    }

    console.log("Fetching prefecture data from API...");
    prefectureData = await fetchPrefectureData();
    console.log("Prefecture data loaded:", prefectureData);

    calculateTotalItems();
    updateCounter();

    if (localStorage.getItem('instagramId')) {
        currentInstagramId = localStorage.getItem('instagramId');
        displayedInstagramId.textContent = currentInstagramId;
    }

    if (localStorage.getItem('prefectureData')) {
        const savedData = JSON.parse(localStorage.getItem('prefectureData'));
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
        updateCounter();
    }

    createAbstractMapRegions(); // This function should create the prefecture blocks
    attachPrefectureClickHandlers(); // Make sure this is called AFTER blocks are created


    for (const prefName in prefectureData) {
        updatePrefectureBlockVisual(prefName);
		updatePrefectureBadge(prefName); // NEW: Initial update for badges
    }
	
    renderCheckedItemsList();
});
