//*=== REQUIRES ========================================================================================================
const fs = require( "fs" );
const os = require( "os" );
const open = require( "open" );
const path = require( 'path' );

//*=== PATHS ===========================================================================================================
//const ASSETS_PATH = path.join( __dirname, "../../..", "assets/" ).replace( /\\/g, '/' );

// DEV MODE PATH
const ASSETS_PATH = path.join(__dirname, "..", "assets/").replace(/\\/g, '/');

//*=== JSON ============================================================================================================
let optionsPath = ASSETS_PATH + "data/options.json";
let browserPath = ASSETS_PATH + "data/browsers.json";
let searchEnginePath = ASSETS_PATH + "data/search-engines.json";
let searchPlatformsPath = ASSETS_PATH + "data/search-platform.json";

const OPTIONS = JSON.parse( fs.readFileSync( optionsPath, 'utf-8' ) );
const BROWSERS = JSON.parse( fs.readFileSync( browserPath, 'utf-8' ) );
const SEARCH_ENGINES = JSON.parse( fs.readFileSync( searchEnginePath, 'utf-8' ) );
const SEARCH_PLATFORMS = JSON.parse( fs.readFileSync( searchPlatformsPath, 'utf-8' ) );

//*=== VARIABLES =======================================================================================================
let searchBar_focus = false;

//*=== window EVENTS ===================================================================================================
window.onload = function( channel, listener ) {
	// Get selected search engine icon
	document.getElementById( "selected-search-engine" ).src =
		`${ ASSETS_PATH }img/search-engine/${ SEARCH_ENGINES[OPTIONS["searchEngine"]]["name"] }-icon.png`;

	// Get selected search-mode icon
	document.getElementById( "search-mode" ).style.backgroundImage =
		`url('${ ASSETS_PATH }img/search-mode/${ ( OPTIONS["incognito"] ) ? "incognito" : "normal" }-banner.png')`;

	// Set chose browser icon
	document.querySelector( ".choose-browser #choose-browser" ).src = `${ ASSETS_PATH }img/choose-browser.png`;

	// If is not selected the favorite browser, automatically appears "select browser" popup
	if( OPTIONS["browser"] === -1 ){
		document.getElementById( "popup" ).style.display = "unset";
		document.getElementById( "browsers" ).style.display = "flex";
	}

	// Charge a list of browsers in base of OS
	let operativeSystem = getOS();
	let browsersList = document.querySelector( ".browsers .list" );
	for( const browser of BROWSERS ){
		if( !browser["validOS"].includes( operativeSystem ) )
			continue;

		let template = `<div id="browser-${ browser['id'] }" class="browser ${
			( browser["id"] === OPTIONS["browser"] )
				? "selected"
				: ""
		}"></div>`;

		browsersList.insertAdjacentHTML( "beforeend", template );

		let element = browsersList.querySelector( "#browser-" + browser["id"] );

		element.onclick = function() {
			this.classList.add( "selected" );
			setBrowser( browser["id"] );
		};

		let temp = `url('${ ASSETS_PATH }img/browser/${ browser['id'] }.png')`;

		console.log( temp );

		element.style.backgroundImage = temp;

		console.log( element.style.backgroundImage );
	}

	// Charge a list of search platforms
	let searchPlatforms = document.querySelector( ".searches .search-platforms" );
	for( const platform of SEARCH_PLATFORMS ){
		let template = `<div class="search" id="${ platform['name'] }-banner"></div>`;
		searchPlatforms.insertAdjacentHTML( "beforeend", template );

		let element = searchPlatforms.querySelector( `#${ platform["name"] }-banner` );

		element.style.backgroundImage = `url('${ ASSETS_PATH }img/search-platforms/${ platform['name'] }-banner.png')`;
		element.onclick = function() {
			search( platform["id"] ).then();
		};
	}

	document.getElementById( "search-bar" ).focus();
};


//*=== choose-browser EVENTS ===========================================================================================
document.getElementById( "choose-browser" ).onclick = function() {
	document.getElementById( "popup" ).style.display = "unset";
	document.getElementById( "browsers" ).style.display = "flex";
};

//*=== search-container EVENTS =========================================================================================
document.getElementById( "search-btn" ).onclick = function() {
	search( -1 ).then();
};

// Make search if press "ENTER"
document.addEventListener( 'keyup', doc_keyUp, false );

//*=== search-bar EVENTS ===============================================================================================
document.getElementById( "search-bar" ).onmouseenter = function() {
	if( searchBar_focus )
		return;

	border( this.id, "295ca9", "left" );
	border( "search-engine", "295ca9", "right" );
};
document.getElementById( "search-bar" ).onmouseout = function() {
	if( searchBar_focus )
		return;

	border( this.id, "4a4e5b", "left" );
	border( "search-engine", "4a4e5b", "right" );
};
document.getElementById( "search-bar" ).onfocus = function() {
	searchBar_focus = true;

	border( this.id, "a4acb4", "left" );
	border( "search-engine", "a4acb4", "right" );
};
document.getElementById( "search-bar" ).onblur = function() {
	searchBar_focus = false;

	border( this.id, "4a4e5b", "left" );
	border( "search-engine", "4a4e5b", "right" );
};

//*=== search-engine EVENTS ============================================================================================
document.getElementById( "search-engine" ).onmouseenter = function() {
	if( searchBar_focus )
		return;

	border( this.id, "295ca9", "right" );
	border( "search-bar", "295ca9", "left" );
};
document.getElementById( "search-engine" ).onmouseout = function() {
	if( searchBar_focus )
		return;

	border( this.id, "4a4e5b", "right" );
	border( "search-bar", "4a4e5b", "left" );
};

//*=== selected-search-engine EVENTS ===================================================================================
document.getElementById( "selected-search-engine" ).onclick = function() {
	// Select search engine in sequential circle loop
	OPTIONS["searchEngine"] = ( OPTIONS["searchEngine"] >= 4 )
		? OPTIONS["searchEngine"] = 0
		: OPTIONS["searchEngine"] += 1;

	let data = JSON.stringify( OPTIONS, null, 2 );
	fs.writeFile( optionsPath, data, () => {
	} );

	this.src = `${ ASSETS_PATH }img/search-engine/${ SEARCH_ENGINES[OPTIONS["searchEngine"]]["name"] }-icon.png`;
};

//*=== search-mode EVENTS ==============================================================================================
document.getElementById( "search-mode" ).onclick = function() {
	OPTIONS["incognito"] = !OPTIONS["incognito"];

	let data = JSON.stringify( OPTIONS, null, 2 );
	fs.writeFile( optionsPath, data, () => {
	} );

	this.style.backgroundImage =
		`url('${ ASSETS_PATH }img/search-mode/${ ( OPTIONS["incognito"] ) ? "incognito" : "normal" }-banner.png')`;
};

//*=== select-browser EVENTS ===========================================================================================
document.getElementById( "popup" ).onclick = async function() {
	if( OPTIONS["browser"] !== -1 ){
		this.style.display = "none";
		document.getElementById( "browsers" ).style.display = "none";
	}
};

//*=== METHODS =========================================================================================================
async function search( type ) {
	let searchText = document.getElementById( "search-bar" ).value;

	if( searchText.length > 0 )
		await openBrowser( type, searchText );
}

function checkSearchText( searchText ) {
	const pattern = RegExp( /^(http|https):\/\//gmi );

	return pattern.test( searchText );
}

async function openBrowser( type, searchText ) {
	const browserName = BROWSERS[OPTIONS["browser"]]["name"][getOS()];
	const incognito = ( OPTIONS["incognito"] )
		? BROWSERS[OPTIONS["browser"]]["commands"]["incognito"]
		: "";

	if( !checkSearchText( searchText ) ){
		let searchTemplate;

		if( type === -1 ){
			searchTemplate = SEARCH_ENGINES[OPTIONS["searchEngine"]]["searchTemplate"];
		}else{
			searchTemplate = SEARCH_PLATFORMS[type]["searchTemplate"];
		}

		searchText = searchTemplate + searchText.replace( /\s/g, '+' );
	}

	if( BROWSERS[OPTIONS["browser"]]["reverse"][getOS()] ){
		await open( incognito, { app: { name: browserName, arguments: [searchText] } } );
	}else{
		await open( searchText, { app: { name: browserName, arguments: [incognito] } } );
	}
}

function border( target, color, setNone ) {
	document.getElementById( target ).style.border = `1px solid #${ color }`;
	document.getElementById( target ).style.outline = "none";

	document.getElementById( target )
		.style[`border${ setNone.charAt( 0 ).toUpperCase() + setNone.slice( 1 ) }`] = "none";
}

function setBrowser( id ) {
	try{
		document.getElementById( "browser-" + ( OPTIONS["browser"] ) ).classList.remove( "selected" );
	}catch( _ ){
	}

	document.getElementById( "popup" ).style.display = "none";
	document.getElementById( "browsers" ).style.display = "none";

	OPTIONS["browser"] = id;
	let data = JSON.stringify( OPTIONS, null, 2 );

	fs.writeFile( optionsPath, data, () => {
	} );
}

function getOS() {
	switch( os.type() ){
		case "Windows_NT":
			return "windows";
		case "Darwin":
			return "macos";
		case "Linux":
			return "linux";
	}
}

function doc_keyUp( e ) {
	if( e.keyCode === 13 ){
		search( -1 ).then();
	}
}

//!*=====================================================================================================================

