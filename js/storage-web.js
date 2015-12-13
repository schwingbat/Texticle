var texticle = document.querySelector('#texticle');
var content = texticle.querySelector('.content');

var storage = {
  save: function() {
    localStorage.setItem('texticle-content', content.innerHTML);
  },
  load: function() {
    var loaded = localStorage.getItem('texticle-content');

    if (loaded) content.innerHTML = loaded;
    else return console.error('No content to load.');
  }
}

storage.load();

setInterval(function() {
    storage.save();
}, 1000);
