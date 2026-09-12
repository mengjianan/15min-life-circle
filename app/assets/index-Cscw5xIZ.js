import{r as d,a as H,R as G}from"./react-vendor-nf7bT_Uh.js";import{i as A}from"./echarts-vendor-BBmD_jO2.js";(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))l(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&l(i)}).observe(document,{childList:!0,subtree:!0});function x(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function l(s){if(s.ep)return;s.ep=!0;const n=x(s);fetch(s.href,n)}})();var I={exports:{}},E={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var U=d,J=Symbol.for("react.element"),Y=Symbol.for("react.fragment"),Z=Object.prototype.hasOwnProperty,q=U.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,V={key:!0,ref:!0,__self:!0,__source:!0};function D(r,o,x){var l,s={},n=null,i=null;x!==void 0&&(n=""+x),o.key!==void 0&&(n=""+o.key),o.ref!==void 0&&(i=o.ref);for(l in o)Z.call(o,l)&&!V.hasOwnProperty(l)&&(s[l]=o[l]);if(r&&r.defaultProps)for(l in o=r.defaultProps,o)s[l]===void 0&&(s[l]=o[l]);return{$$typeof:J,type:r,key:n,ref:i,props:s,_owner:q.current}}E.Fragment=Y;E.jsx=D;E.jsxs=D;I.exports=E;var e=I.exports,B={},W=H;B.createRoot=W.createRoot,B.hydrateRoot=W.hydrateRoot;const K=({loading:r,message:o="加载中..."})=>r?e.jsx("div",{className:"loading-overlay",children:e.jsxs("div",{className:"loading-content",children:[e.jsxs("div",{className:"loading-spinner",children:[e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"})]}),e.jsx("p",{className:"loading-message",children:o}),e.jsx("p",{className:"loading-submessage",children:"正在调用百度地图API计算等时圈..."})]})}):null,X=({center:r,isochrone:o,poiCoverage:x,loading:l=!1,onCenterChange:s})=>{const n=d.useRef(null),i=d.useRef(null),[c,t]=d.useState(!1),[m,h]=d.useState(null),[j,p]=d.useState(!0),[f,b]=d.useState(!0),[_,M]=d.useState(!0),[S,L]=d.useState(!1),$=d.useCallback(()=>new Promise((g,w)=>{const v=()=>{const a=window.BMap;a&&a.Map?g():setTimeout(v,100)};v(),setTimeout(()=>w(new Error("百度地图API加载超时")),1e4)}),[]);d.useEffect(()=>{let g=!0;return(async()=>{try{if(await $(),!g||!n.current||i.current)return;const v=window.BMap,a=new v.Map(n.current),u=new v.Point(118.7969,32.0603);a.centerAndZoom(u,14),a.enableScrollWheelZoom(),a.addControl(new v.NavigationControl),a.addControl(new v.ScaleControl),a.addControl(new v.OverviewMapControl),a.addEventListener("click",N=>{S&&s&&s(N.point.lng,N.point.lat)}),i.current=a,g&&t(!0)}catch(v){console.error("地图初始化失败:",v),g&&h("地图加载失败，请刷新页面重试")}})(),()=>{g=!1}},[$,S,s]),d.useEffect(()=>{if(c&&i.current&&r){const g=window.BMap,w=new g.Point(r.lng,r.lat);i.current.panTo(w),i.current.setZoom(14)}},[r,c]),d.useEffect(()=>{if(c&&i.current&&o){const g=i.current,w=window.BMap;if(g.clearOverlays(),o.boundary_points&&o.boundary_points.length>0){const v=o.boundary_points.map(u=>new w.Point(u.lng,u.lat)),a=new w.Polygon(v,{strokeColor:"#667eea",strokeWeight:2,strokeOpacity:.8,fillColor:"#667eea",fillOpacity:.2});g.addOverlay(a)}if(r){const v=new w.Point(r.lng,r.lat),a=new w.Marker(v);g.addOverlay(a);const u=new w.InfoWindow(`<div style="padding: 8px;">
            <strong>${r.name}</strong>
          </div>`,{width:200,height:60});a.addEventListener("click",()=>{g.openInfoWindow(u,v)})}f&&x&&Object.entries(x).forEach(([v,a])=>{a.facilities&&a.facilities.forEach(u=>{const N=new w.Point(u.location.lng,u.location.lat),C=new w.Marker(N);g.addOverlay(C);const k=new w.InfoWindow(`<div style="padding: 8px;">
                  <strong>${u.name}</strong><br/>
                  <span style="color: #666;">${v}</span>
                </div>`,{width:200,height:60});C.addEventListener("click",()=>{g.openInfoWindow(k,N)})})})}},[c,o,r,x,f]);const O=d.useCallback(()=>{L(g=>!g)},[]),R=d.useCallback(()=>{p(g=>!g)},[]),P=d.useCallback(()=>{b(g=>!g)},[]),T=d.useCallback(()=>{M(g=>!g)},[]);return m?e.jsxs("div",{className:"map-error",children:[e.jsx("div",{className:"map-error-icon",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})}),e.jsx("p",{children:m}),e.jsx("button",{onClick:()=>window.location.reload(),children:"刷新页面"})]}):e.jsxs("div",{className:"map-wrapper",children:[e.jsxs("div",{className:"map-controls",children:[e.jsx("button",{className:`map-control-btn ${S?"active":""}`,onClick:O,title:S?"关闭点击选点":"开启点击选点",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]})}),e.jsx("button",{className:`map-control-btn ${j?"active":""}`,onClick:R,title:j?"隐藏路网":"显示路网",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]})}),e.jsx("button",{className:`map-control-btn ${f?"active":""}`,onClick:P,title:f?"隐藏POI":"显示POI",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("line",{x1:"12",y1:"8",x2:"12",y2:"12"}),e.jsx("line",{x1:"12",y1:"16",x2:"12.01",y2:"16"})]})}),e.jsx("button",{className:`map-control-btn ${_?"active":""}`,onClick:T,title:_?"隐藏盲区":"显示盲区",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})})]}),e.jsx("div",{ref:n,className:"map-container"}),l&&e.jsx(K,{loading:!0}),S&&e.jsxs("div",{className:"click-mode-hint",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"点击地图选择位置"]})]})},Q=({communityName:r,score:o,suggestions:x,blindSpots:l})=>{const s=i=>{switch(i){case"优秀":return"#52c41a";case"良好":return"#1890ff";case"一般":return"#faad14";case"需改善":return"#ff4d4f";default:return"#666"}},n=i=>{const c={高:"#ff4d4f",中:"#faad14",低:"#52c41a"};return e.jsx("span",{className:"priority-tag",style:{backgroundColor:c[i]||"#666"},children:i})};return e.jsxs("div",{className:"report-container",children:[e.jsxs("h2",{children:[r," - 生活圈体检报告"]}),e.jsxs("div",{className:"score-section",children:[e.jsxs("div",{className:"score-circle",style:{borderColor:s(o.level)},children:[e.jsx("span",{className:"score-number",children:o.total}),e.jsx("span",{className:"score-level",children:o.level})]}),e.jsxs("div",{className:"score-detail",children:[e.jsx("p",{children:"综合评分"}),o.blind_spot_penalty>0&&e.jsxs("p",{className:"penalty-note",children:["盲区扣分: -",o.blind_spot_penalty,"分"]})]})]}),e.jsxs("div",{className:"category-scores",children:[e.jsx("h3",{children:"各类设施评分"}),e.jsx("div",{className:"category-grid",children:Object.entries(o.categories).map(([i,c])=>e.jsxs("div",{className:"category-item",children:[e.jsx("span",{className:"category-name",children:i}),e.jsx("div",{className:"category-bar",children:e.jsx("div",{className:"category-fill",style:{width:`${c}%`,backgroundColor:c>=80?"#52c41a":c>=60?"#1890ff":"#ff4d4f"}})}),e.jsx("span",{className:"category-score",children:c})]},i))})]}),x.length>0&&e.jsxs("div",{className:"suggestions-section",children:[e.jsx("h3",{children:"改善建议"}),e.jsx("ul",{className:"suggestions-list",children:x.map((i,c)=>e.jsxs("li",{className:"suggestion-item",children:[n(i.priority),e.jsxs("span",{className:"suggestion-category",children:["[",i.category,"]"]}),e.jsx("span",{className:"suggestion-message",children:i.message})]},c))})]}),l.length>0&&e.jsxs("div",{className:"blind-spots-section",children:[e.jsxs("h3",{children:["服务盲区 (",l.length,"个)"]}),e.jsx("div",{className:"blind-spots-list",children:l.map((i,c)=>e.jsxs("div",{className:"blind-spot-item",children:[e.jsx("span",{className:"blind-spot-icon",children:"⚠️"}),e.jsxs("div",{className:"blind-spot-info",children:[e.jsx("span",{className:"blind-spot-category",children:i.category}),e.jsx("span",{className:"blind-spot-desc",children:i.description})]})]},c))})]})]})},ee=({categories:r})=>{const o=d.useRef(null),x=d.useRef(null);return d.useEffect(()=>{if(!o.current)return;const l=A(o.current);return x.current=l,()=>{l.dispose()}},[]),d.useEffect(()=>{if(!x.current)return;const l=Object.keys(r),s=Object.values(r),n={title:{text:"设施覆盖雷达图",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},radar:{indicator:l.map(i=>({name:i,max:100})),shape:"circle",splitNumber:5,axisName:{color:"#333",fontSize:12},splitLine:{lineStyle:{color:"#ddd"}},splitArea:{show:!0,areaStyle:{color:["rgba(24, 144, 255, 0.1)","rgba(24, 144, 255, 0.2)"]}}},series:[{type:"radar",data:[{value:s,name:"设施覆盖评分",areaStyle:{color:"rgba(24, 144, 255, 0.3)"},lineStyle:{color:"#1890ff",width:2},itemStyle:{color:"#1890ff"}}]}]};x.current.setOption(n)},[r]),d.useEffect(()=>{const l=()=>{var s;(s=x.current)==null||s.resize()};return window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[]),e.jsx("div",{className:"radar-chart-container",children:e.jsx("div",{ref:o,className:"radar-chart"})})},se=({data:r,onTimeChange:o})=>{const[x,l]=d.useState(15),s=[{value:5,label:"5分钟",icon:"🚶",color:"#52c41a"},{value:10,label:"10分钟",icon:"🚶‍♂️",color:"#faad14"},{value:15,label:"15分钟",icon:"🚶‍♀️",color:"#1890ff"}],n=t=>{l(t),o(t)},c=s.map(t=>{var h,j,p;let m=0;return t.value===5?m=((h=r.time5)==null?void 0:h.area)||0:t.value===10?m=((j=r.time10)==null?void 0:j.area)||0:t.value===15&&(m=((p=r.time15)==null?void 0:p.area)||0),{...t,area:m,areaText:m>0?`${(m/1e6).toFixed(2)} km²`:"计算中"}});return e.jsxs("div",{className:"time-comparison",children:[e.jsx("h4",{children:"⏱️ 时间维度对比"}),e.jsx("div",{className:"time-selector",children:s.map(t=>e.jsxs("button",{className:`time-button ${x===t.value?"active":""}`,style:{"--color":t.color},onClick:()=>n(t.value),children:[e.jsx("span",{className:"time-icon",children:t.icon}),e.jsx("span",{className:"time-label",children:t.label})]},t.value))}),e.jsx("div",{className:"area-stats",children:c.map(t=>e.jsxs("div",{className:`area-item ${x===t.value?"active":""}`,children:[e.jsx("div",{className:"area-color",style:{backgroundColor:t.color}}),e.jsxs("div",{className:"area-info",children:[e.jsx("span",{className:"area-time",children:t.label}),e.jsx("span",{className:"area-value",children:t.areaText})]})]},t.value))}),e.jsx("div",{className:"area-chart",children:e.jsx("div",{className:"chart-bars",children:c.map(t=>{const m=Math.max(...c.map(j=>j.area||1)),h=t.area>0?t.area/m*100:0;return e.jsxs("div",{className:"chart-bar-container",children:[e.jsx("div",{className:"chart-bar-label",children:t.label}),e.jsx("div",{className:"chart-bar-track",children:e.jsx("div",{className:"chart-bar-fill",style:{width:`${h}%`,backgroundColor:t.color}})}),e.jsx("div",{className:"chart-bar-value",children:t.areaText})]},t.value)})})})]})},te=({data:r})=>{const o=d.useRef(null),x=d.useRef(null);d.useEffect(()=>{if(!o.current)return;const n=A(o.current);return x.current=n,()=>{n.dispose()}},[]),d.useEffect(()=>{var m,h,j;if(!x.current)return;const n=["5分钟","10分钟","15分钟"],i=[(m=r.time5)!=null&&m.area?r.time5.area/1e6:0,(h=r.time10)!=null&&h.area?r.time10.area/1e6:0,(j=r.time15)!=null&&j.area?r.time15.area/1e6:0],c=["#52c41a","#faad14","#1890ff"],t={title:{text:"等时圈面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:p=>{const f=p[0];return`${f.name}<br/>面积: ${f.value.toFixed(2)} km²`}},xAxis:{type:"category",data:n,axisLabel:{fontSize:12}},yAxis:{type:"value",name:"面积 (km²)",axisLabel:{fontSize:12}},series:[{type:"bar",data:i.map((p,f)=>({value:p,itemStyle:{color:c[f],borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};x.current.setOption(t)},[r]),d.useEffect(()=>{const n=()=>{var i;(i=x.current)==null||i.resize()};return window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[]);const s=(()=>{var i,c;return!((i=r.time5)!=null&&i.area)||!((c=r.time15)!=null&&c.area)?null:((r.time15.area-r.time5.area)/r.time5.area*100).toFixed(1)})();return e.jsxs("div",{className:"area-comparison-container",children:[e.jsx("div",{ref:o,className:"area-chart"}),s&&e.jsxs("div",{className:"growth-info",children:[e.jsx("span",{className:"growth-label",children:"15分钟比5分钟面积增长:"}),e.jsxs("span",{className:"growth-value",children:["+",s,"%"]})]})]})},re=({poiCoverage:r,center:o})=>{const x={医疗:{emoji:"🏥",color:"#ff4d4f"},教育:{emoji:"🏫",color:"#1890ff"},购物:{emoji:"🛒",color:"#52c41a"},养老:{emoji:"👴",color:"#722ed1"},文体:{emoji:"🏃",color:"#13c2c2"},餐饮:{emoji:"🍜",color:"#faad14"}},l=t=>Math.round(t/1.2/60),n=(()=>{const t=[];return Object.entries(r).forEach(([m,h])=>{h.facilities.forEach(j=>{t.push({...j,category:m})})}),t.sort((m,h)=>(m.distance||0)-(h.distance||0))})(),c=(()=>{const t={};return Object.keys(r).forEach(m=>{const h=n.filter(j=>j.category===m);t[m]=h.length>0?h[0]:null}),t})();return e.jsxs("div",{className:"facility-accessibility",children:[e.jsx("h4",{children:"📍 设施可达性分析"}),e.jsxs("div",{className:"nearest-facilities",children:[e.jsx("h5",{children:"各类最近设施"}),e.jsx("div",{className:"nearest-grid",children:Object.entries(c).map(([t,m])=>{const h=x[t]||{emoji:"📍"};return e.jsxs("div",{className:"nearest-item",children:[e.jsx("span",{className:"nearest-icon",children:h.emoji}),e.jsxs("div",{className:"nearest-info",children:[e.jsx("span",{className:"nearest-category",children:t}),m?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"nearest-name",children:m.name}),e.jsxs("span",{className:"nearest-distance",children:[m.distance?`${m.distance}米`:"未知",m.distance&&` (${l(m.distance)}分钟)`]})]}):e.jsx("span",{className:"nearest-none",children:"暂无数据"})]})]},t)})})]}),n.length>0&&e.jsxs("div",{className:"facility-list",children:[e.jsx("h5",{children:"周边设施列表 (前10个)"}),e.jsx("div",{className:"facility-items",children:n.slice(0,10).map((t,m)=>{const h=x[t.category]||{emoji:"📍"};return e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-icon",children:h.emoji}),e.jsxs("div",{className:"facility-info",children:[e.jsx("span",{className:"facility-name",children:t.name}),e.jsx("span",{className:"facility-address",children:t.address||"暂无地址"})]}),e.jsx("div",{className:"facility-distance",children:t.distance&&e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"distance-value",children:[t.distance,"米"]}),e.jsxs("span",{className:"distance-time",children:["步行",l(t.distance),"分钟"]})]})})]},m)})})]}),e.jsxs("div",{className:"accessibility-score",children:[e.jsx("h5",{children:"可达性评分"}),e.jsx("div",{className:"score-items",children:Object.entries(r).map(([t,m])=>{const h=x[t]||{emoji:"📍"},j=m.count>=5?100:m.count>=3?80:m.count>=1?60:30;return e.jsxs("div",{className:"score-item",children:[e.jsx("span",{className:"score-icon",children:h.emoji}),e.jsx("span",{className:"score-category",children:t}),e.jsx("div",{className:"score-bar",children:e.jsx("div",{className:"score-fill",style:{width:`${j}%`,backgroundColor:j>=80?"#52c41a":j>=60?"#1890ff":"#ff4d4f"}})}),e.jsx("span",{className:"score-value",children:j})]},t)})})]})]})},ae=({onCenterSelect:r,currentCenter:o})=>{var h,j;const[x,l]=d.useState(((h=o==null?void 0:o.lng)==null?void 0:h.toString())||"118.7784"),[s,n]=d.useState(((j=o==null?void 0:o.lat)==null?void 0:j.toString())||"32.0663"),[i,c]=d.useState((o==null?void 0:o.name)||"自定义位置"),t=p=>{p.preventDefault();const f=parseFloat(x),b=parseFloat(s);if(isNaN(f)||isNaN(b)){alert("请输入有效的经纬度");return}if(f<73||f>135||b<3||b>53){alert("经纬度超出中国范围");return}r(f,b)},m=()=>{navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{const{longitude:f,latitude:b}=p.coords;l(f.toFixed(6)),n(b.toFixed(6)),c("当前位置"),r(f,b)},p=>{alert("无法获取当前位置，请手动输入"),console.error("获取位置失败:",p)}):alert("浏览器不支持地理定位")};return e.jsxs("div",{className:"custom-center",children:[e.jsx("h4",{children:"📍 自定义中心点"}),e.jsxs("form",{onSubmit:t,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"经度:"}),e.jsx("input",{type:"number",step:"0.000001",value:x,onChange:p=>l(p.target.value),placeholder:"118.7784"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"纬度:"}),e.jsx("input",{type:"number",step:"0.000001",value:s,onChange:p=>n(p.target.value),placeholder:"32.0663"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"名称:"}),e.jsx("input",{type:"text",value:i,onChange:p=>c(p.target.value),placeholder:"自定义位置"})]}),e.jsxs("div",{className:"button-group",children:[e.jsx("button",{type:"submit",className:"apply-button",children:"应用"}),e.jsx("button",{type:"button",className:"location-button",onClick:m,children:"📱 获取当前位置"})]})]}),o&&e.jsxs("div",{className:"current-info",children:[e.jsx("p",{children:"当前中心点:"}),e.jsx("p",{className:"center-name",children:o.name}),e.jsxs("p",{className:"center-coord",children:["(",o.lng.toFixed(4),", ",o.lat.toFixed(4),")"]})]}),e.jsxs("div",{className:"preset-locations",children:[e.jsx("h5",{children:"预设位置"}),e.jsx("div",{className:"preset-list",children:[{name:"南京市中心",lng:118.7969,lat:32.0603},{name:"新街口",lng:118.7874,lat:32.0423},{name:"鼓楼广场",lng:118.7784,lat:32.0663},{name:"夫子庙",lng:118.7894,lat:32.0233}].map(p=>e.jsx("button",{className:"preset-button",onClick:()=>{l(p.lng.toString()),n(p.lat.toString()),c(p.name),r(p.lng,p.lat)},children:p.name},p.name))})]})]})},ne=({history:r})=>{const o=d.useRef(null),x=d.useRef(null),[l,s]=d.useState("score");return d.useEffect(()=>{if(!o.current)return;const n=A(o.current);return x.current=n,()=>{n.dispose()}},[]),d.useEffect(()=>{var i;if(!x.current||r.length===0)return;let n;if(l==="score")n={title:{text:"社区综合评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:c=>{const t=c[0];return`${t.name}<br/>评分: ${t.value}`}},xAxis:{type:"category",data:r.map(c=>c.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"评分",min:0,max:100},series:[{type:"bar",data:r.map(c=>({value:c.score,itemStyle:{color:c.score>=80?"#52c41a":c.score>=60?"#1890ff":"#ff4d4f",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",fontSize:12}}]};else if(l==="area")n={title:{text:"15分钟步行范围面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:c=>{const t=c[0];return`${t.name}<br/>面积: ${t.value.toFixed(2)} km²`}},xAxis:{type:"category",data:r.map(c=>c.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"面积 (km²)"},series:[{type:"bar",data:r.map(c=>({value:c.area/1e6,itemStyle:{color:"#1890ff",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};else{const c=Object.keys(((i=r[0])==null?void 0:i.categories)||{}),t=["#1890ff","#52c41a","#faad14","#ff4d4f","#722ed1"];n={title:{text:"各类设施评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},legend:{bottom:0,data:r.map(m=>m.name)},radar:{indicator:c.map(m=>({name:m,max:100})),shape:"circle",splitNumber:5},series:[{type:"radar",data:r.map((m,h)=>({value:c.map(j=>m.categories[j]||0),name:m.name,lineStyle:{color:t[h%t.length]},areaStyle:{color:t[h%t.length],opacity:.1},itemStyle:{color:t[h%t.length]}}))}]}}x.current.setOption(n)},[r,l]),d.useEffect(()=>{const n=()=>{var i;(i=x.current)==null||i.resize()};return window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[]),r.length<2?e.jsxs("div",{className:"community-comparison",children:[e.jsx("h4",{children:"📊 社区对比"}),e.jsx("p",{className:"comparison-hint",children:"分析至少2个社区后可进行对比"})]}):e.jsxs("div",{className:"community-comparison",children:[e.jsx("h4",{children:"📊 社区对比"}),e.jsxs("div",{className:"metric-selector",children:[e.jsx("button",{className:`metric-button ${l==="score"?"active":""}`,onClick:()=>s("score"),children:"综合评分"}),e.jsx("button",{className:`metric-button ${l==="area"?"active":""}`,onClick:()=>s("area"),children:"覆盖面积"}),e.jsx("button",{className:`metric-button ${l==="categories"?"active":""}`,onClick:()=>s("categories"),children:"各类设施"})]}),e.jsx("div",{ref:o,className:"comparison-chart"}),e.jsx("div",{className:"comparison-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"社区"}),e.jsx("th",{children:"评分"}),e.jsx("th",{children:"等级"}),e.jsx("th",{children:"面积"})]})}),e.jsx("tbody",{children:r.map((n,i)=>e.jsxs("tr",{children:[e.jsx("td",{children:n.name}),e.jsx("td",{className:"score-cell",children:n.score}),e.jsx("td",{children:e.jsx("span",{className:`level-badge level-${n.level}`,children:n.level})}),e.jsxs("td",{children:[(n.area/1e6).toFixed(2)," km²"]})]},i))})]})})]})},F="http://100.77.182.51:8080/api",z=[{lng:118.7784,lat:32.0663,name:"鼓楼区湖南路街道"},{lng:118.7854,lat:32.0553,name:"鼓楼区中央门街道"},{lng:118.8034,lat:32.0683,name:"玄武区新街口街道"},{lng:118.7894,lat:32.0433,name:"秦淮区夫子庙街道"}];function ie(r,o){const{community_name:x,score:l,suggestions:s,blind_spots:n}=r,i=Object.entries(l.categories).map(([h,j])=>{const p=j,f=p>=80?"#52c41a":p>=60?"#1890ff":"#faad14";return`
        <div class="category-item">
          <span class="category-name">${h}</span>
          <div class="category-bar-container">
            <div class="category-bar" style="width: ${p}%; background-color: ${f}"></div>
          </div>
          <span class="category-score">${p}分</span>
        </div>
      `}).join(""),c=s.map(h=>`
      <div class="suggestion-item ${h.priority==="高"?"high-priority":""}">
        <span class="suggestion-priority">[${h.priority}]</span>
        <span class="suggestion-category">${h.category}</span>
        <span class="suggestion-message">${h.message}</span>
      </div>
    `).join(""),t=n.length>0?n.map(h=>`
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
        <span class="score-number">${l.total}</span>
        <span class="score-label">综合评分</span>
      </div>
      <div class="score-info">
        <div class="score-level">评级: ${l.level}</div>
        <div class="score-detail">盲区扣分: -${l.blind_spot_penalty}分</div>
        <div class="score-detail">分析时间: ${new Date().toLocaleString("zh-CN")}</div>
      </div>
    </div>

    <div class="section">
      <h2>📊 各类设施评分</h2>
      ${i}
    </div>

    

    <div class="section">
      <h2>💡 改善建议</h2>
      ${c}
    </div>

    <div class="section">
      <h2>⚠️ 服务盲区</h2>
      ${t}
    </div>

    <div class="report-footer">
      <p>15分钟生活圈智能体检与规划助手 - 基于百度地图开放能力</p>
      <p>报告生成时间: ${new Date().toLocaleString("zh-CN")}</p>
    </div>
  </div>
</body>
</html>
  `}function oe(r,o){const x=ie(r),l=window.open("","_blank");if(!l){alert("请允许弹出窗口以导出报告");return}l.document.write(x),l.document.close(),l.onload=()=>{l.print()}}const y={Home:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),e.jsx("polyline",{points:"9 22 9 12 15 12 15 22"})]}),Clock:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),MapPin:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),AlertTriangle:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),BarChart:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),Play:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})}),Map:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]}),History:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 4v6h6"}),e.jsx("path",{d:"M3.51 15a9 9 0 1 0 2.13-9.36L1 10"})]}),Refresh:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polyline",{points:"23 4 23 10 17 10"}),e.jsx("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),ArrowLeft:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"19",y1:"12",x2:"5",y2:"12"}),e.jsx("polyline",{points:"12 19 5 12 12 5"})]}),Download:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),e.jsx("polyline",{points:"7 10 12 15 17 10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),Activity:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"22 12 18 12 15 21 9 3 6 12 2 12"})}),Layers:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"12 2 2 7 12 12 22 7 12 2"}),e.jsx("polyline",{points:"2 17 12 22 22 17"}),e.jsx("polyline",{points:"2 12 12 17 22 12"})]})};function le(){var w,v;const[r,o]=d.useState(null),[x,l]=d.useState(null),[s,n]=d.useState(null),[i,c]=d.useState(null),[t,m]=d.useState(15),[h,j]=d.useState(!1),[p,f]=d.useState(null),[b,_]=d.useState([]),[M,S]=d.useState(!1);d.useEffect(()=>{z.length>0&&o(z[0])},[]);const L=()=>x||r,$=async()=>{const a=L();if(a){j(!0),f(null);try{const[u,N]=await Promise.all([fetch(`${F}/analysis/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:a.lng,lat:a.lat,community_name:a.name})}),fetch(`${F}/isochrone/multi-time`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:a.lng,lat:a.lat,directions:36})})]);if(!u.ok)throw new Error("分析请求失败");const C=await u.json();if(n(C),N.ok){const k=await N.json();c(k)}_(k=>[C,...k.slice(0,4)])}catch(u){f(u instanceof Error?u.message:"分析过程中出现错误")}finally{j(!1)}}},O=a=>{m(a)},R=(a,u)=>{l({lng:a,lat:u,name:"自定义位置"})},P=()=>{if(!i)return s==null?void 0:s.isochrone;const a=i.layers.find(u=>u.time===t);return a?{boundary_points:a.boundary_points,polygon:a.polygon}:s==null?void 0:s.isochrone},T=()=>{s&&oe(s)},g=b.slice(0,5).map(a=>({name:a.community_name,score:a.score.total,level:a.score.level,categories:a.score.categories,area:a.isochrone.area}));return e.jsxs("div",{className:"app-container",children:[e.jsx("header",{className:"app-header",children:e.jsxs("div",{className:"header-content",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("h1",{children:[e.jsx(y.Home,{}),"15分钟生活圈智能体检与规划助手"]}),e.jsx("p",{children:"基于百度地图的社区生活圈分析工具"})]}),e.jsx("div",{className:"header-right",children:e.jsxs("a",{href:"../",className:"back-button",children:[e.jsx(y.ArrowLeft,{}),"返回首页"]})})]})}),e.jsxs("main",{className:"app-main",children:[e.jsxs("div",{className:"controls-panel",children:[e.jsxs("div",{className:"control-group",children:[e.jsx("label",{children:"选择社区："}),e.jsx("select",{value:r?`${r.lng},${r.lat}`:"",onChange:a=>{const[u,N]=a.target.value.split(",").map(Number),C=z.find(k=>k.lng===u&&k.lat===N);o(C||null),l(null)},children:z.map((a,u)=>e.jsx("option",{value:`${a.lng},${a.lat}`,children:a.name},u))})]}),e.jsx("button",{className:"analyze-button",onClick:$,disabled:h||!r&&!x,children:h?e.jsxs(e.Fragment,{children:[e.jsx(y.Refresh,{}),"分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(y.Play,{}),"开始体检"]})}),e.jsxs("button",{className:"analyze-button secondary",onClick:()=>S(!M),children:[e.jsx(y.MapPin,{}),M?"隐藏自定义位置":"自定义位置"]}),s&&e.jsxs("button",{className:"analyze-button secondary",onClick:T,children:[e.jsx(y.Download,{}),"导出PDF"]})]}),p&&e.jsxs("div",{className:"error-banner",children:[e.jsx(y.AlertTriangle,{}),e.jsx("span",{children:p}),e.jsxs("button",{onClick:$,children:[e.jsx(y.Refresh,{}),"重试"]})]}),e.jsxs("div",{className:"main-content",children:[e.jsxs("div",{className:"map-panel",children:[M&&e.jsx(ae,{onCenterSelect:R,currentCenter:L()}),e.jsx(X,{center:L(),isochrone:P(),poiCoverage:s==null?void 0:s.poi_coverage,blindSpots:s==null?void 0:s.blind_spots,loading:h})]}),e.jsx("div",{className:"data-panel",children:s?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"score-card",children:[e.jsxs("div",{className:"score-header",children:[e.jsx(y.Activity,{}),e.jsx("span",{children:"综合评分"})]}),e.jsx("div",{className:"score-value",children:s.score.total}),e.jsx("div",{className:"score-level",children:s.score.level})]}),e.jsxs("div",{className:"metrics-grid",children:[e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.Map,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[s.isochrone.area.toFixed(2)," km²"]}),e.jsx("div",{className:"metric-label",children:"覆盖面积"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.Layers,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:s.poi_coverage?Object.values(s.poi_coverage).reduce((a,u)=>a+u.count,0):0}),e.jsx("div",{className:"metric-label",children:"周边设施"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.AlertTriangle,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:((w=s.blind_spots)==null?void 0:w.length)||0}),e.jsx("div",{className:"metric-label",children:"服务盲区"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(y.Clock,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[t/60," 分钟"]}),e.jsx("div",{className:"metric-label",children:"步行时间"})]})]})]}),((v=s.poi_coverage)==null?void 0:v.categories)&&e.jsxs("div",{className:"facility-summary",children:[e.jsxs("h3",{children:[e.jsx(y.BarChart,{}),"设施分布"]}),e.jsx("div",{className:"facility-list",children:Object.entries(s.poi_coverage.categories).map(([a,u])=>e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-name",children:a}),e.jsx("span",{className:"facility-count",children:u})]},a))})]})]}):e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:e.jsx(y.Map,{})}),e.jsx("h3",{children:"开始分析"}),e.jsx("p",{children:'选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告'}),e.jsxs("div",{className:"feature-list",children:[e.jsxs("div",{className:"feature-item",children:[e.jsx(y.Clock,{}),e.jsx("span",{children:"计算5/10/15分钟步行范围"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(y.MapPin,{}),e.jsx("span",{children:"分析周边设施覆盖"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(y.AlertTriangle,{}),e.jsx("span",{children:"识别服务盲区"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(y.BarChart,{}),e.jsx("span",{children:"生成体检报告"})]})]})]})})]}),s&&e.jsxs("div",{className:"detail-section",children:[i&&e.jsx("div",{className:"detail-card",children:e.jsx(se,{data:{time5:i.layers.find(a=>a.time===300),time10:i.layers.find(a=>a.time===600),time15:i.layers.find(a=>a.time===900)},onTimeChange:O})}),i&&e.jsx("div",{className:"detail-card",children:e.jsx(te,{data:{time5:i.layers.find(a=>a.time===300),time10:i.layers.find(a=>a.time===600),time15:i.layers.find(a=>a.time===900)}})}),e.jsx("div",{className:"detail-card full-width",children:e.jsx(Q,{communityName:s.community_name,score:s.score,suggestions:s.suggestions,blindSpots:s.blind_spots})}),s.poi_coverage&&L()&&e.jsx("div",{className:"detail-card",children:e.jsx(re,{poiCoverage:s.poi_coverage,center:L()})}),e.jsx("div",{className:"detail-card",children:e.jsx(ee,{categories:s.score.categories})})]}),b.length>1&&e.jsx("div",{className:"comparison-section",children:e.jsx(ne,{history:g})}),b.length>1&&e.jsxs("div",{className:"history-section",children:[e.jsxs("h3",{children:[e.jsx(y.History,{}),"分析历史"]}),e.jsx("div",{className:"history-list",children:b.slice(1).map((a,u)=>e.jsxs("div",{className:"history-item",children:[e.jsx("span",{className:"history-name",children:a.community_name}),e.jsxs("span",{className:"history-score",children:[a.score.total,"分"]}),e.jsx("span",{className:"history-level",children:a.score.level})]},u))})]})]}),e.jsx("footer",{className:"app-footer",children:e.jsxs("div",{className:"footer-content",children:[e.jsx("p",{children:"15分钟生活圈智能体检与规划助手 © 2025"}),e.jsx("p",{className:"footer-tech",children:"技术栈：React + FastAPI + 百度地图API + NetworkX"})]})})]})}B.createRoot(document.getElementById("root")).render(e.jsx(G.StrictMode,{children:e.jsx(le,{})}));
