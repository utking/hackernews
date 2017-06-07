const apiBaseUrl = "https://hacker-news.firebaseio.com/v0";

fetch(`${apiBaseUrl}/topstories.json`)
  .then(x => x.json())
  .then(x => {
    x.forEach(function(a) {
      fetch(`${apiBaseUrl}/item/${a}.json`)
        .then(i => i.json())
        .then((i) => {
		      if (/js/i.test(i.title) || /script/i.test(i.title)) {
            console.log(`${i.type}:: ${i.title} | ${i.url}`);
          }
        });
    })
  });
