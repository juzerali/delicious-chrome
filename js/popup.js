$(document).ready(function() {
	var backgroundPage = chrome.extension.getBackgroundPage();
	var storage = chrome.storage.local;
	var ONE_DAY = 24 * 60 * 60 * 1000;

	storage.get(["lastUpdated", "treeHTML"], function(data) {
		//If data is more than a day old, fetch new data
		if (new Date - data.lastUpdated < ONE_DAY ) {
			$("#jstree").html(data.treeHTML);
		} else {
			fetch_new_feed();
		}
	});

	function logIt(text) {
		backgroundPage.console.log(text);
	}

	function buildUI(data) {
		$('#jstree').jstree({
			'core': {
				'animation': 0
			},

			//'json_data': bookmarks,
			'html_data': {
				'data': data
			},

			'themes': {
				'theme': 'classic',
				'dots': false,
				'icons': true
			},

			'types': {
				'valid_children': [ 'folder' ],
				'types': {
					'folder': {
						'valid_children': [ 'file' ],
						'max_depth': 1
					},
					'file' : {
						'valid_children': [ 'none' ],
						'icon': { 'image': 'images/file.png' }
					}
				}
			},

			'plugins': [
				//'json_data',
				'html_data',
				'themes',
				'sort',
				'types',
				'search'
			]
		})
		.on('click', '.jstree-leaf', function() {
			logIt($(this).text());
		});
	}

	function fetch_new_feed(){
		chrome.extension.sendRequest({'action': 'fetchFeed'}, function(response) {
			var output = JSON.parse(response);
			buildUI(output.data.data);
			chrome.storage.local.set({
				'treeHTML': $("#jstree").html(),
				'lastUpdated': new Date
			});
		});
	}
});