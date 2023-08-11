const cbPadding = document.querySelector('#cb-padding');
const txtTextfield = document.querySelector('#txt-message');

function getTextMessage() {
	if (!txtTextfield || txtTextfield.value === '') {
		return undefined;
	}
	return txtTextfield.value.toString();
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

