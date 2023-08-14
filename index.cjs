const {
	app,
	ScriptLanguage,
	UndoModes,
	Rectangle,
	Group,
	Application
} = require("indesign");
const { entrypoints } = require("uxp");
const { getOrCreateColor } = require("./lib/colors.cjs");

// more to get type definitions for the InDesign DOM than anything else:
if (!(app instanceof Application)) {
	throw new Error('This script must be run from InDesign');
}

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
	if (app.documents.length < 1)
		console.log(`Selection change event triggered with no open documents.`);
	else
		console.log(`Selection changed: ${app.selection?.length || 0} items selected`);
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
	}, ScriptLanguage.UXPSCRIPT, [], UndoModes.ENTIRE_SCRIPT, historyName);
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
	if (app.documents.length < 1) {
		console.debug('No documents open, aborting')
		modeAlertContainer.classList.add('alert__invalid');
		mode.textContent = 'Please open a document';

		return 'invalid';
	}

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

	if (!selectionElement.parentPage) {
		modeAlertContainer.classList.add('alert__invalid');
		mode.textContent = 'The selected element must be on a page';
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
