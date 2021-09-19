define(["exports","./Matrix2-ccd5b911","./RuntimeError-346a3079","./OrientedBoundingBox-0a826a8b"],function(n,d,t,l){"use strict";var e={},i=new d.Cartesian3,f=new d.Cartesian3,x=new d.Cartesian3,B=new d.Cartesian3,M=new l.OrientedBoundingBox;function o(n,t,e,r,a){t=d.Cartesian3.subtract(n,t,i),e=d.Cartesian3.dot(e,t),t=d.Cartesian3.dot(r,t);return d.Cartesian2.fromElements(e,t,a)}e.validOutline=function(n){var t=l.OrientedBoundingBox.fromPoints(n,M).halfAxes,e=d.Matrix3.getColumn(t,0,f),n=d.Matrix3.getColumn(t,1,x),t=d.Matrix3.getColumn(t,2,B),e=d.Cartesian3.magnitude(e),n=d.Cartesian3.magnitude(n),t=d.Cartesian3.magnitude(t);return!(0===e&&(0===n||0===t)||0===n&&0===t)},e.computeProjectTo2DArguments=function(n,t,e,r){var a,i,o=l.OrientedBoundingBox.fromPoints(n,M),u=o.halfAxes,s=d.Matrix3.getColumn(u,0,f),C=d.Matrix3.getColumn(u,1,x),m=d.Matrix3.getColumn(u,2,B),c=d.Cartesian3.magnitude(s),g=d.Cartesian3.magnitude(C),n=d.Cartesian3.magnitude(m),u=Math.min(c,g,n);return(0!==c||0!==g&&0!==n)&&(0!==g||0!==n)&&(u!==g&&u!==n||(a=s),u===c?a=C:u===n&&(i=C),u!==c&&u!==g||(i=m),d.Cartesian3.normalize(a,e),d.Cartesian3.normalize(i,r),d.Cartesian3.clone(o.center,t),!0)},e.createProjectPointsTo2DFunction=function(r,a,i){return function(n){for(var t=new Array(n.length),e=0;e<n.length;e++)t[e]=o(n[e],r,a,i);return t}},e.createProjectPointTo2DFunction=function(e,r,a){return function(n,t){return o(n,e,r,a,t)}},n.CoplanarPolygonGeometryLibrary=e});
