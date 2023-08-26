const {
    app,
    ScriptLanguage,
    UndoModes,
    Rectangle,
    Group,
    Application
} = require("indesign");
const {getOrCreateColor} = require("./lib/colors.cjs");

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

function createPrideFlag(flagFunction, historyName = 'Add pride flag') {
    if (checkSelection() === 'invalid')
        return document.querySelector('#selection-error-dialog').showModal();
    app.doScript(() => {
        const newPage = getOrCreateFlagLocation();
        flagFunction(newPage);
    }, ScriptLanguage.UXPSCRIPT, [], UndoModes.ENTIRE_SCRIPT, historyName);
}

/**
 * Create a stripe in the given parent
 *
 * @param {Page} parent
 * @param bounds
 * @param color
 * @param index
 * @param total
 * @returns {*}
 */
function createStripe({parent, bounds}, color, index = 0, total = 1) {
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

/**
 * A list of transforms that can be restored, mapped to their "base" / reset values
 * @type {Record<string, any>}
 */
const restorableTransforms = {
    rotationAngle: 0,
    shearAngle: 0,
    horizontalScale: 100,
    verticalScale: 100
}

function createStripes(flagLocation, colors) {
    const total = colors.length;

    // create a sprite for each color
    const mapColorsToSprites = (color, index) => {
        if (color === undefined) return;
        return createStripe(flagLocation, color, index, total)
    };

    // filter out empty values
    const stripes = colors.map(mapColorsToSprites).filter(Boolean);

    // if we have no stripes, return
    if (stripes.length === 0) return;

    // create a group from the stripes
    const group = flagLocation.parent.groups.add(stripes);

    // Apply transforms
    for (const key in restorableTransforms) {
        if (!flagLocation.hasOwnProperty(key)) continue;
        group[key] = flagLocation[key];
    }

    // select the group
    app.selection = [group];

    // return the group
    return group;
}

const modeAlertContainer = document.querySelector('#selection-status-alert');
const mode = document.querySelector('#mode');

setInterval(checkSelection, 500);

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

    modeAlertContainer.classList.remove('alert__invalid');
    mode.textContent = 'Replacing selection';
    return 'replace';
}

/**
 * Get the current selection's parent page or create a new page if there is no selection
 * @returns {{parent: import('indesign').Page, bounds: [number, number, number, number], rotationAngle: number, shearAngle: number, horizontalScale: number, verticalScale: number}}
 */
function getOrCreateFlagLocation() {
    if (app.selection.length > 1) throw new Error('Please select only one layer');
    if (app.selection.length === 0) {
        const doc = app.activeDocument;
        const newPage = doc.pages.add();
        return {
            parent: newPage,
            bounds: newPage.bounds,
            ...restorableTransforms
        };
    }
    const selectionElement = app.selection[0];
    if (!(selectionElement instanceof Rectangle) && !(selectionElement instanceof Group)) throw new Error('Please select a rectangle');

    console.debug('Selection is', selectionElement)

    // store the current transforms
    const transforms = Object.keys(restorableTransforms).reduce((acc, key) => {
        acc[key] = selectionElement[key];
        return acc;
    }, {});

    // reset the transforms to their defaults, so we can get the bounds
    Object.assign(selectionElement, restorableTransforms);

    const flagLocation = {
        parent: selectionElement.parent,
        bounds: selectionElement.geometricBounds,
        ...transforms,
    };
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
