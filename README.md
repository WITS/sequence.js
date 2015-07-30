sequence.js
===========

`sequence.js` is a small JavaScript library that makes it easy to rearrange elements in responsive web designs.

What It Can Do
===============

`sequence.js` can rearrange elements based on changes in the width of a webpage.
The elements can be rearranged in two ways:

1. Changing the order of elements
2. Changing the parent of elements

Initialization
==============
To begin using `sequence.js` in a project, simply load it in the `<head>` of a project, and set
your breakpoints. Breakpoints should be the `min-width`s (in px) used in your CSS media queries.
For example, if you had different styling for when the width was between `0px` and `599px`;
`600px` and `967px`; `968px` and `1199px`; and greater than `1200px`, you might have
the following code as your document's head.

```html
<head>
    <link rel='stylesheet' href='style.css' />
    <script src='sequence.js'></script>
    <script>
        Sequence.setBreakpoints(600, 968, 1200);
    </script>
</head>
```

The breakpoints can be set at any time after sequence.js has been loaded into the document.

Use
=====
Once the breakpoints are set, you're ready to start using `sequence.js`! All you need to do
to make use of `sequence.js` is add data attributes to some elements.

Changing the order of elements
------------------------------
To change the order of elements, use `sq-order*` and add `sq-container` to the parent
element. For example, if you wanted a `p` to appear before a `span` except on very large displays,
you could write this HTML:

```html
<div sq-container>
    <p sq-order='0' sq-order-1200='2'>I am a paragraph</p>
    <span sq-order='1'>Why hello there big guy</span>
</div>
```

It's worth noting that any elements without `sq-order` defined on them are treated as
though they have `sq-order='0'`, so in this example the `<p>` really only needs the attribute
`sq-order-1200='2'`.

Changing the parent of elements
-------------------------------
To change the parents of elements use `sq-id` and `sq-for*`. The following example moves a `<span>`
between two `<div>`s based on whether the display is small or not.

```html
<div id='flip' sq-for='pancake'>
    <span sq-id='pancake'></span>
</div>
<div id='flop' sq-for-0='pancake'></div>
```

The `sq-for-0` indicates where the `<span>` should go when the page width is smaller than the
smallest breakpoint, in any other situation it would go to the element with `sq-for` equal to
its `sq-id`.

> All `sq-for-*` attributes are checked before `sq-for`.

If you wanted the `<span>` to go to a different `<div>` for every single breakpoint, you could
do something like this:

```html
<div id='one' sq-for-0='pancake'>
    <span sq-id='pancake'></span>
</div>
<div id='two' sq-for-600='pancake'></div>
<div id='three' sq-for-968='pancake'></div>
<div id='four' sq-for-1200='pancake'></div>
```

Or if you want to move multiple elements into the same parents or different parents,
you could do something like this:

```html
<div id='one' sq-for='pancake1,pancake2'>
    <span sq-id='pancake1'></span>
    <span sq-id='pancake2'></span>
    <span sq-id='pancake3'></span>
</div>
<div id='two' sq-for-968='pancake1' sq-for-1200='pancake1'></div>
<div id='three' sq-for-1200='pancake2'></div>
```

This would cause all three `<span>`s to have the same parent when the page is small, but
when the page width was greater than or equal to `968px`, `pancake1` would move to `div#two`.
And at `1200px` or wider `pancake2` would move to `div#three`.

Miscellaneous
=============
The data attribute prefix (by default, `sq`), can be changed by changing the value of
`Sequence.prefix` in JavaScript.