define(['jquery'], function ($) {
    $.fn.center = function () {
        this.css("position", "absolute");
        this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
        this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
        return this;
    };

    var origVal = $.fn.val;
    $.fn.val = function (v) {
        if (arguments.length == 1) {
            return origVal.call(this, v);
        }
        var value = origVal.call(this);
        if (value != '' && this.is("input[type=number]") && this.attr('data-isnumerictype') == 'true') {
            var parsed = parseFloatX(value);
            if (this.attr("data-iscurrencytype") == 'true') {
                return my_format_currency(parsed);
            }
            return parsed.toString().replace(".", $eSRO.decimalSeparator);
        }
        return value;
    }



    function getButton(element) {
        var response = { elem: element };
        if (!element.hasClass('button')) {
            var parent = element.parent();
            if (parent.hasClass('button'))
                response.elem = parent;
        }
        response.isButton = response.elem.is('button');
        response.a = response.isButton ? response.elem : response.elem.find("a");
        return response;
    }

    var buttonMethods = {
        disabled: function (disable, explains) {
            var btnObj = getButton(this);
            var buttonElement = btnObj.elem;
            if (disable === undefined)
                return buttonElement.hasClass('disabled');
            var a = btnObj.a;

            if (disable && !buttonElement.hasClass("disabled")) {
                buttonElement.addClass('disabled');
                buttonElement.bind('click', false);
                if (btnObj.isButton) {
                    buttonElement
                        .prop("disabled", true)
                        .EsroButton("setExplain", explains, "add");
                } else {
                    a.data("href", a.attr("href")).attr("href", "javascript:void(0)");
                }
                a.data("onclick", a.attr("onclick")).removeAttr("onclick");
                //buttonElement.attr('disabled', true);
            } else if (!disable && buttonElement.hasClass("disabled")) {
                buttonElement.removeClass('disabled');
                buttonElement.unbind('click', false);
                if (btnObj.isButton) {
                    buttonElement
                        .prop("disabled", false)
                        .EsroButton("setExplain", explains, "remove");
                } else {
                    var href = a.data("href");
                    if (href) {
                        a.attr("href", href).removeData("href");
                    }
                }
                var click = a.data("onclick");
                if (click) {
                    a.attr("onclick", click).removeData("onclick");
                }
                //buttonElement.removeAttr('disabled');
            }

            return buttonElement;
        },
        setWaitState: function (isOn) {
            var btnObj = getButton(this);
            btnObj.elem.EsroButton("disabled", isOn).toggleClass('ajax-refreshing', isOn);
            return btnObj.elem;
        },
        setTarget: function (target) {
            var btnObj = getButton(this);
            if (btnObj.elem.hasClass("disabled")) {
                if (btnObj.a.data("href")) {
                    btnObj.a.data("href", target);
                }
                if (btnObj.a.data("onclick")) {
                    btnObj.a.data("onclick", target);
                }

            }
            else {
                if (btnObj.isButton) {
                    btnObj.elem.attr("onclick", target);
                }
                else {
                    btnObj.a.attr("href", target);
                }
            }
            return btnObj.elem;
        },
        setText: function (text) {
            var btnObj = getButton(this);
            btnObj.a.text(text);
            return btnObj.elem;
        },
        setExplain: function (explains, operation) { //explains = [{"id": "rsrcSelectDelivary","text": rsrcSelectDelivary,scrollTo: ".deliveryContainer .containerTitle"}];
            var btnObj = getButton(this);
            var btn = btnObj.a;

            if (explains === undefined || explains.length == 0 || operation === undefined) {
                return btnObj.elem;
            }

            var buttonId = btn.attr('id') || '';
            buttonExplainClass = "buttonExplain " + buttonId;
            var currentExplains = btn.prevAll(".buttonExplain." + buttonId);


            for (i = 0; i < explains.length; i++) {
                var explain = explains[i];

                var sameExplain = currentExplains.filter('[data-' + explain.id + ']');

                if (operation == "add") {
                    if (sameExplain.length == 0) {

                        if ($(explain.scrollTo).length == 0) {
                            btn.before("<div class='" + buttonExplainClass + "' data-" + explain.id + " style='width:" + btn.css('width') + ";' tabindex='0'>" + explain.text + "</div>");
                        }
                        else {
                            var explainBtn = $("<div role='button' class='" + buttonExplainClass + " button' data-" + explain.id + " data-scrollTo='" + explain.scrollTo + "' style='width:" + btn.css('width') + ";' tabindex='0'>" + explain.text + "</div>");
                            explainBtn.on('click keydown', function (e) {
                            	if (e.which == 1 || e.which == 0 || e.which == 13) {
                            		var scrollTo = $($(this).attr('data-scrollTo'))

                            		$('body').scrollTo(scrollTo.position().top, {
                            			complete: function () {
                            				scrollTo.addClass('pulse');
                            				if (e.which == 13) {
                            					//scrollTo.nextAll().find(':tabbable').first().trigger('focus');
                            					scrollTo.attr('tabindex', '0').trigger('focus');
                            				}
                            				window.setTimeout(function () {
                            					scrollTo.removeClass('pulse');
                            					scrollTo.removeAttr('tabindex');
                            				}, 1000);
                            			}
                            		});
                            	}
                            });

                            btn.before(explainBtn);
                        }
                    }
                }
                else if (operation == "remove") {
                    if (sameExplain.length > 0) {
                        sameExplain.remove();
                    }
                }
            }

            return btnObj.elem;
        },
        clearExplain: function () {
            var btnObj = getButton(this);
            btnObj.a.prevAll(".buttonExplain").remove();
            return btnObj.elem;
        }
    };

    $.fn.EsroButton = function (method) {
        if (buttonMethods[method]) {
            return buttonMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.EsroButton');
            return null;
        }
    }

    $.fn.numericSpinner = function (options) {
        return this.each(function () {
            var me = $(this), lastCount;
            if (!me.hasClass("numericSpinner")) {
                me.addClass("numericSpinner");
            }
            me.spinner(options);
            me.bind("keydown", function (e) {
                switch (e.keyCode) {
                    case 8: case 9: case 35: case 36: case 37: case 39: case 45: case 46:
                        break;
                    default:
                        if (!(e.keyCode >= 48 && e.keyCode <= 57) &&
                        !(e.keyCode >= 96 && e.keyCode <= 105)
                    ) {
                            e.preventDefault();
                            return;
                        }
                }
                var target = $(e.target);
                if (target.val() != "") {
                    if (!valueIsValid(target)) {
                        e.preventDefault();
                        return;
                    } else {
                        lastCount = target.val();
                    }
                }
            });
            me.bind("keyup", function (e) {
                var target = $(e.target);
                if (target.val() != "" && !valueIsValid(target)) {
                    target.val(lastCount);
                }
            });
            me.bind("blur", function (e) {
                if ($(e.target).val() == "") {
                    $(e.target).val(0 /*lastCount*/);
                }
            });
            function valueIsValid(input) {
                var val = parseInt(input.val(), 10);
                var min = input.spinner("option", "min"),
                    max = input.spinner("option", "max");
                return !(isNaN(val)
                    || val < (min != undefined ? min : 0)
                    || val > (max != undefined ? max : Number.MAX_VALUE)
                );
            }
        });
    }

    function update(oOld, oNew) {
        for (var m in oNew) {
            if (oNew[m] === null) {
                delete oOld[m];
            } else {
                oOld[m] = oNew[m];
            }
        }
        return oOld;
    }

    var searchMethods = {
        queryParams: function (param) {
            var params = searchMethods.parseQueryParams(document.location.search);
            if (param == undefined)
                return params;
            else
                return params[param];
        },
        parseQueryParams: function (query) {
            var params = new Object();
            if (query.length > 0) {
                if (query.substr(0, 1) == "?") query = query.substr(1);
                var a = query.split('&');
                for (var i = 0; i < a.length; i++) {
                    var e = a[i].split('=', 2);
                    params[e[0]] = (e.length == 2 ? decodeURIComponent(e[1].replace("+", " ")) : undefined);
                }
            }
            return params;
        },
        search: function (param) {
            if (param == undefined)
                return document.location.search;
            else {
                document.location.search = "?" + $.param(param);
                return undefined;
            }
        },
        extendQuery: function (/* [query or url], param */) {
            var param, query, path = "", i;
            if (arguments.length == 1) {
                param = arguments[0];
                query = searchMethods.queryParams();
            } else if (arguments.length == 2) {
                param = arguments[1];
                query = arguments[0];
                if ((i = query.indexOf("?")) > 0) {
                    path = query.substr(0, i);
                    query = query.substr(i + 1);
                } else if (query.substr(0, 5).toLowerCase() == "http:" || query.substr(0, 6).toLowerCase() == "https:") {
                    path = query;
                    query = "";
                }
                query = searchMethods.parseQueryParams(query);
            }
            var r = searchMethods.serializeParams(update(query, param));
            return r.length > 0 ? path + "?" + r : path;
        },
        serializeParams: function (params) {
            var s = [];
            for (var name in params) {
                s[s.length] = encodeURIComponent(name) + (params[name] === undefined ? "" : "=" + encodeURIComponent(params[name]));
            }
            return s.join("&").replace(/%20/g, "+");
        }
    };
    $.fn.location = function (method) {
        if (searchMethods[method]) {
            return searchMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            //} else if (typeof method === 'object' || !method) {
            //    return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.location');
            return null;
        }
    };

    $.fn.extend({
        fadeInOut: function (options) {
            var opts = $.extend({}, { duration: 'slow', callback: null }, options || {});
            $(this).fadeOut(opts.duration, function () { $(this).fadeIn(opts.duration, function () { if (opts.callback != null) { opts.callback.call(this); } }); });
        },
        blinkMe: function (options) {
            var opts = $.extend({}, { count: 1, duration: 'slow' }, options || {});
            var me = $(this);
            if (!me.is(":visible"))
                return;
            var fn = function () {
                opts.count--;
                if (opts.count == 0)
                    return;
                me.fadeInOut({ duration: opts.duration, callback: fn });
            };
            me.fadeInOut({ duration: opts.duration, callback: fn });
        }
    });

    $.fn.extend({
        scrollTo: function (itemTo, options) {
            var opts = $.extend({}, { duration: 1200, complete: null, nomobile: false }, options || {});

            var scrollTo = 0;
            if (!isNaN(itemTo)) {
                scrollTo = itemTo;
            }
            else {
                var findItem = typeof itemTo == 'string'
                    ? $(itemTo)
                    : itemTo;
                if (findItem.length == 0 || typeof findItem.offset == 'undefined') return false;
                scrollTo = parseInt(findItem.position().top);
            }


            var scrollItem;

            //Fix known issue in IE: Jquery animate function don't scroll on 'body' but on 'html'
            if (this.is('body') && !this.is('html')) {
                scrollItem = $(this).add('html');
            }
            else if (this.is('html') && !this.is('body')) {
                scrollItem = $(this).add('body');
            }
            else {
                scrollItem = $(this);
            }

            scrollItem.animate({ scrollTop: scrollTo }, opts.duration, opts.complete);
            return true;
        }
    });

    $.fn.extend({
        toggleDisabled: function (isDisabled) {
            var me = $(this);
            me.prop("disabled", isDisabled);
            if (me.is("a")) {
                if (isDisabled) {
                    me.data("href", me.attr("href"));
                    me.removeAttr("href");
                } else if (me.data("href")) {
                    me.attr("href", me.data("href"));
                }
            }

            return me;
        }
    });

    var data = [];
    var customPropMethods = {
        add: function (obj) {
            data.push(obj);
        },
        get: function (name) {
            var res;
            if (this.length == 0)
                return res;
            var me = $(this[0]);
            for (var i = 0; i < data.length; i++) {
                for (selector in data[i]) {
                    if (me.is(selector))
                        if (name == undefined) {
                            $.extend(res, data[i][selector]);
                        }
                        else {
                            res = data[i][selector][name];
                        }
                }
            }
            return res;
        }
    };

    $.fn.customProperties = function (method) {
        if (customPropMethods[method]) {
            return customPropMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.customProperties');
            return null;
        }
    }

    var valueFilter = function (val) { return function (i, e) { return $(e).val() == val }; };
    var fieldMethods = {
        value: function (val) {
            var e;
            if (this.is("select")) {
                e = $("option", this);
                if (val == undefined) {
                    return e.filter("[selected]").val();
                } else {
                    e.filter(valueFilter(val)).attr("selected", "selected");
                }
            } else if (this.is("input[type=radio]")) {
                e = $("input[type=radio]").filter(function (i, e) { return $(e).attr("name") == this.attr("name"); });
                if (val == undefined) {
                    return e.filter(":checked").val()
                } else {
                    e.filter(valueFilter(val)).prop("checked", true);
                }
            } else if (this.is("input[type=checkbox]")) {
                if (val == undefined) {
                    return this.is(":checked");
                } else {
                    this.prop("checked", val);
                }
            }
            else {
                if (val == undefined) {
                    return this.val();
                } else {
                    this.val(val);
                }
            }
        },
        text: function (value, options) {
            var me = $(this),
            textElement;
            if (typeof (value) == "object") {
                options = value;
                value = undefined;
            }
            options = options || {};
            if (me.is("select")) {
                return (value === undefined ?
                 $("option:selected", me) :
                 $("option", me).filter(valueFilter(value))
                 ).text().trim();
            } else if (me.is("input[type=radio]")) {
                var options = $("input").filter(function (i, e) { return $(e).attr("name") == me.attr("name"); })
                return (value === undefined ?
                 options.filter(":checked") :
                 options.filter(valueFilter(value))
                 ).text().trim();

            } else if (me.is("input[type=checkbox]")) {
                return (value == undefined ? me.is(":checked") : value.toLowerCase() == "true") ?
                options["yes"] || "yes" :
                options["no"] || "no";
            }
            else {
                return (value == undefined ? me.val() || "" : value).trim();
            }
        }
    }
    $.fn.field = function (method) {
        if (fieldMethods[method]) {
            return fieldMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.field');
            return null;
        }
    }

    $.fn.transformControl = function () {
        var e = $(this);
        var transformControl = e.customProperties("get", "transform-control");
        if (transformControl == undefined)
            return e;
        var delegate = $.fn[transformControl.type];

        if (transformControl.type == "spinner") {
            e.numericSpinner(transformControl.options);
            e.spinner("option", "change", function () {
                return e.change();
            });
            e.spinner("option", "stop", function () {
                //Fix bug: NVDA not read the current value
                if (e.attr('aria-label') == null || e.attr('aria-label') == undefined || e.attr('aria-label') == e.attr('data-last-aria-label')) {
                    e.attr('data-last-aria-label', e.attr('aria-valuenow'));
                    e.attr('aria-label', e.attr('aria-valuenow'));
                }

                return e.change();
            });
        } else {
            delegate.call(e, transformControl.options);
        }
        e.data("widgetDelegate", function () {
            delegate.apply(e, arguments);
        });
        return e;
    }
    $.fn.setDisabled = function (disabled) {
        var me = $(this);
        var widgetDelegate = me.data("widgetDelegate");
        if (widgetDelegate != undefined) {
            widgetDelegate(disabled ? "disable" : "enable");
        }
        me.attr("disabled", disabled);
    }
    $.fn.any = function (fn) {
        for (var i = 0; i < this.length; i++) {
            if (fn.call(this[i], i, this[i])) { return true; }
        }
        return false;
    }
    $.fn.hideIfEmpty = function () {
        if (this.html().trim() == '') {
            this.hide();
        }
        else {
            this.show();
        }
        return this;
    }
    $.fn.emptyWhen = function (condition) {
        if (condition)
            this.empty();
        return this;
    }
    $.fn.extend({
        appendWhen: function (objToAppend, ifExpression) {
            var me = $(this);
            if (ifExpression)
                me.append(objToAppend);
            return me;
        },
        attrWhen: function (attrToSet, ifExpression) {
            var me = $(this);
            if (ifExpression)
                me.attr(attrToSet);
            return me;
        }
    });

    $.fn.extend({
        show: (function (orig) {
            return function () {
                $(this).trigger("beforeShow");
                return orig.apply(this, arguments);
            }
        })($.fn.show)
    });

    //-----------------------------------

    function Color(r, g, b, a) {
        this.R = r && parseInt(r);
        this.G = g && parseInt(g);
        this.B = b && parseInt(b);
        this.A = a && parseFloat(a);
    }
    Color.prototype.toRGB = function () {
        return toHEX(this.R) + toHEX(this.G) + toHEX(this.B);
        function toHEX(n) {
            var s = n.toString(16);
            if (s.length == 1) s = "0" + s;
            return s;
        }
    }
    Color.prototype.getOpacity = function () {
        return this.A;
    }

    var colorRegex;
    $.fn.color = function (propertyName) {
        var color = $(this).css(propertyName);
        if (!color) {
            return;
        }
        if (!colorRegex) {
            colorRegex = /^rgb(?:a)?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)$/i;
        }
        var m = color.match(colorRegex);
        if (m) {
            return new Color(m[1], m[2], m[3], m[4]===undefined ? 1 : m[4]);
        }
        else {
            throw new Error("Color could not be parsed.");
            //TODO: load a color library and try it
        }
    }
});