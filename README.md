<img alt="Pride Flagger Plugin Logo" src="logos/marketing.svg" width="64"/>

# Pride Flagger for Adobe InDesign

This is a UXP plugin for Adobe InDesign that allows you to add pride flags to your documents. It was created by [Zuri Klaschka (they/them)](https://github.com/pklaschka).

<img alt="Rainbow Pride Flag" src="img/rainbow.svg" width="32"/>
<img alt="Trans Pride Flag" src="img/trans.svg" width="32"/>
<img alt="Non-binary Pride Flag" src="img/non-binary.svg" width="32"/>

## Installation

### From the Adobe Exchange

(Coming soon)

### From the Releases

1. Download the latest release from the [releases page](https://github.com/pklaschka/indesign-pride-flagger/releases).
2. Double-click the `.ccx` file to install it.
3. Follow the instructions in the installer.
4. Restart Adobe InDesign.

### From Source

1. Clone this repository.
2. Run the UXP Developer Tool (installed with Adobe Creative Cloud Desktop).
3. Click "Add Plugin" and select the `manifest.json` file in the repository.
4. Run InDesign (v18.5 or above).
5. In the UXP Developer Tool, click "Load" und the Pride Flagger plugin's menu.

## Usage

### Adding a Pride Flag page

1. Open the Pride Flagger plugin from the "Plugins" menu.
2. Make sure you haven't selected any objects in your document (in the Pride Flagger panel, there should be a blue bar saying _"Creating a new page (nothing selected)"_).
3. Click the button corresponding to the flag you want to add.
4. A new page will be added to your document with the flag on it.

### Adding a Pride Flag to an existing page

1. Open the Pride Flagger plugin from the "Plugins" menu.
2. Select the object you want to add the flag to (you can only select rectangles and groups at the moment).
3. Click the button corresponding to the flag you want to add.
4. The flag will be added in the place of (and replacing) the selected frame.

## FAQ

### Why is the plugin called "Pride Flagger"?

Because it adds pride flags to your document.

### Should you use pride flags in commercial settings?

Yes, you should. Pride flags are a symbol of acceptance and inclusion, and should be used in all settings, including commercial ones.

However, you should make sure that you don't just add pride flags to your documents, but also make sure that you are actively supporting the LGBTQIA+ community. Otherwise, it might get seen as "rainbow-washing" (similar to "green-washing"), which the community doesn't usually appreciate.

### Don't you also do a kind of rainbow washing by building this plugin and thus creating a product from it?

No. First of all, I myself am part of the LGBTQIA+ community (to be more precise, of the 🏳️‍⚧️ _T_ and the _A_ in the acronym), so I'm not doing this for money. I'm not selling this plugin (and instead provide it as free and open-source software). I'm just building it because I think it's fun, and because I myself want to use it.

### Why would you want to add pride flags to your documents?

Because it's fun, and because it shows that you support the LGBTQIA+ community.

### Why are there only a few flags?

I'm adding more flags as I go. If you want to add a flag, feel free to open a pull request.

### Is this the first (complete) open-source UXP-based plugin for Adobe InDesign ever published?

I ... think so 😅.
