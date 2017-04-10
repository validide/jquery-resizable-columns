/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Mon Apr 10 2017 19:59:43 GMT+0300 (GTB Summer Time)
 * @version v0.2.3
 * @link http://dobtco.github.io/jquery-resizable-columns/
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _constants = require('./constants');

$.fn.resizableColumns = function (optionsOrMethod) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	return this.each(function () {
		var $table = $(this);

		var api = $table.data(_constants.DATA_API);
		if (!api) {
			api = new _class2['default']($table, optionsOrMethod);
			$table.data(_constants.DATA_API, api);
		} else if (typeof optionsOrMethod === 'string') {
			var _api;

			return (_api = api)[optionsOrMethod].apply(_api, args);
		}
	});
};

$.resizableColumns = _class2['default'];

},{"./class":2,"./constants":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./constants');

/**
Takes a <table /> element and makes it's columns resizable across both
mobile and desktop clients.

@class ResizableColumns
@param $table {jQuery} jQuery-wrapped <table> element to make resizable
@param options {Object} Configuration object
**/

var ResizableColumns = (function () {
	function ResizableColumns($table, options) {
		_classCallCheck(this, ResizableColumns);

		this.ns = '.rc' + this.count++;

		this.options = $.extend({}, ResizableColumns.defaults, options);

		this.$window = $(window);
		this.$ownerDocument = $($table.get(0).ownerDocument);
		this.$table = $table;
		this.$tableWrapper = null;
		this.lastPointerDown = null;
		this.isDoubleClick = false;

		this.wrapTable();
		this.refreshHeaders();
		this.restoreColumnWidths();
		this.checkTableWidth();
		this.syncHandleWidths();

		this.bindEvents(this.$window, 'resize', this.checkTableWidth.bind(this));
		this.bindEvents(this.$window, 'resize', this.syncHandleWidths.bind(this));

		if (this.options.start) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_START, this.options.start);
		}
		if (this.options.resize) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE, this.options.resize);
		}
		if (this.options.stop) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_STOP, this.options.stop);
		}
	}

	/**
 Wrap the table DOMElement in a div
 
 @private
 @method refreshHeaders
 **/

	_createClass(ResizableColumns, [{
		key: 'wrapTable',
		value: function wrapTable() {
			if (!this.shouldWrap()) {
				return;
			}

			this.$tableWrapper = this.$table.wrap('<div class="' + _constants.CLASS_TABLE_WRAPPER + '"></div>').width(this.$table.innerWidth()).parent();
		}

		/**
  Refreshes the headers associated with this instances <table/> element and
  generates handles for them. Also assigns widths.
  
  @method refreshHeaders
  **/
	}, {
		key: 'refreshHeaders',
		value: function refreshHeaders() {
			// Allow the selector to be both a regular selctor string as well as
			// a dynamic callback
			var selector = this.options.selector;
			if (typeof selector === 'function') {
				selector = selector.call(this, this.$table);
			}

			// Select all table headers
			this.$tableHeaders = this.$table.find(selector);

			// Assign widths first, then create drag handles
			if (this.options.absoluteWidths) {
				this.assignAbsoluteWidths();
			} else {
				this.assignPercentageWidths();
			}
			this.createHandles();
		}

		/**
  Creates dummy handle elements for all table header columns
  
  @method createHandles
  **/
	}, {
		key: 'createHandles',
		value: function createHandles() {
			var _this = this;

			var ref = this.$handleContainer;
			if (ref != null) {
				ref.remove();
			}

			this.$handleContainer = $('<div class=\'' + _constants.CLASS_HANDLE_CONTAINER + '\' />');
			if (this.options.absoluteWidths) {
				this.$handleContainer.addClass(_constants.CLASS_ABSOLUTE);
			}
			this.$table.before(this.$handleContainer);

			this.$tableHeaders.each(function (i, el) {
				var $current = _this.$tableHeaders.eq(i);
				var $next = _this.$tableHeaders.eq(i + 1);

				if (_this.options.absoluteWidths) {
					if ($current.is(_constants.SELECTOR_UNRESIZABLE)) {
						return;
					}
				} else {
					if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
						return;
					}
				}

				var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').appendTo(_this.$handleContainer);
			});

			this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
		}

		/**
  Assigns a absolute width to all columns based on their current width(s)
  
  @private
  @method assignAbsoluteWidths
  **/
	}, {
		key: 'assignAbsoluteWidths',
		value: function assignAbsoluteWidths() {
			var _this2 = this;

			this.$tableHeaders.each(function (_, el) {
				// do not assign width if the column is not resizable
				if (el.hasAttribute(_constants.ATTRIBUTE_UNRESIZABLE)) return;

				var $el = $(el),
				    tableWidth = _this2.$table.width(),
				    paddingLeft = ResizableColumns.parsePixelString($el.css('paddingLeft')),
				    paddingRight = ResizableColumns.parsePixelString($el.css('paddingRight')),
				    width = $el.outerWidth() - paddingLeft - paddingRight;

				$el.data(_constants.DATA_CSS_MIN_WIDTH, 0);
				$el.data(_constants.DATA_CSS_MAX_WIDTH, tableWidth);

				var minWidth = _this2.computeMinCssWidths($el);
				if (minWidth != null) {
					$el.data(_constants.DATA_CSS_MIN_WIDTH, minWidth);
					width = Math.max(minWidth, width);
				}

				var maxWidth = _this2.computeMaxCssWidths($el);
				if (maxWidth != null) {
					$el.data(_constants.DATA_CSS_MAX_WIDTH, maxWidth);
					width = Math.min(maxWidth, width);
				}

				_this2.setWidth($el.get(0), width);
			});
		}

		/**
  Parse the value of a string by removing 'px'
  
  @private
  @method parsePixelString
  @param value {String}
  @return {Number} Parsed value or 0
  **/
	}, {
		key: 'assignPercentageWidths',

		/**
  Assigns a percentage width to all columns based on their current pixel width(s)
  
  @private
  @method assignPercentageWidths
  **/
		value: function assignPercentageWidths() {
			var _this3 = this;

			this.$tableHeaders.each(function (_, el) {
				// do not assign width if the column is not resizable
				if (el.hasAttribute(_constants.ATTRIBUTE_UNRESIZABLE)) return;

				var $el = $(el),
				    width = $el.outerWidth() / _this3.$table.width() * 100;

				$el.data(_constants.DATA_CSS_MIN_WIDTH, 0);
				$el.data(_constants.DATA_CSS_MAX_WIDTH, 100);

				var minWidth = _this3.computeMinCssWidths($el);
				if (minWidth != null) {
					$el.data(_constants.DATA_CSS_MIN_WIDTH, minWidth);
					width = Math.max(minWidth, width);
				}

				var maxWidth = _this3.computeMaxCssWidths($el);
				if (maxWidth != null) {
					$el.data(_constants.DATA_CSS_MAX_WIDTH, maxWidth);
					width = Math.min(maxWidth, width);
				}

				_this3.setWidth($el.get(0), width);
			});
		}

		/**
  Compute the minimum width taking into account CSS
  
  @private
  @method computeMinCssWidths
  @param $el {jQuery} jQuery-wrapped DOMElement for which we compute the minimum width
  **/
	}, {
		key: 'computeMinCssWidths',
		value: function computeMinCssWidths($el) {
			var el = undefined,
			    minWidth = undefined;
			minWidth = null;
			el = $el.get(0);
			if (this.options.obeyCssMinWidth) {
				if (el.style.minWidth.slice(-2) === 'px') {
					minWidth = parseFloat(el.style.minWidth);
					if (!this.options.absoluteWidths) {
						minWidth = minWidth / this.$table.width() * 100;
					}
				} else {
					minWidth = parseFloat(el.style.minWidth);
				}
				if (isNaN(minWidth)) {
					minWidth = null;
				}
			}
			return minWidth;
		}

		/**
  Compute the maximum width taking into account CSS
  
  @private
  @method computeMaxCssWidths
  @param $el {jQuery} jQuery-wrapped DOMElement for which we compute the maximum width
  **/
	}, {
		key: 'computeMaxCssWidths',
		value: function computeMaxCssWidths($el) {
			var el = undefined,
			    maxWidth = undefined;
			maxWidth = null;
			el = $el.get(0);
			if (this.options.obeyCssMaxWidth) {
				if (el.style.maxWidth.slice(-2) === 'px') {
					maxWidth = parseFloat(el.style.maxWidth);
					if (!this.options.absoluteWidths) {
						maxWidth = maxWidth / this.$table.width() * 100;
					}
				} else {
					maxWidth = parseFloat(el.style.maxWidth);
				}
				if (isNaN(maxWidth)) {
					maxWidth = null;
				}
			}
			return maxWidth;
		}

		/**
  
  
  @method checkTableWidth
  **/
	}, {
		key: 'checkTableWidth',
		value: function checkTableWidth() {
			if (this.options.absoluteWidths) {
				this.checkTableWidthAbsolute();
			}
		}

		/**
  
  @private
  @method checkTableWidthAbsolute
  **/
	}, {
		key: 'checkTableWidthAbsolute',
		value: function checkTableWidthAbsolute() {
			var _this4 = this;

			if (!this.shouldWrap()) {
				return;
			}

			var wrappperWidth = this.$tableWrapper.innerWidth();
			var tableWidth = this.$table.outerWidth(true);
			var difference = wrappperWidth - tableWidth;
			if (difference > 0) {
				(function () {
					var $headers = _this4.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE);
					var totalWidth = 0;
					var addedWidth = 0;
					var widths = [];
					$headers.each(function (i, hd) {
						var width = _this4.parseWidth(hd);
						widths.push(width);
						totalWidth += width;
					});

					_this4.setWidth(_this4.$table[0], wrappperWidth);
					$headers.each(function (j, col) {
						var currentWidth = widths.shift();
						var newWidth = currentWidth + currentWidth / totalWidth * difference;
						var leftToAdd = totalWidth + difference - addedWidth;
						_this4.setWidth(col, Math.min(newWidth, leftToAdd));
						addedWidth += newWidth;
						if (addedWidth >= totalWidth) return false;
					});
				})();
			}
		}

		/**
  
  
  @method syncHandleWidths
  **/
	}, {
		key: 'syncHandleWidths',
		value: function syncHandleWidths() {
			if (this.options.absoluteWidths) {
				this.syncHandleWidthsAbsolute();
			} else {
				this.syncHandleWidthsPercentage();
			}
		}

		/**
  
  
  @private
  @method syncHandleWidthsAbsolute
  **/
	}, {
		key: 'syncHandleWidthsAbsolute',
		value: function syncHandleWidthsAbsolute() {
			var _this5 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width()).css('minWidth', this.totalColumnWidthsAbsolute());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this5.options.resizeFromBody ? _this5.$table.height() : _this5.$table.find('thead').height();

				var $th = _this5.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE).eq(_);

				var left = $th.outerWidth();
				left -= ResizableColumns.parsePixelString($el.css('paddingLeft'));
				left -= ResizableColumns.parsePixelString($el.css('paddingRight'));
				left += $th.offset().left;
				left -= _this5.$handleContainer.offset().left;

				$el.css({ left: left, height: height });
			});
		}

		/**
  
  
  @private
  @method syncHandleWidthsPercentage
  **/
	}, {
		key: 'syncHandleWidthsPercentage',
		value: function syncHandleWidthsPercentage() {
			var _this6 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this6.options.resizeFromBody ? _this6.$table.height() : _this6.$table.find('thead').height();

				var $th = _this6.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE).eq(_);

				var left = $th.outerWidth() + ($th.offset().left - _this6.$handleContainer.offset().left);

				$el.css({ left: left, height: height });
			});
		}

		/**
  
  
  @method totalColumnWidths
  **/
	}, {
		key: 'totalColumnWidths',
		value: function totalColumnWidths() {
			return this.options.absoluteWidths ? this.totalColumnWidthsAbsolute() : this.totalColumnWidthsPercentage();
		}

		/**
  
  
  @private
  @method totalColumnWidthsAbsolute
  **/
	}, {
		key: 'totalColumnWidthsAbsolute',
		value: function totalColumnWidthsAbsolute() {
			var total = 0;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);
				total += ResizableColumns.parsePixelString($el.width());
				total += ResizableColumns.parsePixelString($el.css('paddingLeft'));
				total += ResizableColumns.parsePixelString($el.css('paddingRight'));
			});

			return total;
		}

		/**
  
  
  @private
  @method totalColumnWidthsPercentage
  **/
	}, {
		key: 'totalColumnWidthsPercentage',
		value: function totalColumnWidthsPercentage() {
			var _this7 = this;

			//should be 100% :D
			var total = 0;

			this.$tableHeaders.each(function (_, el) {
				total += _this7.parseWidth(el);
			});

			return total;
		}

		/**
  Persists the column widths in localStorage
  
  @method saveColumnWidths
  **/
	}, {
		key: 'saveColumnWidths',
		value: function saveColumnWidths() {
			var _this8 = this;

			if (!this.options.store) return;

			this.options.store.set(this.generateTableAbsoluteWidthsId(), this.options.absoluteWidths + '');

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (!$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					_this8.options.store.set(_this8.generateColumnId($el), _this8.parseWidth(el));
				}
			});
		}

		/**
  Retrieves and sets the column widths from localStorage
  
  @method restoreColumnWidths
  **/
	}, {
		key: 'restoreColumnWidths',
		value: function restoreColumnWidths() {
			var _this9 = this;

			if (!this.options.store) return;

			if (this.options.store.get(this.generateTableAbsoluteWidthsId()) !== this.options.absoluteWidths + '') return;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (!$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					var width = _this9.options.store.get(_this9.generateColumnId($el));

					if (width != null) {
						_this9.setWidth(el, width);
					}
				}
			});
		}

		/**
  
  
  @method refreshWrapperStyle
  **/
	}, {
		key: 'refreshWrapperStyle',
		value: function refreshWrapperStyle() {
			if (this.$tableWrapper == null) return;

			var originalStyle = this.$tableWrapper.attr('style');
			this.$tableWrapper.css('overflow-x', 'hidden;').attr('style', originalStyle);
		}

		/**
  Pointer/mouse down handler
  
  @method onPointerDown
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerDown',
		value: function onPointerDown(event) {
			// Only applies to left-click dragging
			if (event.which !== 1) {
				return;
			}

			// If a previous operation is defined, we missed the last mouseup.
			// Probably gobbled up by user mousing out the window then releasing.
			// We'll simulate a pointerup here prior to it
			if (this.operation) {
				this.onPointerUp(event);
			}

			// Ignore non-resizable columns
			var $currentGrip = $(event.currentTarget);
			if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
				return;
			}

			this.isDoubleClick = this.lastPointerDown != null && new Date() - this.lastPointerDown < this.options.doubleClickDelay;
			this.lastPointerDown = new Date();
			var gripIndex = $currentGrip.index();
			var $leftColumn = this.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE).eq(gripIndex);
			var $rightColumn = this.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE).eq(gripIndex + 1);

			var leftWidth = this.parseWidth($leftColumn.get(0));
			var rightWidth = this.parseWidth($rightColumn.get(0));
			var tableWidth = this.parseWidth(this.$table.get(0));

			this.operation = {
				$leftColumn: $leftColumn, $rightColumn: $rightColumn, $currentGrip: $currentGrip,

				startX: this.getPointerX(event),

				widths: {
					left: leftWidth,
					right: rightWidth,
					table: tableWidth
				},
				newWidths: {
					left: leftWidth,
					right: rightWidth,
					table: tableWidth
				}
			};

			this.bindEvents(this.$ownerDocument, ['mousemove', 'touchmove'], this.onPointerMove.bind(this));
			this.bindEvents(this.$ownerDocument, ['mouseup', 'touchend'], this.onPointerUp.bind(this));

			this.$handleContainer.add(this.$table).addClass(_constants.CLASS_TABLE_RESIZING);

			$leftColumn.add($rightColumn).add($currentGrip).addClass(_constants.CLASS_COLUMN_RESIZING);

			this.triggerEvent(_constants.EVENT_RESIZE_START, [$leftColumn, $rightColumn, leftWidth, rightWidth], event);

			event.preventDefault();
		}

		/**
  Pointer/mouse double click
  
  @method onDoubleClick
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onDoubleClick',
		value: function onDoubleClick(event) {
			var _this10 = this;

			if (!this.operation) return;

			var $currentGrip = this.operation.$currentGrip;
			if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
				return;
			}

			var gripIndex = $currentGrip.index();
			var $leftColumn = this.$tableHeaders.not(_constants.SELECTOR_UNRESIZABLE).eq(gripIndex);
			var left = $leftColumn.get(0);
			if (!left) {
				return;
			}

			var maxWidth = 0;
			var indecesToSkyp = [];
			this.$tableHeaders.each(function (idx, th) {
				if ($(th).is(_constants.SELECTOR_UNRESIZABLE)) {
					indecesToSkyp.push(idx);
				}
			});
			var $fakeEl = $('<span>').css({
				'position': 'absolute',
				'visibility': 'hidden',
				'left': '-99999px',
				'top': '-99999px'
			});
			$('body').append($fakeEl);
			this.$table.find('tr').each(function (iTr, tr) {
				var pos = 0;
				$(tr).find('td, th').each(function (iCol, col) {
					if (indecesToSkyp.indexOf(iCol) !== -1) {
						return; // skyp over not resizable columns
					}
					var $col = $(col);
					if (pos === gripIndex) {
						maxWidth = Math.max(maxWidth, _this10.getTextWidth($col, $fakeEl));
						return false;
					}
					pos += $col.prop('colspan') || 1;
				});
			});
			$fakeEl.remove();
			if (this.options.absoluteWidths) {
				var tableWidth = this.parseWidth(this.$table[0]);
				var leftWidth = this.parseWidth(left);
				this.setWidth(this.$table[0], tableWidth + maxWidth - leftWidth);
			} else {
				maxWidth = maxWidth / this.$table.width() * 100;
			}
			this.setWidth(left, maxWidth);
		}

		/**
  Pointer/mouse movement handler
  
  @method onPointerMove
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerMove',
		value: function onPointerMove(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			// Determine the delta change between start and new mouse position, as a percentage of the table width
			var difference = this.getPointerX(event) - op.startX;
			if (!this.options.absoluteWidths) {
				difference = difference / this.$table.width() * 100;
			}

			if (difference === 0) {
				return;
			}

			var leftColumn = op.$leftColumn.get(0);
			var rightColumn = op.$rightColumn.get(0);
			var table = this.$table.get(0);
			var widthLeft = undefined,
			    widthRight = undefined,
			    tableWidth = undefined;

			if (this.options.absoluteWidths) {
				tableWidth = op.widths.table + difference;
				widthLeft = this.constrainWidth(op.$leftColumn, op.widths.left + difference);
				widthRight = op.widths.right; //Keep right column unchanged when increasing the table size
			} else {
					tableWidth = 100;
					if (difference < 0) {
						widthLeft = this.constrainWidth(op.$leftColumn, op.widths.left + difference);
						widthRight = this.constrainWidth(op.$rightColumn, op.widths.right + (op.widths.left - op.newWidths.left));
					} else if (difference > 0) {
						widthLeft = this.constrainWidth(op.$leftColumn, op.widths.left + (op.widths.right - op.newWidths.right));
						widthRight = this.constrainWidth(op.$rightColumn, op.widths.right - difference);
					}
				}

			if (table) {
				if (this.options.absoluteWidths) {
					this.setWidth(table, tableWidth);
				}
			}

			if (leftColumn) {
				this.setWidth(leftColumn, widthLeft);
			}
			if (rightColumn) {
				this.setWidth(rightColumn, widthRight);
			}

			op.newWidths.left = widthLeft;
			op.newWidths.right = widthRight;
			op.newWidths.table = tableWidth;

			return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
		}

		/**
  Pointer/mouse release handler
  
  @method onPointerUp
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerUp',
		value: function onPointerUp(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

			if (this.isDoubleClick) {
				this.onDoubleClick(event);
			}

			this.$handleContainer.add(this.$table).removeClass(_constants.CLASS_TABLE_RESIZING);

			op.$leftColumn.add(op.$rightColumn).add(op.$currentGrip).removeClass(_constants.CLASS_COLUMN_RESIZING);

			this.checkTableWidth();
			this.syncHandleWidths();
			this.refreshWrapperStyle();
			this.saveColumnWidths();

			this.operation = null;

			return this.triggerEvent(_constants.EVENT_RESIZE_STOP, [op.$leftColumn, op.$rightColumn, op.newWidths.left, op.newWidths.right], event);
		}

		/**
  Removes all event listeners, data, and added DOM elements. Takes
  the <table/> element back to how it was, and returns it
  
  @method destroy
  @return {jQuery} Original jQuery-wrapped <table> element
  **/
	}, {
		key: 'destroy',
		value: function destroy() {
			var $table = this.$table;
			var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

			this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

			$table.removeData(_constants.DATA_API);

			this.$handleContainer.remove();
			if (this.$tableWrapper != null) {
				this.$table.insertBefore(this.$tableWrapper);
				this.$tableWrapper.remove();
			}
			this.$handleContainer = null;
			this.$tableWrapper = null;
			this.$tableHeaders = null;
			this.$table = null;

			return $table;
		}

		/**
  Binds given events for this instance to the given target DOMElement
  
  @private
  @method bindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to bind events to
  @param events {String|Array} Event name (or array of) to bind
  @param selectorOrCallback {String|Function} Selector string or callback
  @param [callback] {Function} Callback method
  **/
	}, {
		key: 'bindEvents',
		value: function bindEvents($target, events, selectorOrCallback, callback) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else {
				events = events.join(this.ns + ' ') + this.ns;
			}

			if (arguments.length > 3) {
				$target.on(events, selectorOrCallback, callback);
			} else {
				$target.on(events, selectorOrCallback);
			}
		}

		/**
  Unbinds events specific to this instance from the given target DOMElement
  
  @private
  @method unbindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to unbind events from
  @param events {String|Array} Event name (or array of) to unbind
  **/
	}, {
		key: 'unbindEvents',
		value: function unbindEvents($target, events) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else if (events != null) {
				events = events.join(this.ns + ' ') + this.ns;
			} else {
				events = this.ns;
			}

			$target.off(events);
		}

		/**
  Triggers an event on the <table/> element for a given type with given
  arguments, also setting and allowing access to the originalEvent if
  given. Returns the result of the triggered event.
  
  @private
  @method triggerEvent
  @param type {String} Event name
  @param args {Array} Array of arguments to pass through
  @param [originalEvent] If given, is set on the event object
  @return {Mixed} Result of the event trigger action
  **/
	}, {
		key: 'triggerEvent',
		value: function triggerEvent(type, args, originalEvent) {
			var event = $.Event(type);
			if (event.originalEvent) {
				event.originalEvent = $.extend({}, originalEvent);
			}

			return this.$table.trigger(event, [this].concat(args || []));
		}

		/**
  Calculates a unique column ID for a given column DOMElement
  
  @private
  @method generateColumnId
  @param $el {jQuery} jQuery-wrapped column element
  @return {String} Column ID
  **/
	}, {
		key: 'generateColumnId',
		value: function generateColumnId($el) {
			return this.generateTableId() + '-' + $el.data(_constants.DATA_COLUMN_ID).replace(/\./g, '_');
		}

		/**
  Calculates a unique ID for a table's (DOMElement) 'absoluteWidths' option
  
  @private
  @method generateTableAbsoluteWidthsId
  @return {String} ID
  **/
	}, {
		key: 'generateTableAbsoluteWidthsId',
		value: function generateTableAbsoluteWidthsId() {
			return this.$table.data(_constants.DATA_COLUMNS_ID).replace(/\./g, '_') + '--absolute-widths';
		}

		/**
  Calculates a unique ID for a given table DOMElement
  
  @private
  @method generateTableId
  @return {String} Table ID
  **/
	}, {
		key: 'generateTableId',
		value: function generateTableId() {
			return this.$table.data(_constants.DATA_COLUMNS_ID).replace(/\./g, '_');
		}

		/**
  Parses a given DOMElement's width into a float
  
  @private
  @method parseWidth
  @param element {DOMElement} Element to get width of
  @return {Number} Element's width as a float
  **/
	}, {
		key: 'parseWidth',
		value: function parseWidth(element) {
			return element ? parseFloat(element.style.width.replace(this.options.absoluteWidths ? 'px' : '%', '')) : 0;
		}

		/**
  Sets the width of a given DOMElement
  
  @private
  @method setWidth
  @param element {DOMElement} Element to set width on
  @param width {Number} Width to set
  **/
	}, {
		key: 'setWidth',
		value: function setWidth(element, width) {
			width = width.toFixed(2);
			width = width > 0 ? width : 0;
			element.style.width = width + (this.options.absoluteWidths ? 'px' : '%');
		}

		/**
  Constrains a given width to the minimum and maximum ranges defined in
  the `minWidth` and `maxWidth` configuration options, respectively.
  
  @private
  @method constrainWidth
  @param $el {jQuery} jQuery-wrapped DOMElement
  @param width {Number} Width to constrain
  @return {Number} Constrained width
  **/
	}, {
		key: 'constrainWidth',
		value: function constrainWidth($el, width) {
			if (this.options.minWidth != undefined || this.options.obeyCssMinWidth) {
				width = Math.max(this.options.minWidth, width, $el.data(_constants.DATA_CSS_MIN_WIDTH));
			}

			if (this.options.maxWidth != undefined || this.options.obeyCssMaxWidth) {
				width = Math.min(this.options.maxWidth, width, $el.data(_constants.DATA_CSS_MAX_WIDTH));
			}

			width = Math.max(0, width);
			width = Math.min(this.options.absoluteWidths ? this.$table.width() : 100, width);

			return width;
		}

		/**
  Given a particular Event object, retrieves the current pointer offset along
  the horizontal direction. Accounts for both regular mouse clicks as well as
  pointer-like systems (mobiles, tablets etc.)
  
  @private
  @method getPointerX
  @param event {Object} Event object associated with the interaction
  @return {Number} Horizontal pointer offset
  **/
	}, {
		key: 'getPointerX',
		value: function getPointerX(event) {
			if (event.type.indexOf('touch') === 0) {
				return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
			}
			return event.pageX;
		}

		/**
  Gets the text width of an element
  
  @private
  @method getTextWidth
  @param $el {jQuery} jQuery-wrapped DOMElement that contains the text
  @param $fakeEl {jQuery} jQuery-wrapped DOMElement that will be used to measure the width
  @return {Number} Text width
  **/
	}, {
		key: 'getTextWidth',
		value: function getTextWidth($el, $fakeEl) {
			var text = $el.text().trim().replace(/\s/g, '&nbsp;') + '&nbsp;'; //add extra space to ensure we are not elipsing anything
			return $fakeEl.css({
				'fontFamily': $el.css('fontFamily'),
				'fontSize': $el.css('fontSize'),
				'fontWeight': $el.css('fontWeight'),
				'padding': $el.css('padding'),
				'border': $el.css('border') }).html(text).outerWidth(true);
		}
	}, {
		key: 'shouldWrap',
		value: function shouldWrap() {
			return this.options.wrappTable || this.options.absoluteWidths;
		}
	}], [{
		key: 'parsePixelString',
		value: function parsePixelString(value) {
			var valueType = typeof value;

			if (valueType === 'string') {
				var v = value.replace('px', ''),
				    n = parseFloat(v);
				if (!isNaN(n)) {
					return n;
				}
			} else if (valueType === 'number') {
				return value;
			}

			return 0;
		}
	}]);

	return ResizableColumns;
})();

exports['default'] = ResizableColumns;

ResizableColumns.defaults = {
	selector: function selector($table) {
		if ($table.find('thead').length) {
			return _constants.SELECTOR_TH;
		}

		return _constants.SELECTOR_TD;
	},
	store: window.store,
	syncHandlers: true,
	resizeFromBody: true,
	maxWidth: null,
	minWidth: 0.01,
	obeyCssMinWidth: false,
	obeyCssMaxWidth: false,
	absoluteWidths: false,
	doubleClickDelay: 500,
	wrappTable: false
};

ResizableColumns.count = 0;
module.exports = exports['default'];

},{"./constants":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var DATA_API = 'resizableColumns';
exports.DATA_API = DATA_API;
var DATA_COLUMNS_ID = 'resizableColumnsId';
exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
var DATA_COLUMN_ID = 'resizableColumnId';
exports.DATA_COLUMN_ID = DATA_COLUMN_ID;
var DATA_CSS_MIN_WIDTH = 'cssMinWidth';
exports.DATA_CSS_MIN_WIDTH = DATA_CSS_MIN_WIDTH;
var DATA_CSS_MAX_WIDTH = 'cssMaxWidth';

exports.DATA_CSS_MAX_WIDTH = DATA_CSS_MAX_WIDTH;
var CLASS_ABSOLUTE = 'rc-absolute';
exports.CLASS_ABSOLUTE = CLASS_ABSOLUTE;
var CLASS_TABLE_RESIZING = 'rc-table-resizing';
exports.CLASS_TABLE_RESIZING = CLASS_TABLE_RESIZING;
var CLASS_COLUMN_RESIZING = 'rc-column-resizing';
exports.CLASS_COLUMN_RESIZING = CLASS_COLUMN_RESIZING;
var CLASS_HANDLE = 'rc-handle';
exports.CLASS_HANDLE = CLASS_HANDLE;
var CLASS_HANDLE_CONTAINER = 'rc-handle-container';
exports.CLASS_HANDLE_CONTAINER = CLASS_HANDLE_CONTAINER;
var CLASS_TABLE_WRAPPER = 'rc-table-wrapper';

exports.CLASS_TABLE_WRAPPER = CLASS_TABLE_WRAPPER;
var EVENT_RESIZE_START = 'column:resize:start';
exports.EVENT_RESIZE_START = EVENT_RESIZE_START;
var EVENT_RESIZE = 'column:resize';
exports.EVENT_RESIZE = EVENT_RESIZE;
var EVENT_RESIZE_STOP = 'column:resize:stop';

exports.EVENT_RESIZE_STOP = EVENT_RESIZE_STOP;
var SELECTOR_TH = 'tr:first > th:visible';
exports.SELECTOR_TH = SELECTOR_TH;
var SELECTOR_TD = 'tr:first > td:visible';
exports.SELECTOR_TD = SELECTOR_TD;
var SELECTOR_UNRESIZABLE = '[data-noresize]';

exports.SELECTOR_UNRESIZABLE = SELECTOR_UNRESIZABLE;
var ATTRIBUTE_UNRESIZABLE = 'data-noresize';
exports.ATTRIBUTE_UNRESIZABLE = ATTRIBUTE_UNRESIZABLE;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _adapter = require('./adapter');

var _adapter2 = _interopRequireDefault(_adapter);

exports['default'] = _class2['default'];
module.exports = exports['default'];

},{"./adapter":1,"./class":2}]},{},[4])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0NqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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SyxFQUFFO0FBQ3hCLFFBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLFFBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDOUIsVUFBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUEsQUFBQyxDQUFDO0dBQ3pFOzs7Ozs7Ozs7Ozs7OztTQVlhLHdCQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDMUIsT0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7QUFDdkUsU0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLCtCQUFvQixDQUFDLENBQUM7SUFDN0U7O0FBRUQsT0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7QUFDdkUsU0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLCtCQUFvQixDQUFDLENBQUM7SUFDN0U7O0FBRUQsUUFBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzFCLFFBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUVsRixVQUFPLEtBQUssQ0FBQztHQUNiOzs7Ozs7Ozs7Ozs7OztTQVlVLHFCQUFDLEtBQUssRUFBRTtBQUNsQixPQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN0QyxXQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBRSxLQUFLLENBQUM7SUFDdkY7QUFDRCxVQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7R0FDbkI7Ozs7Ozs7Ozs7Ozs7U0FXVyxzQkFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQzFCLE9BQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUNqRSxVQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFDbEIsZ0JBQVksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztBQUNuQyxjQUFVLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7QUFDL0IsZ0JBQVksRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztBQUNuQyxhQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7QUFDN0IsWUFBUSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQyxDQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQ1YsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ2xCOzs7U0FFUyxzQkFBRztBQUNaLFVBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7R0FDOUQ7OztTQTV4QnNCLDBCQUFDLEtBQUssRUFBRTtBQUM5QixPQUFJLFNBQVMsR0FBRyxPQUFPLEtBQUssQ0FBQzs7QUFFN0IsT0FBSSxTQUFTLEtBQUssUUFBUSxFQUFFO0FBQzNCLFFBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUM5QixDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLFFBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDZCxZQUFPLENBQUMsQ0FBQztLQUNUO0lBRUQsTUFBTSxJQUFJLFNBQVMsS0FBSyxRQUFRLEVBQUU7QUFDbEMsV0FBTyxLQUFLLENBQUM7SUFDYjs7QUFFRCxVQUFPLENBQUMsQ0FBQztHQUNUOzs7UUEvS21CLGdCQUFnQjs7O3FCQUFoQixnQkFBZ0I7O0FBKzdCckMsZ0JBQWdCLENBQUMsUUFBUSxHQUFHO0FBQzNCLFNBQVEsRUFBRSxrQkFBUyxNQUFNLEVBQUU7QUFDMUIsTUFBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUMvQixpQ0FBbUI7R0FDbkI7O0FBRUQsZ0NBQW1CO0VBQ25CO0FBQ0QsTUFBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO0FBQ25CLGFBQVksRUFBRSxJQUFJO0FBQ2xCLGVBQWMsRUFBRSxJQUFJO0FBQ3BCLFNBQVEsRUFBRSxJQUFJO0FBQ2QsU0FBUSxFQUFFLElBQUk7QUFDZCxnQkFBZSxFQUFFLEtBQUs7QUFDckIsZ0JBQWUsRUFBRSxLQUFLO0FBQ3ZCLGVBQWMsRUFBRSxLQUFLO0FBQ3JCLGlCQUFnQixFQUFFLEdBQUc7QUFDckIsV0FBVSxFQUFFLEtBQUs7Q0FDakIsQ0FBQzs7QUFFRixnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7Ozs7QUNqL0JwQixJQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQzs7QUFDcEMsSUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQUM7O0FBQzdDLElBQU0sY0FBYyxHQUFHLG1CQUFtQixDQUFDOztBQUMzQyxJQUFNLGtCQUFrQixHQUFHLGFBQWEsQ0FBQzs7QUFDekMsSUFBTSxrQkFBa0IsR0FBRyxhQUFhLENBQUM7OztBQUV6QyxJQUFNLGNBQWMsR0FBRyxhQUFhLENBQUM7O0FBQ3JDLElBQU0sb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7O0FBQ2pELElBQU0scUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7O0FBQ25ELElBQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQzs7QUFDakMsSUFBTSxzQkFBc0IsR0FBRyxxQkFBcUIsQ0FBQzs7QUFDckQsSUFBTSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQzs7O0FBRS9DLElBQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUM7O0FBQ2pELElBQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQzs7QUFDckMsSUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQzs7O0FBRS9DLElBQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDOztBQUM1QyxJQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQzs7QUFDNUMsSUFBTSxvQkFBb0Isb0JBQW9CLENBQUM7OztBQUUvQyxJQUFNLHFCQUFxQixHQUFHLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7O3FCQ3JCeEIsU0FBUzs7Ozt1QkFDbEIsV0FBVyIsImZpbGUiOiJqcXVlcnkucmVzaXphYmxlQ29sdW1ucy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFJlc2l6YWJsZUNvbHVtbnMgZnJvbSAnLi9jbGFzcyc7XHJcbmltcG9ydCB7REFUQV9BUEl9IGZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbiQuZm4ucmVzaXphYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKG9wdGlvbnNPck1ldGhvZCwgLi4uYXJncykge1xyXG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRsZXQgJHRhYmxlID0gJCh0aGlzKTtcclxuXHJcblx0XHRsZXQgYXBpID0gJHRhYmxlLmRhdGEoREFUQV9BUEkpO1xyXG5cdFx0aWYgKCFhcGkpIHtcclxuXHRcdFx0YXBpID0gbmV3IFJlc2l6YWJsZUNvbHVtbnMoJHRhYmxlLCBvcHRpb25zT3JNZXRob2QpO1xyXG5cdFx0XHQkdGFibGUuZGF0YShEQVRBX0FQSSwgYXBpKTtcclxuXHRcdH1cclxuXHJcblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9uc09yTWV0aG9kID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRyZXR1cm4gYXBpW29wdGlvbnNPck1ldGhvZF0oLi4uYXJncyk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn07XHJcblxyXG4kLnJlc2l6YWJsZUNvbHVtbnMgPSBSZXNpemFibGVDb2x1bW5zO1xyXG4iLCJpbXBvcnQge1xyXG5cdEFUVFJJQlVURV9VTlJFU0laQUJMRSxcclxuXHREQVRBX0FQSSxcclxuXHREQVRBX0NPTFVNTlNfSUQsXHJcblx0REFUQV9DT0xVTU5fSUQsXHJcblx0REFUQV9DU1NfTUlOX1dJRFRILFxyXG5cdERBVEFfQ1NTX01BWF9XSURUSCxcclxuXHRDTEFTU19BQlNPTFVURSxcclxuXHRDTEFTU19UQUJMRV9SRVNJWklORyxcclxuXHRDTEFTU19DT0xVTU5fUkVTSVpJTkcsXHJcblx0Q0xBU1NfSEFORExFLFxyXG5cdENMQVNTX0hBTkRMRV9DT05UQUlORVIsXHJcblx0Q0xBU1NfVEFCTEVfV1JBUFBFUixcclxuXHRFVkVOVF9SRVNJWkVfU1RBUlQsXHJcblx0RVZFTlRfUkVTSVpFLFxyXG5cdEVWRU5UX1JFU0laRV9TVE9QLFxyXG5cdFNFTEVDVE9SX1RILFxyXG5cdFNFTEVDVE9SX1RELFxyXG5cdFNFTEVDVE9SX1VOUkVTSVpBQkxFXHJcbn1cclxuZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuLyoqXHJcblRha2VzIGEgPHRhYmxlIC8+IGVsZW1lbnQgYW5kIG1ha2VzIGl0J3MgY29sdW1ucyByZXNpemFibGUgYWNyb3NzIGJvdGhcclxubW9iaWxlIGFuZCBkZXNrdG9wIGNsaWVudHMuXHJcblxyXG5AY2xhc3MgUmVzaXphYmxlQ29sdW1uc1xyXG5AcGFyYW0gJHRhYmxlIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudCB0byBtYWtlIHJlc2l6YWJsZVxyXG5AcGFyYW0gb3B0aW9ucyB7T2JqZWN0fSBDb25maWd1cmF0aW9uIG9iamVjdFxyXG4qKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXphYmxlQ29sdW1ucyB7XHJcblx0Y29uc3RydWN0b3IoJHRhYmxlLCBvcHRpb25zKSB7XHJcblx0XHR0aGlzLm5zID0gJy5yYycgKyB0aGlzLmNvdW50Kys7XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuJHdpbmRvdyA9ICQod2luZG93KTtcclxuXHRcdHRoaXMuJG93bmVyRG9jdW1lbnQgPSAkKCR0YWJsZS5nZXQoMCkub3duZXJEb2N1bWVudCk7XHJcblx0XHR0aGlzLiR0YWJsZSA9ICR0YWJsZTtcclxuXHRcdHRoaXMuJHRhYmxlV3JhcHBlciA9IG51bGw7XHJcblx0XHR0aGlzLmxhc3RQb2ludGVyRG93biA9IG51bGw7XHJcblx0XHR0aGlzLmlzRG91YmxlQ2xpY2sgPSBmYWxzZTtcclxuXHJcblx0XHR0aGlzLndyYXBUYWJsZSgpO1xyXG5cdFx0dGhpcy5yZWZyZXNoSGVhZGVycygpO1xyXG5cdFx0dGhpcy5yZXN0b3JlQ29sdW1uV2lkdGhzKCk7XHJcblx0XHR0aGlzLmNoZWNrVGFibGVXaWR0aCgpO1xyXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuY2hlY2tUYWJsZVdpZHRoLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuc3luY0hhbmRsZVdpZHRocy5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnN0YXJ0KSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUQVJULCB0aGlzLm9wdGlvbnMuc3RhcnQpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXNpemUpIHtcclxuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkUsIHRoaXMub3B0aW9ucy5yZXNpemUpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9wKSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUT1AsIHRoaXMub3B0aW9ucy5zdG9wKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFdyYXAgdGhlIHRhYmxlIERPTUVsZW1lbnQgaW4gYSBkaXZcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHJlZnJlc2hIZWFkZXJzXHJcblx0KiovXHJcblx0d3JhcFRhYmxlKCkge1xyXG5cdFx0aWYoIXRoaXMuc2hvdWxkV3JhcCgpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLiR0YWJsZVdyYXBwZXIgPSB0aGlzLiR0YWJsZVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQud3JhcChgPGRpdiBjbGFzcz1cIiR7Q0xBU1NfVEFCTEVfV1JBUFBFUn1cIj48L2Rpdj5gKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQud2lkdGgodGhpcy4kdGFibGUuaW5uZXJXaWR0aCgpKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQucGFyZW50KCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRSZWZyZXNoZXMgdGhlIGhlYWRlcnMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgaW5zdGFuY2VzIDx0YWJsZS8+IGVsZW1lbnQgYW5kXHJcblx0Z2VuZXJhdGVzIGhhbmRsZXMgZm9yIHRoZW0uIEFsc28gYXNzaWducyB3aWR0aHMuXHJcblxyXG5cdEBtZXRob2QgcmVmcmVzaEhlYWRlcnNcclxuXHQqKi9cclxuXHRyZWZyZXNoSGVhZGVycygpIHtcclxuXHRcdC8vIEFsbG93IHRoZSBzZWxlY3RvciB0byBiZSBib3RoIGEgcmVndWxhciBzZWxjdG9yIHN0cmluZyBhcyB3ZWxsIGFzXHJcblx0XHQvLyBhIGR5bmFtaWMgY2FsbGJhY2tcclxuXHRcdGxldCBzZWxlY3RvciA9IHRoaXMub3B0aW9ucy5zZWxlY3RvcjtcclxuXHRcdGlmKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLmNhbGwodGhpcywgdGhpcy4kdGFibGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNlbGVjdCBhbGwgdGFibGUgaGVhZGVyc1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzID0gdGhpcy4kdGFibGUuZmluZChzZWxlY3Rvcik7XHJcblxyXG5cdFx0Ly8gQXNzaWduIHdpZHRocyBmaXJzdCwgdGhlbiBjcmVhdGUgZHJhZyBoYW5kbGVzXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdHRoaXMuYXNzaWduQWJzb2x1dGVXaWR0aHMoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuYXNzaWduUGVyY2VudGFnZVdpZHRocygpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5jcmVhdGVIYW5kbGVzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDcmVhdGVzIGR1bW15IGhhbmRsZSBlbGVtZW50cyBmb3IgYWxsIHRhYmxlIGhlYWRlciBjb2x1bW5zXHJcblxyXG5cdEBtZXRob2QgY3JlYXRlSGFuZGxlc1xyXG5cdCoqL1xyXG5cdGNyZWF0ZUhhbmRsZXMoKSB7XHJcblx0XHRsZXQgcmVmID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyO1xyXG5cdFx0aWYgKHJlZiAhPSBudWxsKSB7XHJcblx0XHRcdHJlZi5yZW1vdmUoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRV9DT05UQUlORVJ9JyAvPmApXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lci5hZGRDbGFzcyhDTEFTU19BQlNPTFVURSk7XHJcblx0XHR9XHJcblx0XHR0aGlzLiR0YWJsZS5iZWZvcmUodGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcclxuXHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoaSwgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRjdXJyZW50ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkpO1xyXG5cdFx0XHRsZXQgJG5leHQgPSB0aGlzLiR0YWJsZUhlYWRlcnMuZXEoaSArIDEpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocyl7XHJcblx0XHRcdFx0aWYgKCRjdXJyZW50LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAoJG5leHQubGVuZ3RoID09PSAwIHx8ICRjdXJyZW50LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSB8fCAkbmV4dC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCAkaGFuZGxlID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEV9JyAvPmApXHJcblx0XHRcdFx0LmFwcGVuZFRvKHRoaXMuJGhhbmRsZUNvbnRhaW5lcik7XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmJpbmRFdmVudHModGhpcy4kaGFuZGxlQ29udGFpbmVyLCBbJ21vdXNlZG93bicsICd0b3VjaHN0YXJ0J10sICcuJytDTEFTU19IQU5ETEUsIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdEFzc2lnbnMgYSBhYnNvbHV0ZSB3aWR0aCB0byBhbGwgY29sdW1ucyBiYXNlZCBvbiB0aGVpciBjdXJyZW50IHdpZHRoKHMpXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBhc3NpZ25BYnNvbHV0ZVdpZHRoc1xyXG5cdCoqL1xyXG5cdGFzc2lnbkFic29sdXRlV2lkdGhzKCkge1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdC8vIGRvIG5vdCBhc3NpZ24gd2lkdGggaWYgdGhlIGNvbHVtbiBpcyBub3QgcmVzaXphYmxlXHJcblx0XHRcdGlmIChlbC5oYXNBdHRyaWJ1dGUoQVRUUklCVVRFX1VOUkVTSVpBQkxFKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0XHRsZXQgJGVsID0gJChlbCksXHJcblx0XHRcdFx0dGFibGVXaWR0aCA9IHRoaXMuJHRhYmxlLndpZHRoKCksXHJcblx0XHRcdFx0cGFkZGluZ0xlZnQgPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ0xlZnQnKSksXHJcblx0XHRcdFx0cGFkZGluZ1JpZ2h0ID0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC5jc3MoJ3BhZGRpbmdSaWdodCcpKSxcclxuXHRcdFx0XHR3aWR0aCA9ICgkZWwub3V0ZXJXaWR0aCgpIC0gcGFkZGluZ0xlZnQgLSBwYWRkaW5nUmlnaHQpO1xyXG5cdFx0XHRcclxuXHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUlOX1dJRFRILCAwKTtcclxuXHRcdFx0JGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRILCB0YWJsZVdpZHRoKTtcclxuXHJcblx0XHRcdGxldCBtaW5XaWR0aCA9IHRoaXMuY29tcHV0ZU1pbkNzc1dpZHRocygkZWwpO1xyXG5cdFx0XHRpZiAobWluV2lkdGggIT0gbnVsbCkge1xyXG5cdFx0XHRcdCRlbC5kYXRhKERBVEFfQ1NTX01JTl9XSURUSCwgbWluV2lkdGgpO1xyXG5cdFx0XHRcdHdpZHRoID0gTWF0aC5tYXgobWluV2lkdGgsIHdpZHRoKTsgXHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGxldCBtYXhXaWR0aCA9IHRoaXMuY29tcHV0ZU1heENzc1dpZHRocygkZWwpO1xyXG5cdFx0XHRpZiAobWF4V2lkdGggIT0gbnVsbCkge1xyXG5cdFx0XHRcdCRlbC5kYXRhKERBVEFfQ1NTX01BWF9XSURUSCwgbWF4V2lkdGgpO1xyXG5cdFx0XHRcdHdpZHRoID0gTWF0aC5taW4obWF4V2lkdGgsIHdpZHRoKTsgXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuc2V0V2lkdGgoJGVsLmdldCgwKSwgd2lkdGgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHJcblx0LyoqXHJcblx0UGFyc2UgdGhlIHZhbHVlIG9mIGEgc3RyaW5nIGJ5IHJlbW92aW5nICdweCdcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHBhcnNlUGl4ZWxTdHJpbmdcclxuXHRAcGFyYW0gdmFsdWUge1N0cmluZ31cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IFBhcnNlZCB2YWx1ZSBvciAwXHJcblx0KiovXHJcblx0c3RhdGljIHBhcnNlUGl4ZWxTdHJpbmcodmFsdWUpIHtcclxuXHRcdGxldCB2YWx1ZVR5cGUgPSB0eXBlb2YgdmFsdWU7XHJcblx0XHRcclxuXHRcdGlmICh2YWx1ZVR5cGUgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdGxldCB2ID0gdmFsdWUucmVwbGFjZSgncHgnLCAnJyksXHJcblx0XHRcdFx0biA9IHBhcnNlRmxvYXQodik7XHJcblx0XHRcdGlmICghaXNOYU4obikpIHtcclxuXHRcdFx0XHRyZXR1cm4gbjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0gZWxzZSBpZiAodmFsdWVUeXBlID09PSAnbnVtYmVyJykge1xyXG5cdFx0XHRyZXR1cm4gdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRBc3NpZ25zIGEgcGVyY2VudGFnZSB3aWR0aCB0byBhbGwgY29sdW1ucyBiYXNlZCBvbiB0aGVpciBjdXJyZW50IHBpeGVsIHdpZHRoKHMpXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBhc3NpZ25QZXJjZW50YWdlV2lkdGhzXHJcblx0KiovXHJcblx0YXNzaWduUGVyY2VudGFnZVdpZHRocygpIHtcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHQvLyBkbyBub3QgYXNzaWduIHdpZHRoIGlmIHRoZSBjb2x1bW4gaXMgbm90IHJlc2l6YWJsZVxyXG5cdFx0XHRpZiAoZWwuaGFzQXR0cmlidXRlKEFUVFJJQlVURV9VTlJFU0laQUJMRSkpXHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpLFxyXG5cdFx0XHRcdHdpZHRoID0gKCRlbC5vdXRlcldpZHRoKCkgLyB0aGlzLiR0YWJsZS53aWR0aCgpKSAqIDEwMDtcclxuXHRcdFx0XHJcblx0XHRcdCRlbC5kYXRhKERBVEFfQ1NTX01JTl9XSURUSCwgMCk7XHJcblx0XHRcdCRlbC5kYXRhKERBVEFfQ1NTX01BWF9XSURUSCwgMTAwKTtcclxuXHJcblx0XHRcdGxldCBtaW5XaWR0aCA9IHRoaXMuY29tcHV0ZU1pbkNzc1dpZHRocygkZWwpO1xyXG5cdFx0XHRpZiAobWluV2lkdGggIT0gbnVsbCkge1xyXG5cdFx0XHRcdCRlbC5kYXRhKERBVEFfQ1NTX01JTl9XSURUSCwgbWluV2lkdGgpO1xyXG5cdFx0XHRcdHdpZHRoID0gTWF0aC5tYXgobWluV2lkdGgsIHdpZHRoKTsgXHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGxldCBtYXhXaWR0aCA9IHRoaXMuY29tcHV0ZU1heENzc1dpZHRocygkZWwpO1xyXG5cdFx0XHRpZiAobWF4V2lkdGggIT0gbnVsbCkge1xyXG5cdFx0XHRcdCRlbC5kYXRhKERBVEFfQ1NTX01BWF9XSURUSCwgbWF4V2lkdGgpO1xyXG5cdFx0XHRcdHdpZHRoID0gTWF0aC5taW4obWF4V2lkdGgsIHdpZHRoKTsgXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuc2V0V2lkdGgoJGVsLmdldCgwKSwgd2lkdGgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDb21wdXRlIHRoZSBtaW5pbXVtIHdpZHRoIHRha2luZyBpbnRvIGFjY291bnQgQ1NTXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjb21wdXRlTWluQ3NzV2lkdGhzXHJcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IGZvciB3aGljaCB3ZSBjb21wdXRlIHRoZSBtaW5pbXVtIHdpZHRoXHJcblx0KiovXHJcblx0Y29tcHV0ZU1pbkNzc1dpZHRocygkZWwpIHtcclxuXHRcdGxldCBlbCwgbWluV2lkdGg7XHJcblx0XHRtaW5XaWR0aCA9IG51bGw7XHJcblx0XHRlbCA9ICRlbC5nZXQoMCk7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm9iZXlDc3NNaW5XaWR0aCkge1xyXG5cdFx0XHRpZiAoZWwuc3R5bGUubWluV2lkdGguc2xpY2UoLTIpID09PSAncHgnKSB7XHJcblx0XHRcdFx0bWluV2lkdGggPSBwYXJzZUZsb2F0KGVsLnN0eWxlLm1pbldpZHRoKTtcclxuXHRcdFx0XHRpZiAoIXRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHRcdFx0bWluV2lkdGggPSAobWluV2lkdGggLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bWluV2lkdGggPSBwYXJzZUZsb2F0KGVsLnN0eWxlLm1pbldpZHRoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoaXNOYU4obWluV2lkdGgpKSB7XHJcblx0XHRcdFx0bWluV2lkdGggPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbWluV2lkdGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDb21wdXRlIHRoZSBtYXhpbXVtIHdpZHRoIHRha2luZyBpbnRvIGFjY291bnQgQ1NTXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjb21wdXRlTWF4Q3NzV2lkdGhzXHJcblx0QHBhcmFtICRlbCB7alF1ZXJ5fSBqUXVlcnktd3JhcHBlZCBET01FbGVtZW50IGZvciB3aGljaCB3ZSBjb21wdXRlIHRoZSBtYXhpbXVtIHdpZHRoXHJcblx0KiovXHJcblx0Y29tcHV0ZU1heENzc1dpZHRocygkZWwpIHtcclxuXHRcdGxldCBlbCwgbWF4V2lkdGg7XHJcblx0XHRtYXhXaWR0aCA9IG51bGw7XHJcblx0XHRlbCA9ICRlbC5nZXQoMCk7XHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm9iZXlDc3NNYXhXaWR0aCkge1xyXG5cdFx0XHRpZiAoZWwuc3R5bGUubWF4V2lkdGguc2xpY2UoLTIpID09PSAncHgnKSB7XHJcblx0XHRcdFx0bWF4V2lkdGggPSBwYXJzZUZsb2F0KGVsLnN0eWxlLm1heFdpZHRoKTtcclxuXHRcdFx0XHRpZiAoIXRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHRcdFx0bWF4V2lkdGggPSAobWF4V2lkdGggLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bWF4V2lkdGggPSBwYXJzZUZsb2F0KGVsLnN0eWxlLm1heFdpZHRoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoaXNOYU4obWF4V2lkdGgpKSB7XHJcblx0XHRcdFx0bWF4V2lkdGggPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbWF4V2lkdGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBtZXRob2QgY2hlY2tUYWJsZVdpZHRoXHJcblx0KiovXHJcblx0Y2hlY2tUYWJsZVdpZHRoKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHR0aGlzLmNoZWNrVGFibGVXaWR0aEFic29sdXRlKClcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgY2hlY2tUYWJsZVdpZHRoQWJzb2x1dGVcclxuXHQqKi9cclxuXHRjaGVja1RhYmxlV2lkdGhBYnNvbHV0ZSgpIHtcclxuXHRcdGlmICghdGhpcy5zaG91bGRXcmFwKCkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRsZXQgd3JhcHBwZXJXaWR0aCA9IHRoaXMuJHRhYmxlV3JhcHBlci5pbm5lcldpZHRoKCk7XHJcblx0XHRsZXQgdGFibGVXaWR0aCA9IHRoaXMuJHRhYmxlLm91dGVyV2lkdGgodHJ1ZSk7XHJcblx0XHRsZXQgZGlmZmVyZW5jZSA9IHdyYXBwcGVyV2lkdGggLSB0YWJsZVdpZHRoO1xyXG5cdFx0aWYgKGRpZmZlcmVuY2UgPiAwKSB7XHJcblx0XHRcdGxldCAkaGVhZGVycyA9IHRoaXMuJHRhYmxlSGVhZGVycy5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpO1xyXG5cdFx0XHRsZXQgdG90YWxXaWR0aCA9IDA7XHJcblx0XHRcdGxldCBhZGRlZFdpZHRoID0gMDtcclxuXHRcdFx0bGV0IHdpZHRocyA9IFtdO1xyXG5cdFx0XHQkaGVhZGVycy5lYWNoKChpLCBoZCkgPT4ge1xyXG5cdFx0XHRcdGxldCB3aWR0aCA9IHRoaXMucGFyc2VXaWR0aChoZCk7XHJcblx0XHRcdFx0d2lkdGhzLnB1c2god2lkdGgpO1xyXG5cdFx0XHRcdHRvdGFsV2lkdGggKz0gd2lkdGg7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0dGhpcy5zZXRXaWR0aCh0aGlzLiR0YWJsZVswXSwgd3JhcHBwZXJXaWR0aCk7XHJcblx0XHRcdCRoZWFkZXJzLmVhY2goKGosIGNvbCkgPT4ge1xyXG5cdFx0XHRcdGxldCBjdXJyZW50V2lkdGggPSB3aWR0aHMuc2hpZnQoKTsgXHJcblx0XHRcdFx0bGV0IG5ld1dpZHRoID0gY3VycmVudFdpZHRoICsgKChjdXJyZW50V2lkdGggLyB0b3RhbFdpZHRoKSAqIGRpZmZlcmVuY2UpO1xyXG5cdFx0XHRcdGxldCBsZWZ0VG9BZGQgPSB0b3RhbFdpZHRoICsgZGlmZmVyZW5jZSAtIGFkZGVkV2lkdGg7XHJcblx0XHRcdFx0dGhpcy5zZXRXaWR0aChjb2wsIE1hdGgubWluKG5ld1dpZHRoLCBsZWZ0VG9BZGQpKTtcclxuXHRcdFx0XHRhZGRlZFdpZHRoICs9IG5ld1dpZHRoO1xyXG5cdFx0XHRcdGlmIChhZGRlZFdpZHRoID49IHRvdGFsV2lkdGgpXHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAbWV0aG9kIHN5bmNIYW5kbGVXaWR0aHNcclxuXHQqKi9cclxuXHRzeW5jSGFuZGxlV2lkdGhzKCkge1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHNBYnNvbHV0ZSgpXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHNQZXJjZW50YWdlKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBzeW5jSGFuZGxlV2lkdGhzQWJzb2x1dGVcclxuXHQqKi9cclxuXHRzeW5jSGFuZGxlV2lkdGhzQWJzb2x1dGUoKSB7XHJcblx0XHRsZXQgJGNvbnRhaW5lciA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cclxuXHRcdCRjb250YWluZXIud2lkdGgodGhpcy4kdGFibGUud2lkdGgoKSkuY3NzKCdtaW5XaWR0aCcsIHRoaXMudG90YWxDb2x1bW5XaWR0aHNBYnNvbHV0ZSgpKTtcclxuXHJcblx0XHQkY29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSkuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0bGV0IGhlaWdodCA9IHRoaXMub3B0aW9ucy5yZXNpemVGcm9tQm9keSA/XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuaGVpZ2h0KCkgOlxyXG5cdFx0XHRcdHRoaXMuJHRhYmxlLmZpbmQoJ3RoZWFkJykuaGVpZ2h0KCk7XHJcblxyXG5cdFx0XHRsZXQgJHRoID0gdGhpcy4kdGFibGVIZWFkZXJzLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSkuZXEoXyk7XHJcblxyXG5cdFx0XHRsZXQgbGVmdCA9ICR0aC5vdXRlcldpZHRoKClcclxuXHRcdFx0bGVmdCAtPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ0xlZnQnKSk7XHJcblx0XHRcdGxlZnQgLT0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC5jc3MoJ3BhZGRpbmdSaWdodCcpKTtcclxuXHRcdFx0bGVmdCArPSAkdGgub2Zmc2V0KCkubGVmdDtcclxuXHRcdFx0bGVmdCAtPSB0aGlzLiRoYW5kbGVDb250YWluZXIub2Zmc2V0KCkubGVmdFxyXG5cclxuXHRcdFx0JGVsLmNzcyh7IGxlZnQsIGhlaWdodCB9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2Qgc3luY0hhbmRsZVdpZHRoc1BlcmNlbnRhZ2VcclxuXHQqKi9cclxuXHRzeW5jSGFuZGxlV2lkdGhzUGVyY2VudGFnZSgpIHtcclxuXHRcdGxldCAkY29udGFpbmVyID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyXHJcblxyXG5cdFx0JGNvbnRhaW5lci53aWR0aCh0aGlzLiR0YWJsZS53aWR0aCgpKTtcclxuXHJcblx0XHQkY29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSkuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0bGV0IGhlaWdodCA9IHRoaXMub3B0aW9ucy5yZXNpemVGcm9tQm9keSA/XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuaGVpZ2h0KCkgOlxyXG5cdFx0XHRcdHRoaXMuJHRhYmxlLmZpbmQoJ3RoZWFkJykuaGVpZ2h0KCk7XHJcblxyXG5cdFx0XHRsZXQgJHRoID0gdGhpcy4kdGFibGVIZWFkZXJzLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSkuZXEoXyk7XHJcblxyXG5cdFx0XHRsZXQgbGVmdCA9ICR0aC5vdXRlcldpZHRoKCkgKyAoJHRoLm9mZnNldCgpLmxlZnQgLSB0aGlzLiRoYW5kbGVDb250YWluZXIub2Zmc2V0KCkubGVmdCk7XHJcblxyXG5cdFx0XHQkZWwuY3NzKHsgbGVmdCwgaGVpZ2h0IH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBtZXRob2QgdG90YWxDb2x1bW5XaWR0aHNcclxuXHQqKi9cclxuXHR0b3RhbENvbHVtbldpZHRocygpIHtcclxuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHNcclxuXHRcdFx0PyB0aGlzLnRvdGFsQ29sdW1uV2lkdGhzQWJzb2x1dGUoKVxyXG5cdFx0XHQ6IHRoaXMudG90YWxDb2x1bW5XaWR0aHNQZXJjZW50YWdlKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCB0b3RhbENvbHVtbldpZHRoc0Fic29sdXRlXHJcblx0KiovXHJcblx0dG90YWxDb2x1bW5XaWR0aHNBYnNvbHV0ZSgpIHtcclxuXHRcdGxldCB0b3RhbCA9IDA7XHJcblxyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcclxuXHRcdFx0dG90YWwgKz0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC53aWR0aCgpKTtcclxuXHRcdFx0dG90YWwgKz0gUmVzaXphYmxlQ29sdW1ucy5wYXJzZVBpeGVsU3RyaW5nKCRlbC5jc3MoJ3BhZGRpbmdMZWZ0JykpO1xyXG5cdFx0XHR0b3RhbCArPSBSZXNpemFibGVDb2x1bW5zLnBhcnNlUGl4ZWxTdHJpbmcoJGVsLmNzcygncGFkZGluZ1JpZ2h0JykpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0b3RhbDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHRvdGFsQ29sdW1uV2lkdGhzUGVyY2VudGFnZVxyXG5cdCoqL1xyXG5cdHRvdGFsQ29sdW1uV2lkdGhzUGVyY2VudGFnZSgpIHtcclxuXHRcdC8vc2hvdWxkIGJlIDEwMCUgOkRcclxuXHRcdGxldCB0b3RhbCA9IDA7XHJcblxyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdHRvdGFsICs9IHRoaXMucGFyc2VXaWR0aChlbCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRvdGFsO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UGVyc2lzdHMgdGhlIGNvbHVtbiB3aWR0aHMgaW4gbG9jYWxTdG9yYWdlXHJcblxyXG5cdEBtZXRob2Qgc2F2ZUNvbHVtbldpZHRoc1xyXG5cdCoqL1xyXG5cdHNhdmVDb2x1bW5XaWR0aHMoKSB7XHJcblx0XHRpZiAoIXRoaXMub3B0aW9ucy5zdG9yZSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdHRoaXMub3B0aW9ucy5zdG9yZS5zZXQodGhpcy5nZW5lcmF0ZVRhYmxlQWJzb2x1dGVXaWR0aHNJZCgpLCB0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMgKyAnJyk7XHJcblx0XHRcdFxyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcclxuXHJcblx0XHRcdGlmICghJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdHRoaXMub3B0aW9ucy5zdG9yZS5zZXQoXHJcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKSxcclxuXHRcdFx0XHRcdHRoaXMucGFyc2VXaWR0aChlbClcclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFJldHJpZXZlcyBhbmQgc2V0cyB0aGUgY29sdW1uIHdpZHRocyBmcm9tIGxvY2FsU3RvcmFnZVxyXG5cclxuXHRAbWV0aG9kIHJlc3RvcmVDb2x1bW5XaWR0aHNcclxuXHQqKi9cclxuXHRyZXN0b3JlQ29sdW1uV2lkdGhzKCkge1xyXG5cdFx0aWYgKCF0aGlzLm9wdGlvbnMuc3RvcmUpXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnN0b3JlLmdldCh0aGlzLmdlbmVyYXRlVGFibGVBYnNvbHV0ZVdpZHRoc0lkKCkpICE9PSAodGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzICsgJycpKVxyXG5cdFx0XHRyZXR1cm47XHJcblxyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcclxuXHJcblx0XHRcdGlmKCEkZWwuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdFx0bGV0IHdpZHRoID0gdGhpcy5vcHRpb25zLnN0b3JlLmdldChcclxuXHRcdFx0XHRcdHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpXHJcblx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0aWYod2lkdGggIT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0dGhpcy5zZXRXaWR0aChlbCwgd2lkdGgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHJcblxyXG5cdEBtZXRob2QgcmVmcmVzaFdyYXBwZXJTdHlsZVxyXG5cdCoqL1xyXG5cdHJlZnJlc2hXcmFwcGVyU3R5bGUoKSB7XHJcblx0XHRpZiAodGhpcy4kdGFibGVXcmFwcGVyID09IG51bGwpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0Y29uc3Qgb3JpZ2luYWxTdHlsZSA9IHRoaXMuJHRhYmxlV3JhcHBlci5hdHRyKCdzdHlsZScpOyBcclxuXHRcdHRoaXMuJHRhYmxlV3JhcHBlclxyXG5cdFx0XHQuY3NzKCdvdmVyZmxvdy14JywgJ2hpZGRlbjsnKVxyXG5cdFx0XHQuYXR0cignc3R5bGUnLCBvcmlnaW5hbFN0eWxlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBvaW50ZXIvbW91c2UgZG93biBoYW5kbGVyXHJcblxyXG5cdEBtZXRob2Qgb25Qb2ludGVyRG93blxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uUG9pbnRlckRvd24oZXZlbnQpIHtcclxuXHRcdC8vIE9ubHkgYXBwbGllcyB0byBsZWZ0LWNsaWNrIGRyYWdnaW5nXHJcblx0XHRpZihldmVudC53aGljaCAhPT0gMSkgeyByZXR1cm47IH1cclxuXHJcblx0XHQvLyBJZiBhIHByZXZpb3VzIG9wZXJhdGlvbiBpcyBkZWZpbmVkLCB3ZSBtaXNzZWQgdGhlIGxhc3QgbW91c2V1cC5cclxuXHRcdC8vIFByb2JhYmx5IGdvYmJsZWQgdXAgYnkgdXNlciBtb3VzaW5nIG91dCB0aGUgd2luZG93IHRoZW4gcmVsZWFzaW5nLlxyXG5cdFx0Ly8gV2UnbGwgc2ltdWxhdGUgYSBwb2ludGVydXAgaGVyZSBwcmlvciB0byBpdFxyXG5cdFx0aWYodGhpcy5vcGVyYXRpb24pIHtcclxuXHRcdFx0dGhpcy5vblBvaW50ZXJVcChldmVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSWdub3JlIG5vbi1yZXNpemFibGUgY29sdW1uc1xyXG5cdFx0bGV0ICRjdXJyZW50R3JpcCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XHJcblx0XHRpZigkY3VycmVudEdyaXAuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmlzRG91YmxlQ2xpY2sgPSB0aGlzLmxhc3RQb2ludGVyRG93biAhPSBudWxsICYmICgobmV3IERhdGUoKSAtIHRoaXMubGFzdFBvaW50ZXJEb3duKSA8IHRoaXMub3B0aW9ucy5kb3VibGVDbGlja0RlbGF5KTtcclxuXHRcdHRoaXMubGFzdFBvaW50ZXJEb3duID0gbmV3IERhdGUoKTtcclxuXHRcdGxldCBncmlwSW5kZXggPSAkY3VycmVudEdyaXAuaW5kZXgoKTtcclxuXHRcdGxldCAkbGVmdENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVycy5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpLmVxKGdyaXBJbmRleCk7XHJcblx0XHRsZXQgJHJpZ2h0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSkuZXEoZ3JpcEluZGV4ICsgMSk7XHJcblxyXG5cdFx0bGV0IGxlZnRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkbGVmdENvbHVtbi5nZXQoMCkpO1xyXG5cdFx0bGV0IHJpZ2h0V2lkdGggPSB0aGlzLnBhcnNlV2lkdGgoJHJpZ2h0Q29sdW1uLmdldCgwKSk7XHJcblx0XHRsZXQgdGFibGVXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCh0aGlzLiR0YWJsZS5nZXQoMCkpO1xyXG5cclxuXHRcdHRoaXMub3BlcmF0aW9uID0ge1xyXG5cdFx0XHQkbGVmdENvbHVtbiwgJHJpZ2h0Q29sdW1uLCAkY3VycmVudEdyaXAsXHJcblxyXG5cdFx0XHRzdGFydFg6IHRoaXMuZ2V0UG9pbnRlclgoZXZlbnQpLFxyXG5cclxuXHRcdFx0d2lkdGhzOiB7XHJcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxyXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoLFxyXG5cdFx0XHRcdHRhYmxlOiB0YWJsZVdpZHRoXHJcblx0XHRcdH0sXHJcblx0XHRcdG5ld1dpZHRoczoge1xyXG5cdFx0XHRcdGxlZnQ6IGxlZnRXaWR0aCxcclxuXHRcdFx0XHRyaWdodDogcmlnaHRXaWR0aCxcclxuXHRcdFx0XHR0YWJsZTogdGFibGVXaWR0aFxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnXSwgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCddLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpO1xyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxyXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xyXG5cclxuXHRcdCRsZWZ0Q29sdW1uXHJcblx0XHRcdC5hZGQoJHJpZ2h0Q29sdW1uKVxyXG5cdFx0XHQuYWRkKCRjdXJyZW50R3JpcClcclxuXHRcdFx0LmFkZENsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XHJcblxyXG5cdFx0dGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFX1NUQVJULCBbXHJcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sXHJcblx0XHRcdGxlZnRXaWR0aCwgcmlnaHRXaWR0aFxyXG5cdFx0XSxcclxuXHRcdGV2ZW50KTtcdFx0XHJcblx0XHRcclxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQb2ludGVyL21vdXNlIGRvdWJsZSBjbGlja1xyXG5cclxuXHRAbWV0aG9kIG9uRG91YmxlQ2xpY2tcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHQqKi9cclxuXHRvbkRvdWJsZUNsaWNrKGV2ZW50KSB7XHJcblx0XHRpZiAoIXRoaXMub3BlcmF0aW9uKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcdFxyXG5cdFx0bGV0ICRjdXJyZW50R3JpcCA9IHRoaXMub3BlcmF0aW9uLiRjdXJyZW50R3JpcDtcclxuXHRcdGlmKCRjdXJyZW50R3JpcC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBncmlwSW5kZXggPSAkY3VycmVudEdyaXAuaW5kZXgoKTtcclxuXHRcdGxldCAkbGVmdENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVycy5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpLmVxKGdyaXBJbmRleCk7XHJcblx0XHRsZXQgbGVmdCA9ICRsZWZ0Q29sdW1uLmdldCgwKTtcclxuXHRcdGlmICghbGVmdCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGxldCBtYXhXaWR0aCA9IDA7XHJcblx0XHRsZXQgaW5kZWNlc1RvU2t5cCA9IFtdO1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKGlkeCwgdGgpID0+IHtcclxuXHRcdFx0aWYgKCQodGgpLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdGluZGVjZXNUb1NreXAucHVzaChpZHgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGxldCAkZmFrZUVsID0gJCgnPHNwYW4+JykuY3NzKHtcclxuXHRcdFx0J3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcclxuXHRcdFx0J3Zpc2liaWxpdHknOiAnaGlkZGVuJyxcclxuXHRcdFx0J2xlZnQnOiAnLTk5OTk5cHgnLFxyXG5cdFx0XHQndG9wJzogJy05OTk5OXB4J1xyXG5cdFx0fSk7XHJcblx0XHQkKCdib2R5JykuYXBwZW5kKCRmYWtlRWwpO1xyXG5cdFx0dGhpcy4kdGFibGUuZmluZCgndHInKS5lYWNoKChpVHIsIHRyKSA9PiB7XHJcblx0XHRcdGxldCBwb3MgPSAwO1xyXG5cdFx0XHQkKHRyKS5maW5kKCd0ZCwgdGgnKS5lYWNoKChpQ29sLCBjb2wpID0+IHtcclxuXHRcdFx0XHRpZiAoaW5kZWNlc1RvU2t5cC5pbmRleE9mKGlDb2wpICE9PSAtMSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuOyAvLyBza3lwIG92ZXIgbm90IHJlc2l6YWJsZSBjb2x1bW5zXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGxldCAkY29sID0gJChjb2wpO1xyXG5cdFx0XHRcdGlmIChwb3MgPT09IGdyaXBJbmRleCkge1xyXG5cdFx0XHRcdFx0bWF4V2lkdGggPSBNYXRoLm1heChtYXhXaWR0aCwgdGhpcy5nZXRUZXh0V2lkdGgoJGNvbCwgJGZha2VFbCkpXHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHBvcyArPSAoJGNvbC5wcm9wKCdjb2xzcGFuJykgfHwgMSk7XHRcdFx0XHRcdFx0XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0XHQkZmFrZUVsLnJlbW92ZSgpO1xyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHRsZXQgdGFibGVXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCh0aGlzLiR0YWJsZVswXSk7XHJcblx0XHRcdGxldCBsZWZ0V2lkdGggPSB0aGlzLnBhcnNlV2lkdGgobGVmdCk7XHJcblx0XHRcdHRoaXMuc2V0V2lkdGgodGhpcy4kdGFibGVbMF0sIHRhYmxlV2lkdGggKyBtYXhXaWR0aCAtIGxlZnRXaWR0aCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRtYXhXaWR0aCA9IG1heFdpZHRoIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMDtcclxuXHRcdH1cclxuXHRcdHRoaXMuc2V0V2lkdGgobGVmdCwgbWF4V2lkdGgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSBtb3ZlbWVudCBoYW5kbGVyXHJcblxyXG5cdEBtZXRob2Qgb25Qb2ludGVyTW92ZVxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uUG9pbnRlck1vdmUoZXZlbnQpIHtcclxuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xyXG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIERldGVybWluZSB0aGUgZGVsdGEgY2hhbmdlIGJldHdlZW4gc3RhcnQgYW5kIG5ldyBtb3VzZSBwb3NpdGlvbiwgYXMgYSBwZXJjZW50YWdlIG9mIHRoZSB0YWJsZSB3aWR0aFxyXG5cdFx0bGV0IGRpZmZlcmVuY2UgPSB0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSAtIG9wLnN0YXJ0WDtcclxuXHRcdGlmICghdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzKSB7XHJcblx0XHRcdGRpZmZlcmVuY2UgPSAoZGlmZmVyZW5jZSkgLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGRpZmZlcmVuY2UgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBsZWZ0Q29sdW1uID0gb3AuJGxlZnRDb2x1bW4uZ2V0KDApO1xyXG5cdFx0bGV0IHJpZ2h0Q29sdW1uID0gb3AuJHJpZ2h0Q29sdW1uLmdldCgwKTtcclxuXHRcdGxldCB0YWJsZSA9IHRoaXMuJHRhYmxlLmdldCgwKTtcclxuXHRcdGxldCB3aWR0aExlZnQsIHdpZHRoUmlnaHQsIHRhYmxlV2lkdGg7XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZVdpZHRocykge1xyXG5cdFx0XHR0YWJsZVdpZHRoID0gb3Aud2lkdGhzLnRhYmxlICsgZGlmZmVyZW5jZTtcclxuXHRcdFx0d2lkdGhMZWZ0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC4kbGVmdENvbHVtbiwgb3Aud2lkdGhzLmxlZnQgKyBkaWZmZXJlbmNlKTtcclxuXHRcdFx0d2lkdGhSaWdodCA9IG9wLndpZHRocy5yaWdodDsgLy9LZWVwIHJpZ2h0IGNvbHVtbiB1bmNoYW5nZWQgd2hlbiBpbmNyZWFzaW5nIHRoZSB0YWJsZSBzaXplXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0YWJsZVdpZHRoID0gMTAwO1xyXG5cdFx0XHRpZihkaWZmZXJlbmNlIDwgMCkge1xyXG5cdFx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3AuJGxlZnRDb2x1bW4sIG9wLndpZHRocy5sZWZ0ICsgZGlmZmVyZW5jZSk7XHJcblx0XHRcdFx0d2lkdGhSaWdodCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3AuJHJpZ2h0Q29sdW1uLCBvcC53aWR0aHMucmlnaHQgKyAob3Aud2lkdGhzLmxlZnQgLSBvcC5uZXdXaWR0aHMubGVmdCkpO1xyXG5cdFx0XHR9IGVsc2UgaWYoZGlmZmVyZW5jZSA+IDApIHtcclxuXHRcdFx0XHR3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLiRsZWZ0Q29sdW1uLCBvcC53aWR0aHMubGVmdCArIChvcC53aWR0aHMucmlnaHQgLSBvcC5uZXdXaWR0aHMucmlnaHQpKTtcclxuXHRcdFx0XHR3aWR0aFJpZ2h0ID0gdGhpcy5jb25zdHJhaW5XaWR0aChvcC4kcmlnaHRDb2x1bW4sIG9wLndpZHRocy5yaWdodCAtIGRpZmZlcmVuY2UpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRhYmxlKSB7XHJcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMpIHtcclxuXHRcdFx0XHR0aGlzLnNldFdpZHRoKHRhYmxlLCB0YWJsZVdpZHRoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGxlZnRDb2x1bW4pIHtcclxuXHRcdFx0dGhpcy5zZXRXaWR0aChsZWZ0Q29sdW1uLCB3aWR0aExlZnQpO1xyXG5cdFx0fVxyXG5cdFx0aWYocmlnaHRDb2x1bW4pIHtcclxuXHRcdFx0dGhpcy5zZXRXaWR0aChyaWdodENvbHVtbiwgd2lkdGhSaWdodCk7XHJcblx0XHR9XHJcblxyXG5cdFx0b3AubmV3V2lkdGhzLmxlZnQgPSB3aWR0aExlZnQ7XHJcblx0XHRvcC5uZXdXaWR0aHMucmlnaHQgPSB3aWR0aFJpZ2h0O1xyXG5cdFx0b3AubmV3V2lkdGhzLnRhYmxlID0gdGFibGVXaWR0aDtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFLCBbXHJcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXHJcblx0XHRcdHdpZHRoTGVmdCwgd2lkdGhSaWdodFxyXG5cdFx0XSxcclxuXHRcdGV2ZW50KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBvaW50ZXIvbW91c2UgcmVsZWFzZSBoYW5kbGVyXHJcblxyXG5cdEBtZXRob2Qgb25Qb2ludGVyVXBcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHQqKi9cclxuXHRvblBvaW50ZXJVcChldmVudCkge1xyXG5cdFx0bGV0IG9wID0gdGhpcy5vcGVyYXRpb247XHJcblx0XHRpZighdGhpcy5vcGVyYXRpb24pIHsgcmV0dXJuOyB9XHJcblxyXG5cdFx0dGhpcy51bmJpbmRFdmVudHModGhpcy4kb3duZXJEb2N1bWVudCwgWydtb3VzZXVwJywgJ3RvdWNoZW5kJywgJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnXSk7XHJcblxyXG5cdFx0aWYgKHRoaXMuaXNEb3VibGVDbGljayl7XHJcblx0XHRcdHRoaXMub25Eb3VibGVDbGljayhldmVudClcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHRcdFx0LmFkZCh0aGlzLiR0YWJsZSlcclxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcclxuXHJcblx0XHRvcC4kbGVmdENvbHVtblxyXG5cdFx0XHQuYWRkKG9wLiRyaWdodENvbHVtbilcclxuXHRcdFx0LmFkZChvcC4kY3VycmVudEdyaXApXHJcblx0XHRcdC5yZW1vdmVDbGFzcyhDTEFTU19DT0xVTU5fUkVTSVpJTkcpO1xyXG5cclxuXHRcdHRoaXMuY2hlY2tUYWJsZVdpZHRoKCk7XHJcblx0XHR0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcclxuXHRcdHRoaXMucmVmcmVzaFdyYXBwZXJTdHlsZSgpO1xyXG5cdFx0dGhpcy5zYXZlQ29sdW1uV2lkdGhzKCk7XHJcblxyXG5cdFx0dGhpcy5vcGVyYXRpb24gPSBudWxsO1xyXG5cclxuXHRcdHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChFVkVOVF9SRVNJWkVfU1RPUCwgW1xyXG5cdFx0XHRvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLFxyXG5cdFx0XHRvcC5uZXdXaWR0aHMubGVmdCwgb3AubmV3V2lkdGhzLnJpZ2h0XHJcblx0XHRdLFxyXG5cdFx0ZXZlbnQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzLCBkYXRhLCBhbmQgYWRkZWQgRE9NIGVsZW1lbnRzLiBUYWtlc1xyXG5cdHRoZSA8dGFibGUvPiBlbGVtZW50IGJhY2sgdG8gaG93IGl0IHdhcywgYW5kIHJldHVybnMgaXRcclxuXHJcblx0QG1ldGhvZCBkZXN0cm95XHJcblx0QHJldHVybiB7alF1ZXJ5fSBPcmlnaW5hbCBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnRcclxuXHQqKi9cclxuXHRkZXN0cm95KCkge1xyXG5cdFx0bGV0ICR0YWJsZSA9IHRoaXMuJHRhYmxlO1xyXG5cdFx0bGV0ICRoYW5kbGVzID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyLmZpbmQoJy4nK0NMQVNTX0hBTkRMRSk7XHJcblxyXG5cdFx0dGhpcy51bmJpbmRFdmVudHMoXHJcblx0XHRcdHRoaXMuJHdpbmRvd1xyXG5cdFx0XHRcdC5hZGQodGhpcy4kb3duZXJEb2N1bWVudClcclxuXHRcdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxyXG5cdFx0XHRcdC5hZGQoJGhhbmRsZXMpXHJcblx0XHQpO1xyXG5cclxuXHRcdCR0YWJsZS5yZW1vdmVEYXRhKERBVEFfQVBJKTtcclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIucmVtb3ZlKCk7XHJcblx0XHRpZiAodGhpcy4kdGFibGVXcmFwcGVyICE9IG51bGwpIHtcclxuXHRcdFx0dGhpcy4kdGFibGUuaW5zZXJ0QmVmb3JlKHRoaXMuJHRhYmxlV3JhcHBlcik7XHJcblx0XHRcdHRoaXMuJHRhYmxlV3JhcHBlci5yZW1vdmUoKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9IG51bGw7XHJcblx0XHR0aGlzLiR0YWJsZVdyYXBwZXIgPSBudWxsO1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzID0gbnVsbDtcclxuXHRcdHRoaXMuJHRhYmxlID0gbnVsbDtcclxuXHJcblx0XHRyZXR1cm4gJHRhYmxlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QmluZHMgZ2l2ZW4gZXZlbnRzIGZvciB0aGlzIGluc3RhbmNlIHRvIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgYmluZEV2ZW50c1xyXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byBiaW5kIGV2ZW50cyB0b1xyXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIGJpbmRcclxuXHRAcGFyYW0gc2VsZWN0b3JPckNhbGxiYWNrIHtTdHJpbmd8RnVuY3Rpb259IFNlbGVjdG9yIHN0cmluZyBvciBjYWxsYmFja1xyXG5cdEBwYXJhbSBbY2FsbGJhY2tdIHtGdW5jdGlvbn0gQ2FsbGJhY2sgbWV0aG9kXHJcblx0KiovXHJcblx0YmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spIHtcclxuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XHJcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2ssIGNhbGxiYWNrKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHQkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFVuYmluZHMgZXZlbnRzIHNwZWNpZmljIHRvIHRoaXMgaW5zdGFuY2UgZnJvbSB0aGUgZ2l2ZW4gdGFyZ2V0IERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHVuYmluZEV2ZW50c1xyXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byB1bmJpbmQgZXZlbnRzIGZyb21cclxuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byB1bmJpbmRcclxuXHQqKi9cclxuXHR1bmJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzKSB7XHJcblx0XHRpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihldmVudHMgIT0gbnVsbCkge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZXZlbnRzID0gdGhpcy5ucztcclxuXHRcdH1cclxuXHJcblx0XHQkdGFyZ2V0Lm9mZihldmVudHMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0VHJpZ2dlcnMgYW4gZXZlbnQgb24gdGhlIDx0YWJsZS8+IGVsZW1lbnQgZm9yIGEgZ2l2ZW4gdHlwZSB3aXRoIGdpdmVuXHJcblx0YXJndW1lbnRzLCBhbHNvIHNldHRpbmcgYW5kIGFsbG93aW5nIGFjY2VzcyB0byB0aGUgb3JpZ2luYWxFdmVudCBpZlxyXG5cdGdpdmVuLiBSZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIHRyaWdnZXJlZCBldmVudC5cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHRyaWdnZXJFdmVudFxyXG5cdEBwYXJhbSB0eXBlIHtTdHJpbmd9IEV2ZW50IG5hbWVcclxuXHRAcGFyYW0gYXJncyB7QXJyYXl9IEFycmF5IG9mIGFyZ3VtZW50cyB0byBwYXNzIHRocm91Z2hcclxuXHRAcGFyYW0gW29yaWdpbmFsRXZlbnRdIElmIGdpdmVuLCBpcyBzZXQgb24gdGhlIGV2ZW50IG9iamVjdFxyXG5cdEByZXR1cm4ge01peGVkfSBSZXN1bHQgb2YgdGhlIGV2ZW50IHRyaWdnZXIgYWN0aW9uXHJcblx0KiovXHJcblx0dHJpZ2dlckV2ZW50KHR5cGUsIGFyZ3MsIG9yaWdpbmFsRXZlbnQpIHtcclxuXHRcdGxldCBldmVudCA9ICQuRXZlbnQodHlwZSk7XHJcblx0XHRpZihldmVudC5vcmlnaW5hbEV2ZW50KSB7XHJcblx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQgPSAkLmV4dGVuZCh7fSwgb3JpZ2luYWxFdmVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLnRyaWdnZXIoZXZlbnQsIFt0aGlzXS5jb25jYXQoYXJncyB8fCBbXSkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q2FsY3VsYXRlcyBhIHVuaXF1ZSBjb2x1bW4gSUQgZm9yIGEgZ2l2ZW4gY29sdW1uIERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdlbmVyYXRlQ29sdW1uSWRcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIGNvbHVtbiBlbGVtZW50XHJcblx0QHJldHVybiB7U3RyaW5nfSBDb2x1bW4gSURcclxuXHQqKi9cclxuXHRnZW5lcmF0ZUNvbHVtbklkKCRlbCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2VuZXJhdGVUYWJsZUlkKCkgKyAnLScgKyAkZWwuZGF0YShEQVRBX0NPTFVNTl9JRCkucmVwbGFjZSgvXFwuL2csICdfJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRDYWxjdWxhdGVzIGEgdW5pcXVlIElEIGZvciBhIHRhYmxlJ3MgKERPTUVsZW1lbnQpICdhYnNvbHV0ZVdpZHRocycgb3B0aW9uXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBnZW5lcmF0ZVRhYmxlQWJzb2x1dGVXaWR0aHNJZFxyXG5cdEByZXR1cm4ge1N0cmluZ30gSURcclxuXHQqKi9cclxuXHRnZW5lcmF0ZVRhYmxlQWJzb2x1dGVXaWR0aHNJZCgpIHtcclxuXHRcdHJldHVybiB0aGlzLiR0YWJsZS5kYXRhKERBVEFfQ09MVU1OU19JRCkucmVwbGFjZSgvXFwuL2csICdfJykgKyAnLS1hYnNvbHV0ZS13aWR0aHMnO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q2FsY3VsYXRlcyBhIHVuaXF1ZSBJRCBmb3IgYSBnaXZlbiB0YWJsZSBET01FbGVtZW50XHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBnZW5lcmF0ZVRhYmxlSWRcclxuXHRAcmV0dXJuIHtTdHJpbmd9IFRhYmxlIElEXHJcblx0KiovXHJcblx0Z2VuZXJhdGVUYWJsZUlkKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLmRhdGEoREFUQV9DT0xVTU5TX0lEKS5yZXBsYWNlKC9cXC4vZywgJ18nKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBhcnNlcyBhIGdpdmVuIERPTUVsZW1lbnQncyB3aWR0aCBpbnRvIGEgZmxvYXRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHBhcnNlV2lkdGhcclxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBnZXQgd2lkdGggb2ZcclxuXHRAcmV0dXJuIHtOdW1iZXJ9IEVsZW1lbnQncyB3aWR0aCBhcyBhIGZsb2F0XHJcblx0KiovXHJcblx0cGFyc2VXaWR0aChlbGVtZW50KSB7XHJcblx0XHRyZXR1cm4gZWxlbWVudCA/IHBhcnNlRmxvYXQoZWxlbWVudC5zdHlsZS53aWR0aC5yZXBsYWNlKCh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMgPyAncHgnIDogJyUnKSwgJycpKSA6IDA7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRTZXRzIHRoZSB3aWR0aCBvZiBhIGdpdmVuIERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHNldFdpZHRoXHJcblx0QHBhcmFtIGVsZW1lbnQge0RPTUVsZW1lbnR9IEVsZW1lbnQgdG8gc2V0IHdpZHRoIG9uXHJcblx0QHBhcmFtIHdpZHRoIHtOdW1iZXJ9IFdpZHRoIHRvIHNldFxyXG5cdCoqL1xyXG5cdHNldFdpZHRoKGVsZW1lbnQsIHdpZHRoKSB7XHJcblx0XHR3aWR0aCA9IHdpZHRoLnRvRml4ZWQoMik7XHJcblx0XHR3aWR0aCA9IHdpZHRoID4gMCA/IHdpZHRoIDogMDtcclxuXHRcdGVsZW1lbnQuc3R5bGUud2lkdGggPSB3aWR0aCArICh0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMgPyAncHgnIDogJyUnKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdENvbnN0cmFpbnMgYSBnaXZlbiB3aWR0aCB0byB0aGUgbWluaW11bSBhbmQgbWF4aW11bSByYW5nZXMgZGVmaW5lZCBpblxyXG5cdHRoZSBgbWluV2lkdGhgIGFuZCBgbWF4V2lkdGhgIGNvbmZpZ3VyYXRpb24gb3B0aW9ucywgcmVzcGVjdGl2ZWx5LlxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgY29uc3RyYWluV2lkdGhcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIERPTUVsZW1lbnRcclxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGggdG8gY29uc3RyYWluXHJcblx0QHJldHVybiB7TnVtYmVyfSBDb25zdHJhaW5lZCB3aWR0aFxyXG5cdCoqL1xyXG5cdGNvbnN0cmFpbldpZHRoKCRlbCwgd2lkdGgpIHtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMubWluV2lkdGggIT0gdW5kZWZpbmVkIHx8IHRoaXMub3B0aW9ucy5vYmV5Q3NzTWluV2lkdGgpIHtcclxuXHRcdFx0d2lkdGggPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluV2lkdGgsIHdpZHRoLCAkZWwuZGF0YShEQVRBX0NTU19NSU5fV0lEVEgpKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLm1heFdpZHRoICE9IHVuZGVmaW5lZCB8fCB0aGlzLm9wdGlvbnMub2JleUNzc01heFdpZHRoKSB7XHJcblx0XHRcdHdpZHRoID0gTWF0aC5taW4odGhpcy5vcHRpb25zLm1heFdpZHRoLCB3aWR0aCwgJGVsLmRhdGEoREFUQV9DU1NfTUFYX1dJRFRIKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0d2lkdGggPSBNYXRoLm1heCgwLCB3aWR0aCk7XHJcbiBcdFx0d2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMuYWJzb2x1dGVXaWR0aHMgPyB0aGlzLiR0YWJsZS53aWR0aCgpIDogMTAwLCB3aWR0aCk7XHJcblxyXG5cdFx0cmV0dXJuIHdpZHRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0R2l2ZW4gYSBwYXJ0aWN1bGFyIEV2ZW50IG9iamVjdCwgcmV0cmlldmVzIHRoZSBjdXJyZW50IHBvaW50ZXIgb2Zmc2V0IGFsb25nXHJcblx0dGhlIGhvcml6b250YWwgZGlyZWN0aW9uLiBBY2NvdW50cyBmb3IgYm90aCByZWd1bGFyIG1vdXNlIGNsaWNrcyBhcyB3ZWxsIGFzXHJcblx0cG9pbnRlci1saWtlIHN5c3RlbXMgKG1vYmlsZXMsIHRhYmxldHMgZXRjLilcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdldFBvaW50ZXJYXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0QHJldHVybiB7TnVtYmVyfSBIb3Jpem9udGFsIHBvaW50ZXIgb2Zmc2V0XHJcblx0KiovXHJcblx0Z2V0UG9pbnRlclgoZXZlbnQpIHtcclxuXHRcdGlmIChldmVudC50eXBlLmluZGV4T2YoJ3RvdWNoJykgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuIChldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0gfHwgZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXSkucGFnZVg7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZXZlbnQucGFnZVg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRHZXRzIHRoZSB0ZXh0IHdpZHRoIG9mIGFuIGVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdldFRleHRXaWR0aFxyXG5cdEBwYXJhbSAkZWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSB0ZXh0XHJcblx0QHBhcmFtICRmYWtlRWwge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0aGF0IHdpbGwgYmUgdXNlZCB0byBtZWFzdXJlIHRoZSB3aWR0aFxyXG5cdEByZXR1cm4ge051bWJlcn0gVGV4dCB3aWR0aFxyXG5cdCoqL1xyXG5cdGdldFRleHRXaWR0aCgkZWwsICRmYWtlRWwpIHtcclxuXHRcdHZhciB0ZXh0ID0gJGVsLnRleHQoKS50cmltKCkucmVwbGFjZSgvXFxzL2csICcmbmJzcDsnKSArICcmbmJzcDsnOyAvL2FkZCBleHRyYSBzcGFjZSB0byBlbnN1cmUgd2UgYXJlIG5vdCBlbGlwc2luZyBhbnl0aGluZ1xyXG5cdFx0cmV0dXJuICRmYWtlRWwuY3NzKHtcclxuXHRcdFx0J2ZvbnRGYW1pbHknOiAkZWwuY3NzKCdmb250RmFtaWx5JyksXHJcblx0XHRcdCdmb250U2l6ZSc6ICRlbC5jc3MoJ2ZvbnRTaXplJyksXHJcblx0XHRcdCdmb250V2VpZ2h0JzogJGVsLmNzcygnZm9udFdlaWdodCcpLFxyXG5cdFx0XHQncGFkZGluZyc6ICRlbC5jc3MoJ3BhZGRpbmcnKSxcclxuXHRcdFx0J2JvcmRlcic6ICRlbC5jc3MoJ2JvcmRlcicpfSlcclxuXHRcdC5odG1sKHRleHQpXHJcblx0XHQub3V0ZXJXaWR0aCh0cnVlKTtcclxuXHR9XHJcblxyXG5cdHNob3VsZFdyYXAoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLndyYXBwVGFibGUgfHwgdGhpcy5vcHRpb25zLmFic29sdXRlV2lkdGhzO1xyXG5cdH1cclxufVxyXG5cclxuUmVzaXphYmxlQ29sdW1ucy5kZWZhdWx0cyA9IHtcclxuXHRzZWxlY3RvcjogZnVuY3Rpb24oJHRhYmxlKSB7XHJcblx0XHRpZigkdGFibGUuZmluZCgndGhlYWQnKS5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIFNFTEVDVE9SX1RIO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBTRUxFQ1RPUl9URDtcclxuXHR9LFxyXG5cdHN0b3JlOiB3aW5kb3cuc3RvcmUsXHJcblx0c3luY0hhbmRsZXJzOiB0cnVlLFxyXG5cdHJlc2l6ZUZyb21Cb2R5OiB0cnVlLFxyXG5cdG1heFdpZHRoOiBudWxsLFxyXG5cdG1pbldpZHRoOiAwLjAxLFxyXG5cdG9iZXlDc3NNaW5XaWR0aDogZmFsc2UsXHJcbiBcdG9iZXlDc3NNYXhXaWR0aDogZmFsc2UsXHJcblx0YWJzb2x1dGVXaWR0aHM6IGZhbHNlLFxyXG5cdGRvdWJsZUNsaWNrRGVsYXk6IDUwMCxcclxuXHR3cmFwcFRhYmxlOiBmYWxzZVxyXG59O1xyXG5cclxuUmVzaXphYmxlQ29sdW1ucy5jb3VudCA9IDA7XHJcbiIsImV4cG9ydCBjb25zdCBEQVRBX0FQSSA9ICdyZXNpemFibGVDb2x1bW5zJztcclxuZXhwb3J0IGNvbnN0IERBVEFfQ09MVU1OU19JRCA9ICdyZXNpemFibGVDb2x1bW5zSWQnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5fSUQgPSAncmVzaXphYmxlQ29sdW1uSWQnO1xyXG5leHBvcnQgY29uc3QgREFUQV9DU1NfTUlOX1dJRFRIID0gJ2Nzc01pbldpZHRoJztcclxuZXhwb3J0IGNvbnN0IERBVEFfQ1NTX01BWF9XSURUSCA9ICdjc3NNYXhXaWR0aCc7XHJcblxyXG5leHBvcnQgY29uc3QgQ0xBU1NfQUJTT0xVVEUgPSAncmMtYWJzb2x1dGUnO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfVEFCTEVfUkVTSVpJTkcgPSAncmMtdGFibGUtcmVzaXppbmcnO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfQ09MVU1OX1JFU0laSU5HID0gJ3JjLWNvbHVtbi1yZXNpemluZyc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEUgPSAncmMtaGFuZGxlJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX0hBTkRMRV9DT05UQUlORVIgPSAncmMtaGFuZGxlLWNvbnRhaW5lcic7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19UQUJMRV9XUkFQUEVSID0gJ3JjLXRhYmxlLXdyYXBwZXInO1xyXG5cclxuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRV9TVEFSVCA9ICdjb2x1bW46cmVzaXplOnN0YXJ0JztcclxuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRSA9ICdjb2x1bW46cmVzaXplJztcclxuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRV9TVE9QID0gJ2NvbHVtbjpyZXNpemU6c3RvcCc7XHJcblxyXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEggPSAndHI6Zmlyc3QgPiB0aDp2aXNpYmxlJztcclxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1REID0gJ3RyOmZpcnN0ID4gdGQ6dmlzaWJsZSc7XHJcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9VTlJFU0laQUJMRSA9IGBbZGF0YS1ub3Jlc2l6ZV1gO1xyXG5cclxuZXhwb3J0IGNvbnN0IEFUVFJJQlVURV9VTlJFU0laQUJMRSA9ICdkYXRhLW5vcmVzaXplJztcclxuIiwiaW1wb3J0IFJlc2l6YWJsZUNvbHVtbnMgZnJvbSAnLi9jbGFzcyc7XHJcbmltcG9ydCBhZGFwdGVyIGZyb20gJy4vYWRhcHRlcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSZXNpemFibGVDb2x1bW5zOyJdfQ==
