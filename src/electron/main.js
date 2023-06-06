//*=== REQUIRES ========================================================================================================
const { app, BrowserWindow, globalShortcut, Tray, Menu, screen } = require( 'electron' );
const fs = require( "fs" );
const { contextBridge } = require( 'electron' );
const path = require( 'path' );

//*=== PATHS ===========================================================================================================
//const ASSETS_PATH = path.join( __dirname, "../../..", "assets/" ).replace(/\\/g, '/');

// DEV MODE PATH
const ASSETS_PATH = path.join(__dirname, "..", "assets/").replace(/\\/g, '/');

//*=== JSON ============================================================================================================
let optionsPath = ASSETS_PATH + "data/options.json";
let keyboardShortcutsPath = ASSETS_PATH + "data/keyboardShortcuts.json";

const OPTIONS = JSON.parse( fs.readFileSync( optionsPath, 'utf-8' ) );
const KEYBOARD_SHORTCUTS = JSON.parse( fs.readFileSync( keyboardShortcutsPath, 'utf-8' ) );

//*=== VARIABLES =======================================================================================================
let mainWindow;
const isMainWindowOpened = () => !mainWindow?.isDestroyed() && mainWindow?.isFocusable();
const targetScreenNumber = OPTIONS["display"];

//*=== METHODS =========================================================================================================
function createWindow() {
	const displays = screen.getAllDisplays();
	let targetDisplay = screen.getPrimaryDisplay();

	// Set primary display first of the array
	const primaryDisplayIndex = displays.findIndex( display => display.id === screen.getPrimaryDisplay().id );
	if( primaryDisplayIndex !== -1 ){
		const primaryDisplay = displays.splice( primaryDisplayIndex, 1 )[0];
		displays.unshift( primaryDisplay );
	}

	// Set display, if targetScreenNumber is out of range target display is set by default on primary display
	if( targetScreenNumber > 0 && targetScreenNumber <= displays.length ){
		targetDisplay = displays[targetScreenNumber - 1];
	}

	// Set position of the window at center of screen
	const screenWidth = targetDisplay.bounds.width;
	const screenHeight = targetDisplay.bounds.height;
	const windowWidth = 550;
	const windowHeight = 220;
	const x = Math.floor( targetDisplay.bounds.x + ( screenWidth - windowWidth ) / 2 );
	const y = Math.floor( targetDisplay.bounds.y + ( screenHeight - windowHeight ) / 2 );

	mainWindow = new BrowserWindow( {
		width: windowWidth,
		height: windowHeight,

		x: x,
		y: y,

		fullscreenable: false,
		transparent: true,
		resizable: false,
		maximizable: false,

		frame: false,
		autoHideMenuBar: true,
		skipTaskbar: true,

		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	} );

	mainWindow.loadFile( 'src/app/index.html' ).then();

	mainWindow.on( 'blur', function() {
		mainWindow.close();
	} );

	// Open the DevTools.
	//mainWindow.webContents.openDevTools();
}

let tray = null;

app.whenReady().then( () => {
	// Register keyboard shortcuts
	globalShortcut.register( KEYBOARD_SHORTCUTS.open, () => {
		if( !isMainWindowOpened() )
			createWindow();
	} );
	globalShortcut.register( KEYBOARD_SHORTCUTS.hide, () => {
		if( isMainWindowOpened() )
			mainWindow.close();
	} );
	globalShortcut.register( KEYBOARD_SHORTCUTS.close, () => {
		if( isMainWindowOpened() )
			app.quit();
	} );

	// Setup tray bar
	tray = new Tray( ASSETS_PATH + 'icon/favicon.png' );

	const contextMenu = Menu.buildFromTemplate( [
		{ label: 'Close', click: () => { app.quit(); } }
	] );
	tray.setContextMenu( contextMenu );

	tray.on( 'double-click', () => {
		createWindow();
	} );
} ).then( createWindow );

app.on( 'window-all-closed', function( event ) {
	event.preventDefault();
	event.returnValue = false;
} );
