data={};
scale=1.5;
function setup() {

  if (parent.location.hash.length > 1) {
    try {
      var http = new XMLHttpRequest();
      hash = parent.location.hash.substr(1);
      // alert(hash);
      http.open("POST", "./index.php", true);
      http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      var params = "retrieve=" + hash; // probably use document.getElementById(...).value
      http.send(params);
      http.onload = function() {
        console.log(http.responseText);
          if(http.responseText=="ERROR")alert("Error: could not load ");
          else {data=JSON.parse(http.responseText);
          console.log(data);
          load();}

      }
    } catch (err) {
      alert("Error: could not load board", "red", 2000);
    }
  }

  mirrorList = [];
  sphericalMirrorList = [];
  radialSourceList = [];
  lightBeamList = [];
  lightRayList = [];
  width = window.innerWidth*scale;
  height = window.innerHeight*scale;
  // console.log(width+":"+height);
  simulationArea.reset=true;
  uiArea.setup();
  simulationArea.setup();
  exportArea.setup();

}
function load(){
  if(typeof(data)=="undefined")return;
  if(typeof(data["mirrorList"])!="undefined")
  for (var i=0;i<data["mirrorList"].length;i++){
    var m=data["mirrorList"][i];
    mirrorList.push(new mirror(m["x"],m["y"],m["width"],m["angle"]));
    console.log(m);
  }
  if(typeof(data["radialSourceList"])!="undefined")
  for (var i=0;i<data["radialSourceList"].length;i++){
    var m=data["radialSourceList"][i];
    radialSourceList.push(new radialSource(m["x"],m["y"]));
    console.log(m);
  }
  if(typeof(data["lightBeamList"])!="undefined")
  for (var i=0;i<data["lightBeamList"].length;i++){
    var m=data["lightBeamList"][i];
    lightBeamList.push(new lightBeam(m["x"],m["y"],m["width"],m["angle"]));
    console.log(m);
  }
  if(typeof(data["lightRayList"])!="undefined")
  for (var i=0;i<data["lightRayList"].length;i++){
    var m=data["lightRayList"][i];
    lightRayList.push(new lightRaySource(m["x"],m["y"],m["width"],m["angle"]));
    console.log(m);
  }
  if(typeof(data["sphericalMirrorList"])!="undefined")
  for (var i=0;i<data["sphericalMirrorList"].length;i++){
    var m=data["sphericalMirrorList"][i];
    sphericalMirrorList.push(new sphericalMirror(m["x"],m["y"],m["radius"],m["t1"],m["t2"],m["t3"]));
    console.log(m);
  }
}
function resetup() {

    width = window.innerWidth*scale;
    height = window.innerHeight*scale;
    simulationArea.reset=true;
    uiArea.setup();
    simulationArea.setup();
    exportArea.setup();
}

function extract(obj){
  return obj.save();
}

// submitForm();
function save(){
  var data={};

  data["mirrorList"]=mirrorList.map(extract);
  data["sphericalMirrorList"]=sphericalMirrorList.map(extract);
  data["lightRayList"]=lightRayList.map(extract);
  data["radialSourceList"]=radialSourceList.map(extract);
  data["lightBeamList"]=lightBeamList.map(extract);
  data=JSON.stringify(data)
  console.log(data);

  var http = new XMLHttpRequest();
  http.open("POST", "./index.php", true);
  http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  var params = "data=" + data; // probably use document.getElementById(...).value
  http.send(params);

  http.onload = function() {
    parent.location.hash = http.responseText;
  }

}

window.onresize = resetup;
window.addEventListener('orientationchange', resetup);

function addMirror() {
    mirrorList.push(new mirror(Math.random() * width * .6 + width * .1, Math.random() * height * .8 + height * .1, 200*scale, 0));
}

function addSphericalMirror() {
    sphericalMirrorList.push(new sphericalMirror(Math.random() * width * .6 + width * .2, Math.random() * height * .6 + height * .2, 75*scale));
}

function addLightBeam() {
    lightBeamList.push(new lightBeam(Math.random() * width * .6 + width * .1, Math.random() * height * .3 + height * .6, 150*scale, -Math.PI / 2));
}

function addLightRay() {
    lightRayList.push(new lightRaySource(Math.random() * width * .6 + width * .1, Math.random() * height * .3 + height * .6, 150*scale, -Math.PI / 2));
}

function addRadialSource() {
    radialSourceList.push(new radialSource(Math.random() * width * .6 + width * .1, Math.random() * height * .8 + height * .1));
}

function TANangle(x1, y1, x2, y2) {
    if (x1 - x2 == 0) {
        ang = -Math.PI / 2;
    } else {
        ang = Math.atan((y1 - y2) / (x1 - x2));
    }
    if (ang < 0 && y1 > y2) {
        ang += Math.PI;
    } else if (ang > 0 && x1 < x2) {
        ang += Math.PI;
    }
    if (ang < 0) {
        ang += 2 * Math.PI;
    }
    return ang;
}

var uiArea = {
    canvas: document.getElementById("uiArea"),
    selected: false,

    setup: function() {
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        window.addEventListener('mousemove', function(e) {
            var rect = uiArea.canvas.getBoundingClientRect();
            uiArea.mouseX = (e.clientX - rect.left)*scale;
            uiArea.mouseY = (e.clientY - rect.top)*scale;
        });
        window.addEventListener('mousedown', function(e) {
            var rect = uiArea.canvas.getBoundingClientRect();
            uiArea.mouseDownX = (e.clientX - rect.left)*scale;
            uiArea.mouseDownY = (e.clientY - rect.top)*scale;
            uiArea.mouseDown = true;
        });
        window.addEventListener('touchstart', function(e) {
            var rect = uiArea.canvas.getBoundingClientRect();

            uiArea.mouseDownX = (e.touches[0].clientX-rect.left)*scale;
            uiArea.mouseDownY = (e.touches[0].clientY-rect.top)*scale;
            uiArea.mouseX = (e.touches[0].clientX- rect.left)*scale;
            uiArea.mouseY = (e.touches[0].clientY- rect.top)*scale;
            console.log(uiArea.mouseDownX+":"+uiArea.mouseDownY);
            uiArea.mouseDown = true;
        });
        window.addEventListener('touchend', function(e) {
            var rect = uiArea.canvas.getBoundingClientRect();
            uiArea.mouseDown = false;
        });
        window.addEventListener('touchleave', function(e) {
            var rect = uiArea.canvas.getBoundingClientRect();
            uiArea.mouseDown = false;
        });
        window.addEventListener('mouseup', function(e) {
            var rect = uiArea.canvas.getBoundingClientRect();
            uiArea.mouseDownX = (e.clientX - rect.left)*scale;
            uiArea.mouseDownY = (e.clientY - rect.top)*scale;
            uiArea.mouseDown = false;
        });
        window.addEventListener('touchmove', function (e) {
           var rect = uiArea.canvas.getBoundingClientRect();
            uiArea.mouseX = (e.touches[0].clientX- rect.left)*scale;
            uiArea.mouseY = (e.touches[0].clientY- rect.top)*scale;
        })
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

var simulationArea = {
    canvas: document.getElementById("simulationArea"),
    reset: false,
    reflectionFrequency:1,
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

var exportArea = {
    canvas: document.getElementById("exportArea"),
    reset: false,
    export:false,
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
    for (var i = 0; i < sphericalMirrorList.length; i++)
        sphericalMirrorList[i].update();
    // sm.update();

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
        }
        if (this.simulationOver) return;

        var freq=simulationArea.reflectionFrequency;
        if(simulationArea.reset&&!exportArea.export)freq=1;
        for (var i = 0; i < freq &&!this.simulationOver; i++) {
            var xx = this.x + 100000 * Math.cos(this.angle);
            var yy = this.y + 100000 * Math.sin(this.angle);
            var closestDistance = 100000;
            var newAngle = this.angle;

            var solns = [];

            for (var i = 0; i < mirrorList.length; i++) {
                soln = solveMirrorEqn(this, mirrorList[i]);
                if (soln != null) solns.push(soln)
            }
            for (var i = 0; i < sphericalMirrorList.length; i++) {
                soln = solveSphericalMirrorEqn(this, sphericalMirrorList[i]);
                if (soln != null) solns.push(soln)
            }

            for (var i = 0; i < solns.length; i++) {
                if (solns[i]["distance"] < closestDistance) {
                    xx = solns[i]["x"];
                    yy = solns[i]["y"];
                    newAngle = solns[i]["angle"];
                    closestDistance = solns[i]["distance"];
                }
            }

            ctx = simulationArea.context;
            ctx.strokeStyle = ("rgba(255,255,0,1)");
            ctx.lineWidth=1*scale;
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
    this.sourceButton = new Button(x, y, 5*scale, "rgba(0,0,0,0)", "rgba(255,255,0,1)");
    this.save=function(){
      return{x:this.x,y:this.y};
    }
    this.reset = function() {
        this.rayList = [];
        for (var i = 0; i < 360; i += 18)
            this.rayList.push(new lightRay(this.x, this.y, i * Math.PI / 180));
    }
    this.reset();
    this.update = function() {
        var update = this.sourceButton.updatePosition();
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
    this.leftButton = new Button(x, y, 5*scale, "rgba(0,0,0,0)", "rgba(255,255,0,1)");
    this.rightButton = new Button(x + width * Math.cos(angle), y + width * Math.sin(angle), 5*scale, "rgba(0,0,0,0)", "rgba(255,255,0,1)");
    this.save=function(){
      return {"x":this.x,"y":this.y,width:this.width,angle:this.angle};
    }
    this.reset = function() {
        this.rayList = [];
        for (var i = 0; i < this.width; i += 10)
            this.rayList.push(new lightRay(this.x + i * Math.cos(this.angle), this.y + i * Math.sin(this.angle), this.angle + Math.PI / 2));

    }
    this.reset();
    this.update = function() {
        var update = false;
        update |= this.leftButton.updatePosition();
        update |= this.rightButton.updatePosition();
        if (update) {
            this.x = this.leftButton.x;
            this.y = this.leftButton.y;
            this.width = distance(this.leftButton.x, this.leftButton.y, this.rightButton.x, this.rightButton.y);
            this.angle = TANangle(this.rightButton.x, this.rightButton.y, this.leftButton.x, this.leftButton.y);

            simulationArea.reset = true;
        }
        var ctx = uiArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(0, -this.height / 2, this.width, this.height*scale);
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
    this.angle = angle;
    this.leftButton = new Button(x, y, 7*scale, "rgba(200,0,0,1)", "rgba(55,0,0,1)");
    this.rightButton = new Button(x + width * Math.cos(angle), y + width * Math.sin(angle), 7*scale, "rgba(120,0,0,1)", "rgba(220,0,0,1)");
    this.save=function(){
      return {"x":this.x,"y":this.y,width:this.width,angle:this.angle};
    }
    this.reset = function() {
        this.ray = new lightRay(this.x, this.y, this.angle);
    }
    this.reset();
    this.update = function() {
        var update = false;
        update |= this.leftButton.updatePosition();
        update |= this.rightButton.updatePosition();
        this.leftButton.update();
        this.rightButton.update();
        if (update) {
            this.x = this.leftButton.x;
            this.y = this.leftButton.y;
            this.width = distance(this.leftButton.x, this.leftButton.y, this.rightButton.x, this.rightButton.y);
            this.angle = TANangle(this.rightButton.x, this.rightButton.y, this.leftButton.x, this.leftButton.y);

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

        if ((res_y - lightRay.y) * Math.sin(lightRay.angle) > 0 && dis > 0.1) {
            if (((mirror.leftButton.x <= res_x && mirror.rightButton.x >= res_x) || (mirror.leftButton.x >= res_x && mirror.rightButton.x <= res_x)) && ((mirror.leftButton.y <= res_y && mirror.rightButton.y >= res_y) || (mirror.leftButton.y >= res_y && mirror.rightButton.y <= res_y)))
                return {
                    x: res_x,
                    y: res_y,
                    angle: 2 * mirror.angle - lightRay.angle,
                    distance: dis
                };
        }
        return null;
    }


}

function solveSphericalMirrorEqn(lightRay, sphericalMirror) {


    var r = sphericalMirror.radius;
    var p = sphericalMirror.x;
    var q = sphericalMirror.y;

    var a1 = -Math.tan(lightRay.angle);
    var b1 = 1;
    var c1 = -((lightRay.y - q) + a1 * (lightRay.x - p));
    var p2 = c1 / Math.sqrt(a1 * a1 + b1 * b1);
    var temp1 = a1 / Math.sqrt(a1 * a1 + b1 * b1);
    var t = Math.PI + Math.acos((temp1));
    var cos = p2 / r;

    if (Math.abs(cos) <= 1) {
        var t1 = Math.acos(cos) + t;
        var t2 = -(Math.acos(cos)) + t;
        var close_x;
        var close_y;
        var close_abs = -1;
        var close_angle;
        if (test_solution(t1, sphericalMirror)) {

            var res_x = p + r * Math.cos(t1);
            var res_y = q + r * Math.sin(t1);
            var dis = Math.abs(distance(res_x, res_y, lightRay.x, lightRay.y));
            if ((res_y - lightRay.y) * Math.sin(lightRay.angle) > 0 && dis > 0.1)
                if (dis < close_abs || close_abs == -1) {
                    close_x = res_x;
                    close_y = res_y;
                    close_abs = dis;
                    close_angle = -lightRay.angle + 2 * (t1) - Math.PI;
                }
        }
        if (test_solution(t2, sphericalMirror)) {
            var res_x = p + r * Math.cos(t2);
            var res_y = q + r * Math.sin(t2);
            var dis = Math.abs(distance(res_x, res_y, lightRay.x, lightRay.y));
            if ((res_y - lightRay.y) * Math.sin(lightRay.angle) > 0 && dis > 0.1)
                if (dis < close_abs || close_abs == -1) {
                    close_x = res_x;
                    close_y = res_y;
                    close_abs = dis;
                    close_angle = -lightRay.angle + 2 * (t2) - Math.PI;
                }
        }
        if (close_abs != -1) {
            return {
                x: close_x,
                y: close_y,
                angle: close_angle,
                distance: close_abs
            };
        }

    }
    return null;

}

function standard_angle(ang) {
    while (ang < 0) ang += 6.28;
    while (ang > 6.28) ang -= 6.28;
    return ang;
}

function test_solution(test, sphericalMirror) {
    test = standard_angle(test);
    if ((sphericalMirror.t3 > sphericalMirror.t1 && sphericalMirror.t1 > test && sphericalMirror.cas == 0)) return true;
    if ((sphericalMirror.t3 < sphericalMirror.t1 && sphericalMirror.t1 < test && sphericalMirror.cas == 1)) return true;
    if (sphericalMirror.t1 > test && test > sphericalMirror.t3 && sphericalMirror.cas == 0) return true;
    if (sphericalMirror.t1 < test && test < sphericalMirror.t3 && sphericalMirror.cas == 1) return true;
    if (sphericalMirror.t3 > sphericalMirror.t1 && test > sphericalMirror.t3 && test > sphericalMirror.t1 && sphericalMirror.cas == 0) return true;
    if (sphericalMirror.t1 > sphericalMirror.t3 && sphericalMirror.t3 > test && sphericalMirror.cas == 1) return true;
    return false;
}

function mirror(x, y, width, angle) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 5;
    this.angle = angle - .001;
    this.color = "yellow";
    this.leftButton = new Button(x, y, 7*scale, "rgba(0,0,0,0)", "rgba(255,255,0,1)");
    this.rightButton = new Button(x + width * Math.cos(angle), y + width * Math.sin(angle), 7*scale, "rgba(0,0,0,0)", "rgba(255,255,0,1)");
    this.updated = false;

    this.save=function(){
      return {"x":this.x,"y":this.y,width:this.width,angle:this.angle};
    }
    this.update = function() {
        this.updated &= !this.leftButton.updatePosition();
        this.updated &= !this.rightButton.updatePosition();

        this.x = this.leftButton.x;
        this.y = this.leftButton.y;
        // this.angle = Math.atan((this.leftButton.y - this.rightButton.y) / (this.leftButton.x - this.rightButton.x));
        // if (this.rightButton.x <= this.leftButton.x) this.angle += Math.PI;
        this.angle = TANangle(this.rightButton.x, this.rightButton.y, this.leftButton.x, this.leftButton.y);

        this.width = Math.sqrt(Math.pow(this.leftButton.y - this.rightButton.y, 2) + Math.pow(this.leftButton.x - this.rightButton.x, 2));
        var ctx = uiArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(0, -this.height / 2, this.width, this.height*scale);
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

function sphericalMirror(x, y, radius,t1=3*Math.PI/2,t2=Math.PI/2,t3=0) {

    this.color = "yellow";
    this.p1Button = new Button(x+ radius*Math.cos(t1), y + radius*Math.sin(t1), 4*scale, "rgba(255,0,0,1)", "rgba(255,255,0,1)");
    this.p2Button = new Button(x+ radius*Math.cos(t2), y + radius*Math.sin(t2), 4*scale, "rgba(255,0,0,1)", "rgba(255,255,0,1)");
    this.p3Button = new Button(x + radius*Math.cos(t3), y+ radius*Math.sin(t3), 4*scale, "rgba(255,0,0,1)", "rgba(255,255,0,1)");
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.cas = 0;
    this.updated = false;
    this.t1 = t1;
    this.t2 = t2;
    this.t3 = t3;

    this.save=function(){
      return {x:this.x,y:this.y,radius:this.radius,t1:this.t1,t2:this.t3,t3:this.t2};
    }
    this.update = function() {
        this.updated &= !this.p1Button.updatePosition();
        this.updated &= !this.p2Button.updatePosition();
        this.updated &= !this.p3Button.updatePosition();



        var a = this.p1Button.x;
        var b = this.p1Button.y;
        var c = this.p2Button.x;
        var d = this.p2Button.y;
        var e = this.p3Button.x;
        var f = this.p3Button.y;
        var a1 = 2 * (c - a);
        var b1 = 2 * (d - b);
        var c1 = a * a + b * b - c * c - d * d;
        var a2 = 2 * (e - c);
        var b2 = 2 * (f - d);
        var c2 = c * c + d * d - e * e - f * f;
        var p = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1);
        var q = ((c1 * a2 - c2 * a1) / (a1 * b2 - a2 * b1));
        var r = Math.sqrt(Math.pow(a - p, 2) + Math.pow(b - q, 2));
        var t1 = TANangle(a, b, p, q);
        var t3 = TANangle(c, d, p, q);
        var t2 = TANangle(e, f, p, q);

        var cas = -1;
        if ((t3 > t1 && t1 > t2)) cas = 0;
        if ((t3 < t1 && t1 < t2)) cas = 1;
        if (t1 > t2 && t2 > t3) cas = 0;
        if (t1 < t2 && t2 < t3) cas = 1;
        if (t3 > t1 && t2 > t3 && t2 > t1) cas = 0;
        if (t1 > t3 && t3 > t2) cas = 1;
        this.t1 = t1;
        this.t2 = t2;
        this.t3 = t3;
        this.x = p;
        this.y = q;
        this.radius = r;
        this.cas = cas;
        var ctx = uiArea.context;
        ctx.beginPath();
        ctx.lineWidth=3*scale;
        ctx.strokeStyle = this.color;
        // //console.log(t2+":"+t1+":"+t3);
        if (cas == 1) ctx.arc(p, q, r, t1, t3);
        else ctx.arc(p, q, r, t3, t1);
        ctx.stroke();
        this.p1Button.update();
        this.p2Button.update();
        this.p3Button.update();

        if (!this.updated) {
            simulationArea.reset = true;
            this.updated = true;
            return false;
        }
        return true;
    }

}

function Button(x, y, radius, color1, color2) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color1 = color1;
    this.color2 = color2;
    this.clicked = false;

    this.update = function() {

        if (this.clicked || (this.isHover() && !uiArea.selected)) {
            var ctx = uiArea.context;
            ctx.fillStyle = this.color2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
        } else {
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
        } else if (uiArea.mouseDown && !uiArea.selected) {
            uiArea.selected = this.clicked = this.hover = this.isClicked();
            return this.clicked;
        } else {
            if (this.clicked) uiArea.selected = false;
            this.clicked = false;
        }
        return false;
    }
    this.isClicked = function() {
        if (Math.pow(this.x - uiArea.mouseDownX, 2) + Math.pow(this.y - uiArea.mouseDownY, 2) < Math.pow(this.radius * 3, 2)) {
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
document.getElementById("addSphericalMirrorButton").addEventListener("click", addSphericalMirror);
document.getElementById("addRadialSourceButton").addEventListener("click", addRadialSource);
document.getElementById("addLightBeamButton").addEventListener("click", addLightBeam);
document.getElementById("addLightRayButton").addEventListener("click", addLightRay);
document.getElementById("saveButton").addEventListener("click", save);
function download() {
    simulationArea.reset=true;
    exportArea.export=true;
    simulationArea.context=exportArea.context;
    uiArea.context=exportArea.context;
    var temp=simulationArea.reflectionFrequency;
    simulationArea.reflectionFrequency=10000000;
    update();
    exportArea.export=false;
    simulationArea.reflectionFrequency=temp;
    simulationArea.context=simulationArea.canvas.getContext("2d");
    uiArea.context=uiArea.canvas.getContext("2d");
    var dt = exportArea.canvas.toDataURL('image/jpeg');
    console.log(dt);
    var anchor = document.createElement('a');
    anchor.href = dt;
    anchor.target = '_blank';
    anchor.download = "LightXlab.jpg";
    anchor.click();
    exportArea.clear();
    // this.href = dt;
};
document.getElementById("exportButton").addEventListener('click', download, false);
