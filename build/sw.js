if(!self.define){let e,i={};const n=(n,s)=>(n=new URL(n+".js",s).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(s,r)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(i[a])return;let c={};const o=e=>n(e,a),d={module:{uri:a},exports:c,require:o};i[a]=Promise.all(s.map((e=>d[e]||o(e)))).then((e=>(r(...e),c)))}}define(["./workbox-ee742793"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"android-chrome-192x192.png",revision:"2e10b7f006b6439cbcddde99d7781e69"},{url:"android-chrome-512x512.png",revision:"402a8784283e7652df22baba4e717dc7"},{url:"apple-touch-icon.png",revision:"402a8784283e7652df22baba4e717dc7"},{url:"assets/default-avatar-a1DcZ69x.png",revision:null},{url:"assets/flexiyo-BTO5hhW8.svg",revision:null},{url:"assets/index-BRu5hsBb.css",revision:null},{url:"assets/index-hemqbdVY.js",revision:null},{url:"assets/splash-Bl0AuATR.png",revision:null},{url:"favicon-16x16.png",revision:"8ac03d3c97e96c3798862a8c02834ed7"},{url:"favicon-32x32.png",revision:"1a2cce1c441e0e4740742b038c849640"},{url:"favicon-48x48.png",revision:"9032e021fba03cca098fe2d9d47172ed"},{url:"favicon.ico",revision:"781747b888c449e910af19d297c7b3db"},{url:"favicon.svg",revision:"2668564acfd23d0708d5cdbc097ba775"},{url:"googlefc2bb8ee73b78147.html",revision:"749f0d1f363ca722a0b34b0e6ac140ae"},{url:"index.html",revision:"7e5b236704daad560856b0957099c362"},{url:"logo192.png",revision:"5a8494cd57d50acb8e580174d061e172"},{url:"logo512.png",revision:"402a8784283e7652df22baba4e717dc7"},{url:"offline.html",revision:"dd4a14b888d1ef656721c45e6e6f3061"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"web-app-manifest-192x192.png",revision:"12912a5bb5eed6ee0aba7885a4483a20"},{url:"web-app-manifest-512x512.png",revision:"5afdc146f400f537eca113855b374001"},{url:"apple-touch-icon.png",revision:"402a8784283e7652df22baba4e717dc7"},{url:"favicon.ico",revision:"781747b888c449e910af19d297c7b3db"},{url:"robots.txt",revision:"fa1ded1ed7c11438a9b0385b1e112850"},{url:"manifest.webmanifest",revision:"1f257b02105906db1e0f1b042af4c63f"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute((({request:e})=>"image"===e.destination),new e.CacheFirst({cacheName:"images-cache",plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute((({request:e})=>["style","script","worker"].includes(e.destination)),new e.StaleWhileRevalidate({cacheName:"assets-cache",plugins:[]}),"GET")}));
