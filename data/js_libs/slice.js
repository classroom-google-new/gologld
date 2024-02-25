(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.sliceGeometry = require('./slice.js')(window.THREE);

},{"./slice.js":3}],2:[function(require,module,exports){

function parce_edges(edges,id) 
{
    if(edges[id]==null)
        return false;
    if (here.cahins.length>1)
    {//закрыли цикл
        if (here.cahins[0][0]==edges[id][0])
        {
            {
                here.cahins.push([edges[id][1],edges[id][0],id]);
                edges[id]=null;
                return true;
            }
        }else 
        if (here.cahins[0][0]==edges[id][1])
        {
            here.cahins.push([edges[id][0],edges[id][1],id]);
            edges[id]=null;
            return true;
        }/*else
        {
            if ((here.cahins[1][1]==edges[id][0])||((here.cahins[1][1]==edges[id][1])))
            {
                here.cahins.push([edges[id][0],edges[id][1],id]);
                edges[id]=null;
                return true;
            }
        }*/
    }
    
    if (here.cahins.length>0)
    {
        var tmp=here.cahins[here.cahins.length-1];

        if (tmp[1]==edges[id][0])
            here.cahins.push([edges[id][0],edges[id][1],id]);
        else here.cahins.push([edges[id][1],edges[id][0],id]);
    }else
        here.cahins.push([edges[id][0],edges[id][1],id]);

    edges[id]=null;
    for (var i=0;i<edges.length;i++)
    {//ищем следующую
        if ((edges[i]!=null)&&((here.cahins[here.cahins.length-1][1]==edges[i][0])||(here.cahins[here.cahins.length-1][1]==edges[i][1])))
        {//нашли следующую ступень
            if (parce_edges(edges,i))
                return true;
        }
    }
    var tmp=here.cahins[here.cahins.length-1];
    edges[tmp[2]]=tmp;
    here.cahins.pop();
    return false;
}

var here=this;
here.cahins=[];
here.prev_cahins=null;

function facesFromEdges(edges) 
{
    var my_chaines=[];
    //var chains = joinEdges(edges).filter(validFace);
    
    if (here.prev_cahins!=null)
    {
        for(var i=0;i<here.prev_cahins.length;i++)
        {
            var arr=[];
            my_chaines.push(arr);
            for(var n=0;n<here.prev_cahins[i].length;n++)
            {
                var id=here.prev_cahins[i][n][2];
                
                if (n>0)
                {
                    if (arr[n-1][1]==edges[id][0])
                        arr.push([edges[id][0],edges[id][1]]);
                    else arr.push([edges[id][1],edges[id][0]]);
                }else arr.push([edges[id][0],edges[id][1]]);
            }
        }
        here.prev_cahins=null;
    }else
    {
        for (var i=0;i<edges.length;i++)
            if (parce_edges(edges,i))
            {
                my_chaines.push(here.cahins);
                /*for (var n=0;n<here.cahins.length;n++)
                {
                    my_edges[here.cahins[n][2]]=null;
                }*/
                here.cahins=[];
            }
        here.prev_cahins=my_chaines;
    }
    var faces = my_chaines.map(function(my_chaines) {
        return my_chaines.map(function(edge) {
            return edge[0];
        });
    });
    return faces;
}
/*function facesFromEdges(edges) {
    var chains = joinEdges(edges).filter(validFace);
    var faces = chains.map(function(chain) {
        return chain.map(function(edge) {
            return edge[0];
        });
    });
    return faces;
}*/

function joinEdges(edges) {
    changes = true;
    var chains = edges.map(function(edge) {
        return [edge];
    });
    while (changes) {
        changes = connectChains(chains);
    }
    chains = chains.filter(function(chain) {
        return chain.length; 
    });
    return chains;
}

function connectChains(chains) {
    chains.forEach(function(chainA, i) {
        chains.forEach(function(chainB, j) {
            var merged = mergeChains(chainA, chainB);
            if (merged) {
                delete chains[j];
                return true;
            }
        });
    });
    return false;
}

function mergeChains(chainA, chainB) {

    if (chainA === chainB) {
        return false;
    }

    if (chainStart(chainA) === chainEnd(chainB)) {
        chainA.unshift.apply(chainA, chainB);
        return true;
    }

    if (chainStart(chainA) === chainStart(chainB)) {
        reverseChain(chainB);
        chainA.unshift.apply(chainA, chainB);
        return true;
    }

    if (chainEnd(chainA) === chainStart(chainB)) {
        chainA.push.apply(chainA, chainB);
        return true;
    }

    if (chainEnd(chainA) === chainEnd(chainB)) {
        reverseChain(chainB);
        chainA.push.apply(chainA, chainB);
        return true;
    }

    return false;
}

function chainStart(chain){
    return chain[0][0];
}

function chainEnd(chain) {
    return chain[chain.length - 1][1];
}

function reverseChain(chain) {
    chain.reverse();
    chain.forEach(function(edge) {
        edge.reverse();
    });
}

function validFace(chain) {
    return chainStart(chain) === chainEnd(chain) ? 1 : 0;
}

module.exports = facesFromEdges;

},{}],3:[function(require,module,exports){
var facesFromEdges = require('./faces-from-edges.js');


module.exports = function(THREE) {
    "use strict";

    var FRONT = 'front';
    var BACK = 'back';
    var ON = 'on';

    var FACE_KEYS = ['a', 'b', 'c'];

    var sliceGeometry = function(geometry, plane, closeHoles,uv) {
        var sliced = new THREE.Geometry();
        var avk_sliced = new THREE.Geometry();
        var avk_result=[sliced,avk_sliced];
        var builder = new GeometryBuilder(geometry, sliced, plane);
        var avk_builder = new GeometryBuilder(geometry, avk_sliced, plane);

        var distances = [];
        var positions = [];

        geometry.vertices.forEach(function(vertex) {
            var distance = findDistance(vertex, plane);
            var position = distanceAsPosition(distance);
            distances.push(distance);
            positions.push(position);
        });

        function do_face(face, faceIndex) 
        {

            var facePositions = FACE_KEYS.map(function(key) {
                return positions[face[key]];
            });

            var f=(facePositions.indexOf(FRONT) === -1 && facePositions.indexOf(BACK) !== -1) ;
            var avk_f=(facePositions.indexOf(BACK) === -1 && facePositions.indexOf(FRONT) !== -1) ;
            /*if (
                facePositions.indexOf(FRONT) === -1 &&
                facePositions.indexOf(BACK) !== -1
            ) {
                return;
            }*/

            builder.startFace(faceIndex);
            avk_builder.startFace(faceIndex);

            var lastKey = FACE_KEYS[FACE_KEYS.length - 1];
            var lastIndex = face[lastKey];
            var lastDistance = distances[lastIndex];
            var lastPosition = positions[lastIndex];

            FACE_KEYS.map(function(key) {
                var index = face[key];
                var distance = distances[index];
                var position = positions[index];
                
                if (position === FRONT) {
                    if (lastPosition === BACK) {
                        avk_builder.addIntersection(lastKey, key, lastDistance, distance);
                        builder.addIntersection(lastKey, key, lastDistance, distance);
                        builder.addVertex(key);
                    } else {
                        builder.addVertex(key);
                    }
                }

                if (position === ON) {
                    builder.addVertex(key);
                    avk_builder.addVertex(key);
                }

                if (position === BACK) {
                    if (lastPosition === FRONT) {
                        builder.addIntersection(lastKey, key, lastDistance, distance);
                        avk_builder.addIntersection(lastKey, key, lastDistance, distance);
                        avk_builder.addVertex(key);
                    } else {
                        avk_builder.addVertex(key);
                    }
                }

                /*if (position === BACK && lastPosition === FRONT) {
                    builder.addIntersection(lastKey, key, lastDistance, distance);
                }*/

                lastKey = key;
                lastIndex = index;
                lastPosition = position;
                lastDistance = distance;
            });

            if (!f)
                builder.endFace();
            if (!avk_f)
                avk_builder.endFace();
        }

        for (var i=0;i<geometry.faces.length;i++)
        {
            do_face(geometry.faces[i],i);
        }

        if (closeHoles) 
        {
            builder.closeHoles(uv);
            avk_builder.closeHoles(uv);
        }        

        return avk_result;
    };

    var distanceAsPosition = function(distance) {
        if (distance < 0) {
            return BACK;
        }
        if (distance > 0) {
            return FRONT;
        }
        return ON;
    };

    var findDistance = function(vertex, plane) {
        return plane.distanceToPoint(vertex);
    };

    var GeometryBuilder = function(sourceGeometry, targetGeometry, slicePlane) {
        this.sourceGeometry = sourceGeometry;
        this.targetGeometry = targetGeometry;
        this.slicePlane = slicePlane;
        this.addedVertices = [];
        this.addedIntersections = [];
        this.newEdges = [[]];
        this.uv=[];
    };

    GeometryBuilder.prototype.startFace = function(sourceFaceIndex) {
        this.sourceFaceIndex = sourceFaceIndex;
        this.sourceFace = this.sourceGeometry.faces[sourceFaceIndex];
        this.sourceFaceUvs = this.sourceGeometry.faceVertexUvs[0][sourceFaceIndex];

        this.faceIndices = [];
        this.faceNormals = [];
        this.faceUvs = [];
    };

    GeometryBuilder.prototype.endFace = function() {
        var indices = this.faceIndices.map(function(index, i) {
            return i;
        });
        this.addFace(indices);
    };

    GeometryBuilder.prototype.closeHoles = function(uv) {
        facesFromEdges(this.newEdges)
            .forEach(function(faceIndices) {
                var normal = this.faceNormal(faceIndices);
                if (normal.dot(this.slicePlane.normal) > .5) {
                    faceIndices.reverse();
                }

                /*for (var i=0;i<this.targetGeometry.faces.length;i++)
                {
                    this.uv[this.targetGeometry.faces[i].a]=this.targetGeometry.faceVertexUvs[0][i][0];
                    this.uv[this.targetGeometry.faces[i].b]=this.targetGeometry.faceVertexUvs[0][i][1];
                    this.uv[this.targetGeometry.faces[i].c]=this.targetGeometry.faceVertexUvs[0][i][2];
                }*/

                for (var i=1;i<faceIndices.length-1;i++)
                {
                    this.targetGeometry.faces.push(new THREE.Face3(faceIndices[0], faceIndices[i], faceIndices[i+1]));
                    //var uv_obj=[ new THREE.Vector2(this.uv[faceIndices[0]].x,this.uv[faceIndices[0]].y), new THREE.Vector2(this.uv[faceIndices[i]].x,this.uv[faceIndices[i]].y), new THREE.Vector2(this.uv[faceIndices[i+1]].x,this.uv[faceIndices[i+1]].y)];
                    this.targetGeometry.faceVertexUvs[0].push([uv,uv,uv]);
                }
                /*this.startFace();
                this.faceIndices = faceIndices;
                this.endFace();*/
            }, this);
    };

    GeometryBuilder.prototype.addVertex = function(key) {
        var uv=this.addUv(key);
        this.addNormal(key);

        var index = this.sourceFace[key];
        var newIndex;

        if (this.addedVertices.hasOwnProperty(index)) {
            newIndex = this.addedVertices[index];
        } else {
            var vertex = this.sourceGeometry.vertices[index];
            this.targetGeometry.vertices.push(vertex);
            newIndex = this.targetGeometry.vertices.length - 1;
            this.addedVertices[index] = newIndex;
        }
        this.faceIndices.push(newIndex);
    };

    GeometryBuilder.prototype.addIntersection = function(keyA, keyB, distanceA, distanceB) {
        var t = Math.abs(distanceA) / (Math.abs(distanceA) + Math.abs(distanceB));
        var uv=this.addIntersectionUv(keyA, keyB, t);
        this.addIntersectionNormal(keyA, keyB, t);

        var indexA = this.sourceFace[keyA];
        var indexB = this.sourceFace[keyB];
        var id = this.intersectionId(indexA, indexB);
        var index;

        if (this.addedIntersections.hasOwnProperty(id)) {
            index = this.addedIntersections[id];
        } else {
            var vertexA = this.sourceGeometry.vertices[indexA];
            var vertexB = this.sourceGeometry.vertices[indexB];
            var newVertex = vertexA.clone().lerp(vertexB, t);
            this.targetGeometry.vertices.push(newVertex);
            index = this.targetGeometry.vertices.length - 1;
            this.addedIntersections[id] = index;
        }
        this.faceIndices.push(index);
        this.updateNewEdges(index);
    };

    GeometryBuilder.prototype.addUv = function(key) {
        if ( ! this.sourceFaceUvs) {
            return;
        }
        var index = this.keyIndex(key);
        var uv = this.sourceFaceUvs[index];
        this.faceUvs.push(uv);
        return uv;
    };

    GeometryBuilder.prototype.addIntersectionUv = function(keyA, keyB, t) {
        if ( ! this.sourceFaceUvs) {
            return;
        }
        var indexA = this.keyIndex(keyA);
        var indexB = this.keyIndex(keyB);
        var uvA = this.sourceFaceUvs[indexA];
        var uvB = this.sourceFaceUvs[indexB];
        var uv = uvA.clone().lerp(uvB, t);
        this.faceUvs.push(uv);
        return uv;
    };

    GeometryBuilder.prototype.addNormal = function(key) {
        if ( ! this.sourceFace.vertexNormals.length) {
            return;
        }
        var index = this.keyIndex(key);
        var normal = this.sourceFace.vertexNormals[index];
        this.faceNormals.push(normal);
    };

    GeometryBuilder.prototype.addIntersectionNormal = function(keyA, keyB, t) {
        if ( ! this.sourceFace.vertexNormals.length) {
            return;
        }
        var indexA = this.keyIndex(keyA);
        var indexB = this.keyIndex(keyB);
        var normalA = this.sourceFace.vertexNormals[indexA];
        var normalB = this.sourceFace.vertexNormals[indexB];
        var normal = normalA.clone().lerp(normalB, t).normalize();
        this.faceNormals.push(normal);
    };

    GeometryBuilder.prototype.addFace = function(indices) {
        if (indices.length === 3) {
            this.addFacePart(indices[0], indices[1], indices[2]);
            return;
        }

        var pairs = [];
        for (var i = 0; i < indices.length; i++) {
            for (var j = i + 1; j < indices.length; j++) {
                var diff = Math.abs(i - j);
                if (diff > 1 && diff < indices.length - 1) {
                    pairs.push([indices[i], indices[j]]);
                }
            }
        }

        pairs.sort(function(pairA, pairB) {
            var lengthA = this.faceEdgeLength(pairA[0], pairA[1]);
            var lengthB = this.faceEdgeLength(pairB[0], pairB[1]);
            return lengthA - lengthB;
        }.bind(this));

        var a = indices.indexOf(pairs[0][0]);
        indices = indices.slice(a).concat(indices.slice(0, a));

        var b = indices.indexOf(pairs[0][1]);
        var indicesA = indices.slice(0, b + 1);
        var indicesB = indices.slice(b).concat(indices.slice(0, 1));

        this.addFace(indicesA);
        this.addFace(indicesB);
    };

    GeometryBuilder.prototype.addFacePart = function(a, b, c) {
        var normals = null;
        if (this.faceNormals.length) {
            normals = [
                this.faceNormals[a],
                this.faceNormals[b],
                this.faceNormals[c],
            ];
        }
        var face = new THREE.Face3(
            this.faceIndices[a],
            this.faceIndices[b],
            this.faceIndices[c],
            normals
        );
        this.targetGeometry.faces.push(face);
        if ( ! this.sourceFaceUvs) {
            return;
        }
        this.targetGeometry.faceVertexUvs[0].push([
            this.faceUvs[a],
            this.faceUvs[b],
            this.faceUvs[c]
        ]);
    };

    GeometryBuilder.prototype.faceEdgeLength = function(a, b) {
        var indexA = this.faceIndices[a];
        var indexB = this.faceIndices[b];
        var vertexA = this.targetGeometry.vertices[indexA];
        var vertexB = this.targetGeometry.vertices[indexB];
        return vertexA.distanceToSquared(vertexB);
    };

    GeometryBuilder.prototype.intersectionId = function(indexA, indexB) {
        return [indexA, indexB].sort().join(',');
    };

    GeometryBuilder.prototype.keyIndex = function(key) {
        return FACE_KEYS.indexOf(key);
    };

    GeometryBuilder.prototype.updateNewEdges = function(index) {
        var edgeIndex = this.newEdges.length - 1;
        var edge = this.newEdges[edgeIndex];
        if (edge.length < 2) {
            edge.push(index);
        } else {
            this.newEdges.push([index]);
        }
    };

    GeometryBuilder.prototype.faceNormal = function(faceIndices) {
        var vertices = faceIndices.map(function(index) {
            return this.targetGeometry.vertices[index];
        }.bind(this));
        var edgeA = vertices[0].clone().sub(vertices[1]);
        var edgeB = vertices[0].clone().sub(vertices[2]);
        return edgeA.cross(edgeB).normalize();
    };

    return sliceGeometry;
};

},{"./faces-from-edges.js":2}]},{},[1]);
