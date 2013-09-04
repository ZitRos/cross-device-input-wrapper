var hid = new function() {

    var pointer = {
        stack: {
            /*
             0:  {
             x: 0,
             y: 0,
             originX: 0,
             originY: 0,
             state: 0,
             target: null
             }
             */
        },
        principal: { // principal pointer holds last registered pointer data.
            x: 0,
            y: 0,
            originX: 0,
            originY: 0,
            state: 0,
            target: null
        },
        binds: {
            pointStart: {

            },
            pointMove: {

            },
            pointEnd: {

            }
        },
        STATES: {
            NONE: 0,
            PRESS: 1,
            MOVE: 2,
            RELEASE: 3
        },
        pointers: 0 // number of current pointers
    };

    // updates pointer
    var updatePointer = function(id, pointerObject) {
        if (!pointer.stack.hasOwnProperty(id)) return;
        pointer.stack[id].merge(pointerObject);
    };

    // removes pointer
    var removePointer = function(id) {
        if (!pointer.stack.hasOwnProperty(id)) return;
        delete pointer.stack[id];
    };

    /**
     * Returns principal pointer object.
     *
     * @returns {*}
     */
    this.pointer = function() { return pointer.principal };

    var handlers = {

        pointStart: function(id, x, y, target) {

            var currentPointer = {
                id: id,
                x: x,
                y: y,
                originX: x,
                originY: y,
                state: pointer.STATES.PRESS,
                target: target
            };
            pointer.principal = currentPointer;
            pointer.stack[id] = currentPointer;
            pointer.binds.pointStart.foreach(function(name){
                this[name].call(target, currentPointer)
            });

        },

        pointMove: function(id, x, y) {

            var currentPointer = {
                id: id,
                x: x,
                y: y,
                state: pointer.STATES.MOVE
            };
            pointer.principal.merge(currentPointer);

            if (!pointer.stack.hasOwnProperty(id)) return;
            updatePointer(id, currentPointer);
            pointer.binds.pointMove.foreach(function(name){
                this[name].call(null, pointer.stack[id])
            });

        },

        pointEnd: function(id, x, y) {

            var currentPointer = {
                id: id,
                x: x,
                y: y,
                state: pointer.STATES.RELEASE,
                target: null
            };
            if (!pointer.stack.hasOwnProperty(id)) return;
            pointer.binds.pointEnd.foreach(function(name){
                this[name].call(null, currentPointer.stack[id])
            });
            removePointer(id);
        }

    };

    /**
     * Binds cross-application event.
     *
     * @param event
     * @param callback
     */
    this.bindPointer = function(event, callback) {
        if (pointer.binds.hasOwnProperty(event)) {
            pointer.binds[event].append(callback);
        } else console.log("No such event \"" + event + "\" for pointer.binds")
    };

    /**
     * Cross-browser binding of browser events. For cross-browser application events use hid.bind method.
     *
     * @param event
     * @param element
     * @param handler
     */
    this.bindBrowserEvent = function (event, element, handler) {
        if (element.addEventListener) {
            element.addEventListener(event,handler,false);
        } else if (element.attachEvent) {
            element.attachEvent("on"+event, handler);
        } else {
            element[event] = handler;
        }
    };

    this.initialize = function() {

        var blockEvent = function(e) {
            e.returnValue = false;
            e.cancelBubble = true;
            if (e.preventDefault) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        this.bindBrowserEvent('touchstart', document, function(e){
            e = e || window.event;
            var target = e.target || e.srcElement;
            blockEvent(e);
            handlers.pointStart(e.touches[e.touches.length - 1].identifier, e.touches[e.touches.length - 1].pageX,
                e.touches[e.touches.length - 1].pageY, target);
            return false;
        });

        this.bindBrowserEvent('touchmove', document, function(e){
            e = e || window.event;
            blockEvent(e);
            e.changedTouches.foreach(function(el) {
                handlers.pointMove(this[el].identifier, this[el].pageX, this[el].pageY);
            });
            return false;
        });

        this.bindBrowserEvent('touchend', document, function(e){
            e = e || window.event;
            blockEvent(e);
            e.changedTouches.foreach(function(el) {
                handlers.pointEnd(this[el].identifier, this[el].pageX, this[el].pageY);
            });
            return false;
        });

        this.bindBrowserEvent('mousedown', document, function(e){
            if (!e) e = window.event;
            var target = e.target || e.toElement;
            handlers.pointStart(1, e.pageX, e.pageY, target)
        });

        this.bindBrowserEvent('mouseup', document, function(e){
            if (!e) e = window.event;
            handlers.pointEnd(1, e.pageX, e.pageY)
        });

        this.bindBrowserEvent('mousemove', document, function(e){
            if (!e) e = window.event;
            handlers.pointMove(1, e.pageX, e.pageY)
        });

    };

};