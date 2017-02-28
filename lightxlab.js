var width = 540;
var height = 400;

function setup() {
    mirrorList = [];
    radialSourceList = [];
    lightBeamList=[];
    lightRayList=[];

    uiArea.setup();
    simulationArea.setup();

}

function addMirror() {
    mirrorList.push(new mirror(Math.random() * width * .6 + width * .1, Math.random() * height * .8 + height * .1, 200, 0));
}
function addLightBeam() {
    lightBeamList.push(new lightBeam(Math.random() * width * .6 + width * .1, Math.random() * height * .3 + height * .6, 150, -Math.PI/2));
}
function addLightRay() {
    lightRayList.push(new lightRaySource(Math.random() * width * .6 + width * .1, Math.random() * height * .3 + height * .6, 150, -Math.PI/2));
}
function addRadialSource() {
    radialSourceList.push(new radialSource(Math.random() * width * .6 + width * .1, Math.random() * height * .8 + height * .1));
}

var uiArea = {
    canvas: document.getElementById("uiArea"),
    selected:false,
    setup: function() {
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        window.addEventListener('mousemove', function(e) {
            var rect = uiArea.canvas.getBoundingClientRect();
            uiArea.mouseX = e.clientX - rect.left;
            uiArea.mouseY = e.clientY - rect.top;
        });
        window.addEventListener('mousedown', function(e) {
            var rect = uiArea.canvas.getBoundingClientRect();
            uiArea.mouseDownX = e.clientX - rect.left;
            uiArea.mouseDownY = e.clientY - rect.top;
            uiArea.mouseDown = true;
        });
        window.addEventListener('mouseup', function(e) {
            var rect = uiArea.canvas.getBoundingClientRect();
            uiArea.mouseDownX = e.clientX - rect.left;
            uiArea.mouseDownY = e.clientY - rect.top;
            uiArea.mouseDown = false;
        });
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

var simulationArea = {
    canvas: document.getElementById("simulationArea"),
    reset: false,
    setup: function() {
        this.canvas.width = width;
        this.canvas.height = height;
        this.updated = false;
        this.context = this.canvas.getContext("2d");
        this.interval = setInterval(update, 20);

    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function update() {
    if (simulationArea.reset)
        simulationArea.clear();
    uiArea.clear();
    simulationArea.sourceChanged = false;
    for (var i = 0; i < radialSourceList.length; i++)
        simulationArea.sourceChanged |= radialSourceList[i].update();
    for (var i = 0; i < lightBeamList.length; i++)
        simulationArea.sourceChanged |= lightBeamList[i].update();
    for (var i = 0; i < lightRayList.length; i++)
        simulationArea.sourceChanged |= lightRayList[i].update();

    simulationArea.reset = false || simulationArea.sourceChanged;
    for (var i = 0; i < mirrorList.length; i++)
        mirrorList[i].update();

}

function lightRay(x, y, angle) {
    this.x = x;
    this.y = y;
    this.originalX = x;
    this.originalY = y;
    angle += .001;
    this.originalAngle = angle;
    this.angle = angle;
    this.simulationOver = false;
    this.reset = function() {
        this.x = this.originalX;
        this.y = this.originalY;
        this.angle = this.originalAngle;
        this.simulationOver = false;
    }

    this.update = function() {
        if (simulationArea.reset) {
            this.reset();
            // return;
        }
        if (this.simulationOver) return;

        for (var i = 0; i < 1; i++) {
            var xx = this.x + 100000 * Math.cos(this.angle);
            var yy = this.y + 100000 * Math.sin(this.angle);
            var closestDistance = 100000;
            var newAngle = this.angle;
            for (var i = 0; i < mirrorList.length; i++) {
                soln = solveMirrorEqn(this, mirrorList[i]);


                if (soln != null) {
                    if ( soln["distance"] < closestDistance) {
                        xx = soln["x"];
                        yy = soln["y"];
                        newAngle = soln["angle"];
                        closestDistance = soln["distance"];
                    }
                }
            }
            ctx = simulationArea.context;
            ctx.strokeStyle = ("rgba(255,255,0,1)");
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(xx, yy);
            ctx.stroke();
            ctx.closePath();
            this.x = xx;
            this.y = yy;
            this.angle = newAngle;
            if (closestDistance == 100000)
                this.simulationOver = true;
        }

    }
}

function radialSource(x, y) {
    this.x = x;
    this.y = y;
    this.rayList = [];
    this.sourceButton = new Button(x, y, 5);
    this.reset = function() {
        this.rayList = [];
        for (var i = 0; i < 360; i += 18)
            this.rayList.push(new lightRay(this.x, this.y, i * Math.PI / 180));\
    }
    this.reset();
    this.update = function() {
        var update=this.sourceButton.updatePosition();
        this.sourceButton.update();

        if (update) {
            this.x = this.sourceButton.x;
            this.y = this.sourceButton.y;
            simulationArea.reset = true;

        }
        if (simulationArea.reset) {
            this.reset();
            //return false;
        }
        for (var i = 0; i < this.rayList.length; i++)
            this.rayList[i].update();
        return update;
    }
}

function lightBeam(x, y, width, angle) {
    this.x = x;
    this.y = y;
    this.rayList = [];
    this.width = width;
    this.height = 5;
    this.angle = angle;
    this.color = "green";
    this.leftButton = new Button(x, y, 5,"rgba(0,0,0,0)","rgba(255,255,0,1)");
    this.rightButton = new Button(x + width * Math.cos(angle), y + width * Math.sin(angle), 5,"rgba(0,0,0,0)","rgba(255,255,0,1)");

    this.reset = function() {
        this.rayList = [];
        for (var i = 0; i < this.width; i += 10)
            this.rayList.push(new lightRay(this.x+i*Math.cos(this.angle), this.y+i*Math.sin(this.angle), this.angle+Math.PI/2));

    }
    this.reset();
    this.update = function() {
        var update=false;
        update|=this.leftButton.updatePosition();
        update|=this.rightButton.updatePosition();
        if (update) {
            this.x = this.leftButton.x;
            this.y = this.leftButton.y;
            this.width=distance(this.leftButton.x,this.leftButton.y,this.rightButton.x,this.rightButton.y);
            this.angle = Math.atan((this.leftButton.y - this.rightButton.y) / (this.leftButton.x - this.rightButton.x));
            if (this.rightButton.x <= this.leftButton.x) this.angle += Math.PI;
            simulationArea.reset = true;
        }
        var ctx = uiArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(0, -this.height / 2, this.width, this.height);
        ctx.restore();
        this.leftButton.update();
        this.rightButton.update();


        if (simulationArea.reset) {
             this.reset();
             //return false;
        }
        for (var i = 0; i < this.rayList.length; i++)
          this.rayList[i].update();
        return update;
    }
}

function lightRaySource(x, y, width, angle) {
    this.x = x;
    this.y = y;
    this.ray;
    this.width = width;
    this.height = 5;
    this.angle = angle;
    this.leftButton = new Button(x, y, 7,"rgba(200,0,0,1)","rgba(55,0,0,1)");
    this.rightButton = new Button(x + width * Math.cos(angle), y + width * Math.sin(angle), 7,"rgba(120,0,0,1)","rgba(220,0,0,1)");

    this.reset = function() {
        this.ray = new lightRay(this.x,this.y,this.angle);
    }
    this.reset();
    this.update = function() {
        var update=false;
        update|=this.leftButton.updatePosition();
        update|=this.rightButton.updatePosition();
        this.leftButton.update();
        this.rightButton.update();
        if (update) {
            this.x = this.leftButton.x;
            this.y = this.leftButton.y;
            this.width=distance(this.leftButton.x,this.leftButton.y,this.rightButton.x,this.rightButton.y);
            this.angle = Math.atan((this.leftButton.y - this.rightButton.y) / (this.leftButton.x - this.rightButton.x));
            if (this.rightButton.x <= this.leftButton.x) this.angle += Math.PI;
            simulationArea.reset = true;
        }
          if (simulationArea.reset) {
             this.reset();
             //return false;
        }
        this.ray.update();
        return update;
    }
}

function solveMirrorEqn(lightRay, mirror) {
    //a1 - lightRay
    //ax+by=c
    var a1 = -Math.tan(lightRay.angle);
    var b1 = 1;
    var c1 = a1 * lightRay.x + b1 * lightRay.y;

    var a2 = -Math.tan(mirror.angle);
    var b2 = 1;
    var c2 = +a2 * mirror.x + b2 * mirror.y;

    if ((a1 * b2) - (b1 * a2) == 0) {
        return null;
    } else {
        var res_x = ((c1 * b2) - (b1 * c2)) / ((a1 * b2) - (b1 * a2));
        var res_y = ((a1 * c2) - (c1 * a2)) / ((a1 * b2) - (b1 * a2));
        var dis = distance(lightRay.x, lightRay.y, res_x, res_y);

        if((res_y - lightRay.y) * Math.sin(lightRay.angle) > 0 && dis > 0.1){
        if (((mirror.leftButton.x <= res_x && mirror.rightButton.x >= res_x) || (mirror.leftButton.x >= res_x && mirror.rightButton.x <= res_x)) && ((mirror.leftButton.y <= res_y && mirror.rightButton.y >= res_y) || (mirror.leftButton.y >= res_y && mirror.rightButton.y <= res_y)))
            return {
                x: res_x,
                y: res_y,
                angle: 2 * mirror.angle - lightRay.angle,
                distance:dis
            };
        }
        return null;
    }


}

function mirror(x, y, width, angle) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 5;
    this.angle = angle-.001;
    this.color = "yellow";
    this.leftButton = new Button(x, y, 7,"rgba(0,0,0,0)","rgba(255,255,0,1)");
    this.rightButton = new Button(x + width * Math.cos(angle), y + width * Math.sin(angle), 7,"rgba(0,0,0,0)","rgba(255,255,0,1)");
    this.updated = false;

    this.update = function() {
        this.updated &= !this.leftButton.updatePosition();
        this.updated &= !this.rightButton.updatePosition();

        this.x = this.leftButton.x;
        this.y = this.leftButton.y;
        this.angle = Math.atan((this.leftButton.y - this.rightButton.y) / (this.leftButton.x - this.rightButton.x));
        if (this.rightButton.x <= this.leftButton.x) this.angle += Math.PI;
        this.width = Math.sqrt(Math.pow(this.leftButton.y - this.rightButton.y, 2) + Math.pow(this.leftButton.x - this.rightButton.x, 2));
        var ctx = uiArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(0, -this.height / 2, this.width, this.height);
        ctx.restore();
        this.leftButton.update();
        this.rightButton.update();

        if (!this.updated) {
            simulationArea.reset = true;
            this.updated = true;
            return false;
        }
        return true;
    }

}

function Button(x, y, radius,color1,color2) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color1 =color1 ;
    this.color2 =color2 ;
    this.clicked = false;

    this.update = function() {

      if(this.clicked||(this.isHover()&&!uiArea.selected)){
        var ctx = uiArea.context;
        ctx.fillStyle = this.color2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
      }else{
        var ctx = uiArea.context;
        ctx.fillStyle = this.color1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
      }

    }
    this.updatePosition = function() {
        if (uiArea.mouseDown && (this.clicked)) {
            this.x = uiArea.mouseX;
            this.y = uiArea.mouseY;
            return true;
        } else if (uiArea.mouseDown&&!uiArea.selected) {
            uiArea.selected=this.clicked = this.hover=this.isClicked();
            return true;
        }
        else {
            if(this.clicked)uiArea.selected=false;
            this.clicked = false;
        }
        return false;
    }
    this.isClicked = function() {
        if (Math.pow(this.x - uiArea.mouseDownX, 2) + Math.pow(this.y - uiArea.mouseDownY, 2) < Math.pow(this.radius * 2, 2)) {
            return true;
        }
        return false;
    }
    this.isHover = function() {
        if (Math.pow(this.x - uiArea.mouseX, 2) + Math.pow(this.y - uiArea.mouseY, 2) < Math.pow(this.radius * 2, 2)) {
            return true;
        }
        return false;
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

document.getElementById("addMirrorButton").addEventListener("click", addMirror);
document.getElementById("addRadialSourceButton").addEventListener("click", addRadialSource);
document.getElementById("addLightBeamButton").addEventListener("click", addLightBeam);
document.getElementById("addLightRayButton").addEventListener("click", addLightRay);
