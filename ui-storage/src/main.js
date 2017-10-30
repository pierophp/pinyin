import offlinePlugin from 'offline-plugin/runtime';
offlinePlugin.install({
  onUpdateReady() {
    // Tells to new SW to take control immediately
    offlinePlugin.applyUpdate();
  },
  onUpdated() {
    // Reload the webpage to load into the new version
    window.location.reload();
  },
});
