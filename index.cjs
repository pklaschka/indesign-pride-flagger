const {
	app,
	VerticalJustification,
	Justification,
	ScriptLanguage,
	UndoModes,
	Rectangle,
	Group,
	Application, ColorSpace
} = require("indesign");
const { entrypoints } = require("uxp");

// more to get type definitions for the InDesign DOM than anything else:
if (!(app instanceof Application)) {
	throw new Error('This script must be run from InDesign');
}

const cbPadding = document.querySelector('#cb-padding');
const txtTextfield = document.querySelector('#txt-message');

const buttons = {
	'#btn-rainbow': createRainbowFlag,
	'#btn-asexual': createAsexualFlag,
	'#btn-aromantic': createAromanticFlag,
	'#btn-bisexual': createBisexualFlag,
	'#btn-pan': createPanFlag,
	'#btn-lesbian': createLesbianFlag,
	'#btn-gay-men': createGayMenFlag,
	'#btn-trans': createTransFlag,
	'#btn-non-binary': createNonBinaryFlag,
	'#btn-genderqueer': createGenderqueerFlag,
	'#btn-genderfluid': createGenderfluidFlag,
	'#btn-agender': createAgenderFlag,
}

Object.entries(buttons).forEach(([selector, flagFunction]) => {
	const button = document.querySelector(selector);
	button.addEventListener('click', () => {
		createPrideFlag(flagFunction, `${button.textContent.trim()}`)
	});
});

/**
 * @type {typeof EventListeners[number]}
 */
let listener = app.eventListeners.add('afterSelectionChanged', () => {
	console.log(`Selection changed: ${app.selection.length} items selected`);
	checkSelection();
});

entrypoints.setup({
	plugin: {
		async create() {
			console.log(`Plugin create called`);
		},
		async destroy() {
			console.log(`Plugin destroy called`);
			if (listener.isValid)
				listener.remove();
		}
	}
})


function createPrideFlag(flagFunction, historyName = 'Add pride flag') {
	if (checkSelection() === 'invalid')
		return document.querySelector('#selection-error-dialog').showModal();
	app.doScript(() => {
		const newPage = getOrCreateFlagLocation();
		flagFunction(newPage);
		if (getTextMessage() !== undefined) {
			createText(newPage);
		}
	}, ScriptLanguage.JAVASCRIPT, [], UndoModes.ENTIRE_SCRIPT, historyName);
}

function getTextMessage() {
	if (!txtTextfield || txtTextfield.value === '') {
		return undefined;
	}
	return txtTextfield.value.toString();
}

/**
 *
 * @param {Page} parent
 * @param bounds
 * @param color
 * @param index
 * @param total
 * @returns {*}
 */
function createStripe({ parent, bounds }, color, index = 0, total = 1) {
	const rect = parent.rectangles.add();
	rect.strokeWeight = 0;
	rect.fillColor = color;
	rect.geometricBounds = [
		bounds[0] + (bounds[2] - bounds[0]) / total * index,
		bounds[1],
		bounds[0] + (bounds[2] - bounds[0]) / total * (index + 1),
		bounds[3]
	];

	return rect;
}

function createStripes(flagLocation, colors) {
	const total = colors.length;

	const mapColorsToSprites = (color, index) => {
		if (color === undefined) return;
		return createStripe(flagLocation, color, index, total)
	};

	const stripes = colors.map(mapColorsToSprites).filter(Boolean);
	const group = flagLocation.parent.groups.add(stripes);
	app.selection = [group];
	return group;
}

const modeAlertContainer = document.querySelector('#selection-status-alert');
const mode = document.querySelector('#mode');

checkSelection();

function checkSelection() {
	if (app.selection.length > 1) {
		modeAlertContainer.classList.add('alert__invalid');
		mode.textContent = 'Please select only one layer (or nothing)';

		return 'invalid';
	}
	if (app.selection.length === 0) {
		modeAlertContainer.classList.remove('alert__invalid');
		mode.textContent = 'Creating a new page (nothing selected)';

		return 'new';
	}
	const selectionElement = app.selection[0];
	if (!(selectionElement instanceof Rectangle) && !(selectionElement instanceof Group)) {
		modeAlertContainer.classList.add('alert__invalid');
		mode.textContent = 'Please select a rectangle or group';

		return 'invalid';
	}

	modeAlertContainer.classList.remove('alert__invalid');
	mode.textContent = 'Replacing selection';
	return 'replace';
}


/**
 * Get the current selection's parent page or create a new page if there is no selection
 * @returns {{parent: import('indesign').Page, bounds: [number, number, number, number]}}
 */
function getOrCreateFlagLocation() {
	if (app.selection.length > 1) throw new Error('Please select only one layer');
	if (app.selection.length === 0) {
		const doc = app.activeDocument;
		const newPage = doc.pages.add();
		return { parent: newPage, bounds: newPage.bounds };
	}
	const selectionElement = app.selection[0];
	if (!(selectionElement instanceof Rectangle) && !(selectionElement instanceof Group)) throw new Error('Please select a rectangle');

	const flagLocation = { parent: selectionElement.parentPage, bounds: selectionElement.geometricBounds };
	selectionElement.remove();
	return flagLocation;
}

function createTransFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Trans Flag Blue', '#5BCFFB'),
		getOrCreateColor('Trans Flag Pink', '#F5A9B8'),
		getOrCreateColor('Trans Flag White', '#FFFFFF'),
		getOrCreateColor('Trans Flag Pink', '#F5A9B8'),
		getOrCreateColor('Trans Flag Blue', '#5BCFFB'),
	])
}

function createRainbowFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Pride Red', '#FF0018'),
		getOrCreateColor('Pride Orange', '#FFA52C'),
		getOrCreateColor('Pride Yellow', '#FFFF41'),
		getOrCreateColor('Pride Green', '#008018'),
		getOrCreateColor('Pride Blue', '#0000F9'),
		getOrCreateColor('Pride Purple', '#86007D')
	])
}

function createNonBinaryFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Non-Binary Yellow', '#FCF431'),
		getOrCreateColor('Non-Binary White', '#FFFFFF'),
		getOrCreateColor('Non-Binary Purple', '#9C59D1'),
		getOrCreateColor('Non-Binary Black', '#000000')
	])
}

function createPanFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Pansexual Pink', '#FF1B8D'),
		getOrCreateColor('Pansexual Yellow', '#FFDA00'),
		getOrCreateColor('Pansexual Blue', '#1BB3FF')
	])
}

function createBisexualFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Bisexual Pink', '#D60270'),
		getOrCreateColor('Bisexual Purple', '#9B4F96'),
		getOrCreateColor('Bisexual Blue', '#0038A8')
	])
}

function createAsexualFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Asexual Black', '#000000'),
		getOrCreateColor('Asexual Grey', '#a4a4a4'),
		getOrCreateColor('Asexual White', '#ffffff'),
		getOrCreateColor('Asexual Purple', '#810081')
	])
}

function createAromanticFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Aromantic Green 1', '#3ba740'),
		getOrCreateColor('Aromantic Green 2', '#a8d47a'),
		getOrCreateColor('Aromantic White', '#ffffff'),
		getOrCreateColor('Aromantic Grey', '#ababab'),
		getOrCreateColor('Aromantic Black', '#000000'),
	])
}

function createLesbianFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Lesbian Red', '#D52D00'),
		getOrCreateColor('Lesbian Orange', '#FF9A56'),
		getOrCreateColor('Lesbian White', '#FFFFFF'),
		getOrCreateColor('Lesbian Light Pink', '#D462A6'),
		getOrCreateColor('Lesbian Pink', '#A50062'),
	])
}

function createGenderfluidFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Genderfluid Pink', '#FE76A2'),
		getOrCreateColor('Genderfluid White', '#FFFFFF'),
		getOrCreateColor('Genderfluid Violet', '#BF12d7'),
		getOrCreateColor('Genderfluid Black', '#000000'),
		getOrCreateColor('Genderfluid Blue', '#303CBE')
	]);
}

function createAgenderFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Agender Black', '#000'),
		getOrCreateColor('Agender Gray', '#bababa'),
		getOrCreateColor('Agender White', '#fff'),
		getOrCreateColor('Agender Green', '#baf484'),
		getOrCreateColor('Agender White', '#fff'),
		getOrCreateColor('Agender Gray', '#bababa'),
		getOrCreateColor('Agender Black', '#000'),
	]);
}

function createGayMenFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Gay Men Green 1', '#068E70'),
		getOrCreateColor('Gay Men Green 2', '#27CFAA'),
		getOrCreateColor('Gay Men Green 3', '#98e9c1'),
		getOrCreateColor('Gay Men White', '#FFFFFF'),
		getOrCreateColor('Gay Men Blue 1', '#7bade2'),
		getOrCreateColor('Gay Men Blue 2', "#5049cb"),
		getOrCreateColor('Gay Men Blue 3', "#3c1a77"),
	]);
}

function createGenderqueerFlag(newPage) {
	createStripes(newPage, [
		getOrCreateColor('Genderqueer Purple', "#b57fdd"),
		getOrCreateColor('Genderqueer White', '#fff'),
		getOrCreateColor('Genderqueer Green', "#49821e")
	]);
}

/**
 *
 * @param {{parent: import('indesign').Page, bounds: [number, number, number, number]}} newPage
 */
function createText({ parent, bounds }) {
	let textFrame = parent.textFrames.add();
	textFrame.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;

	textFrame.contents = getTextMessage() || '';
	textFrame.paragraphs.firstItem().justification = Justification.CENTER_ALIGN;
	textFrame.paragraphs.firstItem().pointSize = 32;
	textFrame.paragraphs.firstItem().appliedFont = app.fonts.itemByName('Arial');

	const padding = cbPadding.checked ? parent.marginPreferences.columnGutter : 0;
	textFrame.geometricBounds = [
		bounds[0] + bounds[2] / 5 * 2 + padding,
		bounds[1] + parent.marginPreferences.left + padding,
		bounds[2] / 5 * 3 - padding,
		bounds[3] - parent.marginPreferences.right - padding
	];
	textFrame.fillColor = getOrCreateColor('White', [0, 0, 0, 0]);
}

function getOrCreateColor(name, colorValue) {
	let color = app.activeDocument.colors.itemByName(name);
	colorValue = toColorArray(colorValue);
	if (!color.isValid) {
		console.log(`Creating color ${name} because it doesn't exist`);
		color = app.activeDocument.colors.add({
			name: name,
			space: colorValue.length > 3 ? ColorSpace.CMYK : ColorSpace.RGB,
			colorValue: colorValue,
			parentColorGroup: getOrCreateColorGroup()
		});
		color.space = ColorSpace.CMYK;
	}
	return color;
}

/**
 * Converts a color to an InDesign color array
 * @param {string | number[]} color The color to convert. Can be a hex string or an array of (3) RGB or (4) CMYK values
 * @returns {number[]} The color as an array of either (3) RGB (for HEX and RGB input) or (4) CMYK (for CMYK input) values
 * @throws {Error} If the color is not a valid color
 */
function toColorArray(color) {
	if (Array.isArray(color))
		return color;
	if (typeof color !== 'string')
		throw new Error(`Invalid color ${color}`);
	if (color.startsWith('#'))
		color = color.substring(1);
	if (color.length === 3)
		color = color.split('').map(c => c + c).join('');
	if (color.length !== 6)
		throw new Error(`Invalid color ${color}. Must be 3 or 6 characters long`);
	return [
		parseInt(color.substring(0, 2), 16),
		parseInt(color.substring(2, 4), 16),
		parseInt(color.substring(4, 6), 16)
	];
}

function getOrCreateColorGroup() {
	let colorGroup = app.activeDocument.colorGroups.itemByName('Pride Colors');
	if (!colorGroup.isValid) {
		console.log(`Creating color group Pride Colors because it doesn't exist`);
		colorGroup = app.activeDocument.colorGroups.add('Pride Colors', undefined, {});
	}
	return colorGroup;
}
