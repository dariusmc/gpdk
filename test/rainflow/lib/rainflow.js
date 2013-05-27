// Generated by CoffeeScript 1.6.1
(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    _this = this;

  this.Gamescore = (function() {

    function Gamescore() {}

    Gamescore.value = 0;

    Gamescore.increment = 100;

    Gamescore.initialLives = 2;

    Gamescore.lives = Gamescore.initialLives;

    Gamescore.increment_value = function() {
      return this.value += this.increment;
    };

    return Gamescore;

  })();

  this.Utils = (function() {

    function Utils() {}

    Utils.addChainedAttributeAccessor = function(obj, attr) {
      return obj[attr] = function() {
        var newValues;
        newValues = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (newValues.length === 0) {
          return obj['_' + attr];
        } else {
          obj['_' + attr] = newValues[0];
          obj.image.attr(attr, obj['_' + attr]);
          return obj;
        }
      };
    };

    Utils.timestamp = function() {
      return new Date().getTime();
    };

    Utils.angle = function(a) {
      return 2 * Math.PI * a / 360;
    };

    Utils.path_seg = function(p) {
      var a;
      a = p.pathSegTypeAsLetter;
      switch (a) {
        case 'M':
        case 'm':
          return [a, p.x, p.y].join(" ");
        case 'L':
        case 'l':
          return [a, p.x, p.y].join(" ");
        case 'A':
        case 'a':
          return [a, p.r, p.r, p.rot, p.c, p.d, p.x, p.y].join(" ");
        case 'C':
        case 'c':
          return [a, p.x1, p.y1, p.x2, p.y2, p.x, p.y].join(" ");
        case 'S':
        case 's':
          return [a, p.x2, p.y2, p.x, p.y].join(" ");
        case 'Q':
        case 'q':
          return [a, p.x1, p.y1, p.x, p.y].join(" ");
        case 'T':
        case 't':
          return [a, p.x, p.y].join(" ");
        case 'Z':
        case 'z':
          return a;
      }
    };

    Utils.d = function(path) {
      var p;
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = path.length; _i < _len; _i++) {
          p = path[_i];
          _results.push(this.path_seg(p));
        }
        return _results;
      }).call(this)).join(" ");
    };

    Utils.pathTween = function(d, i, a) {
      var interp, prec;
      prec = 4;
      interp = function(d, path) {
        var distances, dt, n0, n1, p, points;
        n0 = path.getTotalLength();
        p = path.cloneNode();
        p.setAttribute("d", d);
        n1 = p.getTotalLength();
        distances = [0];
        i = 0;
        dt = prec / Math.max(n0, n1);
        while ((i += dt) < 1) {
          distances.push(i);
        }
        distances.push(1);
        points = distances.map(function(t) {
          var p0, p1;
          p0 = path.getPointAtLength(t * n0);
          p1 = p.getPointAtLength(t * n1);
          return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
        });
        return function(t) {
          if (t < 1) {
            return "M" + points.map(function(p) {
              return p(t);
            }).join("L");
          } else {
            return d;
          }
        };
      };
      return interp(d, this);
    };

    return Utils;

  })();

  this.Element = (function() {

    function Element(config) {
      this.config = config != null ? config : {};
      this.dt = this.config.dt || 0.4;
      this.r = this.config.r || new Vec();
      this.dr = this.config.dr || new Vec();
      this.v = this.config.v || new Vec();
      this.f = this.config.f || new Vec();
      this.n = this.config.n || [];
      this.force_param = this.config.force_param || [new ForceParam()];
      this.size = this.config.size || 0;
      this.bb_width = this.config.bb_width || 0;
      this.bb_height = this.config.bb_height || 0;
      this.left = this.config.bb_width || 0;
      this.right = this.config.bb_height || 0;
      this.top = this.config.top || 0;
      this.bottom = this.config.bottom || 0;
      this.collision = this.config.collision || true;
      this.tol = this.config.tol || 0.25;
      this._stroke = this.config.stroke || "none";
      this._fill = this.config.fill || "black";
      this.angle = this.config.angle || 0;
      this.is_root = this.config.is_root || false;
      this.is_bullet = this.config.is_bullet || false;
      this.type = this.config.type || null;
      this.image = this.config.image || null;
      this.g = d3.select("#game_g").append("g").attr("transform", "translate(" + this.r.x + "," + this.r.y + ")");
      this.g = this.config.g || this.g;
      this.svg = this.config.svg || d3.select("#game_svg");
      this.quadtree = this.config.quadtree || null;
      this.tick = this.config.tick || Integration.verlet(this);
      this.width = this.config.width || parseInt(this.svg.attr("width"));
      this.height = this.config.height || parseInt(this.svg.attr("height"));
      this.destroyed = false;
      this._cleanup = true;
      Utils.addChainedAttributeAccessor(this, 'fill');
      Utils.addChainedAttributeAccessor(this, 'stroke');
      this.start();
    }

    Element.prototype.reaction = function(element) {
      if (element != null) {
        return element.reaction();
      }
    };

    Element.prototype.BB = function() {
      this.left = this.r.x - 0.5 * this.bb_width;
      this.right = this.r.x + 0.5 * this.bb_width;
      this.top = this.r.y - 0.5 * this.bb_height;
      return this.bottom = this.r.y + 0.5 * this.bb_height;
    };

    Element.prototype.draw = function() {
      this.g.attr("transform", "translate(" + this.r.x + "," + this.r.y + ") rotate(" + (360 * 0.5 * this.angle / Math.PI) + ")");
    };

    Element.prototype.destroy_check = function(n) {
      if (this.is_root || this.is_bullet) {
        this.reaction(n);
        return true;
      }
      return false;
    };

    Element.prototype.offscreen = function() {
      return this.r.x < -this.size || this.r.y < -this.size || this.r.x > this.width + this.size || this.r.y > this.height + this.size;
    };

    Element.prototype.start = function() {
      Collision.list.push(this);
    };

    Element.prototype.stop = function() {
      var index;
      index = _.indexOf(Collision.list, this);
      if (index > -1) {
        Collision.list.splice(index, 1);
      }
    };

    Element.prototype.cleanup = function(_cleanup) {
      this._cleanup = _cleanup != null ? _cleanup : this._cleanup;
      if (this._cleanup && this.offscreen()) {
        this.destroy();
      }
    };

    Element.prototype.destroy = function(remove) {
      if (remove == null) {
        remove = true;
      }
      this.stop();
      this.destroyed = true;
      if (remove) {
        this.g.remove();
      }
    };

    return Element;

  })();

  this.Game = (function() {

    function Game(config) {
      this.config = config != null ? config : {};
      this.element = [];
      this.svg = d3.select("#game_svg");
      if (this.svg.empty()) {
        this.svg = d3.select('body').append('svg').attr('width', '800px').attr('height', '600px').attr('id', 'game_svg');
      }
      this.width = parseInt(this.svg.attr("width"), 10);
      this.height = parseInt(this.svg.attr("height"), 10);
      this.scale = 1;
      this.g = d3.select("#game_g");
      if (this.g.empty()) {
        this.g = this.svg.append('g');
      }
      this.g.attr('id', 'game_g').attr('width', this.svg.attr('width')).attr('height', this.svg.attr('height')).style('width', '').style('height', '');
    }

    Game.prototype.start = function() {
      return Integration.start();
    };

    Game.prototype.stop = function() {
      return Integration.stop();
    };

    return Game;

  })();

  this.Circle = (function(_super) {

    __extends(Circle, _super);

    function Circle(config) {
      this.config = config != null ? config : {};
      Circle.__super__.constructor.apply(this, arguments);
      this.type = 'Circle';
      this.size = 15;
      this.BB();
      this.image = this.g.append("circle");
      this.image.attr("stroke", this._stroke);
      this.image.attr("fill", this._fill);
    }

    Circle.prototype.draw = function() {
      Circle.__super__.draw.apply(this, arguments);
      return this.image.attr("r", this.size);
    };

    Circle.prototype.BB = function(size) {
      this.size = size != null ? size : this.size;
      this.bb_width = 2 * this.size;
      this.bb_height = 2 * this.size;
      return Circle.__super__.BB.apply(this, arguments);
    };

    return Circle;

  })(Element);

  this.Polygon = (function(_super) {

    __extends(Polygon, _super);

    function Polygon(config) {
      this.config = config != null ? config : {};
      Polygon.__super__.constructor.apply(this, arguments);
      this.type = 'Polygon';
      this.path = this.config.path || this.default_path();
      this.image = this.g.append("path");
      this.set_path();
    }

    Polygon.prototype.default_path = function() {
      var invsqrt3;
      invsqrt3 = 1 / Math.sqrt(3);
      return [
        {
          pathSegTypeAsLetter: 'M',
          x: -this.size,
          y: this.size * invsqrt3,
          react: true
        }, {
          pathSegTypeAsLetter: 'L',
          x: 0,
          y: -2 * this.size * invsqrt3,
          react: true
        }, {
          pathSegTypeAsLetter: 'L',
          x: this.size,
          y: this.size * invsqrt3,
          react: true
        }, {
          pathSegTypeAsLetter: 'Z'
        }
      ];
    };

    Polygon.prototype.d = function() {
      return Utils.d(this.path);
    };

    Polygon.prototype.polygon_path = function() {
      var i, _i, _ref;
      for (i = _i = 0, _ref = this.path.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.path[i].r = new Vec(this.path[i]).subtract(this.path[(i + 1) % (this.path.length - 1)]);
        this.path[i].n = new Vec({
          x: -this.path[i].y,
          y: this.path[i].x
        }).normalize();
      }
      this.BB();
    };

    Polygon.prototype.set_path = function(path) {
      this.path = path != null ? path : this.path;
      this.pathref = this.path.map(function(d) {
        return _.clone(d);
      });
      this.polygon_path();
      this.maxnode = new Vec(_.max(this.path, function(node) {
        return node.d = node.x * node.x + node.y * node.y;
      }));
      this.size = this.maxnode.length();
      return this.image.attr("d", this.d());
    };

    Polygon.prototype.BB = function() {
      this.bb_width = _.max(this.path, function(node) {
        return node.x;
      }).x - _.min(this.path, function(node) {
        return node.x;
      }).x;
      this.bb_height = _.max(this.path, function(node) {
        return node.y;
      }).y - _.min(this.path, function(node) {
        return node.y;
      }).y;
      return Polygon.__super__.BB.apply(this, arguments);
    };

    Polygon.prototype.rotate_path = function() {
      var c, i, s, seg, _i, _ref;
      for (i = _i = 0, _ref = this.path.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        seg = this.path[i];
        if (seg.x == null) {
          continue;
        }
        c = Math.cos(this.angle);
        s = Math.sin(this.angle);
        seg.x = c * this.pathref[i].x - s * this.pathref[i].y;
        seg.y = s * this.pathref[i].x + c * this.pathref[i].y;
      }
      this.polygon_path();
    };

    return Polygon;

  })(Element);

  this.Collision = (function() {
    var circle_circle_dist, circle_lineseg_dist, lineseg_intersect, nearest_node, z_check;

    function Collision() {}

    Collision.use_bb = false;

    Collision.lastquad = Utils.timestamp();

    Collision.list = [];

    Collision.update_quadtree = function(force_update) {
      var data, timestamp;
      if (force_update == null) {
        force_update = false;
      }
      if (!(this.list.length > 0)) {
        return;
      }
      timestamp = Utils.timestamp();
      if (force_update || timestamp - this.lastquad > this.list.length || (this.quadtree == null)) {
        data = _.filter(this.list, function(d) {
          return d.collision;
        }).map(function(d) {
          return {
            x: d.r.x,
            y: d.r.y,
            d: d
          };
        });
        this.quadtree = d3.geom.quadtree(data);
        return this.lastquad = timestamp;
      }
    };

    Collision.quadtree = Collision.update_quadtree();

    Collision.detect = function() {
      var d, i, length, size, x0, x3, y0, y3, _results;
      if (!(this.list.length > 0)) {
        return;
      }
      this.update_quadtree();
      length = this.list.length;
      i = 0;
      _results = [];
      while (i < length) {
        d = this.list[i];
        if (d.collision) {
          size = 2 * (d.size + d.tol);
          x0 = d.r.x - size;
          x3 = d.r.x + size;
          y0 = d.r.y - size;
          y3 = d.r.y + size;
          this.quadtree.visit(function(node, x1, y1, x2, y2) {
            var p;
            p = node.point;
            if (p !== null) {
              if (p.destroyed) {
                return false;
              }
              if (!(d !== p.d && p.d.collision)) {
                return false;
              }
              if ((p.x >= x0) && (p.x < x3) && (p.y >= y0) && (p.y < y3)) {
                Collision.check(d, p.d);
              }
            }
            return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
          });
        }
        d.draw();
        d.cleanup();
        length = this.list.length;
        _results.push(i++);
      }
      return _results;
    };

    Collision.check = function(ei, ej, reaction) {
      var d, m, n, name, sort;
      if (reaction == null) {
        reaction = true;
      }
      name = [ei.type, ej.type];
      sort = [ei.type, ej.type].sort();
      if (name[0] === sort[0] && name[1] === sort[1]) {
        m = ei;
        n = ej;
      } else {
        m = ej;
        n = ei;
      }
      switch (m.type) {
        case 'Circle':
          switch (n.type) {
            case 'Circle':
              d = this.circle_circle(m, n);
              if (d.collision && reaction) {
                Reaction.circle_circle(m, n, d);
              }
              break;
            case 'Polygon':
              d = this.circle_polygon(m, n);
              if (d.collision && reaction) {
                Reaction.circle_polygon(m, n, d);
              }
          }
          break;
        case 'Polygon':
          switch (n.type) {
            case 'Polygon':
              d = this.polygon_polygon(m, n);
              if (d.collision && reaction) {
                Reaction.polygon_polygon(m, n, d);
              }
          }
      }
      return d;
    };

    Collision.rectangle_rectangle = function(m, n) {
      var not_intersect;
      m.BB();
      n.BB();
      not_intersect = n.left > m.right || n.right < m.left || n.top > m.bottom || n.bottom < m.top;
      return !not_intersect;
    };

    Collision.circle_circle = function(m, n) {
      var d;
      if (this.use_bb) {
        if (this.rectangle_rectangle(m, n)) {
          d = circle_circle_dist(m, n);
          d.collision = true;
        } else {
          d = {
            collision: false
          };
        }
      } else {
        d = circle_circle_dist(m, n);
        d.collision = d.dist <= d.dmin ? true : false;
      }
      return d;
    };

    Collision.circle_polygon = function(circle, polygon) {
      var d, i, _i, _ref;
      if (this.use_bb) {
        if (this.rectangle_rectangle(circle, polygon)) {
          i = nearest_node(polygon, circle);
          d = circle_lineseg_dist(circle, polygon, i);
          d.i = i;
          d.collision = true;
        } else {
          d = {
            collision: false
          };
        }
      } else {
        for (i = _i = 0, _ref = polygon.path.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (!polygon.path[i].react) {
            continue;
          }
          d = circle_lineseg_dist(circle, polygon, i);
          if (d.dist > circle.size) {
            continue;
          }
          d.i = i;
          d.collision = true;
          break;
        }
      }
      return d;
    };

    Collision.polygon_polygon = function(m, n) {
      var d, i, j, _i, _j, _ref, _ref1;
      if (this.use_bb) {
        if (this.rectangle_rectangle(m, n)) {
          d = circle_circle_dist(m, n);
          d.i = nearest_node(m, n);
          d.j = nearest_node(n, m);
          d.collision = true;
        } else {
          d = {
            collision: false
          };
        }
      } else {
        d = circle_circle_dist(m, n);
        d.collision = false;
        if (d.dist <= d.dmin) {
          for (i = _i = 0, _ref = m.path.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            for (j = _j = 0, _ref1 = n.path.length - 2; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
              if (!lineseg_intersect(m, n, i, j)) {
                continue;
              }
              d.i = i;
              d.j = j;
              d.collision = true;
              break;
            }
            if (d.collision) {
              break;
            }
          }
        }
      }
      return d;
    };

    nearest_node = function(m, n) {
      var init, nearest;
      init = _.initial(m.path);
      nearest = _.min(init, function(d) {
        var dd;
        dd = new Vec(d).add(m.r).subtract(n.r).length_squared();
        return dd;
      });
      return _.indexOf(m.path, nearest);
    };

    circle_circle_dist = function(m, n) {
      var d;
      d = new Vec(m.r).subtract(n.r);
      d.dist = d.length();
      d.dmin = m.size + n.size;
      return d;
    };

    circle_lineseg_dist = function(circle, polygon, i) {
      var d, dr, r, ri, rj, rr, t, tr;
      ri = polygon.path[i];
      rj = z_check(polygon.path, i);
      r = new Vec(rj).subtract(ri);
      rr = r.length_squared();
      dr = new Vec(circle.r).subtract(ri).subtract(polygon.r);
      t = r.dot(dr) / rr;
      if (t < 0) {

      } else if (t > 1) {
        dr = new Vec(circle.r).subtract(rj).subtract(polygon.r);
      } else {
        tr = new Vec(r).scale(t).add(ri).add(polygon.r);
        dr = new Vec(circle.r).subtract(tr);
      }
      return d = {
        t: t,
        x: dr.x,
        y: dr.y,
        r: [r.x, r.y],
        rr: rr,
        dist: dr.length()
      };
    };

    lineseg_intersect = function(m, n, i, j) {
      var A1, A2, B1, B2, C1, C2, check1, check2, check3, check4, det, ri, rj, si, sj, x, y, _ref, _ref1, _ref2, _ref3;
      ri = new Vec(m.path[i]);
      rj = new Vec(z_check(m.path, i));
      si = new Vec(n.path[j]);
      sj = new Vec(z_check(n.path, j));
      A1 = rj.y - ri.y;
      B1 = ri.x - rj.x;
      C1 = A1 * (ri.x + m.r.x) + B1 * (ri.y + m.r.y);
      A2 = sj.y - si.y;
      B2 = si.x - sj.x;
      C2 = A2 * (si.x + n.r.x) + B2 * (si.y + n.r.y);
      det = A1 * B2 - A2 * B1;
      if (det === 0) {
        return false;
      }
      x = (B2 * C1 - B1 * C2) / det;
      y = (A1 * C2 - A2 * C1) / det;
      check1 = (Math.min(ri.x, rj.x) - m.tol <= (_ref = x - m.r.x) && _ref <= Math.max(ri.x, rj.x) + m.tol);
      check2 = (Math.min(si.x, sj.x) - n.tol <= (_ref1 = x - n.r.x) && _ref1 <= Math.max(si.x, sj.x) + n.tol);
      check3 = (Math.min(ri.y, rj.y) - m.tol <= (_ref2 = y - m.r.y) && _ref2 <= Math.max(ri.y, rj.y) + m.tol);
      check4 = (Math.min(si.y, sj.y) - n.tol <= (_ref3 = y - n.r.y) && _ref3 <= Math.max(si.y, sj.y) + n.tol);
      if (check1 && check2 && check3 && check4) {
        return true;
      } else {
        return false;
      }
    };

    z_check = function(seg, i) {
      switch (seg[i + 1].pathSegTypeAsLetter) {
        case 'z':
        case 'Z':
          return seg[0];
        default:
          return seg[i + 1];
      }
    };

    return Collision;

  })();

  this.Force = (function() {

    function Force() {}

    Force["eval"] = function(element, param) {
      var dr, emx, emy, epx, epy, fx, fy, r2, r3, rmx, rmy, rpx, rpy;
      switch (param.type) {
        case 'constant':
          fx = param.x;
          fy = param.y;
          break;
        case 'friction':
          fx = -param.alpha * element.v.x;
          fy = -param.alpha * element.v.y;
          break;
        case 'spring':
          fx = -(element.r.x - param.cx);
          fy = -(element.r.y - param.cy);
          break;
        case 'charge':
        case 'gravity':
          dr = new Vec({
            x: param.cx - element.r.x,
            y: param.cy - element.r.y
          });
          r2 = dr.length_squared();
          r3 = r2 * Math.sqrt(r2);
          fx = param.q * dr.x / r3;
          fy = param.q * dr.y / r3;
          break;
        case 'random':
          fx = 2 * (Math.random() - 0.5) * param.xScale;
          fy = 2 * (Math.random() - 0.5) * param.yScale;
          if (element.r.x > param.xBound) {
            fx = -param.fxBound;
          }
          if (element.r.y > param.yBound) {
            fy = -param.fyBound;
          }
          if (element.r.x < 0) {
            fx = param.fxBound;
          }
          if (element.r.y < 0) {
            fy = param.fyBound;
          }
          break;
        case 'gradient':
          rpx = new Vec(element.r).add({
            x: param.tol,
            y: 0
          });
          rmx = new Vec(element.r).add({
            x: -param.tol,
            y: 0
          });
          rpy = new Vec(element.r).add({
            y: param.tol,
            x: 0
          });
          rmy = new Vec(element.r).add({
            y: -param.tol,
            x: 0
          });
          epx = param.energy(rpx);
          emx = param.energy(rmx);
          epy = param.energy(rpy);
          emy = param.energy(rmy);
          if (!((epx != null) && (emx != null) && (epy != null) && (emy != null))) {
            fx = 0;
            fy = 0;
            break;
          }
          fx = -0.5 * (epx - emx) / param.tol;
          fy = -0.5 * (epy - emy) / param.tol;
      }
      return new Vec({
        x: fx,
        y: fy
      });
    };

    return Force;

  })();

  this.Integration = (function() {

    function Integration() {}

    Integration.off = false;

    Integration.tick = 1 / 30;

    Integration.timestamp = Utils.timestamp();

    Integration.verlet = function(element) {
      return function() {
        var f;
        element.dr = new Vec(element.v).scale(element.dt).add(new Vec(element.f).scale(0.5 * element.dt * element.dt));
        element.r.add(element.dr);
        f = new Vec();
        element.force_param.forEach(function(param) {
          return f.add(Force["eval"](element, param));
        });
        element.v.add(f.add(element.f).scale(0.5 * element.dt));
        element.f = f;
      };
    };

    Integration.integrate = function(cleanup) {
      var element, timestamp, _i, _len, _ref;
      if (cleanup == null) {
        cleanup = true;
      }
      if (Integration.off) {
        return true;
      }
      timestamp = Utils.timestamp();
      if (timestamp - Integration.timestamp < Integration.tick) {
        return;
      }
      Integration.timestamp = timestamp;
      _ref = Collision.list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        element.tick();
      }
      Collision.detect();
    };

    Integration.start = function(delay) {
      if (delay == null) {
        delay = 0;
      }
      this.off = false;
      d3.timer(this.integrate, delay);
    };

    Integration.stop = function() {
      this.off = true;
    };

    return Integration;

  }).call(this);

  this.Reaction = (function() {
    var elastic_collision;

    function Reaction() {}

    Reaction.circle_circle = function(m, n, d) {
      var line, overstep, shift;
      if (m.destroy_check(n) || n.destroy_check(m)) {
        return;
      }
      line = new Vec(d);
      line.x = line.x / d.dist;
      line.y = line.y / d.dist;
      overstep = Math.max(d.dmin - d.dist, 0);
      shift = 0.5 * (Math.max(m.tol, n.tol) + overstep);
      elastic_collision(m, n, line, shift);
      m.reaction(n);
    };

    Reaction.circle_polygon = function(circle, polygon, d) {
      if (circle.destroy_check(polygon) || polygon.destroy_check(circle)) {
        return;
      }
      console.log('Reaction.circle_polygon not implemented yet');
    };

    Reaction.polygon_polygon = function(m, n, d) {
      var dot_a, dot_b, mseg, normal, nseg, segj, shift;
      if (m.destroy_check(n) || n.destroy_check(m)) {
        return;
      }
      mseg = m.path[d.i];
      nseg = n.path[d.j];
      dot_a = mseg.n.dot(d);
      dot_b = nseg.n.dot(d);
      if (Math.abs(dot_a) > Math.abs(dot_b)) {
        normal = new Vec(mseg.n).scale(dot_a / Math.abs(dot_a));
        segj = nseg;
      } else {
        normal = new Vec(nseg.n).scale(dot_b / Math.abs(dot_b));
        segj = mseg;
      }
      shift = 0.5 * Math.max(m.tol, n.tol);
      elastic_collision(m, n, normal, shift);
      m.reaction(n);
    };

    elastic_collision = function(m, n, line, shift) {
      var cPar, dPar, iter, lshift, maxiter, reaction, uPar, uPerp, vPar, vPerp;
      lshift = new Vec(line).scale(shift);
      reaction = false;
      maxiter = 32;
      iter = 1;
      while (Collision.check(m, n, reaction).collision && iter <= maxiter) {
        m.r = m.r.add(lshift);
        n.r = n.r.subtract(lshift);
        iter++;
      }
      cPar = m.v.dot(line);
      vPar = new Vec(line).scale(cPar);
      vPerp = new Vec(m.v).subtract(vPar);
      dPar = n.v.dot(line);
      uPar = new Vec(line).scale(dPar);
      uPerp = new Vec(n.v).subtract(uPar);
      m.v = uPar.add(vPerp);
      n.v = vPar.add(uPerp);
    };

    return Reaction;

  })();

  this.ForceParam = (function() {

    function ForceParam(config) {
      this.config = config != null ? config : {};
      this.type = this.config.type || 'constant';
      switch (this.config.type) {
        case 'constant':
          this.fx = this.config.x || 0;
          this.fy = this.config.y || 0;
          break;
        case 'friction':
          this.alpha = this.config.alpha || 1;
          this.vscale = this.config.vscale || .99;
          this.vcut = this.config.vcut || 1e-2;
          break;
        case 'spring':
          this.cx = this.config.cx || 0;
          this.cy = this.config.cy || 0;
          break;
        case 'charge':
        case 'gravity':
          this.cx = this.config.cx || 0;
          this.cy = this.config.cy || 0;
          this.q = this.config.q || 1;
          break;
        case 'random':
          this.xScale = this.config.xScale || 1;
          this.yScale = this.config.yScale || 1;
          this.fxBound = this.config.fxBound || 10;
          this.fyBound = this.config.fyBound || 10;
          break;
        case 'gradient':
          this.tol = this.config.tol || 0.1;
          this.energy = this.config.energy || function(r) {};
      }
    }

    return ForceParam;

  })();

  this.Vec = (function() {

    function Vec(config) {
      this.config = config != null ? config : {};
      this.x = this.config.x || 0;
      this.y = this.config.y || 0;
    }

    Vec.prototype.scale = function(c) {
      this.x *= c;
      this.y *= c;
      return this;
    };

    Vec.prototype.add = function(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    };

    Vec.prototype.subtract = function(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    };

    Vec.prototype.rotate = function(a) {
      var c, s, _ref;
      c = Math.cos(a);
      s = Math.sin(a);
      return _ref = [c * this.x - s * this.y, this.y = s * this.x + c * this.y], this.x = _ref[0], this.y = _ref[1], _ref;
    };

    Vec.prototype.dot = function(v) {
      return this.x * v.x + this.y * v.y;
    };

    Vec.prototype.length_squared = function() {
      return this.dot(this);
    };

    Vec.prototype.length = function() {
      return Math.sqrt(this.length_squared());
    };

    Vec.prototype.normalize = function() {
      var inverseLength;
      inverseLength = 1 / this.length();
      this.x *= inverseLength;
      this.y *= inverseLength;
      return this;
    };

    Vec.prototype.dist_squared = function(v) {
      return new Vec(this).subtract(v).length_squared();
    };

    Vec.prototype.dist = function(v) {
      return Math.sqrt(this.dist_squared(v));
    };

    return Vec;

  })();

  this.Drop = (function(_super) {

    __extends(Drop, _super);

    function Drop(config) {
      this.config = config != null ? config : {};
      Drop.__super__.constructor.apply(this, arguments);
      this.dt = 1;
      this.size = .7;
      this.fill('navy');
      this.stroke('none');
      this.image.attr('opacity', '0.6').attr('stroke-width', 0.25);
      this.lifetime = Utils.timestamp();
      this.max_lifetime = 3e4;
      this.vscale = .7;
    }

    Drop.prototype.reaction = function(element) {
      this.v.scale(this.vscale);
      return Drop.__super__.reaction.apply(this, arguments);
    };

    Drop.prototype.cleanup = function(_cleanup) {
      this._cleanup = _cleanup != null ? _cleanup : this._cleanup;
      this.lifetime = Utils.timestamp() - this.lifetime;
      if (this.lifetime > this.max_lifetime) {
        this.destroy();
      }
      this.lifetime = Utils.timestamp() - this.lifetime;
      if (this.offscreen()) {
        if (this.r.x > this.width) {
          this.r.x = this.r.x % this.width;
        }
        if (this.r.x < 0) {
          this.r.x = this.width + this.r.x;
        }
        if (this.r.y < 0) {
          this.r.y = 0;
          this.v.y = Math.abs(this.v.y);
          this.r.x = (this.r.x + this.width * 0.5) % this.width;
        }
        if (this.r.y > this.height) {
          this.r.y = this.height;
          this.v.y = -Math.abs(this.v.y);
          this.r.x = (this.r.x + this.width * 0.5) % this.width;
        }
      }
    };

    return Drop;

  })(Circle);

  this.Rainflow = (function(_super) {

    __extends(Rainflow, _super);

    function Rainflow(config) {
      var V, drops, dur, inst, prompt, updateWindow,
        _this = this;
      this.config = config != null ? config : {};
      this.keydown = function() {
        return Rainflow.prototype.keydown.apply(_this, arguments);
      };
      this.drop = function(r) {
        if (r == null) {
          r = _this.root.r;
        }
        return Rainflow.prototype.drop.apply(_this, arguments);
      };
      Rainflow.__super__.constructor.apply(this, arguments);
      this.map_width = 360;
      this.map_height = 180;
      this.g.append('image').attr('xlink:href', 'earth_elevation6.png').attr('height', this.map_height).attr('width', this.map_width);
      this.root = new Root();
      this.numel = this.config.numel || 5;
      this.elevation = [];
      this.sleep = 250;
      this.lastdrop = Utils.timestamp();
      drops = function(text) {
        var row;
        row = text.split('\n');
        _this.elevation = row.map(function(d) {
          return d.split(',').map(function(d) {
            return Number(d);
          });
        });
        _this.gravity_param = {
          tol: 1,
          energy: V,
          type: 'gradient'
        };
        _this.friction_param = {
          alpha: .2,
          type: 'friction'
        };
        _this.svg.on("mousedown", _this.drop);
        d3.select(window).on("keydown", _this.keydown);
        return _this.start();
      };
      prompt = this.g.append("text").text("").attr("stroke", "black").attr("fill", "deepskyblue").attr("font-size", "36").attr("x", this.map_width / 2 - 100).attr("y", this.map_height / 4).attr('font-family', 'arial').attr('font-weight', 'bold').attr('opacity', 0);
      prompt.text("RAINFLOW");
      dur = 1000;
      prompt.transition().duration(dur).attr('opacity', 1).transition().duration(dur).delay(5000).attr('opacity', 0).remove();
      inst = this.g.append("text").text("").attr("stroke", "none").attr("fill", "white").attr("font-size", 10).attr("x", this.map_width / 2 - 170).attr("y", this.map_height / 4 + 40).attr('font-family', 'arial').attr('font-weight', 'bold').attr('opacity', 0);
      inst.text("mouse over the map and click a button or press any key to release drops");
      dur = 1000;
      inst.transition().delay(dur).duration(dur).attr('opacity', 1).transition().duration(dur).delay(5000).attr('opacity', 0).remove().each('end', function() {
        return d3.text('topo_flip.csv', drops);
      });
      V = function(r) {
        var dxc, dxf, dyc, dyf, scale, tol, v_r, x, xc, xf, y, yc, yf;
        scale = 1e-4;
        x = r.x;
        y = r.y;
        if (x < 0) {
          x = _this.elevation[0].length - 1 + x % (_this.elevation[0].length - 1);
        }
        if (x > _this.elevation[0].length - 1) {
          x = x % (_this.elevation[0].length - 1);
        }
        if (y < 0) {
          y = _this.elevation.length - 1 + y % (_this.elevation.length - 1);
        }
        if (y > _this.elevation.length - 1) {
          y = y % (_this.elevation.length - 1);
        }
        tol = 1e-12;
        xf = Math.floor(x);
        xc = Math.ceil(x + tol);
        yf = Math.floor(y);
        yc = Math.ceil(y + tol);
        dxf = x - xf;
        dxc = xc - x;
        dyf = y - yf;
        dyc = yc - y;
        v_r = _this.elevation[yf][xf] * dxc * dyc + _this.elevation[yf][xc] * dxf * dyc + _this.elevation[yc][xf] * dxc * dyf + _this.elevation[yc][xc] * dxf * dyf;
        return v_r *= scale / ((xc - xf) * (yc - yf));
      };
      updateWindow = function() {
        var height, scale, width;
        width = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
        height = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
        scale = 0.75 * (width > height ? height / _this.map_height : width / _this.map_width);
        scale = Math.floor(scale * 2) * 0.5;
        _this.svg.attr('width', width).attr('height', height);
        _this.g.attr('transform', 'translate(' + _this.map_width * 0.5 + ', ' + _this.map_height * 0.5 + ') scale(' + scale + ')');
        Utils.scale = scale;
      };
      updateWindow();
      window.onresize = updateWindow;
    }

    Rainflow.prototype.drop = function(r) {
      var clear, config, dr, dur, i, int, new_drop, stamp, _i, _ref;
      if (r == null) {
        r = this.root.r;
      }
      stamp = Utils.timestamp();
      if (!(stamp - this.lastdrop > this.sleep)) {
        return;
      }
      this.lastdrop = stamp;
      config = [];
      for (i = _i = 0, _ref = this.numel - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        dr = new Vec({
          x: 2 * this.root.size * (Math.random() - 0.5),
          y: 2 * this.root.size * (Math.random() - 0.5)
        });
        config.push({
          r: new Vec(r).add(dr),
          force_param: [new ForceParam(this.gravity_param), new ForceParam(this.friction_param)],
          width: this.map_width,
          height: this.map_height
        });
      }
      if (!(config.length > 0)) {
        return;
      }
      dur = 100;
      new_drop = function() {
        return new Drop(config.pop());
      };
      int = setInterval(new_drop, dur);
      clear = function() {
        return clearInterval(int);
      };
      return setTimeout(clear, dur * (config.length + 1));
    };

    Rainflow.prototype.keydown = function() {
      this.drop();
    };

    return Rainflow;

  })(Game);

  this.Root = (function(_super) {

    __extends(Root, _super);

    function Root(config) {
      var _this = this;
      this.config = config != null ? config : {};
      this.move = function(node) {
        if (node == null) {
          node = _this.svg.node();
        }
        return Root.prototype.move.apply(_this, arguments);
      };
      Root.__super__.constructor.apply(this, arguments);
      this.svg.style("cursor", "none");
      this.fill('none');
      this.stroke('navy');
      this.image.attr('opacity', 0.4).attr('stroke-width', 1.5);
      this.svg.on("mousemove", this.move);
      this.is_root = true;
      this.tick = function() {};
      this.size = 2.5;
      this.stop();
    }

    Root.prototype.move = function(node) {
      var bb, x_off, xy, y_off;
      if (node == null) {
        node = this.svg.node();
      }
      xy = d3.mouse(node);
      bb = document.getElementById('game_g').getBoundingClientRect();
      x_off = bb.left;
      y_off = bb.bottom - bb.height;
      this.r.x = xy[0] - x_off;
      this.r.y = xy[1] - y_off;
      this.r.scale(1 / Utils.scale);
      return this.draw();
    };

    return Root;

  })(Circle);

}).call(this);
