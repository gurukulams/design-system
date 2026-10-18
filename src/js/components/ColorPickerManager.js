export class ColorPickerManager {
  constructor(options = {}) {
    this.onColorChange = options.onColorChange || (() => {});
    this.onIntentChange = options.onIntentChange || (() => {});
    this.defaultColor = options.defaultColor || "#0dcaf0";
    this.init();
  }

  init() {
    const wrapper = document.getElementById('colorPickerDropdownWrapper');
    const menuList = document.getElementById('presetColorsList');
    const inputProxy = document.getElementById('noteLineCmb');
    const menuButton = document.getElementById('colorPickerMenuButton');
    const indicator = wrapper ? wrapper.querySelector('.underline-indicator') : null;

    if (!wrapper || !menuList || !inputProxy || !indicator || !menuButton) return;

    // Fallback to the computed value of the .bg-info swatch if sessionStorage is blank
    const infoSwatch = menuList.querySelector('.bg-info');
    const fallbackColor = infoSwatch ? this.getComputedHexColor(infoSwatch) : this.defaultColor;
    const savedColor = sessionStorage.getItem("selectedNotesLine") || fallbackColor;

    // Locate matching node by evaluating actual computed styles
    let initialActive = null;
    const allSwatches = menuList.querySelectorAll('.color-swatch');

    for (const swatch of allSwatches) {
      if (this.getComputedHexColor(swatch) === savedColor) {
        initialActive = swatch;
        break;
      }
    }

    const elements = { menuList, inputProxy, indicator, menuButton };

    if (initialActive) {
      this.applySelectedColor(initialActive, false, elements, false);
    } else {
      indicator.style.backgroundColor = savedColor;
      inputProxy.value = savedColor;
      this.onColorChange(savedColor, false);
    }

    allSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        this.applySelectedColor(swatch, true, elements, true);
      });
    });
  }

  getComputedHexColor(element) {
    const fullClass = Array.from(element.classList).find(c => c.startsWith('bg-'));
    const intent = fullClass ? fullClass.replace('bg-', '') : undefined;
    
    if (intent) {
      this.onIntentChange(intent);
    }

    const rgb = window.getComputedStyle(element).backgroundColor;
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues || rgbValues.length < 3) return rgb;
    
    return "#" + rgbValues.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  }

  applySelectedColor(element, shouldToggleOn, elements, userTriggered) {
    const { menuList, inputProxy, indicator, menuButton } = elements;

    menuList.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    element.classList.add('active');

    const computedHex = this.getComputedHexColor(element);
    inputProxy.value = computedHex;
    indicator.style.backgroundColor = computedHex;

    sessionStorage.setItem("selectedNotesLine", computedHex);
    inputProxy.dispatchEvent(new Event('change'));

    this.onColorChange(computedHex, userTriggered);

    if (shouldToggleOn) {
      if (menuButton.classList.contains('show') || menuButton.getAttribute('aria-expanded') === 'true') {
        menuButton.click();
      }
    }
  }
}