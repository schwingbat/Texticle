require('Common');

// Create Window
var win = new Window();
application.exitAfterWindowsClose = true;
win.width = 800;
win.height = 600;
win.title = "Texticle";

// Create WebView
var webView = new WebView();
win.appendChild(webView);
webView.left=webView.top=webView.right=webView.bottom=0;
webView.location = "app://index.html";

// Toolbar
var toolbar = new Toolbar();
win.appendChild(toolbar);
toolbar.size = 'regular';

var boldButton = new ToolbarItem();
toolbar.appendChild(boldButton);
boldButton.image = 'status-available';
boldButton.active = true;

application.addEventListener('keydown', function(e) {
  e.preventDefault();
  return false;
});

win.visible = true;
