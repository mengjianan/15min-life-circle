import{r as d,a as J,R as V}from"./react-vendor-nf7bT_Uh.js";import{i as F}from"./echarts-vendor-BBmD_jO2.js";(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))c(t);new MutationObserver(t=>{for(const l of t)if(l.type==="childList")for(const o of l.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&c(o)}).observe(document,{childList:!0,subtree:!0});function x(t){const l={};return t.integrity&&(l.integrity=t.integrity),t.referrerPolicy&&(l.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?l.credentials="include":t.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function c(t){if(t.ep)return;t.ep=!0;const l=x(t);fetch(t.href,l)}})();var G={exports:{}},O={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Y=d,Z=Symbol.for("react.element"),q=Symbol.for("react.fragment"),K=Object.prototype.hasOwnProperty,X=Y.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Q={key:!0,ref:!0,__self:!0,__source:!0};function U(s,i,x){var c,t={},l=null,o=null;x!==void 0&&(l=""+x),i.key!==void 0&&(l=""+i.key),i.ref!==void 0&&(o=i.ref);for(c in i)K.call(i,c)&&!Q.hasOwnProperty(c)&&(t[c]=i[c]);if(s&&s.defaultProps)for(c in i=s.defaultProps,i)t[c]===void 0&&(t[c]=i[c]);return{$$typeof:Z,type:s,key:l,ref:o,props:t,_owner:X.current}}O.Fragment=q;O.jsx=U;O.jsxs=U;G.exports=O;var e=G.exports,A={},I=J;A.createRoot=I.createRoot,A.hydrateRoot=I.hydrateRoot;const ee=({loading:s,message:i="加载中..."})=>s?e.jsx("div",{className:"loading-overlay",children:e.jsxs("div",{className:"loading-content",children:[e.jsxs("div",{className:"loading-spinner",children:[e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"})]}),e.jsx("p",{className:"loading-message",children:i}),e.jsx("p",{className:"loading-submessage",children:"正在调用百度地图API计算等时圈..."})]})}):null,se=({center:s,isochrone:i,poiCoverage:x,loading:c=!1,onCenterChange:t})=>{const l=d.useRef(null),o=d.useRef(null),[r,n]=d.useState(!1),[h,m]=d.useState(null),[g,p]=d.useState(!0),[f,b]=d.useState(!0),[$,M]=d.useState(!0),[L,C]=d.useState(!1),B=d.useCallback(()=>new Promise((j,w)=>{const v=()=>{const a=window.BMap;a&&a.Map?j():setTimeout(v,100)};v(),setTimeout(()=>w(new Error("百度地图API加载超时")),1e4)}),[]);d.useEffect(()=>{let j=!0;return(async()=>{try{if(await B(),!j||!l.current||o.current)return;const v=window.BMap,a=new v.Map(l.current),u=new v.Point(118.7969,32.0603);a.centerAndZoom(u,14),a.enableScrollWheelZoom(),a.addControl(new v.NavigationControl),a.addControl(new v.ScaleControl),a.addControl(new v.OverviewMapControl),a.addEventListener("click",N=>{L&&t&&t(N.point.lng,N.point.lat)}),o.current=a,j&&n(!0)}catch(v){console.error("地图初始化失败:",v),j&&m("地图加载失败，请刷新页面重试")}})(),()=>{j=!1}},[B,L,t]),d.useEffect(()=>{if(r&&o.current&&s){const j=window.BMap,w=new j.Point(s.lng,s.lat);o.current.panTo(w),o.current.setZoom(14)}},[s,r]),d.useEffect(()=>{if(r&&o.current&&i){const j=o.current,w=window.BMap;if(j.clearOverlays(),i.boundary_points&&i.boundary_points.length>0){const v=i.boundary_points.map(u=>new w.Point(u.lng,u.lat)),a=new w.Polygon(v,{strokeColor:"#667eea",strokeWeight:2,strokeOpacity:.8,fillColor:"#667eea",fillOpacity:.2});j.addOverlay(a)}if(s){const v=new w.Point(s.lng,s.lat),a=new w.Marker(v);j.addOverlay(a);const u=new w.InfoWindow(`<div style="padding: 8px;">
            <strong>${s.name}</strong>
          </div>`,{width:200,height:60});a.addEventListener("click",()=>{j.openInfoWindow(u,v)})}f&&x&&Object.entries(x).forEach(([v,a])=>{a.facilities&&a.facilities.forEach(u=>{const N=new w.Point(u.location.lng,u.location.lat),S=new w.Marker(N);j.addOverlay(S);const k=new w.InfoWindow(`<div style="padding: 8px;">
                  <strong>${u.name}</strong><br/>
                  <span style="color: #666;">${v}</span>
                </div>`,{width:200,height:60});S.addEventListener("click",()=>{j.openInfoWindow(k,N)})})})}},[r,i,s,x,f]);const R=d.useCallback(()=>{C(j=>!j)},[]),_=d.useCallback(()=>{p(j=>!j)},[]),z=d.useCallback(()=>{b(j=>!j)},[]),W=d.useCallback(()=>{M(j=>!j)},[]);return h?e.jsxs("div",{className:"map-error",children:[e.jsx("div",{className:"map-error-icon",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})}),e.jsx("p",{children:h}),e.jsx("button",{onClick:()=>window.location.reload(),children:"刷新页面"})]}):e.jsxs("div",{className:"map-wrapper",children:[e.jsxs("div",{className:"map-controls",children:[e.jsx("button",{className:`map-control-btn ${L?"active":""}`,onClick:R,title:L?"关闭点击选点":"开启点击选点",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]})}),e.jsx("button",{className:`map-control-btn ${g?"active":""}`,onClick:_,title:g?"隐藏路网":"显示路网",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]})}),e.jsx("button",{className:`map-control-btn ${f?"active":""}`,onClick:z,title:f?"隐藏POI":"显示POI",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("line",{x1:"12",y1:"8",x2:"12",y2:"12"}),e.jsx("line",{x1:"12",y1:"16",x2:"12.01",y2:"16"})]})}),e.jsx("button",{className:`map-control-btn ${$?"active":""}`,onClick:W,title:$?"隐藏盲区":"显示盲区",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})})]}),e.jsx("div",{ref:l,className:"map-container"}),c&&e.jsx(ee,{loading:!0}),L&&e.jsxs("div",{className:"click-mode-hint",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"点击地图选择位置"]})]})},D={医疗:({size:s=20})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M22 12h-4l-3 9L9 3l-3 9H2"})}),教育:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","stroke-linejoin":"round",children:[e.jsx("path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"}),e.jsx("path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"})]}),购物:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"9",cy:"21",r:"1"}),e.jsx("circle",{cx:"20",cy:"21",r:"1"}),e.jsx("path",{d:"M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"})]}),养老:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),文体:({size:s=20})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})}),餐饮:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 8h1a4 4 0 0 1 0 8h-1"}),e.jsx("path",{d:"M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"}),e.jsx("line",{x1:"6",y1:"1",x2:"6",y2:"4"}),e.jsx("line",{x1:"10",y1:"1",x2:"10",y2:"4"}),e.jsx("line",{x1:"14",y1:"1",x2:"14",y2:"4"})]}),综合:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polygon",{points:"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"})]})},te={Warning:({size:s=24})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})},P=s=>({医疗:"#ef4444",教育:"#3b82f6",购物:"#22c55e",养老:"#8b5cf6",文体:"#06b6d4",餐饮:"#f59e0b",综合:"#6b7280"})[s]||"#6b7280",T=s=>({医疗:"#fef2f2",教育:"#eff6ff",购物:"#f0fdf4",养老:"#f5f3ff",文体:"#ecfeff",餐饮:"#fffbeb",综合:"#f9fafb"})[s]||"#f9fafb",re=({communityName:s,score:i,suggestions:x,blindSpots:c})=>{const t=o=>{switch(o){case"优秀":return"#52c41a";case"良好":return"#1890ff";case"一般":return"#faad14";case"需改善":return"#ff4d4f";default:return"#666"}},l=o=>{const r={高:"#ff4d4f",中:"#faad14",低:"#52c41a"};return e.jsx("span",{className:"priority-tag",style:{backgroundColor:r[o]||"#666"},children:o})};return e.jsxs("div",{className:"report-container",children:[e.jsxs("h2",{children:[s," - 生活圈体检报告"]}),e.jsxs("div",{className:"score-section",children:[e.jsxs("div",{className:"score-circle",style:{borderColor:t(i.level)},children:[e.jsx("span",{className:"score-number",children:i.total}),e.jsx("span",{className:"score-level",children:i.level})]}),e.jsxs("div",{className:"score-detail",children:[e.jsx("p",{children:"综合评分"}),i.blind_spot_penalty>0&&e.jsxs("p",{className:"penalty-note",children:["盲区扣分: -",i.blind_spot_penalty,"分"]})]})]}),e.jsxs("div",{className:"category-scores",children:[e.jsx("h3",{children:"各类设施评分"}),e.jsx("div",{className:"category-grid",children:Object.entries(i.categories).map(([o,r])=>e.jsxs("div",{className:"category-item",children:[e.jsx("span",{className:"category-name",children:o}),e.jsx("div",{className:"category-bar",children:e.jsx("div",{className:"category-fill",style:{width:`${r}%`,backgroundColor:r>=80?"#52c41a":r>=60?"#1890ff":"#ff4d4f"}})}),e.jsx("span",{className:"category-score",children:r})]},o))})]}),x.length>0&&e.jsxs("div",{className:"suggestions-section",children:[e.jsx("h3",{children:"改善建议"}),e.jsx("ul",{className:"suggestions-list",children:x.map((o,r)=>e.jsxs("li",{className:"suggestion-item",children:[l(o.priority),e.jsxs("span",{className:"suggestion-category",children:["[",o.category,"]"]}),e.jsx("span",{className:"suggestion-message",children:o.message})]},r))})]}),c.length>0&&e.jsxs("div",{className:"blind-spots-section",children:[e.jsxs("h3",{children:["服务盲区 (",c.length,"个)"]}),e.jsx("div",{className:"blind-spots-list",children:c.map((o,r)=>e.jsxs("div",{className:"blind-spot-item",children:[e.jsx("span",{className:"blind-spot-icon",children:e.jsx(te.Warning,{size:18})}),e.jsxs("div",{className:"blind-spot-info",children:[e.jsx("span",{className:"blind-spot-category",children:o.category}),e.jsx("span",{className:"blind-spot-desc",children:o.description})]})]},r))})]})]})},ne=({categories:s})=>{const i=d.useRef(null),x=d.useRef(null);return d.useEffect(()=>{if(!i.current)return;const c=F(i.current);return x.current=c,()=>{c.dispose()}},[]),d.useEffect(()=>{if(!x.current)return;const c=Object.keys(s),t=Object.values(s),l={title:{text:"设施覆盖雷达图",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},radar:{indicator:c.map(o=>({name:o,max:100})),shape:"circle",splitNumber:5,axisName:{color:"#333",fontSize:12},splitLine:{lineStyle:{color:"#ddd"}},splitArea:{show:!0,areaStyle:{color:["rgba(24, 144, 255, 0.1)","rgba(24, 144, 255, 0.2)"]}}},series:[{type:"radar",data:[{value:t,name:"设施覆盖评分",areaStyle:{color:"rgba(24, 144, 255, 0.3)"},lineStyle:{color:"#1890ff",width:2},itemStyle:{color:"#1890ff"}}]}]};x.current.setOption(l)},[s]),d.useEffect(()=>{const c=()=>{var t;(t=x.current)==null||t.resize()};return window.addEventListener("resize",c),()=>window.removeEventListener("resize",c)},[]),e.jsx("div",{className:"radar-chart-container",children:e.jsx("div",{ref:i,className:"radar-chart"})})},ie=({data:s,onTimeChange:i})=>{const[x,c]=d.useState(15),t=[{value:5,label:"5分钟",icon:"🚶",color:"#52c41a"},{value:10,label:"10分钟",icon:"🚶‍♂️",color:"#faad14"},{value:15,label:"15分钟",icon:"🚶‍♀️",color:"#1890ff"}],l=n=>{c(n),i(n)},r=t.map(n=>{var m,g,p;let h=0;return n.value===5?h=((m=s.time5)==null?void 0:m.area)||0:n.value===10?h=((g=s.time10)==null?void 0:g.area)||0:n.value===15&&(h=((p=s.time15)==null?void 0:p.area)||0),{...n,area:h,areaText:h>0?`${(h/1e6).toFixed(2)} km²`:"计算中"}});return e.jsxs("div",{className:"time-comparison",children:[e.jsx("h4",{children:"⏱️ 时间维度对比"}),e.jsx("div",{className:"time-selector",children:t.map(n=>e.jsxs("button",{className:`time-button ${x===n.value?"active":""}`,style:{"--color":n.color},onClick:()=>l(n.value),children:[e.jsx("span",{className:"time-icon",children:n.icon}),e.jsx("span",{className:"time-label",children:n.label})]},n.value))}),e.jsx("div",{className:"area-stats",children:r.map(n=>e.jsxs("div",{className:`area-item ${x===n.value?"active":""}`,children:[e.jsx("div",{className:"area-color",style:{backgroundColor:n.color}}),e.jsxs("div",{className:"area-info",children:[e.jsx("span",{className:"area-time",children:n.label}),e.jsx("span",{className:"area-value",children:n.areaText})]})]},n.value))}),e.jsx("div",{className:"area-chart",children:e.jsx("div",{className:"chart-bars",children:r.map(n=>{const h=Math.max(...r.map(g=>g.area||1)),m=n.area>0?n.area/h*100:0;return e.jsxs("div",{className:"chart-bar-container",children:[e.jsx("div",{className:"chart-bar-label",children:n.label}),e.jsx("div",{className:"chart-bar-track",children:e.jsx("div",{className:"chart-bar-fill",style:{width:`${m}%`,backgroundColor:n.color}})}),e.jsx("div",{className:"chart-bar-value",children:n.areaText})]},n.value)})})})]})},oe=({data:s})=>{const i=d.useRef(null),x=d.useRef(null);d.useEffect(()=>{if(!i.current)return;const l=F(i.current);return x.current=l,()=>{l.dispose()}},[]),d.useEffect(()=>{var h,m,g;if(!x.current)return;const l=["5分钟","10分钟","15分钟"],o=[(h=s.time5)!=null&&h.area?s.time5.area/1e6:0,(m=s.time10)!=null&&m.area?s.time10.area/1e6:0,(g=s.time15)!=null&&g.area?s.time15.area/1e6:0],r=["#52c41a","#faad14","#1890ff"],n={title:{text:"等时圈面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:p=>{const f=p[0];return`${f.name}<br/>面积: ${f.value.toFixed(2)} km²`}},xAxis:{type:"category",data:l,axisLabel:{fontSize:12}},yAxis:{type:"value",name:"面积 (km²)",axisLabel:{fontSize:12}},series:[{type:"bar",data:o.map((p,f)=>({value:p,itemStyle:{color:r[f],borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};x.current.setOption(n)},[s]),d.useEffect(()=>{const l=()=>{var o;(o=x.current)==null||o.resize()};return window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[]);const t=(()=>{var o,r;return!((o=s.time5)!=null&&o.area)||!((r=s.time15)!=null&&r.area)?null:((s.time15.area-s.time5.area)/s.time5.area*100).toFixed(1)})();return e.jsxs("div",{className:"area-comparison-container",children:[e.jsx("div",{ref:i,className:"area-chart"}),t&&e.jsxs("div",{className:"growth-info",children:[e.jsx("span",{className:"growth-label",children:"15分钟比5分钟面积增长:"}),e.jsxs("span",{className:"growth-value",children:["+",t,"%"]})]})]})},ae=({poiCoverage:s})=>{const i=r=>Math.round(r/1.2/60),c=(()=>{const r=[];return Object.entries(s).forEach(([n,h])=>{h.facilities.forEach(m=>{r.push({...m,category:n})})}),r.sort((n,h)=>(n.distance||0)-(h.distance||0))})(),l=(()=>{const r={};return Object.keys(s).forEach(n=>{const h=c.filter(m=>m.category===n);r[n]=h.length>0?h[0]:null}),r})(),o=(r,n=20)=>{const h=D[r]||D.综合;return e.jsx(h,{size:n})};return e.jsxs("div",{className:"facility-accessibility",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"设施可达性分析"]}),e.jsxs("div",{className:"nearest-facilities",children:[e.jsx("h5",{children:"各类最近设施"}),e.jsx("div",{className:"nearest-grid",children:Object.entries(l).map(([r,n])=>{const h=P(r),m=T(r);return e.jsxs("div",{className:"nearest-item",children:[e.jsx("span",{className:"nearest-icon",style:{backgroundColor:m,color:h},children:o(r)}),e.jsxs("div",{className:"nearest-info",children:[e.jsx("span",{className:"nearest-category",children:r}),n?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"nearest-name",children:n.name}),e.jsxs("span",{className:"nearest-distance",children:[n.distance?`${n.distance}米`:"未知",n.distance&&` (${i(n.distance)}分钟)`]})]}):e.jsx("span",{className:"nearest-none",children:"暂无数据"})]})]},r)})})]}),c.length>0&&e.jsxs("div",{className:"facility-list",children:[e.jsx("h5",{children:"周边设施列表 (前10个)"}),e.jsx("div",{className:"facility-items",children:c.slice(0,10).map((r,n)=>{const h=P(r.category),m=T(r.category);return e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-icon",style:{backgroundColor:m,color:h},children:o(r.category)}),e.jsxs("div",{className:"facility-info",children:[e.jsx("span",{className:"facility-name",children:r.name}),e.jsx("span",{className:"facility-address",children:r.address||"暂无地址"})]}),e.jsx("div",{className:"facility-distance",children:r.distance&&e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"distance-value",children:[r.distance,"米"]}),e.jsxs("span",{className:"distance-time",children:["步行",i(r.distance),"分钟"]})]})})]},n)})})]}),e.jsxs("div",{className:"accessibility-score",children:[e.jsx("h5",{children:"可达性评分"}),e.jsx("div",{className:"score-items",children:Object.entries(s).map(([r,n])=>{const h=P(r),m=T(r),g=n.count>=5?100:n.count>=3?80:n.count>=1?60:30;return e.jsxs("div",{className:"score-item",children:[e.jsx("span",{className:"score-icon",style:{backgroundColor:m,color:h},children:o(r)}),e.jsx("span",{className:"score-category",children:r}),e.jsx("div",{className:"score-bar",children:e.jsx("div",{className:"score-fill",style:{width:`${g}%`,backgroundColor:g>=80?"#22c55e":g>=60?"#3b82f6":"#ef4444"}})}),e.jsx("span",{className:"score-value",children:g})]},r)})})]})]})},le=({onCenterSelect:s,currentCenter:i})=>{var m,g;const[x,c]=d.useState(((m=i==null?void 0:i.lng)==null?void 0:m.toString())||"118.7784"),[t,l]=d.useState(((g=i==null?void 0:i.lat)==null?void 0:g.toString())||"32.0663"),[o,r]=d.useState((i==null?void 0:i.name)||"自定义位置"),n=p=>{p.preventDefault();const f=parseFloat(x),b=parseFloat(t);if(isNaN(f)||isNaN(b)){alert("请输入有效的经纬度");return}if(f<73||f>135||b<3||b>53){alert("经纬度超出中国范围");return}s(f,b)},h=()=>{navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{const{longitude:f,latitude:b}=p.coords;c(f.toFixed(6)),l(b.toFixed(6)),r("当前位置"),s(f,b)},p=>{alert("无法获取当前位置，请手动输入"),console.error("获取位置失败:",p)}):alert("浏览器不支持地理定位")};return e.jsxs("div",{className:"custom-center",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"自定义中心点"]}),e.jsxs("form",{onSubmit:n,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"经度:"}),e.jsx("input",{type:"number",step:"0.000001",value:x,onChange:p=>c(p.target.value),placeholder:"118.7784"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"纬度:"}),e.jsx("input",{type:"number",step:"0.000001",value:t,onChange:p=>l(p.target.value),placeholder:"32.0663"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"名称:"}),e.jsx("input",{type:"text",value:o,onChange:p=>r(p.target.value),placeholder:"自定义位置"})]}),e.jsxs("div",{className:"button-group",children:[e.jsx("button",{type:"submit",className:"apply-button",children:"应用"}),e.jsxs("button",{type:"button",className:"location-button",onClick:h,children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("circle",{cx:"12",cy:"12",r:"4"}),e.jsx("line",{x1:"4.93",y1:"4.93",x2:"9.17",y2:"9.17"}),e.jsx("line",{x1:"14.83",y1:"14.83",x2:"19.07",y2:"19.07"}),e.jsx("line",{x1:"14.83",y1:"9.17",x2:"19.07",y2:"4.93"}),e.jsx("line",{x1:"4.93",y1:"19.07",x2:"9.17",y2:"14.83"})]}),"获取当前位置"]})]})]}),i&&e.jsxs("div",{className:"current-info",children:[e.jsx("p",{children:"当前中心点:"}),e.jsx("p",{className:"center-name",children:i.name}),e.jsxs("p",{className:"center-coord",children:["(",i.lng.toFixed(4),", ",i.lat.toFixed(4),")"]})]}),e.jsxs("div",{className:"preset-locations",children:[e.jsx("h5",{children:"预设位置"}),e.jsx("div",{className:"preset-list",children:[{name:"南京市中心",lng:118.7969,lat:32.0603},{name:"新街口",lng:118.7874,lat:32.0423},{name:"鼓楼广场",lng:118.7784,lat:32.0663},{name:"夫子庙",lng:118.7894,lat:32.0233}].map(p=>e.jsx("button",{className:"preset-button",onClick:()=>{c(p.lng.toString()),l(p.lat.toString()),r(p.name),s(p.lng,p.lat)},children:p.name},p.name))})]})]})},ce=({history:s})=>{const i=d.useRef(null),x=d.useRef(null),[c,t]=d.useState("score");return d.useEffect(()=>{if(!i.current)return;const l=F(i.current);return x.current=l,()=>{l.dispose()}},[]),d.useEffect(()=>{var o;if(!x.current||s.length===0)return;let l;if(c==="score")l={title:{text:"社区综合评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:r=>{const n=r[0];return`${n.name}<br/>评分: ${n.value}`}},xAxis:{type:"category",data:s.map(r=>r.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"评分",min:0,max:100},series:[{type:"bar",data:s.map(r=>({value:r.score,itemStyle:{color:r.score>=80?"#52c41a":r.score>=60?"#1890ff":"#ff4d4f",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",fontSize:12}}]};else if(c==="area")l={title:{text:"15分钟步行范围面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:r=>{const n=r[0];return`${n.name}<br/>面积: ${n.value.toFixed(2)} km²`}},xAxis:{type:"category",data:s.map(r=>r.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"面积 (km²)"},series:[{type:"bar",data:s.map(r=>({value:r.area/1e6,itemStyle:{color:"#1890ff",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};else{const r=Object.keys(((o=s[0])==null?void 0:o.categories)||{}),n=["#1890ff","#52c41a","#faad14","#ff4d4f","#722ed1"];l={title:{text:"各类设施评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},legend:{bottom:0,data:s.map(h=>h.name)},radar:{indicator:r.map(h=>({name:h,max:100})),shape:"circle",splitNumber:5},series:[{type:"radar",data:s.map((h,m)=>({value:r.map(g=>h.categories[g]||0),name:h.name,lineStyle:{color:n[m%n.length]},areaStyle:{color:n[m%n.length],opacity:.1},itemStyle:{color:n[m%n.length]}}))}]}}x.current.setOption(l)},[s,c]),d.useEffect(()=>{const l=()=>{var o;(o=x.current)==null||o.resize()};return window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[]),s.length<2?e.jsxs("div",{className:"community-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),"社区对比"]}),e.jsx("p",{className:"comparison-hint",children:"分析至少2个社区后可进行对比"})]}):e.jsxs("div",{className:"community-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),"社区对比"]}),e.jsxs("div",{className:"metric-selector",children:[e.jsx("button",{className:`metric-button ${c==="score"?"active":""}`,onClick:()=>t("score"),children:"综合评分"}),e.jsx("button",{className:`metric-button ${c==="area"?"active":""}`,onClick:()=>t("area"),children:"覆盖面积"}),e.jsx("button",{className:`metric-button ${c==="categories"?"active":""}`,onClick:()=>t("categories"),children:"各类设施"})]}),e.jsx("div",{ref:i,className:"comparison-chart"}),e.jsx("div",{className:"comparison-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"社区"}),e.jsx("th",{children:"评分"}),e.jsx("th",{children:"等级"}),e.jsx("th",{children:"面积"})]})}),e.jsx("tbody",{children:s.map((l,o)=>e.jsxs("tr",{children:[e.jsx("td",{children:l.name}),e.jsx("td",{className:"score-cell",children:l.score}),e.jsx("td",{children:e.jsx("span",{className:`level-badge level-${l.level}`,children:l.level})}),e.jsxs("td",{children:[(l.area/1e6).toFixed(2)," km²"]})]},o))})]})})]})},H="http://100.77.182.51:8080/api",E=[{lng:118.7784,lat:32.0663,name:"鼓楼区湖南路街道"},{lng:118.7854,lat:32.0553,name:"鼓楼区中央门街道"},{lng:118.8034,lat:32.0683,name:"玄武区新街口街道"},{lng:118.7894,lat:32.0433,name:"秦淮区夫子庙街道"}];function de(s,i){const{community_name:x,score:c,suggestions:t,blind_spots:l}=s,o=Object.entries(c.categories).map(([m,g])=>{const p=g,f=p>=80?"#52c41a":p>=60?"#1890ff":"#faad14";return`
        <div class="category-item">
          <span class="category-name">${m}</span>
          <div class="category-bar-container">
            <div class="category-bar" style="width: ${p}%; background-color: ${f}"></div>
          </div>
          <span class="category-score">${p}分</span>
        </div>
      `}).join(""),r=t.map(m=>`
      <div class="suggestion-item ${m.priority==="高"?"high-priority":""}">
        <span class="suggestion-priority">[${m.priority}]</span>
        <span class="suggestion-category">${m.category}</span>
        <span class="suggestion-message">${m.message}</span>
      </div>
    `).join(""),n=l.length>0?l.map(m=>`
          <div class="blind-spot-item">
            <span class="spot-icon">⚠️</span>
            <span class="spot-category">${m.category}:</span>
            <span class="spot-description">${m.description}</span>
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
      ${o}
    </div>

    

    <div class="section">
      <h2>💡 改善建议</h2>
      ${r}
    </div>

    <div class="section">
      <h2>⚠️ 服务盲区</h2>
      ${n}
    </div>

    <div class="report-footer">
      <p>15分钟生活圈智能体检与规划助手 - 基于百度地图开放能力</p>
      <p>报告生成时间: ${new Date().toLocaleString("zh-CN")}</p>
    </div>
  </div>
</body>
</html>
  `}function xe(s,i){const x=de(s),c=window.open("","_blank");if(!c){alert("请允许弹出窗口以导出报告");return}c.document.write(x),c.document.close(),c.onload=()=>{c.print()}}const y={Home:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),e.jsx("polyline",{points:"9 22 9 12 15 12 15 22"})]}),Clock:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),MapPin:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),AlertTriangle:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),BarChart:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),Play:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})}),Map:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]}),History:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 4v6h6"}),e.jsx("path",{d:"M3.51 15a9 9 0 1 0 2.13-9.36L1 10"})]}),Refresh:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polyline",{points:"23 4 23 10 17 10"}),e.jsx("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),ArrowLeft:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"19",y1:"12",x2:"5",y2:"12"}),e.jsx("polyline",{points:"12 19 5 12 12 5"})]}),Download:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),e.jsx("polyline",{points:"7 10 12 15 17 10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),Activity:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"22 12 18 12 15 21 9 3 6 12 2 12"})}),Layers:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"12 2 2 7 12 12 22 7 12 2"}),e.jsx("polyline",{points:"2 17 12 22 22 17"}),e.jsx("polyline",{points:"2 12 12 17 22 12"})]})};function he(){var w,v;const[s,i]=d.useState(null),[x,c]=d.useState(null),[t,l]=d.useState(null),[o,r]=d.useState(null),[n,h]=d.useState(15),[m,g]=d.useState(!1),[p,f]=d.useState(null),[b,$]=d.useState([]),[M,L]=d.useState(!1);d.useEffect(()=>{E.length>0&&i(E[0])},[]);const C=()=>x||s,B=async()=>{const a=C();if(a){g(!0),f(null);try{const[u,N]=await Promise.all([fetch(`${H}/analysis/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:a.lng,lat:a.lat,community_name:a.name})}),fetch(`${H}/isochrone/multi-time`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:a.lng,lat:a.lat,directions:36})})]);if(!u.ok)throw new Error("分析请求失败");const S=await u.json();if(l(S),N.ok){const k=await N.json();r(k)}$(k=>[S,...k.slice(0,4)])}catch(u){f(u instanceof Error?u.message:"分析过程中出现错误")}finally{g(!1)}}},R=a=>{h(a)},_=(a,u)=>{c({lng:a,lat:u,name:"自定义位置"})},z=()=>{if(!o)return t==null?void 0:t.isochrone;const a=o.layers.find(u=>u.time===n);return a?{boundary_points:a.boundary_points,polygon:a.polygon}:t==null?void 0:t.isochrone},W=()=>{t&&xe(t)},j=b.slice(0,5).map(a=>({name:a.community_name,score:a.score.total,level:a.score.level,categories:a.score.categories,area:a.isochrone.area}));return e.jsxs("div",{className:"app-container",children:[e.jsx("header",{className:"app-header",children:e.jsxs("div",{className:"header-content",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("h1",{children:[e.jsx(y.Home,{}),"15分钟生活圈智能体检与规划助手"]}),e.jsx("p",{children:"基于百度地图的社区生活圈分析工具"})]}),e.jsx("div",{className:"header-right",children:e.jsxs("a",{href:"../",className:"back-button",children:[e.jsx(y.ArrowLeft,{}),"返回首页"]})})]})}),e.jsxs("main",{className:"app-main",children:[e.jsxs("div",{className:"controls-panel",children:[e.jsxs("div",{className:"control-group",children:[e.jsx("label",{children:"选择社区："}),e.jsx("select",{value:s?`${s.lng},${s.lat}`:"",onChange:a=>{const[u,N]=a.target.value.split(",").map(Number),S=E.find(k=>k.lng===u&&k.lat===N);i(S||null),c(null)},children:E.map((a,u)=>e.jsx("option",{value:`${a.lng},${a.lat}`,children:a.name},u))})]}),e.jsx("button",{className:"analyze-button",onClick:B,disabled:m||!s&&!x,children:m?e.jsxs(e.Fragment,{children:[e.jsx(y.Refresh,{}),"分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(y.Play,{}),"开始体检"]})}),e.jsxs("button",{className:"analyze-button secondary",onClick:()=>L(!M),children:[e.jsx(y.MapPin,{}),M?"隐藏自定义位置":"自定义位置"]}),t&&e.jsxs("button",{className:"analyze-button secondary",onClick:W,children:[e.jsx(y.Download,{}),"导出PDF"]})]}),p&&e.jsxs("div",{className:"error-banner",children:[e.jsx(y.AlertTriangle,{}),e.jsx("span",{children:p}),e.jsxs("button",{onClick:B,children:[e.jsx(y.Refresh,{}),"重试"]})]}),e.jsxs("div",{className:"main-content",children:[e.jsxs("div",{className:"map-panel",children:[M&&e.jsx(le,{onCenterSelect:_,currentCenter:C()}),e.jsx(se,{center:C(),isochrone:z(),poiCoverage:t==null?void 0:t.poi_coverage,blindSpots:t==null?void 0:t.blind_spots,loading:m})]}),e.jsx("div",{className:"data-panel",children:t?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"score-card",children:[e.jsxs("div",{className:"score-header",children:[e.jsx(y.Activity,{}),e.jsx("span",{children:"综合评分"})]}),e.jsx("div",{className:"score-value",children:t.score.total}),e.jsx("div",{className:"score-level",children:t.score.level})]}),e.jsxs("div",{className:"metrics-grid",children:[e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.Map,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[t.isochrone.area.toFixed(2)," km²"]}),e.jsx("div",{className:"metric-label",children:"覆盖面积"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.Layers,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:t.poi_coverage?Object.values(t.poi_coverage).reduce((a,u)=>a+u.count,0):0}),e.jsx("div",{className:"metric-label",children:"周边设施"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.AlertTriangle,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:((w=t.blind_spots)==null?void 0:w.length)||0}),e.jsx("div",{className:"metric-label",children:"服务盲区"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.Clock,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[n/60," 分钟"]}),e.jsx("div",{className:"metric-label",children:"步行时间"})]})]})]}),((v=t.poi_coverage)==null?void 0:v.categories)&&e.jsxs("div",{className:"facility-summary",children:[e.jsxs("h3",{children:[e.jsx(y.BarChart,{}),"设施分布"]}),e.jsx("div",{className:"facility-list",children:Object.entries(t.poi_coverage.categories).map(([a,u])=>e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-name",children:a}),e.jsx("span",{className:"facility-count",children:u})]},a))})]})]}):e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:e.jsx(y.Map,{})}),e.jsx("h3",{children:"开始分析"}),e.jsx("p",{children:'选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告'}),e.jsxs("div",{className:"feature-list",children:[e.jsxs("div",{className:"feature-item",children:[e.jsx(y.Clock,{}),e.jsx("span",{children:"计算5/10/15分钟步行范围"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(y.MapPin,{}),e.jsx("span",{children:"分析周边设施覆盖"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(y.AlertTriangle,{}),e.jsx("span",{children:"识别服务盲区"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(y.BarChart,{}),e.jsx("span",{children:"生成体检报告"})]})]})]})})]}),t&&e.jsxs("div",{className:"detail-section",children:[o&&e.jsx("div",{className:"detail-card",children:e.jsx(ie,{data:{time5:o.layers.find(a=>a.time===300),time10:o.layers.find(a=>a.time===600),time15:o.layers.find(a=>a.time===900)},onTimeChange:R})}),o&&e.jsx("div",{className:"detail-card",children:e.jsx(oe,{data:{time5:o.layers.find(a=>a.time===300),time10:o.layers.find(a=>a.time===600),time15:o.layers.find(a=>a.time===900)}})}),e.jsx("div",{className:"detail-card full-width",children:e.jsx(re,{communityName:t.community_name,score:t.score,suggestions:t.suggestions,blindSpots:t.blind_spots})}),t.poi_coverage&&C()&&e.jsx("div",{className:"detail-card",children:e.jsx(ae,{poiCoverage:t.poi_coverage,center:C()})}),e.jsx("div",{className:"detail-card",children:e.jsx(ne,{categories:t.score.categories})})]}),b.length>1&&e.jsx("div",{className:"comparison-section",children:e.jsx(ce,{history:j})}),b.length>1&&e.jsxs("div",{className:"history-section",children:[e.jsxs("h3",{children:[e.jsx(y.History,{}),"分析历史"]}),e.jsx("div",{className:"history-list",children:b.slice(1).map((a,u)=>e.jsxs("div",{className:"history-item",children:[e.jsx("span",{className:"history-name",children:a.community_name}),e.jsxs("span",{className:"history-score",children:[a.score.total,"分"]}),e.jsx("span",{className:"history-level",children:a.score.level})]},u))})]})]}),e.jsx("footer",{className:"app-footer",children:e.jsxs("div",{className:"footer-content",children:[e.jsx("p",{children:"15分钟生活圈智能体检与规划助手 © 2025"}),e.jsx("p",{className:"footer-tech",children:"技术栈：React + FastAPI + 百度地图API + NetworkX"})]})})]})}A.createRoot(document.getElementById("root")).render(e.jsx(V.StrictMode,{children:e.jsx(he,{})}));
