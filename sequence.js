/*
 * Sequence.js
 * Copyright (c) 2015 Ian Jones
 * Allows for easy re-ordering and
 * re-positioning of elements
 */

Sequence = function() {
	// Populate this array with the min-width's used for
	// CSS media queries
	this.breakpoints = new Array();
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
		if (w > bp) {
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