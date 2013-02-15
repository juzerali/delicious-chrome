$(document).ready(function() {
    var storage = chrome.storage.local;
	var deliciousData;

	function buildBookmarksObj(bookmarks, callback) {
		var tempObj = new Object;

		//  Build bookmark data object
		for (var i = 0; i < bookmarks.posts.length; i++) {
			var item = bookmarks.posts[i].post;
			var tags = item.tag.split('  ');
			for (var x = 0; x < tags.length; x++) {
				var tag = tags[x];
				if (tag !== '') {
					if (!tempObj.hasOwnProperty(tag)) {
						tempObj[tag] = new Array;
					}
					tempObj[tag].push({
						'data': {
							'title': item.description,
							'url': item.href,
							'hash': item.hash,
							'private': item.private,
							'shared': item.shared,
							'time': item.time,
							'icon': 'images/file.png'
						}
					});
				}
			}
		}

		//var treeData = { 'data': [] };
		//for (var tagName in tempObj) {
		//	var temp = { 'data': tagName, 'children': tempObj[tagName] };
		//	treeData.data.push(temp);
		//}
		var $treeData1 = $('<ul>');
		for (var tagName in tempObj) {
			// The sha1 hash is to accommodate IDs with spaces and other special charcters
			var $tagLI = $('<li id="' + Sha1.hash(tagName) + '" rel="folder"><a href="#">' + tagName + '</a>');
			var $tagUL = $('<ul>');
			$tagLI.append($tagUL);

			for (var i in tempObj[tagName]) {
				var item = tempObj[tagName][i];
				//var $bookmark = $('<li rel="file"><a href="#">' + item.data.title + '</a></li>');
				var $bookmark = $('<li rel="file"><a href="' + item.data.url + '" target="_blank":>' + item.data.title + '</a></li>');
				//$bookmark.click(function() {
					//chrome.tabs.create({'url': chrome.extension.getURL(item.data.url)}, function(tab) {
						// done
					//});
				//});
				$tagUL.append($bookmark);
			}
			$treeData1.append($tagLI);
		}
		deliciousData = { 'data': $treeData1.html() };
		treeData = { 'data': $treeData1.html() };
		callback(treeData);
	}

	function fetchFeed(callback) {
		if (deliciousData === undefined) {
			//console.log('no');
			fetchBookmarks();
		} else {
			//console.log(deliciousData);
			//console.log('yes');
			var obj = { 'status': 'success', 'data': deliciousData };
			callback(JSON.stringify(obj));
		}

		function fetchBookmarks() {
			var url = 'https://user:pass@api.del.icio.us/v1/json/posts/all';
			var request = $.ajax({
				url: url,
				type: 'get',
				context: document.body
			});
			request.done(function (response, textStatus, jqXHR) {
				// validate the JSON here
				buildBookmarksObj(response, function(treeData) {
					var obj = { 'status': 'success', 'data': treeData };
					callback(JSON.stringify(obj));
				});
			});

			request.fail(function (jqXHR, textStatus, errorThrown) {
				//var error = 'The following error occured: ' + textStatus, errorThrown;
				var obj = { 'status': 'error', 'data': 'no data' };
				callback(obj);
			});
		}
	}


	function onRequest(request, sender, callback) {
		if (request.action === 'fetchFeed') {
			fetchFeed(callback);
		}
	}
	chrome.extension.onRequest.addListener(onRequest);
});
