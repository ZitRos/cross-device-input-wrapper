hid.bindPointer("pointMove", function(e) {

    if (e.target && e.target.tagName === "circle") {
        e.target.setAttribute("cx", e.x);
        e.target.setAttribute("cy", e.y);
    }

});