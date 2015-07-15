    function $id(id) {
        return document.getElementById(id);
    }

    var info;

    var pageSlider = new PageSlider({
        pageClassName: "page",
        swipeHolder: "swipeArea",
    });


    var controller = new Toucher.Controller({
        preventDefaultMove: true,
        moveInterval: 18,
        beforeInit: function() {
            this.dom = document.body;
        }
    });

    //创建一个tap listener的实例
    var swipe = new Toucher.Swipe({
        minDistance: 40,

        filterWrapper: function(type, wrapper, event, controller) {
            return pageSlider.swipeHolder.contains(wrapper.target);
        },
        start: function() {
            var cl = pageSlider.pageContainer.classList;
            cl.remove("page-tween");
            cl.remove("end-tween");
        },
        move: function(wrappers, event, controller) {
            var t0 = wrappers[0];
            var dy = t0.deltaY;
            pageSlider.scrollBy(0, dy);
        },
        onTouchEnd: function(x, y, wrapper, event, controller) {
            pageSlider.align();
        },
        onSwipe: function(velX, velY, wrapper, event, controller) {
            info.innerHTML = "Swipe vel:  " + velX.toFixed(4) + ", " + velY.toFixed(4) + "";
            if (velY < -0.2) {
                pageSlider.nextPage();
            } else if (velY > 0.2) {
                pageSlider.prevPage();
            }
        }
    });


    window.onload = function() {
        info = $id("info");
        pageSlider.init();

        controller.init();
        controller.addListener(swipe);

    }
