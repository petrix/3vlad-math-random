"use strict";
const version = "v1.001";
const staticCachePrefix = "DRumGen";
const staticCacheName = staticCachePrefix + "-static-" + version;
const dynamicCacheName = staticCachePrefix + "-dynamic-" + version;

const staticAssets = [
	"./",
	"./index.html",
	"./js/app-starter.js",
	"./js/app-starter.js.map",
	"./js/app-starter.css",
	"./manifest.json",
	"./site.webmanifest",
	"./android-chrome-192x192.png",
	"./android-chrome-512x512.png",
	"./favicon-16x16.png",
	"./favicon-32x32.png",
	"./apple-touch-icon.png",
	"./browserconfig.xml",
	"./mstile-150x150.png",
	"./favicon.ico",
	"./safari-pinned-tab.svg",
	// "./js/sw-reg.js",
];
self.addEventListener("install", function (event) {
	event.waitUntil(updateStaticCache());
});

function updateStaticCache() {
	return caches
		.open(staticCacheName)
		.then(cache => {
			console.log("cache", cache);
			return cache.addAll(staticAssets);
		})
		.then(() => {
			return self.skipWaiting();
		})
		.catch(err => console.log("err", err));
}

self.addEventListener("activate", async event => {
	event.waitUntil(
		caches
			.keys()
			.then(cacheNames => {
				return Promise.all(
					cacheNames
						.filter(cacheName => {
							return cacheName.startsWith(staticCachePrefix) && cacheName !== staticCacheName;
						})
						.map(cacheName => {
							return caches.delete(cacheName);
						}),
				);
			})
			.then(() => {
				// tell service worker to take control of any open pages.
				self.clients.claim();
			})
			.then(() => {
				self.clients
					.matchAll({
						type: "window",
					})
					.then(tabs => {
						tabs.forEach(tab => {
							console.log("tab.url : ", tab.url);
							tab.navigate(tab.url);
						});
					});
			}),
	);
});

self.addEventListener("fetch", event => {
	let request = event.request;

	let url = new URL(request.url);

	if (request.method !== "GET") {
		return event.respondWith(fetch(request));
	}

	if (url.origin !== location.origin) {
		// console.log('url.href : ', url.href);
		return url;
	}
	event.respondWith(
		//ONLINE RESPONDING
		caches.match(request).then(response => {
			// if (request.url.indexOf(".mp3") !== -1) {
			// 	return caches.match("./auSamples/sex.mp3");
			// }
			console.log("request", request);
			return response || checkCache(request);
		}),
	);
	// event.respondWith(checkCache(event.request));
});
async function checkCache(req) {
	const cachedResponse = await caches.match(req);
	console.log("cachedResponse", cachedResponse);
	return cachedResponse || checkOnline(req);
}

async function checkOnline(req) {
	const cache = await caches.open(dynamicCacheName);
	// const cache = await caches.open(staticCacheName);
	try {
		const res = await fetch(req);
		console.log("res", res);
		// await console.log('req', req.url, res.url);
		await cache.put(req, res.clone());
		return res;
	} catch (error) {
		const cachedRes = await cache.match(req);
		console.log("cachedRes", cachedRes);

		if (cachedRes) {
			console.log("cachedRes", cachedRes);
			//OFFLINE RESPONDING
			return cachedRes;
		} else {
		}
	}
}
