document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.container');
    const canvas = document.getElementById('designCanvas');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const standardSizesSelect = document.getElementById('standardSizes');
    const colorOptions = document.querySelectorAll('.color-option');
    const figureOptions = document.querySelectorAll('.figure-option');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const addImageButton = document.getElementById('addImage');
    const deleteElementButton = document.getElementById('deleteElement');
    const addNameButton = document.getElementById('addName');
    const addDedicationButton = document.getElementById('addDedication');
    const addDateButton = document.getElementById('addDate');
    const summaryColor = document.getElementById('summary-color');
    const summaryDimensions = document.getElementById('summary-dimensions');
    const summaryFigures = document.getElementById('summary-figures');
    const summaryTexts = document.getElementById('summary-texts');
    const deleteFigureButton = document.createElement('button');
    deleteFigureButton.textContent = 'Eliminar Figura';
    deleteFigureButton.classList.add('catalog-button');
    const deleteTextButton = document.createElement('button');
    deleteTextButton.textContent = 'Eliminar Texto';
    deleteTextButton.classList.add('catalog-button', 'delete-text-button');

    const textFontSelect = document.getElementById('textFont');
    const textSizeSelect = document.getElementById('textSize');
    const textAlignSelect = document.getElementById('textAlign');

    let selectedElement = null;
    let isDragging = false;
    let isResizing = false;
    let offsetX, offsetY;
    let shape = 'round';
    const scaleFactor = 0.25;

    updateCanvasSize();
    updateSummary();

    function deselectAll() {
        if (selectedElement) {
            selectedElement.classList.remove('selected');
            if (selectedElement.querySelector('.controls')) {
                selectedElement.querySelector('.controls').remove();
            }
            selectedElement = null;
        }
    }

    canvas.addEventListener('click', function (e) {
        if (e.target === canvas) {
            deselectAll();
        }
    });

    function addTextToCanvas(text) {
        const textElement = document.createElement('div');
        textElement.classList.add('draggable', 'text-element');
        textElement.style.color = 'black';
        textElement.style.fontSize = '20px';
        textElement.textContent = text;
        textElement.style.position = 'absolute';
        textElement.style.left = '50px';
        textElement.style.top = '50px';
        canvas.appendChild(textElement);
        makeDraggable(textElement);
        selectElement(textElement);
        applyTextStyle(textElement);
        updateSummary();
    }

    function applyTextStyle(element) {
        if (!element || !element.classList.contains('text-element')) return;

        const font = textFontSelect.value;
        const sizeCm = parseFloat(textSizeSelect.value);
        const heightCm = parseFloat(heightInput.value);

        if (isNaN(sizeCm) || isNaN(heightCm) || heightCm === 0) return;

        // Ajustar el tamaño de la fuente en proporción a la altura del lienzo
        const sizeRatio = sizeCm / heightCm;
        const sizePx = sizeRatio * canvas.offsetHeight;

        element.style.fontFamily = font;
        element.style.fontSize = sizePx + 'px';
        element.style.textAlign = textAlignSelect.value;
    }

    textFontSelect.addEventListener('change', () => {
        if (selectedElement && selectedElement.classList.contains('text-element')) {
            applyTextStyle(selectedElement);
        }
    });

    textSizeSelect.addEventListener('change', () => {
        if (selectedElement && selectedElement.classList.contains('text-element')) {
            applyTextStyle(selectedElement);
        }
    });

    textAlignSelect.addEventListener('change', () => {
        if (selectedElement && selectedElement.classList.contains('text-element')) {
            applyTextStyle(selectedElement);
        }
    });

    function addFigureToCanvas(imageUrl) {
        const figureElement = document.createElement('div');
        figureElement.classList.add('draggable');
        figureElement.innerHTML = `<img src="${imageUrl}" alt="Figura">`;
        figureElement.style.position = 'absolute';
        const figureWidth = 80;
        const figureHeight = 80;
        figureElement.style.width = figureWidth + 'px';
        figureElement.style.height = figureHeight + 'px';
        const canvasWidth = canvas.offsetWidth;
        const canvasHeight = canvas.offsetHeight;
        const left = (canvasWidth - figureWidth) / 2;
        const top = (canvasHeight - figureHeight) / 2;
        figureElement.style.left = left + 'px';
        figureElement.style.top = top + 'px';
        canvas.appendChild(figureElement);
        makeDraggable(figureElement);
        selectElement(figureElement);
        updateSummary();
    }

    deleteFigureButton.addEventListener('click', () => {
        if (selectedElement && selectedElement.querySelector('img')) {
            selectedElement.remove();
            selectedElement = null;
            updateSummary();
        } else {
            console.log("Ninguna figura seleccionada para eliminar.");
        }
    });

    function updateSummary() {
        summaryColor.textContent = canvas.style.backgroundImage ? 'Seleccionado' : 'Ninguno';
        summaryDimensions.textContent = `${widthInput.value}cm x ${heightInput.value}cm`;
        const figures = canvas.querySelectorAll('.draggable img[src^="images/"]');
        summaryFigures.textContent = figures.length > 0 ? `${figures.length} figura(s)` : 'Ninguna';
        const texts = canvas.querySelectorAll('.text-element');
        summaryTexts.textContent = texts.length > 0 ? `${texts.length} texto(s)` : 'Ninguno';
    }

    widthInput.addEventListener('change', () => {
        updateCanvasSize();
        updateSummary();
    });
    heightInput.addEventListener('change', () => {
        document.querySelectorAll('.text-element').forEach(applyTextStyle);
    });

    standardSizesSelect.addEventListener('change', () => {
        const [width, height] = standardSizesSelect.value.split('x').map(Number);
        widthInput.value = width;
        heightInput.value = height;
        updateCanvasSize();
        updateSummary();
    });

    function updateCanvasSize() {
        const widthCm = parseFloat(widthInput.value);
        const heightCm = parseFloat(heightInput.value);
        const canvasWidthPx = widthCm * scaleFactor;
        const canvasHeightPx = heightCm * scaleFactor;
        canvas.style.width = canvasWidthPx + 'cm';
        canvas.style.height = canvasHeightPx + 'cm';
    }

    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const imageUrl = option.dataset.image;
            canvas.style.backgroundImage = `url('${imageUrl}')`;
            canvas.style.backgroundColor = "";
            updateSummary();
        });
    });

    figureOptions.forEach(option => {
        option.addEventListener('click', () => {
            const image = option.dataset.image;
            addFigureToCanvas(image);
            updateSummary();
        });
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.style.display = 'none');
            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(tabId).style.display = 'block';
            const figureTab = document.getElementById('figures');
            const textTab = document.getElementById('texts');

            if (tabId === 'figures' && !figureTab.contains(deleteFigureButton)) {
                figureTab.appendChild(deleteFigureButton);
            }
            if (tabId === 'texts' && !textTab.contains(deleteTextButton)) {
                textTab.appendChild(deleteTextButton);
            }
        });
    });

    addImageButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const imageUrl = event.target.result;
                    const imageElement = document.createElement('div');
                    imageElement.classList.add('draggable');
                    imageElement.innerHTML = `<img src="${imageUrl}" alt="Imagen">`;
                    imageElement.style.position = 'absolute';
                    imageElement.style.width = '100px';
                    imageElement.style.height = '100px';
                    imageElement.style.left = '150px';
                    imageElement.style.top = '150px';
                    canvas.appendChild(imageElement);
                    makeDraggable(imageElement);
                    selectElement(imageElement);
                    updateSummary();

                }
                reader.readAsDataURL(file);
            }
        }
        input.click();
    });

    deleteElementButton.addEventListener('click', () => {
        if (selectedElement) {
            selectedElement.remove();
            selectedElement = null;
            updateSummary();
        }
    });

    addNameButton.addEventListener('click', () => addTextToCanvas('Nombre'));
    addDedicationButton.addEventListener('click', () => addTextToCanvas('Dedicatoria'));
    addDateButton.addEventListener('click', () => addTextToCanvas('Fecha'));

    deleteFigureButton.addEventListener('click', () => {
        if (selectedElement && selectedElement.querySelector('img[src^="images/"]')) {
            selectedElement.remove();
            selectedElement = null;
            updateSummary();
        }
    });
    deleteTextButton.addEventListener('click', () => {
        if (selectedElement && selectedElement.classList.contains('text-element')) {
            selectedElement.remove();
            selectedElement = null;
            updateSummary();
        }
    });

    function createControls(element) {
        const controls = document.createElement('div');
        controls.classList.add('controls');

        const moveControl = document.createElement('div');
        moveControl.classList.add('control', 'move');
        moveControl.innerHTML = '<i class="fas fa-arrows-alt"></i>';
        controls.appendChild(moveControl);

        const deleteControl = document.createElement('div');
        deleteControl.classList.add('control', 'delete');
        deleteControl.innerHTML = '<i class="fas fa-trash-alt"></i>';
        controls.appendChild(deleteControl);

        const resizeControl = document.createElement('div');
        resizeControl.classList.add('control', 'resize');
        resizeControl.innerHTML = '<i class="fas fa-expand-alt"></i>';
        controls.appendChild(resizeControl);

        element.appendChild(controls);

        deleteControl.addEventListener('click', function (e) {
            e.stopPropagation();
            element.remove();
            selectedElement = null;
        });

        moveControl.addEventListener('mousedown', function (e) {
            e.stopPropagation();
            startDrag(e, element);
        });

        resizeControl.addEventListener('mousedown', function (e) {
            e.stopPropagation();
            startResize(e, element);
        });

        return controls;
    }

    function selectElement(element) {
        deselectAll();
        selectedElement = element;
        selectedElement.classList.add('selected');
        createControls(selectedElement);
        if (selectedElement.classList.contains('text-element')) {
            selectedElement.setAttribute('contenteditable', 'true');
            selectedElement.focus();
            placeCaretAtEnd(selectedElement);
            applyTextStyle(selectedElement);
        }
    }

    function placeCaretAtEnd(element) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function makeDraggable(element) {
        element.addEventListener('mousedown', function (e) {
            e.stopPropagation();
            selectElement(element);
            startDrag(e, element);
        });
    }

    function startDrag(e, element) {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        selectedElement = element;

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }

    function drag(e) {
        if (!isDragging || !selectedElement) return;

        selectedElement.style.left = (e.clientX - offsetX) + 'px';
        selectedElement.style.top = (e.clientY - offsetY) + 'px';
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }

    function startResize(e, element) {
        isResizing = true;
        const startWidth = element.offsetWidth;
        const startHeight = element.offsetHeight;
        const startX = e.clientX;
        const startY = e.clientY;

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);

        function resize(e) {
            if (!isResizing) return;

            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);

            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
        }

        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }
    }

    const kitInfoLink = document.getElementById('kit-info-link');
    const kitInfoLink2 = document.getElementById('kit-info-link2');
    const kitInfoModal = document.getElementById('kit-info-modal');
    const closeButton = document.querySelector('.close-button');

    function showKitInfoModal() {
        kitInfoModal.style.display = 'block';
    }

    function hideKitInfoModal() {
        kitInfoModal.style.display = 'none';
    }

    kitInfoLink.addEventListener('click', function (event) {
        event.preventDefault();
        showKitInfoModal();
    });
    kitInfoLink2.addEventListener('click', function (event) {
        event.preventDefault();
        showKitInfoModal();
    });

    closeButton.addEventListener('click', hideKitInfoModal);

    window.addEventListener('click', function (event) {
        if (event.target === kitInfoModal) {
            hideKitInfoModal();
        }
    });
});
