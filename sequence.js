/*
Sequence.js - Allows for easy re-ordering and re-positioning of elements

The MIT License (MIT)

Copyright (c) 2016 Ian Jones

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

Sequence = function() {
	// Populate this array with the min-width's used for
	// CSS media queries
	this.breakpoints = new Array();
	this.callbacks = new Object();
}

// The prefix to use for data-attributes
Sequence.prototype.prefix = "sq";

// Stores the width (of the breakpoint) from the
// last time update was called
Sequence.prototype.lastWidth = 0;

Sequence.prototype.setBreakpoints = function() {
	if (!arguments.length) {
		this.breakpoints = new Array();
		this.update();
		return;
	}
	if (arguments[0] instanceof Array) {
		var a = arguments[0];
	} else {
		var a = new Array();
		for (var i = arguments.length; i --; ) {
			a.push(arguments[i]);
		}
	}
	this.breakpoints = a;
	this.breakpoints = this.breakpoints.sort(function(a, b) {
		return a - b;
	});
	this.update();
}

// Update lastWidth and return if changed (true/false)
Sequence.prototype.getWidth = function() {
	var w = window.innerWidth;
	// Compare width to breakpoints
	for (var i = Sequence.breakpoints.length; i --; ) {
		var bp = Sequence.breakpoints[i];
		if (w >= bp) {
			if (Sequence.lastWidth != bp) {
				Sequence.lastWidth = bp;
				return true;
			}
			return false;
		}
	}
	if (Sequence.lastWidth != 0) {
		Sequence.lastWidth = 0;
		return true;
	}
	return false;
}

// Updates the order and parents of elements where
// appropriate throughout the entire document
Sequence.prototype.update = function() {
	// Element parent
	var elements = document.querySelectorAll(
		"[" + Sequence.prefix + "-id]");
	for (var i = elements.length; i --; ) {
		Sequence.findParent(elements[i]);
	}
	// Element order
	var containers = document.querySelectorAll(
		"[" + Sequence.prefix + "-container]");
	for (var i = containers.length; i --; ) {
		Sequence.sort(containers[i]);
	}
	// Call events
	var function_queue = new Array();
	if (Sequence.callbacks.update) {
		function_queue = function_queue.concat(Sequence.callbacks.update);
	}
	if (Sequence.callbacks["update-" + Sequence.lastWidth]) {
		function_queue = function_queue.concat(
			Sequence.callbacks["update-" + Sequence.lastWidth]);
	}
	for (var x = 0, y = function_queue.length; x < y; ++ x) {
		function_queue[x]();
	}
}

// Sorts the children of a sequence container
Sequence.prototype.sort = function(elem) {
	var a = new Array();
	for (var i = elem.children.length; i --; ) {
		var child = elem.children[0];
		a.push(child);
		elem.removeChild(child);
	}
	function get_value(x) {
		// If not otherwise stated,
		// children have the value 0
		if (!(x instanceof Element)) {
			return 0;
		} else if (x.getAttribute(
			Sequence.prefix + "-order") == null) {
			return 0;
		}
		// Otherwise, figure out which is appropriate
		var val = x.getAttribute(Sequence.prefix +
			"-order-" + Sequence.lastWidth);
		if (val != null) {
			return val;
		} else {
			return x.getAttribute(Sequence.prefix +
				"-order");
		}
	}
	a = a.sort(function(a, b) {
		return get_value(b) - get_value(a);
	});
	for (var i = a.length; i --; ) {
		elem.appendChild(a[i]);
	}
}

// Finds the appropriate parent for an element
Sequence.prototype.findParent = function(elem) {
	var id = elem.getAttribute(Sequence.prefix + "-id");
	// Find parents for this size
	var parents = document.querySelectorAll("[" +
		Sequence.prefix + "-for-" +
		Sequence.lastWidth + "]");
	for (var i = parents.length; i --; ) {
		var p = parents[i];
		if (p.getAttribute(Sequence.prefix +
			"-for-" + Sequence.lastWidth).split(
			",").indexOf(id) != -1) {
			p.setAttribute(Sequence.prefix + "-container", "");
			p.appendChild(elem);
			return;
		}
	}
	parents = document.querySelectorAll("[" +
		Sequence.prefix + "-for]");
	for (var i = parents.length; i --; ) {
		var p = parents[i];
		if (p.getAttribute(Sequence.prefix +
			"-for").split(
			",").indexOf(id) != -1) {
			p.setAttribute(Sequence.prefix + "-container", "");
			p.appendChild(elem);
			return;
		}
	}
}

Sequence.prototype.addEventListener = function(type, callback) {
	// Verify that this type of callback exists
	if (this.callbacks[type] == null) this.callbacks[type] = new Array();
	this.callbacks[type].push(callback);
}

// For easy access
Sequence = new Sequence();

// Make sure elements are in the correct
// order to begin with
window.addEventListener("load", function() {
	Sequence.getWidth();
	Sequence.update();
}, false);

// This event re-orders elements when the user resizes
// past a breakpoint
window.addEventListener("resize", function() {
	if (Sequence.getWidth()) {
		Sequence.update();
	}
}, false);