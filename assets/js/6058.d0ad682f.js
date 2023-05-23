/*! For license information please see 6058.d0ad682f.js.LICENSE.txt */
(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([[6058],{34982:(i,t,n)=>{"use strict";function e(i){let t=1/0,n=1/0,e=1/0,s=-1/0,h=-1/0,r=-1/0;const u=i.POSITION?i.POSITION.value:[],o=u&&u.length;for(let g=0;g<o;g+=3){const i=u[g],o=u[g+1],f=u[g+2];t=i<t?i:t,n=o<n?o:n,e=f<e?f:e,s=i>s?i:s,h=o>h?o:h,r=f>r?f:r}return[[t,n,e],[s,h,r]]}n.d(t,{v:()=>e})},26734:function(i,t){var n,e,s;e=[],void 0===(s="function"==typeof(n=function(){"use strict";function i(i,t,n){this.low=0|i,this.high=0|t,this.unsigned=!!n}function t(i){return!0===(i&&i.__isLong__)}i.prototype.__isLong__,Object.defineProperty(i.prototype,"__isLong__",{value:!0,enumerable:!1,configurable:!1}),i.isLong=t;var n={},e={};function s(i,t){var s,h,u;return t?(u=0<=(i>>>=0)&&i<256)&&(h=e[i])?h:(s=r(i,(0|i)<0?-1:0,!0),u&&(e[i]=s),s):(u=-128<=(i|=0)&&i<128)&&(h=n[i])?h:(s=r(i,i<0?-1:0,!1),u&&(n[i]=s),s)}function h(i,t){if(isNaN(i)||!isFinite(i))return t?w:v;if(t){if(i<0)return w;if(i>=l)return E}else{if(i<=-d)return q;if(i+1>=d)return b}return i<0?h(-i,t).neg():r(i%a|0,i/a|0,t)}function r(t,n,e){return new i(t,n,e)}i.fromInt=s,i.fromNumber=h,i.fromBits=r;var u=Math.pow;function o(i,t,n){if(0===i.length)throw Error("empty string");if("NaN"===i||"Infinity"===i||"+Infinity"===i||"-Infinity"===i)return v;if("number"==typeof t?(n=t,t=!1):t=!!t,(n=n||10)<2||36<n)throw RangeError("radix");var e;if((e=i.indexOf("-"))>0)throw Error("interior hyphen");if(0===e)return o(i.substring(1),t,n).neg();for(var s=h(u(n,8)),r=v,g=0;g<i.length;g+=8){var f=Math.min(8,i.length-g),a=parseInt(i.substring(g,g+f),n);if(f<8){var l=h(u(n,f));r=r.mul(l).add(h(a))}else r=(r=r.mul(s)).add(h(a))}return r.unsigned=t,r}function g(t){return t instanceof i?t:"number"==typeof t?h(t):"string"==typeof t?o(t):r(t.low,t.high,t.unsigned)}i.fromString=o,i.fromValue=g;var f=65536,a=f*f,l=a*a,d=l/2,c=s(1<<24),v=s(0);i.ZERO=v;var w=s(0,!0);i.UZERO=w;var m=s(1);i.ONE=m;var N=s(1,!0);i.UONE=N;var p=s(-1);i.NEG_ONE=p;var b=r(-1,2147483647,!1);i.MAX_VALUE=b;var E=r(-1,-1,!0);i.MAX_UNSIGNED_VALUE=E;var q=r(0,-2147483648,!1);i.MIN_VALUE=q;var y=i.prototype;return y.toInt=function(){return this.unsigned?this.low>>>0:this.low},y.toNumber=function(){return this.unsigned?(this.high>>>0)*a+(this.low>>>0):this.high*a+(this.low>>>0)},y.toString=function(i){if((i=i||10)<2||36<i)throw RangeError("radix");if(this.isZero())return"0";if(this.isNegative()){if(this.eq(q)){var t=h(i),n=this.div(t),e=n.mul(t).sub(this);return n.toString(i)+e.toInt().toString(i)}return"-"+this.neg().toString(i)}for(var s=h(u(i,6),this.unsigned),r=this,o="";;){var g=r.div(s),f=(r.sub(g.mul(s)).toInt()>>>0).toString(i);if((r=g).isZero())return f+o;for(;f.length<6;)f="0"+f;o=""+f+o}},y.getHighBits=function(){return this.high},y.getHighBitsUnsigned=function(){return this.high>>>0},y.getLowBits=function(){return this.low},y.getLowBitsUnsigned=function(){return this.low>>>0},y.getNumBitsAbs=function(){if(this.isNegative())return this.eq(q)?64:this.neg().getNumBitsAbs();for(var i=0!=this.high?this.high:this.low,t=31;t>0&&0==(i&1<<t);t--);return 0!=this.high?t+33:t+1},y.isZero=function(){return 0===this.high&&0===this.low},y.isNegative=function(){return!this.unsigned&&this.high<0},y.isPositive=function(){return this.unsigned||this.high>=0},y.isOdd=function(){return 1==(1&this.low)},y.isEven=function(){return 0==(1&this.low)},y.equals=function(i){return t(i)||(i=g(i)),(this.unsigned===i.unsigned||this.high>>>31!=1||i.high>>>31!=1)&&this.high===i.high&&this.low===i.low},y.eq=y.equals,y.notEquals=function(i){return!this.eq(i)},y.neq=y.notEquals,y.lessThan=function(i){return this.comp(i)<0},y.lt=y.lessThan,y.lessThanOrEqual=function(i){return this.comp(i)<=0},y.lte=y.lessThanOrEqual,y.greaterThan=function(i){return this.comp(i)>0},y.gt=y.greaterThan,y.greaterThanOrEqual=function(i){return this.comp(i)>=0},y.gte=y.greaterThanOrEqual,y.compare=function(i){if(t(i)||(i=g(i)),this.eq(i))return 0;var n=this.isNegative(),e=i.isNegative();return n&&!e?-1:!n&&e?1:this.unsigned?i.high>>>0>this.high>>>0||i.high===this.high&&i.low>>>0>this.low>>>0?-1:1:this.sub(i).isNegative()?-1:1},y.comp=y.compare,y.negate=function(){return!this.unsigned&&this.eq(q)?q:this.not().add(m)},y.neg=y.negate,y.add=function(i){t(i)||(i=g(i));var n=this.high>>>16,e=65535&this.high,s=this.low>>>16,h=65535&this.low,u=i.high>>>16,o=65535&i.high,f=i.low>>>16,a=0,l=0,d=0,c=0;return d+=(c+=h+(65535&i.low))>>>16,l+=(d+=s+f)>>>16,a+=(l+=e+o)>>>16,a+=n+u,r((d&=65535)<<16|(c&=65535),(a&=65535)<<16|(l&=65535),this.unsigned)},y.subtract=function(i){return t(i)||(i=g(i)),this.add(i.neg())},y.sub=y.subtract,y.multiply=function(i){if(this.isZero())return v;if(t(i)||(i=g(i)),i.isZero())return v;if(this.eq(q))return i.isOdd()?q:v;if(i.eq(q))return this.isOdd()?q:v;if(this.isNegative())return i.isNegative()?this.neg().mul(i.neg()):this.neg().mul(i).neg();if(i.isNegative())return this.mul(i.neg()).neg();if(this.lt(c)&&i.lt(c))return h(this.toNumber()*i.toNumber(),this.unsigned);var n=this.high>>>16,e=65535&this.high,s=this.low>>>16,u=65535&this.low,o=i.high>>>16,f=65535&i.high,a=i.low>>>16,l=65535&i.low,d=0,w=0,m=0,N=0;return m+=(N+=u*l)>>>16,w+=(m+=s*l)>>>16,m&=65535,w+=(m+=u*a)>>>16,d+=(w+=e*l)>>>16,w&=65535,d+=(w+=s*a)>>>16,w&=65535,d+=(w+=u*f)>>>16,d+=n*l+e*a+s*f+u*o,r((m&=65535)<<16|(N&=65535),(d&=65535)<<16|(w&=65535),this.unsigned)},y.mul=y.multiply,y.divide=function(i){if(t(i)||(i=g(i)),i.isZero())throw Error("division by zero");if(this.isZero())return this.unsigned?w:v;var n,e,s;if(this.unsigned){if(i.unsigned||(i=i.toUnsigned()),i.gt(this))return w;if(i.gt(this.shru(1)))return N;s=w}else{if(this.eq(q))return i.eq(m)||i.eq(p)?q:i.eq(q)?m:(n=this.shr(1).div(i).shl(1)).eq(v)?i.isNegative()?m:p:(e=this.sub(i.mul(n)),s=n.add(e.div(i)));if(i.eq(q))return this.unsigned?w:v;if(this.isNegative())return i.isNegative()?this.neg().div(i.neg()):this.neg().div(i).neg();if(i.isNegative())return this.div(i.neg()).neg();s=v}for(e=this;e.gte(i);){n=Math.max(1,Math.floor(e.toNumber()/i.toNumber()));for(var r=Math.ceil(Math.log(n)/Math.LN2),o=r<=48?1:u(2,r-48),f=h(n),a=f.mul(i);a.isNegative()||a.gt(e);)a=(f=h(n-=o,this.unsigned)).mul(i);f.isZero()&&(f=m),s=s.add(f),e=e.sub(a)}return s},y.div=y.divide,y.modulo=function(i){return t(i)||(i=g(i)),this.sub(this.div(i).mul(i))},y.mod=y.modulo,y.not=function(){return r(~this.low,~this.high,this.unsigned)},y.and=function(i){return t(i)||(i=g(i)),r(this.low&i.low,this.high&i.high,this.unsigned)},y.or=function(i){return t(i)||(i=g(i)),r(this.low|i.low,this.high|i.high,this.unsigned)},y.xor=function(i){return t(i)||(i=g(i)),r(this.low^i.low,this.high^i.high,this.unsigned)},y.shiftLeft=function(i){return t(i)&&(i=i.toInt()),0==(i&=63)?this:i<32?r(this.low<<i,this.high<<i|this.low>>>32-i,this.unsigned):r(0,this.low<<i-32,this.unsigned)},y.shl=y.shiftLeft,y.shiftRight=function(i){return t(i)&&(i=i.toInt()),0==(i&=63)?this:i<32?r(this.low>>>i|this.high<<32-i,this.high>>i,this.unsigned):r(this.high>>i-32,this.high>=0?0:-1,this.unsigned)},y.shr=y.shiftRight,y.shiftRightUnsigned=function(i){if(t(i)&&(i=i.toInt()),0==(i&=63))return this;var n=this.high;return i<32?r(this.low>>>i|n<<32-i,n>>>i,this.unsigned):r(32===i?n:n>>>i-32,0,this.unsigned)},y.shru=y.shiftRightUnsigned,y.toSigned=function(){return this.unsigned?r(this.low,this.high,!1):this},y.toUnsigned=function(){return this.unsigned?this:r(this.low,this.high,!0)},y.toBytes=function(i){return i?this.toBytesLE():this.toBytesBE()},y.toBytesLE=function(){var i=this.high,t=this.low;return[255&t,t>>>8&255,t>>>16&255,t>>>24&255,255&i,i>>>8&255,i>>>16&255,i>>>24&255]},y.toBytesBE=function(){var i=this.high,t=this.low;return[i>>>24&255,i>>>16&255,i>>>8&255,255&i,t>>>24&255,t>>>16&255,t>>>8&255,255&t]},i})?n.apply(t,e):n)||(i.exports=s)}}]);