/* SCROLLING NAVBAR */
var OFFSET_TOP = 50;

$(window).scroll(function () {
    if ($('.navbar').length) {
        if ($('.navbar').offset().top > OFFSET_TOP) {
            $('.scrolling-navbar').addClass('top-nav-collapse');
        } else {
            $('.scrolling-navbar').removeClass('top-nav-collapse');
        }
    }
});
/*!
 * Waves v0.7.5
 * http://fian.my.id/Waves
 *
 * Copyright 2014-2016 Alfiana E. Sibuea and other contributors
 * Released under the MIT license
 * https://github.com/fians/Waves/blob/master/LICENSE
 */

;
(function (window, factory) {
    'use strict';

    // AMD. Register as an anonymous module.  Wrap in function so we have access
    // to root via `this`.
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return factory.apply(window);
        });
    }

    // Node. Does not work with strict CommonJS, but only CommonJS-like
    // environments that support module.exports, like Node.
    else if (typeof exports === 'object') {
        module.exports = factory.call(window);
    }

    // Browser globals.
    else {
        window.Waves = factory.call(window);
    }
})(typeof global === 'object' ? global : this, function () {
    'use strict';

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);
    var toString = Object.prototype.toString;
    var isTouchAvailable = 'ontouchstart' in window;


    // Find exact position of element
    function isWindow(obj) {
        return obj !== null && obj === obj.window;
    }

    function getWindow(elem) {
        return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }

    function isObject(value) {
        var type = typeof value;
        return type === 'function' || type === 'object' && !!value;
    }

    function isDOMNode(obj) {
        return isObject(obj) && obj.nodeType > 0;
    }

    function getWavesElements(nodes) {
        var stringRepr = toString.call(nodes);

        if (stringRepr === '[object String]') {
            return $$(nodes);
        } else if (isObject(nodes) && /^\[object (Array|HTMLCollection|NodeList|Object)\]$/.test(stringRepr) && nodes.hasOwnProperty('length')) {
            return nodes;
        } else if (isDOMNode(nodes)) {
            return [nodes];
        }

        return [];
    }

    function offset(elem) {
        var docElem, win,
            box = {
                top: 0,
                left: 0
            },
            doc = elem && elem.ownerDocument;

        docElem = doc.documentElement;

        if (typeof elem.getBoundingClientRect !== typeof undefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    function convertStyle(styleObj) {
        var style = '';

        for (var prop in styleObj) {
            if (styleObj.hasOwnProperty(prop)) {
                style += (prop + ':' + styleObj[prop] + ';');
            }
        }

        return style;
    }

    var Effect = {

        // Effect duration
        duration: 750,

        // Effect delay (check for scroll before showing effect)
        delay: 200,

        show: function (e, element, velocity) {

            // Disable right click
            if (e.button === 2) {
                return false;
            }

            element = element || this;

            // Create ripple
            var ripple = document.createElement('div');
            ripple.className = 'waves-ripple waves-rippling';
            element.appendChild(ripple);

            // Get click coordinate and element width
            var pos = offset(element);
            var relativeY = 0;
            var relativeX = 0;
            // Support for touch devices
            if ('touches' in e && e.touches.length) {
                relativeY = (e.touches[0].pageY - pos.top);
                relativeX = (e.touches[0].pageX - pos.left);
            }
            //Normal case
            else {
                relativeY = (e.pageY - pos.top);
                relativeX = (e.pageX - pos.left);
            }
            // Support for synthetic events
            relativeX = relativeX >= 0 ? relativeX : 0;
            relativeY = relativeY >= 0 ? relativeY : 0;

            var scale = 'scale(' + ((element.clientWidth / 100) * 3) + ')';
            var translate = 'translate(0,0)';

            if (velocity) {
                translate = 'translate(' + (velocity.x) + 'px, ' + (velocity.y) + 'px)';
            }

            // Attach data to element
            ripple.setAttribute('data-hold', Date.now());
            ripple.setAttribute('data-x', relativeX);
            ripple.setAttribute('data-y', relativeY);
            ripple.setAttribute('data-scale', scale);
            ripple.setAttribute('data-translate', translate);

            // Set ripple position
            var rippleStyle = {
                top: relativeY + 'px',
                left: relativeX + 'px'
            };

            ripple.classList.add('waves-notransition');
            ripple.setAttribute('style', convertStyle(rippleStyle));
            ripple.classList.remove('waves-notransition');

            // Scale the ripple
            rippleStyle['-webkit-transform'] = scale + ' ' + translate;
            rippleStyle['-moz-transform'] = scale + ' ' + translate;
            rippleStyle['-ms-transform'] = scale + ' ' + translate;
            rippleStyle['-o-transform'] = scale + ' ' + translate;
            rippleStyle.transform = scale + ' ' + translate;
            rippleStyle.opacity = '1';

            var duration = e.type === 'mousemove' ? 2500 : Effect.duration;
            rippleStyle['-webkit-transition-duration'] = duration + 'ms';
            rippleStyle['-moz-transition-duration'] = duration + 'ms';
            rippleStyle['-o-transition-duration'] = duration + 'ms';
            rippleStyle['transition-duration'] = duration + 'ms';

            ripple.setAttribute('style', convertStyle(rippleStyle));
        },

        hide: function (e, element) {
            element = element || this;

            var ripples = element.getElementsByClassName('waves-rippling');

            for (var i = 0, len = ripples.length; i < len; i++) {
                removeRipple(e, element, ripples[i]);
            }
        }
    };

    /**
     * Collection of wrapper for HTML element that only have single tag
     * like <input> and <img>
     */
    var TagWrapper = {

        // Wrap <input> tag so it can perform the effect
        input: function (element) {

            var parent = element.parentNode;

            // If input already have parent just pass through
            if (parent.tagName.toLowerCase() === 'div' && parent.classList.contains('waves-effect')) {
                return;
            }

            // Put element class and style to the specified parent
            var wrapper = document.createElement('div');
            wrapper.className = 'waves-input-wrapper';
            // element.className = element.className + ' waves-button-input';

            // Put element as child
            parent.replaceChild(wrapper, element);
            wrapper.appendChild(element);

            // Apply element color and background color to wrapper
            var elementStyle = window.getComputedStyle(element, null);
            var color = elementStyle.color;
            var backgroundColor = elementStyle.backgroundColor;

            // wrapper.setAttribute('style', 'color:' + color + ';background:' + backgroundColor);
            // element.setAttribute('style', 'background-color:rgba(0,0,0,0);');

        },

        // Wrap <img> tag so it can perform the effect
        img: function (element) {

            var parent = element.parentNode;

            // If input already have parent just pass through
            if (parent.tagName.toLowerCase() === 'i' && parent.classList.contains('waves-effect')) {
                return;
            }

            // Put element as child
            var wrapper = document.createElement('i');
            parent.replaceChild(wrapper, element);
            wrapper.appendChild(element);

        }
    };

    /**
     * Hide the effect and remove the ripple. Must be
     * a separate function to pass the JSLint...
     */
    function removeRipple(e, el, ripple) {

        // Check if the ripple still exist
        if (!ripple) {
            return;
        }

        ripple.classList.remove('waves-rippling');

        var relativeX = ripple.getAttribute('data-x');
        var relativeY = ripple.getAttribute('data-y');
        var scale = ripple.getAttribute('data-scale');
        var translate = ripple.getAttribute('data-translate');

        // Get delay beetween mousedown and mouse leave
        var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
        var delay = 350 - diff;

        if (delay < 0) {
            delay = 0;
        }

        if (e.type === 'mousemove') {
            delay = 150;
        }

        // Fade out ripple after delay
        var duration = e.type === 'mousemove' ? 2500 : Effect.duration;

        setTimeout(function () {

            var style = {
                top: relativeY + 'px',
                left: relativeX + 'px',
                opacity: '0',

                // Duration
                '-webkit-transition-duration': duration + 'ms',
                '-moz-transition-duration': duration + 'ms',
                '-o-transition-duration': duration + 'ms',
                'transition-duration': duration + 'ms',
                '-webkit-transform': scale + ' ' + translate,
                '-moz-transform': scale + ' ' + translate,
                '-ms-transform': scale + ' ' + translate,
                '-o-transform': scale + ' ' + translate,
                'transform': scale + ' ' + translate
            };

            ripple.setAttribute('style', convertStyle(style));

            setTimeout(function () {
                try {
                    el.removeChild(ripple);
                } catch (e) {
                    return false;
                }
            }, duration);

        }, delay);
    }


    /**
     * Disable mousedown event for 500ms during and after touch
     */
    var TouchHandler = {

        /* uses an integer rather than bool so there's no issues with
         * needing to clear timeouts if another touch event occurred
         * within the 500ms. Cannot mouseup between touchstart and
         * touchend, nor in the 500ms after touchend. */
        touches: 0,

        allowEvent: function (e) {

            var allow = true;

            if (/^(mousedown|mousemove)$/.test(e.type) && TouchHandler.touches) {
                allow = false;
            }

            return allow;
        },
        registerEvent: function (e) {
            var eType = e.type;

            if (eType === 'touchstart') {

                TouchHandler.touches += 1; // push

            } else if (/^(touchend|touchcancel)$/.test(eType)) {

                setTimeout(function () {
                    if (TouchHandler.touches) {
                        TouchHandler.touches -= 1; // pop after 500ms
                    }
                }, 500);

            }
        }
    };


    /**
     * Delegated click handler for .waves-effect element.
     * returns null when .waves-effect element not in "click tree"
     */
    function getWavesEffectElement(e) {

        if (TouchHandler.allowEvent(e) === false) {
            return null;
        }

        var element = null;
        var target = e.target || e.srcElement;

        while (target.parentElement !== null) {
            if (target.classList.contains('waves-effect') && (!(target instanceof SVGElement))) {
                element = target;
                break;
            }
            target = target.parentElement;
        }

        return element;
    }

    /**
     * Bubble the click and show effect if .waves-effect elem was found
     */
    function showEffect(e) {

        // Disable effect if element has "disabled" property on it
        // In some cases, the event is not triggered by the current element
        // if (e.target.getAttribute('disabled') !== null) {
        //     return;
        // }

        var element = getWavesEffectElement(e);

        if (element !== null) {

            // Make it sure the element has either disabled property, disabled attribute or 'disabled' class
            if (element.disabled || element.getAttribute('disabled') || element.classList.contains('disabled')) {
                return;
            }

            TouchHandler.registerEvent(e);

            if (e.type === 'touchstart' && Effect.delay) {

                var hidden = false;

                var timer = setTimeout(function () {
                    timer = null;
                    Effect.show(e, element);
                }, Effect.delay);

                var hideEffect = function (hideEvent) {

                    // if touch hasn't moved, and effect not yet started: start effect now
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                        Effect.show(e, element);
                    }
                    if (!hidden) {
                        hidden = true;
                        Effect.hide(hideEvent, element);
                    }
                };

                var touchMove = function (moveEvent) {
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    hideEffect(moveEvent);
                };

                element.addEventListener('touchmove', touchMove, false);
                element.addEventListener('touchend', hideEffect, false);
                element.addEventListener('touchcancel', hideEffect, false);

            } else {

                Effect.show(e, element);

                if (isTouchAvailable) {
                    element.addEventListener('touchend', Effect.hide, false);
                    element.addEventListener('touchcancel', Effect.hide, false);
                }

                element.addEventListener('mouseup', Effect.hide, false);
                element.addEventListener('mouseleave', Effect.hide, false);
            }
        }
    }

    Waves.init = function (options) {
        var body = document.body;

        options = options || {};

        if ('duration' in options) {
            Effect.duration = options.duration;
        }

        if ('delay' in options) {
            Effect.delay = options.delay;
        }

        if (isTouchAvailable) {
            body.addEventListener('touchstart', showEffect, false);
            body.addEventListener('touchcancel', TouchHandler.registerEvent, false);
            body.addEventListener('touchend', TouchHandler.registerEvent, false);
        }

        body.addEventListener('mousedown', showEffect, false);
    };


    /**
     * Attach Waves to dynamically loaded inputs, or add .waves-effect and other
     * waves classes to a set of elements. Set drag to true if the ripple mouseover
     * or skimming effect should be applied to the elements.
     */
    Waves.attach = function (elements, classes) {

        elements = getWavesElements(elements);

        if (toString.call(classes) === '[object Array]') {
            classes = classes.join(' ');
        }

        classes = classes ? ' ' + classes : '';

        var element, tagName;

        for (var i = 0, len = elements.length; i < len; i++) {

            element = elements[i];
            tagName = element.tagName.toLowerCase();

            if (['input', 'img'].indexOf(tagName) !== -1) {
                TagWrapper[tagName](element);
                element = element.parentElement;
            }

            if (element.className.indexOf('waves-effect') === -1) {
                element.className += ' waves-effect' + classes;
            }
        }
    };


    /**
     * Cause a ripple to appear in an element via code.
     */
    Waves.ripple = function (elements, options) {
        elements = getWavesElements(elements);
        var elementsLen = elements.length;

        options = options || {};
        options.wait = options.wait || 0;
        options.position = options.position || null; // default = centre of element


        if (elementsLen) {
            var element, pos, off, centre = {},
                i = 0;
            var mousedown = {
                type: 'mousedown',
                button: 1
            };
            var hideRipple = function (mouseup, element) {
                return function () {
                    Effect.hide(mouseup, element);
                };
            };

            for (; i < elementsLen; i++) {
                element = elements[i];
                pos = options.position || {
                    x: element.clientWidth / 2,
                    y: element.clientHeight / 2
                };

                off = offset(element);
                centre.x = off.left + pos.x;
                centre.y = off.top + pos.y;

                mousedown.pageX = centre.x;
                mousedown.pageY = centre.y;

                Effect.show(mousedown, element);

                if (options.wait >= 0 && options.wait !== null) {
                    var mouseup = {
                        type: 'mouseup',
                        button: 1
                    };

                    setTimeout(hideRipple(mouseup, element), options.wait);
                }
            }
        }
    };

    /**
     * Remove all ripples from an element.
     */
    Waves.calm = function (elements) {
        elements = getWavesElements(elements);
        var mouseup = {
            type: 'mouseup',
            button: 1
        };

        for (var i = 0, len = elements.length; i < len; i++) {
            Effect.hide(mouseup, elements[i]);
        }
    };

    /**
     * Deprecated API fallback
     */
    Waves.displayEffect = function (options) {
        console.error('Waves.displayEffect() has been deprecated and will be removed in future version. Please use Waves.init() to initialize Waves effect');
        Waves.init(options);
    };

    return Waves;
});

//Initialization
Waves.attach('.btn:not(.btn-flat), .btn-floating', ['waves-light']);
Waves.attach('.btn-flat', ['waves-effect']);
Waves.attach('.view .mask', ['waves-light']);
Waves.attach('.waves-light', ['waves-light']);
Waves.attach('.navbar-nav a:not(.navbar-brand), .nav-icons li a, .navbar form, .nav-tabs .nav-item', ['waves-light']);
Waves.attach('.pager li a', ['waves-light']);
Waves.attach('.pagination .page-item .page-link', ['waves-effect']);
Waves.init();

'use strict';

/* FORMS */
(function ($) {
    $(document).ready(function () {

        // Text based inputs
        var input_selector = ['text', 'password', 'email', 'url', 'tel', 'number', 'search', 'search-md'].map(function (selector) {
            return 'input[type=' + selector + ']';
        }).join(', ') + ', textarea';

        var text_area_selector = '.materialize-textarea';

        var update_text_fields = function update_text_fields($input) {

            var $labelAndIcon = $input.siblings('label, i');
            var hasValue = $input.val().length;
            var hasPlaceholder = $input.attr('placeholder');
            // let isValid     = $input.validity.badInput === true;
            var addOrRemove = (hasValue || hasPlaceholder ? 'add' : 'remove') + 'Class';

            $labelAndIcon[addOrRemove]('active');
        };

        var validate_field = function validate_field($input) {

            if ($input.hasClass('validate')) {
                var value = $input.val();
                var noValue = !value.length;
                var isValid = !$input[0].validity.badInput;

                if (noValue && isValid) {
                    $input.removeClass('valid').removeClass('invalid');
                } else {
                    var valid = $input.is(':valid');
                    var length = Number($input.attr('length')) || 0;

                    if (valid && (!length || length > value.length)) {
                        $input.removeClass('invalid').addClass('valid');
                    } else {
                        $input.removeClass('valid').addClass('invalid');
                    }
                }
            }
        };

        var textarea_auto_resize = function textarea_auto_resize() {

            var $textarea = $(undefined);
            if ($textarea.val().length) {
                var _$hiddenDiv = $('.hiddendiv');
                var fontFamily = $textarea.css('font-family');
                var fontSize = $textarea.css('font-size');

                if (fontSize) {
                    _$hiddenDiv.css('font-size', fontSize);
                }
                if (fontFamily) {
                    _$hiddenDiv.css('font-family', fontFamily);
                }
                if ($textarea.attr('wrap') === 'off') {
                    _$hiddenDiv.css('overflow-wrap', 'normal').css('white-space', 'pre');
                }

                _$hiddenDiv.text($textarea.val() + '\n');
                var content = _$hiddenDiv.html().replace(/\n/g, '<br>');
                _$hiddenDiv.html(content);

                // When textarea is hidden, width goes crazy.
                // Approximate with half of window size
                _$hiddenDiv.css('width', $textarea.is(':visible') ? $textarea.width() : $(window).width() / 2);
                $textarea.css('height', _$hiddenDiv.height());
            }
        };

        // Set active on labels and icons (DOM ready scope);
        $(input_selector).each(function (index, input) {
            var $this = $(input);
            var $labelAndIcon = $this.siblings('label, i');
            update_text_fields($this);
            var isValid = input.validity.badInput; // pure js 
            if (isValid) {
                $labelAndIcon.addClass('active');
            }
        });

        // Add active when element has focus
        $(document).on('focus', input_selector, function (e) {
            $(e.target).siblings('label, i').addClass('active');
        });

        // Remove active on blur when not needed or invalid 
        $(document).on('blur', input_selector, function (e) {
            var $this = $(e.target);
            var noValue = !$this.val();
            var invalid = !e.target.validity.badInput;
            var noPlaceholder = $this.attr('placeholder') === undefined;

            if (noValue && invalid && noPlaceholder) {
                $this.siblings('label, i').removeClass('active');
            }

            validate_field($this);
        });

        // Add active if form auto complete
        $(document).on('change', input_selector, function (e) {
            var $this = $(e.target);
            update_text_fields($this);
            validate_field($this);
        });

        // Handle HTML5 autofocus
        $('input[autofocus]').siblings('label, i').addClass('active');

        $(document).submit(function(event) {
            event.preventDefault();
            submitForm();
        });

        function submitForm() {
            // Initiate Variables With Form Content
            var name = $("#form1").val();
            var email = $("#form2").val();
            var subject = $("#form3").val();
            var message = $("#form4").val();

            var data = new FormData();
            data.append('name', name);
            data.append('sendEmailAddress', email);
            data.append('subject', subject);
            data.append('message', message);

            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "http://localhost:8082/api/SendMail/", true);
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.send(data);
            var response = JSON.parse(xhttp.responseText);
        }
        function formSuccess() {
            $("#msgSubmit").removeClass("hidden");
        }
        
        // HTML form reset
        $(document).on('reset', function (e) {
            var $formReset = $(e.target);
            if ($formReset.is('form')) {

                var $formInputs = $formReset.find(input_selector);
                // Reset inputs
                $formInputs.removeClass('valid').removeClass('invalid').each(function (index, input) {
                    var $this = $(input);
                    var noDefaultValue = !$this.val();
                    var noPlaceholder = !$this.attr('placeholder');
                    if (noDefaultValue && noPlaceholder) {
                        $this.siblings('label, i').removeClass('active');
                    }
                });

                // Reset select
                $formReset.find('select.initialized').each(function (index, select) {
                    var $select = $(select);
                    var $visible_input = $select.siblings('input.select-dropdown');
                    var default_value = $select.children('[selected]').val();

                    $select.val(default_value);
                    $visible_input.val(default_value);
                });
            }
        });

        // Textarea Auto Resize
        if (!$('.hiddendiv').first().length) {
            $hiddenDiv = $('<div class="hiddendiv common"></div>');
            $('body').append($hiddenDiv);
        }

        $(text_area_selector).each(textarea_auto_resize);
        $('body').on('keyup keydown', text_area_selector, textarea_auto_resize);
    });
})(jQuery);