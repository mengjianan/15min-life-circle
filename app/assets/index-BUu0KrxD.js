import{r as d,a as ae,R as le}from"./react-vendor-nf7bT_Uh.js";import{i as ee}from"./echarts-vendor-BBmD_jO2.js";(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))l(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&l(c)}).observe(document,{childList:!0,subtree:!0});function p(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function l(t){if(t.ep)return;t.ep=!0;const i=p(t);fetch(t.href,i)}})();var re={exports:{}},H={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ce=d,de=Symbol.for("react.element"),he=Symbol.for("react.fragment"),xe=Object.prototype.hasOwnProperty,pe=ce.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,me={key:!0,ref:!0,__self:!0,__source:!0};function ie(s,o,p){var l,t={},i=null,c=null;p!==void 0&&(i=""+p),o.key!==void 0&&(i=""+o.key),o.ref!==void 0&&(c=o.ref);for(l in o)xe.call(o,l)&&!me.hasOwnProperty(l)&&(t[l]=o[l]);if(s&&s.defaultProps)for(l in o=s.defaultProps,o)t[l]===void 0&&(t[l]=o[l]);return{$$typeof:de,type:s,key:i,ref:c,props:t,_owner:pe.current}}H.Fragment=he;H.jsx=ie;H.jsxs=ie;re.exports=H;var e=re.exports,X={},se=ae;X.createRoot=se.createRoot,X.hydrateRoot=se.hydrateRoot;const ge=({loading:s,message:o="加载中..."})=>s?e.jsx("div",{className:"loading-overlay",children:e.jsxs("div",{className:"loading-content",children:[e.jsxs("div",{className:"loading-spinner",children:[e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"})]}),e.jsx("p",{className:"loading-message",children:o}),e.jsx("p",{className:"loading-submessage",children:"正在调用百度地图API计算等时圈..."})]})}):null,Q="http://100.77.182.51:8080/api",A=[{lng:118.7784,lat:32.0663,name:"鼓楼区湖南路街道"},{lng:118.7854,lat:32.0553,name:"鼓楼区中央门街道"},{lng:118.8034,lat:32.0683,name:"玄武区新街口街道"},{lng:118.7894,lat:32.0433,name:"秦淮区夫子庙街道"}],te=({center:s,isochrone:o,poiCoverage:p,blindSpots:l,multiTimeData:t,loading:i=!1,onCenterChange:c})=>{const a=d.useRef(null),n=d.useRef(null),g=d.useRef([]),[h,j]=d.useState(!1),[x,C]=d.useState(null),[M,D]=d.useState(!0),[$,U]=d.useState(!0),[W,R]=d.useState(!0),[E,F]=d.useState(!1),I=d.useCallback(()=>new Promise((u,m)=>{const f=()=>{const v=window.BMap;v&&v.Map?u():setTimeout(f,100)};f(),setTimeout(()=>m(new Error("百度地图API加载超时")),1e4)}),[]);d.useEffect(()=>{let u=!0;return(async()=>{try{if(await I(),!u||!a.current||n.current)return;const f=window.BMap,v=new f.Map(a.current),N=new f.Point(118.7969,32.0603);v.centerAndZoom(N,14),v.enableScrollWheelZoom(),v.addControl(new f.NavigationControl),v.addControl(new f.ScaleControl),v.addControl(new f.OverviewMapControl),v.addEventListener("click",b=>{E&&c&&c(b.point.lng,b.point.lat)}),n.current=v,u&&j(!0)}catch(f){console.error("地图初始化失败:",f),u&&C("地图加载失败，请刷新页面重试")}})(),()=>{u=!1}},[I,E,c]),d.useEffect(()=>{if(h&&n.current&&s){const u=window.BMap,m=new u.Point(s.lng,s.lat);n.current.panTo(m),n.current.setZoom(14)}},[s,h]),d.useEffect(()=>{if(h&&n.current){const u=n.current,m=window.BMap;if(u.clearOverlays(),t&&t.layers){const f={300:"#52c41a",600:"#faad14",900:"#1890ff"};t.layers.forEach(v=>{if(v.boundary_points&&v.boundary_points.length>0){const N=v.boundary_points.map(_=>new m.Point(_.lng,_.lat)),b=f[v.time]||"#667eea",L=new m.Polygon(N,{strokeColor:b,strokeWeight:3,strokeOpacity:.8,fillColor:b,fillOpacity:.08});u.addOverlay(L)}})}else if(o&&o.boundary_points&&o.boundary_points.length>0){const f=o.boundary_points.map(N=>new m.Point(N.lng,N.lat)),v=new m.Polygon(f,{strokeColor:"#667eea",strokeWeight:2,strokeOpacity:.8,fillColor:"#667eea",fillOpacity:.15});u.addOverlay(v)}if(s){const f=new m.Point(s.lng,s.lat),v=new m.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#667eea" stroke="white" stroke-width="3"/><circle cx="16" cy="16" r="6" fill="white"/></svg>'),new m.Size(32,32),{anchor:new m.Size(16,16)}),N=new m.Marker(f,{icon:v});u.addOverlay(N);const b=new m.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #333; margin-bottom: 4px;">'+s.name+'</div><div style="font-size: 12px; color: #666;">经度: '+s.lng.toFixed(4)+", 纬度: "+s.lat.toFixed(4)+"</div></div>",{width:220,height:60});N.addEventListener("click",()=>{u.openInfoWindow(b,f)})}if($&&p&&Object.entries(p).forEach(([f,v])=>{if(v.facilities&&v.facilities.length>0){const b={医疗:"#ff4d4f",教育:"#1890ff",购物:"#52c41a",养老:"#722ed1",文体:"#fa8c16",餐饮:"#eb2f96"}[f]||"#666";v.facilities.forEach(L=>{if(L.location){const _=new m.Point(L.location.lng,L.location.lat),O=new m.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="'+b+'" stroke="white" stroke-width="2"/></svg>'),new m.Size(20,20),{anchor:new m.Size(10,10)}),z=new m.Marker(_,{icon:O});u.addOverlay(z);const r=new m.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #333;">'+L.name+'</div><div style="font-size: 12px; color: '+b+'; margin-top: 4px;">'+f+"</div>"+(L.address?'<div style="font-size: 11px; color: #999; margin-top: 2px;">'+L.address+"</div>":"")+(L.distance?'<div style="font-size: 11px; color: #666; margin-top: 2px;">距离: '+L.distance+"米</div>":"")+"</div>",{width:250,height:80});z.addEventListener("click",()=>{u.openInfoWindow(r,_)})}})}}),W&&l&&l.length>0&&l.forEach((f,v)=>{if(f.center){const N=new m.Point(f.center.lng,f.center.lat),b=new m.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" fill="#ff4d4f" stroke="white" stroke-width="1.5"/><text x="12" y="18" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text></svg>'),new m.Size(24,24),{anchor:new m.Size(12,24)}),L=new m.Marker(N,{icon:b});u.addOverlay(L);const _=new m.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #ff4d4f;">服务盲区 #'+(v+1)+'</div><div style="font-size: 12px; color: #333; margin-top: 4px;">类别: '+(f.category||"未知")+'</div><div style="font-size: 11px; color: #666; margin-top: 2px;">'+(f.description||"该区域缺少相关设施覆盖")+"</div></div>",{width:250,height:80});L.addEventListener("click",()=>{u.openInfoWindow(_,N)})}}),$&&s&&p){const f=new m.Point(s.lng,s.lat);Object.entries(p).forEach(([v,N])=>{N.facilities&&N.facilities.length>0&&N.facilities.forEach(b=>{if(b.location){const L=new m.Point(b.location.lng,b.location.lat),_=new m.Polyline([f,L],{strokeColor:"#1890ff",strokeWeight:2,strokeStyle:"dashed",strokeOpacity:.6,enableClicking:!0});u.addOverlay(_),_.addEventListener("click",()=>{const O=(s.lng+b.location.lng)/2,z=(s.lat+b.location.lat)/2,r=new m.Point(O,z),w=b.distance||"未知",y=b.walkTime||"未知",k=new m.InfoWindow('<div style="padding: 10px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><h4 style="margin: 0 0 8px 0; color: #1890ff;">路线信息</h4><p style="margin: 4px 0;"><strong>目的地：</strong>'+b.name+'</p><p style="margin: 4px 0;"><strong>类别：</strong>'+v+'</p><p style="margin: 4px 0;"><strong>距离：</strong>'+w+'米</p><p style="margin: 4px 0;"><strong>步行时间：</strong>'+y+"分钟</p></div>",{width:220,height:120});u.openInfoWindow(k,r)})}})})}}},[h,o,s,p,l,t,$,W]),d.useEffect(()=>{if(!h||!s||!M){if(g.current.length>0){const v=n.current;v&&g.current.forEach(N=>{try{v.removeOverlay(N)}catch{}}),g.current=[]}return}const u=n.current;if(!u)return;const m=window.BMap;(async()=>{try{const v=[0,45,90,135,180,225,270,315],N=.015,b=v.map(async O=>{const z=O*Math.PI/180,r=s.lng+N*Math.sin(z),w=s.lat+N*Math.cos(z);try{const y=await fetch(`${Q}/graph/route`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin_lng:s.lng,origin_lat:s.lat,dest_lng:r,dest_lat:w})});if(y.ok)return(await y.json()).features||[]}catch(y){console.error("获取路线失败:",y)}return[]});(await Promise.all(b)).flat().forEach(O=>{const z=O.geometry,r=O.properties;if(z.type==="LineString"){const w=z.coordinates.map(P=>new m.Point(P[0],P[1]));let y="#1890ff";r.traffic_status==="畅通"?y="#52c41a":r.traffic_status==="缓慢"?y="#faad14":r.traffic_status==="拥堵"&&(y="#ff4d4f");const k=new m.Polyline(w,{strokeColor:y,strokeWeight:3,strokeOpacity:.7,enableClicking:!0});u.addOverlay(k),g.current.push(k),k.addEventListener("click",()=>{const P=Math.floor(w.length/2),B=w[P],V=new m.InfoWindow(`<div style="padding: 10px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">
                  <h4 style="margin: 0 0 8px 0; color: #1890ff;">路段信息</h4>
                  <p style="margin: 4px 0;"><strong>距离：</strong>${r.distance_text||"未知"}</p>
                  <p style="margin: 4px 0;"><strong>时间：</strong>${r.duration_text||"未知"}</p>
                  <p style="margin: 4px 0;"><strong>道路：</strong>${r.road_name||"未知"}</p>
                </div>`,{width:200,height:100});u.openInfoWindow(V,B)})}})}catch(v){console.error("绘制路线失败:",v)}})()},[h,s,M]);const T=d.useCallback(()=>{F(u=>!u)},[]),Y=d.useCallback(()=>{D(u=>!u)},[]),G=d.useCallback(()=>{U(u=>!u)},[]),J=d.useCallback(()=>{R(u=>!u)},[]);return x?e.jsxs("div",{className:"map-error",children:[e.jsx("div",{className:"map-error-icon",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})}),e.jsx("p",{children:x}),e.jsx("button",{onClick:()=>window.location.reload(),children:"刷新页面"})]}):e.jsxs("div",{className:"map-wrapper",children:[e.jsxs("div",{className:"map-controls",children:[e.jsx("button",{className:`map-control-btn ${E?"active":""}`,onClick:T,title:E?"关闭点击选点":"开启点击选点",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]})}),e.jsx("button",{className:`map-control-btn ${M?"active":""}`,onClick:Y,title:M?"隐藏路网":"显示路网",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]})}),e.jsx("button",{className:`map-control-btn ${$?"active":""}`,onClick:G,title:$?"隐藏设施":"显示设施",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]})}),e.jsx("button",{className:`map-control-btn ${W?"active":""}`,onClick:J,title:W?"隐藏盲区":"显示盲区",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})})]}),e.jsx("div",{ref:a,className:"map-container"}),i&&e.jsx(ge,{loading:!0}),E&&e.jsxs("div",{className:"click-mode-hint",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"点击地图选择位置"]})]})},ne={医疗:({size:s=20})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M22 12h-4l-3 9L9 3l-3 9H2"})}),教育:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","stroke-linejoin":"round",children:[e.jsx("path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"}),e.jsx("path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"})]}),购物:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"9",cy:"21",r:"1"}),e.jsx("circle",{cx:"20",cy:"21",r:"1"}),e.jsx("path",{d:"M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"})]}),养老:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),文体:({size:s=20})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})}),餐饮:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 8h1a4 4 0 0 1 0 8h-1"}),e.jsx("path",{d:"M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"}),e.jsx("line",{x1:"6",y1:"1",x2:"6",y2:"4"}),e.jsx("line",{x1:"10",y1:"1",x2:"10",y2:"4"}),e.jsx("line",{x1:"14",y1:"1",x2:"14",y2:"4"})]}),综合:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polygon",{points:"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"})]})},je={Warning:({size:s=24})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})},q=s=>({医疗:"#ef4444",教育:"#3b82f6",购物:"#22c55e",养老:"#8b5cf6",文体:"#06b6d4",餐饮:"#f59e0b",综合:"#6b7280"})[s]||"#6b7280",K=s=>({医疗:"#fef2f2",教育:"#eff6ff",购物:"#f0fdf4",养老:"#f5f3ff",文体:"#ecfeff",餐饮:"#fffbeb",综合:"#f9fafb"})[s]||"#f9fafb",ue=({communityName:s,score:o,suggestions:p,blindSpots:l,poiCoverage:t,isochrone:i})=>{var g,h;const c=j=>{switch(j){case"优秀":return"#52c41a";case"良好":return"#1890ff";case"一般":return"#faad14";case"需改善":return"#ff4d4f";default:return"#666"}},a=j=>{const x={高:"#ff4d4f",中:"#faad14",低:"#52c41a"};return e.jsx("span",{className:"priority-tag",style:{backgroundColor:x[j]||"#666"},children:j})},n=j=>!t||!t[j]?0:t[j].count||0;return e.jsxs("div",{className:"report-container",children:[e.jsxs("h2",{children:[s,"15分钟生活圈体检报告"]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"一、社区基础信息"}),e.jsx("div",{className:"report-table",children:e.jsx("table",{children:e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"社区名称"}),e.jsx("td",{children:s}),e.jsx("td",{className:"label",children:"所属街道"}),e.jsxs("td",{children:[s,"街道"]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"社区类型"}),e.jsx("td",{children:"混合型"}),e.jsx("td",{className:"label",children:"建成年代"}),e.jsx("td",{children:"约2000年"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"社区面积"}),e.jsxs("td",{children:[((g=i==null?void 0:i.area)==null?void 0:g.toFixed(2))||"0.00"," km²"]}),e.jsx("td",{className:"label",children:"常住人口"}),e.jsx("td",{children:"约5000人"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"中心点坐标"}),e.jsx("td",{colSpan:3,children:"经度, 纬度"})]})]})})})]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"二、体检方法与口径说明"}),e.jsxs("div",{className:"report-content",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"体检范围："}),"以社区中心点为起点，基于真实步行路网，计算15分钟步行可达范围，同时生成5分钟、10分钟、15分钟三层等时圈。"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"设施分类："}),"按民生需求分为七大类：医疗、教育、购物、养老、餐饮、交通、休闲。"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"数据来源："}),"百度地图开放平台（地理编码、POI检索、路径规划）。"]})]})]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"三、15分钟步行等时圈体检"}),e.jsx("div",{className:"report-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"指标"}),e.jsx("th",{children:"5分钟"}),e.jsx("th",{children:"10分钟"}),e.jsx("th",{children:"15分钟"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"覆盖面积"}),e.jsxs("td",{children:[i!=null&&i.area?(i.area*.2).toFixed(2):"0.00"," km²"]}),e.jsxs("td",{children:[i!=null&&i.area?(i.area*.5).toFixed(2):"0.00"," km²"]}),e.jsxs("td",{children:[((h=i==null?void 0:i.area)==null?void 0:h.toFixed(2))||"0.00"," km²"]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"最远可达距离"}),e.jsx("td",{children:"400m"}),e.jsx("td",{children:"800m"}),e.jsx("td",{children:"1200m"})]})]})]})})]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"四、民生设施覆盖体检"}),e.jsx("div",{className:"report-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"设施类别"}),e.jsx("th",{children:"圈内数量"}),e.jsx("th",{children:"达标情况"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"医疗设施"}),e.jsx("td",{children:n("医疗")}),e.jsx("td",{children:n("医疗")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"教育设施"}),e.jsx("td",{children:n("教育")}),e.jsx("td",{children:n("教育")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"购物设施"}),e.jsx("td",{children:n("购物")}),e.jsx("td",{children:n("购物")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"养老设施"}),e.jsx("td",{children:n("养老")}),e.jsx("td",{children:n("养老")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"餐饮设施"}),e.jsx("td",{children:n("餐饮")}),e.jsx("td",{children:n("餐饮")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"交通设施"}),e.jsx("td",{children:n("交通")}),e.jsx("td",{children:n("交通")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"休闲设施"}),e.jsx("td",{children:n("文体")}),e.jsx("td",{children:n("文体")>0?"达标":"不达标"})]})]})]})})]}),l.length>0&&e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"五、服务盲区体检"}),e.jsx("div",{className:"blind-spots-list",children:l.map((j,x)=>e.jsxs("div",{className:"blind-spot-item",children:[e.jsx("span",{className:"blind-spot-icon",children:e.jsx(je.Warning,{size:18})}),e.jsxs("div",{className:"blind-spot-info",children:[e.jsx("span",{className:"blind-spot-category",children:j.category}),e.jsx("span",{className:"blind-spot-desc",children:j.description})]})]},x))})]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"六、社区生活圈综合评分"}),e.jsxs("div",{className:"score-section",children:[e.jsxs("div",{className:"score-circle",style:{borderColor:c(o.level)},children:[e.jsx("span",{className:"score-number",children:o.total}),e.jsx("span",{className:"score-level",children:o.level})]}),e.jsxs("div",{className:"score-detail",children:[e.jsx("p",{children:"综合评分"}),o.blind_spot_penalty>0&&e.jsxs("p",{className:"penalty-note",children:["盲区扣分: -",o.blind_spot_penalty,"分"]})]})]}),e.jsxs("div",{className:"category-scores",children:[e.jsx("h4",{children:"分项评分"}),e.jsx("div",{className:"category-grid",children:Object.entries(o.categories).map(([j,x])=>e.jsxs("div",{className:"category-item",children:[e.jsx("span",{className:"category-name",children:j}),e.jsx("div",{className:"category-bar",children:e.jsx("div",{className:"category-fill",style:{width:`${x}%`,backgroundColor:x>=80?"#52c41a":x>=60?"#1890ff":"#ff4d4f"}})}),e.jsx("span",{className:"category-score",children:x})]},j))})]})]}),p.length>0&&e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"七、问题诊断与规划建议"}),e.jsxs("div",{className:"suggestions-section",children:[e.jsx("h4",{children:"问题清单"}),e.jsx("ul",{className:"suggestions-list",children:p.map((j,x)=>e.jsxs("li",{className:"suggestion-item",children:[a(j.priority),e.jsxs("span",{className:"suggestion-category",children:["[",j.category,"]"]}),e.jsx("span",{className:"suggestion-message",children:j.message})]},x))})]})]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"八、报告结论"}),e.jsx("div",{className:"report-content conclusion",children:e.jsxs("p",{children:[s,"15分钟生活圈整体得分为",o.total,"分，处于",o.level,"水平。 共识别服务盲区",l.length,"处，主要涉及",l.map(j=>j.category).join("、"),"等设施。 建议优先补建缺失设施，优化服务覆盖。"]})})]})]})},fe=({categories:s})=>{const o=d.useRef(null),p=d.useRef(null);return d.useEffect(()=>{if(!o.current)return;const l=ee(o.current);return p.current=l,()=>{l.dispose()}},[]),d.useEffect(()=>{if(!p.current)return;const l=Object.keys(s),t=Object.values(s),i={title:{text:"设施覆盖雷达图",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},radar:{indicator:l.map(c=>({name:c,max:100})),shape:"circle",splitNumber:5,axisName:{color:"#333",fontSize:12},splitLine:{lineStyle:{color:"#ddd"}},splitArea:{show:!0,areaStyle:{color:["rgba(24, 144, 255, 0.1)","rgba(24, 144, 255, 0.2)"]}}},series:[{type:"radar",data:[{value:t,name:"设施覆盖评分",areaStyle:{color:"rgba(24, 144, 255, 0.3)"},lineStyle:{color:"#1890ff",width:2},itemStyle:{color:"#1890ff"}}]}]};p.current.setOption(i)},[s]),d.useEffect(()=>{const l=()=>{var t;(t=p.current)==null||t.resize()};return window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[]),e.jsx("div",{className:"radar-chart-container",children:e.jsx("div",{ref:o,className:"radar-chart"})})},ve=({data:s,onTimeChange:o})=>{const[p,l]=d.useState(15),t=[{value:5,label:"5分钟",color:"#52c41a"},{value:10,label:"10分钟",color:"#faad14"},{value:15,label:"15分钟",color:"#1890ff"}],i=n=>{l(n),o(n)},a=t.map(n=>{var h,j,x;let g=0;return n.value===5?g=((h=s.time5)==null?void 0:h.area)||0:n.value===10?g=((j=s.time10)==null?void 0:j.area)||0:n.value===15&&(g=((x=s.time15)==null?void 0:x.area)||0),{...n,area:g,areaText:g>0?`${(g/1e6).toFixed(2)} km²`:"计算中"}});return e.jsxs("div",{className:"time-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),"时间维度对比"]}),e.jsx("div",{className:"time-selector",children:t.map(n=>e.jsxs("button",{className:`time-button ${p===n.value?"active":""}`,onClick:()=>i(n.value),children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",style:{width:20,height:20,color:n.color},children:e.jsx("path",{d:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"})}),e.jsx("span",{className:"time-label",children:n.label})]},n.value))}),e.jsx("div",{className:"area-stats",children:a.map(n=>e.jsxs("div",{className:`area-item ${p===n.value?"active":""}`,children:[e.jsx("div",{className:"area-color",style:{backgroundColor:n.color}}),e.jsxs("div",{className:"area-info",children:[e.jsx("span",{className:"area-time",children:n.label}),e.jsx("span",{className:"area-value",children:n.areaText})]})]},n.value))}),e.jsx("div",{className:"area-chart",children:e.jsx("div",{className:"chart-bars",children:a.map(n=>{const g=Math.max(...a.map(j=>j.area||1)),h=n.area>0?n.area/g*100:0;return e.jsxs("div",{className:"chart-bar-container",children:[e.jsx("div",{className:"chart-bar-label",children:n.label}),e.jsx("div",{className:"chart-bar-track",children:e.jsx("div",{className:"chart-bar-fill",style:{width:`${h}%`,backgroundColor:n.color}})}),e.jsx("div",{className:"chart-bar-value",children:n.areaText})]},n.value)})})})]})},we=({data:s})=>{const o=d.useRef(null),p=d.useRef(null);d.useEffect(()=>{if(!o.current)return;const i=ee(o.current);return p.current=i,()=>{i.dispose()}},[]),d.useEffect(()=>{var g,h,j;if(!p.current)return;const i=["5分钟","10分钟","15分钟"],c=[(g=s.time5)!=null&&g.area?s.time5.area/1e6:0,(h=s.time10)!=null&&h.area?s.time10.area/1e6:0,(j=s.time15)!=null&&j.area?s.time15.area/1e6:0],a=["#52c41a","#faad14","#1890ff"],n={title:{text:"等时圈面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:x=>{const C=x[0];return`${C.name}<br/>面积: ${C.value.toFixed(2)} km²`}},xAxis:{type:"category",data:i,axisLabel:{fontSize:12}},yAxis:{type:"value",name:"面积 (km²)",axisLabel:{fontSize:12}},series:[{type:"bar",data:c.map((x,C)=>({value:x,itemStyle:{color:a[C],borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};p.current.setOption(n)},[s]),d.useEffect(()=>{const i=()=>{var c;(c=p.current)==null||c.resize()};return window.addEventListener("resize",i),()=>window.removeEventListener("resize",i)},[]);const t=(()=>{var c,a;return!((c=s.time5)!=null&&c.area)||!((a=s.time15)!=null&&a.area)?null:((s.time15.area-s.time5.area)/s.time5.area*100).toFixed(1)})();return e.jsxs("div",{className:"area-comparison-container",children:[e.jsx("div",{ref:o,className:"area-chart"}),t&&e.jsxs("div",{className:"growth-info",children:[e.jsx("span",{className:"growth-label",children:"15分钟比5分钟面积增长:"}),e.jsxs("span",{className:"growth-value",children:["+",t,"%"]})]})]})},ye=({poiCoverage:s})=>{const o=a=>Math.round(a/1.2/60),l=(()=>{const a=[];return Object.entries(s).forEach(([n,g])=>{g.facilities.forEach(h=>{a.push({...h,category:n})})}),a.sort((n,g)=>(n.distance||0)-(g.distance||0))})(),i=(()=>{const a={};return Object.keys(s).forEach(n=>{const g=l.filter(h=>h.category===n);a[n]=g.length>0?g[0]:null}),a})(),c=(a,n=20)=>{const g=ne[a]||ne.综合;return e.jsx(g,{size:n})};return e.jsxs("div",{className:"facility-accessibility",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"设施可达性分析"]}),e.jsxs("div",{className:"nearest-facilities",children:[e.jsx("h5",{children:"各类最近设施"}),e.jsx("div",{className:"nearest-grid",children:Object.entries(i).map(([a,n])=>{const g=q(a),h=K(a);return e.jsxs("div",{className:"nearest-item",children:[e.jsx("span",{className:"nearest-icon",style:{backgroundColor:h,color:g},children:c(a)}),e.jsxs("div",{className:"nearest-info",children:[e.jsx("span",{className:"nearest-category",children:a}),n?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"nearest-name",children:n.name}),e.jsxs("span",{className:"nearest-distance",children:[n.distance?`${n.distance}米`:"未知",n.distance&&` (${o(n.distance)}分钟)`]})]}):e.jsx("span",{className:"nearest-none",children:"暂无数据"})]})]},a)})})]}),l.length>0&&e.jsxs("div",{className:"facility-list",children:[e.jsx("h5",{children:"周边设施列表 (前10个)"}),e.jsx("div",{className:"facility-items",children:l.slice(0,10).map((a,n)=>{const g=q(a.category),h=K(a.category);return e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-icon",style:{backgroundColor:h,color:g},children:c(a.category)}),e.jsxs("div",{className:"facility-info",children:[e.jsx("span",{className:"facility-name",children:a.name}),e.jsx("span",{className:"facility-address",children:a.address||"暂无地址"})]}),e.jsx("div",{className:"facility-distance",children:a.distance&&e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"distance-value",children:[a.distance,"米"]}),e.jsxs("span",{className:"distance-time",children:["步行",o(a.distance),"分钟"]})]})})]},n)})})]}),e.jsxs("div",{className:"accessibility-score",children:[e.jsx("h5",{children:"可达性评分"}),e.jsx("div",{className:"score-items",children:Object.entries(s).map(([a,n])=>{const g=q(a),h=K(a),j=n.count>=5?100:n.count>=3?80:n.count>=1?60:30;return e.jsxs("div",{className:"score-item",children:[e.jsx("span",{className:"score-icon",style:{backgroundColor:h,color:g},children:c(a)}),e.jsx("span",{className:"score-category",children:a}),e.jsx("div",{className:"score-bar",children:e.jsx("div",{className:"score-fill",style:{width:`${j}%`,backgroundColor:j>=80?"#22c55e":j>=60?"#3b82f6":"#ef4444"}})}),e.jsx("span",{className:"score-value",children:j})]},a)})})]})]})},be=({onCenterSelect:s,currentCenter:o})=>{var h,j;const[p,l]=d.useState(((h=o==null?void 0:o.lng)==null?void 0:h.toString())||"118.7784"),[t,i]=d.useState(((j=o==null?void 0:o.lat)==null?void 0:j.toString())||"32.0663"),[c,a]=d.useState((o==null?void 0:o.name)||"自定义位置"),n=x=>{x.preventDefault();const C=parseFloat(p),M=parseFloat(t);if(isNaN(C)||isNaN(M)){alert("请输入有效的经纬度");return}if(C<73||C>135||M<3||M>53){alert("经纬度超出中国范围");return}s(C,M)},g=()=>{navigator.geolocation?navigator.geolocation.getCurrentPosition(x=>{const{longitude:C,latitude:M}=x.coords;l(C.toFixed(6)),i(M.toFixed(6)),a("当前位置"),s(C,M)},x=>{alert("无法获取当前位置，请手动输入"),console.error("获取位置失败:",x)}):alert("浏览器不支持地理定位")};return e.jsxs("div",{className:"custom-center",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"自定义中心点"]}),e.jsxs("form",{onSubmit:n,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"经度:"}),e.jsx("input",{type:"number",step:"0.000001",value:p,onChange:x=>l(x.target.value),placeholder:"118.7784"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"纬度:"}),e.jsx("input",{type:"number",step:"0.000001",value:t,onChange:x=>i(x.target.value),placeholder:"32.0663"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"名称:"}),e.jsx("input",{type:"text",value:c,onChange:x=>a(x.target.value),placeholder:"自定义位置"})]}),e.jsxs("div",{className:"button-group",children:[e.jsx("button",{type:"submit",className:"apply-button",children:"应用"}),e.jsxs("button",{type:"button",className:"location-button",onClick:g,children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("circle",{cx:"12",cy:"12",r:"4"}),e.jsx("line",{x1:"4.93",y1:"4.93",x2:"9.17",y2:"9.17"}),e.jsx("line",{x1:"14.83",y1:"14.83",x2:"19.07",y2:"19.07"}),e.jsx("line",{x1:"14.83",y1:"9.17",x2:"19.07",y2:"4.93"}),e.jsx("line",{x1:"4.93",y1:"19.07",x2:"9.17",y2:"14.83"})]}),"获取当前位置"]})]})]}),o&&e.jsxs("div",{className:"current-info",children:[e.jsx("p",{children:"当前中心点:"}),e.jsx("p",{className:"center-name",children:o.name}),e.jsxs("p",{className:"center-coord",children:["(",o.lng.toFixed(4),", ",o.lat.toFixed(4),")"]})]}),e.jsxs("div",{className:"preset-locations",children:[e.jsx("h5",{children:"预设位置"}),e.jsx("div",{className:"preset-list",children:[{name:"南京市中心",lng:118.7969,lat:32.0603},{name:"新街口",lng:118.7874,lat:32.0423},{name:"鼓楼广场",lng:118.7784,lat:32.0663},{name:"夫子庙",lng:118.7894,lat:32.0233}].map(x=>e.jsx("button",{className:"preset-button",onClick:()=>{l(x.lng.toString()),i(x.lat.toString()),a(x.name),s(x.lng,x.lat)},children:x.name},x.name))})]})]})},Ne=({history:s})=>{const o=d.useRef(null),p=d.useRef(null),[l,t]=d.useState("score");return d.useEffect(()=>{if(!o.current)return;const i=ee(o.current);return p.current=i,()=>{i.dispose()}},[]),d.useEffect(()=>{var c;if(!p.current||s.length===0)return;let i;if(l==="score")i={title:{text:"社区综合评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:a=>{const n=a[0];return`${n.name}<br/>评分: ${n.value}`}},xAxis:{type:"category",data:s.map(a=>a.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"评分",min:0,max:100},series:[{type:"bar",data:s.map(a=>({value:a.score,itemStyle:{color:a.score>=80?"#52c41a":a.score>=60?"#1890ff":"#ff4d4f",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",fontSize:12}}]};else if(l==="area")i={title:{text:"15分钟步行范围面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:a=>{const n=a[0];return`${n.name}<br/>面积: ${n.value.toFixed(2)} km²`}},xAxis:{type:"category",data:s.map(a=>a.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"面积 (km²)"},series:[{type:"bar",data:s.map(a=>({value:a.area/1e6,itemStyle:{color:"#1890ff",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};else{const a=Object.keys(((c=s[0])==null?void 0:c.categories)||{}),n=["#1890ff","#52c41a","#faad14","#ff4d4f","#722ed1"];i={title:{text:"各类设施评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},legend:{bottom:0,data:s.map(g=>g.name)},radar:{indicator:a.map(g=>({name:g,max:100})),shape:"circle",splitNumber:5},series:[{type:"radar",data:s.map((g,h)=>({value:a.map(j=>g.categories[j]||0),name:g.name,lineStyle:{color:n[h%n.length]},areaStyle:{color:n[h%n.length],opacity:.1},itemStyle:{color:n[h%n.length]}}))}]}}p.current.setOption(i)},[s,l]),d.useEffect(()=>{const i=()=>{var c;(c=p.current)==null||c.resize()};return window.addEventListener("resize",i),()=>window.removeEventListener("resize",i)},[]),s.length<2?e.jsxs("div",{className:"community-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),"社区对比"]}),e.jsx("p",{className:"comparison-hint",children:"分析至少2个社区后可进行对比"})]}):e.jsxs("div",{className:"community-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),"社区对比"]}),e.jsxs("div",{className:"metric-selector",children:[e.jsx("button",{className:`metric-button ${l==="score"?"active":""}`,onClick:()=>t("score"),children:"综合评分"}),e.jsx("button",{className:`metric-button ${l==="area"?"active":""}`,onClick:()=>t("area"),children:"覆盖面积"}),e.jsx("button",{className:`metric-button ${l==="categories"?"active":""}`,onClick:()=>t("categories"),children:"各类设施"})]}),e.jsx("div",{ref:o,className:"comparison-chart"}),e.jsx("div",{className:"comparison-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"社区"}),e.jsx("th",{children:"评分"}),e.jsx("th",{children:"等级"}),e.jsx("th",{children:"面积"})]})}),e.jsx("tbody",{children:s.map((i,c)=>e.jsxs("tr",{children:[e.jsx("td",{children:i.name}),e.jsx("td",{className:"score-cell",children:i.score}),e.jsx("td",{children:e.jsx("span",{className:`level-badge level-${i.level}`,children:i.level})}),e.jsxs("td",{children:[(i.area/1e6).toFixed(2)," km²"]})]},c))})]})})]})},ke=({steps:s,visible:o})=>{if(!o)return null;const p=s.filter(i=>i.status==="completed").length,l=p/s.length*100,t=s.find(i=>i.status==="active");return e.jsxs("div",{className:"analysis-progress-inline",children:[e.jsxs("div",{className:"progress-info",children:[e.jsx("span",{className:"progress-step-name",children:t?t.label:"准备中..."}),(t==null?void 0:t.message)&&e.jsx("span",{className:"progress-message",children:t.message}),e.jsxs("span",{className:"progress-count",children:[p,"/",s.length]})]}),e.jsx("div",{className:"progress-bar-inline",children:e.jsx("div",{className:"progress-fill-inline",style:{width:`${l}%`}})})]})};function Ce(s,o){const{community_name:p,score:l,suggestions:t,blind_spots:i}=s,c=Object.entries(l.categories).map(([h,j])=>{const x=j,C=x>=80?"#52c41a":x>=60?"#1890ff":"#faad14";return`
        <div class="category-item">
          <span class="category-name">${h}</span>
          <div class="category-bar-container">
            <div class="category-bar" style="width: ${x}%; background-color: ${C}"></div>
          </div>
          <span class="category-score">${x}分</span>
        </div>
      `}).join(""),a=t.map(h=>`
      <div class="suggestion-item ${h.priority==="高"?"high-priority":""}">
        <span class="suggestion-priority">[${h.priority}]</span>
        <span class="suggestion-category">${h.category}</span>
        <span class="suggestion-message">${h.message}</span>
      </div>
    `).join(""),n=i.length>0?i.map(h=>`
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
  <title>${p} - 15分钟生活圈体检报告</title>
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
      <p>${p}</p>
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
      ${c}
    </div>

    

    <div class="section">
      <h2>💡 改善建议</h2>
      ${a}
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
  `}function Le(s,o){const p=Ce(s),l=window.open("","_blank");if(!l){alert("请允许弹出窗口以导出报告");return}l.document.write(p),l.document.close(),l.onload=()=>{l.print()}}const S={Home:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),e.jsx("polyline",{points:"9 22 9 12 15 12 15 22"})]}),Clock:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),MapPin:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),AlertTriangle:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),BarChart:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),Play:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})}),Map:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]}),History:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 4v6h6"}),e.jsx("path",{d:"M3.51 15a9 9 0 1 0 2.13-9.36L1 10"})]}),Refresh:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polyline",{points:"23 4 23 10 17 10"}),e.jsx("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),ArrowLeft:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"19",y1:"12",x2:"5",y2:"12"}),e.jsx("polyline",{points:"12 19 5 12 12 5"})]}),Download:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),e.jsx("polyline",{points:"7 10 12 15 17 10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),Activity:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"22 12 18 12 15 21 9 3 6 12 2 12"})}),Layers:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"12 2 2 7 12 12 22 7 12 2"}),e.jsx("polyline",{points:"2 17 12 22 22 17"}),e.jsx("polyline",{points:"2 12 12 17 22 12"})]})};function Se(){var z;const[s,o]=d.useState(null),[p,l]=d.useState(null),[t,i]=d.useState(null),[c,a]=d.useState(null),[n,g]=d.useState(15),[h,j]=d.useState(!1),[x,C]=d.useState(null),[M,D]=d.useState([]),[$,U]=d.useState(!1),[W,R]=d.useState("all"),[E,F]=d.useState([{id:"isochrone",label:"计算等时圈范围",status:"pending"},{id:"poi",label:"搜索周边设施",status:"pending"},{id:"blindspot",label:"识别服务盲区",status:"pending"},{id:"score",label:"计算综合评分",status:"pending"},{id:"report",label:"生成体检报告",status:"pending"}]),[I,T]=d.useState(!1);d.useEffect(()=>{A.length>0&&o(A[0])},[]);const Y=()=>{if(!(t!=null&&t.poi_coverage))return[];const r=[];return Object.entries(t.poi_coverage).forEach(([w,y])=>{(W==="all"||W===w)&&y.facilities&&y.facilities.forEach(k=>{r.push({name:k.name,category:w,address:k.address,distance:k.distance,location:k.location})})}),r.sort((w,y)=>(w.distance||1/0)-(y.distance||1/0))},G=r=>({医疗:"#ff4d4f",教育:"#1890ff",购物:"#52c41a",养老:"#722ed1",文体:"#fa8c16",餐饮:"#eb2f96",交通:"#13c2c2"})[r]||"#666",J=r=>({医疗:"医",教育:"教",购物:"购",养老:"养",文体:"文",餐饮:"餐",交通:"交"})[r]||"设",u=()=>p||s,m=(r,w,y)=>{F(k=>k.map(P=>P.id===r?{...P,status:w,message:y||P.message}:P))},f=r=>new Promise(w=>setTimeout(w,r)),v=async()=>{var w;const r=u();if(r){j(!0),C(null),T(!0),F(y=>y.map(k=>({...k,status:"pending",message:void 0})));try{m("isochrone","active","计算5/10/15分钟步行范围...");const y=await fetch(`${Q}/isochrone/multi-time`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:r.lng,lat:r.lat,directions:36})});let k=null;y.ok&&(k=await y.json(),a(k)),m("isochrone","completed","等时圈计算完成"),await f(300),m("poi","active","搜索周边设施..."),await f(500),m("blindspot","active","识别服务盲区..."),await f(300),m("score","active","计算综合评分...");const P=await fetch(`${Q}/analysis/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:r.lng,lat:r.lat,community_name:r.name})});if(!P.ok)throw new Error("分析请求失败");const B=await P.json(),V=B.poi_coverage?Object.values(B.poi_coverage).reduce((Z,oe)=>Z+oe.count,0):0;m("poi","completed",`找到${V}处设施`),m("blindspot","completed",`识别到${((w=B.blind_spots)==null?void 0:w.length)||0}个盲区`),await f(300),m("score","completed",`综合评分：${B.score.total}分`),await f(300),m("report","active","生成体检报告..."),i(B),await f(500),m("report","completed","报告生成完成"),D(Z=>[B,...Z.slice(0,4)]),await f(800)}catch(y){C(y instanceof Error?y.message:"分析过程中出现错误")}finally{j(!1),T(!1)}}},N=r=>{g(r)},b=(r,w)=>{l({lng:r,lat:w,name:"自定义位置"})},L=()=>{if(!c)return t==null?void 0:t.isochrone;const r=c.layers.find(w=>w.time===n);return r?{boundary_points:r.boundary_points,polygon:r.polygon}:t==null?void 0:t.isochrone},_=()=>{t&&Le(t)},O=M.slice(0,5).map(r=>({name:r.community_name,score:r.score.total,level:r.score.level,categories:r.score.categories,area:r.isochrone.area}));return e.jsxs("div",{className:"app-container",children:[e.jsx("header",{className:"app-header",children:e.jsxs("div",{className:"header-content",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("h1",{children:[e.jsx(S.Home,{}),"15分钟生活圈智能体检与规划助手"]}),e.jsx("p",{children:"基于百度地图的社区生活圈分析工具"})]}),e.jsx("div",{className:"header-right",children:e.jsxs("a",{href:"../",className:"back-button",children:[e.jsx(S.ArrowLeft,{}),"返回首页"]})})]})}),e.jsxs("main",{className:"app-main",children:[e.jsxs("div",{className:"controls-panel",children:[e.jsxs("div",{className:"control-group",children:[e.jsx("label",{children:"选择社区："}),e.jsx("select",{value:s?`${s.lng},${s.lat}`:"",onChange:r=>{const[w,y]=r.target.value.split(",").map(Number),k=A.find(P=>P.lng===w&&P.lat===y);o(k||null),l(null)},children:A.map((r,w)=>e.jsx("option",{value:`${r.lng},${r.lat}`,children:r.name},w))})]}),e.jsx("button",{className:"analyze-button",onClick:v,disabled:h||!s&&!p,children:h?e.jsxs(e.Fragment,{children:[e.jsx(S.Refresh,{}),"分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(S.Play,{}),"开始体检"]})}),e.jsx(ke,{steps:E,visible:I}),e.jsxs("button",{className:"analyze-button secondary",onClick:()=>U(!$),children:[e.jsx(S.MapPin,{}),$?"隐藏自定义位置":"自定义位置"]})]}),x&&e.jsxs("div",{className:"error-banner",children:[e.jsx(S.AlertTriangle,{}),e.jsx("span",{children:x}),e.jsxs("button",{onClick:v,children:[e.jsx(S.Refresh,{}),"重试"]})]}),t?e.jsxs("div",{className:"main-content analyzed",children:[e.jsx("div",{className:"map-panel",children:e.jsx(te,{center:u(),isochrone:L(),poiCoverage:t==null?void 0:t.poi_coverage,blindSpots:t==null?void 0:t.blind_spots,multiTimeData:c,loading:h})}),e.jsxs("div",{className:"right-panel",children:[e.jsxs("div",{className:"data-column",children:[e.jsxs("div",{className:"score-card",children:[e.jsxs("div",{className:"score-header",children:[e.jsx(S.Activity,{}),e.jsx("span",{children:"综合评分"})]}),e.jsx("div",{className:"score-value",children:t.score.total}),e.jsx("div",{className:"score-level",children:t.score.level})]}),c&&e.jsx("div",{className:"detail-card",children:e.jsx(ve,{data:{time5:c.layers.find(r=>r.time===300),time10:c.layers.find(r=>r.time===600),time15:c.layers.find(r=>r.time===900)},onTimeChange:N})}),e.jsxs("div",{className:"metrics-grid",children:[e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(S.Map,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[t.isochrone.area.toFixed(2)," km²"]}),e.jsx("div",{className:"metric-label",children:"覆盖面积"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(S.Layers,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:t.poi_coverage?Object.values(t.poi_coverage).reduce((r,w)=>r+w.count,0):0}),e.jsx("div",{className:"metric-label",children:"周边设施"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(S.AlertTriangle,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:((z=t.blind_spots)==null?void 0:z.length)||0}),e.jsx("div",{className:"metric-label",children:"服务盲区"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(S.Clock,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[n/60," 分钟"]}),e.jsx("div",{className:"metric-label",children:"步行时间"})]})]})]}),e.jsxs("button",{className:"analyze-button secondary export-btn",onClick:_,children:[e.jsx(S.Download,{}),"导出PDF报告"]}),e.jsx("div",{className:"detail-card",children:e.jsx(fe,{categories:t.score.categories})}),c&&e.jsx("div",{className:"detail-card",children:e.jsx(we,{data:{time5:c.layers.find(r=>r.time===300),time10:c.layers.find(r=>r.time===600),time15:c.layers.find(r=>r.time===900)}})})]}),e.jsxs("div",{className:"facility-list-container",children:[e.jsxs("div",{className:"facility-filters",children:[e.jsx("button",{className:`filter-btn ${W==="all"?"active":""}`,onClick:()=>R("all"),children:"全部"}),t.poi_coverage&&Object.keys(t.poi_coverage).map(r=>e.jsx("button",{className:`filter-btn ${W===r?"active":""}`,onClick:()=>R(r),children:r},r))]}),e.jsx("div",{className:"facility-scroll-list",children:Y().map((r,w)=>e.jsxs("div",{className:"facility-list-item",children:[e.jsx("div",{className:"facility-item-icon",style:{backgroundColor:G(r.category)},children:J(r.category)}),e.jsxs("div",{className:"facility-item-info",children:[e.jsx("div",{className:"facility-item-name",children:r.name}),e.jsxs("div",{className:"facility-item-detail",children:[r.category," · ",r.address||"暂无地址"]})]}),e.jsx("div",{className:"facility-item-distance",children:r.distance?`${r.distance}m`:""})]},w))})]})]})]}):e.jsxs("div",{className:"main-content",children:[e.jsxs("div",{className:"map-panel",children:[$&&e.jsx(be,{onCenterSelect:b,currentCenter:u()}),e.jsx(te,{center:u(),isochrone:L(),poiCoverage:void 0,blindSpots:void 0,multiTimeData:c,loading:h})]}),e.jsx("div",{className:"data-panel",children:e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:e.jsx(S.Map,{})}),e.jsx("h3",{children:"开始分析"}),e.jsx("p",{children:'选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告'}),e.jsxs("div",{className:"feature-list",children:[e.jsxs("div",{className:"feature-item",children:[e.jsx(S.Clock,{}),e.jsx("span",{children:"计算5/10/15分钟步行范围"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(S.MapPin,{}),e.jsx("span",{children:"分析周边设施覆盖"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(S.AlertTriangle,{}),e.jsx("span",{children:"识别服务盲区"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(S.BarChart,{}),e.jsx("span",{children:"生成体检报告"})]})]})]})})]}),t&&e.jsxs("div",{className:"report-section",children:[e.jsx("div",{className:"detail-card",children:e.jsx(ue,{communityName:t.community_name,score:t.score,suggestions:t.suggestions,blindSpots:t.blind_spots,poiCoverage:t.poi_coverage,isochrone:t.isochrone})}),t.poi_coverage&&u()&&e.jsx("div",{className:"detail-card",children:e.jsx(ye,{poiCoverage:t.poi_coverage,center:u()})})]}),M.length>1&&e.jsx("div",{className:"comparison-section",children:e.jsx(Ne,{history:O})}),M.length>1&&e.jsxs("div",{className:"history-section",children:[e.jsxs("h3",{children:[e.jsx(S.History,{}),"分析历史"]}),e.jsx("div",{className:"history-list",children:M.slice(1).map((r,w)=>e.jsxs("div",{className:"history-item",children:[e.jsx("span",{className:"history-name",children:r.community_name}),e.jsxs("span",{className:"history-score",children:[r.score.total,"分"]}),e.jsx("span",{className:"history-level",children:r.score.level})]},w))})]})]}),e.jsx("footer",{className:"app-footer",children:e.jsxs("div",{className:"footer-content",children:[e.jsx("p",{children:"15分钟生活圈智能体检与规划助手 © 2025"}),e.jsx("p",{className:"footer-tech",children:"技术栈：React + FastAPI + 百度地图API + NetworkX"})]})})]})}X.createRoot(document.getElementById("root")).render(e.jsx(le.StrictMode,{children:e.jsx(Se,{})}));
