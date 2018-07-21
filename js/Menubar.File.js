/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.File = function ( editor ) {

	var NUMBER_PRECISION = 6;

	function parseNumber( key, value ) {

		return typeof value === 'number' ? parseFloat( value.toFixed( NUMBER_PRECISION ) ) : value;

	}

	//

	var config = editor.config;

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'File' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Load 3D Object

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Load 3D Object' );
	option.onClick( function () {
		var panel = new UI.Panel();
		panel.add(new UI.Text("Load 3D object from file. " + "Contents of \"" + getParameterByName("model") + "\""));
		panel.add(new UI.HorizontalRule());
		$.post(
			"listDirectory.php",
			{
				modelFolder: getParameterByName("model")
			},
			function( result )
			{
				var files = JSON.parse(result);
				var checks = [];
				for (var file in files) {
					extension = files[file].split( '.' ).pop().toLowerCase();
					if(["3ds", "amf", "awd", "babylon", "babylonmeshdata", "ctm", "dae", "fbx", "glb", "gltf", "js", "json", "3geo", "3mat", "3obj", "3scn", "kmz", "md2", "obj", "playcanvas", "ply", "stl", "svg", "vtk", "wrl", "zip"].indexOf(extension) == -1) {
						continue;
					}
					var row = new UI.Row();
					panel.add(row);
					var check = new UI.Checkbox(false);
					checks.push(check);
					check.filename = files[file];
					row.add(check);
					if(getCurrentVariant().filenames != null && getCurrentVariant().filenames.indexOf(files[file]) > -1) {
						check.setValue(true);
					}
					row.add(new UI.Text(files[file]));
				}
				
				panel.add(new UI.HorizontalRule());
				panel.add(new UI.Button( 'OK' ).setMarginLeft( '7px' ).onClick(function(){
					for(var check in checks) {
						var currFileName = checks[check].filename;
						var currFileChecked = checks[check].dom.checked;
						
						var currFileObject = editor.scene.children.find(function (e) {
							if(e.name == currFileName) {
								return true;
							}
							return false;
						});

						if(currFileObject === undefined && currFileChecked == true) {
							editor.execute( new Add3DFileCommand( currFileName ) );
						}
						if(currFileObject !== undefined && currFileChecked == false) {
							editor.execute( new Remove3DFileCommand( currFileName ) );
						}
						modal.hide();
					}
				}));
				panel.add(new UI.Button( 'Cancel' ).setMarginLeft( '7px' ).onClick(function(){
					modal.hide();
				}));

				modal.dom.children[0].style.width = "33%";
				modal.show(panel);
			}
		);
	} );
	options.add( option );

	// Save

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Save' );
	option.onClick( function () {
		var variantname = prompt("Please enter file name", currentVariant.name);
		if (variantname == "") {
			return;
		}
		$.post(
			"save.php",
			{
				modelFolder: getParameterByName("model"),
				name: variantname,
				filenames: currentVariant.filenames,
				propertyChange: autoPropertyChangeList.toJSON()
			},
			function( result )
			{
				// success
			}
		);
	} );
	options.add( option );

	// Close

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Close' );
	option.onClick( function () {
		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {
			var beforequery = window.location.href.substring(0, window.location.href.lastIndexOf("?"));
			var basefolder = beforequery.substring(0, beforequery.lastIndexOf("/"));
			window.location = basefolder+"/explorer.php?p="+getParameterByName("model");
		}
	} );
	options.add( option );
/*
	// New

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'New' );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

			editor.clear();

		}

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Import

	var form = document.createElement( 'form' );
	form.style.display = 'none';
	document.body.appendChild( form );

	var fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function ( event ) {

		editor.loader.loadFile( fileInput.files[ 0 ] );
		form.reset();

	} );
	form.appendChild( fileInput );

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Import' );
	option.onClick( function () {

		fileInput.click();

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Export Geometry

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export Geometry' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected.' );
			return;

		}

		var geometry = object.geometry;

		if ( geometry === undefined ) {

			alert( 'The selected object doesn\'t have geometry.' );
			return;

		}

		var output = geometry.toJSON();

		try {

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'geometry.json' );

	} );
	options.add( option );

	// Export Object

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export Object' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected' );
			return;

		}

		var output = object.toJSON();

		try {

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'model.json' );

	} );
	options.add( option );

	// Export Scene

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export Scene' );
	option.onClick( function () {

		var output = editor.scene.toJSON();

		try {

			output = JSON.stringify( output, parseNumber, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( e ) {

			output = JSON.stringify( output );

		}

		saveString( output, 'scene.json' );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Export GLB

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export GLB' );
	option.onClick( function () {

		var exporter = new THREE.GLTFExporter();

		exporter.parse( editor.scene, function ( result ) {

			saveArrayBuffer( result, 'scene.glb' );

			// forceIndices: true, forcePowerOfTwoTextures: true
			// to allow compatibility with facebook
		}, { binary: true, forceIndices: true, forcePowerOfTwoTextures: true } );
		
	} );
	options.add( option );

	// Export GLTF

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export GLTF' );
	option.onClick( function () {

		var exporter = new THREE.GLTFExporter();

		exporter.parse( editor.scene, function ( result ) {

			saveString( JSON.stringify( result, null, 2 ), 'scene.gltf' );

		} );


	} );
	options.add( option );

	// Export OBJ

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export OBJ' );
	option.onClick( function () {

		var object = editor.selected;

		if ( object === null ) {

			alert( 'No object selected.' );
			return;

		}

		var exporter = new THREE.OBJExporter();

		saveString( exporter.parse( object ), 'model.obj' );

	} );
	options.add( option );

	// Export STL

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Export STL' );
	option.onClick( function () {

		var exporter = new THREE.STLExporter();

		saveString( exporter.parse( editor.scene ), 'model.stl' );

	} );
	options.add( option );

	//

	options.add( new UI.HorizontalRule() );

	// Publish

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Publish' );
	option.onClick( function () {

		var zip = new JSZip();

		//

		var output = editor.toJSON();
		output.metadata.type = 'App';
		delete output.history;

		var vr = output.project.vr;

		output = JSON.stringify( output, parseNumber, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		zip.file( 'app.json', output );

		//

		var title = config.getKey( 'project/title' );

		var manager = new THREE.LoadingManager( function () {

			save( zip.generate( { type: 'blob' } ), ( title !== '' ? title : 'untitled' ) + '.zip' );

		} );

		var loader = new THREE.FileLoader( manager );
		loader.load( 'js/libs/app/index.html', function ( content ) {

			content = content.replace( '<!-- title -->', title );

			var includes = [];

			if ( vr ) {

				includes.push( '<script src="js/WebVR.js"></script>' );

			}

			content = content.replace( '<!-- includes -->', includes.join( '\n\t\t' ) );

			var editButton = '';

			if ( config.getKey( 'project/editable' ) ) {

				editButton = [
					'',
					'			var button = document.createElement( \'a\' );',
					'			button.href = \'https://threejs.org/editor/#file=\' + location.href.split( \'/\' ).slice( 0, - 1 ).join( \'/\' ) + \'/app.json\';',
					'			button.style.cssText = \'position: absolute; bottom: 20px; right: 20px; padding: 12px 14px; color: #fff; border: 1px solid #fff; border-radius: 4px; text-decoration: none;\';',
					'			button.target = \'_blank\';',
					'			button.textContent = \'EDIT\';',
					'			document.body.appendChild( button );',
					''
				].join( '\n' );
			}

			content = content.replace( '\n\t\t\t\n', editButton );

			zip.file( 'index.html', content );

		} );
		loader.load( 'js/libs/app.js', function ( content ) {

			zip.file( 'js/app.js', content );

		} );
		loader.load( '../build/three.min.js', function ( content ) {

			zip.file( 'js/three.min.js', content );

		} );

		if ( vr ) {

			loader.load( '../examples/js/vr/WebVR.js', function ( content ) {

				zip.file( 'js/WebVR.js', content );

			} );

		}

	} );
	options.add( option );
*/
	//

	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link ); // Firefox workaround, see #6594

	function save( blob, filename ) {

		link.href = URL.createObjectURL( blob );
		link.download = filename || 'data.json';
		link.click();

		// URL.revokeObjectURL( url ); breaks Firefox...

	}

	function saveArrayBuffer( buffer, filename ) {

		save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

	}

	function saveString( text, filename ) {

		save( new Blob( [ text ], { type: 'text/plain' } ), filename );

	}

	return container;

};
