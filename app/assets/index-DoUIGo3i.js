import{r as d,a as ie,R as oe}from"./react-vendor-nf7bT_Uh.js";import{i as K}from"./echarts-vendor-BBmD_jO2.js";(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))l(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&l(c)}).observe(document,{childList:!0,subtree:!0});function p(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function l(n){if(n.ep)return;n.ep=!0;const r=p(n);fetch(n.href,r)}})();var se={exports:{}},D={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ae=d,le=Symbol.for("react.element"),ce=Symbol.for("react.fragment"),de=Object.prototype.hasOwnProperty,he=ae.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,xe={key:!0,ref:!0,__self:!0,__source:!0};function te(s,i,p){var l,n={},r=null,c=null;p!==void 0&&(r=""+p),i.key!==void 0&&(r=""+i.key),i.ref!==void 0&&(c=i.ref);for(l in i)de.call(i,l)&&!xe.hasOwnProperty(l)&&(n[l]=i[l]);if(s&&s.defaultProps)for(l in i=s.defaultProps,i)n[l]===void 0&&(n[l]=i[l]);return{$$typeof:le,type:s,key:r,ref:c,props:n,_owner:he.current}}D.Fragment=ce;D.jsx=te;D.jsxs=te;se.exports=D;var e=se.exports,Z={},X=ie;Z.createRoot=X.createRoot,Z.hydrateRoot=X.hydrateRoot;const pe=({loading:s,message:i="加载中..."})=>s?e.jsx("div",{className:"loading-overlay",children:e.jsxs("div",{className:"loading-content",children:[e.jsxs("div",{className:"loading-spinner",children:[e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"})]}),e.jsx("p",{className:"loading-message",children:i}),e.jsx("p",{className:"loading-submessage",children:"正在调用百度地图API计算等时圈..."})]})}):null,q="http://100.77.182.51:8080/api",H=[{lng:118.7784,lat:32.0663,name:"鼓楼区湖南路街道"},{lng:118.7854,lat:32.0553,name:"鼓楼区中央门街道"},{lng:118.8034,lat:32.0683,name:"玄武区新街口街道"},{lng:118.7894,lat:32.0433,name:"秦淮区夫子庙街道"}],Q=({center:s,isochrone:i,poiCoverage:p,blindSpots:l,multiTimeData:n,loading:r=!1,onCenterChange:c})=>{const o=d.useRef(null),t=d.useRef(null),m=d.useRef([]),[h,g]=d.useState(!1),[x,C]=d.useState(null),[M,U]=d.useState(!0),[O,Y]=d.useState(!0),[R,I]=d.useState(!0),[E,T]=d.useState(!1),W=d.useCallback(()=>new Promise((f,j)=>{const w=()=>{const u=window.BMap;u&&u.Map?f():setTimeout(w,100)};w(),setTimeout(()=>j(new Error("百度地图API加载超时")),1e4)}),[]);d.useEffect(()=>{let f=!0;return(async()=>{try{if(await W(),!f||!o.current||t.current)return;const w=window.BMap,u=new w.Map(o.current),b=new w.Point(118.7969,32.0603);u.centerAndZoom(b,14),u.enableScrollWheelZoom(),u.addControl(new w.NavigationControl),u.addControl(new w.ScaleControl),u.addControl(new w.OverviewMapControl),u.addEventListener("click",y=>{E&&c&&c(y.point.lng,y.point.lat)}),t.current=u,f&&g(!0)}catch(w){console.error("地图初始化失败:",w),f&&C("地图加载失败，请刷新页面重试")}})(),()=>{f=!1}},[W,E,c]),d.useEffect(()=>{if(h&&t.current&&s){const f=window.BMap,j=new f.Point(s.lng,s.lat);t.current.panTo(j),t.current.setZoom(14)}},[s,h]),d.useEffect(()=>{if(h&&t.current){const f=t.current,j=window.BMap;if(f.clearOverlays(),n&&n.layers){const w={300:"#52c41a",600:"#faad14",900:"#1890ff"};n.layers.forEach(u=>{if(u.boundary_points&&u.boundary_points.length>0){const b=u.boundary_points.map(v=>new j.Point(v.lng,v.lat)),y=w[u.time]||"#667eea",a=new j.Polygon(b,{strokeColor:y,strokeWeight:3,strokeOpacity:.8,fillColor:y,fillOpacity:.08});f.addOverlay(a)}})}else if(i&&i.boundary_points&&i.boundary_points.length>0){const w=i.boundary_points.map(b=>new j.Point(b.lng,b.lat)),u=new j.Polygon(w,{strokeColor:"#667eea",strokeWeight:2,strokeOpacity:.8,fillColor:"#667eea",fillOpacity:.15});f.addOverlay(u)}if(s){const w=new j.Point(s.lng,s.lat),u=new j.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#667eea" stroke="white" stroke-width="3"/><circle cx="16" cy="16" r="6" fill="white"/></svg>'),new j.Size(32,32),{anchor:new j.Size(16,16)}),b=new j.Marker(w,{icon:u});f.addOverlay(b);const y=new j.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #333; margin-bottom: 4px;">'+s.name+'</div><div style="font-size: 12px; color: #666;">经度: '+s.lng.toFixed(4)+", 纬度: "+s.lat.toFixed(4)+"</div></div>",{width:220,height:60});b.addEventListener("click",()=>{f.openInfoWindow(y,w)})}if(O&&p&&Object.entries(p).forEach(([w,u])=>{if(u.facilities&&u.facilities.length>0){const y={医疗:"#ff4d4f",教育:"#1890ff",购物:"#52c41a",养老:"#722ed1",文体:"#fa8c16",餐饮:"#eb2f96"}[w]||"#666";u.facilities.forEach(a=>{if(a.location){const v=new j.Point(a.location.lng,a.location.lat),k=new j.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="'+y+'" stroke="white" stroke-width="2"/></svg>'),new j.Size(20,20),{anchor:new j.Size(10,10)}),S=new j.Marker(v,{icon:k});f.addOverlay(S);const N=new j.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #333;">'+a.name+'</div><div style="font-size: 12px; color: '+y+'; margin-top: 4px;">'+w+"</div>"+(a.address?'<div style="font-size: 11px; color: #999; margin-top: 2px;">'+a.address+"</div>":"")+(a.distance?'<div style="font-size: 11px; color: #666; margin-top: 2px;">距离: '+a.distance+"米</div>":"")+"</div>",{width:250,height:80});S.addEventListener("click",()=>{f.openInfoWindow(N,v)})}})}}),R&&l&&l.length>0&&l.forEach((w,u)=>{if(w.center){const b=new j.Point(w.center.lng,w.center.lat),y=new j.Icon("data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" fill="#ff4d4f" stroke="white" stroke-width="1.5"/><text x="12" y="18" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text></svg>'),new j.Size(24,24),{anchor:new j.Size(12,24)}),a=new j.Marker(b,{icon:y});f.addOverlay(a);const v=new j.InfoWindow('<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><div style="font-weight: 600; color: #ff4d4f;">服务盲区 #'+(u+1)+'</div><div style="font-size: 12px; color: #333; margin-top: 4px;">类别: '+(w.category||"未知")+'</div><div style="font-size: 11px; color: #666; margin-top: 2px;">'+(w.description||"该区域缺少相关设施覆盖")+"</div></div>",{width:250,height:80});a.addEventListener("click",()=>{f.openInfoWindow(v,b)})}}),O&&s&&p){const w=new j.Point(s.lng,s.lat);Object.entries(p).forEach(([u,b])=>{b.facilities&&b.facilities.length>0&&b.facilities.forEach(y=>{if(y.location){const a=new j.Point(y.location.lng,y.location.lat),v=new j.Polyline([w,a],{strokeColor:"#1890ff",strokeWeight:2,strokeStyle:"dashed",strokeOpacity:.6,enableClicking:!0});f.addOverlay(v),v.addEventListener("click",()=>{const k=(s.lng+y.location.lng)/2,S=(s.lat+y.location.lat)/2,N=new j.Point(k,S),P=y.distance||"未知",_=y.walkTime||"未知",B=new j.InfoWindow('<div style="padding: 10px; font-family: PingFang SC, Microsoft YaHei, sans-serif;"><h4 style="margin: 0 0 8px 0; color: #1890ff;">路线信息</h4><p style="margin: 4px 0;"><strong>目的地：</strong>'+y.name+'</p><p style="margin: 4px 0;"><strong>类别：</strong>'+u+'</p><p style="margin: 4px 0;"><strong>距离：</strong>'+P+'米</p><p style="margin: 4px 0;"><strong>步行时间：</strong>'+_+"分钟</p></div>",{width:220,height:120});f.openInfoWindow(B,N)})}})})}}},[h,i,s,p,l,n,O,R]),d.useEffect(()=>{if(!h||!s||!M){if(m.current.length>0){const u=t.current;u&&m.current.forEach(b=>{try{u.removeOverlay(b)}catch{}}),m.current=[]}return}const f=t.current;if(!f)return;const j=window.BMap;(async()=>{try{const u=[0,45,90,135,180,225,270,315],b=.015,y=u.map(async k=>{const S=k*Math.PI/180,N=s.lng+b*Math.sin(S),P=s.lat+b*Math.cos(S);try{const _=await fetch(`${q}/graph/route`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin_lng:s.lng,origin_lat:s.lat,dest_lng:N,dest_lat:P})});if(_.ok)return(await _.json()).features||[]}catch(_){console.error("获取路线失败:",_)}return[]});(await Promise.all(y)).flat().forEach(k=>{const S=k.geometry,N=k.properties;if(S.type==="LineString"){const P=S.coordinates.map(F=>new j.Point(F[0],F[1]));let _="#1890ff";N.traffic_status==="畅通"?_="#52c41a":N.traffic_status==="缓慢"?_="#faad14":N.traffic_status==="拥堵"&&(_="#ff4d4f");const B=new j.Polyline(P,{strokeColor:_,strokeWeight:3,strokeOpacity:.7,enableClicking:!0});f.addOverlay(B),m.current.push(B),B.addEventListener("click",()=>{const F=Math.floor(P.length/2),ne=P[F],re=new j.InfoWindow(`<div style="padding: 10px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">
                  <h4 style="margin: 0 0 8px 0; color: #1890ff;">路段信息</h4>
                  <p style="margin: 4px 0;"><strong>距离：</strong>${N.distance_text||"未知"}</p>
                  <p style="margin: 4px 0;"><strong>时间：</strong>${N.duration_text||"未知"}</p>
                  <p style="margin: 4px 0;"><strong>道路：</strong>${N.road_name||"未知"}</p>
                </div>`,{width:200,height:100});f.openInfoWindow(re,ne)})}})}catch(u){console.error("绘制路线失败:",u)}})()},[h,s,M]);const z=d.useCallback(()=>{T(f=>!f)},[]),$=d.useCallback(()=>{U(f=>!f)},[]),A=d.useCallback(()=>{Y(f=>!f)},[]),G=d.useCallback(()=>{I(f=>!f)},[]);return x?e.jsxs("div",{className:"map-error",children:[e.jsx("div",{className:"map-error-icon",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})}),e.jsx("p",{children:x}),e.jsx("button",{onClick:()=>window.location.reload(),children:"刷新页面"})]}):e.jsxs("div",{className:"map-wrapper",children:[e.jsxs("div",{className:"map-controls",children:[e.jsx("button",{className:`map-control-btn ${E?"active":""}`,onClick:z,title:E?"关闭点击选点":"开启点击选点",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]})}),e.jsx("button",{className:`map-control-btn ${M?"active":""}`,onClick:$,title:M?"隐藏路网":"显示路网",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]})}),e.jsx("button",{className:`map-control-btn ${O?"active":""}`,onClick:A,title:O?"隐藏设施":"显示设施",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),e.jsx("circle",{cx:"12",cy:"10",r:"3"})]})}),e.jsx("button",{className:`map-control-btn ${R?"active":""}`,onClick:G,title:R?"隐藏盲区":"显示盲区",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})})]}),e.jsx("div",{ref:o,className:"map-container"}),r&&e.jsx(pe,{loading:!0}),E&&e.jsxs("div",{className:"click-mode-hint",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"点击地图选择位置"]})]})},ee={医疗:({size:s=20})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M22 12h-4l-3 9L9 3l-3 9H2"})}),教育:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","stroke-linejoin":"round",children:[e.jsx("path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"}),e.jsx("path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"})]}),购物:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"9",cy:"21",r:"1"}),e.jsx("circle",{cx:"20",cy:"21",r:"1"}),e.jsx("path",{d:"M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"})]}),养老:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"12",cy:"7",r:"4"})]}),文体:({size:s=20})=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})}),餐饮:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 8h1a4 4 0 0 1 0 8h-1"}),e.jsx("path",{d:"M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"}),e.jsx("line",{x1:"6",y1:"1",x2:"6",y2:"4"}),e.jsx("line",{x1:"10",y1:"1",x2:"10",y2:"4"}),e.jsx("line",{x1:"14",y1:"1",x2:"14",y2:"4"})]}),综合:({size:s=20})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polygon",{points:"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"})]})},me={Warning:({size:s=24})=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]})},J=s=>({医疗:"#ef4444",教育:"#3b82f6",购物:"#22c55e",养老:"#8b5cf6",文体:"#06b6d4",餐饮:"#f59e0b",综合:"#6b7280"})[s]||"#6b7280",V=s=>({医疗:"#fef2f2",教育:"#eff6ff",购物:"#f0fdf4",养老:"#f5f3ff",文体:"#ecfeff",餐饮:"#fffbeb",综合:"#f9fafb"})[s]||"#f9fafb",ge=({communityName:s,score:i,suggestions:p,blindSpots:l,poiCoverage:n,isochrone:r})=>{var m,h;const c=g=>{switch(g){case"优秀":return"#52c41a";case"良好":return"#1890ff";case"一般":return"#faad14";case"需改善":return"#ff4d4f";default:return"#666"}},o=g=>{const x={高:"#ff4d4f",中:"#faad14",低:"#52c41a"};return e.jsx("span",{className:"priority-tag",style:{backgroundColor:x[g]||"#666"},children:g})},t=g=>!n||!n[g]?0:n[g].count||0;return e.jsxs("div",{className:"report-container",children:[e.jsxs("h2",{children:[s,"15分钟生活圈体检报告"]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"一、社区基础信息"}),e.jsx("div",{className:"report-table",children:e.jsx("table",{children:e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"社区名称"}),e.jsx("td",{children:s}),e.jsx("td",{className:"label",children:"所属街道"}),e.jsxs("td",{children:[s,"街道"]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"社区类型"}),e.jsx("td",{children:"混合型"}),e.jsx("td",{className:"label",children:"建成年代"}),e.jsx("td",{children:"约2000年"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"社区面积"}),e.jsxs("td",{children:[((m=r==null?void 0:r.area)==null?void 0:m.toFixed(2))||"0.00"," km²"]}),e.jsx("td",{className:"label",children:"常住人口"}),e.jsx("td",{children:"约5000人"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"中心点坐标"}),e.jsx("td",{colSpan:3,children:"经度, 纬度"})]})]})})})]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"二、体检方法与口径说明"}),e.jsxs("div",{className:"report-content",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"体检范围："}),"以社区中心点为起点，基于真实步行路网，计算15分钟步行可达范围，同时生成5分钟、10分钟、15分钟三层等时圈。"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"设施分类："}),"按民生需求分为七大类：医疗、教育、购物、养老、餐饮、交通、休闲。"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"数据来源："}),"百度地图开放平台（地理编码、POI检索、路径规划）。"]})]})]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"三、15分钟步行等时圈体检"}),e.jsx("div",{className:"report-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"指标"}),e.jsx("th",{children:"5分钟"}),e.jsx("th",{children:"10分钟"}),e.jsx("th",{children:"15分钟"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"覆盖面积"}),e.jsxs("td",{children:[r!=null&&r.area?(r.area*.2).toFixed(2):"0.00"," km²"]}),e.jsxs("td",{children:[r!=null&&r.area?(r.area*.5).toFixed(2):"0.00"," km²"]}),e.jsxs("td",{children:[((h=r==null?void 0:r.area)==null?void 0:h.toFixed(2))||"0.00"," km²"]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"最远可达距离"}),e.jsx("td",{children:"400m"}),e.jsx("td",{children:"800m"}),e.jsx("td",{children:"1200m"})]})]})]})})]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"四、民生设施覆盖体检"}),e.jsx("div",{className:"report-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"设施类别"}),e.jsx("th",{children:"圈内数量"}),e.jsx("th",{children:"达标情况"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"医疗设施"}),e.jsx("td",{children:t("医疗")}),e.jsx("td",{children:t("医疗")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"教育设施"}),e.jsx("td",{children:t("教育")}),e.jsx("td",{children:t("教育")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"购物设施"}),e.jsx("td",{children:t("购物")}),e.jsx("td",{children:t("购物")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"养老设施"}),e.jsx("td",{children:t("养老")}),e.jsx("td",{children:t("养老")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"餐饮设施"}),e.jsx("td",{children:t("餐饮")}),e.jsx("td",{children:t("餐饮")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"交通设施"}),e.jsx("td",{children:t("交通")}),e.jsx("td",{children:t("交通")>0?"达标":"不达标"})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"label",children:"休闲设施"}),e.jsx("td",{children:t("文体")}),e.jsx("td",{children:t("文体")>0?"达标":"不达标"})]})]})]})})]}),l.length>0&&e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"五、服务盲区体检"}),e.jsx("div",{className:"blind-spots-list",children:l.map((g,x)=>e.jsxs("div",{className:"blind-spot-item",children:[e.jsx("span",{className:"blind-spot-icon",children:e.jsx(me.Warning,{size:18})}),e.jsxs("div",{className:"blind-spot-info",children:[e.jsx("span",{className:"blind-spot-category",children:g.category}),e.jsx("span",{className:"blind-spot-desc",children:g.description})]})]},x))})]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"六、社区生活圈综合评分"}),e.jsxs("div",{className:"score-section",children:[e.jsxs("div",{className:"score-circle",style:{borderColor:c(i.level)},children:[e.jsx("span",{className:"score-number",children:i.total}),e.jsx("span",{className:"score-level",children:i.level})]}),e.jsxs("div",{className:"score-detail",children:[e.jsx("p",{children:"综合评分"}),i.blind_spot_penalty>0&&e.jsxs("p",{className:"penalty-note",children:["盲区扣分: -",i.blind_spot_penalty,"分"]})]})]}),e.jsxs("div",{className:"category-scores",children:[e.jsx("h4",{children:"分项评分"}),e.jsx("div",{className:"category-grid",children:Object.entries(i.categories).map(([g,x])=>e.jsxs("div",{className:"category-item",children:[e.jsx("span",{className:"category-name",children:g}),e.jsx("div",{className:"category-bar",children:e.jsx("div",{className:"category-fill",style:{width:`${x}%`,backgroundColor:x>=80?"#52c41a":x>=60?"#1890ff":"#ff4d4f"}})}),e.jsx("span",{className:"category-score",children:x})]},g))})]})]}),p.length>0&&e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"七、问题诊断与规划建议"}),e.jsxs("div",{className:"suggestions-section",children:[e.jsx("h4",{children:"问题清单"}),e.jsx("ul",{className:"suggestions-list",children:p.map((g,x)=>e.jsxs("li",{className:"suggestion-item",children:[o(g.priority),e.jsxs("span",{className:"suggestion-category",children:["[",g.category,"]"]}),e.jsx("span",{className:"suggestion-message",children:g.message})]},x))})]})]}),e.jsxs("div",{className:"report-chapter",children:[e.jsx("h3",{children:"八、报告结论"}),e.jsx("div",{className:"report-content conclusion",children:e.jsxs("p",{children:[s,"15分钟生活圈整体得分为",i.total,"分，处于",i.level,"水平。 共识别服务盲区",l.length,"处，主要涉及",l.map(g=>g.category).join("、"),"等设施。 建议优先补建缺失设施，优化服务覆盖。"]})})]})]})},je=({categories:s})=>{const i=d.useRef(null),p=d.useRef(null);return d.useEffect(()=>{if(!i.current)return;const l=K(i.current);return p.current=l,()=>{l.dispose()}},[]),d.useEffect(()=>{if(!p.current)return;const l=Object.keys(s),n=Object.values(s),r={title:{text:"设施覆盖雷达图",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},radar:{indicator:l.map(c=>({name:c,max:100})),shape:"circle",splitNumber:5,axisName:{color:"#333",fontSize:12},splitLine:{lineStyle:{color:"#ddd"}},splitArea:{show:!0,areaStyle:{color:["rgba(24, 144, 255, 0.1)","rgba(24, 144, 255, 0.2)"]}}},series:[{type:"radar",data:[{value:n,name:"设施覆盖评分",areaStyle:{color:"rgba(24, 144, 255, 0.3)"},lineStyle:{color:"#1890ff",width:2},itemStyle:{color:"#1890ff"}}]}]};p.current.setOption(r)},[s]),d.useEffect(()=>{const l=()=>{var n;(n=p.current)==null||n.resize()};return window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[]),e.jsx("div",{className:"radar-chart-container",children:e.jsx("div",{ref:i,className:"radar-chart"})})},ue=({data:s,onTimeChange:i})=>{const[p,l]=d.useState(15),n=[{value:5,label:"5分钟",color:"#52c41a"},{value:10,label:"10分钟",color:"#faad14"},{value:15,label:"15分钟",color:"#1890ff"}],r=t=>{l(t),i(t)},o=n.map(t=>{var h,g,x;let m=0;return t.value===5?m=((h=s.time5)==null?void 0:h.area)||0:t.value===10?m=((g=s.time10)==null?void 0:g.area)||0:t.value===15&&(m=((x=s.time15)==null?void 0:x.area)||0),{...t,area:m,areaText:m>0?`${(m/1e6).toFixed(2)} km²`:"计算中"}});return e.jsxs("div",{className:"time-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),"时间维度对比"]}),e.jsx("div",{className:"time-selector",children:n.map(t=>e.jsxs("button",{className:`time-button ${p===t.value?"active":""}`,onClick:()=>r(t.value),children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",style:{width:20,height:20,color:t.color},children:e.jsx("path",{d:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"})}),e.jsx("span",{className:"time-label",children:t.label})]},t.value))}),e.jsx("div",{className:"area-stats",children:o.map(t=>e.jsxs("div",{className:`area-item ${p===t.value?"active":""}`,children:[e.jsx("div",{className:"area-color",style:{backgroundColor:t.color}}),e.jsxs("div",{className:"area-info",children:[e.jsx("span",{className:"area-time",children:t.label}),e.jsx("span",{className:"area-value",children:t.areaText})]})]},t.value))}),e.jsx("div",{className:"area-chart",children:e.jsx("div",{className:"chart-bars",children:o.map(t=>{const m=Math.max(...o.map(g=>g.area||1)),h=t.area>0?t.area/m*100:0;return e.jsxs("div",{className:"chart-bar-container",children:[e.jsx("div",{className:"chart-bar-label",children:t.label}),e.jsx("div",{className:"chart-bar-track",children:e.jsx("div",{className:"chart-bar-fill",style:{width:`${h}%`,backgroundColor:t.color}})}),e.jsx("div",{className:"chart-bar-value",children:t.areaText})]},t.value)})})})]})},fe=({data:s})=>{const i=d.useRef(null),p=d.useRef(null);d.useEffect(()=>{if(!i.current)return;const r=K(i.current);return p.current=r,()=>{r.dispose()}},[]),d.useEffect(()=>{var m,h,g;if(!p.current)return;const r=["5分钟","10分钟","15分钟"],c=[(m=s.time5)!=null&&m.area?s.time5.area/1e6:0,(h=s.time10)!=null&&h.area?s.time10.area/1e6:0,(g=s.time15)!=null&&g.area?s.time15.area/1e6:0],o=["#52c41a","#faad14","#1890ff"],t={title:{text:"等时圈面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:x=>{const C=x[0];return`${C.name}<br/>面积: ${C.value.toFixed(2)} km²`}},xAxis:{type:"category",data:r,axisLabel:{fontSize:12}},yAxis:{type:"value",name:"面积 (km²)",axisLabel:{fontSize:12}},series:[{type:"bar",data:c.map((x,C)=>({value:x,itemStyle:{color:o[C],borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};p.current.setOption(t)},[s]),d.useEffect(()=>{const r=()=>{var c;(c=p.current)==null||c.resize()};return window.addEventListener("resize",r),()=>window.removeEventListener("resize",r)},[]);const n=(()=>{var c,o;return!((c=s.time5)!=null&&c.area)||!((o=s.time15)!=null&&o.area)?null:((s.time15.area-s.time5.area)/s.time5.area*100).toFixed(1)})();return e.jsxs("div",{className:"area-comparison-container",children:[e.jsx("div",{ref:i,className:"area-chart"}),n&&e.jsxs("div",{className:"growth-info",children:[e.jsx("span",{className:"growth-label",children:"15分钟比5分钟面积增长:"}),e.jsxs("span",{className:"growth-value",children:["+",n,"%"]})]})]})},ve=({poiCoverage:s})=>{const i=o=>Math.round(o/1.2/60),l=(()=>{const o=[];return Object.entries(s).forEach(([t,m])=>{m.facilities.forEach(h=>{o.push({...h,category:t})})}),o.sort((t,m)=>(t.distance||0)-(m.distance||0))})(),r=(()=>{const o={};return Object.keys(s).forEach(t=>{const m=l.filter(h=>h.category===t);o[t]=m.length>0?m[0]:null}),o})(),c=(o,t=20)=>{const m=ee[o]||ee.综合;return e.jsx(m,{size:t})};return e.jsxs("div",{className:"facility-accessibility",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"设施可达性分析"]}),e.jsxs("div",{className:"nearest-facilities",children:[e.jsx("h5",{children:"各类最近设施"}),e.jsx("div",{className:"nearest-grid",children:Object.entries(r).map(([o,t])=>{const m=J(o),h=V(o);return e.jsxs("div",{className:"nearest-item",children:[e.jsx("span",{className:"nearest-icon",style:{backgroundColor:h,color:m},children:c(o)}),e.jsxs("div",{className:"nearest-info",children:[e.jsx("span",{className:"nearest-category",children:o}),t?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"nearest-name",children:t.name}),e.jsxs("span",{className:"nearest-distance",children:[t.distance?`${t.distance}米`:"未知",t.distance&&` (${i(t.distance)}分钟)`]})]}):e.jsx("span",{className:"nearest-none",children:"暂无数据"})]})]},o)})})]}),l.length>0&&e.jsxs("div",{className:"facility-list",children:[e.jsx("h5",{children:"周边设施列表 (前10个)"}),e.jsx("div",{className:"facility-items",children:l.slice(0,10).map((o,t)=>{const m=J(o.category),h=V(o.category);return e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-icon",style:{backgroundColor:h,color:m},children:c(o.category)}),e.jsxs("div",{className:"facility-info",children:[e.jsx("span",{className:"facility-name",children:o.name}),e.jsx("span",{className:"facility-address",children:o.address||"暂无地址"})]}),e.jsx("div",{className:"facility-distance",children:o.distance&&e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"distance-value",children:[o.distance,"米"]}),e.jsxs("span",{className:"distance-time",children:["步行",i(o.distance),"分钟"]})]})})]},t)})})]}),e.jsxs("div",{className:"accessibility-score",children:[e.jsx("h5",{children:"可达性评分"}),e.jsx("div",{className:"score-items",children:Object.entries(s).map(([o,t])=>{const m=J(o),h=V(o),g=t.count>=5?100:t.count>=3?80:t.count>=1?60:30;return e.jsxs("div",{className:"score-item",children:[e.jsx("span",{className:"score-icon",style:{backgroundColor:h,color:m},children:c(o)}),e.jsx("span",{className:"score-category",children:o}),e.jsx("div",{className:"score-bar",children:e.jsx("div",{className:"score-fill",style:{width:`${g}%`,backgroundColor:g>=80?"#22c55e":g>=60?"#3b82f6":"#ef4444"}})}),e.jsx("span",{className:"score-value",children:g})]},o)})})]})]})},we=({onCenterSelect:s,currentCenter:i})=>{var h,g;const[p,l]=d.useState(((h=i==null?void 0:i.lng)==null?void 0:h.toString())||"118.7784"),[n,r]=d.useState(((g=i==null?void 0:i.lat)==null?void 0:g.toString())||"32.0663"),[c,o]=d.useState((i==null?void 0:i.name)||"自定义位置"),t=x=>{x.preventDefault();const C=parseFloat(p),M=parseFloat(n);if(isNaN(C)||isNaN(M)){alert("请输入有效的经纬度");return}if(C<73||C>135||M<3||M>53){alert("经纬度超出中国范围");return}s(C,M)},m=()=>{navigator.geolocation?navigator.geolocation.getCurrentPosition(x=>{const{longitude:C,latitude:M}=x.coords;l(C.toFixed(6)),r(M.toFixed(6)),o("当前位置"),s(C,M)},x=>{alert("无法获取当前位置，请手动输入"),console.error("获取位置失败:",x)}):alert("浏览器不支持地理定位")};return e.jsxs("div",{className:"custom-center",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),"自定义中心点"]}),e.jsxs("form",{onSubmit:t,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"经度:"}),e.jsx("input",{type:"number",step:"0.000001",value:p,onChange:x=>l(x.target.value),placeholder:"118.7784"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"纬度:"}),e.jsx("input",{type:"number",step:"0.000001",value:n,onChange:x=>r(x.target.value),placeholder:"32.0663"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"名称:"}),e.jsx("input",{type:"text",value:c,onChange:x=>o(x.target.value),placeholder:"自定义位置"})]}),e.jsxs("div",{className:"button-group",children:[e.jsx("button",{type:"submit",className:"apply-button",children:"应用"}),e.jsxs("button",{type:"button",className:"location-button",onClick:m,children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("circle",{cx:"12",cy:"12",r:"4"}),e.jsx("line",{x1:"4.93",y1:"4.93",x2:"9.17",y2:"9.17"}),e.jsx("line",{x1:"14.83",y1:"14.83",x2:"19.07",y2:"19.07"}),e.jsx("line",{x1:"14.83",y1:"9.17",x2:"19.07",y2:"4.93"}),e.jsx("line",{x1:"4.93",y1:"19.07",x2:"9.17",y2:"14.83"})]}),"获取当前位置"]})]})]}),i&&e.jsxs("div",{className:"current-info",children:[e.jsx("p",{children:"当前中心点:"}),e.jsx("p",{className:"center-name",children:i.name}),e.jsxs("p",{className:"center-coord",children:["(",i.lng.toFixed(4),", ",i.lat.toFixed(4),")"]})]}),e.jsxs("div",{className:"preset-locations",children:[e.jsx("h5",{children:"预设位置"}),e.jsx("div",{className:"preset-list",children:[{name:"南京市中心",lng:118.7969,lat:32.0603},{name:"新街口",lng:118.7874,lat:32.0423},{name:"鼓楼广场",lng:118.7784,lat:32.0663},{name:"夫子庙",lng:118.7894,lat:32.0233}].map(x=>e.jsx("button",{className:"preset-button",onClick:()=>{l(x.lng.toString()),r(x.lat.toString()),o(x.name),s(x.lng,x.lat)},children:x.name},x.name))})]})]})},ye=({history:s})=>{const i=d.useRef(null),p=d.useRef(null),[l,n]=d.useState("score");return d.useEffect(()=>{if(!i.current)return;const r=K(i.current);return p.current=r,()=>{r.dispose()}},[]),d.useEffect(()=>{var c;if(!p.current||s.length===0)return;let r;if(l==="score")r={title:{text:"社区综合评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:o=>{const t=o[0];return`${t.name}<br/>评分: ${t.value}`}},xAxis:{type:"category",data:s.map(o=>o.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"评分",min:0,max:100},series:[{type:"bar",data:s.map(o=>({value:o.score,itemStyle:{color:o.score>=80?"#52c41a":o.score>=60?"#1890ff":"#ff4d4f",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",fontSize:12}}]};else if(l==="area")r={title:{text:"15分钟步行范围面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:o=>{const t=o[0];return`${t.name}<br/>面积: ${t.value.toFixed(2)} km²`}},xAxis:{type:"category",data:s.map(o=>o.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"面积 (km²)"},series:[{type:"bar",data:s.map(o=>({value:o.area/1e6,itemStyle:{color:"#1890ff",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};else{const o=Object.keys(((c=s[0])==null?void 0:c.categories)||{}),t=["#1890ff","#52c41a","#faad14","#ff4d4f","#722ed1"];r={title:{text:"各类设施评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},legend:{bottom:0,data:s.map(m=>m.name)},radar:{indicator:o.map(m=>({name:m,max:100})),shape:"circle",splitNumber:5},series:[{type:"radar",data:s.map((m,h)=>({value:o.map(g=>m.categories[g]||0),name:m.name,lineStyle:{color:t[h%t.length]},areaStyle:{color:t[h%t.length],opacity:.1},itemStyle:{color:t[h%t.length]}}))}]}}p.current.setOption(r)},[s,l]),d.useEffect(()=>{const r=()=>{var c;(c=p.current)==null||c.resize()};return window.addEventListener("resize",r),()=>window.removeEventListener("resize",r)},[]),s.length<2?e.jsxs("div",{className:"community-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),"社区对比"]}),e.jsx("p",{className:"comparison-hint",children:"分析至少2个社区后可进行对比"})]}):e.jsxs("div",{className:"community-comparison",children:[e.jsxs("h4",{children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),"社区对比"]}),e.jsxs("div",{className:"metric-selector",children:[e.jsx("button",{className:`metric-button ${l==="score"?"active":""}`,onClick:()=>n("score"),children:"综合评分"}),e.jsx("button",{className:`metric-button ${l==="area"?"active":""}`,onClick:()=>n("area"),children:"覆盖面积"}),e.jsx("button",{className:`metric-button ${l==="categories"?"active":""}`,onClick:()=>n("categories"),children:"各类设施"})]}),e.jsx("div",{ref:i,className:"comparison-chart"}),e.jsx("div",{className:"comparison-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"社区"}),e.jsx("th",{children:"评分"}),e.jsx("th",{children:"等级"}),e.jsx("th",{children:"面积"})]})}),e.jsx("tbody",{children:s.map((r,c)=>e.jsxs("tr",{children:[e.jsx("td",{children:r.name}),e.jsx("td",{className:"score-cell",children:r.score}),e.jsx("td",{children:e.jsx("span",{className:`level-badge level-${r.level}`,children:r.level})}),e.jsxs("td",{children:[(r.area/1e6).toFixed(2)," km²"]})]},c))})]})})]})},be=({steps:s,visible:i})=>{if(!i)return null;const p=s.filter(r=>r.status==="completed").length,l=p/s.length*100,n=s.find(r=>r.status==="active");return e.jsxs("div",{className:"analysis-progress-inline",children:[e.jsxs("div",{className:"progress-info",children:[e.jsx("span",{className:"progress-step-name",children:n?n.label:"准备中..."}),(n==null?void 0:n.message)&&e.jsx("span",{className:"progress-message",children:n.message}),e.jsxs("span",{className:"progress-count",children:[p,"/",s.length]})]}),e.jsx("div",{className:"progress-bar-inline",children:e.jsx("div",{className:"progress-fill-inline",style:{width:`${l}%`}})})]})};function Ne(s,i){const{community_name:p,score:l,suggestions:n,blind_spots:r}=s,c=Object.entries(l.categories).map(([h,g])=>{const x=g,C=x>=80?"#52c41a":x>=60?"#1890ff":"#faad14";return`
        <div class="category-item">
          <span class="category-name">${h}</span>
          <div class="category-bar-container">
            <div class="category-bar" style="width: ${x}%; background-color: ${C}"></div>
          </div>
          <span class="category-score">${x}分</span>
        </div>
      `}).join(""),o=n.map(h=>`
      <div class="suggestion-item ${h.priority==="高"?"high-priority":""}">
        <span class="suggestion-priority">[${h.priority}]</span>
        <span class="suggestion-category">${h.category}</span>
        <span class="suggestion-message">${h.message}</span>
      </div>
    `).join(""),t=r.length>0?r.map(h=>`
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
      ${o}
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
  `}function ke(s,i){const p=Ne(s),l=window.open("","_blank");if(!l){alert("请允许弹出窗口以导出报告");return}l.document.write(p),l.document.close(),l.onload=()=>{l.print()}}const L={Home:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),e.jsx("polyline",{points:"9 22 9 12 15 12 15 22"})]}),Clock:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),MapPin:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),AlertTriangle:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),BarChart:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),Play:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})}),Map:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]}),History:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 4v6h6"}),e.jsx("path",{d:"M3.51 15a9 9 0 1 0 2.13-9.36L1 10"})]}),Refresh:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polyline",{points:"23 4 23 10 17 10"}),e.jsx("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),ArrowLeft:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"19",y1:"12",x2:"5",y2:"12"}),e.jsx("polyline",{points:"12 19 5 12 12 5"})]}),Download:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),e.jsx("polyline",{points:"7 10 12 15 17 10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),Activity:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"22 12 18 12 15 21 9 3 6 12 2 12"})}),Layers:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"12 2 2 7 12 12 22 7 12 2"}),e.jsx("polyline",{points:"2 17 12 22 22 17"}),e.jsx("polyline",{points:"2 12 12 17 22 12"})]})};function Le(){var b,y;const[s,i]=d.useState(null),[p,l]=d.useState(null),[n,r]=d.useState(null),[c,o]=d.useState(null),[t,m]=d.useState(15),[h,g]=d.useState(!1),[x,C]=d.useState(null),[M,U]=d.useState([]),[O,Y]=d.useState(!1),[R,I]=d.useState([{id:"isochrone",label:"计算等时圈范围",status:"pending"},{id:"poi",label:"搜索周边设施",status:"pending"},{id:"blindspot",label:"识别服务盲区",status:"pending"},{id:"score",label:"计算综合评分",status:"pending"},{id:"report",label:"生成体检报告",status:"pending"}]),[E,T]=d.useState(!1);d.useEffect(()=>{H.length>0&&i(H[0])},[]);const W=()=>p||s,z=(a,v,k)=>{I(S=>S.map(N=>N.id===a?{...N,status:v,message:k||N.message}:N))},$=a=>new Promise(v=>setTimeout(v,a)),A=async()=>{var v;const a=W();if(a){g(!0),C(null),T(!0),I(k=>k.map(S=>({...S,status:"pending",message:void 0})));try{z("isochrone","active","计算5/10/15分钟步行范围...");const k=await fetch(`${q}/isochrone/multi-time`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:a.lng,lat:a.lat,directions:36})});let S=null;k.ok&&(S=await k.json(),o(S)),z("isochrone","completed","等时圈计算完成"),await $(300),z("poi","active","搜索周边设施..."),await $(500),z("blindspot","active","识别服务盲区..."),await $(300),z("score","active","计算综合评分...");const N=await fetch(`${q}/analysis/report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:a.lng,lat:a.lat,community_name:a.name})});if(!N.ok)throw new Error("分析请求失败");const P=await N.json(),_=P.poi_coverage?Object.values(P.poi_coverage).reduce((B,F)=>B+F.count,0):0;z("poi","completed",`找到${_}处设施`),z("blindspot","completed",`识别到${((v=P.blind_spots)==null?void 0:v.length)||0}个盲区`),await $(300),z("score","completed",`综合评分：${P.score.total}分`),await $(300),z("report","active","生成体检报告..."),r(P),await $(500),z("report","completed","报告生成完成"),U(B=>[P,...B.slice(0,4)]),await $(800)}catch(k){C(k instanceof Error?k.message:"分析过程中出现错误")}finally{g(!1),T(!1)}}},G=a=>{m(a)},f=(a,v)=>{l({lng:a,lat:v,name:"自定义位置"})},j=()=>{if(!c)return n==null?void 0:n.isochrone;const a=c.layers.find(v=>v.time===t);return a?{boundary_points:a.boundary_points,polygon:a.polygon}:n==null?void 0:n.isochrone},w=()=>{n&&ke(n)},u=M.slice(0,5).map(a=>({name:a.community_name,score:a.score.total,level:a.score.level,categories:a.score.categories,area:a.isochrone.area}));return e.jsxs("div",{className:"app-container",children:[e.jsx("header",{className:"app-header",children:e.jsxs("div",{className:"header-content",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("h1",{children:[e.jsx(L.Home,{}),"15分钟生活圈智能体检与规划助手"]}),e.jsx("p",{children:"基于百度地图的社区生活圈分析工具"})]}),e.jsx("div",{className:"header-right",children:e.jsxs("a",{href:"../",className:"back-button",children:[e.jsx(L.ArrowLeft,{}),"返回首页"]})})]})}),e.jsxs("main",{className:"app-main",children:[e.jsxs("div",{className:"controls-panel",children:[e.jsxs("div",{className:"control-group",children:[e.jsx("label",{children:"选择社区："}),e.jsx("select",{value:s?`${s.lng},${s.lat}`:"",onChange:a=>{const[v,k]=a.target.value.split(",").map(Number),S=H.find(N=>N.lng===v&&N.lat===k);i(S||null),l(null)},children:H.map((a,v)=>e.jsx("option",{value:`${a.lng},${a.lat}`,children:a.name},v))})]}),e.jsx("button",{className:"analyze-button",onClick:A,disabled:h||!s&&!p,children:h?e.jsxs(e.Fragment,{children:[e.jsx(L.Refresh,{}),"分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(L.Play,{}),"开始体检"]})}),e.jsx(be,{steps:R,visible:E}),e.jsxs("button",{className:"analyze-button secondary",onClick:()=>Y(!O),children:[e.jsx(L.MapPin,{}),O?"隐藏自定义位置":"自定义位置"]})]}),x&&e.jsxs("div",{className:"error-banner",children:[e.jsx(L.AlertTriangle,{}),e.jsx("span",{children:x}),e.jsxs("button",{onClick:A,children:[e.jsx(L.Refresh,{}),"重试"]})]}),n?e.jsxs("div",{className:"main-content analyzed",children:[e.jsx("div",{className:"map-panel",children:e.jsx(Q,{center:W(),isochrone:j(),poiCoverage:n==null?void 0:n.poi_coverage,blindSpots:n==null?void 0:n.blind_spots,multiTimeData:c,loading:h})}),e.jsxs("div",{className:"data-panel",children:[e.jsxs("div",{className:"score-card",children:[e.jsxs("div",{className:"score-header",children:[e.jsx(L.Activity,{}),e.jsx("span",{children:"综合评分"})]}),e.jsx("div",{className:"score-value",children:n.score.total}),e.jsx("div",{className:"score-level",children:n.score.level})]}),c&&e.jsx("div",{className:"detail-card",children:e.jsx(ue,{data:{time5:c.layers.find(a=>a.time===300),time10:c.layers.find(a=>a.time===600),time15:c.layers.find(a=>a.time===900)},onTimeChange:G})}),e.jsxs("div",{className:"metrics-grid",children:[e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(L.Map,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[n.isochrone.area.toFixed(2)," km²"]}),e.jsx("div",{className:"metric-label",children:"覆盖面积"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(L.Layers,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:n.poi_coverage?Object.values(n.poi_coverage).reduce((a,v)=>a+v.count,0):0}),e.jsx("div",{className:"metric-label",children:"周边设施"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(L.AlertTriangle,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:((b=n.blind_spots)==null?void 0:b.length)||0}),e.jsx("div",{className:"metric-label",children:"服务盲区"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(L.Clock,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[t/60," 分钟"]}),e.jsx("div",{className:"metric-label",children:"步行时间"})]})]})]}),e.jsxs("button",{className:"analyze-button secondary export-btn",onClick:w,children:[e.jsx(L.Download,{}),"导出PDF报告"]}),((y=n.poi_coverage)==null?void 0:y.categories)&&e.jsxs("div",{className:"facility-summary",children:[e.jsxs("h3",{children:[e.jsx(L.BarChart,{}),"设施分布"]}),e.jsx("div",{className:"facility-list",children:Object.entries(n.poi_coverage.categories).map(([a,v])=>e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-name",children:a}),e.jsx("span",{className:"facility-count",children:v})]},a))})]}),e.jsx("div",{className:"detail-card",children:e.jsx(je,{categories:n.score.categories})}),c&&e.jsx("div",{className:"detail-card",children:e.jsx(fe,{data:{time5:c.layers.find(a=>a.time===300),time10:c.layers.find(a=>a.time===600),time15:c.layers.find(a=>a.time===900)}})})]})]}):e.jsxs("div",{className:"main-content",children:[e.jsxs("div",{className:"map-panel",children:[O&&e.jsx(we,{onCenterSelect:f,currentCenter:W()}),e.jsx(Q,{center:W(),isochrone:j(),poiCoverage:void 0,blindSpots:void 0,multiTimeData:c,loading:h})]}),e.jsx("div",{className:"data-panel",children:e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:e.jsx(L.Map,{})}),e.jsx("h3",{children:"开始分析"}),e.jsx("p",{children:'选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告'}),e.jsxs("div",{className:"feature-list",children:[e.jsxs("div",{className:"feature-item",children:[e.jsx(L.Clock,{}),e.jsx("span",{children:"计算5/10/15分钟步行范围"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(L.MapPin,{}),e.jsx("span",{children:"分析周边设施覆盖"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(L.AlertTriangle,{}),e.jsx("span",{children:"识别服务盲区"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(L.BarChart,{}),e.jsx("span",{children:"生成体检报告"})]})]})]})})]}),n&&e.jsxs("div",{className:"report-section",children:[e.jsx("div",{className:"detail-card",children:e.jsx(ge,{communityName:n.community_name,score:n.score,suggestions:n.suggestions,blindSpots:n.blind_spots,poiCoverage:n.poi_coverage,isochrone:n.isochrone})}),n.poi_coverage&&W()&&e.jsx("div",{className:"detail-card",children:e.jsx(ve,{poiCoverage:n.poi_coverage,center:W()})})]}),M.length>1&&e.jsx("div",{className:"comparison-section",children:e.jsx(ye,{history:u})}),M.length>1&&e.jsxs("div",{className:"history-section",children:[e.jsxs("h3",{children:[e.jsx(L.History,{}),"分析历史"]}),e.jsx("div",{className:"history-list",children:M.slice(1).map((a,v)=>e.jsxs("div",{className:"history-item",children:[e.jsx("span",{className:"history-name",children:a.community_name}),e.jsxs("span",{className:"history-score",children:[a.score.total,"分"]}),e.jsx("span",{className:"history-level",children:a.score.level})]},v))})]})]}),e.jsx("footer",{className:"app-footer",children:e.jsxs("div",{className:"footer-content",children:[e.jsx("p",{children:"15分钟生活圈智能体检与规划助手 © 2025"}),e.jsx("p",{className:"footer-tech",children:"技术栈：React + FastAPI + 百度地图API + NetworkX"})]})})]})}Z.createRoot(document.getElementById("root")).render(e.jsx(oe.StrictMode,{children:e.jsx(Le,{})}));
