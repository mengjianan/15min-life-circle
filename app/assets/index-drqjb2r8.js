import{r as d,a as Q,R as ee}from"./react-vendor-nf7bT_Uh.js";import{i as Y}from"./echarts-vendor-BBmD_jO2.js";(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function x(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=x(n);fetch(n.href,i)}})();var q={exports:{}},I={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var se=d,te=Symbol.for("react.element"),ne=Symbol.for("react.fragment"),re=Object.prototype.hasOwnProperty,ie=se.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,oe={key:!0,ref:!0,__self:!0,__source:!0};function K(s,o,x){var a,n={},i=null,l=null;x!==void 0&&(i=""+x),o.key!==void 0&&(i=""+o.key),o.ref!==void 0&&(l=o.ref);for(a in o)re.call(o,a)&&!oe.hasOwnProperty(a)&&(n[a]=o[a]);if(s&&s.defaultProps)for(a in o=s.defaultProps,o)n[a]===void 0&&(n[a]=o[a]);return{$$typeof:te,type:s,key:i,ref:l,props:n,_owner:ie.current}}I.Fragment=ne;I.jsx=K;I.jsxs=K;q.exports=I;var e=q.exports,G={},J=Q;G.createRoot=J.createRoot,G.hydrateRoot=J.hydrateRoot;const ae=({loading:s,message:o="加载中..."})=>s?e.jsx("div",{className:"loading-overlay",children:e.jsxs("div",{className:"loading-content",children:[e.jsxs("div",{className:"loading-spinner",children:[e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"})]}),e.jsx("p",{className:"loading-message",children:o}),e.jsx("p",{className:"loading-submessage",children:"正在调用百度地图API计算等时圈..."})]})}):null,le=({center:s,isochrone:o,poiCoverage:x,blindSpots:a,loading:n=!1,onCenterChange:i})=>{const l=d.useRef(null),t=d.useRef(null),[r,p]=d.useState(!1),[h,v]=d.useState(null),[m,b]=d.useState(!0),[k,A]=d.useState(!0),[B,H]=d.useState(!0),[$,_]=d.useState(!1),O=d.useCallback(()=>new Promise((u,j)=>{const f=()=>{const w=window.BMap;w&&w.Map?u():setTimeout(f,100)};f(),setTimeout(()=>j(new Error("百度地图API加载超时")),1e4)}),[]);d.useEffect(()=>{let u=!0;return(async()=>{try{if(await O(),!u||!l.current||t.current)return;const f=window.BMap,w=new f.Map(l.current),L=new f.Point(118.7969,32.0603);w.centerAndZoom(L,14),w.enableScrollWheelZoom(),w.addControl(new f.NavigationControl),w.addControl(new f.ScaleControl),w.addControl(new f.OverviewMapControl),w.addEventListener("click",S=>{$&&i&&i(S.point.lng,S.point.lat)}),t.current=w,u&&p(!0)}catch(f){console.error("地图初始化失败:",f),u&&v("地图加载失败，请刷新页面重试")}})(),()=>{u=!1}},[O,$,i]),d.useEffect(()=>{if(r&&t.current&&s){const u=window.BMap,j=new u.Point(s.lng,s.lat);t.current.panTo(j),t.current.setZoom(14)}},[s,r]),d.useEffect(()=>{if(r&&t.current&&o){const u=t.current,j=window.BMap;if(u.clearOverlays(),o.boundary_points&&o.boundary_points.length>0){const f=o.boundary_points.map(L=>new j.Point(L.lng,L.lat)),w=new j.Polygon(f,{strokeColor:"#667eea",strokeWeight:2,strokeOpacity:.8,fillColor:"#667eea",fillOpacity:.15});u.addOverlay(w)}if(s){const f=new j.Point(s.lng,s.lat),w=new j.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#667eea" stroke="white" stroke-width="3"/><circle cx="16" cy="16" r="6" fill="white"/></svg>'),new j.Size(32,32),{anchor:new j.Size(16,16)}),L=new j.Marker(f,{icon:w});u.addOverlay(L);const S=new j.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #333; margin-bottom: 4px;">'+s.name+'</div><div style="font-size: 12px; color: #666;">经度: '+s.lng.toFixed(4)+", 纬度: "+s.lat.toFixed(4)+"</div></div>",{width:220,height:60});L.addEventListener("click",()=>{u.openInfoWindow(S,f)})}k&&x&&Object.entries(x).forEach(([f,w])=>{if(w.facilities&&w.facilities.length>0){const S={医疗:"#ff4d4f",教育:"#1890ff",购物:"#52c41a",养老:"#722ed1",文体:"#fa8c16",餐饮:"#eb2f96"}[f]||"#666";w.facilities.forEach(N=>{if(N.location){const E=new j.Point(N.location.lng,N.location.lat),c=new j.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="'+S+'" stroke="white" stroke-width="2"/></svg>'),new j.Size(20,20),{anchor:new j.Size(10,10)}),g=new j.Marker(E,{icon:c});u.addOverlay(g);const M=new j.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #333;">'+N.name+'</div><div style="font-size: 12px; color: '+S+'; margin-top: 4px;">'+f+"</div>"+(N.address?'<div style="font-size: 11px; color: #999; margin-top: 2px;">'+N.address+"</div>":"")+(N.distance?'<div style="font-size: 11px; color: #666; margin-top: 2px;">距离: '+N.distance+"米</div>":"")+"</div>",{width:250,height:80});g.addEventListener("click",()=>{u.openInfoWindow(M,E)})}})}}),B&&a&&a.length>0&&a.forEach((f,w)=>{if(f.center){const L=new j.Point(f.center.lng,f.center.lat),S=new j.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" fill="#ff4d4f" stroke="white" stroke-width="1.5"/><text x="12" y="18" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text></svg>'),new j.Size(24,24),{anchor:new j.Size(12,24)}),N=new j.Marker(L,{icon:S});u.addOverlay(N);const E=new j.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #ff4d4f;">服务盲区 #'+(w+1)+'</div><div style="font-size: 12px; color: #333; margin-top: 4px;">类别: '+(f.category||"未知")+'</div><div style="font-size: 11px; color: #666; margin-top: 2px;">'+(f.description||"该区域缺少相关设施覆盖")+"</div></div>",{width:250,height:80});N.addEventListener("click",()=>{u.openInfoWindow(E,L)})}})}},[r,o,s,x,a,k,B]);const T=d.useCallback(()=>{_(u=>!u)},[]),R=d.useCallback(()=>{b(u=>!u)},[]),C=d.useCallback(()=>{A(u=>!u)},[]),z=d.useCallback(()=>{H(u=>!u)},[]);return h?e.jsxs("div",{className:"map-error",children:[e.jsx("div",{className:"map-error-icon",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})}),e.jsx("p",{children:h}),e.jsx("button",{onClick:()=>window.location.reload(),children:"刷新页面"})]}):e.jsxs("div",{className:"map-wrapper",children:[e.jsxs("div",{className:"map-controls",children:[e.jsx("button",{className:`map-control-btn ${$?"active":""}`,onClick:T,title:$?"关闭点击选点":"开启点击选点",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]})}),e.jsx("button",{className:`map-control-btn ${m?"active":""}`,onClick:R,title:m?"隐藏路网":"显示路网",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]})}),e.jsx("button",{className:`map-control-btn ${k?"active":""}`,onClick:C,title:k?"隐藏设施":"显示设施",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]})}),e.jsx("button",{className:`map-control-btn ${B?"active":""}`,onClick:z,title:B?"隐藏盲区":"显示盲区",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})})]}),e.jsx("div",{ref:l,className:"map-container"}),n&&e.jsx(ae,{loading:!0}),$&&e.jsxs("div",{className:"click-mode-hint",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"点击地图选择位置"]})]})},V={医疗:({size:s=20})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M22 12h-4l-3 9L9 3l-3 9H2"})}),教育:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","stroke-linejoin":"round",children:[e.jsx("path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"}),e.jsx("path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"})]}),购物:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"9",cy:"21",r:"1"}),e.jsx("circle",{cx:"20",cy:"21",r:"1"}),e.jsx("path",{d:"M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"})]}),养老:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),文体:({size:s=20})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})}),餐饮:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 8h1a4 4 0 0 1 0 8h-1"}),e.jsx("path",{d:"M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"}),e.jsx("line",{x1:"6",y1:"1",x2:"6",y2:"4"}),e.jsx("line",{x1:"10",y1:"1",x2:"10",y2:"4"}),e.jsx("line",{x1:"14",y1:"1",x2:"14",y2:"4"})]}),综合:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polygon",{points:"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"})]})},ce={Warning:({size:s=24})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})},D=s=>({医疗:"#ef4444",教育:"#3b82f6",购物:"#22c55e",养老:"#8b5cf6",文体:"#06b6d4",餐饮:"#f59e0b",综合:"#6b7280"})[s]||"#6b7280",U=s=>({医疗:"#fef2f2",教育:"#eff6ff",购物:"#f0fdf4",养老:"#f5f3ff",文体:"#ecfeff",餐饮:"#fffbeb",综合:"#f9fafb"})[s]||"#f9fafb",de=({communityName:s,score:o,suggestions:x,blindSpots:a})=>{const n=l=>{switch(l){case"优秀":return"#52c41a";case"良好":return"#1890ff";case"一般":return"#faad14";case"需改善":return"#ff4d4f";default:return"#666"}},i=l=>{const t={高:"#ff4d4f",中:"#faad14",低:"#52c41a"};return e.jsx("span",{className:"priority-tag",style:{backgroundColor:t[l]||"#666"},children:l})};return e.jsxs("div",{className:"report-container",children:[e.jsxs("h2",{children:[s," - 生活圈体检报告"]}),e.jsxs("div",{className:"score-section",children:[e.jsxs("div",{className:"score-circle",style:{borderColor:n(o.level)},children:[e.jsx("span",{className:"score-number",children:o.total}),e.jsx("span",{className:"score-level",children:o.level})]}),e.jsxs("div",{className:"score-detail",children:[e.jsx("p",{children:"综合评分"}),o.blind_spot_penalty>0&&e.jsxs("p",{className:"penalty-note",children:["盲区扣分: -",o.blind_spot_penalty,"分"]})]})]}),e.jsxs("div",{className:"category-scores",children:[e.jsx("h3",{children:"各类设施评分"}),e.jsx("div",{className:"category-grid",children:Object.entries(o.categories).map(([l,t])=>e.jsxs("div",{className:"category-item",children:[e.jsx("span",{className:"category-name",children:l}),e.jsx("div",{className:"category-bar",children:e.jsx("div",{className:"category-fill",style:{width:`${t}%`,backgroundColor:t>=80?"#52c41a":t>=60?"#1890ff":"#ff4d4f"}})}),e.jsx("span",{className:"category-score",children:t})]},l))})]}),x.length>0&&e.jsxs("div",{className:"suggestions-section",children:[e.jsx("h3",{children:"改善建议"}),e.jsx("ul",{className:"suggestions-list",children:x.map((l,t)=>e.jsxs("li",{className:"suggestion-item",children:[i(l.priority),e.jsxs("span",{className:"suggestion-category",children:["[",l.category,"]"]}),e.jsx("span",{className:"suggestion-message",children:l.message})]},t))})]}),a.length>0&&e.jsxs("div",{className:"blind-spots-section",children:[e.jsxs("h3",{children:["服务盲区 (",a.length,"个)"]}),e.jsx("div",{className:"blind-spots-list",children:a.map((l,t)=>e.jsxs("div",{className:"blind-spot-item",children:[e.jsx("span",{className:"blind-spot-icon",children:e.jsx(ce.Warning,{size:18})}),e.jsxs("div",{className:"blind-spot-info",children:[e.jsx("span",{className:"blind-spot-category",children:l.category}),e.jsx("span",{className:"blind-spot-desc",children:l.description})]})]},t))})]})]})},xe=({categories:s})=>{const o=d.useRef(null),x=d.useRef(null);return d.useEffect(()=>{if(!o.current)return;const a=Y(o.current);return x.current=a,()=>{a.dispose()}},[]),d.useEffect(()=>{if(!x.current)return;const a=Object.keys(s),n=Object.values(s),i={title:{text:"设施覆盖雷达图",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},radar:{indicator:a.map(l=>({name:l,max:100})),shape:"circle",splitNumber:5,axisName:{color:"#333",fontSize:12},splitLine:{lineStyle:{color:"#ddd"}},splitArea:{show:!0,areaStyle:{color:["rgba(24, 144, 255, 0.1)","rgba(24, 144, 255, 0.2)"]}}},series:[{type:"radar",data:[{value:n,name:"设施覆盖评分",areaStyle:{color:"rgba(24, 144, 255, 0.3)"},lineStyle:{color:"#1890ff",width:2},itemStyle:{color:"#1890ff"}}]}]};x.current.setOption(i)},[s]),d.useEffect(()=>{const a=()=>{var n;(n=x.current)==null||n.resize()};return window.addEventListener("resize",a),()=>window.removeEventListener("resize",a)},[]),e.jsx("div",{className:"radar-chart-container",children:e.jsx("div",{ref:o,className:"radar-chart"})})},he=({data:s,onTimeChange:o})=>{const[x,a]=d.useState(15),n=[{value:5,label:"5分钟",color:"#52c41a"},{value:10,label:"10分钟",color:"#faad14"},{value:15,label:"15分钟",color:"#1890ff"}],i=r=>{a(r),o(r)},t=n.map(r=>{var h,v,m;let p=0;return r.value===5?p=((h=s.time5)==null?void 0:h.area)||0:r.value===10?p=((v=s.time10)==null?void 0:v.area)||0:r.value===15&&(p=((m=s.time15)==null?void 0:m.area)||0),{...r,area:p,areaText:p>0?`${(p/1e6).toFixed(2)} km²`:"计算中"}});return e.jsxs("div",{className:"time-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),"时间维度对比"]}),e.jsx("div",{className:"time-selector",children:n.map(r=>e.jsxs("button",{className:`time-button ${x===r.value?"active":""}`,onClick:()=>i(r.value),children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",style:{width:20,height:20,color:r.color},children:e.jsx("path",{d:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"})}),e.jsx("span",{className:"time-label",children:r.label})]},r.value))}),e.jsx("div",{className:"area-stats",children:t.map(r=>e.jsxs("div",{className:`area-item ${x===r.value?"active":""}`,children:[e.jsx("div",{className:"area-color",style:{backgroundColor:r.color}}),e.jsxs("div",{className:"area-info",children:[e.jsx("span",{className:"area-time",children:r.label}),e.jsx("span",{className:"area-value",children:r.areaText})]})]},r.value))}),e.jsx("div",{className:"area-chart",children:e.jsx("div",{className:"chart-bars",children:t.map(r=>{const p=Math.max(...t.map(v=>v.area||1)),h=r.area>0?r.area/p*100:0;return e.jsxs("div",{className:"chart-bar-container",children:[e.jsx("div",{className:"chart-bar-label",children:r.label}),e.jsx("div",{className:"chart-bar-track",children:e.jsx("div",{className:"chart-bar-fill",style:{width:`${h}%`,backgroundColor:r.color}})}),e.jsx("div",{className:"chart-bar-value",children:r.areaText})]},r.value)})})})]})},pe=({data:s})=>{const o=d.useRef(null),x=d.useRef(null);d.useEffect(()=>{if(!o.current)return;const i=Y(o.current);return x.current=i,()=>{i.dispose()}},[]),d.useEffect(()=>{var p,h,v;if(!x.current)return;const i=["5分钟","10分钟","15分钟"],l=[(p=s.time5)!=null&&p.area?s.time5.area/1e6:0,(h=s.time10)!=null&&h.area?s.time10.area/1e6:0,(v=s.time15)!=null&&v.area?s.time15.area/1e6:0],t=["#52c41a","#faad14","#1890ff"],r={title:{text:"等时圈面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:m=>{const b=m[0];return`${b.name}<br/>面积: ${b.value.toFixed(2)} km²`}},xAxis:{type:"category",data:i,axisLabel:{fontSize:12}},yAxis:{type:"value",name:"面积 (km²)",axisLabel:{fontSize:12}},series:[{type:"bar",data:l.map((m,b)=>({value:m,itemStyle:{color:t[b],borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};x.current.setOption(r)},[s]),d.useEffect(()=>{const i=()=>{var l;(l=x.current)==null||l.resize()};return window.addEventListener("resize",i),()=>window.removeEventListener("resize",i)},[]);const n=(()=>{var l,t;return!((l=s.time5)!=null&&l.area)||!((t=s.time15)!=null&&t.area)?null:((s.time15.area-s.time5.area)/s.time5.area*100).toFixed(1)})();return e.jsxs("div",{className:"area-comparison-container",children:[e.jsx("div",{ref:o,className:"area-chart"}),n&&e.jsxs("div",{className:"growth-info",children:[e.jsx("span",{className:"growth-label",children:"15分钟比5分钟面积增长:"}),e.jsxs("span",{className:"growth-value",children:["+",n,"%"]})]})]})},me=({poiCoverage:s})=>{const o=t=>Math.round(t/1.2/60),a=(()=>{const t=[];return Object.entries(s).forEach(([r,p])=>{p.facilities.forEach(h=>{t.push({...h,category:r})})}),t.sort((r,p)=>(r.distance||0)-(p.distance||0))})(),i=(()=>{const t={};return Object.keys(s).forEach(r=>{const p=a.filter(h=>h.category===r);t[r]=p.length>0?p[0]:null}),t})(),l=(t,r=20)=>{const p=V[t]||V.综合;return e.jsx(p,{size:r})};return e.jsxs("div",{className:"facility-accessibility",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"设施可达性分析"]}),e.jsxs("div",{className:"nearest-facilities",children:[e.jsx("h5",{children:"各类最近设施"}),e.jsx("div",{className:"nearest-grid",children:Object.entries(i).map(([t,r])=>{const p=D(t),h=U(t);return e.jsxs("div",{className:"nearest-item",children:[e.jsx("span",{className:"nearest-icon",style:{backgroundColor:h,color:p},children:l(t)}),e.jsxs("div",{className:"nearest-info",children:[e.jsx("span",{className:"nearest-category",children:t}),r?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"nearest-name",children:r.name}),e.jsxs("span",{className:"nearest-distance",children:[r.distance?`${r.distance}米`:"未知",r.distance&&` (${o(r.distance)}分钟)`]})]}):e.jsx("span",{className:"nearest-none",children:"暂无数据"})]})]},t)})})]}),a.length>0&&e.jsxs("div",{className:"facility-list",children:[e.jsx("h5",{children:"周边设施列表 (前10个)"}),e.jsx("div",{className:"facility-items",children:a.slice(0,10).map((t,r)=>{const p=D(t.category),h=U(t.category);return e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-icon",style:{backgroundColor:h,color:p},children:l(t.category)}),e.jsxs("div",{className:"facility-info",children:[e.jsx("span",{className:"facility-name",children:t.name}),e.jsx("span",{className:"facility-address",children:t.address||"暂无地址"})]}),e.jsx("div",{className:"facility-distance",children:t.distance&&e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"distance-value",children:[t.distance,"米"]}),e.jsxs("span",{className:"distance-time",children:["步行",o(t.distance),"分钟"]})]})})]},r)})})]}),e.jsxs("div",{className:"accessibility-score",children:[e.jsx("h5",{children:"可达性评分"}),e.jsx("div",{className:"score-items",children:Object.entries(s).map(([t,r])=>{const p=D(t),h=U(t),v=r.count>=5?100:r.count>=3?80:r.count>=1?60:30;return e.jsxs("div",{className:"score-item",children:[e.jsx("span",{className:"score-icon",style:{backgroundColor:h,color:p},children:l(t)}),e.jsx("span",{className:"score-category",children:t}),e.jsx("div",{className:"score-bar",children:e.jsx("div",{className:"score-fill",style:{width:`${v}%`,backgroundColor:v>=80?"#22c55e":v>=60?"#3b82f6":"#ef4444"}})}),e.jsx("span",{className:"score-value",children:v})]},t)})})]})]})},ue=({onCenterSelect:s,currentCenter:o})=>{var h,v;const[x,a]=d.useState(((h=o==null?void 0:o.lng)==null?void 0:h.toString())||"118.7784"),[n,i]=d.useState(((v=o==null?void 0:o.lat)==null?void 0:v.toString())||"32.0663"),[l,t]=d.useState((o==null?void 0:o.name)||"自定义位置"),r=m=>{m.preventDefault();const b=parseFloat(x),k=parseFloat(n);if(isNaN(b)||isNaN(k)){alert("请输入有效的经纬度");return}if(b<73||b>135||k<3||k>53){alert("经纬度超出中国范围");return}s(b,k)},p=()=>{navigator.geolocation?navigator.geolocation.getCurrentPosition(m=>{const{longitude:b,latitude:k}=m.coords;a(b.toFixed(6)),i(k.toFixed(6)),t("当前位置"),s(b,k)},m=>{alert("无法获取当前位置，请手动输入"),console.error("获取位置失败:",m)}):alert("浏览器不支持地理定位")};return e.jsxs("div",{className:"custom-center",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"自定义中心点"]}),e.jsxs("form",{onSubmit:r,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"经度:"}),e.jsx("input",{type:"number",step:"0.000001",value:x,onChange:m=>a(m.target.value),placeholder:"118.7784"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"纬度:"}),e.jsx("input",{type:"number",step:"0.000001",value:n,onChange:m=>i(m.target.value),placeholder:"32.0663"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"名称:"}),e.jsx("input",{type:"text",value:l,onChange:m=>t(m.target.value),placeholder:"自定义位置"})]}),e.jsxs("div",{className:"button-group",children:[e.jsx("button",{type:"submit",className:"apply-button",children:"应用"}),e.jsxs("button",{type:"button",className:"location-button",onClick:p,children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("circle",{cx:"12",cy:"12",r:"4"}),e.jsx("line",{x1:"4.93",y1:"4.93",x2:"9.17",y2:"9.17"}),e.jsx("line",{x1:"14.83",y1:"14.83",x2:"19.07",y2:"19.07"}),e.jsx("line",{x1:"14.83",y1:"9.17",x2:"19.07",y2:"4.93"}),e.jsx("line",{x1:"4.93",y1:"19.07",x2:"9.17",y2:"14.83"})]}),"获取当前位置"]})]})]}),o&&e.jsxs("div",{className:"current-info",children:[e.jsx("p",{children:"当前中心点:"}),e.jsx("p",{className:"center-name",children:o.name}),e.jsxs("p",{className:"center-coord",children:["(",o.lng.toFixed(4),", ",o.lat.toFixed(4),")"]})]}),e.jsxs("div",{className:"preset-locations",children:[e.jsx("h5",{children:"预设位置"}),e.jsx("div",{className:"preset-list",children:[{name:"南京市中心",lng:118.7969,lat:32.0603},{name:"新街口",lng:118.7874,lat:32.0423},{name:"鼓楼广场",lng:118.7784,lat:32.0663},{name:"夫子庙",lng:118.7894,lat:32.0233}].map(m=>e.jsx("button",{className:"preset-button",onClick:()=>{a(m.lng.toString()),i(m.lat.toString()),t(m.name),s(m.lng,m.lat)},children:m.name},m.name))})]})]})},ge=({history:s})=>{const o=d.useRef(null),x=d.useRef(null),[a,n]=d.useState("score");return d.useEffect(()=>{if(!o.current)return;const i=Y(o.current);return x.current=i,()=>{i.dispose()}},[]),d.useEffect(()=>{var l;if(!x.current||s.length===0)return;let i;if(a==="score")i={title:{text:"社区综合评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:t=>{const r=t[0];return`${r.name}<br/>评分: ${r.value}`}},xAxis:{type:"category",data:s.map(t=>t.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"评分",min:0,max:100},series:[{type:"bar",data:s.map(t=>({value:t.score,itemStyle:{color:t.score>=80?"#52c41a":t.score>=60?"#1890ff":"#ff4d4f",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",fontSize:12}}]};else if(a==="area")i={title:{text:"15分钟步行范围面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:t=>{const r=t[0];return`${r.name}<br/>面积: ${r.value.toFixed(2)} km²`}},xAxis:{type:"category",data:s.map(t=>t.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"面积 (km²)"},series:[{type:"bar",data:s.map(t=>({value:t.area/1e6,itemStyle:{color:"#1890ff",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};else{const t=Object.keys(((l=s[0])==null?void 0:l.categories)||{}),r=["#1890ff","#52c41a","#faad14","#ff4d4f","#722ed1"];i={title:{text:"各类设施评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},legend:{bottom:0,data:s.map(p=>p.name)},radar:{indicator:t.map(p=>({name:p,max:100})),shape:"circle",splitNumber:5},series:[{type:"radar",data:s.map((p,h)=>({value:t.map(v=>p.categories[v]||0),name:p.name,lineStyle:{color:r[h%r.length]},areaStyle:{color:r[h%r.length],opacity:.1},itemStyle:{color:r[h%r.length]}}))}]}}x.current.setOption(i)},[s,a]),d.useEffect(()=>{const i=()=>{var l;(l=x.current)==null||l.resize()};return window.addEventListener("resize",i),()=>window.removeEventListener("resize",i)},[]),s.length<2?e.jsxs("div",{className:"community-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),"社区对比"]}),e.jsx("p",{className:"comparison-hint",children:"分析至少2个社区后可进行对比"})]}):e.jsxs("div",{className:"community-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),"社区对比"]}),e.jsxs("div",{className:"metric-selector",children:[e.jsx("button",{className:`metric-button ${a==="score"?"active":""}`,onClick:()=>n("score"),children:"综合评分"}),e.jsx("button",{className:`metric-button ${a==="area"?"active":""}`,onClick:()=>n("area"),children:"覆盖面积"}),e.jsx("button",{className:`metric-button ${a==="categories"?"active":""}`,onClick:()=>n("categories"),children:"各类设施"})]}),e.jsx("div",{ref:o,className:"comparison-chart"}),e.jsx("div",{className:"comparison-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"社区"}),e.jsx("th",{children:"评分"}),e.jsx("th",{children:"等级"}),e.jsx("th",{children:"面积"})]})}),e.jsx("tbody",{children:s.map((i,l)=>e.jsxs("tr",{children:[e.jsx("td",{children:i.name}),e.jsx("td",{className:"score-cell",children:i.score}),e.jsx("td",{children:e.jsx("span",{className:`level-badge level-${i.level}`,children:i.level})}),e.jsxs("td",{children:[(i.area/1e6).toFixed(2)," km²"]})]},l))})]})})]})},je=({steps:s,visible:o})=>{if(!o)return null;const a=s.filter(i=>i.status==="completed").length/s.length*100,n=i=>{switch(i){case"completed":return e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"20 6 9 17 4 12"})});case"active":return e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]});default:return e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("circle",{cx:"12",cy:"12",r:"10"})})}};return e.jsx("div",{className:"analysis-progress",children:e.jsxs("div",{className:"progress-card",children:[e.jsxs("div",{className:"progress-header",children:[e.jsx("h3",{children:"正在分析中"}),e.jsx("p",{children:"请稍候，正在为您生成生活圈体检报告..."})]}),e.jsx("div",{className:"progress-steps",children:s.map(i=>e.jsxs("div",{className:`progress-step ${i.status}`,children:[e.jsx("div",{className:"step-icon",children:n(i.status)}),e.jsx("span",{className:"step-text",children:i.label})]},i.id))}),e.jsx("div",{className:"progress-bar-container",children:e.jsx("div",{className:"progress-bar",style:{width:`${a}%`}})})]})})},Z="http://100.77.182.51:8080/api",F=[{lng:118.7784,lat:32.0663,name:"鼓楼区湖南路街道"},{lng:118.7854,lat:32.0553,name:"鼓楼区中央门街道"},{lng:118.8034,lat:32.0683,name:"玄武区新街口街道"},{lng:118.7894,lat:32.0433,name:"秦淮区夫子庙街道"}];function fe(s,o){const{community_name:x,score:a,suggestions:n,blind_spots:i}=s,l=Object.entries(a.categories).map(([h,v])=>{const m=v,b=m>=80?"#52c41a":m>=60?"#1890ff":"#faad14";return`
        <div class="category-item">
          <span class="category-name">${h}</span>
          <div class="category-bar-container">
            <div class="category-bar" style="width: ${m}%; background-color: ${b}"></div>
          </div>
          <span class="category-score">${m}分</span>
        </div>
      `}).join(""),t=n.map(h=>`
      <div class="suggestion-item ${h.priority==="高"?"high-priority":""}">
        <span class="suggestion-priority">[${h.priority}]</span>
        <span class="suggestion-category">${h.category}</span>
        <span class="suggestion-message">${h.message}</span>
      </div>
    `).join(""),r=i.length>0?i.map(h=>`
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
        <span class="score-number">${a.total}</span>
        <span class="score-label">综合评分</span>
      </div>
      <div class="score-info">
        <div class="score-level">评级: ${a.level}</div>
        <div class="score-detail">盲区扣分: -${a.blind_spot_penalty}分</div>
        <div class="score-detail">分析时间: ${new Date().toLocaleString("zh-CN")}</div>
      </div>
    </div>

    <div class="section">
      <h2>📊 各类设施评分</h2>
      ${l}
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
  `}function ve(s,o){const x=fe(s),a=window.open("","_blank");if(!a){alert("请允许弹出窗口以导出报告");return}a.document.write(x),a.document.close(),a.onload=()=>{a.print()}}const y={Home:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),e.jsx("polyline",{points:"9 22 9 12 15 12 15 22"})]}),Clock:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),MapPin:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),AlertTriangle:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),BarChart:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),Play:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})}),Map:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]}),History:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 4v6h6"}),e.jsx("path",{d:"M3.51 15a9 9 0 1 0 2.13-9.36L1 10"})]}),Refresh:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polyline",{points:"23 4 23 10 17 10"}),e.jsx("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),ArrowLeft:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"19",y1:"12",x2:"5",y2:"12"}),e.jsx("polyline",{points:"12 19 5 12 12 5"})]}),Download:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),e.jsx("polyline",{points:"7 10 12 15 17 10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),Activity:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"22 12 18 12 15 21 9 3 6 12 2 12"})}),Layers:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"12 2 2 7 12 12 22 7 12 2"}),e.jsx("polyline",{points:"2 17 12 22 22 17"}),e.jsx("polyline",{points:"2 12 12 17 22 12"})]})};function we(){var N,E;const[s,o]=d.useState(null),[x,a]=d.useState(null),[n,i]=d.useState(null),[l,t]=d.useState(null),[r,p]=d.useState(15),[h,v]=d.useState(!1),[m,b]=d.useState(null),[k,A]=d.useState([]),[B,H]=d.useState(!1),[$,_]=d.useState([{id:"isochrone",label:"计算等时圈范围",status:"pending"},{id:"poi",label:"搜索周边设施",status:"pending"},{id:"blindspot",label:"识别服务盲区",status:"pending"},{id:"score",label:"计算综合评分",status:"pending"},{id:"report",label:"生成体检报告",status:"pending"}]),[O,T]=d.useState(!1);d.useEffect(()=>{F.length>0&&o(F[0])},[]);const R=()=>x||s,C=(c,g)=>{_(M=>M.map(W=>W.id===c?{...W,status:g}:W))},z=c=>new Promise(g=>setTimeout(g,c)),u=async()=>{const c=R();if(c){v(!0),b(null),T(!0),_(g=>g.map(M=>({...M,status:"pending"})));try{C("isochrone","active");const g=await fetch(`${Z}/isochrone/multi-time`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:c.lng,lat:c.lat,directions:36})});let M=null;g.ok&&(M=await g.json(),t(M)),C("isochrone","completed"),await z(300),C("poi","active"),await z(500),C("blindspot","active"),await z(300),C("score","active");const W=await fetch(`${Z}/analysis/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:c.lng,lat:c.lat,community_name:c.name})});if(!W.ok)throw new Error("分析请求失败");const P=await W.json();C("poi","completed"),C("blindspot","completed"),await z(300),C("score","completed"),await z(300),C("report","active"),i(P),await z(500),C("report","completed"),A(X=>[P,...X.slice(0,4)]),await z(800)}catch(g){b(g instanceof Error?g.message:"分析过程中出现错误")}finally{v(!1),T(!1)}}},j=c=>{p(c)},f=(c,g)=>{a({lng:c,lat:g,name:"自定义位置"})},w=()=>{if(!l)return n==null?void 0:n.isochrone;const c=l.layers.find(g=>g.time===r);return c?{boundary_points:c.boundary_points,polygon:c.polygon}:n==null?void 0:n.isochrone},L=()=>{n&&ve(n)},S=k.slice(0,5).map(c=>({name:c.community_name,score:c.score.total,level:c.score.level,categories:c.score.categories,area:c.isochrone.area}));return e.jsxs("div",{className:"app-container",children:[e.jsx(je,{steps:$,visible:O}),e.jsx("header",{className:"app-header",children:e.jsxs("div",{className:"header-content",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("h1",{children:[e.jsx(y.Home,{}),"15分钟生活圈智能体检与规划助手"]}),e.jsx("p",{children:"基于百度地图的社区生活圈分析工具"})]}),e.jsx("div",{className:"header-right",children:e.jsxs("a",{href:"../",className:"back-button",children:[e.jsx(y.ArrowLeft,{}),"返回首页"]})})]})}),e.jsxs("main",{className:"app-main",children:[e.jsxs("div",{className:"controls-panel",children:[e.jsxs("div",{className:"control-group",children:[e.jsx("label",{children:"选择社区："}),e.jsx("select",{value:s?`${s.lng},${s.lat}`:"",onChange:c=>{const[g,M]=c.target.value.split(",").map(Number),W=F.find(P=>P.lng===g&&P.lat===M);o(W||null),a(null)},children:F.map((c,g)=>e.jsx("option",{value:`${c.lng},${c.lat}`,children:c.name},g))})]}),e.jsx("button",{className:"analyze-button",onClick:u,disabled:h||!s&&!x,children:h?e.jsxs(e.Fragment,{children:[e.jsx(y.Refresh,{}),"分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(y.Play,{}),"开始体检"]})}),e.jsxs("button",{className:"analyze-button secondary",onClick:()=>H(!B),children:[e.jsx(y.MapPin,{}),B?"隐藏自定义位置":"自定义位置"]}),n&&e.jsxs("button",{className:"analyze-button secondary",onClick:L,children:[e.jsx(y.Download,{}),"导出PDF"]})]}),m&&e.jsxs("div",{className:"error-banner",children:[e.jsx(y.AlertTriangle,{}),e.jsx("span",{children:m}),e.jsxs("button",{onClick:u,children:[e.jsx(y.Refresh,{}),"重试"]})]}),e.jsxs("div",{className:"main-content",children:[e.jsxs("div",{className:"map-panel",children:[B&&e.jsx(ue,{onCenterSelect:f,currentCenter:R()}),e.jsx(le,{center:R(),isochrone:w(),poiCoverage:n==null?void 0:n.poi_coverage,blindSpots:n==null?void 0:n.blind_spots,loading:h})]}),e.jsx("div",{className:"data-panel",children:n?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"score-card",children:[e.jsxs("div",{className:"score-header",children:[e.jsx(y.Activity,{}),e.jsx("span",{children:"综合评分"})]}),e.jsx("div",{className:"score-value",children:n.score.total}),e.jsx("div",{className:"score-level",children:n.score.level})]}),l&&e.jsx("div",{className:"detail-card",children:e.jsx(he,{data:{time5:l.layers.find(c=>c.time===300),time10:l.layers.find(c=>c.time===600),time15:l.layers.find(c=>c.time===900)},onTimeChange:j})}),e.jsxs("div",{className:"metrics-grid",children:[e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.Map,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[n.isochrone.area.toFixed(2)," km²"]}),e.jsx("div",{className:"metric-label",children:"覆盖面积"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.Layers,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:n.poi_coverage?Object.values(n.poi_coverage).reduce((c,g)=>c+g.count,0):0}),e.jsx("div",{className:"metric-label",children:"周边设施"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.AlertTriangle,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:((N=n.blind_spots)==null?void 0:N.length)||0}),e.jsx("div",{className:"metric-label",children:"服务盲区"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.Clock,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[r/60," 分钟"]}),e.jsx("div",{className:"metric-label",children:"步行时间"})]})]})]}),((E=n.poi_coverage)==null?void 0:E.categories)&&e.jsxs("div",{className:"facility-summary",children:[e.jsxs("h3",{children:[e.jsx(y.BarChart,{}),"设施分布"]}),e.jsx("div",{className:"facility-list",children:Object.entries(n.poi_coverage.categories).map(([c,g])=>e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-name",children:c}),e.jsx("span",{className:"facility-count",children:g})]},c))})]})]}):e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:e.jsx(y.Map,{})}),e.jsx("h3",{children:"开始分析"}),e.jsx("p",{children:'选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告'}),e.jsxs("div",{className:"feature-list",children:[e.jsxs("div",{className:"feature-item",children:[e.jsx(y.Clock,{}),e.jsx("span",{children:"计算5/10/15分钟步行范围"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(y.MapPin,{}),e.jsx("span",{children:"分析周边设施覆盖"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(y.AlertTriangle,{}),e.jsx("span",{children:"识别服务盲区"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(y.BarChart,{}),e.jsx("span",{children:"生成体检报告"})]})]})]})})]}),n&&e.jsxs("div",{className:"detail-section",children:[l&&e.jsx("div",{className:"detail-card",children:e.jsx(pe,{data:{time5:l.layers.find(c=>c.time===300),time10:l.layers.find(c=>c.time===600),time15:l.layers.find(c=>c.time===900)}})}),e.jsx("div",{className:"detail-card full-width",children:e.jsx(de,{communityName:n.community_name,score:n.score,suggestions:n.suggestions,blindSpots:n.blind_spots})}),n.poi_coverage&&R()&&e.jsx("div",{className:"detail-card",children:e.jsx(me,{poiCoverage:n.poi_coverage,center:R()})}),e.jsx("div",{className:"detail-card",children:e.jsx(xe,{categories:n.score.categories})})]}),k.length>1&&e.jsx("div",{className:"comparison-section",children:e.jsx(ge,{history:S})}),k.length>1&&e.jsxs("div",{className:"history-section",children:[e.jsxs("h3",{children:[e.jsx(y.History,{}),"分析历史"]}),e.jsx("div",{className:"history-list",children:k.slice(1).map((c,g)=>e.jsxs("div",{className:"history-item",children:[e.jsx("span",{className:"history-name",children:c.community_name}),e.jsxs("span",{className:"history-score",children:[c.score.total,"分"]}),e.jsx("span",{className:"history-level",children:c.score.level})]},g))})]})]}),e.jsx("footer",{className:"app-footer",children:e.jsxs("div",{className:"footer-content",children:[e.jsx("p",{children:"15分钟生活圈智能体检与规划助手 © 2025"}),e.jsx("p",{className:"footer-tech",children:"技术栈：React + FastAPI + 百度地图API + NetworkX"})]})})]})}G.createRoot(document.getElementById("root")).render(e.jsx(ee.StrictMode,{children:e.jsx(we,{})}));
