'use strict';

var undoManager = new UndoManager();

var texticle = document.querySelector('#texticle'),
    stripper = texticle.querySelector('#stripper'),
    content = texticle.querySelector('.content'),
    cursor = content.querySelector('#cursor');

var platform = navigator.platform || navigatorID.platform;

var cursorIndex = 0,
    selRange = null;

/***************************
   *Input and *Keypresses
***************************/

var insert = function(char) {
    var c = content.textContent,
        ci = parseInt(cursorIndex);

    if (selRange) {
        content.textContent = c.slice(0, selRange[0]) + char + c.slice(selRange[1]);
        moveCursorTo(selRange[0]+1);
        clearSelection();
    } else {
        content.textContent = c.slice(0, ci) + char + c.slice(ci);
        moveCursorTo(ci+1);
    }

    // undoManager.add({
    //     undo: function() {
    //         textArray = _.dropRight(textArray, 2);
    //         moveCursorTo(cursorIndex -= 1);
    //         update();
    //     },
    //     redo: function() {
    //         insert(char);
    //     }
    // });
}

var remove = function() {
    var c = content.textContent,
        ci = parseInt(cursorIndex);

    // Prevent deleting if cursor is at the beginning of the array
    if (ci > 0) {
        if (selRange) {
            console.log(selRange);
            content.textContent = c.slice(0, selRange[0]) + c.slice(selRange[1]);
            moveCursorTo(selRange[0]);
            clearSelection();
        } else {
            content.textContent = c.slice(0, ci-1) + c.slice(ci);
            moveCursorTo(ci-1);
        }
    }
}

document.addEventListener('keypress', function(e) {
    insert(String.fromCharCode(e.which));
});

Mousetrap.bind('backspace', function() {
    remove();
    return false;
});

/***************************
      *Copy and *Paste
***************************/

var stripFormatting = function(input) {
  stripper.innerHTML = input;
  return stripper.textContent;
}

var paste = function(input) {
    var stripped = stripFormatting(input);

    insert(stripped);
    moveCursorTo(cursorIndex += stripped.length);

    undoManager.add({
        undo: function() {
            content.textContent = content.textContent.slice(0, content.textContent.length - stripped.length);
            moveCursorTo(cursorIndex -= stripped.length+1);
        },
        redo: function() {
            insert(stripped);
            moveCursorTo(cursorIndex += stripped.length);
        }
    });
}

document.addEventListener('paste', function(e) {
  paste(e.clipboardData.getData('text/plain'));
});

document.addEventListener('cut', function(e) {
    remove();
});

/**************************
    *Cursor & *Selection
**************************/

// By Tim Down - simplify to fit my own needs
function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

var moveCursorTo = function(index) {
    var c = content.textContent,
        i = parseInt(index);

    content.innerHTML = content.textContent;
    cursorIndex = i;
    content.innerHTML = c.slice(0, i) + "<span id='cursor'></span>" + c.slice(i);
}

window.addEventListener('mouseup', function(e) {
    var sel = window.getSelection(),
        caretOffset = getCaretCharacterOffsetWithin(content);;

    selRange = [sel.anchorOffset, sel.focusOffset].sort(function(a,b) { return a - b });

    if (selRange[0] === selRange[1]) moveCursorTo(caretOffset), selRange = null;

    if (caretOffset > cursorIndex) {
        selRange[0] += cursorIndex;
        selRange[1] += cursorIndex;
    }
});


var clearSelection = function() {
    selRange = null;
}



/******************************
          *Shortcuts
******************************/

var modkey = 'control';
if (platform.includes('Mac')) console.log('This is a Mac! modKey is command.'), modkey = 'command';


/*********** Arrow Keys ***********/

Mousetrap.bind('left', function() {
  // Make sure cursor can't go past beginning of array.
  if (selRange) moveCursorTo(selRange[0]);
  else if (cursorIndex > 0) moveCursorTo(cursorIndex-1);
  clearSelection();
});

Mousetrap.bind('right', function() {
  // Make sure cursor can't go past the end of the array.
  if (selRange) moveCursorTo(selRange[1]);
  else if (cursorIndex < content.textContent.length) moveCursorTo(cursorIndex+1);
  clearSelection();
});

// Mousetrap.bind('up', function() {
//
// });
//
// Mousetrap.bind('down', function() {
//
// });
//
// Mousetrap.bind('shift+left', function() {
//
// });
//
// Mousetrap.bind('shift+right', function() {
//
// });

Mousetrap.bind('alt+left', function() {
  var i, tl = textArray.length;
  for (i = cursorIndex; i > 0; i--) if (i < cursorIndex-1 && textArray[i] === ' ') { moveCursorTo(i+1); return; }
});

Mousetrap.bind('alt+right', function() {
  var i, tl = textArray.length;
  for (i = cursorIndex; i < tl; i++) if (i > cursorIndex+1 && textArray[i] === ' ') { moveCursorTo(i-1); return; }
});


/*********** Undo/Redo ***********/

Mousetrap.bind(modkey+'+z', function(e) {
  undoManager.undo();
  return false;
});

Mousetrap.bind('shift+'+modkey+'+z', function(e) {
  undoManager.redo();
  return false;
});
