const { app, ColorSpace } = require("indesign");

module.exports = {
	getOrCreateColor
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
