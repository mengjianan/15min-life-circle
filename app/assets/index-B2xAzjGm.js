import{r as d,a as q,R as K}from"./react-vendor-nf7bT_Uh.js";import{i as A}from"./echarts-vendor-BBmD_jO2.js";(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))c(n);new MutationObserver(n=>{for(const l of n)if(l.type==="childList")for(const a of l.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&c(a)}).observe(document,{childList:!0,subtree:!0});function x(n){const l={};return n.integrity&&(l.integrity=n.integrity),n.referrerPolicy&&(l.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?l.credentials="include":n.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function c(n){if(n.ep)return;n.ep=!0;const l=x(n);fetch(n.href,l)}})();var Y={exports:{}},W={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var X=d,Q=Symbol.for("react.element"),ee=Symbol.for("react.fragment"),se=Object.prototype.hasOwnProperty,te=X.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,ne={key:!0,ref:!0,__self:!0,__source:!0};function J(s,o,x){var c,n={},l=null,a=null;x!==void 0&&(l=""+x),o.key!==void 0&&(l=""+o.key),o.ref!==void 0&&(a=o.ref);for(c in o)se.call(o,c)&&!ne.hasOwnProperty(c)&&(n[c]=o[c]);if(s&&s.defaultProps)for(c in o=s.defaultProps,o)n[c]===void 0&&(n[c]=o[c]);return{$$typeof:Q,type:s,key:l,ref:a,props:n,_owner:te.current}}W.Fragment=ee;W.jsx=J;W.jsxs=J;Y.exports=W;var e=Y.exports,I={},D=q;I.createRoot=D.createRoot,I.hydrateRoot=D.hydrateRoot;const re=({loading:s,message:o="加载中..."})=>s?e.jsx("div",{className:"loading-overlay",children:e.jsxs("div",{className:"loading-content",children:[e.jsxs("div",{className:"loading-spinner",children:[e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"})]}),e.jsx("p",{className:"loading-message",children:o}),e.jsx("p",{className:"loading-submessage",children:"正在调用百度地图API计算等时圈..."})]})}):null,ie=({center:s,isochrone:o,poiCoverage:x,blindSpots:c,loading:n=!1,onCenterChange:l})=>{const a=d.useRef(null),t=d.useRef(null),[r,m]=d.useState(!1),[h,j]=d.useState(null),[u,w]=d.useState(!0),[b,R]=d.useState(!0),[C,$]=d.useState(!0),[L,S]=d.useState(!1),M=d.useCallback(()=>new Promise((g,f)=>{const i=()=>{const p=window.BMap;p&&p.Map?g():setTimeout(i,100)};i(),setTimeout(()=>f(new Error("百度地图API加载超时")),1e4)}),[]);d.useEffect(()=>{let g=!0;return(async()=>{try{if(await M(),!g||!a.current||t.current)return;const i=window.BMap,p=new i.Map(a.current),k=new i.Point(118.7969,32.0603);p.centerAndZoom(k,14),p.enableScrollWheelZoom(),p.addControl(new i.NavigationControl),p.addControl(new i.ScaleControl),p.addControl(new i.OverviewMapControl),p.addEventListener("click",N=>{L&&l&&l(N.point.lng,N.point.lat)}),t.current=p,g&&m(!0)}catch(i){console.error("地图初始化失败:",i),g&&j("地图加载失败，请刷新页面重试")}})(),()=>{g=!1}},[M,L,l]),d.useEffect(()=>{if(r&&t.current&&s){const g=window.BMap,f=new g.Point(s.lng,s.lat);t.current.panTo(f),t.current.setZoom(14)}},[s,r]),d.useEffect(()=>{if(r&&t.current&&o){const g=t.current,f=window.BMap;if(g.clearOverlays(),o.boundary_points&&o.boundary_points.length>0){const i=o.boundary_points.map(k=>new f.Point(k.lng,k.lat)),p=new f.Polygon(i,{strokeColor:"#667eea",strokeWeight:2,strokeOpacity:.8,fillColor:"#667eea",fillOpacity:.15});g.addOverlay(p)}if(s){const i=new f.Point(s.lng,s.lat),p=new f.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#667eea" stroke="white" stroke-width="3"/><circle cx="16" cy="16" r="6" fill="white"/></svg>'),new f.Size(32,32),{anchor:new f.Size(16,16)}),k=new f.Marker(i,{icon:p});g.addOverlay(k);const N=new f.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #333; margin-bottom: 4px;">'+s.name+'</div><div style="font-size: 12px; color: #666;">经度: '+s.lng.toFixed(4)+", 纬度: "+s.lat.toFixed(4)+"</div></div>",{width:220,height:60});k.addEventListener("click",()=>{g.openInfoWindow(N,i)})}b&&x&&Object.entries(x).forEach(([i,p])=>{if(p.facilities&&p.facilities.length>0){const N={医疗:"#ff4d4f",教育:"#1890ff",购物:"#52c41a",养老:"#722ed1",文体:"#fa8c16",餐饮:"#eb2f96"}[i]||"#666";p.facilities.forEach(y=>{if(y.location){const z=new f.Point(y.location.lng,y.location.lat),V=new f.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="'+N+'" stroke="white" stroke-width="2"/></svg>'),new f.Size(20,20),{anchor:new f.Size(10,10)}),H=new f.Marker(z,{icon:V});g.addOverlay(H);const Z=new f.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #333;">'+y.name+'</div><div style="font-size: 12px; color: '+N+'; margin-top: 4px;">'+i+"</div>"+(y.address?'<div style="font-size: 11px; color: #999; margin-top: 2px;">'+y.address+"</div>":"")+(y.distance?'<div style="font-size: 11px; color: #666; margin-top: 2px;">距离: '+y.distance+"米</div>":"")+"</div>",{width:250,height:80});H.addEventListener("click",()=>{g.openInfoWindow(Z,z)})}})}}),C&&c&&c.length>0&&c.forEach((i,p)=>{if(i.center){const k=new f.Point(i.center.lng,i.center.lat),N=new f.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" fill="#ff4d4f" stroke="white" stroke-width="1.5"/><text x="12" y="18" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text></svg>'),new f.Size(24,24),{anchor:new f.Size(12,24)}),y=new f.Marker(k,{icon:N});g.addOverlay(y);const z=new f.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #ff4d4f;">服务盲区 #'+(p+1)+'</div><div style="font-size: 12px; color: #333; margin-top: 4px;">类别: '+(i.category||"未知")+'</div><div style="font-size: 11px; color: #666; margin-top: 2px;">'+(i.description||"该区域缺少相关设施覆盖")+"</div></div>",{width:250,height:80});y.addEventListener("click",()=>{g.openInfoWindow(z,k)})}})}},[r,o,s,x,c,b,C]);const E=d.useCallback(()=>{S(g=>!g)},[]),_=d.useCallback(()=>{w(g=>!g)},[]),O=d.useCallback(()=>{R(g=>!g)},[]),P=d.useCallback(()=>{$(g=>!g)},[]);return h?e.jsxs("div",{className:"map-error",children:[e.jsx("div",{className:"map-error-icon",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})}),e.jsx("p",{children:h}),e.jsx("button",{onClick:()=>window.location.reload(),children:"刷新页面"})]}):e.jsxs("div",{className:"map-wrapper",children:[e.jsxs("div",{className:"map-controls",children:[e.jsx("button",{className:`map-control-btn ${L?"active":""}`,onClick:E,title:L?"关闭点击选点":"开启点击选点",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]})}),e.jsx("button",{className:`map-control-btn ${u?"active":""}`,onClick:_,title:u?"隐藏路网":"显示路网",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]})}),e.jsx("button",{className:`map-control-btn ${b?"active":""}`,onClick:O,title:b?"隐藏设施":"显示设施",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]})}),e.jsx("button",{className:`map-control-btn ${C?"active":""}`,onClick:P,title:C?"隐藏盲区":"显示盲区",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})})]}),e.jsx("div",{ref:a,className:"map-container"}),n&&e.jsx(re,{loading:!0}),L&&e.jsxs("div",{className:"click-mode-hint",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"点击地图选择位置"]})]})},U={医疗:({size:s=20})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M22 12h-4l-3 9L9 3l-3 9H2"})}),教育:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","stroke-linejoin":"round",children:[e.jsx("path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"}),e.jsx("path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"})]}),购物:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"9",cy:"21",r:"1"}),e.jsx("circle",{cx:"20",cy:"21",r:"1"}),e.jsx("path",{d:"M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"})]}),养老:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),文体:({size:s=20})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})}),餐饮:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 8h1a4 4 0 0 1 0 8h-1"}),e.jsx("path",{d:"M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"}),e.jsx("line",{x1:"6",y1:"1",x2:"6",y2:"4"}),e.jsx("line",{x1:"10",y1:"1",x2:"10",y2:"4"}),e.jsx("line",{x1:"14",y1:"1",x2:"14",y2:"4"})]}),综合:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polygon",{points:"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"})]})},oe={Warning:({size:s=24})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})},F=s=>({医疗:"#ef4444",教育:"#3b82f6",购物:"#22c55e",养老:"#8b5cf6",文体:"#06b6d4",餐饮:"#f59e0b",综合:"#6b7280"})[s]||"#6b7280",T=s=>({医疗:"#fef2f2",教育:"#eff6ff",购物:"#f0fdf4",养老:"#f5f3ff",文体:"#ecfeff",餐饮:"#fffbeb",综合:"#f9fafb"})[s]||"#f9fafb",ae=({communityName:s,score:o,suggestions:x,blindSpots:c})=>{const n=a=>{switch(a){case"优秀":return"#52c41a";case"良好":return"#1890ff";case"一般":return"#faad14";case"需改善":return"#ff4d4f";default:return"#666"}},l=a=>{const t={高:"#ff4d4f",中:"#faad14",低:"#52c41a"};return e.jsx("span",{className:"priority-tag",style:{backgroundColor:t[a]||"#666"},children:a})};return e.jsxs("div",{className:"report-container",children:[e.jsxs("h2",{children:[s," - 生活圈体检报告"]}),e.jsxs("div",{className:"score-section",children:[e.jsxs("div",{className:"score-circle",style:{borderColor:n(o.level)},children:[e.jsx("span",{className:"score-number",children:o.total}),e.jsx("span",{className:"score-level",children:o.level})]}),e.jsxs("div",{className:"score-detail",children:[e.jsx("p",{children:"综合评分"}),o.blind_spot_penalty>0&&e.jsxs("p",{className:"penalty-note",children:["盲区扣分: -",o.blind_spot_penalty,"分"]})]})]}),e.jsxs("div",{className:"category-scores",children:[e.jsx("h3",{children:"各类设施评分"}),e.jsx("div",{className:"category-grid",children:Object.entries(o.categories).map(([a,t])=>e.jsxs("div",{className:"category-item",children:[e.jsx("span",{className:"category-name",children:a}),e.jsx("div",{className:"category-bar",children:e.jsx("div",{className:"category-fill",style:{width:`${t}%`,backgroundColor:t>=80?"#52c41a":t>=60?"#1890ff":"#ff4d4f"}})}),e.jsx("span",{className:"category-score",children:t})]},a))})]}),x.length>0&&e.jsxs("div",{className:"suggestions-section",children:[e.jsx("h3",{children:"改善建议"}),e.jsx("ul",{className:"suggestions-list",children:x.map((a,t)=>e.jsxs("li",{className:"suggestion-item",children:[l(a.priority),e.jsxs("span",{className:"suggestion-category",children:["[",a.category,"]"]}),e.jsx("span",{className:"suggestion-message",children:a.message})]},t))})]}),c.length>0&&e.jsxs("div",{className:"blind-spots-section",children:[e.jsxs("h3",{children:["服务盲区 (",c.length,"个)"]}),e.jsx("div",{className:"blind-spots-list",children:c.map((a,t)=>e.jsxs("div",{className:"blind-spot-item",children:[e.jsx("span",{className:"blind-spot-icon",children:e.jsx(oe.Warning,{size:18})}),e.jsxs("div",{className:"blind-spot-info",children:[e.jsx("span",{className:"blind-spot-category",children:a.category}),e.jsx("span",{className:"blind-spot-desc",children:a.description})]})]},t))})]})]})},le=({categories:s})=>{const o=d.useRef(null),x=d.useRef(null);return d.useEffect(()=>{if(!o.current)return;const c=A(o.current);return x.current=c,()=>{c.dispose()}},[]),d.useEffect(()=>{if(!x.current)return;const c=Object.keys(s),n=Object.values(s),l={title:{text:"设施覆盖雷达图",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},radar:{indicator:c.map(a=>({name:a,max:100})),shape:"circle",splitNumber:5,axisName:{color:"#333",fontSize:12},splitLine:{lineStyle:{color:"#ddd"}},splitArea:{show:!0,areaStyle:{color:["rgba(24, 144, 255, 0.1)","rgba(24, 144, 255, 0.2)"]}}},series:[{type:"radar",data:[{value:n,name:"设施覆盖评分",areaStyle:{color:"rgba(24, 144, 255, 0.3)"},lineStyle:{color:"#1890ff",width:2},itemStyle:{color:"#1890ff"}}]}]};x.current.setOption(l)},[s]),d.useEffect(()=>{const c=()=>{var n;(n=x.current)==null||n.resize()};return window.addEventListener("resize",c),()=>window.removeEventListener("resize",c)},[]),e.jsx("div",{className:"radar-chart-container",children:e.jsx("div",{ref:o,className:"radar-chart"})})},ce=({data:s,onTimeChange:o})=>{const[x,c]=d.useState(15),n=[{value:5,label:"5分钟",color:"#52c41a"},{value:10,label:"10分钟",color:"#faad14"},{value:15,label:"15分钟",color:"#1890ff"}],l=r=>{c(r),o(r)},t=n.map(r=>{var h,j,u;let m=0;return r.value===5?m=((h=s.time5)==null?void 0:h.area)||0:r.value===10?m=((j=s.time10)==null?void 0:j.area)||0:r.value===15&&(m=((u=s.time15)==null?void 0:u.area)||0),{...r,area:m,areaText:m>0?`${(m/1e6).toFixed(2)} km²`:"计算中"}});return e.jsxs("div",{className:"time-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),"时间维度对比"]}),e.jsx("div",{className:"time-selector",children:n.map(r=>e.jsxs("button",{className:`time-button ${x===r.value?"active":""}`,onClick:()=>l(r.value),children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",style:{width:20,height:20,color:r.color},children:e.jsx("path",{d:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"})}),e.jsx("span",{className:"time-label",children:r.label})]},r.value))}),e.jsx("div",{className:"area-stats",children:t.map(r=>e.jsxs("div",{className:`area-item ${x===r.value?"active":""}`,children:[e.jsx("div",{className:"area-color",style:{backgroundColor:r.color}}),e.jsxs("div",{className:"area-info",children:[e.jsx("span",{className:"area-time",children:r.label}),e.jsx("span",{className:"area-value",children:r.areaText})]})]},r.value))}),e.jsx("div",{className:"area-chart",children:e.jsx("div",{className:"chart-bars",children:t.map(r=>{const m=Math.max(...t.map(j=>j.area||1)),h=r.area>0?r.area/m*100:0;return e.jsxs("div",{className:"chart-bar-container",children:[e.jsx("div",{className:"chart-bar-label",children:r.label}),e.jsx("div",{className:"chart-bar-track",children:e.jsx("div",{className:"chart-bar-fill",style:{width:`${h}%`,backgroundColor:r.color}})}),e.jsx("div",{className:"chart-bar-value",children:r.areaText})]},r.value)})})})]})},de=({data:s})=>{const o=d.useRef(null),x=d.useRef(null);d.useEffect(()=>{if(!o.current)return;const l=A(o.current);return x.current=l,()=>{l.dispose()}},[]),d.useEffect(()=>{var m,h,j;if(!x.current)return;const l=["5分钟","10分钟","15分钟"],a=[(m=s.time5)!=null&&m.area?s.time5.area/1e6:0,(h=s.time10)!=null&&h.area?s.time10.area/1e6:0,(j=s.time15)!=null&&j.area?s.time15.area/1e6:0],t=["#52c41a","#faad14","#1890ff"],r={title:{text:"等时圈面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:u=>{const w=u[0];return`${w.name}<br/>面积: ${w.value.toFixed(2)} km²`}},xAxis:{type:"category",data:l,axisLabel:{fontSize:12}},yAxis:{type:"value",name:"面积 (km²)",axisLabel:{fontSize:12}},series:[{type:"bar",data:a.map((u,w)=>({value:u,itemStyle:{color:t[w],borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};x.current.setOption(r)},[s]),d.useEffect(()=>{const l=()=>{var a;(a=x.current)==null||a.resize()};return window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[]);const n=(()=>{var a,t;return!((a=s.time5)!=null&&a.area)||!((t=s.time15)!=null&&t.area)?null:((s.time15.area-s.time5.area)/s.time5.area*100).toFixed(1)})();return e.jsxs("div",{className:"area-comparison-container",children:[e.jsx("div",{ref:o,className:"area-chart"}),n&&e.jsxs("div",{className:"growth-info",children:[e.jsx("span",{className:"growth-label",children:"15分钟比5分钟面积增长:"}),e.jsxs("span",{className:"growth-value",children:["+",n,"%"]})]})]})},xe=({poiCoverage:s})=>{const o=t=>Math.round(t/1.2/60),c=(()=>{const t=[];return Object.entries(s).forEach(([r,m])=>{m.facilities.forEach(h=>{t.push({...h,category:r})})}),t.sort((r,m)=>(r.distance||0)-(m.distance||0))})(),l=(()=>{const t={};return Object.keys(s).forEach(r=>{const m=c.filter(h=>h.category===r);t[r]=m.length>0?m[0]:null}),t})(),a=(t,r=20)=>{const m=U[t]||U.综合;return e.jsx(m,{size:r})};return e.jsxs("div",{className:"facility-accessibility",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"设施可达性分析"]}),e.jsxs("div",{className:"nearest-facilities",children:[e.jsx("h5",{children:"各类最近设施"}),e.jsx("div",{className:"nearest-grid",children:Object.entries(l).map(([t,r])=>{const m=F(t),h=T(t);return e.jsxs("div",{className:"nearest-item",children:[e.jsx("span",{className:"nearest-icon",style:{backgroundColor:h,color:m},children:a(t)}),e.jsxs("div",{className:"nearest-info",children:[e.jsx("span",{className:"nearest-category",children:t}),r?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"nearest-name",children:r.name}),e.jsxs("span",{className:"nearest-distance",children:[r.distance?`${r.distance}米`:"未知",r.distance&&` (${o(r.distance)}分钟)`]})]}):e.jsx("span",{className:"nearest-none",children:"暂无数据"})]})]},t)})})]}),c.length>0&&e.jsxs("div",{className:"facility-list",children:[e.jsx("h5",{children:"周边设施列表 (前10个)"}),e.jsx("div",{className:"facility-items",children:c.slice(0,10).map((t,r)=>{const m=F(t.category),h=T(t.category);return e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-icon",style:{backgroundColor:h,color:m},children:a(t.category)}),e.jsxs("div",{className:"facility-info",children:[e.jsx("span",{className:"facility-name",children:t.name}),e.jsx("span",{className:"facility-address",children:t.address||"暂无地址"})]}),e.jsx("div",{className:"facility-distance",children:t.distance&&e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"distance-value",children:[t.distance,"米"]}),e.jsxs("span",{className:"distance-time",children:["步行",o(t.distance),"分钟"]})]})})]},r)})})]}),e.jsxs("div",{className:"accessibility-score",children:[e.jsx("h5",{children:"可达性评分"}),e.jsx("div",{className:"score-items",children:Object.entries(s).map(([t,r])=>{const m=F(t),h=T(t),j=r.count>=5?100:r.count>=3?80:r.count>=1?60:30;return e.jsxs("div",{className:"score-item",children:[e.jsx("span",{className:"score-icon",style:{backgroundColor:h,color:m},children:a(t)}),e.jsx("span",{className:"score-category",children:t}),e.jsx("div",{className:"score-bar",children:e.jsx("div",{className:"score-fill",style:{width:`${j}%`,backgroundColor:j>=80?"#22c55e":j>=60?"#3b82f6":"#ef4444"}})}),e.jsx("span",{className:"score-value",children:j})]},t)})})]})]})},he=({onCenterSelect:s,currentCenter:o})=>{var h,j;const[x,c]=d.useState(((h=o==null?void 0:o.lng)==null?void 0:h.toString())||"118.7784"),[n,l]=d.useState(((j=o==null?void 0:o.lat)==null?void 0:j.toString())||"32.0663"),[a,t]=d.useState((o==null?void 0:o.name)||"自定义位置"),r=u=>{u.preventDefault();const w=parseFloat(x),b=parseFloat(n);if(isNaN(w)||isNaN(b)){alert("请输入有效的经纬度");return}if(w<73||w>135||b<3||b>53){alert("经纬度超出中国范围");return}s(w,b)},m=()=>{navigator.geolocation?navigator.geolocation.getCurrentPosition(u=>{const{longitude:w,latitude:b}=u.coords;c(w.toFixed(6)),l(b.toFixed(6)),t("当前位置"),s(w,b)},u=>{alert("无法获取当前位置，请手动输入"),console.error("获取位置失败:",u)}):alert("浏览器不支持地理定位")};return e.jsxs("div",{className:"custom-center",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"自定义中心点"]}),e.jsxs("form",{onSubmit:r,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"经度:"}),e.jsx("input",{type:"number",step:"0.000001",value:x,onChange:u=>c(u.target.value),placeholder:"118.7784"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"纬度:"}),e.jsx("input",{type:"number",step:"0.000001",value:n,onChange:u=>l(u.target.value),placeholder:"32.0663"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"名称:"}),e.jsx("input",{type:"text",value:a,onChange:u=>t(u.target.value),placeholder:"自定义位置"})]}),e.jsxs("div",{className:"button-group",children:[e.jsx("button",{type:"submit",className:"apply-button",children:"应用"}),e.jsxs("button",{type:"button",className:"location-button",onClick:m,children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("circle",{cx:"12",cy:"12",r:"4"}),e.jsx("line",{x1:"4.93",y1:"4.93",x2:"9.17",y2:"9.17"}),e.jsx("line",{x1:"14.83",y1:"14.83",x2:"19.07",y2:"19.07"}),e.jsx("line",{x1:"14.83",y1:"9.17",x2:"19.07",y2:"4.93"}),e.jsx("line",{x1:"4.93",y1:"19.07",x2:"9.17",y2:"14.83"})]}),"获取当前位置"]})]})]}),o&&e.jsxs("div",{className:"current-info",children:[e.jsx("p",{children:"当前中心点:"}),e.jsx("p",{className:"center-name",children:o.name}),e.jsxs("p",{className:"center-coord",children:["(",o.lng.toFixed(4),", ",o.lat.toFixed(4),")"]})]}),e.jsxs("div",{className:"preset-locations",children:[e.jsx("h5",{children:"预设位置"}),e.jsx("div",{className:"preset-list",children:[{name:"南京市中心",lng:118.7969,lat:32.0603},{name:"新街口",lng:118.7874,lat:32.0423},{name:"鼓楼广场",lng:118.7784,lat:32.0663},{name:"夫子庙",lng:118.7894,lat:32.0233}].map(u=>e.jsx("button",{className:"preset-button",onClick:()=>{c(u.lng.toString()),l(u.lat.toString()),t(u.name),s(u.lng,u.lat)},children:u.name},u.name))})]})]})},me=({history:s})=>{const o=d.useRef(null),x=d.useRef(null),[c,n]=d.useState("score");return d.useEffect(()=>{if(!o.current)return;const l=A(o.current);return x.current=l,()=>{l.dispose()}},[]),d.useEffect(()=>{var a;if(!x.current||s.length===0)return;let l;if(c==="score")l={title:{text:"社区综合评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:t=>{const r=t[0];return`${r.name}<br/>评分: ${r.value}`}},xAxis:{type:"category",data:s.map(t=>t.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"评分",min:0,max:100},series:[{type:"bar",data:s.map(t=>({value:t.score,itemStyle:{color:t.score>=80?"#52c41a":t.score>=60?"#1890ff":"#ff4d4f",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",fontSize:12}}]};else if(c==="area")l={title:{text:"15分钟步行范围面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:t=>{const r=t[0];return`${r.name}<br/>面积: ${r.value.toFixed(2)} km²`}},xAxis:{type:"category",data:s.map(t=>t.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"面积 (km²)"},series:[{type:"bar",data:s.map(t=>({value:t.area/1e6,itemStyle:{color:"#1890ff",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};else{const t=Object.keys(((a=s[0])==null?void 0:a.categories)||{}),r=["#1890ff","#52c41a","#faad14","#ff4d4f","#722ed1"];l={title:{text:"各类设施评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},legend:{bottom:0,data:s.map(m=>m.name)},radar:{indicator:t.map(m=>({name:m,max:100})),shape:"circle",splitNumber:5},series:[{type:"radar",data:s.map((m,h)=>({value:t.map(j=>m.categories[j]||0),name:m.name,lineStyle:{color:r[h%r.length]},areaStyle:{color:r[h%r.length],opacity:.1},itemStyle:{color:r[h%r.length]}}))}]}}x.current.setOption(l)},[s,c]),d.useEffect(()=>{const l=()=>{var a;(a=x.current)==null||a.resize()};return window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[]),s.length<2?e.jsxs("div",{className:"community-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),"社区对比"]}),e.jsx("p",{className:"comparison-hint",children:"分析至少2个社区后可进行对比"})]}):e.jsxs("div",{className:"community-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),"社区对比"]}),e.jsxs("div",{className:"metric-selector",children:[e.jsx("button",{className:`metric-button ${c==="score"?"active":""}`,onClick:()=>n("score"),children:"综合评分"}),e.jsx("button",{className:`metric-button ${c==="area"?"active":""}`,onClick:()=>n("area"),children:"覆盖面积"}),e.jsx("button",{className:`metric-button ${c==="categories"?"active":""}`,onClick:()=>n("categories"),children:"各类设施"})]}),e.jsx("div",{ref:o,className:"comparison-chart"}),e.jsx("div",{className:"comparison-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"社区"}),e.jsx("th",{children:"评分"}),e.jsx("th",{children:"等级"}),e.jsx("th",{children:"面积"})]})}),e.jsx("tbody",{children:s.map((l,a)=>e.jsxs("tr",{children:[e.jsx("td",{children:l.name}),e.jsx("td",{className:"score-cell",children:l.score}),e.jsx("td",{children:e.jsx("span",{className:`level-badge level-${l.level}`,children:l.level})}),e.jsxs("td",{children:[(l.area/1e6).toFixed(2)," km²"]})]},a))})]})})]})},G="http://100.77.182.51:8080/api",B=[{lng:118.7784,lat:32.0663,name:"鼓楼区湖南路街道"},{lng:118.7854,lat:32.0553,name:"鼓楼区中央门街道"},{lng:118.8034,lat:32.0683,name:"玄武区新街口街道"},{lng:118.7894,lat:32.0433,name:"秦淮区夫子庙街道"}];function pe(s,o){const{community_name:x,score:c,suggestions:n,blind_spots:l}=s,a=Object.entries(c.categories).map(([h,j])=>{const u=j,w=u>=80?"#52c41a":u>=60?"#1890ff":"#faad14";return`
        <div class="category-item">
          <span class="category-name">${h}</span>
          <div class="category-bar-container">
            <div class="category-bar" style="width: ${u}%; background-color: ${w}"></div>
          </div>
          <span class="category-score">${u}分</span>
        </div>
      `}).join(""),t=n.map(h=>`
      <div class="suggestion-item ${h.priority==="高"?"high-priority":""}">
        <span class="suggestion-priority">[${h.priority}]</span>
        <span class="suggestion-category">${h.category}</span>
        <span class="suggestion-message">${h.message}</span>
      </div>
    `).join(""),r=l.length>0?l.map(h=>`
          <div class="blind-spot-item">
            <span class="spot-icon">⚠️</span>
            <span class="spot-category">${h.category}:</span>
            <span class="spot-description">${h.description}</span>
          </div>
        `).join(""):'<p class="no-spots">✅ 未发现明显服务盲区</p>';return`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${x} - 15分钟生活圈体检报告</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }

    .report-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .report-header {
      background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .report-header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .report-header p {
      opacity: 0.9;
      font-size: 14px;
    }

    .score-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      padding: 30px;
      background: #fafafa;
      border-bottom: 1px solid #e8e8e8;
    }

    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1890ff, #722ed1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .score-number {
      font-size: 48px;
      font-weight: bold;
      line-height: 1;
    }

    .score-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .score-info {
      text-align: left;
    }

    .score-level {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .score-detail {
      font-size: 14px;
      color: #666;
    }

    .section {
      padding: 20px 30px;
      border-bottom: 1px solid #f0f0f0;
    }

    .section:last-child {
      border-bottom: none;
    }

    .section h2 {
      font-size: 18px;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1890ff;
    }

    .category-item {
      display: flex;
      align-items: center;
      margin: 12px 0;
      padding: 8px 0;
    }

    .category-name {
      width: 80px;
      font-weight: 500;
      color: #666;
    }

    .category-bar-container {
      flex: 1;
      height: 20px;
      background: #e8e8e8;
      border-radius: 10px;
      overflow: hidden;
      margin: 0 15px;
    }

    .category-bar {
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .category-score {
      width: 60px;
      text-align: right;
      font-weight: 600;
      color: #333;
    }

    .suggestion-item {
      padding: 12px 16px;
      margin: 8px 0;
      background: #f6ffed;
      border-left: 4px solid #52c41a;
      border-radius: 0 4px 4px 0;
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .suggestion-item.high-priority {
      background: #fff1f0;
      border-left-color: #ff4d4f;
    }

    .suggestion-priority {
      font-weight: 600;
      color: #666;
      white-space: nowrap;
    }

    .suggestion-category {
      font-weight: 500;
      color: #333;
      white-space: nowrap;
    }

    .suggestion-message {
      color: #666;
    }

    .blind-spot-item {
      padding: 12px 16px;
      margin: 8px 0;
      background: #fff7e6;
      border-left: 4px solid #faad14;
      border-radius: 0 4px 4px 0;
    }

    .spot-icon {
      margin-right: 8px;
    }

    .spot-category {
      font-weight: 600;
      color: #333;
      margin-right: 8px;
    }

    .spot-description {
      color: #666;
    }

    .no-spots {
      color: #52c41a;
      font-weight: 500;
    }

    .time-layers {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .time-layer-item {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }

    .layer-time {
      display: block;
      font-weight: 600;
      color: #1890ff;
      margin-bottom: 8px;
    }

    .layer-area {
      display: block;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .report-footer {
      padding: 20px 30px;
      background: #fafafa;
      text-align: center;
      color: #999;
      font-size: 12px;
    }

    @media print {
      body {
        padding: 0;
        background: white;
      }

      .report-container {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="report-header">
      <h1>🏘️ 15分钟生活圈体检报告</h1>
      <p>${x}</p>
    </div>

    <div class="score-section">
      <div class="score-circle">
        <span class="score-number">${c.total}</span>
        <span class="score-label">综合评分</span>
      </div>
      <div class="score-info">
        <div class="score-level">评级: ${c.level}</div>
        <div class="score-detail">盲区扣分: -${c.blind_spot_penalty}分</div>
        <div class="score-detail">分析时间: ${new Date().toLocaleString("zh-CN")}</div>
      </div>
    </div>

    <div class="section">
      <h2>📊 各类设施评分</h2>
      ${a}
    </div>

    

    <div class="section">
      <h2>💡 改善建议</h2>
      ${t}
    </div>

    <div class="section">
      <h2>⚠️ 服务盲区</h2>
      ${r}
    </div>

    <div class="report-footer">
      <p>15分钟生活圈智能体检与规划助手 - 基于百度地图开放能力</p>
      <p>报告生成时间: ${new Date().toLocaleString("zh-CN")}</p>
    </div>
  </div>
</body>
</html>
  `}function ue(s,o){const x=pe(s),c=window.open("","_blank");if(!c){alert("请允许弹出窗口以导出报告");return}c.document.write(x),c.document.close(),c.onload=()=>{c.print()}}const v={Home:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),e.jsx("polyline",{points:"9 22 9 12 15 12 15 22"})]}),Clock:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),MapPin:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),AlertTriangle:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),BarChart:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),Play:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})}),Map:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]}),History:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 4v6h6"}),e.jsx("path",{d:"M3.51 15a9 9 0 1 0 2.13-9.36L1 10"})]}),Refresh:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polyline",{points:"23 4 23 10 17 10"}),e.jsx("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),ArrowLeft:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"19",y1:"12",x2:"5",y2:"12"}),e.jsx("polyline",{points:"12 19 5 12 12 5"})]}),Download:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),e.jsx("polyline",{points:"7 10 12 15 17 10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),Activity:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"22 12 18 12 15 21 9 3 6 12 2 12"})}),Layers:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"12 2 2 7 12 12 22 7 12 2"}),e.jsx("polyline",{points:"2 17 12 22 22 17"}),e.jsx("polyline",{points:"2 12 12 17 22 12"})]})};function ge(){var g,f;const[s,o]=d.useState(null),[x,c]=d.useState(null),[n,l]=d.useState(null),[a,t]=d.useState(null),[r,m]=d.useState(15),[h,j]=d.useState(!1),[u,w]=d.useState(null),[b,R]=d.useState([]),[C,$]=d.useState(!1);d.useEffect(()=>{B.length>0&&o(B[0])},[]);const L=()=>x||s,S=async()=>{const i=L();if(i){j(!0),w(null);try{const[p,k]=await Promise.all([fetch(`${G}/analysis/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:i.lng,lat:i.lat,community_name:i.name})}),fetch(`${G}/isochrone/multi-time`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:i.lng,lat:i.lat,directions:36})})]);if(!p.ok)throw new Error("分析请求失败");const N=await p.json();if(l(N),k.ok){const y=await k.json();t(y)}R(y=>[N,...y.slice(0,4)])}catch(p){w(p instanceof Error?p.message:"分析过程中出现错误")}finally{j(!1)}}},M=i=>{m(i)},E=(i,p)=>{c({lng:i,lat:p,name:"自定义位置"})},_=()=>{if(!a)return n==null?void 0:n.isochrone;const i=a.layers.find(p=>p.time===r);return i?{boundary_points:i.boundary_points,polygon:i.polygon}:n==null?void 0:n.isochrone},O=()=>{n&&ue(n)},P=b.slice(0,5).map(i=>({name:i.community_name,score:i.score.total,level:i.score.level,categories:i.score.categories,area:i.isochrone.area}));return e.jsxs("div",{className:"app-container",children:[e.jsx("header",{className:"app-header",children:e.jsxs("div",{className:"header-content",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("h1",{children:[e.jsx(v.Home,{}),"15分钟生活圈智能体检与规划助手"]}),e.jsx("p",{children:"基于百度地图的社区生活圈分析工具"})]}),e.jsx("div",{className:"header-right",children:e.jsxs("a",{href:"../",className:"back-button",children:[e.jsx(v.ArrowLeft,{}),"返回首页"]})})]})}),e.jsxs("main",{className:"app-main",children:[e.jsxs("div",{className:"controls-panel",children:[e.jsxs("div",{className:"control-group",children:[e.jsx("label",{children:"选择社区："}),e.jsx("select",{value:s?`${s.lng},${s.lat}`:"",onChange:i=>{const[p,k]=i.target.value.split(",").map(Number),N=B.find(y=>y.lng===p&&y.lat===k);o(N||null),c(null)},children:B.map((i,p)=>e.jsx("option",{value:`${i.lng},${i.lat}`,children:i.name},p))})]}),e.jsx("button",{className:"analyze-button",onClick:S,disabled:h||!s&&!x,children:h?e.jsxs(e.Fragment,{children:[e.jsx(v.Refresh,{}),"分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(v.Play,{}),"开始体检"]})}),e.jsxs("button",{className:"analyze-button secondary",onClick:()=>$(!C),children:[e.jsx(v.MapPin,{}),C?"隐藏自定义位置":"自定义位置"]}),n&&e.jsxs("button",{className:"analyze-button secondary",onClick:O,children:[e.jsx(v.Download,{}),"导出PDF"]})]}),u&&e.jsxs("div",{className:"error-banner",children:[e.jsx(v.AlertTriangle,{}),e.jsx("span",{children:u}),e.jsxs("button",{onClick:S,children:[e.jsx(v.Refresh,{}),"重试"]})]}),e.jsxs("div",{className:"main-content",children:[e.jsxs("div",{className:"map-panel",children:[C&&e.jsx(he,{onCenterSelect:E,currentCenter:L()}),e.jsx(ie,{center:L(),isochrone:_(),poiCoverage:n==null?void 0:n.poi_coverage,blindSpots:n==null?void 0:n.blind_spots,loading:h})]}),e.jsx("div",{className:"data-panel",children:n?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"score-card",children:[e.jsxs("div",{className:"score-header",children:[e.jsx(v.Activity,{}),e.jsx("span",{children:"综合评分"})]}),e.jsx("div",{className:"score-value",children:n.score.total}),e.jsx("div",{className:"score-level",children:n.score.level})]}),a&&e.jsx("div",{className:"detail-card",children:e.jsx(ce,{data:{time5:a.layers.find(i=>i.time===300),time10:a.layers.find(i=>i.time===600),time15:a.layers.find(i=>i.time===900)},onTimeChange:M})}),e.jsxs("div",{className:"metrics-grid",children:[e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(v.Map,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[n.isochrone.area.toFixed(2)," km²"]}),e.jsx("div",{className:"metric-label",children:"覆盖面积"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(v.Layers,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:n.poi_coverage?Object.values(n.poi_coverage).reduce((i,p)=>i+p.count,0):0}),e.jsx("div",{className:"metric-label",children:"周边设施"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(v.AlertTriangle,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:((g=n.blind_spots)==null?void 0:g.length)||0}),e.jsx("div",{className:"metric-label",children:"服务盲区"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(v.Clock,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[r/60," 分钟"]}),e.jsx("div",{className:"metric-label",children:"步行时间"})]})]})]}),((f=n.poi_coverage)==null?void 0:f.categories)&&e.jsxs("div",{className:"facility-summary",children:[e.jsxs("h3",{children:[e.jsx(v.BarChart,{}),"设施分布"]}),e.jsx("div",{className:"facility-list",children:Object.entries(n.poi_coverage.categories).map(([i,p])=>e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-name",children:i}),e.jsx("span",{className:"facility-count",children:p})]},i))})]})]}):e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:e.jsx(v.Map,{})}),e.jsx("h3",{children:"开始分析"}),e.jsx("p",{children:'选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告'}),e.jsxs("div",{className:"feature-list",children:[e.jsxs("div",{className:"feature-item",children:[e.jsx(v.Clock,{}),e.jsx("span",{children:"计算5/10/15分钟步行范围"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(v.MapPin,{}),e.jsx("span",{children:"分析周边设施覆盖"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(v.AlertTriangle,{}),e.jsx("span",{children:"识别服务盲区"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(v.BarChart,{}),e.jsx("span",{children:"生成体检报告"})]})]})]})})]}),n&&e.jsxs("div",{className:"detail-section",children:[a&&e.jsx("div",{className:"detail-card",children:e.jsx(de,{data:{time5:a.layers.find(i=>i.time===300),time10:a.layers.find(i=>i.time===600),time15:a.layers.find(i=>i.time===900)}})}),e.jsx("div",{className:"detail-card full-width",children:e.jsx(ae,{communityName:n.community_name,score:n.score,suggestions:n.suggestions,blindSpots:n.blind_spots})}),n.poi_coverage&&L()&&e.jsx("div",{className:"detail-card",children:e.jsx(xe,{poiCoverage:n.poi_coverage,center:L()})}),e.jsx("div",{className:"detail-card",children:e.jsx(le,{categories:n.score.categories})})]}),b.length>1&&e.jsx("div",{className:"comparison-section",children:e.jsx(me,{history:P})}),b.length>1&&e.jsxs("div",{className:"history-section",children:[e.jsxs("h3",{children:[e.jsx(v.History,{}),"分析历史"]}),e.jsx("div",{className:"history-list",children:b.slice(1).map((i,p)=>e.jsxs("div",{className:"history-item",children:[e.jsx("span",{className:"history-name",children:i.community_name}),e.jsxs("span",{className:"history-score",children:[i.score.total,"分"]}),e.jsx("span",{className:"history-level",children:i.score.level})]},p))})]})]}),e.jsx("footer",{className:"app-footer",children:e.jsxs("div",{className:"footer-content",children:[e.jsx("p",{children:"15分钟生活圈智能体检与规划助手 © 2025"}),e.jsx("p",{className:"footer-tech",children:"技术栈：React + FastAPI + 百度地图API + NetworkX"})]})})]})}I.createRoot(document.getElementById("root")).render(e.jsx(K.StrictMode,{children:e.jsx(ge,{})}));
