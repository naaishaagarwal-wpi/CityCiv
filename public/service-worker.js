self.addEventListener("install", () => {
    console.log("SW installed");
  });
  
  self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
    console.log("SW activated and claiming clients");
  });