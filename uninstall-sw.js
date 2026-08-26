if ("serviceWorker" in navigator) {
	const serviceWorkerUrl = new URL("./sw.js", import.meta.url);
	navigator.serviceWorker
		.register(serviceWorkerUrl)
		.then((serviceWorker) => {
			console.log("Service Worker registered: ", serviceWorker);
		})
		.catch((error) => {
			console.error("Error registering the Service Worker: ", error);
		});
}
