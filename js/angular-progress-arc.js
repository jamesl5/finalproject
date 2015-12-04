/*! angular-progress-arc - v1.0.0 (http://mathewbyrne.github.io/angular-progress-arc/) */
!function(a){"use strict";var b=a.module("angular-progress-arc",[]);b.provider("progressArcDefaults",function(){var b={size:200,strokeWidth:20,stroke:"black",background:null};this.setDefault=function(a,c){return b[a]=c,this},this.$get=function(){return function(c){a.forEach(b,function(a,b){c[b]||(c[b]=a)})}}}),b.directive("progressArc",["progressArcDefaults",function(a){return{restrict:"E",scope:{size:"@",strokeWidth:"@",stroke:"@",counterClockwise:"@",complete:"&",background:"@"},compile:function(b,c){return a(c),function(a){a.offset=/firefox/i.test(navigator.userAgent)?-89.9:-90;var b=function(){a.strokeWidthCapped=Math.min(a.strokeWidth,a.size/2-1),a.radius=Math.max((a.size-a.strokeWidthCapped)/2-1,0),a.circumference=2*Math.PI*a.radius};a.$watchCollection("[size, strokeWidth]",b),b()}},template:'<svg ng-attr-width="{{size}}" ng-attr-height="{{size}}"><circle fill="none" ng-if="background" ng-attr-cx="{{size/2}}" ng-attr-cy="{{size/2}}" ng-attr-r="{{radius}}" ng-attr-stroke="{{background}}" ng-attr-stroke-width="{{strokeWidthCapped}}"/><circle fill="none" ng-attr-cx="{{size/2}}" ng-attr-cy="{{size/2}}" ng-attr-r="{{radius}}" ng-attr-stroke="{{stroke}}" ng-attr-stroke-width="{{strokeWidthCapped}}"ng-attr-stroke-dasharray="{{circumference}}"ng-attr-stroke-dashoffset="{{(1 - complete()) * circumference}}"ng-attr-transform="rotate({{offset}}, {{size/2}}, {{size/2}})'+"{{ (counterClockwise && counterClockwise != 'false') ? ' translate(0, ' + size + ') scale(1, -1)' : '' }}\"/></svg>"}}])}(window.angular);